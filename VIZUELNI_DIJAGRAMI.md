# VIZUELNI DIJAGRAMI - KOMUNIKACIJSKA ARHITEKTURA

## 1. MAIN ARCHITECTURE FLOW

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     MOBILNA APLIKACIJA (React Native Expo)                │
│                    /home/user/workspace                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    STATE MANAGEMENT LAYER                           │ │
│  │                                                                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │ │
│  │  │ authStore   │  │serviceStore │  │ configStore │  │syncStore │ │ │
│  │  │  (Users)    │  │ (Tickets)   │  │ (Ops/Parts) │  │ (Config) │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘ │ │
│  │         ↓                ↓                 ↓                ↓      │ │
│  │  Zustand (Memory) + AsyncStorage (Persistence)                    │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                             ↑ ↓ (bidirectional)                           │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    SYNC SERVICES LAYER                              │ │
│  │                                                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │  live-sync.ts: 5-sekundni polling mehanizam                │   │ │
│  │  │  • testConnection (GET /api/health)                        │   │ │
│  │  │  • pushLocalChanges (POST /api/sync/users, /tickets)       │   │ │
│  │  │  • pullRemoteChanges (GET /api/sync/users, /tickets)       │   │ │
│  │  │  • mergeUsers/mergeTickets (timestamp-based resolution)    │   │ │
│  │  │  • failureHandling (auto-reconnect sa exponential backoff) │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │  web-admin-sync.ts: WebAdminAPI klijent                    │   │ │
│  │  │  • syncUsers, syncTickets                                  │   │ │
│  │  │  • fetchUsers, fetchTickets, fetchAllData                  │   │ │
│  │  │  • closeWorkday, openWorkday                               │   │ │
│  │  │  • Rate limiting, Input sanitizacija                       │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  REST Client (HTTP) - DEFAULT_API_URL: http://localhost:3000       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    ↕ (HTTP/REST)
┌────────────────────────────────────────────────────────────────────────────┐
│              WEB ADMIN PORTAL (Next.js)                                   │
│          /home/user/workspace/web-admin-portal                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    NEXT.JS API ROUTES                               │ │
│  │                                                                      │ │
│  │  SYNC ENDPOINTS:                                                    │ │
│  │  • POST   /api/sync/users        - Prihvati korisnike od mobilne   │ │
│  │  • GET    /api/sync/users        - Vrati sve korisnike             │ │
│  │  • POST   /api/sync/tickets      - Prihvati tickete od mobilne     │ │
│  │  • GET    /api/sync/tickets      - Vrati sve tickete               │ │
│  │                                                                      │ │
│  │  CONFIG ENDPOINTS:                                                  │ │
│  │  • GET    /api/config/sync       - Vrati operacije i delove        │ │
│  │  • POST   /api/config/sync       - Trigger push notification       │ │
│  │                                                                      │ │
│  │  WORKDAY ENDPOINTS:                                                 │ │
│  │  • POST   /api/workday/close     - Zatvori radni dan               │ │
│  │  • POST   /api/workday/open      - Otvori radni dan (admin)        │ │
│  │  • GET    /api/workday/open      - Vrati log reopena               │ │
│  │                                                                      │ │
│  │  ERP DATA ENDPOINTS:                                                │ │
│  │  • GET    /api/operations        - Operacije iz ERP (ItemCode: OP) │ │
│  │  • GET    /api/spare-parts       - Delovi iz ERP (ItemCode: 102)   │ │
│  │                                                                      │ │
│  │  HEALTH CHECK:                                                      │ │
│  │  • GET    /api/health            - Konekcija test                  │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    DATA PERSISTENCE LAYER                            │ │
│  │                                                                      │ │
│  │  IN-MEMORY STORE (dataStore.ts):                                   │ │
│  │  • users.json         - Korisnici (sa password)                    │ │
│  │  • tickets.json       - Service ticketi                            │ │
│  │  • operations.json    - Operacije (ili default)                    │ │
│  │  • spare-parts.json   - Rezervni delovi (ili default)              │ │
│  │  • workday-log.json   - Log svih reopen akcija                     │ │
│  │                                                                      │ │
│  │  WRITE OPERATIONS:                                                  │ │
│  │  • fs.writeFileSync() → /data/{filename}.json                      │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                    ↓ (SQL Query)                           │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    ERP SYSTEM (MS SQL Server)                        │ │
│  │                    (Optional - ako je konfigurisan)                  │ │
│  │                                                                      │ │
│  │  Item Tabela - Integracija:                                         │ │
│  │  • ItemCode = "OP*" → Operacije (IsStockable = 0)                  │ │
│  │  • ItemCode = "102*" → Rezervni delovi (IsStockable = 1)           │ │
│  │  • Enabled = 1 → Samo aktivni stavke                               │ │
│  │                                                                      │ │
│  │  Query Pattern:                                                     │ │
│  │  SELECT ItemId, ItemCode AS Sifra, ItemName AS Naziv               │ │
│  │  FROM Item                                                          │ │
│  │  WHERE LEFT(ItemCode, 2|3) = 'OP'|'102'                            │ │
│  │        AND Enabled = 1 AND IsStockable = 0|1                       │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. LIVE SYNC CIKLUS - DETALJNO

