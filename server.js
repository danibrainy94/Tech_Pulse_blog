require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Email configuration
let transporter;
try {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass && emailUser !== 'your-email@gmail.com' && emailPass !== 'your-app-password') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      // Add connection timeout and retry settings
      pool: true,
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 1000,
      rateLimit: 5
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        console.log('📧 Email will fallback to console logging');
        transporter = null;
      } else {
        console.log('✅ Email transporter verified successfully');
      }
    });
  } else {
    console.log('⚠️  Email credentials not configured - using console logging fallback');
    transporter = null;
  }
} catch (error) {
  console.error('❌ Error setting up email transporter:', error.message);
  transporter = null;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'techpulse-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Database setup
const dbPath = path.join(__dirname, 'blog.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
function initDatabase() {
  db.serialize(() => {
    // Create posts table
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT,
      author TEXT NOT NULL,
      author_initials TEXT,
      date TEXT NOT NULL,
      image TEXT,
      tags TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create regular users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add missing columns to users table if they don't exist
    db.run(`ALTER TABLE users ADD COLUMN last_login DATETIME`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding last_login column:', err);
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding is_online column:', err);
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding is_verified column:', err);
      }
    });

    // Create comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);


    // Create email verification table
    db.run(`CREATE TABLE IF NOT EXISTS email_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      verification_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin user (username: danibrainy94@gmail.com, password: Physics999@)
    const saltRounds = 10;
    const defaultPassword = 'Physics999@';
    bcrypt.hash(defaultPassword, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }

      db.run(`INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)`,
        ['danibrainy94@gmail.com', hash], (err) => {
          if (err) {
            console.error('Error creating default admin:', err);
          } else {
            console.log('Default admin user created (username: danibrainy94@gmail.com, password: Physics999@)');
          }
        });

      // Create default regular user
      bcrypt.hash('testapp123', saltRounds, (err, userHash) => {
        if (err) {
          console.error('Error hashing user password:', err);
          return;
        }

        db.run(`INSERT OR IGNORE INTO users (email, password_hash, name) VALUES (?, ?, ?)`,
          ['user@example.com', userHash, 'John Doe'], (err) => {
            if (err) {
              console.error('Error creating default user:', err);
            } else {
              console.log('Default user created (email: user@example.com, password: testapp123)');
            }
          });
      });
    });

    console.log('Database initialized successfully');
  });
}

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session.adminId) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Generate verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, code) {
  // Check if email transporter is available
  if (!transporter) {
    console.log('📧 EMAIL NOT CONFIGURED - FALLBACK MODE:');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`Subject: TechPulse - Email Verification Code`);
    console.log(`Verification Code: ${code}`);
    console.log(`Expires: 10 minutes from now`);
    console.log('========================================');
    console.log('⚠️  Email not sent - configure EMAIL_USER and EMAIL_PASS in .env file');
    console.log('📖 See EMAIL_SETUP.md for configuration instructions');
    console.log('💡 For testing: Use the verification code shown above');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'TechPulse - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #66999B;">Welcome to TechPulse!</h2>
        <p>Thank you for registering with TechPulse. To complete your registration, please use the verification code below:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #66999B; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br>The TechPulse Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.log('📧 Fallback: Email failed, check server logs for verification code');
    return false;
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TechPulse Blog API is running' });
});

// Test email endpoint
app.post('/api/test-email', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const testCode = '123456'; // Test code for verification
  sendVerificationEmail(email, testCode).then(success => {
    if (success) {
      res.json({
        message: 'Test email sent successfully',
        note: 'Check your email for the test verification code',
        emailConfigured: true
      });
    } else {
      res.json({
        message: 'Test email logged to console (email not configured)',
        note: 'Check server console for test verification code',
        testCode: testCode,
        emailConfigured: false
      });
    }
  });
});

// Email status endpoint
app.get('/api/email-status', (req, res) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const configured = emailUser && emailPass &&
                    emailUser !== 'your-email@gmail.com' &&
                    emailPass !== 'your-app-password';

  res.json({
    emailConfigured: configured && transporter !== null,
    transporterAvailable: transporter !== null,
    credentialsSet: !!(emailUser && emailPass),
    credentialsValid: configured
  });
});

// Get all posts
app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    // Parse tags from JSON string
    const posts = rows.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : []
    }));

    res.json({ articles: posts });
  });
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching post:', err);
      return res.status(500).json({ error: 'Failed to fetch post' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Parse tags from JSON string
    const post = {
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    };

    res.json(post);
  });
});

// Create new post (admin only)
app.post('/api/posts', requireAuth, upload.single('image'), (req, res) => {
  const { title, category, excerpt, author, authorInitials, date, tags, content } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : null;

  // Validate required fields
  if (!title || !category || !author || !content) {
    return res.status(400).json({ error: 'Title, category, author, and content are required' });
  }

  // Parse tags
  let tagsArray = [];
  try {
    tagsArray = tags ? JSON.parse(tags) : [];
  } catch (e) {
    tagsArray = [];
  }

  const tagsJson = JSON.stringify(tagsArray);

  db.run(`INSERT INTO posts (title, category, excerpt, author, author_initials, date, image, tags, content)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, category, excerpt, author, authorInitials, date, image, tagsJson, content],
    function(err) {
      if (err) {
        console.error('Error creating post:', err);
        return res.status(500).json({ error: 'Failed to create post' });
      }

      res.status(201).json({
        id: this.lastID,
        message: 'Post created successfully'
      });
});
});

