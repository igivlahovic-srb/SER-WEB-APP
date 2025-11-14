#!/bin/bash

echo "=========================================="
echo "La Fantana WHS - Quick APK Build"
echo "=========================================="
echo ""

# Check if android folder exists
if [ ! -d "android" ]; then
    echo "Generating Android native code..."
    npx expo prebuild --platform android --clean
fi

# Build the APK
echo "Building APK..."
cd android
chmod +x gradlew
./gradlew assembleRelease

# Show results
echo ""
echo "=========================================="
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    APK_PATH=$(pwd)/app/build/outputs/apk/release/app-release.apk
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "✓ APK successfully built!"
    echo "Location: $APK_PATH"
    echo "Size: $APK_SIZE"

    # Copy to workspace root for easy access
    cp "$APK_PATH" /home/user/workspace/lafantana-whs.apk
    echo "Copied to: /home/user/workspace/lafantana-whs.apk"
else
    echo "✗ APK build failed. Check the logs above."
    exit 1
fi
echo "=========================================="
