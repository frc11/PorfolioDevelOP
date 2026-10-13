# 00 — Plan y log · Auditoría de renovación 2026-10

> Fuente de verdad de la corrida. Junto con `PROMPT.md` y `_cobertura.csv` alcanza para retomar después de una compactación o de un corte: leer `PROMPT.md` entero, después este archivo, buscar el último ciclo en **§13 Log** y seguir desde **Próximo paso**. No se re-audita lo que el ledger marca `leído`. Los `.json` de `_crudo/ciclos/` que todavía no figuran como procesados en el log son la cola de trabajo pendiente (DEC-21).

## Estado de la corrida

| Campo | Valor |
|---|---|
| Fase | **F0 — plan revisado y commiteado. PARADA: esperando `Aceptar` o `Revisar…`** |
| Base auditada | `origin/main` @ `57c421bc` (último commit 2026-09-06; refs traídas el 2026-10-13 16:23) |
| Último ciclo registrado | C00 · F0 |
| Próximo paso | F1.1 — baseline de `tsc` (§7.1) |
| Cobertura profunda | 0 / 1.298 archivos (0 %) · superficial hecho 0 / 691 |
| Hallazgos escritos | 0 · alertas de F0: 4 credenciales expuestas (§11 P1) |

### Estado por dominio

| Dominio | Ciclo | Profundo leído / total | Superficial hecho / total | Nuevos C / A / M / B | Lentes usadas | Estado |
|---|---|---|---|---|---|---|
| D1 Auth | — | 0 / 33 | 0 / 1 | — | — | abierto |
| D2 Dashboard | — | 0 / 219 | 0 / 13 | — | — | abierto |
| D3 Admin | — | 0 / 221 | 0 / 0 | — | — | abierto |
| D4 Setter | — | 0 / 171 | 0 / 34 | — | — | abierto |
| D5 Chatbot e IA | — | 0 / 372 | 0 / 52 | — | — | abierto |
| D6 Datos | — | 0 / 104 | 0 / 7 | — | — | abierto |
| D7 Integraciones | — | 0 / 59 | 0 / 4 | — | — | abierto |
| D8 Plataforma | — | 0 / 20 | 0 / 7 | — | — | abierto |
| D9 Transversal | — | 0 / 99 | 0 / 169 | — | — | abierto |
| PUB / DOC | — | — | 0 / 138 · 0 / 266 | — | — | pendiente F1 |

---

## 1. Arranque (F0.1) — lo verificado

- **Worktree y rama.** `C:\auditoria-2026-10` en `auditoria/renovacion-2026-10`, creada por Valentino desde `origin/main` (F0.2 salteado por instrucción). `git status` al arrancar (2026-10-13 ~16:26): solo `?? logic-core-v3/docs/auditoria-2026-10/` → árbol limpio fuera de la carpeta de la auditoría, sin bloqueo §9.
- **Raíces.** Repo: `C:\auditoria-2026-10` (2.212 archivos versionados). App: `logic-core-v3/` (2.045). En la raíz del repo además: `.github/` (CI + skill vendorizada), `.claude/`, `.impeccable/`, `.claudeignore`, `.gitignore`, docs sueltos (`CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`, `AUDITORIA-VS-BRIEF-2026-07.md`, cuatro `lane-*.md`), dos `_tmp_*.html` (~200 KB c/u), `logodevelOP.{png,svg}` y `videos/` (4).
- **`main` local está 52 commits detrás de `origin/main`** (`git rev-list --left-right --count main...origin/main` → `0 52`). En toda la auditoría «main» = `origin/main` @ `57c421bc`. La rama nueva trackea `origin/main` (DEC-02).
- **Worktrees (5)** — se inventarían, no se tocan (estado de otro worktree: solo `git --no-optional-locks -C <wt> status --porcelain`):

  | Worktree | Rama | HEAD |
  |---|---|---|
  | `C:/auditoria-2026-10` | `auditoria/renovacion-2026-10` | `57c421bc` (= origin/main) |
  | `C:/rediseno-home` | `rediseno/home` (home v3, fuente de F3; 563 commits adelante de main) | `9f5832f5` |
  | `C:/PorfolioDevelOP` | `redesign/home` (rama vieja) | `0f6fee58` |
  | `C:/PorfolioDevelOP/audit-clean` | `chore/auditoria-clean` (intento anterior) | `afa3094f` |
  | `C:/PorfolioDevelOP/logic-core-runtime` | `main` local (52 detrás) | `1e5b7fbb` |

- **Ramas.** 36 locales, 79 remotas (+ el symref `origin/HEAD`), 89 nombres únicos. 36 remotas y 30 locales sin mergear a `origin/main`; 10 locales sin contraparte remota (`home-clasico-referencia`, `rediseno/deslizar`, `rediseno/deslizar2`, `redisign/home`, cuatro `respaldo/*`, `revert-home-abortado` y esta). Inventario completo en F1 (`scripts/auditoria/ramas.mjs`).
- **Insumos.** `docs/auditoria-2026-10/_insumos/` **no existe** (`ls` → No such file). Insumos de facto (DEC-12), en main: `docs/audit-repo-20260707.md`, `docs/auditoria-seguridad-2026-05.md`, `docs/auditoria-total-pre-deploy.md`, `docs/audit-chatbot-runtime.md`, `docs/auditorias/` (9: A1, A2, tres A3, AUDITORIA-CIERRE-2026-07, C0, REGRESION-FINAL, SMOKE-TEST-MANUAL), `docs/audits/` (6, incluido `2026-05-bfg-leak-cleanup.md`), `docs/audit/2026-04-dashboard-cleanup-audit.md`, `docs/baselines/2026-07-auditoria-seguridad.md` (3.600+ líneas), `docs/baselines/2026-05-{admin-performance,chatbot-runtime}.md`, `docs/auditoria-{consistencia-setter,recorrido-completo-novato,ux-setter}.md`, `docs/{admin-design-system-audit,design-system-audit,microaudit-frozen-frontera-CO,b8a-auditoria,b8a-ii-auditoria,roadmap-pendientes,testing-strategy}.md`, `docs/sprints/alpha-1-reaudit.md`, `raíz:AUDITORIA-VS-BRIEF-2026-07.md`. En ramas sin mergear, con contenido que main no tiene: `origin/chore/auditoria-maestra` (`docs/baselines/2026-07-auditoria-maestra.md`) y `chore/auditoria-clean` (`docs/baselines/2026-07-auditoria-clean.md`). `origin/chore/auditoria-seguridad` no aporta nada: su único doc es el mismo blob que está en main.
- **Leído en F0:** `PROMPT.md`; `raíz:CLAUDE.md`; `AGENTS.md`, `README.md`, `DEPLOY.md`, `STATUS.md` (encabezados); `package.json`; `next.config.ts`, `tsconfig.json`, `netlify.toml`, `vercel.json`, `prisma.config.ts`, `knip.ts`, `.dependency-cruiser.cjs`, `instrumentation.ts`, `sentry.{server,edge}.config.ts`, `netlify/functions/*` (3), `raíz:.github/workflows/ci.yml` (cabecera y disparadores); índice de modelos y enums de `prisma/schema.prisma` (la lectura completa, 2.247 líneas, va en D6 — DEC-07); árbol de `src/app/` y `src/`; de `rediseno/home`, el índice de `docs/rediseno/DIRECCION-ESCENA.md` y la lista de los 80 ítems de su §7 (el archivo pesa 349.294 B y 2.328 líneas; §7 son las líneas 690–2.323, 272 KB; se lee completo en F3). No hay un índice de `docs/` (ni README ni index): se construye en F1 listando sus 239 archivos.

## 2. Decisiones de la corrida

### 2.1 Repo, git y publicación

