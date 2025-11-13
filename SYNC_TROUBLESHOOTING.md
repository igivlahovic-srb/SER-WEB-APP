# Troubleshooting - Telefon ne može da se poveže na Web Portal

## Problem: "i dalje offline od portala"

Mobilna aplikacija ne može da se poveže na web admin portal sa Windows mašine.

---

## Checklist za rešavanje problema

### 1. ✅ Proveri da li portal radi na Windows mašini

**Na Windows mašini:**

```powershell
cd D:\web-admin-portal

# Proveri da li server radi
# Trebalo bi da vidiš: "▲ Next.js ... - Local: http://localhost:3000"
```

Ako server **NE RADI**, pokreni ga:
```powershell
npm run dev
```

### 2. ✅ Proveri IP adresu Windows mašine

**Na Windows mašini:**

```powershell
ipconfig
```

Traži **"IPv4 Address"** pod **"Wireless LAN adapter Wi-Fi"** ili **"Ethernet adapter"**.

Primer:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.200.107
```

**IMPORTANT:** Koristi ovu IP adresu, **NE** `localhost` ili `127.0.0.1`!

### 3. ✅ Proveri da telefon i računar su na istoj Wi-Fi mreži

**Telefon i Windows mašina MORAJU biti na istoj Wi-Fi mreži!**

- **Na telefonu:** Otvori Settings → Wi-Fi → Proveri ime mreže
- **Na Windows mašini:** Settings → Network & Internet → Wi-Fi → Proveri ime mreže

Ako nisu na istoj mreži:
- Prebaci telefon na istu Wi-Fi mrežu kao računar
- ILI prebaci računar na istu Wi-Fi mrežu kao telefon

### 4. ✅ Proveri Windows Firewall

Windows Firewall može blokirati dolazne konekcije na port 3000.

**Opcija A: Privremeno isključi firewall (za testiranje)**

```powershell
# Proveri status firewall-a
Get-NetFirewallProfile | Select-Object Name, Enabled

# Privremeno isključi (samo za testiranje!)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

**IMPORTANT:** Nemoj zaboraviti da ponovo uključiš firewall nakon testiranja!

```powershell
# Uključi ponovo firewall
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

**Opcija B: Dodaj firewall pravilo za port 3000 (preporučeno)**

```powershell
# Dodaj firewall pravilo
New-NetFirewallRule -DisplayName "Allow Next.js Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 5. ✅ Testiraj konekciju sa druge mašine na istoj mreži

**Na drugom računaru ili telefonu (preko browser-a):**

```
http://192.168.200.107:3000
```

Zameni `192.168.200.107` sa IP adresom tvoje Windows mašine.

- ✅ **Ako se učita portal** - Firewall nije problem
- ❌ **Ako se NE učita** - Firewall ili mreža blokiraju konekciju

### 6. ✅ Konfiguriši mobilnu aplikaciju

**U mobilnoj aplikaciji:**

1. Otvori **Settings** (Podešavanja)
2. Skroluj do dna do **"Podešavanja API-ja"**
3. U polje **"Web Admin Panel URL"** unesi:
   ```
   http://192.168.200.107:3000
   ```
   (Zameni `192.168.200.107` sa IP adresom tvoje Windows mašine)
4. Pritisni **"💾 Sačuvaj"**
5. Pritisni **"🔌 Testiraj"**

**Očekivani rezultat:**
- ✅ **"Konekcija sa web panelom je uspešna! ✅"** - Sve radi!
- ❌ **"Connection timeout"** ili **"Cannot reach web panel"** - Vrati se na korak 3 ili 4

### 7. ✅ Uključi automatsku sinhronizaciju

**U mobilnoj aplikaciji, u Settings:**

1. Uključi **"Automatska sinhronizacija"** switch
2. Uključi **"Portal Live Update"** switch
3. Pritisni **"Sinhronizuj sada"**

**Očekivani rezultat:**
- ✅ **"Svi podaci su uspešno sinhronizovani sa web panelom! ✅"**

---

## Česte greške i rešenja

### Greška: "Connection timeout - check if web panel is running"

**Uzrok:** Firewall blokira konekciju ili portal nije pokrenut

