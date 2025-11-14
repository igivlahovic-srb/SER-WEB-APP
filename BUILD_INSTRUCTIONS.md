# Build APK Instructions for La Fantana WHS

## Method 1: Full Setup (First Time)

If you don't have Java and Android SDK installed on your Ubuntu server, use this:

```bash
./build-apk.sh
```

This script will:
- Install OpenJDK 17
- Install Android SDK
- Generate Android native code
- Build the release APK

## Method 2: Quick Build (If Java/SDK Already Installed)

If you already have Java and Android SDK, use this:

```bash
./quick-build.sh
```

This script will:
- Generate Android native code (if needed)
- Build the release APK

## Manual Steps (If Scripts Don't Work)

### 1. Install Java
```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk
java -version  # Verify installation
```

### 2. Install Android SDK
```bash
cd ~
mkdir -p android-sdk/cmdline-tools
cd android-sdk/cmdline-tools

# Download Android command line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools latest

# Set environment variables
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Add to ~/.bashrc for persistence
echo "export ANDROID_HOME=~/android-sdk" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc

# Install required packages
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 3. Build APK
```bash
cd /home/user/workspace

# Generate Android native code
npx expo prebuild --platform android --clean

# Build APK
cd android
chmod +x gradlew
./gradlew assembleRelease
```

### 4. Find Your APK
The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

Or if you used `quick-build.sh`, it will be copied to:
```
/home/user/workspace/lafantana-whs.apk
```

## Troubleshooting

### If you get "Java not found"
Make sure Java 17 is installed and in your PATH

### If you get "ANDROID_HOME not set"
Run the environment variable exports from step 2 above

### If gradle fails
Try cleaning the build:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### To rebuild from scratch
```bash
rm -rf android
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

## App Info
- **App Name**: La Fantana WHS servisni modul
- **Package**: com.lafantana.whs
- **Version**: 2.1.0