- **[DECISIÓN] DEC-01 — Base.** `origin/main` @ `57c421bc`. No se hace `git fetch` (no está en §3): las refs son las del snapshot traído el 2026-10-13 16:23 (`FETCH_HEAD`), así que `origin/main` está al día; simplemente no se mueve desde el 2026-09-06.
- **[DECISIÓN] DEC-02 — Push.** La rama trackea `origin/main`. Sin `push.default` ni `remote.origin.push` configurados, la forma literal `git push -u origin auditoria/renovacion-2026-10` actualiza `refs/heads/auditoria/renovacion-2026-10` y mueve el upstream; nunca `git push` pelado antes de ese primer push. Después se verifica `git rev-parse --abbrev-ref @{u}` = `origin/auditoria/renovacion-2026-10`.
- **[DECISIÓN] DEC-03 — Rutas.** `docs/auditoria-2026-10/` y `scripts/auditoria/` se resuelven dentro de `logic-core-v3/` (donde vive el PROMPT). El CSV usa rutas relativas a la raíz del repo (salida de git). Los hallazgos usan rutas relativas a `logic-core-v3/` (`src/…:línea`), anteponen `raíz:` si el archivo está fuera de la app, y `rama:<rama>:<ruta>:<línea>` si se leyó de otra rama con `git show`.
- **[DECISIÓN] DEC-04 — Commits.** (a) `git add` archivo por archivo y `git diff --cached --stat` antes de cada commit. (b) Mensaje en ASCII sin acentos: es la preferencia registrada de Valentino (sesiones previas: la consola de Windows los rompe) y la práctica de septiembre; no está escrita en el repo. (c) **Todo mensaje termina en `[skip ci]`**: `raíz:.github/workflows/ci.yml:65` dispara con `on: [push, pull_request]` en cualquier rama, y si existe el secret `DATABASE_URL_TEST` corre `npx prisma migrate deploy` y suites contra esa base (`:162-170`, `:212-223`) — un push de la auditoría no puede terminar escribiendo en una base (§3). GitHub Actions omite los workflows de `push` con `[skip ci]` en el mensaje, y Netlify omite el build. Antes de cada push: `git log -1 --format=%B` lo confirma. (d) Autorrevisión §10 + `validar.mjs` (DEC-32) registradas en §14 antes de cada commit.
- **[DECISIÓN] DEC-34 — Publicación de F7.** Una auditoría previa verificó con `gh repo view` que el repo es **público** (`docs/baselines/2026-07-auditoria-seguridad.md:3359-3366`, S8-01, CONFIRMADO) y ya advirtió que publicar auditorías con `archivo:línea` de vulnerabilidades abiertas es un riesgo (`:3576`, S8-06). F0 se pushea porque este plan no agrega nada explotable que el repo no tenga ya. Durante F1–F6 los commits quedan locales (el PROMPT solo pide push en F0 y F7). **El push de F7 se hace solo si Valentino confirmó en la parada que el repo es privado o que acepta publicar** (§11 P4); si no, F7 deja todo commiteado local y lo dice en el mensaje final.

### 2.2 Comandos y herramientas

- **[DECISIÓN] DEC-05 — Sin build.** `npm run build` no se corre (PROMPT §3, OOM) aunque el protocolo de sprint de `CLAUDE.md` lo pida: esta corrida no es un sprint de código y el PROMPT es la instrucción específica.
- **[DECISIÓN] DEC-06 — dependency-cruiser local.** Ya es devDependency (`"dependency-cruiser": "^17.4.3"`) con `.dependency-cruiser.cjs`: se usa `.\node_modules\.bin\depcruise.cmd` (misma herramienta que `npx -y`, sin descarga). Corre **una vez en F1** (JSON del grafo de `src/`), porque D9 necesita los huérfanos y F5 el grafo por módulo; el `.cjs` del repo no se toca.
- **[DECISIÓN] DEC-07 — Schema y ERD por parseo directo.** El DMMF de runtime del cliente generado no trae `@map` de campos, `@@index` ni `onDelete` (sus campos: `name, kind, isList, isRequired, isUnique, isId, isReadOnly, hasDefaultValue, type, nativeType, default, isGenerated, isUpdatedAt`), y `@prisma/internals` no está instalado. Fuente primaria: parseo de `prisma/schema.prisma`; el DMMF solo como control de conteos (63 modelos, 62 enums). Nada agrega un bloque `generator` al schema.
- **[DECISIÓN] DEC-08 — Drift sin base.** `prisma migrate status` no puede conectarse (no hay `.env.local`; se corre una vez en F1 para registrar el error). El drift **schema ↔ migraciones** lo mide `scripts/auditoria/drift.mjs`: reproduce en orden las 86 migraciones (CREATE/ALTER/DROP de tablas, columnas, enums, índices y FKs; Postgres se lleva índices y FKs con la columna) y compara contra el schema parseado. Probado en F0 sobre el scratchpad: reconstruye 63 tablas / 62 enums / 136 índices / 80 FKs igual que el schema, deja 14 sentencias DML para leer a mano, y el control positivo (un campo sembrado en una copia del schema) aparece como `columna-falta-en-migraciones`. `prisma/migrations/__diff_check.sql` (0 bytes) se inventaría, no se trata como migración. Un ítem de drift pasa a hallazgo solo después de leer `migration.sql:línea` y `schema.prisma:línea`. Límite: compara schema contra migraciones, **no** la base contra las migraciones (eso solo lo dice `migrate status` → `08`). Timebox 60 min (DEC-27).
- **[DECISIÓN] DEC-15 — knip.** Está instalado (`knip ^6.16.1`, `knip.ts`) pero no figura en §3 y carga configs del proyecto. **Por defecto NO se usa**; solo con un «sí» explícito en la parada (§11 P3). Sin él: huérfanos de depcruise + `git grep` con control positivo.
- **[DECISIÓN] DEC-17 — Mecánica de F1.** Tabla de comandos en §7.1. Reglas: exit ≠ 0 con salida válida = OK, no se reintenta (tsc, eslint, `npm outdated`, `npm audit` y `npm ls` salen ≠ 0 cuando encuentran problemas). `tsc` va con `--incremental false`: `tsconfig.json` tiene `"incremental": true` y sin eso `tsc --noEmit` escribe `tsconfig.tsbuildinfo` fuera de las dos carpetas permitidas (está ignorado en `.gitignore:53`, pero es una escritura). Si `tsc` o eslint mueren por memoria, ese baseline queda «no disponible», sin reintento. La salida se redirige con `--output-file` o `cmd /c "… > archivo"` (bytes fieles; `>` de PowerShell 5.1 re-codifica), y todo script que lea JSON tolera BOM. Regla de 300 KB por archivo de `_crudo/`: lo que pasa no se commitea, se resume y se anota como local. Antes de cada comando pesado: `Get-Process node` (puede haber dev servers de otros worktrees; no se tocan).
- **[DECISIÓN] DEC-18 — eslint sin código fuente.** El formateador JSON de ESLint copia el código fuente de cada archivo con problemas (`result.source`), lo que podría copiar un literal sensible a `docs/` (§2). Se corre a `_crudo/eslint.raw.json` con `--ignore-pattern "scripts/auditoria/**" --ignore-pattern "docs/auditoria-2026-10/**"`, sin `--cache`; un script quita `source`/`output`, escribe `_crudo/eslint.json` + resumen por regla, y borra el raw, que nunca se commitea.

### 2.3 Ledger y ciclo

- **[DECISIÓN] DEC-09 — Clasificación del ledger** (`scripts/auditoria/cobertura.mjs`, re-ejecutable; conserva `estado`, `ciclo` y notas manuales):
  - *profundo* = todo lo interno de §4: auth, `(protected)/`, API, server actions, `src/lib/` interno, `src/modules/`, schema, migraciones, seeds principales, integraciones, configuración.
  - *superficial* = sitio público, docs, tests (`*.invariant.ts`, `__tests__/`, `*.spec.ts`, `tests/**`), scripts operativos que no escriben en la base, volcados de catálogo de `prisma/backups/`.
  - *fuera* = binarios y assets, `package-lock.json`, salidas generadas commiteadas (`ts_errors.log`, `.eslint_output.txt`, logs de bench…), `_tmp_*.html`, `prisma/migrations/__diff_check.sql` (vacío) y la skill vendorizada `.github/skills/impeccable/` (143).
  - *Marcas por contenido* (de los blobs de la ref): `toca-db`, `escribe-db`, `server-action`, `route-handler`, `usa-auth` (solo import directo de `@/auth`), `guard-indirecto` (`requireSuperAdmin`, `resolveOrgId`, `CRON_SECRET`…), `client-component`. **Ninguna marca sirve de filtro para el barrido SEC**: ese barrido recorre todas las entradas.
  - *Promociones*: (1) un archivo de `src/` superficial que toca DB, sesión o servidor pasa a profundo (0 casos; las evals están exceptuadas de esta regla); (2) **todo script, seed o eval que escribe en la base pasa a profundo** — 28 casos (25 de `scripts/` y `prisma/`, 2 evals, `tests/helpers/setter-db.ts`), con criterios fijos: credenciales literales, destino prod, guard de entorno, borrados o updates sin scoping por tenant; (3) un archivo público que el código interno importa **directamente** (alias o ruta relativa) pasa a **D9 profundo** — 17 casos. No es transitivo a propósito: `src/app/layout.tsx:113-124` monta `Navbar`, `Shutter` y el preloader dentro de `PublicOnlyComponents`, que devuelve `null` en los portales (`PublicOnlyComponents.tsx:20-22`; `publicRoute.ts:16` `PORTAL_PREFIXES`); en cambio `PreloaderProvider`, `SmoothScroll` y `TransitionProvider` envuelven todas las rutas (`layout.tsx:110-121`; `SmoothScroll` apaga Lenis en `/admin` y `/dashboard`, `SmoothScroll.tsx:30`). Cuatro de los 17 solo los importa `components/ui/` (la intro de marketing) y la nota lo dice.
  - *Reclasificaciones puntuales* (crítica del ledger en F0, cada una con su importador verificado): `lib/preview.ts` → D2 (es el `resolveOrgId` del portal, 34 importadores de D2); `sections/home/Footer.tsx` → D7 (manda leads a un webhook n8n desde el navegador, `Footer.tsx:81-88`); `prisma/seeds/sync-{plans,premium-modules}.ts` → D6 profundo (se corren contra prod y fijan el catálogo que la app lee); `lib/onboarding/core.ts` → D5 (único llamador: `admin/chatbots/new/actions.ts`); cinco server actions de `modules/chatbot/server/admin/` (`hardDeleteClient`, `archiveClient`, `updateClient`, `updateClientInternalNotes`, `manageAlerts`) → D3; `lib/health-score.ts`, `lib/actions/{messages,announcements}.ts` → D2; `lib/client-notifications/` → D5 (lo dispara `captureLead`); `lib/ai/{results-insights,review-reply-draft}.ts` → D5 (Anthropic directo, modelo fijo); `layout/publicRoute.ts` → D9 y `layout/useChromeRevealed.ts` → D5 (deciden dónde y cuándo aparece el widget); `admin/fg2-lab/` → D4 (experimento LeadOS de Franco, ZONA-FRANCO inferida); `lib/modules/demand.ts`, `lib/premium-features.ts` y `app/contact/page.tsx` → D3; `lib/whatsapp.ts` y `hooks/useThemeObserver.tsx` → público.
  - *Controles positivos*: `route-handler` 36/36 `route.ts`; `server-action` 92/92 archivos con `'use server'` en `src/`; 2.212 filas = `git ls-tree -r origin/main`; 0 sin clasificar.
