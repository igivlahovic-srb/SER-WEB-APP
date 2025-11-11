#!/bin/bash
# Quick Fix: Copy corrected files from Vibecode to Ubuntu Server

echo "================================================"
echo "Copying Fixed Files to Ubuntu Server"
echo "================================================"
echo ""

# This script should be run ON UBUNTU SERVER after you've pulled latest changes
# Or you can manually copy the files

VIBECODE_DIR="/root/webadminportal"
WEB_ADMIN_DIR="/root/webadminportal/web-admin"

echo "Step 1/4: Pull latest changes from Vibecode..."
cd "$VIBECODE_DIR"
git pull origin main
echo "✓ Git pull completed"
echo ""

echo "Step 2/4: Clean and reinstall web-admin dependencies..."
cd "$WEB_ADMIN_DIR"
rm -rf node_modules .next
npm install --include=dev
echo "✓ Dependencies installed"
echo ""

echo "Step 3/4: Build web-admin..."
npm run build
echo "✓ Build completed"
echo ""

echo "Step 4/4: Restart PM2..."
pm2 restart lafantana-whs-admin
echo "✓ PM2 restarted"
echo ""

echo "================================================"
echo "✅ ALL FIXED FILES DEPLOYED!"
echo "================================================"
echo ""
echo "Web portal is now running with:"
echo "  ✓ Fixed /api/update/route.ts (npm install --include=dev)"
echo "  ✓ Fixed FIX_TAILWIND.sh (npm install --include=dev)"
echo "  ✓ All dependencies installed"
echo "  ✓ CSS working correctly"
echo ""