```
POKRENUTA SINHRONIZACIJA
(svaki put kada live sync startuje ili nakon 5 sekundi)

┌─────────────────────────────────────────────────────────────────┐
│  FAZA 1: TEST KONEKCIJE                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GET /api/health (timeout: 5 sekundi)                           │
│                                                                 │
│  ┌─────────────────┐                                           │
│  │  Portal dostupan? │                                           │
│  └─────────────────┘                                           │
│         │                                                      │
│    ┌────┴────┐                                                 │
│    │          │                                                │
│   YES       NO                                                 │
│    │          │                                                │
│    ↓          └──→ consecutiveFailures++                       │
│ (NASTAVI)        └──→ čekaj 5 sekundi, retry                   │
│                     (ako autoReconnect=true)                   │
│                     └──→ ako > 3 failures, stop()              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FAZA 2: PUSH LOKALNI PODACI NA WEB PORTAL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Korisnici (samo ako je super_user):                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ POST /api/sync/users                                    │ │
│  │ {                                                       │ │
│  │   "users": [                                            │ │
│  │     { id, charismaId, username, name, role,            │ │
│  │       depot, isActive, createdAt,                       │ │
│  │       workdayStatus, workdayClosedAt, ... }             │ │
│  │   ]                                                     │ │
│  │ }                                                       │ │
│  │ ↓                                                       │ │
│  │ dataStore.setUsers() → /data/users.json                │ │
│  │ ↓                                                       │ │
│  │ HTTP 200: { success: true, data: { count: N } }        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Ticketi (svi):                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ POST /api/sync/tickets                                  │ │
│  │ {                                                       │ │
│  │   "tickets": [                                          │ │
│  │     { id, serviceNumber, deviceCode, technicianId,      │ │
│  │       technicianName, startTime, endTime,               │ │
│  │       durationMinutes, status, operations[], ... }      │ │
│  │   ]                                                     │ │
│  │ }                                                       │ │
│  │ ↓                                                       │ │
│  │ dataStore.setTickets() → /data/tickets.json             │ │
│  │ ↓                                                       │ │
│  │ HTTP 200: { success: true, data: { count: M } }        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FAZA 3: PULL UDALJENI PODACI SA WEB PORTALA                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Korisnici (samo ako je super_user):                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ GET /api/sync/users                                     │ │
│  │ ↓                                                       │ │
│  │ HTTP 200: {                                             │ │
│  │   "success": true,                                      │ │
│  │   "data": {                                             │ │
│  │     "users": [{ id, ... }]                              │ │
│  │   }                                                     │ │
│  │ }                                                       │ │
│  │ ↓                                                       │ │
│  │ LOCAL: mergeUsers(localUsers, remoteUsers)              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Ticketi:                                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ GET /api/sync/tickets                                   │ │
│  │ ↓                                                       │ │
│  │ HTTP 200: {                                             │ │
│  │   "success": true,                                      │ │
│  │   "data": {                                             │ │
│  │     "tickets": [{ id, ... }]                            │ │
│  │   }                                                     │ │
│  │ }                                                       │ │
│  │ ↓                                                       │ │
│  │ LOCAL: mergeTickets(localTickets, remoteTickets)        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FAZA 4: MERGE STRATEGIJA (za konflikte)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ZA SVAKI OBJEKTU (User ili Ticket):                           │
│                                                                 │
│  AKO novi sa remote-a:                                         │
│  └─ DODAJ ga u merged rezultat                                 │
│                                                                 │
│  AKO postoji lokalno:                                          │
│  ├─ Pronađi local versiju po ID-u                              │
│  ├─ Poredi: localTime = local.updatedAt.getTime()              │
│  ├─ Poredi: remoteTime = remote.updatedAt.getTime()            │
│  │                                                             │
│  │  AKO remoteTime >= localTime:                               │
│  │  └─ KORISTI remote verziju (novija ili ista)               │
│  │                                                             │
│  │  INAČE:                                                     │
│  │  └─ ZADRŽI local verziju (local je novija)                 │
│  │                                                             │
│  └─ Spremi merged verziju u Map<id, object>                    │
│                                                                 │
│  REZULTAT: useAuthStore.allUsers ili                           │
│           useServiceStore.tickets sada ima merged podatke     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FAZA 5: UPDATE SYNC TIMESTAMP                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  syncStore.setLastSyncTime(new Date())                          │
│  │                                                             │
│  └─ Sprema u AsyncStorage → "@sync-storage"                   │
│                                                                 │
│  REZULTAT: UI može prikazati "Poslednja sinhronizacija: X min │
│           ago"                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                     CIKLUS ZAVRŠEN
                 
                (čeka se 5 sekundi, zatim ponovi)
```