- **[DECISIÓN] DEC-21 — Ledger y crudo por ciclo.** (a) `cobertura.mjs` gana `--marcar <estado> --ciclo <Dx-cN> --lista <archivo>`. (b) La salida cruda de cada workflow (candidatos, entradas, flujos, `archivos_leidos` con rangos) se guarda en `docs/auditoria-2026-10/_crudo/ciclos/<Dx>-c<N>-<lote>.json`, nunca solo en el contexto ni en el scratchpad. (c) Orden fijo por ciclo: verificar → escribir 02/03/08 → marcar `leído` solo los archivos con rango completo (contra el conteo real de líneas) → log y estado → §10 + `validar.mjs` → commit. (d) Un archivo leído completo en cualquier lote se marca con el ciclo de ese lote. (e) Al retomar, los `.json` sin procesar son la cola.
- **[DECISIÓN] DEC-22 — Pase superficial.** DOC y PUB: inventario por script en F1 (conteos, títulos, fechas) → estado `superficial`. Tests, evals, seeds y scripts de cada dominio: en su ciclo 1, se mapea qué flujo cubre cada uno → `superficial`. Las filas superficiales arrancan `pendiente`; `superficial` es su estado final. Regla de cierre de dominio, textual de §7: *cobertura del dominio = 100 % de su alcance en `_cobertura.csv` **y** un ciclo completo sin hallazgos nuevos de severidad MEDIA o más*; se mide con el resumen de `cobertura.mjs` (`leído/profundo` y `superficial-hecho/superficial`).

### 2.4 Zonas

- **[DECISIÓN] DEC-10 — FROZEN inferido, con criterio determinista.** El PROMPT no lista «utilidades core de `src/lib/`» ni «primitivas de animación compartidas». Criterio, medido sobre `origin/main`: (a) archivo de primer nivel de `src/lib/` importado (sin contar tests) desde **3 dominios o más**; (b) primitiva de animación o interacción importada desde **2 dominios o más**. Resultado (14, nota `FROZEN-inferido` en el CSV): `src/lib/{utils,action-utils,use-is-client,auth-guards,audit-log,logger,alerts,tz-ar,dates-ar,design-tokens,use-reduced-motion,hover,motion-variants,chromeReveal}.ts`. Toda propuesta sobre ellos va como decisión para Valentino. Evidencia a considerar: la tabla «Frozen files» de `raíz:CLAUDE.md` solo congela 4 archivos, y `rediseno/home` modifica `src/lib/utils.ts` (+100/−1 líneas). Corregible en la parada (§11 P2).
- **[DECISIÓN] DEC-11 — Doble etiqueta y bloques del schema.** `src/auth.ts` es FROZEN y ZONA-FRANCO: campo Zona = `FROZEN + ZONA-FRANCO`, va a `09-PARA-FRANCO.md` y su propuesta es decisión. Si la evidencia cae dentro de los bloques `OsLead*`, `OsLeadSetterMeta` o `enum ActivityChannel` de `schema.prisma`, el hallazgo lleva la misma doble marca. `admin/fg2-lab/` se trata como ZONA-FRANCO (inferida: lo escribió Franco y vive de `src/lib/leados/`).

### 2.5 Evidencia y formato

- **[DECISIÓN] DEC-12 — Auditorías previas como insumo.** Un paso de F1 (agente `Explore`) arma `_crudo/previas.json`: por cada hallazgo CRÍTICA/ALTA/P0/P1 de los documentos de §1, `doc:línea`, ID, severidad, estado declarado y archivos citados. Se reparte por lote según las rutas citadas: cada lector recibe solo lo que toca a sus archivos y lo re-verifica contra el código actual (abierto / cerrado / no reproducible), citando el doc previo y la evidencia de hoy. No se copia nada sin re-verificar.
- **[DECISIÓN] DEC-20 — Pruebas de ausencia con `git grep`.** El Grep de la herramienta (ripgrep) respeta `.gitignore` y no ve archivos versionados que matchean un patrón ignorado: `git ls-files -i -c --exclude-standard` lista 8 (`.claude/*` ×3, `docs/audit/2026-04-dashboard-cleanup-audit.md`, los 4 de `prisma/backups/`). Toda afirmación «no existe X» y todo barrido de cruce se hace con `git grep <patrón> origin/main -- <rutas>` o con rutas explícitas, y lleva control positivo. Los lectores devuelven un campo `ausencias` (afirmación, comando, patrón, alcance, control positivo).
- **[DECISIÓN] DEC-23 — Rúbrica de severidad y confianza** (se pega a todos los agentes; el padre recalibra al escribir):
  - **CRÍTICA**: explotable hoy por un anónimo o por un usuario de cliente sin precondiciones fuertes — lectura o escritura entre tenants, bypass de auth o de rol, escalada a SUPER_ADMIN, secret activo expuesto, operación destructiva o con costo (LLM, emails) sin auth; o pérdida de datos de clientes.
  - **ALTA**: lo mismo con precondiciones fuertes (cuenta interna, carrera, configuración puntual); bug que rompe un flujo principal del cliente o bloquea L3 en su camino; corrupción de datos; integración crítica que no corre (p. ej. un cron sin disparador).
  - **MEDIA**: impacto acotado o con workaround; validación faltante sin explotación directa; estados vacío/error/carga faltantes en el camino del cliente; deuda que encarece cambios.
  - **BAJA**: higiene, consistencia, docs viejos, deuda menor.
  - **Confianza**: `VERIFICADO-POR-LECTURA` = el padre leyó las líneas citadas y el flujo cierra por lectura; `PROBABLE` = flujo trazado con un eslabón inferido (librería, runtime, datos); `HIPÓTESIS` = sin traza completa.
