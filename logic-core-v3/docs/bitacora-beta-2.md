# Bitácora Beta 2 — Ejecución del rediseño del flujo del setter (LeadOS)

> Registro vivo de la EJECUCIÓN del rediseño. Regla de oro: nada ✅ sin el chequeo que lo prueba.

---

## Estado global

- Roadmap v15. Decisiones D1-D7 cerradas.
- Fase: pre-bloque 0 + franja admin (D4) CERRADOS. **Bloque 2 — foco: 2.1 + 2.2 CERRADOS** (2.1a foco secuenciado + sticky · 2.1b postergados vencidos D6 + estado "todo en espera" · 2.2 avisos accionables integrados al foco). Próximo: resto del Bloque 2 (2.3 — subordinar cabina/cartera como pantalla secundaria).

---

## Cómo se llena (para Claude Code)

Al cerrar cada sprint, agregá/actualizá su entrada: qué se ejecutó · verde CON el chequeo y su resultado · abierto/roto + síntoma · decisiones en ejecución · hallazgos del repo. Nada ✅ sin chequeo.

---

## Pre-bloque 0 — Desbloqueo de verificación

### 0.1 — Auth QA-login · 2026-06-25

> ⚠️ **Sin entrada en `bitacora-beta.md`** — datos reconstruidos desde la memoria del proyecto (`project_qa_login_dev_only.md`).

**Problema:**
`POST /api/qa/login {persona}` minteaba la cookie correctamente en un build de `next start` sobre HTTP (`:3001`), pero `auth()` no la decodificaba → toda ruta protegida rebotaba `307 → /login`. El bypass QA no funcionaba en prod-QA.

**Causa raíz confirmada:**
El **nombre de la cookie de sesión** (que es también el salt del JWT) se decidía con **3 criterios distintos** que divergían en el escenario prod-sobre-HTTP:
- `src/app/api/qa/login/route.ts` (escribe + salt) → decidía por **protocolo de la request** (`http://` → sin prefijo `__Secure-`).
- `src/auth.ts` (`auth()` de página, Node) → por **`NODE_ENV`** (`production` → `__Secure-`).
- `src/auth.config.ts` (middleware edge) → **sin bloque `cookies`** → default de Auth.js por protocolo de `AUTH_URL` (`NEXTAUTH_URL=http://localhost:3000` → sin prefijo).
En prod-sobre-HTTPS los 3 coinciden; el quiebre era exclusivo del escenario QA (prod+HTTP).

**Qué se hizo:**
Fuente única `src/lib/auth-cookies.ts` (`SESSION_COOKIE_NAME` / `SESSION_COOKIE_OPTIONS` por `NODE_ENV`, edge-safe), importada por las 3 piezas. Behavior-preserving para login real (prod-HTTPS y dev-HTTP resuelven igual que antes); solo corrige prod+HTTP.

**Verde:**
- ✅ `POST /api/qa/login {persona:'super-admin'}` → cookie `__Secure-authjs.session-token` seteada → `/admin` 200.
- ✅ `POST /api/qa/login {persona:'setter'}` → `/setter` 200 y `/admin` rebota a `/setter` (no a `/login`).
- ✅ Sin cookie → 307 a login (guard de auth intacto).

**Abierto / caveats conocidos:**
- `curl` sobre `http://` no manda cookies `Secure` — usar `-H "Cookie: __Secure-authjs.session-token=<token>"` a mano (el browser sobre localhost sí las envía, es secure-context).
- Bounce cosmético de host `:3001 → :3000` por `NEXTAUTH_URL` — no afecta auth (ver `feedback_prodqa_authurl_port_bounce`).

---

### 0.2 — Playwright + línea base e2e · 2026-06-25

**Objetivo:** correr el suite e2e en browser por primera vez y dejar la LÍNEA BASE pre-rediseño. Premisa de entrada: "Playwright bloqueado en esta máquina (sospecha antivirus/firewall contra los binarios de ms-playwright)".

**Diagnóstico — la premisa era falsa. Playwright NO está bloqueado:**
- Binarios YA instalados: `chromium-1223` + `chrome-headless-shell-1223` en `%LOCALAPPDATA%\ms-playwright` (markers `INSTALLATION_COMPLETE` + `DEPENDENCIES_VALIDATED` presentes). `@playwright/test@1.60.0`.
- `chromium.launch({headless:true})` + `newPage()` + `setContent()` → **`LAUNCH_OK`**.
- `npx playwright install chromium` → exit 0 (sin descarga, sin bloqueo de red/AV).
- El suite corrió entero en Chromium sin un solo error de spawn/launch.
- Conclusión: no hubo nada que destrabar. El bloqueo histórico, si existió, ya no aplica.

**Setup real (la consigna asumía mal):**
NO existe `npm run test:setter` ni specs "setter". El suite e2e es **`npm run test:e2e`** (`playwright test`), 22 archivos spec, **50 tests** (no 35). El `playwright.config.ts` levanta su propio `webServer: npm run start` en `:3000` (reuseExistingServer local). baseURL `http://localhost:3000`, 1 worker, fullyParallel:false. Corrido **exactamente como está** — sin tocar config ni tests (medir, no maquillar).

**LÍNEA BASE (`npm run test:e2e`, reporter list, 1 worker, 3.9m):**
- ✅ **32 passed · 10 failed · 8 skipped** · exit 1.
- Log completo: `C:\tmp\e2e-baseline.log`. Artefactos (screenshots/diffs): `test-results/`.

**Los 10 fallos — clasificados (NINGUNO es Playwright, todos preexistentes):**
- **7× regresión visual** (`22-visual-regression.spec.ts`): diffs de 3–8% px contra snapshots guardados (`/admin`, `/admin/clients`, `/admin/alerts`, `/admin/_design`, `/dashboard`, `/dashboard/chatbot`, `/dashboard/chatbot/settings`). ⚠️ **La baseline visual YA está roja ANTES del rediseño** → los snapshots `*-chromium-win32.png` estaban desactualizados respecto al estado actual. No sirven como "before" limpio; el rediseño los regenera igual (`--update-snapshots`). NO son deuda nueva del rediseño.
- **2× `16-admin-bulk-actions`**: `locator.check()` timeout 15s — el checkbox es `sr-only` y un `<label class="absolute … cursor-pointer">` intercepta los pointer events ("element is not stable" / "intercepts pointer events"). Interacción rota/flaky real, no bloqueo de browser.
- **1× `30-onboarding-e2e-complete`** (flujo completo): timeout esperando el input de teléfono (`getByPlaceholder(/5493815555555/i)`) en `helpers/form.ts:15` — el wizard no llegó al campo esperado.

**8 skipped:** tests con `test.skip()` condicional (gating `@smoke` / conteo de fixtures) — comportamiento normal, no fallos.

**Verde:**
- ✅ Playwright operativo en Chromium, sin intervención de entorno.
- ✅ Suite `npm run test:e2e` (50 tests) corre end-to-end. Línea base **32/10/8** capturada.

**Para el rediseño:** este 32/10/8 es el "antes". Los **7 fallos visuales NO son deuda nueva** — regenerar con `--update-snapshots`. Los **3 fallos funcionales** (bulk-actions ×2, onboarding ×1) **sí son señal a vigilar**: si el rediseño toca esas pantallas, distinguir regresión-nueva de roto-preexistente.

---

### 0.3 — Seeds del setter (estados del flujo) · 2026-06-25

**Objetivo:** sembrar ≥1 OsLead en cada estado relevante del flujo del setter para verificación perceptual del rediseño B9.

**Descubrimiento — cobertura previa vs. faltantes:**

| Estado objetivo | Cobertura previa |
|---|---|
| Frío (PROSPECTO, sin dossier) | ✅ ya cubría |
| Esperando respuesta (DEMO_ENVIADA + nextFollowUpAt) | ✅ ya cubría |
| Postergado futuro (POSTERGADO + reactivateAt > now) | ✅ ya cubría |
| Ficha a medias (dossier FICHA, fichaJson parcial) | ❌ faltaba |
| Caliente (dossier EVALUADA, score ≥ 4) | ❌ faltaba |
| En revisión (dossier EN_REVISION) | ❌ faltaba |
| Aprobado (dossier APROBADA + aprobadaAt + draftUrl) | ❌ faltaba |
| Rechazado con nota (dossier RECHAZADA + rechazos[]) | ❌ faltaba |
| Descartado (dossier DESCARTADA) | ❌ faltaba |
| Postergado vencido (POSTERGADO + reactivateAt < now) | ❌ faltaba |

**Qué se hizo:**
- Archivo modificado: `prisma/seed-agency-os.ts`
  - Import agregado: `DossierStage`
  - Tipos nuevos: `DossierData`, `QaLeadSeed`
  - Array nuevo: `qaLeadSeeds` — 7 leads con datos realistas, todos bajo `franco`
  - Funciones nuevas: `ensureLeadDossier()` (upsert idempotente) y `ensureQaLeads()`
  - `main()`: llama a `ensureQaLeads(members)` después del loop de `leadSeeds`

**Leads QA sembrados:**

| businessName | status | dossier stage |
|---|---|---|
| Café Bergamota | POSTERGADO | sin dossier (reactivateAt: 7 días atrás — postergado vencido) |
| Panadería Don Cosme | PROSPECTO | FICHA (fichaJson parcial) |
| Veterinaria San Marcos | PROSPECTO | EVALUADA (score 5 — caliente) |
| Centro Pilates Armonía | RESPONDIO | EN_REVISION |
| Clínica Dental Omega | CERRADO | APROBADA (aprobadaAt + draftUrl) |
| Studio Yoga Balance | RESPONDIO | RECHAZADA (rechazos con nota) |
| Zapatería El Buen Paso | PERDIDO | DESCARTADA |

**Verde:**
- ✅ `tsc --noEmit`: sin errores.
- ✅ `prisma migrate diff` (live → schema): `No difference detected` (seed no tocó schema).
- ✅ 7/7 leads QA verificados en BD por query directo.
- ✅ Guard anti-prod (`seed-guard.ts`, Sprint C.0): intacto, no tocado.
- Conteo post-seed: **37 leads totales** (PROSPECTO×14, DEMO_ENVIADA×5, RESPONDIO×5, VIO_VIDEO×3, CALL_AGENDADA×1, CERRADO×4, PERDIDO×3, POSTERGADO×2). Por stage: FICHA×2, EVALUADA×2, CONSTRUCCION×1, EN_REVISION×8, APROBADA×2, RECHAZADA×2, DESCARTADA×2.

**Issue preexistente (fuera de scope):**
El seed falla en la fase `projectSeeds` con "No se encontro organizationId para develop" cuando se corre sin org `develop` en la BD. Los `qaLeadSeeds` se insertan antes de ese punto y quedan completos. No se toca en este sprint.

---

## Bloque franja admin

> *(Los bloques siguientes — franja admin, 1-6 — se agregan acá abajo, uno por bloque, con el mismo formato.)*

### admin-0 — Unificar la regla "caliente = score≥4" en `esCaliente()` · 2026-06-27

**Objetivo:** REFACTOR puro. La regla "lead caliente" (score ≥ 4) estaba escrita INLINE en 5 lugares, **desincronizados**: unos excluían `DESCARTADA`, otros no. Centralizar las 5 copias en la función canónica `esCaliente()` (`src/lib/leados/revision.ts`), resolviendo la inconsistencia, sin cambiar qué leads son calientes en el flujo real. (El desacople al campo `caliente` nuevo es admin-1.)

**Descubrimiento — la inconsistencia exacta:**

