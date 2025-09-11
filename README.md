# TechPulse Blog Backend

A simple and effective backend for the TechPulse blog with a user-friendly admin dashboard for managing blog posts.

## Features

- **RESTful API** for blog post management
- **Admin Dashboard** with full CRUD operations
- **Image Upload** support for post images
- **SQLite Database** for data persistence
- **Session-based Authentication** for admin access
- **Responsive Design** matching the blog's aesthetic
- **Category Filtering** and search functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: Express Sessions
- **File Upload**: Multer
- **Frontend**: HTML, CSS, JavaScript (jQuery)

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Clone or download the project files**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Migrate existing data (optional):**
   ```bash
   npm run migrate
   ```
   This will import the existing articles from `articles.json` into the database.

4. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Blog: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password in production!

## API Endpoints

### Public Endpoints

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `GET /api/health` - Health check

### Admin Endpoints (require authentication)

- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/status` - Check authentication status

## Database Schema

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL,
  author_initials TEXT,
  date TEXT NOT NULL,
  image TEXT,
  tags TEXT, -- JSON array stored as string
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

```
├── server.js              # Main server file
├── migrate.js             # Database migration script
├── admin.html             # Admin dashboard
├── index.html             # Blog homepage
├── article-info.html      # Individual article page
├── package.json           # Dependencies and scripts
├── blog.db               # SQLite database (created automatically)
├── images/               # Uploaded images
├── css/                  # Stylesheets
├── js/                   # JavaScript files
└── README.md             # This file
```

## Admin Dashboard Features

### Post Management
- ✅ **Add New Posts** with image upload
- ✅ **Edit Existing Posts** with image replacement
- ✅ **Delete Posts** with confirmation
- ✅ **View All Posts** in a clean table format

### Form Features
- ✅ **Rich Text Content** support
- ✅ **Image Upload** with preview
- ✅ **Tag Management** with add/remove functionality
- ✅ **Category Selection** from predefined options
- ✅ **Form Validation** for required fields

### User Experience
- ✅ **Responsive Design** for mobile and desktop
- ✅ **Loading States** and error handling
- ✅ **Success/Error Messages** for user feedback
- ✅ **Modal Forms** for better UX

## Security Features

- ✅ **Session-based Authentication**
- ✅ **Password Hashing** with bcrypt
- ✅ **Input Validation** and sanitization
- ✅ **File Upload Restrictions** (images only, 5MB limit)
- ✅ **CORS Configuration**
- ✅ **SQL Injection Protection** (parameterized queries)

## Development

### Adding New Admin Users

To add new admin users, you can modify the database directly or create a script:

```javascript
const bcrypt = require('bcryptjs');
const saltRounds = 10;

bcrypt.hash('newpassword', saltRounds, (err, hash) => {
  // Insert into admins table
  db.run(`INSERT INTO admins (username, password_hash) VALUES (?, ?)`,
    ['newusername', hash]);
});
```

### Customizing Categories

To add new categories, update the admin dashboard form in `admin.html`:

```html
<option value="New Category">New Category</option>
```

## Production Deployment

### Environment Variables

Create a `.env` file for production:

```
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-secret-key-here
```

### Security Considerations

1. **Change Default Credentials**: Update the default admin password
2. **Use HTTPS**: Configure SSL certificates
3. **Environment Variables**: Move sensitive data to environment variables
4. **Database Backup**: Implement regular database backups
5. **Rate Limiting**: Add rate limiting for API endpoints
6. **Input Validation**: Enhance input validation and sanitization

### Performance Optimizations

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement caching for frequently accessed posts
3. **Image Optimization**: Add image compression and optimization
4. **CDN**: Use CDN for static assets

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Errors**
   - Delete `blog.db` and run migration again
   - Check file permissions

3. **Image Upload Issues**
   - Check `images/` directory permissions
   - Verify file size limits (5MB default)

### Logs

The server logs important events to the console:
- Database initialization
- Authentication attempts
- API requests and responses
- Error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own blog!

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify file permissions and database access

---

**Happy blogging with TechPulse! 🚀**