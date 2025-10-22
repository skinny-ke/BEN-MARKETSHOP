#!/bin/bash

# BenMarket Deployment Script
# This script helps deploy the application to various platforms

echo "🚀 BenMarket Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the BEN-MARKET root directory"
    exit 1
fi

# Function to deploy backend
deploy_backend() {
    echo "📦 Deploying Backend..."
    
    # Check if .env exists
    if [ ! -f "backend/.env" ]; then
        echo "⚠️  backend/.env not found. Please create it with your production variables."
        echo "Required variables:"
        echo "  - MONGO_URI"
        echo "  - JWT_SECRET"
        echo "  - JWT_REFRESH_SECRET"
        echo "  - MPESA_* (for payment integration)"
        echo "  - CLOUDINARY_* (for image uploads)"
        return 1
    fi
    
    echo "✅ Backend ready for deployment"
    echo "💡 Deploy to Railway, Render, or Heroku:"
    echo "   1. Connect your GitHub repository"
    echo "   2. Set environment variables"
    echo "   3. Deploy!"
}

# Function to deploy frontend
deploy_frontend() {
    echo "📦 Deploying Frontend..."
    
    # Check if .env exists
    if [ ! -f "frontend/.env" ]; then
        echo "⚠️  frontend/.env not found. Creating with default values..."
        echo "VITE_API_URL=https://your-backend-url.railway.app" > frontend/.env
    fi
    
    # Build frontend
    echo "🔨 Building frontend..."
    cd frontend
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend built successfully"
        echo "💡 Deploy to Vercel, Netlify, or GitHub Pages:"
        echo "   1. Connect your GitHub repository"
        echo "   2. Set build command: npm run build"
        echo "   3. Set output directory: dist"
        echo "   4. Deploy!"
    else
        echo "❌ Frontend build failed"
        return 1
    fi
    
    cd ..
}

# Function to create production zip
create_zip() {
    echo "📦 Creating production package..."
    
    # Create zip without node_modules and .env files
    zip -r BEN-MARKET-production.zip . \
        -x "node_modules/*" \
        -x "*/node_modules/*" \
        -x "*.env" \
        -x "*.log" \
        -x ".git/*" \
        -x "dist/*"
    
    echo "✅ Production package created: BEN-MARKET-production.zip"
}

# Main menu
echo ""
echo "What would you like to do?"
echo "1) Deploy Backend"
echo "2) Deploy Frontend"
echo "3) Deploy Both"
echo "4) Create Production Zip"
echo "5) Run Setup Test"
echo "6) Exit"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_backend
        deploy_frontend
        ;;
    4)
        create_zip
        ;;
    5)
        node test-setup.js
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "📚 Check README.md for detailed deployment instructions"