- **[DECISIÓN] DEC-24 — IDs y ubicación.** IDs `PREFIJO-NNN` globales por prefijo, nunca reutilizados; un retirado queda con «retirado: motivo». Próximo ID = máximo existente + 1 (grep sobre `docs/auditoria-2026-10`). Tipo → prefijo: seguridad→SEC, bug→BUG, tech-vieja→TEC, perf→PERF, deuda→DEU, a11y→A11Y, ux→UX, faltante→FAL; DIS en 04, IDEA en 05 (§5.1 + los campos propios de F3/F4). FAL va a 02 bajo su herramienta; el resto a 03 por sección (Seguridad · Bugs latentes · Tecnología vieja · Rendimiento · Deuda · Calidad · Observabilidad · Accesibilidad; calidad y observabilidad usan BUG/DEU). ZONA-FRANCO: sección final propia en 02 y 03, más 09. `REQUIERE-VERIFICACIÓN-HUMANA` no es una confianza: es una marca aparte en el hallazgo con link a su `VH-NNN` de 08.
- **[DECISIÓN] DEC-25 — Herramientas y niveles.** La lista cerrada de herramientas de §6 es la unidad de `02-PENDIENTE.md` y de los módulos del Atlas. Un nivel **L2 o más afirma que algo funciona**: exige el camino feliz trazado con `ruta:línea` de punta a punta; si no, queda `L? — REQUIERE-VERIFICACIÓN-HUMANA` con su `VH-NNN`. Rúbrica de los nueve criterios L3: (1) permisos y tenant = toda lectura/escritura filtra por la org de la sesión (tabla de entradas); (2) vacíos = rama explícita para colección vacía con mensaje útil; (3) errores = `error.tsx` o catch con mensaje útil, sin stack, y la UI muestra el error de la action; (4) carga = `loading.tsx`, `Suspense`, skeleton o spinner; (5) validación en servidor = Zod (o equivalente) en cada action/route de la herramienta; (6) mobile por lectura = sin anchos fijos sin overflow, tablas con `overflow-x`, navegación colapsable, targets táctiles; (7) Sentry = el error llega (`error.tsx`/`global-error` con `captureException`, o catch con `captureException` + `flush` en handlers); (8) sin datos de mentira ni TODO/FIXME en el camino del cliente; (9) autonomía = el cliente termina la tarea sin develOP (sin «escribinos para…» ni pasos manuales en la base).
- **[DECISIÓN] DEC-28 — `router.push`.** El PROMPT dice «nunca `router.push` directo»; `raíz:CLAUDE.md:12-20` lo permite en portales cuando la navegación es imperativa post-submit y lleva un comentario inline. Se listan todos los usos (`git grep 'router.push('`: 14 en 11 archivos de `src/app/(protected)`, 23 en 19 archivos de `src/`). En portal con justificación inline → DEU BAJA citando las dos reglas; en portal sin justificación → DEU MEDIA; en el sitio público → MEDIA.
- **[DECISIÓN] DEC-29 — De dónde salen los números.** Costos: con las constantes del repo (`src/modules/chatbot/server/pricing/`, `src/lib/tokens-estimate.ts`, `plan.llmModel`), citando `ruta:línea` y mostrando la aritmética; que precios y cuotas sigan vigentes → `08`. WebSearch/WebFetch solo en D8, solo versiones, deprecaciones y guías de migración, citando la URL. Bundle: estimación estática (fronteras `'use client'` e imports pesados por ruta interna, vía depcruise, más tamaños en `node_modules`) con confianza PROBABLE y un `VH` para medirlo con build + analyzer en una máquina con RAM.
- **[DECISIÓN] DEC-30 — Plantilla de `08`.** `VH-NNN`: hallazgo(s) que verifica · entorno (local con base propia / preview / prod solo lectura) · precondiciones (cuenta, rol, datos) · pasos numerados · resultado esperado · señal de falla · **¿escribe en la base o manda emails?** (si sí: advertencia + alternativa local).
- **[DECISIÓN] DEC-32 — `validar.mjs`.** Script re-ejecutable que se corre antes de cada commit y queda en §14: cada `### [ID]` tiene los campos de §5.1; la evidencia trae `ruta:línea`, el archivo existe en `origin/main` (o lleva prefijo `rama:`) y la línea no pasa su largo; IDs únicos; `Relacionado` y «Hallazgos que cierra» apuntan a IDs existentes; severidades coherentes entre 03, RESUMEN y 07; la zona del hallazgo coincide con la marca del ledger; 0 coincidencias de los patrones de secrets (incluidos los genéricos) en `docs/auditoria-2026-10`; niveles L de 02 = los de `06-ATLAS/modulos/`.

### 2.6 Subagentes

- **[DECISIÓN] DEC-19 — Preámbulo fijo** (antes de §2, §3 y §5.1 textuales del PROMPT): *«Sos de SOLO LECTURA: no creás, editás ni borrás ningún archivo, tampoco en `docs/` ni en `scripts/auditoria/`. Git solo de lectura. No corrés `tsc`, eslint, `npm`, `npx`, `prisma`, depcruise, knip ni scripts de node: el padre ya corrió los baselines. Las pruebas de ausencia y los barridos van con `git grep` sobre `origin/main`. WebSearch solo si sos de D8, solo versiones/deprecaciones, citando la URL. Nunca copiás el valor de un secret. Tu salida es datos para el padre.»* Antes y después de cada workflow: foto de `git status --porcelain` + listado recursivo con fechas de `docs/auditoria-2026-10` y `scripts/auditoria`; si cambió algo que no escribió el padre, se revierte y se anota.
- **[DECISIÓN] DEC-26 — Ciclos 2 a 4.** Un cazador de huecos por tramo de ≤ 16k LOC (D5 3, D2 2, D3 2, D4 2, resto 1 → 14 por ciclo), cada uno con la lista de títulos ya existentes y una lente: ciclo 2 = seguridad/aislamiento + máquinas de estado; ciclo 3 = errores, carreras, límites de plan, mobile; ciclo 4 = lo que quede. Se registra qué lente cubrió qué tramo.
- **[DECISIÓN] DEC-27 — Reintentos y timebox.** Máximo 3 lanzamientos por lote; si falla las 3, se parte en dos; si sigue fallando, sus archivos quedan `pendiente` con nota y `[TIMEBOX]`. «Paso» = un lote, un workflow o un script, con timebox de 60 min. `[DOMINIO-ABIERTO]` al cuarto ciclo, con lo que quedó sin agotar.
- **[DECISIÓN] DEC-31 — Refutadas.** Toda CRÍTICA o ALTA que el verificador refute la lee el padre (líneas citadas + motivo) antes de descartarla. El log registra cuántas se refutaron por lote.

### 2.7 Secrets

- **[DECISIÓN] DEC-14 — Barrido de credenciales** (`scripts/auditoria/secrets-historial.mjs`, salida sin valores en `_crudo/secrets-historial.json`): recorre **todo el historial** de todas las refs (1.752 commits, ~185 MB de parches) — líneas agregadas con 22 patrones (formatos de proveedor: Anthropic, Google, Brevo, Resend, GitHub, AWS, Sentry, Neon, Google OAuth, Telegram, Meta, cal.com, Netlify, JWT, PEM, URLs de Postgres con credencial; genéricos: asignaciones a `*KEY/SECRET/TOKEN/PASSWORD`, contraseñas literales, `bcrypt.hash` de un literal, «email / contraseña», UUID asignado a una clave) — y archivos con nombre sensible agregados alguna vez. Cada patrón tiene **control positivo** (muestra sintética, 22/22 OK); el árbol de main se barrió aparte con los mismos patrones, imprimiendo solo `archivo:línea:tipo`. Qué NO cubre: credenciales sin formato reconocible ni nombre de variable sugestivo (por eso la lectura de los dominios sigue mirando). Resultado triado (valores nunca copiados) → §11 P1: 1 archivo sensible en el historial (`logic-core-v3/enviroment.env`) y 4 credenciales en archivos de main; el resto son fixtures de tests (`*.invariant.ts`), literales concatenados con `Date.now()` (`scripts/_b14-2-seed-bench-prod.ts:113`, `scripts/seed-matsu.ts:81`), fixtures del smoke de scrub (`scripts/_b14-5-scrub-smoke.mjs`) o falsos positivos (`clave:` como clave de registro en `scripts/v1-qa-wizard-states.ts`; texto en `docs/baselines/2026-07-auditoria-seguridad.md:974,3424`).
- **[DECISIÓN] DEC-33 — Secret nuevo durante la corrida.** Todo secret que aparezca después de `Aceptar` y no sea demostrablemente inactivo (placeholder, localhost, fixture de test, salado con timestamp, o ya reportado en P1) dispara §9 tal cual: se registra sin valor, se commitea y se frena.

### 2.8 v3 y otras ramas

- **[DECISIÓN] DEC-13 — v3 y `rediseno/home`.** `src/app/v3/` tiene 0 archivos en `origin/main`; vive en `rediseno/home` (883 archivos). Su inventario superficial va al mapa de ramas y es fuente de F3; no entra al ledger de main. `rediseno/home` (563 commits adelante, 0 atrás) **modifica archivos compartidos que envuelven las pantallas internas** (`git diff --numstat origin/main...origin/rediseno/home`: `src/app/layout.tsx` +49/−16, `src/app/globals.css` +220/−69, `src/lib/utils.ts` +100/−1, `next.config.ts` +28/−0, `package.json` +223/−1, `src/instrumentation-client.ts` +37/−7, `tsconfig.json` +27/−1) y **agrega route handlers** (`src/app/api/contacto/route.ts`, `src/app/api/newsletter/route.ts`): se auditan como pre-merge (protocolo SEC incluido) y van a `06-ATLAS/ramas.md` y a F3. Ramas en general: `ramas.mjs` da, por rama, ahead/behind, último commit propio y autor, archivos que solo existen ahí y `git diff --name-status origin/main...<rama>` clasificado con las reglas del ledger; lo que sería profundo se lee por diff. Estado: mergeada = sin commits propios; viva = commit propio en los últimos 30 días o worktree activo; dormida = 30–60 días; abandonada = más de 60. Se reporta el par local/remoto cuando difiere. `C:/rediseno-home` tiene trabajo sin commitear: `git show` lee solo lo commiteado y `04` lo aclara.

