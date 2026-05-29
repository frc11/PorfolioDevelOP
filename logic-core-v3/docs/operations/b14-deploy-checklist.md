# Checklist de salida — B14 → prod

Última actualización: 2026-05-26 (B14.4)

Este doc es el orden honesto y completo de pasos para llevar el trabajo de
B14 (rate-limit, latencias, backups, Sentry) a prod, hacer smoke real, y
tagear la versión.

**Estado de partida al momento de escribir este doc:**
- 84 archivos modificados sin commit en `main`.
- Cero commits desde el último tag (`v0.9.0-rc.1`).
- Prod (`develop-portfolio.netlify.app`) sirve un deploy desactualizadísimo
  (cache CDN de ~71 días en `/`, sin endpoints recientes).

Cada item tiene: **qué hacer**, **comando/UI**, **validación**, **dependencias**.

---

## Fase 1 — Repo: commits + merge

### 1.1 Decidir estrategia de commits

84 archivos cubren múltiples sprints en simultáneo (B11/B12/B-SEC backlog +
B14.1 rate-limit + B14.2 medición + B14.3 backups + B14.5 Sentry + cambios
varios pre-B14 que ya estaban). Opciones:

- (a) **Un solo commit "chore: bloque B14 completo"** → más simple, peor
  para git blame y rollback granular.
- (b) **Un commit por sprint** (B14.1, B14.2 scripts, B14.3, B14.5 + 1
  separado para el backlog viejo): mejor history, requiere repartir los
  84 archivos por sprint.

**Recomendado: (b)** — el backlog ya creció. Si después hay que revertir
B14.5 (por ej.) sin tocar B14.1, es trivial con commits separados.

**Validación:** `git log --oneline -10` debe mostrar los commits separados.

### 1.2 Antes de commitear: limpieza

```bash
cd logic-core-v3
npm run build   # debe pasar sin errores (validado el 2026-05-26 en B14.5)
```

Si el build rompe, NO commitear. Investigar primero.

### 1.3 Push y merge

Push directo a `main` (o PR si hay revisión externa — el repo es de Franco
solo, no requiere PR).

**Validación:**
```bash
git log --oneline origin/main -5
```
Tiene que mostrar los commits nuevos.

---

## Fase 2 — Pre-deploy: migrations y data en prod

🔴 **Crítico**: estos pasos tocan la DB de prod. Hacelos vos manualmente,
NO me los delegues sin confirmación explícita por paso.

### 2.1 Aplicar migration de B14.1 (rate_limit table) a prod

**Dependencia:** Fase 1 completa (el schema.prisma con `model RateLimit` ya
está en main).

```bash
cd logic-core-v3
DATABASE_URL='<prod_url>' npx prisma migrate status
# Esperado: muestra migration `20260526233939_add_rate_limit_b14_1` como pending.

DATABASE_URL='<prod_url>' npx prisma migrate deploy
# Aplica solo migrations pendientes. Aditivo, no toca nada existente.

DATABASE_URL='<prod_url>' npx prisma migrate status
# Esperado: "Database schema is up to date!"
```

**Si rompe:** la migration es 100% aditiva (1 CREATE TABLE + 2 INDEX), no
debería romper nada. Si pasa algo, parar y revisar.

### 2.2 Seedear bench bot en prod (B14.2)

**Dependencia:** Fase 2.1 completa.

```bash
cd logic-core-v3
DATABASE_URL='<prod_url>' npx tsx scripts/_b14-2-seed-bench-prod.ts --confirm
```

El script tiene safety checks: aborta si el host es dev, si es localhost,
si no es Neon. Loggea el host detectado en banner grande antes de tocar.

**Validación:** una vez deployado el código (Fase 4), probar:
`curl https://develop-portfolio.netlify.app/api/chatbot/bench-matsu/health`
debe devolver 200.

---

## Fase 3 — Pre-deploy: secrets y env vars

### 3.1 Netlify env vars

Settings → Environment variables → agregar/confirmar:

| Variable | Para qué | Estado actual |
|---|---|---|
| `DATABASE_URL` | Runtime (pooled) | Ya seteada (asumido) |
| `NEXT_PUBLIC_SENTRY_DSN` | Captura de errores B14.5 | **A SETEAR** — requiere cuenta Sentry primero (Fase 3.3). |
| `SENTRY_AUTH_TOKEN` (opcional) | Source maps en build | A setear si querés source maps. |
| `SENTRY_ORG` (opcional) | Source maps | ídem |
| `SENTRY_PROJECT` (opcional) | Source maps | ídem |

**No usés `DIRECT_DATABASE_URL` en Netlify** — la app runtime usa la pooled.
Esa va solo en GH Actions secrets (Fase 3.2).

### 3.2 GitHub Actions secrets (B14.3 backups)

