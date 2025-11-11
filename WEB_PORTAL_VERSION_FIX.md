# Web Portal - Version API Fix

## 🐛 Problem

Web admin portal prikazuje grešku:

```
Error getting version: Error: Cannot find module '../../../../package.json'
    at .next/server/app/api/version/route.js
    code: 'MODULE_NOT_FOUND'
```

## 🔍 Uzrok

API endpoint `/api/version/route.ts` pokušava da učita `package.json` koristeći relativnu putanju koja nije validna nakon Next.js build-a.

## ✅ Rešenje

### Opcija 1: Popraviti putanju u `/api/version/route.ts`

Lokacija: `/root/webadminportal/web-admin/app/api/version/route.ts`

**Promeniti sa:**
```typescript
import packageJson from '../../../../package.json';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      version: packageJson.version,
    });
  } catch (error) {
    console.error('Error getting version:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get version' },
      { status: 500 }
    );
  }
}
```

**Na:**
```typescript
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Čitaj package.json iz root direktorijuma web-admin projekta
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    return NextResponse.json({
      success: true,
      version: packageJson.version || '1.0.0',
      name: packageJson.name || 'La Fantana WHS Admin',
    });
  } catch (error) {
    console.error('Error getting version:', error);

    // Fallback na default verziju umesto greške
    return NextResponse.json({
      success: true,
      version: '2.1.0', // Default fallback
      name: 'La Fantana WHS Admin',
    });
  }
}
```

### Opcija 2: Hardkodovati verziju (najjednostavnije)

Ako ne treba dinamičko učitavanje verzije:

```typescript
import { NextResponse } from 'next/server';

const VERSION = '2.1.0'; // Ručno ažurirajte kada menjate verziju

export async function GET() {
  return NextResponse.json({
    success: true,
    version: VERSION,
    name: 'La Fantana WHS Admin',
  });
}
```

### Opcija 3: Koristiti environment varijablu

U `.env.local`:
```bash
NEXT_PUBLIC_APP_VERSION=2.1.0
```

U `/api/version/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.1.0',
    name: 'La Fantana WHS Admin',
  });
}
```

## 🚀 Deployment

Nakon što popravite fajl:

```bash
# Idi u web-admin direktorijum
cd /root/webadminportal/web-admin

# Rebuild Next.js aplikaciju
npm run build

# Restartuj PM2
pm2 restart lafantana-whs-admin

# Proveri da greška više ne postoji
pm2 logs lafantana-whs-admin --lines 50
```

## 🧪 Testiranje

```bash
# Testiraj API endpoint
curl http://localhost:3002/api/version

# Očekivani output:
# {
#   "success": true,
#   "version": "2.1.0",
#   "name": "La Fantana WHS Admin"
# }
```

## 📝 Alternativa: Isključiti version endpoint

Ako ne koristite ovaj endpoint, možete ga jednostavno izbrisati:

```bash
rm /root/webadminportal/web-admin/app/api/version/route.ts
npm run build
pm2 restart lafantana-whs-admin
```

## 🔍 Provera putanje do package.json

Za debug, možete dodati console.log da vidite gde Next.js traži fajl:

```typescript
export async function GET() {
  console.log('process.cwd():', process.cwd());
  console.log('__dirname:', __dirname);

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  console.log('Looking for package.json at:', packageJsonPath);
  console.log('Exists?', fs.existsSync(packageJsonPath));

  // ... rest of code
}
```

## 💡 Best Practice

**Preporučujem Opciju 1** jer:
- ✅ Dinamički čita verziju iz `package.json`
- ✅ Ima fallback vrednost ako čitanje ne uspe
- ✅ Ne zahteva ručno ažuriranje verzije
- ✅ Kompatibilno sa Next.js build sistemom

---

**Napravljeno sa**: Claude Code
**Za**: La Fantana WHS Web Admin Portal
**Datum**: 2025-01-11
