#!/bin/bash

echo "=========================================="
echo "La Fantana WHS - APK Build Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check and install Java
echo -e "${YELLOW}Step 1: Checking Java installation...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}Java is not installed. Installing OpenJDK 17...${NC}"
    sudo apt-get update
    sudo apt-get install -y openjdk-17-jdk
else
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo -e "${GREEN}Java is already installed: $JAVA_VERSION${NC}"
fi

# Step 2: Check and install Android SDK
echo -e "${YELLOW}Step 2: Checking Android SDK...${NC}"
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}ANDROID_HOME is not set. Installing Android SDK...${NC}"

    # Download Android command line tools
    cd ~
    mkdir -p android-sdk/cmdline-tools
    cd android-sdk/cmdline-tools

    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip commandlinetools-linux-11076708_latest.zip
    mv cmdline-tools latest

    # Set environment variables
    export ANDROID_HOME=~/android-sdk
    export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
    export PATH=$PATH:$ANDROID_HOME/platform-tools

    echo "export ANDROID_HOME=~/android-sdk" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc

    # Accept licenses and install required packages
    yes | sdkmanager --licenses
    sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

    cd /home/user/workspace
else
    echo -e "${GREEN}Android SDK is already installed at: $ANDROID_HOME${NC}"
fi

# Step 3: Prebuild the Expo project
echo -e "${YELLOW}Step 3: Prebuilding Expo project...${NC}"
if [ ! -d "android" ]; then
    echo "Generating Android native code..."
    npx expo prebuild --platform android --clean
else
    echo -e "${GREEN}Android folder already exists${NC}"
fi

# Step 4: Build the APK
echo -e "${YELLOW}Step 4: Building APK...${NC}"
cd android
chmod +x gradlew
./gradlew assembleRelease

# Step 5: Show results
echo ""
echo "=========================================="
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    APK_PATH=$(pwd)/app/build/outputs/apk/release/app-release.apk
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${GREEN}✓ APK successfully built!${NC}"
    echo -e "${GREEN}Location: $APK_PATH${NC}"
    echo -e "${GREEN}Size: $APK_SIZE${NC}"
else
    echo -e "${RED}✗ APK build failed. Check the logs above.${NC}"
    exit 1
fi
echo "=========================================="