// Comments API endpoints
app.get('/api/posts/:id/comments', (req, res) => {
const { id } = req.params;

db.all('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
  if (err) {
    console.error('Error fetching comments:', err);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }

  res.json({ comments: rows });
});
});

app.post('/api/posts/:id/comments', (req, res) => {
const { id } = req.params;
const { content } = req.body;

if (!req.session.userId) {
  return res.status(401).json({ error: 'Authentication required' });
}

if (!content || content.trim().length === 0) {
  return res.status(400).json({ error: 'Comment content is required' });
}

// Verify post exists
db.get('SELECT id FROM posts WHERE id = ?', [id], (err, post) => {
  if (err) {
    console.error('Error checking post:', err);
    return res.status(500).json({ error: 'Failed to add comment' });
  }

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Add comment
  db.run(`INSERT INTO comments (post_id, user_id, user_name, content)
          VALUES (?, ?, ?, ?)`,
    [id, req.session.userId, req.session.userName, content.trim()],
    function(err) {
      if (err) {
        console.error('Error adding comment:', err);
        return res.status(500).json({ error: 'Failed to add comment' });
      }

      res.status(201).json({
        id: this.lastID,
        message: 'Comment added successfully'
      });
    });
});
});

app.delete('/api/comments/:id', (req, res) => {
const { id } = req.params;

if (!req.session.userId) {
  return res.status(401).json({ error: 'Authentication required' });
}

// Check if user owns the comment or is admin
const whereClause = req.session.adminId
  ? 'id = ?'
  : 'id = ? AND user_id = ?';
const params = req.session.adminId
  ? [id]
  : [id, req.session.userId];

db.run(`DELETE FROM comments WHERE ${whereClause}`, params, function(err) {
  if (err) {
    console.error('Error deleting comment:', err);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }

  if (this.changes === 0) {
    return res.status(404).json({ error: 'Comment not found or access denied' });
  }

  res.json({ message: 'Comment deleted successfully' });
});
});

