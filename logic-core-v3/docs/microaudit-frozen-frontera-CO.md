# Microauditoría dirigida — frozen, frontera y precondiciones CO-* (READ-ONLY)

Fecha: 2026-07-07. Verificación puntual de precondiciones para planificar CO-1 a CO-7 (no es una re-auditoría integral — esa ya existe en `docs/audit-repo-20260707.md`). Corrida en 3 tandas de solo-lectura: Bloques 1+2 y 3+5 vía subagente Explore en paralelo; Bloque 4 iniciado por subagente pero completado a mano en el hilo principal tras un `session limit` de la API a mitad de corrida (el subagente de Bloque 4 murió con `API error: session limit · resets 12pm America/Buenos_Aires` antes de terminar — no fue timeout ni error de comando).

---

## BLOQUE 1 — Reglas duras y frozen (fuente de verdad)

### 1.1 — Tabla frozen y reglas no-negociables (CLAUDE.md) + revisión de `.claude/`

**Fuente única de verdad confirmada:** `C:\PorfolioDevelOP\CLAUDE.md` (raíz del repo). Es el **único** CLAUDE.md trackeado en todo el repo (confirmado con `git ls-files`), y tampoco existe ninguno no trackeado (búsqueda de filesystem). **No existe ningún CLAUDE.md anidado dentro de `logic-core-v3/`.**

Reglas no-negociables, VERBATIM (`CLAUDE.md:7-25`):

