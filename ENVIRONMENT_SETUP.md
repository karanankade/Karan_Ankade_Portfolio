# 🔧 Environment Setup Guide

## Quick Start - Environment Configuration

### Step 1: Copy the Example File
```bash
cp .env.example .env
```

### Step 2: Update `.env` with Your Actual Credentials

Edit the `.env` file and replace the placeholders:

```env
# Port your backend runs on
PORT=5000

# MongoDB Atlas Connection String
# Get from: https://www.mongodb.com/cloud/atlas
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/?appName=portfolio

# Your admin email (only this email can access admin dashboard)
ADMIN_EMAIL=your-email@gmail.com

# SMTP Configuration (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Your frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Security settings
OTP_EXPIRY_MINUTES=5
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_MINUTES=15
```

### Step 3: Getting Your Credentials

#### MongoDB Atlas Connection String
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account or login
3. Create a cluster
4. Click "Connect"
5. Choose "Drivers" > "Node.js"
6. Copy the connection string
7. Replace `<password>` and `<username>` with your database credentials

#### Gmail App Password (for Nodemailer)
1. Go to https://support.google.com/accounts/answer/185833
2. Enable 2-Step Verification if not already enabled
3. Create an "App password"
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste into `SMTP_PASS` in `.env` (remove spaces)

#### Frontend URL
- Development: `http://localhost:5173` (Vite default)
- Production: `https://yourdomain.com`

### Step 4: Verify Configuration
```bash
# Start the server
npm run server

# You should see:
# ✅ MongoDB Database Connected Successfully!
# 🚀 Server backend running on http://localhost:5000
# 🔒 Security: CORS enabled for http://localhost:5173
```

---

## Environment Variables Reference

| Variable | Example | Purpose | Required |
|----------|---------|---------|----------|
| `PORT` | 5000 | Backend server port | ✅ |
| `MONGODB_URI` | mongodb+srv://... | Database connection | ✅ |
| `ADMIN_EMAIL` | admin@example.com | Admin access email | ✅ |
| `SMTP_HOST` | smtp.gmail.com | Email server | ❌ (optional) |
| `SMTP_PORT` | 587 | Email server port | ❌ (optional) |
| `SMTP_USER` | your@gmail.com | Email account | ❌ (optional) |
| `SMTP_PASS` | app_password | Email app password | ❌ (optional) |
| `FRONTEND_URL` | http://localhost:5173 | Frontend address | ✅ |
| `NODE_ENV` | production | Deployment environment | ❌ |

---

## Troubleshooting

### MongoDB Connection Error
- **Error**: `connect ECONNREFUSED 127.0.0.1:27017`
- **Solution**: 
  - Check MongoDB URI in `.env`
  - Ensure MongoDB Atlas cluster is running
  - Check IP whitelist allows your current IP
  - Verify username/password are correct

### Email Not Sending
- **Error**: `Failed to send email via SMTP transporter`
- **Solution**:
  - Verify Gmail App Password (not regular password)
  - Check "Less secure apps" is disabled (use App Password)
  - Ensure 2-Step Verification is enabled
  - Check SMTP credentials in `.env`

### CORS Error in Frontend
- **Error**: `Access to XMLHttpRequest blocked by CORS policy`
- **Solution**:
  - Update `FRONTEND_URL` in `.env` to match your frontend URL
  - Restart the server after changing `FRONTEND_URL`
  - Check browser console for exact URL causing issue

### Rate Limit Error
- **Error**: `Too many requests from this IP, please try again later`
- **Solution**:
  - Wait 15 minutes or restart server
  - In development, you can increase `RATE_LIMIT_MINUTES`

---

## Security Reminders

⚠️ **Never:**
- Commit `.env` file to Git
- Share your `.env` file with others
- Use production credentials in development
- Expose `SMTP_PASS` or `MONGODB_URI` publicly

✅ **Always:**
- Use `.env.example` as a template for others
- Rotate passwords regularly
- Use unique strong passwords
- Enable 2-Factor Authentication on accounts
- Review `.gitignore` includes `.env`

---

## Production Deployment

For production, use your hosting platform's environment variable system:

### Vercel
```bash
vercel env add MONGODB_URI
vercel env add ADMIN_EMAIL
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add FRONTEND_URL
vercel env add NODE_ENV production
```

### Heroku
```bash
heroku config:set MONGODB_URI="your_value"
heroku config:set ADMIN_EMAIL="your_value"
heroku config:set SMTP_USER="your_value"
heroku config:set SMTP_PASS="your_value"
heroku config:set FRONTEND_URL="your_value"
heroku config:set NODE_ENV="production"
```

### Docker / VPS
Use systemd environment files or Docker env variables instead of `.env` files.

---

## Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Fill in your actual credentials
3. ✅ Test MongoDB connection
4. ✅ Test email sending
5. ✅ Review [SECURITY.md](./SECURITY.md) for security best practices
6. ✅ Run `npm run dev` to start development

---

**Need help?** Check the [SECURITY.md](./SECURITY.md) file for detailed security documentation.
