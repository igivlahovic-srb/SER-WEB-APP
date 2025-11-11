#!/bin/bash
# Android APK Build Script za Ubuntu Server
# Builds APK i upload-uje na web portal

set -e

echo "================================================"
echo "La Fantana WHS - Android APK Build"
echo "================================================"
echo ""

# Configuration
MOBILE_APP_DIR="$HOME/webadminportal"
WEB_ADMIN_DIR="$HOME/webadminportal/web-admin"
APK_OUTPUT_DIR="$WEB_ADMIN_DIR/public/apk"

# Check if directories exist
if [ ! -d "$MOBILE_APP_DIR" ]; then
    echo "❌ Mobile app directory not found: $MOBILE_APP_DIR"
    exit 1
fi

cd "$MOBILE_APP_DIR"

echo "Step 1/6: Reading version from app.json..."
VERSION=$(grep -Po '"version": "\K[^"]*' app.json)
if [ -z "$VERSION" ]; then
    echo "❌ Could not read version from app.json"
    exit 1
fi
echo "✓ Version: $VERSION"
echo ""

echo "Step 2/6: Checking EAS authentication..."
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Check if EAS CLI is authenticated
if ! npx eas-cli whoami &> /dev/null; then
    echo "❌ Not logged in to EAS"
    echo ""
    echo "Please login first:"
    echo "  npx eas-cli login"
    echo ""
    echo "Or if you have credentials, set environment variables:"
    echo "  export EXPO_TOKEN=your_token_here"
    echo ""
    exit 1
fi

echo "✓ EAS authentication OK"
echo ""

echo "Step 3/6: Installing mobile app dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

echo "Step 4/6: Building Android APK with EAS Cloud Build..."
echo "This will take 5-10 minutes..."
echo "NOTE: Using EAS cloud build (not local). This requires internet connection."
echo ""

# Build APK using EAS Build (cloud build, not local)
npx eas-cli build --platform android --profile production --non-interactive

if [ $? -ne 0 ]; then
    echo "❌ EAS Build failed!"
    echo ""
    echo "If this is the first build, you need to:"
    echo "1. Install EAS CLI: npm install -g eas-cli"
    echo "2. Login: eas login"
    echo "3. Configure: eas build:configure"
    exit 1
fi

echo "✓ Build completed"
echo ""

echo "Step 5/6: Downloading APK from EAS..."
mkdir -p "$APK_OUTPUT_DIR"

# Get the download URL from the last build
echo "Fetching build details..."
BUILD_URL=$(npx eas-cli build:list --platform android --limit 1 --json --non-interactive | grep -Po '"url":"https://[^"]*\.apk"' | head -1 | sed 's/"url":"//;s/"//')

if [ -z "$BUILD_URL" ]; then
    echo "❌ Could not get APK download URL from EAS!"
    echo "Try manually downloading from: https://expo.dev/accounts/igix/projects/la-fantana-whs-servisni-modul/builds"
    exit 1
fi

echo "Downloading APK from: $BUILD_URL"
curl -L -o "$APK_OUTPUT_DIR/lafantana-v${VERSION}.apk" "$BUILD_URL"

if [ ! -f "$APK_OUTPUT_DIR/lafantana-v${VERSION}.apk" ]; then
    echo "❌ APK download failed!"
    exit 1
fi

echo "✓ APK downloaded to: $APK_OUTPUT_DIR/lafantana-v${VERSION}.apk"
echo ""

echo "Step 6/6: Setting permissions and cleaning old builds..."
chmod 644 "$APK_OUTPUT_DIR/lafantana-v${VERSION}.apk"
echo "✓ Permissions set"

# Čuvaj samo poslednja 3 build-a
cd "$APK_OUTPUT_DIR"
BUILD_COUNT=$(ls -t lafantana-*.apk 2>/dev/null | wc -l)
if [ "$BUILD_COUNT" -gt 3 ]; then
    echo "Cleaning old builds (keeping latest 3)..."
    ls -t lafantana-*.apk | tail -n +4 | xargs rm -f
    echo "✓ Old builds removed"
fi
echo ""

echo "================================================"
echo "✅ BUILD COMPLETED!"
echo "================================================"
echo ""
echo "APK Location: $APK_OUTPUT_DIR/lafantana-v${VERSION}.apk"
echo "Version: $VERSION"
echo "Size: $(du -h "$APK_OUTPUT_DIR/lafantana-v${VERSION}.apk" | cut -f1)"
echo ""
echo "Download URL:"
echo "http://appserver.lafantanasrb.local:3002/apk/lafantana-v${VERSION}.apk"
echo ""
echo "Users can now download this APK from the web portal!"
echo ""