```
## Non-negotiable rules

Never run `prisma migrate reset` — stop and report to user instead.
Never use `any` in TypeScript. Zero exceptions.
Never modify `src/components/3d/HeroArtifact.tsx`. It is frozen.
**Navegación:**
- **Sitio público** (landing + marketing): usar siempre `triggerTransition()`
  de `TransitionContext`. Nunca `router.push()` en el sitio público.
- **Portales** (admin `/admin/*` y cliente `/dashboard/*`): usar `<Link>`
  cuando sea posible; `router.refresh()` para revalidar tras mutaciones;
  `redirect()` en server actions. `router.push()` en client component solo
  cuando la navegación es imperativa post-submit y no hay alternativa; en ese
  caso, documentar con un comentario inline el motivo. `triggerTransition()`
  no aplica en portales (el Shutter no existe ahí).
Never self-confirm a sprint works because it compiles. User verifies.
Never touch files outside the current sprint scope.
Never hardcode secrets, API keys, or credentials in code.
Never expose internal error messages or stack traces to the client.
Never add a dependency without first checking if a native or already-installed alternative exists.
```

Tabla **Frozen files**, VERBATIM (`CLAUDE.md:163-171`):

```
## Frozen files

| File | Rule |
|------|------|
| `src/components/3d/HeroArtifact.tsx` | Never modify |
| `src/context/TransitionContext.tsx` | Always use `triggerTransition()` |
| `src/context/PreloaderContext.tsx` | Do not break the phase flow |
| `prisma/schema.prisma` | `migrate reset` is prohibited |
```

Exactamente 4 entradas. Ni `auth.ts` ni `dashboard-actions.ts` figuran.

**Revisión de `.claude/` (ambas ubicaciones):**

| Archivo | Contenido | ¿Reglas/policy sobre frozen files? |
|---|---|---|
| `C:\PorfolioDevelOP\.claude\settings.local.json` | Solo `permissions.allow` | NO |
| `C:\PorfolioDevelOP\.claude\launch.json` | Config de 3 servers (`next-dev`, `next-dev-qa`, `next-prod-qa`) | NO |
| `C:\PorfolioDevelOP\.claude\scheduled_tasks.lock` | Lock file de sesión | NO |
| `C:\PorfolioDevelOP\.claude\agents\visual-qa.md` | Protocolo de QA visual | NO — no agrega ni contradice frozen list |
| `C:\PorfolioDevelOP\logic-core-v3\.claude\settings.local.json` | Solo `permissions.allow` | NO |
| `C:\PorfolioDevelOP\logic-core-v3\.claude\launch.json` | Config de 2 servers | NO |

**Conclusión:** única fuente de verdad = `CLAUDE.md` raíz. Ningún `.claude/` agrega reglas ni overrides.

### 1.2 — ¿`auth.ts` o `dashboard-actions.ts` figuran como frozen?

**NO para ambos**, en CLAUDE.md, AGENTS.md, ni ningún `.claude/` (grep dedicado, 0 matches en los 7 archivos de `.claude/`).

**Nuance para quien planifique:** `auth.ts` (específicamente su callback `jwt`) es tratado **informalmente como "FROZEN" por convención de equipo** en bitácoras/changelogs (no en CLAUDE.md):

> `CHANGELOG-cuenta.md:362`: "El jwt callback de `auth.ts` (FROZEN) mata la sesión al detectar el mismatch N≠N+1."
> `CHANGELOG-cuenta.md:438`: "**`auth.ts` intacto:** el jwt callback (FROZEN) no fue modificado."
> `_lane-cuenta-plan.md:367`: "**El kill** (auth.ts:247-254, FROZEN, SOLO LECTURA)..."
> `_lane-cuenta-plan.md:243`: "**scope/frozen/auth:** 4 archivos; `auth.ts`/`prisma.ts`/`schema`/`ui/*` SIN tocar"

(Duplicado en `docs/client-portal/changelog/cuenta.md:396,484`.) Son bitácoras de sprint, no reglas oficiales, pero es convención sostenida en múltiples sprints.

`dashboard-actions.ts`: **ninguna cita lo etiqueta "frozen"**, ni siquiera informalmente. Aparece repetidamente como **"COMPARTIDO"/"COMPARTIDOS-READ"** (consumido, no editado, por otras lanes):

> `docs/client-portal/relevamiento-6-secciones.md:44`: "**COMPARTIDOS-READ:** ... `src/actions/dashboard-actions.ts` (approve/rejectTaskAction) ..."
> `docs/bitacora-roadmap.md:6511`: "`src/actions/dashboard-actions.ts` (`approveTaskAction`, `rejectTaskAction`, `markNotificationAsRead`) — todas con check explícito."

### 1.3 — Regla exacta sobre `prisma/schema.prisma` + protocolo de migraciones

**Es la opción (a): solo `migrate reset` está prohibido — NO frozen total.** La fila de la tabla es explícita y acotada a esa única operación. Reforzado por `AGENTS.md`, sección **"Workflow de cambios a BD"** (`AGENTS.md:143-148`), que instruye EDITAR el schema como paso 1:

```
## Workflow de cambios a BD

1. Editar `prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev --name [descriptive_name]`
3. SIEMPRE pegar el output del migrate en el reporte final
4. Si hay drift, FRENAR y reportar antes de hacer `migrate reset`
```

Y **"Política de errores"** (`AGENTS.md:156-162`):

```
## Política de errores

Si Codex encuentra:
- **Drift de Prisma:** parar y reportar. NO ejecutar `migrate reset`.
- **Conflictos de tipos:** parar y reportar.
- **Archivos legacy con código incompatible:** flagear pero no eliminar sin confirmación.
- **Migrations fallidas en BD remota:** parar y reportar con output completo.
```

**No hay un único doc formal de protocolo de migraciones** (confirmado: no existe `MIGRATIONS.md`/`CONTRIBUTING.md`); vive repartido:

- **`migrate deploy` vs `migrate dev`:** `docs/admin-changelog/Clientes rdc.md:77`: "**`migrate deploy`, no `migrate dev`, en una DB con drift.** El drift de Franco haría que `migrate dev` dispare reset. El camino seguro: escribir el `migration.sql` a mano y aplicarlo con `deploy`." También `docs/operations/00-entornos.md:84-86`.
- **Aditivo-only:** `docs/admin-changelog/Operaciones rdc.md:103`: "**Migraciones supervisadas:** SQL a la vista antes de tocar Neon; `migrate deploy` aditivo; nunca `reset`." También `docs/operations/b14-deploy-checklist.md:76`.
- **Review de SQL antes de aplicar:** mismo texto de arriba ("SQL a la vista antes de tocar Neon"); también `docs/bitacora-roadmap.md:2615`.
- **Coordinación con "Franco":** extensamente documentado (decenas de menciones en `bitacora-beta.md`, `bitacora-roadmap.md`, `smoke-report.md`, `admin-changelog/*.md`). P.ej. `docs/admin-changelog/Operaciones rdc.md:53` ("El drift de Franco (recurrente, documentado)"), `docs/operations/00-entornos.md:143-148` ("Regla de oro": nunca `migrate reset`, nunca seeds destructivos sin verificar `DATABASE_URL`, nunca copiar la URL de `main` a `.env.local`, nunca commitear secrets). **"Franco" no aparece en CLAUDE.md** (grep dedicado, 0 matches).

---

## BLOQUE 2 — Rutas exactas y clasificación de frontera

| Símbolo | Ruta real | ¿Bajo `chatbot/server/*`? |
|---|---|---|
| `runPreflightChecks` | `src/modules/chatbot/server/admin/preflightChecks.ts:13` — coincide EXACTO con lo esperado | **SÍ** |
| `getClientSession` | **No existe como símbolo** (0 matches en todo el repo) — solo existe el nombre de archivo `getClientSession.ts`, que exporta `getClientChatbotSession` | — |
| `getClientChatbotSession` | `src/modules/chatbot/server/admin/getClientSession.ts:5` (`export const getClientChatbotSession = cache(async () => {`) | **SÍ** |
| `saveClientSettings` | `src/modules/chatbot/server/admin/saveClientSettings.ts:34` | **SÍ** |
| `next.config.ts` | `logic-core-v3/next.config.ts` — 216 líneas, válido. **Nota:** tiene `typescript: { ignoreBuildErrors: true }` y `eslint: { ignoreDuringBuilds: true }` (ver Bloque 4) | N/A |
| `src/auth.ts` | `logic-core-v3/src/auth.ts` — 275 líneas | N/A |
| `src/proxy.ts` | `logic-core-v3/src/proxy.ts` — 173 líneas | N/A |

**`updateLeadStatus` — colisión de nombres, DOS funciones distintas:**

1. `src/modules/chatbot/server/admin/updateLeadStatus.ts:17` — opera sobre `prisma.chatbotLead`. **Bajo `chatbot/server/*`: SÍ.**
2. `src/app/(protected)/admin/leads/_actions/lead.actions.ts:95` — opera sobre `OsLead`/pipeline de leads general del admin. **Bajo `chatbot/server/*`: NO.**
3. (Nombre distinto, no colisiona literal) `src/lib/actions/leads.ts:19` — `updateLeadStatusAction`. **NO.**

Cualquier scope de CO-* que toque "updateLeadStatus" debe especificar de cuál de los dos dominios habla.

**`bulk-actions.ts` de chatbots admin — 3 archivos encontrados:**

| Ruta | Exports | ¿Es el de chatbots? | ¿Bajo `chatbot/server/*`? |
|---|---|---|---|
| `src/app/(protected)/admin/chatbots/bulk-actions.ts` | `bulkPauseBotsAction`, `bulkActivateBotsAction`, `exportLeadsBulkAction`, `bulkDeleteBotsAction` — sobre `botIds`/`prisma.botConfig` | **SÍ** | **NO** — vive en `app/`, rompe el patrón de ubicación del resto de símbolos de este bloque |
| `src/lib/bulk-actions.ts` | `bulkPauseBots`, `bulkExportLeads` — sobre `orgIds` | NO (dominio clientes/orgs) | NO |
| `tests/e2e/16-admin-bulk-actions.spec.ts` | test e2e | N/A | N/A |

**`gemini-2.5-flash` hardcodeado — 327 ocurrencias en 34 archivos, TODAS dentro de `logic-core-v3/`:**

Solo **13 líneas de código fuente real** están bajo `src/modules/chatbot/server/*`:
`chat/handleChatRequest.ts:603` (comentario), `llm/providers/google.ts:11,12,13,21,22,23`, `llm/index.ts:6,8` (JSDoc), `insights/generateInsights.ts:99`, `health/smokeTest.ts:22`, `admin/createClientWithBot.ts:172`, `admin/createBot.ts:82`.

Resto disperso (NO bajo `chatbot/server/*`):
- **Código fuente `.ts/.tsx` (9 líneas más):** `lib/ai/executive-brief.ts:19`, `app/api/admin/chatbot/test-prompt/route.ts:36`, `lib/onboarding/core.ts:133`, `lib/plan/fallback.ts:51`, `modules/chatbot/prisma/seed.ts:238`, `modules/chatbot/components/admin/BotConfigEditor.tsx:43`, `modules/chatbot/components/admin/onboarding/Step5Review.tsx:303`, `modules/chatbot/components/admin/config/tabs/AdvancedTab.tsx:12,13`.
- **Prisma (5 líneas):** `prisma/schema.prisma:1300`, `prisma/seeds/sync-plans.ts:57,73,89`, `prisma/migrations/20260512150823_chatbot_init/migration.sql:28`.
- **Scripts (4 líneas de código + 274 líneas en 6 logs de dev trackeados en git):** `scripts/seed-matsu.ts:126,147`, `scripts/_b14-2-seed-bench-prod.ts:149,169`; logs: `_b13-dev.log`(60), `_b14-dev.log`(62), `_ms1-dev.log`(72), `_b33-dev.log`(22), `_b35-dev.log`(26), `_b36-dev.log`(32).
- **Docs `.md` (22 líneas):** `docs/audit-repo-20260707.md:91,205`; `docs/audits/2026-05-auditoria-db.md:253,295,296`; `docs/audits/2026-05-cleanup-db-dev.md:122`; `docs/audits/2026-06-revalidacion-dashboard-chatbot.md:43,65`; `docs/audits/2026-06-revalidacion.md:66`; `docs/baselines/2026-05-chatbot-runtime.md:6,79`; `docs/bitacora-roadmap.md:28,391,498,500,1103,1214,2045,2289,6975,7278`; `docs/consolidacion-planoA-runtime.md:51`.

---

## BLOQUE 3 — Precondición CO-7 (cifrado de tokens OAuth)

### 3.1 — Helper de cifrado AES-GCM para `CrmIntegration`

**Existe un único helper**, en `src/modules/chatbot/server/crm/encryptSecret.ts`. Cifra específicamente `secretEncrypted`/`secretIv`/`secretTag` de `CrmIntegration` (el header opcional de auth hacia el webhook n8n del cliente) — **no** los tokens OAuth de GBP/Tiendanube/Cal.com.

Firmas completas:
```ts
// encryptSecret.ts:50
export function isCrmEncryptionConfigured(): boolean
// encryptSecret.ts:65
export function encryptSecret(plaintext: string): EncryptedSecret
// encryptSecret.ts:84
export function decryptSecret(payload: EncryptedSecret): string
// encryptSecret.ts:59-63
export interface EncryptedSecret {
  encrypted: string // base64
  iv: string        // base64
  tag: string        // base64
}
// encryptSecret.ts:25 (interno, no exportado)
function getKey(): Buffer
// encryptSecret.ts:14-16
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH_BYTES = 12
const KEY_LENGTH_BYTES = 32
```
Usa `createCipheriv`/`createDecipheriv`/`randomBytes` de `node:crypto`, `cipher.getAuthTag()` (L76), `decipher.setAuthTag(tag)` (L91).

Uso real confirmado: `admin/integrations/saveCrmIntegration.ts:112-117` (llama `encryptSecret`), `crm/index.ts:20-25` (reexporta).

**Hallazgo importante:** busqué explícitamente `encryptSecret`/`decryptSecret` sobre `gbpAccessToken`, `gbpRefreshToken`, `tiendanubeAccessToken`, `calComApiKey` — **no hay ninguna llamada**. Los 4 campos se leen/escriben como string plano en todos los puntos:
- `app/api/auth/google-business/callback/route.ts:52-53`
- `lib/integrations/google-business-profile.ts:59-90,169-176`
- `app/api/auth/tiendanube/callback/route.ts:67`
- `lib/integrations/tiendanube.ts:55-58`
- `lib/integrations/cal-com.ts:27-29`, `app/(protected)/dashboard/modules/agenda-inteligente/page.tsx:325-329`

No hay otro helper AES en el repo (confirmado: sin otro `createCipheriv`/`aes-256` bajo `src`, salvo un badge visual de texto "AES-256" sin lógica de cifrado en `dashboard/cuenta/boveda/page.tsx:84,143`, de la feature `ClientAsset`, no de OAuth).

### 3.2 — Env vars / keys requeridas

- **`CRM_SECRET_KEY`** — única env var (confirmé que `ENCRYPTION_KEY` no existe en ningún archivo del repo).
- `encryptSecret.ts:26` → `process.env.CRM_SECRET_KEY`.
- Debe decodificar a `Buffer` de 32 bytes exactos (64 chars hex) — `encryptSecret.ts:38-42`; si falta o es inválida, tira `CrmEncryptionError`.
- Docstring completo (`encryptSecret.ts:3-12`):
```
B5.8 — Cifrado de secrets opcionales del CrmIntegration (header de auth a n8n).
AES-256-GCM con key en env CRM_SECRET_KEY (32 bytes hex = 64 chars).
GCM provee autenticación además de cifrado: si alguien modifica el ciphertext
en la DB, el decrypt falla — no devuelve un secret distinto en silencio.
El secret JAMÁS se loguea ni en plano ni cifrado. Solo se decrypta dentro de
postToN8n.ts justo antes del fetch, en memoria.
```
- Documentada en `.env.example:225-234` (OPCIONAL — si falta, la UI deshabilita el campo; generación: `openssl rand -hex 32`).
- **Sin mecanismo de rotación documentado** (grep de "rotat/rotación/rotar" en todo el repo — el único hit relacionado es `EMAIL_UNSUBSCRIBE_SECRET`, no relacionado a `CRM_SECRET_KEY`).

### 3.3 — Ubicación de los 4 campos en `schema.prisma`

**Los 4 viven en el mismo y único modelo `Organization`** (`prisma/schema.prisma:332-449`):

| Campo | Ruta:línea | Declaración |
|---|---|---|
| `gbpAccessToken` | `schema.prisma:359` | `gbpAccessToken    String?   @db.Text` |
| `gbpRefreshToken` | `schema.prisma:360` | `gbpRefreshToken   String?   @db.Text` |
| `tiendanubeAccessToken` | `schema.prisma:367` | `tiendanubeAccessToken String?   @db.Text` |
| `calComApiKey` | `schema.prisma:375` | `calComApiKey   String? @db.Text` |

Ninguno tiene campo `Iv`/`Tag` compañero (a diferencia de `CrmIntegration.secretEncrypted/secretIv/secretTag`, `schema.prisma:1693-1696`) — consistente con 3.1: no hay cifrado aplicado sobre estos 4 campos hoy.

---

## BLOQUE 4 — Precondición CO-1 (gate de tipos/lint)

### 4.1 — Workflows de CI existentes

Solo **2 archivos de workflow en todo el repo**:

| Ruta | Corre `tsc`/lint? |
|---|---|
| `C:\PorfolioDevelOP\.github\workflows\db-backup.yml` (raíz) | NO — solo `pg_dump`/gpg-encrypt/restore-test contra Neon |
| `C:\PorfolioDevelOP\logic-core-v3\.github\workflows\e2e.yml` | NO — jobs `invariants`/`leados-integration`/`test` corren `npm run check:invariants`, `npm run test:leados`, `npm run test:e2e` (playwright), pero ningún step de `tsc --noEmit` ni `eslint` |

**Hallazgo crítico:** el propio header-comment de `db-backup.yml` (líneas 1-6) documenta que `e2e.yml` está **mal ubicado y nunca corrió**:

```
# Por qué este workflow vive en la RAÍZ del repo (no en logic-core-v3/.github/workflows/):
# GitHub Actions solo descubre workflows en <repo_root>/.github/workflows/. El
# archivo logic-core-v3/.github/workflows/e2e.yml está MAL ubicado y nunca corrió
# — pendiente moverlo (fuera de scope de B14.3).
```

El repo git real tiene su raíz en `C:\PorfolioDevelOP` (`.git` está ahí, no en `logic-core-v3/`), así que GitHub Actions solo descubre `C:\PorfolioDevelOP\.github\workflows\db-backup.yml`. **Conclusión: hoy no hay NINGÚN gate de tipos/lint en CI — y de hecho ni siquiera el test suite (`e2e.yml`) está corriendo en CI**, por el problema de ubicación.

### 4.2 — Baseline real HOY (corrido en vivo, 2026-07-07)

**a) `npx tsc --noEmit` (fresco, `logic-core-v3/`):** exit code 1, pero **solo 1 error real**:

```
src/lib/searchconsole.ts(119,25): error TS2769: No overload matches this call.
  ...
  Type 'GoogleAuth<AuthClient>' is not assignable to type '... | GoogleAuth<AuthClient> | ...'.
    Type 'import(".../node_modules/google-auth-library/...").GoogleAuth<...>' is not assignable to
    type 'import(".../node_modules/google-gax/node_modules/google-auth-library/...").GoogleAuth<...>'.
      Property '#private' in type 'GoogleAuth' refers to a different member that cannot be accessed
      from within type 'GoogleAuth'.
```

Es una colisión de tipos entre dos copias anidadas distintas de `google-auth-library` (una directa, otra bajo `node_modules/google-gax/node_modules/`) — problema de resolución de dependencias, no de lógica de aplicación. Categoría: lib/compartido (1 archivo, 1 error). Panel/dashboard: 0. Chatbot/motor runtime: 0.

**b) `package.json` scripts relevantes:**
```json
"lint": "eslint",
"build": "next build --webpack"
```
No hay script `"typecheck"` dedicado. `"lint"` no tiene `--fix` → seguro correrlo. Corrido fresco: **239 problems (103 errors, 136 warnings)** en **120 archivos distintos**, 70 warnings auto-fixables con `--fix` (0 errors auto-fixables).

Desglose por área (archivos distintos con al menos 1 problema):

| Área | Archivos |
|---|---|
| `app/(protected)/admin/**` | 17 |
| `app/(protected)/dashboard/**` | 1 |
| `app/**` fuera de `(protected)` (api routes, bienvenida, contact, error.tsx) | 6 |
| `modules/chatbot/**` | 23 |
| `modules/motor/**` | 0 |
| `src/lib/**` | 9 |
| `src/components/**` | 28 |
| `src/actions/**` | 1 |
| No-`src` (scripts/, prisma/seeds, .js sueltos en raíz, tailwind.config.ts, next.config.ts, public/widget.js) | 30 |
| Resto (context/hooks/types/emails, sin bucket propio) | ~5 |

Top reglas por frecuencia: `no-console` (68), `@typescript-eslint/no-unused-vars` (60), `react-hooks/set-state-in-effect` (38), `@typescript-eslint/no-require-imports` (16), **`@typescript-eslint/no-explicit-any` (14)** — nota: CLAUDE.md dice "Never use `any` in TypeScript. Zero exceptions", y hoy hay 14 violaciones activas de esa regla vía lint — `react-hooks/purity` (13), `no-unescaped-entities` (8), `no-assign-module-variable` (6), `react-hooks/refs` (4), `no-img-element` (4).

**c) Comparación contra reportes trackeados (stale check):**

Los 3 archivos están codificados en **UTF-16** (típico de redirección `>` en PowerShell) — se leyeron con `Get-Content -Encoding Unicode` para decodificar correctamente.

| Archivo | Fecha | Contenido real (decodificado) |
|---|---|---|
| `ts_errors.log` | 27-mar-2026 | 60 ocurrencias de `error TS` |
| `ts_errors.txt` | 03-abr-2026 | 3 errores distintos (`web-development/page.tsx`, `OurServices.tsx` ×2) |
| `.eslint_output.txt` | 27-mar-2026 | Summary: **"108 problems (73 errors, 35 warnings)"** |

**Veredicto: los tres están STALE (desactualizados por ~3 meses), y en direcciones OPUESTAS:**

- **TS errors: tendencia a la baja** — 60 (27-mar) → 3 (03-abr) → **1 (hoy)**. El baseline viejo sobreestima muchísimo el problema actual; hoy está prácticamente limpio (y el único error restante es de dependencias, no de código propio).
- **ESLint: tendencia al alza** — 108 problems (27-mar) → **239 problems (hoy)**, más del doble. El baseline viejo **subestima** el estado real de lint por más de 2×.
- **Caveat verificado:** `eslint.config.mjs` tiene un cambio local sin commitear (`git diff` confirmado), pero está **acotado a `src/modules/motor/**`** (regla de frontera de imports para el módulo Motor WhatsApp, actualmente en construcción) — y ese módulo tiene **0 violaciones** en el run fresco. Es decir, el cambio de config no explica el salto 108→239; ese crecimiento es real, de código en otras áreas del repo.

---

## BLOQUE 5 — Precondición CO-5/CO-6 (índices del portal)

### 5.1 — Ausencia de `@@index([organizationId])` en `Service`, `Message`, `Invoice`

**`Service`** (`schema.prisma:532-540`, bloque completo):
```prisma
model Service {
  id        String        @id @default(cuid())
  type      ServiceType
  status    ServiceStatus @default(ACTIVE)
  startDate DateTime      @default(now())

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```
Sin ningún `@@index`.

**`Message`** (`schema.prisma:588-597`, bloque completo):
```prisma
model Message {
  id        String   @id @default(cuid())
  content   String   @db.Text
  fromAdmin Boolean  @default(false)
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```
Sin ningún `@@index`.

**`Invoice`** (`schema.prisma:663-677`, bloque completo):
```prisma
model Invoice {
  id          String        @id @default(cuid())
  amount      Float
  currency    String        @default("USD")
  status      InvoiceStatus @default(PENDING)
  dueDate     DateTime
  paidAt      DateTime?
  paymentLink String?
  pdfUrl      String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @default(now()) @updatedAt

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```
Sin ningún `@@index`.

**Modelos "hermanos" con `@@index`/`@unique` cubriendo `organizationId`** (barrido completo: 20 modelos con `organizationId` en total, 17 de ellos indexados):

- Cluster de negocio 1:muchos (mismo patrón que `Service`): `Project` → `@@index([organizationId])` (`schema.prisma:562`); `ClientAsset` → `@@index([organizationId])` (`:733`); `Ticket` → `@@index([organizationId])` + `@@index([userId])` (`:763-764`).
- Hermano directo de `Message` (mismo patrón `organizationId`+`createdAt`+flag `read`): `Notification` → `@@index([organizationId, createdAt(sort: Desc)])` (`:718`), con comentario propio del schema (`:716-717`) documentando el motivo: `// B11.5 — dashboard/layout.tsx:81 hace findMany({where:{organizationId}, orderBy:{createdAt:'desc'}, take:5}) // en CADA request al /dashboard. Hoy solo PK index → seq scan + sort.`
- Hermanos de `Invoice` (billing/facturación): `Subscription` → `organizationId String @unique` (`:629`, índice único implícito); `OrganizationModule` → `@@index([organizationId])` + `@@unique([organizationId, moduleId])` (`:1194-1195`); `BusinessMetric` → `@@index([organizationId])` (`:794`); `PageView` → `@@index([organizationId])` (`:805`).
- Patrón general adicional (contraste): `ExecutiveBriefSnapshot:468`, `OrgMember:529`, `OnboardingTask:846`, `EmailContact:1217-1218`, `EmailCampaign:1248-1249`, `CrmSyncAttempt:1739`, `PanelAnnouncement:1795`, `MotorConversation:1979-1980`, `MotorMessage:2006-2007`.

**Conclusión:** de todos los modelos con `organizationId`, **`Service`, `Message` e `Invoice` son los únicos tres sin ningún índice** sobre esa columna; el resto (17+) sí lo tiene.

### 5.2 — `ContactSubmission`

Bloque completo (`schema.prisma:679-695`):
```prisma
model ContactSubmission {
  id         String   @id @default(cuid())
  name       String
  email      String
  phone      String?
  company    String?
  service    String?
  message    String   @db.Text
  read       Boolean  @default(false)
  leadStatus String?  @default("NUEVO")
  leadNotes  String?  @db.Text
  // P5.4 — atribución de referidos: código que trajo a este negocio entrante. String
  // suelto (NO FK): un código inválido/typo no rompe el insert; el match contra
  // ReferralCode.code se resuelve al convertir. null = orgánico (sin referido).
  referralCode String?
  createdAt  DateTime @default(now())
}
```

- **`leadStatus`** (`:688`) es **`String?`** con default `"NUEVO"` — **no es un enum**. El schema sí define enums análogos en otros modelos (`LeadStatus` en `OsLead.status`, `:1059-1068`/`:861`; `ChatbotLeadStatus` en `ChatbotLead.status`, `:1515-1521`/`:1488`), pero `ContactSubmission.leadStatus` no referencia ninguno de los dos.
- **Sin ningún `@@index`**: confirmada ausencia de índice por `createdAt` (`:694`), por `read` (`:687`), y por `referralCode` (`:693`, tampoco es FK). El modelo tampoco tiene `organizationId` (es de submissions públicas, previas a cualquier `Organization`).

### 5.3 — `npx prisma migrate status`

Corrido desde `logic-core-v3/` (solo lectura). Output completo:

```
◇ injected env (17) from .env.local
◇ injected env (0) from .env
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech"

82 migrations found in prisma/migrations

Database schema is up to date!
```

- **¿Drift?** No.
- **¿Migraciones pendientes?** No — `Database schema is up to date!`, sin listado de pendientes.
- **¿Divergencia con otra rama/entorno?** No hay ninguna advertencia; solo la conexión a `neondb` en `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`, 82 migraciones encontradas, schema al día.
- Dato adicional: el proyecto resuelve config vía `prisma.config.ts` (no solo `datasource`/`generator` del propio `schema.prisma`).
