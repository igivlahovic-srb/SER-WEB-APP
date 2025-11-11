#!/bin/bash
# Deploy Fixed Android Build Scripts to Ubuntu Server
# This fixes the "SDK location not found" error by using EAS cloud build instead of local build

echo "================================================"
echo "Deploying Fixed Android Build Scripts"
echo "================================================"
echo ""

VIBECODE_DIR="/root/webadminportal"

echo "Step 1/3: Pull latest changes from git..."
cd "$VIBECODE_DIR"
git pull origin main
echo "✓ Git pull completed"
echo ""

echo "Step 2/3: Make build scripts executable..."
chmod +x "$VIBECODE_DIR/BUILD_ANDROID_APK.sh"
chmod +x "$VIBECODE_DIR/AUTO_BUILD_ANDROID.sh"
echo "✓ Build scripts are now executable"
echo ""

echo "Step 3/3: Verify changes..."
echo "Checking BUILD_ANDROID_APK.sh for cloud build..."
if grep -q "EAS Cloud Build" "$VIBECODE_DIR/BUILD_ANDROID_APK.sh"; then
    echo "✓ BUILD_ANDROID_APK.sh is using cloud build (correct!)"
else
    echo "❌ BUILD_ANDROID_APK.sh still using local build (incorrect!)"
    echo "Please manually update the script or pull latest changes."
    exit 1
fi

echo "Checking AUTO_BUILD_ANDROID.sh for cloud build..."
if grep -q "EAS Cloud Build" "$VIBECODE_DIR/AUTO_BUILD_ANDROID.sh"; then
    echo "✓ AUTO_BUILD_ANDROID.sh is using cloud build (correct!)"
else
    echo "❌ AUTO_BUILD_ANDROID.sh still using local build (incorrect!)"
    echo "Please manually update the script or pull latest changes."
    exit 1
fi

echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETED!"
echo "================================================"
echo ""
echo "What was fixed:"
echo "  ✓ BUILD_ANDROID_APK.sh now uses EAS cloud build (no --local flag)"
echo "  ✓ AUTO_BUILD_ANDROID.sh now uses EAS cloud build (no --local flag)"
echo "  ✓ APK is downloaded from EAS after build completes"
echo "  ✓ No longer requires Android SDK on server"
echo ""
echo "You can now test the build with:"
echo "  cd /root/webadminportal"
echo "  ./BUILD_ANDROID_APK.sh"
echo ""
echo "NOTE: EAS cloud build requires internet connection and EAS authentication."
echo "Make sure you are logged in: npx eas-cli whoami"
echo ""
echo "Documentation:"
echo "  - EAS_CLOUD_VS_LOCAL_BUILD.md - Explains cloud build vs local build"
echo "  - AUTO_BUILD_GUIDE.md - Complete guide for automatic builds"
echo ""
