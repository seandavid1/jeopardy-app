#!/bin/bash

# Firebase Leaderboard - Quick Deploy Script
# Deploys the Firestore security rules for leaderboard functionality

echo "🚀 Deploying Firebase Leaderboard Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g firebase-tools"
    echo ""
    echo "Then login:"
    echo "  firebase login"
    echo ""
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null
then
    echo "❌ Not logged in to Firebase!"
    echo ""
    echo "Please login first:"
    echo "  firebase login"
    echo ""
    exit 1
fi

echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Leaderboard rules deployed successfully!"
    echo ""
    echo "Your leaderboard is now cloud-enabled! 🏆☁️"
    echo ""
    echo "Features enabled:"
    echo "  ✅ Cloud backup"
    echo "  ✅ Cross-device sync"
    echo "  ✅ Permanent storage"
    echo ""
    echo "The app will now automatically sync leaderboard entries to Firebase"
    echo "when users are logged in."
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Manual deployment option:"
    echo "  1. Go to https://console.firebase.google.com"
    echo "  2. Select your project"
    echo "  3. Go to Firestore Database → Rules"
    echo "  4. Copy rules from firestore.rules"
    echo "  5. Click Publish"
fi






