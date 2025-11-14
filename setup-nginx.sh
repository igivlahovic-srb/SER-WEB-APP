#!/bin/bash

echo "=========================================="
echo "La Fantana WHS - Nginx Setup Script"
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
NGINX_CONFIG="/etc/nginx/sites-available/lafantana-whs"
WORKSPACE="/home/user/workspace"

echo -e "${YELLOW}Step 1: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx
    echo -e "${GREEN}✓ Nginx installed${NC}"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Creating directory structure...${NC}"
sudo mkdir -p "$APK_DIR"
sudo mkdir -p "$API_DIR"
sudo mkdir -p "$APP_DIR/web"
echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo -e "${YELLOW}Step 3: Setting up Nginx configuration...${NC}"
sudo cp "$WORKSPACE/nginx/lafantana-whs.conf" "$NGINX_CONFIG"
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/lafantana-whs
echo -e "${GREEN}✓ Nginx config installed${NC}"

echo ""
echo -e "${YELLOW}Step 4: Testing Nginx configuration...${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx config is valid${NC}"
else
    echo -e "${RED}✗ Nginx config has errors. Please fix and try again.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Setting permissions...${NC}"
sudo chown -R www-data:www-data "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"
echo -e "${GREEN}✓ Permissions set${NC}"

echo ""
echo -e "${YELLOW}Step 6: Creating initial API response...${NC}"
cat > /tmp/mobile-app.json << 'EOF'
{
  "success": true,
  "data": {
    "hasApk": false,
    "latestVersion": "2.1.0",
    "downloadUrl": null,
    "message": "No APK uploaded yet. Use deploy-apk.sh to upload your first APK."
  }
}
EOF
sudo mv /tmp/mobile-app.json "$API_DIR/mobile-app.json"
sudo chown www-data:www-data "$API_DIR/mobile-app.json"
echo -e "${GREEN}✓ API endpoint created${NC}"

echo ""
echo -e "${YELLOW}Step 7: Restarting Nginx...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx
echo -e "${GREEN}✓ Nginx restarted and enabled${NC}"

echo ""
echo -e "${YELLOW}Step 8: Checking Nginx status...${NC}"
sudo systemctl status nginx --no-pager | head -10

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Nginx setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Build your APK: ./build-apk.sh"
echo "2. Deploy APK: ./deploy-apk.sh"
echo "3. Test API: curl http://appserver.lafantanasrb.local/api/mobile-app"
echo ""
echo "Directory structure:"
echo "  $APK_DIR          - APK files"
echo "  $API_DIR          - API responses"
echo "  $APP_DIR/web      - Web portal files (optional)"
echo ""