---

## 3. DATA FLOW - NOVI SERVICE TICKET

```
SCENARIO: Tehnničar kreira novi service ticket

┌───────────────────────────────────────┐
│  MOBILNA APP - UI SCREEN              │
├───────────────────────────────────────┤
│                                       │
│  [Kreiraj novi ticket button]         │
│         ↓                             │
│  Unesi podatke:                       │
│  • deviceCode                         │
│  • operations (multiple)              │
│  • spareParts (multiple)              │
│         ↓                             │
│  [SAČUVAJ button]                     │
│                                       │
└───────────────────────────────────────┘
                ↓ (onClick)
┌───────────────────────────────────────┐
│  SERVICE STORE (Zustand)              │
├───────────────────────────────────────┤
│                                       │
│  serviceStore.addTicket(newTicket)   │
│                                       │
│  state.tickets = [                    │
│    ...oldTickets,                     │
│    { id, serviceNumber, deviceCode,  │
│      status: "in_progress",           │
│      operations: [...],               │
│      spareParts: [...],               │
│      startTime: now(),                │
│      ...}                             │
│  ]                                    │
│                                       │
│  ↓ (persist middleware)               │
│                                       │
│  AsyncStorage.setItem(                │
│    "@service-storage",                │
│    JSON.stringify({                   │
│      tickets: [...],                  │
│      currentTicket: null              │
│    })                                 │
│  )                                    │
│                                       │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  TRIGGER AUTO-SYNC                    │
├───────────────────────────────────────┤
│                                       │
│  triggerAutoSync()                    │
│  │                                   │
│  ├─ AKO syncStore.autoSync === true  │
│  │  && syncStore.apiUrl !== ""       │
│  │  │                                │
│  │  └─ serviceStore.syncToWeb()      │
│  │     │                             │
│  │     └─ ODMAH (ne čeka 5 sekundi)  │
│  │                                   │
│  └─ INAČE: čeka live sync polling    │
│                                       │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│  WEB ADMIN API CLIENT                 │
├───────────────────────────────────────┤
│                                       │
│  webAdminAPI.syncTickets([ticket])   │
│                                       │
│  1. Rate limiting check               │
│     syncRateLimiter.isAllowed()       │
│                                       │
│  2. Input sanitization                │
│     InputSanitizer.sanitizeObject()   │
│                                       │
│  3. HTTP POST                         │
│                                       │
└───────────────────────────────────────┘
                ↓ (HTTP)
    POST http://localhost:3000/api/sync/tickets
    Content-Type: application/json
    
    {
      "tickets": [{
        "id": "ticket-abc-123",
        "serviceNumber": "CH-002_1001",
        "deviceCode": "DEVICE-456",
        "technicianId": "2",
        "technicianName": "Marko Petrović",
        "startTime": "2024-11-17T10:30:00.000Z",
        "status": "in_progress",
        "operations": [{...}],
        "spareParts": [{...}]
      }]
    }
                ↓
┌───────────────────────────────────────┐
│  WEB ADMIN PORTAL - NEXT.JS           │
├───────────────────────────────────────┤
│                                       │
│  POST /api/sync/tickets               │
│  │                                   │
│  ├─ req.body = { tickets: [...] }    │
│  │                                   │
│  ├─ Validacija:                       │
│  │  AKO !tickets || !Array.isArray   │
│  │  └─ HTTP 400 error                │
│  │                                   │
│  ├─ dataStore.setTickets(tickets)    │
│  │  │                                │
│  │  ├─ Update in-memory store        │
│  │  │  tickets = newTickets          │
│  │  │                                │
│  │  ├─ fs.writeFileSync(             │
│  │  │    TICKETS_FILE,               │
│  │  │    JSON.stringify(tickets)     │
│  │  │  )                             │
│  │  │                                │
│  │  └─ Sprema u /data/tickets.json   │
│  │                                   │
│  └─ HTTP 200 Response:                │
│     {                                │
│       "success": true,                │
│       "message": "Tickets synced...", │
│       "data": { "count": 1 }          │
│     }                                │
│                                       │
└───────────────────────────────────────┘

REZULTAT: 
✓ Ticket je sada dostupan u web portalu
✓ Admin može videti sve tickete iz mobilne app
✓ Podaci se čuvaju u /data/tickets.json
✓ Ako je ERP konfigurisan, može se iskoristiti za dodatnu
  analizu i integraciju
```

