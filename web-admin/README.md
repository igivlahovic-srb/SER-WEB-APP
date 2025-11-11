# La Fantana WHS - Web Admin Panel

Web administrativna aplikacija za upravljanje i pregled podataka iz La Fantana WHS mobilne aplikacije.

## 🌐 Funkcionalnosti

### 🔐 Autentifikacija
- Pristup samo za super admin korisnike
- Sigurna prijava sa validacijom
- Sesija čuvana u sessionStorage

### 📊 Dashboard
- Pregled statistika uživo
- Aktivni i završeni servisi
- Broj servisera
- Današnji servisi

### 👥 Upravljanje korisnicima
- Pregled svih korisnika
- Filtriranje po statusu (aktivni/neaktivni)
- Pregled uloga i detalja
- Sinhronizacija sa mobilnom aplikacijom

### 🔧 Istorija servisa
- Kompletan pregled svih servisnih naloga
- Filtriranje po statusu
- Detaljan prikaz svakog servisa:
  - Operacije
  - Rezervni delovi
  - Vremena
  - Napomene

## 🚀 Kako pokrenuti

### Na lokalnom računaru (Development)

```bash
cd web-admin
bun install
bun dev
```

Aplikacija će biti dostupna na `http://localhost:3000`

### 🖥️ Na Ubuntu 22.04 serveru (Production)

**Brza automatska instalacija:**
```bash
# Prebaci web-admin folder na server
scp -r web-admin/ user@server-ip:/home/user/

# SSH na server
ssh user@server-ip

# Pokreni instalacioni script
cd ~/web-admin
chmod +x install-ubuntu.sh
./install-ubuntu.sh
```

**📚 Instalaciona dokumentacija:**
- 📑 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Pregled svih dokumenata
- 📖 **[UBUNTU_INSTALL.md](./UBUNTU_INSTALL.md)** - Potpuna korak-po-korak dokumentacija
- ⚡ **[QUICK_START.md](./QUICK_START.md)** - Brza instalacija za iskusne korisnike
- ✅ **[INSTALL_CHECKLIST.md](./INSTALL_CHECKLIST.md)** - Checklist za praćenje progresa
- ⚙️ **[SYSTEMD_SERVICE.md](./SYSTEMD_SERVICE.md)** - Systemd alternativa za PM2

Instalacioni script automatski instalira sve što je potrebno:
- Node.js 20.x LTS
- Bun package manager
- Sve npm pakete i zavisnosti
- Build aplikacije za produkciju
- Firewall konfiguraciju (port 3002)
- PM2 process manager (opciono)
- Nginx reverse proxy (opciono)

### 🔍 Dijagnostika problema sa konekcijom

Ako imate problema sa povezivanjem mobilne aplikacije:

**Linux/Mac:**
```bash
./diagnose.sh
```

**Windows:**
```cmd
diagnose.bat
```

Ova skripta će:
- Proveriti da li je web server pokrenut
- Prikazati sve dostupne IP adrese
- Testirati API endpointe
- Proveriti firewall postavke
- Dati korisne savete za rešavanje problema

### Production build

```bash
bun run build
bun start
```

## 🔄 Ažuriranje i Održavanje

### Automatski Update Script (Preporučeno)

Koristite **UPDATE.sh** - univerzalni script koji automatski detektuje bun ili npm:

```bash
cd ~/webadminportal/web-admin
chmod +x UPDATE.sh
./UPDATE.sh
```

**Šta UPDATE.sh radi:**
- ✅ Automatski detektuje da li koristite bun ili npm
- ✅ Stopira postojeće procese
- ✅ Čisti cache
- ✅ Instalira dependencies
- ✅ Build-uje aplikaciju
- ✅ Pokreće sa PM2
- ✅ Testira da server radi

### Drugi Načini Ažuriranja

**Ako bun NIJE instaliran:**
```bash
./QUICK_FIX_NPM.sh    # Koristi npm umesto bun-a
```

**Kompletan rebuild:**
```bash
./REBUILD.sh          # Za dublje probleme
```

**Manuelni način:**
```bash
pm2 stop lafantana-whs-admin
rm -rf .next node_modules/.cache
npm install          # ili: bun install
npm run build        # ili: bun run build
pm2 restart lafantana-whs-admin
```

### Troubleshooting Dokumenata

