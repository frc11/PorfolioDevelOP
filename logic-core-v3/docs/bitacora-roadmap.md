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

