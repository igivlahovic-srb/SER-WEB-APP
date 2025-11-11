# 🚀 Automatski Android Build - Kompletan Guide

## Šta Smo Implementirali

Sada kada napraviš promenu na mobilnoj aplikaciji u Vibecode-u i commit-uješ, sistem **AUTOMATSKI**:

1. ✅ Pokreće Android APK build u pozadini
2. ✅ Upload-uje APK na web portal
3. ✅ Prikazuje status build-a na web portalu
4. ✅ Auto-refresh-uje stranicu svaka 30 sekundi
5. ✅ Čuva poslednja 3 build-a

**Ti samo:**
1. Napraviš promenu na mobilnoj app
2. Commit-uješ
3. Refresh-uješ web portal nakon 5-10 minuta
4. **Vidiš novi APK! 🎉**

---

## Kako Radi

### 1. Git Post-Commit Hook

Lokacija: `/root/webadminportal/.git/hooks/post-commit`

**Šta radi:**
- Pokreće se automatski nakon svakog `git commit`
- Pokreće `AUTO_BUILD_ANDROID.sh` script u pozadini (nohup)
- Ne blokira git operacije - radi u background-u

```bash
#!/bin/bash
# Git Post-Commit Hook
# Automatski pokreće Android build nakon commit-a

echo "🚀 Pokretanje automatskog Android build-a u pozadini..."
echo "   Build će trajati 5-10 minuta."

nohup /root/webadminportal/AUTO_BUILD_ANDROID.sh >/dev/null 2>&1 &

echo "   Kada build završi, refresh-ujte web portal stranicu!"
echo "   URL: http://appserver.lafantanasrb.local:3002"
```

### 2. Auto Build Script

Lokacija: `/root/webadminportal/AUTO_BUILD_ANDROID.sh`

**Šta radi:**
1. Čita verziju iz `app.json`
2. Instalira dependencies
3. Build-uje Android APK sa EAS Build (5-10 minuta)
4. Kopira APK u `web-admin/public/apk/`
5. Postavlja permissions
6. Čuva samo poslednja 3 build-a
7. Kreira marker fajlove (.latest-build-version, .latest-build-date)
8. Loguje sve u `/tmp/android-build-YYYYMMDD-HHMMSS.log`

### 3. Build Status API

Lokacija: `/root/webadminportal/web-admin/app/api/mobile-app/build-status/route.ts`

**Šta radi:**
- Proverava da li postoje nedavni build log fajlovi (< 15 minuta)
- Ako postoje, znači da je build u toku
- Vraća `buildInProgress: true/false`

**Endpoint:**
```
GET /api/mobile-app/build-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "latestBuildVersion": "2.1.0",
    "latestBuildDate": "2025-11-11T14:30:00",
    "buildInProgress": true
  }
}
```

### 4. Web Portal UI

Lokacija: `/root/webadminportal/web-admin/app/mobile-app/page.tsx`

**Šta radi:**
- Proverava build status pri učitavanju stranice
- Ako je build u toku, prikazuje žuti banner sa spinner-om
- Auto-refresh-uje stranicu svaka 30 sekundi dok je build u toku
- Prikazuje listu poslednja 3 build-a u tabeli

**Banner kada je build u toku:**
```
┌─────────────────────────────────────────────────┐
│ 🔄 Android Build u toku...                      │
│                                                 │
│ Automatski build proces je pokrenut.            │
│ Build traje 5-10 minuta.                        │
│                                                 │
│ Šta se dešava:                                  │
│ • Instaliranje dependencies...                 │
│ • Build-ovanje Android APK sa EAS Build...     │
│ • Upload na web portal...                       │
│                                                 │
│ ⏱️ Stranica se automatski refresh-uje svaka    │
│   30 sekundi.                                   │
└─────────────────────────────────────────────────┘
```

---

## Workflow - Korak Po Korak

### Scenario: Promeniš mobilnu aplikaciju

1. **Napraviš promenu u Vibecode-u:**
   ```typescript
   // Npr. promeniš boju dugmeta u DashboardScreen.tsx
   <Button className="bg-red-600">Novi servis</Button>
   ```

2. **Vibecode automatski commit-uje:**
   ```bash
   git add .
   git commit -m "Changed button color to red"
   ```

3. **Git hook se pokreće (automatski):**
   ```
   🚀 Pokretanje automatskog Android build-a u pozadini...
      Build će trajati 5-10 minuta.
      Build proces ID: 12345
      Logovi: /tmp/android-build-20251111-143000.log
   ```

4. **Build radi u pozadini (5-10 minuta):**
   - Ne blokira tvoj rad
   - Možeš nastaviti da radiš druge stvari
   - Build se loguje u /tmp/

5. **Otvoris web portal:**
   ```
   http://appserver.lafantanasrb.local:3002
   ```
   Login → "Mobilna aplikacija" tab

6. **Vidiš žuti banner:**
   ```
   🔄 Android Build u toku...
   Stranica će se automatski refresh-ovati svaka 30 sekundi.
   ```

7. **Čekaš 5-10 minuta (ili radiš nešto drugo)**

8. **Refresh-uješ stranicu (ili čekaš auto-refresh):**
   - Žuti banner nestaje
   - Tabela prikazuje novi build:
     ```
     v2.1.0 | 11.11.2025 14:30 | 52 MB | [Preuzmi]
     ```