- **BUN_NOT_FOUND.md** - Rešenje za "bun not found" grešku
- **BUN_INSTALL_ERROR.md** - Rešenje za "bun install" greške

## 🔄 Sinhronizacija sa mobilnom aplikacijom

### ⚠️ VAŽNO: Ne koristite localhost!

Mobilna aplikacija **NE MOŽE** da se poveže na `http://localhost:3000`!

Morate koristiti **IP adresu računara**.

### Kako pronaći IP adresu:

**Windows:**
```cmd
ipconfig
```
Potražite "IPv4 Address" koji počinje sa 192.168.x.x

**Mac/Linux:**
```bash
ifconfig
# ili
hostname -I
```

**Brz način - koristite dijagnostičku skriptu:**
```bash
./diagnose.sh      # Linux/Mac
diagnose.bat       # Windows
```

### Koraci za sinhronizaciju:

1. **Pokrenite web admin panel** na računaru:
   ```bash
   cd web-admin
   bun dev
   ```

2. **Pronađite IP adresu** računara (korak iznad)

3. **U mobilnoj aplikaciji**:
   - Idite na **Profil → Settings**
   - Unesite URL: `http://192.168.1.XXX:3000` (zamenite XXX sa vašom IP adresom)
   - Kliknite **"Sačuvaj"**
   - Kliknite **"Testiraj konekciju"**
   - Kada je konekcija uspešna, kliknite **"Sinhronizuj sada"**

4. **Prijavite se na web panel**:
   - Browser: `http://localhost:3000` (na računaru)
   - Username: `admin`
   - Password: `admin123`

### ❌ Česte greške:

| Greška | Razlog | Rešenje |
|--------|--------|---------|
| "Network request failed" | Koristite localhost | Koristite IP adresu računara |
| "Network request failed" | Različite WiFi mreže | Povežite telefon i računar na istu mrežu |
| "Network request failed" | Web panel nije pokrenut | Pokrenite `bun dev` |
| "Network request failed" | Firewall blokira | Dozvolite port 3000 u firewall-u |

### API Endpoints

- `GET /api/health` - Provera da li server radi
- `POST /api/auth` - Prijava korisnika
- `GET /api/sync/users` - Preuzimanje korisnika
- `POST /api/sync/users` - Sinhronizacija korisnika
- `GET /api/sync/tickets` - Preuzimanje servisa
- `POST /api/sync/tickets` - Sinhronizacija servisa

## 📱 Kako koristiti

### 1. Prva prijava

Pre prve prijave, **morate** sinhronizovati podatke iz mobilne aplikacije:
- Otvorite mobilnu aplikaciju
- Prijavite se kao super admin (admin/admin123)
- Idite na Profil → Settings
- Unesite URL web panela i sinhronizujte

### 2. Prijava na web panel

- Otvorite browser i idite na `http://localhost:3000`
- Korisničko ime: `admin`
- Lozinka: `admin123`

### 3. Navigacija

- **Početna** - Statistika i pregled
- **Korisnici** - Upravljanje korisnicima
- **Servisi** - Istorija svih servisa

## 🛡️ Bezbednost

- Samo super admin korisnici mogu pristupiti
- Podaci se čuvaju u memoriji servera
- Sesija istječe kada se zatvori browser
- Nema perzistencije u production (koristi se in-memory storage)

## 🔧 Tehnologije

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Stilizacija
- **date-fns** - Formatiranje datuma
- **Bun** - Package manager i runtime

## 📝 Napomene

- Web panel je **read-only** - ne može menjati podatke
- Upravljanje korisnicima i servisima se vrši iz mobilne aplikacije
- Podatke treba redovno sinhronizovati za najnovije informacije
- Za production koristi se in-memory storage (ne perzistira između restartova)

## 🌍 Network pristup

Da pristupite web panelu sa drugih uređaja u istoj mreži:

1. Pronađite IP adresu računara:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Koristite IP adresu umesto localhost:
   ```
   http://192.168.1.100:3000
   ```

3. U mobilnoj aplikaciji koristite istu IP adresu za sinhronizaciju

---

**Naziv**: La Fantana WHS - Web Admin Panel
**Verzija**: 1.0
**Platforma**: Web (Desktop optimizovano)
**Kompatibilno sa**: La Fantana WHS Mobile App v1.0
