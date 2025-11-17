# Detaljana Analiza Komunikacije: Mobilna Aplikacija i Web Admin Portal

## 1. ARHITEKTURA KOMUNIKACIJE

### 1.1 Pregled Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILNA APLIKACIJA (React Native)            │
│                   /home/user/workspace                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  State Management (Zustand + AsyncStorage)              │  │
│  │  • authStore.ts       - Korisnici, autentifikacija      │  │
│  │  • serviceStore.ts    - Service ticketi                │  │
│  │  • configStore.ts     - Operacije, rezervni delovi     │  │
│  │  • syncStore.ts       - Sinhronizacija sa web portalem  │  │
│  │  • deviceStore.ts     - Infos o uređaju i logovanje    │  │
│  │  • twoFactorStore.ts  - 2FA upravljanje                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                             ↕ (HTTP)                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Sync Services                                          │  │
│  │  • live-sync.ts       - 5-sekundni polling               │  │
│  │  • web-admin-sync.ts  - API klijent za web portal       │  │
│  │  • auth-service.ts    - Token upravljanje               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (HTTP/REST)
┌─────────────────────────────────────────────────────────────────┐
│              WEB ADMIN PORTAL (Next.js)                        │
│          /home/user/workspace/web-admin-portal                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  API Routes (Next.js)                                   │  │
│  │  /api/sync/users         - Sinhronizacija korisnika    │  │
│  │  /api/sync/tickets       - Sinhronizacija ticketa      │  │
│  │  /api/config/sync        - Config za mobilnu app       │  │
│  │  /api/operations         - Operacije iz ERP-a          │  │
│  │  /api/spare-parts        - Rezervni delovi iz ERP-a    │  │
│  │  /api/workday/open       - Otvaranje radnog dana       │  │
│  │  /api/workday/close      - Zatvaranje radnog dana      │  │
│  │  /api/health             - Health check                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                             ↕                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Data Persistence Layer                                 │  │
│  │  • dataStore.ts       - In-memory JSON store            │  │
│  │  • users.json         - Korisnici                       │  │
│  │  • tickets.json       - Service ticketi                │  │
│  │  • operations.json    - Operacije                       │  │
│  │  • spare-parts.json   - Rezervni delovi                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                             ↕ (SQL Query)                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ERP System (MS SQL Server)                             │  │
│  │  • Item tabela - sa ItemCode prefixima                  │  │
│  │    - "OP*"   - Operacije                                │  │
│  │    - "102*"  - Rezervni delovi                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Komunikacioni Tokovi

**OFFLINE-FIRST PRISTUP:**
- Mobilna aplikacija radi potpuno bez web portala
- Svi podaci se čuvaju lokalno na uređaju (AsyncStorage)
- Sinhronizacija se automatski dešava kada je portal dostupan (5-sec polling)

---

## 2. API ENDPOINTS - DETALJNO

### 2.1 Sinhronizacijski Endpointi

#### POST /api/sync/users
**Mobilna app → Web portal (PUSH)**
```
Zahtev:
{
  "users": [
    {
      "id": "2",
      "charismaId": "CH-002",
      "username": "marko",
      "name": "Marko Petrović",
      "role": "technician",
      "depot": "Beograd",
      "isActive": true,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "workdayStatus": "open|closed",
      "workdayClosedAt": "2024-11-17T16:30:00.000Z"
    }
  ]
}

Odgovor:
{
  "success": true,
  "message": "Users synced successfully",
  "data": { "count": 1 }
}
```

**Lokacija:** `/home/user/workspace/web-admin-portal/app/api/sync/users/route.ts`
- POST: Prima korisnike sa mobilne app i sprema u `dataStore`
- GET: Vraća sve korisnike iz store-a

#### POST /api/sync/tickets
**Mobilna app → Web portal (PUSH)**
```
Zahtev:
{
  "tickets": [
    {
      "id": "ticket-123",
      "serviceNumber": "CH-001_1001",
      "deviceCode": "DEV-456",
      "technicianId": "2",
      "technicianName": "Marko Petrović",
      "startTime": "2024-11-17T08:00:00.000Z",
      "endTime": "2024-11-17T09:30:00.000Z",
      "durationMinutes": 90,
      "status": "completed",
      "operations": [
        { "id": "1", "name": "Čišćenje rezervoara" }
      ],
      "spareParts": [
        { "id": "1", "name": "Filter uložak", "quantity": 1 }
      ]
    }
  ]
}

Odgovor:
{
  "success": true,
  "message": "Tickets synced successfully",
  "data": { "count": 1 }
}
```

