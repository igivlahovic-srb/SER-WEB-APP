# 🔄 Sinhronizacija između Mobilne Aplikacije i Web Admin Portala

**Poslednje testirano**: 2025-11-13
**Status**: ✅ Potpuno funkcionalno (100% testova prošlo)

## 📋 Sadržaj

1. [Pregled sistema](#pregled-sistema)
2. [Arhitektura sinhronizacije](#arhitektura-sinhronizacije)
3. [API Endpointi](#api-endpointi)
4. [Bidirekciona sinhronizacija](#bidirekciona-sinhronizacija)
5. [Kako koristiti](#kako-koristiti)
6. [Testiranje](#testiranje)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Pregled sistema

Sistem omogućava **bidirekcionalnu sinhronizaciju** podataka između mobilne aplikacije (React Native) i web admin portala (Next.js).

### Šta se sinhronizuje?

1. **Korisnici** (Users)
   - Serviseri i administratori
   - Podaci o korisnicima
   - Uloge i status

2. **Servisi** (Service Tickets)
   - Servisni nalozi
   - Operacije
   - Rezervni delovi
   - Status servisa (u toku / završen)

3. **Konfiguracija** (samo Web → Mobile)
   - Šablon operacija
   - Šablon rezervnih delova

### Smer sinhronizacije

| Tip podataka | Mobilna → Portal | Portal → Mobilna |
|-------------|------------------|------------------|
| Korisnici | ✅ | ✅ |
| Servisi | ✅ | ✅ |
| Konfiguracija | ❌ | ✅ |

---

## 🏗️ Arhitektura sinhronizacije

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILNA APLIKACIJA                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            AsyncStorage (Local Storage)               │  │
│  │  • service-storage (tickets)                          │  │
│  │  • auth-storage (users)                               │  │
│  │  • sync-storage (sync settings)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Zustand State Stores                     │  │
│  │  • serviceStore.ts (tickets & sync logic)             │  │
│  │  • authStore.ts (users & sync logic)                  │  │
│  │  • syncStore.ts (API URL, settings)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              web-admin-sync.ts (API Client)           │  │
│  │  • syncTickets()      - Upload tickets                │  │
│  │  • fetchTickets()     - Download tickets              │  │
│  │  • syncUsers()        - Upload users                  │  │
│  │  • fetchUsers()       - Download users                │  │
│  │  • testConnection()   - Health check                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    WEB ADMIN PORTAL                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes                       │  │
│  │  • /api/health                - Health check          │  │
│  │  • /api/sync/tickets (GET)    - Fetch tickets         │  │
│  │  • /api/sync/tickets (POST)   - Upload tickets        │  │
│  │  • /api/sync/users (GET)      - Fetch users           │  │
│  │  • /api/sync/users (POST)     - Upload users          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              dataStore.ts (Business Logic)            │  │
│  │  • getTickets() / setTickets()                        │  │
│  │  • getUsers() / setUsers()                            │  │
│  │  • File read/write operations                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              JSON Files (File System)                 │  │
│  │  • data/tickets.json                                  │  │
│  │  • data/users.json                                    │  │
│  │  • data/operations.json                               │  │
│  │  • data/spare-parts.json                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpointi

### 1. Health Check

**Endpoint**: `GET /api/health`

**Opis**: Proverava da li je web portal dostupan

**Request**: Nema parametara

**Response**:
```json
{
  "success": true,
  "message": "Web Admin Panel API is running",
  "timestamp": "2025-11-13T19:39:36.770Z"
}
```

---

### 2. Sync Tickets (Upload)

**Endpoint**: `POST /api/sync/tickets`

**Opis**: Šalje sve servise sa mobilne aplikacije na portal

**Request Body**:
```json
{
  "tickets": [
    {
      "id": "ticket-1",
      "deviceCode": "DEV-001",
      "technicianId": "tech-1",
      "technicianName": "Marko Marković",
      "status": "completed",
      "startTime": "2025-11-13T10:00:00.000Z",
      "endTime": "2025-11-13T11:30:00.000Z",
      "durationMinutes": 90,
      "operations": [...],
      "spareParts": [...]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Tickets synced successfully",
  "data": {
    "count": 1
  }
}
```

---

### 3. Fetch Tickets (Download)

**Endpoint**: `GET /api/sync/tickets`

**Opis**: Preuzima sve servise sa portala

**Request**: Nema parametara

**Response**:
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket-1",
        "deviceCode": "DEV-001",
        ...
      }
    ]
  }
}
```

---

### 4. Sync Users (Upload)

**Endpoint**: `POST /api/sync/users`

**Opis**: Šalje sve korisnike sa mobilne aplikacije na portal

**Request Body**:
```json
{
  "users": [
    {
      "id": "1",
      "username": "admin",
      "password": "admin123",
      "name": "Administrator",
      "role": "super_user",
      "isActive": true,
      ...
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Users synced successfully",
  "data": {
    "count": 1
  }
}
```

---

### 5. Fetch Users (Download)

**Endpoint**: `GET /api/sync/users`

**Opis**: Preuzima sve korisnike sa portala

**Request**: Nema parametara

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "username": "admin",
        ...
      }
    ]
  }
}
```

---

## 🔄 Bidirekciona sinhronizacija

### Šta je bidirekciona sinhronizacija?

Bidirekciona sinhronizacija omogućava da:
1. **Mobilna aplikacija** šalje svoje promene na **portal**
2. **Portal** šalje svoje promene na **mobilnu aplikaciju**
3. Sistem **inteligentno spaja** podatke koristeći timestamp-ove

### Kako radi?

```typescript
// serviceStore.ts

async bidirectionalSync() {
  // Korak 1: Preuzmi sa portala (download)
  const fetchSuccess = await this.syncFromWeb();

  // Korak 2: Pošalji na portal (upload)
  const pushSuccess = await this.syncToWeb();

  return fetchSuccess && pushSuccess;
}
```

### Inteligentno spajanje (Smart Merge)

Kada mobilna aplikacija preuzme servise sa portala, sistem:

1. **Proveri da li servis postoji lokalno**
   - Ako ne → doda novi servis
   - Ako da → uporedi timestamp-ove

2. **Uporedi timestamp-ove**
   - Koristi `endTime` ako postoji, inače `startTime`
   - Bira **noviju verziju**

3. **Automatski razreši konflikte**
   - Novija verzija uvek pobedi
   - Nema gubitka podataka

```typescript
// serviceStore.ts - syncFromWeb()

webTickets.forEach((webTicket) => {
  const localIndex = mergedTickets.findIndex(t => t.id === webTicket.id);

  if (localIndex === -1) {
    // Novi servis sa portala - dodaj ga
    mergedTickets.push(webTicket);
  } else {
    // Servis postoji - uporedi timestamp-ove
    const webUpdated = webTicket.endTime
      ? new Date(webTicket.endTime)
      : new Date(webTicket.startTime);
    const localUpdated = localTicket.endTime
      ? new Date(localTicket.endTime)
      : new Date(localTicket.startTime);

    if (webUpdated > localUpdated) {
      // Portal verzija je novija - koristi nju
      mergedTickets[localIndex] = webTicket;
    }
  }
});
```

---

## 📱 Kako koristiti

### Za servisere (tehničari)

1. **Otvori aplikaciju** → Idi na **Profil** tab
2. Klikni na dugme **"Sinhronizuj podatke"**
3. Sačekaj da se sinhronizacija završi
4. Prikazan će se **Success** dialog sa potvrdom

### Za super admina

1. **Otvori aplikaciju** → Idi na **Profil** tab
2. Klikni na ikonicu **Settings** (zupčanik)
3. **Podesi API URL**:
   - Format: `http://IP_ADRESA:3000`
   - Primer: `http://192.168.1.100:3000`
   - ❌ **NE KORISTI** `localhost` ili `127.0.0.1`
4. Klikni **"Testiraj konekciju"** da proveriš
5. Klikni **"Sinhronizuj sada"** za manual sync

### Automatska sinhronizacija

Trenutno **nema automatske sinhronizacije**. Korisnici moraju manualno da kliknu dugme "Sinhronizuj podatke".

**Buduće poboljšanje**: Može se implementirati automatska sinhronizacija na svakih 30 sekundi za live updates.

---

## 🧪 Testiranje

### 1. Osnovni test

Pokreni osnovni sync test:

```bash
bun run test-sync.ts
```

**Testira**:
- ✅ Konekciju na portal
- ✅ Upload korisnika
- ✅ Download korisnika
- ✅ Upload servisa
- ✅ Download servisa

---

### 2. Detaljni test

Pokreni detaljni sync test sa kompleksnim scenarijima:

```bash
bun run test-sync-detailed.ts
```

**Testira**:
- ✅ Upload mobilnih servisa
- ✅ Dodavanje servisa na portalu
- ✅ Download sa portala
- ✅ Inteligentno spajanje
- ✅ Verifikacija finalnog stanja

---

### 3. Rezultati testiranja

**Datum**: 2025-11-13
**Status**: ✅ **100% testova prošlo**

```
📊 TEST SUMMARY
============================================================
✅ ALL TESTS PASSED - Bidirectional sync works perfectly!
   • Mobile tickets uploaded to portal
   • Portal ticket downloaded to mobile
   • Intelligent merge resolved conflicts
   • Both systems are in sync
============================================================
```

---

## 🔧 Troubleshooting

### Problem 1: "Network request failed"

**Uzrok**:
- Pogrešan API URL
- Web portal nije pokrenut
- Mobilni telefon i računar nisu na istoj WiFi mreži

**Rešenje**:
1. Proveri da li je web portal pokrenut:
   ```bash
   cd /home/user/webadminportal
   bun run dev
   ```
2. Proveri IP adresu računara:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```
3. U mobilnoj aplikaciji koristi IP adresu, ne localhost:
   - ✅ Ispravno: `http://192.168.1.100:3000`
   - ❌ Pogrešno: `http://localhost:3000`

---

### Problem 2: "Connection timeout"

**Uzrok**:
- Web portal je suviše spor
- Nema internet konekcije

**Rešenje**:
1. Restartuj web portal
2. Proveri da li telefon ima internet
3. Povećaj timeout u `web-admin-sync.ts`:
   ```typescript
   const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sekundi
   ```

---

### Problem 3: Servisi se ne sinhronizuju

**Uzrok**:
- API URL nije podešen
- Servis nije sačuvan u AsyncStorage

**Rešenje**:
1. Proveri API URL:
   - Profil → Settings → Web Admin API URL
2. Proveri AsyncStorage:
   ```bash
   # U React Native Debugger
   AsyncStorage.getAllKeys().then(keys => console.log(keys))
   ```

---

### Problem 4: Dupli servisi nakon sinhronizacije

**Uzrok**:
- Bug u merge logici
- Različiti ID-jevi za isti servis

**Rešenje**:
1. Proveri da svaki servis ima **unikatan ID**
2. Proveri merge logiku u `serviceStore.ts` → `syncFromWeb()`
3. Očisti AsyncStorage i ponovo sinhronizuj:
   ```bash
   # U React Native Debugger
   AsyncStorage.clear()
   ```

---

## 📊 Status funkcionalnosti

| Funkcionalnost | Status | Napomena |
|---------------|--------|----------|
| Upload servisa | ✅ | Potpuno funkcionalno |
| Download servisa | ✅ | Potpuno funkcionalno |
| Upload korisnika | ✅ | Samo super admin |
| Download korisnika | ✅ | Samo super admin |
| Inteligentno spajanje | ✅ | Koristi timestamp-ove |
| Health check | ✅ | Timeout 5 sekundi |
| Manual sync dugme | ✅ | Profil ekran |
| Automatska sinhronizacija | ❌ | Za buduću implementaciju |
| Live updates | ❌ | Za buduću implementaciju |

---

## 🚀 Buduća poboljšanja

### 1. Automatska sinhronizacija
- Sinhronizacija na svakih 30-60 sekundi
- Samo kada je aplikacija aktivna
- Sa opcijom za enable/disable

### 2. Offline mod
- Queue za čuvanje promena offline
- Automatska sinhronizacija kada se konekcija vrati

### 3. Push notifikacije
- Notifikacija kada admin otvori novi servis
- Notifikacija kada se servis završi

### 4. Conflict resolution UI
- Prikaži korisniku kada ima konflikte
- Omogući manuelno biranje verzije

### 5. Real-time sync sa WebSockets
- Instant updates bez refresh-a
- Eliminacija potrebe za poll-ingom

---

## 📝 Korisne komande

### Pokretanje web portala
```bash
cd /home/user/webadminportal
bun install
bun run dev
```

### Testiranje sinhronizacije
```bash
# Osnovni test
bun run test-sync.ts

# Detaljni test
bun run test-sync-detailed.ts
```

### Provera API URL-a
```bash
# U mobilnoj aplikaciji (React Native Debugger)
import { useSyncStore } from './src/state/syncStore';
console.log(useSyncStore.getState().apiUrl);
```

### Čišćenje podataka
```bash
# Očisti AsyncStorage (React Native Debugger)
AsyncStorage.clear();

# Očisti portal podatke
rm /home/user/webadminportal/data/*.json
```

---

## 📞 Kontakt

Za pitanja ili bug report-ove, kontaktirajte razvojni tim.

**Verzija dokumentacije**: 1.0
**Poslednje ažurirano**: 2025-11-13
