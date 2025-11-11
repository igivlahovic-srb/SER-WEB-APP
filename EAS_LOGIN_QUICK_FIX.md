# 🚀 Quick Fix: EAS Login Error

## Problem

```
./BUILD_ANDROID_APK.sh

Log in to EAS with email or username
✔ Email or username … itserbia@lafantana.rs
✔ Password …
"password": String must contain at least 1 character(s).
Error: account:login command failed.
```

---

## Rešenje (2 komande)

Na Ubuntu serveru:

```bash
# 1. Login JEDNOM
npx eas-cli login

# Unesi:
# Email: itserbia@lafantana.rs
# Password: [tvoja lozinka - NE OSTAVLJAJ PRAZNO!]

# 2. Proveri
npx eas-cli whoami
# Output: itserbia@lafantana.rs  ✅
```

**To je sve!** Login je sačuvan. Build će raditi bez traženja login-a.

---

## Sada Pokreni Build

```bash
cd /root/webadminportal
./BUILD_ANDROID_APK.sh
```

**Build će raditi automatski!** Neće tražiti login ponovo.

---

## Šta Je Ispravljeno

### 1. BUILD_ANDROID_APK.sh

Dodato (Step 2/6):
```bash
# Check if EAS CLI is authenticated
if ! npx eas-cli whoami &> /dev/null; then
    echo "❌ Not logged in to EAS"
    echo "Please login first: eas login"
    exit 1
fi
```

**Rezultat:** Script proverava login PRE build-a i daje jasnu grešku ako nisi ulogovan.

### 2. AUTO_BUILD_ANDROID.sh

Dodato (Step 1/6):
```bash
# Check if EAS CLI is authenticated
if ! npx eas-cli whoami >> "$LOG_FILE" 2>&1; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi
```

**Rezultat:** Automatski build takođe proverava login.

---

## Commands

```bash
# Login (jednom)
npx eas-cli login

# Check status
npx eas-cli whoami

# Build (nakon login-a)
./BUILD_ANDROID_APK.sh
```

---

## Troubleshooting

### "String must contain at least 1 character(s)"

**Uzrok:** Nije unet password.

**Fix:** Unesi lozinku kada te pita!

### Login ne ostaje sačuvan

**Fix:**
```bash
# Proveri permissions na ~/.expo
ls -la ~/.expo

# Fix ako treba
chmod 700 ~/.expo
chmod 600 ~/.expo/*

# Login ponovo
eas login
```

---

**Zaključak:** Login se radi JEDNOM, onda build radi automatski! 🎉

**Created:** EAS_LOGIN_GUIDE.md (detaljan guide)
