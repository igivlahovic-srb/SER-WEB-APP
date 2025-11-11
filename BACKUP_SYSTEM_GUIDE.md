# La Fantana WHS - Backup System Guide

## 📋 Pregled

Backup sistem omogućava kreiranje kompletne arhive celog projekta, uključujući:
- ✅ Mobilna aplikacija source code (React Native + Expo)
- ✅ Web admin panel source code (Next.js)
- ✅ Android APK fajlovi
- ✅ Environment fajlovi (.env, .env.local)
- ✅ Sve konfiguracione fajlove
- ✅ BACKUP_INFO.txt sa detaljima backup-a
- ✅ RESTORE_GUIDE.txt sa uputstvima za restore

## 🚀 Kako koristiti Backup sistem

### Putem Web Admin Panela (Preporučeno)

1. **Prijavite se kao super_user ili gospodar**:
   ```
   Username: admin
   Password: admin123
   ```

2. **Kliknite na "Backup" tab** u navigaciji

3. **Kreirajte novi backup**:
   - Kliknite na dugme "Kreiraj Backup"
   - Sačekajte 1-2 minuta (backup radi u pozadini)
   - Kliknite "Refresh" da vidite novi backup

4. **Preuzmite backup**:
   - U tabeli sa backup-ovima, kliknite na "Preuzmi" dugme
   - Backup će se preuzeti kao `.tar.gz` fajl

5. **Istorija backup-ova**:
   - Web portal prikazuje poslednja 3 backup-a
   - Svaki backup pokazuje: verziju, datum, veličinu, naziv fajla
   - Najnoviji backup je označen sa zelenim "Najnoviji" badge-om

### Preko Command Line (Ubuntu Server)

```bash
# Idi u glavnu direktorijum projekta
cd /root/webadminportal

# Pokreni backup script
./CREATE_BACKUP.sh
```

**Šta script radi:**
1. Čita verziju iz `app.json` (npr. 2.1.0)
2. Kreira timestamp (YYYYmmdd-HHMMSS)
3. Backup-uje mobilnu aplikaciju (bez node_modules, .expo, .git)
4. Backup-uje web admin (bez node_modules, .next)
5. Backup-uje APK fajlove (ako postoje)
6. Kopira environment fajlove
7. Kreira BACKUP_INFO.txt i RESTORE_GUIDE.txt
8. Pakuje sve u tar.gz arhivu
9. Briše backupe starije od 3 najnovija
10. Postavlja permissions za download

**Backup lokacija:**
```
/root/webadminportal/web-admin/public/backups/
```

**Naziv backup fajla:**
```
lafantana-whs-backup-v2.1.0-20251111-143000.tar.gz
                      │       │        └─ Vreme (HHMMSS)
                      │       └────────── Datum (YYYYmmdd)
                      └────────────────── Verzija
```

## 📦 Šta sadrži backup

### Struktura arhive:
```
lafantana-whs-backup-v2.1.0-20251111-143000/
├── BACKUP_INFO.txt           # Info o backup-u (datum, verzija, hostname)
├── RESTORE_GUIDE.txt         # Detaljno uputstvo za restore
├── mobile-app/               # Mobilna aplikacija
│   ├── src/
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   ├── .env                  # Environment fajl
│   └── ... (sve ostalo sem node_modules, .expo, .git)
├── web-admin/                # Web admin panel
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   ├── .env.local            # Environment fajl
│   └── ... (sve ostalo sem node_modules, .next)
└── apk/                      # Android APK fajlovi (ako postoje)
    ├── lafantana-v2.1.0.apk
    └── ...
```

## 🔄 Kako restore-ovati backup

### Quick Restore (Detaljnije uputstvo u backup arhivi)

```bash
# 1. Ekstraktuj backup
cd /root
tar -xzf lafantana-whs-backup-v2.1.0-20251111-143000.tar.gz

# 2. Zaustavi servise
pm2 stop all

# 3. Backup trenutne instalacije (za svaki slučaj)
mv /root/webadminportal /root/webadminportal.old

# 4. Restore mobile app
mkdir -p /root/webadminportal
cp -r lafantana-whs-backup-*/mobile-app/* /root/webadminportal/

# 5. Restore web admin
cp -r lafantana-whs-backup-*/web-admin /root/webadminportal/

# 6. Restore APKs (ako postoje)
if [ -d "lafantana-whs-backup-*/apk" ]; then
  mkdir -p /root/webadminportal/web-admin/public/apk
  cp -r lafantana-whs-backup-*/apk/* /root/webadminportal/web-admin/public/apk/
fi

# 7. Instaliraj dependencies
cd /root/webadminportal
npm install

cd /root/webadminportal/web-admin
npm install --include=dev
npm run build

# 8. Restart servise
pm2 restart all

# 9. Verifikuj
pm2 status
curl http://localhost:3002
```

**VAŽNO:** Detaljno uputstvo za restore se nalazi u `RESTORE_GUIDE.txt` fajlu unutar svake backup arhive!

## 🛠️ Deploy Backup Sistema na Ubuntu Server

```bash
# Na Ubuntu serveru, pokreni deployment script:
cd /root/webadminportal
./DEPLOY_BACKUP_SYSTEM.sh
```

