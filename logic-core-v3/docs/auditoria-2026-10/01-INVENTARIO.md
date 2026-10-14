# 01 — Inventario

> Qué hay en `origin/main` @ `57c421bc` (2026-09-06), medido el 2026-10-13. Todo lo de este documento sale de scripts de solo lectura de `scripts/auditoria/` (re-ejecutables) o de comandos citados; los crudos están en `_crudo/`. Rutas relativas a `logic-core-v3/` salvo `raíz:`. Los IDs entre corchetes (`h2.cli-inicio`, `lib.isolation`…) son los nodos del Atlas (DEC-40). Esto es inventario: los problemas que asoman acá se auditan en su dominio y se escriben en 02/03.

## 1. Números generales

Fuente: `_cobertura.csv` (`scripts/auditoria/cobertura.mjs`).

| | Archivos | LOC |
|---|---|---|
| Versionados en el repo | 2.212 | — |
| Alcance profundo (D1–D9) | 1.298 | 162.638 |
| Alcance superficial (sitio público, docs, tests, scripts) | 691 | — |
| Fuera (binarios, assets, lockfile, salidas generadas, skill vendorizada) | 223 | — |

Por dominio (profundo, archivos · LOC): D1 Auth 33 · 3.909 — D2 Portal 219 · 25.405 — D3 Admin 221 · 29.952 — D4 Setter 171 · 27.867 — D5 Chatbot e IA 372 · 42.821 — D6 Datos 104 · 10.802 — D7 Integraciones 59 · 6.849 — D8 Plataforma 20 · 2.787 — D9 Transversal 99 · 12.246. La poda de F1.11 saca de la lectura profunda los archivos de confianza ALTA (ver `10-PODA.md`).

## 2. Stack y dependencias

- **Stack declarado** (`package.json`): Next.js `^16.2.6` (instalado 16.2.9), React 19.2.3, TypeScript `^5` (5.9.3), Tailwind 4, Prisma 6.19 + PostgreSQL (Neon), NextAuth `5.0.0-beta.31`, `motion` 12 (no `framer-motion`), Three.js 0.182 + R3F 9, AI SDK 6 con `@ai-sdk/google-vertex` 4, `@anthropic-ai/sdk` 0.95, Brevo 5 y Resend 6, Sentry 10, Zod 3.25.
- **Dependencias directas**: 48 de producción + 19 de desarrollo (`npm ls --depth=0` → `_crudo/npm-ls.txt`, sale 0).
- **Desactualizadas** (`npm outdated --json` → `_crudo/npm-outdated.json`): 48 paquetes, **20 a una versión mayor** de distancia — entre ellos Prisma (7.10; 8 en RC), Zod (4.6), `@sentry/nextjs` (11.7), `ai` (7), `@ai-sdk/google-vertex` (5), ESLint (10), TypeScript (7.0), `lucide-react` (1.56), `motion` (14), `@types/node` (26 contra el `^20` declarado). `next-auth` sigue en beta (`latest` en npm es la 4.24). Se evalúan en D8 contra las guías de migración.
- **Vulnerabilidades** (`npm audit --json` → `_crudo/npm-audit.json`): **30 — 4 críticas, 18 altas, 8 moderadas.** Críticas: `next` (entre ellas un bypass de middleware/proxy en App Router y un DoS por server actions), `next-auth`, `@auth/core` y `@auth/prisma-adapter`. Todas con fix disponible; varias altas solo se arreglan con un salto de major. Se auditan en D1/D8.

## 3. Áreas y herramientas

Lista cerrada de §6 del plan: 6 áreas y 51 herramientas.

