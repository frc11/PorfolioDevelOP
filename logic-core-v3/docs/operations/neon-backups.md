# Backups — Neon PostgreSQL

Última actualización: 2026-05-26 (B14.3)

Neon Free no incluye backups confiables (sin PITR, retención corta). B14.3
implementó backups automáticos diarios con `pg_dump` programado por GitHub
Actions, cifrados con GPG simétrico y verificados con un restore-test
integrado en el mismo workflow.

---

## Arquitectura

**Workflow:** [`.github/workflows/db-backup.yml`](../../../.github/workflows/db-backup.yml) (raíz del repo).

```
DB Neon (main)
   │
   │  pg_dump --no-owner --no-acl
   ▼
[gzip -9]
   │
   ▼
[gpg --symmetric AES256, passphrase = secret BACKUP_GPG_PASSPHRASE]
   │
   ▼
GitHub Actions artifact (retention 30 días, repo público pero contenido cifrado)
   │
   ▼  Job 2: restore-test
[postgres:16 side-car]
[gpg --decrypt → gunzip → psql] → SELECT COUNT(*) validation
   │
   ▼
Workflow PASA si restore + validación OK; FALLA si rompe cualquier paso.
```

**Schedule:** diario a las 06:00 UTC (= 03:00 ART). Trigger adicional
`workflow_dispatch` para correr manual desde Actions UI con elección de
branch (prod / dev).

**Retención:** 30 días de artifacts. 30 backups en cualquier momento.
Si necesitamos retención mayor (legal, compliance), hay que mover los
artifacts a un bucket externo — fuera de scope hoy.

---

## Por qué cifrado simétrico

El repo `frc11/PorfolioDevelOP` es **público**. Los artifacts de GH Actions
en repos públicos son descargables sin autenticación por cualquiera con el
link al workflow run. Sin cifrado, los dumps con PII (emails, conversaciones,
datos de cliente) quedarían expuestos.

GPG `--symmetric --cipher-algo AES256` con passphrase de 48 bytes random:
sin la passphrase, el `.sql.gz.gpg` es ruido binario. La passphrase vive
solo como GitHub secret + password manager personal de Franco.

---

## Setup inicial (Franco, una sola vez)

### 1. Generar la passphrase

```bash
openssl rand -base64 48
```

Copiá el output a:
- (a) Tu password manager (KeePass, 1Password, etc.) — etiqueta:
  `develOP / Neon backup GPG passphrase`.
- (b) GitHub repo settings → Secrets and variables → Actions → New
  repository secret → name: `BACKUP_GPG_PASSPHRASE`.

### 2. Obtener las DIRECT URLs (sin pooler)

Para cada branch de Neon (main = prod, dev = development):

- Opción A (fácil): tomá la `DATABASE_URL` actual y sacale `-pooler` del
  subdomain.
  - Pooled:  `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`
  - Direct:  `ep-quiet-waterfall-acv0fpll.sa-east-1.aws.neon.tech`
- Opción B (explícita): dashboard Neon → tu proyecto → branch → Connection
  details → "Direct connection" → copy.

### 3. Setear secrets en GitHub

Repo settings → Secrets and variables → Actions → New repository secret:

- `BACKUP_GPG_PASSPHRASE` — la del paso 1.
- `DIRECT_DATABASE_URL_PROD` — direct URL del branch main.
- `DIRECT_DATABASE_URL_DEV` — direct URL del branch dev (opcional, solo
  necesaria si vas a correr el workflow con target=dev).

### 4. Disparar el primer run manual

GitHub UI → Actions → "DB backup" → Run workflow → target: prod → Run.

Debería tardar ~1-3 min. El Job 1 (dump) sube el artifact; el Job 2
(restore-test) lo levanta en un Postgres efímero y valida que es
restaurable. **Ambos jobs en verde = setup OK.**

Si el restore-test falla, el problema está en el dump o en la passphrase.
Revisar logs de los jobs.

### 5. Confirmar que el cron arranca

A partir del primer run manual exitoso, el cron diario se dispara solo
a las 06:00 UTC. Verificá al día siguiente que hay un run nuevo en Actions.

---

## Restauración desde un backup

### Caso 1: emergencia (la DB se rompió, hay que recuperar a una DB nueva)

