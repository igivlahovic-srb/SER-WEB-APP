# Web Portal API Specifikacija

Ovaj dokument opisuje API interfejs koji mobilna aplikacija koristi za komunikaciju sa web portalom.

## 📋 Pregled

Web portal je **Next.js aplikacija** koja se nalazi u zasebnom GitHub repozitorijumu:
**https://github.com/igivlahovic-srb/web-admin-portal**

Mobilna aplikacija komunicira sa portalom preko REST API-ja.

---

## 🔌 API Endpoints

### 1. Health Check
Provera da li je portal dostupan.

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

### 2. Sync Users

#### POST - Slanje korisnika na portal
```
POST /api/sync/users
Content-Type: application/json

Body:
{
  "users": [
    {
      "id": "string",
      "charismaId": "string",
      "username": "string",
      "password": "string",
      "name": "string",
      "role": "super_user" | "gospodar" | "technician",
      "depot": "string",
      "isActive": boolean,
      "createdAt": "ISO date string",
      "twoFactorEnabled": boolean (optional),
      "workdayStatus": "open" | "closed" (optional),
      "workdayClosedAt": "ISO date string" (optional)
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Users synced",
  "count": 3
}
```

#### GET - Preuzimanje korisnika sa portala
```
GET /api/sync/users
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "string",
      "charismaId": "string",
      "username": "string",
      "password": "string",
      "name": "string",
      "role": "super_user" | "gospodar" | "technician",
      "depot": "string",
      "isActive": boolean,
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string" (optional)
    }
  ]
}
```

---

### 3. Sync Tickets

#### POST - Slanje servisa na portal
```
POST /api/sync/tickets
Content-Type: application/json

Body:
{
  "tickets": [
    {
      "id": "string",
      "ticketNumber": "string",
      "deviceCode": "string",
      "technicianId": "string",
      "technicianName": "string",
      "status": "in_progress" | "completed",
      "startTime": "ISO date string",
      "endTime": "ISO date string" (optional),
      "durationMinutes": number (optional),
      "operations": [
        {
          "id": "string",
          "ItemCode": "string",
          "ItemName": "string"
        }
      ],
      "spareParts": [
        {
          "id": "string",
          "ItemCode": "string",
          "ItemName": "string",
          "quantity": number,
          "unit": "string"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tickets synced",
  "count": 5
}
```

#### GET - Preuzimanje servisa sa portala
```
GET /api/sync/tickets
```

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": "string",
      "ticketNumber": "string",
      "deviceCode": "string",
      "technicianId": "string",
      "technicianName": "string",
      "status": "in_progress" | "completed",
      "startTime": "ISO date string",
      "endTime": "ISO date string",
      "durationMinutes": number,
      "operations": [...],
      "spareParts": [...],
      "updatedAt": "ISO date string"
    }
  ]
}
```

---

### 4. Spare Parts
Preuzimanje liste rezervnih delova.

```
GET /api/spare-parts
```

**Response:**
```json
{
  "success": true,
  "spareParts": [
    {
      "ItemId": "string",
      "ItemCode": "string",
      "ItemName": "string",
      "unit": "string",
      "isActive": boolean
    }
  ]
}
```

---

### 5. Workday Management

#### POST - Zatvaranje radnog dana
```
POST /api/workday/close
Content-Type: application/json

Body:
{
  "userId": "string",
  "closedAt": "ISO date string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workday closed"
}
```

#### POST - Otvaranje radnog dana (samo admin)
```
POST /api/workday/open
Content-Type: application/json

Body:
{
  "userId": "string",
  "reason": "string (min 10 characters)",
  "adminId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workday opened"
}
```

#### GET - Workday log
```
GET /api/workday/open
```

**Response:**
```json
{
  "success": true,
  "log": [
    {
      "userId": "string",
      "action": "opened" | "closed",
      "timestamp": "ISO date string",
      "openedBy": "string",
      "reason": "string"
    }
  ]
}
```

---

### 6. Backup System

#### GET - Lista backup-ova
```
GET /api/backup
```

**Response:**
```json
{
  "success": true,
  "backups": [
    {
      "filename": "backup-v2.1.0-2024-01-15.tar.gz",
      "version": "2.1.0",
      "date": "ISO date string",
      "size": "123 MB"
    }
  ]
}
```

#### POST - Kreiranje novog backup-a
```
POST /api/backup
```

**Response:**
```json
{
  "success": true,
  "message": "Backup created",
  "filename": "backup-v2.2.0-2024-01-15.tar.gz"
}
```

---

## 🔄 Live Sync Mechanism

Mobilna aplikacija implementira **live bidirectional sync** sa sledećim karakteristikama:

### Polling Interval
- **5 sekundi** - Proverava portal svakih 5 sekundi

### Sync Proces
Svaki sync ciklus izvršava sledeće korake:

1. **Health Check** - Proverava da li je portal dostupan (`GET /api/health`)
2. **Push Local Changes** - Šalje lokalne promene na portal:
   - `POST /api/sync/users` (ako ima novih/izmenjenih korisnika)
   - `POST /api/sync/tickets` (ako ima novih/izmenjenih servisa)
3. **Pull Remote Changes** - Preuzima promene sa portala:
   - `GET /api/sync/users`
   - `GET /api/sync/tickets`
4. **Merge Data** - Spaja lokalne i remote podatke (koristi timestamp za conflict resolution)

### Offline-First
- Aplikacija radi normalno čak i kada portal nije dostupan
- Automatski se reconnect-uje kada portal postane dostupan
- Ne prikazuje greške korisniku kada je offline

### Error Handling
- Automatski ignoriše greške kada portal nije dostupan
- Nastavlja sa radom čak i kada sync ne uspe
- Ne blokira UI tokom sync-a

---

## 🚀 Setup Instrukcije

### Za Mobilnu Aplikaciju:
1. Otvorite aplikaciju
2. Prijavite se
3. Idite na **Profil → Settings**
4. Unesite **Portal URL** (npr. `http://192.168.1.100:3000`)
5. Kliknite **"Testiraj konekciju"**
6. Live sync se automatski aktivira! ⚡

### Za Web Portal:
1. Klonirajte portal repo: `git clone https://github.com/igivlahovic-srb/web-admin-portal`
2. Pratite instrukcije u portal README.md za deployment
3. Portal će biti dostupan na portu 3000

---

## 📝 Napomene

- **CORS**: Portal mora da dozvoli CORS requests od mobilne aplikacije
- **Network**: Mobilna aplikacija i portal moraju biti na istoj mreži ili portal mora biti javno dostupan
- **SSL**: Za produkciju, koristiti HTTPS
- **Auth**: Trenutno nema JWT/token auth - može se dodati u budućnosti

---

## 🔗 Related Files

- `/src/api/web-admin-sync.ts` - API client za komunikaciju sa portalom
- `/src/services/live-sync.ts` - Live sync service (polling mehanizam)
- `/src/state/syncStore.ts` - Zustand store za sync konfiguraciju
- `App.tsx` - Auto-start live sync-a pri pokretanju aplikacije