**Lokacija:** `/home/user/workspace/web-admin-portal/app/api/sync/tickets/route.ts`
- POST: Prima tickete i sprema u `dataStore`
- GET: Vraća sve tickete iz store-a

#### GET /api/config/sync
**Web portal → Mobilna app (PULL)**
```
Zahtev:
GET /api/config/sync?type=operations|spareParts (optional)

Odgovor (bez type parametra - vraća sve):
{
  "success": true,
  "data": {
    "operations": [
      {
        "id": "1",
        "code": "OP-001",
        "name": "Čišćenje rezervoara",
        "description": "Kompletno čišćenje...",
        "isActive": true,
        "createdAt": "2024-01-01"
      }
    ],
    "spareParts": [
      {
        "id": "1",
        "code": "RD-001",
        "name": "Filter uložak",
        "unit": "kom",
        "isActive": true,
        "createdAt": "2024-01-01"
      }
    ]
  },
  "syncedAt": "2024-11-17T17:30:00.000Z"
}
```

**Lokacija:** `/home/user/workspace/web-admin-portal/app/api/config/sync/route.ts`
- GET: Vraća konfiguracijske podatke za mobilnu app
- POST: Šalje signal za refresh svim mobilnim uređajima (push notification placeholder)

### 2.2 Radni Dan (Workday) Endpointi

#### POST /api/workday/close
**Mobilna app → Web portal**
```
Zahtev:
{
  "userId": "2",
  "closedAt": "2024-11-17T16:30:00.000Z"
}

Odgovor:
{
  "success": true,
  "message": "Workday closed successfully",
  "data": {
    "user": {
      "id": "2",
      "workdayStatus": "closed",
      "workdayClosedAt": "2024-11-17T16:30:00.000Z"
    }
  }
}
```

**Lokacija:** `/home/user/workspace/web-admin-portal/app/api/workday/close/route.ts`
- Čuva status u `dataStore` i JSON fajlovima
- Ažurira `workdayStatus` i `workdayClosedAt` polje korisnika

#### POST /api/workday/open
**Admin reopen (iz web portala putem mobilne app)**
```
Zahtev:
{
  "userId": "2",
  "reason": "Greška pri zatvaranju - trebam vratiti podatke",
  "adminId": "1"
}

Odgovor:
{
  "success": true,
  "message": "Workday reopened successfully",
  "data": {
    "user": {
      "id": "2",
      "workdayStatus": "open",
      "workdayOpenedBy": "1",
      "workdayReopenReason": "Greška pri zatvaranju..."
    }
  }
}
```

**Lokacija:** `/home/user/workspace/web-admin-portal/app/api/workday/open/route.ts`
- Samo admini (super_user, gospodar) mogu da otvaraju radne dane
- Loguje sve reopen akcije u `workday-log.json`

### 2.3 Konfiguracijski Endpointi (iz ERP-a)

#### GET /api/operations
**Učitavanje operacija iz SQL baze**
```
Query:
SELECT DISTINCT
  i.ItemId,
  i.ItemCode AS Sifra,
  i.ItemName AS Naziv
FROM Item i
WHERE LEFT(i.ItemCode, 2) = 'OP'
  AND i.Enabled = 1
  AND i.IsStockable = 0

Odgovor:
{
  "success": true,
  "data": {
    "operations": [
      {
        "id": "12345",
        "code": "OP-001",
        "name": "Čišćenje rezervoara",
        "status": "Aktivan"
      }
    ]
  }
}
```

**Lokacija:** `/home/user/workspace/web-admin-portal/app/api/operations/route.ts`

#### GET /api/spare-parts
**Učitavanje rezervnih delova iz SQL baze**
```
Query:
SELECT DISTINCT
  i.ItemId,
  i.ItemCode AS Sifra,
  i.ItemName AS Naziv
FROM Item i
WHERE LEFT(i.ItemCode, 3) = '102'
  AND i.Enabled = 1
  AND i.IsStockable = 1

Odgovor:
{
  "success": true,
  "data": {
    "spareParts": [
      {
        "id": "54321",
        "code": "102-001",
        "name": "Filter uložak",
        "status": "Aktivan"
      }
    ]
  }
}
```

**Lokacija:** `/home/user/workspace/web-admin-portal/app/api/spare-parts/route.ts`

### 2.4 Health Check
#### GET /api/health
```
Odgovor:
{
  "success": true,
  "message": "Web Admin Panel API is running",
  "timestamp": "2024-11-17T17:30:00.000Z"
}
```

