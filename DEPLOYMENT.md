# Backend Deployment Guide

## Quick Deploy to Railway (Recommended)

### Prerequisites
- Git installed on your machine
- Railway account (sign up at https://railway.app)

### Step-by-Step Deployment

#### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Todo Calendar Backend"
```

#### 2. Deploy to Railway

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables
railway variables set DATABASE_URL="mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"
railway variables set JWT_SECRET="your-production-secret-key-min-32-chars"
railway variables set JWT_EXPIRE="7d"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

**Option B: Using Railway Web Dashboard**
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account and select your repository
4. Railway will auto-detect Node.js project
5. Add environment variables in the Variables tab:
   - `DATABASE_URL`: `mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict`
   - `JWT_SECRET`: Generate a secure secret (min 32 characters)
   - `JWT_EXPIRE`: `7d`
   - `NODE_ENV`: `production`
6. Click "Deploy"

#### 3. Push to GitHub (for Option B)
```bash
# Create a new repository on GitHub
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Alternative: Deploy to Render

### Step-by-Step

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: todo-calendar-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`
5. Add Environment Variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `NODE_ENV=production`
6. Click "Create Web Service"

---

## Alternative: Deploy to Heroku

### Step-by-Step

```bash
# Install Heroku CLI
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-todo-calendar-api

# Add environment variables
heroku config:set DATABASE_URL="mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"
heroku config:set JWT_SECRET="your-production-secret-key"
heroku config:set JWT_EXPIRE="7d"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

---

## Alternative: Deploy to DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Configure:
   - **App Name**: todo-calendar-backend
   - **Run Command**: `npx prisma migrate deploy && npm start`
5. Add Environment Variables in the settings
6. Click "Launch App"

---

## Alternative: Deploy to Vercel (Serverless)

**Note**: Vercel is best for serverless functions, not ideal for this Express app with persistent database connections.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_EXPIRE
vercel env add NODE_ENV
```

---

## Post-Deployment Steps

### 1. Test Your Deployment

```bash
# Test health endpoint
curl https://your-deployed-url.railway.app/api

# Test registration
curl -X POST https://your-deployed-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Test login
curl -X POST https://your-deployed-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### 2. Update Electron App Configuration

Update your Electron app's API base URL:

**File**: `electron-app/renderer/js/api.js`
```javascript
const API_BASE_URL = 'https://your-deployed-url.railway.app/api';
```

### 3. Security Checklist

- ✅ Change `JWT_SECRET` to a strong, random value (min 32 characters)
- ✅ Verify `NODE_ENV` is set to `production`
- ✅ Ensure database credentials are secure
- ✅ Enable CORS only for your Electron app domain (if needed)
- ✅ Consider adding rate limiting (e.g., express-rate-limit)
- ✅ Add request logging (e.g., morgan)
- ✅ Monitor your application (Railway/Render provide built-in monitoring)

### 4. Generate Secure JWT Secret

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Monitoring & Maintenance

### View Logs
- **Railway**: `railway logs`
- **Heroku**: `heroku logs --tail`
- **Render/DigitalOcean**: View in web dashboard

### Database Migrations
```bash
# Railway
railway run npx prisma migrate deploy

# Heroku
heroku run npx prisma migrate deploy
```

### Rollback Deployment
- Railway: Redeploy previous version from dashboard
- Heroku: `heroku rollback`

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | TiDB Cloud MySQL connection string with SSL | `mysql://user:pass@host:4000/db?sslaccept=strict` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `a7f8b9c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7` |
| `JWT_EXPIRE` | JWT token expiration time | `7d` (7 days) |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by most platforms) | `3000` |

---

## Troubleshooting

### Issue: Database connection fails
- Verify TiDB Cloud allows connections from your deployment platform
- Check SSL parameter is included: `?sslaccept=strict`
- Ensure credentials are correct

### Issue: Migrations fail
- Run `npx prisma migrate deploy` manually after deployment
- Check database user has necessary permissions

### Issue: 502 Bad Gateway
- Check server logs for errors
- Verify `npm start` script works locally
- Ensure PORT is not hardcoded (use `process.env.PORT || 3000`)

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Heroku Docs: https://devcenter.heroku.com
- Prisma Deploy Docs: https://www.prisma.io/docs/guides/deployment

---

## Your Deployment URLs

After deployment, update these:

- **Backend API**: `https://_____.railway.app/api`
- **API Documentation**: See README.md for all endpoints
- **Update Electron App**: Change `API_BASE_URL` in `electron-app/renderer/js/api.js`