| Área | Herramientas |
|---|---|
| `h1` Acceso | login (contraseña, magic link por Brevo, Google), recupero, cambio obligatorio, invitación, impersonación |
| `h2` Portal del cliente | bienvenida, shell, inicio, proyecto, resultados, servicios, mensajes, soporte, plan, referidos, cuenta, reportes por email; módulos premium: reseñas, email marketing, tienda, agenda |
| `h3` Chatbot centralizado | chatbot del cliente, chatbots (admin), actividad, health, widget embebible + `/embed`, API pública, widget de develOP en el sitio, canal WhatsApp (motor) |
| `h4` Panel de admin | shell, dashboard, clientes, proyectos, equipo, leads, tickets, mensajes, novedades, referidos, alertas, configuración, audit log |
| `h5` Setter y LeadOS (ZONA-FRANCO) | tu día, cargar prospecto, importar, ficha del lead, manual del lead, revisión de demos, FG-2 Lab |
| `h6` Entradas públicas | formulario de contacto (+ form del footer a n8n), baja de emails de marketing |

Usuario de cada portal: el proxy solo deja entrar a `/dashboard` a `ORG_MEMBER` o a SUPER_ADMIN impersonando (`src/proxy.ts:154`); `/admin` exige SUPER_ADMIN (`src/app/(protected)/admin/layout.tsx:47`); `/setter` exige `SETTER` (`src/app/(protected)/setter/layout.tsx:32`). Enum `Role`: `SUPER_ADMIN`, `ORG_MEMBER`, `CLIENT`, `SETTER` (`prisma/schema.prisma:12-17`).

## 4. Rutas

Fuente: `_crudo/inventario.json` (`scripts/auditoria/inventario.mjs`).

- **86 `page.tsx`** (79 internas: `/admin`, `/dashboard`, `/setter`, auth, `/bienvenida`, `/embed`), **17 `layout.tsx`**, 54 `loading.tsx`, 24 `error.tsx`, 2 `not-found.tsx`.
- **36 route handlers**:

| URL | Métodos | runtime · maxDuration |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | — |
| `/api/qa/login` | POST, GET, DELETE | nodejs |
| `/api/auth/google-business/{start,callback}` | GET | — |
| `/api/auth/tiendanube/{start,callback}` | GET | — |
| `/api/chatbot/[slug]/chat` | OPTIONS, POST | nodejs · **30 s** |
| `/api/chatbot/[slug]/config` | OPTIONS, GET | nodejs |
| `/api/chatbot/[slug]/health` | GET | nodejs |
| `/api/motor/webhook/[channelToken]` | POST | nodejs · **15 s** |
| `/api/admin/chatbot/demo-chat/[slug]` | POST | nodejs · **30 s** |
| `/api/admin/chatbot/test-prompt` | POST | nodejs · **30 s** |
| `/api/admin/chatbot/events` · `/insights/generate` | GET · POST | — |
| `/api/admin/alerts/trigger-detector` · `/reports/send-now` | POST | — |
| `/api/admin/clients/[organizationId]/send-executive-report` | POST | — |
| `/api/admin/users/[userId]/resend-credentials` | POST | — |
| `/api/cron/{alerts,cleanup-old-events,detect-bot-issues,os-follow-up,send-weekly-reports}` | GET | — |
| `/api/cron/generate-insights` | POST | — |
| `/api/cron/{regenerate-briefs,send-executive-reports}` | GET | **300 s** |
| `/api/dashboard/chatbot/leads/export` · `/api/dashboard/leads/recent` | GET | — |
| `/api/reports/{client-monthly,monthly}` | GET | nodejs |
| `/api/email/optout/[contactId]` · `/api/email/unsubscribe-executive` | GET · GET, POST | — |
| `/api/track` | OPTIONS, POST | — |
| `/api/dev/email-preview/executive-weekly` · `/api/test-sentry` · `/api/version` | GET | — |

Los `maxDuration` de 15–300 s se contrastan en D8 con el límite real de las functions de Netlify.

- **Server actions**: 92 archivos con `'use server'`, **200 funciones exportadas** (D1 9 · D2 17 · D3 29 · D4 15 · D5 21 · D7 1 archivos).

## 5. Datos