---

## 4. WORKDAY CLOSE/REOPEN FLOW

```
┌────────────────────────────────────────────────────┐
│  SCENARIO 1: TECHNICIAN CLOSES WORKDAY             │
└────────────────────────────────────────────────────┘

MOBILNA APP:
  authStore.closeWorkday()
  │
  ├─ user.workdayStatus = "closed"
  ├─ user.workdayClosedAt = now()
  └─ AsyncStorage persist
       │
       └─ webAdminAPI.closeWorkday(userId, closedAt)
          │
          └─ POST /api/workday/close
             {
               "userId": "2",
               "closedAt": "2024-11-17T16:30:00.000Z"
             }

WEB ADMIN PORTAL:
  POST /api/workday/close
  │
  ├─ fs.readFileSync(USERS_FILE)
  ├─ Pronađi user po ID-u
  ├─ Update user.workdayStatus = "closed"
  ├─ Update user.workdayClosedAt = closedAt
  ├─ fs.writeFileSync(USERS_FILE, newUsers)
  │
  └─ HTTP 200 Response
     {
       "success": true,
       "message": "Workday closed successfully",
       "data": { "user": { ...updated user... } }
     }

┌────────────────────────────────────────────────────┐
│  SCENARIO 2: ADMIN REOPENS WORKDAY (greška)        │
└────────────────────────────────────────────────────┘

WEB PORTAL ADMIN UI:
  [Admin vidi listu technician-a]
  │
  Marko Petrović | Status: Closed at 16:30
  │
  [Reopen button] ← Click (greška pri zatvaranju)
       │
       └─ Unesi reason:
          "Greška - trebam vratiti podatke"
             │
             └─ webAdminAPI.openWorkday(
                  userId: "2",
                  reason: "Greška - trebam vratiti podatke",
                  adminId: "1"
                )
                │
                └─ POST /api/workday/open
                   {
                     "userId": "2",
                     "reason": "Greška - trebam vratiti podatke",
                     "adminId": "1"
                   }

WEB ADMIN PORTAL:
  POST /api/workday/open
  │
  ├─ Validacija:
  │  ├─ userId required
  │  ├─ reason length >= 10
  │  ├─ adminId required
  │
  ├─ Pronađi admin po ID-u
  ├─ Ako admin role !== "super_user" && "gospodar"
  │  └─ HTTP 403 Forbidden
  │
  ├─ Update user:
  │  ├─ user.workdayStatus = "open"
  │  ├─ user.workdayClosedAt = undefined
  │  ├─ user.workdayOpenedBy = "1"
  │  └─ user.workdayReopenReason = reason
  │
  ├─ fs.writeFileSync(USERS_FILE)
  │
  ├─ Spremi u workday-log.json:
  │  {
  │    "id": "1731843000000",
  │    "userId": "2",
  │    "userName": "Marko Petrović",
  │    "adminId": "1",
  │    "adminName": "Administrator",
  │    "reason": "Greška - trebam vratiti podatke",
  │    "timestamp": "2024-11-17T16:30:00.000Z"
  │  }
  │
  └─ HTTP 200 Response

MOBILNA APP (sledeći sync cicle - nakon 5 sekundi):
  live-sync-pull
  │
  └─ GET /api/sync/users
     │
     └─ Live sync vidi: workdayStatus je sada "open"
        │
        └─ Merge i update local authStore
           │
           └─ UI pokazuje: "Your workday is open"
              (dapat da ponovo dodaš tickete)
```