**Korišćenje:** Test konekcije pre sinhronizacije (5-sec timeout)

---

## 3. DATA MODELS - STRUKTURE PODATAKA

### 3.1 User Model
```typescript
interface User {
  id: string;
  charismaId: string;        // ID iz ERP sistema
  username: string;
  name: string;
  role: "gospodar" | "super_user" | "technician";
  depot: string;             // Lokacija depo
  isActive: boolean;
  createdAt: Date;
  workdayStatus?: "open" | "closed";
  workdayClosedAt?: Date | string;
  workdayOpenedBy?: string;  // Admin koji je otvorio
  workdayReopenReason?: string;
  twoFactorEnabled?: boolean;
  twoFactorEnabledAt?: Date | string;
  twoFactorEnabledBy?: string;
}
```

**Čuvanje:**
- Mobilna app: `/data/auth-storage` (AsyncStorage)
- Web portal: `/data/users.json`

### 3.2 ServiceTicket Model
```typescript
interface ServiceTicket {
  id: string;
  serviceNumber: string;     // Format: {CharismaId}_1001, itd.
  deviceCode: string;        // Kod uređaja
  deviceLocation?: string;
  technicianId: string;
  technicianName: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  status: "in_progress" | "completed";
  operations: Operation[];
  spareParts: SparePart[];
  notes?: string;
}
```

**Čuvanje:**
- Mobilna app: `/data/service-storage` (AsyncStorage)
- Web portal: `/data/tickets.json`

### 3.3 OperationTemplate & SparePartTemplate
```typescript
interface OperationTemplate {
  id: string;
  code: string;              // Šifra iz ERP-a
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date | string;
}

interface SparePartTemplate {
  id: string;
  code: string;              // Šifra iz ERP-a
  name: string;
  unit: string;
  isActive: boolean;
  createdAt: Date | string;
}
```

**Čuvanje:**
- Mobilna app: `/data/config-storage` (AsyncStorage) - sa cached podacima
- Web portal: `/data/operations.json`, `/data/spare-parts.json`
- Izvorna baza: MS SQL Server `Item` tabela

---

## 4. LIVE SYNC MEHANIZAM - DETALJNO

### 4.1 Sync Service Architektura

**Lokacija:** `/home/user/workspace/src/services/live-sync.ts`

#### Inicijalizacija
```typescript
const liveSyncService = new LiveSyncService();

// U App.tsx ili settings screen
liveSyncService.start({
  enabled: true,
  pollIntervalMs: 5000,      // Svakih 5 sekundi
  autoReconnect: true         // Automatski ponovljeni pokušaji
});
```

#### 5-Sekundni Polling Ciklus

```
┌─────────────────────────────────────────────────────────────┐
│              LIVE SYNC CIKLUS (5 sekundi)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. TEST KONEKCIJE                                           │
│    └─ GET /api/health (5-sec timeout)                      │
│       ✓ Portal dostupan → nastavi                          │
│       ✗ Portal nedostupan → log failure → retry            │
│                                                             │
│ 2. PUSH LOKALNI PODACI (MOBILE→WEB)                         │
│    ├─ POST /api/sync/users (ako je super_user)             │
│    │  └─ Svi korisnici iz auth store                       │
│    └─ POST /api/sync/tickets                               │
│       └─ Svi ticketi iz service store                      │
│                                                             │
│ 3. PULL UDALJENI PODACI (WEB→MOBILE)                        │
│    ├─ GET /api/sync/users                                  │
│    │  └─ Merge sa lokalnim korisnicima                     │
│    └─ GET /api/sync/tickets                                │
│       └─ Merge sa lokalnim ticketima                       │
│                                                             │
│ 4. MERGE STRATEGIJA                                         │
│    └─ Koristi updatedAt timestamp                          │
│       ├─ Ako remote je noviji → koristi remote verziju    │
│       ├─ Ako je ista vremenska marka → koristi remote      │
│       └─ Ako local je noviji → čuva local verziju          │
│                                                             │
│ 5. UPDATE TIMESTAMP                                         │
│    └─ syncStore.setLastSyncTime(new Date())                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Merging Logika

#### User Merging
```typescript
// Lokacija: live-sync.ts, mergeUsers()

// 1. Učitaj sve lokalne korisnike u Map po ID-u
const merged = new Map();
localUsers.forEach(user => {
  merged.set(user.id, user);
});

