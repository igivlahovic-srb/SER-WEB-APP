# REZIME - KOMUNIKACIJSKA ARHITEKTURA

**Kreirano:** 2024-11-17  
**Status:** Kompletna Analiza

## Dokumenti

Detaljnu analizu sam kreirao u dva dokumen­ta:

1. **KOMUNIKACIJA_ANALIZA.md** (1,169 linija)
   - Detaljni pregled arhitekture
   - Svi API endpointi sa zahtevima/odgovorima
   - Data modeli i strukture
   - State management (6 store-ova)
   - Web portal persistencija
   - Sigurnosni mehanizmi
   - Komunikacijski scenariji

2. **VIZUELNI_DIJAGRAMI.md** (720 linija)
   - ASCII dijagrami svih sistema
   - Live sync ciklus (5 sekundi)
   - Data flow scenariji
   - Workday close/reopen
   - Error handling
   - Persistence hierarchy

---

## Ključne Tehničke Karakteristike

### 1. OFFLINE-FIRST ARHITEKTURA
- Mobilna app radi **potpuno bez interneta**
- Svi podaci se čuvaju lokalno na uređaju
- Automatska sinhronizacija kada je portal dostupan
- **5-sekundni polling** sa auto-reconnect-om

### 2. BIDIREKCIONA SINHRONIZACIJA
```
Mobile → Web (PUSH):
  POST /api/sync/users
  POST /api/sync/tickets

Web → Mobile (PULL):
  GET /api/sync/users
  GET /api/sync/tickets

Merge strategija: TIMESTAMP-BASED (novije verzije vršit)
```

### 3. PERSISTENCE SLOJEVI
```
1. Phone Memory (Zustand stores) - LAN brz pristup
2. Device Storage (AsyncStorage) - Trajno nakon kraja app-a
3. Web Portal (JSON fajlovi + in-memory) - Centralno skladište
4. ERP (MS SQL) - Izvorna baza (optional)
```

### 4. STATE MANAGEMENT (Zustand + AsyncStorage)
- **authStore.ts** - Korisnici, autentifikacija, 2FA
- **serviceStore.ts** - Service ticketi sa operacijama
- **configStore.ts** - Operacije i rezervni delovi
- **syncStore.ts** - Konfiguracija sinhronizacije
- **deviceStore.ts** - Device info, login history
- **twoFactorStore.ts** - TOTP secrets i backup kodovi

### 5. API ENDPOINTI
**Sinhronizacijski:**
- POST/GET /api/sync/users
- POST/GET /api/sync/tickets

**Radni dan:**
- POST /api/workday/close
- POST /api/workday/open (admin only)
- GET /api/workday/open (log)

**Konfiguracija:**
- GET /api/config/sync
- GET /api/operations (iz ERP-a)
- GET /api/spare-parts (iz ERP-a)

**Zdravlje sistema:**
- GET /api/health (5-sec timeout)

### 6. SIGURNOST
- **Rate limiting** - max 10 sync/min, max 5 login/min
- **Input sanitizacija** - sanitizeUrl, sanitizeObject
- **Error handling** - Sigurne poruke bez leak-a
- **2FA** - TOTP sa 10 backup kodova
- **Token management** - Auto-refresh sa 5min pre-expiry check

### 7. MERGE STRATEGIJA
```
Za svaki korisnik/ticket:
  AKO nije u local:
    → Dodaj iz remote
  AKO postoji u local:
    → Poredi updatedAt timestamps
    → Ako remote je noviji (>=) → koristi remote
    → Inače → čuva local
```

### 8. ERROR RECOVERY
```
Ako portal padne:
  1. consecutiveFailures++
  2. Ako > 3 failures && !autoReconnect → stop()
  3. Inače → retry svakih 5 sekundi
  4. App nastavlja sa lokalnim podacima
  5. Kada se portal vrati → auto-sync SVE promene
```

---

## DATA MODELS

### User
```
{
  id, charismaId, username, name, role,
  depot, isActive, createdAt,
  workdayStatus, workdayClosedAt,
  workdayOpenedBy, workdayReopenReason,
  twoFactorEnabled, twoFactorEnabledAt, twoFactorEnabledBy
}
```

### ServiceTicket
```
{
  id, serviceNumber, deviceCode, deviceLocation,
  technicianId, technicianName,
  startTime, endTime, durationMinutes,
  status: "in_progress" | "completed",
  operations: Operation[],
  spareParts: SparePart[],
  notes
}
```

### OperationTemplate / SparePartTemplate
```
{
  id, code, name, [description],
  isActive, createdAt
}
```

---

## SCENARIJI KORIŠĆENJA

### 1. Tehničar kreira service ticket
```
Mobile UI → serviceStore.addTicket()
  → AsyncStorage persist
  → triggerAutoSync()
  → webAdminAPI.syncTickets()
  → POST /api/sync/tickets
  → dataStore.setTickets()
  → /data/tickets.json
```

### 2. Zatvaranje radnog dana
```
Mobile: authStore.closeWorkday()
  → webAdminAPI.closeWorkday()
  → POST /api/workday/close
  → Portal ažurira workdayStatus = "closed"
  
Admin može ponovo otvoriti:
  → POST /api/workday/open (sa razlogom)
  → Portal loguje u workday-log.json
  → Sledeći sync: Mobile vidi promenu
```