Repo settings → Secrets and variables → Actions → New repository secret:

| Secret | Cómo generarlo |
|---|---|
| `BACKUP_GPG_PASSPHRASE` | `openssl rand -base64 48` → copiar a password manager + acá. |
| `DIRECT_DATABASE_URL_PROD` | Tomar `DATABASE_URL` prod, sacar `-pooler` del subdomain. |
| `DIRECT_DATABASE_URL_DEV` (opcional) | Idem dev. Solo si vas a backupear dev también. |

**Validación:** disparar el workflow manual (Fase 6.2).

### 3.3 Cuenta Sentry (B14.5)

Una sola vez:
1. Crear cuenta gratis en https://sentry.io (plan **Developer**).
2. Create new project → **Next.js** → name: `logic-core-v3`.
3. Copiar el DSN (formato `https://<key>@oXXX.ingest.sentry.io/<projectId>`).
4. Pegar en Netlify env var `NEXT_PUBLIC_SENTRY_DSN`.

---

## Fase 4 — Deploy

### 4.1 Trigger del deploy

Si Netlify está conectado a `main` con auto-deploy:
- Después del push de Fase 1, debería arrancar solo. Verificar en
  Netlify UI → Deploys.

Si no hay auto-deploy:
```bash
# Manual desde la UI: Deploys → Trigger deploy → Deploy site
```

### 4.2 Validar que el build del deploy pasa

Netlify UI → Deploys → último deploy → ver el log. Buscar:
- `Site is live` al final → OK.
- Cualquier `Error:` o `Failed` → revisar y fixear antes de smoke.

### 4.3 Validar que el deploy nuevo se sirve (no cache vieja)

🔴 **Hallazgo de B14.4**: el `/` actual tiene `Age: 6135174` (~71 días en CDN).
Confirmar que el deploy nuevo invalidó cache.

```bash
curl -sS -I 'https://develop-portfolio.netlify.app/' | grep -iE "age|cache|etag"
```

`Age:` debe ser bajo (segundos/minutos), no días. Si sigue alto, Netlify
tiene caché agresiva — invalidar manualmente desde Deploys → "Clear cache
and deploy site".

---

## Fase 5 — Post-deploy: smoke en prod real

**Dependencia:** Fase 4 completa.

### 5.1 Smoke automatizado

```bash
cd logic-core-v3
node scripts/_b14-4-smoke-prod.mjs
```

El script cubre: páginas públicas, bot (health/config/chat), rate limiter
(dispara 31 hits y espera 429), test-sentry. Reporta pass/fail por bloque.

**Pass criteria** mínimo:
- Páginas públicas (incluido `/login`, `/forgot-password`) → 200.
- Bot bench-matsu `/health` → 200 con `{ ok: true }`.
- Bot bench-matsu `/chat` con 1 prompt → 200 + stream.
- Rate limiter: hit #31 al `/chat` → 429 con `Retry-After`.
- `/api/test-sentry` → 500 (dispara el error de prueba).

### 5.2 Validar Sentry en UI

**Dependencia:** Fase 3.3 + 4.1.

Tras correr el smoke (que pega a `/api/test-sentry`):

1. Ir a https://sentry.io → project `logic-core-v3` → Issues.
2. Confirmar que llegó un nuevo evento con mensaje `Test Sentry — esto debería aparecer en el dashboard de Sentry`.
3. Inspeccionar el evento: **verificar visualmente que no hay emails, teléfonos, tokens, ni nada de PII** en breadcrumbs/request/extra.
4. Bonus: forzar un error con PII en el message (ej. `throw new Error('User foo@bar.com not found')`) → confirmar que llega como `User [email] not found`.

🔴 Si aparece PII sin scrubear, **parar el deploy** y revisar `src/lib/sentry/scrub-pii.ts`.

### 5.3 Validar que la migration B14.1 está activa

Smoke manual del rate limiter en una request real:

```bash
# Generar 31 requests al mismo origin+sessionId. La 31a debe ser 429.
SESSION_ID="b14-4-rate-test-$(date +%s)"
for i in $(seq 1 31); do
  curl -sS -o /dev/null -w "[$i] %{http_code}\n" \
    -X POST 'https://develop-portfolio.netlify.app/api/chatbot/bench-matsu/chat' \
    -H 'Content-Type: application/json' \
    -H 'Origin: https://develop.com.ar' \
    -d "{\"messages\":[{\"role\":\"user\",\"content\":\"ping $i\"}],\"sessionId\":\"$SESSION_ID\"}"
done
# Esperado: 30 hits con 200, hit #31 con 429.
```

(El smoke script de 5.1 ya hace esto automatizado.)

---

## Fase 6 — Post-deploy: backups primer run

### 6.1 Disparar workflow manual de backup

**Dependencia:** Fase 3.2 (secrets seteados).

