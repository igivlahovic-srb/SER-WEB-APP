# Uputstva za Generisanje Ikona Aplikacije

## Kreiranje ikona sa belim slovima

Aplikacija La Fantana WHS koristi ikone sa belim slovima na plavom gradijent pozadini.

### Korak 1: Otvorite Generator

1. Otvorite `generate-icons.html` fajl u web browser-u (Chrome, Firefox, Safari)
2. Stranica će automatski generisati preview svih ikona

### Korak 2: Preuzmi Ikone

Imate 2 opcije:

**Opcija A - Preuzmi sve odjednom:**
- Kliknite na dugme **"Preuzmi Sve"**
- Sačekaće se par sekundi između svakog download-a
- Biće preuzeti svi sledeći fajlovi:
  - `icon.png` (1024x1024)
  - `adaptive-icon.png` (1024x1024)
  - `icon-192.png` (192x192)
  - `favicon.png` (48x48)

**Opcija B - Preuzmi pojedinačno:**
- Desni klik na svaku ikonu → "Save Image As..." ili kliknite na dugme "Preuzmi" ispod svake ikone
- Sačuvajte sa tačnim imenom koje piše pored ikone

### Korak 3: Zameni Fajlove

1. Otvorite `/assets/` folder u projektu
2. Zamenite sledeće fajlove sa novo generisanim:
   - `icon.png`
   - `adaptive-icon.png`
   - `favicon.png`

### Korak 4: Rebuild Aplikacije

```bash
# Očistite cache
rm -rf .expo

# Pokrenite aplikaciju ponovo
bun start
```

## Dizajn Specifikacija

### Boje:
- **Gradijent pozadina**:
  - Start: #1E40AF (tamnoplava)
  - Middle: #3B82F6 (plava)
  - End: #60A5FA (svetloplava)
- **Tekst**: #FFFFFF (bela, 100% opacity)

### Tekst:
- **Glavni tekst**: "LA FANTANA" (bold, 12% veličine ikone)
- **Podnaslov**: "WHS" (bold, 15% veličine ikone)
- **Tagline**: "SERVISNI MODUL" (semi-bold, 4% veličine ikone, 90% opacity)

### Veličine:
- **iOS ikona**: 1024x1024px
- **Android adaptive ikona**: 1024x1024px
- **Notification ikona**: 192x192px
- **Favicon**: 48x48px

## Dodatne Opcije

### Prilagođavanje Dizajna

Ako želite da promenite dizajn, otvorite `generate-icons.html` u text editor-u i promenite:

**Boje:**
```javascript
gradient.addColorStop(0, '#1E40AF');    // Početna boja
gradient.addColorStop(0.5, '#3B82F6');  // Srednja boja
gradient.addColorStop(1, '#60A5FA');    // Krajnja boja
```

**Veličina teksta:**
```javascript
ctx.font = `bold ${size * 0.12}px Arial, sans-serif`;  // LA FANTANA
ctx.font = `bold ${size * 0.15}px Arial, sans-serif`;  // WHS
ctx.font = `600 ${size * 0.04}px Arial, sans-serif`;   // SERVISNI MODUL
```

**Pozicija teksta:**
```javascript
ctx.fillText('LA FANTANA', size / 2, size * 0.42);     // Vertikalna pozicija
ctx.fillText('WHS', size / 2, size * 0.58);            // Vertikalna pozicija
ctx.fillText('SERVISNI MODUL', size / 2, size * 0.75); // Vertikalna pozicija
```

## Rešavanje Problema

**Problem: Download ne radi**
- Rešenje: Koristite desni klik → "Save Image As..." direktno na ikonu

**Problem: Ikone su zamućene**
- Rešenje: Uvek koristite tačne veličine (1024x1024, 192x192, 48x48)

**Problem: Aplikacija ne prikazuje nove ikone**
- Rešenje: Očistite Expo cache: `rm -rf .expo && bun start --clear`

## Podrška

Za dodatna pitanja ili prilagođavanja, kontaktirajte razvoj tim.