// Update post (admin only)
app.put('/api/posts/:id', requireAuth, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, category, excerpt, author, authorInitials, date, tags, content } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : req.body.existingImage;

  // Validate required fields
  if (!title || !category || !author || !content) {
    return res.status(400).json({ error: 'Title, category, author, and content are required' });
  }

  // Parse tags
  let tagsArray = [];
  try {
    tagsArray = tags ? JSON.parse(tags) : [];
  } catch (e) {
    tagsArray = [];
  }

  const tagsJson = JSON.stringify(tagsArray);

  db.run(`UPDATE posts SET
          title = ?, category = ?, excerpt = ?, author = ?, author_initials = ?,
          date = ?, image = ?, tags = ?, content = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    [title, category, excerpt, author, authorInitials, date, image, tagsJson, content, id],
    function(err) {
      if (err) {
        console.error('Error updating post:', err);
        return res.status(500).json({ error: 'Failed to update post' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json({ message: 'Post updated successfully' });
    });
});

// Delete post (admin only)
app.delete('/api/posts/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  // First get the post to check if image exists
  db.get('SELECT image FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching post for deletion:', err);
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete the image file if it exists
    if (row.image) {
      const imagePath = path.join(__dirname, 'public', row.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the post from database
    db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting post:', err);
        return res.status(500).json({ error: 'Failed to delete post' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json({ message: 'Post deleted successfully' });
    });
  });
});

// Admin authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      console.error('Error fetching admin:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    }

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, admin.password_hash, (err, isValid) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Authentication failed' });
      }

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Set session
      req.session.adminId = admin.id;
      req.session.username = admin.username;

      res.json({
        message: 'Login successful',
        admin: { id: admin.id, username: admin.username }
      });
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/status', (req, res) => {
  if (req.session.adminId) {
    res.json({
      authenticated: true,
      admin: { id: req.session.adminId, username: req.session.username }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// User authentication routes
app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    bcrypt.compare(password, user.password_hash, (err, isValid) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Authentication failed' });
      }

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update user login tracking
      const now = new Date().toISOString();
      db.run('UPDATE users SET last_login = ?, is_online = 1 WHERE id = ?',
        [now, user.id], (updateErr) => {
          if (updateErr) {
            console.error('Error updating user login status:', updateErr);
          }
        });

      // Set user session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userName = user.name;

      res.json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name }
      });
    });
  });
});

app.post('/api/user/logout', (req, res) => {
  const userId = req.session.userId;

  // Update user online status
  if (userId) {
    db.run('UPDATE users SET is_online = 0 WHERE id = ?', [userId], (err) => {
      if (err) {
        console.error('Error updating user logout status:', err);
      }
    });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying user session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/user/status', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        name: req.session.userName
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/user/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Registration failed' });
    }

    db.run(`INSERT INTO users (email, password_hash, name, is_verified) VALUES (?, ?, ?, ?)`,
      [email, hash, name, 0], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'Email already exists' });
          }
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Registration failed' });
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        // Store verification code
        db.run(`INSERT INTO email_verifications (email, verification_code, expires_at) VALUES (?, ?, ?)`,
          [email, verificationCode, expiresAt], (err) => {
            if (err) {
              console.error('Error storing verification code:', err);
              return res.status(500).json({ error: 'Registration failed' });
            }

            // Send verification email
            sendVerificationEmail(email, verificationCode).then(success => {
              if (success) {
                res.status(201).json({
                  message: 'Registration successful. Please check your email for verification code.',
                  user: { id: this.lastID, email: email, name: name, verified: false },
                  emailSent: true
                });
              } else {
                res.status(201).json({
                  message: 'Registration successful! Check the server console for your verification code.',
                  user: { id: this.lastID, email: email, name: name, verified: false },
                  emailSent: false,
                  verificationCode: verificationCode // Include code for testing
                });
              }
            });
          });
      });
  });
});

// Email verification endpoint
app.post('/api/user/verify-email', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  // Check verification code
  db.get(`SELECT * FROM email_verifications WHERE email = ? AND verification_code = ? AND expires_at > datetime('now')`,
    [email, code], (err, row) => {
      if (err) {
        console.error('Error checking verification code:', err);
        return res.status(500).json({ error: 'Verification failed' });
      }

      if (!row) {
        return res.status(400).json({ error: 'Invalid or expired verification code' });
      }

      // Update user as verified
      db.run('UPDATE users SET is_verified = 1 WHERE email = ?', [email], (err) => {
        if (err) {
          console.error('Error updating user verification status:', err);
          return res.status(500).json({ error: 'Verification failed' });
        }

        // Delete used verification code
        db.run('DELETE FROM email_verifications WHERE email = ?', [email], (err) => {
          if (err) {
            console.error('Error deleting verification code:', err);
          }
        });

        // Auto-login after verification
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
          if (!err && user) {
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.userName = user.name;
          }
        });

        res.json({ message: 'Email verified successfully' });
      });
    });
});

// Resend verification code endpoint
app.post('/api/user/resend-verification', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if user exists and is not verified
  db.get('SELECT * FROM users WHERE email = ? AND is_verified = 0', [email], (err, user) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Failed to resend verification code' });
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found or already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete old verification codes for this email
    db.run('DELETE FROM email_verifications WHERE email = ?', [email], (err) => {
      if (err) {
        console.error('Error deleting old verification codes:', err);
      }

      // Store new verification code
      db.run(`INSERT INTO email_verifications (email, verification_code, expires_at) VALUES (?, ?, ?)`,
        [email, verificationCode, expiresAt], (err) => {
          if (err) {
            console.error('Error storing verification code:', err);
            return res.status(500).json({ error: 'Failed to resend verification code' });
          }

          // Send verification email
          sendVerificationEmail(email, verificationCode).then(success => {
            if (success) {
              res.json({
                message: 'Verification code sent successfully',
                emailSent: true
              });
            } else {
              res.json({
                message: 'Verification code generated. Check server console.',
                emailSent: false,
                verificationCode: verificationCode // Include for testing
              });
            }
          });
        });
    });
  });
});

// Admin user management routes
app.get('/api/admin/users', requireAuth, (req, res) => {
  db.all('SELECT id, email, name, last_login, is_online, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({ users: rows });
  });
});

app.delete('/api/admin/users/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  // First check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: 'Failed to delete user' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  });
});

app.put('/api/admin/users/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { is_online } = req.body;

  if (typeof is_online !== 'boolean') {
    return res.status(400).json({ error: 'is_online must be a boolean' });
  }

  db.run('UPDATE users SET is_online = ? WHERE id = ?', [is_online ? 1 : 0, id], function(err) {
    if (err) {
      console.error('Error updating user status:', err);
      return res.status(500).json({ error: 'Failed to update user status' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User status updated successfully' });
  });
});

// Clean up inactive user sessions (mark users as offline if they haven't been active)
app.post('/api/admin/cleanup-sessions', requireAuth, (req, res) => {
  // Mark users as offline if they haven't logged in for more than 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  db.run('UPDATE users SET is_online = 0 WHERE last_login < ? AND is_online = 1', [oneHourAgo], function(err) {
    if (err) {
      console.error('Error cleaning up sessions:', err);
      return res.status(500).json({ error: 'Failed to cleanup sessions' });
    }

    res.json({ message: `Cleaned up ${this.changes} inactive sessions` });
  });
});


// Serve admin dashboard
app.get('/admin', (req, res) => {
 res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`TechPulse Blog Server running on port ${PORT}`);
  console.log(`Access your blog at: http://localhost:${PORT}`);
  console.log(`Admin dashboard at: http://localhost:${PORT}/admin`);
  initDatabase();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = app;