**Rešenje:**
1. Proveri da portal radi (`npm run dev`)
2. Isključi Windows Firewall privremeno za testiranje
3. Dodaj firewall pravilo (vidi korak 4)

### Greška: "Cannot reach web panel - check URL and network"

**Uzrok:** Pogrešan URL ili telefon nije na istoj mreži

**Rešenje:**
1. Proveri IP adresu Windows mašine (`ipconfig`)
2. Proveri da telefon i računar su na istoj Wi-Fi mreži
3. Koristi **IP adresu**, ne `localhost`!

### Greška: Koristio sam `localhost` umesto IP adrese

**Problem:** `localhost` ili `127.0.0.1` **NE RADI** iz mobilne aplikacije!

**Rešenje:** Koristi stvarnu IP adresu Windows mašine (npr. `192.168.200.107`)

### Greška: "Network request failed"

**Uzrok:**
- Telefon nije povezan na istu mrežu
- Firewall blokira port 3000
- Router blokira komunikaciju između uređaja (AP isolation)

**Rešenje:**
1. Proveri Wi-Fi mrežu (ista na telefonu i računaru)
2. Proveri firewall (dodaj pravilo ili privremeno isključi)
3. Ako koristiš **Router AP Isolation** mode, isključi ga u router settings-ima

---

## Testiranje sa desktop browser-om (za debugging)

Ako želiš da proveriš da li portal radi na mreži, otvori browser na **drugom računaru** na istoj mreži i idi na:

```
http://192.168.200.107:3000
```

Ako se učita portal, onda znaš da:
- ✅ Portal radi
- ✅ Firewall ne blokira
- ✅ Mreža omogućava komunikaciju

Ako se **NE** učita:
- ❌ Firewall blokira
- ❌ Router blokira (AP isolation)
- ❌ Portal nije pokrenut

---

## Alternativno rešenje: Koristi ngrok za javni pristup

Ako **NE MOŽEŠ** da rešiš firewall ili mrežu, koristi **ngrok** da izložiš portal na internet:

### 1. Instaliraj ngrok

Download sa https://ngrok.com/download

### 2. Pokreni ngrok

```powershell
ngrok http 3000
```

### 3. Kopiraj ngrok URL

Ngrok će ti dati URL kao:
```
https://1234-abcd-5678-efgh.ngrok-free.app
```

### 4. Koristi taj URL u mobilnoj aplikaciji

U Settings → Web Admin Panel URL:
```
https://1234-abcd-5678-efgh.ngrok-free.app
```

**PREDNOSTI:**
- ✅ Radi sa bilo koje mreže (ne mora biti ista Wi-Fi)
- ✅ Nema firewall problema
- ✅ Možeš pristupiti čak i van kuće

**MANE:**
- ❌ Besplatna verzija ngrok-a ima rate limite
- ❌ URL se menja svaki put kad pokreneš ngrok
- ❌ Bezbednosni rizik (javno izložen portal)

---

## Provera logova na Windows mašini

Kada pokušaš sync sa telefona, proveri terminal na Windows mašini gde radi `npm run dev`.

**Trebalo bi da vidiš:**
```
[SYNC] Received POST request to /api/sync/users
[SYNC] Syncing 3 users to dataStore
[SYNC] Users synced successfully
```

**Ako NE VIDIŠ logove** - telefon uopšte ne šalje request (proveri konekciju)

**Ako VIDIŠ logove** - sinhronizacija radi! ✅

---

## Konačna provera

Nakon što sve podeseš, idi u mobilnu aplikaciju i:

1. **Kreiraj novi servis** ili **završi postojeći servis**
2. **Proveri logove** na Windows mašini - trebalo bi da vidiš `[SYNC]` poruke
3. **Osvježi portal** u browser-u - novi servis bi trebalo da se pojavi!

Ako sve radi - **AUTOMATSKA SINHRONIZACIJA JE AKTIVNA!** 🎉

---

## Dodatna pomoć

Ako ni jedno rešenje ne radi, pošalji mi:
1. Screenshot greške sa telefona
2. IP adresu Windows mašine
3. Screenshot firewall podešavanja
4. Logove sa terminala (ako ima)
