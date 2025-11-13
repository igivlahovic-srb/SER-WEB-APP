#!/bin/bash

# LaFantana WHS - Complete Backup Script
# Kreira kompletan backup mobilne aplikacije + web portala

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION="2.1.0"
BACKUP_NAME="lafantana-whs-backup-v${VERSION}-${TIMESTAMP}.tar.gz"
BACKUP_DIR="/root/lafantana-whs-admin/backups"

echo "🌊 LaFantana WHS - Backup Script"
echo "=================================="
echo ""
echo "Timestamp: ${TIMESTAMP}"
echo "Version: ${VERSION}"
echo "Backup file: ${BACKUP_NAME}"
echo ""

# Create backups directory
mkdir -p "${BACKUP_DIR}"

# Temporary directory for backup
TMP_DIR="/tmp/lafantana-backup-${TIMESTAMP}"
mkdir -p "${TMP_DIR}"

echo "📦 Kreiram backup..."

# Backup web admin portal
if [ -d "/root/lafantana-whs-admin" ]; then
    echo "  - Web admin portal..."
    cp -r /root/lafantana-whs-admin "${TMP_DIR}/web-admin" 2>/dev/null || true
    # Remove node_modules and .next to reduce size
    rm -rf "${TMP_DIR}/web-admin/node_modules"
    rm -rf "${TMP_DIR}/web-admin/.next"
    rm -rf "${TMP_DIR}/web-admin/.git"
fi

# Create tar.gz archive
echo "📁 Kompresujem arhivu..."
cd /tmp
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}" "lafantana-backup-${TIMESTAMP}" 2>/dev/null || true

# Cleanup temporary directory
rm -rf "${TMP_DIR}"

# Keep only last 3 backups
echo "🧹 Čistim stare backup-ove..."
cd "${BACKUP_DIR}"
ls -t lafantana-whs-backup-*.tar.gz | tail -n +4 | xargs -r rm -f

echo ""
echo "✅ Backup završen!"
echo "📍 Lokacija: ${BACKUP_DIR}/${BACKUP_NAME}"
echo ""

# Show backup info
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}" ]; then
    SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}" | cut -f1)
    echo "📊 Veličina: ${SIZE}"
fi

echo ""
echo "📋 Dostupni backup-ovi:"
ls -lh "${BACKUP_DIR}"/lafantana-whs-backup-*.tar.gz 2>/dev/null | awk '{print "  -", $9, "(" $5 ")"}'

exit 0