| # | Sitio | ¿Excluía DESCARTADA? |
|---|---|---|
| a | `flow.ts:454` `clasificarLead` | ✅ SÍ (`&& stage !== 'DESCARTADA'`) |
| b | `flow.ts:71` `gateBriefAbierto` (→`gateEnvioDemo`) | ❌ no |
| c | `page.tsx:100` badge "Caliente" | ✅ SÍ |
| d | `opener-step.tsx:122` badge/banner | ❌ no |
| e | `dossier.actions.ts:153` gatillo de notificación | ❌ no |

Todas sacan el score de `evaluacion.score`. La canónica `esCaliente()` ya existía y la consumían **4 sitios del admin** (`admin/layout.tsx`, `admin/leados/[leadId]/page.tsx` ×2, `admin/leados/page.tsx`) — pero solo tomaba el score, sin mirar DESCARTADA.

**Decisión de la versión canónica:** la correcta EXCLUYE DESCARTADA. Se extendió la firma a `esCaliente(score, stage?)` con **`stage` opcional** — así los 4 call-sites del admin que ya la usaban quedan intactos (neutro), y los sitios que tienen el stage a mano lo pasan para blindar la regla.

**⚠️ Inconsistencia DESCARTADA — ¿neutra o bug latente? → NEUTRA hoy (no había bug disparable):**
La transición a `DESCARTADA` (`dossier.ts:172`) **no** gatea por score, pero su **único** llamador es `registrarEvaluacion`, gateado en `if (score <= 2 && motivoDescarte)` (`dossier.actions.ts:143`). Entonces en el flujo real **DESCARTADA ⇒ score ≤ 2**, y `score ≥ 4` es imposible para un lead descartado. El seed lo confirma: el único DESCARTADA sembrado (Zapatería El Buen Paso) tiene **score 1**. Las 5 copias dan el MISMO veredicto en todo caso alcanzable. La unificación es **100 % comportamiento-neutro**; la versión defensiva (excluye DESCARTADA en los 5) solo **cierra el hueco latente**: si mañana aparece un camino que descarte a cualquier score, b/d/e habrían mal-marcado caliente — ahora no.

**Cambio (1 fuente de verdad):**
- `revision.ts` — `esCaliente(score, stage?)` extendida (excluye DESCARTADA) + import de `DossierStage`.
- `flow.ts` — copias a y b → `esCaliente(score, input.stage)` / `esCaliente(score)`; import de `esCaliente`.
- `page.tsx` (setter) — copia c → `esCaliente(evaluacion?.score ?? null, dossier?.stage ?? null)`.
- `opener-step.tsx` — copia d → `esCaliente(evaluacion?.score ?? null, stage)`.
- `dossier.actions.ts` — copia e → `if (esCaliente(score))`.
- Sin tocar: schema, asignación de leads, campo `caliente` (admin-1). `evaluacion-step.tsx:68` (escala de tono 3-vías amber/blue/zinc, no es el booleano caliente) queda como está.

**Verde (nada ✅ sin chequeo):**
- ✅ `tsc --noEmit` → exit 0.
- ✅ `eslint` sobre los 5 archivos → exit 0.
- ✅ **Equivalencia** (harness `esCaliente` unificado vs las 5 reglas viejas): PASS en todo caso alcanzable. San Marcos (score 5) → caliente (T); Pilates (score 4) → T; score 3/2/null → F; Zapatería DESCARTADA (score 1) → F. El único punto de divergencia (DESCARTADA + score ≥ 4) es **inalcanzable**; ahí la nueva da `false` (defensiva) y las viejas b/d/e darían `true`.
- ✅ `npm run build` → exit 0 (tabla de rutas completa).
- ✅ `npx prisma migrate status` → up to date (72 migs, sin tocar schema).
- ✅ `npm run test:e2e` → **31 passed / 10 failed / 9 skipped** (exit 0). Los **10 fallos son los mismos** de la línea base (7 visual-regression + 2 bulk-actions + 1 onboarding — todos preexistentes). El delta 32→31 pass / 8→9 skip es **un solo test** (`07-admin-navigation › rutas multi-tenant del bot develop cargan`) que pasó de passed a **self-skip**: el helper `gotoAdminRoute` llama `test.skip(true)` cuando `page.goto()` no estabiliza en 30 s — flake de navegación en `next start` frío sobre rutas `/admin/clients/develop/chatbot/*`. **Sin relación con admin-0**: ese test toca rutas del bot admin `develop`, no la regla `caliente` del setter (que es lo único que tocó este sprint). Total 50 intacto.

**Salida:** inconsistencia DESCARTADA **neutra** (no corrigió bug disparable; cerró hueco latente). Refactor comportamiento-neutro confirmado por equivalencia + e2e sin regresión nueva.

### admin-1a — Campo persistido `OsLead.caliente` + backfill desde el score · 2026-06-27

**Objetivo:** crear el campo `caliente` persistido (D4 lo marca Franco a ojo, reemplazando el caliente 100 % derivado del score ≥ 4 que vive en `evaluacionJson`) y **backfillear** los calientes vigentes para no perderlos. **Todavía NADIE lo setea ni lo lee** — el comportamiento sigue siendo el del score (vía `esCaliente()` de admin-0) hasta admin-1b. Solo crea el campo y lo siembra.

**Descubrimiento (read-only):**
- `OsLead` en `schema.prisma:810`; el score NO vive en `OsLead` sino en `OsLeadDossier.evaluacionJson` (Json) + `OsLeadDossier.stage` (`schema.prisma:931`). El backfill cruza `OsLead → dossier`.
- Lectura del score hoy: `EvaluacionSchema` (`contracts.ts:44`, `score: int 1-5`) parseada por `parseEvaluacion` (`flow.ts:101`, `safeParse` tolerante). Regla canónica `esCaliente(score, stage)` = `score ≥ 4 && stage !== 'DESCARTADA'` (`revision.ts:46`, `SCORE_CALIENTE = 4`).
- `npx prisma migrate status` → up to date (72 migs) antes de tocar nada.

**Cambio:**
- `schema.prisma` — `OsLead.caliente Boolean @default(false)` (edge-safe, nunca null).
- Migración **SOLO aditiva** `20260627000000_admin_1a_add_oslead_caliente/migration.sql` — una sola `ALTER TABLE "OsLead" ADD COLUMN "caliente" BOOLEAN NOT NULL DEFAULT false;`. Nada más: sin backfill en la migración, sin tocar otras columnas.
- Backfill idempotente `scripts/admin-1a-backfill-caliente.ts` — **importa la regla real** (`esCaliente` de `revision.ts`, módulo puro) y el schema real (`EvaluacionSchema` de `contracts.ts`) por ruta relativa con extensión `.ts` (convención Node 24 ESM del repo, como los `*.invariant.ts`). Replica `parseEvaluacion` con el mismo `safeParse`: blob inválido/ausente ⇒ score null ⇒ no caliente. Setea `caliente` al valor calculado para TODOS los leads (true a los que la regla marca, false al resto) y **solo escribe cuando cambia** (sin write/`updatedAt` churn). Re-correrlo converge al mismo estado.

**Por qué no backfill en SQL:** la consigna exige que el backfill **coincida con `esCaliente()`**. Reimplementar `score ≥ 4 && stage != DESCARTADA` en SQL podría driftear de la fuente canónica; el script llama la función real, garantizando el espejo exacto.

**Verde (nada ✅ sin chequeo):**
- ✅ `npx prisma migrate deploy` → migración aplicada (73 migs).
- ✅ `npx prisma migrate diff` (live → schema) → **"No difference detected"** (sin drift).
- ✅ `npm run build` → exit 0 (tabla de rutas completa, type check incluido).
- ✅ `npx prisma migrate status` → up to date (73 migs).
- ✅ **Backfill correcto:** **37 leads totales, 12 `caliente=true`**. Conteo independiente leído de la columna persistida (no del script) = 12. **Veterinaria San Marcos (score 5) → `caliente=true`** ✓ (confirmación pedida por la consigna). Los 12 son exactamente los que `esCaliente()` marca hoy (score ≥ 4, ninguno DESCARTADA).
- ✅ **Idempotencia:** segunda corrida → **0 filas actualizadas**, 12 caliente (converge).
- ✅ `npm run test:e2e` → **31 passed / 10 failed / 9 skipped** (exit 0). **Idéntico a admin-0:** los 10 fallos son los mismos de la línea base (7 visual-regression + 2 bulk-actions + 1 onboarding, todos preexistentes) y el único pass→skip es el mismo flake de navegación (`07-admin-navigation › rutas multi-tenant del bot develop`). Sin regresión nueva — coherente con que el campo **no se usa aún**.

**Salida:** campo `caliente` creado y backfilleado (12/37) en espejo exacto de `esCaliente()`. Lecturas SIN reapuntar (eso es admin-1b). Migración puramente aditiva, sin drift.

### admin-1b — El caliente operativo pasa del score al CAMPO (marca al asignar + reapunte de `esCaliente`) · 2026-06-27

**Objetivo:** cerrar el desacople que admin-1a dejó preparado. (a) Franco marca caliente desde el control de asignación (toggle, editable después de asignar) y se persiste en `OsLead.caliente`; (b) `esCaliente()` lee el CAMPO, no el score. Tras este sprint el caliente operativo (badges, orden de cola, gates de demo preventiva) es el campo de Franco, no el score del setter. **No se toca** la notificación de evaluación caliente ni el veredicto del setter (eso es admin-1c).

**Descubrimiento (read-only, subagente Explore + grep exhaustivo):**
- `esCaliente(score, stage?)` (`revision.ts:46`) la consumían **9 call-sites** — Explore reportó 5, el **grep agregó 4** que habrían roto el build: `opener-step.tsx:123` (badge + hint demo preventiva), `admin/layout.tsx:30` (cuenta del sidebar), `admin/leados/[leadId]/page.tsx:81 y :93` (badge del detalle + orden de "siguiente en cola").
- Los gates `gateBriefAbierto(status, score)` y `gateEnvioDemo({…score})` (`flow.ts`) reciben el score y lo enchufan a `esCaliente`. Reapuntar ⇒ cambiar su firma a `caliente: boolean` y propagarlo a TODOS sus callers (wizard, evaluacion-step, seguimiento-step, dossier.actions, outreach.actions).
- Invariante de aislamiento: `npm run check:invariant` (`assignment-trail.invariant.ts`) verifica `ownedLeadWhere`/`ownedListWhere` (por `assignedToId`) + exclusión del canal SISTEMA. El módulo puro `isolation.ts` NO se toca.
- El backfill (admin-1a) sembró `caliente = esCaliente(score, stage)` con el guardrail DESCARTADA ⇒ los calientes vigentes quedan idénticos tras el reapunte.

