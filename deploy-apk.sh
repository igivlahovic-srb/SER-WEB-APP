#!/bin/bash

echo "=========================================="
echo "La Fantana WHS - APK Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="/var/www/lafantana-whs"
APK_DIR="$APP_DIR/apk"
API_DIR="$APP_DIR/api"
WORKSPACE="/home/user/workspace"

# Get version from app.json
VERSION=$(grep -oP '"version":\s*"\K[^"]+' "$WORKSPACE/app.json")
if [ -z "$VERSION" ]; then
    echo -e "${RED}✗ Could not read version from app.json${NC}"
    exit 1
fi

APK_SOURCE="$WORKSPACE/android/app/build/outputs/apk/release/app-release.apk"
APK_FILENAME="lafantana-whs-v${VERSION}.apk"
APK_DEST="$APK_DIR/$APK_FILENAME"

echo -e "${YELLOW}Deploying version: $VERSION${NC}"
echo ""

# Check if APK exists
if [ ! -f "$APK_SOURCE" ]; then
    echo -e "${RED}✗ APK not found at: $APK_SOURCE${NC}"
    echo ""
    echo "Please build the APK first:"
    echo "  ./build-apk.sh"
    exit 1
fi

APK_SIZE=$(du -h "$APK_SOURCE" | cut -f1)
echo -e "${GREEN}✓ APK found ($APK_SIZE)${NC}"

echo ""
echo -e "${YELLOW}Step 1: Copying APK to nginx directory...${NC}"
sudo cp "$APK_SOURCE" "$APK_DEST"
sudo chown www-data:www-data "$APK_DEST"
sudo chmod 644 "$APK_DEST"

# Create symlink to latest
sudo ln -sf "$APK_FILENAME" "$APK_DIR/latest.apk"

echo -e "${GREEN}✓ APK deployed to: $APK_DEST${NC}"

echo ""
echo -e "${YELLOW}Step 2: Updating API endpoint...${NC}"

# Update API response
cat > /tmp/mobile-app.json << EOF
{
  "success": true,
  "data": {
    "hasApk": true,
    "latestVersion": "$VERSION",
    "downloadUrl": "http://appserver.lafantanasrb.local/download/$APK_FILENAME",
    "directDownloadUrl": "http://appserver.lafantanasrb.local/download/latest.apk",
    "fileSize": "$APK_SIZE",
    "releaseDate": "$(date -Iseconds)",
    "message": "Nova verzija dostupna za preuzimanje"
  }
}
EOF

sudo mv /tmp/mobile-app.json "$API_DIR/mobile-app.json"
sudo chown www-data:www-data "$API_DIR/mobile-app.json"
sudo chmod 644 "$API_DIR/mobile-app.json"

echo -e "${GREEN}✓ API updated${NC}"

echo ""
echo -e "${YELLOW}Step 3: Cleaning old APK versions (keeping last 5)...${NC}"
cd "$APK_DIR"
ls -t lafantana-whs-v*.apk 2>/dev/null | tail -n +6 | xargs -r sudo rm
echo -e "${GREEN}✓ Old versions cleaned${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo "=========================================="
echo ""
echo "APK Info:"
echo "  Version: $VERSION"
echo "  Size: $APK_SIZE"
echo "  File: $APK_FILENAME"
echo ""
echo "Download URLs:"
echo "  Direct: http://appserver.lafantanasrb.local/download/latest.apk"
echo "  Versioned: http://appserver.lafantanasrb.local/download/$APK_FILENAME"
echo ""
echo "Test API:"
echo "  curl http://appserver.lafantanasrb.local/api/mobile-app"
echo ""
echo "Available versions in $APK_DIR:"
ls -lh "$APK_DIR"/*.apk 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