// 2. Za svakog korisnika sa remote servera
remoteUsers.forEach(remoteUser => {
  const localUser = merged.get(remoteUser.id);
  
  if (!localUser) {
    // Novi korisnik sa remote → dodaj
    merged.set(remoteUser.id, remoteUser);
  } else {
    // Korisnik postoji → poredi timestamps
    const localTime = localUser.updatedAt ? 
      new Date(localUser.updatedAt).getTime() : 0;
    const remoteTime = remoteUser.updatedAt ?
      new Date(remoteUser.updatedAt).getTime() : 0;
    
    if (remoteTime >= localTime) {
      // Remote je noviji ili isti → koristi remote verziju
      merged.set(remoteUser.id, remoteUser);
    }
    // Inače čuva lokalnu verziju
  }
});

// 3. Ažurira auth store sa merged korisnicima
useAuthStore.getState().allUsers = Array.from(merged.values());
```

#### Ticket Merging - Ista logika
```typescript
// Preference za remote verziju kada su timestamps isti
if (remoteTime >= localTime) {
  merged.set(remoteTicket.id, remoteTicket);
}
```

### 4.3 Failure Handling

```typescript
// Ako konekcija padne
consecutiveFailures++

if (consecutiveFailures >= 3 && !autoReconnect) {
  liveSyncService.stop()
  console.log("Odustao od sinhronizacije nakon 3 failure-a")
}

// Inače:
// - App nastavlja da radi sa lokalnim podacima
// - Sinhronizacija se ponovlja svakih 5 sekundi
// - Sve promene se čuvaju lokalno
// - Kada se portal ponovo pojavi → automatski sync
```

### 4.4 Auto-Sync iz Store-ova

Svaki put kada se promeni podatak u store-u, pokreće se auto-sync:

```typescript
// serviceStore.ts
addTicket: (ticket) => {
  set((state) => ({ tickets: [...state.tickets, ticket] }));
  triggerAutoSync(); // ← AUTO SYNC
}

// authStore.ts
updateUser: (id, updates) => {
  set((state) => ({
    allUsers: state.allUsers.map((u) => 
      u.id === id ? { ...u, ...updates } : u
    ),
  }));
  triggerAutoSync(); // ← AUTO SYNC
}

// Funkcija koja pokreće auto-sync
const triggerAutoSync = async () => {
  const { autoSync, apiUrl } = useSyncStore.getState();
  if (autoSync && apiUrl) {
    const { syncToWeb } = useServiceStore.getState();
    await syncToWeb();  // Odmah push novog ticketa
  }
};
```

---

## 5. STANJA (STATE MANAGEMENT)

### 5.1 Auth Store
**Lokacija:** `/home/user/workspace/src/state/authStore.ts`

```typescript
interface AuthState {
  user: User | null;                          // Prijavljeni korisnik
  isAuthenticated: boolean;
  allUsers: (User & { password: string })[];  // Svi korisnici (za admina)
  pendingTwoFactorUserId: string | null;      // Pending 2FA verifikacija
  
  // Akcije
  login(username, password): Promise<boolean | "2fa_required">
  completeTwoFactorLogin(): void
  logout(): void
  addUser(user): void
  updateUser(id, updates): void
  deleteUser(id): void
  toggleUserActive(id): void
  syncToWeb(): Promise<boolean>              // Push na web portal
  fetchFromWeb(): Promise<boolean>           // Pull sa web portala
  closeWorkday(): Promise<boolean>           // Zatvori radni dan
  openWorkday(userId, reason, adminId): Promise<boolean>
}

// Persistence
// Storage key: "@auth-storage"
// Čuva se: user, isAuthenticated, pendingTwoFactorUserId, allUsers
```

### 5.2 Service Store
**Lokacija:** `/home/user/workspace/src/state/serviceStore.ts`

```typescript
interface ServiceState {
  tickets: ServiceTicket[];
  currentTicket: ServiceTicket | null;
  
  // Akcije
  addTicket(ticket): void
  updateTicket(id, updates): void
  completeTicket(id): void
  reopenTicket(id): void
  setCurrentTicket(ticket): void
  addOperationToCurrentTicket(operation): void
  addSparePartToCurrentTicket(sparePart): void
  removeOperationFromCurrentTicket(operationId): void
  removeSparePartFromCurrentTicket(sparePartId): void
  cleanupOldCompletedTickets(): void
  syncToWeb(): Promise<boolean>
  syncFromWeb(): Promise<boolean>
  bidirectionalSync(): Promise<boolean>
}

// Persistence
// Storage key: "@service-storage"
// Čuva se: tickets, currentTicket (sa ISO string datumima)
// Cleanup: Briše completed tickete starije od 3 dana