9. **Download-uješ APK:**
   - Klikneš "Preuzmi" dugme
   - Instaliraš na telefon
   - **Vidiš crveno dugme! 🎉**

---

## Testiranje

### Test 1: Manualno Pokretanje Build-a

```bash
cd /root/webadminportal
./AUTO_BUILD_ANDROID.sh
```

Proveri log:
```bash
tail -f /tmp/android-build-*.log
```

### Test 2: Git Commit Test

```bash
cd /root/webadminportal

# Napravi malu promenu
echo "// Test comment" >> App.tsx

# Commit
git add .
git commit -m "Test automatic build"

# Proveri da li je build pokrenut
ps aux | grep AUTO_BUILD_ANDROID
```

Trebalo bi da vidiš proces koji radi.

### Test 3: Web Portal Status Check

Otvori browser:
```
http://appserver.lafantanasrb.local:3002
```

Login → "Mobilna aplikacija" tab

Trebalo bi da vidiš žuti banner "Android Build u toku..."

---

## Logovi i Debugging

### Build Logovi

```bash
# Lista svih build logova
ls -lth /tmp/android-build-*.log

# Najnoviji log
tail -f /tmp/android-build-*.log | head -1
```

### Build Status Marker Files

```bash
cd /root/webadminportal/web-admin/public/apk

# Poslednja build verzija
cat .latest-build-version

# Poslednji build datum
cat .latest-build-date
```

### API Test

```bash
# Proveri da li ima APK fajlova
curl http://localhost:3002/api/mobile-app | jq

# Proveri build status
curl http://localhost:3002/api/mobile-app/build-status | jq
```

---

## Konfigurisanje

### Promena Auto-Refresh Intervala

Edit: `/root/webadminportal/web-admin/app/mobile-app/page.tsx`

```typescript
// Trenutno: 30 sekundi
const interval = setInterval(() => {
  fetchAppInfo();
}, 30000);

// Promeni na 15 sekundi:
}, 15000);
```

### Disable Automatic Build

Ako želiš da isključiš automatski build:

```bash
cd /root/webadminportal
rm .git/hooks/post-commit
```

Sada će build raditi samo kada ručno pokrenete:
```bash
./BUILD_ANDROID_APK.sh
```

### Enable Automatic Build (ponovo)

```bash
cd /root/webadminportal
chmod +x .git/hooks/post-commit
```

---

## Files Summary

| File | Purpose |
|------|---------|
| `.git/hooks/post-commit` | Git hook koji pokreće build nakon commit-a |
| `AUTO_BUILD_ANDROID.sh` | Background build script |
| `BUILD_ANDROID_APK.sh` | Manualni build script (originalni) |
| `web-admin/app/api/mobile-app/build-status/route.ts` | API za proveru build statusa |
| `web-admin/app/mobile-app/page.tsx` | UI sa build status bannerom |
| `/tmp/android-build-*.log` | Build logovi |
| `web-admin/public/apk/.latest-build-version` | Marker fajl sa verzijom |
| `web-admin/public/apk/.latest-build-date` | Marker fajl sa datumom |

---

## Troubleshooting

### Problem: Build ne pokreće automatski nakon commit-a

**Provera 1:** Da li post-commit hook postoji?
```bash
ls -lh /root/webadminportal/.git/hooks/post-commit
```

**Rešenje:** Ako ne postoji, kreiraj ga ponovo.

---

### Problem: Build se ne završava

**Provera:** Proveri logove
```bash
tail -100 /tmp/android-build-*.log | grep -i error
```

**Česti problemi:**
- EAS CLI nije instaliran: `npm install -g eas-cli`
- Nemaš login: `eas login`
- Dependencies greška: Idi u log i vidi grešku

---

### Problem: Web portal ne prikazuje build status

**Provera 1:** Da li API radi?
```bash
curl http://localhost:3002/api/mobile-app/build-status
```

**Provera 2:** Da li je Tailwind CSS instaliran?
```bash
cd /root/webadminportal/web-admin
ls node_modules | grep tailwindcss
```

Ako ne postoji:
```bash
./FIX_TAILWIND.sh
```

---

### Problem: Build završio ali nema APK-a

**Provera:** Da li je kopiranje uspelo?
```bash
ls -lh /root/webadminportal/web-admin/public/apk/
```

**Log Check:**
```bash
grep "APK copied" /tmp/android-build-*.log
```

---

## Prednosti Ovog Sistema

1. ✅ **Zero Manual Work:** Ne moraš ručno pokretati build
2. ✅ **Background Processing:** Ne čekaš da build završi
3. ✅ **Real-time Status:** Vidiš da li je build u toku
4. ✅ **Auto-refresh:** Ne moraš ručno refresh-ovati
5. ✅ **Build History:** Vidiš poslednja 3 build-a
6. ✅ **Clean Logs:** Svi logovi su sačuvani za debugging

---

## Zaključak

**Sada je workflow super jednostavan:**

```
Promeniš kod → Commit → Čekaš 5-10min → Refresh portal → Preuzmeš APK! 🎉
```

Nema više ručnog pokretanja build-a! Sve je **AUTOMATSKI**! 🚀

---

**Kreirao:** Claude Code za Vibecode
**Datum:** 2025-11-11
**Verzija:** 1.0