**Cambio:**
- `revision.ts` — `esCaliente(caliente: boolean, stage?)` = `caliente && stage !== 'DESCARTADA'`. **Conserva el guardrail DESCARTADA** (importa MÁS ahora: Franco puede marcar a mano un lead de score bajo que después se descarta). `SCORE_CALIENTE` sigue exportada (la usa la notificación).
- `flow.ts` — gates `score → caliente`; `clasificarLead` deriva caliente/gate del campo (`input.caliente`); `score` queda solo como dato informativo `HomeLead.score`. `HomeLeadInput` suma `caliente: boolean`.
- `home.ts` — `buildHomeLeads` pasa `caliente: lead.caliente`.
- Setter detalle (`leads/[leadId]/page.tsx`) — badge `esCaliente(lead.caliente, stage)`; `WizardLead` suma `caliente` (campo crudo, sin guardrail) para el gate del wizard.
- `lead-wizard`, `evaluacion-step`, `opener-step`, `seguimiento-step` — reciben `caliente` por prop. `opener-step`/`seguimiento-step` dejan de importar `esCaliente`/`Evaluacion` (a `seguimiento` se le saca el prop `evaluacion`, ya no usado).
- `dossier.actions.ts` — el gate sigue el campo (`lead.caliente`); **la notificación de evaluación caliente queda en el score** (`if (score >= SCORE_CALIENTE)`, explícita, NO vía `esCaliente`) — es la señal del setter, la reconcilia admin-1c.
- `outreach.actions.ts` — gate de envío con `caliente: lead.caliente`.
- Admin lecturas (`layout.tsx`, `leados/page.tsx`, `leados/[leadId]/page.tsx`) — cuenta del sidebar, flame/orden de la cola y badge del detalle leen el campo; los `select` Prisma suman `caliente: true`. El badge "Score X/5" se conserva (informativo).
- **Marca + persistencia:** `AssignLeadSetterSchema` suma `caliente: z.boolean()`; `AssignSetterControl` suma un toggle `role="switch"` (ámbar/Flame, editable post-asignación, `dirty` incluye el toggle); `assignLeadSetter` persiste `caliente` JUNTO al `assignedToId` y revalida la superficie del setter (`/setter`, `/setter/leads/[id]`) y el tag del sidebar (`admin-revision-resumen`) cuando el caliente cambia — aunque NO haya reasignación. **El toggle NUNCA toca `assignedToId`** (aislamiento intacto).
- `admin/leads/[leadId]/page.tsx` — pasa `caliente={lead.caliente}` al control.
- Backfill `admin-1a-backfill-caliente.ts` — desacoplado de `esCaliente` (ahora leería el propio campo: circular): lleva su copia del umbral score→campo (`SCORE_CALIENTE`). `scripts/**` está excluido del tsconfig, pero se deja coherente.

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run check:invariant` → **OK** ("ownership intacto, evento interno excluido"). **CLAVE** — confirma que la marca no movió el aislamiento (premisa del sprint: el toggle no toca `assignedToId`).
- ✅ `npx tsc --noEmit` → **0 errores** (toda la cadena de firmas score→caliente, props nuevos, selects y el schema type-checkean).
- ✅ `npm run build` → exit 0 (tabla de rutas completa, type check incluido).
- ✅ `npm run lint` (mis archivos) → limpio. El único error en un archivo tocado (`seguimiento-step.tsx:199`, `Date.now()` en render / `react-hooks/purity`) es **preexistente** (fuera de mi diff, confirmado por `git diff`); lint ya estaba rojo en la línea base por eso + los `script*.js` de la raíz.
- ✅ `npm run test:e2e` → **32 passed / 10 failed / 8 skipped** — **idéntico a la línea base 32/10/8**. Los 10 fallos son los preexistentes (7 visual-regression + 2 bulk-actions + 1 onboarding); **ningún test se movió por el cambio de semántica** (ninguno asumía caliente-por-score) y ningún verde se rompió.
- ✅ **Funcional en runtime (prod-QA :3000, super-admin):** el sidebar muestra "8 en revisión, **6 calientes**" leyendo el campo. Marcado a mano de un lead **score 1** (caliente=false) → tras guardar, el detalle de revisión muestra la flama **Caliente** junto a "Score 1/5" (bajo la regla vieja `esCaliente(1)=false`, jamás caliente). Desmarcado → la flama desaparece. El campo manda; el score quedó inerte. Estado QA restaurado (caliente=false).

**Salida:** el caliente operativo es el campo de Franco. `esCaliente()` reapuntada al campo (guardrail DESCARTADA conservado); las 9 lecturas operativas lo siguen; la notificación de evaluación queda en el score (admin-1c). Toggle de marca persistido vía `assignLeadSetter` sin tocar el aislamiento — invariante verde. Sin regresión e2e (32/10/8).

### admin-1c — La opinión del setter sobre temperatura pasa a INFORMATIVA (notificación + veredicto) · 2026-06-27

**Objetivo:** cerrar D4. Con el caliente operativo ya desacoplado al campo de Franco (admin-1b), volver INFORMATIVAS las dos señales que aún emite el setter sobre temperatura: (D4.a) la notificación que dispara una evaluación con score alto, y (D4.b) el veredicto manual `CALIENTE`. Ninguna puede volver a determinar el caliente operativo — ese es el campo de Franco. **No se toca** el campo `caliente` ni la asignación (admin-1b).

**Descubrimiento (read-only):**
- **D4.a** — `notificarEvaluacionCaliente` (`notify.ts:117`). La dispara `registrarEvaluacion` con `if (score >= SCORE_CALIENTE)` (`dossier.actions.ts:157`). Hallazgo clave: **ya NO hacía nada operativo** — solo manda Telegram + estampa `calienteNotificadaAt` (idempotencia, en `evaluacionJson`). NO toca `OsLead.caliente`, NO abre gates, NO dispara demo preventiva. Lo único desalineado era el **texto** ("🔥 Lead caliente"), que implicaba caliente operativo.
- **D4.b** — veredicto `CALIENTE` (`VEREDICTO_VALUES`, `contracts.ts:42`). Grep exhaustivo de `.veredicto`: se consume SOLO en (1) display — badge ámbar/Flame en `evaluacion-step.tsx:75-80` + paneles del admin + `copy-blocks.ts:80`; y (2) la métrica descarte/avance `calcularRatioSetters` (`revision.ts:116`), donde `CALIENTE` cuenta como "avanzada". **NUNCA** alimenta `esCaliente()`, el gate ni clasificación alguna. Ya era info-only.

**Cambio (texto/intención, sin tocar lógica de branches):**
- `notify.ts` — `notificarEvaluacionCaliente` → **renombrada `notificarEvaluacionScoreAlto`** (nombre honesto: avisa de score alto, no declara caliente). Texto nuevo INFORMATIVO: `📊 Evaluación con score alto — [negocio]` / `[setter] evaluó este lead con score X/5` / razonamiento / *"Es info para tu criterio: si lo querés caliente, marcalo vos en la asignación."* Se **conserva** el trigger (score ≥ 4) y la idempotencia. El flag `calienteNotificadaAt` se mantiene con su nombre legacy (renombrarlo exigiría migrar los blobs ya estampados y arriesgaría re-notificar) — documentado como flag de idempotencia, no caliente.
- `dossier.actions.ts` — import + call-site al nuevo nombre; comentario reescrito: la señal es la lectura del setter, NO determina el caliente operativo ni abre gates (no pasa por `esCaliente()`).
- `contracts.ts` — comentarios: `VEREDICTO_VALUES` documenta que `CALIENTE` es lectura informativa del setter (display + métrica), no clasificación; `calienteNotificadaAt` documenta que es flag de idempotencia legacy, no caliente operativo.

**Verde (nada ✅ sin chequeo):**
- ✅ `npx tsc --noEmit` → **0 errores** (rename propagado a los 2 call-sites; sin referencias colgando — grep `notificarEvaluacionCaliente` = 0 archivos).
- ✅ `npm run build` → exit 0 (tabla de rutas completa, type check incluido).
- ✅ `npm run lint` (mis 3 archivos) → limpio.
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema tocado** — el sprint es texto/rename/comentarios.
- ✅ **Invariante funcional (probado por traza de código, no hay UI nueva visible — la notificación es Telegram-only y el badge del veredicto no se tocó):** el ÚNICO write a `OsLead.caliente` en todo `src/` es `lead.actions.ts:165` (`data: { assignedToId, caliente: parsed.caliente }`, la asignación del admin — campo de Franco). NINGÚN punto del flujo del setter (`dossier.actions.ts` / `dossier.ts` / `notify.ts`) escribe el campo. ⇒ una evaluación score 5 del setter **no puede volver caliente el lead por sí sola**: solo escribe `evaluacionJson` (score/veredicto/razonamiento, que se ven en el badge) + dispara el Telegram informativo. El caliente sigue dependiendo del campo de Franco.
- ✅ `npm run test:e2e` → **25 passed / 12 failed / 13 skipped**. **Ningún fallo toca el path de admin-1c:** no existe NINGÚN spec de setter/leados/evaluación (grep `setter|leados|evaluacion` en `tests/e2e/` = 0 archivos), así que un cambio de texto/rename/comentarios en `notify.ts`/`contracts.ts`/`dossier.actions.ts` no puede mover resultados. Los 12 fallos son dominios ajenos: 7 visual-regression (admin/dashboard), 2 client-personalization (bot del cliente), 2 admin-bulk-actions, 1 onboarding. Los 2 de client-personalization (delta vs la base 32/10/8 de admin-1b) **reproducen en aislamiento** (`guardar cambios → cambios guardados` no completa, dominio del dashboard del cliente, sin relación con mis archivos). El corrimiento de conteos vs admin-1b (skips 8→13, passes 32→25) es **drift de estado de la Neon dev compartida** entre ambas corridas (skips condicionados por seed/sesión QA), no código. **Limitación honesta:** no se pudo re-baselinear limpio (admin-1b y admin-1c comparten archivos sin commitear), pero la ausencia total de cobertura e2e del path tocado lo deja estructuralmente exonerado.

**Hallazgo fuera de scope (NO tocado — reportado):** el gate server-side `EVALUADA→BRIEF` dentro de `transitionDossier` (`dossier.ts:165`) **todavía abre la demo preventiva con el score del setter** (`if (!leadRespondio && (score === null || score < 4))`). admin-1b movió el gate UI-facing (`gateBriefAbierto`) al campo `caliente` pero dejó ESTE gate server-side sobre el score. ⇒ el score ≥ 4 del setter **aún dispara operativamente** la demo preventiva. Contradice el objetivo de D4 (la opinión del setter no debería disparar nada operativo), pero el sprint enumeró solo notificación + veredicto y pidió no tocar el gate/asignación. **Decisión de Franco:** ¿plegar este gate al campo `caliente` (cerrar D4 del todo) en un admin-1d, o es intencional que el score siga siendo un atajo de demo preventiva?

**Salida (cierre de la franja admin / D4):** la opinión del setter sobre temperatura es informativa. La notificación avisa "score alto" como señal para el criterio de Franco (sin tocar el campo ni gates); el veredicto `CALIENTE` se sigue guardando y mostrando (para entrenar el ojo) sin alimentar clasificación. **Regla de oro:** la única fuente del caliente operativo es el campo `OsLead.caliente` que marca Franco. Pendiente flagueado: el gate server-side de demo preventiva (`dossier.ts:165`) sigue mirando el score.

### admin-1d — El gate server-side de demo preventiva pasa del score al CAMPO `caliente` (cierra D4 de punta a punta) · 2026-06-29

**Objetivo:** responder el pendiente que admin-1c flageó. El gate `EVALUADA→BRIEF` dentro de `transitionDossier` (`dossier.ts`) era el ÚNICO caliente operativo que admin-1b/1c dejaron sobre el score del setter: la UI (`gateBriefAbierto`) y el flag del action ya decidían con el campo `caliente`, pero el server seguía abriendo la demo preventiva con `score >= 4`. Drift real: un lead score 5 sin marcar caliente abría el brief server-side igual, contradiciendo la UI. Decisión de Franco: **plegar el gate al campo** (no dejar el score como atajo). Tras esto UI y server miran el MISMO campo.

**Descubrimiento (read-only, confirmado contra el código):**
- `dossier.ts` `transitionDossier` — el `include` traía sólo `lead: { select: { status } }`, **sin `caliente`**. Confirmado.
- `case 'BRIEF'` — condición vieja: parseaba `evaluacionJson` (`EvaluacionSchema.safeParse`), sacaba `score` y bloqueaba con `!leadRespondio && (score === null || score < 4)`. El `score` y el `leadRespondio` local eran sus únicos consumidores en el case.
- La UI decide la MISMA transición con `gateBriefAbierto(status, caliente)` = `leadRespondio(status) || esCaliente(caliente)` (`flow.ts:77`), consumida por `lead-wizard.tsx:117` y `evaluacion-step.tsx:326`; el action ya expone `gateBriefAbierto(lead.status, lead.caliente)` en su flag (`dossier.actions.ts:166`) y **delega el gate real a `transitionDossier`** ("acá no se duplica la regla", `dossier.actions.ts:174-177`). ⇒ el server era el único punto desalineado.
- `esCaliente(caliente, stage?)` = `caliente && stage !== 'DESCARTADA'`. Con `stage` ausente (call del gate) = `caliente`. En la transición a BRIEF el `from` es siempre `EVALUADA` (lo fuerza `LEGAL_TRANSITIONS`), nunca `DESCARTADA` ⇒ el guardrail no aplica acá. Confirmado.

**Cambio (sólo el case BRIEF — la regla pasa a ser UNA sola copia):**
- `dossier.ts` — el `include` suma `caliente` al select del lead (`{ status: true, caliente: true }`).
- `dossier.ts` `case 'BRIEF'` — la condición pasa a `if (!gateBriefAbierto(dossier.lead.status, dossier.lead.caliente))`. En vez de inlinear `!leadRespondio && !lead.caliente` (que sería re-crear una segunda copia de la regla — la causa estructural de ESTE drift), el server **reusa `gateBriefAbierto`**: la MISMA función pura que la UI y el flag del action. Server y UI ya no pueden divergir por construcción, no sólo por alineación puntual. Equivalencia: `!gateBriefAbierto(s,c)` ≡ `!leadRespondio(s) && !esCaliente(c)` ≡ `!leadRespondio && !caliente` (stage EVALUADA).
- Import `leadRespondio as leadYaRespondio` → `gateBriefAbierto` (el viejo alias quedaba sin uso). Se borró el parse muerto del score (`safeParse` + `score` + el local `leadRespondio`). `EvaluacionSchema` sigue importado (lo usan los cases EVALUADA y DESCARTADA).
- Mensaje de error reescrito ("no respondió el primer contacto y no está marcado caliente"). JSDoc de `transitionDossier` y header del módulo actualizados (BRIEF ya no lee score; se leen `status` y `caliente`).
- `scripts/b2-verify-dossier.ts` — harness actualizado a la semántica de campo (su check "deja pasar con score 4" encodificaba la regla VIEJA): el lead caliente arranca con `caliente=false` y `score 5` → el gate **bloquea**; al marcar `caliente=true` → **abre**. Más el RESPONDIO (score 2, caliente=false) que abre por haber respondido.
- **NO** se tocó: otras ramas del switch, `LEGAL_TRANSITIONS`, el guard optimista, otros gates ni la asignación.

**El invariante de transición se mantiene:** `transitionDossier` sigue siendo la línea roja (único camino de mutación de `stage`); sólo cambió la guarda interna del case BRIEF. El flujo invertido se conserva: el brief (y la demo) se abre si el lead respondió O es caliente (campo) — ni antes ni de más.

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run build` → exit 0 ("Compiled successfully" + "Finished TypeScript" — type check incluido; tabla de rutas completa).
- ✅ `npx eslint src/lib/leados/dossier.ts` → exit 0, limpio (los errores project-wide del `npm run lint` son baseline pre-existente: scripts raíz `script*.js`, seeds, componentes 3D — ajenos al scope).
- ✅ `check:invariant` (aislamiento) + `check:invariant:flow` (gate/clasificación) + `check:invariant:foco` → los 3 OK.
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema tocado** — es lógica.
- ✅ **Funcional revertible (`b2-verify-dossier.ts`, dev-branch-guarded, cleanup en `finally`):**
  - *Before* (harness sin tocar): el lead score 4 + `caliente=false` + PROSPECTO que ANTES avanzaba a BRIEF ahora **lanza** `DossierTransitionError` en `dossier.ts:171` — prueba empírica de que el server dejó de mirar el score. Cleanup corrió ("3 leads temporales borrados").
  - *After* (harness a semántica de campo): **18/18 checks OK**, los 3 escenarios de la consigna verdes — (1) score 5 + `caliente=false` → BLOQUEA; (2) marcar `caliente=true` → AVANZA; (3) RESPONDIO (score 2, `caliente=false`) → AVANZA por haber respondido. Sin residuo en dev.
