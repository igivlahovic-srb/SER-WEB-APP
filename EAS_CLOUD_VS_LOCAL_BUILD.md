# EAS Cloud Build vs Local Build - VAŽNO!

## Šta se promenilo?

**STARA VERZIJA (NE RADI):**
```bash
npx eas-cli build --platform android --profile production --local --non-interactive
```

**NOVA VERZIJA (RADI):**
```bash
npx eas-cli build --platform android --profile production --non-interactive
```

## Zašto je promena potrebna?

### Problem sa `--local` flagom:

Kada koristiš `--local` flag, EAS pokušava da build-uje APK **lokalno na tvom serveru**. To znači:

1. ❌ Mora da imaš instaliran Android SDK (~3-5 GB download)
2. ❌ Mora da imaš instaliran Android NDK
3. ❌ Mora da imaš ANDROID_HOME environment variable
4. ❌ Mora da imaš Java JDK 17
5. ❌ Mora da imaš Gradle
6. ❌ Server mora da ima bar 8GB RAM-a
7. ❌ Build traje duže i koristi više resursa

**Greška koju dobijaš:**
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME
environment variable or by setting the sdk.dir path in your project's
local properties file
```

### Rešenje - EAS Cloud Build:

Kada **NE** koristiš `--local` flag, EAS koristi **cloud build servise**. To znači:

1. ✅ Ne trebaš Android SDK na serveru
2. ✅ Ne trebaš Android NDK na serveru
3. ✅ Ne trebaš ANDROID_HOME
4. ✅ Ne trebaš dodatni RAM
5. ✅ Build je brži jer koristi Expo infrastrukturu
6. ✅ Build je consistent - uvek isti environment

## Kako sada radi build proces?

### 1. Pokreneš build:
```bash
./BUILD_ANDROID_APK.sh
```

### 2. Script radi sledeće:
1. ✅ Čita verziju iz `app.json`
2. ✅ Proverava EAS autentifikaciju
3. ✅ Instalira dependencies
4. ✅ **Šalje kod na EAS cloud servere**
5. ✅ EAS build-uje APK u cloud-u (5-10 minuta)
6. ✅ Script **preuzima build-ovani APK** sa EAS servera
7. ✅ Kopira APK u `web-admin/public/apk/`
8. ✅ Postavlja permissions
9. ✅ Briše stare build-ove (čuva samo 3)

### 3. Download APK-a:
```bash
# Script automatski preuzima APK koristeći:
npx eas-cli build:list --platform android --limit 1 --json --non-interactive

# Iz JSON output-a ekstraktuje download URL:
"url": "https://dpq5q9jllj18v.cloudfront.net/artifacts/..."

# Preuzima APK:
curl -L -o lafantana-v2.1.0.apk "https://dpq5q9jllj18v.cloudfront.net/..."
```

## Prednosti Cloud Build-a

### 1. Jednostavnost
- Ne trebaš ništa da instaliraš na server osim Node.js i Bun
- Ne trebaš da konfigurišeš Android SDK
- Ne trebaš da setuješ environment variables

### 2. Konzistentnost
- Build environment je uvek isti
- Nema problema tipa "radi na mom računaru"
- EAS koristi isti environment za sve build-ove

### 3. Performanse
- Cloud serveri su optimizovani za build-ovanje
- Brži build nego na prosečnom serveru
- Ne opterećuje tvoj server

### 4. Resursi
- Ne koristi server RAM/CPU za build
- Server može da se fokusira na web portal i API
- Manje zagađenje disk space-a

## Nedostaci Cloud Build-a

### 1. Internet zavisnost
- Mora da postoji stabilna internet konekcija
- Ako internet padne, build ne može da se završi

### 2. EAS ograničenja
- Free tier ima limit build-ova mesečno
- Može da traje malo duže ako je veliko opterećenje EAS servera

### 3. Upload/Download
- Mora da upload-uje kod na EAS (par minuta)
- Mora da download-uje APK sa EAS (par minuta)

## Česta pitanja

### Q: Da li mogu i dalje da koristim local build?

A: Da, ali moraš da instaliraš Android SDK na server:

```bash
# 1. Instaliraj Android Command Line Tools
cd ~
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip -d android-sdk

# 2. Setup environment
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# 3. Instaliraj build tools
sdkmanager --install "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# 4. Dodaj u bashrc
echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
```

**Ali ovo NE PREPORUČUJEM** jer je komplikovano i nepotrebno.

### Q: Koliko košta EAS cloud build?

A: EAS ima free tier koji uključuje:
- 30 build-ova mesečno za free plan
- Neograničeno za plaćene planove ($29/mesec)

Proveri svoj current usage:
```bash
npx eas-cli account:view
```

### Q: Šta ako mi ponestane free build-ova?

A: Možeš da:
1. Sačekaš sledeći mesec za reset
2. Upgrade-uješ na plaćeni plan
3. Koristi local build (sa Android SDK instalacijom)

### Q: Gde mogu da vidim sve svoje build-ove?

A: Na Expo dashboard-u:
```
https://expo.dev/accounts/igix/projects/la-fantana-whs-servisni-modul/builds
```

Ili preko CLI:
```bash
npx eas-cli build:list --platform android
```

### Q: Kako da build-ujem još brže?

A: Cloud build je već optimizovan, ali možeš:
1. Smanjiti broj dependencies u package.json
2. Koristiti caching (EAS automatski radi ovo)
3. Ne menjaj native dependencies često

## Testing

Testiraj da li build radi:

```bash
cd /root/webadminportal
./BUILD_ANDROID_APK.sh
```

**Očekivani output:**
```
================================================
La Fantana WHS - Android APK Build
================================================

Step 1/6: Reading version from app.json...
✓ Version: 2.1.0

Step 2/6: Checking EAS authentication...
✓ EAS authentication OK

Step 3/6: Installing mobile app dependencies...
✓ Dependencies installed

Step 4/6: Building Android APK with EAS Cloud Build...
This will take 5-10 minutes...
NOTE: Using EAS cloud build (not local). This requires internet connection.

✓ Build completed

Step 5/6: Downloading APK from EAS...
Fetching build details...
Downloading APK from: https://dpq5q9jllj18v.cloudfront.net/...
✓ APK downloaded to: /root/webadminportal/web-admin/public/apk/lafantana-v2.1.0.apk

Step 6/6: Setting permissions and cleaning old builds...
✓ Permissions set

================================================
✅ BUILD COMPLETED!
================================================

APK Location: /root/webadminportal/web-admin/public/apk/lafantana-v2.1.0.apk
Version: 2.1.0
Size: 45M

Download URL:
http://appserver.lafantanasrb.local:3002/apk/lafantana-v2.1.0.apk

Users can now download this APK from the web portal!
```

## Summary

**PREPORUČUJEM: EAS Cloud Build (bez `--local` flag)**

Razlog:
- ✅ Jednostavnije setup
- ✅ Nema potrebe za Android SDK
- ✅ Brži build
- ✅ Manje resursa na serveru
- ✅ Konzistentniji build-ovi

**Build script je ažuriran** da koristi cloud build umesto local build-a!

---

**Datum izmene:** 11.11.2025
**Verzija:** 2.1.0