- **Schema** (`prisma/schema.prisma`, 2.247 líneas, FROZEN): **63 modelos y 62 enums**, agrupados por dominio — auth (5: `Account`, `Session`, `VerificationToken`, `User`, `PasswordResetToken`), tenant (11: `Organization`, `OrgMember`, `AgencySettings`, `ExecutiveBriefSnapshot`, `WeeklyReportLog`, `BusinessMetric`, `PageView`, `ClientAsset`, `ClientBrandProfile`, `OnboardingTask`, `Notification`), proyectos y soporte (7), facturación (3: `Plan`, `Subscription`, `Invoice`), LeadOS (9, `Os*`, ZONA-FRANCO), módulos y email marketing (4), chatbot (11), plataforma (6: auditoría, rate limit, novedades, referidos) y motor WhatsApp (7).
- **33 modelos no tienen `organizationId` propio**: los globales (auth, `Plan`, `AgencySettings`, `RateLimit`, `AdminAuditLog`, `PremiumModule`), los de LeadOS (de develOP, no de un tenant) y los hijos que se scopean por el padre (`Conversation`, `ChatMessage`, `ChatbotLead`, `TicketMessage`…). Cómo se aísla cada uno se audita en D6/D2/D5 (frontera `src/lib/isolation`: `forOrg` / `unsafeGlobalQuery`).
- **86 migraciones** (`20260318202838_init` → `20260710203413_add_portal_indexes`; último cambio del schema: 2026-07-15). `prisma/migrations/__diff_check.sql` está vacío. `prisma migrate status` no corrió (sin `DATABASE_URL`; `_crudo/prisma-migrate-status.txt`). El drift schema↔migraciones se mide en D6 con `scripts/auditoria/drift.mjs`.
- **Seeds y escritores de la base**: `prisma/seed.ts` (exige `SEED_*_PASSWORD` y tiene guard de prod en `prisma/seed-guard.ts`), `prisma/seed-agency-os.ts`, 6 seeds en `prisma/seeds/` (`sync-plans.ts` se documenta para correr contra prod, `prisma/seeds/sync-plans.ts:12-13`; `sync-premium-modules.ts` sincroniza el catálogo que lee la app), 2 scripts en `src/modules/chatbot/prisma/` y 25 scripts de `scripts/` que escriben en la base (marca `escribe-db` del ledger).

## 6. Integraciones y crons

- **Servicios externos** (por import y variable de entorno): Vertex AI / Gemini (chatbot y briefs; **credencial vencida**, ENMIENDA-01), Anthropic (dos usos fuera del chatbot), Brevo (email transaccional, magic link) y Resend (declarado, provider de NextAuth), Sentry, Google Search Console y GA4, Google Business Profile (OAuth), Tiendanube (OAuth), cal.com, Telegram, n8n, Neon, Netlify. La tabla de credenciales con qué se cae si vencen va en D7 (DEC-43).
- **Crons y jobs** (`_crudo/inventario.json`):

| Registrador | Qué agenda | Observación |
|---|---|---|
| `netlify.toml` (3 scheduled functions) | `generate-insights-cron` (diario 09:00), `send-weekly-reports-cron` (lunes 12:00), `cleanup-old-events-cron` (diario 06:00) | las 3 existen en `netlify/functions/` y llaman a `/api/cron/*` con `CRON_SECRET` |
| `vercel.json` (3 crons) | `/api/cron/os-follow-up` (diario 12:00), `/api/cron/regenerate-briefs` (lunes 10:00), `/api/cron/send-executive-reports` (lunes 12:00) | el deploy es Netlify: a verificar en D7 si algo los dispara |
| GitHub Actions | `raíz:.github/workflows/db-backup.yml` (diario 06:00 UTC) | backup de la base |
| — | `/api/cron/alerts`, `/api/cron/detect-bot-issues` | no figuran en ningún registrador |

## 7. Variables de entorno

Fuente: `process.env.X` en `src/`, `netlify/`, `prisma/` y configs (sin tests) contra `.env.example` (solo nombres).

