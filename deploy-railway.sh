#!/bin/bash

echo "🚀 Todo Calendar Backend - Railway Deployment Script"
echo "=================================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo ""
    echo "Install it with:"
    echo "npm install -g @railway/cli"
    echo ""
    echo "Or download from: https://docs.railway.app/develop/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize Railway project
echo ""
echo "📦 Initializing Railway project..."
railway init

# Set environment variables
echo ""
echo "🔧 Setting environment variables..."
echo "Enter your production JWT secret (min 32 chars) or press Enter to use generated one:"
read -r JWT_SECRET_INPUT

if [ -z "$JWT_SECRET_INPUT" ]; then
    JWT_SECRET="3d267399ddc1df2bae5509a4470058f972a6e2b60bbfca63b424c5d58f2a893a"
    echo "Using generated JWT secret"
else
    JWT_SECRET="$JWT_SECRET_INPUT"
fi

railway variables set DATABASE_URL="mysql://YLVysNuS5CG8ors.root:KqbqoFfKqOd2Fp7z@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRE="7d"
railway variables set NODE_ENV="production"

echo ""
echo "✅ Environment variables set"

# Deploy
echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get your deployment URL: railway domain"
echo "2. Test your API: curl https://your-url.railway.app/api"
echo "3. Update Electron app API_BASE_URL in electron-app/renderer/js/api.js"
echo ""
echo "🔍 View logs: railway logs"
echo "🌐 Open dashboard: railway open"
