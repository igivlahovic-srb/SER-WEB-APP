# Pregled Projekta - La Fantana WHS Mobile App

## 📱 Opis Projekta

**La Fantana WHS (Water Handling System)** je React Native mobilna aplikacija za servisiranje i održavanje water aparata sa bocom od 19L. Aplikacija omogućava serviserima da evidentiraju servise, dodaju operacije i rezervne delove, i sinhronizuju podatke sa web portalom.

---

## 📂 Struktura Projekta

```
/home/user/workspace/
│
├── 📁 src/                          # Source kod mobilne aplikacije
│   ├── 📁 api/                      # API servisi
│   │   ├── web-admin-sync.ts        # API client za web portal
│   │   ├── openai.ts                # OpenAI API client
│   │   ├── grok.ts                  # Grok AI API client
│   │   ├── anthropic.ts             # Anthropic API client
│   │   ├── chat-service.ts          # LLM chat servisi
│   │   ├── image-generation.ts      # Image generation API
│   │   └── transcribe-audio.ts      # Audio transcription API
│   │
│   ├── 📁 components/               # React Native komponente
│   │
│   ├── 📁 navigation/               # React Navigation setup
│   │   └── RootNavigator.tsx        # Glavni navigator (stack + bottom tabs)
│   │
│   ├── 📁 screens/                  # App ekrani
│   │   ├── LoginScreen.tsx          # Login screen sa 2FA podrškom
│   │   ├── DashboardScreen.tsx      # Dashboard sa statistikama
│   │   ├── ScannerScreen.tsx        # QR kod skener
│   │   ├── ServiceTicketScreen.tsx  # Servisni nalog (dodavanje operacija/delova)
│   │   ├── HistoryScreen.tsx        # Istorija servisa
│   │   ├── ProfileScreen.tsx        # Profil korisnika
│   │   ├── TwoFactorSetupScreen.tsx # 2FA setup
│   │   └── TwoFactorVerifyScreen.tsx# 2FA verifikacija
│   │
│   ├── 📁 services/                 # Servisi
│   │   ├── live-sync.ts             # ⚡ Live sync service (5-second polling)
│   │   └── auto-update.ts           # Auto-update checker
│   │
│   ├── 📁 state/                    # Zustand state management
│   │   ├── authStore.ts             # Autentifikacija i korisnici
│   │   ├── serviceStore.ts          # Servisi (tickets)
│   │   ├── syncStore.ts             # Sync konfiguracija
│   │   ├── configStore.ts           # App konfiguracija
│   │   └── twoFactorStore.ts        # 2FA state
│   │
│   ├── 📁 types/                    # TypeScript tipovi
│   │   └── index.ts                 # App tipovi (User, ServiceTicket, itd.)
│   │
│   └── 📁 utils/                    # Helper funkcije
│       └── cn.ts                    # Tailwind class merge helper
│
├── 📁 assets/                       # Assets (ikone, slike)
│   ├── icon.png                     # App ikona (1024x1024)
│   ├── adaptive-icon.png            # Android adaptive ikona
│   └── favicon.png                  # Web favicon
│
├── 📁 patches/                      # Package patches (patch-package)
│
├── 📁 types/                        # Global TypeScript tipovi
│   └── index.ts                     # User, ServiceTicket, Operation, SparePart
│
├── 📄 App.tsx                       # 🚀 App entry point (auto-start live sync)
├── 📄 index.ts                      # Expo entry point
│
├── ⚙️ package.json                  # Dependencies
├── ⚙️ app.json                      # Expo config
├── ⚙️ babel.config.js               # Babel config
├── ⚙️ metro.config.js               # Metro bundler config
├── ⚙️ tailwind.config.js            # Tailwind/Nativewind config
├── ⚙️ tsconfig.json                 # TypeScript config
├── ⚙️ eas.json                      # EAS Build config
├── ⚙️ eslint.config.js              # ESLint config
│
├── 📖 README.md                     # Glavna dokumentacija
├── 📖 CLAUDE.md                     # Vibecode system instrukcije
├── 📖 WEB_PORTAL_API_SPEC.md        # Web portal API specifikacija
├── 📖 ANDROID_BUILD_GUIDE.md        # Android build uputstva
├── 📖 AUTO_BUILD_GUIDE.md           # Auto build system
├── 📖 AUTO_UPDATE.md                # Auto-update feature
├── 📖 BIDIRECTIONAL_SYNC_GUIDE.md   # Sync dokumentacija
├── 📖 CHANGELOG.md                  # Changelog
│
├── 🔧 AUTO_BUILD_ANDROID.sh         # Android auto-build script
├── 🔧 BUILD_ANDROID_APK.sh          # Manual Android build script
├── 🔧 build-apk.sh                  # Quick APK build
├── 🔧 CHECK_UPDATES.sh              # Check for updates
├── 🔧 refresh-app.sh                # Clear cache & refresh
│
├── 🎨 generate-icons.html           # Icon generator tool
└── 🎨 generate-login-logo.html      # Logo generator tool
```

---