## 3. Dominios, alcance y conteos

Fuente: `_cobertura.csv` (`node scripts/auditoria/cobertura.mjs` sobre `origin/main`, 2.212 archivos). LOC = líneas reales (saltos de línea + 1 si el archivo no termina en salto).

| Dominio | Profundo (archivos · LOC) | Superficial | Fuera | Qué incluye |
|---|---|---|---|---|
| D1 Auth cliente + admin | 33 · 3.909 | 1 | 0 | `src/auth.ts` (FROZEN + ZONA-FRANCO), `auth.config.ts`, `proxy.ts`, login/forgot/reset/cambiar-password/accept-invite, `api/qa/login` (ZONA-FRANCO), rate-limit, impersonación |
| D2 Dashboard cliente | 219 · 25.405 | 13 | 0 | `(protected)/dashboard/**` salvo chatbot, `components/dashboard/`, `lib/{dashboard,modules,plan,reports,…}`, `preview.ts`, `bienvenida/`, `dashboard-actions.ts` (FROZEN) |
| D3 Admin | 221 · 29.952 | 0 | 0 | `(protected)/admin/**` salvo chatbots/leados/leads-actions/fg2-lab; `api/admin/**`; actions de admin; altas/bajas de clientes |
| D4 Setter (ZONA-FRANCO) | 171 · 27.867 | 34 | 0 | `setter/**`, `lib/leados/**`, `admin/leados/**`, `admin/leads/_actions/**`, `admin/fg2-lab/**` + 4 libres (`os-commercial`, `leados-ui`, `follow-up`, cron `os-follow-up`) |
| D5 Chatbot e IA | 372 · 42.821 | 52 | 0 | `src/modules/chatbot/**`, motor WhatsApp, `api/chatbot/**`, `admin/chatbots/**`, `dashboard/chatbot/**`, `embed/`, `public/widget.js`, IA fuera del módulo (`lib/ai/results-insights`, `review-reply-draft`), aviso de leads |
| D6 Datos | 104 · 10.802 | 7 | 0 | `schema.prisma` (63 modelos, 62 enums; FROZEN), 86 migraciones, `lib/isolation/`, `lib/prisma.ts` (FROZEN), seeds que escriben |
| D7 Integraciones | 59 · 6.849 | 4 | 0 | Brevo/Resend, Sentry, Search Console/GA4, GBP, Tiendanube, cal.com, Telegram, n8n (incluido el webhook del footer), crons (`api/cron/**` salvo `os-follow-up`, `netlify/functions/`, `vercel.json`) |
| D8 Plataforma | 20 · 2.787 | 7 | 1 | `package.json`, configs, CI (`raíz:.github/workflows/`), layout y errores raíz, `globals.css`, `netlify.toml` |
| D9 Transversal | 99 · 12.246 | 169 | 27 | `components/ui/` (FROZEN, 43), utilidades y hooks, 17 compartidos público↔interno, 25 scripts que escriben en la base; tests y resto de scripts (superficial) |
| PUB Sitio público | 0 | 138 | 0 | inventario + Atlas |
| DOC Documentación | 0 | 266 | 0 | incluye 8 transcripts de evals (revisar PII) + 2 README |
| — Fuera | 0 | 0 | 195 | binarios, assets, skill vendorizada, vacíos |
| **Total** | **1.298 · 162.638** | **691** | **223** | 2.212 |

**Superficie del protocolo SEC** (todas se revisan, tengan o no marca): **92 archivos con server actions** (D1 9 · D2 17 · D3 29 · D4 15 · D5 21 · D7 1; ≈ 200 funciones exportadas) y **36 route handlers** (D1 2 · D2 3 · D3 4 · D4 1 · D5 9 · D7 16 · D8 1). Para `06-ATLAS/rutas.md`: 86 `page.tsx` (79 internas), 17 `layout.tsx` (donde viven los guards heredados), 54 `loading.tsx`, 24 `error.tsx`, 2 `not-found.tsx`.

## 4. Orden de ataque y por qué

**F1 → D1 → D6 → D2 → D5 → D3 → D7 → D4 → D8 → D9 → F3 → F4 → F5 → F6 → F7.**

1. **D1 primero.** Es chico (33 archivos) y es la raíz de todo: de ahí salen la sesión, el rol y el `organizationId` que consumen las 92 server actions y los 36 handlers. Fija la vara del protocolo SEC. Lee además las libs compartidas que todos importan (`lib/actions/schemas.ts`, `lib/audit-log.ts`).
2. **D6 segundo.** Schema, frontera de aislamiento (`src/lib/isolation`: `forOrg` / `unsafeGlobalQuery`), drift y los 28 escritores de la base: el mapa que D2 y D5 necesitan para trazar hasta la DB.
3. **D2 tercero.** Mayor impacto directo en un cliente real: IDOR y lecturas cruzadas entre tenants en el portal.
4. **D5 cuarto.** El más grande (42,8k LOC) y el de superficie pública (API del widget, `public/widget.js`, embed), costo por conversación y prompt injection.
5. **D3 quinto.** Solo SUPER_ADMIN: menos exposición, mucho «qué falta».
6. **D7 sexto.** Crons, Brevo/Resend, Sentry, OAuth, webhooks: casi todo ya visto desde los consumidores.
7. **D4 séptimo.** ZONA-FRANCO, solo lectura: aprovecha el mapa de D1/D6/D3 y produce `09-PARA-FRANCO.md`.
8. **D8 octavo.** Usa el baseline de F1 y la verificación de versiones por WebSearch.
9. **D9 último.** Barridos transversales sobre todo lo leído.

## 5. Estrategia de subagentes

- **Workflows de a uno** (ultracode ON) con un **semáforo global de 3 agentes simultáneos** dentro de cada script (PROMPT §6 F2). Nunca dos workflows en paralelo. Preámbulo y fotos: DEC-19.
- **Ciclo 1 — lectores.** `scripts/auditoria/lotes.mjs` parte los archivos profundos `pendiente` de cada dominio en **lotes de ≤ 6.500 LOC**, en orden de ruta, sin partir una carpeta de flujo y fundiendo vecinos que entran juntos. Prueba de F0: **34 lotes** (D1 1 · D2 5 · D3 6 · D4 6 · D5 9 · D6 2 · D7 1 · D8 1 · D9 3). Cada lote va a un agente `general-purpose` con el preámbulo, §2/§3/§5.1 textuales, la rúbrica DEC-23, el foco del dominio (tabla de F2), los hallazgos previos de sus archivos (DEC-12) y un esquema de salida: `archivos_leidos` (con rangos), `entradas` (cada page, layout, server action y handler: auth, rol, de dónde sale la org, Zod, rate limit, con `ruta:línea`), `flujos`, `hallazgos` (§5.1), `criterios_L3` por herramienta de §6, `casos_prueba_manual`, `ausencias` (DEC-20), `patrones_a_cruzar`, `previas_reverificadas`. Puede leer cualquier archivo para trazar; responde por su lote.
- **Ciclo 1 — verificador adversarial por lote** (pipeline: arranca apenas termina su lector). Recibe los hallazgos ≥ MEDIA y trata de refutarlos leyendo las líneas citadas y su contexto (guards en layout o proxy, validación aguas arriba, código muerto); por defecto refuta si no puede verificar. DEC-31 para las CRÍTICA/ALTA refutadas.
- **Verificación del padre (obligatoria).** Leo yo las líneas citadas de cada hallazgo que sobrevive; solo así queda `VERIFICADO-POR-LECTURA`. Lo que no reproduzco se descarta o baja a `HIPÓTESIS`.
- **Cruce.** Cada patrón defectuoso se busca en todo el repo con `git grep` (DEC-20); si es semántico, con un agente de barrido sobre la lista exacta de archivos (p. ej. las 92 server actions).
- **Ciclos 2–4.** DEC-26. **Inventario mecánico**: scripts propios primero; `Explore` para lo que no se resuelve por script. **F6 ciega**: §7.6.

## 6. Herramientas (lista cerrada para `02` y para los módulos del Atlas)

El «cliente» de las herramientas es `ORG_MEMBER`: el proxy solo deja entrar a `/dashboard` a ese rol o a SUPER_ADMIN impersonando (`src/proxy.ts:154`), y `resolveOrgId` devuelve `null` para cualquier otro rol (`src/lib/preview.ts:6-20`), `CLIENT` y `SETTER` incluidos.