// Bidirectional Sync Flow
// 1. Fetch tickete sa web portala (pull)
// 2. Merge sa lokalnim ticketima (noviji vršit)
// 3. Push sve tickete na web portal
```

### 5.3 Config Store
**Lokacija:** `/home/user/workspace/src/state/configStore.ts`

```typescript
interface ConfigState {
  operations: OperationTemplate[];
  spareParts: SparePartTemplate[];
  lastConfigSync: Date | null;
  isLoading: boolean;
  isConnected: boolean;
  
  // Akcije
  setOperations(operations): void
  setSpareParts(spareParts): void
  fetchConfig(): Promise<boolean>            // GET /api/config/sync
  fetchSparePartsFromSQL(): Promise<boolean> // GET /api/spare-parts
  checkConnection(): Promise<boolean>
}

// Persistence
// Storage key: "@config-storage"
// Čuva se: operations, spareParts, lastConfigSync

// Fallback Ponašanje:
// - Ako nema konekcije sa web portalem
// - Koristi default mock podatke
// - App nastavlja da radi normalno
```

### 5.4 Sync Store
**Lokacija:** `/home/user/workspace/src/state/syncStore.ts`

```typescript
interface SyncState {
  apiUrl: string;                           // URL web portala
  autoSync: boolean;                        // Automatska sinhronizacija
  lastSyncTime: Date | null;
  isSyncing: boolean;
  liveUpdateEnabled: boolean;
  liveUpdateInterval: number;               // Default: 30 sekundi
  
  // Akcije
  setApiUrl(url): void
  setAutoSync(enabled): void
  setLastSyncTime(time): void
  testConnection(): Promise<boolean>
  getBackups(): Promise<any[]>
  createBackup(): Promise<boolean>
  restoreBackup(filename): Promise<boolean>
}

// Persistence
// Storage key: "@sync-storage"
// Čuva se: apiUrl, autoSync, lastSyncTime, liveUpdateEnabled, itd.
```

### 5.5 Device Store
**Lokacija:** `/home/user/workspace/src/state/deviceStore.ts`

```typescript
interface DeviceState {
  deviceId: string | null;
  deviceName: string | null;
  loginHistory: LoginHistory[];
  
  // Akcije
  initializeDevice(): Promise<void>
  recordLogin(userId, username, name): void
  getUniqueUsersCount(): number
  getLoginCount(): number
}

// Persistence
// Storage key: "@device-storage"
// Čuva se: deviceId, deviceName, loginHistory
```

### 5.6 Two Factor Store
**Lokacija:** `/home/user/workspace/src/state/twoFactorStore.ts`

```typescript
interface TwoFactorState {
  userTwoFactorData: Record<string, TwoFactorData>
  
  // Akcije
  enableTwoFactor(userId): { secret, qrData }
  activateTwoFactor(userId, code): Promise<boolean>
  disableTwoFactor(userId): void
  verifyCode(userId, code): Promise<boolean>
  isTwoFactorEnabled(userId): boolean
  getBackupCodes(userId): string[]
  useBackupCode(userId, code): boolean
  regenerateBackupCodes(userId): string[]
}

// Persistence
// Storage key: "@two-factor-storage"

// TOTP Implementation:
// - Base32 32-karakterni secret
// - SHA1 digest algoritam
// - 30-sekundni vremenski prozor (±1 window)
// - 10 backup kodova (8-cifren format)
```

---

## 6. WEB ADMIN PORTAL - DATA PERSISTENCE

### 6.1 DataStore (In-Memory sa JSON persistencijom)

**Lokacija:** `/home/user/workspace/web-admin-portal/lib/dataStore.ts`

```typescript
// Fajlovi na disku
/data/users.json           // Korisnici
/data/tickets.json         // Service ticketi
/data/operations.json      // Operacije (default)
/data/spare-parts.json     // Rezervni delovi (default)
/data/workday-log.json     // Log reopena

// Funkcije
dataStore.getUsers()
dataStore.setUsers(users)
dataStore.addUser(user)
dataStore.updateUser(id, updates)
dataStore.deleteUser(id)

dataStore.getTickets()
dataStore.setTickets(tickets)
dataStore.addTicket(ticket)

dataStore.getOperations()
dataStore.addOperation(op)
dataStore.updateOperation(id, updates)
dataStore.deleteOperation(id)

dataStore.getSpareParts()
dataStore.addSparePart(part)
dataStore.updateSparePart(id, updates)
dataStore.deleteSparePart(id)