- ✅ `npm run test:e2e` → **30 passed / 12 failed / 8 skipped**. Los 12 fallos son TODOS de dominios ajenos (7 visual-regression admin/dashboard, 2 admin-bulk-actions, 1 onboarding, 1 client-personalization [strict-mode locator, ya documentado en admin-1c], 1 admin-navigation multi-tenant). **Cero specs de setter/leados/dossier/brief existen** (grep `BRIEF|caliente|score|EVALUADA` en `*.spec.ts` = 0) ⇒ el gate server-side está estructuralmente fuera de cobertura e2e; ningún verde atribuible a este cambio se rompió. El delta de conteos vs base es drift de la Neon dev compartida (mismo patrón que admin-1c), no código.

**Hallazgo fuera de scope (NO tocado — reportado):** el comentario del schema en `prisma/schema.prisma:824-827` (campo `caliente`) quedó **stale**: dice "Hoy NADIE lo setea ni lo lee — el comportamiento sigue siendo el del score (esCaliente, score ≥ 4) hasta admin-1b". Falso desde admin-1b (lectura del campo) y ahora admin-1d (el gate server lo lee). No lo edité: `schema.prisma` es Frozen file y el sprint pidió "solo este case". Fix trivial (comentario, sin migración) si Franco lo quiere.

**Salida (D4 cerrado de punta a punta):** UI, action y server miran el MISMO campo `OsLead.caliente`, vía la MISMA función `gateBriefAbierto`. La demo preventiva la abre el criterio de Franco (campo) o el lead respondiendo — nunca el score del setter, que vuelve a ser puramente informativo. **Regla de oro:** una sola copia de la regla del gate; el score del setter no dispara nada operativo. D4 queda 100% coherente.

---

## Bloque 2 — foco

> El home deja de ser tablero/cartera y pasa a **MODO DIRECCIÓN**: entrega UN lead accionable por vez (negocio + paso + CTA + el porqué) y al terminar/parquear da el próximo.

### 2.1 partido en 2.1a + 2.1b · 2026-06-27

Tras el descubrimiento exhaustivo (subagentes Explore + censo de call-sites), el 2.1 resultó ser **3 mecanismos distintos** en un sprint: reshape de la vista + primitiva de estado nueva (sticky) + cambio en la lógica pura (D6). **Decisión de Franco:** partir en **2.1a (foco secuenciado + sticky)** y **2.1b (postergados vencidos + "todo en espera")**. Esta entrada es 2.1a; 2.1b queda pendiente.

### 2.1a — Foco secuenciado + sticky (D7): el home pasa a MODO DIRECCIÓN · 2026-06-27

**Objetivo:** reemplazar el tablero/lanes por un FOCO: el home entrega UN lead accionable de protagonista (negocio + paso actual + CTA + el porqué del orden) sobre la cola `trabajar` ya ordenada; al terminar/parquear, da el próximo. Sticky liviano (D7): mientras el setter trabaja un lead queda FIJO aunque entre uno más urgente. La cartera deja de ser protagonista (queda accesible, colapsada). NO se toca D6 (postergados vencidos) ni el "todo en espera" — eso es 2.1b.

**Descubrimiento (read-only exhaustivo — 6 lectores Explore + censo de call-sites):**
- El home hoy: `page.tsx → cartera-view.tsx` consume `particionarCartera(...).grupos.trabajar[0]` como `ContinuarCta` (héroe cyan) Y renderiza los lanes `GroupSection` (trabajar/revisión/seguimiento/agendadas/fijados/pausados/archivo). El `recorrido-strip.tsx` (recorrer una cola con `?cola=`) vive en el detalle. **El tablero+recorrido son el modelo viejo a reemplazar.**
- Realización clave: **`grupos.trabajar` YA es la cola accionable ordenada** (`ordenUrgencia`: respondió→caliente→resto, `flow.ts:499-508`) y `motivoOrden` ya da el porqué. El foco reusa eso; no hay motor de prioridad nuevo.
- Auditoría 0 confirmada contra el código: "esperando respuesta" es rótulo derivado, NO un `LeadStatus` (P2); `grupoPara` manda POSTERGADO→'seguimiento' **sin mirar `reactivateAt`** y el cron solo notifica (P5 → es 2.1b); `caliente` = campo `OsLead.caliente` (admin-1b); `pinned` (`OsLeadSetterMeta`) es organizacional y reordena — **NO reutilizable** para el sticky.
- Blast radius: la capa de vista (`cartera-view`/`continuar-cta`/`home-sections`/`recorrido-strip`) y las funciones puras son **100% del árbol setter**; el admin lee `OsLead` directo. **No hay specs e2e del home del setter** (los 50 tests son landing/chat/admin/client) → la verificación de a-g es manual/eval.

**Decisiones (locked):**
- **Sticky = cookie httpOnly** `leados-foco-v1` (no DB, no migración → "liviano D7"). Cookie y no localStorage porque el home es Server Component `force-dynamic` que ELIGE el foco en el render: server-readable ⇒ sin flash de hidratación. **Invalidación por construcción**: un `stickyId` que no está en `trabajar` (cerrado/perdido/reasignado/avanzó) se ignora y el foco recae en la cima — no se puede (ni hace falta) escribir cookie en el render RSC.
- **Interacción**: "Ir a trabajarlo" (ancla el sticky + navega al detalle; "terminar" = trabajarlo ahí → al volver el foco avanzó solo); "Parquear" (reusa `pausarLead`/snooze → sale de `trabajar` → próximo); "Saltar" (ancla el próximo). El foco solo PRESENTA y CALCULA — nunca transiciona stages.

