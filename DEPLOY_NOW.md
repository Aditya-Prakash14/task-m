# 🚀 Quick Deployment Guide

Your backend is ready to deploy! Here are your options:

## 🎯 Recommended: Railway (Easiest)

### Option 1: Using the Automated Script
```bash
./deploy-railway.sh
```

### Option 2: Manual Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up

# Set environment variables (do this after init)
railway variables set DATABASE_URL="mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"
railway variables set JWT_SECRET="3d267399ddc1df2bae5509a4470058f972a6e2b60bbfca63b424c5d58f2a893a"
railway variables set JWT_EXPIRE="7d"
railway variables set NODE_ENV="production"

# Get your URL
railway domain

# View logs
railway logs
```

---

## 🌐 Alternative: Deploy via GitHub + Railway Dashboard

1. **Push to GitHub:**
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

2. **Deploy on Railway:**
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables in Settings → Variables:
     - `DATABASE_URL`: `mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict`
     - `JWT_SECRET`: `3d267399ddc1df2bae5509a4470058f972a6e2b60bbfca63b424c5d58f2a893a`
     - `JWT_EXPIRE`: `7d`
     - `NODE_ENV`: `production`
   - Click Deploy

---

## 🎨 Alternative: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub (push your code first)
4. Configure:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npx prisma migrate deploy && npm start`
5. Add environment variables
6. Deploy

---

## 📦 Alternative: Heroku

```bash
# Install Heroku CLI from https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL="mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"
heroku config:set JWT_SECRET="3d267399ddc1df2bae5509a4470058f972a6e2b60bbfca63b424c5d58f2a893a"
heroku config:set JWT_EXPIRE="7d"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

---

## ✅ After Deployment

### 1. Test Your API
```bash
# Replace YOUR_URL with your deployment URL
curl https://YOUR_URL/api

# Test registration
curl -X POST https://YOUR_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123456"}'
```

### 2. Update Your Electron App

Edit `electron-app/renderer/js/api.js`:
```javascript
const API_BASE_URL = 'https://YOUR_DEPLOYED_URL/api';
```

### 3. Rebuild Your Electron App
```bash
cd electron-app
npm run build
```

---

## 🔑 Important Notes

### Your Generated JWT Secret (SECURE THIS!)
```
3d267399ddc1df2bae5509a4470058f972a6e2b60bbfca63b424c5d58f2a893a
```

### Database URL (Already Configured)
```
mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
```

---

## 🆘 Need Help?

- **Railway Issues**: Check logs with `railway logs`
- **Database Connection**: Verify TiDB Cloud allows connections
- **CORS Errors**: Make sure your Electron app domain is allowed
- **Full Documentation**: See `DEPLOYMENT.md` for detailed guides

---

## 📋 Deployment Checklist

- ✅ Git repository initialized
- ✅ Railway configuration files created (`railway.json`, `Procfile`)
- ✅ Secure JWT secret generated
- ✅ TiDB Cloud database configured with SSL
- ✅ Environment variables documented
- ✅ `.gitignore` configured (`.env` is excluded)
- ✅ Deployment scripts ready

---

## 🎯 Recommended First Step

Run this now:
```bash
./deploy-railway.sh
```

This will guide you through the entire deployment process automatically!
