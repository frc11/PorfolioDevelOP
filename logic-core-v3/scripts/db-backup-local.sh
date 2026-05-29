#!/usr/bin/env bash
# B14.3 — Backup manual local (espejo del workflow .github/workflows/db-backup.yml).
#
# Para correr en emergencia o ad-hoc. El workflow GH Actions corre diario;
# este script es para cuando lo necesités fuera de horario.
#
# Requisitos:
#   - pg_dump 16+ (instalá postgresql-client-16 o usá Git Bash con docker)
#   - gpg (Git for Windows lo trae en C:\Program Files\Git\usr\bin\gpg.exe)
#   - DIRECT_DATABASE_URL en el environment (NO la pooled — pg_dump no soporta pooler)
#   - BACKUP_GPG_PASSPHRASE en el environment (la misma que el secret de GH)
#
# Output:
#   ./backups/neon-<env>-backup-<timestamp>.sql.gz.gpg
#
# El archivo queda LOCAL — NO se commitea (gitignored). Para restaurar:
#   ./scripts/db-restore-local.sh ./backups/<file> <TARGET_URL>
#
# Usage:
#   DIRECT_DATABASE_URL='postgresql://...' BACKUP_GPG_PASSPHRASE='...' ./scripts/db-backup-local.sh
#   DIRECT_DATABASE_URL='postgresql://...' BACKUP_GPG_PASSPHRASE='...' ./scripts/db-backup-local.sh prod

set -euo pipefail

ENV_LABEL="${1:-dev}"

if [ -z "${DIRECT_DATABASE_URL:-}" ]; then
  echo "ERROR: DIRECT_DATABASE_URL no está seteada." >&2
  echo "       Esta URL es la DIRECTA (sin -pooler en el subdomain)." >&2
  exit 1
fi

if [ -z "${BACKUP_GPG_PASSPHRASE:-}" ]; then
  echo "ERROR: BACKUP_GPG_PASSPHRASE no está seteada." >&2
  echo "       Usá la misma passphrase que el secret de GitHub." >&2
  exit 1
fi

# Sanity check rápido: si la URL contiene -pooler, advertir y abortar.
if echo "$DIRECT_DATABASE_URL" | grep -q -- '-pooler\.'; then
  echo "ERROR: DIRECT_DATABASE_URL parece la POOLED ('-pooler' detectado)." >&2
  echo "       pg_dump requiere conexión directa — sacá '-pooler' del subdomain." >&2
  exit 1
fi

if ! command -v pg_dump > /dev/null; then
  echo "ERROR: pg_dump no encontrado en PATH." >&2
  echo "       Instalar: https://www.postgresql.org/download/ (postgresql-client-16+)" >&2
  exit 1
fi

if ! command -v gpg > /dev/null; then
  echo "ERROR: gpg no encontrado en PATH." >&2
  echo "       En Windows viene con Git: C:\\Program Files\\Git\\usr\\bin\\gpg.exe" >&2
  exit 1
fi

mkdir -p backups
DATE=$(date -u +%Y%m%d-%H%M%S)
OUT="backups/neon-${ENV_LABEL}-backup-${DATE}.sql.gz.gpg"

echo "═══════════════════════════════════════════════════════"
echo "  pg_dump local — target: ${ENV_LABEL}"
echo "  output:        ${OUT}"
echo "  pg_dump:       $(pg_dump --version)"
echo "═══════════════════════════════════════════════════════"

pg_dump "$DIRECT_DATABASE_URL" \
  --no-owner --no-acl \
  --format=plain \
  --quote-all-identifiers \
| gzip -9 \
| gpg --batch --yes --symmetric --cipher-algo AES256 \
      --passphrase-fd 3 --output "$OUT" \
      3<<<"$BACKUP_GPG_PASSPHRASE"

SIZE=$(du -h "$OUT" | cut -f1)
echo ""
echo "✓ Backup creado: ${OUT} (${SIZE})"
echo ""
echo "Restaurar con:"
echo "  BACKUP_GPG_PASSPHRASE='...' ./scripts/db-restore-local.sh ${OUT} '<TARGET_URL>'"
