#!/bin/bash

echo "🚀 Starting CaseCraft Deployment Sequence..."

# 1. Login to Vercel (Interactive)
echo "🔑 Step 1: Authentication"
echo "You will be prompted to login to Vercel in your browser."
npx vercel login

# 2. Deploy Unified App
echo "--------------------------------------------------"
echo "📦 Step 2: Deploying CaseCraft Unified (Port 5173)"
echo "Path: ./09_APP/casecraft-unified"
cd "/home/cyserman/Projects/Prose_Truth_Repo/09_APP/casecraft-unified"
npx vercel --prod

# 3. Deploy Original Enhanced App
echo "--------------------------------------------------"
echo "💼 Step 3: Deploying CaseCraft Pro Enhanced (Port 3001)"
echo "Path: /home/cyserman/Projects/Staging area/casecraft-pro---truth-repo-edition"
cd "/home/cyserman/Projects/Staging area/casecraft-pro---truth-repo-edition"
npx vercel --prod

echo "--------------------------------------------------"
echo "✅ Deployment Sequence Complete!"
echo "Check your Vercel dashboard for live URLs."
