# 13 — Propuesta de CLAUDE.md y del ciclo de actualización del mapa

> E8 de la ENMIENDA-01 y DEC-41. **No se aplica nada:** es una propuesta con evidencia para que la decidan Valentino y Franco. La redactó un agente de solo lectura (run `wf_7cfe2151-e7b`, `_crudo/f6b-resultado.json`) con las contradicciones de §10 del plan, los hallazgos de convenciones de F2, la política de `11-CONGELADOS.md` y `06-ATLAS/regenerar.md`.

## Resumen

Audité las 63 afirmaciones del CLAUDE.md raíz (196 líneas, idéntico a 57c421bc; último commit f5b298e5, 2026-07-30). 35 siguen vigentes, 12 están duplicadas con AGENTS.md, 13 quedaron viejas y 3 son falsas.

**Las 3 falsas:**
- El stack dice «Framer Motion», pero el paquete es `motion`.
- El mapa de roles no tiene SETTER y manda a CLIENT a /dashboard, cuando el proxy lo redirige a /login.
- «Sin IDs internos en URLs», pero las rutas usan cuid. No hay IDOR (DEU-025).

**Lo viejo se concentra en tres zonas:**
- El ciclo de cierre usa `npm run build` y `migrate status` como gate. Lo de ECC solo existe en la máquina de Franco y regression-runner no existe.
- La tabla Frozen cubre 4 de 22 archivos.
- El vidrio y el reveal están escritos como globales, pero DESIGN.md los prohíbe o los cambia en el sitio público.

**Ninguna regla no-negociable tiene mecanismo:**
- `no-explicit-any` ya está en 'error', pero CI no corre lint.
- La frontera del chatbot es una regla de eslint que CI no ejecuta.
- Los 28 invariantes `test:*` del chatbot quedan fuera de `check:invariants`.

**Lo que propongo:**
- **Borrador nuevo** (~170 líneas): deja solo lo que vale en todo el repo y pasa lo de cada área a tres CLAUDE.md anidados (setter, chatbot, prisma).
- **Archivos protegidos:** reemplaza «congelado» por los niveles protegido y libre. La lista vive en zonas.json.
- **Definición de terminado:** `check:types`, `check:invariants`, gate de lint, Atlas al día, reporte con un encabezado fijo y verificación humana.
- **Mecanismos:**
  - `eslint.gate.config.mjs` bloqueante en CI, sin dependencias nuevas.
  - Dos hooks PreToolUse: uno sobre archivos y otro sobre comandos de Bash y PowerShell.
  - SessionStart y Stop para el Atlas. Stop solo actúa ante `## Cierre del sprint`, para no frenar una pregunta a mitad de sprint.
  - La skill atlas-actualizar.
  - Un job de CI `atlas` que avisa sin romper el build.
  - CODEOWNERS y cinco invariantes nuevos.
- **Requisitos previos:** que scripts/auditoria esté en main, y dos cambios en generar.mjs: un flag `--sin-historial` y que lea archivos sin rastrear.

**AGENTS.md, STATUS.md y DEPLOY.md:**
- AGENTS.md queda como puntero a CLAUDE.md.
- STATUS.md pasa a histórico y el Atlas toma su lugar.
- DEPLOY.md se reescribe para Netlify o se borra.

**Impeccable:** la copia de `.github` es para Copilot y Claude Code no la lee. La copia de Claude está gitignorada y solo existe en la máquina de Franco. Como su craft-floor rechaza el vidrio que usan los portales, queda acotada al sitio público.

**Secretos:** CLAUDE.md no tiene ninguno. Hay contraseñas de seed en texto plano en README.md:29-30 y STATUS.md:258-259 (no cito los valores), en un repo público.

## 1. Auditoría del CLAUDE.md actual

63 afirmaciones: vieja 13 · falsa 3 · duplicada 12 · vigente 35.

