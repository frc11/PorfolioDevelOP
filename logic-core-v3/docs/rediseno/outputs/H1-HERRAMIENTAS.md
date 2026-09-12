# H1 — HERRAMIENTAS Y LICENCIAS

> Rama `rediseno/home` · worktree `C:\rediseno-home` · auditoría de dos partes
> (skills y recursos externos) con un solo filtro de cinco criterios.
> **Nada se instaló salvo `find-skills`, que era la única instalación
> autorizada. Ninguna candidata entra sin la aprobación del humano.**

---

## 0 · En una pantalla (PARADA)

| | |
|---|---|
| **La que ya estaba adentro hace 23 bloques** | `impeccable` está instalada **dos veces y en dos versiones distintas**: `.claude/skills/` es la **4.1.1** y `.github/skills/` es la **4.0.4**. La `description` es byte por byte idéntica en las dos, así que el disparo es el mismo. |
| 🔴 **La respuesta al gate de A1, medida y no opinada** | **SÍ se activó sola, dos veces, y nadie lo pidió.** No es una inferencia de la `description`: está en los transcripts. `2026-08-16T00:48:32Z` (sprint **S1-cimiento**) y `2026-08-16T23:56:12Z` (sprint **S2-motion**), las dos veces con argumentos **que compuso el modelo**, y en los dos casos el humano **nunca escribió la palabra «impeccable»** antes de la llamada. |
| **Por qué eso importa y no es anécdota** | Los dos sprints que la auto-invocaron son **exactamente los que fundaron el sistema**: `2f405a4a S1: cimiento de tokens, tipografia y estructura del home` y `45f0c575 S2: sistema de motion, tokens y primitivas`. Los 90 tokens y `motion/tokens.ts` se decidieron con `impeccable` en contexto. |
| **El mecanismo existe y `impeccable` no lo usa** | El formato de skill tiene un opt-out, `disable-model-invocation: true`. **`impeccable` no lo declara en ninguna de las dos copias.** Contraste medido: de los 12 de `emilkowalski/skills`, **3 sí lo declaran** (`review-animations`, `pick-ui-library`, `prototype`). |
| **El criterio 1 aplicado a la que ya está adentro** | `impeccable` **menciona GSAP**, en `reference/overdrive.md:53`, **en las dos copias**. Es 1 de 1 aparición en todo el árbol de la skill. Si entrara hoy como candidata, el filtro la descarta por el criterio 1. Está adentro desde el 31-jul, así que el veredicto es **YA INSTALADA Y AUDITADA**, y la salida la decide el humano. |
| **La que el humano sospechaba que pasaba** | `emilkowalski/skills` — 12 skills, 37.028 ★, MIT. **Pasa**, y el único GSAP de las 20 archivos está en `improve-animations/SKILL.md:34`, **medido con `grep -n`, no estimado**. `animate/SKILL.md:25` es lo contrario del criterio 5: *«Extend the codebase's tokens, don't fork them… Adding a parallel system is a defect.»* |
| **La de mobile** | `sleekdotdesign/agent-skills` — **0 menciones de GSAP y 0 de vocabulario de animación** en 564 líneas (verificado con `grep`, no con el resumidor). Pasa el criterio 1 limpio y **cae por el 2 y el 5**: es un cliente REST de un SaaS de pago ($49.99/mes), pide `SLEEK_API_KEY`, impone Iconify («do not substitute») y Google Fonts. |
| 🔴 **La licencia que podía bloquear una decisión tomada** | **NO bloquea. Y la premisa de la instrucción es falsa.** La licencia **está publicada** en https://bookofshapes.com/license, permite uso comercial de forma expresa, no pide atribución, y **distingue** explícitamente usar el SVG descargado (permitido) de copiar el código del sitio (excluido). **Dos condiciones** quedan vivas y hay que chequearlas contra el patrón elegido. |
| **La premisa que no se sostiene** | La instrucción dice que «`docs/rediseno/` ya declara que la licencia no se encontró publicada». **Eso no existe en el repo: 0 menciones de `bookofshapes` en todo el worktree y 0 en toda la historia de git** (`git log --all -S`). No hay declaración previa que corregir. |
| **`morphicons`** | MIT, 6,18 KiB gzip el core y **7,82 KiB el entry de React** (el que aplica). Pasa el criterio 1. Cae por el **3**: trae su **propio `requestAnimationFrame` global y su propio solver de resorte**, o sea un segundo motor al lado de `motion/react`. Y la pregunta previa lo deja sin trabajo: **el home usa 2 íconos**, las dos flechas estáticas del pie, sin par de estados que morphear. |
| **`find-skills`** | Instalada (lo autorizado). Devolvió **170 resultados crudos, 164 únicos** en 9 consultas del stack real. El filtro mecánico descarta **59**; los **4 de arriba de la lista son los de Emil**. ⚠️ **Snyk la marca `Med Risk`** y su `SKILL.md` enseña a instalar con `-g -y` (aprobación automática). |

---

## 1 · El instrumento, antes de cualquier cita

**Los dos subagentes de web avisaron que `WebFetch` no da números de línea
fiables**, y lo demostraron: el mismo GSAP de `improve-animations` volvió como
L10, L29, L39 y L41 en cuatro lecturas, y un pase llegó a devolver el texto del
propio prompt como «línea 597» del archivo.

La salida de este reporte exige citar línea. Así que **no se reportó con el
instrumento roto**: los 20 archivos de `emilkowalski/skills` y los 2 de
`sleekdotdesign` se bajaron crudos al scratchpad —**fuera del worktree**, no es
clonar— y se midieron con `grep -n`. Las líneas de abajo son medidas.

**Qué cambió al medir bien:**

| Afirmación del resumidor | Medido con `grep -n` |
|---|---|
| GSAP en L10 / L29 / L39 / L41 | **`improve-animations/SKILL.md:34`**. Las cuatro estaban mal. |
| `emil-design-eng` tiene el frontmatter **malformado** (`---` duplicado en L1 y L2) | **Falso.** L1 `---`, L2 `name:`, L3 `description:`, L4 `---`. Frontmatter limpio. Era un artefacto del resumidor. |
| `sleek` no tiene vocabulario de animación | **Confirmado: 0 hits** de `gsap|scrolltrigger|anime.js|lottie|reanimated|framer-motion|motion/react|animat|transition|easing|keyframe|spring` en 564 líneas. |

Lo de `impeccable` y lo del repo se midió directo sobre el disco.

**Un dato del repo que le da filo al criterio 1:** la prohibición de GSAP no es
sólo política, está **mecánicamente puesta**. `s5-codigo.invariant.ts:161` usa
`"import gsap from 'gsap'"` como **control positivo** de la lista blanca de
dependencias. Una skill que sugiera GSAP produce código que el invariante
rechaza.

---

## 2 · La tabla

Veredictos: **DESCARTADA** · **CANDIDATA** · **YA INSTALADA Y AUDITADA** · **BLOQUEADA POR LICENCIA**

### Parte A · Skills