- **58 variables usadas; 18 no figuran en `.env.example`**: `ALLOW_PROD_SEED`, `CHATBOT_STREAM_PROBE`, `CI`, `DRY_RUN`, `E2E_DIST_DIR`, `EVALS_BASE_URL`, `EVALS_JUDGE_MODEL`, `EVALS_ORIGIN`, `GALERIA_PORT`, `NETLIFY`, `NEXT_RUNTIME`, `NODE_ENV`, `OAUTH_STATE_SECRET`, `SENTRY_DSN`, `SETTER_EXTERNAL_SERVER`, `SETTER_PORT`, `URL`, `VERCEL_ENV`. Las que importan para operar: `OAUTH_STATE_SECRET` (`src/lib/security/oauth-state.ts`), `SENTRY_DSN` (`sentry.{server,edge}.config.ts`; `.env.example` solo trae `NEXT_PUBLIC_SENTRY_DSN`), `URL` (la setea Netlify) y `ALLOW_PROD_SEED`.
- **11 documentadas sin lectura directa por nombre**: `CHATBOT_GOOGLE_API_KEY`, `DIRECT_DATABASE_URL`, `MOTOR_CHANNEL_SECRET_KEY`, `RESEND_FROM_EMAIL`, los cuatro `SEED_*_PASSWORD` (se leen por nombre dinámico en `prisma/seed-guard.ts`, falso positivo), `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (los toma el build de Sentry). Se cruzan en D7/D8.

## 8. Tests y verificación

- **185 archivos de test**: 97 en `tests/` (`e2e` 35, `setter` 30, `integration` 12, `leados` 7, `helpers` 6 y otros 7) y 88 en `src/` (**85 invariantes** `*.invariant.ts` más 3 en `__tests__/` o `*.test.ts`; por carpeta: 32 en `src/lib/leados`, 31 en `src/modules/chatbot`).
- **`package.json`**: 115 scripts — 58 `check:*` (invariantes), 35 `test:*`, 4 `evals*`, 4 `seed*`, 3 `galeria*`, más `dev`, `build`, `start*`, `lint`.
- **CI** (`raíz:.github/workflows/ci.yml`): en cada push y PR corre `tsc` e invariantes; las suites de LeadOS y e2e corren solo si existe el secret `DATABASE_URL_TEST` (y antes migran esa base); el lint está afuera por decisión documentada en su cabecera.
- **Cobertura real** (qué flujo cubre cada test): se mapea en el ciclo 1 de cada dominio (DEC-22) y se consolida en D9.

## 9. Baseline de F1

| Herramienta | Resultado | Crudo |
|---|---|---|
| `tsc --noEmit --incremental false` | **0 errores**, exit 0, 33 s (el error conocido de `searchconsole.ts:119` no apareció) | `_crudo/tsc.txt` (vacío) |
| eslint (todo el proyecto, sin las carpetas de la auditoría) | 1.604 archivos, 116 con problemas: **102 errores, 111 warnings** — entre ellos 37 `react-hooks/set-state-in-effect` (31 archivos), 16 `no-require-imports`, 14 `react-hooks/purity`, **13 `no-explicit-any`** (7 archivos), 45 directivas `eslint-disable` sin uso | `_crudo/eslint.json` (sin código fuente), `_crudo/eslint-resumen.md` |
| `npm outdated` / `npm ls` / `npm audit` | ver §2 | `_crudo/npm-*.json/txt` |
| `prisma migrate status` | no disponible: `P1012 Environment variable not found: DATABASE_URL` (Prisma CLI 6.19.3) | `_crudo/prisma-migrate-status.txt` |
| depcruise (`src/`) | 1.402 módulos, 3.555 dependencias; **22 ciclos** de imports; **63 huérfanos** candidatos | `_crudo/depcruise.json` (2,5 MB, local), `_crudo/depcruise-resumen.json` |
| knip | **no disponible por memoria `[TIMEBOX]`** (DEC-42: tres intentos con menos de 4 GB libres; ver §12 del plan). La poda de `10-PODA.md` salió sin knip, con depcruise y `git grep` | — |

## 10. Ramas y worktrees

Fuente: `_crudo/ramas.json` (`scripts/auditoria/ramas.mjs`, base `origin/main`, fecha 2026-10-13). **89 ramas: 45 mergeadas, 10 vivas, 21 dormidas, 13 abandonadas.**

- **Vivas (10)**: `rediseno/home` (+563, worktree `C:/rediseno-home`; el home v3), cuatro `respaldo/*` de septiembre (+104 a +121, snapshots del rediseño), `rediseno/deslizar` y `rediseno/deslizar2`, `p25/rafaga-tildes` (+5, capturas de LeadOS), `chore/auditoria-clean` (+1, worktree; su copia local difiere de la remota: 1 adelante y 4 atrás) y esta rama.
- **Dormidas (21)**: las 16 ramas `v3/*` y `rediseno/{cimientos,motion,chrome,secciones-a,secciones-b}` (etapas intermedias del rediseño, todas contenidas en `rediseno/home`) y `p25/carrera-tildes`.
- **Abandonadas (13)**: `b0-isolation-motor-chatbot` (+8, 9 archivos solo ahí), `experimento/estetica-goal` (+15), `chore/security-quick-wins`, `leados/b8a-iii`, `revert-home-abortado`, `chore/auditoria-{seguridad,maestra}`, `chore/gs-aislamiento` (6 archivos de golden suite solo ahí), `b1-s1-bsp-inbound`, `b2-s1-bot-sync-surface` (7 archivos del chatbot solo ahí), `chore/wf-home` y dos `claude/*`.
- **Worktrees (5)**: ver §1.1 del plan. `main` local está 52 commits detrás de `origin/main`.
- `rediseno/home` modifica 29 archivos de main (entre ellos `src/app/layout.tsx`, `globals.css`, `src/lib/utils.ts`, `next.config.ts`, `package.json`, `CLAUDE.md`, `components/design-system/` y `styleguide/`), borra la skill `impeccable` (`.github/skills/impeccable/`, `.impeccable/`, `.github/hooks/impeccable.json`) y agrega 3.037 archivos (v3, capturas, y los handlers `/api/contacto` y `/api/newsletter`).

## 11. Scripts operativos y sueltos

- `scripts/`: 99 archivos (68 en la raíz de `scripts/`, 14 en `qa-corridas/`, 11 en `dev/`, 4 en `regression/`, 1 en `load-test/`, 1 en `_experimental/`). La mayoría son de un sprint (`_b13-*`, `_b14-*`, `b1-verify-*`, `p41-*`, `seed-matsu-*`…); 25 escriben en la base. Dos son salidas de bench commiteadas (`_b13-latency-*.json`, `_b14-2-pages-*.json`).
- Sueltos en la raíz de la app: `script.js`, `script2.js`, `script3.js`, `script_{aiscene,analytics,leads,magnetic,maps}.js`, `replace_analytics.js`, `find_unused.js`, `test-chat.mjs` y salidas generadas commiteadas (`ts_errors.{log,txt}`, `.eslint_output.txt`, `audit.txt`, `unused_report*.txt`, `ts_prune_output.txt`, `prisma_err.txt`). En la raíz del repo: dos `_tmp_*.html`.
- Todo esto entra al triage de `10-PODA.md`.

## 12. Documentación e insumos

- **266 filas DOC**: 239 en `docs/` (incluidos 8 transcripts de evals con posible PII y sus 2 README), 16 `.md` en la raíz de la app (entre ellos `STATUS.md` —se declara fuente de verdad y es del 2026-05-21—, `DEPLOY.md` —describe Vercel—, `AGENTS.md`, seis `_lane-*` y `CHANGELOG*`) y 8 en la raíz del repo (`CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`, `AUDITORIA-VS-BRIEF-2026-07.md`, cuatro `lane-*.md`). Inventario por archivo (líneas, último commit, título): `_crudo/inventario-superficial.json`.
- **Auditorías previas**: índice de sus hallazgos CRÍTICA/ALTA/P0/P1 en `_crudo/previas.json` (F1.9; ver §12.1).
- **Insumos de Drive** (`docs/_insumos/drive/`, sin seguimiento, nunca se commitean): 45 `.md` — registros de cambio de Valentino (`Olme/`: admin con `Operaciones/`, cliente, chatbot, panel; `Ideas de nuevas features.md`), bloques a ejecutar de Franco (`Franco/Bloques a Ejecutar/{CHATBOT,DASHBOARD,OSLEAD}`), su flujo de trabajo (`Franco/Work Flow/`) y `Recursos DevelOP.md`. Uso: DEC-35.

### 12.1 Índice de auditorías previas

Fuente: `_crudo/previas.json` (F1.9: 3 agentes de solo lectura, 35 documentos leídos completos). **290 hallazgos CRÍTICA/ALTA/P0/P1** (escala de cada documento), 84 declarados cerrados por algún documento; por dominio probable: D1 18 · D2 23 · D3 18 · D4 42 · D5 55 · D6 48 · D7 29 · D8 28 · D9 29. Cada lote de F2 recibe los que citan sus archivos y los re-verifica contra el código de hoy (DEC-12): un «cerrado» declarado no se da por bueno sin lectura.

| Documento | Hallazgos altos | Declarados cerrados |
|---|---|---|
| `rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md` | 68 | 14 |
| `docs/audits/2026-06-revalidacion-dashboard-chatbot.md` | 49 | 19 |
| `docs/audits/2026-06-revalidacion.md` | 46 | 20 |
| `docs/audits/2026-05-auditoria-profunda.md` | 21 | 10 |
| `docs/auditoria-seguridad-2026-05.md` | 15 | 7 |
| `docs/audits/2026-05-auditoria-db.md` | 11 | 8 |
| `raíz:AUDITORIA-VS-BRIEF-2026-07.md` | 11 | 0 |
| `docs/auditoria-consistencia-setter.md` | 10 | 2 |
| `rama:chore/auditoria-clean:docs/baselines/2026-07-auditoria-clean.md` | 10 | 0 |
| `docs/sprints/alpha-1-reaudit.md` | 9 | 0 |
| `docs/auditorias/AUDITORIA-CIERRE-2026-07.md` | 8 | 0 |
| `docs/audit-repo-20260707.md` · `docs/b8a-auditoria.md` | 5 · 5 | 1 · 2 |
| `docs/audit-chatbot-runtime.md` · `docs/b8a-ii-auditoria.md` | 4 · 3 | 0 · 0 |
| `docs/baselines/2026-07-auditoria-seguridad.md`, `docs/auditoria-total-pre-deploy.md`, `docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md`, `docs/auditorias/A3-VIABILIDAD-BIS-2026-08.md`, `docs/auditoria-recorrido-completo-novato.md` | 2 c/u | 0 |
| `docs/auditorias/{SMOKE-TEST-MANUAL-2026-07,REGRESION-FINAL-2026-07,A3-VIABILIDAD-DECISIONES-2026-08}.md`, `docs/audit/2026-04-dashboard-cleanup-audit.md`, `docs/microaudit-frozen-frontera-CO.md` | 1 c/u | 1 en el smoke |

Sin hallazgos de severidad alta (baselines de performance, censos, viabilidad, runbooks o auditorías de diseño sin escala): `docs/baselines/2026-05-{admin-performance,chatbot-runtime}.md`, `docs/auditorias/{A1-CENSO-SUPERFICIES,A2-SETTER-DOCS-VIABILIDAD,A3-ESTADO-ECC-SKILLS}-2026-08.md`, `docs/audits/2026-05-{bfg-leak-cleanup,cleanup-db-dev}.md`, `docs/auditoria-ux-setter.md`, `docs/{admin-design-system-audit,design-system-audit}.md`. La auditoría de seguridad de julio (`docs/baselines/2026-07-auditoria-seguridad.md`) quedó con solo 2 ALTO tras su refutación adversarial; sus MEDIO y BAJO no se indexaron y los lectores los encuentran por su cuenta.

## 13. Sitio público y v3

- Sitio público en main: 138 archivos de alcance superficial (`src/app/` público, `components/{sections,3d,canvas,software,automation,ia,layout,brand,design-system}`, `context/`), inventariados en `_crudo/inventario-superficial.json`. 17 archivos públicos que importa código interno pasaron a D9 profundo (DEC-09).
- `src/app/v3/` no existe en main: vive en `rediseno/home` (883 archivos), fuente de F3.
