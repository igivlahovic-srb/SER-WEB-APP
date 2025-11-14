# 📦 La Fantana WHS - Web Admin Portal
# SPREMNO ZA DEPLOYMENT NA UBUNTU

## ✅ Šta je spremno:

1. **Web Admin Portal** - Kompletan Next.js portal kloniran sa GitHub-a
2. **Automatski Deployment Script** - `DEPLOY_TO_UBUNTU.sh`
3. **Nginx Configuration** - Sa SSL i reverse proxy
4. **PM2 Setup** - Automatski start pri boot-u
5. **Dokumentacija** - Kompletne instrukcije u 3 fajla

---

## 🚀 KAKO DA INSTALIRAM NA MOM UBUNTU SERVERU?

### Opcija 1: Automatski (PREPORUČENO) ⚡

```bash
# Korak 1: Kopiraj web-admin folder sa svog računara na Ubuntu server
scp -r web-admin root@YOUR_SERVER_IP:/root/

# Korak 2: SSH na server
ssh root@YOUR_SERVER_IP

# Korak 3: Pokreni deployment skriptu (sve će se automatski instalirati)
cd /root/web-admin
sudo bash DEPLOY_TO_UBUNTU.sh
```

**To je SVE!** ✅

Portal će biti dostupan na: `https://admin.lafantanasrb.local`

---

### Opcija 2: Step-by-Step (Manuelno) 📖

Pročitaj: `web-admin/UBUNTU_DEPLOYMENT_GUIDE.md`

---

## 🌐 Kako pristupiti portalu?

### SA SERVERA (direktno):
```
https://localhost
ili
https://admin.lafantanasrb.local
```

### SA DRUGIH RAČUNARA (u lokalnoj mreži):

1. **Na Windows računaru** otvori kao Administrator:
   ```
   C:\Windows\System32\drivers\etc\hosts
   ```

2. **Dodaj liniju:**
   ```
   192.168.1.X    admin.lafantanasrb.local
   ```
   (Zameni X sa IP adresom tvog Ubuntu servera)

3. **Otvori browser:**
   ```
   https://admin.lafantanasrb.local
   ```

4. **Login:**
   - Username: `admin`
   - Password: `admin123`

---

## 🔧 Komande za upravljanje portalom:

```bash
# Proveri status
pm2 status

# Vidi logove
pm2 logs lafantana-whs-admin

# Restartuj portal
pm2 restart lafantana-whs-admin

# Zaustavi portal
pm2 stop lafantana-whs-admin

# Nginx status
sudo systemctl status nginx

# Nginx logovi
sudo tail -f /var/log/nginx/lafantana-admin-access.log
```

---

## 🔄 Kako da update-ujem portal kasnije?

```bash
# 1. Kopiraj nove fajlove sa GitHub-a
git clone https://github.com/igivlahovic-srb/web-admin-portal.git /tmp/web-admin-new

# 2. Backup trenutne verzije
sudo cp -r /var/www/lafantana-admin /var/www/lafantana-admin.backup

# 3. Kopiraj nove fajlove (ČUVA data/ folder!)
sudo rsync -av --exclude 'node_modules' --exclude '.next' --exclude 'data' \
  /tmp/web-admin-new/ /var/www/lafantana-admin/

# 4. Rebuild
cd /var/www/lafantana-admin
bun install --production
bun run build

# 5. Restartuj
pm2 restart lafantana-whs-admin
```

---

## 📁 Struktura nakon instalacije:

```
Ubuntu Server:
│
├── /var/www/lafantana-admin/          ← Web portal aplikacija
│   ├── app/                            ← Next.js app
│   ├── data/                           ← Podaci (korisnici, servisi)
│   ├── .env.local                      ← Environment variables
│   └── ...
│
├── /etc/nginx/
│   ├── sites-available/
│   │   └── lafantana-whs-admin         ← Nginx config
│   └── ssl/
│       ├── lafantana-whs-admin.crt     ← SSL certifikat
│       └── lafantana-whs-admin.key     ← SSL private key
│
└── /var/log/nginx/
    ├── lafantana-admin-access.log      ← Access logovi
    └── lafantana-admin-error.log       ← Error logovi
```

---

## 🐛 Troubleshooting

### Problem: "502 Bad Gateway"
```bash
pm2 status
pm2 restart lafantana-whs-admin
```

### Problem: "Connection Refused"
```bash
sudo systemctl status nginx
sudo systemctl start nginx
```

### Problem: Ne mogu pristupiti sa drugog računara
```bash
# Proveri firewall
sudo ufw status

# Otvori portove
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 📞 Gde da tražim pomoć?

1. **QUICK_START.md** - Brze instrukcije (5 minuta)
2. **UBUNTU_DEPLOYMENT_GUIDE.md** - Detaljan guide sa svim komandama
3. **README.md** - Sve o web admin portalu

Sve je u `web-admin/` folderu!

---

## 🎉 GOTOVO!

Tvoj web admin portal je sada spreman za profesionalnu instalaciju na Ubuntu serveru sa:

✅ HTTPS enkripcijom (SSL)
✅ Nginx reverse proxy
✅ PM2 auto-start
✅ Production optimizacija
✅ Security headers
✅ Logging sistem

**Srećno sa deployment-om!** 🚀

---

**GitHub Repo:** https://github.com/igivlahovic-srb/web-admin-portal
**Verzija:** 2.1.0
**Datum:** 2025-11-14