**Cambio:**
- **Nuevos:** `lib/leados/foco.ts` (`seleccionarFoco`, puro); `lib/leados/foco.invariant.ts` + script `check:invariant:foco`; `lib/leados/foco-cookie.ts` (server-only, `FOCO_COOKIE_NAME`/options + `leerFocoLeadId`); `setter/_actions/foco.actions.ts` (`anclarFoco`/`soltarFoco`, requireSetter + ownership); `setter/_components/foco-surface.tsx` (el héroe + parquear/saltar + próximo + atajos t/p/s).
- **Editados:** `setter/page.tsx` (computa foco server-side, renderiza `FocoSurface` + cartera secundaria + MisNumeros; título → "Tu día"); `cartera-view.tsx` (reescrito a cartera SECUNDARIA colapsada: lista plana por urgencia, sin lanes); `cartera-toolbar.tsx` (saca opción "Por colas", default urgencia); `home-sections.tsx` (solo queda `LeadCard`; se borran los lanes `GroupSection`/`CollapsibleSection`/`ArchiveSection`); detalle `leads/[leadId]/page.tsx` (saca el recorrido + `?cola`); comentarios stale en `home.ts`/`step-anchor.tsx`.
- **Borrados:** `continuar-cta.tsx`, `recorrido-strip.tsx`, `lib/leados/recorrido.ts` (modelo viejo; censo confirmó 0 referencias fuera del árbol reshapeado).
- **Sin tocar:** `flow.ts` (su `M` es de admin-1b), la máquina de transiciones, el aislamiento, el schema.

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run build` → exit 0 (type check incluido; `/setter` + `/setter/leads/[leadId]` dinámicos; `server-only` resuelto).
- ✅ `npm run check:invariant:foco` → **OK**. Prueba ejecutable: sin sticky → cima/caliente primero (d); sticky en lead no-cima → te lo sostiene y el más urgente cae como `proximo`, NO lo desplaza (c); sticky inválido → se ignora, foco a la cima (invalidación); cola vacía → foco null (semilla de 2.1b).
- ✅ `eslint` sobre mis 12 archivos → **0 problemas**. (Los 80 errores repo-wide son preexistentes en módulos ajenos —chatbot/media-player— fuera de scope.)
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema** — el sticky es cookie.
- ✅ **Funcional (dev:qa :3002, logueado QA `setter`, leads QA reales; verificado por curl al path real cookie→`leerFocoLeadId`→`seleccionarFoco`→render + browser eval):**
  - (a) UN lead protagonista con su porqué: foco = "QA-B6 Gimnasio Atlas" · paso "Demo aprobada — enviá el link (Paso 9)" · porqué "Caliente — va antes del resto" · CTA "Ir a trabajarlo". "1 de 3 para trabajar".
  - (b) terminar/parquear → próximo: **"Saltar" en vivo** (click→`anclarFoco`→`router.refresh`) hizo avanzar el foco "Gimnasio Atlas"→"Zero Protocol"; "Parquear" abre el panel snooze (3 días/1 semana/2 semanas + fecha) y `pausarLead` saca el lead de `trabajar` (efecto probado por el invariante + selección).
  - (c) sticky: anclado un lead NO-cima (Noir Dining) → foco = ese, **"Fijado mientras lo trabajás"**, y el caliente más urgente cae como **"Después:"** — NO te saca del que trabajás. Persiste tras reload (cookie). Invalidación: id bogus → foco recae en la cima, "Fijado" off.
  - (d) caliente primero: el foco es el lead caliente, mostrado primero con su badge + porqué.
  - (g) NO tablero/lanes: `realLaneHeadingsPresent: false`; "Para trabajar ahora"/"Recorrer"/"Fijados por vos"/"Agendadas"/"cola=trabajar" = 0 en el HTML. La cartera quedó como lista plana colapsada ("Ver toda la cartera", toolbar sin "Por colas").
  - Mobile 375px: sin overflow horizontal (scrollWidth 375 = viewport), foco 351px, 3 botones visibles. Consola sin errores ni warnings de hidratación.
  - ⚠️ **Screenshots no capturables** en esta pantalla (el grain `fixed z-[9990]` no deja asentar el frame; 4 intentos con freeze+ocultar overlays → timeout). Patrón LeadOS conocido → verificado por eval-geometry. **Pendiente para Franco: eyeball visual final.**
- ✅ `npm run test:e2e` → **24 passed / 14 failed / 12 skipped** (exit 0). **Ningún fallo toca `/setter`** (no existe spec de setter/leados/foco — grep = 0). Los 14: 7× visual-regression (admin/dashboard, snapshots stale preexistentes), 2× client-personalization, 2× admin-bulk-actions (baseline), 2× mobile-responsive (dashboard/admin), 1× onboarding (re-enviar credenciales) — todos en dominios que 2.1a no importa. El corrimiento vs la base 32/10/8 es **drift de la Neon dev compartida** (admin-1c ya vio ~25/12/13 por lo mismo), no regresión — mis archivos no entran en la superficie de ningún spec que falle. Ningún verde del setter se rompió (no hay ninguno que romper).

**Salida:** el home del setter es MODO DIRECCIÓN — un lead accionable a la vez con su porqué, secuenciado (terminar/parquear/saltar → próximo), sticky por cookie (sostiene + invalida por construcción), cartera degradada a secundaria colapsada, lanes+recorrido borrados. Pendiente **2.1b**: D6 (POSTERGADO con `reactivateAt<=now` → accionable; falta `reactivateAt` en `HomeLeadInput`/`grupoPara`) + estado **"todo en espera"** (hay leads, ninguno accionable) distinto del `HomeEmpty` — hoy 2.1a deja un fallback mínimo en `FocoSurface` cuando `foco===null`.

### 2.1b — Postergados vencidos (D6) + estado "todo en espera" · 2026-06-27

**Objetivo:** cerrar el Bloque 2 sobre 2.1a. (D6) un POSTERGADO con `reactivateAt<=now` vuelve a ser ACCIONABLE (el cron solo notifica, no reactiva); y estado nuevo **"todo en espera"**: hay leads pero ninguno accionable → pantalla DISTINTA del `HomeEmpty` (0 leads), con cuántos están en espera. NO se toca la máquina de transiciones, ni el aislamiento, ni el schema.

**Descubrimiento (read-only exhaustivo):**
- 2.1a CERRADO y presente en el working tree (sin commitear). El fallback mínimo de `FocoSurface` cuando `foco===null` traía el marcador inline "2.1b lo reemplaza".
- D6: `grupoPara` mandaba `POSTERGADO→'seguimiento'` sin mirar `reactivateAt`; `HomeLeadInput` no traía la señal. `reactivateAt` es scalar de `OsLead`, ya presente en `OwnedLeadWithDossier` (mismo patrón que `nextFollowUpAt`). Censo: único constructor de `HomeLeadInput` = `home.ts`; único fixture de `HomeLead` = `foco.invariant.ts`. `agruparParaHome` quedó sin callers (muerto desde 2.1a) — no se toca.
- QA: la lead vencida seedeada "Café Bergamota" (POSTERGADO, reactivateAt -7d) está bajo `franco` (super-admin), no bajo `setter-qa` — la verificación funcional arma el caso sobre una lead de setter-qa, revertible.

**Cambio:**
- `flow.ts` — `HomeLeadInput` suma `postergadoVencido`; `grupoPara` POSTERGADO → `trabajar` si vencido / `seguimiento` si no; `proximaAccionPara` vencido → `{ 'Se venció la postergación — retomá el contacto', accionable:true }` (futuro intacto). `motivoOrden` SIN tocar (espeja los tiers del sort; un vencido es tier-2 "Por orden de llegada" — su porqué lo lleva la proximaAccion).
- `home.ts` — deriva `postergadoVencido = status==='POSTERGADO' && reactivateAt!=null && reactivateAt<=ahora` (reloj request-time, igual que `followUpVencido`).
- `foco.invariant.ts` — fixture suma `postergadoVencido:false`.
- `home-en-espera.tsx` (NUEVO, server component, paleta neutra B9): el estado "todo en espera", distinto del HomeEmpty; chips `esperando respuesta` / `fijados por vos` / `pausados por vos`.
- `page.tsx` — computa `enEspera` (seguimiento+revisión+agendadas), `pausados`, `fijados` (las tres disjuntas por construcción); branchea `foco.foco ? FocoSurface : HomeEnEspera`.
- `foco-surface.tsx` — prop `foco` se ajusta a NO-null (la page ya no la monta sin foco); se borran la rama-null muerta + 3 guards + el import `CheckCircle2` sin uso.

**Code review adversarial (workflow, 4 lentes + verificación por hallazgo):** 1 hallazgo REAL in-scope (MEDIUM), corregido EN el sprint: el "todo en espera" no contaba `fijados` (pin), así que con TODAS las accionables fijadas caía en la rama `sinNada` y **MENTÍA "No tenés leads activos"** mientras esos leads seguían visibles en la cartera. Fix: `fijados` se pasa a `HomeEnEspera`, `sinNada` exige las 3 cuentas en cero, y hay chip "fijados por vos". (Lentes react/ts/aislamiento: sin otros hallazgos reales.)

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run build` → exit 0 ×2 (incl. post-fix; type check incl.; `/setter` dinámico).
- ✅ `npm run check:invariant:foco` + las otras 6 invariantes de leados → **7/7 OK** (el campo nuevo no rompió fixture ni aislamiento).
- ✅ `eslint` sobre los 6 archivos → 0 problemas.
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema** (D6 es derivado, en-espera es UI).
- ✅ **Runtime (dev:qa :3002, QA `setter`, datos reales, REVERTIBLE — 16/16 asserts sobre el HTML server-rendered):**
  - D6 vencido: lead de setter-qa puesta POSTERGADO + reactivateAt hoy-7d → `grupo:"trabajar"`, `accionable:true`, `postergadoVencido:true`, paso "Se venció la postergación — retomá el contacto".
  - D6 futuro (límite): misma lead reactivateAt hoy+7d → `grupo:"seguimiento"`, `accionable:false`, `postergadoVencido:false`, "Postergado — se retoma cuando se reactive"; el string "Se venció…" no aparece en ningún lado.
  - "todo en espera": fijadas las 3 leads de `trabajar` → cola vacía → SIN foco, "No hay nada para trabajar ahora mismo", chips "esperando respuesta" + "fijados por vos", y NO miente "No tenés leads activos" (fix del review).
  - Revert total verificado por fetch independiente: foco de vuelta ("1 de 3 para trabajar"), sin string vencido, lead restaurada (DEMO_ENVIADA/seguimiento), 3 pin-metas borradas — **cero drift**.
- ✅ **Visual (preview `next-dev-qa` :3002, QA setter, freeze animaciones + ocultar grain `z>=9000`):** **el grain SÍ se pudo sortear esta vez** (a diferencia de 2.1a) → screenshots reales capturados. Desktop 1600 + mobile 480: foco MODO DIRECCIÓN OK (un lead protagonista — caliente badge, paso, porqué, CTAs Ir/Parquear/Saltar, "1 de 3 para trabajar", cartera colapsada "Ver toda la cartera", sin tablero/lanes; mobile sin overflow). Estado "todo en espera" capturado (datos fijados revertibles): check esmeralda, "No hay nada para trabajar ahora mismo", chips "esperando respuesta" + "fijados por vos", puntero a la cartera — y NO el texto falso "No tenés leads activos".
- ✅ `npm run test:e2e` → **24 passed / 14 failed / 12 skipped** (exit 0) — **idéntico a 2.1a (24/14/12)**. **No existe spec de setter/leados/foco** (grep = 0) ⇒ el diff de 2.1b (100% superficie home del setter) no puede mover ningún test. Los 14 fallos son los dominios preexistentes/drift (visual-regression admin/dashboard, client-personalization, bulk-actions, mobile-responsive, onboarding). El corrimiento vs base 32/10/8 es **drift de la Neon dev compartida** (documentado en 2.1a/admin-1c), no regresión.

**Hallazgo fuera de scope (flagueado, NO tocado):** un fijado (pin) accionable queda EXCLUIDO del foco (`particionarCartera` lo saca de `trabajar`, decisión 2.1a). 2.1b lo deja honesto (el "todo en espera" lo cuenta y no miente), pero el comportamiento "fijar tu única accionable hace desaparecer el foco del home" sigue. **Decisión de Franco:** ¿un fijado accionable debería poder ser foco (revertir la exclusión 2.1a) o el pin es estrictamente organización-de-cartera? Es 2.1a/2.3, no 2.1b.