**Script automatski:**
1. Povlači najnovije izmene sa git-a
2. Pravi CREATE_BACKUP.sh izvršnim
3. Kreira backups direktorijum
4. Reinstalira web-admin dependencies
5. Build-uje web-admin
6. Restartuje PM2

## 📝 API Endpoints

### GET /api/backup
**Opis:** Vraća listu poslednja 3 backup-a

**Response:**
```json
{
  "success": true,
  "data": {
    "backups": [
      {
        "name": "lafantana-whs-backup-v2.1.0-20251111-143000.tar.gz",
        "version": "2.1.0",
        "timestamp": "20251111-143000",
        "size": 52428800,
        "date": "11.11.2025 14:30",
        "downloadUrl": "/backups/lafantana-whs-backup-v2.1.0-20251111-143000.tar.gz"
      }
    ],
    "hasBackups": true
  }
}
```

### POST /api/backup
**Opis:** Pokreće kreiranje novog backup-a u pozadini

**Response:**
```json
{
  "success": true,
  "message": "Backup je pokrenut u pozadini. Sačekajte 1-2 minuta i refresh-ujte stranicu."
}
```

## ⚙️ Konfiguracija

### Promena broja čuvanih backup-ova

U `CREATE_BACKUP.sh` fajlu (linije 161-168):
```bash
# Keep only last 3 backups
BACKUP_COUNT=$(ls -t lafantana-whs-backup-*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 3 ]; then
    echo "Cleaning old backups (keeping latest 3)..."
    ls -t lafantana-whs-backup-*.tar.gz | tail -n +4 | xargs rm -f
    echo "✓ Old backups removed"
fi
```

**Promeni 3 na željen broj** (npr. 5 za čuvanje 5 backup-ova).

### Promena backup lokacije

U `CREATE_BACKUP.sh` fajlu (linija 9):
```bash
BACKUP_DIR="/root/webadminportal/web-admin/public/backups"
```

**Promeni putanju** na željenu lokaciju.

## 🔐 Bezbednost

- **Backup sadrži .env fajlove** - čuvajte backup-ove na bezbednom mestu
- **Backup sadrži credentials** - ne delite backup-ove javno
- **Download preko web portala** - samo super_user i gospodar imaju pristup
- **Permissions** - backup fajlovi su 644 (read za sve, write samo za owner)

## 📊 Tipične veličine backup-a

- **Mobilna app source**: ~10-20 MB (bez node_modules)
- **Web admin source**: ~5-10 MB (bez node_modules, .next)
- **APK fajlovi**: ~30-50 MB po fajlu
- **Ukupan backup**: ~50-100 MB (zavisno od broja APK fajlova)

## ❓ Troubleshooting

### Backup ne kreće?

**Problem:** Kliknuli ste "Kreiraj Backup" ali ništa se ne dešava

**Rešenje:**
```bash
# Na Ubuntu serveru, proverite da li script postoji i da je executable:
ls -la /root/webadminportal/CREATE_BACKUP.sh
chmod +x /root/webadminportal/CREATE_BACKUP.sh

# Pokrenite manualno da vidite grešku:
cd /root/webadminportal
./CREATE_BACKUP.sh
```

### Backup traje predugo?

**Problem:** Backup proces traje duže od 2 minuta

**Moguće razloge:**
- Veliki broj APK fajlova u `web-admin/public/apk/`
- Spor disk ili CPU
- node_modules nije isključen iz backup-a (proveri rsync --exclude)

**Rešenje:**
```bash
# Očisti stare APK fajlove:
cd /root/webadminportal/web-admin/public/apk/
ls -t lafantana-*.apk | tail -n +4 | xargs rm -f
```

### Backup fajl se ne pojavljuje na web portalu?

**Problem:** Kreirao si backup preko command line ali ga ne vidiš na web portalu

**Rešenje:**
```bash
# Proveri permissions:
ls -la /root/webadminportal/web-admin/public/backups/

# Postavi correct permissions:
chmod 644 /root/webadminportal/web-admin/public/backups/*.tar.gz
```

### Download ne radi?

**Problem:** Klik na "Preuzmi" dugme ne preuzima fajl

**Rešenje:**
1. Proveri da li fajl postoji:
   ```bash
   ls -la /root/webadminportal/web-admin/public/backups/
   ```

2. Proveri da li Next.js služi fajlove iz public/:
   ```bash
   curl http://localhost:3002/backups/
   ```

3. Restartuj web portal:
   ```bash
   pm2 restart lafantana-whs-admin
   ```

## 🎯 Best Practices

1. **Redovno pravi backup-ove** pre većih izmena
2. **Test restore proces** bar jednom da se uveriš da radi
3. **Čuvaj backup-ove van servera** (download na local računar ili cloud)
4. **Dokumentuj izmene** pre pravljenja backup-a
5. **Verifikuj backup** nakon kreiranja (proveri veličinu i sadržaj)

## 🔗 Korisni linkovi

- Web portal Backup tab: `http://appserver.lafantanasrb.local:3002/backup`
- Backup lokacija: `/root/webadminportal/web-admin/public/backups/`
- Script lokacija: `/root/webadminportal/CREATE_BACKUP.sh`

---

**Napravljeno sa**: Claude Code
**Verzija**: 2.1.0