| Afirmación | Cita | Clase | Evidencia |
|---|---|---|---|
| «Last updated: May 2026» | CLAUDE.md:3 | vieja | El último commit que lo toca es f5b298e5 del 2026-07-30 (git log -- CLAUDE.md), y el propio archivo trae lecciones de junio (CLAUDE.md:188, :191). Ver §10.24. |
| Stack: «Framer Motion» | CLAUDE.md:3 | falsa | logic-core-v3/package.json declara `motion` ^12.36.0 y no `framer-motion`. 215 archivos importan `motion/react`. Otros 3 importan `framer-motion`, que solo está como dependencia transitiva: src/components/sections/home/About.tsx, src/components/sections/home/Portfolio.tsx y src/components/ui/KineticText.tsx (§10.22). El mismo error está en AGENTS.md:17. |
| Stack: Next.js 16 · TypeScript strict · Tailwind 4 · Three.js/R3F · Prisma · Neon PostgreSQL · NextAuth v5 | CLAUDE.md:3 | duplicada | Es cierto: package.json tiene next ^16.2.6, tailwindcss ^4, three ^0.182.0, @react-three/fiber ^9.5.0, prisma ^6.19.2 y next-auth ^5.0.0-beta.30, y tsconfig.json:11 pone strict. Está repetido en AGENTS.md:14-21. Le faltan Vertex/Gemini (README.md:11; @ai-sdk/google-vertex ^4.0.128) y Netlify. |
| Never run `prisma migrate reset` — stop and report | CLAUDE.md:9 | duplicada | Sigue vigente. Se repite en CLAUDE.md:176-177, AGENTS.md:148 y :159, docs/operations/00-entornos.md:88 y :145, y prisma.config.ts:7. No hay ningún mecanismo que la haga cumplir (11-CONGELADOS.md:41). |
| Never use `any`. Zero exceptions. | CLAUDE.md:10 | duplicada | Se repite en AGENTS.md:15 y :78. No se cumple: en 57c421bc hay 6 `any` explícitos en src (LiquidProject.tsx:8, pagespeed.ts:77, LegacyNeuroAvatar.tsx:601, ClientSettingsForm.tsx:26, :36 y :37), más los de scripts y seeds (DEU-099). La regla de eslint ya existe: no-explicit-any está en 'error' (vía eslint-config-next/typescript, @typescript-eslint/eslint-plugin/dist/configs/flat/recommended.js:29). El problema es que CI no corre lint (ci.yml:20-31). |
| Never modify `src/components/3d/HeroArtifact.tsx`. It is frozen. | CLAUDE.md:11 | duplicada | Se repite en AGENTS.md:76, que es la única congelación con la razón escrita (11-CONGELADOS.md:38). CNG-001 propone borrarlo con el merge de rediseno/home (11-CONGELADOS.md:13 y :52). |
| Sitio público: usar siempre `triggerTransition()`; nunca `router.push()` | CLAUDE.md:13-14 | duplicada | Sigue vigente: TransitionProvider se monta en src/app/layout.tsx:112. Se repite en AGENTS.md:86. |
| Portales: `<Link>`, `router.refresh()`, `redirect()`; `router.push()` solo post-submit y con un comentario inline que lo justifique | CLAUDE.md:15-19 | vigente | No se cumple. DEU-024 (alta de ticket, bienvenida y envío de campaña) y DEU-035 (alta de bot, card del pipeline y ClientSwitcher) usan router.push sin comentario; en src hay 33 router.push. La regla tampoco cubre /setter (DEU-082): `setter/_components/setter-nav.tsx:45` usa triggerTransition y lo justifica como «decisión cerrada · CLAUDE.md». |
| `triggerTransition()` no aplica en portales (el Shutter no existe ahí) | CLAUDE.md:19-20 | vigente | El Shutter va envuelto en PublicOnlyComponents (src/app/layout.tsx:113-115). Pero TransitionProvider es global (:112), así que en un portal triggerTransition igual termina en router.push, solo que con demora (TransitionContext.tsx:116-118). Hoy se usa en admin: DEU-039 (EditClientForm.tsx, alert-card.tsx). |
| Never self-confirm a sprint works because it compiles. User verifies. | CLAUDE.md:21 | vigente | Coincide con el nivel 3 (verificación humana) de la definición de terminado de Franco (Franco/Work Flow/develOP-manual-flujo (1).md:652-658) y con la memoria repo_verification_workflow.md:17. |
| Never touch files outside the current sprint scope. | CLAUDE.md:22 | vigente | Se repite dentro del mismo archivo (CLAUDE.md:119 y :140). Coincide con el principio «no tocar lo que no se pidió» de Recursos DevelOP.md:396. |
| Never hardcode secrets, API keys, or credentials in code. | CLAUDE.md:23 | duplicada | Se repite en AGENTS.md:84. En docs sí hay credenciales en texto plano: contraseñas de seed en README.md:29-30 y STATUS.md:258-259 (valores omitidos), y el repo es público (§10.26). Ya no hacen falta ahí: prisma/seed-guard.ts:9-10 pide la contraseña por variable de entorno. |
| Never expose internal error messages or stack traces to the client. | CLAUDE.md:24 | vigente | No se cumple en tres casos: SEC-006 y SEC-092 (fuga de toErrorMessage, 11-CONGELADOS.md:40), y SEC-082 (el stream del chat le manda al visitante anónimo los argumentos y resultados de las tools, con la clasificación interna y el id del lead). |
| Never add a dependency without first checking if a native or already-installed alternative exists. | CLAUDE.md:25 | vigente | Tiene casos concretos en el repo: dependency-cruiser ^17.4.3 y knip ^6.16.1 ya estaban instalados (§10.4). typescript-eslint ya está en node_modules como dependencia de eslint-config-next. |
| Components that fetch data must have loading, error, and empty states. | CLAUDE.md:31 | vigente | Es un principio de UI que vale para todas las superficies. No tiene mecanismo. |
| Forms must have client-side and server-side validation with visible feedback. | CLAUDE.md:32 | vigente | Principio vigente. La parte de servidor se mide en la fila de Zod (CLAUDE.md:58). |
| Destructive actions require confirmation dialogs. | CLAUDE.md:33 | vigente | No se cumple en DEU-074: deleteLead borra en cascada el trabajo del setter sin aviso ni auditoría. |
| No blank screens — skeleton loaders or spinners always. | CLAUDE.md:34 | vigente | Principio vigente, sin mecanismo. |
| Aria-labels on all icon-only elements. WCAG AA contrast minimum. | CLAUDE.md:35 | vigente | No se cumple en contraste: DEU-069 encontró 23 casos y DEU-103 otros 12. |
| Architecture before code: leer el scope, identificar lo que existe, no duplicar lógica, proponer la estructura | CLAUDE.md:41-45 | vigente | Es el ritual del método WF (Franco/Work Flow/Iniciar Nuevo Chat/develOP-manual-resumido (2) (1).md:15-18). Dentro del mismo archivo se repite en :119 (Método WF) y en :139-141 (Sprint protocol). |
| Prohibido: componente de más de 300 líneas sin separación de responsabilidades | CLAUDE.md:48 | vigente | No tiene mecanismo: en 57c421bc, 129 de los 746 .tsx de src pasan las 300 líneas. |
| Prohibido: CSS inline cuando existe una clase de Tailwind | CLAUDE.md:52 | vigente | No se cumple: DEU-028, DEU-069 (11 casos inline) y DEU-103 (7 casos inline). |
| Validate and sanitize all inputs with Zod in every Server Action. | CLAUDE.md:58 | vigente | No tiene mecanismo. Una medición gruesa sobre 57c421bc: 25 de los 90 archivos con 'use server' no importan zod ni llaman a un schema (por ejemplo src/actions/agency-actions.ts, src/lib/actions/leads.ts y src/app/login/actions.ts). Algunos no reciben input, así que no todos son defecto. |
| Verify session and role in every Server Action and API Route — middleware alone is not enough. | CLAUDE.md:59 | vieja | La regla vale, pero el término quedó viejo: no hay middleware.ts. El guard de rutas es src/proxy.ts, de 173 líneas, como pide Next 16 (§10.7). |
| Rate-limit all public endpoints and form submissions. | CLAUDE.md:60 | vigente | Existe src/lib/rate-limit/ con un limitador persistido en la base (limiter.ts:44). STATUS.md:204 todavía dice que es in-memory. |
| Use Prisma for all queries. No raw SQL without parameterized inputs. | CLAUDE.md:61 | vigente | Se cumple: el único SQL crudo de src es un $queryRawUnsafe con $1..$4 (src/lib/rate-limit/limiter.ts:44-61), que está parametrizado. |
| Never log environment variable values. | CLAUDE.md:62 | vigente | La contradice docs/operations/00-entornos.md:146, que manda imprimir DATABASE_URL con node -e para verificar a dónde apunta. |
| `will-change: transform` on all complex animated elements. | CLAUDE.md:68 | duplicada | Se repite en AGENTS.md:43. |
| Always `next/image`. Use `priority` only above-the-fold. | CLAUDE.md:69 | vigente | Convención vigente, sin mecanismo. |
| `IntersectionObserver` on all heavy animations | CLAUDE.md:70 | vigente | Convención vigente, sin mecanismo. |
| Three.js: `dpr={[1, 1.5]}` max. Never `dpr={2}` in production. | CLAUDE.md:71 | vigente | No se cumple en dos lugares que usan dpr={[1, 2]}: src/components/canvas/DotMatrix.tsx:213 (lo usan login, forgot-password y accept-invite) y src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:940. |
| Server Components by default. | CLAUDE.md:72 | duplicada | Se repite en AGENTS.md:80. |
| Framer Motion — section reveal: y 20, `once`, duración 0.6, ease [0.25, 0.46, 0.45, 0.94] | CLAUDE.md:79-84 | vieja | Está escrita como global y no lo es. En el sitio público manda DESIGN.md:271, que fija reveals de ~0.9 s (PRODUCT.md:9-13 acota DESIGN.md al sitio de marketing). El ease se repite en AGENTS.md:17 y :38 y tiene 58 usos en src. |
| Spring de íconos { stiffness: 400, damping: 15 } | CLAUDE.md:86-87 | vigente | Tiene 12 usos en src. |
| Spring de dock/UI { stiffness: 380, damping: 38, mass: 0.9 } | CLAUDE.md:89-90 | duplicada | Se repite en AGENTS.md:37. Tiene 5 usos en src. |
| Lucide React: always `strokeWidth={1.5}`. No exceptions. | CLAUDE.md:95 | duplicada | Se repite en AGENTS.md:33. No se cumple: DEU-069 encontró 30 casos, DEU-103 otros 9, y también lo marca DEU-028. |
| AnimatePresence: always `mode="wait"` for state transitions. | CLAUDE.md:96 | duplicada | Se repite en AGENTS.md:41. |
| Glassmorphism: `bg-white/[0.04] backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/[0.08]` | CLAUDE.md:97 | vieja | No dice a qué superficie aplica. DESIGN.md:291 prohíbe backdrop-blur y glassmorphism en todo el sitio público, y la craft-floor de Impeccable rechaza el vidrio como decoración (.github/skills/impeccable/reference/craft-floor.md, «Surface habits»). En los portales sí sigue: hay 17 usos de backdrop-saturate-[180%]. Se repite en AGENTS.md:45-52. Ver DEU-098. |
| Service accent colors: Web cian, AI esmeralda, Automation ámbar, Software violeta, «verificado contra globals.css» | CLAUDE.md:99-103 | vigente | Coincide con src/app/globals.css:60-63, DESIGN.md:17-20 y .impeccable/design.json. Lo contradicen AGENTS.md:56-58 y src/lib/design-tokens.ts:95-98, que dan IA violeta, automatización esmeralda y software ámbar (§10.12, DEU-100, DEU-028). |
| Roles: `SUPER_ADMIN` → `/admin/*` \| `ORG_MEMBER` / `CLIENT` → `/dashboard/*` | CLAUDE.md:109 | falsa | El enum Role también tiene SETTER (prisma/schema.prisma:12-17), que solo entra a /setter (src/proxy.ts:117-122). /dashboard admite solo a ORG_MEMBER o a SUPER_ADMIN impersonando (src/proxy.ts:154). A CLIENT el proxy lo manda a /login, y resolveOrgId le devuelve null (src/lib/preview.ts:6-20). |
| Always filter Prisma queries by `organizationId`. Never return cross-tenant data. | CLAUDE.md:110 | vigente | Solo está mecanizado en chatbot y motor, con src/lib/isolation/ y eslint.config.mjs:48-87. Esas reglas de eslint no corren en CI (ci.yml:20-31). |
| Never expose internal DB IDs in URLs — use slugs or tokens. | CLAUDE.md:111 | falsa | Los segmentos dinámicos usan cuid de la base, también en el portal del cliente: dashboard/soporte/[ticketId], dashboard/chatbot/leads/[id], admin/projects/[projectId] (§10.20). Solo admin/clients/[clientId] usa slug. DEU-025 aclara que no hay IDOR porque se resuelven contra la org de la sesión. |
| «harness ECC (instalado global, perfil minimal)» | CLAUDE.md:117 | vieja | Depende de la máquina. ECC vive en el ~/.claude de la máquina de Franco (logic-core-v3/docs/auditorias/A3-ESTADO-ECC-SKILLS-2026-08.md:31-46, instalado el 2026-06-17 según :277). En la máquina de Valentino, ~/.claude no tiene commands/ ni agents/ (verificado el 2026-10-15). |
| Método WF: planificación con ritual y sprints atómicos | CLAUDE.md:119 | vigente | Coincide con Franco/Work Flow/Iniciar Nuevo Chat/develOP-manual-resumido (2) (1).md:11-18. Dentro del mismo archivo repite lo de :41-45 y :139-141. |
| Seis slash-commands de ECC disponibles: /harness-audit, /quality-gate, /code-review, /security-scan, /build-fix, /test-coverage | CLAUDE.md:121-127 | vieja | Existían en el ~/.claude/commands de Franco (A3-ESTADO-ECC-SKILLS-2026-08.md:103-108), pero no existen en la máquina de Valentino. Hoy Claude Code trae /code-review y /security-review de fábrica. |
| Los comandos se detectan al iniciar sesión | CLAUDE.md:129 | vigente | Lo confirma A3-ESTADO-ECC-SKILLS-2026-08.md:275. |
| Antes de cerrar: /build-fix, /code-review + /test-coverage, /security-scan según el cambio | CLAUDE.md:131 | vieja | Depende de ECC (ver la fila de :117). El ciclo que hoy se puede verificar en todas las máquinas es check:types + check:invariants (ci.yml:97-105). |
| Las convenciones de app están en logic-core-v3/AGENTS.md; la tabla Frozen y las no-negociables no se tocan | CLAUDE.md:133 | vieja | AGENTS.md contradice a CLAUDE.md en colores (AGENTS.md:56-58), proveedor de IA (:22, :137), migraciones (:146, migrate dev) y gate (:152, build). Además, esta cláusula, agregada en 629fe016, convirtió reglas de uso en prohibiciones de edición (11-CONGELADOS.md:38). |
| Before starting: run `npm run build`, run `npx prisma migrate status` | CLAUDE.md:139 | vieja | El gate de tipos es tsc --noEmit (ci.yml:33-35; next.config.ts:31-39 aclara que el build solo prueba que el proyecto bundlea). El build es pesado y la auditoría lo prohíbe (DEC-05); la memoria repo_verification_workflow.md:17 dice «BUILD NO ES GATE». migrate status necesita DATABASE_URL (DEC-08) y pega a la base que cargue prisma.config.ts:23-24. |
| During: one objective per sprint. After: report modified files and out-of-scope findings. Do not self-verify. | CLAUDE.md:140-141 | vigente | Sigue vigente. El formato de reporte de AGENTS.md:164-184 lo completa. |
| Post-sprint verification (always): `npm run build` y `npx prisma migrate status` | CLAUDE.md:143-148 | vieja | Mismas razones que la fila de :139 (§10.17). |
| Los subagentes son read-only; solo el agente padre escribe código | CLAUDE.md:155 | vigente | Sigue vigente. |
| Descubrimiento: usar el subagente built-in Explore; estándar no opcional | CLAUDE.md:157 | vigente | Tiene una excepción registrada: en modo pulido se hace grep directo, porque un Explore tardó 385 s y gastó unos 203k tokens (memoria feedback_modo_pulido_sin_explore.md:11-15). |
| Verificación de UI con el subagente visual-qa en desktop y mobile; con ❌ no se cierra, con ❓ se avisa al humano | CLAUDE.md:158 | vigente | .claude/agents/visual-qa.md existe, pero depende de las herramientas mcp__Claude_Preview__* (visual-qa.md:9-19) y viene fallando cuando no las tiene (memoria repo_verification_workflow.md:27). |
| regression-runner cuando exista; hasta entonces correr la batería directo | CLAUDE.md:159 | vieja | El subagente no existe (A3-ESTADO-ECC-SKILLS-2026-08.md:276), y «la batería» no está definida en ningún lado. |
| Frozen files: HeroArtifact, TransitionContext, PreloaderContext, schema.prisma | CLAUDE.md:163-170 | vieja | Congela 4 de los 22 archivos que la auditoría encontró congelados de hecho (11-CONGELADOS.md:9-34). Además, 3 de las 4 filas son reglas de uso y no de edición (:38). La propuesta es reemplazarla por los niveles protegido, libre y borrar (:46-52). |
| Lesson: Prisma migrate reset [Apr 2026] | CLAUDE.md:176-177 | duplicada | Repite CLAUDE.md:9, AGENTS.md:148 y AGENTS.md:159. |
| Lesson: Three.js scale 0→0.007 en useFrame | CLAUDE.md:179-180 | vigente | Es una lección técnica que sigue valiendo. |
| Lesson: getBoundingClientRect() con transforms activos | CLAUDE.md:182-183 | vigente | Es una lección técnica que sigue valiendo. |
| Lesson: pathLength de Framer en SVG complejos → strokeDashoffset | CLAUDE.md:185-186 | vigente | No se cumple en PERF-013: el pie del home anima pathLength sobre el path complejo del logo. |
| Lesson: ticket-chat.tsx:110 y TicketStatusSelector.tsx:31 no fueron migrados al `<Select>` compartido | CLAUDE.md:188-189 | vieja | Los dos ya importan Select: ticket-chat.tsx:8 y TicketStatusSelector.tsx:7 (§10.21, DEU-056). |
| Lesson: EffectComposer sobre canvas transparente; CoreHalo.tsx como patrón | CLAUDE.md:191-192 | vigente | src/modules/chatbot/components/avatar/CoreHalo.tsx existe y NeuroAvatar.tsx lo usa. |
| Actualizar el archivo con cada error corregible y podar lo que no aplique | CLAUDE.md:196 | vigente | No se viene aplicando: la lección de :188 quedó vieja sin podarse, y el encabezado de :3 nunca se actualizó. |

