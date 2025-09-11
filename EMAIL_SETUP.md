# Email Authentication Setup Guide

## Overview
This application now includes email verification for user registration. Users must verify their email address before they can log in and access the platform.

## Features
- ✅ Email verification during registration
- ✅ 6-digit verification codes
- ✅ 10-minute code expiration
- ✅ Resend verification code functionality
- ✅ Secure email delivery
- ✅ User status tracking (verified/unverified)

## Setup Instructions

### 1. Configure Email Service

#### Option A: Gmail (Recommended for Testing)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (custom name)"
   - Enter "TechPulse" as the custom name
   - Copy the 16-character password (ignore spaces)

3. **Update your `.env` file:**
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

#### Option B: Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Option C: SendGrid (Production Ready)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Update `.env`:
```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
```

#### Option D: Mailgun (Production Ready)
1. Sign up at [Mailgun](https://www.mailgun.com)
2. Get SMTP credentials
3. Update `.env`:
```env
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

### 2. Test Email Configuration

#### Automatic Testing:
When you register a new user, the verification code will be:
- **Logged to console** if email is not configured
- **Sent via email** if properly configured

#### Manual Testing:
Visit: `http://localhost:3000/api/health` to verify server is running

### 3. Troubleshooting

#### Common Issues:

**"Email not sent - configure EMAIL_USER and EMAIL_PASS"**
- Update your `.env` file with real credentials
- Restart the server after changes

**"Authentication failed" (Gmail)**
- Make sure you're using an App Password, not your regular password
- Verify 2FA is enabled on your Google account

**"Invalid login" or "535-5.7.8 Username and Password not accepted"**
- **Most Common Issue**: You're using your regular Gmail password instead of an App Password
- **Solution**: Generate an App Password as described above
- Check that your email credentials are correct
- Ensure no extra spaces in the password
- Make sure 2FA is enabled on your Gmail account

**"Application-specific password required"**
- Enable 2-Factor Authentication on your Gmail account
- Generate an App Password specifically for "TechPulse"
- Use the 16-character App Password (without spaces) in EMAIL_PASS

**"Less secure app access" error**
- Gmail no longer supports "Less secure app access"
- You MUST use 2-Factor Authentication + App Password
- This is Google's security requirement

**Still having issues?**
- Try a different email provider (Outlook/Hotmail works well)
- Check your email provider's SMTP settings
- Verify firewall/antivirus isn't blocking the connection
- Test with the email test page: `http://localhost:3000/test-email.html`

### Quick Gmail Setup:

1. **Go to Gmail** → Click your profile picture → "Manage your Google Account"
2. **Security** → **2-Step Verification** → **Turn on** (if not already)
3. **Security** → **2-Step Verification** → **App passwords**
4. **Select app**: "Mail", **Select device**: "Other (custom name)"
5. **Enter**: "TechPulse"
6. **Copy the 16-character password** (ignore spaces)
7. **Update .env file**:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # Your 16-char app password
```
8. **Restart server**: `npm start`
9. **Test**: Visit `http://localhost:3000/test-email.html`

### 2. Environment Configuration

Update the `.env` file in your project root:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Email Service Configuration

The email transporter is configured in `server.js`:

```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### 4. Database Setup

The system automatically creates the required tables:
- `email_verifications` table for storing verification codes
- `is_verified` column added to `users` table

## How It Works

### User Registration Flow:
1. User fills registration form
2. System creates user account (unverified)
3. System generates 6-digit verification code
4. System sends verification email
5. User receives email with verification code
6. User enters code in verification form
7. System verifies code and marks user as verified
8. User can now log in

### Email Template:
The verification email includes:
- Professional HTML template
- 6-digit verification code
- 10-minute expiration notice
- TechPulse branding

## API Endpoints

### POST `/api/user/register`
- Registers a new user
- Sends verification email
- Returns user data with verification status

### POST `/api/user/verify-email`
- Verifies email with 6-digit code
- Updates user verification status
- Auto-logs in verified user

### POST `/api/user/resend-verification`
- Resends verification code
- Generates new code with fresh expiration

### POST `/api/user/login`
- Requires email verification
- Returns error for unverified users

## Security Features

- ✅ Verification codes expire after 10 minutes
- ✅ One-time use codes (deleted after verification)
- ✅ Rate limiting considerations
- ✅ Secure password hashing
- ✅ Session-based authentication

## Testing

### Without Real Email:
For development/testing without real email:
1. Check server console for verification codes
2. Or modify `sendVerificationEmail` function to log codes instead of sending

### With Real Email:
1. Configure your email credentials in `.env`
2. Test registration flow
3. Check email for verification codes
4. Complete verification process

## Troubleshooting

### Common Issues:

1. **"Email verification failed"**
   - Check email credentials in `.env`
   - Verify Gmail app password is correct
   - Check server console for SMTP errors

2. **"Invalid verification code"**
   - Code may have expired (10-minute limit)
   - Code was already used
   - Check for typos in code entry

3. **"Please verify your email before logging in"**
   - User hasn't completed email verification
   - Direct them to registration page to resend code

### Email Service Alternatives:

If Gmail doesn't work, consider:
- **SendGrid**: Professional email service
- **Mailgun**: Transactional email service
- **AWS SES**: Amazon's email service
- **Outlook/Hotmail**: Similar setup to Gmail

## Production Considerations

1. **Email Service**: Use professional email service (SendGrid, Mailgun, etc.)
2. **Rate Limiting**: Implement rate limiting for verification endpoints
3. **Email Templates**: Create more sophisticated email templates
4. **Monitoring**: Add logging for email delivery status
5. **Backup Codes**: Consider implementing backup verification methods

## File Structure

```
├── server.js              # Main server file with email functions
├── .env                   # Environment configuration
├── public/
│   ├── register.html      # Registration with verification
│   ├── login.html         # Login with verification checks
│   └── js/
│       ├── login.js       # Updated login logic
│       └── register.js    # Registration with verification
└── EMAIL_SETUP.md         # This documentation
```

## Next Steps

### Immediate Actions:
1. **Test your email setup:** Visit `http://localhost:3000/test-email.html`
2. **Configure real email credentials** in your `.env` file
3. **Restart the server** after configuration changes

### Production Setup:
- [ ] Configure production email service (SendGrid, Mailgun, AWS SES)
- [ ] Add email templates for different scenarios
- [ ] Implement password reset via email
- [ ] Add email preferences for users
- [ ] Set up email analytics and monitoring

### Testing Checklist:
- [x] Server running on port 3000
- [x] Database initialized
- [x] Admin user created
- [ ] Email credentials configured
- [ ] Test email sent successfully
- [ ] User registration with email verification working
- [ ] Admin login working

## Quick Start Commands:

```bash
# 1. Configure email in .env file
# 2. Restart server
npm start

# 3. Test email functionality
# Visit: http://localhost:3000/test-email.html

# 4. Test user registration
# Visit: http://localhost:3000/register.html
```

## Support

If you're still having issues:
1. Check the server console for error messages
2. Verify your email credentials are correct
3. Try a different email provider
4. Check EMAIL_SETUP.md for detailed instructions