---

## 5. ERROR HANDLING I RECOVERY

```
┌──────────────────────────────────────────────────────┐
│ SCENARIO: WEB PORTAL NIJE DOSTUPAN (offline)         │
└──────────────────────────────────────────────────────┘

MOBILNA APP - 5 SECOND POLLING:

Iteration 1:
  GET /api/health
  ├─ TIMEOUT (5 sec)
  └─ Error: Connection failed
     └─ handleSyncFailure()
        └─ consecutiveFailures = 1
        └─ App nastavlja sa lokalnim podacima

Iteration 2 (5 sec kasnije):
  GET /api/health
  ├─ TIMEOUT (5 sec)
  └─ Error: Connection failed
     └─ consecutiveFailures = 2
     └─ App nastavlja - sve izmene se čuvaju lokalno

Iteration 3 (5 sec kasnije):
  GET /api/health
  ├─ TIMEOUT (5 sec)
  └─ Error: Connection failed
     └─ consecutiveFailures = 3
     
     AKO autoReconnect === false:
     └─ liveSyncService.stop()
        └─ Sinhronizacija se gasi
     
     AKO autoReconnect === true (DEFAULT):
     └─ Nastavlja retry-ovanje svakih 5 sekundi

TOKOM OFFLINE PERIODA:
  • Tehničar može kreiravati tickete
  • Sve izmene se čuvaju u AsyncStorage
  • Sve je dostupno na uređaju
  • UI ne pokazuje greške - samo "syncing..." status

KADA SE INTERNET VRATI:

Iteration N:
  GET /api/health
  ├─ HTTP 200 success
  └─ Connection established
     └─ consecutiveFailures = 0
     └─ pushLocalChanges()
        ├─ POST /api/sync/users (svi lokalni korisnici)
        ├─ POST /api/sync/tickets (svi lokalni ticketi)
        └─ HTTP 200 responses
     └─ pullRemoteChanges()
        ├─ GET /api/sync/users
        ├─ GET /api/sync/tickets
        └─ Merge sa lokalnim podacima
     └─ Svi podaci sada sinhronizovani!
     └─ UI: "Last synced 2 minutes ago"
```

---

## 6. PERSISTENCE HIERARCHY

