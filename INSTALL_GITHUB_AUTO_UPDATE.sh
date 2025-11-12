#!/bin/bash
# Automatska instalacija GitHub Auto-Update funkcionalnosti

set -e

echo "================================================"
echo "Web Portal - GitHub Auto-Update Instalacija"
echo "================================================"
echo ""

WEB_ADMIN_DIR="/root/webadminportal/web-admin"

if [ ! -d "$WEB_ADMIN_DIR" ]; then
    echo "❌ Web admin direktorijum ne postoji: $WEB_ADMIN_DIR"
    exit 1
fi

cd "$WEB_ADMIN_DIR"

echo "Korak 1/5: Kreiranje API endpoint-a za proveru verzije..."
mkdir -p app/api/github-version

cat > app/api/github-version/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const GITHUB_BRANCH = 'main';

export async function GET() {
  try {
    const cwd = '/root/webadminportal/web-admin';

    const { stdout: currentCommit } = await execAsync(
      'git rev-parse --short HEAD',
      { cwd }
    );

    await execAsync('git fetch origin', { cwd });

    const { stdout: latestCommit } = await execAsync(
      `git rev-parse --short origin/${GITHUB_BRANCH}`,
      { cwd }
    );

    const { stdout: behindByStr } = await execAsync(
      `git rev-list --count HEAD..origin/${GITHUB_BRANCH}`,
      { cwd }
    );

    const { stdout: latestMessage } = await execAsync(
      `git log origin/${GITHUB_BRANCH} -1 --pretty=format:%s`,
      { cwd }
    );

    const behindBy = parseInt(behindByStr.trim(), 10);

    return NextResponse.json({
      success: true,
      data: {
        currentCommit: currentCommit.trim(),
        latestCommit: latestCommit.trim(),
        hasUpdate: behindBy > 0,
        behindBy,
        latestCommitMessage: latestMessage.trim(),
      },
    });
  } catch (error) {
    console.error('Error checking GitHub version:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check version' },
      { status: 500 }
    );
  }
}
EOF

echo "✓ github-version API kreiran"

echo "Korak 2/5: Kreiranje API endpoint-a za update..."
mkdir -p app/api/portal-update

cat > app/api/portal-update/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST() {
  try {
    const updateScript = `
#!/bin/bash
set -e
cd /root/webadminportal/web-admin

echo "[Update] Backing up data..."
cp -r data data.backup 2>/dev/null || true

echo "[Update] Pulling changes..."
git stash
git pull origin main

if [ ! -d "data" ] && [ -d "data.backup" ]; then
    mv data.backup data
    echo "[Update] Data restored"
else
    rm -rf data.backup 2>/dev/null || true
fi

echo "[Update] Building..."
npm install
npm run build

echo "[Update] Restarting..."
pm2 restart lafantana-whs-admin

echo "[Update] ✅ Done!"
    `;

    const fs = require('fs');
    const scriptPath = '/tmp/portal-update.sh';
    fs.writeFileSync(scriptPath, updateScript, { mode: 0o755 });

    exec(\`nohup bash \${scriptPath} > /tmp/portal-update.log 2>&1 &\`);

    return NextResponse.json({
      success: true,
      message: 'Update started. Please wait 2-3 minutes.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Update failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fs = require('fs');
    const logPath = '/tmp/portal-update.log';

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({
        success: true,
        data: { isUpdating: false, log: null },
      });
    }

    const log = fs.readFileSync(logPath, 'utf-8');
    const isUpdating = !log.includes('✅ Done!');

    return NextResponse.json({
      success: true,
      data: {
        isUpdating,
        log: log.split('\n').slice(-20).join('\n'),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to check status' },
      { status: 500 }
    );
  }
}
EOF

echo "✓ portal-update API kreiran"

echo "Korak 3/5: Kreiranje Banner komponente..."
mkdir -p components

cat > components/PortalUpdateBanner.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';

export default function PortalUpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [behindBy, setBehindBy] = useState(0);
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!updating) return;
    const interval = setInterval(checkUpdateStatus, 5000);
    return () => clearInterval(interval);
  }, [updating]);

  const checkForUpdates = async () => {
    try {
      const res = await fetch('/api/github-version');
      const data = await res.json();

      if (data.success && data.data) {
        setHasUpdate(data.data.hasUpdate);
        setBehindBy(data.data.behindBy);
        setMessage(data.data.latestCommitMessage);
      }
    } catch (error) {
      console.error('Error checking updates:', error);
    }
  };

  const checkUpdateStatus = async () => {
    try {
      const res = await fetch('/api/portal-update');
      const data = await res.json();

      if (data.success && data.data && !data.data.isUpdating) {
        setTimeout(() => window.location.reload(), 3000);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleUpdate = async () => {
    if (!confirm('Ažurirati portal? Biće nedostupan 2-3 minuta.')) return;

    setUpdating(true);

    try {
      await fetch('/api/portal-update', { method: 'POST' });
    } catch (error) {
      alert('Greška pri ažuriranju');
      setUpdating(false);
    }
  };

  if (!hasUpdate || dismissed) return null;

  if (updating) {
    return (
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Portal se ažurira... Stranica će se automatski osvežiti.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold">
            🎉 Nova verzija portala je dostupna!
          </p>
          <p className="text-xs opacity-90">
            {behindBy} {behindBy === 1 ? 'nova izmena' : 'novih izmena'} • {message}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdate}
            className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50"
          >
            Ažuriraj Portal
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
EOF

echo "✓ Banner komponenta kreirana"

echo "Korak 4/5: Ažuriranje layout.tsx..."

# Backup layout.tsx
cp app/layout.tsx app/layout.tsx.backup

# Proveri da li već ima import
if grep -q "PortalUpdateBanner" app/layout.tsx; then
    echo "⚠ Layout već ima PortalUpdateBanner - preskačem"
else
    # Dodaj import na vrh fajla (nakon postojećih import-a)
    sed -i "/^import/a import PortalUpdateBanner from '@/components/PortalUpdateBanner';" app/layout.tsx

    # Dodaj banner nakon <body> taga
    sed -i "s/<body>/<body>\n        <PortalUpdateBanner \/>/" app/layout.tsx

    echo "✓ Layout.tsx ažuriran"
fi

echo "Korak 5/5: Build i restart..."
npm run build

pm2 restart lafantana-whs-admin

echo ""
echo "================================================"
echo "✅ INSTALACIJA ZAVRŠENA!"
echo "================================================"
echo ""
echo "Test API endpoint:"
echo "  curl http://localhost:3002/api/github-version | jq"
echo ""
echo "Refresh portal u browser-u - trebalo bi da vidite banner ako ima nova verzija!"
echo ""
