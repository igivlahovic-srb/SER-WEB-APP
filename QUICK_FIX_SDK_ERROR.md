# BRZI FIX: Android Build "SDK location not found" Greška

## Problem
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME
environment variable or by setting the sdk.dir path in your project's
local properties file
```

## Rešenje (3 komande)

Na Ubuntu serveru:

```bash
# 1. Idi u projekat folder
cd /root/webadminportal

# 2. Povuci najnovije izmene
git pull origin main

# 3. Pokreni deployment script
chmod +x DEPLOY_BUILD_FIX.sh
./DEPLOY_BUILD_FIX.sh
```

## Šta je fiksirano?

✅ Build script sada koristi **EAS cloud build** umesto local build-a
✅ Ne trebaš više Android SDK na serveru
✅ Ne trebaš ANDROID_HOME environment variable
✅ APK se automatski preuzima sa EAS nakon build-a

## Testiraj da li radi:

```bash
cd /root/webadminportal
./BUILD_ANDROID_APK.sh
```

**Očekivani output:**
```
Step 4/6: Building Android APK with EAS Cloud Build...
NOTE: Using EAS cloud build (not local). This requires internet connection.
✓ Build completed

Step 5/6: Downloading APK from EAS...
✓ APK downloaded to: /root/webadminportal/web-admin/public/apk/lafantana-v2.1.0.apk
```

## Više informacija:

- `EAS_CLOUD_VS_LOCAL_BUILD.md` - Detaljno objašnjenje cloud vs local build
- `AUTO_BUILD_GUIDE.md` - Kompletan guide za automatski build

---

**Fix primljen:** 11.11.2025
