#!/bin/bash

# AWS Polly Setup Helper Script
# This script helps you create your .env file with AWS credentials

echo "🎮 Jeopardy Game - AWS Polly Setup"
echo "===================================="
echo ""
echo "This script will help you set up AWS Polly for text-to-speech."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled. Your existing .env file was not modified."
        exit 0
    fi
fi

echo ""
echo "📝 You'll need AWS credentials from IAM Console."
echo "   If you don't have them yet, see AWS_POLLY_SETUP.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get AWS Access Key ID
echo "Enter your AWS Access Key ID (starts with AKIA...):"
read -r AWS_ACCESS_KEY_ID

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "❌ Access Key ID cannot be empty. Exiting."
    exit 1
fi

echo ""

# Get AWS Secret Access Key
echo "Enter your AWS Secret Access Key:"
read -r AWS_SECRET_ACCESS_KEY

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Secret Access Key cannot be empty. Exiting."
    exit 1
fi

echo ""

# Get AWS Region (with default)
echo "Enter AWS Region (press Enter for default: us-east-1):"
read -r AWS_REGION

if [ -z "$AWS_REGION" ]; then
    AWS_REGION="us-east-1"
fi

# Create .env file
cat > .env << EOF
# AWS Polly Configuration
# Generated on $(date)

REACT_APP_AWS_REGION=${AWS_REGION}
REACT_APP_AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
REACT_APP_AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

# These credentials will be embedded in your build for client-side use
# Make sure your IAM user has ONLY Polly read access for security
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Test your credentials:"
echo "   npm start"
echo "   (Check browser console for 'Polly client initialized successfully')"
echo ""
echo "2️⃣  Build your app:"
echo "   npm run build"
echo ""
echo "3️⃣  Deploy to GoDaddy:"
echo "   Upload the 'build' folder contents to public_html/jeopardy/"
echo "   (See DEPLOY_SUBDIRECTORY.md for details)"
echo ""
echo "💡 Tip: The .env file is gitignored - it won't be committed to git"
echo ""