```
┌─────────────────────────────────────────────────────────────────┐
│  LEVEL 1: PHONE MEMORY (React Native State)                    │
│  ─────────────────────────────────────────────────────────────  │
│  • Zustand stores (authStore, serviceStore, etc.)             │
│  • Fast access, lost on app restart                            │
│  • Duration: While app is running                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓ (persist middleware)
┌─────────────────────────────────────────────────────────────────┐
│  LEVEL 2: DEVICE STORAGE (AsyncStorage)                        │
│  ─────────────────────────────────────────────────────────────  │
│  • Native implementation (SQLite on iOS, SharedPreferences... on Android) │
│  • Survives app restart and device restart                     │
│  • Serialized as JSON strings                                  │
│  • Duration: Until user clears app cache/data                  │
│  • Size limit: ~10MB per app                                   │
│                                                                │
│  Keys:                                                          │
│  @auth-storage         → authStore                            │
│  @service-storage      → serviceStore                         │
│  @config-storage       → configStore                          │
│  @sync-storage         → syncStore                            │
│  @device-storage       → deviceStore                          │
│  @two-factor-storage   → twoFactorStore                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓ (live-sync push)
┌─────────────────────────────────────────────────────────────────┐
│  LEVEL 3: WEB PORTAL (JSON Files / In-Memory)                  │
│  ─────────────────────────────────────────────────────────────  │
│  • /data/users.json         → dataStore.users (in-memory)      │
│  • /data/tickets.json       → dataStore.tickets (in-memory)    │
│  • /data/operations.json    → dataStore.operations (in-memory) │
│  • /data/spare-parts.json   → dataStore.spareParts (in-memory) │
│  • /data/workday-log.json   → workday reopen log               │
│  • Duration: Until server restart or manual deletion            │
│  • Survives app restarts                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓ (optional - if ERP configured)
┌─────────────────────────────────────────────────────────────────┐
│  LEVEL 4: ERP DATABASE (MS SQL Server)                          │
│  ─────────────────────────────────────────────────────────────  │
│  • Item table (ItemCode prefixes: "OP", "102")                 │
│  • Primary data source for operations and spare parts          │
│  • Central source of truth                                     │
│  • Duration: Permanent (or until data is deleted/archived)     │
│                                                                │
│  Read operations:                                               │
│  • GET /api/operations → queries ItemCode like 'OP%'           │
│  • GET /api/spare-parts → queries ItemCode like '102%'         │
└─────────────────────────────────────────────────────────────────┘

REHYDRATION FLOW (App Startup):
┌──────────────────────────────────────────────────────────────┐
│ 1. App Starts                                                │
│    ├─ Zustand stores created (empty)                         │
│    └─ AsyncStorage.getItem() called for each store key       │
│                                                              │
│ 2. onRehydrateStorage() callbacks executed                   │
│    ├─ Convert ISO strings to Date objects                    │
│    ├─ Ensure URL is set in webAdminAPI                       │
│    └─ Initialize other state properties                      │
│                                                              │
│ 3. Stores fully restored from persistence                   │
│    ├─ authStore with user and allUsers                      │
│    ├─ serviceStore with tickets                             │
│    ├─ configStore with operations/spareParts                │
│    └─ All other stores                                      │
│                                                              │
│ 4. liveSyncService.start() called                           │
│    ├─ Begins 5-second polling                               │
│    └─ Syncs with web portal if available                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. RATE LIMITING SECURITY

```
WEB ADMIN API CLIENT (web-admin-sync.ts):

SYNC OPERATIONS:
  syncRateLimiter.isAllowed("syncUsers")
  │
  ├─ MAX: 10 requests per minute
  ├─ Window: 60 seconds
  └─ Strategy: Token bucket
  
  syncRateLimiter.isAllowed("syncTickets")
  │
  ├─ MAX: 10 requests per minute
  └─ Returns: false if limit exceeded
     └─ Error message: "Too many sync requests"

AUTHENTICATION:
  authRateLimiter.isAllowed("login")
  │
  ├─ MAX: 5 attempts per minute
  └─ Brute force protection
  
  authRateLimiter.isAllowed("tokenRefresh")
  │
  ├─ MAX: Limited per time window
  └─ Prevents token refresh loops

ERROR HANDLING:
  SecureErrorHandler.logError(error, context)
  │
  ├─ Logs to secure system
  ├─ Does NOT expose sensitive info
  └─ Returns safe message to UI
  
  SecureErrorHandler.getUserMessage(error)
  │
  └─ Generic message: "Sync failed. Please try again."
     (Not specific details that could leak info)

INPUT SANITIZATION:
  InputSanitizer.sanitizeUrl(url)
  │
  ├─ Validates URL format
  ├─ Prevents injection attacks
  └─ Returns sanitized URL or null
  
  InputSanitizer.sanitizeObject(data)
  │
  ├─ Removes potentially malicious keys
  ├─ Escapes special characters
  └─ Returns safe JSON object
```

---

**Dokument Kreiran:** 2024-11-17  
**Sveobuhvatna Grafička Analiza**
