#!/bin/bash

echo "=========================================="
echo "La Fantana WHS - Complete Build & Deploy"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WORKSPACE="/home/user/workspace"
cd "$WORKSPACE"

echo -e "${BLUE}This script will:${NC}"
echo "  1. Generate Android native code"
echo "  2. Build release APK"
echo "  3. Deploy to Nginx server"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Generating Android native code...${NC}"
if [ ! -d "android" ]; then
    npx expo prebuild --platform android --clean
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Prebuild failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Android folder exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Building APK (this may take 5-10 minutes)...${NC}"
cd android
chmod +x gradlew
./gradlew clean assembleRelease

if [ ! -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo -e "${RED}✗ APK build failed${NC}"
    exit 1
fi

APK_PATH=$(pwd)/app/build/outputs/apk/release/app-release.apk
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo -e "${GREEN}✓ APK built successfully ($APK_SIZE)${NC}"

cd "$WORKSPACE"

echo ""
echo -e "${YELLOW}Step 3: Deploying to Nginx...${NC}"
./deploy-apk.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Complete! Your APK is live!${NC}"
echo "=========================================="