## 2. Borrador del CLAUDE.md raíz (172 líneas; tope 200)

````markdown
<!-- Borrador E8 de la auditoría 2026-10 (13-CLAUDE-MD-PROPUESTO.md). Supone aplicados los mecanismos propuestos:
     hooks en .claude/settings.json, eslint.gate.config.mjs y la skill atlas-actualizar. Si se aplica antes,
     las marcas «(hook)» y «(gate)» se borran y esas líneas quedan como reglas escritas. -->
# CLAUDE.md — develOP / logic-core-v3

La app vive en `logic-core-v3/`, y los comandos se corren desde ahí. Es una sola app Next.js con cuatro superficies:
el sitio público (`/` y landings), el portal admin (`/admin/*`), el portal del cliente (`/dashboard/*`) y LeadOS del
setter (`/setter/*`). Además está el chatbot embebible (`/api/chatbot/*`, `/widget.js`).

Stack (fuente: `logic-core-v3/package.json`): Next.js 16 con App Router (el guard de rutas es `src/proxy.ts`; no hay
`middleware.ts`) · React 19 · TypeScript strict · Tailwind 4 · animación con el paquete `motion` (`motion/react`) ·
three + React Three Fiber · Prisma 6 + Neon Postgres · NextAuth v5 (magic link enviado por Brevo, Google y
credenciales) · Vertex AI (Gemini) para el chatbot · deploy en Netlify.

Cada área tiene sus reglas, que se cargan al trabajar ahí:
- `logic-core-v3/src/app/(protected)/setter/CLAUDE.md`: la zona de Franco.
- `logic-core-v3/src/modules/chatbot/CLAUDE.md`: aislamiento, LLM y lo que ve el visitante.
- `logic-core-v3/prisma/CLAUDE.md`: el protocolo de migraciones.

El diseño del sitio público está en `DESIGN.md` y `PRODUCT.md` (raíz). El mapa del código y su estado están en
`logic-core-v3/docs/auditoria-2026-10/06-ATLAS/`; cómo se regenera, en `regenerar.md`.

## Nunca

Esto lo bloquea un hook. Si un hook te frena, parás y lo reportás; no se rodea:
- `prisma migrate reset|dev|deploy|resolve` y `prisma db push|execute`. El protocolo está en `prisma/CLAUDE.md`.
- `git add .`, `git add -A|--all`, `git commit -a`, `git stash`, `git reset`, `git checkout -- .` y `git clean`.
  Los commits los hace una persona, a mano.
- `npm run build` y los scripts que lo encadenan (`start:qa`, `start:setter`, `start:galeria`). Lo corre una persona.
- Editar un archivo protegido que el sprint no declaró, o la configuración de `.claude/`.

Esto no tiene bloqueo automático (o tiene gate en CI):
- `any` explícito: se usa `unknown` y se estrecha. (gate)
- Importar `framer-motion`: el paquete es `motion` y se importa de `motion/react`. (gate)
- Secretos o credenciales en código o en docs, incluidas las contraseñas de seed.
- Imprimir el valor de una variable de entorno. Tampoco `DATABASE_URL` «para ver a dónde apunta». (gate parcial)
- Mandarle al cliente mensajes internos, stack traces o datos internos, incluidos los resultados de tools del chatbot.
- Agregar una dependencia sin buscar antes una solución nativa o un paquete que ya esté instalado.
- Tocar archivos fuera del alcance del sprint. Lo que aparece fuera de alcance se anota y se reporta.
- Dar algo por verificado porque compila. El fondo lo verifica una persona.

## Archivos protegidos

Se cambian solo en un sprint que los declara en `.claude/sprint.json` (lo escribe la persona) y con su gate en verde.
Franco revisa como segundo cuando el archivo tiene importadores en su zona o el cambio toca modelos `OsLead*`.
La lista vive en `06-ATLAS/zonas.json`, que es lo que lee el hook.

| Archivo (bajo `logic-core-v3/`) | Qué protege | Gate |
|---|---|---|
| `src/components/3d/HeroArtifact.tsx` | nada: no se edita, se borra con el merge de `rediseno/home` | — |
| `src/context/TransitionContext.tsx` | la navegación del sitio público | invariante a escribir + QA visual |
| `src/context/PreloaderContext.tsx` | el flujo de fases del preloader | QA visual del sitio público |
| `prisma/schema.prisma` | los datos | `prisma/CLAUDE.md` |
| `src/auth.ts`, `src/lib/auth-guards.ts` | autenticación y autorización | invariante a escribir + Franco |
| `src/lib/prisma.ts` | el cliente único de la base | `check:types` |
| `src/lib/action-utils.ts` | qué error de una server action llega al cliente | invariante a escribir |
| `src/lib/audit-log.ts` | que la auditoría no se pierda | invariante a escribir |
| `src/lib/utils.ts` | `cn()` y los helpers de todo el repo | `check:types` + QA visual |
| `src/lib/tz-ar.ts`, `src/lib/dates-ar.ts` | las fechas en hora argentina (fallan en silencio) | `check:invariant:dates-ar` |
| `src/components/ui/*` (las 22 primitivas del kit) | el kit de los portales | `check:types` + QA visual |

Todo lo demás es libre: alcanza con la definición de terminado y la verificación de UI.

## Navegación

| Superficie | Cómo se navega | Qué no se usa |
|---|---|---|
| Sitio público | `triggerTransition()` de `TransitionContext` | `router.push()` |
| `/admin/*`, `/dashboard/*` | `<Link>`; `router.refresh()` después de mutar; `redirect()` en server actions. `router.push()` solo después de un submit y sin alternativa, con `// nav-imperativa: <motivo>` en la línea anterior | `triggerTransition()`: el Shutter no se monta ahí y solo suma demora |
| `/setter/*` | ver `setter/CLAUDE.md` | — |

## Auth, roles y multi-tenant

| Rol (`prisma/schema.prisma`) | A dónde entra (`src/proxy.ts`) |
|---|---|
| `SUPER_ADMIN` | `/admin/*`, y `/dashboard/*` solo impersonando |
| `ORG_MEMBER` | `/dashboard/*`; `resolveOrgId()` (`src/lib/preview.ts`) devuelve su org |
| `SETTER` | solo `/setter/*`; no tiene membresía de org |
| `CLIENT` | ningún portal: el proxy lo manda a `/login` y `resolveOrgId()` devuelve `null` |

- Toda query sobre datos de un tenant filtra por el `organizationId` de la sesión. En chatbot y motor, solo a través de `src/lib/isolation/`.
- Cada server action y cada route handler verifica sesión y rol por su cuenta: `src/proxy.ts` no alcanza.
- Cada server action que recibe input lo valida con Zod en el servidor.
- Los endpoints públicos y los formularios llevan rate limit con `src/lib/rate-limit/` (persistido en la base).
- Prisma para todo. SQL crudo, solo parametrizado (`$1…$n` o tagged template).
- Un id interno (`cuid`) puede ir en la URL solo si el handler lo resuelve contra la org de la sesión. Lo público usa slug o token.

## UI: el piso de calidad (todas las superficies)

- Lo que trae datos tiene estado de carga, de error y vacío. Nunca una pantalla en blanco.
- Formularios: validación en el cliente y en el servidor, con feedback visible.
- Acciones destructivas: un diálogo de confirmación que diga qué se pierde.
- `aria-label` en todo control que es solo un ícono. Contraste WCAG AA.
- Copy en español rioplatense (vos, tenés), con tildes.
- Server Components por defecto; `'use client'` solo cuando hay interactividad real.
- Evitar componentes de más de 300 líneas sin separar responsabilidades, lógica de negocio en la UI, `fetch`
  directo donde corresponde una server action, prop drilling de más de 2 niveles y CSS inline donde hay clase de Tailwind.

