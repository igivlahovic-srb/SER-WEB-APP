# 🚀 Automatski Android Build - Quick Reference

## Super Brzo - Kako Radi?

```
Napraviš promenu → Git commit → Čekaš 5-10min → Refresh portal → Novi APK! 🎉
```

**Sve je AUTOMATSKI!** Ne moraš pokretati build ručno.

---

## Šta Kada Napraviš Promenu?

### 1. Napravi Promenu u Vibecode-u
```typescript
// Npr. promeni boju
<Button className="bg-red-600">Novi servis</Button>
```

### 2. Vibecode Automatski Commit-uje
Vibecode automatski uradi `git commit` nakon tvoje promene.

### 3. Git Hook Se Automatski Pokreće
```bash
🚀 Pokretanje automatskog Android build-a u pozadini...
   Build će trajati 5-10 minuta.
```

### 4. Build Radi u Pozadini
- Ne blokira tvoj rad
- Možeš raditi dalje normalno
- Build log: `/tmp/android-build-*.log`

### 5. Otvori Web Portal (nakon 5-10min)
```
http://appserver.lafantanasrb.local:3002
```

### 6. Refresh Stranicu
- Automatski se refresh-uje svaka 30 sekundi
- Ili ručno: `F5`

### 7. Preuzmi Novi APK
Klikni "Preuzmi" dugme → Instaliraj na telefon → Gotovo! 🎉

---

## Status Indikatori

### Kada Je Build U Toku:

Na web portalu vidiš **žuti banner:**

```
┌─────────────────────────────────────┐
│ 🔄 Android Build u toku...          │
│                                     │
│ Build traje 5-10 minuta.            │
│                                     │
│ Stranica se auto-refresh-uje        │
│ svaka 30 sekundi.                   │
└─────────────────────────────────────┘
```

### Kada Je Build Završen:

Žuti banner nestaje i vidiš:

```
┌─────────────────────────────────────┐
│ Istorija build-ova (poslednja 3)    │
│                                     │
│ v2.1.0 🟢 | 11.11.2025 14:30 | [⬇] │
│ v2.0.0    | 10.11.2025 09:15 | [⬇] │
│ v1.9.0    | 05.11.2025 16:45 | [⬇] │
└─────────────────────────────────────┘
```

---

## Komande

### Proveri Da Li Build Radi

```bash
# Proveri proces
ps aux | grep AUTO_BUILD_ANDROID

# Proveri logove
tail -f /tmp/android-build-*.log
```

### Manualni Build (ako želiš)

```bash
cd /root/webadminportal
./BUILD_ANDROID_APK.sh
```

### Disable Auto-Build

```bash
cd /root/webadminportal
rm .git/hooks/post-commit
```

### Enable Auto-Build Ponovo

```bash
cd /root/webadminportal
chmod +x .git/hooks/post-commit
```

---

## Troubleshooting

### Build se ne pokreće automatski?

**Check 1:** Da li hook postoji?
```bash
ls -lh /root/webadminportal/.git/hooks/post-commit
```

**Fix:**
```bash
cd /root/webadminportal
chmod +x .git/hooks/post-commit
chmod +x AUTO_BUILD_ANDROID.sh
```

---

### Ne vidim žuti banner na portalu?

**Check 1:** Da li je web portal build-ovan?
```bash
cd /root/webadminportal/web-admin
npm run build
pm2 restart lafantana-whs-admin
```

**Check 2:** Proveri API
```bash
curl http://localhost:3002/api/mobile-app/build-status | jq
```

---

### Build failed?

**Check logove:**
```bash
tail -100 /tmp/android-build-*.log | grep -i error
```

**Česti problemi:**
- EAS CLI nije instaliran → `npm install -g eas-cli`
- Nemaš login → `eas login`
- Tailwind CSS missing → `cd web-admin && ./FIX_TAILWIND.sh`

---

## Files

| File | Description |
|------|-------------|
| `.git/hooks/post-commit` | Hook koji pokreće build |
| `AUTO_BUILD_ANDROID.sh` | Background build script |
| `/tmp/android-build-*.log` | Build logovi |
| `web-admin/public/apk/*.apk` | APK fajlovi |

---

## Web Portal URL

```
http://appserver.lafantanasrb.local:3002
```

Login → "Mobilna aplikacija" tab

---

## Prednosti

✅ **Zero Manual Work** - Ne pokrećeš ručno build
✅ **Background** - Ne čekaš, radiš dalje
✅ **Real-time Status** - Vidiš progress
✅ **Auto-refresh** - Ne moraš ručno refresh-ovati
✅ **Build History** - Vidiš poslednja 3 build-a
✅ **Clean Logs** - Sve je logovano za debugging

---

## Kompletna Dokumentacija

Za detaljno objašnjenje, vidi:
- `AUTO_BUILD_GUIDE.md` - Kompletan guide
- `ANDROID_BUILD_GUIDE.md` - Manualni build guide
- `QUICK_START_DOWNLOAD_LINKS.md` - Download links troubleshooting

---

**Zaključak:** Samo radi normalno i commit-uj. Build će biti automatski spreman nakon 5-10 minuta! 🚀