GitHub UI → Actions → "DB backup" → Run workflow → target: `prod` → Run.

### 6.2 Confirmar que ambos jobs pasan

Esperar 1-3 min. En el run:
- Job `dump` verde → dump generado y subido como artifact.
- Job `restore-test` verde → dump restaurable, validado contra Postgres limpio.

Si `restore-test` falla, **no usar el backup** — el dump tiene algún problema.

### 6.3 Confirmar que el cron diario arranca

Próximo día (06:00 UTC = 03:00 ART), verificar en Actions UI que apareció
un run nuevo. Si no, revisar el cron del workflow.

---

## Fase 7 — Tag de versión

**Dependencia:** Fases 1-6 completas y todo en verde.

### 7.1 Bump de package.json

```bash
cd logic-core-v3
# Editar manualmente o:
npm version 1.0.0-rc.1 --no-git-tag-version
```

### 7.2 Commit + tag

```bash
cd ..   # raíz del repo (donde está .git)
git add logic-core-v3/package.json logic-core-v3/package-lock.json
git commit -m "chore: bump version to 1.0.0-rc.1 (B14 complete)"
git tag -a v1.0.0-rc.1 -m "Release candidate 1: B14 complete (rate-limit, backups, Sentry, latencias medidas).

Pre-Matsu. v1.0.0 pelado queda para cuando Matsu use el producto en prod
sin romperse — eso es B2 + tiempo real de uso."
git push origin main --tags
```

### 7.3 Por qué v1.0.0-rc.1 y no v1.0.0

- Producto **feature-complete** para arrancar con cliente: rate limit
  atómico, backups con verificación, monitoreo de errores con PII scrubbing,
  latencias medidas en prod.
- Pero **NO validado en uso real**. Sin un cliente vivo, no hay forma de
  saber si los presets, los timeouts, los flujos cubren el caso real.
- `-rc.1` comunica eso honestamente: "candidato a release, esperando uso
  real para confirmar".
- `v1.0.0` pelado se firma cuando Matsu use el producto sin romperse
  durante un período razonable (B2 + observación). No antes.

---

## Lo que queda fuera de B14 (pendiente real para Matsu vivo / B2)

Lista de lo que NO entra en B14, separado para que no se mezcle al planear B2:

- **B2 — Onboarding de Matsu**: reemplazar el seed de scaffolding con datos
  reales del cliente (KB de la concesionaria, horarios, dirección, marcas
  oficiales, tono específico). Crear cuenta admin para Matsu. Configurar
  `allowedDomains` con el dominio real del sitio de Matsu.
- **Embed real en sitio Matsu**: pegar el snippet `<script>` del bot en
  el WordPress/lo-que-sea del sitio de Matsu. Validar CORS, validar que
  carga, validar que las quick replies funcionan.
- **Activar billing / plan asignado**: setear el plan en `BotConfig` (hoy
  `monthlyQuota: 1000` es default; Matsu puede tener un plan específico).
  Validar que la quota / soft-cap arrancan donde corresponde.
- **Notificaciones de Sentry**: configurar alertas en Sentry UI (Slack /
  email) para que Franco se entere de errores en tiempo real, no manualmente.
- **Borrar el bot bench-matsu de prod** una vez que Matsu real esté seedeado:
  `DATABASE_URL='<prod>' npx tsx scripts/_b14-2-cleanup-bench-prod.ts --confirm`.
- **Eliminar TODO el código de B14.x throwaway**: scripts `_b14-2-*`, `_b14-4-*`,
  `_b14-5-scrub-smoke.mjs` quedan en el repo hoy para regression. Cuando ya
  no se necesiten, borrar.
- **Resolver finding del workflow e2e.yml** (ya tiene chip spawned): mover de
  `logic-core-v3/.github/workflows/` a la raíz del repo + ajustar paths.
- **Resolver cache CDN agresivo en `/`** (Age=71d): investigar
  `Cache-Control` headers y config Netlify de invalidación. Hallazgo de
  B14.4, no investigado.
- **Consolidación Sentry inits duplicados** (instrumentation moderno + legacy
  raíz): hoy ambos tienen scrub. Sprint propio para consolidar — Sentry
  Wizard ayuda con la migración.

---

## Cuándo firmar v1.0.0 pelado

No es un sprint planificable. Criterio:
- Matsu en prod hace ≥30 días con su data real.
- Sin incidentes severos no resueltos.
- Backups corriendo OK durante todo ese período (≥30 dumps verdes con
  restore-test pasando).
- Sentry sin spike de errores no anticipados.
- Rate limiter no bloqueó uso legítimo (review de eventos `429` en logs).

Cuando esos checks se cumplen, bump a `v1.0.0` y release notes que
comuniquen "primera versión usada en producción con cliente real".