## Convenciones visuales por superficie

**Sitio público:** manda `DESIGN.md`: sin glassmorphism, sin `backdrop-blur`, sin texto en gradiente y con un solo
acento por vista. La skill Impeccable aplica solo acá (`PRODUCT.md`, «Scope»).

**Portales (`/admin`, `/dashboard`, `/setter`):**
- Vidrio: `bg-white/[0.04] backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/[0.08]`.
- Reveal de sección: `initial={{ opacity: 0, y: 20 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}`,
  `transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}`.
- Resortes: íconos `{ type: 'spring', stiffness: 400, damping: 15 }`; dock y UI `{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }`.
- `AnimatePresence mode=\"wait\"` en las transiciones de estado. Íconos Lucide con `strokeWidth={1.5}`.

**Colores de servicio** (fuente: `src/app/globals.css`, tokens `--color-ds-accent-*`): Web `#06b6d4` · IA `#10b981` ·
Automatización `#f59e0b` · Software `#8b5cf6`. `src/lib/design-tokens.ts` los tiene cruzados: no se copian de ahí.

**3D y rendimiento:** `dpr={[1, 1.5]}` como máximo · pausar con `IntersectionObserver` fuera de pantalla ·
`will-change: transform` en animaciones complejas · siempre `next/image`, con `priority` solo arriba del pliegue ·
en canvas chicos y transparentes no va `EffectComposer` (el glow se hace con sprites additive; el patrón es `CoreHalo.tsx`).

## Cómo se trabaja (método WF)

- Un objetivo por sprint, en una sola pasada.
- Antes de codear: leer el alcance y su nodo en el Atlas, ver qué componentes, hooks y server actions ya existen,
  no duplicar lógica y proponer la estructura de archivos antes de crearlos.
- Descubrimiento: grep directo para una incógnita puntual; el subagente `Explore` para mapear un área que no conocés.
- Los subagentes leen y no escriben. Solo el agente principal edita.
- ECC y las skills de diseño dependen de cada máquina, no del repo. Si están instaladas ayudan, pero la definición de terminado no depende de ellas.

## Definición de terminado

Un sprint está terminado cuando se cumple todo esto:
1. `npm run check:types` (tsc --noEmit) sale en verde. Es el gate de tipos; el build no lo reemplaza.
2. `npm run check:invariants` sale en verde. Si el sprint tocó lógica de negocio o aislamiento, el invariante de esa
   lógica existe (o se escribe) y pasa. Si sumaste un `check:invariant:*`, subí `INVARIANTES_ESPERADOS` en `scripts/run-invariants.mjs`.
3. `npx eslint -c eslint.gate.config.mjs src` sale en verde.
4. Si tocó `prisma/schema.prisma`: la migración se generó según `prisma/CLAUDE.md` y se corrió `npx prisma generate`.
5. Si tocó pantallas: el subagente `visual-qa` revisó las rutas tocadas en desktop y mobile. Con ❌ no se cierra. Con ❓,
   o si el subagente no tiene sus herramientas de preview, queda «VERIFICACIÓN PENDIENTE» para la persona.
6. Si tocó `src/` o `prisma/`: el Atlas está al día, con la skill `atlas-actualizar`. El hook Stop lo exige.
7. Hay un reporte final con el encabezado `## Cierre del sprint` que lista los archivos tocados, los comandos corridos y su
   resultado, las decisiones que no estaban pedidas, los hallazgos fuera de alcance, los `git add <archivo>` uno por uno
   y un mensaje de commit sugerido sin tildes.
8. La persona verificó el fondo: que se ve bien, que tiene sentido y que resuelve el problema. Hasta entonces sigue abierto.

Estos comandos los corre una persona, no el agente: `npm run build`, `npx prisma migrate status|dev|deploy`, `npm run test:leados`,
`npm run test:setter`, `npm run test:e2e` y `npm run evals`. Necesitan base, credenciales o mucha memoria.

## Tests

No hay jest ni vitest. Los tests son scripts `*.invariant.ts` con `node:assert`, que se corren con `npx tsx` o `ts-node`.
`ts-node` además chequea tipos: no se reemplaza por `tsx` sin leer antes la cabecera de `.github/workflows/ci.yml`.
CI corre `check:types` y `check:invariants` en cada push, con Node 24.

## Git y archivos en Windows

- `core.autocrlf=true`, así que el árbol está en CRLF. Un invariante que lee fuente normaliza `\\r\\n` antes de buscar.
- Para ver cómo era un archivo: `git show HEAD:<ruta>`. Nunca `stash`.
- Un `git rm` o `git mv` queda preparado y se cuela en el próximo commit: hacelo recién en el commit que le corresponde.

## Lecciones técnicas

- **Three.js:** animar `scale` desde 0 en `useFrame` traba la carga. Hay que iniciar en la escala final y animar la opacidad del wrapper.
- **`getBoundingClientRect()`** mide mal con transforms activos: hay que resetear el transform antes de medir.
- **SVG complejos:** no se anima `pathLength`; se usa `strokeDashoffset` con `getTotalLength()`.
- **`EffectComposer` sobre un canvas con `alpha`** pinta un cuadrado oscuro, porque el alfa muere en los buffers del
  composer (Windows/ANGLE). Si un arreglo es correcto en estático y falla en runtime, buscá un discriminador empírico antes de
  reintentar en la misma capa.
- **Migraciones:** un `migrate reset` borró la seed y rompió relaciones (abril de 2026, 5 horas de recuperación).
  Ante cualquier conflicto de migración: parar y reportar.

---
Tope: 200 líneas, y solo lo que es cierto en todo el repo. Lo de un área va en su CLAUDE.md anidado; el estado, en el
Atlas. Cuando Claude comete un error corregible se agrega la regla que lo evita, y lo que deja de aplicar se borra
en el mismo commit.
````

## 3. CLAUDE.md anidados por área

### `logic-core-v3/src/app/(protected)/setter/CLAUDE.md`

````markdown
# Zona de Franco: LeadOS del setter

Esta carpeta es zona de Franco, igual que `src/lib/leados/`, `src/app/(protected)/admin/leados/`,
`src/app/(protected)/admin/leads/_actions/`, `src/app/(protected)/admin/fg2-lab/`, `src/auth.ts`,
`src/lib/auth-cookies.ts` y `src/app/api/qa/login/route.ts` (la lista está en `06-ATLAS/zonas.json`, clave `franco`).
Se edita solo en un sprint que la declara, y Franco revisa el cambio. Fuera de eso, se lee y se reporta.

## Qué hay acá
- El portal del rol `SETTER`. Ese rol no tiene membresía de org: el proxy lo deja entrar solo a `/setter` (`src/proxy.ts`).
- Páginas, `_components/` y `_actions/`. La lógica pura vive en `src/lib/leados/`, cada regla con su `*.invariant.ts`.
- El flujo al que se apunta está en `docs/BRIEF-VISION-FLUJO-SETTER-v3.md`.

## Reglas
- Cada server action de `_actions/` verifica sesión y rol, y valida el input con Zod.
- La lógica nueva del flujo (estados del lead, cola, foco, novedades) va primero en `src/lib/leados/` con su invariante,
  registrado como `check:invariant:*` en `package.json`. La pantalla solo la presenta.
- Copy rioplatense, sin jerga interna y sin decir dónde está un control en la pantalla. Lo vigilan
  `check:invariant:copy-sin-jerga` y `check:invariant:copy-sin-ubicacion`.
- Un aviso y la cola no pueden decir cosas distintas sobre el mismo lead: la próxima acción sale de una sola fuente
  (`check:invariant:novedades-vigencia`).
- Borrar o reasignar un lead no se puede llevar en silencio el trabajo del setter: hace falta confirmación, registro en la auditoría
  y aviso. Hoy `deleteLead` borra en cascada sin nada de eso (DEU-074).
- Navegación: hoy conviven `triggerTransition` (`_components/setter-nav.tsx`), `router.push` con y sin comentario, y
  `<Link>` (DEU-082). Hasta que Franco decida: no se suman usos nuevos de `triggerTransition`, y todo `router.push`
  nuevo lleva `// nav-imperativa: <motivo>` en la línea anterior.

## Verificar
- `npm run check:invariants`: los invariantes de `src/lib/leados/` entran ahí.
- `npm run test:leados` y `npm run test:setter` necesitan base, así que los corre una persona. `test:setter` compila en
  `.next-setter` y levanta el puerto 3003 (`playwright.setter.config.ts`): no es confiable si otra sesión usa el mismo checkout.
- Capturas: el shell es `fixed inset-0` con scroll interno, así que un `fullPage` corta lo que queda bajo el pliegue.
  Hay que scrollear el contenedor interno.
````

### `logic-core-v3/src/modules/chatbot/CLAUDE.md`

````markdown
# Chatbot multi-tenant

## Frontera (la vigila eslint.config.mjs; CI todavía no corre eslint)
- Ni `@/lib/prisma` ni `new PrismaClient()`, ni en este módulo ni en `src/app/api/chatbot/**`. Todo acceso a datos va por
  `src/lib/isolation/`: `forOrg(orgId)`, y `unsafeGlobalQuery` solo con el motivo escrito al lado.
  La regla 1 del `README.md` de esta carpeta todavía dice lo contrario: manda `eslint.config.mjs`.
- Desde afuera se entra por `index.ts` (cliente) o por `index.server.ts` (servidor), no por rutas profundas.
  `src/modules/motor` solo puede importar la API pública del chatbot.
- Las tablas son `chatbot_*` vía `@@map`, las migraciones llevan prefijo `chatbot_` y las variables de entorno son `CHATBOT_*`.

## LLM
- Solo está implementado el provider `google` (Vertex AI, Gemini). `anthropic` y `openai` existen en el factory
  (`server/llm/factory.ts`), pero lanzan `ProviderNotImplementedError`. `CHATBOT_LLM_PROVIDER` elige, y el default es `google`.
- Las credenciales de Vertex van por archivo o como JSON inline (`server/llm/providers/google.ts`). Nunca en código ni en logs.
- Los topes de historial viven solo en `shared/historyPolicy.ts`.

