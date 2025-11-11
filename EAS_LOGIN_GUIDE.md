# EAS Login Problem - Rešenje

## Problem

Kada pokreneš `./BUILD_ANDROID_APK.sh`, traži EAS login svaki put:

```
Log in to EAS with email or username
✔ Email or username … itserbia@lafantana.rs
✔ Password …
"password": String must contain at least 1 character(s).
Error: account:login command failed.
```

## Uzrok

1. **Password field je prazan** - mora se uneti lozinka
2. **Nije sačuvan login** - EAS CLI traži kredencijale svaki put

## Rešenje

### Opcija 1: Login Jednom (Preporučeno)

Na Ubuntu serveru:

```bash
# 1. Login sa EAS CLI (jednom)
npx eas-cli login

# Unesi:
# Email: itserbia@lafantana.rs
# Password: [tvoja lozinka]

# 2. Proveri da li si ulogovan
npx eas-cli whoami

# Trebalo bi da vidiš:
# itserbia@lafantana.rs
```

**Rezultat:** Login je sačuvan u `~/.expo` folderu. Neće tražiti login ponovo!

---

### Opcija 2: Access Token (Za Automation)

Ako želiš da automatizuješ build bez manuelnog login-a:

```bash
# 1. Generiši access token na Expo web sajtu
# https://expo.dev/accounts/[your-account]/settings/access-tokens

# 2. Postavi environment variable
export EXPO_TOKEN="your_token_here"

# 3. Dodaj u ~/.bashrc za trajnost
echo 'export EXPO_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc

# 4. Proveri
echo $EXPO_TOKEN
```

**Rezultat:** EAS Build će koristiti token umesto da traži login.

---

## Kako Build Script Radi Sada

### Provera Pre Build-a (Step 2/6):

```bash
# Check if EAS CLI is authenticated
if ! npx eas-cli whoami &> /dev/null; then
    echo "❌ Not logged in to EAS"
    echo ""
    echo "Please login first:"
    echo "  npx eas-cli login"
    exit 1
fi

echo "✓ EAS authentication OK"
```

**Rezultat:** Script će proveriti da li si ulogovan PRE nego što počne build. Ako nisi, izaći će sa jasnom porukom.

---

## Korak-Po-Korak: Prvi Build

### Na Ubuntu Serveru:

```bash
# 1. Instaliraj EAS CLI globalno
npm install -g eas-cli

# 2. Login
eas login
# Unesi: itserbia@lafantana.rs
# Password: [tvoja lozinka]

# 3. Proveri login
eas whoami
# Output: itserbia@lafantana.rs  ✅

# 4. Konfiguriši projekat (prvi put)
cd /root/webadminportal
eas build:configure

# Odgovori:
# - Platform: Android
# - Build type: APK

# 5. Pokreni build
./BUILD_ANDROID_APK.sh

# ✅ Build će raditi bez traženja login-a!
```

---

## Troubleshooting

### Problem 1: "String must contain at least 1 character(s)"

**Uzrok:** Password field je prazan.

**Rešenje:** Unesi lozinku kada te pita.

---

### Problem 2: "account:login command failed"

**Uzrok:** Pogrešna lozinka ili email.

**Rešenje:**
1. Proveri email: `itserbia@lafantana.rs`
2. Proveri lozinku
3. Pokušaj ponovo: `eas login`

---

### Problem 3: Login ne ostaje sačuvan

**Uzrok:** Možda nemaš write permissions na `~/.expo` folder.

**Rešenje:**
```bash
# Proveri permissions
ls -la ~/.expo

# Fix permissions
chmod 700 ~/.expo
chmod 600 ~/.expo/*

# Login ponovo
eas login
```

---

### Problem 4: Build traži login svaki put

**Provera:**
```bash
# Da li si ulogovan?
eas whoami

# Ako kaže "not logged in":
eas login
```

**Alternativa:** Koristi `EXPO_TOKEN` environment variable (Opcija 2 gore).

---

## Files Changed

### `/home/user/workspace/BUILD_ANDROID_APK.sh`

**Dodato (linija 34-54):**
```bash
echo "Step 2/6: Checking EAS authentication..."

# Check if EAS CLI is authenticated
if ! npx eas-cli whoami &> /dev/null; then
    echo "❌ Not logged in to EAS"
    echo ""
    echo "Please login first:"
    echo "  npx eas-cli login"
    echo ""
    exit 1
fi

echo "✓ EAS authentication OK"
```

**Rezultat:** Script sada proverava login PRE build-a i daje jasnu grešku ako nisi ulogovan.

---

## Quick Commands

```bash
# Login
eas login

# Check login status
eas whoami

# Logout (ako želiš)
eas logout

# Build (nakon login-a)
cd /root/webadminportal
./BUILD_ANDROID_APK.sh
```

---

## Zaključak

**Login se mora uraditi JEDNOM** na Ubuntu serveru:

```bash
eas login
# Email: itserbia@lafantana.rs
# Password: [your password]
```

Nakon toga, `BUILD_ANDROID_APK.sh` će raditi automatski bez traženja login-a! 🎉

---

**Status:** ✅ Build script ažuriran sa login check-om
**Action Required:** Moraš se login-ovati jednom: `eas login`
