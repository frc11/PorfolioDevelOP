# Smoke report — Setter / LeadOS

_Fecha: 2026-06-22 · Rama: `main` · Build: Next 16.2.6 (prod) · DB: Neon dev compartida_

Este reporte tiene dos partes, como se pidió:

- **Parte 1 — Resultado funcional del smoke test:** qué quedó verificado, qué quedó
  bloqueado (y por qué), la cobertura del suite sección por sección, y la lista
  explícita de **lo que solo Franco puede verificar a ojo**.
- **Parte 2 — Paquete de reconciliación de migraciones:** estado, diff bidireccional,
  tabla de divergencias con la decisión marcada, el contenido de la migración faltante,
  el fix del duplicado `BOT_DELETED`, y el plan de reconciliación.

---

## TL;DR

| Item | Estado |
|---|---|
| PASO 0 — duplicado `BOT_DELETED` en `schema.prisma` | ✅ **Arreglado** (build prod verde) |
| Build de producción (`next build`) | ✅ **Verde** (exit 0) — requiere `--max-old-space-size` (ver nota) |
| 6 invariantes (`check:invariant*`) | ✅ **PASAN las 6** |
| Suite e2e del setter (A–G, 35 tests) | ✅ **Escrita + type-clean** (`tsc` exit 0) |
| Harness del suite (seed/teardown/auth/persona/mint) | ✅ **Ejecuta OK** contra el build prod (llega hasta `page.goto`) |
| Ejecución e2e a nivel **browser** | ⛔ **BLOQUEADA en esta máquina** por seguridad del host (ver Parte 1) — **no es defecto del código ni de la app** |
| Drift de migraciones DB↔schema | 🔧 **Diagnosticado** — decisión y SQL listos en Parte 2 (NO aplicado) |
| Bug encontrado en `/api/qa/login` (cookie name) | 🐛 **Documentado** (workaround test-side; fix real fuera de scope) |

---

# Parte 1 — Resultado funcional del smoke test

## 1.1 Lo que está VERIFICADO (verde)

### PASO 0 — build prod verde
- El enum `AuditActionType` tenía `BOT_DELETED` **duplicado** (`schema.prisma` L192 y L199) → `P1012`, rompía `prisma generate` y el build.
- **Fix aplicado:** se borró la línea duplicada (quedó una). `npx prisma generate` ✅, `next build` ✅ (exit 0, "Compiled successfully", route table, `.next/BUILD_ID` presente).
- **Nota de build (no bloqueante, environment):** el `next build --webpack` **se queda sin heap** con el default (~2 GB) en esta máquina. Corre verde con `NODE_OPTIONS="--max-old-space-size=6144"`. Recomendación para Franco: setear `NODE_OPTIONS` o subir el límite en el script de build si vuelve a OOM.