## Lo que ve el visitante
- El widget es público y anónimo. Al stream no van argumentos ni resultados de tools con datos internos
  (clasificación del lead, señales, resumen para el equipo, ids): ver SEC-082.
- Los endpoints públicos validan el origen contra los `allowedDomains` del bot y llevan rate limit.
- Los logs no llevan PII (`npm run test:pii`), y la IP se guarda hasheada con `CHATBOT_IP_HASH_SALT` (`npm run test:iphash`).

## Verificar
- Los invariantes del chatbot son los scripts `test:*` de `package.json` (28 hoy), más `check:invariant:lead-status` y
  `check:invariant:lead-detail`. Los `test:*` no entran en `check:invariants` ni en CI: hay que correr a mano los del área tocada
  (por ejemplo `npm run test:c02` si tocaste el historial, o `npm run test:pii` si tocaste logs).
- `npm run evals` usa base, Vertex y un juez LLM, y cuesta plata: lo corre una persona.
````

### `logic-core-v3/prisma/CLAUDE.md`

````markdown
# prisma/: esquema y migraciones

`schema.prisma` es un archivo protegido: se toca solo en un sprint que lo declara. Si el cambio toca modelos `OsLead*`
o algo que usa la zona de Franco, Franco revisa como segundo.

## El agente no aplica migraciones (hook)
Están bloqueados `prisma migrate reset|dev|deploy|resolve` y `prisma db push|execute`. Los motivos: `prisma.config.ts` carga
`.env.local` y después `.env`, así que cualquier comando con base pega donde apunte esa máquina; el entorno del agente puede
no tener `DATABASE_URL`; y `migrate dev` ofrece un reset si detecta drift.

## Pasos de un cambio de esquema
1. Editar `prisma/schema.prisma`. Las tablas del chatbot llevan `@@map` con prefijo `chatbot_`. Todo modelo con datos de un
   tenant lleva `organizationId` con índice.
2. Generar el SQL sin base, desde Bash (en PowerShell 5.1 la redirección agrega BOM):
   `git show HEAD:logic-core-v3/prisma/schema.prisma > $TMP/schema.anterior.prisma`
   `npx prisma migrate diff --from-schema-datamodel $TMP/schema.anterior.prisma --to-schema-datamodel prisma/schema.prisma --script`
   La salida va a `prisma/migrations/<AAAAMMDDHHMMSS>_<nombre>/migration.sql` (con `chatbot_` en el nombre si es del
   chatbot). Los flags se confirman con `npx prisma migrate diff --help`.
3. Leer el SQL. Un `DROP`, un `NOT NULL` sin default o un `ON DELETE CASCADE` nuevo sobre trabajo del setter o sobre
   auditoría se reporta como riesgo antes de seguir.
4. Correr `npx prisma generate` y `npm run check:types`.
5. En el reporte van los pasos de la persona: `npx prisma migrate dev` contra la branch `dev` de Neon, después
   `npx prisma migrate status`, y en producción `npx prisma migrate deploy` a mano (el build de Netlify no migra: `netlify.toml`).

## Siempre
- Después de traer migraciones (pull o merge): `npx prisma generate`. Con el client viejo los tipos pasan, pero el runtime
  falla con `Unknown argument`.
- Para limpiar la base de dev se recrea la branch `dev` desde `main` en Neon. Nunca `migrate reset`, contra ninguna branch.

## Nunca
- Editar una migración ya aplicada, ni dejar archivos sueltos en `migrations/` (hoy hay un `__diff_check.sql` de abril).
- Correr un seed que muta datos sin `prisma/seed-guard.ts` (`assertDevSeedTarget`, `requireSeedPassword`). Las contraseñas
  de seed van por variable de entorno, nunca en docs.
- Imprimir `DATABASE_URL` u otra variable para ver a dónde apunta.
````

## 4. De prosa a mecanismo