| candidata | fuente | veredicto | razón, con cita textual y línea |
|---|---|---|---|
| **`impeccable`** (v4.1.1) | `.claude/skills/impeccable/` (local) | **YA INSTALADA Y AUDITADA** ⚠️ | Falla **crit. 1**: `reference/overdrive.md:53` — *«**Spring physics**: natural motion with mass, tension, and damping instead of cubic-bezier. Libraries: motion (formerly Framer Motion), GSAP, or roll your own spring solver.»* Es 1 de 1 en todo el árbol. Contexto medido: `overdrive.md` lo carga **sólo** el sub-comando `overdrive` (`SKILL.md:59`), no el camino normal. Falla **crit. 3**: tiene 6 comandos que opinan sobre movimiento (`animate`, `polish`, `critique`, `audit`, `delight`, `overdrive`, `SKILL.md:46-59`). Riesgo propio en §3. |
| **`impeccable`** (v4.0.4) | `.github/skills/impeccable/` (local) | **YA INSTALADA Y AUDITADA** ⚠️ | **Copia divergente**: `version: 4.0.4` contra `4.1.1`, y declara 3 campos que la otra no (`user-invocable: true`, `argument-hint`, `license: Apache 2.0`). Mismo GSAP en `overdrive.md:53`. Mismo `description` exacto. Detalle de la divergencia en §3. |
| **`find-skills`** | `vercel-labs/skills` | **YA INSTALADA Y AUDITADA** | La única instalación autorizada. Pasa **crit. 1** (0 menciones de librería de animación) y **crit. 5** (no trae tokens ni sistema). Es un meta-buscador, no opina de diseño. ⚠️ **Snyk: `Med Risk`** (el instalador lo imprimió; Gen: `Safe`, Socket: `0 alerts`). ⚠️ Su `SKILL.md` instruye `npx skills add <owner/repo@skill> -g -y` y aclara *«The `-g` flag installs globally (user-level) and `-y` skips confirmation prompts»* — o sea enseña a instalar **global y sin confirmación**. |
| **`emilkowalski/skills@animate`** | `github.com/emilkowalski/skills` | **CANDIDATA** | Pasa los 5. **crit. 1**: 0 menciones de GSAP / ScrollTrigger / Lottie / three.js en sus 199 líneas. Su tabla de herramientas ofrece 4 opciones y la única librería JS es la nuestra — `:69` *«\| Springs, layout animations, exit animations, gesture-driven values \| **Motion** (`motion.dev`) \|»*. **crit. 5 al revés**: `:25` *«**Extend the codebase's tokens, don't fork them.** If `--ease-out` or a duration scale already exists, use it. Adding a parallel system is a defect.»* ⚠️ **crit. 3**: pisa `impeccable animate` (`SKILL.md:54`). Dos cosas opinando sobre lo mismo. |
| **`emilkowalski/skills@improve-animations`** | idem | **DESCARTADA** | **crit. 1**, aplicado al pie de la letra. `SKILL.md:34` — *«- **Stack**: framework, motion libraries (Framer Motion / Motion, React Spring, GSAP, plain CSS, WAAPI), component libraries (Radix, Base UI, shadcn/ui).»* Contexto medido, para que el humano pueda revocar con dato: es un ítem de **`### Phase 1 — Recon (always first)`** (`:30`), le dice al agente **qué catalogar** de un codebase ajeno, no qué usar; y `:36` dice *«plans must extend these, not invent parallel ones»*. El filtro dice «no sigas leyendo», así que queda descartada. |
| **`emilkowalski/skills@review-animations`** | idem | **CANDIDATA** | **crit. 1**: 0 menciones en `SKILL.md` (112 líneas) y en `STANDARDS.md` (187). **crit. 5**: 0 color literal, 0 `font-family`. Trae `disable-model-invocation: true` (`:4`) — **no se auto-dispara**, que es justo el defecto de `impeccable`. ⚠️ **crit. 3**: se superpone con `impeccable critique`/`polish`. |
| **`emilkowalski/skills@find-animation-opportunities`** | idem | **CANDIDATA** | **crit. 1**: 0 menciones en 132 líneas. Read-only por declaración: `:3` *«Read-only; it proposes motion with exact values, it does not implement it.»* ⚠️ No declara `disable-model-invocation`: **se puede auto-disparar**. |
| **`emilkowalski/skills@animation-vocabulary`** | idem | **CANDIDATA** | **crit. 1**: 0 menciones en 173 líneas. Es un glosario de nombres (`:3` *«Reverse-lookup glossary…»*), no toca código. **crit. 3**: no se superpone con nada nuestro. ⚠️ Auto-disparable. |
| **`emilkowalski/skills@emil-design-eng`** | idem | **CANDIDATA** | **crit. 1**: 0 menciones en 674 líneas. **crit. 5**: 0 hits de color, fuente, tipografía, espaciado, design system o token. Frontmatter limpio (L1-4), medido. ⚠️ 674 líneas es la skill más grande del set después de `write-swift`; ⚠️ auto-disparable. |
| **`emilkowalski/skills@apple-design`** | idem | **CANDIDATA** ⚠️ | **crit. 1**: 0 menciones en 282 líneas. Pero **roza el crit. 5**: es la única del set con opinión tipográfica — `:229` *«`:root { font: 100%/1.5 system-ui, sans-serif; }` /* body: system font, comfortable leading */»*, y manda *«Default to the platform's system font before a custom face»*. Este repo usa **Chivo + Chivo Mono** por decisión cerrada. Choque directo. |
| **`emilkowalski/skills@prototype`** | idem | **CANDIDATA** ⚠️ | **crit. 1**: 0 menciones en 90 líneas. Trae `disable-model-invocation: true` (`:4`). ⚠️ `PICKER.md:45` trae un `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;` y el único color literal de todo el repo de Emil — es andamiaje del picker, no del producto, pero es opinión. |
| **`emilkowalski/skills@ask-sonner`** | idem | **CANDIDATA**, fuera de scope | **crit. 1**: 0 menciones en 80 líneas. **crit. 2 medido**: `sonner ^2.0.7` **sí está instalado** en este repo, así que no es stack ajeno — pero se usa en **0 archivos de `src/app/v3/`** y en 10+ de `src/app/(protected)/admin/`. Aplica a los portales, **no al home**. |
| **`emilkowalski/skills@pick-ui-library`** | idem | **DESCARTADA** | **crit. 3 y 5**. Su oficio es agregar dependencias: `:3` *«Pick the right library for a given frontend task from a curated, opinionated list»*, y recomienda styling (*«Type-safe, variant-driven styling for Tailwind»*). Choca de frente con la regla no negociable de `CLAUDE.md`: *«Never add a dependency without first checking if a native or already-installed alternative exists.»* |
| **`emilkowalski/skills@animate-expo`** | idem | **DESCARTADA** | **crit. 1**: `SKILL.md:71` *«\| Vector illustration, celebration, empty state \| **Lottie** — for illustration only, never for UI state \|»* y `:85` *«\| Illustration, celebration \| `lottie-react-native` \|»*. Además **crit. 2**: React Native / Expo / Reanimated. |
| **`emilkowalski/skills@write-swift`** | idem | **DESCARTADA** | **crit. 2**: Swift. 388 líneas de un lenguaje que este repo no tiene. |
| **`sleekdotdesign/agent-skills@design-mobile-apps`** | `github.com/sleekdotdesign/agent-skills` | **DESCARTADA** | Pasa el **crit. 1 limpio** (0 hits de vocabulario de animación en 564 líneas, `grep`-verificado) y cae por tres. **crit. 2**: `:3` *«…or when implementing Sleek designs in code (HTML, React Native, SwiftUI)»*; `Next.js` y `Tailwind` **ausentes del archivo**. **crit. 5**: impone set de íconos — *«Sleek uses [Iconify](https://iconify.design) icons… **Use the exact icons from the HTML code**. Do not substitute with a different icon set»*— y fuentes: *«The HTML includes Google Fonts via `<link>` tags»*; default `radius: 48`. **crit. 4 / dependencia externa**: `:4` *«compatibility: Requires SLEEK_API_KEY environment variable»*, y el README `:29` pide *«the Pro plan or higher ($49.99/month…)»*. Único skill del repo; 574 ★; MIT; último push 2026-09-05. |

### Parte B · Recursos externos

| candidata | fuente | veredicto | razón, con cita textual y línea |
|---|---|---|---|
| **`bookofshapes.com` (patterns SVG)** | https://bookofshapes.com/license | **CANDIDATA, con dos condiciones** — **NO bloqueada** | Licencia **publicada**. Uso comercial expreso: *«Whatever you generate on this site is yours to use. Commercial or not, modified or as it comes, in print, on screen, on products. No fee, no permission needed, no attribution required.»* Distingue los dos permisos en secciones separadas (detalle y URLs en §4). ⚠️ **Condición 1**: tres patrones nominados quedan **fuera** de la licencia. ⚠️ **Condición 2**: *«a pattern can be part of what you sell. It cannot be the thing you sell.»* |
| **`morphicons`** (npm) | https://registry.npmjs.org/morphicons | **DESCARTADA** | **crit. 1**: 0 menciones de GSAP / ScrollTrigger / anime.js / Lottie. **crit. 3, que es el que la saca**: `"dependencies"` **ausente del manifest** y `peerDependencies` sin `motion` ni `framer-motion` → trae motor propio. El README lo dice solo: *«Damped harmonic oscillator… Integrated with semi-implicit Euler at h = 1/240 s substeps»*, *«~25 lines, no animation library needed»*, *«A single global `requestAnimationFrame` drives all instances.»* Eso es **un segundo scheduler y un segundo modelo de resorte** al lado de `motion/react`. Hay modo compuesto (`progress` explícito, sin resorte) pero **el README no trae receta de interoperación**. Peso: **6,18 KiB gzip** el core, **7,82 KiB** el entry `morphicons/react` (el que aplica); los 153,3 KiB de `unpackedSize` son el tarball, no presupuesto. Licencia **MIT**. 2.490 ★, 98.214 descargas/mes, último commit 2026-09-11 — **pero 6 semanas de vida, un solo mantenedor y 13 releases en las primeras 4 semanas**. ⚠️ No auto-degrada con `prefers-reduced-motion` por decisión declarada. **Y la pregunta previa**: ver §5. |

---

## 3 · El riesgo de `impeccable`, en prosa

**Está adentro desde el 31 de julio y se instaló a propósito.** El commit
`b7aca287 chore(impeccable): instala el detector y fija el baseline pre-rediseño`
trajo de una vez `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`,
`.github/hooks/impeccable.json` y `docs/impeccable-baseline.{md,json}`. Después
`DESIGN.md` se editó dos veces más (`df62c74c` el 3-ago, `596b74eb` el 4-ago).
Todo trackeado, todo limpio. Ese tramo no tiene nada de raro: es una instalación
deliberada, commiteada y a la vista.

**El riesgo es otro, y tiene fecha, hora y número de fila.**

La pregunta era si con esa `description` pudo haberse activado sola sin que nadie
lo notara. La `description` no deja mucho margen — empieza *«Use when the user
wants to **design, redesign, shape, critique, audit, polish, clarify, distill,
harden, optimize, adapt, animate, colorize, extract**, or otherwise improve a
frontend interface»* y cierra *«Not for backend-only or non-UI tasks»*. Catorce
verbos, y el segundo es **redesign**. Este track es literalmente el rediseño del
home, en la rama `rediseno/home`, con sprints que se llaman `B0-AUDITORIA`,
`S2-motion`, `S11-luz`. El solapamiento semántico es total.

Pero eso sería una impresión. **El dato es el transcript**, y el transcript dice
que sí pasó:

| | sesión `3d6258a3` | sesión `2e071aaa` |
|---|---|---|
| timestamp de la invocación | `2026-08-16T00:48:32.435Z` | `2026-08-16T23:56:12.555Z` |
| fila de la llamada / total | 158 de 526 | 58 de 467 |
| sprint en curso | **S1-cimiento** (tokens + tipografía) | **S2-motion** (sistema de motion) |
| turnos de usuario que escriben «impeccable» **antes** de la llamada | **NINGUNO** | **NINGUNO** |
| quién compuso los argumentos | **el modelo** | **el modelo** |

Los argumentos que el modelo se escribió a sí mismo, textuales:

> `"skill": "impeccable", "args": "modo brand — landing de marca develOP. Sprint S1: definir tokens de color (papel/tinta/oscuro + 3 acentos de servicio con chip y wash) y escala tipografica (Chivo + Chivo Mono) sobre un sistema `ds-*` existente en Tailwind 4. Las decisiones esteticas ya estan cerradas por el documento del sprint; necesito el criterio de sistema, no propuestas nuevas de paleta."`

> `"skill": "impeccable", "args": "brand mode — sistema de motion (tokens + primitivas) para el rediseño del home develOP; subordinada al documento de sprint S2-motion.md"`

En la primera, el último turno del humano antes de la llamada fue *«Ejecutá la
instrucción completa en `docs/rediseno/sprints/S1-cimiento.md`»* con un marco de
reglas absolutas. No pidió `impeccable`. El modelo la invocó 144 filas después,
por decisión propia.

**Por qué esto no es trivia.** Los dos sprints que la auto-invocaron son los dos
que fundaron el sistema: `2f405a4a S1: cimiento de tokens, tipografia y
estructura del home` y `45f0c575 S2: sistema de motion, tokens y primitivas`. Los
90 tokens y `src/components/design-system/motion/tokens.ts` —el piso de todo lo
que vino después— se decidieron con `impeccable` cargada en contexto sin que
nadie lo pidiera. Hay que decir lo que el dato **no** dice: no dice que haya
metido una decisión ajena. Los argumentos que se escribió incluso acotan el
pedido («las decisiones estéticas ya están cerradas… necesito el criterio de
sistema, no propuestas nuevas de paleta»). Lo que el dato dice es que **la
decisión de cargarla no fue del humano**, y que pasó sin quedar registrada en
ningún reporte de sprint.

**El mecanismo para evitarlo existe y `impeccable` no lo usa.** El formato de
skill tiene `disable-model-invocation: true`, y el contraste es limpio: de los 12
de `emilkowalski/skills`, **3 lo declaran**; de las **2** copias de `impeccable`,
**ninguna**. Las dos copias quedan auto-disparables.

**Tres agravantes medidos, y uno que resulta ser un falso alarma.**

**(1) Dos versiones divergentes, y la que Claude Code lee es la que está peor
documentada.** `.claude/skills/` tiene la **4.1.1**; `.github/skills/` tiene la
**4.0.4**. La 4.0.4 declara `user-invocable: true`, `argument-hint` con los 19
sub-comandos y `license: Apache 2.0`; la 4.1.1 **no declara ninguno de los
tres**. Las dos tienen el mismo `description` byte por byte, así que **las dos
disparan igual**. Otras divergencias de texto: la 4.0.4 rutea los scripts por
`.github/skills/…` y usa el prefijo `/impeccable`; la 4.1.1 los rutea por el
`<skill-base-dir>` que reporta el runtime y usa `$impeccable`.

**(2) `.impeccable/design.json` es una segunda fuente de verdad de los tokens, y
está vencida.** Declara `"generatedAt": "2026-07-31T00:00:00.000Z"` y 97 claves
hoja. Desde esa fecha `globals.css` se reescribió **cuatro veces**: `2f405a4a`
(18-ago, cimiento de tokens), `45f0c575` (18-ago, tokens y primitivas),
`34c523c7` (19-ago), `5963cf52` (28-ago, compuerta y tokens). El drift es
medible: de 6 hexes del mirror, **3 ya no existen en `globals.css`** — `#0D0B09`
(`void`), `#151210` (`surface`) y `#A39C8F` (`ink-muted`) dan **0 ocurrencias**.
El mirror sigue nombrando como canónica una paleta cuyos fondos base se fueron.
Es exactamente el «criterio contradictorio» del criterio 3, pero contra nosotros
mismos. *(Lo que sí está al día: los 4 acentos de servicio del mirror coinciden
con `CLAUDE.md` — `#06b6d4`, `#10b981`, `#f59e0b`, `#8b5cf6`.)*

**(3) El hook está commiteado, pero no es el de Claude Code.**
`.github/hooks/impeccable.json` existe y dispara
`postToolUse` sobre `edit|create|apply_patch`. Según `reference/hooks.md:17`,
esa ruta es el manifiesto de **GitHub Copilot**; el de Claude Code es
`.claude/settings.local.json`. Medido: `logic-core-v3/.claude/settings.local.json`
tiene sólo `{"enabledPlugins": {"design@knowledge-work-plugins": true}}`, sin
hooks; `.claude/settings.json` no existe en ninguno de los dos niveles; y el
`settings.json` global no tiene ningún hook de `impeccable`. **Conclusión: el
detector NO corre en esta sesión de Claude Code.** Queda armado para Copilot, y
`hooks.md:17` aclara que el CLI de Copilot lo levanta *«once
`.github/hooks/impeccable.json` is committed to the repository's default
branch»* — está commiteado en `rediseno/home`, no en el default.

**El falso alarma, por si alguien lo cuenta mal después:** el único otro
transcript que menciona la ruta del `SKILL.md` (`d895190f`, 28-ago) la menciona
3 veces y **no la invoca ninguna**: son un `Bash` que hace `sed -n '1,12p'` sobre
los frontmatters de las skills y sus dos resultados. Era una auditoría, no una
activación. Y de los 92 transcripts de `C--rediseno-home-logic-core-v3`, **78
mencionan «impeccable»** — pero eso no prueba nada: la `description` se inyecta
en el prompt de **toda** sesión que tenga la skill instalada. **Mención no es
invocación.** Invocaciones reales en todo el historial (92+54+17+3 transcripts):
**dos**, las dos de arriba. Esta sesión es la tercera coincidencia y es
auto-contaminación: soy yo leyendo el archivo.

---

## 4 · La licencia de `bookofshapes`, en prosa

**Primero lo que corrige la premisa.** La instrucción dice que `docs/rediseno/`
ya declara que la licencia no se encontró publicada. **No existe tal
declaración.** `bookofshapes` da **0 hits en todo el worktree** (excluyendo
`node_modules`, `.next` y `.git`) y **0 commits en toda la historia de git**
(`git log --all -S'bookofshapes'`), y `git grep` sobre `HEAD` también da 0. No
hay nada escrito que corregir, y ninguna decisión registrada que revisar. Lo que
sigue es el primer registro del tema en el repo.

**Y lo segundo: la licencia está publicada.** No aplica «no publicados».

**https://bookofshapes.com/license** — página real, específica y escrita a mano.
Descubierta desde el pie del home (https://bookofshapes.com), que enlaza
exactamente dos páginas legales: «Licence» → `/license` y «Privacy» →
`/privacy`. Las otras ocho rutas plausibles se probaron una por una y **dan
404**: `/licence`, `/terms`, `/terms-of-use`, `/tos`, `/legal`, `/faq`, `/about`,
`/usage`. *(No se probó la variante `www` de `/license`; no se afirma nada sobre
ella.)*

**¿Distingue usar el SVG descargado de copiar su código? Sí, explícitamente, y
en secciones separadas.** Es el hallazgo que más importa, porque el permiso que
nos interesa es el primero:

- Bajo **«Use it for anything»** — lo descargado, **permitido**:
  > *«Whatever you generate on this site is yours to use. Commercial or not, modified or as it comes, in print, on screen, on products. No fee, no permission needed, no attribution required.»*

- Bajo **«Not covered»** — el código, **excluido**:
  > *«The pattern definitions behind this site (the node graphs) and the source code of the site itself are not covered by this licence.»*

Eso deja el permiso exactamente donde lo necesitábamos y confirma que la regla
de este sprint —no copiar ni una línea de su código— es también **su** regla.

**Uso comercial: permitido de forma expresa**, no es silencio. **Atribución: no
requerida**, bajo «Credit»:
> *«Not required. If you would like to give it anyway, "Pattern from bookofshapes.com" is plenty.»*

**Las dos condiciones que quedan vivas, y que hay que chequear contra el patrón
que el humano eligió:**

1. **Tres patrones nominados están fuera de la licencia.** Bajo «Three exceptions»:
   > *«Three patterns recreate existing works and are not mine to hand over. Joy Division and Joy Division Mesh follow the Unknown Pleasures cover, and Brockmann Beethoven Arcs follows a Müller-Brockmann poster.»*
   > *«They are here to show how the originals were built. Study them, take them apart, learn from them. Do not publish or sell them, least of all on a record sleeve or a poster, where the resemblance is the whole point.»*

   **Esto es lo único que puede bloquear la decisión ya tomada**, y no se puede
   resolver desde acá: el repo no registra **qué** patrón se eligió. Si es
   `Joy Division`, `Joy Division Mesh` o `Brockmann Beethoven Arcs`, el permiso
   de «Use it for anything» **no lo cubre**. Si es cualquier otro, está cubierto.

2. **El patrón puede ser parte de lo que se vende, no lo que se vende.** Bajo «One limit»:
   > *«Do not redistribute the patterns as patterns. Selling or giving away an SVG pack, a clipart set, a template library or a generator built from them is the one thing this licence does not cover.»*
   > *«The short version: a pattern can be part of what you sell. It cannot be the thing you sell.»*

   Para un fondo decorativo en el sitio de develOP esto no molesta. Quedaría del
   otro lado del límite si el patrón se publicara como asset descargable o
   entrara en una librería de plantillas.

**Autor y contacto.** **Nikolaj Sokolowski** — aviso al pie de todas las
páginas: *«© 2026 Book of Shapes — created by Nikolaj Sokolowski»*. Vías:
https://x.com/Threeaio (el «say hello» de la propia licencia apunta ahí, no es
un mail) · `nikolaj@creasurf.net` (en https://bookofshapes.com/privacy) ·
`moin@nikolaj-sokolowski.de` (en https://nikolaj-sokolowski.de/) ·
https://www.linkedin.com/in/nikolaj-sokolowski-8661a2300/ ·
https://www.instagram.com/nikobremen/. **Formulario de contacto: no encontrado.**

**Repositorio GitHub: no encontrado.** El perfil https://github.com/threeaio
existe con 6 repos públicos y **ninguno** es Book of Shapes. Así que **no hay
archivo `LICENSE` de repo que invocar** —ni MIT ni CC— y la advertencia clásica
(que una MIT sobre el código del sitio no licencia los assets) queda sin objeto.
La licencia del sitio va justo en el sentido contrario y lo dice sola: el código
está excluido, lo descargado está incluido.

**Declaración del autor fuera del sitio: no encontrada.** Product Hunt, HN,
Reddit, Peerlist y Dribbble sin resultados; las búsquedas por las frases
distintivas de la licencia no dan coincidencias fuera del sitio. ⚠️
https://x.com/Threeaio **no se pudo leer** (HTTP 402): no se afirma que no haya
un post, se afirma que no se pudo verificar. Lo único de terceros **no es del
autor**: https://www.designminis.com/tools/bookofshapes lista el proyecto como
«Free» **sin mencionar licencia** — y un «Free» de directorio es **precio, no
licencia**.

**Dos cosas que el sitio afirma y no se verificaron, porque no se descargó
nada:** que *«Every download carries this text as `LICENSE.txt`»* y que la
licencia cambió por última vez en **septiembre de 2026** — o sea **este mes**.
Esa fecha es la única lectura caritativa de la premisa de la instrucción: si
alguien buscó la licencia antes, pudo no estar. Hoy está.

---

## 5 · La pregunta previa de `morphicons`: ¿el home usa íconos?

**Sí, dos.** Y las dos son flechas estáticas.

| archivo | línea | ícono | ¿es el home? |
|---|---|---|---|
| `src/app/v3/_secciones/cierre/ColumnasDelPie.tsx` | `:134` | `ArrowUpRight` | **Sí** — `Cierre.tsx:192` lo monta dentro de la sección Cierre del home |
| `src/app/v3/_secciones/cierre/ColumnasDelPie.tsx` | `:187` | `ArrowRight` | **Sí** — idem |

Las dos cumplen las convenciones de `CLAUDE.md`: `strokeWidth={1.5}` y
`aria-hidden="true"`.

El otro archivo de `src/app/v3/` con `lucide-react` es
`componentes/_bloques/GaleriaPie.tsx:1` (`ArrowRight`, `ArrowUpRight`,
`Instagram`, `Linkedin`, `Mail`), y **no es el home**: `/v3/componentes` es la
galería de componentes, su propia ruta. Los otros tres hits
(`s3-codigo.invariant.ts:57`, `s6-lane.invariant.ts:128`,
`cierre/soporte.ts:57`) son instrumentos y fixtures, no pantalla. Ninguna otra
librería de íconos aparece en `src/app/v3/`.

**Lo que eso significa para la herramienta, sin decidir nada.** `morphicons`
morphea un ícono A en un ícono B cuando cambia un estado —el caso canónico de su
README es `Menu → X`—. El home tiene **dos flechas decorativas sin par de
estados**: no hay transición que morphear. Una herramienta de íconos necesita
íconos que cambien, y acá no hay. Sumado al segundo `requestAnimationFrame` del
criterio 3, ese es todo el dato; la decisión es del humano.

---

## 6 · `find-skills` corrido contra este repo (A2)

9 consultas derivadas del stack real: `nextjs`, `tailwind`, `framer motion`,
`animation`, `three.js webgl`, `design tokens`, `accessibility`,
`scroll animation`, `web performance`, `responsive mobile`. **170 resultados
crudos, 164 únicos.** Volcado completo sin filtrar en el apéndice §8.

**El filtro, aplicado mecánicamente** (script reproducible, no a ojo):

| | |
|---|---|
| **DESCARTADA por crit. 1** (nombra librería prohibida en el propio nombre) | **2** — `github/awesome-copilot@gsap-framer-scroll-animation` (3.6K inst., aparece en **3** de las 9 consultas) y `freshtechbro/claudedesignskills@lottie-animations` (2.3K) |
| **DESCARTADA por crit. 2** (stack ajeno) | **35** — Expo, Flutter, SwiftUI, iOS, Android, Godot, Unity, Phaser, Webflow, WordPress, LWC, Vaadin, .NET, PixiJS, Mapbox, Supabase, Clerk, Auth0, Cloudflare, Figma |
| **DESCARTADA por crit. 5** (trae su propio sistema/tokens) | **22** — toda la familia `design-tokens` / `design-system` / `theme-builder` / `tokens-sync` / `shadcn` / `brandfy` / `figma-variables` |
| **Total descartadas mecánicamente** | **59 de 164** |

**Las 105 restantes caen casi en bloque por el criterio 3**, y conviene decirlo
como clase y no una por una: son familias que ya tienen dueño acá.
`tailwind-*` (20 resultados) opina sobre un sistema que este repo tiene
**cerrado** en 90 tokens con invariante propio; `accessibility-*` (20) y
`web-performance-*` (20) pisan `impeccable audit` y `impeccable optimize`
(`SKILL.md:47` y `:62`); `threejs-*`/`webgl-*` (17) opinan sobre una escena cuyo
archivo central está **congelado** (`HeroArtifact.tsx`); `framer-motion-*` (20)
pisan a la vez `impeccable animate` y las de Emil. Dos cosas opinando sobre lo
mismo producen criterio contradictorio, y acá serían tres.

**Lo que sobrevive arriba de la lista son los de Emil, y por un margen grande:**

| # | resultado | instalaciones |
|---|---|---|
| 1 | `emilkowalski/skills@review-animations` | **151.2K** |
| 2 | `emilkowalski/skills@animation-vocabulary` | **139K** |
| 3 | `emilkowalski/skills@improve-animations` | **123.4K** |
| 4 | `emilkowalski/skills@find-animation-opportunities` | **110.6K** |
| 5 | `addyosmani/web-quality-skills@accessibility` | 52.1K |

⚠️ **Un límite del buscador, medido:** `find-skills` devolvió **4 de los 12**
skills de `emilkowalski/skills`. **`@animate` —la única del set que escribe
código, y la que `animate/SKILL.md:25` hace deferir a nuestros tokens— no
apareció en ninguna de las 9 consultas.** El buscador corta en el top-20 por
consulta. Si la evaluación hubiera dependido sólo de `find-skills`, la candidata
más relevante no se habría visto. Se vio porque A3 fue a leer el repo entero.

---

## 7 · Dos premisas de la instrucción que no se sostienen

Se anotan acá porque el método de este repo las pide explícitas, no porque
cambien el resultado.

1. **«`docs/rediseno/` ya declara que la licencia no se encontró publicada.»**
   **Falso.** 0 menciones de `bookofshapes` en el worktree, 0 en toda la historia
   de git, 0 en `git grep HEAD`. No hay declaración previa. §4.

2. **«Leé `.claude/skills/impeccable/SKILL.md` y `.github/skills/impeccable/SKILL.md`»**
   — los dos existen, pero **no están donde la instrucción los sugiere**. El
   `.claude/skills/` está en `logic-core-v3/` (el directorio de trabajo) y el
   `.github/skills/` está en la **raíz del worktree** (`C:\rediseno-home`), dos
   niveles distintos del mismo worktree. Esa separación es la que dejó las
   versiones divergir sin que se notara (§3.1).

Y una de la parte A3, que el humano ya había acotado bien: **`emilkowal.ski` es
el sitio, el handle es `emilkowalski`** (confirmado: el perfil dice «Emil
Kowalski», web `emilkowal.ski`, y tiene fijados `sonner` 13k★ y `vaul` 8.6k★).
El repo real es **https://github.com/emilkowalski/skills** — «Skills for
Designers and Engineers», 37.028 ★, 2.090 forks, MIT, último push
2026-08-21, 24 entradas y **cero ejecutables**: no trae scripts, ni hooks, ni
subagentes, ni `package.json`. La sospecha del humano de que era *probable* que
pasara el filtro quedó **medida**: pasa en 8 de 12, y las 4 que no pasan caen por
Lottie/Swift/dependencias, no por GSAP.

---

## 8 · Apéndice — volcado crudo de `find-skills`, sin filtrar

170 resultados crudos / 164 únicos. Archivo completo de la corrida en el
scratchpad de la sesión (`find-skills-raw.txt`); la clasificación reproducible en
`filtro.txt`. Lo que sigue es el volcado por consulta, tal como salió.

### `nextjs`
`clerk/skills@clerk-nextjs-patterns` 42.6K · `wshobson/agents@nextjs-app-router-patterns` 29.6K · `affaan-m/ecc@nextjs-turbopack` 8.8K · `sickn33/agentic-awesome-skills@nextjs-supabase-auth` 6.4K · `cloudflare/skills@nextjs-on-cloudflare` 5.4K · `jeffallan/claude-skills@nextjs-developer` 5K · `mindrally/skills@nextjs-react-typescript` 5K · `mohamed-hossam1/nextjs-skills@nextjs-cache-architecture` 4K · `giuseppe-trisciuoglio/developer-kit@nextjs-performance` 3.9K · `giuseppe-trisciuoglio/developer-kit@nextjs-app-router` 2.9K · `giuseppe-trisciuoglio/developer-kit@nextjs-code-review` 2.9K · `giuseppe-trisciuoglio/developer-kit@nextjs-authentication` 2.8K · `giuseppe-trisciuoglio/developer-kit@nextjs-data-fetching` 2.8K · `giuseppe-trisciuoglio/developer-kit@nextjs-deployment` 2.8K · `wsimmonds/claude-nextjs-skills@nextjs-app-router-fundamentals` 2.2K · `laguagu/claude-code-nextjs-skills@nextjs-seo` 2K · `sickn33/agentic-awesome-skills@react-nextjs-development` 1.8K · `auth0/agent-skills@auth0-nextjs` 1.7K · `jezweb/claude-skills@nextjs` 1.1K

### `tailwind`
`heygen-com/hyperframes@tailwind` 72.5K · `wshobson/agents@tailwind-design-system` 63.5K · `expo/skills@expo-tailwind-setup` 54.3K · `giuseppe-trisciuoglio/developer-kit@tailwind-css-patterns` 16.2K · `lombiq/tailwind-agent-skills@tailwind-4-docs` 13.8K · `josiahsiegel/claude-plugin-marketplace@tailwindcss-advanced-layouts` 8K · `secondsky/claude-skills@tailwind-v4-shadcn` 7.6K · `giuseppe-trisciuoglio/developer-kit@tailwind-design-system` 3.6K · `jezweb/claude-skills@tailwind-theme-builder` 3.1K · `hairyf/skills@tailwindcss` 3K · `paulrberg/agent-skills@tailwind-css` 2.8K · `jezweb/claude-skills@tailwind-v4-shadcn` 2.7K · `josiahsiegel/claude-plugin-marketplace@tailwindcss-animations` 2.3K · `josiahsiegel/claude-plugin-marketplace@tailwindcss-mobile-first` 2K · `mastra-ai/mastra@tailwind-best-practices` 2K · `sickn33/agentic-awesome-skills@tailwind-design-system` 1.5K · `mindrally/skills@tailwindcss` 1.4K · `sickn33/agentic-awesome-skills@tailwind-patterns` 1.4K · `mindrally/skills@nextjs-typescript-tailwindcss-supabase` 1.2K · `bobmatnyc/claude-mpm-skills@tailwind-css` 1.2K

### `framer motion`
`patricio0312rev/skills@framer-motion-animator` 10K · `freshtechbro/claudedesignskills@motion-framer` 4.2K · **`github/awesome-copilot@gsap-framer-scroll-animation` 3.6K** · `delphi-ai/animate-skill@animate` 3K · `mindrally/skills@framer-motion` 2.7K · `daffy0208/ai-dev-standards@animation-designer` 1.8K · `dylantarre/animation-principles@framer-motion` 1.6K · `pproenca/dot-skills@framer-motion` 1K · `athevon/genjutsu@framer-motion` 859 · `c-jeril/framer-motion-skills@framer-motion-scroll` 575 · `c-jeril/framer-motion-skills@framer-motion-react` 571 · `c-jeril/framer-motion-skills@framer-motion-layout` 544 · `c-jeril/framer-motion-skills@framer-motion-gestures` 541 · `c-jeril/framer-motion-skills@framer-motion-variants` 537 · `pproenca/dot-skills@framer-motion-best-practices` 192 · `tristanmanchester/agent-skills@nextjs-framer-motion-animations` 158 · `podo/design-agent-skills@framer-motion-skills` 124 · `schoepplake/framer-motion-skill@framer-motion` 117 · `smithery.ai@framer-motion` 111 · `dralgorhythm/claude-agentic-framework@framer-motion` 65

### `animation`
`heygen-com/hyperframes@hyperframes-animation` 400.2K · **`emilkowalski/skills@review-animations` 151.2K** · **`emilkowalski/skills@animation-vocabulary` 139K** · **`emilkowalski/skills@improve-animations` 123.4K** · **`emilkowalski/skills@find-animation-opportunities` 110.6K** · `heygen-com/hyperframes@css-animations` 74.3K · `madteacher/mad-agents-skills@flutter-animations` 15.1K · `cloudai-x/threejs-skills@threejs-animation` 14.4K · `mblode/agent-skills@ui-animation` 9K · `expo/skills@expo-animation` 5.3K · `dpearson2699/swift-ios-skills@swiftui-animation` 4.6K · **`github/awesome-copilot@gsap-framer-scroll-animation` 3.6K** · `minimax-ai/minimax-h3@3d-animation-short-generator` 2.6K · `gamedev-skills/awesome-gamedev-agent-skills@godot-animation` 2.5K · `devmartinese/awwwards-animations-skill@awwwards-animations` 2.4K · **`freshtechbro/claudedesignskills@lottie-animations` 2.3K** · `josiahsiegel/claude-plugin-marketplace@tailwindcss-animations` 2.3K · `gamedev-skills/awesome-gamedev-agent-skills@unity-animation` 2.2K · `pproenca/dot-skills@emilkowal-animations` 2.1K · `flutter/agent-plugins@flutter-animation` 1.1K

### `three.js webgl`
`freshtechbro/claudedesignskills@threejs-webgl` 3.6K · `mengto/skills@threejs` 1.1K · `mengto/skills@webgl-landing-steering` 935 · `sickn33/agentic-awesome-skills@threejs-skills` 764 · `iart-ai/webgl-animation-skills@threejs-animation` 498 · `omer-metin/skills-for-antigravity@threejs-3d-graphics` 443 · `404kidwiz/claude-supercode-skills@threejs-pro` 182 · `ronnycoding/.claude@webgl-expert` 171 · `podo/design-agent-skills@motion-catalogue` 111 · `podo/design-agent-skills@cloudai-threejs` 101 · `flornkm/skills@webgl-components` 85 · `openai/plugins@game-studio` 31 · `openai/plugins@three-webgl-game` 29 · `kensaurus/cursor-kenji@enhance-web-web3d` 28 · `avabillions2040/claudedesignskills-02-02-2026@threejs-webgl` 20 · `openai/plugins@threejs-data-visualization` 10 · `belokonm/claude-supercode-skills@threejs-pro` 8

### `design tokens`
`julianoczkowski/designer-skills@design-tokens` 5.2K · `plugin87/ux-ui-agent-skills@design-tokens` 247 · `f-labs-io/agent-html-skills@html-design-tokens` 187 · `dylanfeltus/skills@design-tokens` 186 · `yonatangross/orchestkit@design-system-tokens` 175 · `ilikescience/design-tokens-skill@design-tokens` 138 · `podo/design-agent-skills@design-tokens-skill` 109 · `phazurlabs/sumi@design systems architecture` 108 · `podo/design-agent-skills@figma-variables-tokens-generator` 98 · `southleft/figma-console-mcp-skills@figma-setup-design-tokens` 95 · `laurigates/claude-plugins@design-tokens` 82 · `promovaweb/brandfy@brandfy-design-tokens` 80 · `finch-poi/opendesign-skills@opendesign-tokens` 63 · `dralgorhythm/claude-agentic-framework@demo-design-tokens` 55 · `onewave-ai/claude-skills@design-tokens-sync` 52 · `southleft/skills-for-figma@setup-design-tokens-figma` 45 · `piyushverma0/android-agent-skills@design-tokens` 18 · `sap/ui-theme-designer-plugins-for-coding-agents@ui-theme-designer-design-tokens` 15 · `aboudjem/ui-ux-suite@design-tokens` 14 · `darkroomengineering/cc-settings@design-tokens` 10

### `accessibility`
`addyosmani/web-quality-skills@accessibility` 52.1K · `ibelick/ui-skills@fixing-accessibility` 18.1K · `jakubkrehel/skills@better-accessibility` 15.4K · `wshobson/agents@accessibility-compliance` 13.1K · `flutter/agent-plugins@flutter-improving-accessibility` 8.5K · `affaan-m/ecc@accessibility` 7.5K · `dpearson2699/swift-ios-skills@ios-accessibility` 4.2K · `pixijs/pixijs-skills@pixijs-accessibility` 4K · `anthropics/knowledge-work-plugins@accessibility-review` 3.5K · `microsoft/vscode@accessibility` 2.8K · `mindrally/skills@accessibility-a11y` 2.6K · `owl-listener/designer-skills@accessibility-test-plan` 1.5K · `flutter/agent-plugins@flutter-accessibility-audit` 1.5K · `mastepanoski/claude-skills@wcag-accessibility-audit` 1.4K · `forcedotcom/sf-skills@experience-lwc-accessibility-validate` 1.1K · `flutter/agent-plugins@flutter-accessibility` 1K · `dadederk/ios-accessibility-agent-skill@ios-accessibility` 801 · `webflow/webflow-skills@webflow-mcp:accessibility-audit` 719 · `jezweb/claude-skills@accessibility` 512 · `webflow/webflow-skills@accessibility-audit` 495

### `scroll animation`
**`github/awesome-copilot@gsap-framer-scroll-animation` 3.6K** · `mengto/skills@animation-on-scroll` 1.2K · `pproenca/dot-skills@framer-motion` 1K · `dylantarre/animation-principles@scroll-animations` 989 · `davila7/claude-code-templates@scroll-experience` 617 · `c-jeril/framer-motion-skills@framer-motion-scroll` 575 · `oakoss/agent-skills@css-animation-patterns` 143 · `yonatangross/orchestkit@scroll-driven-animations` 34 · `liuchiawei/agent-skills@scroll-experience` 33 · `midudev/tailwind-animations@tailwind-animations` 33 · `smithery.ai@scroll-experience` 25 · `ethandiedericks/scroll-reveal-animation@scroll-reveal-animation` 17 · `impertio-studio/frontend-design-claude-skill-package@frontend-impl-view-transitions-scroll-animations` 12 · `thelobbi/claude@scroll-animations` 8 · `borb-choi/picker-biliny@scroll-animation` 2

### `web performance`
`addyosmani/web-quality-skills@performance` 34.4K · `github/awesome-copilot@web-coder` 5.6K · `sickn33/agentic-awesome-skills@web-performance-optimization` 2.8K · `mapbox/mapbox-agent-skills@mapbox-web-performance-patterns` 2K · `dembrandt/dembrandt-skills@performance-and-web-vitals` 733 · `aaronontheweb/dotnet-skills@type-design-performance` 583 · `aaronontheweb/dotnet-skills@database-performance` 579 · `aj-geddes/useful-ai-prompts@web-performance-audit` 529 · `davila7/claude-code-templates@web-performance-optimization` 510 · `secondsky/claude-skills@web-performance-optimization` 494 · `secondsky/claude-skills@web-performance-audit` 479 · `aj-geddes/useful-ai-prompts@web-performance-optimization` 463 · `bobmatnyc/claude-mpm-skills@web-performance-optimization` 409 · `warpdotdev/oz-skills@web-performance-audit` 201 · `zhanlincui/agent-skills-hunter@web-performance-seo` 87 · `agents-inc/skills@web-performance-web-performance` 66 · `alexanderstephenthompson/claude-hub@web-performance` 51 · `thebushidocollective/han@react-native-web-performance` 48 · `alphaonedev/openclaw-graph@web-performance` 47 · `danieldxd/myapp-skills@web-performance` 27

### `responsive mobile`
`josiahsiegel/claude-plugin-marketplace@tailwindcss-mobile-first` 2K · `hoodini/ai-agents-skills@mobile-responsiveness` 1.3K · `kostja94/marketing-skills@mobile-friendly` 928 · `aj-geddes/useful-ai-prompts@mobile-first-design` 819 · `pproenca/dot-skills@tailwind-responsive-ui` 419 · `yakoub-ai/phaser4-gamedev@phaser-mobile` 143 · `oimiragieo/agent-studio@mobile-first-design-rules` 63 · `respira-press/agent-skills-wordpress@mobile-experience-report` 52 · `asadsumbul/mobile-responsive@mobile-responsive` 34 · `kanopi/cms-cultivator@responsive-styling` 33 · `vaadin/agent-skills@responsive-layouts` 31 · `frostfoe7/rdz@tailwindcss-mobile-first` 25 · `canatufkansu/claude-skills@responsive-mobile-first` 17 · `ominou5/funnel-architect-plugin@mobile-responsive` 17 · `uxcel-lab/product-skills@ux-mobile-responsiveness-audit` 14 · `swiggityswerve/ux-toolkit@mobile-responsive-ux` 13 · `thegoat395/codex-skills@mobile-responsive-qa` 10 · `manish1803/nextjs-fullstack-skills@responsive-mobile-first` 9

---

## 9 · Lo que este sprint NO hizo

- **No se instaló nada salvo `find-skills`.** Ni Emil, ni sleek, ni
  `morphicons`. Los tres se leyeron por web.
- **No se clonó ningún repo dentro del worktree.** Los 22 archivos que se
  midieron con `grep -n` están en el scratchpad de la sesión, fuera del árbol.
- **No se descargó ningún asset de `bookofshapes` ni se copió una línea de su
  código.** Todas las citas de §4 son prosa legal de `/license` y `/privacy`.
- **No se tocó `src/`, ni ningún archivo de producto, ni `DIRECCION-ESCENA.md`.**
- **Ninguna escritura de git.** `HEAD` se leyó con `git show` / `git log`.
- **El único archivo creado es este reporte**, más la instalación autorizada
  (`.agents/skills/find-skills/` y su symlink en `.claude/skills/`). Las dos
  rutas están **gitignoreadas** (`.gitignore:3` `.agents/` y `.gitignore:2`
  `.claude/`), así que la instalación **no aparece en `git status`** y no entra
  en ningún commit. `git status` muestra exactamente dos entradas: este reporte
  (sin trackear) y el `CONTENIDO-PENDIENTE.md` que ya venía modificado de antes
  de este sprint.

---

## 10 · PARADA — lo que necesita decisión del humano

Nada de esto se ejecuta sin aprobación. En orden de consecuencia:

1. 🔴 **`impeccable` se auto-invoca y no declara el opt-out.** Tres salidas
   posibles, todas de una línea: agregar `disable-model-invocation: true` al
   frontmatter; dejarla como está a sabiendas; o sacarla. **La decisión es del
   humano.** Lo que no conviene dejar así es el estado actual —dos versiones
   divergentes, las dos auto-disparables— porque es el único de los hallazgos que
   ya produjo efecto sin registro.
2. 🔴 **`bookofshapes`: qué patrón se eligió.** Es el único dato que falta para
   cerrar la licencia, y no está en el repo. Si es `Joy Division`,
   `Joy Division Mesh` o `Brockmann Beethoven Arcs`, **no está cubierto**.
   Cualquier otro, sí. *(Y conviene dejar el nombre escrito en `docs/rediseno/`,
   que hoy no registra el tema.)*
3. ⚠️ **`.impeccable/design.json` declara tokens vencidos del 31-jul**, con 3 de
   6 hexes muestreados ya inexistentes en `globals.css`. Es una segunda fuente de
   verdad contra los 90 tokens. Regenerar, borrar o dejar: decisión del humano.
4. ⚠️ **El hook de `impeccable` está commiteado como manifiesto de Copilot**
   (`.github/hooks/impeccable.json`) y no corre en Claude Code. Si se quiere que
   corra, va en `.claude/settings.local.json`; si no se quiere, el archivo está
   de más.
5. **Las 8 candidatas de Emil**, si alguna entra: 4 de ellas
   (`find-animation-opportunities`, `animation-vocabulary`, `emil-design-eng`,
   `apple-design`) **no declaran el opt-out** y serían auto-disparables como
   `impeccable`; y `apple-design:229` choca con Chivo.
6. **`find-skills` quedó instalada** (era lo autorizado) con `Med Risk` de Snyk.
   Si sólo se quería para esta corrida, se puede sacar.

---

## 11 · H2 — ejecutado

> Sprint de ejecución de las decisiones aprobadas de §10. **Pasos 0 a 5
> completos. El commit y el push quedaron FRENADOS en el gate del PASO 5**, por
> un número de la instrucción que no reproduce — el detalle y la prueba en
> §11.5. Las cuatro rutas ya se borraron y las dos skills ya están instaladas;
> lo único pendiente es `git add` / `commit` / `push`.

### 11.0 · PASO 0 — ¿algo dependía de `impeccable`? **No**

Los cuatro bloqueantes que la instrucción nombraba, medidos:

| bloqueante | hits | veredicto |
|---|---|---|
| `package.json` (los dos niveles) | **0** | limpio |
| `CLAUDE.md` · `AGENTS.md` | **0** | limpio |
| invariantes (`*.invariant.ts`/`.tsx`, todo el árbol) | **0** | limpio |
| el script `verificar` y todo `scripts/` | **0** | limpio |

`verificar` es `npx tsx src/app/v3/_lib/__tests__/s4-verificar.ts` — no toca la
skill.

**Dónde sí aparecía `impeccable`: sólo en prosa de `docs/`** —
`bitacora-rediseno.md` (la instalación del 31-jul), `bitacora-beta-3.md`,
`impeccable-baseline.{md,json}`, `probe-construccion-p6.md` y
`auditorias/A3-ESTADO-ECC-SKILLS-2026-08.md`. Son **registros históricos de lo
que pasó**, no dependencias: borrar la skill no los rompe. No se tocó ninguno.

⚠️ **Una contradicción aparente que se resolvió antes de borrar.**
`auditorias/A3-ESTADO-ECC-SKILLS-2026-08.md:273` afirma que los hooks del
detector están «Activos y funcionales» en `.claude/settings.local.json`, y `:14`
dice que `.claude/skills/` tiene **9 skills, 8 de ellas de
`emilkowalski/skills`**. Las dos cosas son falsas **en este worktree**: el
`settings.local.json` de acá tiene sólo `{"enabledPlugins": …}` y cero hooks, y
`.claude/skills/` tenía 5 entradas sin ninguna de Emil. Ese documento describe
**otro checkout** (`C:\PorfolioDevelOP`), no `C:\rediseno-home`. La medición de
H1 §3.3 queda confirmada: **el hook nunca corrió en Claude Code acá.**

⚠️ **Un quinto artefacto que H1 no había registrado:
`logic-core-v3/skills-lock.json`.** Gitignoreado (`.gitignore:4`) y no
trackeado. Tenía entrada `impeccable` (`source: pbakaus/impeccable`) con
`skillPath: .agents/skills/impeccable/SKILL.md` — una ruta **donde la skill no
estaba** (estaba en `.claude/skills/`). Se trató en §11.2.

### 11.1 · PASO 1 — las cuatro rutas de `impeccable`, con su método

| # | ruta | trackeados ANTES | método | trackeados DESPUÉS | en disco |
|---|---|---|---|---|---|
| a | `logic-core-v3/.claude/skills/impeccable/` (v4.1.1, 153 archivos) | **0** | `rm -rf` (filesystem; `.gitignore:2` cubre `.claude/`) | 0 | **NO** |
| b | `.github/skills/impeccable/` (v4.0.4, 143 archivos) | **143** | `git rm -r` | **0** | **NO** |
| c | `.github/hooks/impeccable.json` (manifiesto de Copilot) | **1** | `git rm` | **0** | **NO** |
| d | `.impeccable/design.json` | **1** | `git rm -r` | **0** | **NO** |

**Sobre (d), que H1 había dejado sin localizar:** `.impeccable/` vive en la
**raíz del worktree** (`C:\rediseno-home\.impeccable`), **no** en
`logic-core-v3/`. Y **estaba trackeado** (1 archivo), así que fue `git rm`, no
borrado de filesystem.

**Control de que no había una quinta copia:** `.agents/skills/` contenía sólo
`find-skills` y `frontend-design`. Ninguna copia de `impeccable` ahí, a pesar de
lo que decía el `skillPath` del lockfile.

`.claude/skills/` después de (a): `copy-editing`, `copywriting`, `cro`,
`find-skills`, `frontend-design.disabled`.

### 11.2 · PASO 2 — `find-skills`, y la trampa de Windows

La trampa era real y se verificó en vez de asumirla.
`.claude/skills/find-skills` **era un symlink** a
`/c/rediseno-home/logic-core-v3/.agents/skills/find-skills` (confirmado con
`readlink`), y el destino tenía 1 archivo.

Orden ejecutado, con el control en el medio:

1. **Borrar sólo el enlace**, sin `-r` / sin `-Recurse` → symlink existe: **NO**.
2. **CONTROL** — ¿sobrevivió el destino? `.agents/skills/find-skills` existe:
   **SÍ, intacto, 1 archivo**. *(Si el borrado hubiera seguido el enlace, acá
   daba 0 y el paso se frenaba.)*
3. **Recién entonces** borrar el destino → **BORRADO**.

**Control de daño colateral:** el otro symlink del directorio,
`frontend-design.disabled`, sigue apuntando a `.agents/skills/frontend-design` y
**su destino existe**. No se tocó.

**Y el lockfile, que habría quedado mintiendo.** Tras las bajas,
`skills-lock.json` declaraba 8 skills de las cuales **2 no existían en disco**
(`impeccable` y `find-skills`). Es el mismo defecto que H1 §3.2 le marcó a
`design.json`: una segunda fuente de verdad que sobrevive a lo que describe. Se
sacaron las dos entradas. Queda en **6**, y las 6 existen — verificado una por
una: `entradas que mienten: 0`. Sigue gitignoreado: **no entra al commit.**

### 11.3 · PASO 3 — las dos skills, y nada más

`npx skills add emilkowalski/skills --skill animate --skill review-animations`
— **project-level, sin `-g`, sin `-y`.**

⚠️ **Nota de CLI, por si se repite:** la forma
`--skill animate,review-animations` (coma) **no funciona** — devuelve «No
matching skills found for: animate,review-animations» y no instala nada. Hay que
repetir el flag. El primer intento no instaló nada, así que no hubo que deshacer.

Evaluación de riesgo que imprimió el instalador: `animate` **Low Risk**,
`review-animations` **Low Risk** (Gen `Safe`, Socket `0 alerts` las dos). Mejor
que el **Med Risk** que tenía `find-skills`.

**Control negativo — de las diez no autorizadas, instaladas: 0.** Ni
`apple-design`, ni `improve-animations`, ni ninguna otra.

Archivos que trajeron: `animate/{SKILL.md,RECIPES.md}` ·
`review-animations/{SKILL.md,STANDARDS.md}`.

#### El frontmatter final de las dos, completo

`.agents/skills/animate/SKILL.md`, líneas 1-5:

```yaml
---
name: animate
description: Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which properties, which curve and duration, how it interrupts, how it exits. Writes the implementation. Use when asked to animate something, add motion, make a component feel alive, or build a transition. For critiquing existing motion use review-animations; for auditing a whole codebase use improve-animations.
disable-model-invocation: true
---
```

`.agents/skills/review-animations/SKILL.md`, líneas 1-5:

```yaml
---
name: review-animations
description: Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy. Default to flagging; approval is earned.
disable-model-invocation: true
---
```

- `review-animations` **ya lo traía** en `:4` — confirmado, no se tocó.
- `animate` **no lo traía** y se le agregó en `:4`. El symlink de
  `.claude/skills/animate/SKILL.md` resuelve al archivo editado (verificado).
- **La regla nueva queda cumplida en las dos: ninguna skill se auto-dispara.**

🔴 **Y la regla se confirmó en vivo, por accidente, mientras se ejecutaba el
paso.** Justo después de instalar, el runtime anunció las skills disponibles y
listó **`animate` sí y `review-animations` no** — exactamente porque la segunda
declaraba el opt-out y la primera todavía no. Es el defecto de §3 reproducido en
tiempo real, en una sola línea de evidencia, antes del arreglo.

### 11.4 · PASO 5 — `verificar` y `test:frontera`

```
  verificar: 30 pasos, 0 con falla
  · los checks de frontera NO corren acá: `npm run test:frontera`, y va ANTES del commit.
```

Agregado de los 27 sub-agregados (el runner imprime cada deuda **dos veces** — en
la línea por-test y en la del agregado —; acá se suma una sola):

| métrica | H2 (esta corrida) | B13 (= HEAD) registró | |
|---|---|---|---|
| pasos | **30** | 30 | IGUAL |
| con falla | **0** | 0 | IGUAL |
| invariantes | **133** | 133 | IGUAL |
| controles positivos | **913** | 913 | IGUAL |
| fuera de ventana | **17** | 17 | IGUAL |
| **deudas declaradas** | **16** | **16** | **IGUAL** |
| afirmaciones | **5.358** | 5.365 | **−7** → §11.5 |

Las 16 deudas, localizadas: **12** en `test:s10-acceso`, **3** en
`test:s8-tinta`, **1** en `test:s22-emision`. Corrida dos veces con el mismo
resultado exacto en las 27 suites: **es determinista**.

`test:frontera`, que el propio `verificar` dice que va antes del commit:

```
  TOTAL frontera: 2 invariantes · 23 afirmaciones · 10 controles positivos · 12 fuera de ventana · 0 invariantes con falla
```

**23 afirmaciones · 10 controles positivos · 0 fallas** — idéntico a lo que
registró B13.

### 11.5 · 🛑 LA PARADA — el gate pide 18 deudas y son 16, y la prueba de que no regresó nada

**La instrucción de H2 pedía «30 pasos, cero fallas, 18 deudas declaradas» y que
se frenara si cualquiera de los tres cambiaba. Dos coinciden. El tercero no: son
16.** Así que se frenó antes del commit, como estaba pedido.

**Pero la medición dice que no cambió nada, y que el 18 nunca fue el número.**

**Prueba 1 — el baseline real está escrito, y es 16.** `B13-EMITE.md` es el
reporte del sprint inmediatamente anterior, que **es el HEAD actual**
(`faa26bab`). Registra el número **tres veces**:

> `:962` — «`npm run verificar` | **30 pasos · 0 con falla** — 133 invariantes ·
> **5.365 afirmaciones** · 913 controles positivos · 17 fuera de ventana ·
> **16 deudas declaradas**»
>
> `:602` — «…fuera de ventana · **16 deudas declaradas**»
>
> `:968` — «Las «**16 deudas declaradas**»…»

Y la progresión cierra: `B11-ACOMODAMIENTO.md:26` registra **15 deudas con 28
pasos** (11 en `s10-acceso` + 4 en `s8-tinta`); B13 agregó la de `s22-emision` y
llegó a 16. **No hay lectura en la que el número sea 18.** La hipótesis más
probable es que el 18 de la instrucción salió de confundir las **deudas (16)**
con los **fuera de ventana (17)**, que es la cifra de al lado en esa misma línea
de B13.

**Prueba 2 — H2 no puede mover ni una afirmación, y esto es por enumeración, no
por argumento.** Se listaron **todas** las lecturas de filesystem que hacen los
invariantes fuera de `src/`. Son exactamente tres:

| lo que los invariantes leen fuera de `src/` | ¿está en el diff de H2? |
|---|---|
| `docs/rediseno/DIRECCION-ESCENA.md` | **NO** — intocado (y prohibido tocarlo) |
| `next.config.ts` | **NO** |
| `package.json` | **NO** |

El diff de H2 es **sólo** `.github/**` (144 archivos), `.impeccable/design.json`
y **dos docs nuevos**. Ninguna de las tres rutas que los invariantes leen está en
ese conjunto. **Por lo tanto H2 no puede haber cambiado el conteo de ninguna
afirmación, de ninguna deuda, de ningún paso.**

**Prueba 3 — lo que parecía el sospechoso obvio no lo era.**
`CONTENIDO-PENDIENTE.md` sí lo lee un invariante (`s7-documento.ts:211` →
`s7-pedido.invariant.tsx`) y sí figura como modificado, así que era el candidato
natural para un delta de afirmaciones. **No lo es:** su contenido es **byte por
byte idéntico al de HEAD**. `git diff` no devuelve ni una línea de cambio, sólo
el aviso de fin de línea; working tree y HEAD tienen los mismos **237 CR en 237
líneas**, y `git diff --ignore-cr-at-eol` da vacío. La «M» de `git status` es
pura normalización de fin de línea — el `core.autocrlf=true` ya documentado en
este repo —, no un cambio de contenido.

**Conclusión medida:** los tres números del gate reproducen HEAD exactamente
(**30 / 0 / 16**). La diferencia de **7 afirmaciones** contra la cifra escrita en
B13 **precede a H2** y no es atribuible a este sprint; queda anotada **sin
atribuir**, porque cerrarla pide comparar contra un árbol limpio y eso necesita
una operación de git que este sprint tiene prohibida. **No es uno de los tres
números del gate.**

**Lo que falta y por qué no se hizo solo:** el gate guarda un `push`, que es la
única acción de este sprint que sale del disco. Con el 🛑 explícito de la
instrucción apuntando a un número, la salida correcta es poner la prueba delante
del humano y esperar, no decidir por él que su número estaba mal. Los pasos 0 a 5
están completos; **pendiente: `git add` de las dos rutas, `git commit`,
`git push`.**

### 11.6 · `git status` antes del commit

Las eliminaciones ya están **en el índice**, porque `git rm` las stagea al
ejecutarse (es parte del PASO 1, no del 6). **Los dos docs NO se stagearon**, a
la espera del gate.

```
   staged D (.github/skills/impeccable/):    143
   staged D (.github/hooks/impeccable.json):   1
   staged D (.impeccable/):                    1
   unstaged M:                                 1
   untracked ??:                               2
   TOTAL entradas:                           148
```

Las tres entradas que no son eliminaciones, textuales:

```
 M logic-core-v3/docs/rediseno/CONTENIDO-PENDIENTE.md
?? logic-core-v3/docs/rediseno/LICENCIA-BOOKOFSHAPES.md
?? logic-core-v3/docs/rediseno/outputs/H1-HERRAMIENTAS.md
```

🔴 **`CONTENIDO-PENDIENTE.md` está donde tiene que estar: modificado y SIN
stagear** (` M`, con el espacio en la primera columna). No se tocó, no se stageó,
y no va a entrar al commit.

### 11.7 · `git status` después del push

**Superado por §11.12.** Cuando se escribió esta línea el commit estaba frenado
por §11.5; el humano levantó la parada el 2026-09-12 y el cierre quedó registrado
más abajo.

---

# §11 · CIERRE DE H2 — la parada de §11.5 levantada

> **El humano levantó la parada el 2026-09-12:** el 18 del gate era una cifra mal
> tomada de un resumen, y **16 es el número correcto, medido contra HEAD**. Lo que
> sigue son los cinco pasos del cierre y el commit. **§11.5 queda vigente como
> registro de la medición; su parada ya no aplica.**

### 11.8 · PASO 1 — el delta de 7 afirmaciones, cerrado

**La comparación suite por suite no encontró ninguna suite abajo.** Encontró una
**arriba**, y la diferencia total sigue siendo de la aritmética del resumen de
B13.

**Primero el chequeo que lo cierra: dos contadores independientes de la MISMA
corrida dan el mismo número.** `verificar` imprime las afirmaciones dos veces —una
línea por cada uno de los **133 invariantes** y otra por cada uno de los **27
agregados**—:

| contador | suma |
|---|---|
| A — las **133** líneas por-test | **5.358** |
| B — los **27** agregados | **5.358** |
| **coinciden** | **sí** |

B13 declaró **5.365** en prosa. El delta de **7** es contra los dos contadores a
la vez, así que **no puede ser un error de lectura de uno de ellos**: la cifra de
B13 no reproduce.

**Y la comparación fila por fila, contra todas las cifras por-suite que B13 dejó
escritas en el repo.** B13 no publicó el desglose de los 133; publicó **14**.
Esas 14 son todo lo comparable, y se comparan:

| suite | B13 (con línea) | H2 medido | |
|---|---|---|---|
| `s22-emision` | 42 · 0 fallas · 1 deuda (`:610`) | 42 · 1 deuda | **IGUAL** |
| `s8-tinta` | 30 · 3 deudas (`:615`) | 30 · 3 deudas | **IGUAL** |
| `s8-escena` | 36 (`:615`) | 36 | **IGUAL** |
| `s13b-escena` | 50 (`:613`) | 50 | **IGUAL** |
| `s16-encuadre` | 21 (`:614`) | 21 | **IGUAL** |
| `s16-anclaje` | 29 (`:614`) | 29 | **IGUAL** |
| `s16-techo` | 16 (`:614`, y otra vez en `:1085`) | 16 | **IGUAL** |
| `s3-frontera` | 12 (`:608`) | 12 | **IGUAL** |
| `s11-frontera` | 11 (`:608`) | 11 | **IGUAL** |
| `s12e-tension` | 21 (`:611`) | 21 | **IGUAL** |
| `s11e-piso` | 16 (`:611`) | 16 | **IGUAL** |
| `s12e-barrido` | 12 (`:611`) | 12 | **IGUAL** |
| `s9e-composicion` | 15 (`:611`) | 15 | **IGUAL** |
| **`s10-logo`** | **36** (`:612`) | **37** | **DISTINTO: +1** |

**13 de 14 coinciden exactas. La única que difiere es `s10-logo`, y difiere para
ARRIBA: 37 contra el 36 que escribió B13.** Medida dos veces por caminos
distintos — en el agregado (`parcial test:s10-logo 37 afirm · 11 ctrl+ · 0 fallas
· 4 fuera de ventana`) y corriéndola sola (`npm run test:s10-logo` →
`s10-logo.invariant: 37 afirmaciones, 0 fallas, 4 fuera de ventana`). **Es
determinista y vale 37.** La fila de B13 dice, textual:

> `:612` — «\| `s10-logo` \| 36 · 0 (era 34; §3, §6, §7 y §9 re-escritos) \|»

**Veredicto del paso: no hay ninguna suite ~7 abajo, así que no corresponde
frenar.** Lo que hay son **dos discrepancias independientes en la prosa de B13**,
y van en sentidos opuestos: el total sobra 7 y `s10-logo` falta 1. Las dos son de
transcripción del resumen, no del repo — el árbol entregó 5.358 por dos
contadores, 30 pasos, 0 fallas y 16 deudas, y H2 no puede mover ninguna de esas
cifras (la prueba por enumeración está en §11.5, Prueba 2).

⚠️ **Límite de la comparación, dicho para que nadie lo lea de más:** B13 publicó
**14 de 133** suites. De las otras **119 no existe cifra registrada en el repo**,
así que no se comparan — no se afirma que coincidan, se afirma que no hay con qué
compararlas. Lo que sí está cerrado con número es el total, por los dos
contadores.

### 11.9 · PASOS 2 y 3 — las dos correcciones de documento

**PASO 2 · `LICENCIA-BOOKOFSHAPES.md` §4.** Se sacó la referencia a «Handoff 4»
—los handoffs no están en el repo, viven afuera, y citarlos dejaba una ruta que
nadie puede abrir—. El motivo quedó escrito solo:

> «`Joy Division Mesh` es una **grilla deformada con relieve topográfico** — la
> misma propiedad que se busca para enriquecer la sala geométrica. Es el patrón
> con más chance de que alguien lo elija, y es uno de los tres que no se pueden
> publicar.»

**PASO 3 · `auditorias/A3-ESTADO-ECC-SKILLS-2026-08.md`.** Se agregó **una
corrección fechada 2026-09-12 inmediatamente debajo de la tabla §5**, sin
reescribir nada del resto. Desactiva las filas **#4** y **#5** para este worktree:
deja dicho que describen `C:\PorfolioDevelOP`, que en `C:\rediseno-home` el
`settings.local.json` tenía cero hooks y el único manifiesto presente era el de
**GitHub Copilot** (`reference/hooks.md:17`), que **el hook nunca corrió en Claude
Code acá**, y que en H2 se eliminaron las cuatro rutas más la entrada del
lockfile. Apunta a §3 y §11 de este reporte por la evidencia.

*(La cabecera del propio A3 ya lo delataba: su §1.1 se titula «Nivel repo —
`PorfolioDevelOP/.claude/`».)*

### 11.10 · PASO 4 — el origen de `copy-editing`, `copywriting` y `cro`

**No son del plugin, y la pregunta se contestó antes de editar nada.** Tres
medidas, las tres en el mismo sentido:

| prueba | resultado |
|---|---|
| ¿symlink a un plugin, o directorio real? | **directorios reales** en `.claude/skills/` (5, 4 y 4 archivos) |
| ¿qué declara `skills-lock.json`? | las tres con `source: coreyhaines31/marketingskills`, `sourceType: github` |
| ¿las provee `design@knowledge-work-plugins`? | **NO** — las del plugin viven en `~/.claude/plugins/cache/knowledge-work-plugins` y son las namespaced `design:*` (`accessibility-review`, `design-critique`, `design-handoff`, `design-system`, `research-synthesis`, `user-research`, `ux-copy`). Ninguna de las tres está ahí |

Así que **no caen en el caso «no las edites»**: son terceros instalados por el CLI
de skills, locales a este repo y gitignoreadas (`.gitignore:2`). Se les agregó
`disable-model-invocation: true` **en la línea 4**, antes del bloque `metadata:`:

| skill | versión | frontmatter final |
|---|---|---|
| `copy-editing` | 2.0.0 | `---` · `name` · `description` · **`disable-model-invocation: true`** · `metadata: version: 2.0.0` · `---` |
| `copywriting` | 2.0.1 | idem, `version: 2.0.1` |
| `cro` | 2.0.0 | idem, `version: 2.0.0` |

⚠️ **La advertencia que el caso del plugin tenía, acá aplica igual por otra
puerta:** son de terceros, así que **`npx skills update` las sobrescribe** y se
llevaría la declaración puesta. No es un riesgo de plugin, es un riesgo de
`update`. Si alguna vez se corre, hay que volver a poner las tres líneas — o no
correrlo sobre estas tres.

**Con esto quedan cinco skills del repo con el opt-out declarado** (`animate`,
`review-animations`, `copy-editing`, `copywriting`, `cro`) y ninguna instalada sin
él. `frontend-design` está desactivada por nombre (`frontend-design.disabled`) y
no la expone el runtime.

### 11.11 · PASO 5 — el opt-out verificado con instrumento, no con el frontmatter

El frontmatter es lo que uno escribe; lo que importa es lo que el runtime hace con
él. Y el runtime tiene un instrumento propio: **pedirle la skill y ver si la
entrega.** Leer el archivo no sirve —es justo lo que falló del otro lado—, y acá
además el `.claude/skills/` son symlinks, que es lo que se tragó el chequeo
anterior.

**ANTES — la lista que expuso el runtime, y el control positivo que venía de
fábrica.** Al arrancar la sesión el runtime listó como invocables por el modelo,
entre otras: **`copy-editing`, `copywriting`, `cro` e `impeccable`**. Y justo
después de instalar las dos de Emil volvió a listar, esta vez con una sola línea:

```
- animate: Build an animation from scratch, making the decisions in the order that
  determines whether it feels right — …
```

**`animate` sí. `review-animations` no.** Las dos acababan de instalarse del mismo
repo, en el mismo comando, al mismo directorio. **La única diferencia entre ellas
era `disable-model-invocation: true`.** Ese contraste es el control positivo: prueba
que el runtime lee el campo y excluye a quien lo declara — sin tener que creerle a
ningún frontmatter.

**DESPUÉS — las seis pruebas funcionales, con la respuesta textual del runtime:**

| skill | pedida al runtime | respuesta |
|---|---|---|
| `animate` | sí | `Skill animate cannot be used with Skill tool due to disable-model-invocation.` |
| `copy-editing` | sí | `Skill copy-editing cannot be used with Skill tool due to disable-model-invocation.` |
| `copywriting` | sí | `Skill copywriting cannot be used with Skill tool due to disable-model-invocation.` |
| `cro` | sí | `Skill cro cannot be used with Skill tool due to disable-model-invocation.` |
| `find-skills` | sí (control) | `Unknown skill: find-skills` |
| `impeccable` | sí (control) | `Unknown skill: impeccable` |

**Tres cosas quedan medidas, no supuestas:**

1. **`animate` ya NO es invocable por el modelo.** Antes del arreglo el runtime la
   listaba; ahora la rechaza por nombre y por motivo. El ciclo completo
   —aparecía → se le agregó la línea → el runtime la rechaza— está cerrado con
   evidencia de los dos extremos.
2. **El instrumento discrimina, no rechaza todo.** Las dos eliminadas dan
   `Unknown skill`, un error **distinto** del de opt-out. Si el runtime estuviera
   negando cualquier cosa, las seis darían lo mismo. No lo dan.
3. **El cambio tomó efecto en la misma sesión.** No hizo falta abrir una nueva, al
   contrario de lo que vale para los comandos (`CLAUDE.md:129`). Vale para las
   cinco.

Y de paso, el control de `impeccable` confirma §11.1 desde el otro lado: no es que
se borraron unos archivos, es que **el runtime ya no la conoce**.
