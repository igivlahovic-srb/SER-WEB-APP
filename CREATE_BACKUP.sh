#!/bin/bash
# Complete Backup Script - Creates tar.gz backup of entire project

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION=$(grep -Po '"version": "\K[^"]*' /root/webadminportal/app.json 2>/dev/null || echo "unknown")
BACKUP_NAME="lafantana-whs-backup-v${VERSION}-${TIMESTAMP}"
BACKUP_DIR="/root/webadminportal/web-admin/public/backups"
TEMP_DIR="/tmp/${BACKUP_NAME}"

echo "================================================"
echo "La Fantana WHS - Complete Backup"
echo "================================================"
echo ""
echo "Version: $VERSION"
echo "Timestamp: $TIMESTAMP"
echo "Backup name: $BACKUP_NAME"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DIR"

echo "Step 1/8: Backing up mobile app source code..."
rsync -av --exclude='node_modules' --exclude='.expo' --exclude='.git' \
  /root/webadminportal/ "$TEMP_DIR/mobile-app/" > /dev/null 2>&1
echo "✓ Mobile app backed up"

echo "Step 2/8: Backing up web-admin source code..."
rsync -av --exclude='node_modules' --exclude='.next' \
  /root/webadminportal/web-admin/ "$TEMP_DIR/web-admin/" > /dev/null 2>&1
echo "✓ Web admin backed up"

echo "Step 3/8: Backing up APK files..."
if [ -d "/root/webadminportal/web-admin/public/apk" ]; then
  cp -r /root/webadminportal/web-admin/public/apk "$TEMP_DIR/"
  echo "✓ APK files backed up"
else
  echo "⚠ No APK files found (skipping)"
fi

echo "Step 4/8: Backing up environment files..."
if [ -f "/root/webadminportal/.env" ]; then
  cp /root/webadminportal/.env "$TEMP_DIR/mobile-app/"
fi
if [ -f "/root/webadminportal/web-admin/.env.local" ]; then
  cp /root/webadminportal/web-admin/.env.local "$TEMP_DIR/web-admin/"
fi
echo "✓ Environment files backed up"

echo "Step 5/8: Creating backup info file..."
cat > "$TEMP_DIR/BACKUP_INFO.txt" << EOF
La Fantana WHS - Complete Backup
================================

Backup Date: $(date)
Version: $VERSION
Hostname: $(hostname)
User: $(whoami)

Contents:
- Mobile app source code (React Native + Expo)
- Web admin panel source code (Next.js)
- APK files (if any)
- Environment files (.env, .env.local)
- All configuration files

To Restore:
1. Extract: tar -xzf $BACKUP_NAME.tar.gz
2. Copy mobile-app to /root/webadminportal/
3. Copy web-admin to /root/webadminportal/web-admin/
4. Run: npm install in both directories
5. Rebuild and restart services

For more details, see RESTORE_GUIDE.txt
EOF
echo "✓ Backup info created"

echo "Step 6/8: Creating restore guide..."
cat > "$TEMP_DIR/RESTORE_GUIDE.txt" << 'EOF'
# La Fantana WHS - Restore Guide

## Quick Restore (Ubuntu Server)

```bash
# 1. Extract backup
cd /root
tar -xzf lafantana-whs-backup-vX.X.X-YYYYMMDD-HHMMSS.tar.gz

# 2. Stop services
pm2 stop all

# 3. Backup current installation (just in case)
mv /root/webadminportal /root/webadminportal.old

# 4. Restore mobile app
mkdir -p /root/webadminportal
cp -r lafantana-whs-backup-*/mobile-app/* /root/webadminportal/

# 5. Restore web admin
cp -r lafantana-whs-backup-*/web-admin /root/webadminportal/

# 6. Restore APKs
if [ -d "lafantana-whs-backup-*/apk" ]; then
  mkdir -p /root/webadminportal/web-admin/public/apk
  cp -r lafantana-whs-backup-*/apk/* /root/webadminportal/web-admin/public/apk/
fi

# 7. Install dependencies
cd /root/webadminportal
npm install

cd /root/webadminportal/web-admin
npm install --include=dev
npm run build

# 8. Restart services
pm2 restart all

# 9. Verify
pm2 status
curl http://localhost:3002
```

## Verify Backup Contents

```bash
tar -tzf lafantana-whs-backup-vX.X.X-YYYYMMDD-HHMMSS.tar.gz | head -20
```

## Selective Restore

### Restore only mobile app:
```bash
tar -xzf backup.tar.gz --strip-components=1 */mobile-app/
```

### Restore only web admin:
```bash
tar -xzf backup.tar.gz --strip-components=1 */web-admin/
```

### Restore only APKs:
```bash
tar -xzf backup.tar.gz --strip-components=1 */apk/
```
EOF
echo "✓ Restore guide created"

echo "Step 7/8: Creating tar.gz archive..."
cd /tmp
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME" 2>&1 | grep -v "Removing leading"
mv "${BACKUP_NAME}.tar.gz" "$BACKUP_DIR/"
echo "✓ Archive created"

echo "Step 8/8: Cleaning up and setting permissions..."
rm -rf "$TEMP_DIR"
chmod 644 "$BACKUP_DIR/${BACKUP_NAME}.tar.gz"

# Keep only last 3 backups
cd "$BACKUP_DIR"
BACKUP_COUNT=$(ls -t lafantana-whs-backup-*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 3 ]; then
    echo "Cleaning old backups (keeping latest 3)..."
    ls -t lafantana-whs-backup-*.tar.gz | tail -n +4 | xargs rm -f
    echo "✓ Old backups removed"
fi
echo "✓ Cleanup complete"

BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo "================================================"
echo "✅ BACKUP COMPLETED!"
echo "================================================"
echo ""
echo "Backup file: ${BACKUP_NAME}.tar.gz"
echo "Location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "Size: $BACKUP_SIZE"
echo ""
echo "Download URL:"
echo "http://appserver.lafantanasrb.local:3002/backups/${BACKUP_NAME}.tar.gz"
echo ""
echo "To restore, see RESTORE_GUIDE.txt inside the backup archive."
echo ""