## 🔑 Ključne Feature

### 1. ⚡ Live Sinhronizacija (v2.2.0)
- **Automatska bidirekciona sinhronizacija svakih 5 sekundi**
- Offline-first pristup
- Auto-reconnect kada portal postane dostupan
- Inteligentno spajanje podataka (timestamp-based)

### 2. 🔐 Autentifikacija
- Login sa korisničkim imenom i lozinkom
- Dvofaktorska autentifikacija (2FA TOTP)
- Backup kodovi za 2FA
- Uloge: Super User, Gospodar, Technician

### 3. 📷 QR Skener
- Skeniranje QR kodova, EAN13/EAN8, Code128, itd.
- Ručni unos šifre aparata
- Automatsko otvaranje servisnog naloga

### 4. 🔧 Servisni Nalozi
- Kreiranje servisa sa QR kodom
- Dodavanje operacija iz dropdown liste
- Dodavanje rezervnih delova sa količinom
- Validacija (mora biti bar jedna operacija)
- Završavanje servisa sa automatskim trajanjem

### 5. 📊 Dashboard
- Statistika uživo (aktivni servisi, današnji servisi, završeni)
- Personalizovani pozdrav
- Nedavna aktivnost
- Brzo pokretanje novog servisa

### 6. 📜 Istorija Servisa
- Filtriranje (svi, aktivni, završeni)
- Detaljan pregled svakog servisa
- Status indikatori

### 7. 👥 Upravljanje Korisnicima (Super Admin)
- Dodavanje novih korisnika
- Izmena postojećih korisnika
- Aktivacija/Deaktivacija naloga
- Brisanje korisnika

### 8. 📅 Radni Dani
- Zatvaranje radnog dana (tehničari)
- Otvaranje radnog dana sa obrazloženjem (admin)
- Log istorije

### 9. 🌐 Web Portal Sync
- Konfigurisanje URL-a portala
- Test konekcije
- Manuelna sinhronizacija
- Automatska sinhronizacija nakon svake promene

---

## 🛠️ Tehnologije

- **Framework**: React Native 0.76.7 + Expo SDK 53
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **State Management**: Zustand sa AsyncStorage perzistencijom
- **Styling**: NativeWind (Tailwind CSS za React Native)
- **Camera**: expo-camera (QR kod skeniranje)
- **2FA**: expo-crypto (TOTP generisanje i verifikacija)
- **QR Generisanje**: react-native-qrcode-svg
- **TypeScript**: Type safety
- **Date Handling**: date-fns

---

## 🚀 Pokretanje Projekta

### Development
```bash
bun start
```

### Reload Aplikacije
- **iOS**: Shake device ili `Cmd + D` → "Reload"
- **Android**: Shake device ili `Cmd + M` → "Reload"
- **Metro**: Pritisnite `r` za reload

### Čišćenje Cache-a
```bash
bun start --clear
# ili
rm -rf .expo && bun start
```

### Android Build
```bash
# Auto-build sa EAS
./AUTO_BUILD_ANDROID.sh

# Manuelni build
./BUILD_ANDROID_APK.sh
```

---

## 👥 Demo Korisnici

### Super Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Ovlašćenja**: Pristup svim servisima i upravljanje korisnicima

### Serviser 1
- **Username**: `marko`
- **Password**: `marko123`
- **Ovlašćenja**: Kreiranje i pregled svojih servisa

### Serviser 2
- **Username**: `jovan`
- **Password**: `jovan123`
- **Ovlašćenja**: Kreiranje i pregled svojih servisa

---

## 🌐 Web Portal

Web portal je **zaseban Next.js projekat** koji se nalazi na:
**https://github.com/igivlahovic-srb/web-admin-portal**

Za detalje o API interfejsu, videti: `WEB_PORTAL_API_SPEC.md`

---

## 📝 Razvojni Workflow

### Za Nove Feature:
1. Kreirajte novi screen u `/src/screens/`
2. Dodajte screen u `/src/navigation/RootNavigator.tsx`
3. Ako treba state, kreirajte novi store u `/src/state/`
4. Koristite Zustand selektore za subscribing na state
5. Stilizujte sa NativeWind className prop
6. Testirajte na iOS i Android

### Za API Integracije:
1. Dodajte API funkcije u `/src/api/`
2. Koristite fetch API sa error handling-om
3. Testirajte sa web portalom
4. Dokumentujte u `WEB_PORTAL_API_SPEC.md`

### Za State Management:
1. Koristite Zustand stores
2. Persist samo potrebne podatke (AsyncStorage)
3. Koristite selektore za optimizaciju renders
4. Primer: `const user = useAuthStore(s => s.user)`

---

## 🔗 Povezani Linkovi

- **Web Portal Repo**: https://github.com/igivlahovic-srb/web-admin-portal
- **Expo Documentation**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **Zustand**: https://zustand-demo.pmnd.rs
- **NativeWind**: https://www.nativewind.dev

---

## 📞 Podrška

Za pitanja ili probleme, videti dokumentaciju u projektu ili kontaktirajte razvojni tim.
