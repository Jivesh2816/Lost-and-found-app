# Deployment Guide for Lost & Found App

## Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free) or Render account (free)
- MongoDB Atlas account (free)

## Step 1: Set up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/lost-and-found`)
6. Add your IP address to the whitelist

## Step 2: Deploy Backend to Railway

1. Go to [Railway](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Railway will automatically detect it's a Node.js app
5. Add these environment variables in Railway dashboard:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-and-found
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   SMTP_HOST=your-smtp-host
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your-email-password
   MAIL_FROM=Lost & Found <your-email@domain.com>
   ```
6. Deploy! Railway will give you a URL like: `https://your-app.railway.app`

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up
2. Click "New Project" → "Import Git Repository"
3. Connect your GitHub account and select this repository
4. Set the **Root Directory** to `frontend`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-app.railway.app
   ```
6. Deploy!

## Step 4: Update CORS Settings

1. Go to your Railway backend dashboard
2. Add this environment variable:
   ```
   FRONTEND_URL=https://your-actual-vercel-domain.vercel.app
   ```
   (Replace with your actual Vercel domain)
3. Redeploy the backend

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Create an account
3. Test all features:
   - Login/Signup
   - Create posts
   - View posts
   - Contact functionality

## Alternative: Deploy to Render

If you prefer Render over Railway:

1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add the same environment variables as above

## Environment Variables Summary

### Backend (Railway/Render):
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Random secret for JWT tokens
- `NODE_ENV=production`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` - Email settings

### Frontend (Vercel):
- `REACT_APP_API_URL` - Your backend URL

## Troubleshooting

1. **CORS errors**: Make sure CORS origin matches your frontend domain
2. **Database connection**: Check MongoDB Atlas IP whitelist
3. **Email not working**: Verify SMTP credentials
4. **Build failures**: Check environment variables are set correctly

## Cost
- **MongoDB Atlas**: Free tier (512MB)
- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (unlimited for personal use)
- **Total**: $0/month for small apps!
