#!/bin/bash

# Jeopardy Game - Simple Deployment Script
# This script helps you build and deploy your Jeopardy game

echo "🎮 Jeopardy Game Deployment Helper"
echo "=================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build

# Build the production version
echo "🔨 Building production version..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📁 Your production files are in the 'build' folder"
    echo ""
    echo "Choose a deployment option:"
    echo ""
    echo "1️⃣  Netlify Drop (easiest):"
    echo "   Visit: https://app.netlify.com/drop"
    echo "   Drag and drop the 'build' folder"
    echo ""
    echo "2️⃣  Netlify CLI:"
    echo "   npm install -g netlify-cli"
    echo "   netlify deploy --prod --dir=build"
    echo ""
    echo "3️⃣  Vercel:"
    echo "   npm install -g vercel"
    echo "   vercel --prod"
    echo ""
    echo "4️⃣  GoDaddy Hosting:"
    echo "   Upload contents of 'build' folder to public_html via FTP"
    echo "   See DEPLOY_GODADDY.md for detailed instructions"
    echo ""
    echo "5️⃣  Test locally first:"
    echo "   npx serve -s build"
    echo ""
    echo "6️⃣  Manual deployment:"
    echo "   Upload the contents of the 'build' folder to your web server"
    echo ""
    
    # Ask if user wants to test locally
    read -p "Would you like to test the build locally? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🚀 Starting local server..."
        echo "📱 Open http://localhost:3000 in your browser"
        echo "Press Ctrl+C to stop"
        echo ""
        npx serve -s build
    fi
else
    echo ""
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

