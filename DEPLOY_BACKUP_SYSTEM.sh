#!/bin/bash
# Deploy Backup System to Ubuntu Server
# This script deploys the complete backup system to the production server

echo "================================================"
echo "Deploying Backup System to Ubuntu Server"
echo "================================================"
echo ""

VIBECODE_DIR="/root/webadminportal"
WEB_ADMIN_DIR="/root/webadminportal/web-admin"

echo "Step 1/6: Pull latest changes from git..."
cd "$VIBECODE_DIR"
git pull origin main
echo "✓ Git pull completed"
echo ""

echo "Step 2/6: Make backup script executable..."
chmod +x "$VIBECODE_DIR/CREATE_BACKUP.sh"
echo "✓ Backup script is now executable"
echo ""

echo "Step 3/6: Create backups directory..."
mkdir -p "$WEB_ADMIN_DIR/public/backups"
chmod 755 "$WEB_ADMIN_DIR/public/backups"
echo "✓ Backups directory created"
echo ""

echo "Step 4/6: Clean and reinstall web-admin dependencies..."
cd "$WEB_ADMIN_DIR"
rm -rf node_modules .next
npm install --include=dev
echo "✓ Dependencies installed"
echo ""

echo "Step 5/6: Build web-admin..."
npm run build
echo "✓ Build completed"
echo ""

echo "Step 6/6: Restart PM2..."
pm2 restart lafantana-whs-admin
echo "✓ PM2 restarted"
echo ""

echo "================================================"
echo "✅ BACKUP SYSTEM DEPLOYED!"
echo "================================================"
echo ""
echo "Web portal is now running with:"
echo "  ✓ CREATE_BACKUP.sh script in /root/webadminportal/"
echo "  ✓ /api/backup API endpoint"
echo "  ✓ /backup page in web portal (new tab)"
echo "  ✓ Backups directory in /root/webadminportal/web-admin/public/backups/"
echo ""
echo "Test the backup system:"
echo "  1. Open web portal: http://appserver.lafantanasrb.local:3002"
echo "  2. Login as super_user"
echo "  3. Click on 'Backup' tab"
echo "  4. Click 'Kreiraj Backup' button"
echo "  5. Wait 1-2 minutes and refresh page"
echo "  6. Download backup from list"
echo ""
echo "Manual backup from command line:"
echo "  cd /root/webadminportal && ./CREATE_BACKUP.sh"
echo ""
