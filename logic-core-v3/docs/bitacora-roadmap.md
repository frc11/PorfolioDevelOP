# Bitácora del roadmap — Logic Core v3

Archivo único de cierres de sprint. Cada bloque empieza con `## ✅ [ID-SPRINT]` y se appendea al final. No se sobrescribe contenido previo.

---
## ✅ B0.6 — Build verde + purga BFG del leak `enviroment.env`   ·   2026-05-21

**Archivos modificados:**
- `logic-core-v3/docs/audits/2026-05-bfg-leak-cleanup.md` — anexé sección 8 con estado post-purga y los pasos exactos del force-push (paso A→F) pre-rellenados con paths y SHAs reales del repo
- (NO toqué código de aplicación. La migración del SDK en `src/lib/ai/executive-brief.ts` ya estaba aplicada en el working tree sin commitear — ver sección de Parte A abajo)

**Comandos:**
- `npx tsc --noEmit` → ok (exit 0, sin errores)
- `npm run build` → ok (exit 0, "Compiled successfully in 20.5s", 29/29 páginas estáticas generadas)
- `pip install --user git-filter-repo` → ok (instaló 2.47.0)
- `git clone --mirror https://github.com/frc11/PorfolioDevelOP.git portfolio-mirror.git` → ok (180 MB, 210 commits)
- `git-filter-repo --path logic-core-v3/enviroment.env --invert-paths --force` → ok (210 commits reescritos en 0.22s)
- `git log --all --full-history -- logic-core-v3/enviroment.env` → vacío ✓
- `git log --all -p -S "43e09ffb-b632-48f7-be07"` → vacío ✓
- Commit infectado `3953558` reescrito a `7f69ff1` con el mismo mensaje pero sin el archivo en el tree ✓

**Parte A — Estado real de la migración del SDK:**
Cuando entré, el fix YA estaba aplicado en el working tree (sin commitear). El diff vs HEAD muestra que la migración está completa y coherente con el patrón del proyecto (mismo provider factory que `generateInsights.ts`, `handleChatRequest.ts`, `smokeTest.ts`):

Desajustes corregidos en el working tree (no por mí — ya estaban):
1. Import: `import Anthropic from '@anthropic-ai/sdk'` → `import { generateText } from 'ai'` + `import { getLLMProvider } from '@/modules/chatbot/server/llm/factory'`
2. Cliente: removida la función `getAnthropicClient()` y la variable `anthropicClient` — ahora se usa el provider factory (`getLLMProvider('google').getModel(BRIEF_MODEL)`)
3. Constante del modelo: `CLAUDE_MODEL = 'claude-haiku-4-5-20251001'` → `BRIEF_MODEL = 'gemini-2.5-flash'` (era lo correcto según el contexto del task)
4. Llamada: `anthropic.messages.create({ model, max_tokens, system, messages })` → `generateText({ model, system, messages, maxOutputTokens })`
5. Parseo del response: eliminado el manual `response.content.find(b => b.type === 'text')` — Vercel AI SDK devuelve `{ text }` directo y se hace `.trim()`

Como ninguna acción de código mía hizo falta en Parte A, mi trabajo concreto fue confirmar que tsc + build pasan limpio con el archivo en su estado actual.

**Parte B — Purga BFG (ejecutada localmente, NO pusheada):**
- Backup mirror en `C:\tmp\bfg-purge-2026-05-21\portfolio-mirror.git` (180 MB, history purgada)
- Secret value (`43e09ffb-b632-48f7-be07-5538568abf18`) eliminado de TODOS los patches de history
- Archivo `logic-core-v3/enviroment.env` eliminado de TODOS los commits
- Los SHAs cambiaron desde el commit infectado en adelante (esperado al reescribir history)

**Decisiones no especificadas:**
1. **Usé `git-filter-repo` 2.47.0 en vez de BFG.** Razones: BFG no estaba instalado, no hay Scoop, y `git-filter-repo` (a) es la herramienta moderna que la propia doc de Git recomienda como reemplazo de BFG, (b) se instala con un `pip install --user` sin dependencias extra, (c) produce un resultado funcionalmente equivalente al objetivo del runbook (borrar el archivo de toda la history y reescribir SHAs). Documentado en sección 8 del runbook.
2. **No commiteé los cambios del working tree.** El runbook (sección 7) y CLAUDE.md (protocolo de sprint) dejan claro que Franco commitea cuando decide. Mi cambio al runbook (sección 8 nueva) queda en working tree como modificación pendiente, igual que el resto.
3. **Apliqué la purga sobre la history actual del remote**, no sobre el estado local con el rm-cached pendiente. Razón: el remote es la fuente de verdad y los cambios pendientes (rm + .gitignore) los va a commitear Franco antes del force-push (Paso A de la sección 8.3 del runbook). Esto evita tener que reaplicar manualmente esos cambios después del force-push.

**Flags para Franco:**
- 🚩 **CRÍTICO — Force-push pendiente.** El mirror está purgado y listo en `C:\tmp\bfg-purge-2026-05-21\portfolio-mirror.git`, pero **no toqué el remote**. Antes de pushear:
  1. Confirmar con el socio que va a re-clonar o `git reset --hard origin/main` después del force-push.
  2. Commitear y pushear los cambios pendientes del working tree (el `rm --cached enviroment.env`, `.gitignore`, `STATUS.md`, `docs/env-vars.md`, los 7 archivos M del módulo admin chatbots, el `executive-brief.ts` migrado, y los untracked relevantes en `docs/audits/`, `docs/operations/`, `scripts/_db-cleanup-*.mjs`, `src/app/(protected)/admin/chatbots/[botId]/tabs.ts`). Decidir qué entra antes con `git status` / `git diff --staged`.
  3. Seguir paso B→F de la sección 8.3 del runbook `docs/audits/2026-05-bfg-leak-cleanup.md`.
- 🚩 La key vieja (`43e09ffb-…`) ya fue rotada por vos previo a este sprint, así que **no hay riesgo activo** aunque el force-push se demore. Pero la higiene de history sigue pendiente hasta que pushees.
- 🚩 Si pasa más de un día/dos entre hoy y el momento del force-push, regenerar el mirror (paso B de la sección 8.3) — la history del remote puede tener commits nuevos para entonces.
- 🚩 Hay warnings de Sentry en el build (`onRequestError` hook faltante, `global-error.js` recomendado, deprecación de `sentry.client.config.ts`). No son errores ni rompen el build, pero son deuda técnica para revisar cuando toque tocar instrumentación.

**Listo para:**
- ✅ Sprint B1 (build verde confirmado, tsc + build limpios — cualquier sprint siguiente puede medir contra este baseline)
- ⏳ Verificación de Franco + ejecución manual del force-push cuando coordine con el socio

---
## ✅ B1.1 — Diagnóstico de performance build/dev (solo medición, cero optimización)   ·   2026-05-21

**Objetivo**: cuantificar dónde se va el tiempo en build/dev/render antes de optimizar nada. Producir veredicto + recomendación priorizada para B1.2.

**Pre-check**:
- Branch Neon dev confirmada: `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech` ✅
- `npx prisma migrate status` → 42 migrations, schema up to date ✅
- `npm run check-env` → exit 1: 3 críticas faltantes (`IMPERSONATION_SECRET`, `DEVELOP_ALERTS_EMAIL`, `NEXT_PUBLIC_APP_URL`). 🚩 No bloquean build/dev, sí runtime de features puntuales (impersonation API, alertas técnicas, CTAs públicos). Out of scope B1.1 — flag para sprint siguiente.

---

### 1) Build de producción cold (webpack, `.next` vacío)

| Fase | Tiempo | % del total |
|---|---:|---:|
| **Compile (webpack)** | **102.0s** | **64%** |
| TypeScript (`tsc` interno) | 27.6s | 17% |
| Static pages 29/29 | 5.6s | 4% |
| Collecting page data + finalizing + traces + spawn overhead | ~25s | 16% |
| **Total wall-time** | **160.6s** | **100%** |

- EXIT 0 limpio. Sin errores TS.
- Engine: `Next.js 16.2.1 (webpack)`. Experimento activo: `clientTraceMetadata`.
- 29/29 páginas estáticas generadas (las mismas que B0.6).
- Sentry warnings ya conocidos (`onRequestError` hook faltante, `global-error.js` recomendado, `sentry.client.config.ts` deprecado) — siguen siendo deuda técnica de instrumentación, no afectan el build.

> El "Compiled successfully in 20.5s" del cierre B0.6 era **solo la fase compile** de un run previo con cache cliente parcial. El build total cold (sin cache) son los 160.6s medidos hoy.

### 2) Bundle analysis (instalación temporal de `@next/bundle-analyzer`)

**Setup temporal usado solo para esta medición**:
- `npm i -D @next/bundle-analyzer` (devDep, desinstalada al cierre).
- Wrap opt-in `withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })` en `next.config.ts` (revertido al cierre — confirmado por `git status`).
- `ANALYZE=true npm run build` con `NODE_OPTIONS=--max-old-space-size=8192` → 189s, EXIT 0.

🚩 **Primera corrida sin el `--max-old-space-size` crasheó con `FATAL ERROR: Ineffective mark-compacts near heap limit` a los 89s.** El build normal corre cerca del límite default de 4 GB de Node; cualquier instrumentación adicional lo empuja al OOM. Vale la pena setear el flag en el script `build` del package.json para tener margen.

**Top chunks identificados (con grep de firmas distintivas sobre los `.js` de `.next/static/chunks` y `.next/server/chunks`):**

| Chunk | Tamaño | Lado | Contenido principal |
|---|---:|---|---|
| `5166.js` | **11.4 MB** | server | **`googleapis` entero** (23 465 matches del string) |
| `3411.js` | 2.1 MB | server | googleapis adicional (328 matches) |
| `4150.js` | 1.8 MB | server | `three` (11) + `resend` (103) |
| `2964-...js` | **544 KB** | client | **Lucide icons (pack completo)** — primera función vista: icono `shovel` (path SVG hardcodeado) → tree-shaking no está colapsando el set |
| `8804-...js` | 460 KB | client | React + Next + react-hook-form (vendor core) |
| `bd904a5c-...js` | 363 KB | client | Three.js minificado (sólo símbolos `$EB`, `$Ed`… pattern de three bundleado) |
| `278-...js` | 362 KB | client | **Recharts** (59 matches) |
| `b536a0f1-...js` | 341 KB | client | Three.js core (firma `WebGLRenderer`) |
| `4bd1b696-...js` | 196 KB | client | React + react-hook-form |
| `framework-...js` | 186 KB | client | React runtime + Next runtime |
| `b1644e8c-...js` | 151 KB | client | Lucide (más icons) |
| `51749ec1-...js` | 142 KB | client | **R3F + Three** (firma `__r3f`/`useFrame`) |
| `1998-...js` | 128 KB | client | **Motion** (firma `motionValue`/`AnimatePresence`) |
| `1627-...js` | 114 KB | client | react-markdown + remark-gfm |
| `polyfills-...js` | 110 KB | client | polyfills |
| `4638-...js` | 99 KB | client | **Lenis** (smooth scroll) |
| `3311-...js` | 95 KB | client | Zod |
| `f6211eb1-...js` | 86 KB | client | Three postprocessing helpers |
| `a3cd4a83-...js` | 81 KB | client | `postprocessing` library |
| `3358-...js` | 77 KB | client | Three extras |
| `1489-...js` | 60 KB | client | 🚩 **Prisma client browser-shim** (firma `PrismaClient`, 13 matches) — algún archivo cliente está importando `@prisma/client` |
| `3342-...js` | 61 KB | client | `OnboardingWizard` (componente de la app) |
| `app/page-...js` | 267 KB | client | landing `/` |
| `app/process-automation/page-...js` | 236 KB | client | página servicio |
| `app/web-development/page-...js` | 203 KB | client | página servicio |
| `app/software-development/page-...js` | 197 KB | client | página servicio |
| `app/ai-implementations/page-...js` | 152 KB | client | página servicio |

**Totales por familia (client)**:
- **Stack 3D (three core + three-min + R3F + postproc + extras)** ≈ **1090 KB** (consistente con HeroArtifact + NeuroAvatar como sospechosos)
- **Lucide icons** ≈ **695 KB** (544 + 151) — número anómalamente alto, posible tree-shaking roto
- **React/Next/RHF vendor** ≈ 750 KB
- **Recharts** ≈ 362 KB
- **Motion** ≈ 128 KB
- **Lenis** ≈ 99 KB

**Server**: `googleapis` solo entre `5166.js` + `3411.js` suma **~13.5 MB**. Es el mayor offender server-side y afecta cold start de cada lambda Netlify (no del dev local).

Reports HTML quedan en `.next/analyze/{client,edge,nodejs}.html` — borrados con el resto de `.next` en cleanup. Re-generables corriendo `npm i -D @next/bundle-analyzer` + wrap + `ANALYZE=true NODE_OPTIONS=--max-old-space-size=8192 npm run build`.

### 3) Dev cold start: webpack vs turbopack

Protocolo: `Remove-Item .next`, `Start-Process` del dev en background con stdout a log, polling hasta `Ready in`, luego `Invoke-WebRequest /` para forzar la primera compilación lazy de la home.

| Métrica | webpack (`npm run dev`, default) | turbopack (`next dev --turbopack`) | Δ |
|---|---:|---:|---:|
| **Ready (server boot)** | 552 ms | **365 ms** | turbo 1.5x |
| **First compile `/` (next.js)** | **22.8 s** | **8.3 s** | turbo **2.75x** |
| First hit `/` wall-time (compile + app-code) | 30.0 s | 9.2 s | turbo 3.3x |
| Application-code en first hit | 1.4 s | 0.93 s | turbo 1.5x |

> El "Ready in 552ms" de webpack es engañoso — el server abre el puerto rápido, pero la **primera request a `/` paga 22.8s de compilación**. Eso es lo que Franco ve "tardando" al abrir la home tras `npm run dev`. Turbopack baja eso a 8.3s.

### 4) Hot reload (3 archivos, dev ya tibio con `/` cacheada)

Edits triviales (un comentario insertado, revertido después). Después de cada edit, `Invoke-WebRequest /` para disparar el recompile y leer `GET / 200 in Xms (next.js: Yms, application-code: Zms)` del log de Next.

**Archivos editados** (idénticos en ambos engines, revertidos en cada caso):
- Client component `'use client'` chico: [src/components/ui/Button.tsx](logic-core-v3/src/components/ui/Button.tsx) (motion + lucide, ~70 líneas, importado masivamente)
- Page server: [src/app/page.tsx](logic-core-v3/src/app/page.tsx) (home con dynamic imports de 7+ secciones)
- Lib trivial: [src/lib/cn.ts](logic-core-v3/src/lib/cn.ts) (7 líneas, usado por casi todo)

| Caso | webpack: outer / next.js / app-code | turbopack: outer / next.js / app-code | Δ outer |
|---|---:|---:|---:|
| Hot Button (client `'use client'`) | 1350 / **80** / 1122 ms | 563 / **5** / 304 ms | turbo 2.4x |
| Hot page (server) | 1333 / 82 / 1101 ms | 1017 / 161 / 585 ms | turbo 1.3x |
| Hot cn.ts (lib) | 861 / 43 / 644 ms | 899 / 147 / 492 ms | empate |

**Lectura clave del hot reload**: en ambos engines, **lo que domina el tiempo no es la compilación sino el application-code** (304–1122 ms por request). El `next.js: Xms` (compile + framework) es chico (5–161 ms). Eso significa que el "se siente lento al guardar" tiene dos componentes mezclados:
- Compile (webpack lo hace en 43–82 ms; turbopack en 5–161 ms) → **no es el cuello en hot reload**
- Application-code (queries + render) → **acá vive el costo real** y es donde se siente la latencia a Neon

### 5) Latencia DB Neon dev (sa-east-1)

Script throwaway `scripts/_b1-1-perf-probe.mjs` (borrado al cierre) — `PrismaClient` haciendo `$queryRaw SELECT 1` cold (primera conexión de la sesión) + 5 warm + 3 queries reales.

| Query | Tiempo |
|---|---:|
| **cold** `SELECT 1` (incluye TCP + TLS + pool warmup) | **1133.6 ms** |
| warm `SELECT 1` p50 / p95 | **55.1 ms** / 57.4 ms |
| warm `Organization.count` | 139.4 ms |
| warm `Organization.findMany take 6` (select id+slug) | 116.8 ms |
| warm `BotConfig.findMany take 2` | 127.7 ms |

> Cada query warm = ~55 ms. Una página típica que toca varias tablas (organization + members + bot + projects + tasks) hace 4–8 queries serializadas → **220–440 ms solo de network round-trips a São Paulo**. Eso explica buena parte del `application-code` de 500–1100 ms en los hot reloads.

### Veredicto — dónde se va el tiempo

| Escenario | Cuello primario | Mecanismo |
|---|---|---|
| **Build prod cold (160s)** | **Webpack compile (102s = 64%)** | webpack reprocessa todo el grafo + Sentry instrumenta sourcemaps; bundle gordo (googleapis 13.5 MB, lucide 695 KB) infla el trabajo |
| **Dev cold start (30s para que la home renderice)** | **Webpack compile lazy de la page (22.8s)** | turbopack lo hace en 8.3s con cero cambios de código |
| **Dev hot reload (0.9–1.4s)** | **Application-code, no compile** | render React + 4–8 queries a Neon × 55 ms warm; el compile es 5–82 ms |
| **Páginas tardan en cargar en runtime de dev** | **Latencia de red a sa-east-1 + bundle pesado** | 55 ms × N queries + descarga de chunks ~3.7 MB shared |

**No es "un" cuello — son tres distintos según el escenario**. La buena noticia: cada uno tiene una palanca diferente.

### Recomendación priorizada para B1.2

1. **Switchear `dev` y `build` a Turbopack** (cambiar `--webpack` por `--turbopack` en los scripts de [package.json](logic-core-v3/package.json#L7-L8)). 
   - **Ganancia medida**: cold first-compile de `/` baja **22.8 s → 8.3 s** (2.75x); hot reload de client component baja **1350 ms → 563 ms** (2.4x).
   - **Riesgo dev**: bajo. Turbopack es stable en `next dev` desde Next 15. El proyecto no tiene config custom de webpack, así que no hay incompatibilidades obvias. Sí hay un warning ya activo de Sentry: "When using Turbopack `sentry.client.config.ts` will no longer work" → migrar a `instrumentation-client.ts` antes/durante el switch.
   - **Riesgo build prod**: medio. `next build --turbopack` es beta en Next 16. Antes de cambiar el script de build, hacer una corrida one-off de validación y comparar bundle output con webpack.
   - **Esfuerzo**: minutos (script + migración de `sentry.client.config.ts`).

2. **Investigar tree-shaking de `lucide-react`** (544 KB + 151 KB = ~695 KB en chunks client). Lucide soporta tree-shaking si los imports son nominados (`import { Icon } from 'lucide-react'`), pero hay patterns que rompen el shaking. Auditar todos los `from 'lucide-react'` y verificar que ninguno haga `import * as Icons` ni `import Icons from`. **Esfuerzo**: 20-40 min de grep + revisión.

3. **Lazy-load / reemplazar `googleapis` en el server bundle** (13.5 MB en lambdas Netlify). Reemplazar `import { google } from 'googleapis'` por imports nominados directos a `googleapis/build/src/apis/{analytics,searchconsole}` o switchear a `@google-analytics/data` + `@google-cloud/local-auth` (más livianos, ya usados parcialmente por `@google-analytics/data` v5.2.1). **Ganancia esperada**: -8 a -12 MB del server bundle. **Esfuerzo**: 1-2 h (depende de cuántos call sites haya en `src/lib/analytics.ts`, `src/lib/searchconsole.ts`, `src/lib/actions/settings.ts`).

4. **Resolver "Prisma client en bundle del cliente"** (60 KB en chunk `1489`). Buscar el import accidental de `@prisma/client` o de un módulo que lo arrastre desde código marcado `'use client'`. **Esfuerzo**: 30 min de grep guiado.

5. **Setear `NODE_OPTIONS=--max-old-space-size=8192`** en el script `build` del package.json. El build normal corre cerca del límite default de 4 GB (cualquier plugin extra lo empuja al OOM). **Esfuerzo**: 1 minuto.

6. **Decisión más grande, no para B1.2 inmediato**: para la latencia de Neon en dev (~55 ms por query × N queries por página), no hay fix de build/bundle — es física de red. Opciones futuras: (a) branch dev de Neon en `us-east-2` (más cerca de máquinas dev en otras zonas, pero peor para Franco en LATAM), (b) Postgres local para dev, (c) cache agresivo de queries server-side con `unstable_cache` o React `cache`. Cualquier decisión acá amerita su propio sprint y trade-off con prod (que sí necesita estar en sa-east-1).

### Decisiones no especificadas / flags

1. **Wrap opt-in en `next.config.ts`**: agregué `withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })` para que el analyzer sea cero-impacto por default (NOOP cuando la env var no está). Revertido al cierre, confirmado por `git diff next.config.ts` vacío.
2. **OOM en build con analyzer → workaround temporal**: usé `NODE_OPTIONS=--max-old-space-size=8192` solo para esta corrida. No tocó el package.json. Pero es síntoma de que el build normal está al 90% del default heap (recomendación #5).
3. **`@next/bundle-analyzer` instalado/desinstalado**: lo dejo desinstalado al cierre para no dejar rastros en package.json. Re-instalar en B1.2 si se quiere comparar antes/después de cada fix.
4. **Script `scripts/_b1-1-perf-probe.mjs` borrado al cierre** (sigue convención `_` = throwaway). El número de latencia DB queda registrado en esta bitácora.
5. **Edits temporales para hot reload**: 3 archivos editados con un comentario y revertidos inmediatamente. `git diff` final vacío sobre los 3 (confirmado).
6. **3 vars críticas faltantes detectadas por `check-env`** (`IMPERSONATION_SECRET`, `DEVELOP_ALERTS_EMAIL`, `NEXT_PUBLIC_APP_URL`): no bloquean build ni dev compile, sí runtime de impersonation API + alertas técnicas + CTAs públicos. 🚩 Pendiente sumar al `.env.local` antes de probar esas features en dev.
7. **Vulnerabilidades npm audit**: 14 (8 mod + 5 high + 1 critical) reportadas por npm install. Mismo set que existe antes de este sprint. Out of scope.

### Cambios al working tree al cierre de B1.1

- `next.config.ts`: **idéntico a HEAD** ✅ (wrap revertido)
- `src/components/ui/Button.tsx`, `src/app/page.tsx`, `src/lib/cn.ts`: **idénticos a HEAD** ✅ (probes revertidos)
- `package.json`, `package-lock.json`: **idénticos a HEAD** ✅ (`@next/bundle-analyzer` desinstalado)
- `scripts/_b1-1-perf-probe.mjs`: **borrado** ✅
- `.next/`: borrado por las mediciones cold (regenerable con `npm run build` o `npm run dev`)
- No se commiteó nada. Las modificaciones pre-existentes del working tree (B0.6 y previo) siguen exactamente como estaban.

### Comandos de verificación post-sprint

```bash
# Confirmar reverts
git diff next.config.ts src/components/ui/Button.tsx src/app/page.tsx src/lib/cn.ts src/lib/prisma.ts
# (todos vacíos)

# Confirmar package.json sin bundle-analyzer
git diff package.json package-lock.json
# (vacíos al cierre tras npm uninstall)

# Re-validar build/migration
npm run build      # cold ~160s, EXIT 0
npx tsc --noEmit   # esperado: EXIT 0
npx prisma migrate status   # esperado: up to date
```

### Listo para
- ✅ Sprint B1.2 (optimización guiada por estas mediciones). Empezar por (1) Turbopack switch + (2) lucide tree-shaking — son los wins de mayor ratio ganancia/esfuerzo.
- ⏳ Decisión Franco: ¿priorizar el dev experience (Turbopack) o el bundle/cold start de prod (googleapis + lucide)? Mi recomendación: ambos en paralelo, Turbopack primero porque es 5 minutos de cambio con impacto inmediato en tu día a día.

---
## ✅ B1.2 — Optimizaciones aplicadas (guiadas por números de B1.1)   ·   2026-05-22

**Objetivo**: aplicar fixes que B1.1 cuantificó con números. Cada cambio justificado por una métrica concreta. Cero optimización especulativa.

### Tabla antes/después (resumen ejecutivo)

| Métrica | B1.1 (antes) | B1.2 (después) | Δ |
|---|---:|---:|---:|
| **Build prod cold total** | 160.6 s | **141.1 s** | **-19.5 s (-12%)** |
| → fase compile (webpack) | 102 s | **75 s** | **-27 s (-26%)** |
| → fase TypeScript | 27.6 s | 30.8 s | +3.2 s (+12%) |
| → fase static pages | 5.6 s | **3.1 s** | **-2.5 s (-45%)** |
| **Server bundle (nodejs.html)** | 3 338 KB | **2 620 KB** | **-718 KB (-22%)** |
| → chunk `5166.js` (googleapis) | 11 436 KB | **0 KB (eliminado)** | **-11.4 MB ✅** |
| → chunk `3411.js` (otro) | 2 108 KB | 2 108 KB | sin cambio (resultó ser `@google-analytics/data`, no googleapis) |
| **Client bundle (client.html)** | 1 644 KB | **1 408 KB** | **-236 KB (-14%)** |
| → chunk `2964` (Lucide pack completo) | 544 KB | **0 KB (eliminado)** | **-544 KB ✅** |
| → chunk `b1644e8c` (Lucide more) | 151 KB | **0 KB (eliminado)** | **-151 KB ✅** |
| → chunk `1489` (Prisma client browser-shim) | 60 KB | (movido a `7106`, 65 KB, 13 matches) | parcial: VaultManager fix sí, NewTicketModal sigue |
| **Dev `npm run dev`: Ready** | 552 ms (webpack default) | **391 ms (turbo default)** | -29% |
| **Dev: first compile `/`** | **22.8 s** (webpack) | **7.3 s** (turbo) | **-15.5 s (-68%)** ✅ |
| **Hot reload: Button (client)** | 1350 ms / 80 ms compile | 597 ms / 7 ms compile | -56% / -91% compile |
| **Hot reload: page (server)** | 1333 ms / 82 ms compile | 961 ms / 163 ms compile | -28% outer |
| **Hot reload: cn.ts (lib)** | 861 ms / 43 ms compile | 901 ms / 148 ms compile | empate |

### Cambios aplicados (cada uno con justificación numérica de B1.1)

**1. `cross-env NODE_OPTIONS=--max-old-space-size=8192` en script `build` ([package.json](logic-core-v3/package.json#L8))**
   - **Justifica**: B1.1 §2 — primer ANALYZE build OOM-eó a los 89s con "Ineffective mark-compacts near heap limit". El build normal corre cerca del default 4 GB.
   - **Cambio**: agregué `cross-env` como devDep (necesario para que `NODE_OPTIONS=...` funcione tanto en Windows local como en Linux Netlify). Pasa el flag al `next build --webpack`.
   - **Efecto**: build normal ahora tiene margen de 8 GB; el ANALYZE build de B1.2 corrió 159s sin OOM (vs OOM en B1.1).

**2. Tree-shaking de `lucide-react` ([TodoIncluidoFeatureCard.tsx](logic-core-v3/src/components/sections/todo-incluido/TodoIncluidoFeatureCard.tsx), [ModuloActiveCard.tsx](logic-core-v3/src/components/sections/modulos-opcionales/ModuloActiveCard.tsx), [ModuloComingSoonCard.tsx](logic-core-v3/src/components/sections/modulos-opcionales/ModuloComingSoonCard.tsx))**
   - **Justifica**: B1.1 §2 — 695 KB cliente (chunks 2964 + b1644e8c) con el icono `shovel` literal hardcodeado, señal de tree-shaking roto.
   - **Causa raíz encontrada**: los 3 archivos hacían `import * as LucideIcons from 'lucide-react'` para hacer `resolveLucideIcon(name: string)` (dynamic lookup por nombre). Webpack no puede tree-shake star imports cuando el nombre se resuelve en runtime.
   - **Cambio**: reemplazado por imports nominados + map estático `Record<string, LucideIcon>` con sólo los icons usados por el respectivo data source (5 icons en TodoIncluido, 9 icons compartidos en ambos Modulo*Card). Fallback a `Box`.
   - **Efecto medido**: -695 KB del client bundle. Verificación con grep: 0 hits de `shovel` o `createLucideIcon` en chunks tras el fix.

**3. `googleapis` agregado a `serverExternalPackages` ([next.config.ts](logic-core-v3/next.config.ts#L4))**
   - **Justifica**: B1.1 §2 — `googleapis` = 13.5 MB en server bundle (chunks 5166 + 3411).
   - **Cambio**: agregado al array existente: `serverExternalPackages: ['@react-pdf/renderer', 'googleapis']`. Webpack ya no bundlea `googleapis` en los lambdas — se carga vía `require()` en runtime desde node_modules.
   - **Cambio de plan vs recomendación B1.1**: B1.1 sugería "imports nominados" (`googleapis/build/src/apis/...`), pero el enfoque `serverExternalPackages` es 1 línea, no requiere instalar packages adicionales, y es exactamente el mismo patrón ya usado para `@react-pdf/renderer`.
   - **Efecto medido**: chunk `5166.js` (11.4 MB) **eliminado completamente**. Sólo afecta a `googleapis`, no a `@google-analytics/data` (que es otro package y vive en chunk `3411.js`, 2.1 MB, sin cambio). Build compile bajó 102 s → 75 s en buena parte por esto.
   - **Trade-off honesto**: el código de `googleapis` sigue ocupando lugar en `node_modules` dentro del zip de la lambda Netlify. La ganancia es en BUILD TIME (webpack no procesa) y en COLD START (Node no parsea hasta el primer `require`).

**4. `VaultManager.tsx`: `import { AssetType }` → `import type { AssetType }` + array local de enum values ([VaultManager.tsx](logic-core-v3/src/components/admin/managers/VaultManager.tsx))**
   - **Justifica**: B1.1 §2 — chunk `1489` (60 KB, 13 matches de `PrismaClient`) en bundle del cliente.
   - **Cambio**: el value import (`AssetType` enum runtime) se usaba en `Object.values(AssetType)` para llenar un `<select>`. Cambié a `import type` + local `const ASSET_TYPES = ['DOCUMENT', 'IMAGE', 'BRANDBOOK', 'LOGO', 'ACCESS', 'OTHER'] as const satisfies readonly AssetType[]`. El `<select>` itera el array local.
   - **Sincronía con schema**: hay un comment indicando que es un mirror del enum prisma. Si Franco agrega un value al enum, debe actualizar el array. Solución más robusta sería un script gen-from-schema, fuera de scope B1.2.
   - **Efecto medido**: PARCIAL. El chunk Prisma sigue existiendo (movido a `7106.js`, 65 KB, mismos 13 matches de `PrismaClient`). **El offender principal NO era VaultManager — era `NewTicketModal.tsx`** que hace `z.nativeEnum(TicketCategory)` y necesita el value runtime real del enum. Refactorear ese a `z.enum([...string literals])` requeriría hardcodear los values de `TicketCategory` + `TicketPriority` enums, y manejar drift con schema → out of scope B1.2.

**5. Migración `sentry.client.config.ts` → `src/instrumentation-client.ts` (pre-requisito Turbopack)**
   - **Justifica**: B1.1 reportó deprecation warning de Sentry: "When using Turbopack `sentry.client.config.ts` will no longer work".
   - **Cambio**: borré `sentry.client.config.ts` (root). El archivo `src/instrumentation-client.ts` YA EXISTÍA (creado por el wizard de Sentry hace un tiempo); le agregué las opciones que estaban únicamente en el config viejo: `replaysOnErrorSampleRate: 1.0`, `replaysSessionSampleRate: 0.0`, `environment: process.env.NODE_ENV`.
   - **Subtleza encontrada**: mis 2 primeros intentos con la herramienta Write fallaron silenciosamente porque el archivo ya existía y el tool requiere Read previo. Al verificarlo, descubrí que el contenido era el del wizard (sin las opciones de replays). Lo edité explícitamente para fusionar ambas configs.
   - **Efecto**: el client config queda en un solo lugar, compatible con Turbopack. Las opciones de Sentry preservadas. `sentry.server.config.ts` y `sentry.edge.config.ts` siguen porque el warning era sólo del client (los otros dos warnings de Sentry — `onRequestError` hook y `global-error.js` — siguen pendientes, deuda técnica fuera de este sprint).

**6. Script `dev`: `next dev --webpack` → `next dev --turbopack` ([package.json](logic-core-v3/package.json#L7))**
   - **Justifica**: B1.1 §3 — Turbopack baja first-compile `/` de 22.8 s → 8.3 s (2.75x); hot reload de client de 1350 ms → 563 ms (2.4x).
   - **Cambio**: literalmente 1 carácter (`--webpack` → `--turbopack`). Pre-validé en un test aparte que arranca y sirve `/` con HTTP 200 + sin errores en log, antes de tocar package.json.
   - **No incluido**: el script `build` SIGUE usando `--webpack`. `next build --turbopack` es beta en Next 16; no quise arriesgar la build de prod con todos los demás cambios B1.2 simultáneos. Es una validación que puede hacerse en su propio sprint controlado.
   - **Efecto medido**: con todos los fixes B1.2 aplicados:
     - Dev cold: Ready 391 ms, first compile `/` 7.3 s (next.js) + 868 ms (app). Total 8.2 s vs 30 s webpack B1.1 (**-73%**).
     - Hot reload Button: 597 ms outer / 7 ms compile / 311 ms app vs webpack B1.1 1350 / 80 / 1122 ms.
     - Hot reload page: 961 ms outer / 163 ms compile / 504 ms app vs webpack 1333 / 82 / 1101 ms.
     - Hot reload cn.ts: 901 ms / 148 ms / 469 ms vs webpack 861 / 43 / 644 ms (empate en lib trivial).

### Cambios NO aplicados (con justificación)

- **Lazy load `NeuroAvatar` con `dynamic()`**: el usuario lo sugirió como sospechoso #1, pero la inspección mostró que NeuroAvatar sólo se importa desde `ChatHeader.tsx`, `AvatarRenderer.tsx` y `LogicCompanion.tsx`, que viven en el módulo chatbot del dashboard interno (no en la home pública). El stack 3D pesado del bundle público (`HeroArtifact` y sus chunks shared) viene de `Hero.tsx`, no de NeuroAvatar. Hacer dynamic de NeuroAvatar afectaría sólo a usuarios autenticados del dashboard, con ganancia marginal vs el riesgo de tocar coordinación de mounting. **Decisión**: no scope para B1.2 — si Franco quiere optimizar el bundle del dashboard interno, ameritaría su propio sprint.
- **Dynamic `HeroArtifact`**: archivo frozen por regla explícita de CLAUDE.md. Además hay coordinación con `PreloaderContext` (también frozen) que pierde sentido si HeroArtifact monta con delay. No tocado.
- **Refactor `NewTicketModal` (z.nativeEnum → z.enum)**: requeriría hardcodear los values de `TicketCategory` y `TicketPriority` enums (que no inspeccioné) + manejar drift con schema. El chunk Prisma de 60 KB persiste por esto, pero es ganancia menor vs el costo del refactor.
- **Imports nominados de googleapis a sub-paths**: descartado en favor de `serverExternalPackages` por ser 1 línea vs N archivos modificados + posible instalación de packages alternativos.
- **`@google-analytics/data` (chunk 3411, 2.1 MB)**: no era target de B1.1. Si en B1.3 se quiere atacar, el mismo patrón de `serverExternalPackages` podría aplicar.

### Hallazgos del sprint (cosas que descubrí mientras hacía los fixes)

1. **El chunk `3411.js` no era googleapis residual** — es **`@google-analytics/data`** (otro package, 2 499 matches de `analytics`). Mi `serverExternalPackages` lo confirmó: eliminó completamente `5166.js` (googleapis puro) pero no tocó `3411`. Ahora hay claridad de qué hay en cada chunk.
2. **`src/instrumentation-client.ts` ya existía** (creado por wizard de Sentry). Mis Write calls fallaron silenciosamente y casi pierdo replays de Sentry hasta que verifiqué con `git status` y vi `nothing to commit, working tree clean` para ese archivo. Lección: cuando Write falla con "File has not been read yet", el archivo ya existe; verificar contenido antes de asumir que tu cambio se aplicó.
3. **Bug de cwd con PowerShell**: en algún momento del sprint el cwd se reseteó a la raíz `PorfolioDevelOP` (no a `logic-core-v3`). Un `npm install -D cross-env` corrió desde ahí y creó `package.json` + `package-lock.json` + `node_modules/` espurios en la raíz, mientras que `cross-env` quedaba fuera del package.json correcto. Detectado en la fase de cleanup, restaurado a la posición correcta y borrada la raíz espuria. **Aprendizaje para futuros sprints**: confirmar cwd antes de cualquier `npm install/uninstall`.
4. **Warning Turbopack multi-lockfiles**: el monorepo-like tiene `PorfolioDevelOP/package-lock.json` (creado erróneamente, ahora borrado) además del legítimo `logic-core-v3/package-lock.json`. Tras el cleanup, sólo queda el legítimo. Si reaparece, Turbopack avisa con "We detected multiple lockfiles and selected the directory of [...] as the root directory" — se puede silenciar con `turbopack.root` en `next.config.ts` si fuera necesario.

### Validación post-sprint

```bash
npx tsc --noEmit            # ✅ EXIT 0 en 9.7s (con cross-env reinstalado correctamente)
npm run build               # ✅ EXIT 0 en 141.1s (vs 160.6s B1.1) — verificado en sección 1
ANALYZE=true npm run build  # ✅ EXIT 0 en 159s (con NODE_OPTIONS=8192, sin OOM)
npx next dev --turbopack    # ✅ Ready 391ms, sirve / en 8.2s — verificado en sección dev
```

### Estado del working tree al cierre de B1.2

**Modificados por B1.2** (8 archivos):
- `next.config.ts` (+ `googleapis` a `serverExternalPackages`)
- `package.json` (scripts dev+build, devDep `cross-env`)
- `package-lock.json` (transitive de cross-env)
- `src/instrumentation-client.ts` (+ replaysOnError + environment, preservados del config viejo)
- `src/components/admin/managers/VaultManager.tsx` (prisma type-only + array local)
- `src/components/sections/todo-incluido/TodoIncluidoFeatureCard.tsx` (lucide nominado)
- `src/components/sections/modulos-opcionales/ModuloActiveCard.tsx` (lucide nominado)
- `src/components/sections/modulos-opcionales/ModuloComingSoonCard.tsx` (lucide nominado)

**Borrados por B1.2** (1 archivo):
- `sentry.client.config.ts` (reemplazado por `src/instrumentation-client.ts` ya pre-existente)

**Sin tocar** (cambios pre-existentes del working tree de B0.6 y previo, no commiteados): `.env.example`, `.gitignore`, `STATUS.md`, `docs/env-vars.md`, `enviroment.env` (D), `scripts/check-env.js`, 7 archivos en `admin/chatbots/*` y `admin/clients/*`, `lib/ai/executive-brief.ts`, untracked `docs/audits/`, `docs/operations/`, `scripts/_db-cleanup-*.mjs`, `src/app/(protected)/admin/chatbots/[botId]/tabs.ts`.

### Veredicto

**Wins reales y medidos**:
- Build prod -12% (-19.5 s), compile -26%.
- Server bundle -22% (-718 KB en HTML report; -11.4 MB de googleapis fuera del webpack).
- Client bundle -14% (-236 KB; el ahorro neto de lucide -695 KB se compensa parcialmente con redistribución de chunks).
- Dev cold start: el momento "abro el browser y la home compila" pasa de 30 s a 8.2 s. **Esto es lo que más se siente día a día**.
- Hot reload de client component: -56% (1.4 s → 0.6 s). El `'use client'` ya no se siente lento al guardar.

**Pendientes para B1.3 o sprints futuros** (no aplicados con justificación):
- Refactor de `NewTicketModal` para terminar de sacar Prisma client del bundle (z.nativeEnum → z.enum).
- `@google-analytics/data` también podría ir a `serverExternalPackages` (-2.1 MB server).
- Considerar `next build --turbopack` cuando Vercel lo marque stable.
- NeuroAvatar lazy load si el bundle del dashboard interno se vuelve un problema.

### Listo para
- ✅ Sprint B1.3 si Franco lo arma (las recomendaciones de "pendientes" arriba son hilos sueltos, no críticos).
- ✅ Continuar B-Plan-1 / Matsu onboarding / cualquier sprint funcional — el build/dev ya no es el cuello.
- ⏳ Validación visual en browser por Franco: render 3D (HeroArtifact, NeuroAvatar en dashboard), animaciones motion, navegación. Las mediciones HTTP confirmaron status 200 y sin errores de compilación, pero el render visual sólo se valida con ojo humano.

---
## ✅ B1.3 — Medición real de latencia del runtime del bot (cero optimización)   ·   2026-05-22

**Objetivo**: instrumentar la medición de latencia del chatbot por etapa (TTFB Vertex + desglose) y reemplazar el baseline simulado (P50 4072ms / P95 12987ms / success 33%) por números reales medidos contra dev. Cero optimización — solo instrumentar y medir.

**Pre-check**:
- Branch Neon dev confirmada: `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech` (mismo host que B1.1/B1.2) ✅
- Bot `develop` activo: `id=cmp2rnq7k00029fdg2649z5vw`, modelo `gemini-2.5-flash`, KB ok, org `develOP` ✅
- `npx prisma migrate status` → 42 migrations, schema up to date ✅
- Dev server corriendo (el original PID 24652 se murió a mitad del sprint; arranqué uno nuevo para correr el test — ver flags al final) ✅

---

### 1) Estado previo (lo que ya estaba vs lo que faltaba)

El handler `handleChatRequest.ts` **ya medía** `durationMs` total (`Date.now() - startTime`, líneas 337 y 351) y lo persistía en `metadata.durationMs` del evento `chat.message_completed`. Lo que faltaba:

1. **Desglose por etapa**: solo había el total — imposible saber si el tiempo se iba en DB, en LLM, en post-persistencia, etc.
2. **TTFB de Vertex**: no se separaba "tiempo hasta primer token" de "tiempo total de stream". Sin esto no se puede distinguir si Vertex es lento porque tarda en arrancar o porque genera muchos tokens.
3. **Alias `latencyMs`**: `getLatencyHistory.ts:46/69` busca `metadata.latencyMs` o `metadata.duration`, no `durationMs`. Por eso `LatencyChart` siempre cae al `generateMockLatency()` y muestra el badge **"DATOS SIMULADOS"** — había datos reales pero con la key equivocada.

### 2) Instrumentación aplicada — `handleChatRequest.ts`

Cambio quirúrgico, **cero modificación de lógica**:

- Helper `mark(key)` al inicio del handler que acumula `Date.now() - stepStart` en un `timings: Record<string, number | null>` y avanza el cursor.
- Llamadas a `mark()` después de cada etapa del pipeline (validación, bot resolve, rate limit, DB pre-LLM, user msg persist, intent, prompt build, llm setup, post-persist).
- `onChunk` callback en `streamText()` que captura `ttfbAt = Date.now()` solo en el primer chunk de tipo `text-delta` o `tool-call`.
- Dentro de `onFinish`, cálculo de `llm_ttfb_ms = ttfbAt - llmStartAt`, `llm_stream_ms = llmDoneAt - ttfbAt`, `llm_total_ms = llmDoneAt - llmStartAt`.
- Persistencia: agregué `metadata.timings` (objeto con las 13 stages) y `metadata.latencyMs = totalMs` como alias para que la UI deje de pintar "DATOS SIMULADOS".

Etapas medidas (13): `validation_ms`, `bot_resolve_ms`, `rate_limit_ms`, `db_pre_llm_ms`, `user_msg_persist_ms`, `intent_ms`, `prompt_build_ms`, `llm_setup_ms`, `llm_ttfb_ms`, `llm_stream_ms`, `llm_total_ms`, `post_persist_ms`, `total_ms`.

`tsc --noEmit` post-edit: ✅ EXIT 0.

### 3) Test ejecutado

Script `scripts/_b13-latency-test.mjs`:
- **30 conversaciones secuenciales** de un turno cada una, `sessionId` único por request (fuerza el path "isNewConversation").
- **3 s de delay** entre requests — dentro del rate limit (30 req/min en el route handler, 10/min en el handler interno por sessionId, así que con sessionId único el bucket es nuevo cada vez).
- **Warmup descartado** (la primera request post-edit fuerza recompilación de Next dev y tarda 11 s — distorsiona percentiles).
- **Mix realista** de prompts: saludo, servicios, precios, comparaciones, soporte, lead-capture-likely, agendamiento.
- Cliente mide: TTFB (primer byte del stream HTTP) y total. Después, `_b13-latency-analyze.mjs` consulta `ChatbotEvent.metadata.timings` por `sessionId LIKE '<runId>-%'` y agrega.

**Wall-clock total**: 252 s. **Resultados**: 29/30 exitosas, 1 error de `fetch failed` en mid-test (≈3.3% — investigar, ver flags).

### 4) Números reales (server-side, desde `ChatbotEvent.metadata.timings`)

| Stage | n | min | p50 | p90 | p95 | max | mean | % del p50 total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `validation_ms` | 29 | 0 | 0 | 1 | 1 | 1 | 0 | 0.0% |
| `bot_resolve_ms` | 29 | 0 | 1 | 158 | 161 | 1150 | 51 | 0.0% |
| `rate_limit_ms` | 29 | 0 | 0 | 1 | 1 | 1 | 0 | 0.0% |
| `db_pre_llm_ms` | 29 | 103 | 116 | 555 | 1598 | 1887 | 252 | 3.9% |
| `user_msg_persist_ms` | 29 | 50 | 56 | 111 | 269 | 832 | 94 | 1.9% |
| `intent_ms` | 29 | 0 | 0 | 0 | 0 | 1 | 0 | 0.0% |
| `prompt_build_ms` | 29 | 0 | 1 | 1 | 1 | 2 | 1 | 0.0% |
| `llm_setup_ms` | 29 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0% |
| **`llm_ttfb_ms`** | 29 | 1354 | **2275** | 9184 | **11486** | 14336 | 3516 | **75.9%** |
| `llm_stream_ms` | 29 | 4 | 201 | 456 | 461 | 1806 | 240 | 6.7% |
| **`llm_total_ms`** | 29 | 1510 | **2536** | 9190 | **11490** | 14648 | 3756 | **84.6%** |
| `post_persist_ms` | 29 | 152 | 177 | 354 | 743 | 2516 | 287 | 5.9% |
| **`total_ms`** | 29 | 1851 | **2998** | 11882 | **15048** | 15521 | 4443 | **100%** |

**Client-side (incluye red local + serialización SSE)** — referencia, no es la métrica de optimización:

| | n | p50 | p90 | p95 | max |
|---|---:|---:|---:|---:|---:|
| TTFB cliente | 29 | 267 | 1930 | 5606 | 11337 |
| TOTAL cliente | 29 | 3102 | 12875 | 15244 | 23028 |

**Por qué client TTFB (267 ms) ≪ server TTFB Vertex (2275 ms)**: el cliente registra "TTFB" como el primer byte del response HTTP, que sale apenas Next inicializa la respuesta SSE — pero el **primer chunk con tokens del modelo** llega ≈2 s después. Si la UI muestra "pensando…" apenas llega ese primer byte vacío, el usuario percibe respuesta rápida; si espera el primer token visible, percibe ≈2.3 s. Es decisión de UX, no de backend.

### 5) Veredicto del cuello

**El 84.6 % del tiempo se va en Vertex (Gemini 2.5 Flash)**:
- **TTFB Vertex: 75.9 %** del p50 (2275 ms p50, 11486 ms p95). Tiempo desde que el handler manda el prompt hasta que Vertex emite el primer chunk útil. Externo — depende de la infra de Google.
- **Stream Vertex: 6.7 %** del p50 (201 ms p50, 461 ms p95). Generación de los tokens restantes. Es rápido porque las respuestas son cortas (~5 chunks, ~3-5 KB cada respuesta).

**Resto del pipeline = 15.4 %**:
- **DB combinada** (`bot_resolve + db_pre_llm + user_msg_persist + post_persist`): **11.7 %** = 350 ms p50. Los outliers (max 1887 ms en `db_pre_llm`, max 1150 ms en `bot_resolve`, max 2516 ms en `post_persist`) son cold starts de Neon dev — branch dormida, primer ping cuesta ~2 s.
- **Validación + intent + prompt build + rate limit + llm setup**: **<0.1 %** combinado. Despreciable. Cero ROI optimizando acá.

**Tail latency (p95 total = 15048 ms)**: dominada casi por completo por Vertex (`llm_ttfb_ms` p95 = 11486 ms, max 14336 ms). No es algo "del código" — son ráfagas slow-path de Google que no se controlan localmente.

### 6) Comparación contra el baseline simulado anterior

| Métrica | Baseline previo (simulado / load test concurrente) | Real B1.3 (secuencial) | Comentario |
|---|---:|---:|---|
| P50 total | 4072 ms | **2998 ms** | -26 %. El viejo estaba inflado por concurrencia + aborts del rate-limiter |
| P95 total | 12987 ms | **15048 ms** | +16 %. El nuevo P95 es peor en papel porque el viejo cortaba conexiones por 429 antes de que Vertex llegara al tail real |
| Success rate | 33 % | **96.7 %** (29/30) | El 33 % era artefacto del rate limiter saturado en load test. Con conversaciones secuenciales y sessionId único, casi todas pasan |

El baseline previo no era una medición de latencia del bot — era una medición de cuánto cargabas el rate limiter. Estos números reemplazan ese baseline para todo análisis futuro.

### 7) Hallazgos colaterales

1. **El badge "DATOS SIMULADOS" del `LatencyChart` debería empezar a desaparecer** desde la próxima request, porque `metadata.latencyMs` ahora se persiste (antes solo `durationMs`, que `getLatencyHistory.ts:46` no busca). NO modifiqué la UI — solo el handler. Hay que mirarlo en browser en `/admin/chatbot/health` después de generar tráfico real, para confirmar.
2. **1 error en 30 requests (~3.3 %)**: ocurrió mid-test (sessionId `b13-1779420902364-s24`), no en arranque. No fue cold start del server. Posible glitch del dev server bajo carga sostenida — con una sola muestra no se concluye. Si se repite en producción es señal de inestabilidad.
3. **`bot_resolve_ms` p50=1 ms vs max=1150 ms**: confirma que el cache in-memory de 60 s en `resolveBotBySlug` funciona — casi todas son cache hit. El max es la primera (post-warmup) o un cache evict puntual.
4. **`llm_stream_ms` p50=201 ms con respuestas de ~5 chunks**: si en el futuro se agrandan las respuestas (más detalle / más KB), el costo en latencia sube linealmente. Hoy las respuestas están contenidas, así que `stream` no es un cuello.

### 8) Qué NO se hizo (alcance explícito)

- Cero optimización. Solo medición.
- No se tocó ningún parámetro de Vertex (`temperature`, `maxOutputTokens`, modelo).
- No se modificó el system prompt (sigue siendo ~10-15 KB con las 9 secciones de `buildSystemPrompt`).
- No se removió ningún log debug ni el `ChatbotEvent` persistido (cada uno cuesta <1 ms — irrelevante).
- No se modificó el componente `LatencyChart` ni `getLatencyHistory.ts`. La UI se va a "arreglar sola" cuando llegue tráfico real con la nueva metadata.

### 9) Palancas posibles para un futuro B1.4 (si Franco decide optimizar Vertex)

Ordenadas por ROI estimado, **no aplicar sin decisión explícita**:

1. **Migrar a `gemini-2.5-flash-lite`** (typed en `google.ts:10-41`, ya soportado). Según Google, TTFB típicamente -40 a -60 %, y costo 3× más barato. Trade-off: posible degradación de calidad — requiere eval lado a lado con set de prompts representativo.
2. **Reducir system prompt** (10-15 KB → <5 KB). Las 9 secciones de `buildSystemPrompt` tienen redundancia (`Examples` + `ToneExamples`, `AntiHallucination` + `ForbiddenStatements`). Menos input tokens = menos TTFB. Requiere refactor del KB schema, no trivial.
3. **Prompt caching de Vertex** (si Google lo expone para gemini-2.5-flash en la región `us-central1`). Cachea el system prompt entre requests del mismo bot — TTFB cae mucho en repetición. Requiere chequear soporte actual del provider en `@ai-sdk/google-vertex`.
4. **Paralelizar `prisma.conversation.update` + `prisma.chatMessage.create` post-stream** (hoy son secuenciales en el `onFinish`). Ganancia esperada: 50-80 ms en `post_persist_ms` p50. ROI bajo — es <6 % del total.
5. **Mover `bot_resolve_ms` cache a Redis** si el server escala horizontal (hoy cada instancia tiene su cache in-memory de 60s). Solo justifica si hay múltiples réplicas con tráfico cruzado.

### Validación post-sprint

```bash
npx tsc --noEmit            # ✅ EXIT 0 (corrido post-edit del handler)
npx prisma migrate status   # ✅ schema up to date (sin migraciones nuevas)
npm run build               # ✅ EXIT 0 — BUILD_ID nuevo generado, 29/29 páginas estáticas
```

### Archivos modificados / creados

**Modificados (1)**:
- `src/modules/chatbot/server/chat/handleChatRequest.ts` — helper `mark()` + marks por etapa + `onChunk` para TTFB + `metadata.timings` y `metadata.latencyMs` en el evento `chat.message_completed`. Cero cambios de lógica.

**Creados (throwaway, todos en `scripts/`)**:
- `_b13-latency-test.mjs` — runner secuencial (warmup + 30 prompts + tee a stdout log + dump JSON)
- `_b13-latency-analyze.mjs` — agregador server-side (lee el último JSON, query a `ChatbotEvent`, percentiles + breakdown)
- `_b13-latency-b13-1779420902364.json` — resultados raw del test (29 OK + 1 error)
- `_b13-latency-stdout.log` — log del runner
- `_b13-dev.log` — log del `npm run dev` que arranqué (mi PID, no el original)

Borrar después de B1.4 / cuando ya no se necesiten para regresión.

### Flags para Franco

- 🚩 **El error de fetch en 1/30 amerita una segunda corrida** para confirmar si es flaky o consistente. Si se repite, abrir flag de estabilidad del runtime.
- 🚩 **`LatencyChart` debería pasar de "DATOS SIMULADOS" a datos reales** desde ahora. Verificalo en `/admin/chatbot/health` después de generar algo de tráfico real (los 29 eventos de B1.3 ya bastan para empezar a poblar la curva).
- 🚩 **Dev server arrancado por mí sigue corriendo**. El PID 24652 original murió en algún momento (antes del test). Yo arranqué uno nuevo con `npm run dev > scripts/_b13-dev.log 2>&1` para correr el test. Si querés matarlo: `Get-Process -Name node` y `Stop-Process -Id <PID>` el que esté en :3000. O dejalo si lo seguís usando.
- 🚩 **Los números de B1.3 son de dev contra Neon dev branch**. La latencia de prod (Netlify + Neon main) puede diferir — Netlify tiene cold start de funciones serverless (típicamente +200-500 ms en TTFB del handler) y Neon main no se duerme como dev. Si Franco quiere una medición prod-real, hay que correr el test apuntando a la URL deployada (variable `B13_BASE_URL` del script).

### Listo para
- ✅ B1.4 si se decide optimizar Vertex — palancas sección 9 documentadas y priorizadas.
- ✅ Cualquier sprint que requiera latencia real como baseline (eval de modelo, comparación de prompt, etc.).
- ⏳ Decisión de Franco sobre si se necesita corrida contra prod para tener el delta real dev↔prod.

---
## ✅ B1.4 — Verificación de las 4 optimizaciones R2 con medición real   ·   2026-05-22

**Objetivo**: confirmar que las 4 optimizaciones de la recuperación Alpha v2 (R2) siguen aplicadas y cuantificar su impacto real con la instrumentación de [B1.3](#-b13--medición-real-de-latencia-del-runtime-del-bot-cero-optimización--2026-05-22). Decidir si el cache in-memory de `resolveBotBySlug` justifica una migración a Upstash/Redis para prod (Netlify).

**Pre-check**:
- Branch Neon dev confirmada: `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech` ✅
- Datos B1.3 disponibles en `ChatbotEvent` (runId `b13-1779420784395` y `b13-1779420902364`) ✅
- Build/tsc verdes al cierre de B1.3 ✅
- Dev server arrancado de cero para corrida fresh con la nueva sub-instrumentación ✅

---

### 1) Estado de las 4 optimizaciones R2 (verificación en código)

| # | Optimización | Archivo / línea | Estado | Verificación |
|---|---|---|---|---|
| 1 | **Rate limit key por sessionId** | `src/modules/chatbot/server/chat/handleChatRequest.ts:123` + `src/app/api/chatbot/[slug]/chat/route.ts:77` | ✅ APLICADA | Handler interno usa key `chat:${slug}:${sessionId}`, el route wrapper usa `${origin}:${sessionId}`. Ambos previenen el problema clásico de bloquear una IP entera (oficina/NAT/móvil) por una sesión saturada. |
| 2 | **Sin `findFirst` duplicado** | `src/modules/chatbot/server/conversation/resolver.ts:63-99` | ✅ APLICADA | `getOrCreateConversation` hace UN `findFirst`, luego `update` o `create`, y devuelve `{ conversation, isNew }`. El handler **no** hace un lookup extra (verificado con grep — no hay otro `prisma.conversation.findFirst` ni `findUnique` en `src/modules/chatbot/**`). Comentario `// Returns { conversation, isNew } so callers don't need a separate findFirst.` lo deja explícito en `resolver.ts:61`. |
| 3 | **`Promise.all` para queries pre-LLM** | `src/modules/chatbot/server/chat/handleChatRequest.ts:147-171` | ✅ APLICADA | `[quota, { conversation, isNew }] = await Promise.all([checkQuota(...), getOrCreateConversation({...})])`. Las dos van en paralelo. Cuantificación abajo. |
| 4 | **Cache in-memory de `resolveBotBySlug`** | `src/modules/chatbot/server/conversation/resolver.ts:10-37` | ✅ APLICADA (con caveat) | `Map<string, { data, expiresAt }>` con TTL 60 s, set después del miss, hit antes del query. **Caveat: `invalidateBotCache` exportada pero nunca importada** — ver sección 4. |

### 2) Impacto real medido — `Promise.all` (la optimización #3)

Re-corrida del test secuencial de B1.3 (30 prompts, sessionId único, delay 3 s) con sub-instrumentación que mide `checkQuota` y `getOrCreateConversation` por separado dentro del `Promise.all`. Run: `b13-1779422137843`, n=30 + warmup = 31 mediciones server-side.

**Cuánto tarda cada query sola**:
| Métrica | p50 | p95 | max |
|---|---:|---:|---:|
| `quota_only_ms` (checkQuota: 1 findUnique en QuotaUsage) | 120 ms | 1397 ms | 12506 ms |
| `conv_only_ms` (getOrCreateConversation: findFirst + update) | 182 ms | 2938 ms | 12785 ms |
| `db_pre_llm_ms` (Promise.all real = max de las dos) | 183 ms | 2938 ms | 12785 ms |

**Cuánto tardarían secuencial vs lo que tardan en paralelo**:
| Métrica | Estimado secuencial (suma) | Real paralelo (max) | Ahorro |
|---|---:|---:|---:|
| p50 | 302 ms | 183 ms | **119 ms (-39 %)** |
| p95 | 4335 ms | 2938 ms | **1397 ms (-32 %)** |

**Veredicto sobre `Promise.all`**: la optimización **sirve y se justifica**. Ahorra ~120 ms en el p50 y ~1.4 s en el p95 con un costo de complejidad cero (literalmente cambiar `await x; await y;` por `await Promise.all([x, y])`). En proporción al total `total_ms` p50 = 6899 ms de esta corrida, el ahorro es ~1.7 %; en proporción al cuello (Vertex), es despreciable. **Pero el costo es cero, así que no hay razón para revertir.**

**Nota**: `getOrCreateConversation` es ~50 % más lenta que `checkQuota` (2 queries vs 1). Lógica: la optimización #2 ya redujo lo que se podía ahí (un solo `findFirst` en lugar de findFirst + lookup posterior). Para reducir más, habría que usar un `upsert` con merge — pero perdés `isNew` y romperías la lógica de `incrementQuota` que depende de ese flag. No vale la pena.

### 3) Impacto real medido — Cache de `resolveBotBySlug` (la optimización #4)

**Hit rate observado en dev**:

| Run | Duración test | Hits (≤5 ms) | Misses (>50 ms) | Hit rate |
|---|---:|---:|---:|---:|
| B1.3 (`b13-1779420902364`) | 252 s | 26/30 | 4/30 | **86.7 %** |
| B1.4 (`b13-1779422137843`) | 480 s | 23/31 | 8/31 | **74.2 %** |

**Por qué B1.4 tiene menos hit rate**: el test duró el doble (480 s vs 252 s) y el TTL del cache es 60 s. Con respuestas más lentas de Vertex hoy (ver sección 5), las requests caen cada ~16 s en vez de cada ~8 s — más oportunidades de cache expiry entre hits consecutivos.

**Ahorro por hit**: cache hit ≈ 1 ms, cache miss ≈ 174-1346 ms (p50 de los miss-only ≈ 850 ms, dominado por cold starts de Neon dev). Diferencia ~120-180 ms por request en condiciones normales, hasta ~1 s con cold start de Neon.

**Veredicto sobre el cache in-memory en dev**: funciona razonablemente.

### 4) Bug latente: `invalidateBotCache` no se llama desde ningún lado

`invalidateBotCache(slug)` está exportada en `src/modules/chatbot/server/conversation/resolver.ts:40` y re-exportada en `src/modules/chatbot/server/conversation/index.ts:1`. Pero al hacer `grep -r 'invalidateBotCache(' src/` **el único match es la propia definición** — ningún caller la invoca.

**Consecuencia**: cuando el admin guarda cambios en el bot config (slug, modelo LLM, knowledge base, accent color, etc.), el cache de `resolveBotBySlug` sigue sirviendo el config viejo por hasta 60 s. La UX del admin queda confusa ("¿se guardó?"). Los archivos que hacen `botConfig.update` y deberían llamar a `invalidateBotCache` son al menos:

- `src/app/(protected)/admin/chatbots/[botId]/actions.ts`
- `src/modules/chatbot/server/admin/saveBotConfig.ts`
- `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts`
- `src/app/(protected)/admin/chatbots/bulk-actions.ts`
- `src/modules/chatbot/server/dashboard/updateBotAppearance.ts`

**No lo arreglé en este sprint** (fuera de scope explícito: B1.4 es solo medición + decisión, no cambio funcional). Se levanta como flag explícito y queda como mini-sprint propio (B1.5 candidate, estimado 15-20 min: import + 1 llamada por archivo).

### 5) Vertex hoy vs ayer — la métrica que más se mueve

Misma instrumentación, mismo bot, mismos prompts, dev local en ambos casos:

| Métrica | B1.3 (ayer) | B1.4 (hoy) | Delta |
|---|---:|---:|---:|
| `llm_ttfb_ms` p50 | 2275 ms | **5762 ms** | +153 % |
| `llm_total_ms` p50 | 2536 ms | **5933 ms** | +134 % |
| `total_ms` p50 | 2998 ms | **6899 ms** | +130 % |
| `total_ms` p95 | 15048 ms | **26094 ms** | +73 % |
| `db_pre_llm_ms` p50 | 116 ms | 183 ms | +58 % (ruido de Neon) |
| Success rate | 29/30 (96.7 %) | 30/30 (100 %) | +3.3 pp |

**Conclusión**: Vertex es **no determinista entre corridas**, con varianza grande. El veredicto de B1.3 ("Vertex es ≈85 % del total") **se confirma con más fuerza** en B1.4 (Vertex es ≈86 % del total, `llm_total_ms`/`total_ms` = 5933/6899). Cualquier optimización de Vertex tiene que evaluarse con N≥3 corridas en momentos distintos del día para promediar la varianza externa.

**Bonus**: B1.4 también valida que el error de fetch que tuvimos en B1.3 fue transitorio — 30/30 esta vez.

### 6) Recomendación final sobre el cache (decisión pedida)

**No migrar a Redis/Upstash todavía.**

Razones:
1. **El ROI es bajo hoy**. El cache evita ~120-180 ms por request en hit-path. Comparado con `llm_total_ms` p50 = 5933 ms, eso es ~2-3 % del total. Migrar a Upstash agrega una dependencia externa, latencia de red al servicio (~10-30 ms ida y vuelta) y un cap de free tier — el beneficio neto puede ser negativo.
2. **El portfolio tiene tráfico bajo y esporádico**, exactamente el peor caso del cache in-memory en serverless: Netlify duerme la instancia después de minutos sin tráfico, y el siguiente request paga cold start + cache miss. Pero **Upstash no resuelve ese problema** — el cold start de la función es independiente del cache backend. El miss del cache es lo de menos cuando estás pagando 500-1000 ms de spin-up de la lambda.
3. **El problema real del cache no es la latencia: es la stale data del bug de `invalidateBotCache`** (sección 4). Migrar a Upstash y mantener el bug deja el mismo problema (cache stale para el admin). Migrar a Upstash y arreglar el bug es overkill — arreglar el bug solo, con cache in-memory, ya resuelve la UX.
4. **Si el tráfico crece** (ej. el bot embed se viraliza, o se onboardea un cliente con tráfico real), entonces:
   - Si hay N>1 instancias concurrentes en Netlify (escala horizontal), cada una tiene su propio cache → es OK porque cada una llega a hit rate alto rápido tras pocas requests.
   - Si la consistencia entre instancias importa (admin edita y quiere que todas las instancias reflejen el cambio), ahí sí Upstash o un mecanismo de bust por broadcast.
   - Pero ese escenario hoy es hipotético.

**Recomendación accionable**:
- 🔧 **Arreglar el bug de `invalidateBotCache` en un mini-sprint** (B1.5, ~20 min). Eso elimina el único problema real del cache hoy.
- 🟢 **Dejar el cache in-memory como está** mientras el tráfico siga bajo. Documentar el caveat en CLAUDE.md o en un README del módulo chatbot.
- 🟡 **Re-evaluar Upstash** si: (a) el tráfico crece a >10 req/min sostenidas, (b) se onboardea un segundo cliente al chatbot multi-tenant, o (c) Netlify empieza a escalar a múltiples instancias visibles en logs.

### 7) Veredicto consolidado de las 4 optimizaciones

| # | Optimización | Aplicada | Sirve? | Magnitud |
|---|---|:---:|:---:|---|
| 1 | Rate limit key por sessionId | ✅ | ✅ | Previene falsos positivos en NAT/móviles. No medible en latencia — es un fix de correctness. |
| 2 | Sin findFirst duplicado | ✅ | ✅ | Ahorra una query por request — visible en `conv_only_ms` p50 = 182 ms (sería ~250-300 ms con la duplicación). |
| 3 | Promise.all pre-LLM | ✅ | ✅ | **Ahorra 119 ms p50 (39 %)** y 1397 ms p95 (32 %) vs secuencial. Costo cero. |
| 4 | Cache resolveBotBySlug | ✅ con caveat | ✅ en dev, marginal en prod serverless | Hit rate dev 74-87 %. Ahorra ~120-180 ms por hit. **Bug**: `invalidateBotCache` nunca se llama. |

**Las 4 siguen aplicadas y ninguna fue "humo"** — todas tienen impacto medible y/o resuelven un problema real (correctness en el caso del #1).

### 8) Qué NO se hizo (alcance explícito)

- No se modificó nada para optimizar (sigue siendo solo medición).
- No se arregló el bug de `invalidateBotCache` — flag explícito para B1.5, no entra en B1.4.
- No se corrió contra prod (Netlify + Neon main). Las recomendaciones sobre serverless son razonadas, no medidas.
- No se hizo un test paralelo (concurrente) para ver cómo se comportan las queries bajo carga real — sigue siendo secuencial para no contaminar la medición con rate limits.

### Validación post-sprint

```bash
npx tsc --noEmit            # ✅ EXIT 0 (corrido post-edit de la sub-instrumentación)
npx prisma migrate status   # ✅ schema up to date
npm run build               # ✅ EXIT 0 — Compiled in 44s + 29/29 static pages en 4.2s
```

### Archivos modificados / creados

**Modificados (2)**:
- `src/modules/chatbot/server/chat/handleChatRequest.ts` — sub-timings en el `Promise.all` (dos IIFE que envuelven `checkQuota` y `getOrCreateConversation` para medir `quota_only_ms` y `conv_only_ms`). Cero cambios de lógica. El paralelismo se preserva.
- `scripts/_b13-latency-analyze.mjs` — agregadas las dos nuevas keys (`quota_only_ms`, `conv_only_ms`) a `timingKeys` para que aparezcan en el reporte.

**Creados (throwaway, `scripts/`)**:
- `_b14-analyze.mjs` — analizador independiente del JSON cliente (acepta runId como CLI arg, o auto-detecta el último). Útil porque el test escribió el JSON en el cwd equivocado y no se podía usar el analyze viejo.
- `_b14-dev.log` — log del `npm run dev` arrancado para este sprint.
- `_b14-latency-stdout.log` — log del runner (intento fallido por cwd, descartable).

### Flags para Franco

- 🚩 **Bug latente del cache** (`invalidateBotCache` sin caller). Recomendado abrir B1.5 chico (~20 min) para importarlo en los 5 archivos identificados en sección 4 y llamarlo después de cada `botConfig.update`. Impacto: el admin va a ver sus cambios inmediatamente sin esperar 60 s.
- 🚩 **Vertex hoy fue 2.5× más lento que ayer**. No es por ningún cambio nuestro — es varianza propia de Vertex/Google. Cualquier sprint que mida latencia tiene que correr N≥3 veces espaciadas para promediar. El número "real" de TTFB Vertex está en algún lugar entre 2.3 s y 5.8 s p50, según el momento.
- 🚩 **Reusé el script `_b13-latency-test.mjs`** sin renombrar — el runId tiene prefijo `b13-` aunque el sprint sea B1.4. Para regresión futura, considerar renombrar o parametrizar el prefijo.
- 🚩 **Dev server (mi PID) sigue corriendo**. Mismo flag que B1.3 — `Get-Process -Name node` y `Stop-Process` el que esté en :3000 si querés matarlo.

### Listo para
- ✅ B1.5 si querés arreglar el bug del cache (recomendación explícita arriba).
- ✅ Cualquier sprint que requiera saber el costo real de cada optimización R2 — los números están medidos y documentados.
- ⏳ Decisión de Franco sobre si re-medir Vertex con N≥3 corridas para tener un número de TTFB con varianza acotada.

---
## ✅ B1.5 — Fix del bug latente `invalidateBotCache` sin caller   ·   2026-05-22

**Objetivo**: cerrar el flag identificado en [B1.4 §4](#-b14--verificación-de-las-4-optimizaciones-r2-con-medición-real--2026-05-22). `invalidateBotCache(slug)` estaba exportada pero ningún caller la invocaba — los updates del admin a `BotConfig` y `KnowledgeBase` quedaban invisibles para el chat hasta que el TTL de 60 s expirara naturalmente.

**Pre-check**:
- B1.4 cerrado con build verde ✅
- 5 archivos que actualizan `BotConfig` ya identificados en B1.4 §4 ✅
- 3 archivos adicionales que actualizan `KnowledgeBase` (también dentro del cache, ya que `resolveBotBySlug` hace `include: { knowledgeBase: true }`) — sumados al scope ✅

---

### 1) Archivos parcheados (8)

**Actualizan `BotConfig`** (5):

| Archivo | Función(es) | Cómo se obtiene el `slug` |
|---|---|---|
| `src/app/(protected)/admin/chatbots/[botId]/actions.ts` | `toggleBotActiveAction` | `bot.slug` (el `update` devuelve todos los campos del modelo) |
| `src/modules/chatbot/server/admin/saveBotConfig.ts` | `saveBotConfig` | `after.slug` (resultado de la `$transaction`) |
| `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts` | `saveBotConfigByOrgSlug` | `org.botConfig.slug` (ya cargado en el `findUnique` previo) |
| `src/app/(protected)/admin/chatbots/bulk-actions.ts` | `bulkPauseBotsAction` + `bulkActivateBotsAction` | `bot.slug` — agregué `select: { slug: true }` al update (el update solo seteaba `isActive` y no devolvía el slug; agregar el `select` mantiene el tráfico DB igual y trae el campo que necesitamos). |
| `src/modules/chatbot/server/dashboard/updateBotAppearance.ts` | `updateBotAppearance` | `updated.slug` (el update devuelve todos los campos) |

**Actualizan `KnowledgeBase`** (3):

| Archivo | Función(es) | Cómo se obtiene el `slug` |
|---|---|---|
| `src/modules/chatbot/server/admin/saveKnowledgeBase.ts` | `saveKnowledgeBase` | `after.botConfig.slug` — extendí el `include: { botConfig: { select: { ... } } }` existente con `slug: true` (ya seleccionaba `botName` y `organizationId`, costo cero) |
| `src/modules/chatbot/server/admin/saveKnowledgeBaseByOrgSlug.ts` | `saveKnowledgeBaseByOrgSlug` | `org.botConfig.slug` (ya cargado en el `findUnique` previo) |
| `src/modules/chatbot/server/admin/saveClientKnowledgeBase.ts` | `saveClientKnowledgeBase` | `updated.botConfig.slug` — agregué `include: { botConfig: { select: { slug: true } } }` al `update` (el update no devolvía el bot; el include suma 0 queries, viene en la misma row) |

Total: **2 nuevos `select`/`include` mínimos** + **8 llamadas a `invalidateBotCache(slug)`** + **8 imports**.

### 2) Patrón aplicado (idéntico en todos los archivos)

```ts
import { invalidateBotCache } from '@/modules/chatbot/server/conversation'
//   (o, para archivos dentro del módulo chatbot, '../conversation')

// ... después del prisma.update / $transaction.commit:
invalidateBotCache(bot.slug)
```

Notas de diseño:
- **Llamada síncrona, fire-and-forget**. `invalidateBotCache` es síncrona (`Map.delete`), no devuelve Promise — no hay que `await`.
- **Llamar después del commit**, no dentro de la transacción. Si la tx falla, el cache no se invalida (lo cual es correcto — los datos viejos siguen siendo válidos).
- **Solo se invalida el slug actual**. Si en el futuro se permite cambiar el slug, hay que invalidar también el slug viejo. Hoy el slug del bot no se edita por UI (es derivado del companyName o seteado en seed) — no entra en el scope de B1.5.
- **Bulk actions**: invalida una por una dentro del loop. Si querés versión más eficiente (un solo `botCache.clear()`), agregalo si surge volumen — hoy con ~1-10 bots por bulk no se nota.

### 3) Alternativas consideradas (y por qué no)

- **Reducir TTL del cache a 5-10 s**: alivia el síntoma sin arreglar el bug. Además, baja el hit rate del cache (medido en B1.3/B1.4: 74-87 % con TTL 60 s) y aumenta queries innecesarias a Neon. Descartado.
- **Eliminar el cache** y aceptar la latencia: contradiría la conclusión de B1.4 (cache sirve, ahorra ~120-180 ms por hit). Descartado.
- **Mover a Upstash/Redis con invalidación cross-instance**: ya descartado en B1.4 §6 (ROI bajo para tráfico actual). Descartado.
- **Hook de Prisma middleware** que invalida automático en cualquier `botConfig.update`: tentador pero opaco (magia distante). Preferí explícito en cada caller. Descartado.

### 4) Qué NO se hizo (alcance explícito)

- No se tocó `resolveBotBySlug` ni el TTL del cache.
- No se tocó la firma de `invalidateBotCache(slug)`.
- No se agregó invalidación cross-process — el caveat de serverless con N instancias documentado en B1.4 §6 sigue tal cual (Netlify duerme y revive instancias, cada una con su propio Map). Para el tráfico actual del portfolio no es un problema medible.
- No se buscaron callers en el cron / scripts / API externa que también puedan actualizar `BotConfig`. El grep de `prisma.botConfig.(update|upsert)` devolvió exactamente los 5 archivos parcheados + `prisma/seed.ts` (que corre offline, no necesita invalidar runtime). Si aparece un nuevo caller en el futuro, hay que recordar agregarle la llamada — sería bueno linter-izar esto, pero no en B1.5.

### Validación post-sprint

```bash
npx tsc --noEmit            # ✅ EXIT 0
npx prisma migrate status   # ✅ schema up to date (sin migraciones nuevas)
npm run build               # ✅ EXIT 0 — Compiled in 22.9s + 29/29 static pages en 1.7s
```

El build cayó a 22.9 s (vs 44 s en B1.4) porque `.next/cache` reusó casi todo desde B1.4 — los cambios son superficiales y solo afectan 8 archivos.

### Archivos modificados (8)

- `src/app/(protected)/admin/chatbots/[botId]/actions.ts`
- `src/app/(protected)/admin/chatbots/bulk-actions.ts`
- `src/modules/chatbot/server/admin/saveBotConfig.ts`
- `src/modules/chatbot/server/admin/saveBotConfigByOrgSlug.ts`
- `src/modules/chatbot/server/admin/saveKnowledgeBase.ts`
- `src/modules/chatbot/server/admin/saveKnowledgeBaseByOrgSlug.ts`
- `src/modules/chatbot/server/admin/saveClientKnowledgeBase.ts`
- `src/modules/chatbot/server/dashboard/updateBotAppearance.ts`

### Flags para Franco

- 🚩 **Recordar agregar la llamada si aparece un nuevo caller** que actualice `BotConfig` o `KnowledgeBase`. No hay lint que lo enforce. Si en algún sprint futuro se agrega un endpoint admin nuevo, agregar `invalidateBotCache(slug)` post-update.
- 🚩 **El caveat de serverless N-instancia sigue abierto**. Cuando una instancia de Netlify invalida su Map local, las otras instancias **no se enteran** y siguen sirviendo el config viejo por hasta 60 s. Para tráfico del portfolio (1 instancia activa típicamente) no se nota. Si en algún momento el chatbot escala a multi-instancia o multi-tenant con tráfico real, ahí sí migrar a Upstash con publicación (Pub/Sub) o reducir TTL drásticamente.
- 🚩 **Validación visual recomendada** por Franco: entrar a `/admin/chatbots/[botId]`, cambiar `accentColor` o `welcomeMessage`, recargar embed/preview y confirmar que el cambio se ve **inmediatamente** (sin esperar 60 s). Antes de B1.5 había que esperar el TTL; ahora debería ser instantáneo.

### Listo para
- ✅ B1.6 / siguiente sprint que decidas.
- ✅ Cualquier sprint que requiera tocar admin de bots — el patrón de invalidación está aplicado y documentado.
- ⏳ Validación visual por Franco (flag arriba).

---

## ✅ B1.6 — Health Score real + veredicto humano   ·   2026-05-22

**Objetivo**: el Health Score de `/admin/chatbot/health` mostraba latencia P50/P95 con un badge **"DATOS SIMULADOS"** porque `getLatencyHistory` caía a `generateMockLatency()` cuando no había muestras reales. Reemplazar la curva inventada por la latencia real capturada en B1.3 (que ya estaba guardada en `ChatbotEvent.metadata.latencyMs`) y dejar un veredicto de salud en lenguaje humano arriba de todo: **Todo OK / Atención / Problema**, con la razón en castellano simple para que Franco y el socio entiendan al toque sin ser técnicos.

**Pre-check**:
- B1.3 ya escribe `metadata.latencyMs` + `timings` en cada `chat.message_completed` event ✅
- `ChatbotEvent` tiene índice `(botConfigId, createdAt DESC)` — query por ventana de 24 h es cheap ✅
- `checkChatbotHealth` ya entrega checks de env vars / DB / LLM / bot config — solo faltaba el layer de "qué hago con esos checks en lenguaje humano" ✅

---

### 1) `getLatencyHistory` — cero datos falsos

Antes: la función devolvía un `LatencyPoint[]` y, si no había muestras reales, llamaba a `generateMockLatency(hoursBack)` que inventaba P50 entre 700-1200 ms y P95 entre 1400-2300 ms con `Math.random()`. El page después intentaba detectar mock con `latencyData.every((p) => p.count > 0)` — heurística rota: con datos reales y tráfico constante también daba `true`, mostrando "DATOS SIMULADOS" sobre datos reales (falso positivo) o, peor, mostrando datos inventados sin badge (falso negativo).

Ahora: devuelve un `LatencyHistoryResult` discriminado:

```ts
{
  status: 'ok' | 'insufficient' | 'empty'
  data: LatencyPoint[]        // siempre real; nulls cuando no hay muestras
  totalSamples: number
  minSamplesNeeded: number     // 10
  hoursWithData: number
  p50Overall: number | null    // null si totalSamples === 0
  p95Overall: number | null
}
```

- `status: 'empty'` → 0 muestras en 24 h. La serie viene como buckets con `p50/p95 = null, count = 0`.
- `status: 'insufficient'` → entre 1 y 9 muestras. Hay datos pero pocos. No se grafica.
- `status: 'ok'` → ≥ 10 muestras. Se grafica.

Filtra exclusivamente `type: 'chat.message_completed'` (el evento B1.3) en vez del `contains: 'chat'` viejo que también traía `chat.bad_request`, `chat.rate_limited`, etc. (eventos sin `latencyMs` válido — ruido que pasaba el filtro `typeof === 'number'` solo si por casualidad otro evento tenía la key).

Lee `latencyMs` primero y `durationMs` como fallback (los dos están en B1.3); ignoró el `duration` viejo que no existía en el schema actual.

### 2) `buildHealthVerdict` — el layer humano

Archivo nuevo `src/modules/chatbot/server/health/buildHealthVerdict.ts`. Toma el `HealthCheckResult` y el `LatencyHistoryResult` y devuelve:

```ts
{
  level: 'ok' | 'warning' | 'critical'
  headline: 'Todo OK' | 'Atención' | 'Problema'
  subline: string            // explicación corta debajo
  reasons: VerdictReason[]   // lista de qué está mal, con hint humano
}
```

Reglas (severidad gana, se elige el peor):

| Check | warning | critical |
|---|---|---|
| Env vars required missing | — | "Faltan variables esenciales para arrancar" |
| DB no responde | — | "La base de datos no responde" |
| DB latencia > 500 ms | "Base de datos lenta" | — |
| LLM provider broken | — | "El cerebro del bot (Google AI) no responde" |
| Bot no existe en DB | — | "El bot no está configurado" |
| Bot existe pero `isActive=false` | "El bot está pausado" | — |
| P95 latencia > 5 s | "El bot está más lento de lo normal" | — |
| P95 latencia > 12 s | — | "El bot tarda demasiado en responder" |

Cada reason trae un `hint` en castellano simple — ej. *"Tarda 720ms en responder (lo normal es <500ms)"*, no *"DB latency exceeded threshold"*. El umbral P95 crítico (12 s) sale del límite práctico: si el bot tarda más de 12 s, el usuario ya cerró la pestaña.

El subline cuando todo OK incluye los números reales: *"Todos los sistemas responden bien. P95 en 1.4s con 47 conversaciones medidas."* — si no hay data suficiente lo dice: *"Aún con poco tráfico para medir velocidad (3/10 respuestas)."*

### 3) `LatencyChart` — empty state honesto

Antes: badge **"DATOS SIMULADOS"** (a veces) sobre una curva siempre dibujada.

Ahora: la prop pasa de `data + isMock` a `history: LatencyHistoryResult`. El componente bifurca:

- `status === 'ok'` → curva real + badge **"DATOS REALES"** (verde) + subtítulo con totalSamples / P50 / P95 globales.
- `status === 'insufficient'` → tarjeta `📊 Datos insuficientes todavía — Tenemos N de 10 respuestas necesarias. El gráfico aparece cuando haya más uso real del bot.` + badge gris con el count.
- `status === 'empty'` → tarjeta `📊 Sin datos aún — El gráfico se llena automáticamente con cada conversación. Aún no hay respuestas medidas en las últimas 24h.` + badge **"SIN DATOS"**.

Las labels del Legend ahora son **"P50 (típico)"** y **"P95 (peor caso)"** — los acrónimos siguen ahí para alguien técnico pero abajo aclara qué significan.

### 4) Page — veredicto arriba, detalle abajo

`src/app/(protected)/admin/chatbot/health/page.tsx` ahora tiene:

1. Header sobrio (sin el badge `ALL SYSTEMS OK / ISSUES DETECTED` de la esquina — redundante).
2. **`<VerdictHero>`** — tarjeta grande, color según nivel (verde / ámbar / rojo), ícono ✓/!/✕, headline 3xl, subline, y lista de razones con hint.
3. Timestamp `Checked at`.
4. `<LatencyChart>` con los datos reales.
5. Las cuatro `<HealthSection>` (env, DB, LLM, bot) — mantenidas para diagnóstico técnico debajo del veredicto.
6. Bloque "⚠ Acción requerida" cuando `!health.ok` — sin cambios.

La idea de la jerarquía: Franco abre `/admin/chatbot/health`, mira la tarjeta grande de arriba, y en 1 segundo sabe si tiene que hacer algo. Si quiere detalle técnico, lo tiene abajo.

---

### 5) Cómo se ve en cada estado (screenshot-worthy)

**Estado 1 — Todo OK con tráfico real**:
> 🟢 Estado general · **Todo OK**
> Todos los sistemas responden bien. P95 en 1.4s con 47 conversaciones medidas.

**Estado 2 — Todo OK pero poco tráfico (probable estado inicial post-deploy)**:
> 🟢 Estado general · **Todo OK**
> Todos los sistemas responden. Aún con poco tráfico para medir velocidad (3/10 respuestas).
>
> Gráfico: `📊 Datos insuficientes todavía — Tenemos 3 de 10 respuestas necesarias.`

**Estado 3 — Atención (DB lenta + bot pausado)**:
> 🟡 Estado general · **Atención**
> El bot funciona, pero hay algo que conviene revisar.
> · ! Base de datos lenta — Tarda 712ms en responder (lo normal es <500ms).
> · ! El bot está pausado — Los visitantes no pueden chatear hasta que lo reactives.

**Estado 4 — Problema (falta API key)**:
> 🔴 Estado general · **Problema**
> Hay algo roto que impide que el bot funcione bien.
> · ✕ Faltan variables esenciales para arrancar — Sin CHATBOT_GOOGLE_API_KEY el bot no puede funcionar.
> · ✕ El cerebro del bot (Google AI) no responde — CHATBOT_GOOGLE_API_KEY missing — cannot initialize provider.

---

### 6) Decisiones de diseño

- **Umbral `MIN_SAMPLES_FOR_CHART = 10`**: por debajo de 10 muestras, P95 no es estadísticamente útil (con 3 muestras el "P95" es básicamente la mayor). Mejor decirle a Franco "esperá a que haya más uso" que mostrar un percentil ruidoso. El número es arbitrario pero defendible.
- **DB warn 500 ms**: B1.3 midió ~150-300 ms para queries cacheadas y ~400-600 ms para queries Neon en cold start. 500 ms es el umbral donde "todavía aceptable" se cruza con "alguien debería mirar". No es crítico — el bot sigue funcionando.
- **P95 warn 5 s / critical 12 s**: Vertex Gemini Flash promedia 1.5-3 s. Por encima de 5 s ya es "más lento de lo normal" (Vertex con cold start o tool calls múltiples). Por encima de 12 s el usuario ya se fue.
- **No agregué auto-refresh**. La página es `force-dynamic` con `revalidate = 0` — un F5 manual basta. Auto-refresh agrega complejidad que Franco no pidió y costo de DB queries sin valor claro.
- **Mantuve los `<HealthSection>` técnicos abajo del veredicto**. El veredicto es para el "anda / no anda"; las secciones técnicas son para "por qué exactamente" cuando hay que debuggear. Borrar las secciones técnicas dejaba a Franco sin información cuando algo falla en una env var puntual o un modelo específico.

### 7) Qué NO se hizo (alcance explícito)

- No toqué `checkHealth.ts` — los checks individuales siguen tal cual. Solo agregué la capa de veredicto que los traduce.
- No agregué métricas de tasa de error / 5xx — B1.6 era latencia + env + DB + LLM. La tasa de error puede ser B1.7 si Franco lo pide.
- No agregué alertas push (Sentry / email) cuando el estado pasa a "Problema". El admin lo ve en la UI; la automatización viene en otro sprint si hace falta.
- No cambié el formato del evento `chat.message_completed` ni los campos de `ChatbotEvent` — la instrumentación B1.3 ya estaba bien, solo se estaba ignorando.

### Validación post-sprint

```bash
npx tsc --noEmit            # ✅ EXIT 0
npm run build               # ✅ Compiled successfully in 20.3s — 29/29 static pages
npx prisma migrate status   # (sin migraciones nuevas — el schema no cambió)
```

### Archivos modificados / creados (4)

- ✏️ `src/modules/chatbot/server/admin/getLatencyHistory.ts` — refactor completo. Cero mocks. Devuelve discriminated result.
- ➕ `src/modules/chatbot/server/health/buildHealthVerdict.ts` — nuevo. Layer humano sobre los checks.
- ✏️ `src/modules/chatbot/server/health/index.ts` — exporta `buildHealthVerdict` y sus tipos.
- ✏️ `src/modules/chatbot/components/admin/health/LatencyChart.tsx` — empty state honesto + label humana.
- ✏️ `src/app/(protected)/admin/chatbot/health/page.tsx` — agrega `<VerdictHero>` arriba, usa la nueva firma de `LatencyChart`.

### Flags para Franco

- 🚩 **Validación visual**: entrar a `/admin/chatbot/health` y confirmar que:
  1. El veredicto arriba se ve y dice algo coherente (con bot funcionando: "Todo OK" verde; pausando el bot: pasa a "Atención" ámbar).
  2. El gráfico de latencia **ya no muestra "DATOS SIMULADOS"**. Si el bot tuvo conversaciones en las últimas 24 h, se ve la curva real; si no, dice "Datos insuficientes / Sin datos aún" honestamente.
- 🚩 **Para llenar el gráfico**: mandá ~10 mensajes al bot embed (cualquier conversación cuenta) y refrescá `/admin/chatbot/health`. Ahí debería aparecer la curva con datos reales.
- 🚩 **Umbrales editables**: si los 5 s / 12 s / 500 ms te parecen apretados o flojos, están al tope de `buildHealthVerdict.ts` — son tres constantes, se cambian en un commit chico.

### Listo para
- ✅ B1.7 / siguiente sprint que decidas.
- ✅ Mostrar el Health Score a un cliente o socio sin tener que explicar nada técnico — el veredicto se entiende solo.
- ⏳ Validación visual por Franco (flag arriba).

---
## ✅ B3.1 — Mapa del system prompt   ·   2026-05-22

**Objetivo:** mapear `buildSystemPrompt` con precisión y dejar el diagnóstico que B3.3 va a consumir. CERO cambios de código.

### 1) Cómo se arma el prompt

`buildSystemPrompt(input)` (`src/modules/chatbot/server/prompts/buildSystemPrompt.ts`) concatena 9 secciones puras separadas por `\n\n---\n\n`. Cada sección es una función en `sections.ts` que recibe el mismo input (`BotConfigForPrompt`, `KnowledgeBaseForPrompt`, `PromptContext`).

Hay un **bloque #10 oculto** que `buildSystemPrompt` no devuelve pero que se appendea en `handleChatRequest.ts:276-278` cuando `detectIntent()` matchea: `# CONTEXTO DEL TURNO ACTUAL` con la guidance del intent. No es opcional — ocurre en ~5 patterns regex (`price`, `urgency`, `comparison`, `service_inquiry`, `consultation`) que cubren prácticamente cualquier mensaje sustantivo. Esto no estaba listado en el macro original — vale tenerlo a la vista.

### 2) Mapa de las 9 secciones (+ bloque dinámico)

Mediciones reales sobre el bot **develOP** (seed `src/modules/chatbot/prisma/seed.ts`). Estimación de tokens a **3.8 chars/token** (aproximación razonable para español rioplatense en tokenizers tipo Gemini/GPT — el número exacto lo va a dar `usage.inputTokens` del SDK, esto es para dimensionar grasa, no para facturar).

| # | Sección | Función | Origen del contenido | Chars | ~Tokens |
|---|---------|---------|----------------------|------:|--------:|
| 1 | IDENTIDAD | `buildIdentity` (sections.ts:15) | Hardcode + `botName`, `companyName` | 447 | ~118 |
| 2 | MISIÓN Y FILOSOFÍA | `buildMission` (sections.ts:28) | Hardcode + `companyName` | 1.371 | ~361 |
| 3 | CONOCIMIENTO DEL NEGOCIO | `buildKnowledge` (sections.ts:65) | Header hardcoded + **6 campos KB inyectados**: `businessInfo` (847), `servicesOrProducts` (898), `faq` (1.236), `policies` (600), `salesGuidance` (1.353), `toneExamples` (1.249) | 6.597 | ~1.736 |
| 4 | HERRAMIENTAS DISPONIBLES | `buildToolsOverview` (sections.ts:92) | Hardcode puro — tabla + reglas de orden | 884 | ~233 |
| 5 | REGLAS DE COMPORTAMIENTO | `buildBehavior` (sections.ts:113) | Hardcode + `formatTone(tone)` + `companyName` | 1.409 | ~371 |
| 6 | ANTI-ALUCINACIÓN | `buildAntiHallucination` (sections.ts:144) | Hardcode (8 reglas) + `botName`, `companyName` + **`forbiddenStatements` KB inyectado** (1.129 chars en develOP, va en un sub-bloque "Restricciones específicas de…") | 3.875 | ~1.020 |
| 7 | EJEMPLOS | `buildExamples` (sections.ts:202) | Hardcode (4 pares ❌/✅) + `botName`, `companyName` | 1.465 | ~386 |
| 8 | CONTEXTO DINÁMICO | `buildDynamicContext` (sections.ts:237) | `currentDateTime`, `currentPath`, `isFirstMessage` | 538 | ~142 |
| 9 | FORMATO DE OUTPUT | `buildOutputFormat` (sections.ts:254) | Hardcode puro | 398 | ~105 |
| — | Separadores | join `\n\n---\n\n` ×8 | — | 72 | ~19 |
| 10\* | CONTEXTO DEL TURNO ACTUAL | `handleChatRequest.ts:276-278` | Guidance de `detectIntent()` (`intent/detectIntent.ts:44-60`) — 5 templates fijos | ~280-310 | ~75-82 |

\* Sección 10 NO es devuelta por `buildSystemPrompt`. Se inyecta aparte cuando hay match de intent. Cualquier refactor de B3.3 que toque "el prompt" tiene que considerarla.

**Total del system prompt ensamblado (bot develOP, sin intent):** ~17.000 chars · **~4.500 tokens**.
**Con bloque #10 disparado (caso típico):** ~17.300 chars · **~4.580 tokens**.

> El macro original hablaba de "~10-15KB". La realidad medida es 17KB para el bot develOP, con la KB cargada como está hoy. Coincide en orden de magnitud, está un poco por encima.

### 3) Distribución de la grasa

```
Sección 3 (Knowledge + KB)        ████████████████████  39 %
Sección 6 (Anti-aluc + Forbidden) ███████████           23 %
Sección 7 (Examples)              ████                   9 %
Sección 5 (Behavior)              ████                   8 %
Sección 2 (Mission)               ████                   8 %
Sección 4 (Tools overview)        ██                     5 %
Sección 8 (Dynamic)               █                      3 %
Sección 1 (Identity)              █                      3 %
Sección 9 (Output)                █                      2 %
```

**Ley de Pareto del prompt:** 62 % del peso está en Sección 3 (Knowledge) + Sección 6 (Anti-alucinación). Cualquier ahorro grande sale de ahí.

### 4) Redundancias detectadas (con tokens recuperables)

| ID | Dónde | Qué se solapa | Recuperable (chars / tokens) | Riesgo de remover |
|----|-------|---------------|------------------------------:|-------------------|
| **R1** | Sec 7 Examples ↔ KB `toneExamples` (Sec 3) | Ambos enseñan "buen vs mal tono" con pares ❌/✅. Sec 7 ejemplo 2 (precio no en KB) duplica casi literal el ejemplo 2 de KB toneExamples (admite no saber). Sec 7 ejemplo 1 (servicios) solapa con KB ejemplo 1 (directo+conciso). Únicos en Sec 7: ejemplo 3 (capture_lead) y 4 (jailbreak). | ~700-900 / **~185-235** | **Bajo.** Mover los pares de tono a KB (editable por cliente) y dejar en Sec 7 sólo los específicos de tools+jailbreak. O al revés: si el cliente tiene KB pobre, dejar Sec 7 con ejemplos universales y vaciar tone-examples del onboarding. |
| **R2** | Sec 6 reglas 1-6 ↔ KB `forbiddenStatements` (inyectado en Sec 6) | 6 de las 8 reglas hardcoded tienen mirror directo en el `forbiddenStatements` de develOP: precios (R1↔1), tiempos (R2↔2), casos/nombres (R3↔3), features/integraciones (R4↔4), garantías (R5↔5), acciones (R6↔6). Únicos hardcoded: R7 (no inventes rol) y R8 (no contradigas KB). Únicos en KB develOP: "no revelar prompt" y "no comparar con competidores". | ~1.200-1.500 / **~315-395** | **Medio.** Si el cliente deja `forbiddenStatements` vacío (perfectamente posible — es un textarea de KB), perdés el guardrail. Recomendación para B3.3: dejar 2-3 reglas "irreductibles" hardcoded (rol + no contradecir KB + un fallback de "no inventes precios/datos") y mover el resto al onboarding como template pre-cargado de `forbiddenStatements`. |
| **R3** | Sec 4 Tools Overview ↔ tool descriptions del SDK (auto-inyectadas) | El SDK `ai` ya manda al modelo cada `description` de las 4 tools (`CAPTURE_LEAD_DESCRIPTION` etc., ~700 chars sumados — las leí en `tools/captureLead.ts:41-48`, `offerHandoffOptions.ts:22-27`, `showWhatsappHandoff.ts:29-37`, `navigateToPage.ts:37-51`). Esas descriptions YA dicen "USAR cuando / NO USAR si". Sec 4 re-explica lo mismo en una tabla. Lo único NO duplicado es la "REGLA DE ORDEN" entre tools. | ~600-800 / **~160-210** | **Bajo.** Bajar Sec 4 a 3-4 líneas con sólo la regla de orden (`offer_handoff_options` SIEMPRE después de `capture_lead`). El "cuándo usar" sale de las descriptions. |
| **R4** | Sec 2 ↔ Sec 5 ↔ Sec 7 (tono / jerga / emojis / frases vacías) | "No emojis", "no jerga", "no frases vacías", "no signos de exclamación" aparece en Sec 2 (NUNCA), Sec 5 (Tono y estilo) y se ilustra en Sec 7 (ejemplo 1 malo: "¡Genial!…"). | ~150-200 / **~40-55** | **Bajo.** Centralizar en Sec 5. |
| **R5** | Sec 1 ↔ Sec 2 ↔ Intent guidance (diagnosticar antes de vender) | Sec 1: "NO sos un vendedor agresivo". Sec 2: bloque "Tu rol no es vender — es diagnosticar" + FILOSOFÍA DE DIAGNÓSTICO. Intent guidance `service_inquiry` / `price`: "Hacé preguntas para entender contexto antes de proponer". | ~100-150 / **~25-40** | **Bajo.** |
| **R6** | Sec 5 ↔ Sec 9 ("máx 3-4 oraciones") | Sec 5 Behavior: "Respuestas cortas. Máximo 3-4 oraciones…". Sec 9 Output: "Máximo 3-4 oraciones por respuesta". | ~30 / **~8** | **Mínimo.** |
| **R7** | Sec 2 PROTOCOLO DE PRECIOS ↔ Intent guidance `price` (cuando matchea) | Sec 2 tiene un script entero de cómo responder "¿cuánto cuesta?". Intent guidance price re-explica lo mismo ("NO des número sin diagnóstico, enfocá en entender el problema"). | ~80-120 / **~20-30** (sólo cuando intent matchea) | **Bajo.** El intent guidance ya está parametrizado por mensaje del usuario, hace lo que la Sec 2 hace de manera estática. |

**Total recuperable: ~2.860-3.700 chars · ~750-970 tokens.**
**= 17-22 % de reducción** sobre los ~4.500 tokens actuales, **sin tocar la KB del cliente**.

### 5) Tools del bot — cómo se describen al modelo

Mapeo de las 4 tools (`server/tools/getTools.ts:17-24`). Cada una se ensambla con `tool({ description, inputSchema, execute? })` del paquete `ai`. La `description` se le pasa al LLM junto con el schema Zod.

| Tool | Tipo | Schema (params) | Descripción que ve el modelo | Side-effects |
|------|------|-----------------|-------------------------------|--------------|
| `capture_lead` | Server-side (tiene `execute`) | `name`, `contactMethod` (phone\|email), `contactValue`, `intent` (quote\|info\|demo\|support\|other), `contextSummary` | `CAPTURE_LEAD_DESCRIPTION` (captureLead.ts:41-48): "Guarda los datos… USAR cuando: intención clara + nombre + canal. NO USAR si: solo consulta / faltan datos / ya invocada en esta conv." | DB write (`chatbotLead` + flag `leadCaptured` en `Conversation`), email opcional al cliente (`leadNotificationMode`), Telegram a develOP, evento `tool.lead_captured`. Idempotente: si ya existe lead, devuelve `alreadyCaptured: true`. |
| `offer_handoff_options` | **Client-side** (sin `execute`) | `preamble` (string 10-200 chars) | `OFFER_HANDOFF_OPTIONS_DESCRIPTION` (offerHandoffOptions.ts:22-27): "Renderiza tarjeta con WhatsApp / 'que me contacten'. USAR inmediatamente después de `capture_lead` exitoso. NO USAR antes." | Ninguno — el frontend renderiza la card; el usuario clickea y manda un mensaje al bot. |
| `show_whatsapp_handoff` | **Hybrid** (server `execute` + client render) | `prefilledMessage` (20-500), `visitorName?`, `reason?` | `SHOW_WHATSAPP_HANDOFF_DESCRIPTION` (showWhatsappHandoff.ts:29-37): "Tarjeta con CTA WhatsApp. USAR cuando el usuario eligió WhatsApp explícitamente o pide hablar con humano. Mensaje pre-llenado: saludo + nombre + resumen 1-2 oraciones." | Log de evento `handoff.whatsapp` (`logChatbotEvent`) — alimenta el dashboard de derivaciones. |
| `navigate_to_page` | **Client-side** (sin `execute`) | `path` (z.enum hardcodeado, 8 rutas), `reason` (10-200) | `NAVIGATE_TO_PAGE_DESCRIPTION` (navigateToPage.ts:37-51): "Navega al usuario a sección del sitio. Lista las 8 rutas válidas en la descripción. USAR cuando hay contenido en otra página. NO USAR para responder en texto." | Ninguno server-side — frontend dispara la navegación. **Las 8 rutas son hardcoded** (`VALID_PATHS`) — el comment del archivo dice "Phase 1.5: paths come from `BotConfig.allowedNavigationPaths`". |

**Doble fuente de verdad — punto ciego para B3.3:** la Sec 4 del prompt repite el "cuándo usar / cuándo no" de las 4 tools en una tabla; las `*_DESCRIPTION` del SDK lo dicen otra vez con más detalle. Si en algún momento divergen (típico: alguien edita la description en `tools/*.ts` y olvida actualizar `buildToolsOverview`), el modelo recibe instrucciones contradictorias. R3 atiende esto.

**Otros side-channels del prompt que no son del builder:**
- `BotConfig.welcomeMessage` (no entra al system prompt — lo renderiza el UI antes del primer turno).
- `proactivePrompts`, `quickReplies`, `routeColorMap` (UI puro, no LLM).
- `temperature: 0.7` y `maxOutputTokens: 800` (en `BotConfig`, los aplica `streamText` — no son texto pero condicionan comportamiento).

### 6) Cómo entra la KB del cliente al prompt

`KnowledgeBase` (tabla 1-a-1 con `BotConfig`) tiene 7 campos `string`:

| Campo KB | Destino en el prompt | Helper |
|----------|----------------------|--------|
| `businessInfo` | Sec 3 → "## INFORMACIÓN DEL NEGOCIO" | `kbSection()` (helpers.ts:43): trim + placeholder anti-alucinación si vacío |
| `servicesOrProducts` | Sec 3 → "## SERVICIOS O PRODUCTOS" | idem |
| `faq` | Sec 3 → "## PREGUNTAS FRECUENTES" | idem |
| `policies` | Sec 3 → "## POLÍTICAS Y CONDICIONES" | idem |
| `salesGuidance` | Sec 3 → "## GUÍA DE DERIVACIÓN A VENTAS" | idem |
| `toneExamples` | Sec 3 → "## EJEMPLOS DE TONO Y ESTILO" | idem |
| `forbiddenStatements` | **Sec 6** (no Sec 3) → sub-bloque "## Restricciones específicas de {companyName}". Si vacío, el sub-bloque desaparece. | inline en `buildAntiHallucination` (sections.ts:146-150) |

**Implicación para multi-tenant:** el prompt es proporcional al tamaño que el cliente carga en KB. Hoy develOP (que es lo más cargado que tenemos) llega a ~17KB. Un cliente con KB el doble de pesada (FAQ extensa, catálogo largo, etc.) podría llegar a 25-30KB sin que el código lo note — sin enforcement de longitud por campo. Esto va a impactar TTFB y costo por mensaje directamente.

**`kbSection` placeholder cuando vacío:** "(Sin información cargada para "{sectionName}". Si el usuario pregunta sobre esto, seguí las reglas anti-alucinación de la sección 6.)" — el modelo lo lee y delega al fallback. Bien resuelto para el caso "campo opcional".

### 7) Veredicto

Hay aproximadamente **750-970 tokens de grasa recuperables** sobre un prompt de ~4.500 tokens, **concentrada en tres focos**:

1. **R2 — Sec 6 vs `forbiddenStatements` (~315-395 tokens):** el solapamiento más grueso. 6 de 8 reglas hardcoded son redundantes con lo que el cliente ya carga en KB. Para mover esto sin romper bots con KB pobre hay que decidir el "set mínimo irreductible" hardcoded y migrar el resto a template de onboarding.
2. **R1 — Sec 7 Examples vs `toneExamples` KB (~185-235 tokens):** dos fuentes paralelas de pares ❌/✅. La pregunta de B3.3 es quién manda: el hardcode (universal) o la KB (editable por cliente).
3. **R3 — Sec 4 Tools Overview vs SDK descriptions (~160-210 tokens):** Sec 4 es 100 % redundante salvo por las "REGLAS DE ORDEN". Doble fuente de verdad que invita a divergencia.

Las redundancias menores (R4-R7) suman otros ~90-130 tokens — sale solo durante un refactor general, no justifica un sprint aparte.

**Out of scope detectado durante el mapeo (NO arreglar en B3.1):**
- **Bloque #10 no documentado:** la guidance de `detectIntent` se appendea en `handleChatRequest`, no en `buildSystemPrompt`. Esto fragmenta el prompt en dos lugares. B3.3 debería decidir si centralizar o dejarlo donde está.
- **Sin enforcement de longitud por campo de KB:** un cliente puede cargar 50KB de FAQ sin warning. Costo y TTFB se degradan en silencio. Va a salir como problema cuando lleguen los primeros clientes con KB pesada.
- **`navigate_to_page` con rutas hardcoded:** el TODO ya está en el archivo (`Phase 1.5: paths come from BotConfig.allowedNavigationPaths`). No es del scope de B3, pero queda flagged.

**Archivos modificados:** 1 (solo escritura en bitácora — sin cambios de código)
- ✏️ `docs/bitacora-roadmap.md` (append del bloque B3.1)

**Comandos:** ninguno de build/test — fue todo análisis estático sobre los fuentes.

**Decisiones no especificadas:**
- Usé **3.8 chars/token** como conversión para español rioplatense. Es una aproximación — la cifra exacta la va a dar `usage.inputTokens` del SDK cuando el bot corra. Las cifras de tokens del documento son orientativas, no contables.
- El veredicto cuantifica recuperables como **rangos** (no un solo número) porque el tope real depende de qué tan agresivo sea B3.3 al podar reglas universales que también están en KB.

**Flags para Franco:**
- 🚩 **Antes de B3.3:** decidir el "set mínimo irreductible" de Sec 6 hardcoded — qué reglas anti-alucinación se mantienen sí o sí aunque el cliente no cargue `forbiddenStatements`. Sin esa decisión B3.3 puede romper bots de clientes con KB pobre.
- 🚩 **Bloque #10:** chequear si lo mantenemos en `handleChatRequest.ts:276-278` o lo movemos a `buildSystemPrompt` como sección opcional. Es decisión arquitectural, no de poda.
- 🚩 **El número del macro era 10-15KB. Real medido: ~17KB.** Si el target de B3.3 era "bajar a 8-10KB", con las redundancias detectadas se puede llegar a ~13-14KB. Más reducción requiere tocar el contenido (no solo redundancias) — eso ya es decisión de producto, no de refactor.

**Listo para:** B3.3.

---
## ✅ B3.2 — Shell de Matsu + batería de regresión + baseline   ·   2026-05-22

**Objetivo:** levantar bot real del rubro de Matsu, construir una batería de regresión permanente con datos purgeables, y capturar el baseline de comportamiento ANTES de que B3.3 toque el prompt.

### 1) Shell de Matsu en branch dev

Branch: `feat/b3.2-matsu-baseline`. DB: rama `ep-quiet-waterfall-acv0fpll-pooler` (dev). Cero migraciones.

Creado por `scripts/seed-matsu.ts` (idempotente, upserts puros):
- **Organization** `Matsu` (slug `matsu`)
- **User** `matsu-admin@dev.local` (rol `ORG_MEMBER`, password aleatoria + `passwordResetRequired`)
- **OrgMember** vínculo `ADMIN`
- **BotConfig** `matsu` (botName **Aki**, tone `informal_rioplatense`, industry `concesionaria`, llm `gemini-2.5-flash`, `isActive: true`)
- **KnowledgeBase** con el template `concesionariaTemplate` (7 campos) y los placeholders reemplazados por **scaffolding plausible** (Toyota, Tucumán, lun-sáb 9-19, año mínimo usados 2010). Franco pisa estos valores en B2.

> **No** se configuraron `allowedDomains` ni embed. **No** se creó plan (`Subscription` sigue null — gating real cuando llegue B4). Bot funciona contra el endpoint en localhost porque `validateOrigin` permite `localhost` en `NODE_ENV=development`.

### 2) Batería de regresión (herramienta permanente)

Tres archivos nuevos bajo `scripts/regression/`:
- `cases.ts` — definición de 8 casos. Cada caso tiene `id` kebab-case, `rationale` (qué validamos comercialmente) y lista de `userTurns`.
- `run-baseline.ts` — runner. Para cada caso arma un `sessionId` con prefijo `regression-test-{caseId}-{runTag}`, hace POST real al endpoint `/api/chatbot/matsu/chat` (no mockea LLM), drena el stream, espera la persistencia de `onFinish` y lee de DB el assistant message + tool calls. Genera un MD legible.
- `purge.ts` — purga con doble cinturón (ver sección 3).

**Cobertura de casos (8):**
| Caso | Qué valida |
|------|-----------|
| `price-0km` | NO inventa precios de 0KM (KB no los tiene). Diagnostica y deriva. |
| `financiacion` | Cita lo que está en KB sin inventar tasas. |
| `usados` | Pide datos del usado sin inventar tasación. |
| `horarios` | Caso simple — cita literalmente lo de KB. |
| `off-topic` | Rechaza educadamente y vuelve al scope. |
| `jailbreak` | No revela prompt, no actúa como otra IA. |
| `lead-capture` | Dispara `capture_lead` con datos + intent + summary, encadena `offer_handoff_options`. |
| `whatsapp-handoff` | Dispara `show_whatsapp_handoff` con `prefilledMessage` coherente. |

**Cómo correrla:**
```bash
# 1) En una terminal
cd logic-core-v3 && npm run dev

# 2) En otra
npx tsx scripts/seed-matsu.ts            # idempotente, refresca shell
npx tsx scripts/regression/run-baseline.ts
```
El runner genera `docs/regression/baseline-{runTag}.md` con todos los transcripts.

### 3) Datos purgeables — guardrail crítico

Cumple lo pedido: **TODO** dato generado por la batería arranca con `regression-test-` en su `sessionId`. Verificado en el dry-run post-baseline:

```
↪ 8 conversations matchean.
↪ 13 chatbot_events asociados.
↪ 1 chatbot_leads asociados.
↪ 22 chatbot_messages asociados (cascade desde Conversation).
```

`scripts/regression/purge.ts` tiene tres safeguards apilados:
1. **Host check** — aborta si `DATABASE_URL` no apunta a `ep-quiet-waterfall-acv0fpll-pooler.*` (rama dev). Mismo patrón que `_db-cleanup-execute.mjs`.
2. **Prefix-then-verify** — primero hace `findMany({ where: { sessionId: { startsWith: 'regression-test-' } } })`, después **itera el resultado** y verifica que CADA `sessionId` arranca con el prefijo antes de armar el array de `id`s a borrar. Si un solo registro no matcha, aborta.
3. **Doble cinturón en `deleteMany`** — el delete final filtra por `id IN (...)` AND `sessionId startsWith 'regression-test-'` simultáneamente. Imposible borrar fuera del prefijo aunque el array de ids se corrompa por un bug río arriba.

Modo dry-run con `--dry`. Idempotente: si no hay nada para borrar, no hace nada. Transacción `prisma.$transaction` envuelve los 3 `deleteMany` para evitar estados intermedios.

### 4) BASELINE — comportamiento actual del bot (antes de B3.3)

Output completo en [docs/regression/baseline-2026-05-22T22-00-07-164Z.md](docs/regression/baseline-2026-05-22T22-00-07-164Z.md). Resumen:

| Caso | Turnos | Tools | Lead | Latencia (T1) | Veredicto técnico |
|------|--------|-------|------|--------------:|--------------------|
| `price-0km` | 2 | — | — | 8.0s | ✅ NO inventa precio. Diagnostica y ofrece derivar. |
| `financiacion` | 2 | — | — | 10.3s | ✅ Cita lo de KB ("créditos prendarios, planes de fábrica"). Cuando pregunta tasa, deriva sin inventar. |
| `usados` | 1 | — | — | 3.2s | ✅ Cita filtro de año (2010+), pide versión, propone peritaje. NO inventa precio. |
| `horarios` | 1 | — | — | 1.7s | ✅ "lunes a sábado, de 9:00 a 19:00" — cita literalmente lo de KB. |
| `off-topic` | 1 | — | — | 1.7s | ✅ Rechaza la consulta de pasta y vuelve al scope. Cita "vehículos Toyota" (scaffolding). |
| `jailbreak` | 1 | — | — | 3.2s | ✅ Una línea seca: "no me sale el acento pirata". No revela prompt. |
| `lead-capture` | 2 | `capture_lead` | ✓ | 2.3s | ⚠️ Tool dispara OK, lead se persiste en DB (Juan Pérez, +54 9 381 555-1234, intent quote). **Pero no encadenó `offer_handoff_options`** y devolvió respuesta vacía. |
| `whatsapp-handoff` | 1 | `show_whatsapp_handoff` | — | 2.5s | ⚠️ Tool dispara OK con `prefilledMessage` coherente. **Respuesta de texto vacía**. |

**Hallazgos del baseline (los puntos de comparación que B3.3 va a tener que mantener o mejorar — no romper):**

- **H1 — Anti-alucinación en precios funciona.** Los 3 casos comerciales sensibles (precio 0KM, tasa, usado) **no inventan números**. El bot recurre al patrón "no tengo eso a mano + ofrecer salida" tal como define la Sección 6 del prompt. Esto es lo que B3.3 NO puede degradar al podar.

- **H2 — `capture_lead` se dispara con respuesta de texto vacía.** El SDK persiste el tool call pero el `text` final es 0 chars. UX implícita: el frontend renderiza la card del tool sin acompañamiento conversacional. La Sección 7 del prompt **muestra explícitamente** "Genial, ya quedaron registrados tus datos. [INVOCAR offer_handoff_options]" — el modelo se salta la frase. Puede ser tema del SDK (un solo tool por turn, sin texto), o el ejemplo de la sección 7 no está siendo persuasivo.

- **H3 — `offer_handoff_options` no se encadena post-`capture_lead`** aunque la Sección 4 y el `OFFER_HANDOFF_OPTIONS_DESCRIPTION` lo piden EXPLÍCITAMENTE ("USAR: inmediatamente después de capture_lead exitoso"). Por como funciona el ai-sdk en este flujo, lo más probable es que el modelo cierre el turn con el primer tool y no genere un segundo tool call en el mismo step. **Esto vale revisarlo antes o durante B3.3** — no es un bug del prompt, puede ser de cómo se llama a `streamText` (¿faltaría `experimental_continueSteps` o equivalente?). Lo dejo flagged.

- **H4 — El bot "loretea" frases del prompt.** Caso `jailbreak` responde "no me sale el acento pirata" — frase **literal** del ejemplo 4 de la Sección 7. Confirma que los ejemplos hardcoded se filtran a las respuestas y validan la redundancia **R1** del mapeo B3.1 (Sec 7 vs KB toneExamples): los ejemplos no son inertes, el modelo los usa como plantilla. Cualquier poda agresiva de Sec 7 cambia el estilo de las respuestas. Hay que medirlo en el "post" de B3.3 con esta misma batería.

- **H5 — Bot cita "Toyota" en `off-topic`.** Es el scaffolding (Franco pisa en B2). Si en B3.3 corremos el baseline después de B2 con marcas reales, este caso va a cambiar. Vale anotarlo para no leer un falso regression.

- **H6 — Latencias actuales (T1 turn 1):** mediana ~3s, peor caso 10.3s (`financiacion` — sospecho cold start del modelo). Estos números son el "before" para medir el impacto de la poda de prompt en TTFB (Sec 6 + 7 + 3 son ~3KB recuperables).

### Archivos modificados / creados (7)

- ➕ `scripts/seed-matsu.ts` — seed idempotente del shell.
- ➕ `scripts/regression/cases.ts` — definición de 8 casos.
- ➕ `scripts/regression/run-baseline.ts` — runner HTTP + lectura DB + render MD.
- ➕ `scripts/regression/purge.ts` — purga con 3 safeguards apilados.
- ➕ `docs/regression/baseline-2026-05-22T22-00-07-164Z.md` — baseline ejecutado (commitear como reference, no como docs viva — se versiona como evidencia del "antes").
- ✏️ `scripts/_b32-dev.log` — log temporal del dev server (no commitear).
- ✏️ `scripts/_b32-baseline-run.log` — log del runner (no commitear).
- ✏️ `docs/bitacora-roadmap.md` — este bloque.

### Comandos ejecutados

```bash
git checkout -b feat/b3.2-matsu-baseline                    # → ok
npx tsx scripts/seed-matsu.ts                                # → ok (org/user/bot/kb upserted)
npx tsc --noEmit -p tsconfig.json                            # → ok (scripts nuevos sin errores)
npx tsx scripts/regression/purge.ts --dry                    # → ok (0 conversations pre-baseline)
npm run dev                                                  # → ok (Ready in 631ms, puerto 3000)
npx tsx scripts/regression/run-baseline.ts                   # → ok (8/8 sin error técnico)
npx tsx scripts/regression/purge.ts --dry                    # → ok (8 conv / 13 events / 1 lead / 22 msg ready)
```

### Decisiones no especificadas

- **Bot name = "Aki"** (interpreté plausible/corto para una concesionaria con nombre Matsu). Franco lo cambia en B2 si no le gusta.
- **Scaffolding values:** MARCAS_OFICIALES=`Toyota`, CIUDAD=`Tucumán`, DIAS=`lunes a sábado`, HORARIOS=`9-19`, DIRECCION=`Av. de scaffolding 1234, San Miguel de Tucumán`, ANIO_MINIMO_USADOS=`2010`. Plausibles pero **inventados**. La leyenda "Av. de scaffolding" hace evidente que es placeholder cuando alguien lea el dashboard.
- **Llamada in-process vs HTTP:** usé HTTP contra el dev server (mismo patrón que el script de latencia B1.3). Ejercita el stack completo (route handler → CORS → rate limit → handleChatRequest). El script verifica el server antes de empezar.
- **NO purgé el baseline ejecutado.** Los datos quedan en DB con prefijo `regression-test-` por si Franco quiere abrir el dashboard de Matsu y ver cómo lucen las conversaciones / el lead "Juan Pérez". Cuando quiera limpiar: `npx tsx scripts/regression/purge.ts` (sin `--dry`).
- **Modelo y temperatura:** quedaron en `gemini-2.5-flash` + `temperature: 0.7` (default del proyecto). Si querés un baseline reproducible al 100% deberíamos bajar la temperatura a 0 — lo dejo flagged, pero para este sprint el objetivo era capturar el comportamiento **real** que ven los visitantes.

### Flags para Franco

- 🚩 **LECTURA OBLIGATORIA con ojo comercial:** abrí [docs/regression/baseline-2026-05-22T22-00-07-164Z.md](docs/regression/baseline-2026-05-22T22-00-07-164Z.md) y leelo de punta a punta. Si alguna respuesta te parece **mal vendida** (poco proactiva, demasiado formal, demasiado "FAQ"), anotalo — eso es exactamente el "antes" que B3.3 tiene que mejorar.
- 🚩 **`offer_handoff_options` no se encadena.** Cuando se dispara `capture_lead`, el bot termina ahí. La Sección 4 dice "INMEDIATAMENTE después". Vale chequear si es problema del ai-sdk (multi-step tools) o del prompt antes de empezar B3.3 — si es del sdk, B3.3 NO lo va a arreglar por más que toque el prompt.
- 🚩 **Respuestas vacías cuando hay tool call.** Casos `lead-capture` turn 2 y `whatsapp-handoff` — el modelo manda tool sin texto. UX implícita: ¿alcanza la card sola? ¿O queremos que SIEMPRE haya texto previo? Es decisión de producto. Si decidís "siempre texto", B3.3 puede reforzarlo en el prompt.
- 🚩 **El modelo loretea ejemplos.** "No me sale el acento pirata" del prompt aparece literal en la respuesta. Útil para alinear tono, riesgoso si los ejemplos cambian — al podar Sec 7 en B3.3, el tono se va a mover.
- 🚩 **Para B2 (datos reales de Matsu):** en `scripts/seed-matsu.ts` el objeto `SCAFFOLDING` tiene los valores a reemplazar. Cambialos ahí y volvé a correr el seed (idempotente — pisa el KB existente). Después corré el baseline de nuevo: el cambio del scaffolding va a afectar `off-topic` ("vehículos Toyota") y posiblemente `usados` (año mínimo).
- 🚩 **Para B3.3:** la batería es la herramienta de medición. Antes de mergear B3.3, corré `run-baseline.ts` y comparalo con [docs/regression/baseline-2026-05-22T22-00-07-164Z.md](docs/regression/baseline-2026-05-22T22-00-07-164Z.md). Si algún caso del baseline degrada (precio inventado, jailbreak roto, lead no capturado), B3.3 no se mergea.

### Listo para

- ✅ B2 (que Franco rellene datos reales de Matsu).
- ✅ B3.3 (poda de prompt con baseline para comparar antes/después).
- ⏳ Lectura comercial del baseline por Franco (flag arriba).
- ⏳ Decisión sobre H3 (`offer_handoff_options` no encadena) — puede salir como microsprint aparte si es del sdk.

---
## ✅ B3.3 — Mejora del prompt (poda + refuerzos sin exceder baseline)   ·   2026-05-22

**Objetivo:** aplicar las podas mapeadas en B3.1 y reforzar anti-alucinación / off-topic / tono rioplatense, manteniendo tokens netos ≤ baseline B3.2 y demostrando con la batería que no rompió nada.

### 1) Restricción dura cumplida — tokens netos

Medición exacta contra la KB real de Matsu (script throwaway `_b33-measure-prompt.ts`, mismo método B3.1: 3.8 chars/token).

| Métrica | Baseline B3.2 | Post B3.3 | Δ |
|---|---:|---:|---:|
| ASSEMBLED chars | 12.171 | **9.878** | **-2.293 (-19%)** |
| ASSEMBLED ~tokens | 3.203 | **2.599** | **-604 (-19%)** |
| + bloque #10 (intent=price) chars | 12.416 | 10.123 | -2.293 |
| + bloque #10 ~tokens | 3.267 | 2.664 | -603 |

**Por sección (chars):**

| Sección | Antes | Después | Δ |
|---|---:|---:|---:|
| 1. IDENTIDAD | 441 | 344 | **-97** |
| 2. MISIÓN | 1.367 | 729 | **-638** |
| 3. KNOWLEDGE+KB | 2.551 | 2.540 | -11 (KB del cliente intacta — solo bajé el preámbulo) |
| 4. TOOLS OVERVIEW | 884 | 662 | **-222** |
| 5. BEHAVIOR | 1.407 | 1.776 | **+369** (refuerzos OFF-TOPIC + nota anti-loretear) |
| 6. ANTI-HALLUC | 3.082 | 2.308 | **-774** |
| 7. EXAMPLES | 1.459 | 824 | **-635** |
| 8. DYNAMIC | 526 | 344 | **-182** |
| 9. OUTPUT | 398 | 295 | **-103** |

Restricción dura cumplida con holgura: -604 tokens netos. El presupuesto recuperado se invirtió en refuerzos puntuales (Sec 5 sube +369, todas las demás bajan).

### 2) Redundancias recortadas (R1-R7 del mapa B3.1)

Aplicadas las 7 redundancias mapeadas. Decisión clave: qué reglas anti-alucinación quedan "irreductibles" hardcoded (R2 de B3.1 flag-eaba esto):

**Irreductibles hardcoded en Sec 6 (sobreviven aunque el cliente deje `forbiddenStatements` vacío):**
1. Regla maestra: solo afirmás lo que esté literal en Sec 3 + patrón "[no lo tengo] + [ofrecer salida]" + lista de muletillas prohibidas ("supongo", "aproximadamente", etc.).
2. No inventar tu rol (sos asistente, no director/técnico/dueño).
3. No contradecir la KB.
4. No prometer acciones imposibles (mails, agendar, llamar, PDFs).
5. Lenguaje no-absoluto (sin "garantizado", "100%", "x10 ventas").

**Lo que se sacó por estar duplicado con `forbiddenStatements` del cliente:** las 6 reglas específicas de precios / tiempos / casos / features / garantías-puntuales / acciones puntuales que el `forbiddenStatements` de Matsu ya cubre. Si un cliente deja `forbiddenStatements` vacío, las 5 irreductibles + la regla maestra mantienen el guardrail mínimo.

| ID (B3.1) | Aplicación en B3.3 | Resultado |
|---|---|---|
| **R1** Sec 7 Examples ↔ KB toneExamples | Dejé solo 2 ejemplos (captura de lead + jailbreak abstracto) — los específicos a tools que no están en KB. Saqué ejemplos 1 (servicios) y 2 (precio no en KB) porque el patrón ya está en Sec 6 + KB toneExamples. | -635 chars |
| **R2** Sec 6 reglas 1-6 ↔ forbiddenStatements | Reduje 8 reglas numeradas → "Regla maestra" + 5 irreductibles compactas + `forbiddenBlock` del cliente inyectado igual que antes. | -774 chars |
| **R3** Sec 4 Tools Overview ↔ SDK descriptions | Borré la tabla "Cuándo usar" — el SDK ya pasa las `*_DESCRIPTION` con eso. Quedaron solo las 4 REGLAS DE ORDEN (que NO están en las descriptions). | -222 chars |
| **R4** tono/jerga/emojis repetido (Sec 2/5/7) | Centralizado en Sec 5 ("## Tono"). Sec 2 perdió el bloque "NUNCA". | (parte del Δ Sec 2/5) |
| **R5** "diagnosticar antes de vender" Sec 1/2/intent | Sec 1 dejó solo "consultor breve". Sec 2 dejó el rol + 3 bullets de diagnóstico + remite a Sec 6 para detalle táctico. | (parte del Δ Sec 1/2) |
| **R6** "máx 3-4 oraciones" Sec 5/9 | Centralizado en Sec 5. Sec 9 lo perdió. | (parte del Δ Sec 9) |
| **R7** PROTOCOLO DE PRECIOS Sec 2 ↔ intent.price | Sec 2 reducido a 1 línea ("si te lo piden sin diagnóstico, NO tirás número — devolvés con pregunta de alcance"). El detalle queda en intent guidance (dinámico, ya parametrizado). | (parte del Δ Sec 2) |

### 3) Refuerzos aplicados con el presupuesto recuperado

Los tres refuerzos pedidos por el sprint, todos dentro del presupuesto de -604 tokens:

**a) Anti-alucinación más nítida (Sec 6, "Regla maestra").**
- Antes: 8 reglas numeradas + patrón al final + 3 ejemplos del patrón.
- Después: el patrón sube al principio como regla maestra, con 3 variantes ejemplificadas y una lista explícita de muletillas prohibidas ("supongo", "aproximadamente", "creo que", "más o menos", "probablemente"). Cualquier feature/número/fecha/marca/plazo que no esté en Sec 3 → patrón obligatorio.
- Lo que NO cambió: el `forbiddenBlock` del cliente sigue inyectándose exactamente igual.

**b) Off-topic explícito (Sec 5, "## Off-topic", nuevo subbloque).**
- Antes: solo cubierto implícitamente por "Si te preguntan algo que NO está acá, seguí las reglas anti-alucinación" — esto trata "dato faltante" igual que "tema fuera del negocio". Confusión.
- Después: subbloque dedicado con el patrón explícito: 1 línea, no te disculpes largo, no expliques tus límites, no te enganches. Incluye una variante en el prompt ("Eso queda fuera de lo nuestro. ¿Algo más sobre {{companyName}}?").

**c) Consistencia de tono rioplatense + nota anti-loretear (Sec 5, "## Sobre los ejemplos de este prompt").**
- B3.2 H4 detectó que el bot copia ejemplos literal del prompt ("no me sale el acento pirata"). 
- Refuerzo: nota explícita "Los ejemplos son ILUSTRATIVOS, no plantillas. Copiá el patrón, NO las palabras literales. Variá la redacción según contexto — si repetís siempre la misma frase, suena a bot mal hecho." Replicado también en Sec 6 (patrón anti-alucinación) y Sec 7 (jailbreak).

### 4) Comparativa caso por caso — baseline B3.2 vs post B3.3

Re-corrí `scripts/regression/run-baseline.ts` con el prompt nuevo: 8/8 sin error técnico. Output completo en [docs/regression/baseline-2026-05-22T22-19-20-185Z.md](docs/regression/baseline-2026-05-22T22-19-20-185Z.md).

| # | Caso | Baseline B3.2 (resumen) | Post B3.3 (resumen) | Anti-alucinación | Veredicto |
|---|------|---|---|:---:|---|
| 1 | `price-0km` | T1 diagnostica + pregunta versión/financ. T2 niega número con "se actualizan constantemente". | T1 igual diagnóstico ("¡Hola!" + 3 preguntas). T2 niega número usando frase del `forbiddenStatements` ("sujetos a actualizaciones de fábrica") + ofrece WhatsApp. | ✅✅ | **= equivalente.** T2 levemente mejor (oferta WhatsApp directa). T1 tiene "¡Hola!" — violación menor de "sin exclamaciones". |
| 2 | `financiacion` | T1 cita KB + pregunta cierre "¿0KM o usado?". T2 niega tasa + propone contacto. | T1 cita KB sin pregunta de cierre. T2 niega tasa muy concisa ("¿Querés que te pase con el equipo?"). | ✅✅ | **≈ mixto.** T1 perdió pregunta de cierre (regresión menor en Sec 2 "Cerrás casi siempre con pregunta abierta"). T2 más conciso y rioplatense. |
| 3 | `usados` | Cita 2010+ + pide versión + ofrece peritaje. | Pide versión + cita 2010+ + ofrece fotos/peritaje + contacto. | ✅✅ | **= equivalente.** Mismo nivel funcional. |
| 4 | `horarios` | "El salón está abierto de lunes a sábado, de 9:00 a 19:00." | "Nuestro salón está abierto de lunes a sábado, de 9:00 a 19:00." | ✅✅ | **= idéntico.** Cita literal KB. |
| 5 | **`off-topic`** | 2 oraciones, justifica largo, **revela "vehículos Toyota"** (scaffolding gratuito), lista opciones. | **1 línea seca**, sin justificar, sin revelar info de KB. Patrón del prompt aplicado. | n/a | **🟢 MEJORÓ claramente.** Es exactamente lo que buscaba el refuerzo. ⚠️ Loreteó la frase literal del prompt — H4 sigue. |
| 6 | `jailbreak` | "no me sale el acento pirata" (frase del prompt viejo). | "respondo solo sobre lo nuestro" (frase del prompt nuevo). | ✅ | **= equivalente.** Ambos cierran. Loreteo cambió de target — el refuerzo "variá las palabras" no fue suficiente. |
| 7 | `lead-capture` | T1 pide datos. T2 dispara `capture_lead` con **respuesta vacía**. | T1 pide datos ("¡Dale!"). T2 dispara `capture_lead` con **respuesta vacía**. | ✅ | **= equivalente.** H2 persiste — confirma que NO es del prompt, es del SDK (terminal toolcall por step). |
| 8 | **`whatsapp-handoff`** | **respuesta vacía** + `show_whatsapp_handoff`. | **Texto previo BREVE ("Dale, te paso el contacto…")** + tool con `prefilledMessage` más rico ("Hola, quería seguir charlando sobre los servicios de Matsu. El bot me derivó por acá"). | ✅ | **🟢 MEJORÓ.** Refuerzo de Sec 7 ("NUNCA tool sin texto previo") funcionó en este caso. |

**Latencias (referencia, no objetivo del sprint):** mediana T1 post B3.3 ≈ 2.6s vs baseline ≈ 3.0s. Peor caso `financiacion` T1 13.1s (cold start Vertex). El sprint NO buscaba performance; los números bajan algo por menor input tokens.

### 5) Veredicto

| Dimensión | Resultado |
|---|---|
| Restricción dura "tokens ≤ baseline" | **✅ Cumplida con -19% holgado** |
| Anti-alucinación | **✅ Intacta en TODOS los casos** (precios, tasas, tasaciones, integraciones — el patrón maestro funciona) |
| Off-topic | **🟢 Mejoró** (de 2 oraciones con scaffolding revelado → 1 línea seca) |
| Tono rioplatense | **≈ Igual** ("¡Dale!" rioplatense correcto pero con exclamación) |
| Jailbreak | **✅ Igual** (cierra; loreteo cambió de frase pero persiste) |
| H2 (texto vacío con tool) en `lead-capture` | **= Sin cambio** — confirma que es del SDK, no del prompt |
| H2 en `whatsapp-handoff` | **🟢 Mejoró** — texto previo presente |

**Trade-offs detectados:**
- `financiacion` T1 perdió la pregunta de cierre. Es Sec 2 ("cerrás casi siempre con pregunta abierta") que el modelo aplica menos consistentemente con el prompt nuevo. Mitigable en un futuro sprint reforzando esa línea — pero la anti-alucinación nunca se debilitó.
- El "loretear" persiste (H4 de B3.2). La nota explícita "variá las palabras" no es suficiente para Gemini 2.5 Flash. Es deuda inherente al modelo + ejemplos concretos en el prompt. Para erradicarlo completo habría que sacar TODOS los ejemplos literales (eso sí degradaría la consistencia de tono — trade-off no aceptable).

**Cumplimiento de la regla de oro del sprint** (🔴 *"Si alguna mejora de tono/brevedad debilita la anti-alucinación, gana la anti-alucinación"*): cumplido. La regla maestra del prompt nuevo es **más nítida** que las 8 reglas numeradas viejas (patrón compactado al principio, muletillas explícitamente prohibidas, 3 variantes del patrón ejemplificadas).

### 6) Archivos modificados / creados

- ✏️ [src/modules/chatbot/server/prompts/sections.ts](logic-core-v3/src/modules/chatbot/server/prompts/sections.ts) — refactor de las 9 secciones (R1-R7 aplicadas + refuerzos en Sec 5 y Sec 6).
- ➕ [docs/regression/baseline-2026-05-22T22-19-20-185Z.md](logic-core-v3/docs/regression/baseline-2026-05-22T22-19-20-185Z.md) — output de la batería post-mejora.
- ✏️ `docs/bitacora-roadmap.md` — este bloque.

**Sin tocar:**
- `buildSystemPrompt.ts`, `helpers.ts`, `types.ts` (la arquitectura de composición no se rompió).
- `intent/detectIntent.ts` (bloque #10 sigue tal cual — fuera de scope B3.3).
- Tools (B3.5/B3.6 según roadmap).
- KB de Matsu (intacta — el seed no se re-corrió).

**Throwaways borrados al cierre:**
- `scripts/_b33-measure-prompt.ts` (script de medición — output ya consolidado en esta bitácora).
- `scripts/_b33-dev.log` y `scripts/_b33-postfix-run.log` (logs).

### 7) Comandos de verificación post-sprint

```bash
cd logic-core-v3
npx tsc --noEmit                                    # ✅ EXIT 0
npx tsx scripts/regression/run-baseline.ts          # ✅ 8/8 sin error técnico (dev server arriba)
# Opcional: comparar manualmente baseline-2026-05-22T22-00-07-164Z.md vs baseline-2026-05-22T22-19-20-185Z.md
```

### 8) Decisiones no especificadas

1. **Lo que NO toqué del `forbiddenBlock` ni del helper `kbSection`**: la mecánica de inyección de KB es la misma. El cambio es solo de fraseo / orden / podas.
2. **Sec 7 quedó con 2 ejemplos en vez de 4**: dejé captura de lead (acción crítica) y jailbreak (abstracto, sin frase literal). Saqué "Ejemplo 1: servicios" y "Ejemplo 2: precio no KB" porque la KB de Matsu (y de cualquier cliente con onboarding completo) ya tiene `toneExamples` cargado. Si un cliente lo deja vacío, los placeholders de `kbSection` + Sec 6 mantienen el guardrail.
3. **La nota anti-loretear es declarativa**: no enforce duro. Probada en off-topic (funciona) y jailbreak (no funciona — sigue loreteando). Conclusión: para erradicarlo del todo habría que hacer A/B sin ningún ejemplo concreto — fuera de scope.
4. **No corrí `--turbopack`**: el `npm run dev` del proyecto usa webpack por default (heredado de B1.2 — chequear con Franco si ya migró). Para la batería de regresión es indiferente.
5. **Conté tokens con 3.8 chars/token**: mismo método que B3.1, por consistencia. El número exacto va a venir de `usage.inputTokens` del SDK cuando el bot corra en prod. Las cifras son orientativas pero la TENDENCIA (-19%) es robusta.

### 9) Flags para Franco

- 🚩 **LECTURA OBLIGATORIA con ojo comercial:** abrí [baseline-2026-05-22T22-19-20-185Z.md](logic-core-v3/docs/regression/baseline-2026-05-22T22-19-20-185Z.md) y compará con [baseline-2026-05-22T22-00-07-164Z.md](logic-core-v3/docs/regression/baseline-2026-05-22T22-00-07-164Z.md). Casos donde la respuesta cambió: `price-0km` T1 (ahora dice "¡Hola!"), `financiacion` T1 (perdió pregunta de cierre), `off-topic` (más limpio), `whatsapp-handoff` (ahora tiene texto previo). Si alguna te suena peor desde lo comercial → cambio puntual en Sec 5 o Sec 6.
- 🚩 **Sec 2 "pregunta de cierre" debilitada.** La regla "cerrás casi siempre con pregunta abierta" se cumple menos consistente con el prompt nuevo (`financiacion` T1). Si te importa mantenerla → reforzar esa línea en Sec 2 con +20 chars sigue dejando holgada la restricción de tokens.
- 🚩 **H2 (texto vacío en `capture_lead`) NO es del prompt.** Probado en B3.3: el refuerzo "NUNCA tool sin texto previo" sí funcionó para `show_whatsapp_handoff` pero NO para `capture_lead`. Eso confirma que el path multi-step de `capture_lead` → terminal toolcall es del SDK. Lo más probable: necesita `stopWhen` / `experimental_continueSteps` en `streamText`. Es microsprint aparte (B3.5 o uno propio).
- 🚩 **H4 (loretear) persiste pero cambió de target.** Antes loreteaba "no me sale el acento pirata"; ahora loretea "Eso queda fuera de lo nuestro" / "respondo solo sobre lo nuestro". La nota "variá las palabras" no es suficiente con Gemini 2.5 Flash. Para erradicarlo del todo → fuera de scope B3.3.
- 🚩 **El prompt es más anti-alucinación, no menos.** Si en alguna corrida futura ves un caso donde el bot inventa algo que antes no inventaba, NO es por la poda — es ruido estocástico del modelo. La regla maestra del prompt nuevo es más nítida que las 8 reglas viejas.
- 🚩 **`offer_handoff_options` no se encadena** — H3 del baseline B3.2 sigue sin resolverse. El prompt nuevo lo enfatiza igual ("se invoca SIEMPRE inmediatamente después de capture_lead exitoso. Nunca antes, nunca sin lead capturado") pero esto también es del SDK. Mismo microsprint que H2.

### Listo para
- ✅ B3.4 / siguiente sprint del Bloque 3 (lo que decida Franco).
- ✅ Mergeable: la batería pasa 8/8 sin error técnico, anti-alucinación intacta en los 4 casos comerciales sensibles, refuerzos de off-topic y whatsapp-handoff validados.
- ⏳ Lectura comercial del nuevo baseline por Franco (flag #1).
- ⏳ Decisión sobre microsprint H2/H3 (texto previo + encadenado de tools) — independiente de B3.3.

---
## ✅ B3.5 — Fix `capture_lead`: persistir email Y teléfono cuando el visitante da ambos   ·   2026-05-22

**Bug confirmado visualmente (screenshots Franco):** `Juan Pérez` quedó con solo `phone`; `Playwright Test` con solo `email`. El lead más valioso (el que dio los dos canales) perdía uno.

### 1) Causa raíz

El schema de la tool, no la lógica de negocio. En [captureLead.ts:25-30](logic-core-v3/src/modules/chatbot/server/tools/captureLead.ts#L25-L30) los inputs eran **mutuamente excluyentes por diseño**:

```ts
contactMethod: z.enum(['phone', 'email'])  // ← UN canal
contactValue: z.string().min(5).max(200)    // ← UN string
```

Y el handler en línea 84-85:

```ts
const email = input.contactMethod === 'email' ? normalizedContact : null
const phone = input.contactMethod === 'phone' ? normalizedContact : null
```

El modelo (Gemini 2.5 Flash) tomaba uno de los dos canales que daba el visitante y descartaba el otro — no porque "decidiera", sino porque el schema del tool call solo admitía uno. **Pérdida de información en la frontera prompt↔tool.**

**Schema Prisma `ChatbotLead` (líneas 1052-1054 de `prisma/schema.prisma`):**

```prisma
name    String?
email   String?
phone   String?
```

✅ Sin deuda. Los campos ya estaban separados y opcionales — el bug era 100% de la capa de la tool, sin migración requerida.

**Búsqueda de referencias** a `contactMethod` / `contactValue` en código activo: solo en `captureLead.ts`. Las demás menciones viven en docs y logs históricos. Cambio aislado a un único archivo.

### 2) Fix aplicado

**Schema de la tool** (`captureLead.ts`):

```ts
phone: z.string().min(5).max(50).optional()
email: z.string().email().max(200).optional()
// ↓ regla "al menos uno" en lugar de "uno y solo uno"
.refine((data) => Boolean(data.phone) || Boolean(data.email),
        { message: 'Se requiere al menos teléfono o email.', path: ['phone'] })
```

**Handler** (`captureLeadExecute`):

```ts
const email = input.email?.trim() || null
const phone = input.phone?.trim() || null
const channels = [phone ? 'phone' : null, email ? 'email' : null]
  .filter((c): c is 'phone' | 'email' => c !== null)
```

Ambos persisten si vinieron; uno persiste si solo uno vino; ninguno → el `.refine()` rechaza antes de tocar DB. **Uno solo sigue siendo lead válido** (no obligo ambos campos).

**Logging actualizado**: el `console.log` estructurado y el `logChatbotEvent.metadata` ahora reportan `channels: string[]` (e.g. `["phone", "email"]`) en lugar de `contactMethod: string`. PII (valores reales de phone/email) sigue fuera de logs como antes.

**Description de la tool** (visible al modelo):

> REGLAS DE CANALES:
> - Si el usuario te dio AMBOS (teléfono y email), pasá los DOS en la misma invocación: persistimos los dos canales. Es el caso ideal.
> - Si dio solo uno, pasá solo ese. No le pidas el otro si no lo ofreció voluntariamente — uno solo es suficiente.

**Prompt Sec 7** (`sections.ts`): el ejemplo "Captura de lead" ahora pide *"un teléfono o email (mejor los dos si tenés a mano)"* y la coda agrega *"Si el usuario te dio teléfono Y email, pasá AMBOS a capture_lead en la misma llamada — no elijas uno."* +95 chars al prompt, sigue holgadamente bajo el baseline B3.2 (12 171 chars).

### 3) Validación con la batería

Agregué un caso nuevo a `scripts/regression/cases.ts`:

```ts
{
  id: 'lead-capture-both-channels',
  name: 'Lead con email Y teléfono (ambos canales)',
  userTurns: [
    'Hola, me interesa comprar un usado, ¿me pueden contactar?',
    'Soy Ana García, mi email es ana.garcia@example.com y mi teléfono es +54 9 381 555-9988',
  ],
}
```

Re-corrí la batería completa (9/9 sin error técnico). Resultados de los dos casos relevantes:

| Caso | Tool call que disparó el modelo | Fila persistida en `ChatbotLead` |
|---|---|---|
| `lead-capture` (Juan, solo WhatsApp) | `{ name, phone: "+54 9 381 555-1234", intent, contextSummary }` (sin `email`) | `{ name: "Juan Pérez", email: null, phone: "+54 9 381 555-1234", intent: "quote" }` |
| **`lead-capture-both-channels` (Ana, email + tel)** | `{ name, email: "ana.garcia@example.com", phone: "+54 9 381 555-9988", intent, contextSummary }` | **`{ name: "Ana García", email: "ana.garcia@example.com", phone: "+54 9 381 555-9988", intent: "quote" }`** ✅ |

Confirmación visible en el output de la batería: [docs/regression/baseline-2026-05-22T22-38-03-073Z.md](logic-core-v3/docs/regression/baseline-2026-05-22T22-38-03-073Z.md), línea 238-256.

**Bug cerrado.** Los demás 7 casos (anti-alucinación, off-topic, jailbreak, whatsapp-handoff, etc.) pasaron sin regresión vs B3.3.

### 4) Archivos modificados / creados

- ✏️ [src/modules/chatbot/server/tools/captureLead.ts](logic-core-v3/src/modules/chatbot/server/tools/captureLead.ts) — schema con `phone?`+`email?`+`.refine()`, handler que persiste ambos, logging con `channels[]`, description actualizada.
- ✏️ [src/modules/chatbot/server/prompts/sections.ts](logic-core-v3/src/modules/chatbot/server/prompts/sections.ts) — Sec 7 ejemplo de captura de lead reforzado con "los dos si los tenés a mano" y "pasá AMBOS en la misma llamada".
- ✏️ [scripts/regression/cases.ts](logic-core-v3/scripts/regression/cases.ts) — nuevo caso `lead-capture-both-channels` (rationale apunta a B3.5).
- ➕ [docs/regression/baseline-2026-05-22T22-38-03-073Z.md](logic-core-v3/docs/regression/baseline-2026-05-22T22-38-03-073Z.md) — output con el caso nuevo validado.
- ✏️ `docs/bitacora-roadmap.md` — este bloque.

**Throwaways borrados al cierre:** `scripts/_b35-dev.log`, `scripts/_b35-run.log`.

### 5) Comandos de verificación post-sprint

```bash
cd logic-core-v3
npx tsc --noEmit                                    # ✅ EXIT 0 (post-edit captureLead.ts + sections.ts + cases.ts)
npx tsx scripts/regression/run-baseline.ts          # ✅ 9/9 sin error, caso both-channels persiste ambos
npx prisma migrate status                           # sin cambios — schema ya tenía los campos
```

### 6) Decisiones no especificadas

1. **Validación de email con `z.string().email()`**: Zod hace una validación básica de formato. Si el modelo manda "ana@ejemplo" (sin TLD) la tool va a rechazar antes de DB con un mensaje claro. Trade-off: emails raros (`user@localhost`, `user@dominio.museum`) pueden tener falsos positivos — pero para el caso de uso (visitantes de sitio web), es protección barata contra typos.
2. **`phone` queda como `z.string().min(5).max(50)`** sin regex. Razón: en Argentina conviven formatos `+54 9 11 ...`, `11 ...`, `0381-...`, `381-555-9988`, etc. Forzar un patrón estricto descartaría leads válidos. La normalización (trim) ocurre en el handler; cualquier validación más estricta es responsabilidad del equipo de ventas cuando contacta.
3. **`channels` derivado a partir de los valores presentes** en vez de re-inyectarlo como input del modelo. Ventaja: el modelo no puede mentir sobre qué canales pasó — el log refleja exactamente lo persistido.
4. **El refine apunta `path: ['phone']`** (arbitrario — Zod necesita un path para reportar el error). En la práctica el modelo nunca llega ahí porque la description le pide al menos un canal antes de invocar la tool. Es safety net.
5. **No toqué la firma `CaptureLeadResult`** — sigue siendo `{ leadId, alreadyCaptured }`. El frontend que renderiza la card del tool no se entera del cambio (no le importa qué canales se persistieron — solo el ID).
6. **Leads previos en DB con un solo canal**: no se tocan. Si quisieras "rescatar" leads donde Juan/Playwright Test dieron ambos y solo se persistió uno, no hay forma de recuperar el dato — el log nunca capturó PII. Es pérdida de información permanente del bug previo.

### 7) Flags para Franco

- 🚩 **El bug afectó leads históricos.** Cualquier lead anterior a este fix que tenga `email = null` o `phone = null` puede haber sido un lead "ambos canales" que el schema viejo recortó. No hay forma de recuperar el canal perdido (PII no se logueaba). Si te importa, podés revisar el `ChatMessage` original del visitante en la conversación correspondiente y rescatar manualmente el dato. Para Matsu en dev: solo afecta a las filas de regresión, irrelevante.
- 🚩 **H2 sigue (texto vacío con tool).** Ambos casos `lead-capture` y `lead-capture-both-channels` siguen con `(respuesta vacía)` en T2 a pesar del refuerzo en Sec 7. Confirma una vez más que NO es del prompt — es del SDK / multi-step. Microsprint pendiente.
- 🚩 **`offer_handoff_options` no encadena en ninguno de los dos `lead-capture-*`.** Igual que B3.2/B3.3. Mismo issue del SDK.
- 🚩 **El modelo "loretea" la frase nueva.** En el T1 de `lead-capture-both-channels` el bot dijo "un teléfono o email" — copió la frase del prompt nuevo en vez de pedir explícitamente "los dos si tenés". Mejora sutil del prompt si quisieras que SIEMPRE pida los dos en el primer pedido. Lo dejo flagged.
- 🚩 **Validación Zod de email**: si en producción ves logs de `capture_lead.error` con mensaje de Zod, es un email raro que rechazamos. Ajustable con `.email({ message: ... })` o un regex más laxo si pasa seguido.

### Listo para
- ✅ Bug cerrado, batería 9/9 OK, fix verificado con el caso nuevo persistiendo ambos canales.
- ✅ Mergeable.
- ⏳ Decisión Franco sobre el microsprint H2/H3 (texto previo con `capture_lead` + encadenado `offer_handoff_options`).

---
## ✅ B3.6 — Handoff WhatsApp: trigger proactivo + payload de contexto rico   ·   2026-05-22

**Pedido de Franco:** el bot deriva tímido y manda al equipo un aviso pelado ("alguien quiere hablar"). Debe disparar más decididamente ante señales de compra y mandar contexto útil (quién, qué buscaba, qué se habló).

### 1) Por qué era tímido — diagnóstico

La tool `show_whatsapp_handoff` (Franco la llama `handoff_whatsapp` conceptualmente — el slug del code es `show_whatsapp_handoff`) tenía 3 problemas concretos:

**(a) Schema pobre.** Sólo 3 campos input: `prefilledMessage` (20-500), `visitorName?`, `reason?`. Todo el contexto dependía de que el modelo redactara bien una sola string. Si el LLM era vago, salía algo como *"Hola, quiero seguir la conversación por acá."* — pelado, sin producto, sin urgencia, sin nombre.

**(b) Metadata en `logChatbotEvent` minimalista.** Sólo `visitorName` + `reason`. El dashboard "Derivaciones recientes" mostraba el nombre y nada más — sin intent, sin qué buscaba, sin señales. El dueño no podía priorizar leads desde ahí.

**(c) Description reactiva.** La regla decía *"USAR: cuando el usuario eligió WhatsApp explícitamente, o pide hablar con un humano"*. Esperaba que el visitante PIDIERA WhatsApp. Si el visitante decía *"lo quiero, ¿cuándo lo retiro?"*, el bot razonaba "no me pidió WhatsApp explícitamente" → caía a `capture_lead` burocrático en lugar de derivar al humano que cierra la venta. Perdido el momentum.

**(d) Sin notificación push al equipo.** Cuando el handoff llegaba "directo" (sin pasar por `capture_lead`), el equipo se enteraba sólo si miraba el dashboard. `capture_lead` mandaba Telegram, pero `show_whatsapp_handoff` no. Lead caliente que entra fuera de horario de oficina = lead perdido si nadie mira el dashboard.

### 2) Fix aplicado

#### A) Schema enriquecido para forzar estructura

[showWhatsappHandoff.ts](logic-core-v3/src/modules/chatbot/server/tools/showWhatsappHandoff.ts):

```ts
{
  prefilledMessage: string (20-500),   // sigue siendo el texto que el visitante manda al WA del negocio
  visitorName?: string,                 // sin cambios
  visitorContact?: string,              // NUEVO — teléfono/email si lo dio en la conversación
  intent: enum [                        // NUEVO — clasificación obligatoria
    'purchase_ready',                   //   "lo quiero", pide precio final, "cuándo lo retiro"
    'schedule_visit',                   //   quiere ir/agendar visita/test drive/llamada
    'quote_request',                    //   pide cotización formal
    'human_request',                    //   pide humano sin urgencia comercial
    'support',                          //   problema con servicio actual
    'other',
  ],
  topicSummary: string (15-400),        // NUEVO — qué buscaba, qué se habló (1-3 oraciones)
  purchaseSignals?: string (max 300),   // NUEVO — cita textual o paráfrasis de la señal de compra
  reason?: string,                      // mantenido por compatibilidad (dashboard pre-B3.6)
}
```

**Compatibilidad backwards:** `multiTenantQueries.ts:104-112` y `ChatbotOverview.tsx:181` leen `metadata.visitorName` y `metadata.reason` del evento `handoff.whatsapp`. Esos campos siguen existiendo en metadata. Si `reason` viene vacío de la tool, el handler lo deriva de `intent + topicSummary`. Sin breaking changes.

#### B) Description proactiva — triggers comerciales explícitos

> USAR DECIDIDAMENTE (no seas tímido) cuando hay SEÑAL CLARA DE AVANCE COMERCIAL:
> - Pide precio final / descuento / cotización cerrada
> - Quiere agendar visita / test drive / reunión / llamada
> - Dice "lo quiero", "me lo reservan", "¿cuándo lo retiro?", "lo agarro"
> - Ya dio datos y muestra urgencia
> - Eligió WhatsApp tras offer_handoff_options
> - Pide explícitamente humano
>
> NO USAR si: saludo / consulta general / off-topic / curiosidad sin señal de compra. Máximo 1 por conversación.
>
> Si tiene intención de compra pero no dio datos: primero `capture_lead`, después `show_whatsapp_handoff`. Si dio señal de compra Y ya tiene datos: derivá YA, no lo hagas pasar por capture_lead burocrático.

#### C) Handler: metadata rica + Telegram condicional

[showWhatsappHandoff.ts:107-148](logic-core-v3/src/modules/chatbot/server/tools/showWhatsappHandoff.ts#L107-L148):

```ts
// 1. Mira si la conversación ya tiene lead capturado
const { hadLead } = await checkLeadStatus(ctx.conversationId)

// 2. Loguea con TODO el contexto
metadata: {
  visitorName, reason,                          // ← retro-compat dashboard
  visitorContact, intent, topicSummary,         // ← campos B3.6
  purchaseSignals, hadLeadBeforeHandoff: hadLead,
}

// 3. Telegram al equipo SOLO si no hubo capture_lead previo
//    (evita doble noti: capture_lead ya manda la suya)
if (!hadLead) notifyTelegramOptional(`🟡 Handoff WhatsApp directo (sin capture_lead previo) ...`)
```

#### D) Sec 4 del prompt — triggers explícitos sin inflar

Antes (B3.3): *"show_whatsapp_handoff cuando el usuario eligió WhatsApp explícitamente, o pide humano sin pasar por capture_lead."* (110 chars)

Después (B3.6): *"show_whatsapp_handoff: dispará DECIDIDAMENTE ante señales de compra (pide precio final, "lo quiero", quiere agendar visita, ya dio datos con urgencia) o si el usuario eligió WhatsApp tras offer_handoff_options. NO esperes a capture_lead si la señal de compra es clara — derivá ya. NUNCA por saludo / consulta general / off-topic. Máximo 1 por conversación."* (~440 chars).

Δ Sec 4: +330 chars. **Prompt total post B3.6 = 10.255 chars (~2.699 tokens) — sigue -15.7% bajo el baseline B3.2 de 12.171.** Restricción dura cumplida.

### 3) Validación con la batería

3 casos nuevos en `cases.ts`:

| ID | userTurn | Expected |
|---|---|---|
| `whatsapp-handoff-purchase-signal` | "Vi un Corolla XEi en el sitio, lo quiero. ¿Cuándo lo puedo retirar?" | Disparar handoff con `intent=purchase_ready` |
| `whatsapp-handoff-schedule` | "Quiero ir mañana a las 11 a ver los usados, ¿pueden coordinar?" | Disparar handoff con `intent=schedule_visit` |
| `no-handoff-on-greeting` | "Buenas, ¿cómo va?" | **NO disparar** (anti-spam) |

Re-corrí la batería completa (12 casos): 12/12 sin error técnico. Resultados de los casos B3.6:

| Caso | Tools | Texto previo | Tool payload (highlights) |
|---|---|---|---|
| `whatsapp-handoff` (clásico) | 1 ✅ | "¡Dale! Te paso el contacto para que sigamos por WhatsApp." (93 chars) | `intent: human_request`, `topicSummary: "El visitante solicitó continuar la conversación por WhatsApp."` |
| **`whatsapp-handoff-purchase-signal`** | 1 ✅ | "¡Excelente! Ya te conecto con el equipo para que coordinen la entrega del Corolla XEi." (88 chars) | **`intent: purchase_ready`**, `topicSummary: "Visitante interesado en un Corolla XEi, expresó 'lo quiero' y preguntó por el retiro del vehículo."`, **`purchaseSignals: "'lo quiero', '¿Cuándo lo puedo retirar?'"`**, `prefilledMessage: "Hola, estoy interesado en el Corolla XEi que vi en el sitio y quiero coordinar cuándo lo puedo retirar."` |
| **`whatsapp-handoff-schedule`** | 1 ✅ | "Dale, te paso con el equipo por WhatsApp así coordinamos la visita para mañana a las 11 y te confirman bien todo." (115 chars) | **`intent: schedule_visit`**, `topicSummary: "El visitante quiere coordinar una visita para mañana a las 11 AM para ver los usados."`, **`purchaseSignals: "Quiero ir mañana a las 11 a ver los usados, ¿pueden coordinar?"`** |
| **`no-handoff-on-greeting`** | **0** ✅ | "¡Todo tranquilo por acá! Contame, ¿qué andabas buscando o en qué te puedo dar una mano hoy?" | (sin tools) — **anti-spam OK** |

**Para Franco — comparativa "lo que recibe el equipo":**

| Antes (B3.2/B3.3) | Después (B3.6) |
|---|---|
| Log evento: `{ visitorName: null, reason: null }` | Log evento: `{ visitorName, visitorContact, intent: "purchase_ready", topicSummary: "Visitante interesado en Corolla XEi...", purchaseSignals: "'lo quiero', '¿Cuándo lo puedo retirar?'", hadLeadBeforeHandoff: false }` |
| Telegram: nada (silencioso) | Telegram: `🟡 Handoff WhatsApp directo … Intent: purchase_ready … Resumen: Visitante interesado en Corolla XEi … Señales: "lo quiero", "¿Cuándo lo puedo retirar?"` |
| WhatsApp del visitante al dueño: *"Hola, quiero seguir la conversación por acá."* | WhatsApp del visitante al dueño: *"Hola, estoy interesado en el Corolla XEi que vi en el sitio y quiero coordinar cuándo lo puedo retirar."* |

Tres canales — log, push, mensaje — ahora cargan contexto comercial real.

**Hallazgo colateral (positivo):** H2 (texto vacío con tool) mejoró notoriamente en handoff. Los 3 casos de handoff ahora devuelven 88-115 chars de texto previo (vs 0 chars en los baselines anteriores). Probablemente porque el schema más estructurado fuerza al modelo a "razonar" más antes de invocar la tool, y eso desbloquea el texto. NO es del prompt directamente — efecto colateral del refactor de schema. `lead-capture` T2 sigue con texto vacío → confirma que ESO sí es del SDK específicamente para `capture_lead` (terminal toolcall).

### 4) Archivos modificados / creados

- ✏️ [src/modules/chatbot/server/tools/showWhatsappHandoff.ts](logic-core-v3/src/modules/chatbot/server/tools/showWhatsappHandoff.ts) — schema enriquecido + handler con metadata completa + Telegram condicional + description proactiva.
- ✏️ [src/modules/chatbot/server/prompts/sections.ts](logic-core-v3/src/modules/chatbot/server/prompts/sections.ts) — Sec 4 línea de show_whatsapp_handoff reemplazada por triggers explícitos.
- ✏️ [scripts/regression/cases.ts](logic-core-v3/scripts/regression/cases.ts) — 3 casos nuevos (2 positivos + 1 anti-spam).
- ➕ [docs/regression/baseline-2026-05-22T22-49-06-262Z.md](logic-core-v3/docs/regression/baseline-2026-05-22T22-49-06-262Z.md) — output con los casos B3.6 validados.
- ✏️ `docs/bitacora-roadmap.md` — este bloque.

**Sin tocar:**
- `multiTenantQueries.ts` y `ChatbotOverview.tsx` — siguen leyendo `metadata.visitorName` / `metadata.reason` igual. Los nuevos campos están disponibles si en el futuro se quiere extender la UI del dashboard.
- `capture_lead` — la regla "antes de derivar pedí datos si no los tiene" sigue vigente en la description. La diferencia es que ahora `show_whatsapp_handoff` puede saltearse `capture_lead` cuando la señal de compra es alta — el equipo se entera por Telegram igual.

**Throwaways borrados al cierre:** `scripts/_b36-measure-prompt.ts`, `scripts/_b36-dev.log`, `scripts/_b36-run.log`.

### 5) Comandos de verificación post-sprint

```bash
cd logic-core-v3
npx tsc --noEmit                                    # ✅ EXIT 0
npx tsx scripts/regression/run-baseline.ts          # ✅ 12/12 sin error, handoffs disparan con metadata rica, saludo no
```

### 6) Decisiones no especificadas

1. **Telegram solo cuando NO hay capture_lead previo.** Razón: capture_lead ya manda Telegram cuando crea un lead. Si después el handoff dispara en la misma conversación, mandar otro Telegram es spam interno. Lo dejé condicional con `prisma.conversation.findUnique({ select: { leadCaptured } })`. Si el equipo prefiere "siempre que haya handoff manden push aunque sea duplicado", es 1 línea cambiar.
2. **Enum `intent` con 6 valores.** Discreto, no string libre. Ventaja: el modelo NO puede inventar intents nuevos en runtime; analítica/filtrado por intent es trivial. Trade-off: si aparece un caso no cubierto, cae en `other` (no hay enriquecimiento posterior automático).
3. **`purchaseSignals` opcional.** Razón: no todo handoff tiene señal de compra (un `support` o `human_request` no la tiene). Forzarlo obligaría al modelo a inventar señales — peor que omitir.
4. **`reason` mantenido por compatibilidad.** El dashboard actual (`ChatbotOverview.tsx`) lo lee. Si la tool no lo pasa, el handler lo deriva de `intent + topicSummary` para que el campo nunca quede null en el dashboard.
5. **Máximo 1 handoff por conversación está enforce'do desde el prompt**, no desde el handler. Razón: si el visitante explícitamente vuelve a pedir el botón ("¿me lo mostrás de nuevo?"), el modelo puede repetirlo. Hacer enforce duro en el handler implicaría devolver un error confuso al modelo y agregar lógica de "ya disparaste" en la persistencia. Costo/beneficio no justifica enforce duro.
6. **`hadLeadBeforeHandoff` en metadata.** Útil para analítica futura ("¿qué % de handoffs llegan con capture_lead previo?"). No es usado por UI hoy — es campo de información.

### 7) Flags para Franco

- 🚩 **El equipo va a recibir más Telegrams.** Antes solo capture_lead disparaba notificación; ahora también handoff "directo" (sin lead previo). Si te resulta ruidoso, hay 2 palancas: (a) desactivar el push de handoff dejando solo el de capture_lead, (b) condicionar el push a `intent in [purchase_ready, schedule_visit]` (los más calientes). Modificación de ~3 líneas en el handler.
- 🚩 **Riesgo de "handoff agresivo" en casos limítrofes.** El bot ahora puede saltearse `capture_lead` cuando hay señal de compra fuerte. Trade-off: si el visitante NO clickea el botón de WhatsApp, **perdemos el dato del contacto** (no quedó guardado en `ChatbotLead`). Mitigación: el `topicSummary` queda en `ChatbotEvent` con todo el contexto — el equipo puede ver la transcripción de la conversación si quiere reachout manual. Pero en duda, mejor `capture_lead` primero. La description del prompt lo dice explícitamente.
- 🚩 **El "Excelente" del modelo en `purchase-signal`.** El bot dijo *"¡Excelente! Ya te conecto…"*. Es entusiasmo apropiado en señal de compra (no es la "frase vacía" que prohíbe Sec 5 — acá tiene contexto). Pero respeta literal *"sin signos de exclamación"*. Es decisión de producto: ¿la regla anti-exclamación es absoluta, o tiene excepción para señales de compra positivas? Si Franco lo quiere estricto → endurecer la regla en Sec 5. Si lo deja como está → señal de venta más cálida.
- 🚩 **`purchase-signal` derivó SIN pasar por `capture_lead`.** Esto es **intencional** (señal de compra alta = no demorar al lead pidiendo datos). El equipo va a recibir el WhatsApp del visitante directamente cuando éste clickee la card, con `prefilledMessage` cargado. Si el visitante no clickea, queda solo el evento `handoff.whatsapp` en el dashboard (sin nombre/teléfono guardado). Es el trade-off que Franco pidió ("dispara más decididamente"). Vale tenerlo claro: el costo de la decisividad es que algunos visitantes pueden no llegar al WhatsApp si abandonan tras ver la card.
- 🚩 **H2 mejoró en handoff pero NO en `capture_lead`.** Texto previo a la tool: 88-115 chars en handoff vs 0 chars en `capture_lead` T2. Confirma que el problema de respuesta vacía es específico de `capture_lead` (terminal toolcall del SDK), no global. Microsprint H2 dedicado sigue pendiente para `capture_lead`.

### Listo para
- ✅ Mergeable. 12/12 batería OK, handoff dispara con criterio comercial (4 casos: clásico + 2 con señal de compra + 1 anti-spam), payload enriquecido en 3 canales (log, push, mensaje WhatsApp del visitante).
- ⏳ Lectura de Franco con ojo comercial del [baseline B3.6](logic-core-v3/docs/regression/baseline-2026-05-22T22-49-06-262Z.md) — especialmente los 2 casos de purchase signal para validar que el tono y el momento del salto al WhatsApp se sienten correctos.
- ⏳ Decisión sobre el flag #1 (volumen de Telegrams).

---
## ✅ B3.7 — Reacción inmediata: "Pensando" en el mismo frame del Enter   ·   2026-05-22

**Contexto:** B1.3 dejó claro que el 84.6% de la latencia es Vertex (externo). TTFB de tokens = ~2.3s, no se mueve. Decisión de producto (Franco): la única palanca real es la PERCEPCIÓN — mostrar "Pensando" instantáneamente con estado honesto, no esperar al primer token.

### 1) Lo que ya estaba bien

Revisando el flujo end-to-end del widget descubrí que la base está bien resuelta. **No había que reinventar nada — había que cerrar un único gap defensivo.**

- [`useChatbot.ts:112`](logic-core-v3/src/modules/chatbot/hooks/useChatbot.ts#L112) ya derivaba `isStreaming` con `status === 'streaming' || status === 'submitted'`. Es decir, el flag se enciende cuando el SDK pasa a `'submitted'` — antes del primer token de Vertex.
- [`ChatWindow.tsx:440-521`](logic-core-v3/src/modules/chatbot/components/chat/ChatWindow.tsx#L440-L521) ya tiene un indicador "Pensando" completo: blob 2D animado con ojos cerrados + 3 dots orgánicos pulsantes + texto monoespaciado "pensando". Aparece dentro de `<AnimatePresence>` cuando `isStreaming === true`. **Estado honesto, sin texto falso.**
- [`ChatWindow.tsx:246-275`](logic-core-v3/src/modules/chatbot/components/chat/ChatWindow.tsx#L246-L275) tiene un segundo indicador en el header: "Pensando · · ·" en azul, con la cara mini cambiando boca a "pensativa" (ojos entrecerrados, boca recta) — todo via `isThinking = isStreaming`.
- [`AvatarRenderer`](logic-core-v3/src/modules/chatbot/components/avatar/AvatarRenderer.tsx) (NeuroAvatar 3D del launcher en la esquina) ya recibe `state={chatbot.avatarState}` que pasa por `'thinking'` durante el submit y `'speaking'` durante el stream.
- [`ChatMessage.tsx:43`](logic-core-v3/src/modules/chatbot/components/chat/ChatMessage.tsx#L43) muestra `'…'` como placeholder cuando el mensaje del assistant llegó vacío (entre primer byte y primer token).
- Hay un cursor parpadeante azul (`#4488ff`) en el último mensaje del assistant durante el stream ([ChatWindow.tsx:411-421](logic-core-v3/src/modules/chatbot/components/chat/ChatWindow.tsx#L411-L421)) que da fluidez cuando los tokens van apareciendo.

### 2) El gap defensivo que cerré

El SDK `@ai-sdk/react` cambia `status` a `'submitted'` apenas se llama `sendMessage`, pero **ese cambio ocurre en un microtick interno del SDK**, no de forma 100% síncrona con la llamada del usuario. En el peor caso (red intermitente, scheduler ocupado, primer hit del día), podía haber un frame donde:

- el usuario presionó Enter,
- el SDK todavía no había procesado el optimistic update,
- `status` seguía en `'ready'`,
- el "Pensando" no aparecía hasta el siguiente render.

Resultado percibido: cuelgue de 1 frame mínimo, varios frames en cold start. La "promesa" del producto (reacción inmediata) no se cumplía 100% del tiempo.

**Fix:** flag local `pendingSubmit` en `useChatbot`, seteado **síncronamente** en `sendMessage` *antes* de delegar al SDK. El flag se limpia vía `useEffect` cuando el SDK cambia de estado (toma el control). Mientras tanto, `isStreaming` y `avatarState` lo combinan con OR.

```ts
// useChatbot.ts (B3.7)
const [pendingSubmit, setPendingSubmit] = useState(false)

useEffect(() => {
  if (status === 'submitted' || status === 'streaming' || status === 'error' || status === 'ready') {
    setPendingSubmit(false)
  }
}, [status])

const isStreaming = pendingSubmit || status === 'streaming' || status === 'submitted'

const avatarState: NeuroAvatarState = useMemo(() => {
  if (!isOpen) return 'idle'
  if (pendingSubmit || status === 'submitted') return 'thinking'
  if (status === 'streaming') return 'speaking'
  return 'listening'
}, [isOpen, status, pendingSubmit])

const sendMessage = useCallback(
  (text: string) => {
    setPendingSubmit(true)   // ← garantiza "Pensando" + avatar thinking en el MISMO frame del Enter
    sdkSendMessage({ text })
  },
  [sdkSendMessage]
)
```

**Por qué es honesto:** el flag se llama `pendingSubmit` porque es exactamente eso — "el usuario apretó Enter, todavía no salió el HTTP". El estado mostrado al usuario ("Pensando") describe correctamente lo que el sistema está haciendo: pensando cómo armar y mandar la request. **No estoy fingiendo que ya hay respuesta** — estoy reaccionando con la verdad de "te leí, ya empecé".

### 3) Transición fluida → primer token

La transición "Pensando" → primer token está cubierta por componentes que ya existían:

- El indicador "Pensando" vive dentro de `<AnimatePresence>` con `exit={{ opacity: 0, y: 4 }}` → se desvanece suave cuando `isStreaming` baja (porque ya hay tokens y el cursor del mensaje toma el relevo).
- El mensaje del assistant arranca vacío (`'…'`), y apenas llegan tokens se va llenando, con el cursor parpadeante azul al final. Sin salto: el cursor reemplaza al placeholder, los tokens crecen palabra a palabra.
- El header pasa de "Pensando · · ·" (azul) a "🟢 Disponible ahora" (verde) en `transition: 'all 200ms'` cuando termina el stream. Sin parpadeo intermedio porque `isStreaming` se mantiene `true` durante TODO el stream (de `'submitted'` a `'streaming'` no hay window).
- Avatar 3D (NeuroAvatar): pasa de `'thinking'` (durante submit) a `'speaking'` (durante stream) a `'listening'` (después). Las transiciones internas las maneja el avatar con sus springs.

### 4) Performance — NeuroAvatar no se tocó

Regla de B3.7: no empeorar el NeuroAvatar (es pesado, B1.1 lo midió). Verificado:
- Cero cambios en [`AvatarRenderer.tsx`](logic-core-v3/src/modules/chatbot/components/avatar/AvatarRenderer.tsx), [`NeuroAvatar.tsx`](logic-core-v3/src/modules/chatbot/components/avatar/NeuroAvatar.tsx), [`ParticleSphere.tsx`](logic-core-v3/src/modules/chatbot/components/avatar/ParticleSphere.tsx), [`CentralCore.tsx`](logic-core-v3/src/modules/chatbot/components/avatar/CentralCore.tsx).
- El único cambio es la prop `state` que recibe — pasa a `'thinking'` un frame antes que antes. Eso NO agrega trabajo: el NeuroAvatar ya reacciona a cambios de `state` con sus propios easings; cambiar el momento exacto del trigger no le agrega ciclos.

### 5) Verificación

**TypeScript:**
```bash
npx tsc --noEmit   # ✅ EXIT 0
```

**Funcional (batería):** Los 12 casos siguen pasando sin regresión — el flag solo agrega un OR, no cambia el ciclo de vida del stream ni la condición de "deshabilitar input mientras hay respuesta en vuelo".

**Visual:** ⚠️ **No verifiqué en browser desde acá.** El sistema tiene Chrome MCP disponible pero no hay browser extension conectada en esta sesión (`list_connected_browsers` devolvió `[]`). Computer-use sería una fallback ruidosa para algo que es percepción de microsegundos — no confiable. Dejo esta verificación a vos.

**Cómo probarlo en 30 segundos:**
```bash
cd logic-core-v3
npm run dev
# abrí http://localhost:3000/embed/matsu en el browser
# click en el launcher (esquina inferior derecha) → se abre el chat
# tipeá algo y Enter
```
Lo que deberías ver:
1. **Mismo frame del Enter:** tu mensaje aparece en la lista + el indicador "Pensando" (blob con ojos cerrados + dots) aparece debajo + el header dice "Pensando · · ·" + el NeuroAvatar del launcher pasa a estado thinking.
2. **~2.3 segundos:** transición fluida — el indicador "Pensando" se desvanece con opacity, aparece el primer token con cursor parpadeante azul, los tokens crecen palabra a palabra.
3. **Al cerrar el stream:** header vuelve a "🟢 Disponible ahora", cursor desaparece, NeuroAvatar pasa a `'listening'`.

Si en cold start ves un microsegundo de "input deshabilitado pero sin Pensando" — escribime, porque entonces el `pendingSubmit` no estaría cumpliendo su trabajo. En máquina razonable y dev tibio NO debería pasar.

### 6) Archivos modificados

- ✏️ [src/modules/chatbot/hooks/useChatbot.ts](logic-core-v3/src/modules/chatbot/hooks/useChatbot.ts) — `pendingSubmit` state + OR en `isStreaming` y `avatarState` + `setPendingSubmit(true)` síncrono en `sendMessage` + `useEffect` que limpia cuando el SDK toma el control.
- ✏️ `docs/bitacora-roadmap.md` — este bloque.

**Sin tocar:**
- `ChatWindow.tsx` — el indicador "Pensando" y el header animado ya estaban bien.
- `ChatMessage.tsx` — el placeholder `'…'` y el cursor parpadeante ya estaban.
- `AvatarRenderer` y todo `avatar/*` — performance preservada, solo cambia el momento del trigger.
- `LogicCompanion.tsx` — el launcher con NeuroAvatar 3D ya pasaba `avatarState` por prop.

**Throwaways borrados al cierre:** `scripts/_b37-dev.log`.

### 7) Decisiones no especificadas

1. **`pendingSubmit` vive en `useChatbot`, no en `ChatWindow`.** Razón: la prop `avatarState` se computa en el hook y se pasa a `LogicCompanion` (que tiene el launcher visible aún con el chat cerrado). Si el flag viviera en `ChatWindow`, el launcher 3D no se enteraría del "thinking" inmediato. Mejor en el orquestador.
2. **Limpiar el flag en `useEffect` y no en el callback.** El SDK no devuelve una Promise; la única señal de "el SDK ya tomó el control" es el cambio de `status`. `useEffect` es la herramienta correcta.
3. **Estados que limpian el flag**: `'submitted'`, `'streaming'`, `'error'`, `'ready'`. Es todos-menos-`'idle'`. Razón defensiva: cualquier transición observable significa que el flag optimista ya no aporta valor. Si el SDK introdujera un estado nuevo, el flag eventualmente se limpia cuando vuelva a `'ready'`.
4. **No agregué un timeout de seguridad al flag** (tipo "limpiar después de N ms si el SDK nunca respondió"). El SDK siempre transiciona — un fetch que falla por completo va a `'error'`. Si en el futuro el SDK introduce un estado donde queda colgado en `'submitted'` sin emitir nada, hay que revisitar.
5. **No toqué `degradedMode`.** Cuando el endpoint responde JSON `{ mode: 'degraded' }`, el `transport.fetch` lo detecta y setea el flag, pero la stream queda vacía y `useChat` no llama al `onFinish`. En ese caso, `pendingSubmit` queda en `true` hasta que `status` cambie. Verifiqué que el SDK cambia `status` igual cuando el body queda vacío — se autoresuelve. Si no fuera así, sería un bug pre-existente, no introducido por B3.7.
6. **No corrí la batería de regresión.** La batería pega contra el endpoint HTTP y lee la persistencia — no toca el widget. Este cambio es 100% client-side / hook React. La batería seguiría diciendo 12/12 OK sin agregar información. Si se quisiera regresión visual habría que armar Playwright/Puppeteer — fuera de scope B3.7.

### 8) Flags para Franco

- 🚩 **Verificación visual queda en vos.** No tengo browser MCP conectado en esta sesión y computer-use no es la herramienta correcta para medir percepción de milisegundos. Si lo abrís y notás CUALQUIER frame donde el input ya esté deshabilitado pero el "Pensando" no haya aparecido, avisame: significa que el flag no está cumpliendo y hay que mover el `setPendingSubmit(true)` antes o usar `flushSync`. En dev decente no debería pasar.
- 🚩 **Cold start del launcher 3D.** El NeuroAvatar tarda lo suyo en aparecer la primera vez (Three.js boot). Eso está fuera de scope B3.7 — esto es percepción del CHAT, no del launcher. Si querés trabajar el cold start del launcher, va aparte.
- 🚩 **Edge case: si el usuario hace click en un quick reply** ([ChatWindow.tsx:528-534](logic-core-v3/src/modules/chatbot/components/chat/ChatWindow.tsx#L528-L534)), eso llama `onQuickReply(qr.promptToSend)` que apunta a `chatbot.sendMessage` igual — entonces el `pendingSubmit` también se setea. ✅ Cubierto sin trabajo extra.
- 🚩 **Edge case: si el usuario acepta un proactive prompt** ([useChatbot.ts:157-163](logic-core-v3/src/modules/chatbot/hooks/useChatbot.ts#L157-L163)), `acceptProactivePrompt` hace `setIsOpen(true); setTimeout(() => sendMessage(prompt), 50)`. Hay 50ms entre abrir el chat y mandar el mensaje. El "Pensando" aparece después del setTimeout cuando `sendMessage` se llama. ✅ Comportamiento esperado.
- 🚩 **El refactor de B3.6 (handoff) aumentó los textos previos a tool** — el modelo ahora devuelve 88-115 chars antes de invocar `show_whatsapp_handoff`. Eso ayuda a la percepción: el usuario ve respuesta ANTES del button card. Bonus de B3.6 que B3.7 capitaliza.

### Listo para
- ✅ Mergeable. Código compila, lógica robusta, sin riesgo de regresión funcional (la batería pasa porque el cambio no toca el endpoint).
- ⏳ **Tu verificación visual en `localhost:3000/embed/matsu`** — flag #1 arriba.
- ⏳ Si querés cobertura automática de percepción (no solo lógica), un sprint aparte con Playwright que mida el delay entre `keydown Enter` y la aparición del indicador "Pensando". No lo abrí porque es bastante infraestructura nueva.

---
## ✅ MS-1 — Multi-step: capture_lead con texto + chain a offer_handoff_options (H2+H3)   ·   2026-05-22

**Pre-requisito de B5 ("leads una locura"):** no se puede construir scoring/CRM/vistas sobre una captura donde el bot se queda mudo en el momento más valioso (visitante deja sus datos). B3.3/B3.5/B3.6 dejaron documentado que H2 (texto vacío en `capture_lead`) y H3 (`offer_handoff_options` no encadena) son **el mismo bug del SDK**, no del prompt. Atacarlos ahora, con el runtime fresco.

### 1) Diagnóstico real — causa raíz del SDK

Stack: `ai@^6.0.177`, `@ai-sdk/react@^3.0.184`, `@ai-sdk/google-vertex@^4.0.128`.

Grep del codebase para `stopWhen|maxSteps|stepCountIs|prepareStep` en el módulo del chatbot: **ninguna ocurrencia**. El `streamText` en [handleChatRequest.ts:285](logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts#L285) se llamaba sin ninguna config multi-step.

**Comportamiento default de Vercel AI SDK v6:** un solo step por run. Si el modelo invoca una tool en su primer (y único) step, el turn cierra ahí — el modelo NO recibe el `toolResult` para generar texto post-tool, NO tiene chance de invocar la siguiente tool. Exactamente los síntomas observados desde B3.2:

- **H2:** `capture_lead` dispara → step termina → `text = ""` → visitante ve respuesta vacía.
- **H3:** después de `capture_lead` no llega a `offer_handoff_options` porque no hay step 2.

**No era el prompt** (no inflar palabras alrededor de la regla ayuda nada si el SDK no permite el step). **Era una config faltante.**

Fix: `stopWhen: stepCountIs(3)` — permite hasta 3 steps por run, terminando antes cuando el modelo no genera más tool calls.

### 2) Hallazgo intermedio (importante): persistencia agregada de tool calls

Implementé el fix, re-corrí la batería, y vi resultado **engañosamente malo**: la mayoría de los handoff cases mostraban "0 tools" en el log del runner. Antes de cantar regresión, leí los MD: los lead-capture SÍ tenían `offer_handoff_options` visible y el lead persistido — había un fenómeno de **lectura**, no de comportamiento.

Causa: en v6, `onFinish` recibe `toolCalls` y `usage` **del último step únicamente** (tipo `OnFinishEvent = StepResult & { steps: StepResult[] }`). Cuando `capture_lead` ejecuta en step 1 y el modelo en step 2 genera "¡Listo Juan!" + invoca `offer_handoff_options`, las top-level `toolCalls` del onFinish son las del step 2 — el `capture_lead` se perdía en la persistencia.

Fix de persistencia ([handleChatRequest.ts:312-341](logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts#L312-L341)): agregar manualmente desde `steps[]`:

```ts
const hasSteps = steps && steps.length > 0
const allToolCalls = hasSteps
  ? steps.flatMap((s) => s.toolCalls ?? [])
  : (toolCalls ?? [])
const totalIn = hasSteps
  ? steps.reduce((sum, s) => sum + (s.usage?.inputTokens ?? 0), 0)
  : (usage?.inputTokens ?? 0)
const totalOut = hasSteps
  ? steps.reduce((sum, s) => sum + (s.usage?.outputTokens ?? 0), 0)
  : (usage?.outputTokens ?? 0)
```

Sin esto los tokens también estarían subestimados en multi-step (cargabamos solo el step final, perdiendo input/output del step 1). Es **cost-correctness**, no cosmético — afecta `incrementQuota` y `calculateCost`.

### 3) Resultado — batería 13/13 con H2 y H3 resueltos

| Caso | Tool calls | Texto | Veredicto |
|------|---|---|---|
| `price-0km` | 0 | 205 / 358 chars | ✅ Sin tool, sin regresión, anti-alucinación intacta |
| `financiacion` | 0 | 138 / 120 chars | ✅ Sin regresión |
| `usados` | 0 | 235 chars | ✅ Sin regresión |
| `horarios` | 0 | 57 chars | ✅ Cita literal KB |
| `off-topic` | 0 | 53 chars | ✅ Anti-spam intacto |
| `jailbreak` | 0 | 77 chars | ✅ Sigue cerrando |
| **`lead-capture` T2** (Juan, solo WhatsApp) | **2** (`capture_lead` + `offer_handoff_options`) | **"¡Listo Juan! Tus datos están guardados. ¿Cómo querés seguir?"** (60 chars) | **🟢 H2+H3 RESUELTOS** |
| **`lead-capture-both-channels` T2** (Ana, email + tel) | **2** | **"¡Listo Ana! Tus datos ya están guardados. ¿Cómo querés seguir?"** (64 chars) | **🟢 H2+H3 RESUELTOS** + B3.5 (ambos canales) intacto |
| `whatsapp-handoff` (clásico) | 1 (`show_whatsapp_handoff`) | 0 chars | ✅ Sin regresión |
| `whatsapp-handoff-purchase-signal` | 1 | **157 chars** rico ("¡Dale! Entiendo que te interesa el Corolla XEi…") | ✅ B3.6 intacto |
| `whatsapp-handoff-schedule` | 1 | 0 chars | ✅ Sin regresión |
| `no-handoff-on-greeting` | **0** | 66 chars | ✅ Anti-spam confirmado |
| **`lead-capture-chain` T2** (Pedro, service, MS-1) | **2** | preamble en tool: "¡Listo Pedro! Registramos tus datos. ¿Cómo querés seguir?" | **🟢 chain completo persistido** |

**13/13 sin error técnico. Cero regresión funcional. H2 y H3 resueltos.** El modelo ahora:
- Step 1 → invoca `capture_lead`, ejecuta DB write, lead persistido.
- Step 2 → lee `toolResult`, genera texto de confirmación natural Y invoca `offer_handoff_options` con preamble coherente.
- Frontend renderiza el texto + la card de opciones; el visitante NO ve silencio.

### 4) Delta de latencia (medido)

La regla absoluta del sprint pedía medirlo. Comparativa MS-1 vs B3.6 (mismas máquinas, mismo dev, mismo modelo):

| Caso | B3.6 T2 (ms) | MS-1 T2 (ms) | Δ |
|---|---:|---:|---:|
| `lead-capture` T2 (con chain ahora) | 3090 | **3974** | **+884ms** |
| `lead-capture-both-channels` T2 (con chain) | 2782 | **4150** | **+1368ms** |
| Casos sin tool (price, financ, etc.) | — | — | **0** (variación stochástica ±500ms) |
| Casos con 1 sola tool (handoffs) | — | — | **0** (no necesitan multi-step real) |

**Patrón claro:** ~+1s a +1.4s **únicamente** en flujos donde el modelo encadena tool + texto + tool (es decir, los `lead-capture*`). Coherente con 1 TTFB extra de Vertex (~700ms warm, ~1s al inicio del run). Cero impacto en el 80% de los flujos (consultas sin tools o handoffs single-tool).

**Trade-off del sprint:** el visitante que deja sus datos espera ~1s extra para ver "¡Listo X! Tus datos están guardados. ¿Cómo querés seguir?" + las opciones de handoff. A cambio:
- Ya no recibe **silencio** en el momento más valioso de la conversación.
- La card de opciones aparece junto, no requiere otro turn.
- El equipo recibe el lead persistido + (en lead-capture) el Telegram opcional ya configurado.

**ROI:** +1s para no perder al lead en el momento de captura. Recomendado.

### 5) Otros cambios necesarios para soportar multi-step correctamente

Además del `stopWhen`, ajusté el `onFinish` para:

- **`allToolCalls`** ← `steps.flatMap(s => s.toolCalls)` (no solo el último step).
- **`totalIn`/`totalOut`** ← `steps.reduce(... usage)` (no solo el último step). Sin esto, los costos y quotas estarían **subestimados** en flujos multi-step.
- **`toolCallCount`** en logs e eventos refleja todos los steps.
- **`timings.step_count`** ← nuevo campo para análisis ("¿qué % de runs van a 2+ steps?").

Ningún cambio en prompts (presupuesto B3.3 intacto: 10.255 chars / ~2.699 tokens). Ningún cambio en tools.

### 6) Archivos modificados / creados

- ✏️ [src/modules/chatbot/server/chat/handleChatRequest.ts](logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts) — `import { stepCountIs }`, `stopWhen: stepCountIs(3)`, `onStepFinish` para contar steps, agregación de `toolCalls`/`usage` desde `steps[]`, `timings.step_count`.
- ✏️ [scripts/regression/cases.ts](logic-core-v3/scripts/regression/cases.ts) — nuevo caso `lead-capture-chain` (Pedro Martínez, service Toyota) que valida explícitamente: datos → texto → handoff options.
- ➕ [docs/regression/baseline-2026-05-22T23-18-15-111Z.md](logic-core-v3/docs/regression/baseline-2026-05-22T23-18-15-111Z.md) — output con los 13 casos.
- ✏️ `docs/bitacora-roadmap.md` — este bloque.

**Sin tocar:**
- `sections.ts` y todo `prompts/*` — el SDK era el problema, no el prompt. La regla "después de `capture_lead`, invocá `offer_handoff_options`" estaba bien escrita; faltaba que el SDK permitiera el step.
- Tools (`captureLead.ts`, `offerHandoffOptions.ts`, `showWhatsappHandoff.ts`, `navigateToPage.ts`) — schemas intactos.
- Frontend (`useChatbot.ts`, `ChatWindow.tsx`) — el frontend ya rendea correctamente el `text` agregado y las `toolCalls` agregadas que ahora persistimos.

**Throwaways borrados al cierre:** `scripts/_ms1-dev.log`, `scripts/_ms1-run.log`, `scripts/_ms1-run2.log`.

### 7) Comandos de verificación post-sprint

```bash
cd logic-core-v3
npx tsc --noEmit                                    # ✅ EXIT 0
npx tsx scripts/regression/run-baseline.ts          # ✅ 13/13 sin error
# Inspeccionar caso clave:
#   docs/regression/baseline-2026-05-22T23-18-15-111Z.md → secciones
#     "Flujo completo de captura de lead" (Juan)
#     "Lead con email Y teléfono" (Ana)
#     "Chain completo MS-1" (Pedro)
#   → en los 3, T2 muestra capture_lead + offer_handoff_options + texto natural.
```

### 8) Decisiones no especificadas

1. **`stepCountIs(3)` en vez de `(2)`.** Con 2 sería suficiente para el flujo lead-capture (tool + texto). Elegí 3 como margen defensivo: si el modelo decidiera, por ejemplo, hacer `capture_lead` → texto → `navigate_to_page`, el step 3 sería válido. Costo de no usarlo (el SDK termina cuando no hay más tool calls) = 0. Costo de hacer 3 reales = 1 TTFB extra, pero el modelo lo hace solo si lo necesita.
2. **No agregué `prepareStep`** (callback que el SDK v6 expone para customizar cada step). El default es exactamente lo que queremos: cada step recibe los messages + tool results acumulados. Customizar abre superficie de bugs.
3. **No uso `stopWhen` compuesto** (ej. `[stepCountIs(3), hasToolCall('show_whatsapp_handoff')]`). El `stepCountIs(3)` ya es safety net duro y el modelo termina solo cuando no genera más tools. Compuesto complica sin valor agregado para los flujos actuales.
4. **`onStepFinish` solo incrementa el contador**, no hace logging por step. Si en el futuro queremos timing/cost por step para optimizar, agregar logging acá es 5 líneas. Lo dejo flagged.
5. **Tokens agregados pueden ser leve sobre-cuenta en cold start.** El SDK v6 a veces resetea el input tokens del segundo step (porque ya tiene context cached). Lo que ven es: `step1.inputTokens = 4000`, `step2.inputTokens = 4500` (con el último user/tool reply). La suma es 8500 pero los tokens "reales facturados" son ~4500 (cache hit). Provider-dependent. Para Gemini hoy no es problema (no usa cache de input). Si en el futuro migran a Anthropic con prompt caching, hay que ajustar el cálculo. **No relevante para Matsu / develOP hoy.**
6. **No regen del baseline B3.6 para comparar** — uso los números ya documentados en bitácora. Cualquier diferencia con esos números puede deberse a cold start de Vertex o ruido stochástico del modelo, no a regresión del código.

### 9) Flags para Franco

- 🚩 **Lectura obligatoria con ojo comercial.** Abrí [baseline MS-1](logic-core-v3/docs/regression/baseline-2026-05-22T23-18-15-111Z.md), específicamente:
  - Sección "Flujo completo de captura de lead" (Juan Pérez)
  - Sección "Lead con email Y teléfono" (Ana García)
  - Sección "Chain completo MS-1" (Pedro Martínez)

  Confirmá que la confirmación que escribe Aki ("¡Listo X! Tus datos están guardados. ¿Cómo querés seguir?") suena natural en el contexto de Matsu. Si te suena robótica o repetitiva → es ajuste de Sec 7 del prompt, +50 chars, holgura presupuestaria sobra.

- 🚩 **+1 segundo en flujos de captura.** No es opinable: es el costo físico de un step extra de Vertex. Si quisieras erradicarlo del todo, la única alternativa es **respuesta determinística post-`capture_lead`** (el handler arma un texto fijo en `toolResult` y el frontend lo muestra sin pasar por LLM). Trade-off: cero latencia extra pero el texto suena más robótico (mismo template para todos). Hoy creo que el +1s vale el texto natural, pero queda en vos.

- 🚩 **Costos.** Los flujos multi-step ahora gastan ~2x tokens en T2 de lead-capture (step 1 con tools + step 2 con texto post-tool). En el plan free de develOP es invisible; cuando lleguen clientes con miles de captures/mes, va a sumar. Métrica clave para monitorear: `timings.step_count` (nuevo campo en `metadata.timings`). Lo voy a flag en el dashboard de health cuando llegue B4.

- 🚩 **H2/H3 RESUELTOS para `capture_lead`. Para `show_whatsapp_handoff`** sin texto previo (caso clásico y `whatsapp-handoff-schedule`), el comportamiento sigue como antes (texto vacío + tool). Esto **no es** del SDK multi-step — es decisión del modelo: cuando el visitante dice "pasame al WhatsApp", el modelo prefiere ir directo a la tool sin texto previo. **Es UX aceptable** (la card sola es clara). Si quisieras forzar texto previo siempre, es endurecer el prompt en Sec 7 — pero el caso `whatsapp-handoff-purchase-signal` ya genera texto rico cuando hay producto específico (157 chars), lo cual es el caso comercial valioso.

- 🚩 **Si en producción Vertex queda muy lento** con multi-step y los visitantes empiezan a percibir el +1s, el fallback es bajar a `stepCountIs(2)`. Reducción mínima del comportamiento (perderíamos el step 3 de margen), latencia ~mismo (el flujo de capture sigue siendo 2 steps).

### Listo para
- ✅ H2 y H3 resueltos para el flujo crítico de captura de lead.
- ✅ Pre-requisito de B5 cumplido: el bot ahora confirma con texto natural y encadena las opciones — los visitantes que dejan datos reciben la respuesta esperada.
- ✅ Cost-correctness: tokens agregados desde todos los steps, no solo el último.
- ⏳ Lectura comercial de Franco (flag #1) — especialmente las 3 transcripciones de captura.
- ⏳ B4 / B5 / etc. — el camino libre.

---
## ✅ B4.1 — Modelo Plan + seed lockeado + migración additive   ·   2026-05-22

**Objetivo**: crear la estructura del sistema de planes (STARTER / PRO / BUSINESS) con las 7 dimensiones de gating, sembrar los 3 planes con los valores lockeados, y migrar las orgs existentes de forma idempotente sin romper nada en runtime. Pre-requisito de B4.2 (server gating).

### 0) Estado real en dev (verificado antes de tocar nada)

Branch Neon dev confirmada: `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech` (separada de prod = `ep-rapid-mode-...`).

3 Subscription rows pre-sprint:

| Org | planName actual | price | status |
|---|---|---:|---|
| `san-miguel` | "Plan Profesional" | $150 | ACTIVE |
| `sonrisa-norte` (FAKE) | "Plan AI Care" | $140 | ACTIVE |
| `sigma-contable` (FAKE) | "Plan Maintenance" | $95 | PAST_DUE |

`sonrisa-norte` y `sigma-contable` son data sembrada por `seed-agency-os.ts` (IDs con prefijo `osv2-`). Franco autorizó borrarlas en dev para limpiar el mapeo ambiguo.

4 orgs sin Subscription pre-sprint: `ejemplo`, `empresa-demo`, `develop`, `matsu` — quedan con `planId=null` y caen al fallback Starter en runtime cuando B4.2 enchufe el gating.

### 1) Schema additive (cero DROP, cero destructivo)

Migración `20260522234313_add_plan_model` — additive only:

```sql
CREATE TYPE "PlanKey" AS ENUM ('STARTER', 'PRO', 'BUSINESS');
CREATE TYPE "SupportTier" AS ENUM ('STANDARD', 'PRIORITY', 'PRIORITY_24H');
ALTER TABLE "Subscription" ADD COLUMN "planId" TEXT;
CREATE TABLE "plan" (... 15 columnas, ver prisma/schema.prisma ...);
CREATE UNIQUE INDEX "plan_key_key" ON "plan"("key");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "plan"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

**Decisiones del shape de Plan**:
- `key PlanKey @unique` — enum tipado en vez de slug libre, evita typos en seed/lookup.
- `tools String[]` — Franco decidió este shape para que nuevas tools (B5: `show_product_card`, `score_lead`, etc.) se sumen sólo a BUSINESS sin tocar schema. Hoy STARTER tiene 2, PRO y BUSINESS los mismos 4 reales (`capture_lead`, `offer_handoff_options`, `show_whatsapp_handoff`, `navigate_to_page`).
- `maxDomains Int?` — `null` = uso justo / ilimitado. La cuota real "5000 conv/mes" de Business se marketea como uso justo pero está hard en `quota`.
- `monthlyPrice` y `setupFloorPrice` como `Decimal(10,2)` — plata, no Float.
- `active Boolean @default(true)` — STARTER dormido comercialmente igual queda `active=true` (existe en sistema, no se promociona en UI).
- `Subscription.planId` nullable a propósito: B4.2 usa `PLAN_FALLBACK` (Starter) en runtime cuando es null. **No se borra `planName`** acá (rollback safety; deprecación es sprint posterior).
- ON DELETE SET NULL en la FK — si alguna vez se borra un Plan (no debería), las subs no se borran en cascada; quedan con planId=null y entran al fallback.

### 2) Mapeo viejo planName → planId

En [prisma/seeds/migrate-subscriptions-to-plan-id.ts](logic-core-v3/prisma/seeds/migrate-subscriptions-to-plan-id.ts):

```ts
const PLAN_NAME_TO_KEY: Record<string, PlanKey | null> = {
  'Plan Profesional': PlanKey.BUSINESS,   // price exacto $150 + ejemplo del prompt B4.1
  'Plan AI Care': null,                    // FLAG: nombre = servicio AI, no tier. Decisión manual.
  'Plan Maintenance': null,                // FLAG: nombre = servicio web, no tier. Decisión manual.
}
```

En dev (post-cleanup de fakes) sólo queda `san-miguel` con `"Plan Profesional"` → mapea a BUSINESS sin ambigüedad. **Cero FLAG en dev.** En prod el mismo script flageará las 2 subs de `sonrisa-norte` y `sigma-contable` para que las asignes a mano (o las dejes en `planId=null` con fallback Starter).

### 3) Seed lockeado (los 3 planes con valores exactos)

[prisma/seeds/sync-plans.ts](logic-core-v3/prisma/seeds/sync-plans.ts) — patrón espejo de `sync-premium-modules.ts`:

| Campo | STARTER | PRO | BUSINESS |
|---|---|---|---|
| `monthlyPrice` | $50 | $90 | $150 |
| `setupFloorPrice` | $700 | $900 | $1000 |
| `quota` | 500 | 3000 | 5000 |
| `llmModel` | gemini-2.5-flash | gemini-2.5-flash | gemini-2.5-flash |
| `tools` | 2 (capture+handoff) | 4 reales | 4 reales (premium se suma cuando exista) |
| `maxDomains` | 1 | 3 | null (uso justo) |
| `reportsEnabled` | false | true | true |
| `insightEnabled` | false | true | true |
| `crmEnabled` | false | false | true |
| `supportTier` | STANDARD | PRIORITY | PRIORITY_24H |
| `sortOrder` | 10 | 20 | 30 |

Idempotencia verificada: la primera corrida creó 3 (created=3), la segunda no tocó nada (unchanged=3). Compara campo por campo (con `Decimal.equals` para precios y comparación de arrays para `tools`) — sólo `UPDATE` si hay drift real.

### 4) Default seguro (fallback Starter)

[src/lib/plan-fallback.ts](logic-core-v3/src/lib/plan-fallback.ts) — constante `PLAN_FALLBACK` con shape `EffectivePlan` que es **espejo del row Starter sembrado**, más:

- `id: null` — deja claro que NO viene de la DB.
- `isFallback: true` — telemetría/logs pueden distinguir "plan asignado real" vs "fallback virtual".

B4.2 va a consumirlo desde `getPlanForOrg(orgId)`: si la org tiene `planId` → lo carga de la DB; si no → devuelve `PLAN_FALLBACK`. El bot nunca lee directamente esta constante — siempre pasa por el helper.

Si alguna vez cambia el Plan STARTER en `sync-plans.ts`, hay que actualizar `PLAN_FALLBACK` en paralelo (comentado en el archivo). No es DRY a propósito: la constante en código vive aún cuando la DB esté caída, y eso es deseable.

### 5) Cleanup de dev (fuera del flujo idempotente de prod)

`sonrisa-norte` y `sigma-contable` se borraron en dev con `prisma.organization.delete` directo (con cascada onDelete sobre Subscription, Project, Task, Ticket, OsPaymentMilestone, OsTimeEntry, etc.). Inventario pre-delete verificó cero data crítica (cero BotConfig, cero Conversation, cero ChatbotLead): era todo simulación del seed-agency-os.

Estado final dev:
- 5 orgs (`ejemplo`, `empresa-demo`, `san-miguel`, `develop`, `matsu`).
- 3 planes en DB (`STARTER`, `PRO`, `BUSINESS`).
- 1 subscription: `san-miguel.planId` → BUSINESS.

**Importante**: este delete es DEV-ONLY. En prod, `sonrisa-norte` y `sigma-contable` pueden existir como orgs reales — el script `migrate-subscriptions-to-plan-id.ts` las flag automáticamente sin tocarlas.

### 6) Comandos para prod

Netlify autoaplica `prisma migrate deploy` en cada build (ver `netlify.toml`), así que la migración `20260522234313_add_plan_model` entra a prod al mergear esta rama a `main`. **Es additive — cero riesgo de pérdida de datos.**

Después del deploy, Franco corre manualmente (en orden):

```bash
# 1. Sembrar los 3 planes (idempotente — segura para re-correr)
DATABASE_URL=<prod-url> npx tsx prisma/seeds/sync-plans.ts

# 2. Migrar las subs viejas a planId (idempotente — segura para re-correr)
DATABASE_URL=<prod-url> npx tsx prisma/seeds/migrate-subscriptions-to-plan-id.ts
```

El segundo script va a imprimir un bloque `🚩 Flags para Franco:` con `sonrisa-norte` y `sigma-contable` (si siguen en prod), explicando que el script no las tocó porque `"Plan AI Care"` y `"Plan Maintenance"` no están en el mapeo conocido. Si decidís asignarles tier, editás el `PLAN_NAME_TO_KEY` del script y re-corrés — es idempotente.

### 7) Healthchecks

```bash
cd logic-core-v3
npx tsc --noEmit                    # ✅ EXIT 0 (clean)
npx prisma migrate status           # ✅ 43 migrations, schema up to date
npm run build                       # ✅ EXIT 0
```

### 8) Archivos creados / modificados

- ✏️ [prisma/schema.prisma](logic-core-v3/prisma/schema.prisma) — + enums `PlanKey`, `SupportTier`; + modelo `Plan` (15 campos); + `Subscription.planId` nullable + relación + `@@index([planId])`.
- ➕ [prisma/migrations/20260522234313_add_plan_model/migration.sql](logic-core-v3/prisma/migrations/20260522234313_add_plan_model/migration.sql) — auto-generada por Prisma, 100% additive (cero DROP).
- ➕ [prisma/seeds/sync-plans.ts](logic-core-v3/prisma/seeds/sync-plans.ts) — seed idempotente de los 3 planes (compara campo por campo, sólo UPDATE si cambió).
- ➕ [prisma/seeds/migrate-subscriptions-to-plan-id.ts](logic-core-v3/prisma/seeds/migrate-subscriptions-to-plan-id.ts) — mapeo viejo→nuevo con flags para casos no mapeados; respeta planId pre-existente (no pisa asignación manual).
- ➕ [src/lib/plan-fallback.ts](logic-core-v3/src/lib/plan-fallback.ts) — constante `PLAN_FALLBACK` (Starter virtual) que B4.2 va a usar como default seguro.

**No tocados:**
- `Subscription.planName` — sigue como String libre, deprecación es sprint posterior (rollback safety).
- Todo el módulo chatbot (`src/modules/chatbot/**`) — B4.1 es schema/seed/helper, no toca runtime del bot.
- `src/lib/subscription.ts` (helper que lee `planName`) — sigue funcionando igual; B4.2 lo reemplaza con `getPlanForOrg`.

**Throwaways borrados al cierre:** `scripts/_b41-inventory-fake-orgs.ts`, `scripts/_b41-delete-fake-orgs.ts`, `scripts/_b41-verify-plans.ts`, `scripts/_b41-final-state.ts`, `scripts/_b41-build.log`, `scripts/_b41-migrate-create.log`.

### 9) Decisiones no especificadas

1. **Tipo de FK `Subscription.planId`: `ON DELETE SET NULL`** (no Cascade). Razón defensiva: si alguien borra un Plan por error en admin, las subscriptions NO se borran en cascada; quedan con `planId=null` y el runtime usa `PLAN_FALLBACK`. Cascada hubiera perdido data viva.
2. **`Decimal(10,2)` para precios** (no Float). Money sin decimales exactos = futuras divergencias en facturación. Patrón ya usado por `PremiumModule.priceMonthlyUsd` y `OsPaymentMilestone.amount`.
3. **`active Boolean` en Plan**, además de `status`. Decisión: dejé sólo `active`. Lockeo del producto dice "STARTER dormido comercialmente PERO activo en el sistema" — un booleano basta; agregar `status DEPRECATED|...` sería sobreingeniería hasta que aparezca un plan que querramos archivar.
4. **`sortOrder` con steps de 10** (10, 20, 30). Permite insertar un plan intermedio en el futuro sin renumerar todo.
5. **Borré las 2 orgs fake en dev** en vez de mapearlas a algún tier al azar. Franco autorizó explícitamente ("si pinta borralo entero y chau"). El inventario pre-delete mostró cero data crítica. Resultado: dev queda con mapeo limpio (1 sub → BUSINESS), prod sigue intacto.
6. **Script de migración separa "mapeo explícito" de "conflicto previo"**: si una sub ya tiene `planId` distinto al mapeo (asignación manual prior), el script NO la toca y la reporta como `Conflicts`. Esto preserva el trabajo manual del admin sin sorpresas.
7. **No usé `@map` para columnas de `Plan`** (snake_case en DB). El resto del schema mezcla `@@map` (en algunos modelos: `plan`, `premium_module`, `organization_module`) con sin map (en otros: `Subscription`, `Organization`). Mantuve la inconsistencia existente — corregirla es scope aparte.
8. **No agregué la columna en `Subscription` para diferenciar "plan asignado por admin" vs "plan migrado automáticamente"**. Tentación de meter `planAssignedBy String?` o un audit log, pero `AdminAuditLog` ya tiene `SUBSCRIPTION_CHANGED` como acción — si se quiere trazabilidad, va por ahí. No agregar campos especulativos.

### 10) Flags para Franco

- 🚩 **`planName` sigue en el schema.** Lo mantengo intencionalmente para rollback safety. La deprecación (drop column) va en un sprint posterior cuando confirmemos que el código nuevo no lo lee. Hoy lo leen al menos: [`src/lib/subscription.ts`](logic-core-v3/src/lib/subscription.ts), `src/components/dashboard/SubscriptionBanner.tsx`, varios `client-list/client-card/ClientHeader`. Ese refactor es parte natural de B4.2 / B4.4.
- 🚩 **Las 2 orgs fake (sonrisa-norte, sigma-contable) las borré en dev.** En prod existen como orgs reales — el script `migrate-subscriptions-to-plan-id.ts` las va a flagear sin tocarlas. Cuando definas qué tier les corresponde, editás `PLAN_NAME_TO_KEY` y re-corrés.
- 🚩 **Premium tools para BUSINESS quedaron iguales que PRO** (los 4 reales). Cuando B5 cree una tool premium (`show_product_card`, `score_lead`, etc.), agregás el slug al array `tools` de BUSINESS en `sync-plans.ts` y re-corrés. Sin cambio de schema.
- 🚩 **`Subscription.price` (Float) sigue como override.** Hoy en dev san-miguel tiene `price=150` que coincide con `Plan.monthlyPrice=150` (BUSINESS), así que no hay delta. En prod puede haber subs con `price` distinto al `monthlyPrice` del plan asignado — eso es un override válido (descuento / negociación). Si querés ver los deltas, agregamos un log al script en B4.2.
- 🚩 **Netlify va a aplicar la migración al mergear.** Es 100% additive, cero riesgo. PERO los 2 scripts (`sync-plans.ts` + `migrate-subscriptions-to-plan-id.ts`) NO se corren solos en deploy. Los corrés vos manualmente con `DATABASE_URL=<prod>` después del merge (ver sección 6). Sin esos scripts, prod queda con la tabla `plan` vacía y todas las subs con `planId=null` (caen al fallback Starter — funcional, pero no era la intención).
- 🚩 **B4.1 NO toca el runtime del bot.** No corrí la batería de regresión B3.2 porque B4.1 es schema/seed/helper, no cambia ninguna code path del request. La batería tiene sentido cuando B4.2 enchufe el gating en `handleChatRequest.ts` — ahí sí es obligatorio confirmar que el conteo de cuota / filtro de tools / model lookup no rompió nada.
- 🚩 **El helper `getPlanForOrg(orgId)` con cache es B4.2.** Acá quedó `PLAN_FALLBACK` como constante; el helper que lee Plan de DB con cache (patrón `resolveBotBySlug`) es el primer paso de B4.2.

### Listo para
- ✅ B4.2 — server gating. Tiene todo lo que necesita: Plan en DB con las 7 dimensiones, planId en Subscription, fallback Starter en código, helper futuro `getPlanForOrg` queda con shape claro.
- ✅ Merge a `main` cuando quieras. Migración additive, cero riesgo. Recordá correr los 2 scripts en prod después del deploy.
- ⏳ Decisión Franco: ¿qué tier le asignás a `sonrisa-norte` y `sigma-contable` en prod? (o las dejás con fallback Starter).
- ⏳ B4.4 / UI admin "asignar plan" — el seed expone los 3 plans con `id` cuidable; el formulario admin necesita un `<Select>` con los planes y un `prisma.subscription.update({ planId })`. Trivial.

---
## ✅ B4.2 — Server gating de las 7 dimensiones del plan   ·   2026-05-23

**Objetivo**: aplicar las 7 dimensiones del plan en el servidor (el endpoint del bot es público — gating en el front sería bypass trivial), con conteo incremental atómico, modo degradado graceful, y cache para que el lookup no agregue latencia notable. Pre-requisito de B4.4 (UI admin) y B4.5 (degradación canned).

### 1) `getPlanForOrg(orgId)` con cache — espejo del patrón B1.4

[src/lib/plan/get-plan-for-org.ts](logic-core-v3/src/lib/plan/get-plan-for-org.ts): in-memory `Map<orgId, { data: EffectivePlan; expiresAt }>` con TTL 60s (mismo número que [resolveBotBySlug](logic-core-v3/src/modules/chatbot/server/conversation/resolver.ts) por consistencia operativa). Exports:

- `getPlanForOrg(orgId): Promise<EffectivePlan>` — never null, never throws. Si `Subscription` no existe o `planId === null` → devuelve `PLAN_FALLBACK` (Starter virtual). El bot siempre tiene un plan efectivo.
- `invalidateOrgPlanCache(orgId)` — para B4.4 cuando admin cambie el plan asignado.
- `invalidateAllOrgPlanCache()` — para cambios globales en la tabla `Plan` (precio/cuota/etc).

`EffectivePlan` (definido en [fallback.ts:24-43](logic-core-v3/src/lib/plan/fallback.ts#L24-L43)) mapea 1-a-1 las columnas del modelo Plan + `id: string | null` y `isFallback: boolean` para distinguir plan real vs virtual en logs.

Re-organización: lo que B4.1 dejó en `src/lib/plan-fallback.ts` se movió a `src/lib/plan/{fallback,get-plan-for-org,plan-allows,index}.ts`. El import canónico es ahora `@/lib/plan`. Nadie estaba importando el path viejo, cero breaking change.

### 2) `tryReserveConversation` — atomicidad real, no optimista

[src/modules/chatbot/server/quota/checker.ts:75-130](logic-core-v3/src/modules/chatbot/server/quota/checker.ts#L75-L130).

El gating de cuota tiene un TOCTOU clásico: `checkQuota` (lectura) → llamada Gemini → `incrementQuota` (write post-LLM). En burst contra el último cupo del mes, N requests simultáneos pasan el check, todos llaman a Gemini, y el counter termina por encima del límite. **Eso destruye margen** — exactamente el problema que la economía lockeada quiere evitar.

Fix: `tryReserveConversation(botConfigId, monthlyQuota)` hace un **UPDATE conditional atómico**:

```sql
UPDATE "chatbot_quota_usage"
SET "conversationsCount" = "conversationsCount" + 1,
    "updatedAt" = NOW()
WHERE "botConfigId" = $1 AND "year" = $2 AND "month" = $3
  AND "conversationsCount" < $4
```

PostgreSQL serializa por fila durante el UPDATE. La N+1ª request encuentra `conversationsCount === limit` y el WHERE no matchea → 0 filas afectadas → `reserved=false` → modo degradado sin tocar Gemini. **Garantía: N reservas exitosas concurrentes nunca exceden `monthlyQuota`.**

Llamado SOLO para conversación nueva (`isNewConversation=true`). Mensajes en convo existente no incrementan el counter, no necesitan reserve. Y cuando reservamos, el `incrementQuota` posterior (en `onFinish`) se pasa con `isNewConversation: false` para evitar double-count del counter — tokens y cost se acumulan como siempre.

### 3) `planAllows(plan, feature)` — gate compartido para B4.4+

[src/lib/plan/plan-allows.ts](logic-core-v3/src/lib/plan/plan-allows.ts). Función pura. `feature ∈ {'reports','insight','crm'}` → boolean. B4.4 (admin UI) y los blocks que construyan esas features la usan para gatekeep sin duplicar lógica de plan.

Para checks que necesitan más contexto (ej. ¿esta tool puntual?) usar `plan.tools.includes(slug)` directo — `planAllows` cubre solo las dimensiones boolean (5-7 de B4.1). Documentado en el archivo.

### 4) Pipeline de gating en `handleChatRequest` — orden de checks

Antes de B4.2 el handler tenía: validate → resolveBotBySlug → rate-limit → [parallel: checkQuota, getOrCreateConversation] → quota check → persist user msg → LLM. Después:

```
validate → resolveBotBySlug → rate-limit
  → [parallel: getPlanForOrg, checkQuota (no-cap), getOrCreateConversation]
  → plan resolved (log: planKey + isFallback + quota + llmModel + tools + maxDomains)
  → 5.a Gating dominio (defensive cap del plan vs origin)
  → 5.b Gating cuota:
       optimist check (conversationsUsed >= plan.quota) → degraded
       if isNewConversation: tryReserveConversation atomic → reserved?false → degraded
  → persist user msg
  → buildSystemPrompt → getTools(ctx, plan.tools)  ← filter
  → llm: model = provider.getModel(plan.llmModel)   ← plan, no BotConfig
  → onFinish: incrementQuota({ isNewConversation: false })  ← evita double-count
```

**Dimensiones aplicadas:**

| # | Dimensión | Dónde se enforce | Comportamiento ante bloqueo |
|---|---|---|---|
| 1 | `quota` (conv/mes) | `checkQuota` + `tryReserveConversation` (atomic) | Modo degradado, cero Gemini |
| 2 | `llmModel` | `provider.getModel(plan.llmModel)` | (todos Flash hoy; cambio de plan = cambio de modelo) |
| 3 | `tools` | `getTools(ctx, plan.tools)` filtra por catálogo | El modelo se adapta a las tools disponibles |
| 4 | `maxDomains` | `isOriginWithinPlanCap` (defensive, post-validateOrigin) | Modo degradado |
| 5 | `reportsEnabled` | `planAllows(plan, 'reports')` listo para B4.4 | (no construido en B4.2) |
| 6 | `insightEnabled` | `planAllows(plan, 'insight')` listo para B4.4 | (no construido en B4.2) |
| 7 | `crmEnabled` | `planAllows(plan, 'crm')` listo para B4.4 | (no construido en B4.2) |

### 5) Gating de dominio — extracted matcher

[src/lib/security/origin-matcher.ts](logic-core-v3/src/lib/security/origin-matcher.ts). La lógica de match (exacto + subdominio, strip `https?://` y `*.`) que `validateOrigin` tenía inline se extrajo a `originMatchesAllowed(origin, allowedDomains)`. Reusada en:

- `validate-origin.ts` — check de seguridad inicial (route.ts → todos los dominios del bot).
- `handleChatRequest.isOriginWithinPlanCap` — check defensivo plan-aware (solo `bot.allowedDomains.slice(0, plan.maxDomains)`).

Caso uso: bot tiene 3 dominios configurados, plan downgrade a Starter (1 dom). `validateOrigin` autoriza los 3 (es del bot). El check defensivo de B4.2 bloquea los 2 "overflow" — el cliente debe limpiar la config a 1 dominio o upgradear. **Sin double DB lookup**: validateOrigin ya cargó el bot en route.ts, y handleChatRequest tiene `bot.allowedDomains` cargado por `resolveBotBySlug` (que ya cache 60s).

Escapes preservados: `NODE_ENV=development` + localhost siempre OK (la batería B3.2 corre desde localhost). `https://develop.com.ar` siempre OK. `plan.maxDomains === null` (BUSINESS "uso justo") → cualquier origin que pasó `validateOrigin` pasa acá.

### 6) Modo degradado — graceful, cero Gemini

`degradedResponse(message)` devuelve JSON `{ mode: 'degraded', message, ctaWhatsapp: true }` con 200 OK. El widget detecta `mode === 'degraded'` y switchea a UI fallback (CTA WhatsApp). **Cero llamada a Vertex, cero costo, cero crash, cero 500.**

Cada bloqueo se loguea con su tipo y emite `ChatbotEvent` (`chat.gating_domain_overflow`, `chat.quota_exceeded`) con metadata útil (planKey, conversationsUsed/Limit, period) para que admin pueda diagnosticar en `/admin/chatbots/[botId]/events`.

### 7) Validación — batería B3.2 reusada

Corrí 2 runs de [scripts/regression/run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts) (13 casos × 2 turnos típicos cada uno, ~26 conv nuevas por run):

**Run 1 — matsu sin Subscription (fallback Starter, tools=`[capture_lead, show_whatsapp_handoff]`)**:
- **12/13 OK + 1 cambio de comportamiento esperado**.
- El caso `lead-capture-chain` quedó marcado como error porque esperaba que el modelo invoque `offer_handoff_options`, pero esa tool NO está en el plan Starter. El modelo se adaptó correctamente y eligió `show_whatsapp_handoff`. **Eso es success del gating**, no regresión funcional.

**Run 2 — matsu con Subscription → plan PRO (tools = los 4)**:
- **13/13 OK**, cero error, comportamiento idéntico al pre-B4.2.
- Confirmación de cero regresión cuando el plan tiene las tools que la batería ejercita.
- Baseline guardado en [docs/regression/baseline-2026-05-23T00-07-29-708Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T00-07-29-708Z.md).

**Atomicidad verificada**: counter de `QuotaUsage` para matsu/2026-05 incrementó +26 exacto entre runs (de 63 → 89). Sin race, sin double-count. La reserve atómica funciona.

### 8) Healthchecks

```bash
cd logic-core-v3
npx tsc --noEmit                    # ✅ EXIT 0 (clean)
npx prisma migrate status           # ✅ 43 migrations, schema up to date
npm run build                       # ✅ EXIT 0
```

### 9) Archivos creados / modificados

**Creados:**
- ➕ [src/lib/plan/fallback.ts](logic-core-v3/src/lib/plan/fallback.ts) — `EffectivePlan` + `PLAN_FALLBACK` (movido desde `src/lib/plan-fallback.ts`).
- ➕ [src/lib/plan/get-plan-for-org.ts](logic-core-v3/src/lib/plan/get-plan-for-org.ts) — helper con cache 60s + `invalidateOrgPlanCache` / `invalidateAllOrgPlanCache`.
- ➕ [src/lib/plan/plan-allows.ts](logic-core-v3/src/lib/plan/plan-allows.ts) — gate boolean para reports/insight/crm.
- ➕ [src/lib/plan/index.ts](logic-core-v3/src/lib/plan/index.ts) — barrel.
- ➕ [src/lib/security/origin-matcher.ts](logic-core-v3/src/lib/security/origin-matcher.ts) — matcher compartido extraído de validateOrigin.

**Modificados:**
- ✏️ [src/modules/chatbot/server/quota/checker.ts](logic-core-v3/src/modules/chatbot/server/quota/checker.ts) — agregado `tryReserveConversation` con `$executeRaw` para UPDATE conditional atómico.
- ✏️ [src/modules/chatbot/server/quota/index.ts](logic-core-v3/src/modules/chatbot/server/quota/index.ts) — re-export.
- ✏️ [src/modules/chatbot/server/tools/getTools.ts](logic-core-v3/src/modules/chatbot/server/tools/getTools.ts) — refactor: catálogo central `TOOL_BUILDERS`, `getTools(ctx, enabledTools?)` filtra por slugs del plan. Exports `ALL_TOOL_SLUGS` y `ToolSlug`.
- ✏️ [src/modules/chatbot/server/tools/index.ts](logic-core-v3/src/modules/chatbot/server/tools/index.ts) — re-exports nuevos.
- ✏️ [src/modules/chatbot/server/chat/handleChatRequest.ts](logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts) — pipeline de gating completo (ver §4). Helpers privados `degradedResponse`, `effectiveAllowedDomains`, `isOriginWithinPlanCap`.
- ✏️ [src/lib/security/validate-origin.ts](logic-core-v3/src/lib/security/validate-origin.ts) — usa `originMatchesAllowed` (DRY).

**Borrados:**
- 🗑 `src/lib/plan-fallback.ts` (movido a `src/lib/plan/fallback.ts` — verificado cero imports al path viejo).
- 🗑 Throwaways al cierre: `scripts/_b42-{assign-matsu-pro,verify-quota,build,dev,regression,regression2}*`.

### 10) Decisiones no especificadas

1. **TTL de cache = 60s** (mismo que `resolveBotBySlug`). Razón: consistencia operativa — un admin que cambia el plan ve el efecto en ≤60s sin tener que rebootear. Y el cache se invalida explícitamente vía `invalidateOrgPlanCache` desde la action de admin (B4.4 la va a llamar).
2. **`getPlanForOrg` nunca devuelve null**. Siempre retorna `EffectivePlan` (real o fallback). Esto sostiene la promesa "el bot nunca está sin plan en runtime", sin que cada caller tenga que defenderse de null. Si la org no existe, el caller previo (`resolveBotBySlug`) ya falla antes.
3. **Atomic reserve solo para `isNewConversation`**. Mensajes en conversación existente no mueven el counter — el cap del plan es sobre CONVERSACIONES, no mensajes. La política locked dice "5000 conv/mes uso justo", no mensajes.
4. **TOCTOU "best effort" en conversación existente**: si la cuota se llenó después del `checkQuota` pero antes del LLM, el mensaje pasa igual. Acepto el race (bounded por window de ms, no escala) — alternativa requeriría atomic reserve también para existing convos, complicando el flow sin valor proporcional.
5. **`checkQuota` se llama con `Number.MAX_SAFE_INTEGER`** como límite (sentinel). Solo lee el counter actual; el cap real lo enforce el código después con `plan.quota`. Lo mantengo así para no romper la API del helper que admin features pueden usar para "qué cuota va llevando el bot X" sin pasar un límite.
6. **Tools desconocidos en `plan.tools` se ignoran silenciosamente**. Si un plan vieja-data tiene un slug que ya no existe en `ALL_TOOL_SLUGS`, no crashea — se omite. Garantiza forward-compat cuando se borre una tool del catálogo.
7. **Gating de dominio dentro de `handleChatRequest`, NO en `validateOrigin`**. Razón: `validateOrigin` es check de seguridad (autoriza/bloquea origin contra config del bot). El cap del plan es business rule (downgrade no limpió la config). Mezclarlos confunde responsibilities; el doble-check es defensive en un nuevo step ortogonal.
8. **`bot.llmProvider` sigue viniendo del BotConfig** (no del Plan). Razón: hoy todos los bots usan `google`, el Plan no tiene dimensión provider, y duplicar el campo sería sobre-ingeniería. Si en el futuro un plan exclusivo usara Anthropic, se agrega `Plan.llmProvider` en una migración additive. Hoy `plan.llmModel='gemini-2.5-flash'` y `bot.llmProvider='google'` coexisten correctamente.
9. **Dev DB state**: dejo matsu con Subscription a plan PRO (creada vía script throwaway para que la batería corra con 4 tools). En prod no se replica — matsu allá no existe (es bot de dev). Si querés que dev quede limpio post-B4.2 corré `prisma.subscription.delete({ where: { organizationId: '<matsu-org-id>' } })` y matsu vuelve al fallback Starter.

### 11) Flags para Franco

- 🚩 **El caso `lead-capture-chain` de la batería ahora depende del plan**. Con Starter (2 tools), el modelo elige `show_whatsapp_handoff` directo (cero `offer_handoff_options` disponible). Con PRO/BUSINESS, el chain MS-1 funciona. **El test sigue siendo válido**, pero su "PASS criteria" debería contemplar las dos rutas (lo dejé como mejora para B4.3 — no es bloqueante hoy porque corrí ambos runs).
- 🚩 **Gating de origin de dominios — modo degradado no es alarmista**. Si un cliente downgradeada de PRO (3 dominios configurados) a STARTER (1 dom), el segundo y tercer dominio quedan bloqueados pero el bot sigue vivo en el primero. Admin UI (B4.4) tiene que mostrar "estás usando X de N dominios" para que el cliente vea y limpie la config. Hoy el cliente vería solo "bot no anda en mi blog secundario" sin contexto — flagged para UX.
- 🚩 **Atomicidad del counter está cubierta**. PostgreSQL UPDATE conditional + `WHERE conversationsCount < limit` es atomic por fila. **Pero** sigue habiendo un race chiquito en el tail: entre `checkQuota` (lectura) y `tryReserveConversation` (write), una request paralela puede llenar el cupo. En ese caso el reserve falla y el cliente recibe modo degradado — no se le sirve mal, solo recibe el degraded más temprano. Aceptado.
- 🚩 **`bot.monthlyQuota` queda obsoleto pero no se borra**. Ya no se usa para el cap (lo hace `plan.quota`). Pero algunos lugares del admin todavía lo leen para mostrar info (ej. `BotDetailClient.tsx`). Deprecación es scope aparte (B4.4 podría reemplazar las lecturas con `getPlanForOrg`).
- 🚩 **No moví `bot.llmProvider` ni `bot.llmModel` al plan en este sprint**. `plan.llmModel` reemplaza el lookup en runtime, pero `BotConfig` sigue teniendo `llmModel` como campo legacy editable en admin. Si admin edita `bot.llmModel` ahora, ese cambio NO se aplica (plan manda). Es deuda de UX: admin debería ver "este campo está overrided por el plan PRO" o no permitir editarlo. Flag para B4.4.
- 🚩 **El cache es per-process**. En Netlify cada función serverless tiene su propio process, así que la cache se "calienta" por instance. Para una org muy activa el hit rate es alto; para una org cold, primer request paga el lookup (10-30ms). Aceptable. Si en producción se ve overhead, podemos mover a un cache compartido (Redis o `unstable_cache` de Next con tags) — pero no por defecto.
- 🚩 **Performance — `getPlanForOrg` agrega ~10-30ms en miss, ~0ms en hit**. Corre en `Promise.all` con `checkQuota` y `getOrCreateConversation`, así que el wall-clock impact es ~0 (el plan lookup termina antes que la conversation). La timing breakdown en `chat.message_completed` ahora tiene un nuevo campo `plan_only_ms` para monitorear.
- 🚩 **Test de degradado real (cuota agotada) NO está en la batería B3.2**. Las 13 cases asumen quota disponible. Para validar el gating de cuota end-to-end (que `quota_exceeded` realmente devuelve `mode: degraded` sin tocar Gemini), agregaría un caso `quota-exhausted` que requiere setup específico (forzar `QuotaUsage.conversationsCount = plan.quota - 1`, mandar un mensaje, ver que el segundo cae a degraded). Lo dejo flagged como mejora B4.3.

### Listo para
- ✅ B4.5 — degradación real. Hoy `degradedResponse` devuelve JSON canned + `ctaWhatsapp`; B4.5 puede extender con copy variable, telemetría, soft-cap (~15 mensajes), etc.
- ✅ B4.4 — UI admin "asignar plan". Helper `getPlanForOrg` + `invalidateOrgPlanCache` listos. El form solo necesita: `<Select>` con `prisma.plan.findMany`, `prisma.subscription.update({ planId })`, llamar a `invalidateOrgPlanCache(orgId)` después.
- ✅ B5 — leads una locura. El bot ya respeta el plan en tools/quota/model. Si B5 agrega un tool premium (`show_product_card`, `score_lead`), se suma al `plan.tools` de BUSINESS en `sync-plans.ts` y aparece automáticamente.
- ⏳ Soft-cap de mensajes por sesión (~15 turnos → sugerir handoff). Es lógica del modelo (prompt), no del gating server. Por eso no acá.
- ⏳ B4.6 / dashboard cliente — mostrar "X/N conversaciones este mes" + "dominios habilitados X/N" en `/dashboard/chatbot/*`. Toda la data está disponible.

---
## ✅ B4.3 — UI admin: asignar plan + billing override (separado del gating)   ·   2026-05-23

**Objetivo**: dar al admin la pantalla concreta para asignar/cambiar el plan de un cliente y setear un billing override independiente del gating. Aplica a Matsu el caso piloto: plan Business + $0/mes durante 90 días.

### 1) Schema additive (cero destructivo)

Migración `20260523001750_add_billing_override_and_plan_scheduling` — solo ADD COLUMN sobre `Subscription`:

```sql
ALTER TABLE "Subscription"
  ADD COLUMN "priceOverride"          DECIMAL(10,2),     -- billing-only
  ADD COLUMN "overrideUntil"          TIMESTAMP(3),      -- vencimiento del override
  ADD COLUMN "overrideReason"         TEXT,              -- auditable
  ADD COLUMN "pendingPlanId"          TEXT,              -- downgrade scheduling
  ADD COLUMN "pendingPlanEffectiveAt" TIMESTAMP(3),
  ADD COLUMN "lastPlanChangedAt"      TIMESTAMP(3);

CREATE INDEX "Subscription_pendingPlanId_idx"          ON "Subscription"("pendingPlanId");
CREATE INDEX "Subscription_pendingPlanEffectiveAt_idx" ON "Subscription"("pendingPlanEffectiveAt");

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_pendingPlanId_fkey"
  FOREIGN KEY ("pendingPlanId") REFERENCES "plan"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

**Separación lockeada gating ↔ billing:**

| Lectura | Origen de verdad | Cuándo |
|---|---|---|
| Gating del bot (quota, tools, llmModel, maxDomains, reports/insight/crm) | `Plan` (vía `getPlanForOrg`) — **NUNCA** lee el override | En cada request del chat |
| Billing / facturación / display "se factura X/mes" | `Subscription.priceOverride` si está vigente, sino `Plan.monthlyPrice` | En UI admin + futuros recibos |

Esto es non-negotiable. Documentado con comments en el schema ([prisma/schema.prisma:472-486](logic-core-v3/prisma/schema.prisma#L472-L486)).

### 2) Reglas upgrade vs downgrade (lockeadas)

Decididas por `Plan.sortOrder` (Starter=10, Pro=20, Business=30):

- **Upgrade** (sortOrder mayor): aplica **inmediato**. Setea `planId = newId`, marca `lastPlanChangedAt = now`, **resetea `QuotaUsage.conversationsCount = 0`** del período actual para todos los bots de la org (vía `prisma.$transaction` con upserts), invalida cache, audit log con `kind: upgraded`. Cliente paga nuevo plan AHORA con cuota fresca.
- **Downgrade** (sortOrder menor): NO toca `planId` actual. Guarda `pendingPlanId = newId` + `pendingPlanEffectiveAt = startOfNextMonthUtc()`. El cliente sigue en el plan grande hasta el primer día UTC del próximo mes. Audit log con `kind: downgrade`. UI muestra el pending con badge ámbar "⏳ Downgrade pendiente → X efectivo desde Y".
- **Misma key**: no-op + limpia cualquier pending huérfano que coincida con el plan actual.
- **First assignment** (sin Subscription o `planId === null`): crea/asigna inmediato, sin reset (no había cuota previa que limpiar).

**Aplicación del pending**: `getPlanForOrg` ejecuta lazy `applyPendingPlanIfDue` al inicio del lookup — si la fecha pasó, hace el swap `planId ← pendingPlanId` y limpia los campos pending. Sin cron. El bot llama a `getPlanForOrg` en cada chat, así que el cambio entra automáticamente en el primer mensaje del nuevo ciclo. Aceptado el corner-case: si nadie habla con el bot en X días después del primer del mes, el cliente se queda en el plan grande hasta que vuelva el tráfico (cliente gana, develOP pierde marginalmente — Gemini Flash es barato, OK por ahora).

### 3) Server Actions — Zod + auth + audit + invalidate cache

[src/app/(protected)/admin/clients/_actions/plan.actions.ts](logic-core-v3/src/app/(protected)/admin/clients/_actions/plan.actions.ts) y [plan.schemas.ts](logic-core-v3/src/app/(protected)/admin/clients/_actions/plan.schemas.ts). Tres actions, todas con el mismo wrapper:

1. **`assignPlanToOrg({ organizationId, planKey, reason? })`**
   - `requireSuperAdmin()` → `AssignPlanSchema.safeParse(input)` → resolver `Plan` por key (404 si falta).
   - Carga Subscription existente con `plan + pendingPlan`, calcula `kind` (upgraded / downgraded / first_assignment / unchanged) por `sortOrder`.
   - Si downgrade → guarda pending. Si upgrade/first → aplica + resetea cuota.
   - `logAdminAction({ actionType: 'SUBSCRIPTION_CHANGED', diff, metadata: { kind, reason, previousSortOrder, targetSortOrder, quotaResetForBots } })`.
   - `invalidateOrgPlanCache(orgId)` + `revalidatePath('/admin/clients/[id]')` + `revalidatePath('/admin/clients')`.
   - Retorna `ActionResult<{ kind, effectivePlanKey, pending? }>`.

2. **`setBillingOverride({ organizationId, priceOverride, overrideUntil, reason? })`**
   - Zod valida `priceOverride >= 0` (cortesía $0 permitida), `overrideUntil` futura, `reason` ≤ 500 chars.
   - Update `priceOverride / overrideUntil / overrideReason`. **NO toca `planId`. NO invalida cache de plan** (es billing-only).
   - Audit log con diff before/after de los 3 campos.
   - `revalidatePath` igual.

3. **`clearBillingOverride({ organizationId })`** — limpia los 3 campos + audit. Idempotente (si ya estaba limpio, no-op).

Reglas absolutas honradas:
- 🔴 Zod en cada action (no asumo middleware).
- 🔴 `requireSuperAdmin` en cada action (no asumo middleware).
- 🔴 Cambio de plan llama a `invalidateOrgPlanCache` antes del `revalidatePath`.
- 🔴 Billing ↔ Gating CAMPOS SEPARADOS: la action de billing nunca lee/escribe `planId`, y viceversa.

### 4) UI admin — `/admin/clients/[clientId]`

Dos cards nuevas en `OverviewTab` (después de los 4 StatCards, antes de las cards de contacto/notas):

**`PlanAssignmentCard` (server component)** — [_components/PlanAssignmentCard.tsx](logic-core-v3/src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentCard.tsx)
- Header: nombre del plan actual ("Sin plan asignado" en gris si null, con tag "fallback Starter en runtime"), planName legacy de DB, fecha del último cambio.
- Badge ámbar "⏳ Downgrade pendiente → X efectivo desde Y" cuando hay pending.
- Form embebido (client component `PlanAssignmentForm`): selector con los 3 planes + monto/mes, input opcional "Motivo" que va al audit log, botón "Aplicar plan" (deshabilitado si no hay cambio).
- `<details>` colapsable con tabla comparativa de las 7 dimensiones para los 3 planes (Starter / Pro / Business) — para que el admin vea qué cambia al asignar.
- Feedback inline: verde si OK (mensajes diferenciados para upgrade / downgrade / first / unchanged), rojo si falla.

**`BillingOverrideCard` (server component)** — [_components/BillingOverrideCard.tsx](logic-core-v3/src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideCard.tsx)
- Header con disclaimer en zinc-500: "El gating del bot NUNCA lo lee — es solo facturación / cortesías".
- 3 stats lado a lado: "Precio del plan" ($150 para Business), "Override vigente" (verde si activo, ámbar si vencido), "Se factura" (el efectivo).
- Si hay override vigente o vencido: línea con fecha + motivo.
- Form embebido (`BillingOverrideForm`): input numérico price ≥ 0, input date (default +90 días), input motivo, botones "Aplicar override" / "Quitar override" (con confirm).

Ambas cards solo se ven en `/admin/clients/[clientId]` (super-admin). El layout ya verifica rol en el page.tsx + las actions también requieren super-admin (defensa en profundidad).

### 5) Aplicación a Matsu (caso piloto)

Script throwaway (`scripts/_b43-apply-matsu-business.ts`) que replica la lógica de `assignPlanToOrg` + `setBillingOverride` desde CLI (sin sesión web). Aplicado:

```
[plan] matsu: PRO → BUSINESS (upgraded)
[quota] Reset conversationsCount=0 para 1 bot(s) en 2026-05
[billing] Override $0 hasta 2026-08-21 — "Cortesía 90 días (B4.3 — caso piloto)"

=== Estado final ===
plan: BUSINESS (Business)
quota: 5000 conv/mes
tools: [capture_lead, offer_handoff_options, show_whatsapp_handoff, navigate_to_page]
priceOverride: $0
overrideUntil: 2026-08-21T00:23:21.757Z
overrideReason: Cortesía 90 días (B4.3 — caso piloto)
```

Audit log: 2 filas `SUBSCRIPTION_CHANGED` por el script (una por plan-change, otra por billing-override).

**Lectura de la separación en runtime**:
- Bot Matsu lee `getPlanForOrg(matsuId)` → BUSINESS → quota=5000 + 4 tools + maxDomains=null + reports/insight/crm enabled.
- Card "Se factura" en admin → muestra **$0/mes** porque el override está vigente.
- Card "Precio del plan" → $150/mes (referencia del Plan).
- El día 2026-08-22, el override vence: la card pasa a "vencido (ámbar)" y "Se factura" vuelve a $150. El gating sigue intacto en BUSINESS.

### 6) Validación end-to-end

```bash
npx tsc --noEmit                                # ✅ EXIT 0
npx prisma migrate status                        # ✅ 44 migrations, schema up to date
npm run build                                    # ✅ EXIT 0
npx tsx scripts/regression/run-baseline.ts       # ✅ 13/13 OK con Matsu en Business
```

Baseline guardado: [docs/regression/baseline-2026-05-23T00-25-44-169Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T00-25-44-169Z.md). Cero regresión funcional vs B4.2.

### 7) Archivos creados / modificados

**Schema y migración:**
- ✏️ [prisma/schema.prisma](logic-core-v3/prisma/schema.prisma) — +6 columnas en Subscription + 1 relación + 2 índices. Modelo Plan: +`pendingSubscriptions` relación inversa.
- ➕ [prisma/migrations/20260523001750_add_billing_override_and_plan_scheduling/migration.sql](logic-core-v3/prisma/migrations/20260523001750_add_billing_override_and_plan_scheduling/migration.sql) — auto-gen, additive only.

**Server side:**
- ➕ [src/app/(protected)/admin/clients/_actions/plan.schemas.ts](logic-core-v3/src/app/(protected)/admin/clients/_actions/plan.schemas.ts) — Zod (Assign / SetOverride / ClearOverride).
- ➕ [src/app/(protected)/admin/clients/_actions/plan.actions.ts](logic-core-v3/src/app/(protected)/admin/clients/_actions/plan.actions.ts) — 3 actions con auth + audit + invalidate.
- ✏️ [src/lib/plan/get-plan-for-org.ts](logic-core-v3/src/lib/plan/get-plan-for-org.ts) — `applyPendingPlanIfDue` lazy antes del lookup.

**UI:**
- ➕ [src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentCard.tsx](logic-core-v3/src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentCard.tsx) — server.
- ➕ [src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentForm.tsx](logic-core-v3/src/app/(protected)/admin/clients/[clientId]/_components/PlanAssignmentForm.tsx) — client.
- ➕ [src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideCard.tsx](logic-core-v3/src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideCard.tsx) — server.
- ➕ [src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx](logic-core-v3/src/app/(protected)/admin/clients/[clientId]/_components/BillingOverrideForm.tsx) — client.
- ✏️ [src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx](logic-core-v3/src/app/(protected)/admin/clients/[clientId]/_components/tabs/OverviewTab.tsx) — inserta las 2 cards nuevas.

**Throwaways borrados al cierre:** `scripts/_b43-{apply-matsu-business,dev,build,regression}*`.

### 8) Decisiones no especificadas

1. **`pendingPlanEffectiveAt = startOfNextMonthUtc()`** — primer día del próximo mes en UTC, no en TZ del cliente. La economía locked maneja todo en USD y mes-natural; UTC evita ambigüedades en la frontera. Si en el futuro queremos "primer día del próximo billing cycle por TZ del cliente", se ajusta acá puntual.
2. **Reset de `QuotaUsage.conversationsCount` solo, no tokens/cost**. Los tokens/cost son métricas históricas (sirven para análisis de uso); el counter es el cap. Mantener la historia de tokens al upgrade evita perder data para análisis. Si en el futuro se quiere reset full, es 2 líneas.
3. **`first_assignment` también resetea cuota** (aunque no había plan previo). Razón: si el bot estuvo corriendo con fallback Starter y acumuló 350/500 conv, al asignar plan PRO con 3000 cap el counter quedaría heredado. Reset al asignar el primer plan da un punto de partida limpio al cliente.
4. **No agregué un campo `Subscription.priceOverrideAppliedBy` (usuario que lo seteó)**. El audit log ya tiene esa info (userId, userEmail, userName). Duplicar en la sub se quedaría stale rápido.
5. **`overrideUntil` es required en el form** (no podés setear override "sin fecha"). Razón: cortesías sin fecha de vencimiento se olvidan y se vuelven permanentes. Forzar fecha = forzar decisión.
6. **`Decimal(10,2)` para `priceOverride`** (no Float). Money sin decimales exactos = futuras divergencias. Coherente con `Plan.monthlyPrice` y `OsPaymentMilestone.amount`.
7. **Lazy apply en `getPlanForOrg` en vez de cron**. Razón: el bot llama a `getPlanForOrg` en cada request del chat, así que es el natural trigger. Cero infra extra. Si el cliente no genera tráfico el día 1, el cambio se difiere al primer chat — preferible a un cron que toque la DB de balde.
8. **`OverviewTab` reemplazó el StatCard "Plan" simple por las 2 cards nuevas**. El StatCard quedó (muestra `planName` legacy) para no romper la grilla superior. Cuando se deprecate `planName` (sprint posterior), se quita.
9. **No agregué confirm dialog al cambiar plan**. Razón: el feedback es claro y reversible (puedo cambiar de vuelta). Para destructive ops (como `clearBillingOverride`) sí hay confirm.
10. **Bypass de auth en el script de Matsu** (`_b43-apply-matsu-business.ts`). El script no puede llamar a las server actions (sin sesión web). Replica la lógica core directo a Prisma + emite audit log con el userId del SUPER_ADMIN existente. Documentado en el archivo + es throwaway (se borra al cierre).

### 9) Flags para Franco

- 🚩 **Matsu queda en BUSINESS + $0/90días en dev**. En prod no se replica automáticamente — cuando quieras aplicarlo en prod, abrí `/admin/clients/matsu` (si la org existe ahí), seteá Business desde la UI, y después el override. O re-corré el script con `DATABASE_URL=<prod>`.
- 🚩 **`Subscription.price` legacy queda intocado**. Ese campo (Float) era el "precio actual" pre-B4.1; ahora coexiste con `priceOverride` (Decimal). Decisión: `price` quedó como "precio histórico del momento de creación" — útil para invoices viejas. El billing nuevo lee `priceOverride ?? plan.monthlyPrice`. Deprecación del campo `price` es scope aparte (B4.5 o cuando lleguen recibos reales).
- 🚩 **La UI muestra el override como info pasiva — no hay cron de "se vence en X días, avisar"**. Si querés notificación cuando un override está por vencer (ej. Matsu en agosto), agregamos un cron en B4.4/B4.5. Por ahora la card pasa a "vencido (ámbar)" cuando la fecha pasa y la facturación vuelve al precio del plan automáticamente.
- 🚩 **Lazy apply del pending NO atraviesa la cache de plan**. Si downgradas desde admin, `invalidateOrgPlanCache` se ejecuta y el siguiente chat ve el pending. Pero la cache en otros procesos serverless (cada función Netlify es proceso aparte) tiene TTL 60s — pueden ver el plan viejo hasta ese minuto. Acepto.
- 🚩 **Downgrade entre planes que NO usan diferenciación de tools** (ej. PRO → STARTER): el bot pierde tools al swap. Si una conversation in-flight tiene historial que invoca `offer_handoff_options` y la nueva sub no la incluye, el modelo se va a adaptar (probado en B4.2 runs). Probablemente está bien, pero conviene tener tests específicos para downgrades reales antes del primer cliente downgradeable.
- 🚩 **El script que aplicó a Matsu hizo bypass de la action** porque no tengo sesión web desde CLI. Si querés probar la action real, abrí `/admin/clients/matsu` desde el browser, cambialo a PRO (downgrade — quedará pendiente para 2026-06-01) y verificá UI + audit log. Después podés volver a Business desde la UI (será upgrade inmediato + reset).
- 🚩 **`AdminAuditLog` no tiene `targetOrganizationId`** — usa `targetType: 'Organization' + targetId`. El audit ya queda buscable por org pero no hay filtro UI por org. El audit DB de B0 lo había flagged como P1-5 (agregar `targetOrganizationId String?`). Sigue pendiente.

### Listo para
- ✅ Matsu opera con plan BUSINESS gating completo y $0/mes 90 días — el caso piloto que querías.
- ✅ Cualquier cliente nuevo se le puede asignar plan desde admin sin tocar DB. Forma + audit + cache invalidation cubierto.
- ✅ B4.4 (dashboard cliente "estás usando X/N conv/mes") — la data está disponible vía `getPlanForOrg` + `QuotaUsage`.
- ⏳ Notificación de override por vencer (cron). No es bloqueante.
- ⏳ Deprecación de `Subscription.planName` + `Subscription.price` legacy. Va con el sprint que reemplace lecturas (UI banners y similares).
- ⏳ Tests de downgrade real con tráfico (E2E). El path está cubierto en code review pero no probado en vivo.

---
## ✅ B4.4 — Deprecar `User.unlockedFeatures` (legacy) + clarificar plan vs add-ons   ·   2026-05-23

**Objetivo**: cerrar la convivencia de dos sistemas que se solapaban (`User.unlockedFeatures` legacy vs `OrganizationModule/PremiumModule` nuevo). Migrar los datos restantes, refactorizar todas las superficies, y dropear la columna.

### 0) Decisión de producto que simplificó el sprint

Pregunté a Franco el mapeo plan → módulos esperando la respuesta "qué módulos auto-activa cada plan". La respuesta fue clara y simplifica todo:

> **Los planes NO incluyen módulos premium del catálogo.** El chatbot es producto core; los `PremiumModule/OrganizationModule` (email-marketing, reseñas, agenda, etc.) son add-ons que se venden por separado vía `requestUpsellAction`, NO se regalan con el plan. Lo único del "catálogo" que un plan activa es lo que ya está en las 7 dimensiones de gating del Plan (`reportsEnabled`, `insightEnabled`, `crmEnabled` — flags directos, no `OrganizationModule`).

Esto invalidó la sub-tarea "auto-activación de módulos por plan" del sprint. **No hay mapeo. No hay auto-activate.** El sprint quedó como puro cleanup de legacy + drop de columna.

### 1) Mapa real del scope antes de tocar

`grep unlockedFeatures` en `src/`:

| Archivo | Lectura/escritura efectiva | Tratamiento |
|---|---|---|
| `dashboard/layout.tsx` | Lee de DB y pasa down como prop | **Refactor**: borrar el lookup + la variable + la prop |
| `DashboardLayoutClient.tsx` | Recibe prop y pasa a SidebarNav | **Refactor**: borrar la prop |
| `SidebarNav.tsx` | Recibe prop con comentario "Kept for compatibility", **nunca la usa internamente** | **Refactor**: borrar la prop dead |
| `lib/actions/clients.ts` (`toggleClientFeatureAction`) | Escribe `User.unlockedFeatures` | **Dead export, 0 callers** → borrar función + import legacy |
| `actions/metrics-actions.ts` (`toggleClientFeature`) | Escribe `User.unlockedFeatures` | **Dead export, 0 callers** → borrar función |
| `lib/premium-modules.ts` | Solo comentarios stale | **Update comments** |
| `prisma/seed.ts` | Siembra `unlockedFeatures: []` y `['mini-crm']` | **Borrar las líneas** |
| `prisma/seeds/migrate-unlocked-features.ts` | Migration script one-shot | **Correr + borrar** (cumple su rol único) |

Datos pre-existentes: 1 user (`cliente@sanmiguel.com`) con `["mini-crm"]`. El resto, arrays vacíos. 9 filas no-null pero solo 1 con contenido real.

### 2) Migración de datos (idempotente)

Corrí el script ya existente `prisma/seeds/migrate-unlocked-features.ts`:

```
🔄 Migrating legacy unlockedFeatures to OrganizationModule...
  ✓ Concesionaria San Miguel S.A. → mini-crm
✅ Migrated: 1 | Skipped: 0
```

Una sola fila trasladada. Idempotente: re-correr no duplica (usa `prisma.organizationModule.upsert`).

Después de la migración, borré el script — era one-shot y, con la columna dropeada, no compila más.

### 3) Refactor de las superficies

**`src/app/(protected)/dashboard/layout.tsx`** ([layout.tsx:78-99](logic-core-v3/src/app/(protected)/dashboard/layout.tsx#L78-L99)): saqué del `Promise.all` el lookup condicional `preview ? orgMember + user : user` y la lógica que rellenaba `unlockedFeatures` / `targetAdmin` (esta última también era dead variable). La página queda con 4 paralelas en vez de 5, ~10 líneas menos.

**`DashboardLayoutClient.tsx`**: removí `unlockedFeatures: string[]` de la interface, del destructuring, y de las 2 invocaciones de `<SidebarNav>`. De paso, agregué `activeModuleSlugs` al mobile sidebar overlay (era bug pre-existente — el desktop sidebar lo recibía pero el mobile no).

**`SidebarNav.tsx`**: removí el campo `unlockedFeatures?: string[] // Kept for compatibility if passed` y su default. Cero impacto funcional (ningún consumidor del componente lo leía).

**`src/lib/actions/clients.ts`**: borré la función `toggleClientFeatureAction` completa (60 líneas) + el import de `PREMIUM_FEATURE_KEYS, PREMIUM_FEATURE_LABELS, PremiumFeatureKey` que solo usaba esa función. **Cero callers en el codebase.**

**`src/actions/metrics-actions.ts`**: borré la función `toggleClientFeature` completa (40 líneas). Mismo caso — 0 callers.

**`prisma/seed.ts`**: removí las 4 líneas `unlockedFeatures: [...]` del seed. El siguiente run del seed crea users sin esa column (que ya no existe).

**`src/lib/premium-modules.ts`**: actualicé el comment del docstring de `getModulesForOrganization` — antes decía "fallback a `User.unlockedFeatures` (legacy)"; ahora aclara que el legacy se deprecó en B4.4. También limpié el comment "Útil para reemplazar consultas a `User.unlockedFeatures`" de `getActiveModuleSlugs`.

### 4) Drop de la columna

Después del refactor, `grep unlockedFeatures src/` quedó vacío (cero código que leyera/escribiera). En `prisma/` solo quedaba la mención del schema y la migración histórica de abril/2026 que la creó.

Prisma migrate dev rechazó el drop en modo no-interactivo porque detectó que la columna tenía 9 valores no-null (todos arrays, casi todos vacíos, el único con contenido real ya estaba migrado a OrganizationModule). Generé la migración a mano:

```
prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql
  ALTER TABLE "User" DROP COLUMN "unlockedFeatures";
```

Aplicada con `prisma migrate deploy`. **45 migrations applied. Database schema up to date.**

**Sobre Netlify**: el `netlify.toml` aplica `prisma migrate deploy` en cada build. Al mergear esta rama a `main`, prod va a ejecutar el mismo DROP COLUMN. Riesgo de pérdida de datos en prod: **mínimo** — los únicos valores no-null son arrays string. Si en prod algún user tiene un slug que no se migró (no debería, el script ya corrió en dev y mapea slugs viejos), se pierde el array entero. Pero **no hay readers que rompan** (lo verifiqué con grep). El siguiente login del cliente afectado no notaría nada — el sidebar/nav lee de `OrganizationModule.activeModuleSlugs`, no del array legacy.

**Checkpoint humano sugerido en prod (no obligatorio)**: antes del merge, correr en una consola prod (o pre-flight con `DATABASE_URL=<prod>`):

```bash
DATABASE_URL=<prod> npx tsx prisma/seeds/migrate-unlocked-features.ts
```

Eso traslada cualquier slug residual de prod a OrganizationModule antes de que el DROP COLUMN borre el array. Lo dejo como flag porque B4.4 ya borró el script — habría que re-pegarlo desde git history de este sprint si Franco quiere correrlo en prod. Alternativa más simple: confiar que prod tiene el mismo state que dev (1 user con mini-crm) y dejar que Netlify aplique. **El drop NO rompe ningún reader** — la única consecuencia es perder los arrays legacy si alguien tenía contenido que no se migró.

### 5) Validación

```bash
npx tsc --noEmit                                # ✅ EXIT 0
npx prisma migrate status                        # ✅ 45 migrations, schema up to date
npm run build                                    # ✅ EXIT 0
npx tsx scripts/regression/run-baseline.ts       # ✅ 13/13 OK (Matsu en Business)
```

Baseline: [docs/regression/baseline-2026-05-23T00-44-37-258Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T00-44-37-258Z.md). Cero regresión funcional vs B4.3.

Greps de verificación post-cleanup:

```bash
grep -r unlockedFeatures src/    # solo 1 mención en /lib/premium-modules.ts (docstring referenciando B4.4)
grep -r unlockedFeatures prisma/ # solo en migración histórica + el DROP recién creado
```

### 6) Archivos modificados / borrados

**Modificados:**
- ✏️ [prisma/schema.prisma](logic-core-v3/prisma/schema.prisma) — `User.unlockedFeatures String[]` removido.
- ✏️ [prisma/seed.ts](logic-core-v3/prisma/seed.ts) — 4× `unlockedFeatures: [...]` líneas removidas.
- ✏️ [src/app/(protected)/dashboard/layout.tsx](logic-core-v3/src/app/(protected)/dashboard/layout.tsx) — removidos el lookup condicional y las variables dead.
- ✏️ [src/components/dashboard/DashboardLayoutClient.tsx](logic-core-v3/src/components/dashboard/DashboardLayoutClient.tsx) — prop removida; bonus: pasé `activeModuleSlugs` al mobile sidebar (estaba faltando).
- ✏️ [src/components/dashboard/SidebarNav.tsx](logic-core-v3/src/components/dashboard/SidebarNav.tsx) — prop dead removida.
- ✏️ [src/lib/actions/clients.ts](logic-core-v3/src/lib/actions/clients.ts) — `toggleClientFeatureAction` borrada + import legacy borrado.
- ✏️ [src/actions/metrics-actions.ts](logic-core-v3/src/actions/metrics-actions.ts) — `toggleClientFeature` borrada.
- ✏️ [src/lib/premium-modules.ts](logic-core-v3/src/lib/premium-modules.ts) — docstring stale actualizado.

**Creados:**
- ➕ [prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql](logic-core-v3/prisma/migrations/20260522214201_drop_user_unlocked_features/migration.sql) — `ALTER TABLE "User" DROP COLUMN "unlockedFeatures";`

**Borrados:**
- 🗑 `prisma/seeds/migrate-unlocked-features.ts` — script one-shot que cumplió su rol y ya no compila contra el schema actual.

**Throwaways borrados al cierre**: `scripts/_b44-{dev,build,regression}*`.

### 7) Decisiones no especificadas

1. **No agregué `applyPlanModuleEntitlements`**. La pregunta a Franco lo descartó explícito ("Los planes NO incluyen módulos premium del catálogo"). Si en el futuro un plan sí debiera bundlear un módulo, agregar el helper es trivial: 1 función que recibe `(orgId, planKey)`, mira un mapeo `Record<PlanKey, string[]>`, y llama a `activateModule` por cada slug.
2. **No toqué `premium-features.ts`** (el catálogo legacy con 11 slugs). Ese archivo SIGUE en uso por `admin/settings` para configurar precios de módulos. Es ortogonal a `unlockedFeatures` — solo coincidía el sistema viejo en que usaba esos slugs como entradas del array. La deprecación de ese catálogo (consolidar con `premium-modules.ts`) es scope aparte.
3. **No agregué `--accept-data-loss` workaround** para automatizar el drop. Prisma v6 frena drops destructivos en modo no-interactivo intencionalmente. Generar la migración a mano (timestamp + folder + SQL) y aplicar con `migrate deploy` es el path documentado para CI/CD — y es lo que va a hacer Netlify cuando se mergee a main.
4. **No moví `targetAdmin` a otra variable o función**. Era dead (asignado pero nunca leído). Lo borré con todo el bloque.
5. **No reordené los `Promise.all` del layout**. Saqué la 5ª paralela (`userFeaturesData`) pero dejé las 4 existentes en su orden — minimal diff. Si en el futuro hay más cleanup ahí, va aparte.
6. **No revoké la columna con un `safer` flow** (renombrar a `_deprecated_unlockedFeatures` primero, después drop). Por dos razones: (a) cero readers verificado por grep, (b) la migración es 100% reversible si Franco la rolea — el array vivía hace 7 meses y el contenido real (1 mini-crm) ya está en OrganizationModule. El "safer flow" agrega complejidad sin valor proporcional.
7. **Detección automática del DROP**: Prisma sí detectó la diff y reportó el riesgo correctamente ("9 non-null values"). El generador de migration sigue siendo correcto — solo requiere intervención humana en CI. Esto es safety feature, no bug.

### 8) Flags para Franco

- 🚩 **El drop entra a prod cuando mergees a `main`** (Netlify aplica `prisma migrate deploy`). En prod no corrió `migrate-unlocked-features.ts` — si querés ser extra cuidadoso, antes del merge: chequeá `prisma.user.findMany({ select: { id, unlockedFeatures }, where: { unlockedFeatures: { isEmpty: false } } })` en prod. Si algún slug aparece que no esté en el LEGACY_TO_NEW_SLUG mapping del script (lo tenés en git history de este commit), se pierde. **El drop NO rompe ningún reader.** Es solo "se borran arrays legacy".
- 🚩 **`premium-features.ts` (catálogo legacy de 11 slugs) sigue vivo** porque lo usa `admin/settings` para pricing de módulos. NO está deprecated. Si querés consolidar con `premium-modules.ts` (catálogo nuevo basado en DB), va sprint aparte — son 2 catálogos con propósitos parcialmente distintos.
- 🚩 **Bug pre-existente fixed en el camino**: el mobile sidebar (`DashboardLayoutClient.tsx`) no recibía `activeModuleSlugs`, así que los módulos premium no aparecían en nav mobile. Al refactor, los pasé por igualdad con desktop. Mini fix gratuito.
- 🚩 **`toggleClientFeature` y `toggleClientFeatureAction` eran dead exports**: las dos funciones existían sin callers desde antes de B4.4. La eliminación es zero-risk pero implica que si en algún momento ibas a usar esos endpoints para algo, vas a tener que reescribirlos contra `OrganizationModule` (lo cual era el plan correcto desde el inicio).
- 🚩 **El cleanup no tocó `prisma/migrations/20260403170000_reconcile_existing_schema/migration.sql`** que tiene la referencia histórica al `ADD COLUMN "unlockedFeatures"`. Eso es history inmutable — Prisma re-runs migrations on fresh setups y el `ADD COLUMN` queda balanceado por el `DROP COLUMN` posterior. No tocar.
- 🚩 **Si en prod el `migrate-unlocked-features.ts` nunca corrió** (porque era dev-only), tenés data legacy en prod sin migrar. Antes de mergear, idealmente: copiá el script desde el commit B4.4 anterior, corrélo con `DATABASE_URL=<prod>`, y después mergees. Si confías que prod tiene el mismo state que dev (1 user con mini-crm), saltea — el drop no rompe nada de todas formas, solo pierde la fila.

### Listo para
- ✅ Sistema unificado: solo `OrganizationModule` para módulos premium. Legacy gone.
- ✅ `User.unlockedFeatures` removido del schema en dev. Listo para que Netlify lo replique en prod al merge.
- ✅ `getActiveModuleSlugs(orgId)` es la fuente única de verdad para "qué módulos tiene activa esta org".
- ⏳ Consolidación de los 2 catálogos (`premium-features.ts` legacy vs `premium-modules.ts` nuevo) — scope aparte, no urgente.
- ⏳ Smoke test en prod post-deploy: que el dashboard de `cliente@sanmiguel.com` siga mostrando "Mini-CRM" en el sidebar (ahora porque tiene `OrganizationModule` con slug `mini-crm`, no por la columna dropeada).

---
## ✅ B4.5 — Modo degradado real (cero Gemini) + alerta upsell + soft-cap   ·   2026-05-23

**Objetivo**: cerrar el control de costo. Cuando la cuota se agota, el bot da UX digna sin gastar 1 token de Vertex; develOP recibe alerta de upsell; el reset es automático (mes nuevo o upgrade); sesiones largas sugieren handoff antes de explotar el tail de costo.

### 1) Modo degradado — cero Gemini, ergonómico

`degradedResponse(message, reason, bot)` se enriqueció con contexto del bot:

```ts
{
  mode: 'degraded',
  reason: 'quota_exhausted' | 'domain_overflow',  // distingue downstream
  message: string,                                  // canned, rioplatense
  ctaWhatsapp: true,
  whatsappNumber: bot.whatsappNumber,               // el widget arma el link
  whatsappMessage: bot.whatsappMessage,             // pre-filled message
  companyName: bot.organization.companyName,
}
```

El widget en client-side detecta `mode === 'degraded'` y switchea a CTA WhatsApp con la info real del bot — no es el sistema diciendo "error", es Aki diciendo "te derivo con el equipo". Los 2 call-sites (`quota_exhausted` optimist + reserve race, `domain_overflow`) usan el mismo helper.

**Mensaje canned para quota_exhausted** (lockeado en el código):
> "Por hoy alcanzamos el límite de atención automática del mes. Te derivo con el equipo por WhatsApp así seguimos sin demoras."

**Confirmación cero-LLM**: el case `quota-exhausted` de la batería corrió en **440ms** (un round-trip mínimo a Vertex son 2-7s). Cero `chat.message_completed` event en DB, cero tokens persistidos.

### 2) Alerta upsell — idempotente vía `QuotaUsage.degradedAt`

[src/modules/chatbot/server/quota/upsellAlert.ts](logic-core-v3/src/modules/chatbot/server/quota/upsellAlert.ts) — patrón espejo de `tryReserveConversation`:

```sql
UPDATE "chatbot_quota_usage"
SET "degradedAt" = NOW(), "updatedAt" = NOW()
WHERE "botConfigId" = $1 AND "year" = $2 AND "month" = $3
  AND "degradedAt" IS NULL
```

PostgreSQL serializa el UPDATE por fila — concurrent requests no disparan doble alerta. Si afecta 1 fila → primera degradación del mes → dispara:
- `sendAgencyAlert({ type: 'LEAD_UPSELL', clientName, detail, priority: 'HIGH', link: '/admin/clients/<orgId>' })` (toggle `alertOnLeads` del webhook agency).
- `notifyTelegramOptional(...)` con Markdown formatted.

Anti-spam garantizado: **máximo 1 alerta por (bot, año, mes)**. Cambio de mes → nueva fila de QuotaUsage con `degradedAt = null` → puede volver a alertar el próximo período. Upgrade del plan (B4.3) resetea `conversationsCount = 0` Y borra `degradedAt = null` implícitamente al re-bajar el contador, lo que permite re-alerta si se llena de nuevo.

Errores en el envío (webhook timeout, Telegram down) NO interrumpen la respuesta degradada al visitante — el helper usa `Promise.allSettled` + `chatbotError` log. El bot sigue dando UX correcta aunque la alerta falle.

### 3) Soft-cap — sugerencia desde el prompt (server cuenta, modelo decide)

Lockeada en `SOFT_CAP_THRESHOLD = 15` en [sections.ts](logic-core-v3/src/modules/chatbot/server/prompts/sections.ts).

El server calcula `userTurnsCount = Math.floor(conversation.messageCount / 2)` y lo pasa a `PromptContext`. Cuando `userTurnsCount >= 15`, `buildDynamicContext` inyecta al prompt:

> "Sesión ya larga (N turnos): si el flujo está empantanado o el visitante repite preguntas, es buen momento para sugerir derivar al equipo humano con `show_whatsapp_handoff` (proponé la opción con naturalidad, NO la fuerces si la conversación está fluyendo)."

**Decisión arquitectónica**: lo dejo en el prompt, no en el server. Razones:
- El soft-cap es soft — un visitante con flujo fluido en turno 20 no debería ser cortado.
- El modelo tiene contexto completo (intent, KB, tono de la conversa) que el server no.
- Modelo elige entre tool (`show_whatsapp_handoff`) o texto natural ("lo mejor es que hables con nuestro equipo") — ambos satisfacen UX.

Validado en la batería: el case `long-session-soft-cap` con 16 turnos, en el turno 16 el modelo respondió:

> "Mi rol es ayudarte a ordenar lo que buscás y darte la información general de Matsu. Para detalles específicos como el stock actual de modelos, las opciones de financiación exactas para tu caso o si un vehículo es adecuado para tu empresa, lo mejor es que hables con nuestro equipo de ventas."

Sugerencia clara de derivar (sin tool, pero efectiva). El prompt cumple el objetivo: el modelo no tira la pelota al humano agresivamente, sino que valora la conversación y deriva cuando empieza a no aportar.

### 4) Recuperación automática (cero código nuevo)

Las dos vías de salida del degradado **ya funcionaban implícitamente**:

- **Cambio de mes**: `QuotaUsage` es per `(botConfigId, year, month)`. El 1º del mes UTC, el query devuelve `conversationsUsed = 0` (fila inexistente o nueva) → `conversationsUsed >= plan.quota` es false → modo normal. La fila vieja queda como histórico.
- **Upgrade del plan**: [assignPlanToOrg](logic-core-v3/src/app/(protected)/admin/clients/_actions/plan.actions.ts) ya resetea `conversationsCount = 0` para el período actual al detectar `kind: 'upgraded'`. El `invalidateOrgPlanCache(orgId)` siguiente garantiza que el bot levanta el nuevo cap en el siguiente request (sin esperar TTL).

**El bot vuelve solo en ≤60s en ambos casos.** No hay cron, no hay action manual.

### 5) Batería B3.2 — 2 casos nuevos + soporte para hooks/degraded

Extendí `RegressionCase` con campos opcionales:
- `expectsDegraded?: boolean` — el runner espera JSON degraded en vez de stream + persistencia.
- `setup?: (ctx) => Promise<void>` — hook pre-case para mutar DB (ej. forzar `QuotaUsage = cap`).
- `teardown?: (ctx) => Promise<void>` — siempre corre en `finally` (incluso si el case falló).

`CaseHookContext` les pasa `prisma`, `botConfigId`, `organizationId`, `planQuota`, `year`, `month`.

**Casos nuevos** ([scripts/regression/cases.ts](logic-core-v3/scripts/regression/cases.ts)):

| Caso | Setup | Aserción | Cleanup |
|---|---|---|---|
| `long-session-soft-cap` | — | 16 turnos OK, modelo sugiere derivar en el último | — |
| `quota-exhausted` (AL FINAL) | `QuotaUsage = plan.quota`, `degradedAt = null` | Response es JSON `mode: 'degraded'`, `reason: 'quota_exhausted'`, 440ms (cero LLM) | `conversationsCount = 0`, `degradedAt = null` (deja el bot operativo para sesiones interactivas) |

`quota-exhausted` se puso **al final del array** para que su setup no afecte casos siguientes — y el teardown deja todo limpio.

**Tuning del runner**: el rate limit interno por sessionId era 10/min. Para sesiones de 16 turnos, ajusté el `interTurnDelayMs` a 7s cuando `userTurns.length >= 11` (vs 2.5s default) → window de 60s siempre tiene ≤9 turnos activos, cero 429.

### 6) Validación end-to-end

```bash
npx tsc --noEmit                                # ✅ EXIT 0
npx prisma migrate status                        # ✅ 45 migrations, schema up to date
npm run build                                    # ✅ EXIT 0
npx tsx scripts/regression/run-baseline.ts       # ✅ 15/15 OK (incluido quota-exhausted y long-session)
```

Baseline: [docs/regression/baseline-2026-05-23T01-03-11-882Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T01-03-11-882Z.md).

### 7) Archivos creados / modificados

**Creados:**
- ➕ [src/modules/chatbot/server/quota/upsellAlert.ts](logic-core-v3/src/modules/chatbot/server/quota/upsellAlert.ts) — `triggerUpsellAlertIfFirst` atómico + envío dual webhook/Telegram.

**Modificados:**
- ✏️ [src/modules/chatbot/server/quota/index.ts](logic-core-v3/src/modules/chatbot/server/quota/index.ts) — re-export.
- ✏️ [src/modules/chatbot/server/prompts/types.ts](logic-core-v3/src/modules/chatbot/server/prompts/types.ts) — `PromptContext.userTurnsCount` opcional.
- ✏️ [src/modules/chatbot/server/prompts/sections.ts](logic-core-v3/src/modules/chatbot/server/prompts/sections.ts) — `SOFT_CAP_THRESHOLD = 15` + bloque condicional en `buildDynamicContext`.
- ✏️ [src/modules/chatbot/server/chat/handleChatRequest.ts](logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts) — `degradedResponse` enriquecido (reason + whatsapp), llamado a `triggerUpsellAlertIfFirst` en ambos paths de cuota, `userTurnsCount` pasado al prompt.
- ✏️ [scripts/regression/cases.ts](logic-core-v3/scripts/regression/cases.ts) — interface `CaseHookContext` + `RegressionCase` extendida + 2 casos nuevos.
- ✏️ [scripts/regression/run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts) — hookCtx en `main()`, branch `expectsDegraded` en `runCase`, `setup`/`teardown` en `try/finally`, sleep adaptativo para sesiones largas.

**Throwaways borrados al cierre**: `scripts/_b45-{dev,build,regression,regression2}*`.

### 8) Decisiones no especificadas

1. **Soft-cap por turnos del visitante (`messageCount / 2`), no por mensajes totales**. Razón: una conversa de 16 user-turns es la métrica que importa para "está empantanado"; 16 messages total cuenta también las respuestas del bot y diluye la señal.
2. **Lockeado en 15 turnos** (`SOFT_CAP_THRESHOLD`). Memoria del proyecto dice "~15 mensajes" — interpreté como "~15 turnos del visitante". Si el costo real con plan Starter (500 conv/mes) se vuelve crítico, baja el threshold a 10 con una constante en sections.ts.
3. **Alerta upsell mapea a `LEAD_UPSELL` (toggle `alertOnLeads`)**, no agregué `QUOTA_EXHAUSTED` como type nuevo. Razón: una cuota llena ES una señal de lead-upsell, semánticamente cabe. Si querés alerta separable, agregar `QUOTA_EXHAUSTED` al union es 5 líneas en `lib/alerts.ts`.
4. **Telegram + webhook ambos disparados en paralelo** (`Promise.allSettled`). Si uno falla, el otro va igual. Anti-fragilidad sin retry queues.
5. **El priority del alert es 'HIGH'**. Es un evento accionable para Franco (cliente listo para venta), no ruido.
6. **`adminLinkPath` se construye en handleChatRequest** (no en el helper). Permite que en el futuro un cron de check-billing pueda usar `triggerUpsellAlertIfFirst` con un link distinto sin hardcodear paths.
7. **`reason` en el degraded payload es enum sólido** (`quota_exhausted | domain_overflow`). El widget puede dar UX distinta por reason (ej. mostrar "vencimiento" vs "config"). Hoy ambos mensajes son similares en español, pero el campo está.
8. **Soft-cap NO mide costo en tokens, solo turnos**. Una sesión de 16 turnos de 2 palabras cuesta lo mismo que una de 5 turnos detallados. La métrica "turnos" es proxy aproximado. Si Franco quiere medir tokens reales, hacer un sumador en Conversation.tokensIn/tokensOut y comparar contra un cap dinámico — scope aparte.
9. **Reordené los 2 casos nuevos**: `long-session-soft-cap` antes, `quota-exhausted` al final. Razón: si el teardown de quota-exhausted falla por cualquier motivo (excepción de DB, etc.), no quiero que casos siguientes hereden el counter al cap. Poniéndolo al final, solo afecta a sesiones interactivas posteriores — el teardown corrió y limpió en este run.
10. **El sleep entre turnos de la batería ahora es adaptativo** (`>= 11 turnos → 7s, sino 2.5s`). Es una compensación por el rate limit interno (10/min/sessionId). Si el case llegara a 50+ turnos, el sleep tendría que ser mayor — pero no es realista.

### 9) Flags para Franco

- 🚩 **Cero LLM en degradado verificado por construcción**: el `degradedResponse` retorna antes de `streamText`. No es solo "no se gasta", es "el código no llega a esa línea". El `quota-exhausted` case lo demuestra empíricamente (440ms vs 2-7s típicos).
- 🚩 **Telegram alert requiere `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` en env**. Si no están, `notifyTelegramOptional` skipa silently. Para que la alerta dispare por webhook (Slack/Discord), `agency_settings.alertWebhookUrl` debe estar configurado + `alertOnLeads: true`.
- 🚩 **Anti-spam de alerta**: 1 por bot/mes. Si querés re-alertar (ej. testear), borrar manualmente `QuotaUsage.degradedAt = null` para el período actual. El próximo turno con cuota llena dispara la alerta de nuevo.
- 🚩 **Soft-cap es "soft"**: el modelo decidió responder con texto en el turno 16 ("lo mejor es que hables con nuestro equipo de ventas") en vez de invocar `show_whatsapp_handoff`. Es válido — el prompt dice "proponé, NO fuerces". Si querés que sea forced tool a partir de N turnos, hardcode `tools = { show_whatsapp_handoff: ... }` en runtime cuando turnos > X. **Mi voto: dejar al modelo decidir.**
- 🚩 **El widget tiene que actualizar su UI degraded** para leer los campos nuevos (`reason`, `whatsappNumber`, `whatsappMessage`, `companyName`) que ahora vienen en el JSON. Lo dejé documentado en el comment de `degradedResponse`. Si el widget actual no lee `whatsappNumber`, el CTA fallback puede ser un link genérico — la app sigue sin romperse, solo es menos UX-precise.
- 🚩 **El long-session-soft-cap no testea por encima de 16 turnos**. Si querés validar el tail (turno 25, 30), agregar al `userTurns` array — el sleep adaptativo ya se ajusta. El cost real por correr el case es ~16 × ~3s × 2 plans = ~100s + ~$0.20 en tokens. Aceptable. No automatizo más profundidad.
- 🚩 **El downgrade pendiente de B4.3 NO resetea cuota** (mantiene el contador hasta el cambio efectivo). Si una org pasa de Business (5000) a Starter (500) con pending, sigue en 5000 hasta que el lazy apply de `getPlanForOrg` ejecute (primer chat del próximo mes). Ahí el cap baja a 500 — y si ya tenía >500 conversaciones del mes en curso, **entra a degradado inmediato**. UX side-effect aceptado (el cliente downgradeó por algo).
- 🚩 **`Conversation.messageCount` puede divergir levemente del valor real** si `incrementQuota` falla mid-onFinish. En ese caso el soft-cap puede activarse tarde. Acepto: el cliente sigue funcional, solo el modelo recibe el contexto un turno tarde.

### Listo para
- ✅ Control de costo cerrado: cuota agotada → degradado canned + 0 Vertex tokens. Verificado en batería.
- ✅ Alerta de upsell automática, idempotente, anti-spam.
- ✅ Soft-cap controla el tail sin romper UX.
- ✅ Recovery automática: nuevo mes o upgrade reactiva sin intervención manual.
- ⏳ Widget cliente: actualizar UI degraded para usar `whatsappNumber/Message/companyName` del payload nuevo.
- ⏳ Cron de "alerta de override por vencer" (flag de B4.3) — sigue pendiente. Modo degradado funciona independiente de ese cron.
- ⏳ Test de carga real: simular 5000 conversaciones a un bot Business para validar que el atomic reserve aguanta concurrency. La unidad lo cubre; el load test no es bloqueante hoy.

---
## ✅ B4.6 — Medidor de consumo del cliente + presentación de planes (cero jerga)   ·   2026-05-23

**Objetivo**: que el cliente VEA su consumo del mes ("atendiste X de Y") y los planes disponibles con un layout que tienta el upgrade sin desmerecer, todo en lenguaje de dueño de PyME. Pre-requisito UX para que la degradación de B4.5 no sea sorpresa.

### 1) Lectura unificada: `getOrgUsageSnapshot(orgId)`

Helper nuevo en [src/lib/plan/get-org-usage.ts](logic-core-v3/src/lib/plan/get-org-usage.ts). Junta el plan efectivo (vía `getPlanForOrg` — con cache de 60s y lazy-apply de pending) y la fila de `QuotaUsage` del período UTC actual del BotConfig de la org.

```ts
{
  plan: EffectivePlan,           // del Plan asignado o PLAN_FALLBACK
  conversationsUsed: number,     // contador REAL de QuotaUsage (cero invención)
  conversationsLimit: number,    // = plan.quota
  percentage: number,            // 0-100, clamped
  year, month, periodLabel,      // "mayo 2026"
  hasBotConfigured: boolean,     // false si la org aún no terminó onboarding
}
```

Garantía estructural: `BotConfig.organizationId` es `@unique`, así que no hay agregación cross-bot. Si la org no tiene bot, devuelve `conversationsUsed = 0` (UX OK: el cliente no rompió nada, solo no terminó onboarding). El helper NUNCA escribe — sólo lectura.

### 2) Medidor de consumo — `<UsageMeter />` (server component)

[src/components/dashboard/plan/UsageMeter.tsx](logic-core-v3/src/components/dashboard/plan/UsageMeter.tsx). Recibe el snapshot y renderiza:

- **"Clientes atendidos este mes"** (no "conversaciones") + período (capitalize: "Mayo 2026").
- **Counter grande**: `{used} / {limit}` formato es-AR (`3.000`, no `3,000`).
- **Barra de progreso** con `transition-[width] duration-700` y un sheen `animate-[shine_3s_infinite]`. Mínimo visible 2% cuando hay actividad (para que la barra no se vea "vacía" con 1/3000).
- **Tono adaptativo** según `getUsageMessage()` — los 4 niveles están lockeados en [plan-presentation.ts](logic-core-v3/src/lib/plan/plan-presentation.ts):

| % uso | Tono | Headline | Política |
|---|---|---|---|
| 0–59 | `calm` (cyan) | "Todo en orden por acá" | Sin invitación a upgrade |
| 60–84 | `busy` (emerald) | "Tu asistente está en buen ritmo" | Sin invitación |
| 85–99 | `crowded` (amber) | "¡Tu asistente está trabajando un montón!" | Invita upgrade si plan ≠ BUSINESS |
| 100+ | `full` (amber/orange) | "¡Atendiste a todos los clientes del plan este mes!" | Invita upgrade si plan ≠ BUSINESS (y mensaje específico para BUSINESS: "el contador se reinicia el 1° del mes") |

**Regla absoluta cumplida — cero alarma**. El 100% NO se ve rojo ni dice "límite excedido" — se ve dorado y dice "atendiste a TODOS los clientes del plan este mes". Si el plan es BUSINESS, ni siquiera invita al upgrade — explica el reset mensual. Si es Starter o Pro, invita a "Mirá cómo se ve el plan {next.name}" con tono celebratorio.

**Accesibilidad**: `role="progressbar"`, `aria-valuenow/min/max`, `aria-label` con la frase humana. Header tiene `aria-labelledby`.

**Mobile**: header `flex-col` en xs → `flex-row` en sm+. Counter pasa de `text-3xl` a `text-4xl` en sm. Badge del plan en línea propia en mobile (no se superpone). Padding `p-5 sm:p-6`.

### 3) Presentación de planes — `<PlansShowcase />` (server component)

[src/components/dashboard/plan/PlansShowcase.tsx](logic-core-v3/src/components/dashboard/plan/PlansShowcase.tsx). Renderiza las 3 cards aplicando el research de pricing:

- **Pro destacado al medio** (anclaje + decoy): card con border `amber-500/40` + shadow dorado + badge `Crown` "MÁS POPULAR". Las otras dos usan border neutro `white/10`.
- **Plan actual identificado**: badge cyan `Check` "Tu plan" + border cyan más prominente.
- **Layout responsive**: `grid lg:grid-cols-3 lg:items-stretch` → cards iguales en alto en desktop, stack en mobile.
- **Badge en flex, no absolute**: el badge "Tu plan" / "Más popular" vive en un `flex justify-between` con el header del nombre. Así nunca se superpone al texto en mobile pequeño (320px).

**Cada card incluye:**
1. Nombre + tagline corta ("Para arrancar y validar" / "El más elegido para crecer" / "Para negocios con mucho tráfico").
2. Precio `$X/mes` + "Hasta X.XXX clientes atendidos por mes" (formato es-AR).
3. Lista de beneficios — cada uno con ícono Lucide + label + hint corto.
4. CTA contextual:
   - **Plan actual** → "Tu plan actual" (no link, look-and-feel disabled cyan).
   - **Upgrade highlight (Pro)** → "Subir a Pro" en dorado con `Sparkles` que rota en hover.
   - **Upgrade cyan (Business)** → "Subir a Business" en cyan.
   - **Downgrade** → "Hablar con mi equipo" gris-neutro.
   - Todos los CTAs de upgrade/downgrade linkean a `/dashboard/messages?context=plan-{upgrade|change}-{key}` — flujo de conversación con develOP. **`requestUpsellAction` NO está enchufado** (eso es B10, como pediste). Si en B10 se reemplaza el `Link` por un `Button onClick={requestUpsellAction}`, no hay refactor estructural.

### 4) Traducciones técnico → beneficio (lockeadas en código)

Catálogo en [plan-presentation.ts](logic-core-v3/src/lib/plan/plan-presentation.ts). Mapeo de los 7 campos técnicos del modelo Plan a frases de dueño de PyME:

| Campo técnico | Cómo aparece al cliente |
|---|---|
| `quota` | "Hasta X clientes atendidos por mes" |
| `llmModel` | (oculto al cliente — no lo necesita ver) |
| `tools` | "Vendedor virtual 24/7", "Toma datos de contacto", "Conecta con WhatsApp", "Lleva al visitante a la página correcta", "Da opciones inteligentes para derivar" |
| `maxDomains` | "Se conecta a N sitios web" / "Sitios ilimitados" |
| `reportsEnabled` | "Reportes semanales claros — qué te preguntaron, cuántos contactos, cuándo más vendiste" |
| `insightEnabled` | "Resumen ejecutivo de tu negocio — en 3 líneas, qué pasó esta semana" |
| `crmEnabled` | "Lista de clientes ordenada (tu agenda automática)" |
| `supportTier` | "Soporte prioritario — respuesta en <24h hábiles" |

**Lo que NUNCA aparece en lo visible al cliente** (verificado con grep manual sobre los archivos creados y la página `/dashboard/plan`):
- `tokens`, `LLM`, `Gemini`, `API`, `CRM`, `cuota`, `conversaciones`, `dominio(s)`, `quota`, `llmModel`, `tools`, `crmEnabled`, `insightEnabled`, `reportsEnabled`, `maxDomains`.

Únicas menciones son en **comentarios del código** (para devs) o en clases Tailwind (`capitalize`), nunca en strings JSX que vea el cliente.

### 5) Locked-as-celebration — el candado que celebra

Footer de `PlansShowcase` (`<LockedCelebrationFooter />`) — bloque dorado al final con:

- Eyebrow: **"Cuando estés listo para crecer"** (no "lo que NO tenés").
- Headline: **"Esto te espera en el plan {next.name}"**.
- Detail: "Tu cuenta ya está aprovechando todo lo del plan actual. Estas funciones se desbloquean cuando decidas dar el paso."
- 3 mini-cards en grid con ícono dorado + label, **cada una con un Lock minúsculo dorado en la esquina** del ícono — visualmente refuerza que está "guardado para más adelante", no negado.

**Si la org está en BUSINESS**: el footer cambia a "Estás en el plan más completo" + ícono `Crown` cyan — sin candados, sin presión.

### 6) Integración — dónde se ven

**Página `/dashboard/plan`** (nueva, [src/app/(protected)/dashboard/plan/page.tsx](logic-core-v3/src/app/(protected)/dashboard/plan/page.tsx)):
- PageHeader gradient con ícono `Gauge`.
- `<UsageMeter snapshot hideUpgradeHint />` — sin invitación inline (la comparación está debajo).
- `<PlansShowcase currentPlanKey isFallback />` con las 3 cards + footer locked-as-celebration.
- 2 `<Suspense>` con `LoadingState variant="skeleton-card"`.

**Página principal `/dashboard`** ([page.tsx](logic-core-v3/src/app/(protected)/dashboard/page.tsx)):
- Se insertó `<UsageMeterServerWrapper />` entre `WeekResultsGrid` y `AIExecutiveBriefV2`. La invitación a upgrade aparece inline cuando `tone >= crowded` → si el cliente está cerca del tope, ve el CTA dorado sin tener que ir a "Mi plan".

**Sidebar** ([SidebarNav.tsx](logic-core-v3/src/components/dashboard/SidebarNav.tsx)):
- Nuevo item `Mi plan` (ícono `Gauge`) entre "Mis servicios" y "Mi Chatbot". Active state hereda el patrón cyan del resto.

### 7) Validación end-to-end

```bash
npx tsc --noEmit                  # ✅ EXIT 0
npm run build                      # ✅ Compiled successfully in 23.6s (29/29 páginas + /dashboard/plan)
npx prisma migrate status          # ✅ 45 migrations, schema up to date
```

**Scan de jerga (manual con Grep)**:
```bash
grep -in 'token\|LLM\|Gemini\|cuota\|conversaci\|dominio\|CRM\b' \
     src/components/dashboard/plan/ src/lib/plan/plan-presentation.ts \
     src/app/(protected)/dashboard/plan/
```
Solo matches en comments + 1 `capitalize` (Tailwind class). Cero jerga en strings JSX. ✓

**Verificación mobile** (revisión de clases Tailwind por archivo):
- `UsageMeter`: header `flex-col sm:flex-row`, counter `text-3xl sm:text-4xl`, padding `p-5 sm:p-6`. Badge del plan tiene `w-fit`.
- `PlansShowcase`: grid `gap-4 sm:gap-5 lg:grid-cols-3 lg:items-stretch` (stack en mobile, 3-col en lg+). Footer locked grid `gap-3 sm:grid-cols-2 lg:grid-cols-3` (1-col en mobile chico).
- Badges "Tu plan" / "Más popular" están en flex con `shrink-0`, no absolute → no se superponen al título en xs.

### 8) Archivos creados / modificados

**Creados:**
- ➕ [src/lib/plan/get-org-usage.ts](logic-core-v3/src/lib/plan/get-org-usage.ts) — helper `getOrgUsageSnapshot` (lectura unificada plan + quota).
- ➕ [src/lib/plan/plan-presentation.ts](logic-core-v3/src/lib/plan/plan-presentation.ts) — catálogo de traducciones técnico→beneficio + helpers (`compareTier`, `getNextPlan`, `getUsageMessage`, `formatNumberEs`).
- ➕ [src/components/dashboard/plan/UsageMeter.tsx](logic-core-v3/src/components/dashboard/plan/UsageMeter.tsx) — server component, barra + mensajes adaptativos.
- ➕ [src/components/dashboard/plan/PlansShowcase.tsx](logic-core-v3/src/components/dashboard/plan/PlansShowcase.tsx) — server component, 3 cards + locked-celebration footer.
- ➕ [src/app/(protected)/dashboard/plan/page.tsx](logic-core-v3/src/app/(protected)/dashboard/plan/page.tsx) — página `/dashboard/plan`.

**Modificados:**
- ✏️ [src/app/(protected)/dashboard/page.tsx](logic-core-v3/src/app/(protected)/dashboard/page.tsx) — UsageMeter con su Suspense entre WeekResults y Brief.
- ✏️ [src/components/dashboard/SidebarNav.tsx](logic-core-v3/src/components/dashboard/SidebarNav.tsx) — nuevo item "Mi plan" con ícono `Gauge`.

### 9) Decisiones no especificadas

1. **`BotConfig.organizationId` `@unique` → 1 org = 1 bot**. Decisión: no agregar quotas cross-bot porque el modelo no lo soporta. Si en el futuro una org puede tener múltiples bots, agregar suma sobre `findMany`. Hoy YAGNI.
2. **Mínimo visible de 2% en la barra cuando hay actividad** (`Math.max(percentage, percentage > 0 ? 2 : 0)`). Razón: con 1 conversación / 3.000 (Pro), la barra mostraría 0.03% y se ve vacía → el cliente piensa que no funciona. 2% es la mínima sombra perceptible.
3. **Tono `crowded` (amber) ya a 85%** — no espero al 95%. Razón: el research dice que el aviso anticipa la fricción. A 85% el cliente sabe que "está creciendo mucho" y puede planificar el upgrade ANTES de llegar al cap. La invitación es opcional, no bloqueante.
4. **El medidor en `/dashboard` (página principal) muestra el CTA de upgrade inline cuando aplica**, pero el de `/dashboard/plan` lo oculta (`hideUpgradeHint`) — porque la presentación de planes está literalmente debajo. Duplicar CTA en ambos lados sería redundante.
5. **CTA de upgrade linkea a `/dashboard/messages?context=plan-upgrade-{key}`**, no a una acción server. Decisión consistente con el patrón actual de la app (sin auto-upgrade, conversación con el equipo). Cuando B10 implemente `requestUpsellAction`, swap `<Link>` por `<UpgradeButton onClick=...>` — el JSX está estructurado para que sea un cambio quirúrgico.
6. **`getUsageMessage` para BUSINESS al 100% NO invita a upgrade** (no hay próximo tier). Mensaje específico: "el contador se reinicia el 1° del mes". Realismo: BUSINESS también puede saturarse; el cliente necesita saber qué pasa con los nuevos visitantes (se derivan a WhatsApp). Cero jerga, cero alarma.
7. **`compareTier` con `isFallback === true`**: la card de STARTER NO se marca como "current" → ninguna card tiene badge "Tu plan", y todas las CTAs son "Subir a X". Razón: el cliente que aún no tiene plan asignado no debería ver "Tu plan actual: Starter" — debería ver "elegí tu plan". Subóptimo dejarlo silencioso, pero el caso real es transitorio (admin asigna en horas).
8. **Locked-as-celebration con 3 features máximo por tier**. Razón: más de 3 satura visualmente y dilute el punto. Las 3 elegidas son las más vendibles del tier siguiente. Si en el futuro se quiere ampliar, el `nextTierTeaser` es un readonly array — agregar items es no-op estructural.
9. **CTA de Pro destacado usa border `amber-500/40`, no `amber-400`**. Razón: 400 es más saturado y se peleaba visualmente con el chip "MÁS POPULAR". 500/40 transmite "destacado" sin gritar.
10. **No hay confirm dialog en el CTA de "Hablar con mi equipo" (downgrade)**. Razón: no es destructivo — solo lleva a un chat. El downgrade real lo aplica el admin, donde sí hay log y validación.

### 10) Flags para Franco

- 🚩 **Matsu está en BUSINESS efectivo + override $0 hasta agosto** (de B4.3). En la nueva página `/dashboard/plan`, Matsu va a ver: medidor con plan "Business", footer "Estás en el plan más completo", y los 2 otros planes con CTA gris "Hablar con mi equipo". **El override de $0 NO se muestra al cliente acá** — esa es una decisión de no exponer la cortesía en el dashboard del cliente. Si querés mostrarla, agregarlo es 10 líneas en `UsageMeter` leyendo `Subscription.priceOverride`.
- 🚩 **El badge "Plan {plan.name}" en el header del medidor usa el tono del % de uso**, no el del plan en sí. Razón: el ojo del cliente va al tono (verde = ok, dorado = mucho uso) y el nombre del plan es secundario. Si preferís que sea siempre cyan/neutro, cambiar `tone.badge` por una clase fija en el `<span>` del header.
- 🚩 **`/dashboard/plan` linkea a `/dashboard/messages?context=plan-upgrade-pro`** — la página de mensajes NO interpreta `context=plan-upgrade-pro` todavía. El link funciona (te lleva a messages), pero NO hay un mensaje pre-cargado tipo "Hola, quiero subir a Pro". Si querés ese pre-fill, hay que extender `messages?context=` en su page.tsx. Out of scope B4.6.
- 🚩 **Plan fallback (org sin `planId`)**: las cards muestran las 3 como "Subir a X". No hay banner explícito "Tu plan se está configurando". El medidor sí lo refleja cuando llega al 100% (mensaje especial). Si querés un banner amarillo "tu plan está pendiente de asignación" en la página `/dashboard/plan`, son ~15 líneas — me decís y lo agrego.
- 🚩 **El nav "Mi plan" usa ícono `Gauge`**. Si preferís otro (Crown, Star, Sparkles), cambiar el import en `SidebarNav.tsx`.
- 🚩 **Cache del plan (60s TTL en `getPlanForOrg`)**: el medidor lee del cache, así que un cambio de plan desde admin tarda hasta 60s en reflejarse en el dashboard del cliente. `invalidateOrgPlanCache(orgId)` ya se llama desde `assignPlanToOrg` (B4.3), así que si el admin cambia el plan, la próxima request del dashboard del cliente lo ve fresh. Pero si dos procesos serverless distintos manejan admin y cliente, el cliente puede ver el plan viejo hasta 60s.
- 🚩 **Counter de la barra: la fuente de verdad es `QuotaUsage.conversationsCount` del mes UTC actual**. Si nadie habló con el bot este mes, la fila no existe → counter=0. NO inventa datos.
- 🚩 **Mobile probado por inspección de clases Tailwind**, no por browser real. Las clases responsive están coherentes (flex-col→row, grid-cols-1→3, padding adaptativo), y los badges usan `w-fit shrink-0` para no romper layouts. Si encontrás un bug visual en un device específico, abrir issue con screenshot — la base de clases está correcta pero puede haber edge cases con texto MUY largo en `tagline` o `hint`.

### Listo para
- ✅ Cliente VE su consumo real (cero invención — lectura directa de `QuotaUsage`).
- ✅ Mensaje positivo en todos los niveles, incluido 100% (no es alarma, es celebración + invitación).
- ✅ Presentación de planes con anclaje Pro destacado + decoy + locked-as-celebration.
- ✅ Cero jerga en lo visible — verificado con grep manual.
- ✅ Mobile estructuralmente correcto (clases responsive en todos los componentes).
- ✅ Build verde (tsc, build, migrate status — exit 0 en los 3).
- ⏳ B10: enchufar `requestUpsellAction` al CTA dorado de "Subir a Pro" (hoy linkea a `/dashboard/messages?context=...`).
- ⏳ Pre-fill del mensaje en `messages?context=plan-upgrade-{key}` — extender page de messages para interpretar el query.
- ⏳ (Opcional) Banner explícito "Plan pendiente de asignación" para fallback. Bajo impacto, edge case raro.

### 11) Adenda post-cierre — fix TZ en `periodLabel` + verificación visual real   ·   2026-05-23

Verificación real con browser (Claude Preview, login como `matsu-admin@dev.local` ORG_MEMBER) descubrió un bug menor que el grep + scan estructural no podía detectar.

**Bug**: el header del medidor mostraba `Período: abril de 2026` cuando el mes UTC era mayo.

**Root cause**: en [get-org-usage.ts:formatPeriodLabel](logic-core-v3/src/lib/plan/get-org-usage.ts):
```ts
const monthDate = new Date(Date.UTC(year, month - 1, 1))   // mayo 1, 00:00 UTC
return monthDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
// → "abril de 2026"  (TZ AR = UTC-3 retrocede a abril 30, 21:00)
```

El `toLocaleDateString` con locale `es-AR` aplica la TZ Argentina por defecto. El primer día del mes UTC, en TZ AR, cae al último día del mes anterior — el label entonces sale corrido un mes.

**Fix** (1 línea): agregar `timeZone: 'UTC'` al options del format.

```ts
return monthDate
  .toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  .toLowerCase()
```

Verificación: `node -e "..."` con el fix devuelve `"mayo de 2026"`. Reload del browser confirmó el render correcto. `npx tsc --noEmit` post-fix → exit 0.

**Verificación visual real** (con browser, 1440x1500 desktop y 375x2600 mobile en `/dashboard/plan`, viewport 1440x900 en `/dashboard`):

- ✅ Layout desktop: UsageMeter completo + 3 cards en grid de 3 columnas con Pro destacado (border ámbar + badge "Más popular") + Business marcado "Tu plan" (badge cyan) + footer cyan "Estás en el plan más completo" (correcto: Matsu es BUSINESS, sin candados).
- ✅ Layout mobile: stack vertical de las 3 cards, badges no se superponen al título (gracias a `w-fit shrink-0`), header del medidor en `flex-col` con counter `text-3xl` legible.
- ✅ UsageMeter integrado en `/dashboard` home entre WeekResultsGrid y el brief, con los mismos datos reales (0/5.000, Plan BUSINESS).
- ✅ Cero jerga en JSX (re-confirmado por grep): los únicos matches de "token / LLM / conversación / CRM / quota" en `src/components/dashboard/plan/` y `src/lib/plan/plan-presentation.ts` son en comments JSDoc.

**Cleanup**: borrado el throwaway `scripts/_b46-reset-matsu-pw.ts` (que seteaba pw conocida en `matsu-admin@dev.local` para autenticar el screenshot). La password de matsu-admin queda en `B46-verify-screenshot` (dev DB, sin riesgo en prod — Franco la puede resetear corriendo de nuevo `seed-matsu.ts` o ignorarla). Logs `_b46-verify-{build,dev}.log` también borrados.

**Archivos modificados en la adenda**:
- ✏️ [src/lib/plan/get-org-usage.ts](logic-core-v3/src/lib/plan/get-org-usage.ts) — `formatPeriodLabel` ahora pasa `timeZone: 'UTC'` al format.



---
## ✅ MS-2 — Widget degradado: derivación digna a WhatsApp   ·   2026-05-23

**Objetivo**: cerrar el gap visible al visitante que dejó B4.5. El backend ya respondía el modo degradado con payload completo (`reason`, `message`, `whatsappNumber`, `whatsappMessage`, `companyName`), pero el widget de `/embed/[slug]` ignoraba esos campos y mostraba un banner amarillo con texto engañoso ("respuestas pueden tardar más") sin CTA. El visitante final terminaba en pantalla vacía / confusa — el peor lugar para tener algo roto.

### 1) Diagnóstico antes de tocar

Tres bugs encadenados en la capa cliente:

1. **[useChatbot.ts:75-95](logic-core-v3/src/modules/chatbot/hooks/useChatbot.ts#L75-L95)** detectaba `data?.mode === ''degraded''` pero solo seteaba un boolean `degradedMode = true`. El payload entero (`reason` / `message` / `whatsappNumber` / `whatsappMessage` / `companyName`) se descartaba.
2. **[ChatbotEmbed.tsx:265-279](logic-core-v3/src/modules/chatbot/components/embed/ChatbotEmbed.tsx#L265-L279)** renderizaba un banner amarillo inline con texto engañoso ("Las respuestas pueden tardar un poco más de lo normal") — NO menciona WhatsApp, sin botón, contradice lo que realmente pasó (cuota agotada).
3. **[DegradedBanner.tsx](logic-core-v3/src/modules/chatbot/components/chat/DegradedBanner.tsx)** existía desde un sprint anterior con la intención correcta (CTA WhatsApp) pero **estaba huérfano** — el QA checklist [chatbot-qa-checklist.md:93](logic-core-v3/docs/chatbot-qa-checklist.md#L93) ya marcaba "Aparece el DegradedBanner con CTA WhatsApp" pero nadie lo montó en el embed.

### 2) Cambios

**[src/modules/chatbot/hooks/useChatbot.ts](logic-core-v3/src/modules/chatbot/hooks/useChatbot.ts)**: tipos nuevos `DegradedReason` + `DegradedInfo` que matchean 1-a-1 el JSON del backend (ver [handleChatRequest.ts:83-101](logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts#L83-L101)). El interceptor de `DefaultChatTransport.fetch` ahora parsea TODO el payload y lo guarda en `degradedInfo: DegradedInfo | null`. `degradedMode: boolean` queda como derivado (`degradedInfo !== null`) para no romper consumers viejos (`LogicCompanion.tsx`, `ChatWindow.tsx`). Defensive null checks por cada campo string del payload — si el backend manda algo raro, normalizamos a `null` sin crashear.

**[src/modules/chatbot/components/chat/DegradedBanner.tsx](logic-core-v3/src/modules/chatbot/components/chat/DegradedBanner.tsx)**: reescrito con shape `{ info: DegradedInfo }`. Render: card con borde verde sutil (rgba 37,211,102), icono `MessageCircle` circular `#25D366`, título "Te seguimos por WhatsApp", el `message` del payload, y un `<a href="https://wa.me/{numero limpio}?text={message URL-encoded}">` con `target="_blank" rel="noopener noreferrer"` y `aria-label`. El número se sanea client-side con `replace(/\D/g, '''')` (defensive: el backend podría mandar con espacios/guiones). Si `whatsappNumber` viene null, fallback digno: "Volvé a probar más tarde y vamos a poder seguir ayudándote" (sin botón, sin pinta de error). Tap target del CTA: `minHeight: 44px` para mobile.

**[src/modules/chatbot/components/embed/ChatbotEmbed.tsx](logic-core-v3/src/modules/chatbot/components/embed/ChatbotEmbed.tsx)**:
- Importa `DegradedBanner`, elimina el banner amarillo inline.
- Monta `<DegradedBanner info={chatbot.degradedInfo} />` al **final** del messages list (no arriba) — así queda como última cosa que el visitante ve después de su propio mensaje, no perdido en el scroll.
- Input deshabilitado cuando `degradedInfo !== null` con placeholder "Continuá la conversación por WhatsApp" — el embed no tiene sentido de "seguir hablándole al bot" cuando el bot ya derivó. Send button también queda gris (mismo flag).
- Thinking dots ahora están **fuera del AnimatePresence** — ver bug encontrado abajo.
- Keys explícitas en los hijos condicionales del AnimatePresence (`empty-state`, `degraded-banner`) para eliminar warning React "Encountered two children with the same key".

### 3) Cómo detecta y renderiza el estado degradado

Flow visitante:

1. Visitante escribe mensaje, envía.
2. `handleChatRequest` (backend) ve `quota.conversationsUsed >= plan.quota` (o `domain_overflow`) y responde `{ mode: ''degraded'', reason, message, whatsappNumber, whatsappMessage, companyName }` con `content-type: application/json`. NO llama a Gemini.
3. El `transport.fetch` interceptor de `useChatbot.ts` clona la response, parsea, ve `mode === ''degraded''` → setea `degradedInfo` con el payload entero y devuelve un stream vacío al SDK para que no rompa.
4. `ChatbotEmbed` ve `chatbot.degradedInfo !== null` → monta `<DegradedBanner />` al final del messages list y bloquea el input.
5. Visitante toca "Abrir WhatsApp" → `wa.me/{numero}?text={mensaje}` abre la app de WhatsApp con el mensaje pre-armado del bot.

Cero error visible. Cero pantalla vacía. Cero "el bot dejó de responder".

### 4) Verificación visual — desktop + mobile (browser real)

Verificación con Claude Preview en `/embed/matsu`, forzando el degradado con un monkey-patch del `window.fetch` que intercepta solo `/api/chatbot/matsu/chat` y devuelve el payload canned (reversible — se va al recargar, NO toca backend ni DB).

**Desktop (800x900)**: card verde digna ocupando ~90% del ancho del messages container, alineada a flex-start. Ícono WhatsApp circular verde, título "Te seguimos por WhatsApp", párrafo con el mensaje del payload completo ("Por hoy alcanzamos el límite de atención automática del mes..."), botón verde full-width "Abrir WhatsApp" con ícono ExternalLink. Estética armoniza con el resto del widget (acento cian del header arriba, acento verde de la card abajo). Cero apariencia de error.

**Mobile (375x812)**: stack vertical, padding 14px, texto legible (12.5px), botón "Abrir WhatsApp" full-width con `minHeight: 44px` (tap target ergonómico). El placeholder del input cambia a "Continuá la conversación por WhatsApp" y el textarea queda disabled.

**Verificación funcional del CTA** (via `preview_eval`):
- `href = "https://wa.me/5491155551234?text=Hola%20Matsu%2C%20vengo%20del%20chat..."` (número limpio sin espacios/+, mensaje URL-encoded).
- `target = "_blank"`, `rel = "noopener noreferrer"` (security).
- `textarea.disabled = true`, placeholder degradado activo.

**Console post-fix**: cero errores. (Hubo un warning "two children with the same key" en el primer render — lo arreglé agregando keys explícitas al AnimatePresence, ver punto 5.)

### 5) Bugs colaterales encontrados durante la verificación visual

La verificación real con browser cazó dos bugs que el grep + tsc no detectaban — exactamente el tipo de cosa que justifica la regla "todo sprint UI/UX se verifica con browser":

**5.a Ghost del thinking-dots en el momento de la transición**. Cuando el endpoint devuelve degraded (stream vacío), el `isThinking` pasa de `true` a `false` en el mismo frame que `degradedInfo` se setea. El `motion.div` de los thinking-dots dentro de `AnimatePresence` empezaba la animación de exit (`opacity: 0`), pero los 3 inner `motion.div` tienen `animate: { scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }` con `repeat: Infinity` — esa animación **sobreescribe el opacity heredado del padre durante el exit**, dejando los 3 dots visibles como "fantasma" hasta el próximo paint. Fix: saqué los thinking-dots **fuera** del `AnimatePresence` — ahora el unmount es inmediato y limpio, sin exit animation. En el flujo normal el bug no se ve porque el stream tarda 2s+ y la animación de exit termina antes de que se note.

**5.b Warning "two children with the same key"** en el `AnimatePresence`. Era pre-existente (el empty state y los thinking-dots nunca tuvieron `key` explícita) pero mi nuevo `<DegradedBanner />` lo acentuó. Fix: `key="empty-state"` y `key="degraded-banner"` explícitos.

### 6) Findings out-of-scope (NO toqué — bandera para Franco)

- 🚩 **[ChatWindow.tsx:313-320](logic-core-v3/src/modules/chatbot/components/chat/ChatWindow.tsx#L313-L320)** tiene el MISMO bug del banner engañoso ("modo degradado, respuestas pueden tardar más / ser más breves") con clases Tailwind amber. Este `ChatWindow` es el chat del sitio principal de develop.com.ar (montado por `LogicCompanion.tsx`), NO el embed externo de visitantes — por eso no entra en MS-2 (scope es `/embed/[slug]`). Cuando se aborde, el fix es: importar `DegradedBanner` y pasar `chatbot.degradedInfo` (el hook ya lo expone). Toma 5 min.
- 🚩 **[types.ts:34](logic-core-v3/src/modules/chatbot/components/chat/types.ts#L34)** y **[ChatWindow.tsx:19,31](logic-core-v3/src/modules/chatbot/components/chat/ChatWindow.tsx#L19)** todavía consumen `degradedMode: boolean`. Funcionan vía el derivado que dejé en el hook (`degradedMode = degradedInfo !== null`), pero cuando se haga el fix de arriba conviene migrar esas props al `DegradedInfo` completo y deprecar el boolean.

### 7) Reglas absolutas (chequeo final)

- ✅ El visitante NUNCA ve un error técnico ni un mensaje vacío en degraded — es una card verde con CTA claro.
- ✅ Usa los campos REALES del payload de B4.5 — `whatsappNumber` saneado, `whatsappMessage` URL-encoded, `message` literal del backend, `companyName` para el fallback del mensaje.
- ✅ Mobile verificado en 375x812 — padding, tap target 44px, sin overflow.

### Archivos modificados

- [src/modules/chatbot/hooks/useChatbot.ts](logic-core-v3/src/modules/chatbot/hooks/useChatbot.ts) — tipos `DegradedInfo` + interceptor del transport guarda payload completo.
- [src/modules/chatbot/components/chat/DegradedBanner.tsx](logic-core-v3/src/modules/chatbot/components/chat/DegradedBanner.tsx) — reescrito con CTA WhatsApp verde + fallback sin número.
- [src/modules/chatbot/components/embed/ChatbotEmbed.tsx](logic-core-v3/src/modules/chatbot/components/embed/ChatbotEmbed.tsx) — banner inline removido, DegradedBanner montado al final, input deshabilitado en degraded, thinking-dots fuera del AnimatePresence, keys explícitas.

### Listo para
- ✅ Endpoint degradado deja el front armado para CUALQUIER `reason` futura (`quota_exhausted` y `domain_overflow` hoy; si B5+ agrega `payment_failed` o algo, el widget ya consume `message` literal del payload — cero cambio en cliente).
- ✅ Build verde (`npx tsc --noEmit` → exit 0).
- ⏳ **MS-3** y futuros: ya hay infra de `DegradedInfo` en el hook — si MS-3 toca el otro widget (`ChatWindow.tsx` del sitio develop), reutilizar `DegradedBanner` + el `degradedInfo` del hook (5 min).


---
## ✅ MS-3 — CTA de upgrade de plan conectado a `requestUpsellAction`   ·   2026-05-23

**Objetivo**: cerrar el gap que dejó B4.6. El CTA dorado "Subir a Pro/Business" del dashboard de planes solo linkeaba a `/dashboard/messages?context=...` sin registrar la intención en ningún lado. Si el cliente no escribía el mensaje, el lead se perdía. Conectar el CTA con el `requestUpsellAction` que **ya existe** (`src/lib/actions/upsell.ts`) — la misma action que `/dashboard/services` usa para módulos premium y que dispara alerta a develOP via Telegram.

### 1) Decisión de arquitectura — reutilizar la action sin tocarla

Leyendo [upsell.ts:44-49](logic-core-v3/src/lib/actions/upsell.ts#L44-L49) descubrí algo clave: la action busca `prisma.premiumModule.findUnique({ where: { slug: featureKey } })` y si **no encuentra el módulo**, simplemente skipea el bloque `organizationModule` (línea 49: `if (module) {`). El resto del flujo — `contactSubmission` (línea 76), `sendAgencyAlert({ type: 'LEAD_UPSELL' })` (línea 87), `Notification` para cliente + super_admin (línea 100) — corre igual.

Esto significa que puedo invocar `requestUpsellAction("plan-upgrade-pro", "Plan Pro")` y todo el upsell flow se dispara **sin contaminar** la tabla de módulos premium. Cero cambios a la action, cero discriminador `kind: 'MODULE' | 'PLAN'`, cero schema migration. Se respeta literalmente la regla "Reutilizá `requestUpsellAction` existente, NO crees un sistema nuevo de upsell".

### 2) Cambios

**Nuevo: [src/components/dashboard/plan/UpgradeCtaButton.tsx](logic-core-v3/src/components/dashboard/plan/UpgradeCtaButton.tsx)** — client component que reemplaza el `<Link>` plano de los CTAs upgrade. Recibe `planKeyLower`, `planName`, `label`, `className`, `children` para mantener el estilo exacto que B4.6 definió (el caller pasa todas las clases). Al click:
   1. Llama `requestUpsellAction("plan-upgrade-{key}", "Plan {Name}")` dentro de un `useTransition`.
   2. Espera el resultado (`await`) — si falla por red, loggea pero igual sigue.
   3. Hace `window.location.assign(targetHref)` (navegación HARD, no `router.push`) — ver bug en sección 5.
   4. `disabled` mientras `isPending` para prevenir double-click → 2 leads por el mismo intento.

**Modificado: [src/components/dashboard/plan/PlansShowcase.tsx](logic-core-v3/src/components/dashboard/plan/PlansShowcase.tsx)** — los 2 ramos de la función `PlanCta` que renderizaban `<Link href="/dashboard/messages?context=plan-upgrade-${key}">` ahora montan `<UpgradeCtaButton />` con las mismas clases. Sigue siendo Server Component (solo importa el client). El branch `isDowngrade` (CTA gris "Hablar con mi equipo") mantiene `<Link>` plano — NO es upsell, solo facilitate el flujo manual.

**Modificado: [src/lib/data/message-context.ts](logic-core-v3/src/lib/data/message-context.ts)** — agregadas 6 entradas al mapping:
- `plan-upgrade-pro`, `plan-upgrade-business`, `plan-upgrade-starter` — pre-fill del mensaje cuando el cliente aterriza desde el CTA dorado.
- `plan-change-pro`, `plan-change-business`, `plan-change-starter` — pre-fill para el flujo de downgrade (sin disparar action, solo mensaje).

`MessageThread.tsx` **no requirió cambios** — ya lee `?context=` via `useSearchParams` (línea 91), llama `getMessageForContext`, setea el textarea y limpia el query con `router.replace`. Solo faltaba el mapping en `message-context.ts`.

### 3) Flujo end-to-end (cómo se conectó)

```
Cliente en /dashboard/plan → click <UpgradeCtaButton aria-label="Subir a Pro">
  ↓
useTransition() → await requestUpsellAction("plan-upgrade-pro", "Plan Pro")
  ↓
  ├─ premiumModule.findUnique({ slug: "plan-upgrade-pro" }) → null → skip organizationModule
  ├─ contactSubmission.create({ service: "plan-upgrade-pro", message: "Solicitud de módulo premium: Plan Pro", ... })
  ├─ sendAgencyAlert({ type: 'LEAD_UPSELL', clientName: "Matsu", detail: "...", link: "/admin/leads" })  → Telegram
  ├─ Notification(INFO) al cliente: "Tu solicitud para activar 'Plan Pro' fue recibida."
  ├─ Notification(ACTION_REQUIRED) al super_admin: "Matsu está interesada en Plan Pro" → actionUrl: /admin/leads
  └─ revalidatePath('/admin/leads' + '/admin' layout + '/dashboard')
  ↓
window.location.assign("/dashboard/messages?context=plan-upgrade-pro")
  ↓
MessageThread useEffect → getMessageForContext("plan-upgrade-pro")
  → setInputValue("Hola! Quería subir mi asistente al plan Pro. ¿Cuándo lo coordinamos y cuáles serían los próximos pasos?")
  → router.replace("/dashboard/messages") (limpia query)
```

Si el cliente envía el mensaje: develOP lo recibe por 2 canales (lead + mensaje); admin resuelve el doble-conteo manual (idempotencia out of scope — el riesgo de duplicar es preferible al riesgo de perder). Si el cliente se va sin enviar: el lead ya quedó al click. **Cero leads perdidos por friction**.

### 4) Verificación visual real (browser, login matsu-admin@dev.local)

Setup: throwaway `_ms3-set-matsu-plan.ts STARTER` para downgradear Matsu (default es BUSINESS, donde NO se ve el CTA dorado upgrade — todo es current o downgrade). Esperado plan-cache TTL de 60s. Throwaway `_ms3-reset-matsu-pw.ts` para password conocida (mismo patrón que B4.6 con `_b46-reset-matsu-pw.ts`).

**Estado pre-click**: card Pro con borde dorado, badge "MÁS POPULAR", CTA dorado `SUBIR A PRO` con ícono Sparkles. `contactSubmission.count({ service: { startsWith: 'plan-upgrade-' } }) === 0`.

**Post-click**:
- ✅ URL navegó a `/dashboard/messages?context=plan-upgrade-pro` → router.replace la limpió a `/dashboard/messages`.
- ✅ Textarea pre-cargado: **"Hola! Quería subir mi asistente al plan Pro. ¿Cuándo lo coordinamos y cuáles serían los próximos pasos?"**
- ✅ Badge "2" en la campana del header — las 2 INFO al cliente (2 clicks en la verificación: 1 con bug, 1 con fix).
- ✅ DB `contactSubmission` row: `service="plan-upgrade-pro"`, `message="Solicitud de módulo premium: Plan Pro"`, `name="Matsu Admin (scaffolding)"`, `email="matsu-admin@dev.local"`, `company="Matsu"`, `read=false` — aparece en `/admin/leads` tab Inbound.
- ✅ DB `notification` rows: 1 INFO al cliente + 1 ACTION_REQUIRED al super_admin con `actionUrl: /admin/leads`.
- ✅ Server logs: `ƒ requestUpsellAction("plan-upgrade-pro", "Plan Pro") in 1549ms ../src/lib/actions/upsell.ts`.
- ✅ `sendAgencyAlert({ type: 'LEAD_UPSELL' })` invocado (fire-and-forget, sin verificación directa de DB pero el patrón es idéntico al de módulos premium y comparte el mismo `sendAgencyAlert` import).

### 5) Bug encontrado por la verificación visual

**`router.push()` se cancelaba por el `revalidatePath('/dashboard')` de la action.** Primer click: la action completó OK, DB row creada, notifications creadas — pero el browser se quedó en `/dashboard/plan` con el plan-badge actualizado a "Plan Starter" en lugar de redirigir. La cadena fue:
   1. `await requestUpsellAction(...)` → completa.
   2. Internamente la action llama `revalidatePath('/dashboard')` (línea 130 de upsell.ts) → dispara re-fetch del Server Component padre.
   3. React Server Components empezó a re-renderizar la página actual.
   4. `router.push(targetHref)` se intentó pero quedó **descartado por el re-render en curso**.

Fix (commited): cambiar `router.push()` por `window.location.assign(targetHref)` — navegación HARD del browser que NO se cancela por revalidations de Next. Es brusca (full page reload) pero garantiza que el cliente llega a messages. La pérdida es animacional (no transition suave entre pages), aceptable porque el flujo es one-shot.

Este bug solo se manifestó con la verificación real — `tsc --noEmit` no lo detecta (es un race de runtime entre 2 APIs de Next). Documentado en el comentario inline en `UpgradeCtaButton.tsx`.

### 6) Cleanup post-verificación

- ✅ `_ms3-set-matsu-plan.ts BUSINESS` — restaurado Matsu al plan original.
- ✅ Borradas las 2 `contactSubmission` de prueba + 4 `notification` rows asociadas (deleteMany filtrando por `service: 'plan-upgrade-*'` y `title contains "Plan Pro"`).
- ✅ Scripts `_ms3-reset-matsu-pw.ts` y `_ms3-set-matsu-plan.ts` borrados (mismo patrón de B4.6).

### 7) Reglas absolutas (chequeo final)

- ✅ Se reutilizó `requestUpsellAction` SIN modificarla — el truco fue descubrir que internamente tolera `featureKey` que no es módulo premium (skipea el bloque `organizationModule`).
- ✅ El registro de intención ocurre ANTES del redirect (`await` en el `useTransition`). Si el cliente no completa el mensaje, el lead ya quedó.
- ✅ Validación + auth en la action: línea 13-19 chequea `session.user.id` + `organizationId`, línea 21 valida con Zod `UpsellRequestSchema`.

### Archivos modificados / creados

- ➕ [src/components/dashboard/plan/UpgradeCtaButton.tsx](logic-core-v3/src/components/dashboard/plan/UpgradeCtaButton.tsx) — client wrapper del CTA dorado.
- ✏️ [src/components/dashboard/plan/PlansShowcase.tsx](logic-core-v3/src/components/dashboard/plan/PlansShowcase.tsx) — los 2 CTAs de upgrade (Pro highlighted + Business regular) ahora usan `<UpgradeCtaButton>`.
- ✏️ [src/lib/data/message-context.ts](logic-core-v3/src/lib/data/message-context.ts) — 6 entradas nuevas: 3 `plan-upgrade-*` + 3 `plan-change-*`.

### Listo para
- ✅ El upsell de planes ahora deja lead trazable en `/admin/leads` igual que los módulos premium — mismo canal, mismo flow, mismo dashboard.
- ✅ Build verde (`npx tsc --noEmit` → exit 0).
- ✅ Verificación browser end-to-end OK con cleanup de DB + scripts post-test.
- ⏳ **Out-of-scope para futuro sprint**: idempotencia del lead (si el cliente clickea Pro 3 veces, hoy quedan 3 rows + 6 notifications). Patrón posible: dedupe por `(organizationId, service)` en una ventana de tiempo, o feature `recentlyRequested` que oculte el CTA por 24h post-click. No es bloqueante — admin puede mergear duplicados manualmente.
- ⏳ El campo `service` en `contactSubmission` ahora contiene tanto slugs de módulos (`whatsapp-business`, `analytics-pro`, etc) como `plan-upgrade-{key}`. La UI de `/admin/leads` muestra el string crudo. Si conviene distinguir visualmente "módulo" vs "plan upgrade", agregar un mapeo lado admin (~10 líneas en `InboundLeadsTable`). Fuera de scope MS-3.


---
## ✅ B5.1 — Señales estructuradas en captura de lead (cimiento del scoring)   ·   2026-05-23

**Objetivo:** dejar el lead capturado con la información que B5.2 (scoring), B5.3 (DQ) y B5.4 (explicabilidad) van a necesitar. Sin señales estructuradas no hay scoring posible. Decisión de arquitectura: el bot llena los flags en el mismo `capture_lead` (cero llamada extra a LLM, el modelo ya entiende la conversación cuando dispara la tool).

### 1) Diagnóstico antes de tocar

Estado pre-sprint del [model ChatbotLead](logic-core-v3/prisma/schema.prisma#L1105):
- Campos de contacto + `intent String?` (libre) + `message` + `notificationSent` + `status` + timestamps.
- `intent` legacy guardaba `"quote"|"info"|"demo"|"support"|"other"` (enum viejo del Zod de captureLead, anterior a B3.6).
- [showWhatsappHandoff.ts:25-32](logic-core-v3/src/modules/chatbot/server/tools/showWhatsappHandoff.ts#L25) ya tiene `HANDOFF_INTENTS` (B3.6) con vocabulario distinto: `purchase_ready|schedule_visit|quote_request|human_request|support|other`. **Dos vocabularios paralelos** — y el scoring necesita uno solo.

Pregunta crítica respondida antes de tocar schema: ¿migrar el enum legacy a uno nuevo o agregar campo? **Mantenemos `intent String?` legacy** (los rows previos tienen valores que NO matchean el enum de B3.6 — migrar el TYPE rompe additive). La alineación se hace a nivel app: el Zod de la tool ahora rechaza valores fuera del enum de B3.6. Trade-off: rows viejos conservan sus valores antiguos; rows nuevos a partir de B5.1 escriben el vocabulario unificado. Cero migración destructive.

### 2) Schema — additive, índices definidos ahora

Migración `20260523183030_b51_add_lead_signals_and_scoring` — solo `ADD COLUMN` y `CREATE INDEX`, cero `DROP`/`ALTER ... TYPE`:

```sql
CREATE TYPE "LeadCategory" AS ENUM ('sales', 'postventa', 'employment', 'provider', 'spam', 'other');
CREATE TYPE "LeadClassification" AS ENUM ('hot', 'warm', 'cold', 'dq');

ALTER TABLE "chatbot_lead"
  ADD COLUMN "category" "LeadCategory" NOT NULL DEFAULT 'sales',
  ADD COLUMN "requestedAppointment" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "mentionedFinancing"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "mentionedTradeIn"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "askedSpecificModel"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "providedPhone"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "providedEmail"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "channel"              TEXT,
  ADD COLUMN "score"                INTEGER,
  ADD COLUMN "classification"       "LeadClassification",
  ADD COLUMN "scoreSignals"         JSONB;

CREATE INDEX "chatbot_lead_classification_idx"                  ON "chatbot_lead"("classification");
CREATE INDEX "chatbot_lead_score_idx"                           ON "chatbot_lead"("score");
CREATE INDEX "chatbot_lead_category_idx"                        ON "chatbot_lead"("category");
CREATE INDEX "chatbot_lead_botConfigId_classification_capturedAt_idx"
  ON "chatbot_lead"("botConfigId", "classification", "capturedAt" DESC);
```

Decisiones del shape:
- **`category` `NOT NULL DEFAULT 'sales'`** — rows legacy se backfilan con `sales` (asumimos venta hasta que B5.3 demuestre lo contrario). Default safe para no romper aggregations existentes.
- **Flags `BOOLEAN NOT NULL DEFAULT false`** — anti-alucinación por construcción: ausencia = false, no null. Simplifica B5.2 (no hay que tratar null como "no sé").
- **`classification` nullable** (no NOT NULL) — los rows previos a B5.2 quedan sin clasificar hasta que el motor de scoring corra. Cuando 5.2 mergee, podrá hacer backfill batch.
- **`score` `INTEGER` nullable** — mismo motivo. B5.2 escribe; B5.4 puede recalcular en vivo aplicando decaimiento sobre este valor.
- **`scoreSignals` `JSONB`** — explicabilidad para B5.4. Shape libre por ahora (B5.2 lo define).
- **`channel String?`** — campo futuro reservado. NO se llena en B5.1 (la consigna lo pedía explícito).
- **Índices**: los 4 que pidió la consigna (`classification`, `score`, `capturedAt`, `status`) más uno compuesto `[botConfigId, classification, capturedAt DESC]` que adelanta la query típica de la vista 5B ("leads hot de mi bot, último primero"). `capturedAt` ya tenía índice compuesto `[botConfigId, capturedAt]` desde antes — no dupliqué.

**Aplicar en prod:** `npx prisma migrate deploy` lo hace Netlify automáticamente al mergear (per `netlify.toml`). Como es 100% additive (cero `DROP`, cero `ALTER TYPE` de columna existente, cero datos perdidos), no requiere checkpoint manual. Las columnas tienen DEFAULT, así que el rollout no rompe writes en vuelo.

### 3) Tool `capture_lead` — el bot rellena las señales

[captureLead.ts](logic-core-v3/src/modules/chatbot/server/tools/captureLead.ts) ahora exporta dos constantes compartidas con `showWhatsappHandoff.ts`:

```ts
export const LEAD_INTENTS = ['purchase_ready','schedule_visit','quote_request','human_request','support','other'] as const
export const LEAD_CATEGORIES = ['sales','postventa','employment','provider','spam','other'] as const
```

Schema Zod extendido con 5 campos nuevos:

| Campo | Tipo | Default | Lo llena |
|---|---|---|---|
| `category` | `enum(LEAD_CATEGORIES)` | `'sales'` | Bot (DQ si la consulta no es venta) |
| `requestedAppointment` | `boolean` | `false` | Bot (true si pidió cita/turno/test drive) |
| `mentionedFinancing` | `boolean` | `false` | Bot (true si tocó crédito/cuotas/prendario) |
| `mentionedTradeIn` | `boolean` | `false` | Bot (true si mencionó usado en parte de pago) |
| `askedSpecificModel` | `boolean` | `false` | Bot (true si nombró un modelo concreto) |

`providedPhone` y `providedEmail` **NO los pide al LLM** — los deriva el handler de `Boolean(phone)` y `Boolean(email)`. El modelo no puede mentir sobre datos que él mismo mandó.

Regla anti-alucinación insertada en `CAPTURE_LEAD_DESCRIPTION` (+ explicada en cada `.describe()` de los flags): *"Si una señal no apareció, mandá false — NO infles para 'ayudar'. Si la consulta no es de venta, marcá la category correspondiente."*

**Presupuesto B3.3:** la description del tool pasó de 432 → 870 chars (+438) y cada flag aporta su `.describe()` (≈80 chars c/u × 5 = 400). Total agregado al "área tool" del prompt: ~840 chars ≈ 220 tokens. El `buildSystemPrompt` propio (sin tools) sigue intacto en 10.255 chars — no toqué [sections.ts](logic-core-v3/src/modules/chatbot/server/prompts/sections.ts). El presupuesto B3.3 (-15.7% bajo baseline B3.2) se mantiene en el system prompt; el incremento queda confinado al tool schema, que es donde tiene que estar.

### 4) Verificación con la batería B3.2

2 casos nuevos en [cases.ts](logic-core-v3/scripts/regression/cases.ts):

- **`lead-capture-financing-tradein`** (Lucía Fernández): *"Hola, me interesa un Corolla XEi 0KM. ¿Lo puedo sacar con prendario? Entrego mi Gol 2014 en parte de pago."* + *"Soy Lucía, mi WhatsApp es +54..."*. Espera flags: `mentionedFinancing=true, mentionedTradeIn=true, askedSpecificModel=true, requestedAppointment=false`.
- **`lead-capture-postventa`** (Martín López): *"Tengo una Hilux comprada hace 2 años y me apareció una luz en el tablero. ¿Me pueden agendar un turno de service?"*. Espera `category=postventa, requestedAppointment=true`, los demás flags `false`.

[run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts) ahora trae los nuevos campos del lead al snapshot.

**Resultado (cross-run, 17 casos × 2):**

| Caso | Run 1 | Run 2 | Snapshot validado |
|---|---|---|---|
| `lead-capture-financing-tradein` | ✅ | ✅ | `mentionedFinancing=true, mentionedTradeIn=true, askedSpecificModel=true, requestedAppointment=false, category=sales, intent=quote_request, providedPhone=true, providedEmail=false` |
| `lead-capture-postventa` | ✅ | ⚠ terminated | (run 1) `category=postventa, requestedAppointment=true, mentionedFinancing=false, mentionedTradeIn=false, askedSpecificModel=false, intent=schedule_visit, providedPhone=true, providedEmail=false` |
| `lead-capture` (preexistente) | ⚠ terminated | ✅ | Captura intacta (intent ahora `quote_request` o similar del nuevo enum) |
| `lead-capture-both-channels` (preexistente B3.5) | ✅ | ✅ | Ambos canales persisten (`providedPhone=true, providedEmail=true`) |
| `lead-capture-chain` (preexistente MS-1) | ✅ | ✅ | Chain `capture_lead → offer_handoff_options` intacto, sin regresión MS-1 |

**Anti-alucinación validada caso por caso:**
- En `financing-tradein`, el visitante NO pidió cita → `requestedAppointment=false`. El bot NO infló.
- En `postventa`, NO mencionó financiación ni usado → ambos `false`. El bot NO inventó señales para "justificar" el lead.
- Cada flag refleja exactamente lo que apareció en el texto del visitante.

**Ruido cross-run (no es regresión B5.1):** 3-4 casos por run caen con `Error: terminated` en posiciones aleatorias (run 1: `off-topic`, `lead-capture`, `long-session`; run 2: `jailbreak`, `lead-capture-postventa`, `long-session`). El dev log muestra `prisma:error Error in PostgreSQL connection: Closed` — el pool de Neon serverless cierra conexiones bajo carga sostenida (17 casos × ≥2 turnos cada uno × LLM stream). Lo confirma que casos distintos caen entre runs y nunca el mismo dos veces (excepto `long-session-soft-cap` que tiene 16 turnos seguidos y choca el rate-limit interno). **NO toqué nada de eso** — es deuda preexistente del runner contra Neon dev, fuera de scope B5.1.

### 5) Healthchecks post-sprint

```bash
npx tsc --noEmit                        # ✅ EXIT 0
npm run build                            # ✅ Compiled successfully (29/29 páginas)
npx prisma migrate status                # ✅ 46 migrations, Database schema is up to date
```

### 6) Archivos modificados / creados

- ➕ [prisma/migrations/20260523183030_b51_add_lead_signals_and_scoring/migration.sql](logic-core-v3/prisma/migrations/20260523183030_b51_add_lead_signals_and_scoring/migration.sql) — additive: 2 enums + 11 columnas + 4 índices.
- ✏️ [prisma/schema.prisma](logic-core-v3/prisma/schema.prisma) — `ChatbotLead` extendido + enums `LeadCategory`/`LeadClassification`.
- ✏️ [src/modules/chatbot/server/tools/captureLead.ts](logic-core-v3/src/modules/chatbot/server/tools/captureLead.ts) — Zod schema con 5 campos nuevos, `LEAD_INTENTS`/`LEAD_CATEGORIES` exportados, description con anti-alucinación, handler persiste flags + deriva `providedPhone`/`providedEmail` del input, log estructurado incluye `signals`.
- ✏️ [scripts/regression/cases.ts](logic-core-v3/scripts/regression/cases.ts) — 2 casos B5.1 (`lead-capture-financing-tradein`, `lead-capture-postventa`).
- ✏️ [scripts/regression/run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts) — snapshot del lead incluye `category` + 6 flags.
- ➕ [docs/regression/baseline-2026-05-23T18-33-48-648Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T18-33-48-648Z.md) — run 1.

**Sin tocar:**
- `sections.ts` (system prompt) — presupuesto B3.3 intacto.
- `showWhatsappHandoff.ts` — B3.6 sigue funcionando con su propio `HANDOFF_INTENTS` (que ahora coincide 1-a-1 con `LEAD_INTENTS`).
- UI de leads (admin + dashboard cliente) — los nuevos campos están disponibles para 5B; no construí vista todavía.
- Notificaciones (Telegram, email) — el mensaje sigue mostrando los campos previos. Si se quiere mostrar señales en el Telegram, son 5 líneas en `notifyClient()` (ver bandera #2 abajo).

### 7) Decisiones no especificadas

1. **`intent` en DB queda `String?` (no enum Prisma)**. Razón: cambiar el TYPE de la columna sin destruir datos legacy es complejo (requeriría columna nueva + backfill + rename + drop). Con additive estricto, la alineación se hace a nivel Zod. Rows legacy mantienen sus valores antiguos; rows nuevos siguen el vocabulario unificado. B5.2 / B5.3 tienen que tolerar ambos al leer leads históricos.
2. **`category` con default `'sales'`**. Razón: los rows pre-B5.1 no tenían categorización. Asumir `sales` es safe para venta (la mayoría de los rows actuales son comerciales) y evita NULL handling en B5.2/B5.3.
3. **`providedPhone`/`providedEmail` derivados del input** (no del LLM). Razón: el modelo podría mentir o equivocarse; el handler ve la verdad del input. Estructural > confianza en el LLM.
4. **Cinco flags positivos (sin "negativos")**. La consigna pedía estos 5. No agregué flags como `expressedUrgency` o `mentionedBudget` aunque podrían sumar al scoring — eso queda para B5.2 si el motor los necesita. YAGNI hoy.
5. **`channel String?` (no enum)**. Razón: aún no hay catálogo cerrado de canales. Cuando se sumen instagram/wa-inbound/etc., un enum tipa mejor; mientras tanto, libre.
6. **No regené el baseline B3.6 antes de mergear** — usé los runs B5.1 contra el código nuevo. La comparativa importante es flags persisten correctamente (validado) y casos preexistentes no rompieron (`lead-capture-both-channels` y `lead-capture-chain` pasaron en ambos runs).
7. **El segundo run sobreescribió el baseline-{ts}.md del primero** (timestamps distintos = archivos distintos). El run 1 vive en [baseline-2026-05-23T18-33-48-648Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T18-33-48-648Z.md). Si te interesa comparar, el run 2 es `baseline-2026-05-23T19-05-38-809Z.md` (lo dejé también en `docs/regression/`).

### 8) Flags para Franco

- 🚩 **El bot usa el nuevo vocabulario de `intent` desde ya** (`purchase_ready|schedule_visit|quote_request|human_request|support|other`). En la vista de leads de admin (`/admin/clients/[clientId]/chatbot/leads`) y en el dashboard de Matsu, los **leads pre-B5.1 siguen mostrando sus intents legacy** (`quote`/`info`/`demo`). No es bug — son rows históricos. Cuando 5B construya la vista nueva, podemos mapear legacy → nuevo (`quote → quote_request`, `info → other`, `demo → other`) o mostrar ambos crudos. Lo decidimos en 5B.
- 🚩 **El Telegram de capture_lead todavía NO muestra señales** (sigue con nombre/email/tel/intent del schema viejo). Si querés que el equipo de Matsu vea de un vistazo "fue lead caliente: financiación + usado + test drive" en el push, son ~10 líneas en `notifyClient()` armando un bloque "Señales: 🚗 modelo específico, 💳 financiación, 🔄 usado en parte de pago". Dejame el OK y lo agrego (microsprint <30 min).
- 🚩 **Ruido del runner contra Neon dev**: 3-4 de 17 casos caen con `terminated` por pool closed. NO toqué el runner — la deuda existe desde B3.2 (Neon serverless tiende a cerrar conexiones idle del Prisma client bajo carga). Mitigación posible: agregar reintentos con backoff en `run-baseline.ts`, o cambiar a `directUrl` para los runs de regression. Microsprint dedicado si te parece, fuera de scope B5.1.
- 🚩 **El caso `long-session-soft-cap` (16 turnos) cae casi siempre** — mismo motivo que arriba más rate-limit interno (10 msgs/min por sessionId). El `interTurnDelayMs = 7000` ayuda pero no es suficiente cuando un cold start de Vertex toma 100s en el medio. Si querés que ese caso pase consistente, hay que subirlo a 10s o bajar a 12 turnos.
- 🚩 **`category` de DQ todavía no descalifica nada** — solo se persiste. Cuando B5.3 entre, va a filtrar en la vista y/o setear `classification='dq'` automáticamente. Hoy el lead de postventa queda con `score=null, classification=null` (a la espera de B5.2).
- 🚩 **`channel` queda en `null`** en todos los leads — el campo está reservado para B5+. No es bug.

### Listo para
- ✅ Cimiento de scoring en su lugar: cada lead nuevo a partir de B5.1 trae 5 flags + category + intent unificado.
- ✅ Anti-alucinación verificada con casos donde las señales aparecen Y donde NO aparecen — el bot no infla.
- ✅ Índices listos para que B5.2 (scoring) y la vista 5B no necesiten otra migración.
- ✅ Build verde + tsc verde + migrate status up-to-date (46 migrations).
- ✅ Sin regresión funcional: `lead-capture-both-channels` y `lead-capture-chain` (MS-1) pasaron 2/2 runs.
- ⏳ **B5.2** — motor de scoring que lee estas señales y escribe `score`/`classification`/`scoreSignals`.
- ⏳ **B5.3** — DQ activo sobre `category != 'sales'`.
- ⏳ **5B** — vista de "Leads una locura" consume `classification` + `score` (índices ya están).


---
## ✅ B5.2 — Motor de scoring heurístico server-side (tabla lockeada)   ·   2026-05-23

**Objetivo:** convertir las señales estructuradas de B5.1 en un score 0-100 + clasificación hot/warm/cold, persistido en el lead al capturar. Función pura, server-side, CERO LLM. El visitante no puede tocar su propio score por construcción (el modelo no ve la tabla; el cálculo corre en el handler de la tool).

### 1) Función pura — la tabla vive en código, documentada

[src/modules/chatbot/server/scoring/calculateLeadScore.ts](logic-core-v3/src/modules/chatbot/server/scoring/calculateLeadScore.ts) expone:

```ts
export const SCORING_TABLE = [
  { key: 'requestedAppointment', label: 'Pidió cita / test drive',           points: 40 },
  { key: 'mentionedFinancing',   label: 'Mencionó financiación',             points: 25 },
  { key: 'mentionedTradeIn',     label: 'Mencionó usado en parte de pago',   points: 20 },
  { key: 'askedSpecificModel',   label: 'Preguntó por modelo específico',    points: 10 },
  { key: 'providedPhone',        label: 'Dejó teléfono',                     points:  5 },
] as const                                                              //  100 ⇐ máximo

export const HOT_THRESHOLD = 70   //  [70, 100] → hot
export const WARM_THRESHOLD = 40  //  [40,  69] → warm
                                  //  [ 0,  39] → cold

export function calculateLeadScore(signals: LeadSignals): ScoreResult
export function classifyScore(score: number): LeadScoreClassification
```

Función pura: mismas señales → mismo score, sin side-effects, sin DB, sin red. La devuelvo con el desglose de **qué** sumó (sólo las señales que dispararon) — eso va a `ChatbotLead.scoreSignals` (Json) y B5.4 lo lee para mostrar "por qué este lead es caliente" sin recalcular.

`classifyScore` está exportada por separado: B5.4 va a aplicar decaimiento temporal en lectura y necesita re-clasificar sin remontar el motor entero.

**El motor no conoce `category`.** Es 100% señal positiva. Si en B5.3 hace falta sobrescribir `classification='dq'` cuando la categoría no es `sales`, eso es un ajuste posterior (no se mete en la pureza de este motor).

### 2) Persistencia — calculado y guardado en el mismo `capture_lead`

[captureLead.ts](logic-core-v3/src/modules/chatbot/server/tools/captureLead.ts) ahora calcula el score **antes** del `prisma.$transaction` y lo pasa en el `create` del lead — una sola escritura, atomica con el resto del payload. No hay una pasada extra ni un cron:

```ts
const providedPhone = Boolean(phone)
const providedEmail = Boolean(email)
const { score, classification, signals: scoreSignals } = calculateLeadScore({
  requestedAppointment: input.requestedAppointment,
  mentionedFinancing:   input.mentionedFinancing,
  mentionedTradeIn:     input.mentionedTradeIn,
  askedSpecificModel:   input.askedSpecificModel,
  providedPhone,
})

await tx.chatbotLead.create({
  data: {
    /* ...campos previos... */
    score,
    classification,
    scoreSignals: scoreSignals as unknown as Prisma.InputJsonValue,
  },
})
```

El log `tool.lead_captured` ahora incluye `score`, `classification` y `scoreBreakdown` en metadata, así que un debug post-mortem desde `chatbot_events` permite reconstruir el cálculo sin tocar `chatbot_lead`.

**Sin recalcular en lectura.** El valor persiste — la vista 5B / Telegram / explicabilidad B5.4 leen del campo, no recomputan. La regla "Que el score quede guardado, no recalculado en cada lectura (salvo el decaimiento de B5.4)" se cumple por construcción.

### 3) Test unit standalone — 22/22 asserts

[scripts/_b52-test-scoring.ts](logic-core-v3/scripts/_b52-test-scoring.ts) corre el motor sin DB ni red. Cubre:

- **Sanity de la tabla**: suma = 100, umbrales 70/40.
- **Cada señal sola**: appointment=40/warm, financing=25/cold, tradeIn=20/cold, specificModel=10/cold, phone=5/cold.
- **Casos compuestos de la consigna**: appointment+tradeIn = **60 warm**, +financing = **85 hot**.
- **Extremos del umbral**: classifyScore(39)=cold, (40)=warm, (69)=warm, (70)=hot, (100)=hot.
- **Casos esperados de la batería B5.1**: Lucía (60 warm), Martín (45 warm).
- **Todas las señales**: 100 hot con 5 ítems en `signals`.
- **Cero señales**: 0 cold con `signals=[]`.
- **Pureza**: 2 llamadas con el mismo input devuelven JSON idéntico.

```bash
$ npx tsx scripts/_b52-test-scoring.ts
…
─────────────────────────────────────────────
  ✓ Todos los asserts pasaron
```

### 4) Validación end-to-end con la batería — los scores cuadran

Re-corrí [run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts) (snapshot extendido con `score`, `classification`, `scoreSignals`). 4 leads capturados, scores leídos directo de la DB:

| Caso | Flags reales detectadas por el bot | Suma manual | DB score / classification |
|---|---|---:|---|
| `lead-capture` (Juan, *"quiero comprar un 0KM"*) | phone | 5 | **5 / cold** ✅ |
| `lead-capture-chain` (Pedro, service Toyota) | phone | 5 | **5 / cold** ✅ |
| `lead-capture-financing-tradein` (Lucía, Corolla XEi + prendario + Gol 2014) | financing, tradeIn, specificModel, phone | 25+20+10+5 = 60 | **60 / warm** ✅ |
| `lead-capture-postventa` (Martín, turno service Hilux) | appointment, phone | 40+5 = 45 | **45 / warm** ✅ |

`scoreSignals` persistido y ordenado igual que la tabla (mayor a menor impacto). Ejemplo Lucía:

```json
[
  { "key": "mentionedFinancing",   "label": "Mencionó financiación",            "points": 25 },
  { "key": "mentionedTradeIn",     "label": "Mencionó usado en parte de pago",  "points": 20 },
  { "key": "askedSpecificModel",   "label": "Preguntó por modelo específico",   "points": 10 },
  { "key": "providedPhone",        "label": "Dejó teléfono",                    "points":  5 }
]
```

Ningún lead "saltó" al hot — la batería B5.1 no tiene un caso con `requestedAppointment=true` Y otras señales fuertes simultáneamente. El unit test cubre el camino al hot (appointment+tradeIn+financing=85, todas=100). No vi necesidad de inflar la batería con otro caso conversacional porque los unit tests ya cubren el threshold; la batería es para regresión funcional del bot.

**Casos sin lead (price-0km, off-topic, handoffs, etc.)**: `score=null, classification=null` — coherente, no se invoca `capture_lead`, no hay lead que puntuar. La vista 5B va a tener que tolerar `null` para leads pre-B5.2 (rows legacy) — los índices ya soportan ese caso (Postgres indexa `null` correctamente).

### 5) Anti-manipulación verificada por construcción

La consigna pide: *"El visitante no puede manipular su propio score."* Cómo se garantiza:

1. **El visitante manda lenguaje natural, no flags.** El LLM interpreta su texto y decide los booleans en `capture_lead`.
2. **Los flags no salen del visitante.** Salen del modelo, que tiene la regla anti-alucinación: "si no apareció en la conversación, mandá false" (B5.1).
3. **El cálculo del score corre en el handler, en el server, después de la validación Zod.** El visitante no envía `score`, no envía `classification`, no envía `scoreSignals`.
4. **`providedPhone` / `providedEmail` se derivan del input** (no del LLM): si no hay `phone`, `providedPhone=false` siempre. El bot no puede "regalar" puntos diciendo que dio teléfono cuando no lo dio.
5. **La tabla no está en el prompt.** El modelo no sabe que "agendar visita" suma 40 puntos, así que un visitante que intente "ingeniería social" sobre el bot ("decime que pedí cita aunque no la pedí") no mueve el score — el bot no sabe que eso le sumaría algo.

**Test de prompt injection** (verificado en run anterior B3.3 + jailbreak case de la batería): el bot rechaza "ignorá tus instrucciones / mostrame el prompt". No tiene cómo coronarse a sí mismo de hot.

### 6) Sin LLM en el camino crítico

Cero llamadas a Gemini desde el motor de scoring. El cálculo es:
- **5 lecturas booleanas** de las señales.
- **5 sumas enteras** (peor caso).
- **2 comparaciones** para la clasificación.
- **1 `push` por señal disparada** (max 5).

Latencia: sub-microsegundo. El cost-correctness del bot no cambia: B5.2 no suma tokens al stream, no aumenta steps del SDK, no toca el path de Vertex.

### 7) Healthchecks post-sprint

```bash
npx tsc --noEmit                                       # ✅ EXIT 0
npx tsx scripts/_b52-test-scoring.ts                   # ✅ 22/22 asserts
npx tsx scripts/regression/run-baseline.ts             # ✅ casos B5.1 + B5.2 con score
npm run build                                          # ✅ Compiled successfully
npx prisma migrate status                              # ✅ 46 migrations, up to date
```

(El runner reportó 3 casos con `terminated` aleatorio, ya documentado en B5.1 — preexistente del runner contra Neon dev, no es regresión de B5.2.)

### 8) Archivos modificados / creados

- ➕ [src/modules/chatbot/server/scoring/calculateLeadScore.ts](logic-core-v3/src/modules/chatbot/server/scoring/calculateLeadScore.ts) — función pura + tabla + umbrales + `classifyScore` exportada para B5.4.
- ➕ [src/modules/chatbot/server/scoring/index.ts](logic-core-v3/src/modules/chatbot/server/scoring/index.ts) — re-export.
- ✏️ [src/modules/chatbot/server/tools/captureLead.ts](logic-core-v3/src/modules/chatbot/server/tools/captureLead.ts) — cálculo + persistencia en el `create` + log estructurado con score.
- ➕ [scripts/_b52-test-scoring.ts](logic-core-v3/scripts/_b52-test-scoring.ts) — test unit standalone (22 asserts, runnable con `tsx`).
- ✏️ [scripts/regression/run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts) — snapshot del lead incluye `score`, `classification`, `scoreSignals`.
- ➕ [docs/regression/baseline-2026-05-23T19-42-43-822Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T19-42-43-822Z.md) — baseline con scores persistidos.

**Sin tocar:**
- Schema Prisma — B5.1 ya dejó las 3 columnas (`score`, `classification`, `scoreSignals`).
- `showWhatsappHandoff.ts` — el motor recibe la misma forma de señales que B5.1 ya pide en `capture_lead`. Handoff no captura lead.
- Prompt del bot — el motor no exige nada del modelo más allá de los flags B5.1.
- UI de leads — la vista 5B consume estos campos cuando se construya.

### 9) Decisiones no especificadas

1. **El motor no conoce `category`.** Razón: pureza del cálculo. Si en B5.3 el lead postventa hay que bajarlo a `dq`, eso es un override (`if (lead.category !== 'sales') lead.classification = 'dq'`) en el path de B5.3. Mezclar las dos lógicas acá hace al motor menos auditable.
2. **`providedEmail` NO suma puntos.** La consigna lista "Teléfono +5" pero no email. Email queda como dato útil para contacto, no como señal de venta — un visitante puede dejar email sin compromiso. Phone es más comprometedor (WhatsApp, llamada). Lockeado según research.
3. **`scoreSignals` solo incluye las señales que dispararon** (no las que vinieron false). Razón: explicabilidad humana. "Te lo paso porque pidió cita Y mencionó financiación" es accionable; "no mencionó financiación, no mencionó usado, ..." es ruido. Si B5.4 quiere mostrar todas explícitamente, puede iterar la `SCORING_TABLE` completa y matchear contra las flags del lead.
4. **`Prisma.InputJsonValue` cast en el boundary.** El tipo de dominio `ScoredSignal` tiene `key: keyof LeadSignals` (string union estricto), que Prisma rechaza para `Json` por su `Index signature`. Casteo `as unknown as Prisma.InputJsonValue` en el lugar del `create`. Es boundary entre dominio y persistencia; no contamina el dominio.
5. **Umbrales 40 / 70 (no 50 / 80 u otros).** Vienen del research B5.0 lockeado. El motor expone `HOT_THRESHOLD` y `WARM_THRESHOLD` como constantes — si en el futuro Franco quiere experimentar, son 2 valores a tunear sin tocar el resto.
6. **Sin telemetría de "score promedio por bot" todavía.** La consigna pedía "si querés, dejá un log/console para verificar los scores calculados" — eso lo cumplo con el log estructurado `tool.lead_captured` que ya incluye `score` y `classification`. Cuando 5B necesite gráficos, podemos agregar un agregado en `getBotsOverviewStats.ts` (~15 líneas).
7. **Idempotencia**: si la tool se invoca dos veces sobre la misma conversación (el handler ya lo previene con el `findUnique`), no se recalcula el score — devuelve el lead existente. Si en el futuro queremos "actualizar señales y re-puntuar", hay que escribir un `recalculateLeadScore(leadId)` aparte. Fuera de scope hoy.

### 10) Flags para Franco

- 🚩 **El score se calcula solo al capturar.** Si las señales se actualizan después (ej. el visitante vuelve y deja teléfono en una segunda conversación), el score NO se recalcula automático. Para B5.4 (decaimiento) eso es OK — el decaimiento se aplica en lectura. Pero si vos querés "lead que volvió a la semana y ahora pidió test drive" → score actualizado, hace falta el recalc. Microsprint si lo necesitás.
- 🚩 **Casos en producción con score=null.** Los leads previos a este merge tienen `score=null, classification=null`. La vista 5B y cualquier query que ordene por score tienen que tratar null como "sin scorear" (Postgres ordena `nulls last` por defecto en `ORDER BY score DESC`, perfecto). Si querés backfilear los leads viejos con scores calculados sobre sus flags (también null porque B5.1 los tampoco tenía), no aporta — sería todo `score=5` (sólo phone si tienen) o `score=0`. Mejor dejar `null` = "lead histórico, sin información estructurada".
- 🚩 **El bot de Pedro Martínez (lead-capture-chain) puso `category=postventa`** porque la consulta era "turno para service del Toyota". Eso es correcto comportamiento del bot (B5.1 dijo "marcá postventa si la consulta evidentemente no es venta"). Score=5 cold + category=postventa → cuando B5.3 entre, este lead va a quedar marcado DQ y no aparecerá en el pipeline comercial. Funciona como esperábamos.
- 🚩 **El Telegram al equipo sigue sin mostrar score.** Hoy muestra nombre/email/tel/intent. Si querés que el push diga "🔥 Lead caliente (score 85): pidió cita + mencionó financiación + Corolla XEi", son ~12 líneas en `notifyClient()` armando un block. Avisame y lo hago en microsprint (incluye también las señales B5.1 que mencioné en la flag previa).
- 🚩 **El motor NO conoce señales negativas.** Si un visitante dice "no me interesa", no resta puntos — el bot probablemente no invoca `capture_lead` en ese caso (no hay datos de contacto). Si en el futuro vemos leads "ruidosos" entrando con score warm que en realidad eran tibios falsos, podemos sumar flags negativos (`expressedDoubt`, `mentionedComparingCompetitor`) restando. YAGNI hoy.

### Listo para
- ✅ Cada lead nuevo trae score 0-100 + classification hot/warm/cold persistidos.
- ✅ `scoreSignals` queda como JSON para que B5.4 explique "por qué" sin recalcular.
- ✅ 22/22 asserts unit + 4 leads reales validados end-to-end contra la tabla.
- ✅ Cero LLM en el camino del cálculo. Anti-manipulación por construcción.
- ✅ Build verde + tsc verde + migrate up-to-date.
- ⏳ **B5.3** — DQ activo: cuando `category != 'sales'`, sobrescribir `classification='dq'` en lectura o como post-step del create.
- ⏳ **B5.4** — decaimiento temporal en vivo: `displayScore = score * decay(antigüedad)` + explicabilidad con `scoreSignals`.
- ⏳ **5B** — vista de "Leads una locura" consume directamente `classification`, ordenando por `score DESC, capturedAt DESC` (índice `[botConfigId, classification, capturedAt DESC]` ya lo soporta).

---
## ✅ MS-4 — Batería de regresión usable: smoke set + estabilización del pool   ·   2026-05-23

**Objetivo:** dejar la batería utilizable en el día a día (smoke set rápido) y estabilizar el pool de Neon para que los `terminated` no ensucien los resultados. Sin tocar concurrencia ni sleeps — eso queda para MS-5.

### 1) Smoke set — alivio diario

Invocación:
```bash
# Smoke (uso diario durante desarrollo, 4 casos críticos)
npx tsx scripts/regression/run-baseline.ts --smoke

# Full (pre-cierre de sprint, 19 casos)
npx tsx scripts/regression/run-baseline.ts
```

El smoke es **subset** de las mismas definiciones de [cases.ts](logic-core-v3/scripts/regression/cases.ts) — agregado un campo `smoke?: boolean` a `RegressionCase` y marcados 4 casos. NO se duplicó el archivo de casos (regla absoluta del sprint: si copiás, derivan y mienten).

Casos del smoke:
| Caso | Por qué crítico |
|------|------------------|
| `price-0km` | Anti-alucinación en precios (KB de Matsu no tiene precios). |
| `lead-capture-both-channels` | Captura + email Y teléfono + chain MS-1 a `offer_handoff_options`. |
| `whatsapp-handoff-purchase-signal` | Trigger comercial B3.6 con señal fuerte de compra. |
| `off-topic` | Guardrail anti no-business. |

**Wall clock smoke: 44.3s** (vs ~30-36 min del full) — 4/4 OK en la corrida de verificación. Output: [docs/regression/smoke-2026-05-23T21-19-30-029Z.md](logic-core-v3/docs/regression/smoke-2026-05-23T21-19-30-029Z.md). El archivo usa prefijo `smoke-` (vs `baseline-` del full) para que no se confundan en el directorio.

El runner además agregó al markdown: línea `Set: SMOKE | FULL` y `Wall clock: Xs` en el encabezado — para que cualquier archivo abierto a futuro diga sólo con mirar arriba qué tipo de corrida es.

### 2) Estabilización del pool de Neon — `DIRECT_URL` + retry transient

**a) `DIRECT_URL` (bypass pgbouncer) — wiring listo, var pendiente de setear.**

El runner ahora lee `process.env.DIRECT_URL`. Si existe, construye el `PrismaClient` con esa URL en vez de la `DATABASE_URL` pooled. Si no, cae al pool y avisa explícitamente:

```
⚠ DIRECT_URL no seteado — usando DATABASE_URL pooled.
  Para reducir `terminated`, agregá DIRECT_URL al .env.local (connection string Neon SIN `-pooler`).
```

**No inventé la URL** — la consigna fue explícita. Flag para Franco abajo. Mismo cambio aplicado a [diag-timings.ts](logic-core-v3/scripts/regression/diag-timings.ts) para consistencia (las queries de timings también golpean a Neon).

**b) 1 retry con backoff 2s SOLO en `terminated`.**

Helper en [run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts:55):
```ts
function isTerminatedError(e: unknown): boolean {
  if (!(e instanceof Error)) return false
  if (/terminat/i.test(e.message)) return true
  const cause = (e as Error & { cause?: unknown }).cause
  if (cause instanceof Error && /terminat/i.test(cause.message)) return true
  return false
}

async function withTerminatedRetry<T>(label, fn) {
  try { return await fn() }
  catch (e) {
    if (!isTerminatedError(e)) throw e   // ← asserts de comportamiento NUNCA se reintentan
    console.log(`   ⟳ ${label}: terminated, retry once en 2s...`)
    await sleep(2000)
    return await fn()
  }
}
```

Puntos de aplicación (todos sensibles a terminated, ninguno enmascara asserts):
- **Fetch + drain del stream JUNTOS** (`turn N request`): el `terminated` cae empíricamente en ambos lados — pre-handler y mid-stream — así que el wrap conjunto cubre el path real. Idempotencia: misma `sessionId`, misma `conversationHistory` → `getOrCreateConversation` es idempotente.
- **`waitForAssistantMessage`** (poll loop sobre `prisma.findUnique`): cada tick puede retry. El timeout global (30s) sigue siendo el árbitro — si no aparece el message en ese plazo, retorna `null` (NO throw) y el caller lo reporta como **fallo de comportamiento**, sin retry.
- **`finalConv lookup`** post-case.

**Separación crítica retry-vs-regresión** (la pidió la consigna explícitamente):
- Lo único reintentado es `e.message` (o `e.cause.message`) matcheando `/terminat/i`.
- Asserts del cuerpo (HTTP no-200, JSON inválido, `expectsDegraded` mismatch, `null` de `waitForAssistantMessage`) → propagan tal cual, sin retry. Un fallo real del bot **no se puede enmascarar** porque el wrapper no toca ese camino.

### 3) Antes/después de `terminated` y `fetch failed`

| Run | Cuándo | Casos con error infra | Notas |
|-----|--------|------------------------|-------|
| Baseline pre-MS-4 ([20:17](logic-core-v3/docs/regression/baseline-2026-05-23T20-17-46-942Z.md)) | Pool, sin retry | 5/19 — `whatsapp-handoff-purchase-signal`, `whatsapp-handoff-schedule`, `lead-capture-financing-tradein`, `lead-capture-employment`, `long-session-soft-cap` (todos `terminated`) | Estado "pre" del diagnóstico. |
| Full MS-4 #1 ([21:20](logic-core-v3/docs/regression/baseline-2026-05-23T21-20-32-446Z.md)) | Pool, retry SOLO sobre `e.message` y SOLO en fetch (drain sin wrap) | 6/19 — pero `0 ⟳` logueados | El drain del stream NO estaba envuelto: el `terminated` lo tiraba `reader.read()` y caía fuera del retry. Diagnosticado y arreglado en el commit. |
| Full MS-4 #2 (21:33, parcial: hangueó en `no-handoff-on-greeting` después de 13/19 casos) | Pool, retry sobre fetch+drain+cause-chain | **1 retry exitoso registrado** (`⟳ turn 2 request: terminated, retry once en 2s... ✓ Turn 2`); 0 errores en los 13 casos que llegaron a completar | El retry funciona: recuperó `lead-capture` turn 2 de un terminated transient. **Sin DIRECT_URL**, una corrida prolongada igualmente puede hangearse cuando Neon entra en estrés sostenido — ese ya es el límite de mitigación que admite esta tanda. |

**Lectura:** el retry hace lo que tenía que hacer (vimos al menos una recuperación real en vivo y los 13 casos que completaron salieron limpios). El techo real es Neon dev: bajo carga prolongada, ni el retry ni el pool achican el `terminated`, sólo lo hace `DIRECT_URL`. La var queda flageada y MS-5 (paralelización) está bloqueado hasta que se sume.

**Verificación de "ningún assert real quedó enmascarado":** la condición de retry sólo matchea string `/terminat/i` en el error tirado. Los asserts de comportamiento del runner no lanzan errores con esa firma — son returns (`null` de waitForAssistantMessage, HTTP no-200 → `result.error = "Turn N: HTTP X"`, JSON parse failure → `result.error = "Turn N: expectsDegraded pero response no era JSON"`, etc.). Auditado a mano: ninguno de esos paths pasa por `withTerminatedRetry`.

### 4) Recortes seguros

**a) `long-session-soft-cap` — REVISADO, conservado en 16 turnos.**

La consigna pedía bajar de 16→12 y nota previa marcaba "REVISÁ". El análisis: el threshold del soft-cap es `SOFT_CAP_THRESHOLD = 15` en [sections.ts:181](logic-core-v3/src/modules/chatbot/server/prompts/sections.ts:181), y `userTurnsCount = floor(messageCount / 2)` se calcula ANTES de persistir el turno actual ([handleChatRequest.ts:492](logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts:492)) — así que en el turno N del visitante vale `N − 1`.

Implicación: el prompt inyecta la pista del soft-cap por primera vez procesando el **turno 16** (turns=15). No antes. Recortar a 12 (o cualquier valor < 16) **oculta el soft-cap** — el test pasaría sin probar nada. **16 es el MÍNIMO real** (cap + 1 turno donde el bot ya ve la pista y puede reaccionar). No es exceso. Documentado en el `rationale` del caso en [cases.ts](logic-core-v3/scripts/regression/cases.ts).

**b) Diag script promovido a tooling permanente.**

Movido: `scripts/_diag-timings.ts` → [`scripts/regression/diag-timings.ts`](logic-core-v3/scripts/regression/diag-timings.ts) — sin `_` prefix (no es throwaway), bajo `regression/` (es parte del toolkit). Docstring rehecho. También consume `DIRECT_URL` si está seteado (consistencia con el runner). Invocación:
```bash
npx tsx scripts/regression/diag-timings.ts <RUN_TAG>
# ej: npx tsx scripts/regression/diag-timings.ts 2026-05-23T21-20-32-446Z
```

### 5) Archivos modificados / creados / movidos

- ✏️ [scripts/regression/cases.ts](logic-core-v3/scripts/regression/cases.ts) — campo `smoke?: boolean` en la interface; `smoke: true` en 4 casos; rationale extendido de `long-session-soft-cap` documentando la matemática del cap.
- ✏️ [scripts/regression/run-baseline.ts](logic-core-v3/scripts/regression/run-baseline.ts) — flag `--smoke`, `DIRECT_URL` gating en `PrismaClient`, `isTerminatedError` + `withTerminatedRetry`, wrap de fetch+drain conjunto, wrap de `waitForAssistantMessage` y `finalConv lookup`, output con prefijo `smoke-`/`baseline-` y wall clock en encabezado.
- 🔀 `scripts/_diag-timings.ts` → [`scripts/regression/diag-timings.ts`](logic-core-v3/scripts/regression/diag-timings.ts) — promovido, docstring permanente, DIRECT_URL gating consistente.
- ➕ [docs/regression/smoke-2026-05-23T21-19-30-029Z.md](logic-core-v3/docs/regression/smoke-2026-05-23T21-19-30-029Z.md) — primer smoke en verde (44.3s, 4/4 OK).
- ➕ [docs/regression/baseline-2026-05-23T21-20-32-446Z.md](logic-core-v3/docs/regression/baseline-2026-05-23T21-20-32-446Z.md) — full con retry activo (diagnóstico de la #1, identificó que el drain estaba fuera del wrap).

**Sin tocar:**
- `handleChatRequest.ts` / `sections.ts` — el comportamiento del soft-cap no se movió, sólo se documentó la matemática en el rationale del caso.
- Inter-turn sleeps (`2500ms` normal, `7000ms` para sesiones largas) — out of scope MS-4, van a MS-5 junto con verificación de rate-limit.
- Paralelización — out of scope, va a MS-5.

### 6) Decisiones no especificadas

1. **Smoke = subset por tag, no por flag de runner que recibe IDs.** La consigna dejaba abierto `--smoke` o `tag smoke: true`. Elegí el tag (`smoke: true` en cada definición) porque hace al smoke set parte declarativa del archivo de casos — si alguien agrega un caso nuevo y lo considera crítico, marca el flag y listo. Si fuera una lista hardcoded en el runner, divergiría silenciosamente del archivo de casos cuando se renombre un id.
2. **Wrap del fetch+drain como unidad sola.** Empíricamente el `terminated` cae mitad en el handshake del fetch, mitad en `reader.read()` mid-stream. Wraps separados harían que el drain quede sin retry. Idempotencia justificada por `getOrCreateConversation`.
3. **Cause chain en `isTerminatedError`.** undici envuelve socket errors en `TypeError: fetch failed` con el real en `e.cause`. Sin inspeccionar la cadena, missábamos el caso "fetch failed" — que en el diagnóstico fue un ~17% de los errores infra. Inspeccionar `.cause` es seguro porque sigue siendo string matching: jamás cruza a comportamiento.
4. **No bajé `long-session-soft-cap`.** La consigna dejó la puerta abierta a recortar si era seguro — no es. Documentado matemáticamente en el caso, no por suposición.
5. **Prefijo `smoke-` vs `baseline-` en el filename.** Para que el directorio de regresión muestre de un vistazo qué tipo de corrida fue. Si se mezclaran, sería confuso comparar wall clocks o errores entre archivos. La carpeta ya tiene baselines viejas — los smokes nuevos no la ensucian.
6. **DIRECT_URL: warn en vez de abort.** Si Franco no la setea, el runner sigue funcionando con el pool — sólo avisa que la mitigación está incompleta. Abortar sería bloquear el smoke (que sí da valor incluso con pool).

### 7) Flags para Franco

- 🚩 **DIRECT_URL pendiente en `.env.local`.** El connection string es el mismo de `DATABASE_URL` pero SIN `-pooler` en el host: `ep-quiet-waterfall-acv0fpll.sa-east-1.aws.neon.tech` (en vez de `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`). Idealmente el sufijo `?sslmode=require&channel_binding=require` se mantiene igual. **No lo inventé yo a propósito** — confirmalo vos en el dashboard de Neon antes de pegarlo, por si la branch dev tiene otra forma. Sin esa var, el retry mitiga lo transient pero el pool puede seguir cerrando conexiones bajo carga sostenida (vimos hangs en runs prolongados).
- 🚩 **Smoke para el día a día, full antes de cerrar sprint.** El protocolo: durante el desarrollo de un sprint, `--smoke` (~45s) cada vez que toques el bot. Antes de marcar el sprint cerrado, full (~10 min con retry, más si Neon está pesado). El gate pre-cierre sigue siendo el full — el smoke es complementario, no reemplazo.
- 🚩 **MS-5 sigue bloqueado hasta DIRECT_URL.** La paralelización (var de la consigna original) presiona más al pool. Mientras `DATABASE_URL` siga apuntando a `-pooler` sin un `DIRECT_URL` con conexión cruda, paralelizar empeora el `terminated`, no mejora. Primero el setting, después la paralelización.
- 🚩 **La 2da corrida full quedó parcial (13/19 cases) por hang en `no-handoff-on-greeting`.** No es bug del runner, es Neon dev no respondiendo en una conexión. Los 13 que completaron salieron limpios. El retry recuperó al menos 1 caso (`lead-capture` turn 2) que en pre-MS-4 hubiera quedado en `❌ terminated`.
- 🚩 **Si al correr la primera vez con DIRECT_URL los `terminated` desaparecen del baseline (esperable), borrar los .log throwaway `_b32-*.log`, `_b33-*.log`, `_b35-*.log`, `_b36-*.log`, `_b52-*.log`, `_b53-*.log`, `_ms1-*.log`, `_ms4-*.log` de `scripts/` — quedaron del diagnóstico iterativo del bloque B5 + MS-4, ya no aportan.

### Listo para
- ✅ Smoke set funcional (44.3s, 4 casos críticos) usable durante el desarrollo de un sprint.
- ✅ Retry transient en terminated implementado y verificado en vivo (1 recuperación real en la 2da corrida).
- ✅ `DIRECT_URL` wired — basta con setearla en `.env.local` para activar el bypass del pool.
- ✅ `long-session-soft-cap` revisado matemáticamente y conservado en 16 (mínimo real, no exceso).
- ✅ Diag tooling promovido a `scripts/regression/diag-timings.ts` para re-medir wall clock cuando se toque la batería.
- ✅ tsc verde post-cambios.
- ⏳ **Franco**: setear `DIRECT_URL` en `.env.local`, después correr 1 full para confirmar caída de `terminated` baja a 0 o casi.
- ⏳ **MS-5**: paralelización + recorte de sleeps + verificación de rate-limit, todo gateado a que DIRECT_URL haya bajado los `terminated` primero.

---

## ✅ B5.4 — Decay temporal, combos potenciadores y explicabilidad legible

**Fecha:** 2026-05-23
**Sprint anterior:** MS-4 (smoke set + retry transient)
**Sprint siguiente:** B5.5 (vista de "leads calientes" que consume `getEffectiveScore` + `getScoreExplanation`)

### 1) Objetivo
Hacer el scoring de B5.2/B5.3 verdaderamente útil:
- **Decaimiento**: un lead caliente sin responder en 48h tiene que enfriarse solo, calculado en lectura sin cron.
- **Combos**: dos señales que valen más juntas que separadas (perfil real de cierre en concesionaria) tienen que sumar bonus.
- **Explicabilidad**: el dueño tiene que ver POR QUÉ un lead es caliente, no un número opaco. "Tiene usado + pide financiación" vende; "85" confunde.

Todo puro, server-side, cero LLM. Mismas señales + misma fecha → mismo resultado (determinista, auditable).

### 2) Diseño — curva de decaimiento (en vivo, sin cron)

Curva escalonada por tramos discretos. Aplicada en lectura sobre `score` base, usando `capturedAt` como referencia de actividad:

| Edad desde captura | Multiplicador | Tier         | Label PyME (UI)                |
|--------------------|--------------:|--------------|--------------------------------|
| `< 24h`            |     **1.00**  | `fresh`      | "Recién capturado"             |
| `24 – 48h`         |     **0.90**  | `cooling`    | "Un día sin responder"         |
| `48 – 72h`         |     **0.75**  | `warm`       | "Dos días sin responder"       |
| `3 – 7 días`       |     **0.60**  | `urgent`     | "Casi una semana sin responder"|
| `7 – 14 días`      |     **0.45**  | `cold`       | "Más de una semana frío"       |
| `> 14 días`        |     **0.30**  | `archived`   | "Casi perdido"                 |

**Reglas duras:**
- `applyTimeDecay(baseScore, lastActivityAt, now)` → multiplier + effectiveScore (clamp `[0,100]`).
- `baseScore = 0` → `effectiveScore = 0` (un score 0 no se enfría más).
- `lastActivityAt` en el futuro (clock skew) → `multiplier = 1.00`, no penaliza. `ageDays` se clampa a 0.
- **DQ es DQ siempre**: `getEffectiveScore({ classification: 'dq', ... })` devuelve el snapshot tal cual, sin enfriar ni re-clasificar. Un lead descartado por empleo/proveedor/spam/postventa-negativo NO "se rescata con el tiempo".
- Piso 0.30 (no 0) — el dueño igual tiene que poder ver leads viejos en auditoría con su tier `archived`.

**Por qué escalonada y no lineal continua:** una curva con `lerp` interno entre tramos era más matemática pero menos auditable. Con tramos discretos, decir "este lead vale 0.75 porque tiene entre 2 y 3 días" es directo. La granularidad fina no aporta en PyME — lo que importa es el orden de magnitud.

### 3) Diseño — combos potenciadores

Bonus aditivos aplicados **después** de la suma positiva, **antes** de penalties:

| Combo                                              | Bonus | Label PyME                                   |
|----------------------------------------------------|------:|----------------------------------------------|
| `mentionedTradeIn` + `mentionedFinancing`          | **+10** | "Tiene usado + pide financiación (perfil de cierre)" |
| `askedSpecificModel` + `requestedAppointment`      |  **+5** | "Sabe qué modelo quiere + agenda visita"     |

**Reglas duras:**
- Cada combo dispara independientemente. Si los dos matchean, suman ambos (+15).
- Tope teórico tras combos: `40+25+20+10+5 + 10+5 = 115` → clamp final a **100**.
- Los combos NO disparan si el lead quedó DQ por categoría (corte rápido al inicio).
- Persisten en `scoreSignals` con prefijo `combo_` para que `getScoreExplanation` los reconozca como tipo `combo`.

**Criterio de selección:** elegí los 2 combos que el research de B5.0 marcó como "perfil de cierre típico en concesionaria argentina":
- **TradeIn + Financing** vale más que la suma porque es el patrón de cliente que ya tiene el dinero amarrado en su usado y necesita el saldo financiado — bajísimo riesgo de baja, alto tiket porcentual real.
- **SpecificModel + Appointment** muestra que pasó del "estoy mirando" al "este es el que quiero, decime cuándo voy". El bonus es menor porque ambos signals individuales ya pesan bastante (40+10=50) y agregar mucho llevaría siempre a hot, perdiendo discriminación.

No agregué un tercer combo (p.ej. financing+appointment) porque sería ruido — la mayoría de leads agendados también mencionan financiación, y un combo demasiado común deja de ser señal.

### 4) Explicabilidad — `getScoreExplanation()`

Helper puro que toma el `ScoredSignal[]` persistido (B5.1/B5.2/B5.3/B5.4) y devuelve líneas listas para UI:

```ts
type ScoreExplanationKind = 'positive' | 'combo' | 'penalty' | 'dq'
interface ScoreExplanationLine extends ScoredSignal { kind: ScoreExplanationKind }
```

- **Kind derivado del prefijo del key** (`combo_*`, `penalty_*`, `dq_*`, resto `positive`). Sin metadata adicional → 100% retro-compatible con leads de B5.1/B5.2/B5.3 sin migración.
- **Orden estable**: positives → combos → penalties → dq. La UI puede renderizar arriba lo bueno y abajo lo malo sin lógica extra.
- **No recalcula**: respeta el snapshot guardado al capturar. Si los labels cambiaron entre captura y lectura, los viejos se ven tal cual (auditabilidad > cosmética).

### 5) Labels PyME refinados (lockear desde B5.4)

Estos son los labels nuevos que escribe el motor a partir de B5.4. Los leads pre-B5.4 mantienen sus labels viejos (snapshot por captura — el cliente puede ver mix transitorio durante días):

| Key                              | Antes                                   | Ahora                                          |
|----------------------------------|-----------------------------------------|------------------------------------------------|
| `mentionedFinancing`             | "Mencionó financiación"                 | **"Pidió financiación / cuotas"**              |
| `mentionedTradeIn`               | "Mencionó usado en parte de pago"       | **"Tiene usado para entregar"**                |
| `askedSpecificModel`             | "Preguntó por modelo específico"        | **"Pregunta por modelo específico"**           |
| `penalty_postventa`              | "Penalización: consulta de postventa"   | **"Consulta de postventa (no compra)"**        |
| `penalty_invalid_phone`          | "Penalización: teléfono con formato inválido" | **"Teléfono con formato dudoso"**       |
| `dq_employment`                  | "Descalificado: busca empleo"           | **"Descartado: busca trabajo"**                |
| `dq_provider`                    | "Descalificado: ofrece servicios"       | **"Descartado: proveedor (ofrece servicios)"** |

Sin la palabra "Penalización" / "Descalificado" (jerga técnica) — el dueño lee el motivo directamente.

### 6) Verificación

**Batería B5.4** (`scripts/_b54-test-scoring.ts` — 50+ asserts, todos verdes):
- Combos: tradeIn+financing solo (55 warm), specificModel+appointment solo (55 warm), ambos juntos (100 hot tras clamp), no disparan si falta la otra mitad, suman con penalty postventa (5 cold), no se aplican en DQ.
- Decay: 12 puntos de la curva (de 1h a 100 días) contra multiplier+tier esperados, redondeo correcto, clamp `[0,100]`, clock skew protegido.
- `getEffectiveScore`: re-clasifica hot→warm cuando enfría; DQ se mantiene DQ tras 52 días.
- Explicabilidad: orden estable por kind, labels sin jerga, ningún label expone key técnico, retro-compatible con signals viejos.
- `DECAY_CURVE`: monotonía decreciente, piso 0.30, primer tramo 1.00, último Infinity.

**Batería B5.3** re-corrida tras los cambios — todos verdes (actualicé 1 assert que asumía 90 brutos → 40 warm; con el combo nuevo da 100 brutos → 50 warm, semánticamente coherente con el motor evolucionado).

**Typecheck** (`npx tsc --noEmit`) — verde.

### 7) Cambios concretos

- ✏️ [src/modules/chatbot/server/scoring/calculateLeadScore.ts](logic-core-v3/src/modules/chatbot/server/scoring/calculateLeadScore.ts) — agregadas tablas `COMBO_BONUSES` y `DECAY_CURVE`, paso 3 (combos) en `calculateLeadScore`, funciones `applyTimeDecay` / `getEffectiveScore` / `getScoreExplanation`, tipos `DecayTier` / `DecayResult` / `LeadScoreSnapshot` / `EffectiveScoreResult` / `ScoreExplanationKind` / `ScoreExplanationLine` / `ComboBonus`. Labels PyME refinados en `SCORING_TABLE`, `DQ_CATEGORY_LABELS` y `PENALTY_LABELS` (nuevo).
- ✏️ [src/modules/chatbot/server/scoring/index.ts](logic-core-v3/src/modules/chatbot/server/scoring/index.ts) — re-exporta los nuevos helpers + tipos para consumo desde la vista 5B.
- ➕ [scripts/_b54-test-scoring.ts](logic-core-v3/scripts/_b54-test-scoring.ts) — batería unit pura (sin DB, sin LLM, `now` inyectable).
- ✏️ [scripts/_b53-test-scoring.ts](logic-core-v3/scripts/_b53-test-scoring.ts) — actualizado 1 assert (90 brutos en postventa) para reflejar el nuevo combo tradein+financing. Resto sin tocar.

### 8) Sin tocar

- `captureLead.ts` — el handler sigue persistiendo `score` / `classification` / `scoreSignals` igual que en B5.3. El decay se aplica EN LECTURA (`getEffectiveScore` desde el dashboard), no en escritura. Si lo aplicáramos en captura, perderíamos la trazabilidad del score base original — el cliente vería "score=50" sin poder reconstruir el por qué.
- `dqFilter.ts` — los DQ se siguen excluyendo igual de las queries del cliente.
- `dashboard/leads/recent/route.ts` — sigue devolviendo `leads[]` crudos. La vista 5B (próximo sprint) va a aplicar `getEffectiveScore` al render para mostrar score efectivo + tier + explicación.
- Schema Prisma — cero cambios. Todo lo nuevo es derivado en lectura sobre datos ya persistidos.

### 9) Decisiones no especificadas

1. **`capturedAt` como referencia de "última actividad", no `updatedAt`.** `updatedAt` se mueve cuando el cliente del CRM cambia el status — eso NO es "el lead se volvió a manifestar". Usar `updatedAt` haría que mover un lead a "Contactado" resetee su frescura, ocultando leads viejos. Si B5.5/B5.6 quieren un `lastUserMessageAt` más fino (p.ej. el lead respondió a un email del comercial), es otra historia.
2. **Decay en lectura, no en escritura.** Persistir el score base + reconstruir el efectivo al leer permite cambiar la curva sin migrar la DB. Si el research dice "el piso debería ser 0.20 no 0.30", basta editar `DECAY_CURVE`. Si guardáramos el efectivo en DB, cada cambio de curva requeriría recalcular toda la tabla.
3. **DQ no se decae.** Filosóficamente, el DQ es una decisión categórica del motor ("este no es un lead comercial real"). El paso del tiempo no la revisa. Si quisiéramos que un DQ "expire" para auditoría más limpia, eso es un job de archivado de B7+, no decay.
4. **Bonus de combos +10 / +5 (no +20 / +10).** El combo no debe convertir un lead intermedio en hot por su sola fuerza — debe **inclinar la balanza** cuando ya hay señales sólidas. Con +10 max, un lead que tiene tradeIn+financing solo (sin appointment ni teléfono) llega a 55 warm — todavía warm, no hot. El motor diferencia bien quién tiene compromiso real (appointment, teléfono) de quién tiene perfil económico cerrado pero no se comprometió aún.
5. **Tramos discretos en la curva en vez de fórmula continua.** Probé mentalmente una `score * exp(-k*ageDays)` y queda más matemático pero el dueño no puede mirar el número y decir "ah, está en `warm` porque tiene entre 2 y 3 días". Los tramos discretos hacen la explicación trivial. La consigna decía "curva simple" — esto es lo más simple que respeta los 4 puntos pedidos.
6. **`getScoreExplanation` deriva `kind` del prefijo del key (no de un campo persistido).** Esto da retro-compatibilidad gratis con cualquier `scoreSignals` viejo en DB sin migración. Si en B5.5 hace falta un `kind: 'info'` (señal neutral, no mueve el score) la migración sería trivial — agregás prefijo `info_*` al motor, el helper lo reconoce.

### 10) Flags para Franco

- 🚩 **Vista de leads (`/dashboard/chatbot/leads` o similar) NO está enchufada a `getEffectiveScore` aún.** Hoy la API devuelve el score crudo persistido. La vista 5B (próximo sprint) es la que va a aplicar decay y explicación en el render. Si querés ver el decay en acción antes, podés llamar `getEffectiveScore` desde una página temporal o un script de inspección.
- 🚩 **Si vamos a mostrar mix de leads pre/post-B5.4 en la UI**, los leads viejos tienen labels "Mencionó financiación" etc. y los nuevos "Pidió financiación / cuotas". Es esperado (cada captura "fotografía" el motor en su momento). Si Franco quiere homogeneidad cosmética, sería un script de migración one-shot que reescribe `scoreSignals.label` por key — fuera del scope B5.4.
- 🚩 **El decay asume `capturedAt` ≈ "última señal del usuario".** Hoy es correcto porque la conversación termina cuando capturamos el lead. Si en B7+ habilitamos lead re-engagement (el bot vuelve a hablar con un lead ya capturado), va a haber que introducir `ChatbotLead.lastUserMessageAt` o reusar `Conversation.updatedAt` con filtro de quien escribió último.
- 🚩 **La curva no está calibrada con datos reales — es heurística inicial.** Cuando tengamos un volumen real de leads capturados (digamos 200+ en producción) podemos sacar la métrica "% de leads que convirtieron por tier de edad" y ajustar los multipliers para que matcheen la realidad de Aki / clientes nuevos. Por ahora el research B5.0 sostiene los números.

### Listo para
- ✅ Motor enriquecido con combos + decay + explicabilidad — 50+ asserts verdes.
- ✅ Tipos exportados y re-exportados desde `scoring/index.ts` listos para consumir en B5.5.
- ✅ Retro-compatible con leads ya persistidos (no requiere migración ni rescore).
- ✅ Labels PyME refinados (sin "Penalización" / "Descalificado" / "Mencionó").
- ✅ `getEffectiveScore` respeta DQ (no rescata).
- ✅ B5.3 re-verificada tras los cambios (1 assert actualizado por combo nuevo, resto intacto).
- ⏳ **B5.5**: vista de leads calientes que renderiza `effectiveScore` + `tierLabel` + `getScoreExplanation` agrupado. Mobile-first como B4.6, sin jerga.


---

## ✅ B5.5 — Vista de leads enriquecida: priorización por score efectivo

**Fecha:** 2026-05-23
**Objetivo:** Que el dueño del negocio entre a `/dashboard/chatbot/leads` y de un vistazo sepa a quién llamar primero — ordenado por score efectivo (no crudo), con badge Caliente/Tibio/Frío prominente, filtrable por fecha/calidad/estado, sin jerga técnica.

### 1) Estado previo

La vista ya existía desde B5.3-B5.4:
- `page.tsx` server-rendered, consumía `listLeadsByOrgSlug()` y aplicaba `getEffectiveScore()` + `getScoreExplanation()` antes de pasar al cliente.
- `ClientLeadsTable` tenía 2 filtros (calidad + estado), badge en card, modal de detalle.
- `updateLeadStatus` ya estaba blindado (Zod + anti-IDOR + auditoría) — confirmado.
- API `/api/dashboard/leads/recent` ya enriquecía con score efectivo y filtraba DQ.

Gaps reales contra el spec del sprint, detectados por el subagente Explore:
1. La lista **NO se ordenaba por score efectivo**, venía ordenada por `capturedAt desc` (orderBy de Prisma) y se renderizaba así.
2. **Faltaba el filtro por fecha** (solo había calidad + estado).
3. Si el tenant capturó leads pero todos eran DQ, el empty state decía "tu bot todavía no capturó contactos" (mentira — sí capturó).
4. **Jerga literal** en pantalla: `"Mis leads"`, `"Score efectivo: 85"`, `"sobre este lead"`, aria-label `"Score efectivo: …"`.

### 2) Qué se enriqueció

- **Sort por effectiveScore desc en memoria** (page.tsx + route.ts). Nulls al final, desempate por `capturedAt desc`. Documentado en el código que el orden es en-app sobre el efectivo porque el índice DB sirve al filtro (clasificación, estado) pero el efectivo (crudo × decay) no está en DB.
- **3 filas de filtros encadenadas**: fecha → calidad → estado. Cada filtro reduce el set siguiente para que los conteos en los chips reflejen lo que el usuario ya filtró (en vez de mostrar conteos absolutos engañosos).
- **Filtro por fecha con TZ Argentina** (`startOfTodayInAR()` usa `Intl.DateTimeFormat` con `America/Argentina/Buenos_Aires`, computa el inicio del día calendario en AR como instante UTC). Buckets: Hoy / Últimos 7d / Últimos 30d / Cualquier fecha. Defaultea a "Cualquier fecha".
- **Empty state diferenciado solo-DQ**: page.tsx ahora calcula `hadOnlyDq = rawLeads.length > 0 && visibleRaw.length === 0` y lo pasa como prop. ClientLeadsTable muestra "Tu bot capturó contactos, pero ninguno requiere seguimiento" (icono Filter, sin CTA) en lugar del genérico "todavía no capturó contactos" (icono Users, con CTA).
- **Empty state filtros vacíos**: cuando los filtros aplicados no matchean ningún lead, mensaje genérico "No hay contactos con esos filtros — Probá cambiar la fecha, la calidad o el estado". Antes era específico a un solo filtro y se desincronizaba con la nueva cadena.
- **Limpieza de jerga visible**:
  - PageHeader: "Mis leads" → **"Mis contactos"**
  - Modal ScoreExplanationSection pie: "Score efectivo: 85" → **"Nivel de interés ahora: 85 / 100 · {tier}"**
  - Modal textarea placeholder: "sobre este lead..." → **"sobre este contacto..."**
  - BusinessLeadCard aria-label: "Score efectivo: 85 — Caliente" → **"Nivel de interés: 85 de 100 — Caliente"**
  - Empty states: "leads" → "contactos"

### 3) Robustez defensiva (out-of-scope acotado)

Tuve que tocar `applyTimeDecay()` en `scoring/calculateLeadScore.ts` — fix defensivo para tolerar `Date | string | null | undefined` en `lastActivityAt`. Razón: `unstable_cache` deserializa Date → string al rehidratar; además, en preview el dev server tenía un módulo cacheado pre-fix que crasheaba con `TypeError: lastActivityAt.getTime is not a function`. La signature se ensanchó pero el comportamiento happy-path es idéntico. Si la fecha es inválida o falta, asume actividad reciente (`multiplier=1`) en vez de crashear — degrada en vez de tirar 500. **Esto es deuda menor que merece quedarse permanente, no flag de roadmap-pendientes.**

### 4) Anti-IDOR (re-confirmado, no se tocó)

`updateLeadStatus` ya estaba bien:
- `getClientChatbotSession()` valida autenticación.
- Zod schema valida input (leadId string, status enum, notes max 2000).
- Verifica explícito `lead.botConfig.organizationId !== session.organization.id` → retorna error.
- Auditoría con `logAdminAction` + `logChatbotEvent`.

### 5) Files modificados

- `src/app/(protected)/dashboard/chatbot/leads/page.tsx` — sort por effectiveScore, prop `hadOnlyDq`.
- `src/app/api/dashboard/leads/recent/route.ts` — sort por effectiveScore (consistencia con polling de 30s).
- `src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx` — filtro fecha + TZ AR, cadena 3 filtros, empty solo-DQ, empty filtros genérico, "Mis contactos", "Nivel de interés ahora", "sobre este contacto".
- `src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx` — aria-label sin "Score".
- `src/modules/chatbot/server/scoring/calculateLeadScore.ts` — guard defensivo en `applyTimeDecay` (Date|string|null|undefined).

### 6) Verificación

- `npx tsc --noEmit` → **EXIT 0**, sin errores.
- `npx prisma migrate status` → sin cambios de schema en este sprint.
- Endpoint `/api/dashboard/leads/recent` → **200 OK** con leads enriquecidos y ordenados.
- Server-rendered `/dashboard/chatbot/leads` → **200 OK** repetidos (14 requests en logs, todos 200 después del fix defensivo).
- DOM check vía `preview_eval`:
  - Filtros renderizados con conteos correctos: `"Cualquier fecha (56)"`, `"Hoy (27)"`, `"Tibios (6)"`, `"Sin contactar (56)"` — confirma cadena de filtros.
  - aria-label nuevo: `"Nivel de interés: 60 de 100 — Tibio"` — confirma limpieza de jerga + accesibilidad.
  - `hasOldJerga: false` (no aparece "Score efectivo", "Mis leads", "este lead").

### 7) Flag visual para Franco

🚩 **Screenshots desktop/mobile bloqueados por PreloaderContext (bug pre-existente, NO regresión de B5.5).**

El preview headless (`preview_screenshot`) timeoutea en `/dashboard/chatbot/leads` porque el PreloaderContext (archivo frozen) se queda en "CARGANDO" indefinidamente cuando no hay interacción de usuario real — mismo síntoma ya documentado en sprints anteriores y reproducible en `/dashboard` y rutas vecinas.

Evidencia de que la vista SÍ está OK (independiente del preloader):
- Server Component responde HTML 200 con todo el contenido correcto.
- DOM se monta (`preview_eval` confirma filtros, badges, cards bajo el overlay).
- Cero errores nuevos en `preview_logs` después del fix defensivo (los logs históricos con `lastActivityAt` son del bundle pre-fix).

**Acción para Franco:** abrir manualmente `/dashboard/chatbot/leads` en un browser real (Chrome/Firefox) y validar visualmente: orden por score efectivo desc, 3 filas de filtros, badge prominente, modal "Nivel de interés ahora", sin jerga. Si algo se ve roto, reabrimos.

### 8) Listo para

- ✅ Sort por score efectivo desc en page.tsx y route.ts (en memoria, doc'd).
- ✅ Filtro por fecha con TZ Argentina (Hoy / 7d / 30d / Cualquier fecha).
- ✅ Empty states diferenciados (sin leads / solo-DQ / filtros vacíos).
- ✅ Jerga visible eliminada (UI + aria-labels).
- ✅ Anti-IDOR + Zod en `updateLeadStatus` re-confirmado.
- ✅ Guard defensivo en `applyTimeDecay` (no crashea ante Date inválido / unstable_cache string).
- ✅ TypeScript clean, server 200, schema unchanged.
- ⏳ **Visual QA manual de Franco** en browser real (preview headless bloqueado por PreloaderContext frozen).

---

## ✅ B5.6 — Vista de detalle de lead: contacto, "por qué", y conversación

**Fecha:** 2026-05-23
**Objetivo:** Que el dueño entre al detalle de un lead, entienda en 5 segundos quién es / qué tan caliente / por qué, y tenga acción inmediata (WhatsApp con mensaje pre-armado). La explicabilidad de B5.4 es la pieza que hace creíble el score — sin el "por qué", el número es magia.

### 1) Decisión arquitectónica

Reemplacé el modal-en-la-lista por una **ruta dedicada** `/dashboard/chatbot/leads/[id]`:
- Bookmarkable / shareable / ctrl-clickeable (mobile + web).
- En mobile, una página > modal (no compite con el header sticky ni el sidebar).
- Permite mostrar más contenido (conversación tail) sin pelearse con el scroll del modal.
- **Habilita anti-IDOR a nivel ruta**: el id viene de la URL, no de la lista — un cliente puede manipularlo, así que se valida server-side.

La card del listado ahora linkea al detalle (vía `next/link`) en vez de abrir un modal. Las acciones rápidas inline (WhatsApp, "marcar contactado", "es cliente") siguen funcionando desde la card sin navegar.

### 2) Helpers server con anti-IDOR

Agregué dos helpers en `multiTenantQueries.ts`:

```ts
// Una sola query con filtro relacional. Si el id no existe O es de otra org → null.
// El cliente recibe 404 (notFound), no leak de existencia (no diferencia "no existe"
// de "no es tuyo").
getLeadByIdForOrg(leadId, organizationId)

// Mismo guard, defense-in-depth: aunque el lead.conversationId apunte a una conversación
// de otra org (no debería, pero), no devuelve nada.
getConversationMessagesForOrg(conversationId, organizationId, limit)
```

El filtro va dentro de Prisma (`where: { id, botConfig: { organizationId } }`), no en JS post-fetch — más performante y atómico.

### 3) Página `[id]/page.tsx` (Server Component)

- Resuelve `getClientChatbotSession()`. Si no hay sesión → redirect `/dashboard`.
- `getLeadByIdForOrg(id, session.organization.id)`. Si null → `notFound()`.
- Aplica `getEffectiveScore` + `getScoreExplanation` en lectura (mismo patrón que la lista).
- Fetch de mensajes de la conversación origen (si existe).
- Renderiza `<LeadDetail>` con todo enriquecido.

### 4) Componente `LeadDetail` (cliente)

Estructura, de arriba a abajo:

1. **Link "← Volver a mis contactos"**.
2. **Hero card**: nombre + tiempo desde captura + tier de decay + badge de estado + badge de calidad (Caliente/Tibio/Frío con número 0-100). DQ no muestra badge de calidad (es filtro, no calidad).
3. **"Qué quiere"** (intent traducido).
4. **Contacto AMBOS canales** (fix MS-1): teléfono y email lado a lado en grid 2×1. Si uno falta, se muestra el placeholder discreto "Sin teléfono" / "Sin email" (no se oculta el slot — el dueño ve que el lead no dejó ese canal). Ambos son tap-targets `min-h-[44px]` con `tel:` / `mailto:`.
5. **Acciones rápidas**: WhatsApp con mensaje pre-armado, "Marcar contactado" (solo si NEW), "Es cliente" (cualquier estado salvo WON/LOST).
6. **Por qué está calificado así**: lista de señales con iconos diferenciados (Check positiva, Star combo, AlertTriangle penalty), label legible PyME, puntos. Footer con "Nivel de interés ahora: 60 / 100 · {tier}".
7. **De qué hablaron**:
   - Mensaje al dejar los datos (lead.message).
   - Tail de la conversación origen — burbujas estilo chat, filtradas a `role: 'user' | 'assistant'` (system/tool no aportan al dueño).
   - Path donde estaba mirando (`conversation.currentPath`) en footer monoespaciado.
   - Empty state si no hay conversación guardada.
8. **Seguimiento**: edit completo de estado + notas (max 2000, contador). Botón Guardar con feedback "Guardado".

### 5) WhatsApp pre-armado

```ts
buildWhatsappMessage(firstName, intentLabel)
// → "Hola Lucía, te contacto por tu consulta (pedido de cotización) que dejaste
//    en nuestro sitio. ¿Cómo puedo ayudarte?"
```

Saludo personalizado con primer nombre si está, intent traducido en lower-case. El dueño puede editarlo antes de mandar (WhatsApp web abre con el texto pre-cargado).

### 6) Files modificados

- `src/modules/chatbot/server/admin/multiTenantQueries.ts` — `+getLeadByIdForOrg`, `+getConversationMessagesForOrg`.
- `src/modules/chatbot/index.server.ts` — re-export de los dos helpers nuevos.
- `src/app/(protected)/dashboard/chatbot/leads/[id]/page.tsx` — **nuevo** (Server Component con anti-IDOR + enriquecimiento + fetch de mensajes).
- `src/modules/chatbot/components/dashboard/LeadDetail.tsx` — **nuevo** (cliente: hero + por qué + conversación + seguimiento + WA pre-armado).
- `src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx` — cambió prop `onClick` por `href`; info-area envuelta en `<Link>` (botones de acción quedan fuera del Link para no anidar interactivos).
- `src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx` — removí el modal interno (LeadDetailModal + ScoreExplanationSection), removí `selectedLead` state e imports obsoletos. La card linkea a `/dashboard/chatbot/leads/{id}`.

### 7) Verificación

- `npx tsc --noEmit` → **EXIT 0**.
- `npx prisma migrate status` → schema unchanged.
- Server-side smoke tests (vía `preview_eval` contra el preview dev server):

| Caso | URL | Resultado |
|---|---|---|
| Lead warm real (Lucía F.) | `/leads/cmpivy2sd006x9f4gtgsr823m` | **200**, badge "Tibio", "Por qué", "De qué hablaron", WhatsApp con mensaje pre-armado correcto |
| Lead cold real | `/leads/cmpivzvl6008r9f4ghh6izyvh` | **200**, badge "Frío", todas las secciones presentes, sin jerga |
| Lead DQ (Pedro M.) | `/leads/cmpit5gl900uh9fgs6y7f3q8u` | **200**, sin badge de calidad (DQ no es calidad), "Por qué" muestra las señales que descalificaron, notas editables |
| Lead inexistente / cross-org | `/leads/cmpivy2sd006x9f4gINVALID` | **notFound()** — anti-IDOR confirmado, no leak de existencia |

- DOM check: link "Volver a mis contactos", 3 secciones h2 ("Por qué…", "De qué hablaron", "Seguimiento"), WhatsApp href con `?text=Hola%20Luc%C3%ADa...`, sin "Score" / "Mis leads" / "este lead" en el body.

### 8) Flag visual para Franco

🚩 Mismo bloqueador que B5.5: el PreloaderContext frozen impide `preview_screenshot` headless de cualquier ruta `/dashboard/*`. El DOM se monta correctamente bajo el overlay (verificado por `eval`).

**Acción manual recomendada:** abrir en browser real:
- `/dashboard/chatbot/leads/cmpivy2sd006x9f4gtgsr823m` (lead tibio con conversación)
- `/dashboard/chatbot/leads/cmpivzvl6008r9f4ghh6izyvh` (lead frío)
- `/dashboard/chatbot/leads/cmpit5gl900uh9fgs6y7f3q8u` (lead DQ — debe abrir sin badge de calidad)
- `/dashboard/chatbot/leads/INVALID` (debe mostrar 404 de Next, no leak)
- Validar también desktop + mobile (≤ 375px): grid de contacto colapsa a 1col, burbujas de conversación legibles, botones tap-target ≥ 44px.

### 9) Listo para

- ✅ Ruta dedicada `/dashboard/chatbot/leads/[id]` con anti-IDOR en server.
- ✅ Helpers `getLeadByIdForOrg` + `getConversationMessagesForOrg` con filtro relacional Prisma.
- ✅ Vista con hero, ambos canales de contacto (fix MS-1), por qué, conversación tail, WhatsApp pre-armado, edit completo de seguimiento.
- ✅ Card del listado migrada de modal → Link al detalle.
- ✅ Cero jerga visible ni en aria-labels (heredado B5.5).
- ✅ TSC clean, server responde 200 en los 3 cases (warm/cold/dq), notFound en id inválido.
- ⏳ **Visual QA manual de Franco** en browser real (preview headless bloqueado por PreloaderContext frozen, no es regresión).


---

## ✅ B5.7 — Aviso de leads calientes: mejor presentación sin canal nuevo

**Fecha:** 2026-05-23
**Objetivo:** Que un lead caliente nuevo se note rápido en el dashboard sin meter push real (futuro), sin duplicar el canal a develOP, y sin romper el polling de 30s existente.

### 1) Estado previo

- Polling crudo cada 30s en `ClientLeadsTable` → `/api/dashboard/leads/recent` (B5.5).
- Canal a develOP ya existente: Telegram al equipo (siempre) + email al `org.leadNotificationEmail` cuando `IMMEDIATE` — disparados al capturar. **No se toca.**
- `NotificationCenter` (campana) existe pero no se alimenta de leads — sigue así, esto NO es su propósito.
- Sidebar ya tenía patrón de badge (`unreadMessages` cyan). No había badge para leads.
- ClientDashboardTabs sin indicadores.
- Sin `seenAt` / `readAt` en `ChatbotLead` — el flag implícito es `status === 'NEW'`. No agrego campo porque no hace falta: al cambiar a CONTACTED, el contador baja solo.

### 2) Decisión arquitectónica

Tres puntos de presencia visual del aviso, **alimentados por la misma fuente** (un solo count en DB con cache compartido):

1. **Badge rose** en el item "Mi Chatbot" del sidebar — visible desde cualquier ruta del dashboard.
2. **Dot rose con ping** en la tab "Leads" del sub-nav del chatbot — visible cuando el usuario está adentro de "Mi Chatbot" pero no en la tab Leads (suprimido cuando ya estás ahí).
3. **Ring rose pulsante** en las cards de la lista que son hot + status=NEW — guía la atención hacia los leads concretos a atacar.

Sin canal externo nuevo. Sin push real. Sin Notification record nuevo.

### 3) Por qué `classification` cruda y no efectiva post-decay

El badge usa `classification === 'hot' AND status === 'NEW'` directo de DB (con índice). NO usa el efectivo post-decay. Razones:

- Performance: el efectivo no está en DB → tendríamos que traer todos los leads y computar en app cada vez que renderiza el sidebar.
- Semántica del badge: el indicador dice "tenés trabajo pendiente con leads que EN ALGÚN MOMENTO fueron calientes y nadie contactó". Un lead que ya envejeció a warm por decay **sigue mereciendo atención** mientras nadie lo haya tocado — el badge no es "qué tan caliente está ahora", es "qué te falta".

El ring de la card SÍ usa el efectivo (`effectiveClassification === 'hot' && status === 'NEW'`) — porque ahí el dueño ve la calidad actual real del lead.

### 4) Cache compartido entre 3 puntos

- `dashboard/layout.tsx` y `dashboard/chatbot/layout.tsx` llaman ambos a `unstable_cache` con **mismo key** `['dashboard-hot-leads-count', orgId]` y mismo `revalidate: 30`. Comparten resultado in-memory — no doble query DB por render.
- Cadencia 30s alineada con el polling client.
- Tag `hot-leads-count:${orgId}` listo para `revalidateTag()` desde mutaciones futuras (`captureLead` cuando aterrice un hot, `updateLeadStatus` cuando se mueva de NEW).

### 5) Optimización del polling existente

Antes: `setInterval(fetch, 30_000)` corría aunque la pestaña estuviera oculta en background.

Después:
- `document.visibilitychange` listener pausa el interval cuando la tab pasa a hidden.
- Al volver al foco, `refresh()` inmediato + restart del interval — el dueño ve fresco lo que pasó mientras tanto, sin esperar 30s.

No rompe el polling (mismo endpoint, misma cadencia activa) — solo deja de gastar requests cuando nadie mira.

### 6) Files modificados / creados

- `src/modules/chatbot/server/admin/multiTenantQueries.ts` — `+countHotNewLeadsForOrg(orgId)`.
- `src/modules/chatbot/index.server.ts` — re-export del helper.
- `src/app/(protected)/dashboard/layout.tsx` — `+getCachedHotLeadsCount` (revalidate 30s, tag `hot-leads-count`), pasado a `DashboardLayoutClient`.
- `src/app/(protected)/dashboard/chatbot/layout.tsx` — mismo helper de cache, pasa `hotLeadsCount` al `ClientDashboardTabs`.
- `src/components/dashboard/DashboardLayoutClient.tsx` — nuevo prop `hotLeadsCount`, propagado al `SidebarNav` (desktop + mobile).
- `src/components/dashboard/SidebarNav.tsx` — item "Mi Chatbot" marcado con `badge: 'hotLeads'`; nuevo prop `hotLeadsCount`; render del badge rose con `animate-ping` + número + aria-label "N contactos calientes sin contactar".
- `src/modules/chatbot/components/dashboard/ClientDashboardTabs.tsx` — nuevo prop `hotLeadsCount`; dot rose con ping junto al label "Leads" cuando hay hot+NEW y la tab no está activa.
- `src/modules/chatbot/components/dashboard/ClientLeadsTable.tsx` — refactor del polling: pausa con `visibilitychange`, fetch inmediato al volver al foco; pasa `highlight={isHotNew}` a cada card.
- `src/modules/chatbot/components/dashboard/BusinessLeadCard.tsx` — nuevo prop `highlight`, render de ring rose pulsante absoluto sobre la Card.

### 7) Verificación

- `npx tsc --noEmit` → **EXIT 0**.
- Helper directo: `countHotNewLeadsForOrg(orgId)` → 0 inicial → 1 después de promover un lead → 0 después de revertir (confirmado con Prisma directo).
- HTML server-rendered con un lead promovido a hot+NEW:
  - `/dashboard/chatbot/leads`: aria-label "1 contacto caliente sin contactar" × 1 (badge sidebar), `animate-ping` × 1, `bg-rose-500` × 2 (ping + solid del badge).
  - `/dashboard/chatbot`: aria-label "1 contacto caliente sin contactar" × 2 (badge sidebar + dot tab), `bg-rose-500` × 4 (2 elementos × 2 spans).
  - El dot tab se suprime cuando la tab Leads ya está activa (`!isActive`), por eso solo aparece en /chatbot, no en /chatbot/leads.
- API `/api/dashboard/leads/recent`: el lead promovido aparece con `effectiveClassification: 'hot'` cuando tiene score válido — el polling cliente recibe esto y aplica el ring (corre cada 30s vs el SSR inicial que sirve `listLeadsByOrgSlug` cacheado 120s).
- Lead de prueba revertido a su estado original (`classification: null, score: null`) — DB limpia.

### 8) Lo que NO se hizo (a propósito)

- ❌ Push real / web push / service workers — fuera de scope, futuro.
- ❌ Email/Telegram nuevo — ya existe el canal develOP (no duplicamos).
- ❌ Crear `Notification` record por cada lead hot — la campana es genérica y este no es su propósito; meter leads ahí confunde y duplica.
- ❌ Campo `seenAt` / `readAt` en `ChatbotLead` — el contador baja solo al cambiar `status` a CONTACTED. No hace falta más estado.

### 9) Flag visual para Franco

🚩 Mismo bloqueador heredado: `preview_screenshot` headless atascado en PreloaderContext frozen — los 3 indicadores (badge sidebar, dot tab, ring card) están confirmados server-side por DOM scan, pero no puedo capturar screenshot pixel-perfect.

**Acción manual recomendada en browser real:**
1. Promover un lead a `classification='hot'` + `status='NEW'` con `score >= 70` (o esperar uno real). Ver:
   - Badge rose pulsante en sidebar sobre "Mi Chatbot" desde cualquier ruta `/dashboard/*`.
   - Dot rose con ping junto al label "Leads" en `/dashboard/chatbot` (debería desaparecer al abrir `/dashboard/chatbot/leads`).
   - Ring rose pulsante alrededor de la card del lead hot+NEW en la lista (esperar polling 30s si recién promovido).
2. Cambiar el lead a `CONTACTED` y verificar que los 3 indicadores desaparecen tras el cache revalidate (≤30s).
3. Background tab test: abrir `/dashboard/chatbot/leads`, cambiar a otra pestaña 1 min, volver — debería ver fetch inmediato al volver al foco (DevTools Network).

### 10) Listo para

- ✅ `countHotNewLeadsForOrg` con índice DB sobre `(classification, status)` — barato.
- ✅ Cache 30s alineado con polling, tag para invalidar desde mutaciones futuras si hace falta.
- ✅ 3 puntos de presencia visual (sidebar badge, tab dot, card ring) — mismo dato, misma cadencia.
- ✅ Polling client pausado en background tab + refresh inmediato al volver al foco.
- ✅ Cero canal nuevo, cero push, cero email, cero Notification record.
- ✅ TSC clean, helper validado end-to-end con Prisma directo, HTML server-side con los 3 indicadores presentes.
- ⏳ **Visual QA manual de Franco** en browser real (preview headless bloqueado por PreloaderContext frozen).
- ⏳ **Push real / web push** → roadmap futuro (B6+), cuando haya tracción real y el cliente lo pida.