**Salida:** Bloque 2 — foco CERRADO (2.1). El home del setter en MODO DIRECCIÓN entrega un accionable a la vez (con porqué), levanta los postergados vencidos (D6 — antes no volvían solos, el cron solo notifica) y, cuando no hay nada accionable, muestra un "todo en espera" honesto (distinto del HomeEmpty, con el desglose en espera / fijado / pausado) en vez del fallback mínimo de 2.1a.

---

#### Addendum 2.1b — invariante ejecutable de D6 (cierre de la restricción #3) · 2026-06-27

**Por qué:** la restricción #3 del sprint pedía cubrir D6 con un **invariante ejecutable** ("un POSTERGADO vencido es accionable, uno futuro no"). El pase anterior lo verificó SOLO en runtime (16/16 asserts) y ese escenario se revirtió ("cero drift") → no quedaba **guardia permanente** para la clasificación D6. `foco.invariant.ts` solo prueba `seleccionarFoco` (secuenciado/sticky); su `postergadoVencido:false` era un campo de fixture inerte, no una aserción.

**Por qué no se había hecho:** el harness `ts-node` corre **sin tsconfig-paths**, así que no podía importar `flow.ts` en runtime — `flow.ts` arrastraba `@/lib/follow-up`, `@/lib/leados/{contracts,flow-content,revision}` (reproducido: `Cannot find package '@/lib' imported from flow.ts`). Por eso el pase anterior cayó a verificación en runtime.

**Cambio (cierra el gap, sin deps nuevas):**
- `flow.ts` — sus imports de runtime pasan de `@/` a **relativos con extensión `.ts`** (`../follow-up.ts`, `./contracts.ts`, `./flow-content.ts`, `./revision.ts`). Todo el árbol de runtime de flow.ts es ahora `@/`-free (follow-up no importa nada; contracts solo `zod`; flow-content y revision solo `import type`). Es el patrón YA usado por `mis-numeros.ts`/`home.ts`/`foco.ts` — flow.ts era el outlier; el build de Next lo acepta igual (`allowImportingTsExtensions`). Cero cambio de comportamiento: solo cambian los specifiers de import.
- `flow.invariant.ts` (NUEVO) — importa `clasificarLead` de verdad y asevera D6 sobre el fixture "Café Bergamota": vencido → `grupo:'trabajar'` + `accionable:true` + "Se venció la postergación — retomá el contacto"; futuro → `grupo:'seguimiento'` + `accionable:false` + "Postergado — se retoma cuando se reactive"; el `status` sigue `POSTERGADO` en ambos (re-entrada por clasificación, no por transición); el flag es el único discriminador.
- `package.json` — `check:invariant:flow`.

**Verde:**
- ✅ `npm run check:invariant:flow` → **OK** (D6 con guardia permanente).
- ✅ Las otras 7 invariantes de leados → **8/8 OK** (la relativización de flow.ts no rompió foco, que lo type-importa, ni ninguna otra).
- ✅ `eslint src/lib/leados/flow.ts flow.invariant.ts` → 0 problemas.
- ✅ `npm run build` → exit 0 (flow.ts lo consumen muchos call-sites; la relativización es transparente — `/setter` y `/setter/leads/[leadId]` dinámicos OK).
- ✅ `npx prisma migrate status` → up to date (73 migs; sin schema).
- e2e NO re-corrido: el delta es 100% specifiers de import + un archivo de test nuevo (cero cambio de superficie renderizada); el build verde prueba que ningún consumidor de flow.ts se rompió. La corrida del pase anterior (24/14/12, sin spec de setter) sigue vigente.

---

### 2.2 — Avisos accionables: las novedades integradas al foco · 2026-06-28

**Objetivo:** integrar las novedades dirigidas al setter (`OsSetterNotice`, 0.5.8) al MODO DIRECCIÓN (2.1): cada aviso accionable LLEVA al lead en su paso, quedan secundarias al foco (no un panel que compita) y NO se duplica el lead que ya es el foco. NO se toca la generación (`emitirNovedadSetter`), ni el foco (2.1), ni el schema.

**Descubrimiento (read-only exhaustivo — 2 lectores Explore + lectura del código):**
- Las novedades YA eran accionables: `getNovedadesSetter` (novedades.ts) arma `AvisoView` con `href = /setter/leads/{leadId}` (salvo el saliente, `null`) y `NovedadesPanel` las renderiza con "Abrir". Aislamiento por `setterId` (`ownSetterNoticeWhere`) — un setter solo ve las suyas (cubierto por `check:invariant:novedades`).
- **"un click → el lead en su paso" YA funcionaba — por el STAGE, no por la novedad.** El wizard aterriza en el paso vía `StepAnchor`/`anchorActivo(stage)` (lead-wizard.tsx): RECHAZADA → `pasoActual=3` → ancla `construccion`; APROBADA → `pasoActual=5` → ancla `seguimiento`. El stage del lead ES la fuente única del paso, y el kind correlaciona con el stage ⇒ agregar `?step=` al href sería redundante y crearía una segunda fuente (anti-DRY). **NO se agregó**: el href queda `/setter/leads/{id}` y el ancla por stage hace el resto.
- El problema real era de COMPOSICIÓN: `page.tsx` renderizaba `NovedadesPanel` PRIMERO (arriba del foco) → competía por la atención; y no había dedup (un aviso del lead-foco se mostraba dos veces, héroe + aviso).
- `getNovedadesSetter` tiene UN solo call-site (page.tsx) → agregarle un param opcional es seguro; el invariante de novedades testea `isolation.ts`, no esta función → no se rompe.

**Cambio (3 archivos, sin schema / generación / foco):**
- `novedades.ts` — `getNovedadesSetter(userId, leads, opts?: { excludeLeadId })`. Filtra de la LISTA visible el aviso cuyo `leadId === excludeLeadId` (el foco). **Solo presentación**: `totalSinLeer` (badge) sigue contando lo realmente sin leer — el aviso del foco sigue SIN LEER, reaparece cuando el foco cambia. Aislamiento (`setterId`) intacto.
- `page.tsx` — (a) pasa `excludeLeadId: foco.foco?.id ?? null` (sin foco no hay a quién deduplicar → se muestran todos); (b) reordena: foco/`HomeEnEspera`/`HomeEmpty` es el protagonista (primero), `NovedadesPanel` queda JUSTO DEBAJO (secundario pero presente; fuera del branch de leads → el saliente sin cartera igual ve "te sacaron el lead"), cartera+`MisNumeros` solo con leads, `ProgresoSemana` reflexivo al pie.
- `novedades-panel.tsx` — "Marcar vistas" se ata a `totalSinLeer > 0` (no a `avisos.length`): tras el dedup la lista puede quedar vacía y aún haber un aviso sin leer (el del foco) para limpiar.

**Mapa kind → acción (verificado en runtime):** DEMO_RECHAZADA → el lead en su **corrección** (Paso 4 Construcción + callout "Franco pidió correcciones"). DEMO_APROBADA → el lead en el **envío del link** ("Seguimiento y envío de la demo"). LEAD_ASIGNADO → ficha (tope). LEAD_REASIGNADO_SALIENTE → sin link (ya no es dueño).