dataStore.authenticateUser(username, password)
```

### 6.2 Baza Podataka - Integracija

**Lokacija:** `/home/user/workspace/web-admin-portal/lib/db.ts`

```typescript
// MS SQL Server Konfiguracija
config: {
  user: process.env.DB_USER
  password: process.env.DB_PASSWORD
  server: process.env.DB_SERVER
  database: process.env.DB_NAME
  port: process.env.DB_PORT || 1433
  options: {
    encrypt: true/false          // Za Azure
    trustServerCertificate: true // Za lokalni dev
  }
}

// Query Funkcije
await query(sql, params?)        // SQL upit
await executeProcedure(name, params?)  // Stored procedure
```

#### ERP Integracija - SQL Queryji

**Operacije - ItemCode sa "OP" prefixom:**
```sql
SELECT DISTINCT
  i.ItemId,
  i.ItemCode AS Sifra,
  i.ItemName AS Naziv
FROM Item i
WHERE LEFT(i.ItemCode, 2) = 'OP'
  AND i.Enabled = 1
  AND i.IsStockable = 0
ORDER BY i.ItemCode
```

**Rezervni Delovi - ItemCode sa "102" prefixom:**
```sql
SELECT DISTINCT
  i.ItemId,
  i.ItemCode AS Sifra,
  i.ItemName AS Naziv
FROM Item i
WHERE LEFT(i.ItemCode, 3) = '102'
  AND i.Enabled = 1
  AND i.IsStockable = 1
ORDER BY i.ItemCode
```

---

## 7. SECURITY MEHANIZMI

### 7.1 Rate Limiting
**Lokacija:** `/home/user/workspace/src/utils/security.ts`

```typescript
// syncRateLimiter
syncRateLimiter.isAllowed("syncUsers")    // Max 10 po minuti
syncRateLimiter.isAllowed("syncTickets")

// authRateLimiter
authRateLimiter.isAllowed("login")        // Max 5 po minuti
authRateLimiter.isAllowed("tokenRefresh")
```

### 7.2 Input Sanitizacija
```typescript
InputSanitizer.sanitizeUrl(url)
InputSanitizer.sanitizeObject(data)      // Sanitizuje JSON objekta
```

### 7.3 Error Handling
```typescript
SecureErrorHandler.logError(error, context)
SecureErrorHandler.getUserMessage(error)  // Sigurne poruke za UI
```

### 7.4 Token Management
```typescript
TokenManager.isTokenExpired(token, minutesBefore)
```

### 7.5 2FA Implementacija
- TOTP (Time-based One-Time Password)
- 32-karakterni Base32 secret
- 30-sekundni vremenski prozor
- 10 backup kodova

---

## 8. KOMUNIKACIONI SCENARIJI

### 8.1 Scenario: Novi Service Ticket - Kreiraj i Sinhronizuj

```
┌─────────────────────────────────────────────────────────────┐
│ MOBILNA APP                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Tehnničar kreira novi ticket                            │
│    └─ serviceStore.addTicket(newTicket)                    │
│                                                             │
│ 2. Trigger auto-sync (ako je enabled)                      │
│    └─ syncToWeb() se pokreće                               │
│                                                             │
│ 3. WebAdminAPI.syncTickets([ticket])                       │
│    └─ POST /api/sync/tickets                               │
│       {                                                    │
│         "tickets": [{...ticket...}]                        │
│       }                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓ (HTTP POST)
┌─────────────────────────────────────────────────────────────┐
│ WEB ADMIN PORTAL                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Prihvati POST /api/sync/tickets                          │
│    └─ Validacija: Je li tickets array?                    │
│                                                             │
│ 2. dataStore.setTickets(tickets)                            │
│    └─ Sprema u memoriji                                    │
│    └─ Napisuje u /data/tickets.json                        │
│                                                             │
│ 3. Vraća odgovor                                            │
│    {                                                       │
│      "success": true,                                      │
│      "message": "Tickets synced successfully",             │
│      "data": { "count": 1 }                                │
│    }                                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Scenario: Zatvaranje Radnog Dana