### 6 invariantes — PASAN las 6
`npm run check:invariant` · `:setter-meta` · `:escalamiento` · `:novedades` · `:mis-numeros` · `:timeline` → **todos `✓ invariante OK`**. Esto prueba a nivel dominio (sin browser):
- **Aislamiento (#1):** cartera por `assignedToId`, meta privada por `setterId`, lead ajeno → null (404-style sin leak).
- **Escalamiento:** `buildEscaladoPatch` no toca `stage`/`setterId`; `ESCALADO_RESET` limpia en cada transición (no sobrevive a re-loop RECHAZADA→CONSTRUCCION).
- **Novedades:** aisladas por destinatario; dirección correcta (actual para asignar/aprobar/rechazar, **previo** para el saliente); SISTEMA ≠ canal de actividad.
- **Mis números:** atribución por la sesión, nunca por un id del lead.
- **Timeline:** lead-scoped (muestra SISTEMA) pero el conteo que abre Seguimiento **excluye** SISTEMA.

### El harness del suite EJECUTA contra el build de producción
Antes de la navegación del browser, **todo lo no-browser corrió sin error** contra la DB del build prod:
- Seed/teardown namespaced (`SMOKE-SETTER …`) con borrado por **id exacto** — verificado limpio: **cleanup final `leads=0 users=0 notices=0`** (cero basura en la Neon compartida).
- Resolución de persona desde la DB (`setter-qa@develop.test`), creación del 2º setter, minteo de cookie de sesión, `addCookies`.

### Diagnóstico de migraciones (Parte 2) — completo
`migrate status` + diff bidireccional + lectura de cada migración de drift. Decisión y SQL de reconciliación listos (no aplicados, como se pidió).

## 1.2 Lo que quedó BLOQUEADO en esta máquina (no es defecto del código)

### ⛔ Ejecución e2e a nivel browser — bloqueada por seguridad del host
Los browsers de Playwright (los binarios bajo `…\ms-playwright\`) **no pueden conectar al servidor local**, mientras que `curl`, PowerShell `Invoke-WebRequest` y Node **sí llegan** (HTTP 200/403). Diagnóstico exhaustivo:

| Cliente → servidor local | Resultado |
|---|---|
| `curl` / `Invoke-WebRequest` / Node fetch → `127.0.0.1:3001` y `[::1]:3001` | ✅ 200 / 403 (servidor OK) |
| Playwright **Chromium** → `localhost` / `127.0.0.1` / puerto virgen 3005 | ⛔ `ERR_CONNECTION_REFUSED` |
| Playwright **Firefox** → mismo server | ⛔ `NS_ERROR_CONNECTION_REFUSED` |

Mitigaciones probadas, **ninguna** destrabó: IPv6→IPv4 (`127.0.0.1`), `--no-proxy-server`+`--proxy-bypass-list=*`, puerto virgen sin TIME_WAIT, bind explícito `-H 127.0.0.1`, server gestionado por Playwright vs externo. Como **Chromium y Firefox fallan igual** pero los clientes de sistema andan, el patrón apunta a un **producto de seguridad/firewall del host bloqueando el loopback de los ejecutables de `ms-playwright`** — no a la app, ni al suite, ni a la red en general.

**Cómo destrabarlo (Franco):** permitir los ejecutables de `…\ms-playwright\chromium-*\…\chrome.exe` (y firefox) en el firewall/antivirus del host, **o** correr el suite en CI / otra máquina. El suite ya queda listo para correr (ver §1.4 / Parte 2 "Cómo correr").

### 🐛 Bug encontrado: `/api/qa/login` setea el cookie con el nombre equivocado en prod-sobre-http
- `src/auth.ts` nombra el cookie de sesión `__Secure-authjs.session-token` cuando `NODE_ENV === 'production'` (que `next start` fuerza) — **siempre**, aunque sea http.
- `src/app/api/qa/login/route.ts` nombra el cookie por el **protocolo del request** (`getSessionCookieName`): sobre http setea `authjs.session-token` (sin prefijo). → El server prod busca `__Secure-…` y nunca lo encuentra → **`Unauthorized`** en todo `/setter`.
- En **dev** ambos usan `authjs.session-token` (por eso visual-qa contra `dev:qa` anda); en **prod-sobre-http** se rompe.
- **Workaround en el suite (test-only, sin tocar prod):** se mintea el JWT con el nombre que el server prod lee (`__Secure-…`, `secure:true`; Chromium trata `http://localhost`/`127.0.0.1` como contexto seguro). Ver `tests/helpers/setter-auth.ts`.
- **Fix real recomendado (1 línea, fuera del scope del smoke):** que el route nombre el cookie por `NODE_ENV` igual que `auth.ts`, no por el protocolo del request. Queda para tu decisión — es código de auth de producción.

## 1.3 Cobertura del suite — qué prueba cada sección (escrito + type-clean; ejecución browser pendiente del desbloqueo §1.2)

> Selectores derivados de descubrimiento profundo del código real (no adivinados): roles+nombre accesible, textos visibles, y aserciones de estado en **DB** después de cada acción (robustas a cambios de copy). El `<Select>` compartido NO es nativo → se maneja por trigger+opción; el wizard se **duplica** para responsive → se filtra a visible.

| Spec | Sección | Qué verifica |
|---|---|---|
| `00-surfaces` | **A + G** | `/setter` 200; cargan nav, rail de herramientas, scoreboard, cartera, "Continuá", Novedades, "Tu semana", "Mis números", badge topbar; detalle de lead (stepper + timeline); **cero errores de consola/pageerror**. |
| `01-flow` | **B (el corazón)** | Recorrido completo por la UI con assert de **stage en DB** en cada transición: FICHA (nudge de calidad advisory no-bloqueante + señal + autosave + guardado) → EVALUACIÓN (score+veredicto+submit; AVANZAR) → **OPENER (🔴 rechaza link + botón disabled, registra, idempotencia)** → simular respuesta → **BRIEF (EVALUADA→BRIEF por la vía legal/gate)** → CONSTRUCCIÓN (arrancar + escalar "me trabé" persiste) → DRAFT + SELF-CHECK (6 hard-checks) → **enviar a revisión (CONSTRUCCION→EN_REVISION + escalado reseteado)** → **admin aprueba (APROBADA + novedad "Franco aprobó tu demo")** → SEGUIMIENTO (enviar link crea demo + idempotencia). Ramas: **DESCARTADA** (modal + wizard colapsa), **admin RECHAZA** (→ RECHAZADA + "Franco pidió cambios"), **AGENDA** (lead agendado refleja "Reunión agendada"). |
| `02-isolation` | **C** | A no ve cartera de B; lead ajeno → **404 idéntico a id random** (sin leak); 2º setter (cookie minteada) ve solo lo suyo; nota privada de A no la hereda B al reasignar; novedades dirigidas (B "te asignaron", A saliente "te reasignaron" **sin link**, aislamiento por `setterId`). |
| `03-cabina` | **D** | Búsqueda acento-insensible; pin/snooze/nota **persisten en DB**; recorrido prev/next por la cola; **atajos** (`?` abre ayuda; **NO dispara escribiendo en un input** — la guarda); timeline muestra SISTEMA pero **no abre Seguimiento** (contactos=0). |
| `04-admin` | **E** | `/admin/leados`: pipeline de producción, cola de revisión, panel de escaladas ("Setters trabados"), ratio del setter; badge del sidebar; drill-down a `/admin/leados/setter/[id]`; `/admin/leads/[id]` asignación con carga + ratio. |
| `05-empty-mobile-a11y` | **F** | Empty states (setter sin leads, búsqueda sin resultados, timeline sin movimientos); mobile ~390px sin overflow horizontal + drawer abre/cierra; a11y (landmarks con nombre, `aria-current`). |

**Hallazgos de cobertura ya incorporados (de la corrida que llegó al server):** el harness (seed/teardown/auth) ejecuta correcto; el único error fue la navegación del browser (§1.2). La primera corrida llegó a tocar el server **23 veces** (logs server-side) antes de los rechazos — consistente con que el suite ejecutaría apenas se permita el loopback del browser.

## 1.4 Lo que este smoke NO puede verificar — **para tu pasada manual, Franco**

El smoke prueba que **anda** (lógica, transiciones, gates, aislamiento, datos), no que **se vea bien ni que enseñe**. Mirá a ojo:

1. **Que se vea bien / estética:** jerarquía visual, espaciados, glassmorphism, colores de marca, que nada quede cortado o desbordado más allá del check de overflow.
2. **Que sea intuitivo:** ¿el setter entiende el flujo invertido sin que le expliques? ¿el "Continuá donde dejaste" cae donde uno espera? ¿los pasos bloqueados se leen como "todavía no" y no como "roto"?
3. **Que la guía ENSEÑE:** los `TeachPanel` ("¿Por qué importa?"), los "Ver ejemplo", los `ToolGuide`, los nudges de calidad de la ficha — ¿realmente bajan el criterio o son ruido?
4. **Calidad de las demos:** nada de esto juzga si la demo construida es buena (assets reales, fidelidad al brief, mobile) — eso es ojo humano.
5. **Matices de UX:** animaciones (Framer), foco al abrir el lead (`StepAnchor`), el copy/tono en castellano rioplatense, el comportamiento del teclado mobile con el emoji/drawer.
6. **Render del browser end-to-end:** hasta destrabar §1.2, la verificación visual de las pantallas (que los selectores matcheen el DOM real, toasts, modales portaleados) la hacés vos corriendo el suite o a ojo en `:3000`.

---

# Parte 2 — Paquete de reconciliación de migraciones

## 2.1 Estado

- `npx prisma migrate status` → **"Database schema is up to date!"**, 72 migraciones, ninguna pendiente/fallida. La **historia** (archivos ↔ `_prisma_migrations`) está en sync; **no hay migraciones aplicadas-sin-archivo** (las 3 "drift" del bitácora ya entraron como archivos con el pull).
- **PERO** el diff `schema ↔ DB` **NO es vacío**: el `schema.prisma` declara columnas que la **DB viva NO tiene**. Es el trap "migración marcada-aplicada pero el DDL no está en la DB" — acá causado por una migración de reconciliación que **dropeó** lo que otra lane había agregado.

## 2.2 Diff bidireccional (DDL real)

**`migrate diff --from-schema-datasource → --to-schema-datamodel`** (lo que haría falta para que la DB matchee el schema = lo que la DB **le falta**):

```sql
ALTER TABLE "AgencySettings" ADD COLUMN "singleton" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organization" ADD COLUMN "avatarEmoji" TEXT, ADD COLUMN "avatarImageUrl" TEXT,
  ADD COLUMN "avatarInitials" TEXT, ADD COLUMN "city" TEXT, ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "chatbot_lead" ADD COLUMN "convertedToOsLeadId" TEXT;
CREATE UNIQUE INDEX "AgencySettings_singleton_key" ON "AgencySettings"("singleton");
```

**Inverso (`--from-schema-datamodel → --to-schema-datasource`)** = lo que el schema "le sacaría" a la DB → los mismos objetos en `DROP` (confirma que la única divergencia son esas columnas/índice; el resto del schema ↔ DB coincide).

## 2.3 Tabla de divergencias + DECISIÓN

| Objeto | Schema (`main`) | DB viva | Dirección | De dónde vino | ¿Código lo usa? | **Decisión (mía, a confirmar)** |
|---|---|---|---|---|---|---|
| `Organization.avatarEmoji/avatarImageUrl/avatarInitials` | declarado | **falta** | schema-only | mig `20260619234252` (lane clientes) + commit `e8c7ae0` | **SÍ** (`updateClient`, `ClientAvatar*`, `EditClientForm`) | **Adoptar → re-agregar a la DB** |
| `Organization.internalNotes` | declarado | **falta** | schema-only | idem + commit `2c26930` | **SÍ** (`updateClientInternalNotes`, `InternalNotesCard`) | **Adoptar → re-agregar** |
| `Organization.city` | declarado | **falta** | schema-only | idem | parcial (comentario del schema: "hoy la action no la persiste") | **Adoptar** (Prisma la selecciona igual; ver nota crítica) |
| `Organization.deletedAt` | declarado | **falta** | schema-only | idem | soft-delete declarado | **Adoptar** |
| `AgencySettings.singleton` + índice único | declarado `@unique` | **falta** | schema-only | mig `20260620173833` + commit `d14fcff` | no por nombre, **sí** vía default-select de Prisma | **Adoptar** |
| `chatbot_lead.convertedToOsLeadId` | declarado | **falta** | schema-only | mig `20260617184913` | **SÍ** (`convert-chatbot-lead.actions`, `hardDeleteClient`, `LeadsTable`…) | **Adoptar → re-agregar** |

### Nota CRÍTICA (por qué esto es un landmine, no cosmético)
Prisma **selecciona TODOS los scalars declarados** por defecto. Cualquier `prisma.organization.findX()` / `agencySettings.findX()` / `chatbot_lead.findX()` **sin `select` explícito** genera un `SELECT … avatarImageUrl, city, deletedAt, internalNotes, singleton, convertedToOsLeadId …` → **`column does not exist` (42703) en runtime** porque la DB no las tiene. O sea: **las features de cliente recién mergeadas (avatar, notas internas, hard-delete que lee `convertedToOsLeadId`, singleton) están rotas en runtime contra esta Neon**, aunque el build compile (compila contra `schema.prisma`, que sí las declara).

> Por qué pasó: la **lane de clientes** agregó las columnas (migraciones + schema + código que las usa). La **lane de leados/Franco** trajo `20260621120000_reconcile_dev_drift_schema_align`, escrita asumiendo que eran "vestigios abandonados", que las **dropea**. Ambas se mergearon. La reconciliación quedó como la última por timestamp → ganó en la DB. La afirmación de esa migración ("`convertedToOsLeadId` NUNCA se usó", "avatar → BotConfig", etc.) es **falsa en `main` hoy**: el código las usa y `chatbot_lead.convertedToOsLeadId` está documentada en el propio `schema.prisma` (L1413-1418) como el vínculo de conversión persistente.

## 2.4 El duplicado `BOT_DELETED` (P1012)

- **Ubicación:** `schema.prisma` enum `AuditActionType`, L192 **y** L199.
- **Cómo se generó:** dos lanes agregaron el mismo valor al enum:
  - `20260617184913_add_converted_lead_link_and_bot_deleted_audit` → `ALTER TYPE … ADD VALUE 'BOT_DELETED'`.
  - `20260619140000_add_bot_deleted_audit_action` → `ADD VALUE IF NOT EXISTS 'BOT_DELETED'` (no-op si ya está).
  - `20260621120000_reconcile_dev_drift_schema_align` también lo re-declara `IF NOT EXISTS` (no-op).
  - Al mergear las dos lanes, el **modelo** `schema.prisma` quedó con el valor escrito **dos veces** → P1012. (En la DB el enum tiene `BOT_DELETED` una sola vez; el `IF NOT EXISTS` lo hizo idempotente.)
- **Fix (ya aplicado en este branch):** borrar la línea duplicada del enum (queda una). No requiere migración (la DB ya está bien).

## 2.5 Contenido de la migración FALTANTE (re-add) — para que Franco la revise/guarde

> **NO aplicada.** Es la decisión de la §2.3 ("adoptar"). Reversa exacta del `DROP` de `20260621120000`, idempotente (`IF NOT EXISTS`), aplicable con `migrate deploy` (no usa shadow-DB, no resetea). Una DB reconstruida desde cero llega acá con las columnas ya presentes → no-op; la Neon dev driftada → las re-crea.

Crear `prisma/migrations/<timestamp>_readd_client_columns_dropped_by_reconcile/migration.sql`:

```sql
-- Re-agrega las columnas que 20260621120000_reconcile_dev_drift_schema_align dropeó
-- pero que respaldan features VIVAS de cliente (avatar, notas internas, soft-delete,
-- AgencySettings.singleton, chatbot_lead.convertedToOsLeadId). La reconciliación
-- asumió que eran vestigios; el código de `main` las usa (ver smoke-report §2.3).
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "avatarEmoji" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "avatarImageUrl" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "avatarInitials" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;
ALTER TABLE "AgencySettings" ADD COLUMN IF NOT EXISTS "singleton" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "AgencySettings_singleton_key" ON "AgencySettings"("singleton");
ALTER TABLE "chatbot_lead" ADD COLUMN IF NOT EXISTS "convertedToOsLeadId" TEXT;
```

El `schema.prisma` **ya declara** estas columnas (no hay que agregar nada al modelo). Tras aplicar, `migrate diff --from-schema-datasource --to-schema-datamodel` debe dar **"No difference"**.

## 2.6 Plan de reconciliación recomendado (decisiones marcadas como mías)

1. **(hecho)** Borrar el `BOT_DELETED` duplicado de `schema.prisma` → build verde. **Se commitea con este branch.**
2. **(tu decisión)** Adoptar las columnas de cliente → guardar la migración de §2.5 y aplicarla **solo con `migrate deploy`** (NUNCA `migrate dev`/`reset`, que dispararían el drift→reset por la lane de Franco no-mergeada — ver bitácora `neon-phantom-drift`).
3. **(verificación read-only post-apply)** `migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --exit-code` → debe decir **"No difference"**. (`migrate status` NO detecta este tipo de drift; el diff sí.)
4. **(opcional, limpieza de historia)** La migración `20260621120000_reconcile_dev_drift_schema_align` queda en la historia (no se edita una migración aplicada). La de §2.5 la **revierte hacia adelante** — la historia replayada de cero termina consistente con el schema.
5. **Si en cambio decidís NO adoptar** (improbable: contradice 4 commits de features): habría que **revertir el código** de avatar/notas/hard-delete/singleton y **borrar las columnas del `schema.prisma`** — no recomendado.

## 2.7 Cómo correr el smoke (Franco)

```bash
# 1. Build prod (si OOM, subí el heap):
NODE_OPTIONS="--max-old-space-size=6144" npm run build

# 2. Suite e2e del setter (levanta `start:qa` en :3001 con QA_ALLOW_LOCALHOST=1):
npm run test:setter
#   - Si Chromium da ERR_CONNECTION_REFUSED: permitir los binarios de ms-playwright
#     en el firewall/antivirus del host (ver §1.2), o correr en CI.
#   - Para iterar contra un server propio ya levantado: SETTER_EXTERNAL_SERVER=1 (y
#     opcional SETTER_PORT=NNNN) antes del comando.

# 3. Invariantes (puros, sin server):
npm run check:invariant && npm run check:invariant:setter-meta && \
npm run check:invariant:escalamiento && npm run check:invariant:novedades && \
npm run check:invariant:mis-numeros && npm run check:invariant:timeline
```
