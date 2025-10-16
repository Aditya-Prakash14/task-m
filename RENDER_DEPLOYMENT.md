# 🚀 Deploy to Render - Step-by-Step Guide

## Quick Links
- **Render Dashboard**: https://dashboard.render.com
- **Your GitHub Repo**: https://github.com/Aditya-Prakash14/task-m

---

## 📋 Prerequisites (Already Done ✅)

- ✅ Git repository initialized
- ✅ Code committed to Git
- ✅ GitHub repository: `Aditya-Prakash14/task-m`
- ✅ TiDB Cloud database configured with SSL
- ✅ Render configuration file created (`render.yaml`)

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

If you haven't already pushed to GitHub:

```bash
# Add GitHub remote (replace with your actual repo URL if different)
git remote add origin https://github.com/Aditya-Prakash14/task-m.git

# Push to GitHub
git branch -M main
git push -u origin main
```

If you've already pushed, just update:
```bash
git push
```

---

### Step 2: Deploy on Render

#### Option A: Using Blueprint (Recommended - Uses render.yaml)

1. **Go to Render Blueprint Deploy:**
   - Visit: https://dashboard.render.com/select-repo?type=blueprint
   
2. **Connect GitHub Repository:**
   - Click "Connect" next to `Aditya-Prakash14/task-m`
   - If not listed, click "Configure account" to grant access
   
3. **Configure Blueprint:**
   - Render will detect the `render.yaml` file automatically
   - Click "Apply"
   
4. **Add Secret Environment Variables:**
   
   Render will prompt you to add the secret values:
   
   **DATABASE_URL:**
   ```
   mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
   ```
   
   **JWT_SECRET:**
   ```
   3d267399ddc1df2bae5509a4470058f972a6e2b60bbfca63b424c5d58f2a893a
   ```
   
5. **Deploy:**
   - Click "Apply" to start deployment
   - Wait 3-5 minutes for build and deployment

---

#### Option B: Manual Web Service Setup

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/select-repo?type=web
   
2. **Connect Repository:**
   - Click "Connect" next to `Aditya-Prakash14/task-m`
   
3. **Configure Service:**
   
   | Setting | Value |
   |---------|-------|
   | **Name** | `todo-calendar-backend` |
   | **Environment** | `Node` |
   | **Region** | `Oregon (US West)` or your preferred region |
   | **Branch** | `main` |
   | **Build Command** | `npm install && npx prisma generate` |
   | **Start Command** | `npx prisma migrate deploy && npm start` |
   | **Plan** | `Free` |
   
4. **Add Environment Variables:**
   
   Click "Advanced" → "Add Environment Variable" for each:
   
   ```
   DATABASE_URL = mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
   JWT_SECRET = 3d267399ddc1df2bae5509a4470058f972a6e2b60bbfca63b424c5d58f2a893a
   JWT_EXPIRE = 7d
   NODE_ENV = production
   ```
   
5. **Create Web Service:**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)

---

## ✅ After Deployment

### 1. Get Your Deployment URL

Your service will be available at:
```
https://todo-calendar-backend.onrender.com
```

Or check the URL in your Render dashboard.

---

### 2. Test Your Deployment

```bash
# Test health check
curl https://todo-calendar-backend.onrender.com/api

# Test registration
curl -X POST https://todo-calendar-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Expected response (success):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

---

### 3. Update Your Electron App

**File:** `electron-app/renderer/js/api.js`

Change line 1:
```javascript
const API_BASE_URL = 'https://todo-calendar-backend.onrender.com/api';
```

Then rebuild your Electron app:
```bash
cd electron-app
npm run build
```

---

## 📊 Managing Your Deployment

### View Logs
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab

### Redeploy
- **Automatic**: Push to GitHub main branch (auto-deploys)
- **Manual**: Dashboard → "Manual Deploy" → "Deploy latest commit"

### Update Environment Variables
1. Dashboard → Your Service → "Environment" tab
2. Edit variables
3. Save changes (service auto-restarts)

### Monitor Health
- Dashboard shows service status
- Set up notifications in Settings

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:**
- Build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

**Solution:**
```bash
# Add Node version to package.json
"engines": {
  "node": ">=18.0.0"
}
```

---

### Issue: Database Connection Fails

**Check:**
- Environment variable `DATABASE_URL` is set correctly
- TiDB Cloud allows connections from Render IPs
- SSL parameter `?sslaccept=strict` is present

**Solution:**
- Verify the DATABASE_URL in Render environment variables
- Check TiDB Cloud network settings

---

### Issue: Migrations Don't Run

**Check:**
- Start command includes `npx prisma migrate deploy`
- `prisma/migrations/` directory exists in repo

**Solution:**
```bash
# Manual migration via Render shell
# Dashboard → Shell → Run:
npx prisma migrate deploy
```

---

### Issue: 502 Bad Gateway

**Check:**
- Application is listening on the correct port
- Start command is correct
- Check logs for errors

**Solution:**
- Ensure `server.js` uses `process.env.PORT`
- Check that server actually starts without errors

---

## 🎯 Important Notes

### Free Tier Limitations
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after inactivity takes 30-60 seconds (cold start)
- ✅ 750 hours/month free (enough for one service running 24/7)

### Keep Service Active (Optional)
Use a service like UptimeRobot to ping your API every 10 minutes:
- Service: https://uptimerobot.com
- Monitor URL: `https://todo-calendar-backend.onrender.com/api`
- Interval: 10 minutes

---

## 🔐 Security Best Practices

- ✅ Never commit `.env` file to Git
- ✅ Use strong JWT secret (already generated)
- ✅ DATABASE_URL credentials are stored securely in Render
- ✅ Enable HTTPS only (Render provides free SSL)
- ✅ Consider adding rate limiting for production

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **Node.js on Render**: https://render.com/docs/deploy-node-express-app
- **Your Repo**: https://github.com/Aditya-Prakash14/task-m

---

## 🎉 You're All Set!

Your backend is now deployed on Render with:
- ✅ Automatic HTTPS
- ✅ Automatic deployments from GitHub
- ✅ TiDB Cloud database with SSL
- ✅ Secure environment variables
- ✅ Free hosting

**Next Steps:**
1. Test your API endpoints
2. Update your Electron app with the new URL
3. Rebuild and distribute your desktop app

Need help? Check the troubleshooting section above or Render's documentation!
