# BK Group - Deployment Guide

This guide will help you deploy your BK Group website to the public internet with MongoDB.

## Prerequisites
- GitHub account
- Free MongoDB Atlas account
- Free Render account
- Gmail account (for email notifications)

---

## Step 1: Set up MongoDB Atlas (Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up with your Google account (free tier)
3. Create a new cluster (select "Free" tier)
4. Wait for cluster to deploy (~10 minutes)
5. Click "Connect" → "Connect your application"
6. Choose "Node.js" driver version 5.x
7. Copy the connection string, it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
   ```
8. Replace `username` and `password` with your credentials
9. Replace `myapp` with `bkgroup`
10. Save this string - you'll need it for Render

---

## Step 2: Set up Gmail for Emails

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Copy it - this is your EMAIL_PASSWORD
5. Your EMAIL_USER is your Gmail address

---

## Step 3: Prepare Your Repository

1. Update `package.json` - Change the start script in server.js if not already done:
   ```json
   "scripts": {
     "start": "node server-prod.js"
   }
   ```

2. Create `.env` file (for local testing):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bkgroup?retryWrites=true&w=majority
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   OWNER_EMAIL=your-email@gmail.com
   ADMIN_KEY=your-secret-admin-key
   OWNER_KEY=your-secret-owner-key
   ```

3. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Production ready setup with MongoDB"
   git push origin main
   ```

---

## Step 4: Deploy to Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (bhavuk)
4. Configure the deployment:
   - **Name**: bkgroup (or your desired name)
   - **Environment**: Node
   - **Region**: Choose closest to you
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Under "Environment", add these variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASSWORD` - Your app password
   - `OWNER_EMAIL` - Your email
   - `ADMIN_KEY` - Create a secure random key
   - `OWNER_KEY` - Create another secure random key

6. Click "Create Web Service"
7. Wait for deployment (~5 minutes)
8. You'll get a URL like: `https://bkgroup.onrender.com`

---

## Step 5: Custom Domain (Optional)

Go to your Render dashboard → Your web service → Settings → Custom Domain

You can:
- **Use Render's free subdomain** (e.g., bkgroup.onrender.com) - Free
- **Add your own domain** - Buy from Namecheap, GoDaddy, etc. (~$1-3/year)

To add a custom domain:
1. Buy domain from registrar
2. In Render, click "Add Custom Domain"
3. Follow the DNS setup instructions
4. Render provides free SSL certificate automatically

---

## Step 6: Test Your Site

1. Visit your Render URL: `https://bkgroup.onrender.com`
2. Test the join form
3. Test the invest form
4. Check that emails are being sent
5. Test admin access (use your ADMIN_KEY)

---

## Making Changes After Deployment

To make changes:
1. Edit your code locally
2. Test on `localhost:3000` (local server with .env file)
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "description of changes"
   git push origin main
   ```
4. Render will automatically redeploy your site within 1-2 minutes

---

## Troubleshooting

**Site shows error on first visit?**
- MongoDB might still be connecting
- Render is still building the app
- Check the Render logs in the dashboard

**Emails not sending?**
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Make sure you generated app password (not regular password)
- Check Gmail → Apps

**Database not working?**
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas (should allow all IPs)
- Verify database name is "bkgroup"

**Site is slow?**
- Free tier has limitations
- Upgrade to paid plans if you get more traffic

---

## Cost Breakdown

- **Render Free Tier**: Free (~500 hours/month, sleeps after 15 min inactivity)
- **MongoDB Atlas Free Tier**: Free (512MB storage)
- **Domain**: ~$1-10/year (optional)
- **Total First Year**: $0-10 (if using domain)

---

## Next Steps

1. Set up email notifications properly
2. Configure admin passwords
3. Set up analytics
4. Consider upgrading to paid plans as you grow

For more help, contact Render or MongoDB support via their dashboards.
