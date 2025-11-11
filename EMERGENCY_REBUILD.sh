#!/bin/bash
# EMERGENCY FIX - Potpuno čisti rebuild od nule

echo "================================================"
echo "EMERGENCY FIX - Potpuni Clean Rebuild"
echo "================================================"
echo ""

cd ~/webadminportal/web-admin || exit 1

echo "1/8: Stopiranje portala..."
pm2 stop lafantana-whs-admin 2>/dev/null
pm2 delete lafantana-whs-admin 2>/dev/null
echo "✓ Portal stopiran"
echo ""

echo "2/8: Brisanje SVE (node_modules, .next, cache)..."
rm -rf node_modules
rm -rf .next
rm -rf .next.bak
rm -rf .turbo
rm -f package-lock.json
rm -f bun.lock
echo "✓ Sve obrisano"
echo ""

echo "3/8: Čišćenje npm cache..."
npm cache clean --force
echo "✓ Cache očišćen"
echo ""

echo "4/8: Reinstall node_modules (može trajati 2-3 min)..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install nije uspeo!"
    exit 1
fi
echo "✓ Instalacija uspešna"
echo ""

echo "5/8: Build aplikacije (može trajati 1-2 min)..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build nije uspeo!"
    echo ""
    echo "Proverite grešku iznad i pošaljite mi."
    exit 1
fi
echo "✓ Build uspešan"
echo ""

echo "6/8: Provera da je .next folder kreiran..."
if [ ! -d ".next" ]; then
    echo "❌ .next folder ne postoji nakon build-a!"
    exit 1
fi
ls -la .next/ | head -10
echo "✓ .next folder postoji"
echo ""

echo "7/8: Pokretanje sa PM2..."
pm2 start "npm run start" --name lafantana-whs-admin
pm2 save
echo "✓ Portal pokrenut"
echo ""

echo "8/8: Čekanje da se pokrene..."
sleep 5
echo ""

echo "================================================"
echo "✅ EMERGENCY FIX ZAVRŠEN!"
echo "================================================"
echo ""

# Status
pm2 status

echo ""
echo "Logovi:"
pm2 logs lafantana-whs-admin --lines 20 --nostream

echo ""
echo "Test servera:"
curl -I http://localhost:3002 2>/dev/null | head -5

echo ""
echo "================================================"
echo "SLEDEĆI KORACI:"
echo "================================================"
echo "1. Otvorite NOVI browser tab (ne osvežavajte stari!)"
echo "2. Ili: Zatvorite browser KOMPLETNO i ponovo otvorite"
echo "3. Idite na: http://appserver.lafantanasrb.local:3002"
echo ""
echo "Ako i dalje problemi:"
echo "  pm2 logs lafantana-whs-admin"
echo ""
