#!/usr/bin/env bash
# B14.3 — Restauración manual local de un backup cifrado.
#
# Restaura un .sql.gz.gpg generado por db-backup-local.sh o por el workflow
# GH Actions. La URL target SE PASA EXPLÍCITA y se valida que NO sea prod
# (para evitar pisar la prod por accidente — la restauración a prod debería
# ser un evento consciente y se confirma con --i-know-what-im-doing).
#
# Requisitos:
#   - psql 16+
#   - gpg
#   - BACKUP_GPG_PASSPHRASE en el environment
#
# Usage:
#   BACKUP_GPG_PASSPHRASE='...' ./scripts/db-restore-local.sh <BACKUP_FILE> <TARGET_URL>
#   BACKUP_GPG_PASSPHRASE='...' ./scripts/db-restore-local.sh <BACKUP_FILE> <PROD_URL> --i-know-what-im-doing
#
# Ejemplo (restaurar a una DB local de prueba):
#   BACKUP_GPG_PASSPHRASE='...' ./scripts/db-restore-local.sh \
#     backups/neon-prod-backup-20260527-060000.sql.gz.gpg \
#     'postgresql://postgres:test@localhost:5432/restoretest'

set -euo pipefail

BACKUP_FILE="${1:-}"
TARGET_URL="${2:-}"
SAFETY_OVERRIDE="${3:-}"

if [ -z "$BACKUP_FILE" ] || [ -z "$TARGET_URL" ]; then
  echo "Usage: $0 <BACKUP_FILE> <TARGET_URL> [--i-know-what-im-doing]" >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: archivo no existe: $BACKUP_FILE" >&2
  exit 1
fi

if [ -z "${BACKUP_GPG_PASSPHRASE:-}" ]; then
  echo "ERROR: BACKUP_GPG_PASSPHRASE no está seteada." >&2
  exit 1
fi

# Heurística para prod: el dev host de Neon es 'ep-quiet-waterfall-acv0fpll'.
# Si el TARGET_URL no es ese (y no es localhost), asumimos que es prod o algo
# desconocido — requerimos override explícito.
EXPECTED_DEV_FRAGMENT='ep-quiet-waterfall-acv0fpll'
IS_DEV=false
IS_LOCAL=false
if echo "$TARGET_URL" | grep -q "$EXPECTED_DEV_FRAGMENT"; then
  IS_DEV=true
fi
if echo "$TARGET_URL" | grep -qE 'localhost|127\.0\.0\.1'; then
  IS_LOCAL=true
fi

if [ "$IS_DEV" = false ] && [ "$IS_LOCAL" = false ]; then
  if [ "$SAFETY_OVERRIDE" != "--i-know-what-im-doing" ]; then
    echo "ABORT: TARGET_URL no es dev ni localhost — parece prod o desconocido." >&2
    echo "       Si querés restaurar a esa URL, re-corré con --i-know-what-im-doing." >&2
    exit 1
  fi
  echo "⚠️  Override aceptado. Restaurando a TARGET no-dev/no-localhost."
fi

if ! command -v psql > /dev/null; then
  echo "ERROR: psql no encontrado." >&2
  exit 1
fi
if ! command -v gpg > /dev/null; then
  echo "ERROR: gpg no encontrado." >&2
  exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  Restore local"
echo "  source: ${BACKUP_FILE}"
echo "  target: ${TARGET_URL%%@*}@*** ($([ "$IS_DEV" = true ] && echo 'DEV') $([ "$IS_LOCAL" = true ] && echo 'LOCAL'))"
echo "═══════════════════════════════════════════════════════"

gpg --batch --yes --decrypt \
    --passphrase-fd 3 "$BACKUP_FILE" 3<<<"$BACKUP_GPG_PASSPHRASE" \
| gunzip \
| psql "$TARGET_URL" \
    --quiet \
    --variable=ON_ERROR_STOP=1

echo ""
echo "✓ Restore completo."
echo ""
echo "Validar conteos:"
echo "  psql '$TARGET_URL' -c 'SELECT COUNT(*) FROM \"_prisma_migrations\"'"