| Regla | Mecanismo | Detalle | Evidencia |
|---|---|---|---|
| Nunca `any` (CLAUDE.md:10; AGENTS.md:15, :78) | Gate de ESLint bloqueante en CI con `@typescript-eslint/no-explicit-any` | Crear `logic-core-v3/eslint.gate.config.mjs` solo con las reglas que tienen que estar en cero, para que el gate no dependa de la deuda de 212 problemas del lint completo. No hace falta ninguna dependencia nueva: se reusan el parser y el plugin de `eslint-config-next/typescript` sin sus reglas (`import nextTs from 'eslint-config-next/typescript'; const base = nextTs.map(({ rules, ...resto }) => resto)`), y encima va `{ files: ['src/**/*.{ts,tsx}'], rules: { '@typescript-eslint/no-explicit-any': 'error' } }`. Se confirma con `npx eslint -c eslint.gate.config.mjs --print-config src/auth.ts`. En CI, dentro del job `verificacion` y antes del Veredicto, va un paso `id: lintgate`, `continue-on-error: true`, `run: npx eslint -c eslint.gate.config.mjs --max-warnings 0 src`, y su `outcome` se suma a la condición del Veredicto. Antes de encenderlo hay que sacar los 6 `any` de src. En una segunda fase se extiende a `scripts/` y `prisma/` (DEU-099). | La regla ya está en 'error' (node_modules/@typescript-eslint/eslint-plugin/dist/configs/flat/recommended.js:29, que llega por eslint-config-next/dist/typescript.js:32 y eslint.config.mjs:3, :7), pero CI no corre lint (ci.yml:20-31). Los 6 `any` de 57c421bc: src/components/canvas/LiquidProject.tsx:8, src/lib/integrations/pagespeed.ts:77, src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:601 y src/modules/chatbot/components/dashboard/ClientSettingsForm.tsx:26, :36 y :37. |
| Animación con el paquete `motion`, no con `framer-motion` (CLAUDE.md:3; §10.22) | `no-restricted-imports` de `framer-motion` en el gate y en eslint.config.mjs | Se agrega `{ name: 'framer-motion', message: 'El paquete es motion: importar de motion/react.' }` en `paths`. Ojo con flat config: el último bloque que configura una regla para un archivo reemplaza sus opciones. Por eso la entrada se repite dentro de los bloques del motor (eslint.config.mjs:17-47) y del chatbot (:52-76); si no, esos archivos se quedan sin la restricción. Antes de encender hay que migrar los 3 imports. `ui/KineticText.tsx` es un archivo protegido (ui/*), así que el sprint lo tiene que declarar. | package.json declara motion ^12.36.0 y no framer-motion. 215 archivos importan motion/react y 3 importan framer-motion: src/components/sections/home/About.tsx, src/components/sections/home/Portfolio.tsx y src/components/ui/KineticText.tsx. |
| Aislamiento multi-tenant en chatbot y motor (CLAUDE.md:110) | Llevar al gate de CI las reglas de eslint que ya existen | Copiar al gate los bloques de eslint.config.mjs:17-87: el no-restricted-imports de @/lib/prisma, **/lib/prisma, @/modules/* y @/app, y el no-restricted-syntax sobre `NewExpression[callee.name='PrismaClient']`, sumando la entrada de framer-motion. Hoy son reglas que nadie corre en CI, así que la frontera B0-S3 solo se cumple si alguien corre `npm run lint` a mano. | eslint.config.mjs:48-87 (frontera B0-S3) y ci.yml:20-31 (el lint está fuera de CI). |
| Nunca loguear valores de variables de entorno (CLAUDE.md:62) | `no-restricted-syntax` en el gate | Selector: `CallExpression[callee.object.name='console'] MemberExpression[object.object.name='process'][object.property.name='env']`, con el mensaje «No loguear variables de entorno». Hay que medir antes de encenderlo. Además hay que corregir docs/operations/00-entornos.md:146, que manda imprimir DATABASE_URL. Cubre solo console.*; el logger propio queda para una segunda fase. | CLAUDE.md:62 y docs/operations/00-entornos.md:146. |
| Archivos protegidos y autoprotección de la configuración (CLAUDE.md:11, :163-170 → política de 11-CONGELADOS.md:46-61) | Hook PreToolUse de Claude Code sobre Edit\|Write\|MultiEdit\|NotebookEdit | En `.claude/settings.json` (versionado): `{"hooks":{"PreToolUse":[{"matcher":"Edit\|Write\|MultiEdit\|NotebookEdit","hooks":[{"type":"command","command":"node $CLAUDE_PROJECT_DIR/.claude/hooks/proteger-archivos.mjs","timeout":5}]}]}}`. El script lee de stdin `tool_input.file_path` (o `notebook_path`), lo pasa a ruta relativa del repo con `/`, y decide con dos fuentes. La primera es `logic-core-v3/docs/auditoria-2026-10/06-ATLAS/zonas.json`: su clave `congelados` se reemplaza por `protegidos` y `prohibidos` cuando se adopte la política (regenerar.md:36), y la clave `franco` ya existe. La segunda es `.claude/sprint.json`, un archivo local e ignorado que escribe la persona al abrir el sprint: `{"id":"…","declarados":["logic-core-v3/src/auth.ts"],"atlas":"aplica"}`. La respuesta sale por stdout como `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny\|ask","permissionDecisionReason":"…"}}`. Las decisiones: un archivo de `prohibidos` (HeroArtifact.tsx) → deny siempre. Un protegido no declarado → deny, con el motivo y el gate de su ficha. Un archivo de la zona de Franco no declarado → ask. Autoprotección (`.claude/settings.json`, `.claude/hooks/**`, `.claude/sprint.json`, `zonas.json`) → deny, para que el agente no se pueda autorizar solo. Para versionar todo esto, `.gitignore:2` (`.claude/`) pasa a `/.claude/*` con las excepciones `!/.claude/settings.json`, `!/.claude/hooks/`, `!/.claude/agents/`, `!/.claude/launch.json` y `!/.claude/skills/`, más `/.claude/skills/*` y `!/.claude/skills/atlas-actualizar/`; `logic-core-v3/.claude/` sigue ignorado. Límite: el hook no ve escrituras hechas por Bash (`echo >`, `sed -i`). El hook de comandos puede rechazar los comandos que nombran rutas protegidas. Si la ruta del repo tiene espacios, hay que entrecomillar `$CLAUDE_PROJECT_DIR`. | 11-CONGELADOS.md:41 (no hay CODEOWNERS, hook ni test que cubra los congelados), :50-52 (niveles) y :60 (pide este hook). zonas.json (claves congelados y franco). .gitignore:1-4. |
| Nunca migrate reset (CLAUDE.md:9); los commits los hace una persona; el build no es del agente (CLAUDE.md:139, :146 → DEC-05) | Hook PreToolUse sobre Bash\|PowerShell | Matcher `Bash\|PowerShell` (este entorno tiene las dos tools), con el comando `node $CLAUDE_PROJECT_DIR/.claude/hooks/comandos-bloqueados.mjs`. El script lee `tool_input.command` y devuelve deny, con el motivo y la alternativa, si el comando matchea alguno de estos patrones: `\bgit(\s+-C\s+\S+)?\s+add\s+(\.\|-A\|--all\|-u\|:/)(\s\|$)` · `\bgit(\s+-C\s+\S+)?\s+commit\b[^\|;&]*\s(-a\w*\|--all)\b` · `\bgit(\s+-C\s+\S+)?\s+(stash\|reset\|clean)\b` · `\bgit(\s+-C\s+\S+)?\s+(checkout\|restore)\s+(--\s+)?\.(\s\|$)` · `\bprisma\s+migrate\s+(dev\|reset\|deploy\|resolve)\b` · `\bprisma\s+db\s+(push\|execute)\b` · `\b(npm\|pnpm\|yarn)\b[^\|;&]*\brun(-script)?\s+(build\|start:qa\|start:setter\|start:galeria)\b` · `\bnext\s+build\b`. Además de lo pedido, se agregan `migrate deploy`, `migrate resolve` y `db push\|execute`, que pegan a la base que cargue prisma.config.ts (y prod se migra a mano), y los `start:*`, que encadenan el build. Límites: no ve un script que corra esto por dentro. Tampoco ve `preview_start` de `next-prod-qa`, que encadena el build igual (.claude/launch.json:20); para cerrarlo hay que agregar un matcher para esa tool o dejar `next-prod-qa` en solo `next start`. | Memorias feedback_no_git_operations.md:11-19, repo_git_stash_crlf.md:21 y repo_git_rm_se_cuela.md:11-17. .gitignore:15-19 (`git add .` mete los worktrees como gitlinks). prisma.config.ts:23-24. netlify.toml:2. next.config.ts:31-39. ci.yml:33-35. DEC-05 y DEC-08. Franco/Work Flow/Iniciar Nuevo Chat/config-ejecucion-claude-desktop.md:38 y :86-87 (pide deny rules y guardrails estructurales). |
| Franco como segundo revisor en su zona y en los protegidos (11-CONGELADOS.md:58) | `.github/CODEOWNERS` + protección de rama | Una línea por cada patrón de `zonas.json` clave `franco` → `@<usuario de Franco>`, y los protegidos → Valentino y Franco. Solo bloquea de verdad si `main` tiene activada «Require review from Code Owners». | 11-CONGELADOS.md:41, :58 y :60. ci.yml:125 (repo frc11/PorfolioDevelOP). |
| Colores de servicio (CLAUDE.md:99-103) | Invariante `check:invariant:acentos-servicio` | Un script tsx sin base que lee `src/app/globals.css` (`--color-ds-accent-web\|ia\|automation\|software`), el frontmatter de `DESIGN.md` (accent-*) y `src/lib/design-tokens.ts` (`web\|ia\|automation\|software`), y exige los mismos cuatro hex en los tres. Hoy falla por design-tokens.ts:95-98. Como esos colores no tienen consumidores (solo zIndex los tiene, DEU-100), se borra ese bloque o se alinea. Hay que subir INVARIANTES_ESPERADOS (scripts/run-invariants.mjs:81). | globals.css:60-63, design-tokens.ts:95-98, DESIGN.md:17-20, AGENTS.md:56-58 y §10.12. |
| Navegación por superficie (CLAUDE.md:12-20) | Invariante `check:invariant:navegacion` con un padrón de excepciones que solo puede achicarse | Recorre src con `git ls-files` y hace tres cosas: (1) falla si hay `router.push(` en el sitio público, es decir fuera de `src/app/(protected)/`; (2) en `src/app/(protected)/admin` y `dashboard`, exige `// nav-imperativa: <motivo>` en la línea anterior a cada `router.push(`; (3) falla si `admin` o `dashboard` importan `triggerTransition`. `/setter` queda afuera hasta que Franco decida (DEU-082). Los casos de hoy (DEU-024, DEU-035, DEU-039; DEU-003 ya está justificado) entran al padrón, cada uno con su motivo. | 33 router.push en src a 57c421bc. DEU-024, DEU-035, DEU-039 y DEU-082. setter-nav.tsx:45. Memoria repo_padron_que_atrapa_al_autor (enumerar las exclusiones con motivo). |
| dpr máximo [1, 1.5] (CLAUDE.md:71) | Invariante `check:invariant:dpr` | Falla si algún `dpr=` tiene un valor mayor a 1.5 (un `2` literal o un array cuyo segundo elemento pasa de 1.5). Hoy falla en DotMatrix.tsx:213 y LegacyNeuroAvatar.tsx:940. `quality.dpr` (HeroBackground.tsx:292) se revisa a mano. | src/components/canvas/DotMatrix.tsx:213 y src/modules/chatbot/components/avatar/LegacyNeuroAvatar.tsx:940. |
| La lógica nueva tiene su test (CLAUDE.md:131; manual-flujo nivel 1) | El runner de invariantes también descubre los `test:*` que apuntan a un `.invariant.ts` | scripts/run-invariants.mjs:106 filtra solo `check:invariant` y `check:invariant:*`, así que los 28 `test:*` del chatbot no corren nunca en CI. La propuesta es ampliar el filtro a los `test:*` cuyo comando nombra un `.invariant.ts`, pasar a EXCLUIDOS (con su motivo) los que necesitan base o Vertex, y ajustar INVARIANTES_ESPERADOS (:81). | package.json (28 scripts test:* con .invariant.ts, desde test:ev1 hasta test:p2002), run-invariants.mjs:81 y :106-110, y ci.yml:102-105. |
| Sin secretos en código ni en docs (CLAUDE.md:23) | Escaneo de secretos del diff en CI, sin dependencias nuevas | Adaptar `scripts/auditoria/secrets-historial.mjs`, que ya reporta tipo y archivo sin imprimir nunca el valor, a un modo `--rango <base>..HEAD`, y correrlo como paso del job `verificacion`. Antes hay que sacar las contraseñas de seed de README.md:29-30 y STATUS.md:258-259. | secrets-historial.mjs:1-13, README.md:29-30, STATUS.md:258-259 y prisma/seed-guard.ts:9-10. |
| Zod en cada server action (CLAUDE.md:58) | Invariante de medición, sin gate al principio | Lista los archivos con 'use server' que exportan funciones con parámetros y no importan zod ni un schema. Arranca como padrón de los 25 casos de hoy, revisados uno por uno (algunos no reciben input), y después solo puede bajar. | Medición sobre 57c421bc: 25 de 90 archivos con 'use server' sin zod (por ejemplo src/actions/agency-actions.ts y src/lib/actions/leads.ts). |
| El Atlas acompaña al código (definición de terminado, punto 6) | Hooks SessionStart y Stop, skill atlas-actualizar y job de CI `atlas` | El diseño completo está en ciclo_mapa. Hay dos requisitos en los generadores: (a) `generar.mjs --ref worktree` lee `git ls-files` (generar.mjs:31), así que no ve archivos nuevos sin `git add` hasta que una persona los agrega; hay que sumar `git ls-files --others --exclude-standard` en el modo worktree. (b) Hace falta un flag `--sin-historial` para que las corridas de sprint no agreguen una línea a historial.jsonl con el sha de HEAD y un contenido que no es el de HEAD (generar.mjs:231-237). | regenerar.md:7, :12, :29-38. generar.mjs:31 y :231-237. validar-atlas.mjs:38-42 (falla si el curado tiene un id que no es nodo). |

## 5. Ciclo de actualización del mapa

- **Definición de terminado (en CLAUDE.md):** Va en el CLAUDE.md raíz, en la sección «Definición de terminado» del borrador. Un sprint está terminado cuando se cumplen estos ocho puntos: (1) `npm run check:types` en verde; (2) `npm run check:invariants` en verde, con el invariante de la lógica tocada si es de negocio o aislamiento, e INVARIANTES_ESPERADOS al día; (3) `npx eslint -c eslint.gate.config.mjs src` en verde; (4) si tocó el schema, migración generada sin base según prisma/CLAUDE.md y `npx prisma generate`; (5) si tocó pantallas, visual-qa en desktop y mobile, o «VERIFICACIÓN PENDIENTE»; (6) si tocó logic-core-v3/src/ o logic-core-v3/prisma/, Atlas al día con la skill atlas-actualizar: atlas.curado.json refleja el cambio y `validar-atlas.mjs` sale 0; (7) un reporte con el encabezado `## Cierre del sprint` que lista archivos, comandos y resultados, decisiones no pedidas, hallazgos fuera de alcance, `git add` archivo por archivo y un mensaje sin tildes; (8) verificación humana del fondo. El encabezado fijo del punto 7 es lo que el hook Stop usa para saber que el agente está cerrando, y no frenarlo cuando hace una pregunta a mitad de sprint. La regeneración oficial del Atlas no es parte del sprint: después del merge a main, una persona corre regenerar.md con `--ref origin/main`, y eso suma la línea de historial con el sha de main (regenerar.md:7). Esta definición sale de juntar la de Franco (develOP-manual-flujo (1).md:652-658: tres niveles más el registro) y su DoD de ejecución (config-ejecucion-claude-desktop.md:65-69: tsc como gate y prisma generate). La bitácora se reemplaza por las `notas` del Atlas, salvo que Franco decida mantener docs/bitacora-beta-3.md.
- **Skill de proyecto `atlas-actualizar`:** Archivo: `.claude/skills/atlas-actualizar/SKILL.md` en la raíz del repo, versionado con la excepción de .gitignore descrita en mecanismos.

---
name: atlas-actualizar
description: Pone al día el Atlas del repo (logic-core-v3/docs/auditoria-2026-10/06-ATLAS) después de cambiar código. Usar siempre antes de cerrar un sprint que tocó logic-core-v3/src/ o logic-core-v3/prisma/, cuando el hook Stop avisa que el Atlas quedó atrás, o cuando piden «actualizá el mapa» o «actualizá el atlas».
allowed-tools: Read, Grep, Glob, Edit, Bash(git status:*), Bash(git diff:*), Bash(git ls-files:*), Bash(node scripts/auditoria/atlas/generar.mjs:*), Bash(node scripts/auditoria/atlas/vistas.mjs:*), Bash(node scripts/auditoria/atlas/validar-atlas.mjs:*), Bash(node scripts/auditoria/validar.mjs:*)
---

# Atlas: actualizar al cerrar un sprint

Todo se corre desde `logic-core-v3/`. El Atlas es `docs/auditoria-2026-10/06-ATLAS/`.
Hay dos clases de archivos. Los datos que mantienen las personas se editan a mano y ningún generador los pisa: `funcionalidades.json`, `zonas.json`, `entradas.json` y `atlas.curado.json`. Los generados no se editan: `atlas.json`, `historial.jsonl`, `hallazgos.json` y las vistas `.md`.

## 1. Qué cambió
`git status --porcelain -- src prisma` (modificados, borrados y sin rastrear). Si no hay cambios ahí, terminás y lo decís.

## 2. A qué nodos pertenece
Cada ruta se busca en `atlas.json` (`nodos[].archivos`) y en `funcionalidades.json` (`archivos`).
- Un archivo nuevo de una funcionalidad que ya existe se suma a sus `archivos` en `funcionalidades.json`.
- Una funcionalidad nueva se da de alta en `funcionalidades.json` (id `<herramienta>.<slug>`, nombre, descripcion, padre, archivos, entradas) y en `atlas.curado.json`.
- Una carpeta nueva de `src/` necesita una regla en `scripts/auditoria/atlas/nodos.mjs`. No se inventan ids ni se renombran: se reporta como pendiente.
- Si se borró código y su nodo desaparece, se borra su entrada de `atlas.curado.json`; si no, validar-atlas falla.

## 3. Qué se escribe en atlas.curado.json (solo en los nodos tocados)
- `madurez` (L0 a L4) y `madurez_evidencia`: el camino feliz con `ruta:línea`, verificado leyendo el código y no el reporte.
- `criterios_l3_faltantes`: se saca lo que el sprint cumplió y se agrega lo que rompió.
- `notas`: se agrega al final `AAAA-MM-DD · <sprint>: <qué cambió, en una línea>`.
- `veredicto`: solo si el sprint lo cambió (por ejemplo de `mejorar` a `mantener`).
- Nunca se tocan `alcance` ni `alcance_propuesto`, ni se agregan `decisiones` ({fecha, texto, quien}) que no dictó una persona: eso lo deciden Valentino y Franco.
- `zonas.json` se toca solo si una persona decidió mover un archivo de zona.

## 4. Regenerar y validar
    node scripts/auditoria/atlas/generar.mjs --ref worktree --sin-ramas --sin-historial
    node scripts/auditoria/atlas/vistas.mjs
    node scripts/auditoria/atlas/validar-atlas.mjs
`validar-atlas` tiene que salir 0. Si el sprint cambió los registros de la auditoría (02, 03, 04, 05 o 10), antes se corre `node scripts/auditoria/validar.mjs --emitir`. Hay que comparar el `control` que imprime generar (páginas, handlers, archivos con acciones, modelos, funcionalidades) con el de `atlas.json` anterior: si cambia sin que haya cambiado el código correspondiente, se rompió el generador y se reporta.

## 5. Reportar
En el `## Cierre del sprint` van los nodos tocados con su madurez antes y después, el `control`, y los archivos nuevos sin rastrear: `--ref worktree` no los ve hasta que una persona hace `git add`, así que se listan para regenerar después. El Atlas oficial se regenera después del merge con `--ref origin/main` (regenerar.md).

No se hace: correr npm, otras operaciones de git que no sean status, diff o ls-files, ni editar código de `src/`.

Antes de crear esta skill hay que implementar en generar.mjs el flag `--sin-historial` y la inclusión de archivos sin rastrear en el modo worktree (ver mecanismos).
- **Hook `Stop`:** Archivos: `.claude/hooks/sesion-base.mjs` (SessionStart) y `.claude/hooks/atlas-al-cerrar.mjs` (Stop). Se registran en `.claude/settings.json` así: `"SessionStart":[{"hooks":[{"type":"command","command":"node $CLAUDE_PROJECT_DIR/.claude/hooks/sesion-base.mjs"}]}]` y `"Stop":[{"hooks":[{"type":"command","command":"node $CLAUDE_PROJECT_DIR/.claude/hooks/atlas-al-cerrar.mjs","timeout":15}]}]`.

(1) sesion-base.mjs toma el `session_id` de stdin y guarda en `.claude/.estado/<session_id>.json` (ignorado por git) dos cosas: la lista de `git status --porcelain=v1 -z -- logic-core-v3/src logic-core-v3/prisma` y el sha1 de `logic-core-v3/docs/auditoria-2026-10/06-ATLAS/atlas.curado.json`. Si `source` es `resume` y el archivo ya existe, no lo pisa. Así, lo que ya estaba sucio antes de la sesión no cuenta.

(2) atlas-al-cerrar.mjs corre en cada Stop y sigue estos pasos:
(a) lee el último mensaje del asistente en `transcript_path` y solo sigue si contiene `## Cierre del sprint`. Stop corre al final de cada respuesta; sin este filtro bloquearía una pregunta a mitad de sprint.
(b) Calcula `tocados`: las rutas de `git status` bajo logic-core-v3/src/ o logic-core-v3/prisma/ que no estaban en la foto inicial.
(c) Calcula si el curado cambió: el sha1 actual de atlas.curado.json contra el inicial.
(d) Mira si el sprint está exento: `.claude/sprint.json` con `"atlas": "no-aplica"`. Ese archivo lo escribe la persona; el hook de archivos impide que lo escriba el agente.
(e) Si hay `tocados`, el curado no cambió y no está exento, imprime `{"decision":"block","reason":"Tocaste N archivos de src/ o prisma/ (los primeros 5…) y atlas.curado.json no cambió en esta sesión. Corré la skill atlas-actualizar y volvé a cerrar."}`, suma 1 a un contador en el archivo de estado y sale 0.
(f) Corte del bucle: con `stop_hook_active` en true y 2 bloqueos ya hechos en la sesión, sale 0 con `{"systemMessage":"Atlas sin actualizar: el reporte tiene que decirlo."}`.
(g) En cualquier otro caso, sale 0 sin salida.

En la máquina de Franco convive con el Stop de Impeccable (30 s, A3-ESTADO-ECC-SKILLS-2026-08.md:52-61): no se pisan, pero suman tiempo. El servidor tiene un control equivalente en el paso `curado` del job de CI, por si el cambio llega sin pasar por Claude Code.
- **Chequeo de CI (avisa, no rompe):** Son dos cambios en `.github/workflows/ci.yml` (raíz). Requisito previo: que `logic-core-v3/scripts/auditoria/` y `logic-core-v3/docs/auditoria-2026-10/` estén en main; hoy viven solo en la rama de la auditoría (`git ls-tree 57c421bc` no tiene scripts/auditoria).

1) En el job `verificacion`, antes de «Veredicto». Es bloqueante, como tipos e invariantes:

      - name: 'Lint gate: reglas en cero'
        id: lintgate
        continue-on-error: true
        run: npx eslint -c eslint.gate.config.mjs --max-warnings 0 src

   Y en «Veredicto» se suma `|| [ "${{ steps.lintgate.outcome }}" != "success" ]` a la condición.

2) Un job nuevo `atlas`, que valida sin romper: lleva continue-on-error a nivel de job, así que el workflow sigue en verde y no entra al Veredicto. Se puede promover a bloqueante cuando lleve un tiempo estable.

  atlas:
    name: Atlas (avisa, no bloquea)
    runs-on: ubuntu-latest
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - name: Contrato de los JSON commiteados
        id: contrato
        continue-on-error: true
        run: node scripts/auditoria/atlas/validar-atlas.mjs
      - name: Curado contra el código de este commit
        id: fresco
        continue-on-error: true
        run: |
          tmp="$RUNNER_TEMP/atlas"
          cp -r docs/auditoria-2026-10/06-ATLAS "$tmp"
          node scripts/auditoria/atlas/generar.mjs --ref HEAD --sin-ramas --atlas "$tmp"
          node scripts/auditoria/atlas/validar-atlas.mjs --atlas "$tmp"
      - name: Cambió src/ o prisma/ sin tocar el curado
        id: curado
        if: github.event_name == 'pull_request'
        continue-on-error: true
        run: |
          cambios=$(git diff --name-only "${{ github.event.pull_request.base.sha }}"...HEAD)
          if echo "$cambios" | grep -qE '^logic-core-v3/(src|prisma)/' && ! echo "$cambios" | grep -q '06-ATLAS/atlas.curado.json'; then
            echo '::warning::El PR cambia src/ o prisma/ y no toca atlas.curado.json: correr la skill atlas-actualizar.'
            exit 1
          fi
      - name: Resumen
        if: always()
        run: |
          {
            echo '### Atlas'
            echo "- contrato: ${{ steps.contrato.outcome }}"
            echo "- curado contra el código: ${{ steps.fresco.outcome }}"
            echo "- curado en el PR: ${{ steps.curado.outcome }}"
          } >> "$GITHUB_STEP_SUMMARY"
          if [ "${{ steps.contrato.outcome }}" = failure ] || [ "${{ steps.fresco.outcome }}" = failure ] || [ "${{ steps.curado.outcome }}" = failure ]; then
            echo '::warning::El Atlas quedó atrás del código; ver el resumen del job.'
          fi

Notas:
- El workflow ya fija `defaults.run.working-directory: logic-core-v3` (ci.yml:70-72), así que las rutas son relativas a la app; `git diff --name-only` igual devuelve rutas desde la raíz del repo.
- validar-atlas.mjs no tiene dependencias (validar-atlas.mjs:2-4) y generar.mjs solo usa Node y git (scripts/auditoria/atlas/README.md), por eso el job no necesita `npm ci`.
- El paso `fresco` escribe en una copia temporal, así que no ensucia historial.jsonl. Detecta un id del curado que ya no existe como nodo, por ejemplo una funcionalidad renombrada (regenerar.md:30).
- Como el resto del workflow, corre en cada push de cualquier rama (ci.yml:65, DEC-04).

## 6. AGENTS.md, STATUS.md y DEPLOY.md

- **`logic-core-v3/AGENTS.md`** — Reducirlo a un puntero de unas 5 líneas hacia ../CLAUDE.md y los CLAUDE.md anidados. Conviene que el archivo exista porque Codex y otros agentes lo leen por convención. Lo propio que vale se mueve y el resto se borra.. Duplica unas 12 reglas de CLAUDE.md: any (:15, :78), HeroArtifact (:76), Server Components (:80), secretos (:84), triggerTransition (:86), strokeWidth (:33), spring (:37), ease (:17, :38), AnimatePresence (:41), will-change (:43), vidrio (:45-52) y migrate reset (:148, :159). En cinco puntos contradice al código o a CLAUDE.md: colores (:56-58 contra globals.css:60-63), IA con Anthropic (:22, :137 contra el chatbot en Vertex de factory.ts y STATUS.md:226), `migrate dev` (:146 contra el protocolo nuevo), build como gate (:152 contra ci.yml:33-35) y estructura (:111-113 pone prisma/ dentro de src/ y le faltan src/modules/ y /setter; :95 no menciona SETTER). Además está viejo: el piloto San Miguel (:10) es seed falso según STATUS.md:183, las herramientas Antigravity y Codex (:153-158) ya no son las de trabajo, y hay un cierre de bloque de código suelto en :185. Lo propio que vale tiene destino: el copy rioplatense (:82) pasa al borrador; los tamaños de íconos (:34), fondos (:60-62), tipografía (:64-67) y touch targets (:70) van a docs/design-system.md del portal; los modelos (:116-129) los cubre el Atlas (06-ATLAS/datos.md); y las variables de entorno (:131-141) van a docs/env-vars.md.
- **`logic-core-v3/STATUS.md`** — Archivarlo como histórico: moverlo a docs/historico/STATUS-2026-05-21.md, o ponerle un encabezado que diga «HISTÓRICO — no es fuente de verdad». El estado vivo pasa al Atlas (atlas.json, historial.jsonl y atlas.curado.json). Hay que sacarle las contraseñas de seed (:258-259) y hacer que README.md:48 apunte al Atlas.. Se declara «fuente única de verdad» (:7) y su última actualización es del 2026-05-21 (:3). El código ya lo contradice en varios puntos: dice 42 migraciones (:89, :252) y hay 86 carpetas en prisma/migrations; dice que el rate limiter es in-memory (:204) y src/lib/rate-limit/limiter.ts:44 lo persiste en la base; dice «Matsu no existe en código» (:177) y existen scripts/seed-matsu.ts y otros cinco seed-matsu-*; dice tests 39/50 (:19, :95-102) a partir de una sola corrida; y dice «Resend o Brevo» (:16). Tiene contraseñas de seed en texto plano (:258-259, valores omitidos) en un repo público. El host de la branch dev de Neon (:86, :299) no es una credencial, pero tampoco es estado.
- **`logic-core-v3/DEPLOY.md`** — Reescribirlo en unas 30 líneas para Netlify, o borrarlo y apuntar a docs/netlify-env-vars.md y docs/operations/00-entornos.md. Tiene que decir: el build es `npx prisma generate && npm run build` (netlify.toml:2), las migraciones se aplican a mano con `migrate deploy`, Netlify usa Node 22 y CI Node 24, y qué crons dispara Netlify y cuáles no.. DEPLOY.md:1-3, :7 y :11-33 describen un deploy en Vercel (con Supabase o Railway en :9) y variables RESEND y N8N (:21-23). La configuración viva es Netlify (netlify.toml:1-32), y README.md:49 y :72 ya lo dicen. Los crons de vercel.json:4, :8 y :12 no tienen quién los dispare en Netlify, y api/cron/alerts y detect-bot-issues no figuran en ningún registro (§10.9). El checklist «Auditoría de Producción (Finalizada)» (:57-62) no tiene evidencia. Netlify corre Node 22 (netlify.toml:6) y CI Node 24 (ci.yml:87).
- **`logic-core-v3/README.md`** — Actualizar los punteros y sacar las credenciales.. README.md:48 presenta STATUS.md como fuente de verdad. README.md:49 dice «DEPLOY.md — Guía de deploy en Netlify», pero el archivo describe Vercel. README.md:29-30 publica contraseñas de seed (valores omitidos), cuando prisma/seed-guard.ts:9-10 ya las pide por variable de entorno. README.md:58 lista `npm run build` como test, y el gate es check:types (ci.yml:33-35).
- **`logic-core-v3/docs/operations/00-entornos.md`** — Corregir tres líneas.. :17 dice que Prisma CLI lee solo .env, y es falso desde prisma.config.ts:13-24, que carga .env.local y después .env. :86 dice que Netlify aplica migrate deploy en el build, y netlify.toml:2 no lo hace. :146 manda imprimir DATABASE_URL, contra CLAUDE.md:62.
- **`logic-core-v3/src/modules/chatbot/README.md`** — Corregir la regla 1 de la frontera y el stack, o reducirlo a descripción y dejar las reglas en el CLAUDE.md anidado del chatbot.. La regla 1 (README.md:11, «except @/lib/prisma») contradice eslint.config.mjs:48-87, que prohíbe @/lib/prisma y obliga a pasar por src/lib/isolation. El README dice «@ai-sdk/google» (:31), pero package.json tiene @ai-sdk/google-vertex ^4.0.128. Las rutas /admin/chatbot/knowledge y /admin/chatbot/config (:45-46) ya no son las canónicas, que es /admin/chatbots (STATUS.md:216).
- **`DESIGN.md y PRODUCT.md (raíz)`** — Mantenerlos. El CLAUDE.md propuesto los cita como la ley del sitio público y deja el vidrio para los portales.. PRODUCT.md:9-13 los acota al sitio de marketing, y DESIGN.md:291 prohíbe glassmorphism y backdrop-blur. La contradicción con CLAUDE.md:97 se resuelve dándole alcance a cada uno. Sigue abierto DEU-098: el Navbar público usa lo que DESIGN.md prohíbe (es de F3).
- **`.impeccable/design.json, .github/skills/impeccable/, .github/hooks/impeccable.json (raíz)`** — Mantener Impeccable acotado al sitio público y elegir entre dos caminos: (a) versionar la copia de Claude en .claude/skills/impeccable (con la excepción de .gitignore) y limitar su hook PostToolUse a los archivos del sitio público; o (b) dejarla local y borrar la copia de Copilot si nadie usa Copilot. design.json se queda en los dos casos: lo leen los scripts del detector (context.mjs, detector/cli/main.mjs) y sus colores coinciden con globals.css.. Sí se usa: hay un baseline (docs/impeccable-baseline.md) y mediciones en docs/bitacora-beta-3.md:2767-2768. Pero lo instaló Franco (b7aca287, 2026-08-03) y, según ese mismo commit, la copia de .github es para Copilot y la de Claude vive en .claude/, que .gitignore:2 ignora. Claude Code no lee .github/hooks (impeccable.json:4-8 usa el formato postToolUse/bash de Copilot). En la máquina de Valentino, C:\PorfolioDevelOP\.claude\skills solo tiene copy-editing, copywriting y cro. Choca con el stack en tres puntos: la craft-floor rechaza el vidrio y el texto en gradiente como decoración (contra CLAUDE.md:97 en los portales); SKILL.md:13-14 («Go all out», «Dream big») va contra el sprint atómico; y su hook Stop de 30 s corre en cada sesión, toque UI o no (A3-ESTADO-ECC-SKILLS-2026-08.md:52-61). Además, el commit prohibió los comandos que escriben código «hasta que B2 esté terminado», y no hay registro en main de que se haya levantado. Recursos DevelOP.md:386 también recomienda no tener Impeccable, Taste y frontend-design prendidos a la vez.
- **`.claude/agents/visual-qa.md y .claude/launch.json (raíz); logic-core-v3/.claude/launch.json`** — Mantener visual-qa y actualizarlo en dos puntos: que diga que hay tres servers (next-dev, next-dev-qa en :3002 y next-prod-qa), y que reporte «VERIFICACIÓN PENDIENTE» cuando no tenga las herramientas preview_*. Unificar launch.json en la raíz.. visual-qa.md:36 dice «Hay DOS servers», pero .claude/launch.json:4-22 define tres. visual-qa depende de mcp__Claude_Preview__* (visual-qa.md:9-19) y viene fallando sin esas herramientas (memoria repo_verification_workflow.md:27). logic-core-v3/.claude/launch.json:1-17 duplica la configuración con solo dos entradas y queda ignorado por .gitignore:2. visual-qa.md:51 ya pide que el build lo corra Franco, lo que es coherente con el hook de comandos.
- **`Drive: Franco/Work Flow/Iniciar Nuevo Chat/config-ejecucion-claude-desktop.md`** — No es del repo. Avisarle a Franco una corrección y pedirle una decisión.. La corrección: :68 dice que next.config.ts tiene ignoreBuildErrors: true, y es falso desde next.config.ts:31-34. La decisión: su DoD (:65-69) coincide con el borrador (tsc como gate y prisma generate) salvo en la bitácora docs/bitacora-beta-3.md; hay que decidir si el registro de cierre sigue ahí o pasa a las `notas` del Atlas. Por lo demás, :38 y :86-87, junto con develOP-manual-flujo (1).md:356, ya piden guardrails estructurales (hooks y deny rules), que es lo que proponen los mecanismos.
- **`Drive: Recursos DevelOP.md`** — Usarlo solo como referencia. Dos ideas suyas ya están adoptadas en el borrador.. Los principios del CLAUDE.md «Karpathy» de :394-398 (no asumir en silencio, simplicidad, no tocar lo que no se pidió) ya están en las reglas de alcance. La matriz de control de acceso de :451 se convirtió en la tabla de roles del borrador. El rate limiting estricto de :447 coincide con CLAUDE.md:60.