| Grupo | Herramientas (id · rutas) |
|---|---|
| **H1 Acceso** (D1) | `auth-login` /login (contraseña, magic link por Brevo, Google; una pantalla para todos los roles) · `auth-recupero` /forgot-password, /reset-password · `auth-cambio` /cambiar-password (lo fuerza el proxy) · `auth-invite` /accept-invite (posible flujo huérfano) · `auth-impersonacion` «ver como cliente» desde /admin/clients/[clientId] |
| **H2 Portal del cliente** (D2) | `cli-bienvenida` /bienvenida · `cli-shell` sidebar, notificaciones, novedades, banners · `cli-inicio` /dashboard · `cli-proyecto` /dashboard/project · `cli-resultados` /dashboard/resultados/{trafico,seo,reputacion,analisis} · `cli-servicios` /dashboard/services · `cli-mensajes` /dashboard/messages · `cli-soporte` /dashboard/soporte · `cli-plan` /dashboard/plan · `cli-referidos` /dashboard/referidos · `cli-cuenta` /dashboard/cuenta/{perfil,facturacion,boveda} · `cli-reportes-email` preferencias + desuscripción · módulos premium: `cli-resenas`, `cli-email-mkt`, `cli-tienda`, `cli-agenda` (/dashboard/modules/*) |
| **H3 Chatbot centralizado** (D5) | `cli-chatbot` /dashboard/chatbot/* · `adm-chatbots` /admin/chatbots/* · `adm-actividad` /admin/chatbot/activity · `adm-health` /admin/chatbot/health · `vis-widget-cliente` widget.js + /embed/[slug] · `vis-api-chatbot` /api/chatbot/[slug]/{config,chat,health} · `vis-widget-develop` el bot de develOP en el sitio público · `vis-whatsapp` /api/motor/webhook/[channelToken] |
| **H4 Panel de admin** (D3) | `adm-shell` (guard SUPER_ADMIN en `admin/layout.tsx`) · `adm-dashboard` /admin · `adm-clientes` /admin/clients/* (alta con wizard, ficha, edición, archivar/borrar, credenciales, reporte) · `adm-proyectos` /admin/projects/* · `adm-equipo` /admin/team · `adm-leads` /admin/leads/* (UI libre, actions ZONA-FRANCO) · `adm-tickets` · `adm-mensajes` · `adm-novedades` · `adm-referidos` · `adm-alertas` · `adm-config` /admin/settings/* · `adm-audit` /admin/audit-log |
| **H5 Setter y LeadOS** (D4, ZONA-FRANCO) | `set-dia` /setter · `set-nuevo` /setter/nuevo · `set-importar` /setter/nuevo/importar · `set-lead` /setter/leads/[leadId] · `set-manual` /setter/leads/[leadId]/manual/* · `adm-revision-demos` /admin/leados/* · `adm-fg2lab` /admin/fg2-lab (experimento) |
| **H6 Entradas públicas que alimentan lo interno** | `vis-contacto` /contact (+ `?ref=`) y el form del footer (webhook n8n) · `vis-optout` /api/email/optout/[contactId] |

Módulos del Atlas = estos grupos y herramientas + las libs transversales (isolation, auth-guards, rate-limit, email, sentry, plan, crypto).

## 7. Sub-planes por fase

### 7.1 F1 — baseline, inventario, ramas

| Paso | Comando (PowerShell, desde `logic-core-v3`) | Salida en `_crudo/` |
|---|---|---|
| F1.1 tsc | `cmd /c ".\node_modules\.bin\tsc.cmd --noEmit --incremental false > docs\auditoria-2026-10\_crudo\tsc.txt 2>&1"` | `tsc.txt` |
| F1.2 eslint | `.\node_modules\.bin\eslint.cmd . --format json --output-file docs\auditoria-2026-10\_crudo\eslint.raw.json --ignore-pattern "scripts/auditoria/**" --ignore-pattern "docs/auditoria-2026-10/**"` → `node scripts/auditoria/eslint-resumen.mjs` (DEC-18) | `eslint.json`, `eslint-resumen.md` |
| F1.3 outdated | `cmd /c "npm outdated --json > docs\auditoria-2026-10\_crudo\npm-outdated.json"` | `npm-outdated.json` |
| F1.4 ls | `cmd /c "npm ls --depth=0 > docs\auditoria-2026-10\_crudo\npm-ls.txt 2>&1"` | `npm-ls.txt` |
| F1.5 audit | `cmd /c "npm audit --json > docs\auditoria-2026-10\_crudo\npm-audit.json"` | `npm-audit.json` |
| F1.6 migrate status | `cmd /c "npx prisma migrate status > docs\auditoria-2026-10\_crudo\prisma-migrate-status.txt 2>&1"` (se espera el error de `DATABASE_URL`) | `prisma-migrate-status.txt` |
| F1.7 depcruise | `cmd /c ".\node_modules\.bin\depcruise.cmd src --config .dependency-cruiser.cjs --output-type json > docs\auditoria-2026-10\_crudo\depcruise.json"` | `depcruise.json` (probablemente > 300 KB → local + resumen) |
| F1.8 ramas | `node scripts/auditoria/ramas.mjs --hoy 2026-10-13` | `ramas.json` |
| F1.9 previas | agente `Explore` (DEC-12) | `previas.json` |
| F1.10 docs/PUB | script de inventario + `cobertura.mjs --marcar superficial` | `inventario-docs.json` |

Uno por vez; errores conocidos a ignorar (se anotan, no son hallazgo): `@googleapis/webmasters` faltante · `react-hooks/set-state-in-effect` en `PreloaderContext` · `searchconsole.ts:119`. Después: `01-INVENTARIO.md` (módulos, rutas, 63 modelos, integraciones, ramas, scripts, tests, docs, índice de auditorías previas).

### 7.2 F2 — por ciclo
Lotes del dominio → workflow (lectores + verificadores, tope 3) → crudo a `_crudo/ciclos/` → verificación del padre → 02/03/08 → cruces con `git grep` → marcar ledger → log + estado por dominio → §10 + `validar.mjs` → commit (DEC-21). Plantilla de línea de log: `Dx-cN · lotes … · leídos N/M (_crudo/ciclos/…) · refutados R · nuevos C/A/M/B · cobertura x % · sigue …`.

### 7.3 F3 — Diseño (`04-DISENO.md`)
Fuentes (de `rediseno/home` con `git show`): `src/app/theme-develop.css` (91.580 B), `src/app/v3/_lib/motion/` (31 archivos), `src/app/v3/_secciones/` (159 archivos, ~29,6k líneas: por extracción de patrones, no línea a línea), `docs/rediseno/DIRECCION-ESCENA.md` (§7 completo, por un agente con foco en tokens, tipografía, color, foco, acentos, motion y a11y). De main: `src/components/design-system/` (13; `index.ts:9` dice que ninguna pantalla lo consume todavía) y `src/app/styleguide/` (10), candidatos naturales para la ruta «sin tocar `ui/*`»; `raíz:DESIGN.md`, `docs/design-system.md`, `docs/design-system-audit.md`, `docs/admin-design-system-audit.md`, `docs/diagnostico-visual-admin-2026-08/`. Censo del destino con un script (`censo-diseno.mjs`): por cada una de las 79 páginas internas y sus componentes, literales hex/rgb/hsl/oklch, valores arbitrarios de Tailwind (`[#…]`), clases de paleta, `font-family`, radios y sombras, con control positivo. Productos: tabla de transferencia (se lleva / se adapta / no se lleva), ruta sin tocar `ui/*`, decisiones abiertas como preguntas con trade-off (sin dark mode, CTA tinta, papel/tinta: no se asumen), priorización impacto/esfuerzo por pantalla. Resolver la contradicción de colores por servicio (§10 #12) contra `globals.css`.

### 7.4 F4 — Ideas (`05-IDEAS.md`)
10 a 15 ideas con la plantilla del PROMPT (problema PyME, qué ya existe con `ruta:línea`, qué falta, esfuerzo, costo contra free tiers según DEC-29, riesgo, zona). Ranking = impacto × factibilidad ÷ costo (cada factor 1–5, la cuenta escrita). Se descarta toda idea sin un habilitador concreto en el repo.

### 7.5 F5 — Atlas (`06-ATLAS/`)
Scripts en `scripts/auditoria/`: `rutas.mjs` (enumera page, layout, route y acciones exportadas, con los conteos de §3 como control; las `entradas` de los lectores completan auth, rol y scoping), `erd.mjs` (desde el parser del schema), `uso-modelos.mjs` (uso de `prisma.<modelo>`, `forOrg`, `unsafeGlobalQuery` por módulo → `datos.md`), depcruise colapsado por módulo con estilos para FROZEN y ZONA-FRANCO → `dependencias.md`, `ramas.json` → `ramas.md`. `regenerar.md` con los comandos PowerShell exactos (rutas con paréntesis entre comillas). Fichas en `modulos/` según §6. La pasada final de `README.md` (puerta de entrada «quiero hacer X → tarjeta») y de los IDs vinculados se hace después de F6.4 y se valida en F7.

### 7.6 F6 — Adversarial y consolidación
F6.1: un agente nuevo recibe solo la lista de archivos de D1, D2 y D5 (sacada con `git ls-tree`) y sus entradas (handlers 2+3+9; archivos `'use server'` 9+17+21); **tiene prohibido leer `docs/**`, cualquier `*.md` y `docs/auditoria-2026-10/**`**, y busca solo con rutas explícitas bajo `src/`, `prisma/` y `netlify/`; se valida que sus lecturas no incluyan docs y sus hallazgos se verifican como cualquier otro. Lo que encontró y yo no → hallazgo nuevo + en el log por qué se me pasó. F6.2: re-lectura de cada CRÍTICA y ALTA, resultado por ID. F6.3: dedupe por causa raíz. F6.4: `07-BACKLOG.md` — una tarjeta por causa raíz; **Ahora** = toda CRÍTICA + bloqueantes de L3; **Próximo** = lo que lleva herramientas a L3; **Después** = mejoras, diseño, ideas; agrupadas por worktree y zona; modelo sugerido: Sonnet 5.5 para lo mecánico S/M, Opus 5.5 xhigh para lo sensible a seguridad o lo visual. F6.5: `RESUMEN.md` y `09-PARA-FRANCO.md` (plantilla: contexto en 2 líneas, evidencia, impacto, propuesta, cómo verificar, qué coordinación hace falta).

### 7.7 F7 — Cierre
`validar.mjs` sobre todo; re-lectura de punta a punta buscando contradicciones; commit final; push según DEC-34; mensaje final de ≤ 20 líneas: cobertura alcanzada, hallazgos por severidad, las 5 tarjetas de «Ahora» y cada dominio sin cobertura total con su razón.

## 8. Estimación

| Fase | Agentes | Tiempo |
|---|---|---|
| F1 | 1 (previas) | 1–1,5 h |
| F2 ciclo 1 (34 lotes) | 34 lectores + 34 verificadores | 7–9 h |
| F2 ciclos 2–4 (≈ 14 cazadores por ciclo + verificadores + barridos) | 30–60 | 3–6 h |
| F3 | 3–4 | 1,5–2 h |
| F4 | 1–2 | 1 h |
| F5 | 2–4 | 2 h |
| F6 | 2–3 | 2 h |
| F7 | 0–1 | 1 h |
| **Total** | **≈ 110–150** | **≈ 19–25 h** |

## 9. Riesgos de la corrida y mitigación

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | El límite de gasto mensual de la cuenta mata subagentes a mitad, sin aviso (memoria de sesiones previas: SITIO-S6; `rediseno/home:docs/rediseno/DIRECCION-ESCENA.md` §7.21: SITIO-S5) | Workflows reanudables (`resumeFromRunId`); crudo en `_crudo/ciclos/`; el ledger solo marca `leído` lo listado con rango completo; DEC-27 |
| R2 | Compactación de contexto | Este archivo + CSV + `_crudo/ciclos/`; PROMPT §8; DEC-21 |
| R3 | 16 GB de RAM | Uno por vez; `Get-Process node` antes; los agentes no corren procesos (DEC-19) |
| R4 | Sin base, navegador ni build | Runtime → `REQUIERE-VERIFICACIÓN-HUMANA` con `VH-NNN` (DEC-30); mobile por lectura |
| R5 | Hallazgos alucinados | Verificador adversarial + lectura del padre; DEC-31 |
| R6 | `.git` compartido con otros worktrees y sesiones | Git de lectura + commits en esta rama; nunca `stash`; `--no-optional-locks` para mirar otros worktrees |
| R7 | La rama trackea `origin/main` | DEC-02 |
| R8 | Volumen (≈ 163k LOC profundas) | Dedupe por causa raíz; IDs asignados al escribir (DEC-24) |
| R9 | ZONA-FRANCO | Solo lectura; DEC-11; `09` |
| R10 | Filtrar un secret al documentar | Escaneos enmascarados; DEC-18 (eslint sin `source`); `validar.mjs` busca los patrones en `docs/` |
| R11 | Docs viejos (`STATUS.md` 2026-05-21, `DEPLOY.md` habla de Vercel, encabezado de `CLAUDE.md`) | Los docs nunca son evidencia de comportamiento; solo el código |
| R12 | El baseline de `tsc` varía con la deduplicación de `node_modules` (el error de `searchconsole.ts:119` aparece y desaparece; memoria de sesiones previas y `docs/bitacora-beta-3.md:553,582`) | Se registra tal cual sale |
| R13 | Node local v24.12.0 vs `NODE_VERSION = "22"` en `netlify.toml`; CI en Node 24; `@types/node ^20` | Se anota en D8 |
| R14 | Cada push dispara el CI, que puede migrar y testear contra una base | DEC-04 `[skip ci]`; §11 P5 |
| R15 | Repo público + documentos de auditoría con `archivo:línea` | DEC-34; evidencia en fragmento mínimo, sin payloads |
| R16 | El Grep de la herramienta no ve archivos versionados ignorados | DEC-20 |
| R17 | Escrituras fuera de las dos carpetas por efecto lateral (`tsbuildinfo`, raw de eslint) | DEC-17, DEC-18; foto antes/después (DEC-19); §10.5 con `git status` |

## 10. Premisas del PROMPT (y de `CLAUDE.md`) que el repo contradice o matiza

1. **`src/app/v3/` no existe en main** (0 archivos); vive solo en `rediseno/home` (883). DEC-13.
2. **«`main` actualizado» ≠ `main` local**: el local está 52 detrás; se audita `origin/main` (DEC-01). F0.2 lo hizo Valentino.
3. **`prisma migrate status` no es baseline disponible** (sin `DATABASE_URL`, por diseño del entorno). DEC-08.
4. **`npx -y dependency-cruiser`**: ya está instalado y configurado. DEC-06.
5. **`getDMMF` de `@prisma/internals`**: no instalado, y el DMMF de runtime no alcanza. DEC-07.
6. **«Magic link (Brevo)» es una de tres vías**: `src/auth.ts:96-134` declara `Resend` (id `resend`; el magic link se envía por Brevo, `:104`), `Google` y `Credentials` (bcrypt).
7. **«middleware/proxy»**: no hay `middleware.ts`; existe `src/proxy.ts` (173 líneas, Next 16).
8. **Roles**: el enum `Role` tiene `SUPER_ADMIN`, `ORG_MEMBER`, `CLIENT` y **`SETTER`** (`prisma/schema.prisma:12-17`), más `OrgRole` (`:19-23`). `CLAUDE.md` dice «`ORG_MEMBER` / `CLIENT` → `/dashboard/*`», pero el proxy solo deja entrar a `ORG_MEMBER` o a SUPER_ADMIN impersonando (`src/proxy.ts:154`) y `resolveOrgId` devuelve `null` para `CLIENT` (`src/lib/preview.ts:6-20`). Material de D1/D2.
9. **Crons en tres registradores y dos rutas sin disparador**: `netlify.toml:25-32` agenda 3 functions que existen (`generate-insights`, `send-weekly-reports`, `cleanup-old-events`); `vercel.json:4,8,12` declara otras 3 (`os-follow-up`, `regenerate-briefs`, `send-executive-reports`) que en Netlify no tendrían quién las dispare; `raíz:.github/workflows/db-backup.yml:39-41` agenda el backup; y `api/cron/alerts` y `api/cron/detect-bot-issues` no figuran en ningún registro. Hipótesis a verificar en D7.
10. **«Restos de Resend» no son restos**: `resend ^6.9.4` sigue en `dependencies`, `RESEND_*` en `.env.example:134-138` y el provider de NextAuth se llama `Resend`.
11. **Lista FROZEN**: `auth.ts` = `src/auth.ts` (también ZONA-FRANCO); `dashboard-actions.ts` = `src/actions/dashboard-actions.ts`; las dos categorías genéricas no tienen lista (DEC-10). Y la tabla «Frozen files» de `raíz:CLAUDE.md:163-170` congela solo 4 archivos: no reconoce `auth.ts`, `lib/prisma.ts`, `components/ui/*` ni `dashboard-actions.ts`. Para esta corrida manda el PROMPT.
12. **Colores por servicio contradictorios**: `raíz:CLAUDE.md` dice IA = esmeralda, Automatización = ámbar, Software = violeta («verificado contra globals.css»); `AGENTS.md` dice IA = violeta, Automatizaciones = esmeralda, Software = ámbar. F3 lo resuelve contra `globals.css`.
13. **Proveedores de IA**: el factory del chatbot declara `google`, `anthropic` y `openai` (`src/modules/chatbot/server/llm/factory.ts:22,29,32,35`), pero solo `google` (Vertex) está implementado: `providers/anthropic.ts:18` y `providers/openai.ts:12` lanzan `ProviderNotImplementedError`. El SDK de Anthropic se usa fuera del chatbot (`lib/ai/results-insights.ts`, `lib/ai/review-reply-draft.ts`, con `claude-haiku-4-5-20251001` fijo; y el juez de evals). Vertex acepta dos vías de credencial (`google.ts:54-55,73`: archivo o JSON inline). `AGENTS.md` (Anthropic) y `README.md`/`STATUS.md` (Vertex) cuentan cada uno la mitad.
14. **`DEPLOY.md` describe un deploy en Vercel con Resend y n8n**; la configuración viva es Netlify.
15. **`STATUS.md` se declara «fuente única de verdad»** y su última actualización es 2026-05-21.
16. **«`@googleapis/webmasters` faltante»**: está en `package.json` (`^4.0.0`) y en `node_modules/@googleapis/webmasters`; F1 dirá si el error sigue.
17. **`CLAUDE.md` pide `npm run build` en cada sprint**; el PROMPT lo prohíbe (DEC-05).
18. **CI**: la auditoría CLEAN de julio decía que el e2e estaba mal ubicado y nunca corría; hoy existe `raíz:.github/workflows/ci.yml` (tsc + invariantes + suites con base si hay secret; sin lint, por decisión documentada en su cabecera). Corre en **todo push de cualquier rama** (`:65`) → DEC-04.
19. **`router.push`**: el PROMPT lo prohíbe sin matices; `raíz:CLAUDE.md:12-20` lo permite en portales con justificación inline (DEC-28).
20. **«Never expose internal DB IDs in URLs»** (`raíz:CLAUDE.md:111`): los segmentos dinámicos usan ids `cuid` de la base, también en el portal del cliente (`dashboard/soporte/[ticketId]`, `dashboard/chatbot/leads/[id]`, `admin/projects/[projectId]`…); solo `admin/clients/[clientId]` usa slug. Material de D2/D9.
21. **Lección vieja en `CLAUDE.md:188-189`**: `ticket-chat.tsx` y `TicketStatusSelector.tsx` ya usan el `<Select>` compartido (`ticket-chat.tsx:8`, `TicketStatusSelector.tsx:7`).
22. **«Framer Motion»**: el paquete declarado es `motion` (`^12.36.0`); 215 archivos importan `motion/react` y 3 importan `framer-motion` directo, que solo llega como dependencia transitiva (`sections/home/About.tsx`, `sections/home/Portfolio.tsx`, `ui/KineticText.tsx` — este último FROZEN).
23. **«133 invariantes» de v3**: la cifra sale de docs de `rediseno/home` del 11–12/09; los del 17/09 dicen 135 y el gate es dinámico («todos los que existan»). No aplica a main.
24. **Encabezado de `CLAUDE.md`** («Last updated: May 2026»): el archivo se modificó por última vez el 2026-07-30 y tiene lecciones de junio.
25. **Índice de `docs/`**: no existe; se construye en F1. `DIRECCION-ESCENA.md` está solo en `rediseno/home`.
26. **Visibilidad**: el PROMPT asume que pushear la auditoría es inocuo; el repo es público según S8-01 (DEC-34).

## 11. Preguntas para la parada de F0 (con el default que aplica un `Aceptar` a secas)

- **P1 — Credenciales expuestas en un repo que una auditoría previa verificó como público** (S8-01, julio). Ninguna está probada activa; si alguna lo está, §9 obliga a rotarla antes de seguir. Valores nunca copiados.
  - (a) **Clave de Google AI** (`GOOGLE_GENERATIVE_AI_API_KEY`): valor completo en `docs/audits/2026-05-bfg-leak-cleanup.md:94` y `docs/bitacora-roadmap.md:36`, y en el historial (`logic-core-v3/enviroment.env`, commit `3953558`, alcanzable desde 116 refs; la purga se hizo solo en un mirror local y nunca se pusheó, `:193-197`). El runbook afirma que está deshabilitada y rotada (`:204`).
  - (b) **Cuentas del seed** (SUPER_ADMIN y cliente): `README.md:29-30`, `STATUS.md:258-259`, `docs/demo-guion.md:15-16`, `docs/bitacora-beta.md:15`, `docs/bitacora-roadmap.md:6375-6376,10534`, `tests/helpers/auth.ts:21,25`. El seed actual exige `SEED_*_PASSWORD` (`prisma/seed.ts:76-79`), pero una base sembrada antes puede conservarlas.
  - (c) **Cuenta QA de setter**: `docs/leados-alta-setter.md:25` (y un `bcrypt.hash` de literal en `:40`), `docs/bitacora-roadmap.md:7837`; `bcrypt.hash` de literal en `scripts/b1-verify-setter-ownership.ts:44` y `scripts/b2-verify-dossier.ts:66`.
  - (d) **Admin de Matsu en la base de dev**: `scripts/set-matsu-password.ts:17` (con el host de la Neon de dev en `:15`).
  - **Default con `Aceptar`**: las cuatro quedan como CRÍTICA `REQUIERE-VERIFICACIÓN-HUMANA` (con su `VH`) y sigo; cualquier secret nuevo dispara §9 (DEC-33).
- **P2 — FROZEN inferido** (DEC-10, 14 archivos con criterio medido). **Default**: esa lista.
- **P3 — `knip`** (DEC-15). **Default: no se usa.** Solo con un «sí» explícito.
- **P4 — Push de F7 con repo público** (DEC-34). **Default: F7 commitea todo pero NO pushea** salvo que confirmes que el repo es privado o que aceptás publicar.
- **P5 — Informativa**: el CI corre `prisma migrate deploy` contra `DATABASE_URL_TEST` en cada push; ¿apunta a la Neon compartida? Todos los commits de la corrida llevan `[skip ci]` (DEC-04) igual.

## 12. Baseline (F1)

Pendiente (§7.1). Errores conocidos a ignorar: `@googleapis/webmasters` faltante · `react-hooks/set-state-in-effect` en `PreloaderContext` · `searchconsole.ts:119`.

## 13. Log de ciclos

### C00 · F0 — 2026-10-13 — arranque y plan
- Leído: ver §1. Ledger generado y corregido (2.212 filas; 1.298 profundo / 691 superficial / 223 fuera). Barrido de credenciales del historial completo y del árbol de main (DEC-14) → P1.
- Revisión adversarial del borrador (workflow `wf_6a47c769-150`, 3 agentes de solo lectura): red-team contra el PROMPT (101 requisitos trazados; 35 enmiendas: 3 bloqueantes, 27 importantes, 5 menores), fact-check (77 afirmaciones: 60 correctas, 16 parciales, 1 incorrecta; 9 premisas extra) y crítica del ledger (24 reclasificaciones, 51 herramientas, 15 observaciones). Aplicado: las 3 bloqueantes (commit+push de F0 registrado; `[skip ci]` por el CI que migra; barrido de secrets ampliado con control positivo), las 27 importantes (DEC-15 a DEC-34, §6, §7, §9 R14–R17) y las 5 menores; las 17 correcciones del fact-check; las 24 reclasificaciones (más 2 bugs del generador: imports relativos y la nota de los compartidos). Las afirmaciones de los agentes que este plan cita se re-verificaron leyendo el código (una corrección: `router.push` son 14 usos en 11 archivos de `(protected)`, no 19).
- Herramientas preparadas: `cobertura.mjs` (ledger), `lotes.mjs` (34 lotes), `drift.mjs` (control positivo OK), `ramas.mjs`, `secrets-historial.mjs` (22/22 patrones con control positivo).
- Salió: este plan, `_cobertura.csv`, `_crudo/secrets-historial.json` y los cinco scripts.
- Sigue: **PARADA**. Con `Aceptar` → F1 (§7.1).

## 14. Autorrevisión §10 por commit

| Commit | ¿Hallazgo sin ruta:línea? | ¿«Funciona»/«no existe» sin prueba? | ¿Valor de secret? | ¿Propuesta sobre FROZEN/ZONA-FRANCO sin marcar? | ¿Archivo fuera de las dos carpetas? | validar.mjs |
|---|---|---|---|---|---|---|
| C00-F0 | No: no hay hallazgos escritos; las alertas de P1 citan `ruta:línea` | No: los «no existe» de §1 y §10 citan comando o búsqueda | No: grep de los 22 patrones sobre `docs/auditoria-2026-10` = 0 | No hay propuestas | No (`git status`: solo `docs/auditoria-2026-10/` y `scripts/auditoria/`) | n/a (se escribe en F1) |
