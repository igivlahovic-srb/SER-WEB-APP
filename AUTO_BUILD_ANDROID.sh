#!/bin/bash
# Automatic Android APK Build Script
# Radi u pozadini i ne blokira git operacije

set -e

LOG_FILE="/tmp/android-build-$(date +%Y%m%d-%H%M%S).log"

echo "================================================" >> "$LOG_FILE" 2>&1
echo "Automatic Android Build Started" >> "$LOG_FILE" 2>&1
echo "Time: $(date)" >> "$LOG_FILE" 2>&1
echo "================================================" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE" 2>&1

# Configuration
MOBILE_APP_DIR="/root/webadminportal"
WEB_ADMIN_DIR="/root/webadminportal/web-admin"
APK_OUTPUT_DIR="$WEB_ADMIN_DIR/public/apk"

cd "$MOBILE_APP_DIR" >> "$LOG_FILE" 2>&1

echo "Step 1/6: Checking EAS authentication..." >> "$LOG_FILE" 2>&1
if ! npx eas-cli whoami >> "$LOG_FILE" 2>&1; then
    echo "❌ Not logged in to EAS. Please run: eas login" >> "$LOG_FILE" 2>&1
    exit 1
fi
echo "✓ EAS authentication OK" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE" 2>&1

echo "Step 2/6: Reading version from app.json..." >> "$LOG_FILE" 2>&1
VERSION=$(grep -Po '"version": "\K[^"]*' app.json)
echo "✓ Version: $VERSION" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE" 2>&1

echo "Step 3/6: Installing mobile app dependencies..." >> "$LOG_FILE" 2>&1
npm install >> "$LOG_FILE" 2>&1
echo "✓ Dependencies installed" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE" 2>&1

echo "Step 4/6: Building Android APK with EAS..." >> "$LOG_FILE" 2>&1
npx eas-cli build --platform android --profile production --local --non-interactive >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ EAS Build failed!" >> "$LOG_FILE" 2>&1
    exit 1
fi
echo "✓ Build completed" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE" 2>&1

echo "Step 5/6: Moving APK to web portal..." >> "$LOG_FILE" 2>&1
mkdir -p "$APK_OUTPUT_DIR" >> "$LOG_FILE" 2>&1

# Find the built APK
APK_FILE=$(find . -name "*.apk" -type f -mmin -30 | head -1)

if [ -z "$APK_FILE" ]; then
    echo "❌ APK file not found after build!" >> "$LOG_FILE" 2>&1
    exit 1
fi

# Copy APK with version name
cp "$APK_FILE" "$APK_OUTPUT_DIR/lafantana-v${VERSION}.apk" >> "$LOG_FILE" 2>&1
echo "✓ APK copied to: $APK_OUTPUT_DIR/lafantana-v${VERSION}.apk" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE" 2>&1

echo "Step 6/6: Setting permissions and cleaning old builds..." >> "$LOG_FILE" 2>&1
chmod 644 "$APK_OUTPUT_DIR/lafantana-v${VERSION}.apk" >> "$LOG_FILE" 2>&1
echo "✓ Permissions set" >> "$LOG_FILE" 2>&1

# Keep only last 3 builds
cd "$APK_OUTPUT_DIR" >> "$LOG_FILE" 2>&1
BUILD_COUNT=$(ls -t lafantana-*.apk 2>/dev/null | wc -l)
if [ "$BUILD_COUNT" -gt 3 ]; then
    echo "Cleaning old builds (keeping latest 3)..." >> "$LOG_FILE" 2>&1
    ls -t lafantana-*.apk | tail -n +4 | xargs rm -f >> "$LOG_FILE" 2>&1
    echo "✓ Old builds removed" >> "$LOG_FILE" 2>&1
fi
echo "" >> "$LOG_FILE" 2>&1

echo "================================================" >> "$LOG_FILE" 2>&1
echo "✅ AUTOMATIC BUILD COMPLETED!" >> "$LOG_FILE" 2>&1
echo "================================================" >> "$LOG_FILE" 2>&1
echo "APK Location: $APK_OUTPUT_DIR/lafantana-v${VERSION}.apk" >> "$LOG_FILE" 2>&1
echo "Version: $VERSION" >> "$LOG_FILE" 2>&1
echo "Download URL: http://appserver.lafantanasrb.local:3002/apk/lafantana-v${VERSION}.apk" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE" 2>&1

# Create success marker file
echo "$VERSION" > "$APK_OUTPUT_DIR/.latest-build-version"
echo "$(date)" > "$APK_OUTPUT_DIR/.latest-build-date"

echo "Build log saved to: $LOG_FILE" >> "$LOG_FILE" 2>&1