### 3. Pull konfiguracije
```
Mobile: configStore.fetchConfig()
  → GET /api/config/sync
  → dataStore.getOperations(), getSpareParts()
  → Ako nema konekcije: koristi cached data
  → AsyncStorage persist
```

### 4. Offline rad
```
Tehničar u polju bez interneta:
  • Kreira tickete → svi se čuvaju lokalno
  • Završava tickete → status saved locally
  • Zatvara radni dan → sprema se lokalno
  
Kada se internet pojavi:
  • Live sync automatski startuje
  • Sve promene se prate na portal
  • Merge se dešava sa timestamp resolution
```

---

## FLOW DIJAGRAMI

### Live Sync Ciklus (svaki 5 sekundi)
```
1. TEST KONEKCIJE (GET /api/health)
   ├─ Success → nastavi
   └─ Fail → retry sa backoff

2. PUSH LOKALNI PODACI
   ├─ POST /api/sync/users (ako super_user)
   └─ POST /api/sync/tickets

3. PULL UDALJENI PODACI
   ├─ GET /api/sync/users
   └─ GET /api/sync/tickets

4. MERGE TIMESTAMP-BASED
   └─ Remote wins ako je novija ili ista vremenska marka

5. UPDATE TIMESTAMP
   └─ syncStore.setLastSyncTime()
```

### Data Persistence
```
Phone Memory (Zustand) → AsyncStorage (Device) → JSON (Portal) → SQL (ERP)
         ↓ FAST                    ↓ PERSISTENT    ↓ CENTRAL     ↓ AUTHORITATIVE
    (2 minute)                  (do cache clear)  (do restart)  (do delete)
```

---

## INTEGRACIJE

### Web Portal + Mobile
- REST API (HTTP)
- JSON format
- Content-Type: application/json
- Default URL: http://localhost:3000

### Portal + ERP
- MS SQL Server konekcija
- Query sa ItemCode prefixima
- "OP*" → Operacije
- "102*" → Rezervni delovi

---

## IMPLEMENTACIJSKE NAPOMENE

1. **Live Sync je Default ON** - Pokreće se automatski čim je portal dostupan
2. **Auto-Sync na Store Changes** - Odmah push nakon addTicket, updateUser, itd.
3. **Merge Preferira Remote** - Ako je timestamp isti ili noviji
4. **Cleanup Old Data** - Ticketi stariji od 3 dana se brišu iz memorije
5. **No Password Push** - Samo za login, nigde nije slano na portal
6. **2FA Lokalno** - Secret i backup kodovi se čuvaju na uređaju
7. **Detailed Logging** - Svi workday reopeni se loguju sa adminId i razlogom

---

## DATOTEKE U WORKSPACE-U

```
/home/user/workspace/
├── ANALIZA_REZIME.md                    ← Ovaj fajl
├── KOMUNIKACIJA_ANALIZA.md              ← Detaljne specifike
├── VIZUELNI_DIJAGRAMI.md                ← ASCII dijagrami
│
├── src/
│   ├── api/web-admin-sync.ts            ← WebAdminAPI klijent
│   ├── services/live-sync.ts            ← 5-sec polling
│   ├── state/
│   │   ├── authStore.ts
│   │   ├── serviceStore.ts
│   │   ├── configStore.ts
│   │   ├── syncStore.ts
│   │   ├── deviceStore.ts
│   │   └── twoFactorStore.ts
│   ├── types/index.ts                   ← Shared data models
│   └── utils/security.ts                ← Rate limiting, sanitization
│
└── web-admin-portal/
    ├── app/api/
    │   ├── sync/
    │   │   ├── users/route.ts
    │   │   └── tickets/route.ts
    │   ├── config/sync/route.ts
    │   ├── workday/
    │   │   ├── close/route.ts
    │   │   └── open/route.ts
    │   ├── operations/route.ts
    │   ├── spare-parts/route.ts
    │   ├── health/route.ts
    │   └── ...
    ├── lib/
    │   ├── dataStore.ts                 ← In-memory + JSON persistence
    │   ├── db.ts                        ← MS SQL integration
    │   └── ...
    └── data/
        ├── users.json
        ├── tickets.json
        ├── operations.json
        ├── spare-parts.json
        └── workday-log.json
```

---

## ZAKLJUČAK

Ovo je **mature, offline-first arhitektura** sa:
- **Bidirekcionalnom sinhronizacijom**
- **Automatskim retry mehanizmom**
- **Timestamp-based conflict resolution**
- **Sigurnosnim mehanizmima** (rate limiting, sanitizacija, 2FA)
- **Fleksibilnom persistencijom** (AsyncStorage, JSON, SQL)

Mobilna aplikacija radi **potpuno bez web portala**, a svi podaci se sinhronizuju automatski kada je portal dostupan.

---

**Detaljne informacije:** Pogledaj `KOMUNIKACIJA_ANALIZA.md` i `VIZUELNI_DIJAGRAMI.md`