```
┌─────────────────────────────────────────────────────────────┐
│ MOBILNA APP                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Tehnničar klikne "Zatvori radni dan"                    │
│    └─ authStore.closeWorkday()                             │
│                                                             │
│ 2. Lokalno ažuriraj korisnika                               │
│    ├─ user.workdayStatus = "closed"                        │
│    └─ user.workdayClosedAt = now()                         │
│                                                             │
│ 3. WebAdminAPI.closeWorkday(userId, closedAt)              │
│    └─ POST /api/workday/close                              │
│       {                                                    │
│         "userId": "2",                                     │
│         "closedAt": "2024-11-17T16:30:00Z"                 │
│       }                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓ (HTTP POST)
┌─────────────────────────────────────────────────────────────┐
│ WEB ADMIN PORTAL                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Prihvati POST /api/workday/close                         │
│    └─ Validacija: userId, closedAt?                       │
│                                                             │
│ 2. Pronađi korisnika u /data/users.json                     │
│    └─ users.json je in-memory struktura                    │
│                                                             │
│ 3. Ažuriraj korisnika                                       │
│    ├─ users[index].workdayStatus = "closed"                │
│    ├─ users[index].workdayClosedAt = closedAt              │
│    └─ Spremi nazad u /data/users.json                      │
│                                                             │
│ 4. Vraća odgovor sa ažuriranim korisnikom                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ADMIN (sledeći polling)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Admin vidi da je tehnničar zatvorio radni dan            │
│                                                             │
│ 2. Admin želi da ponovo otvori (npr. jer je bila greška)    │
│    └─ POST /api/workday/open                               │
│       {                                                    │
│         "userId": "2",                                     │
│         "reason": "Greška pri zatvaranju - vraćam...",     │
│         "adminId": "1"                                     │
│       }                                                    │
│                                                             │
│ 3. Web portal ažurira korisnika i loguje reopen            │
│    └─ /data/workday-log.json                               │
│                                                             │
│ 4. Sledeći polling - mobilna app vidi "workdayStatus: open"│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Scenario: Pull Konfiguracije iz Web Portala

```
┌─────────────────────────────────────────────────────────────┐
│ MOBILNA APP                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. configStore.fetchConfig()                               │
│    └─ Poziva: GET /api/config/sync                         │
│                                                             │
│ 2. Ako nema konekcije:                                      │
│    └─ Koristi cached podatke sa AsyncStorage               │
│                                                             │
│ 3. Ako ima konekcije:                                       │
│    ├─ Fetch operacija                                      │
│    ├─ Fetch spare parts                                    │
│    ├─ Ažuriraj config store                                │
│    └─ Spremi u AsyncStorage                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓ (HTTP GET)
┌─────────────────────────────────────────────────────────────┐
│ WEB ADMIN PORTAL                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Prihvati GET /api/config/sync?type=operations            │
│    └─ Optional query param                                 │
│                                                             │
│ 2. dataStore.getOperations()                                │
│    └─ Ako postoji /data/operations.json → vratio iz njega  │
│    └─ Ako ne postoji → koristi DEFAULT_OPERATIONS          │
│                                                             │
│ 3. Filter za isActive: true                                 │
│                                                             │
│ 4. Vraća operacije                                          │
│    {                                                       │
│      "success": true,                                      │
│      "data": {                                             │
│        "operations": [                                     │
│          {                                                 │
│            "id": "1",                                      │
│            "code": "OP-001",                               │
│            "name": "Čišćenje rezervoara",                 │
│            "isActive": true                                │
│          }                                                 │
│        ]                                                  │
│      }                                                    │
│    }                                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. OFFLINE-FIRST PRISTUP

### 9.1 Kako App Radi Bez Web Portala

```
┌─────────────────────────────────────────────────────────────┐
│ SCENARIO: WEB PORTAL JE NEDOSTUPAN                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Tehnničar je u polju - nema interneta                    │
│    └─ App pokušava sinhronizaciju - FAIL                  │
│    └─ App nastavlja da radi normalno                       │
│                                                             │
│ 2. Sve akcije se čuvaju LOKALNO                             │
│    ├─ Kreirani ticketi → AsyncStorage                      │
│    ├─ Ažurirani korisnici → AsyncStorage                   │
│    ├─ Operacije → AsyncStorage (cached)                    │
│    └─ Sve vrednosti se čuvaju na uređaju                   │
│                                                             │
│ 3. Tehnničar može normalno:                                 │
│    ├─ Kreiravati service tickete                           │
│    ├─ Dodavati operacije i rezervne delove                 │
│    ├─ Završavati i ponovno otvarati tickete                │
│    ├─ Zatvarati radni dan                                  │
│    └─ Pregledan sve podatke                                │
│                                                             │
│ 4. Kada se internet pojavi:                                │
│    └─ Live sync service automatski sinhronizuje SVE        │
│       ├─ Sve kreirane tickete → web portal                 │
│       ├─ Sve ažuriranja → web portal                       │
│       ├─ Sve informacije o korisnicima → web portal        │
│       └─ APP OSTAJE JEDNOSTAVNA                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Data Persistence Slojevi

```
┌────────────────────────────────────────────┐
│ AsyncStorage (React Native)                │
│ ─────────────────────────────────────────  │
│ • Čuva sve state-ove (persist middleware)  │
│ • Automatski sinhronizuje sa disk           │
│ • Dostupna čak i sa mrtva baterija          │
│ • Limit: ~10MB po app                      │
└────────────────────────────────────────────┘
         ↓ (pri kreiranju/ažuriranju)
