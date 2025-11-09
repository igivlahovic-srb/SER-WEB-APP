# Water Service App

Profesionalna mobilna aplikacija za servisiranje i održavanje water aparata sa bocom od 19L.

## 📱 Opis

Water Service App je moderan sistem za upravljanje servisnim radovima na water aparatima. Aplikacija omogućava serviserima da brzo evidentiraju servise skeniranjem QR kodova, beleženju operacija i utrošenih rezervnih delova, dok super administratori imaju uvid u sve servise i statistiku.

## ✨ Funkcionalnosti

### 🔐 Autentifikacija
- **Prijava sa ulogama**: Dva nivoa pristupa (Super User i Serviser)
- **Perzistentna sesija**: Automatsko čuvanje prijavljenog korisnika
- **Demo pristup**: Unapred konfigurisani nalozi za testiranje

### 📊 Kontrolna tabla (Dashboard)
- **Personalizovani pozdrav**: Prikaz imena i uloge korisnika
- **Statistika uživo**: Aktivni servisi, današnji servisi, ukupno završenih
- **Brzo pokretanje**: Direktan pristup skeneru za nove servise (serviser)
- **Nedavna aktivnost**: Pregled poslednjih servisa

### 📷 QR Skener
- **Brzo skeniranje**: Automatsko otvaranje servisnog naloga nakon skeniranja
- **Manuelni unos**: Opcija za ručno unošenje šifre aparata
- **Dozvole kamere**: Intuitivan prikaz za zahtevanje pristupa kameri
- **Vizuelni indikatori**: Okvir za precizno pozicioniranje QR koda

### 🔧 Servisni nalog
- **Dodavanje operacija**: Izbor iz liste predefinisanih servisnih operacija
  - Čišćenje rezervoara
  - Zamena filtera
  - Provera slavina
  - Provera sistema hlađenja
  - Provera grejača
  - Zamena cevi
- **Rezervni delovi**: Evidencija utrošenih delova sa količinom
  - Filter uložak
  - Slavine (hladna/topla voda)
  - Silikonske cevi
  - Grejači
  - Termostati
- **Validacija**: Ne dozvoljava završetak bez bar jedne operacije
- **Interaktivno brisanje**: Mogućnost uklanjanja grešaka

### 📜 Istorija servisa
- **Filtriranje**: Prikaz svih, aktivnih ili završenih servisa
- **Detaljan pregled**: Kompletne informacije za svaki servis
  - Šifra aparata
  - Ime servisera
  - Datumi i vremena
  - Liste operacija i rezervnih delova
- **Status indikatori**: Jasna vizuelna razlika između statusnih tipova

### 👤 Profil
- **Lična statistika**:
  - Završeni servisi
  - Servisi u toku
  - Ukupno operacija
  - Utrošeni delovi
- **Informacije o nalogu**: Korisničko ime, ime, uloga
- **Sigurna odjava**: Potvrda pre odjave

## 🎨 Dizajn

### Dizajnerske teme
- **Profesionalna paleta boja**:
  - Primarno: Plava (#1E40AF, #3B82F6) - poverenje i profesionalizam
  - Sekundarno: Zelena (#10B981) - uspeh i završetak
  - Akcenti: Žuta (#F59E0B) - aktivnost i upozorenje
- **Tipografija**: Jasna hijerarhija sa bold naslovima
- **Kartice**: Zaobljene kartice sa diskretnim senkama
- **Gradienti**: Glatki linearni gradijenti za header sekcije
- **Ikone**: Ionicons za konzistentno iskustvo

### UX Principi
- **Apple Human Interface Design**: Moderne iOS konvencije
- **Minimalistički pristup**: Fokus na bitne informacije
- **Adekvatan spacing**: Dosta belog prostora između elemenata
- **Intuitivna navigacija**: Bottom tabs za glavne sekcije
- **Instant feedback**: Animacije i vizuelni indikatori akcija

## 🏗️ Arhitektura

### Struktura projekta
```
src/
├── screens/           # React Native screens
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── ScannerScreen.tsx
│   ├── ServiceTicketScreen.tsx
│   ├── HistoryScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/        # React Navigation setup
│   └── RootNavigator.tsx
├── state/            # Zustand state management
│   ├── authStore.ts
│   └── serviceStore.ts
├── types/            # TypeScript types
│   └── index.ts
└── utils/            # Helper functions
```

### Tehnologije
- **Expo SDK 53** - React Native 0.76.7
- **React Navigation** - Native stack i bottom tabs
- **Zustand** - State management sa AsyncStorage perzistencijom
- **NativeWind** - Tailwind CSS stilizacija
- **Expo Camera** - QR kod skeniranje
- **TypeScript** - Type safety
- **date-fns** - Formatiranje datuma

## 👥 Korisnici (Demo)

### Super Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Ovlašćenja**: Pregled svih servisa svih servisera

### Serviser 1
- **Username**: `marko`
- **Password**: `marko123`
- **Ovlašćenja**: Kreiranje i pregled svojih servisa

### Serviser 2
- **Username**: `jovan`
- **Password**: `jovan123`
- **Ovlašćenja**: Kreiranje i pregled svojih servisa

## 🚀 Tok rada

### Za servisera:
1. Prijava sa naloga
2. Klik na "Novi servis" ili scanner ikona
3. Skeniranje QR koda water aparata (ili manuelni unos)
4. Dodavanje izvršenih operacija
5. Dodavanje utrošenih rezervnih delova (opciono)
6. Završetak servisa
7. Pregled istorije svih servisa

### Za super usera:
1. Prijava sa naloga
2. Pregled kontrolne table sa svim statistikama
3. Uvid u sve servise svih servisera
4. Analiza istorije i performansi

## 📝 Napomene

- Aplikacija koristi mock podatke za autentifikaciju (u produkciji bi se koristio backend API)
- Servisni nalozi se čuvaju lokalno u AsyncStorage
- QR kodovi moraju biti validan format (bilo koji QR kod se može skenirati za demo)
- Aplikacija je optimizovana za iOS

## 🔄 Buduća poboljšanja

Mogući dodaci za verziju 2.0:
- Backend integracija sa realnom bazom podataka
- Push notifikacije za nove servise
- Geolokacija servisa
- PDF izvoz servisnih naloga
- Slike pre/posle servisa
- Kalendar zakazanih servisa
- Napredna statistika i grafikoni
- Offline mod sa sync-om

---

**Verzija**: 1.0
**Platforma**: iOS (optimizovano)
**Napravljeno sa**: Vibecode AI App Builder
