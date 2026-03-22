# Quick Start: Deploy BK Group in 15 Minutes

Follow these steps in order. It will take about 15 minutes.

## ✅ Step 1: Create MongoDB Database (5 min)

1. Open [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" → Sign up with Google
3. Create Organization → Create Project → Create Cluster
4. Select "Free" tier, click "Create"
5. Wait for green "READY" status
6. Click "Connect" button
7. Choose "Drivers" tab
8. Copy your connection string (looks like: `mongodb+srv://...`)
9. Replace `<password>` with your MongoDB password
10. Replace `mydb` with `bkgroup`

**Your MongoDB URI is:** `mongodb+srv://username:password@cluster.mongodb.net/bkgroup?retryWrites=true&w=majority`

Keep this handy.

---

## ✅ Step 2: Get Gmail App Password (5 min)

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select Mail → Windows Computer
3. Click "Generate"
4. Copy the 16-character password

**Your EMAIL_PASSWORD is:** (the 16 characters)  
**Your EMAIL_USER is:** your-gmail@gmail.com

---

## ✅ Step 3: Push Code to GitHub (2 min)

```bash
cd /workspaces/bhavuk
git add .
git commit -m "Ready for production with MongoDB"
git push origin main
```

Confirm by visiting [github.com/akwarrior596-afk/bhavuk](https://github.com/akwarrior596-afk/bhavuk) - you should see the new files.

---

## ✅ Step 4: Deploy on Render (3 min)

1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Select repository: `bhavuk`
5. Configure:
   - **Name:** bkgroup
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Region:** Pick closest to you

6. Click "Advanced" and add these Environment Variables:

| Key | Value |
|-----|-------|
| MONGODB_URI | Your MongoDB connection string |
| EMAIL_USER | your-gmail@gmail.com |
| EMAIL_PASSWORD | Your 16-char app password |
| OWNER_EMAIL | your-gmail@gmail.com |
| ADMIN_KEY | Create any secret word (e.g., mycustomkey123) |
| OWNER_KEY | Create another secret word (e.g., owneraccess456) |

7. Click "Create Web Service"
8. Wait 3-5 minutes for it to deploy
9. You'll see a URL: `https://bkgroup.onrender.com` (customize the name if you want)

---

## ✅ Done! 🎉

Your site is now LIVE on the internet!

**Public URL:** `https://bkgroup.onrender.com`

### Test it:
- Open the URL in a browser
- Fill out the Join form → should see your admin email get notification
- Fill out the Invest form → should see profit updated
- Submit a review → should appear on the site
- Try visiting `/admin` with your ADMIN_KEY

---

## What Happens Next?

**Free tier sleep mode:** After 15 minutes of no activity, the server sleeps (free tier limitation). First request wakes it up (takes ~30 sec). Upgrade to paid if you want always-on.

**Making changes:** 
```bash
# Edit code locally
git add .
git commit -m "your changes"
git push origin main
# Render auto-deploys in 1-2 minutes
```

**Custom domain:** In Render dashboard → Settings → Add Custom Domain (optional, costs $1-10/year)

---

## Need Help?

- **MongoDB Issues:** Check MongoDB Atlas dashboard → Cluster → Logs
- **Render Issues:** Check Render dashboard → Your app → Logs
- **Email Not Working:** Verify `EMAIL_PASSWORD` is the app password, not regular password
- **Database Not Connecting:** Whitelist all IPs in MongoDB Atlas → Network Access

---

Congratulations! Your BK Group website is now publicly accessible to everyone on the internet! 🚀