┌────────────────────────────────────────────┐
│ Zustand Store (Memory + Persistence)       │
│ ─────────────────────────────────────────  │
│ • Fast reaktivni state management          │
│ • Automatski čuva u AsyncStorage-u         │
│ • Automatski rehydrate-uje pri startu      │
└────────────────────────────────────────────┘
         ↓ (pri live sync-u)
┌────────────────────────────────────────────┐
│ Web Admin Portal (JSON fajlovi + optionalno SQL) │
│ ─────────────────────────────────────────  │
│ • /data/*.json (in-memory sa persistencijom) │
│ • MS SQL Server (ako je konfigurisan ERP)  │
└────────────────────────────────────────────┘
```

---

## 10. ZAKLJUČNA ANALIZA

### 10.1 Prednosti Arhitekture

1. **Offline-First** - App radi bez interneta
2. **Bidirekciona Sinhronizacija** - Push i Pull podaci
3. **Automatska Sinhronizacija** - 5-sec polling
4. **Merge Strategija** - Koristi timestamp za konflikt resolution
5. **Fleksibilna Persistencija** - AsyncStorage (mobile), JSON (portal)
6. **Rate Limiting & Security** - Zaštita od zlouptrebe
7. **Graceful Degradation** - App nastavlja sa cached podacima

### 10.2 Flow Dijagram - Ukupni Pregled

```
┌──────────────────────┐              ┌──────────────────────┐
│ MOBILNA APLIKACIJA   │              │ WEB ADMIN PORTAL     │
│ (React Native Expo)  │              │ (Next.js)            │
├──────────────────────┤              ├──────────────────────┤
│                      │              │                      │
│ Local Data:          │              │ Central Data:        │
│ • Users              │              │ • users.json         │
│ • Tickets            │   ←─→ HTTP   │ • tickets.json       │
│ • Operations         │   (REST)     │ • operations.json    │
│ • Spare Parts        │              │ • spare-parts.json   │
│                      │              │ • workday-log.json   │
│ Storage:             │              │                      │
│ • AsyncStorage       │              │ Optional:            │
│ • Zustand Stores     │              │ • MS SQL Server      │
│                      │              │                      │
│ Sync Service:        │              │ Endpoints:           │
│ • 5-sec polling      │              │ • /api/sync/users    │
│ • Push changes       │              │ • /api/sync/tickets  │
│ • Pull updates       │              │ • /api/config/sync   │
│ • Auto-merge         │              │ • /api/operations    │
│                      │              │ • /api/spare-parts   │
│                      │              │ • /api/workday/*     │
│                      │              │ • /api/health        │
│                      │              │                      │
└──────────────────────┘              └──────────────────────┘
         │                                       │
         └───── Offline-First Architecture ─────┘
              (Radi bez konekcije)
```

### 10.3 Ključne Tehnologije

**Mobilna App:**
- Zustand (state management)
- AsyncStorage (persistence)
- React Native + Expo
- TypeScript

**Web Portal:**
- Next.js (API routes)
- JSON fajlovi (in-memory store)
- MS SQL Server (ERP integracija - optional)
- TypeScript

**Komunikacija:**
- REST API (HTTP)
- JSON format
- 5-sekundni polling
- Content-Type: application/json

---

## 11. DODATNE NAPOMENE

1. **Live Sync je uvek uključen** - Čim je portal dostupan, sinhronizacija se dešava
2. **Merge preferira novije** - Timestamp je ključan
3. **Password se ne šalje** - Samo za login na mobilnoj app
4. **2FA se čuva lokalno** - Secret i backup kodovi na uređaju
5. **Workday Log** - Detaljno loguje sve reopen akcije
6. **Cleanup** - Stari ticketi (>3 dana) se brišu iz memorije
7. **Rate Limiting** - Zaštita od brute force i DoS napada

---

**Dokument Kreiiran:** 2024-11-17  
**Status:** Kompletan pregled arhitekture i API komunikacije
