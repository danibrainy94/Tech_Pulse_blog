const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'blog.db');
const articlesPath = path.join(__dirname, 'articles.json');

// Read existing articles
let articlesData;
try {
  articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
} catch (error) {
  console.error('Error reading articles.json:', error);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log('Starting migration...');

// Create tables if they don't exist
db.serialize(() => {
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

  // Check if posts already exist
  db.get('SELECT COUNT(*) as count FROM posts', [], (err, row) => {
    if (err) {
      console.error('Error checking existing posts:', err);
      return;
    }

    if (row.count > 0) {
      console.log('Posts already exist in database. Skipping migration.');
      db.close();
      return;
    }

    // Insert articles
    const stmt = db.prepare(`INSERT INTO posts
      (id, title, category, excerpt, author, author_initials, date, image, tags, content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    articlesData.articles.forEach(article => {
      const tagsJson = JSON.stringify(article.tags || []);
      stmt.run(
        article.id,
        article.title,
        article.category,
        article.excerpt,
        article.author,
        article.authorInitials || '',
        article.date,
        article.image,
        tagsJson,
        article.content
      );
    });

    stmt.finalize();

    console.log(`Successfully migrated ${articlesData.articles.length} articles to database.`);

    // Update the sequence for auto-increment
    const maxId = Math.max(...articlesData.articles.map(a => a.id));
    db.run(`UPDATE sqlite_sequence SET seq = ? WHERE name = 'posts'`, [maxId], (err) => {
      if (err) {
        console.log('Could not update sequence (this is normal for first run)');
      }
      db.close();
      console.log('Migration completed successfully!');
    });
  });
});