**Verde (nada ✅ sin chequeo):**
- ✅ `npx tsc --noEmit` → 0 errores.
- ✅ `eslint` (los 3 archivos) → limpio.
- ✅ `npm run build` → exit 0 (`/setter` y `/setter/leads/[leadId]` dinámicos).
- ✅ Invariantes de leados → **5/5 OK** (novedades, foco, flow, mis-numeros, assignment-trail). El de novedades prueba el aislamiento por `setterId` — **intacto** (restricción #3 cubierta, sin invariante nuevo).
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema** (presentación + accionabilidad).
- ✅ **Funcional (dev:qa :3002, QA `setter`, leads QA reales, REVERTIBLE — geometría del scroll por eval, patrón LeadOS; sin cambiar ningún stage, solo sembrar/borrar novedades):**
  - **Dedup:** sembradas DEMO_RECHAZADA→Zero Protocol [RECHAZADA, que resultó ser el **FOCO**] + DEMO_APROBADA→Gimnasio Atlas [APROBADA] → el aviso de **Zero (el foco) NO aparece** en la lista; solo el de Atlas. `novBelowFoco: true` (foco top 258 < novedades top 580). El lead-foco no se muestra dos veces.
  - **Aviso → paso (DEMO_APROBADA):** click REAL en el aviso de Atlas → navega a `/setter/leads/{atlas}` → aterriza en **"Seguimiento y envío de la demo"** (top 217; Evaluación/Opener scrolleados arriba en absY −1099/−945; el layout scrollea en contenedor interno, `window.scrollY=0`).
  - **Aviso → paso (DEMO_RECHAZADA):** sembrado un 3er aviso para Noir Dining [CONSTRUCCION, no-foco] → **aparece** junto al de Atlas (el dedup solo saca el del foco). Su href aterriza en **"Paso 4 — Construcción de la demo"** (Evaluación/Opener/Seguimiento scrolleados arriba). Idéntico para Zero (navegación directa al href del aviso): Construcción + callout "Franco pidió correcciones".
- ✅ **Visual (preview next-dev-qa :3002, freeze + ocultar grain z≥9000 — patrón de 2.1b):** screenshots reales: (1) home con el foco "Zero Protocol" arriba (cyan, protagonista) y "Novedades" DEBAJO con 1 aviso (Atlas; el de Zero deduplicado); (2) el mismo home con los **2** avisos accionables ("Franco pidió cambios" + "Franco aprobó tu demo") bajo el foco; (3) el aterrizaje en **Paso 4 — Construcción** del lead del aviso de rechazo.
- ✅ `npm run test:e2e` → **31 passed / 11 failed / 8 skipped**. Base 32/10/8. El delta +1 fallo es `15-client-personalization › cambiar welcome message` (dominio dashboard del **CLIENTE**, mismo flake que vio admin-1c) por drift de la Neon dev compartida. **No existe spec de `/setter`** (mi diff es 100% superficie home del setter) → estructuralmente ajeno a los 11 fallos (7 visual-regression admin/dashboard + 2 admin-bulk-actions + 1 onboarding + 1 client-personalization). Ningún verde ajeno roto.

**Restricciones respetadas:** novedades del propio setter → **sin invariante nuevo** (`check:invariant:novedades` ya cubre el aislamiento por `setterId`, intacto). NO se tocó la generación (`emitirNovedadSetter`) — el dato para la acción (leadId + kind) ya estaba. NO se rehízo el foco (2.1): el cambio se APOYA en él (`foco.foco?.id` alimenta el dedup; el aterrizaje al paso es el `StepAnchor` de 2.1 vía stage).

**Hallazgo (no bloqueante, NO tocado):** `totalSinLeer` (badge) sigue contando el aviso del foco deduplicado — es lo correcto (sigue sin leer). Si ese aviso es el ÚNICO sin leer y no hay demos en cola, el panel no se renderiza (guard `avisos.length===0 && enCola.length===0`) y queda solo el badge del topbar; reaparece cuando el foco cambia. Consciente: el foco YA lleva al setter a ese lead, no se pierde nada.

**Salida:** las novedades quedaron integradas al modo dirección — el foco es el protagonista y los avisos son atajos secundarios pero presentes, deduplicados contra el foco (un lead no se muestra dos veces), cada uno llevando al lead en su paso (rechazo→corrección, aprobación→envío) vía el ancla por stage de 2.1. Sin tocar la generación, el foco ni el schema.

---

### 2.3 — Subordinar la cabina: atajos del modelo viejo + pulido de la cartera secundaria · 2026-06-28

**Objetivo:** cerrar lo que 2.1a dejó pendiente al volcar el home a MODO DIRECCIÓN — retirar los atajos de teclado del modelo viejo (navegación de lista/cola que ya no existe) y pulir la cartera secundaria para que se lea claramente como red de seguridad, no como protagonista. El pin (`OsLeadSetterMeta.pinned`) se DEJA como está (decisión diferida). Pulido + limpieza: sin rehacer el foco ni la lógica de la cartera (2.1a), sin invariante nuevo (presentación).

**Descubrimiento (read-only exhaustivo — subagente Explore + grep del repo + lectura del código):**
- **PREMISA FALSA — los atajos del modelo viejo NO existen.** No hay `j`/`k` ni ninguna navegación de lista/cola/lanes en `/setter` (grep del repo entero: 0). 2.1a ya borró `recorrido-strip.tsx` / `continuar-cta.tsx` / `lib/leados/recorrido.ts` (siguen como `D` en working tree, sin refs colgando — grep de `RecorridoStrip`/`ContinuarCta` = 0). El ÚNICO código de teclado del setter es el hook genérico `use-keyboard-shortcuts.ts` y sus dos consumidores, **todos del modelo nuevo y ya alineados al foco**: `foco-surface.tsx` (`t`=Ir a trabajarlo, `p`=Parquear, `s`=Saltar — disparan el mismo botón que el click, respetan `disabled`) y `shortcuts-help.tsx` (`?`=ayuda, `Esc`=cerrar). El `Cmd+K` que aparece en grep es el ClientSwitcher del **admin** (ajeno). ⇒ **No hay nada que retirar; los atajos útiles ya están alineados con Saltar/Parquear de 2.1a.** El sprint de atajos es un **no-op verificado**.
- **Cartera secundaria (`cartera-view.tsx` tras 2.1a):** ya colapsada por defecto (`abierto=false`), toggle neutro ("Ver toda la cartera" + count + chevron), cuerpo = toolbar (`cartera-toolbar.tsx`) + grilla de `LeadCard`. Ya es secundaria; lo que faltaba era pulido de *affordance*: el toggle traía la clase `group` MUERTA (ningún hijo usaba `group-hover`) y el cuerpo abierto no tenía señal visual de subordinación (saltaba directo a la toolbar).
- **Pin:** vive en `flow.ts` → `particionarCartera` (`else if (lead.pinned) fijados.push(...)`) — saca el fijado de la cola `trabajar`, así que **un fijado accionable queda EXCLUIDO del foco** (decisión 2.1a; 2.1b lo dejó honesto contándolo en "todo en espera"). Se deja como está.

**Cambio (2 archivos, presentación pura — sin tocar atajos: no había qué tocar):**
- `cartera-view.tsx` — (a) se cablea el `group` muerto: el `Briefcase`, el badge de count y el chevron brillan en hover/foco (`group-hover:text-zinc-300` / `group-hover:border-white/15`; chevron pasa a `transition-[transform,color]`) → estado de disclosure DISEÑADO, no una clase inerte. (b) el cuerpo abierto cuelga de un **riel neutro a la izquierda** (`border-l border-white/[0.08] pl-4`) — eco GRIS del acento cyan del foco (que usa `w-1 bg-cyan-400/80`), señal de "red secundaria subordinada al toggle". Cero cambio de lógica (estado, filtros, `filtrarYOrdenarCartera` intactos). Comentario de cabecera actualizado (decía "la subordinación total es 2.3" → ahora describe el pulido hecho).
- `flow.ts` — **solo comentario** en `particionarCartera`: nota 2.3 de que la exclusión del fijado-accionable del foco es organización-de-cartera y que su rol en MODO DIRECCIÓN (¿debería poder SER foco?) es decisión pendiente de Franco (flagueada en 2.1b). Sin cambio de comportamiento.

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run build` → exit 0 (type check incl.; `/setter` dinámico).
- ✅ `eslint` (cartera-view.tsx + flow.ts) → 0 problemas.
- ✅ Invariantes de leados tocadas por el cambio → `check:invariant:flow` (D6) + `:foco` + `:setter-meta` → **3/3 OK** (el comentario en `particionarCartera` no movió la clasificación ni el aislamiento por `setterId`).
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema** (presentación + un comentario).
- ✅ **Funcional + visual (preview next-dev-qa :3002, QA `setter`, datos reales, freeze + ocultar grain z≥9000 — patrón 2.1b/2.2; sin sembrar/mutar nada → cero drift):**
  - Hover affordance presente en el DOM: `group` activo + `Briefcase`/badge/chevron con `group-hover` cableado.
  - Cartera EXPANDIDA: `aria-expanded=true`, cuerpo con `border-l … pl-4`, 13 cards, chevron rotado (`rotate-90`).
  - Jerarquía correcta (screenshots desktop 1180 + mobile 480): foco "DEMO Web · Zero Protocol" cyan/protagonista arriba → Novedades → "Ver toda la cartera" colapsable → cuerpo indentado con riel = claramente secundario. Mobile sin overflow horizontal (`scrollWidth==clientWidth==480`). Sin errores de consola.
- ✅ `npm run test:e2e` → **32 passed / 10 failed / 8 skipped** — **idéntico a la base 32/10/8** (mejor que el 31/11/8 de 2.2; el flake de client-personalization no salió esta vez). Los 10 fallos son los dominios preexistentes/drift (7 visual-regression admin/dashboard + 2 admin-bulk-actions + 1 onboarding). **No existe spec de `/setter`** (mi diff es 100% presentación de la home del setter) → estructuralmente ajeno a los 10 fallos. Cero regresión.

**Restricciones respetadas:** NO se rehízo el foco (2.1a) ni la lógica de la cartera (estado/filtros/`filtrarYOrdenarCartera` intactos) — solo presentación. **Sin invariante nuevo** (es pulido visual; las 3 invariantes tocadas por el comentario en `flow.ts` siguen verdes). El pin queda como está (solo se anotó en comentario su decisión pendiente). Atajos: no se tocó ninguno porque **no había modelo viejo que retirar** — los existentes (`t`/`p`/`s`/`?`) ya son del foco.

**Hallazgo (no nuevo — re-flagueado para Franco):** el fijado (pin) accionable sigue EXCLUIDO del foco (`particionarCartera` lo saca de `trabajar`). Decisión pendiente: ¿el pin debería poder SER foco (revertir la exclusión 2.1a) o es estrictamente organización-de-cartera? 2.3 lo deja como está y lo documenta en el código (comentario en `particionarCartera`).

**Salida:** cabina subordinada. El sprint de atajos resultó un **no-op verificado** (2.1a ya había barrido el modelo viejo; los atajos vivos ya son del foco). El pulido real fue de la cartera secundaria: disclosure con estados de hover/foco diseñados (se cableó la clase `group` que estaba muerta) y un cuerpo que cuelga de un riel neutro a la izquierda — eco gris del acento cyan del foco — para leerse como la red de seguridad, no como protagonista. Sin tocar el foco, la lógica de la cartera ni el schema.

---

### 2.4 — Robustez + consistencia del foco: estados error/carga + edge-cases · 2026-06-29

**Objetivo:** completar los estados del foco (2.1): ya tenía empty (`HomeEmpty`) y "todo en espera" (`HomeEnEspera`, 2.1b); faltaban error/carga coherentes y blindar edge-cases. Endurecer SIN cambiar la lógica de selección (2.1a/b).

**Descubrimiento (read-only exhaustivo — subagente Explore + lectura del código):**
- **Boundaries que YA existen:** `setter/error.tsx` (EmptyState + Reintentar) y `setter/loading.tsx` (skeleton), más `app/error.tsx` y `app/global-error.tsx`. La cadena de boundaries del setter está cubierta a nivel de ruta y de app.
- **`loading.tsx` estaba RANCIO (gap real de coherencia).** Dibujaba el layout PRE-2.1a: título + grilla de **5 StatCards** ("De un vistazo") + grilla de **4 cards** — exactamente el marcador que 2.1a/2.3 borraron de la cartera. Al cargar `/setter`, la silueta no se parecía a lo que aparece (foco protagonista + cartera colapsada) → flash incoherente. Hasta el `aria-label="Cargando tu cartera"` quedó viejo (hoy es "Tu día").
- **`error.tsx` era SILENCIOSO (gap real de observabilidad).** Mostraba un estado claro pero, a diferencia del boundary raíz y de `SectionErrorBoundary` (patrón B12.1 logger + B14.5 Sentry), **no logueaba ni capturaba a Sentry** — un setter con un error no dejaba telemetría.
- **La lógica pura del foco YA es robusta por construcción** (verificado leyendo el código, no asumido):
  - `proximaAccion` **nunca** es vacío/null: `proximaAccionPara` (flow.ts) cubre todos los stages/status y tiene rama `default → "Completá la ficha"`. Lead sin paso (stage null) → "Completá la ficha". `grupoPara` siempre devuelve un grupo válido.
  - Sticky stale (cookie → lead cerrado/reasignado/inexistente) → `seleccionarFoco` lo ignora por construcción (`findIndex` = -1 → foco recae en la cima, `stickyActivo=false`). **Tiene invariante ejecutable** (`foco.invariant.ts`, caso `anclaFantasma`).
  - Datos parciales (dossier/ficha/evaluacion null o JSON malformado) → `buildHomeLeads` los nulea con parsers Zod-safe → defaults sensatos, sin crash.
  - `businessName` es NOT NULL en DB; `industry`/`zone` van con `.filter(Boolean)`.
  - ⇒ **no se agregó código defensivo a la lógica pura** (sería blindar lo imposible y arriesgar "rehacer el foco"): el blindaje real estaba en el SHELL.

**Cambio (2 archivos del shell, sin tocar la lógica pura ni el schema):**
- `setter/loading.tsx` — skeleton reescrito al MODO DIRECCIÓN: PageHeader (eyebrow+título+descr) → **una sola tarjeta alta** (el foco protagonista, `h-[256px] sm:h-[268px]` ≈ la altura real medida 269px) → línea "Después: …" → barra de la cartera colapsada. `aria-label` corregido a "Cargando tu día". La silueta ahora coincide con el render real (sin flash).
- `setter/error.tsx` — se mantiene el `EmptyState` con copy cálido del setter (NO se migró a `SectionErrorBoundary`, cuyo "Volver al inicio" apunta a `/dashboard` = área del CLIENTE, ruta equivocada para un setter) y se agrega la telemetría que faltaba: `useEffect` con `logger.error('[boundary:setter] …', { section, digest, stack })` + `Sentry.captureException(error, { tags: { section:'setter', boundary:'setter' } })` — mismo par B12.1/B14.5 del resto de boundaries. El cliente sigue sin ver detalle técnico.

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run build` → exit 0 (type check incl.; `/setter` dinámico).
- ✅ `eslint` (error.tsx + loading.tsx) → 0 problemas.
- ✅ Invariantes de leados → **6/6 OK** (foco, flow/D6, setter-meta, novedades, mis-numeros, assignment-trail) — **sin tocar la lógica pura ⇒ sin invariante nuevo** (la restricción #3 no aplicó: ningún edge-case requirió tocar la selección).
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema** (shell + telemetría).
- ✅ **Funcional + visual (preview next-dev-qa :3002, QA `setter`, datos reales; estados FORZADOS por inyección temporal en `page.tsx`, REVERTIDA — grep `QA-2.4-TEMP` = 0, foco restaurado "DEMO Web · Zero Protocol", cero drift):**
  - **Carga:** inyectado un `await sleep(9s)` → screenshot del skeleton (desktop 1180): silueta MODO DIRECCIÓN (header + tarjeta alta del foco + "Después" + barra de cartera), `aria-busy=true`, `aria-label="Cargando tu día"`. Coincide con lo que carga.
  - **Error:** reemplazado por un `throw` → el boundary `setter/error.tsx` renderiza (AlertTriangle + "Algo se rompió cargando el panel" + "No es culpa tuya… avisale a Franco" + Reintentar), **con el nav del setter intacto alrededor** (boundary de ruta, no fullscreen → el setter puede navegar). Telemetría confirmada en consola: `[boundary:setter] Error: …` con `{ section:'setter', digest:'1288583351', stack }`, y Sentry capturó (badge "1 issue").
  - **Restaurado:** revertida la inyección → foco de vuelta, sin estado de error, sin loading.
- ✅ `npm run test:e2e` → **32 passed / 10 failed / 8 skipped** — **idéntico a la base 32/10/8**. Los 10 fallos son los dominios preexistentes/drift (7 visual-regression admin/dashboard + 2 admin-bulk-actions + 1 onboarding). **No existe spec de `/setter`** y el cambio es 100% shell (loading/error) → estructuralmente ajeno. Cero regresión.

**Restricciones respetadas:** NO se tocó la lógica de selección del foco (2.1a/b) — `seleccionarFoco`, `clasificarLead`, `particionarCartera` intactos. **Sin invariante nuevo**: ningún edge-case requirió tocar la lógica pura (ya estaba blindada por construcción, con el invariante de sticky ya existente). El cambio vive sólo en el shell (`loading.tsx`/`error.tsx`).

**Edge-cases blindados / confirmados:**
- **Carga incoherente (BLINDADO):** skeleton ranció (5 StatCards + 4 cards del modelo viejo) → ahora coincide con el modo dirección. Era el gap visual real.
- **Error sin telemetría (BLINDADO):** boundary del setter ahora loguea + captura a Sentry (antes silencioso). Estado claro + observable.
- **Lead sin paso / datos parciales (YA cubierto por construcción, confirmado):** `proximaAccion` nunca vacío (rama `default`); dossier/ficha/evaluacion null → Zod-safe; `businessName` NOT NULL; industry/zone `.filter(Boolean)`.
- **Sticky stale (YA cubierto + testeado, confirmado):** `seleccionarFoco` lo ignora por construcción; `foco.invariant.ts` lo prueba.

**Salida:** el foco quedó robusto en sus cuatro estados (foco / todo-en-espera / vacío / **error** y **carga** coherentes). Los dos gaps reales eran del shell: un skeleton ranció que ya no se parecía al modo dirección (flash al cargar) y un boundary que se tragaba el error sin telemetría. La lógica pura del foco ya era a prueba de datos límite por construcción (verificado, no asumido) — no se la tocó. Sin schema, sin invariante nuevo, e2e en base.

---

### 2.5 — Onboarding / primer uso del setter en modo dirección · 2026-06-29

**Objetivo:** que un setter no-técnico que entra por PRIMERA vez entienda el modo dirección (el foco = un lead por vez; Ir/Parquear/Saltar) sin estorbar al que ya sabe. Liviano y dismissible, coherente con B9. Aclarar de paso qué es el test e2e de onboarding que falla en la base.

**Descubrimiento (read-only):**
- **YA existe un onboarding del setter, pero explica OTRA cosa.** `OnboardingHint` (`onboarding-hint.tsx`, montado en `page.tsx`) es una card descartable bien hecha (localStorage `leados-onboarding-v1`, `useSyncExternalStore` sin desajuste de hidratación, B9-coherente). Pero explica el **flujo invertido** (score → opener-antes-que-demo → espera), NO el **modo dirección** (2.1a). Igual que el `loading.tsx` de 2.4: el onboarding es PRE-rediseño y nunca menciona la pantalla que el setter realmente ve (el foco, un lead por vez, Saltar/Parquear). Ese es el gap.
- **El test e2e roto NO es del setter.** `30-onboarding-e2e-complete.spec.ts` es el onboarding del **CLIENTE**: *admin crea cliente (`/admin/clients/new` wizard) → cliente loguea → cambia password → ve `/dashboard`*. Su localStorage es `develop:onboarding:draft` (el draft del wizard del admin), distinto de `leados-onboarding-v*` del setter. Falla dentro del wizard de creación de cliente (interacción de form en Step 4, `typeControlledInput` @ form.ts:15). **Deuda ajena preexistente** (parte de la base 32/10/8) — NO se toca (regla del sprint: si es de otra superficie, reportar y no tocar).
- **Primer-uso del modo dirección:** el setter abre `/setter` y ve el PageHeader ("Tu día — un lead a la vez…"), la guía, y el foco ("Tu foco ahora", un lead, Ir/Parquear/Saltar). El header insinúa "un lead a la vez" pero nada explica QUÉ es el foco ni qué hacen Saltar/Parquear.

**Cambio (1 archivo, presentación — sin tocar el foco ni el schema):**
- `onboarding-hint.tsx` — se EXTIENDE la MISMA card descartable (no se agrega una segunda, que sería molesta) para que ahora explique las dos cosas, en orden de lo que el setter ve: (1) **Modo dirección** — bloque nuevo arriba ("Trabajás un lead por vez": el foco es el más urgente ya ordenado; lo abrís con «Ir a trabajarlo», o «Parquealo»/«Saltá» si no es el momento; no elegís de una lista). (2) **El flujo de cada lead** — los 4 bloques del flujo invertido que ya estaban, bajo un subtítulo. Título de la card: "Antes de empezar / **Cómo funciona tu día**" (antes "Antes de tu primer lead / Cómo funciona el flujo invertido"). Énfasis del bloque nuevo por layout/peso, NO por color (cyan reservado al foco, disciplina B9). **STORAGE_KEY bumpeado `v1→v2`**: la guía vuelve a mostrarse UNA vez tras el rediseño 2.1a (el que ya la había cerrado nunca vio explicada la pantalla nueva); sigue descartable (se cierra y no vuelve). El store (`useSyncExternalStore`) queda intacto.

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run build` → exit 0 (type check incl.; `/setter` dinámico).
- ✅ `eslint` (onboarding-hint.tsx) → 0 problemas.
- ✅ Invariantes de leados (foco + flow tocados por proximidad) → OK; **sin invariante nuevo** (es presentación, no hay lógica que blindar).
- ✅ `npx prisma migrate status` → up to date (73 migs). **Sin schema** (un componente de UI).
- ✅ **Funcional + visual (preview next-dev-qa :3002, QA `setter`, datos reales; estado de primer-uso forzado limpiando `leados-onboarding-v2` del localStorage — REVERTIBLE, sin DB):**
  - **Primer-uso (setter nuevo):** sin la flag, la guía aparece — "Cómo funciona tu día" con el bloque **Modo dirección** ("Trabajás un lead por vez", menciona Ir a trabajarlo / Parquealo / Saltá) ARRIBA, después "El flujo de cada lead" (4 cards) + "Ojo:" + el link de cerrar. Por encima del foco (se explica antes de actuar). Screenshots desktop 1180 + mobile 480 (mobile sin overflow horizontal, una columna).
  - **Dismiss:** click en "Entendido, no lo muestres más" → la card desaparece, `localStorage['leados-onboarding-v2']='1'`, el foco queda intacto.
  - **Persistencia:** recarga → la guía NO vuelve (sigue dismissed). El setter experimentado no la sufre.
- ✅ `npm run test:e2e` → **32 passed / 10 failed / 8 skipped** — **idéntico a la base 32/10/8**. El test de onboarding (`30-onboarding-e2e-complete`) sigue **rojo igual que en la base** — eso CONFIRMA que es ajeno al setter: mi cambio (un componente del setter) no movió su estado. Los 10 fallos son los preexistentes (7 visual-regression admin/dashboard + 2 admin-bulk-actions + 1 onboarding-cliente). No existe spec de `/setter`.

**Restricciones respetadas:** liviano y dismissible — **una** card que se cierra y no vuelve (no un tour, no se obliga al experimentado). NO se rehízo el foco (es un componente hermano, montado en `page.tsx`). Sin schema, sin invariante nuevo.

**Qué pasó con el test de onboarding roto:** es **AJENO** (onboarding del CLIENTE: wizard `/admin/clients/new` + cambio de password + `/dashboard`), no del setter. NO se tocó. Sigue en su estado de base (deuda preexistente del wizard de creación de cliente). Documentado acá para que no se confunda con el onboarding del setter.

**Salida:** el primer-uso del setter ahora explica la pantalla que realmente ve. La guía descartable, que solo cubría el flujo invertido, ahora abre con el **modo dirección** (el foco = un lead por vez, Ir/Parquear/Saltar) y después mantiene el flujo de cada lead — una sola card, liviana, que se cierra y no vuelve (key bumpeada a v2 para re-mostrarse una vez tras el rediseño). El test e2e de onboarding roto es del CLIENTE, ajeno, intacto.

---

## CIERRE — Bloque 2 "Foco / Modo dirección" (2.1 → 2.5) · 2026-06-29

El rediseño del home del setter a **MODO DIRECCIÓN** queda cerrado. Estado global:

- **2.1a** — Home = modo dirección: `FocoSurface` entrega UN lead accionable por vez (negocio + paso + porqué + CTAs Ir/Parquear/Saltar), sticky por cookie (D7). Se borraron lanes/recorrido/tablero. Cartera vuelta secundaria.
- **2.1b** — Estados sin foco honestos: D6 (postergado vencido → accionable, el cron solo notificaba) + `HomeEnEspera` con cuentas disjuntas (en-espera / fijados / pausados). Invariante D6 ejecutable (`flow.invariant.ts`).
- **2.2** — Novedades integradas al foco: deduplicadas contra el foco (un lead no se muestra dos veces), secundarias pero presentes, cada una lleva al lead en su paso (vía el ancla por stage, sin `?step=`).
- **2.3** — Cabina subordinada: los atajos del modelo viejo resultaron un **no-op verificado** (2.1a ya los había barrido; los vivos t/p/s/?/Esc ya son del foco) + pulido de la cartera secundaria (hover diseñado, riel de subordinación).
- **2.4** — Robustez: estados error/carga coherentes (skeleton al modo dirección, boundary con telemetría); la lógica pura ya era a prueba de datos límite por construcción (no se tocó).
- **2.5** — Onboarding: la guía de primer-uso ahora explica el modo dirección (el foco), no solo el flujo invertido. Dismissible, una vez.

**Estado de la base e2e:** estable en **32/10/8** durante todo el bloque (no existe spec de `/setter`; los 10 fallos son dominios ajenos preexistentes/drift de la Neon dev compartida).

**Pendientes flagueados a Franco (NO bloqueantes, fuera del bloque):**
1. **Pin-como-foco (2.1b/2.3):** un fijado accionable queda EXCLUIDO del foco (`particionarCartera` lo saca de `trabajar`). ¿Debería poder SER foco (revertir la exclusión 2.1a) o el pin es estrictamente organización-de-cartera? Documentado en `particionarCartera`.
2. **Test e2e `30-onboarding` (cliente):** rojo en la base, ajeno al setter — deuda del wizard `/admin/clients/new`, sin tocar.
3. **Gate de demo preventiva (post-admin-1c):** ~~`dossier.ts ~165` mira el score del setter, no el campo caliente~~ → **RESUELTO en admin-1d** (2026-06-29): el gate server-side ahora lee el campo `caliente` vía `gateBriefAbierto`, igual que la UI. D4 cerrado de punta a punta.
