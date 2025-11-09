# Quick Start - Web Admin Panel na Ubuntu 22.04

Brza instalacija za iskusnije korisnike.

---

## 🚀 Automatska instalacija (preporučeno)

```bash
# 1. Prebaci web-admin folder na server
scp -r web-admin/ user@server-ip:/home/user/

# 2. SSH na server
ssh user@server-ip

# 3. Uđi u folder
cd ~/web-admin

# 4. Pokreni instalacioni script
chmod +x install-ubuntu.sh
./install-ubuntu.sh
```

Script automatski instalira:
- Node.js 20.x LTS
- Bun
- Sve npm pakete
- Build aplikacije
- Firewall konfiguraciju
- PM2 process manager (opciono)
- Nginx reverse proxy (opciono)

---

## ⚡ Manualna instalacija (brza)

```bash
# Ažuriraj sistem
sudo apt update && sudo apt upgrade -y

# Instaliraj Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instaliraj Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Uđi u web-admin folder
cd ~/web-admin

# Instaliraj pakete
bun install

# Build
bun run build

# Pokreni
bun run start
```

Aplikacija dostupna na: `http://server-ip:3002`

---

## 🔄 PM2 (održavanje aplikacije pokrenutom)

```bash
# Instaliraj PM2
sudo npm install -g pm2

# Pokreni aplikaciju
cd ~/web-admin
pm2 start "bun run start" --name water-admin
pm2 save
pm2 startup
# IZVRŠI KOMANDU KOJU PM2 ISPIŠE!
```

---

## 🌐 Nginx (pristup na portu 80)

```bash
# Instaliraj Nginx
sudo apt install -y nginx

# Kreiraj config
sudo nano /etc/nginx/sites-available/water-admin
```

Dodaj:
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktiviraj:
```bash
sudo ln -s /etc/nginx/sites-available/water-admin /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo ufw allow 80/tcp
```

---

## 📱 Povezivanje sa mobilnom aplikacijom

1. Prijavi se kao **admin** (admin/admin123)
2. **Profil → Settings**
3. Unesi URL: `http://SERVER-IP:3002`
4. **Sačuvaj** → **Testiraj konekciju** → **Sinhronizuj**

**VAŽNO**: Koristi IP adresu servera, NE `localhost`!

---

## ✅ Verifikacija

```bash
# Proveri da li radi
curl http://localhost:3002

# Proveri PM2
pm2 status

# Proveri portove
sudo ss -tlnp | grep 3002
```

---

## 🐛 Troubleshooting

### "bun: command not found"
```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

### Port zauzet
```bash
sudo lsof -i :3002
sudo kill -9 PID
```

### Firewall blokira
```bash
sudo ufw allow 3002/tcp
sudo ufw status
```

---

## 🔐 Default login

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ OBAVEZNO PROMENI LOZINKU!**

---

**Za detaljnu dokumentaciju pogledaj: UBUNTU_INSTALL.md**
