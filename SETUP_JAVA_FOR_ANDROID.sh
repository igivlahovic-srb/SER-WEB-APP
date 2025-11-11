#!/bin/bash
# Setup Java JDK for EAS Android Build

echo "================================================"
echo "Installing Java JDK for Android Build"
echo "================================================"
echo ""

echo "Step 1/5: Updating package list..."
sudo apt update
echo "✓ Package list updated"
echo ""

echo "Step 2/5: Installing OpenJDK 17..."
sudo apt install -y openjdk-17-jdk
echo "✓ OpenJDK 17 installed"
echo ""

echo "Step 3/5: Setting JAVA_HOME..."
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
echo "✓ JAVA_HOME set for current session"
echo ""

echo "Step 4/5: Adding JAVA_HOME to ~/.bashrc..."
if ! grep -q "JAVA_HOME" ~/.bashrc; then
    echo '' >> ~/.bashrc
    echo '# Java JDK for Android Build' >> ~/.bashrc
    echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
    echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
    echo "✓ Added to ~/.bashrc"
else
    echo "✓ Already in ~/.bashrc"
fi
echo ""

echo "Step 5/5: Verifying installation..."
java -version
echo ""
echo "JAVA_HOME: $JAVA_HOME"
echo ""

echo "================================================"
echo "✅ JAVA SETUP COMPLETED!"
echo "================================================"
echo ""
echo "Java JDK is now installed and configured."
echo "You can now run Android builds:"
echo "  cd /root/webadminportal"
echo "  ./BUILD_ANDROID_APK.sh"
echo ""