```bash
# 1. Descargar el artifact del último run OK
gh run download <RUN_ID> -R frc11/PorfolioDevelOP -n neon-prod-backup-<TIMESTAMP>

# 2. Descifrar + restaurar a la URL nueva (la passphrase la tenés en password manager)
gpg --batch --decrypt --passphrase '<PASSPHRASE>' backup.sql.gz.gpg \
  | gunzip \
  | psql '<NEW_DB_URL>'

# 3. Verificar
psql '<NEW_DB_URL>' -c 'SELECT COUNT(*) FROM "_prisma_migrations"'

# 4. Apuntar la app a la URL nueva (Netlify env vars → DATABASE_URL).
```

### Caso 2: rollback parcial (necesito una tabla / fila específica)

```bash
# 1. Descargar el artifact y descomprimir a archivo plano
gh run download <RUN_ID> -R frc11/PorfolioDevelOP -n <ARTIFACT_NAME>
gpg --batch --decrypt --passphrase '<PASSPHRASE>' backup.sql.gz.gpg | gunzip > backup.sql

# 2. Restaurar a una DB temporal (branch nueva en Neon, o postgres local)
psql '<TEMP_DB_URL>' -v ON_ERROR_STOP=1 < backup.sql

# 3. pg_dump --table=<table> --data-only desde temp, luego psql a prod.
#    (Pensá bien el orden de FKs y triggers — el rollback parcial NO es
#     trivial; en duda, pedí ayuda antes de tocar prod.)
```

---

## Backup manual local (script paralelo)

Para correr fuera del cron (emergencia, sprint nuevo que toca data crítica):

```bash
cd logic-core-v3
DIRECT_DATABASE_URL='postgresql://...sin-pooler...' \
BACKUP_GPG_PASSPHRASE='...la-misma-de-GH...' \
./scripts/db-backup-local.sh prod
```

Genera `backups/neon-prod-backup-<timestamp>.sql.gz.gpg` (gitignored —
`backups/` está en `.gitignore`).

Para restaurar el local:

```bash
BACKUP_GPG_PASSPHRASE='...' \
./scripts/db-restore-local.sh \
  backups/neon-prod-backup-<timestamp>.sql.gz.gpg \
  'postgresql://...target-url...'
```

El script tiene safety check: aborta si la TARGET URL no es dev ni
localhost, a menos que pases `--i-know-what-im-doing`.

---

## Disaster Recovery

### RTO (Recovery Time Objective): ~1 hora

Tiempo entre que se decide restaurar y se vuelve al servicio:
- Decisión + identificar el backup correcto: 10 min.
- Descargar artifact + descifrar + restaurar a Neon branch nueva: 10-30 min
  (depende del tamaño).
- Apuntar Netlify a la URL nueva + redeploy: 10 min.
- Verificación + comunicación a clientes: 10 min.

### RPO (Recovery Point Objective): 24 horas

Datos máximos perdidos en caso de restauración. Cron diario → como máximo
perdemos las últimas 24h de actividad. Si esto deja de ser aceptable
(volumen alto, cliente grande), bajar el cron a cada 6h o cada hora.

### Cuándo escalar más allá de pg_dump

Si en algún momento:
- La DB pasa de 1 GB.
- Tenemos 10+ clientes con data crítica.
- El RPO de 24h ya no alcanza.

Considerar: upgrade a Neon Launch ($19/mes, PITR + retención mayor) +
mover los dumps a un bucket S3/R2 para retención larga.

---

## PII y manejo del dump

Todos los dumps tienen:
- Emails de usuarios y leads.
- Conversaciones del chatbot.
- Datos de Organizations (config, secrets cifrados internamente).
- Tokens de reset password (hasta que expiren).
- Sesiones NextAuth activas.

Por eso:
- Nunca commitear un dump al repo (`backups/` y patrones `*.sql*`,
  `*.gpg` están en `.gitignore`).
- Nunca compartir un dump descifrado por canales no cifrados (email,
  Slack público, etc.).
- La passphrase GPG es la única protección — guardarla con el mismo
  cuidado que una credencial root.

---

## Versión de pg_dump

El workflow instala `postgresql-client-16` explícito vía repo oficial
PostgreSQL apt (ubuntu-latest viene con pg 14 por default, no matchea).
Si Neon migra a Postgres 17, actualizar la versión del paquete y de la
imagen del side-car (`postgres:16` → `postgres:17`) en el workflow.

---

## Histórico

- **2026-05-26 (B14.3):** primera versión. GH Action diario + restore-test
  integrado. Reemplaza el plan "considerar upgrade Launch" del doc anterior.
