# La Fantana WHS - Nginx Deployment Guide

## 🚀 Quick Start

### 1. Setup Nginx (One Time Only)
```bash
./setup-nginx.sh
```

This will:
- Install Nginx
- Create directory structure at `/var/www/lafantana-whs/`
- Configure nginx with APK hosting and API endpoint
- Start Nginx service

### 2. Build & Deploy APK
```bash
./build-and-deploy.sh
```

This will:
- Generate Android native code
- Build release APK
- Deploy to Nginx
- Update API endpoint

---

## 📁 Project Structure

```
Ubuntu Server (appserver.lafantanasrb.local)
│
├── /home/user/workspace/              ← Your code
│   ├── src/                          ← React Native app
│   ├── android/                      ← Generated (after build)
│   ├── build-apk.sh                  ← Build only
│   ├── deploy-apk.sh                 ← Deploy only
│   ├── build-and-deploy.sh           ← Build + Deploy
│   └── setup-nginx.sh                ← Setup server
│
└── /var/www/lafantana-whs/           ← Nginx serves from here
    ├── apk/
    │   ├── lafantana-whs-v2.1.0.apk
    │   └── latest.apk → (symlink)
    └── api/
        └── mobile-app.json           ← Version info API
```

---

## 🔧 Individual Scripts

### Setup Nginx (One Time)
```bash
./setup-nginx.sh
```

### Build APK Only
```bash
./build-apk.sh
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### Deploy APK Only (After Building)
```bash
./deploy-apk.sh
```

### Build + Deploy (Recommended)
```bash
./build-and-deploy.sh
```

---

## 🌐 Nginx Endpoints

### Download Latest APK
```
http://appserver.lafantanasrb.local/download/latest.apk
```

### Download Specific Version
```
http://appserver.lafantanasrb.local/download/lafantana-whs-v2.1.0.apk
```

### Check Version API
```bash
curl http://appserver.lafantanasrb.local/api/mobile-app
```

Response:
```json
{
  "success": true,
  "data": {
    "hasApk": true,
    "latestVersion": "2.1.0",
    "downloadUrl": "http://appserver.lafantanasrb.local/download/lafantana-whs-v2.1.0.apk",
    "directDownloadUrl": "http://appserver.lafantanasrb.local/download/latest.apk",
    "fileSize": "45M",
    "releaseDate": "2025-11-14T12:30:00+00:00"
  }
}
```

---

## 📱 Auto-Update Feature

### How It Works

1. **On App Launch**: App checks `http://appserver.lafantanasrb.local/api/mobile-app`
2. **Version Compare**: Compares installed version with `latestVersion` from API
3. **Update Dialog**: If newer version available, shows dialog to user
4. **Download**: Opens browser to download URL

### Configure Auto-Update

Located in: `src/services/auto-update.ts`

```typescript
const WEB_PORTAL_URL = 'http://appserver.lafantanasrb.local';
```

### Disable Auto-Update

Edit `App.tsx` and remove:
```typescript
useEffect(() => {
  checkForUpdatesOnStart();
}, []);
```

---

## 🔐 Security (Optional)

### Add HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d appserver.lafantanasrb.local

# Auto-renewal
sudo certbot renew --dry-run
```

Then uncomment HTTPS section in `nginx/lafantana-whs.conf`

---

## 🛠️ Troubleshooting

### Nginx not starting
```bash
# Check nginx status
sudo systemctl status nginx

# Check config
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/error.log
```

### APK not downloading
```bash
# Check file permissions
ls -la /var/www/lafantana-whs/apk/

# Should be: -rw-r--r-- www-data www-data
```

### API not responding
```bash
# Test locally on server
curl http://localhost/api/mobile-app

# Check nginx config
cat /etc/nginx/sites-enabled/lafantana-whs
```

### Build failed
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### Rebuild from scratch
```bash
rm -rf android
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

---

## 📝 Workflow

### Initial Setup (First Time)
```bash
# 1. Setup nginx
./setup-nginx.sh

# 2. Build and deploy first APK
./build-and-deploy.sh
```

### Regular Updates (After Code Changes)
```bash
# 1. Make code changes in src/

# 2. Update version in app.json
vim app.json  # Change "version": "2.2.0"

# 3. Build and deploy
./build-and-deploy.sh
```

### Users Get Updates
1. User opens app
2. App checks for updates automatically
3. Dialog shows: "Nova verzija 2.2.0 dostupna!"
4. User taps "Preuzmi"
5. Browser opens download link
6. User installs new APK

---

## 📊 Version Management

Nginx keeps last 5 versions automatically. Old versions are deleted on each deployment.

```bash
# View all versions
ls -lh /var/www/lafantana-whs/apk/

# Manually delete old versions
sudo rm /var/www/lafantana-whs/apk/lafantana-whs-v2.0.0.apk
```

---

## 🎯 Production Checklist

- [ ] Nginx installed and running
- [ ] DNS/hosts file points to server
- [ ] APK builds successfully
- [ ] API endpoint responding
- [ ] Download works from mobile device
- [ ] Auto-update detects new versions
- [ ] SSL certificate (optional but recommended)

---

## 📞 Support

- Nginx logs: `/var/log/nginx/lafantana-whs-*.log`
- App version: Check `app.json` → `version`
- Build output: `android/app/build/outputs/apk/release/`

---

## App Info

- **Name**: La Fantana WHS servisni modul
- **Package**: com.lafantana.whs
- **Current Version**: 2.1.0
- **Server**: appserver.lafantanasrb.local
- **Platform**: Ubuntu Server + Nginx
