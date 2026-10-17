# SPRINT S0 — Páginas de servicio de develOP · plan sin código

Versión 2 · 2026-10-17 · Autor: CC (S0, solo lectura) · Para: el chat «PÁGINAS NUEVAS» y Valentino.

**Cambios de la V2:**
- §0 tiene el estado real del worktree, lo que trajeron B1.1b y B1.2, y las citas que se movieron (§0.5).
- Todas las citas están revalidadas contra `54655181`.
- `_archivo/` ya existe (§1). Hay ids y atributos reservados nuevos (respuesta 4 y §11.2). `proyectos.ts` pasa reseñas por la llave del contenido inventado (§0.4 y §8.3).
- §12 tiene las decisiones de Valentino. §7, §8 y §10 quedan alineados con ellas: la partición nueva (S1a, S1b, S2) reemplaza a la de la V1.

Fuentes leídas enteras: `docs/servicios/SPEC.md` (v2) y `docs/servicios/CONTRATO.md` (v1). Si chocan en algo técnico, vale CONTRATO.

**Cómo leer las citas.**
- Rutas relativas a `logic-core-v3/`; `v3/` es `src/app/v3/`.
- Las líneas son de `paginas/servicios` @ `54655181`, que también es el HEAD de `rediseno/home`.
  - La V1 citaba `52d38204` y `db37bfb9`. Las citas que se movieron están en §0.5.
  - Ninguna cambió de contenido, salvo el interior de `PROYECTOS` (§0.4).
- Marcas:
  - **[leído]**: comprobado por mí en el código.
  - **(barrido)**: viene de un subagente de exploración y no lo revisé línea por línea.
  - **[deducido]**: sale de encadenar código, sin correrlo.
  - **[NO DETERMINABLE LEYENDO]**: va con cómo se mide en el S1a o el S1b.
- **Propuesta mía** (o **propuesta de CC**) = decisión de CC, sin confirmar por nadie. Las de la V1 están juntas en §11; lo que decidió Valentino, en §12.

---

## 0. Encabezado

### 0.1 El worktree, como está

| Qué | Estado (2026-10-17, 14:50) |
|---|---|
| Worktree | `C:\paginas-servicios\`, con la app en `logic-core-v3\`. Lo creó Valentino desde `rediseno/home`. |
| Rama | `paginas/servicios` (`git branch --show-current`). |
| HEAD | `54655181`, «B1.2: el selector vivo en escritorio y tablet (…)», 2026-10-17 09:30. `rediseno/home` sigue en el mismo commit. |
| `git status --short` | `?? docs/servicios/` (`SPEC.md`, `CONTRATO.md` y este archivo, sin trackear). No hay otro cambio. |
| `node_modules` | Instalado con `npm ci` (Valentino). Comprobado: existen `node_modules\.bin\tsc.cmd` y `node_modules\next`. |
| `.env.local` | Existe. Está ignorado (`.gitignore:96`); CC no lo lee ni lo imprime. |
| `C:\paginas-servicios-datos\` | Existe y está vacía. |
| Memoria libre | **0,81 GB** de 13,90 GB. Con menos de 3 GB, el S1a se frena antes de crear archivos (§12.4). |

### 0.2 La base

- **La V1 se leyó sin worktree,** con `git show <commit>:<ruta>` desde `C:\PorfolioDevelOP`:
  - de `52d38204` (2026-10-16 21:40, «docs: cierre de A-ter…»), que era `rediseno/home` al empezar;
  - de `db37bfb9` (2026-10-17 08:01, B1.1a), lo que llegó durante el S0.
- **La rama salió de `rediseno/home` en `54655181`,** dos commits después de `db37bfb9`:
  - `8e6103cb` (08:55), B1.1b: «la base del Portfolio (el tunel al archivo, la seccion nueva con el selector, la regla de alturas y los tests migrados)»;
  - `54655181` (09:30), B1.2: «el selector vivo en escritorio y tablet (…)».
- **`git diff --stat db37bfb9..HEAD`** da 108 archivos.
  - De los que el plan cita con línea cambiaron 11. Sus citas se revalidaron con los hunks de `git diff -U0` (§0.5).
  - Otros dos que el plan nombra sin línea también cambiaron: `_secciones/_contrato/llave.ts` y `_lib/__tests__/s76-portfolio.invariant.tsx`.

### 0.3 Qué trajo B1 y qué le cambia al plan

**B1.1a** (`db37bfb9`) trajo:
- `proyectos.ts`;
- `public/portfolio/`: 3 proyectos, cada uno con 2 pósters `.webp` y 2 videos `.mp4`;
- el invariante `s76-portfolio` y sus scripts.

Nada de eso cambió el plan de la V1.

**B1.1b y B1.2** (`8e6103cb` y `54655181`) sí le cambian cosas:
- **`_archivo/` ya existe.**
  - B1.1b archivó el túnel en `v3/_archivo/tunel-portfolio/`: «fuera de la página, sin importar desde ningún lado» (`v3/_archivo/tunel-portfolio/README.md:1`).
  - Su test está cableado: `test:s76-archivo-tunel` (`package.json:341`).
- **`proyectos.ts` pasa reseñas por la llave del contenido inventado** (§0.4). Servicios no lee esos campos (§8.3).
- **Ids nuevos en el home:** `portfolio-el-garage`, `portfolio-esquina-estudio`, `portfolio-banu-scents` y `portfolio-la-tuya` (`_secciones/trabajos/portfolio/anclas.ts:17-21`).
  - El viaje los usa como deep links (`_componentes/destinosDelViaje.ts:148-149,185`).
  - Quedan reservados (respuesta 4).
- **La escena suma dos piezas,** montadas en `_lib/escena/ProbeStage.tsx:329-330`. Fuera del Portfolio no hacen nada [leído]:
  - `OscurecidoDelPortfolio`: con el peso en 0, no se dibuja (`_lib/escena/OscurecidoDelPortfolio.tsx:48-52`);
  - `SignoDeLaTuya`: si el Portfolio no está adentro, sale antes de leer el DOM (`_lib/escena/SignoDeLaTuya.tsx:88-90`). Busca `[data-signo-de-la-tuya]` (`:10`), que pasa a ser un atributo reservado.
  - El estado lo escribe solo el hook de la sección (`_secciones/trabajos/portfolio/usePortfolio.ts:93-104`). Sin la sección, queda en `adentro: false` y peso 0 (`_lib/escena/portfolioEnLaEscena.ts:47-55`).
- **El diagnóstico de la carga** reemplazó la falla del túnel por tres del Portfolio.
  - Las tres exigen la sección en pantalla, un video o un ancla `#portfolio-…` (`_lib/diagnostico/fallas.ts:143-146`).
  - En nuestras páginas no aplica ninguna [deducido].
- **Lenis:** la instancia queda anotada en `LENIS_DEL_SITIO` (`_lib/lenisDelSitio.ts:8`). Para servicios no cambia nada.
- **Padrones:** `s5-archivos`, `s10-acceso`, `s7-arboles`, `s8-chrome` y `s5-contenido` cambiaron registros y conteos del home.
  - Ninguno cambió qué carpetas recorre [leído en el diff].
  - Las conclusiones de §5 siguen en pie.
- **El escáner de precios (P-H8)** suma a su lista blanca los años de las fechas del Portfolio. La regla y el patrón no cambian (`_secciones/_contrato/escaneo.ts:22,140-141`).

### 0.4 `proyectos.ts` y `public/portfolio/`

Los dos existen en `54655181`. `public/portfolio/` tiene 3 proyectos, cada uno con 2 pósters `.webp` y 2 videos `.mp4`.

Qué exporta `proyectos.ts` [leído]:

- **Tipos:**
  - `SlugDelProyecto = 'el-garage' | 'esquina-estudio' | 'banu-scents'` (`:25`). El tipo **no** se llama `ProyectoSlug` y su nombre no figura en el contrato.
  - `ResenaDelProyecto` (`:27-30`).
  - `MediosDelProyecto` (`:33-36`): `video` y `poster`, cada uno `{ escritorio, movil }`. Solo trae rutas, **no medidas**.
  - `ProyectoDelPortfolio` (`:38-54`), con estos campos:
    - `slug`, `nombre`, `url`, `medios`, `alt` (lo que se ve en el video);
    - `rubro`, `fecha` y `servicio`, los tres `string | null`;
    - `queHicimos`, `problemaCliente`, `problemaResuelto`, `resultado` y `resena`, todos `| null`.
- **Valores y funciones:**
  - `mediosDe(slug)` (`:57-63`).
  - `PROYECTOS: readonly ProyectoDelPortfolio[]` (`:67-113`), en orden: El Garage, Esquina Estudio, Banú Scents.
  - `seMuestraElServicio` (`:116-118`) y `textosDelProyecto` (`:121-126`).
- **Lo nuevo de B1.1b: la llave del contenido inventado.**
  - `proyectos.ts` importa `INVENTOS` y `conLlave` de `_contrato/inventado` (`:23`).
  - Pasan por `conLlave(...)` la reseña de los tres proyectos y el `problemaResuelto` de Esquina y de Banú (`:79,92,94,107,109`).
  - En el código commiteado la llave está apagada (`_secciones/_contrato/llave.ts:79-80`). Esos campos muestran marcadores: `[TEXTO]`, `[TESTIMONIO] · pendiente` y `[NOMBRE]` (`proyectos.ts:8-11`).
  - Prendida a mano, muestran texto de relleno.
- **Nombres visibles:** «El Garage», «Esquina Estudio», «Banú Scents», con tilde (el SPEC escribe «Banu»). Servicios toma los nombres de acá; no los escribe.
- **Medidas de los pósters:**
  - No están en el código, solo en `docs/rediseno/entregas/b1-portfolio/medios.json`, que no cambió desde `db37bfb9`.
  - Escritorio: 1440×900 (El Garage: 1280×800). Móvil: 780×1688 (Esquina: 690×1494).
  - Ver P-H9.

### 0.5 Citas revalidadas (`db37bfb9` → `54655181`)

- Son los 11 archivos citados con línea que cambiaron.
- Las líneas se trasladaron con los hunks de `git diff -U0`.
- En cada una se comparó el texto viejo con el nuevo: es el mismo.
- La única excepción es el interior de `PROYECTOS`, que cambió en las cinco líneas de §0.4.

| Archivo | V1 | V2 |
|---|---|---|
| `_lib/escena/ProbeStage.tsx` | `:175-189`, `:175`, `:295`, `:320` | `:177-191`, `:177`, `:297`, `:322` |
| `_componentes/ScrollSuaveDeV3.tsx` | `:78` | `:79` |
| `_secciones/trabajos/Trabajos.tsx` | `:120` | `:98` |
| `_componentes/destinosDelViaje.ts` | `:192-199` | `:195-202` |
| `_secciones/_contrato/escaneo.ts` | `:22`, `:137-138` | `:22`, `:140-141` |
| `_secciones/_contrato/inventado.ts` | `:40-43` | `:40-43` (sin cambio) |
| `_lib/diagnostico/publicar.ts` | `:221` | `:246` |
| `_secciones/trabajos/proyectos.ts` | `:22`, `:24-27`, `:30-33`, `:35-51`, `:54-60`, `:64-110`, `:113-115`, `:118-123` | `:25`, `:27-30`, `:33-36`, `:38-54`, `:57-63`, `:67-113`, `:116-118`, `:121-126` |
| `_lib/__tests__/s40-3d-sonido.invariant.tsx` | `:121-124` | `:121-124` (sin cambio) |
| `_lib/__tests__/s5-archivos.ts` | `:51-80`, `:346-359` (de `52d38204`); `:236-237` (de `db37bfb9`) | `:51-80`, `:355-368`; `:228-229` |
| `package.json` | `:12` | `:12` (sin cambio) |

`_secciones/_contrato/llave.ts` y `_lib/__tests__/s76-portfolio.invariant.tsx` también cambiaron, pero el plan los nombra sin línea.

---

## 1. Convenciones del repo aplicables

| Tema | Convención | Evidencia |
|---|---|---|
| Idioma | Nombres de archivos, tipos y funciones en español. Copy en rioplatense (vos, tenés); el SPEC pide neutro con voseo suave, y es compatible. | `AGENTS.md:82`; SPEC §5 |
| Archivos | Componentes en `PascalCase.tsx`; datos y lógica en `camelCase.ts` (`contenido.ts`, `geometria.ts`); invariantes en `kebab-case.invariant.ts(x)`; carpetas de sección en kebab-case. | (barrido) 187 y 390 archivos |
| Carpetas privadas | `_archivo`, `_chrome`, `_componentes`, `_estilos`, `_fuentes`, `_intro`, `_lib`, `_panel-vivo`, `_secciones` (con `_contrato` e `_invariantes` adentro). `_archivo/` existe desde B1.1b: guarda el túnel archivado, que no se importa desde ningún lado (`v3/_archivo/tunel-portfolio/README.md:1`). Las subcarpetas de una carpeta `_x` también quedan fuera del ruteo. | [leído] árbol de `v3/` en `54655181` |
| Server y client | Server por defecto. `'use client'` en la línea 1, solo si hay interactividad real. En /v3 son cliente 161 de 211 `.tsx`. Páginas y layouts son server. | `AGENTS.md:80`; `CLAUDE.md:72` |
| Metadata en /v3 | `export const metadata` estático en cada `page.tsx`, con `robots: { index: false, follow: false, nocache: true }`. Nadie usa `generateMetadata` en `src/app`. | `v3/page.tsx:55-62`; `v3/tipografia/muestra/page.tsx:66-70` |
| Metadata heredada | El layout raíz fija `metadataBase`, **`alternates.canonical` absoluto al home** y `openGraph.url` al home. Una subruta que no los pise hereda el canonical a la raíz. | `src/app/layout.tsx:16,22-24,25-33` [leído] |
| Navegación | En /v3 se usa `<a href>` plano: ni `next/link`, ni `router.push`, ni `triggerTransition` (en /v3, `TransitionContext` ve `null`). | `v3/_chrome/enlaces.ts:14-28` [leído]; `v3/_lib/scrollSuave.ts:27-31` (barrido) |
| Clases arbitrarias | Solo con `var()` de un token: lo exigen los padrones S3, S5 y S6, no el nuestro. Nunca deletrear una clase arbitraria entera en prosa o en comentarios, porque Tailwind 4 escanea todo lo que `.gitignore` no excluye, docs incluidos. | `CLAUDE.md:172-174` |
| 300 líneas | Por archivo, contando líneas de código. Lo aplican los padrones; no es una regla global, pero se respeta igual. | `v3/layout.tsx:10-11`; `s3-codigo.invariant.ts:140-158` (barrido) |
| CSS | Las hojas de /v3 entran solo por `v3/layout.tsx`. Un componente que importa un `.css` rompe los invariantes que corren con tsx. Servicios no crea hojas. | `v3/layout.tsx:9-38`; `CLAUDE.md:248-249` |

### 1.1 Tests

- **Runner:** no hay. Cada test es un script `*.invariant.ts(x)` que corre con `npx tsx <archivo>` y termina con `cerrar(nombre)`.
  - Los helpers están en `v3/_lib/__tests__/afirmar.ts` (barrido): `titulo` (`:123`), `afirmar` (`:39-47`), `afirmarIgual` (`:49-53`), `controlPositivo` (`:59-79`), `noCorre` (`:86-90`), `deudaDeclarada` (`:112-121`) y `cerrar` (`:127-147`, que sale con 1 si hubo 0 afirmaciones).
  - Para renderizar en Node se usa `renderToStaticMarkup`.
- **Control positivo:** es el mismo predicado aplicado a una entrada a propósito equivocada. Si también pasa, el predicado está ciego y suma una falla (`afirmar.ts:4-16`, barrido).
- **Descubrimiento:** solo desde `package.json`. `verificar` toma los scripts `^test:(s\d+[a-z]?)-(.+)$` cuyo comando sea exactamente `npx tsx <archivo>` y cuyo archivo exista (`v3/_lib/__tests__/s4-suites.ts:43-45,102-105`, barrido).
- **¿Una carpeta de tests nueva corre con un script existente, sin tocar `package.json`? No.** No la ve ni `verificar` ni ningún `npm run`. Eso es **P-H7**. Mientras tanto, se corren a mano: `npx tsx src/app/v3/_servicios/__tests__/<x>.invariant.ts`.
- **Ubicación:** tiene que ser una carpeta nueva, sin invariantes cableados.
  - Si un test nuestro cae en una carpeta que ya tiene cableados (`_lib/__tests__`, `_lib/escena/__tests__`, `_lib/motion/__tests__`, `_chrome/**`, `_intro/__tests__`, `_secciones/<x>` y, desde B1.1b, `_archivo/tunel-portfolio`), `s4-cobertura` lo marca como huérfano (`s4-suites.ts:197-201`; `s4-cobertura.invariant.ts:68`, barrido).
  - En `_lib/escena`, `_intro` y `_chrome` además falla `s8-montaje` §6 (`s8-montaje.invariant.ts:193`, barrido).
- **`tsx` no está en el proyecto** [leído]: no figura en `package.json`, ni en el lockfile, ni en el `node_modules\.bin` del home. Vive en la caché de npx (`%LOCALAPPDATA%\npm-cache\_npx\fd45a72a545557e9\node_modules\tsx`, v4.23.15) y todo el repo lo usa así. Ver D14.

### 1.2 Lint, tsc y `verificar`

**Lint por archivo** (desde `logic-core-v3\`): `.\node_modules\.bin\eslint.cmd <archivo>`.
- ESLint 9 con config plana: `next/core-web-vitals` y `next/typescript`. Ignora `.next/**`, `out/**`, `build/**` y `next-env.d.ts` (`eslint.config.mjs:2-15`, barrido).
- No hay reglas propias de /v3: esas fronteras las cuidan los invariantes.

**tsc:** `.\node_modules\.bin\tsc.cmd --noEmit`, nunca con npx.
- Ojo con la memoria. Según los docs, tsc usa ≈2,47 GB y con el heap por defecto da OOM (`docs/rediseno/SPRINT-PULIDO-20.md:195-198`, barrido).
  - `verificar` lo corre como `node --max-old-space-size=4096 node_modules/typescript/bin/tsc --noEmit` (`s4-verificar.ts:107-113`, barrido). Si `tsc.cmd` da OOM, esa es la variante, y tampoco usa npx (D15).
  - Para O-3, cuenta como proceso pesado.
- `tsconfig.json` (barrido): `strict` (`:11`); el include toma `**/*.ts(x)` sin excluir los tests (`:32-79`); `incremental` genera `tsconfig.tsbuildinfo`, que está ignorado (`.gitignore:106`).

**`npm run verificar`** = `npx tsx v3/_lib/__tests__/s4-verificar.ts` (barrido). Corre en serie, sin cortar ante una falla:

1. `package.json` válido, sin marcadores de conflicto ni claves duplicadas (`:60-78`).
2. Paso 1b: marcadores de conflicto en todo el repo, docs incluidos (`s4-conflictos.ts:69-87,94-111`).
   - Patrón [leído] (`s4-paquete.ts:36`): una línea que empieza con exactamente 7 `<`, `=` o `>`, seguidos de espacio o fin de línea.
3. tsc con heap de 4 GB (`:107-113`).
4. Un agregado por suite, derivado de `package.json` (`:125-148`; `s4-agregado.ts:33-43`). `frontera` queda afuera (`:30-35,174`).
5. Resumen y código de salida 0 o 1 (`:167-175`).

Lo que conviene saber:
- **Qué no corre:** build, dev server, Playwright, Chrome ni eslint.
- **Dependencias de algunos invariantes:**
  - varios leen el `.next/` de un build y salen con 1 si no existe (`bundle.invariant.ts:63-68`);
  - algunos llaman a `git` (`s3-git.ts:34`; `s40-3d-sonido.invariant.tsx:121`) o a `ffmpeg` (`s55-pulido-4.invariant.tsx:241`).
- **Solo imprime a consola** y no guarda archivos: la base hay que redirigirla (ver S1a y §12.4).
- **Trae la salida entera de tsc:** si hay errores, el paso 2 imprime cada línea con el prefijo `  │ ` (`s4-verificar.ts:104-123`; la impresión, en `:120`) [leído].
- **Peso y duración, según los docs:**
  - unos 10 min (`CLAUDE.md:167`);
  - hasta ~20 min, y el vigilante de memoria lo cortó 3 veces con 650–750 MB libres (`docs/rediseno/outputs/TEXTO-1.md:473-479`, barrido);
  - tsc ≈2,47 GB.
  - En `54655181` son ≈80 suites y ≈159 invariantes: 79 y 157 contados en `52d38204`, más la suite s76 con sus dos invariantes (`package.json:340-342`).
- **Rojos de base conocidos:** s1, s2, s3, s4, s5, s7, s8 y s17 (CONTRATO O-5). Según los docs, «piden un build» (`docs/rediseno/SPRINT-PULIDO-20.md:194`, barrido).
  - El de s4 se ve leyendo: s23–s36 y s39 no tienen su atajo `test:<suite>`, y `s4-cobertura` §6 lo exige (`s4-cobertura.invariant.ts:154-155`, barrido).
  - Estado actual: [NO DETERMINABLE LEYENDO]. Es la base que guarda el S1a.

### 1.3 `visual-qa`

- **Dónde está:** hay uno solo, en la raíz del repo, `.claude/agents/visual-qa.md` (barrido). `logic-core-v3/.claude/` solo tiene `launch.json`. En ninguno de los dos `.claude/` hay `settings*.json` ni hooks.
- **Qué necesita:**
  - el modelo haiku-4-5 (`:4`) y las herramientas `mcp__Claude_Preview__preview_*` (`:5-19`);
  - levanta su propio servidor desde `launch.json`: `next-dev` en el **3000** para UI liviana, y `next-prod-qa` en el **3001** para toda ruta con canvas o 3D (`:36-53`). `next-prod-qa` es `npm run start:qa`, o sea build más `next start -p 3001`;
  - si el puerto ya está ocupado por un servidor externo, reporta PENDIENTE y para (`:55`).
- **Cómo recorre y qué devuelve:**
  - agrega `?e2e=1` a toda URL (`:57-61`), aunque ni en `v3/` ni en el chrome raíz se lee `e2e` [leído];
  - usa viewports de 1280×800 y 390×844 (`:120-128`);
  - reporta ✅/⚠️/❌/❓ (`:163-191`).
- **Así como está, no sirve para servicios:**
  1. Esta sesión no tiene ninguna herramienta `Claude_Preview`; sí tiene `chrome-devtools` y `claude-in-chrome`.
  2. Nuestras páginas tienen el canvas debajo, así que elegiría `next-prod-qa`: un build completo (~30 min, sin nada en paralelo) en el 3001, donde ya va a correr nuestro dev.
  3. `next-dev` usa el 3000, que es el puerto del home.
  - Qué hacer: D13.

---

## 2. Respuestas al contrato (CONTRATO §8)

Estas respuestas también van a `LOG-SERVICIOS.md`, sección «Respuestas al contrato». Las copia el chat; CC no edita ese archivo.

### 1) El `<Canvas>` y qué hace la escena en `/v3/<subruta>`

**Dónde se monta: en el layout de /v3, no en la página.** [leído]
- `v3/layout.tsx:314` monta `<EscenarioCompuerta />`.
- Eso lleva a `v3/_componentes/EscenarioCompuerta.tsx:85`: `dynamic(() => import('../_lib/escena/EscenaDelHome'), { ssr: false })`.
- Y de ahí al `<Canvas>`, en `v3/_lib/escena/ProbeStage.tsx:177-191`.

**No filtra por ruta ni por ancho.** [leído]
- `EscenarioCompuerta` no tiene `return null` ni `usePathname` (`EscenarioCompuerta.tsx:87-98`).
- El ancho solo elige la calidad y el `key`: `plena` desde 1024 y `compacta` por debajo, con `dpr` [1, 1.5] y [1, 1] (`_lib/escena/ajustes.ts:163-173`).
- El umbral real es **1024** (`v3/_lib/compuerta.ts:135,142,145`). Los comentarios que dicen 1025 están vencidos.
- El lienzo es opaco (`alpha: false`, `_lib/escena/configuracionDelCanvas.ts:56`) y fijo a pantalla completa: z-0 desde 1024, −z-10 por debajo (`_lib/escena/contrato.ts:133`).

**¿Corre? Sí, y para siempre.** [leído]
- La fase arranca en `corriendo` (`_lib/escena/visibilidad.ts:106`) y el lazo es `'always'` salvo en la fase `suspendida` (`:290-292`; `EscenaDelHome.tsx:168`).
- La fase solo cambia dentro de `leer()`, y `leer()` sale en `_lib/escena/ataduraAlScroll.ts:129` si no hay ningún `[data-panel]`.
- La física queda prendida (`EscenaDelHome.tsx:158`).
- No hay IntersectionObserver del lienzo ni pausa por visibilidad. Solo el navegador frena rAF cuando la pestaña está oculta.

**¿El scroll la mueve? No.** [leído + barrido]
- El progreso sale de la extensión de los `[data-panel]` (`ataduraAlScroll.ts:125-136`), no de `scrollHeight`. El comentario de `v3/layout.tsx:84-92` que dice lo contrario está vencido.
- Sin paneles no se escribe nada. En carga directa el progreso queda en 0: la pose del hero a mediodía (`probeStore.ts:396`, `lightArc.ts:265`, barrido).

**Lecturas del DOM del home.** Ninguna tira una excepción.
- `anclaje.ts`, `recorrido.ts` y `secciones.ts` viven en `_lib/escena/` (no en `_lib/`) y son constantes, sin DOM. La única división está protegida: `if (!(recorrido > 0)) return 0`, y el resultado se acota a [0, 1] (`_lib/escena/anclaje.ts:291-293`). [leído]
- `[data-panel]`: si no hay nodos, devuelve `null` y no hace nada (`ataduraAlScroll.ts:128-129`). [leído]
- La noche:
  - `CapaDeLaGota` la monta **la página** (`v3/_secciones/trabajos/Trabajos.tsx:98`, una capa `fixed inset-0 z-50`) y mira el panel de **Trabajos**, no Quiénes somos (`CapaDeLaGota.tsx:67-74,221-250`, barrido). Esto corrige el CONTRATO §1.1.
  - Sin ella, la noche no se dispara: `NOCHE_DISPARADA.cantidad = 0` y `DIA_DEL_FINAL.activo = false` (`_lib/escena/nocheDisparada.ts:63,100`).
  - `[data-panel="servicios"|"tu-panel"]` se lee con `?.`, así que da `null` y no hace nada (`:192-194,204-205`). [leído]
- El pie 3D: [leído]
  - `PieDeVolumen` se monta **dentro de la escena**, perezoso y solo desde 1024 (`ProbeStage.tsx:322` → `_lib/escena/PruebasDeLaEscena.tsx:22,36,46-50`).
  - No busca el DOM por id: arma lo que anota el pie del DOM.
  - Sin piezas no arma nada, pero pone `EN_VIVO.pieEntero = false` en cada cuadro (`_lib/escena/pie3d/armadas.ts:144`).
- `FinalDelPie` (en la escena, `ProbeStage.tsx:297`) busca `getElementById('cierre')` con guarda (`_lib/escena/final/FinalDelPie.tsx:177-178,199`). [leído]
- Las dos piezas del Portfolio que sumó B1.2 (`ProbeStage.tsx:329-330`) no leen nada en nuestras páginas. [leído]
  - `SignoDeLaTuya` sale antes del `querySelector`.
  - `OscurecidoDelPortfolio` no se dibuja.
  - El detalle está en §0.3.
- La señal de carga: [deducido]
  - `abrirLaCarga()` la llama solo `VeloDeCarga`, que es de la página del home (`v3/page.tsx:68`; `v3/_lib/carga.ts:76-81`).
  - La caída del logo la espera (`_lib/escena/intro/caida.ts:72`). En una carga directa con la página arriba, el logo queda estacionado fuera de cuadro (`_lib/escena/intro/CaidaDelLogo.tsx:38-43`).
  - Se mide con `?diag=carga` → `__v3diag.estado().escena.cargaLista` (`_lib/diagnostico/publicar.ts:246`).
- La lectura que **sí** alcanza a nuestra página: cada 200 ms (50 ms con scroll), la escena mide la caja de cada `h1`, `h2`, `h3`, `p`, `li`, `blockquote`, `figcaption`, `a` y `button` dentro de `[data-v3]` (`_lib/escena/energia/textoEnPantalla.ts:9,40,50-66`). Es costo de hilo principal, proporcional al texto de la página. [leído]

**¿Errores o NaN? Leyendo, no.** [leído]
- La única división está protegida y el resto, acotado.
- El único aviso propio de la escena es `EscudoDeLaEscena.tsx:37`, si cae WebGL; en ese caso la escena devuelve `null` (`:43`).
- La confirmación en runtime la hace el S1b.

**Efectos secundarios desde 1024.** [leído + deducido]
- `FinalDelPie` instala **siempre** escuchas globales en captura, no pasivas, de `wheel`, `touchmove` y `keydown` (`FinalDelPie.tsx:176`; `v3/_lib/gestosDelScroll.ts:118-124`).
- Esas escuchas retienen el gesto si el reloj del final está en `corre` (`_lib/escena/final/recorridoDelFinal.ts:351`).
- El reloj pasa a `corre` al fondo, con `pieEntero` en `true` (`:279`). `pieEntero` arranca en `true` (`:383`), y `PieDeVolumen` recién lo baja cuando cargó su módulo perezoso.
- Hay una carrera: si se llega al fondo antes de eso (una página corta, o apretar `Fin` apenas carga), arranca el final y **se come el primer gesto hacia arriba**.
- Por debajo de 1024 no hay pie 3D y el final corre al fondo, pero la retención exige `#cierre` a la vista (`FinalDelPie.tsx:177-178`).
- Se mide en el S1b.

**Costo.**
- Un solo contexto WebGL (`ProbeStage.tsx:177`), con MSAA. [leído]
- Sin sombras ni EffectComposer, pero con pases propios. (barrido)
- Plasma de 1100 brasas en escritorio y 550 en teléfono (`energia/direcciones.ts:27`); piso de ~5.900 bloques con simulación en GPU (`piso/PisoVivo.tsx:65,94`). (barrido)
- La medición escrita en el código: 74,97 fps, con p95 de 13,8 ms (`_lib/escena/ajustes.ts:36-65`). (barrido)
- Memoria de GPU: [NO DETERMINABLE LEYENDO].

### 2) Lenis, preloader y cursor en una subruta

**Lenis: corre.** [leído]
- `CompuertaDelScrollSuave` está en el layout (`v3/layout.tsx:309`) y se activa desde 1024 y sin movimiento reducido (`v3/_lib/scrollSuave.ts:73-76,84-91`).
- Hace `new Lenis` sobre `window` (`v3/_componentes/ScrollSuaveDeV3.tsx:79`) y no depende del DOM del home.
- Solo intercepta los enlaces de `SELECTOR_DE_LOS_VIAJES`: barra, menú, pie y CTA del hero (`v3/_componentes/deslizamiento.ts:257-264`). Un `<a href="#x">` propio de la página salta de forma nativa.
- El hook del viaje ata `[data-v3] main` una sola vez, al montar (`v3/_componentes/useDeslizamientoDelCta.ts:151-154`).

**Preloader: no corre.** [leído]
- `IntroDelHome` solo está en `v3/page.tsx:70`, y además `CON_PRELOADER = false` (`v3/_intro/IntroDelHome.tsx:77-81`).
- El `<script>` pre-paint (`src/app/layout.tsx:109` → `introBoot.tsx`) solo marca el `<html>` en `/` y `/v3` exactos (`src/components/layout/home-intro/introRutas.ts:57,72`). Su única regla CSS oculta el overlay, no contenido (`src/app/globals.css:467-469`).
- `VeloDeCarga` solo está en `v3/page.tsx:68`. Ningún CSS de /v3 oculta contenido a la espera de una señal.

**Cursor propio: no corre**, salvo que la página monte `ChromeDelHome`. [leído]
- Lo monta `v3/_chrome/ChromeDelHome.tsx:189`, con `CURSOR_PROPIO_EN_EL_HOME = true` (`v3/_chrome/contrato.ts:92`) y solo con puntero fino (`CompuertaDelCursor.tsx:17-24`).
- No hay `cursor: none` en /v3: sin el cursor propio se ve el nativo.

**El chrome del sitio vivo** (Navbar, Shutter, el preloader viejo, el chat) está apagado en toda ruta que empiece con `/v3`. [leído]
- `src/components/layout/publicRoute.ts:42,55-57`; `PublicOnlyComponents.tsx:21`; `ChatWidgetMount.tsx:41`.
- El `SmoothScroll` viejo también se apaga (`SmoothScroll.tsx:98`).

### 3) El modal de contacto

**Dónde se monta.** [leído]
- Solo en `ChromeDelHome.tsx:163` (`<Contacto />`), no en el layout.
- En una subruta se monta solo si la página monta `ChromeDelHome` o `Contacto`. `v3/_chrome/contacto/Contacto.tsx:12-15` es el listener más la hoja.

**Cómo abre con `data-abre-contacto="panel"`: delegación global en captura.** [leído]
- `document.addEventListener('click', …, { capture: true })` más `closest('[data-abre-contacto]')` (`v3/_chrome/contacto/apertura.ts:131-143`; el listener está en `:140`). Sirve para botones renderizados después del montaje.
- El atributo puede ir en un ancestro; el home lo hace así en `v3/_secciones/servicios/CtaDelServicio.tsx:16-24`.
- Hace `preventDefault` sobre todo lo que esté adentro (`:136`).

**Un `data-servicio` extra se ignora sin romper.** [leído]
- Solo se leen `data-abre-contacto` (`:137`) y `data-precarga` (`:123`).
- Pero `data-servicio` **ya es el atributo del acento del tema**, con otro vocabulario: `web`, `ia-automatizacion` y `software` (`src/app/theme-develop.css:1350-1360`; `v3/_secciones/_contrato/acento.ts:47-51`).
- Nuestros slugs no coinciden con ninguno, así que hoy no tiene efecto. Ver P-H5.

**La preselección ya existe.** El CONTRATO §2 suponía que no estaba. [leído]
- Se hace con `data-precarga="<IdDeServicio>"`, que pasa por `PRECARGA_POR_SERVICIO` (`v3/_chrome/contacto/contenido.ts:67-71`):
  - `web` → `['web']`;
  - `software` → `['software']`;
  - `ia-automatizacion` → `['chatbot', 'automatizaciones']`.
- Un valor desconocido da `[]`, sin error (`apertura.ts:122-125`).
- Ver P-H1 y D5.

**El formulario no tiene campo «servicio».** [leído]
- Lo más parecido es `intereses`: 7 casillas (`contenido.ts:22-30`) que ya viajan a la API.
- Los otros campos son presupuesto, nombre, medio (el único obligatorio), empresa y mensaje (`CamposDelContacto.tsx:105-186`, barrido).
- Envía `POST /api/contacto` (`enviarContacto.ts:46`, barrido):
  - valida con Zod (`src/app/api/contacto/route.ts:30-44`; `intereses` en `:32`);
  - tiene límite por IP (`:49-50`);
  - hoy responde `{ ok: true }` y no reenvía a nadie (`:54`).

**El modo.** [leído]
- Arranca en `'barra'` (`apertura.ts:26`) y solo lo cambia `BarraDelHome`, con `fijarModoDelChrome` (`:69`).
- Con `Contacto` solo, en el teléfono abre la placa de escritorio desde arriba, no la hoja compacta de pantalla completa (`v3/_chrome/contacto/FormularioDeContacto.tsx:195,202`).
- Si eso se usa bien en 390×844: [NO DETERMINABLE LEYENDO]. Se mide en S1b y S3; ver P-H6.

### 4) La navbar en una subruta

**Qué renderiza.** [leído]
- `BarraDelHome` (`ChromeDelHome.tsx:160`) arma sus enlaces con fragmentos **relativos** (`v3/_chrome/enlaces.ts:14-21`). En `/v3/paginas-web` resuelven a `/v3/paginas-web#trabajos`, **nunca a `/v3#trabajos`**.
- Contacto es `<a href="#contacto" data-abre-contacto="panel">` (`v3/_chrome/barra/BarraDelHome.tsx:175-185`); Login es `<a href="/login">` (`:186`).

**Qué pasa al hacer clic.** [leído]
- El viaje busca el destino con `getElementById` y, si no existe, sale **antes** del `preventDefault` (`useDeslizamientoDelCta.ts:270` frente a `:282`).
- Resultado: cambia el hash, no scrollea, no recarga y no hay `router.push`.
- No tira excepción ni da NaN: hay guardas `isFinite` en `destinosDelViaje.ts:195-202` y `viajeSinLenis.ts:41-51` (barrido).

**No lleva a `/v3#ancla`: P-H3 aplica.** Además, en la subruta: [leído]
- el salto al contenido apunta a `#hero` (`v3/_chrome/SaltarAlContenido.tsx:84`), que no existe;
- el ítem activo sale de `[data-panel]`, así que nunca se marca;
- el tono del botón del menú arranca en `'claro'` y se calcula leyendo `[data-panel]` (`v3/_chrome/menu/useTonoDebajo.ts:19,22`). En una página oscura puede quedar con el tono equivocado: [NO DETERMINABLE LEYENDO];
- la pastilla es `sticky` de alto 0 y nace a `100svh` menos su margen y su alto (`v3/_estilos/barra.css:14-22`).

**Riesgo para servicios.** Si la página usa ids que busca el home, el viaje y el final del pie actúan sobre ellos (`useDeslizamientoDelCta.ts:301-345`, barrido; `FinalDelPie.tsx:177`).
- Esos ids son `hero`, `quienes-somos`, `numeros`, `trabajos`, `servicios`, `tu-panel`, `por-que-develop`, `cierre` y `contacto`.
- Desde B1.1b se suman los cuatro deep links del Portfolio: `portfolio-el-garage`, `portfolio-esquina-estudio`, `portfolio-banu-scents` y `portfolio-la-tuya` (`_secciones/trabajos/portfolio/anclas.ts:17-21`; `destinosDelViaje.ts:185`). [leído]
- En las páginas de servicio quedan prohibidos. También el atributo `data-signo-de-la-tuya`, que la escena busca (§0.3).

### 5) Tokens de acento y fondo del layout

| Token | Valor | Línea |
|---|---|---|
| `--color-acento-web` | `#1D5B8F` | `src/app/theme-develop.css:326` |
| `--color-acento-ia-automatizacion` | `#1B6B4C` | `:327` |
| `--color-acento-software` | `#57429E` | `:328` |
| `--color-acento` (alias; por defecto, web) | `var(--color-acento-web)` | `:344` |
| Contextos `[data-servicio="web"\|"ia-automatizacion"\|"software"]` | retiñen el alias | `:1350-1360` |

**Los claros (#8FC0E8, #AFA0E8, #7FCBA4) no existen en `theme-develop.css`.** P-H2 aplica. [leído]
- El tema dice: «NO se redefine --color-acento ni se emiten variantes claras. [pendiente]» (`:1444`), con su disparador en `:1460-1462`.
- **Sí existen, con esos mismos valores, en `globals.css`**: son del sistema `ds` del sitio vivo, dentro del `@theme static` que abre en `:52`.
  - `--color-ds-accent-web-on-dark` (`:109`);
  - `--color-ds-accent-ia-on-dark` (`:115`);
  - `--color-ds-accent-software-on-dark` (`:121`).
  - El bloque aclara: «Ninguna variante se consume todavía» (`:96-103`).

**El fondo del layout en una subruta es papel.** [leído]
- Es `bg-fondo` = `--color-fondo: #F7F7F5` (`v3/layout.tsx:284`; `theme-develop.css:179`).
- Por debajo de 1024, el envoltorio es transparente y el papel es un piso fijo en −z-20 (`v3/layout.tsx:308`).
- **Pero detrás de una página transparente lo que se ve es la sala 3D**, porque el lienzo es opaco y cubre la pantalla en cualquier ancho (ver la respuesta 1).
- Las subrutas de laboratorio pintan su propio panel opaco (`v3/tipografia/muestra/page.tsx:28-33,74`).

### 6) Padrones que recorren las carpetas nuevas (O-2)

**Ningún padrón de «archivo no registrado» alcanza a las carpetas propuestas.**

Sí las alcanzan seis barridos de contenido. Esos se cumplen escribiendo bien, no por ubicación:
- `s8-montaje` §3 y §8;
- `s8-escena` §7;
- `s40`;
- `s53` §1;
- `s9-sentry`;
- `s4-paquete` (el paso 1b de `verificar`).

El detalle está en §5.

### 7) Subrutas que existen hoy bajo `src/app/v3/` (O-4)

Hay `/v3` (`page.tsx`) y seis laboratorios, todos `noindex`: [leído]

| Ruta | Metadata |
|---|---|
| `/v3/componentes` | `componentes/page.tsx:39-43` |
| `/v3/control-estatico` | `control-estatico/page.tsx:46-50` |
| `/v3/motion` | `motion/page.tsx:35-40` |
| `/v3/motion/control-estatico` | `motion/control-estatico/page.tsx:44-49` |
| `/v3/tipografia` | `tipografia/page.tsx:50-54` |
| `/v3/tipografia/muestra` | `tipografia/muestra/page.tsx:66-70` |

- No hay ningún segmento dinámico.
- El home prohíbe dos nombres: `secciones-a` y `secciones-b` (`s7-contrato.invariant.ts:59-61`; `s5-peso.invariant.ts:115-121`, barrido).
- Ninguno choca con nuestros slugs.

---

## 3. La escena en la subruta: decisión

**(c) P-H4, con (b) como medida interina obligatoria hasta que el home lo resuelva.** La (a) queda descartada porque la escena se monta (respuesta 1).

### Por qué (c), leyendo el código

1. **GPU gastada en nada.** En la subruta, el lazo queda en `'always'` para siempre, con física, a pantalla completa y en cualquier ancho. Detrás de una tapa opaca, todo ese trabajo de GPU no se ve, y la máquina tiene la fuga conocida del pool no paginado.
2. **Mide todo nuestro texto.** Cada 200 ms (50 ms con scroll), la escena mide todo el texto de la página (`textoEnPantalla.ts:9,40,50-66`). Las páginas de servicio son listas, tablas y FAQ.
3. **Escuchas globales desde 1024.** Quedan escuchas no pasivas de rueda, dedo y teclado (`FinalDelPie.tsx:176`), con una carrera que puede comerse el primer gesto hacia arriba al fondo (`recorridoDelFinal.ts:279,351,383`).
4. **No anticipo errores ni NaN:** todo está protegido (respuesta 1).

### El interino (b), sin tocar archivos de escena

- **La raíz de la página** lleva `data-seccion="invertida"` y `relative z-10 min-h-svh bg-fondo text-tinta`, el mismo recurso que `v3/tipografia/muestra/page.tsx:28-33,74`. El `z-10` pone el contenido por encima del lienzo, igual que el `<main>` del home (`v3/page.tsx:78`).
- **El primer hijo** es una capa `aria-hidden` con `fixed inset-0 -z-10 bg-fondo`.
  - Como está adentro del contexto de apilado de la raíz (z-10), queda arriba del lienzo, que en el layout está en z-0 o −z-10, y debajo del contenido.
  - Tapa también lo que la raíz no cubre: el rebote del scroll, o una ventana más alta que la página.
- **Nunca usar `data-panel`** ni los componentes que lo emiten: `Panel` (`v3/_componentes/Panel.tsx:100`) y `Seccion`, que envuelve a `Panel` (`v3/_secciones/_contrato/Seccion.tsx:4,219`). Con eso la escena se ataría a la página, usando las ventanas del home.
- **Nunca apagarla con banderas de `entorno.ts`**, ni con `?pruebas=`, ni con `?titulos=no`.
- **La tapa no baja el costo: solo lo oculta.** El costo lo baja P-H4, que ya está abierto en el LOG (D3, §12). El S1b lo mide (la receta está en §10) y suma los números al pedido.

---

## 4. Tokens y contraste

### 4.1 Noche

Con `data-seccion="invertida"` en la raíz, el tema se da vuelta solo (`theme-develop.css:1386-1465`). [leído]

| Uso | Clase | Valor en noche | Línea |
|---|---|---|---|
| Fondo | `bg-fondo` | `#0E0E0E` | `:1387` |
| Texto | `text-tinta` | `#F7F7F5` | `:1388` |
| Texto secundario | `text-tinta-media` | `#9E9E9E` | `:1421` |
| Texto terciario | `text-tinta-tenue` | `#959595` | `:1422` |
| Separador decorativo | `border-borde` | el papel al 10 % | `:1424` |
| Límite de componente | `border-borde-fuerte` | el papel al 47 % | `:1425` |
| Foco | regla global en `[data-v3]`; sigue a la tinta | `--color-foco` | `:305,1500-1504` |

### 4.2 Acento

- **Una sola voz por página, a través del alias.**
  - En la raíz se fija la custom property `--color-acento` con el claro del servicio, por `style`. Es la misma forma que usa el home en `v3/_secciones/servicios/CtaDelServicio.tsx:21`.
  - Todo lo demás consume las utilidades del alias: `text-acento`, `bg-acento` y `border-acento` (`acento.ts:18-22,67-74`).
- **El hex vive en un solo lugar:** el campo `acento.claro` de cada archivo de datos, con el comentario P-H2. Cuando el home emita los claros, esa línea cambia por el token.
- **Texto sobre relleno de acento:** `text-fondo`, que en noche es `#0E0E0E` (`acento.ts:89`).
- **El modal queda afuera de la raíz invertida**, como hermano, para conservar sus tokens de papel y su acento por defecto. Es la misma estructura que el home (`v3/page.tsx:69-82`).
- **Choca una regla escrita del home:** «`text-acento` prohibido en la sección invertida» (`acento.ts:70-71,80-82`).
  - Se escribió para los acentos oscuros, que sobre `#0E0E0E` dan 2,71 · 2,99 · 2,46 (`theme-develop.css:319`). Con los claros, el texto pasa de sobra (ver 4.4).
  - Ningún instrumento la recorre en nuestras carpetas, pero se le avisa al home en P-H2.
- **No se usan los tokens `ds` de `globals.css`:** son de otro sistema, y el CONTRATO §3 fija `theme-develop.css` como fuente. Ver D7.

### 4.3 Tipografía

| Familia | Clase | Variable | Línea |
|---|---|---|---|
| Chivo (títulos) | `font-titulo` | `--font-v3-chivo` | `theme-develop.css:419,1571`; `v3/layout.tsx:239-247` |
| Chivo (cuerpo) | `font-cuerpo` | `--font-v3-chivo` | `theme-develop.css:420,1572` |
| Chivo Mono | `font-codigo` | `--font-v3-chivo-mono` | `theme-develop.css:421,1573`; `v3/layout.tsx:249-255` |
| Archivo (display, solo mayúsculas) | `font-display` | `--font-v3-archivo` | `theme-develop.css:443,1574`; `v3/layout.tsx:271-277` |

- **Pesos:** de `font-liviano` (300) a `font-fuerte` (700) (`theme-develop.css:460-464`).
- **Itálica:** la de Chivo trae solo mayúsculas. Una itálica con minúsculas cae a la fuente de respaldo (`v3/layout.tsx:234-237`).
- **Componentes que se importan:**
  - `Titular`, con niveles de `titulo-s` a `display-xl` y `como` obligatorio (`v3/_componentes/tipografia/Titular.tsx:102-109`);
  - `Cuerpo`, `Caption`, `Micro`, `TextoBase` y `EtiquetaDeSeccion` (`Textos.tsx:55,64,87,110,131`).

### 4.4 Contraste (WCAG 2.x)

Lo calculé con la luminancia relativa de WCAG 2.x. La misma fórmula reproduce las 8 cifras que declara el tema: 18,00 · 7,2054 · 6,4448 · 2,71 · 2,46 · 2,99 · 6,65 · 17,60.

| Texto | Fondo | Razón | ¿≥ 4,5:1? |
|---|---|---|---|
| `#F7F7F5` (tinta) | `#0E0E0E` | 17,997:1 | sí |
| `#9E9E9E` (tinta-media) | `#0E0E0E` | 7,205:1 | sí |
| `#959595` (tinta-tenue) | `#0E0E0E` | 6,445:1 | sí |
| `#8FC0E8` (claro web) | `#0E0E0E` | 9,995:1 | sí |
| `#AFA0E8` (claro software) | `#0E0E0E` | 8,288:1 | sí |
| `#7FCBA4` (claro IA) | `#0E0E0E` | 10,094:1 | sí |
| `#0E0E0E` sobre relleno web | `#8FC0E8` | 9,995:1 | sí |
| `#0E0E0E` sobre relleno software | `#AFA0E8` | 8,288:1 | sí |
| `#0E0E0E` sobre relleno IA | `#7FCBA4` | 10,094:1 | sí |
| Borde fuerte en noche (compuesto, `#7C7C7B`) | `#0E0E0E` | 4,620:1 | no es texto: ≥ 3:1 de componente |

- **No se proponen** los acentos oscuros como texto sobre noche (2,71 · 2,46 · 2,99).
- La medición en el navegador, con el color computado, se hace en el S3.

---

## 5. Padrones (O-2)

### 5.1 Los que alcanzan a las carpetas nuevas: se cumplen por contenido

| Invariante | Qué recorre | Qué exige | Cómo se cumple |
|---|---|---|---|
| `s8-montaje` §3 | Todo `src`, recursivo y sin exclusiones (`s8-padron.ts:239-246`) [leído] | Que nadie importe `marcaEscena`, salvo los de la lista (`s8-montaje.invariant.ts:98-109`) [leído] | No importar nada de `_lib/escena`. |
| `s8-montaje` §8 | Todo `src/app/v3/` (`:285`) [leído] | Que no haya `split('\n').length` en código (`:278-290`), y que `lineasDeCodigo` y `quitarComentarios` dejen el mismo código en pie (`:313-326`) [leído] | Contar líneas con `contarLineas`. No cerrar un bloque `/* */` y seguir en la misma línea con `//` o `*` (barrido). |
| `s8-escena` §7 | Todo `src`, sin `__tests__` | Que solo `EscenaDelHome.tsx` importe `marcaEscena` (`s8-escena.invariant.ts:241-246`, barrido) | Igual que §3. |
| `s40-3d-sonido` | `git ls-files -co` de `src/app/v3`, sin `__tests__` (`:121`) [leído] | Que nadie importe de forma estática `howler` ni `…sonido/motor` (`:122-124`) | No importar el motor de sonido. |
| `s53-pulido-2` §1 | Todo `src/app/v3` (`.ts`, `.tsx`, `.css`), sin `__tests__`, `_invariantes` ni `*.invariant.*` (`:50-54`) [leído] | Que el texto crudo, comentarios incluidos, no contenga tres cadenas del encastre viejo (`:55`) | No nombrarlas. |
| `s9-sentry` | Todo `src` | Que los archivos `'use client'` que importan `@sentry/nextjs` sean exactamente los declarados (`s9-sentry.invariant.ts:96-97`) [leído] | No importar Sentry en cliente. |
| `s4-paquete` y paso 1b | Todo el repo, docs incluidos | Que ninguna línea empiece con 7 `<`, `=` o `>` (`s4-paquete.ts:36`) [leído] | Cuidarlo también en los `.md`. |
| tsc (paso 2) | `**/*.ts(x)` | Que no haya errores | Tipos estrictos, cero `any`. |
| `aprobada-sin-link` (corre en `check:invariants`, no en `verificar`) | Todo `src` | Que seis cadenas de leados no aparezcan fuera de su censo (`src/lib/leados/aprobada-sin-link.invariant.ts:375-411`, barrido) | No usarlas. |
| Los de build (`s1-bundle`, `s3-peso`, `s5-peso`, `s8-peso`, `s4-heredado`, `s7-compuerta`) | `.next/` | Miden rutas fijas (`/` y `/v3`); `rutasPrerenderizadas` no entra a `server/app/v3/` (barrido) | Pueden verse afectados de forma indirecta, por chunks compartidos o por el CSS de Tailwind: [NO DETERMINABLE LEYENDO]. Solo se ve con un build (S4). |

### 5.2 Los acotados: no alcanzan, y la salida es no escribir ahí

| Padrón | Alcance | Evidencia |
|---|---|---|
| `s3-*` (tokens, codigo, foco, cursor, navegacion, imagen, tipografia) | `_estilos`, `_componentes/{chrome,layout,medios,tipografia}`, `componentes/` y `tipografia/`. Un archivo nuevo ahí sin registrar falla. | `s3-archivos.ts:124-132,149-160,168-171` (barrido) |
| `s3-tokens` y los hex (P-H2) | El chequeo de cero hex solo mira `ARCHIVOS_DEL_SPRINT`; las clases arbitrarias, solo con `var()`. | `s3-archivos.ts:63-67,279-283` (barrido) |
| `s5-*` | `_secciones/{hero,quienes-somos,numeros,trabajos}` | `s5-archivos.ts:51-80,355-368` (barrido) |
| `s6-*` | `_secciones/{servicios,tu-panel,por-que-develop,cierre}` más `_invariantes`. `s6-lane` busca acentos concretos solo en su `CODIGO`. | `_invariantes/soporte.ts:76-95` (barrido); `s6-lane.invariant.ts:212` [leído] |
| `s7-contrato` | `_secciones`: exige exactamente 8 carpetas sin `_`. | `s7-contrato.invariant.ts:42,65-73` (barrido) |
| `s2-tokens`, `s16`, `s28`–`s36`, `s45`, `s47`, `s51` y `s54` | `_lib/motion`, `v3/motion`, `_intro`, `_lib/escena`, `_panel-vivo`, `_estilos/*.css` y `_lib/escena/final` | (barrido) |
| `s10-acceso` y `s10-banco` | No recorren `src`: el banco lee solo `v3/layout.tsx`. | `s10-banco.ts:109,137` (barrido) |
| `s3-frontera` y `s11-frontera` | Usan `git status --porcelain`, pero la ventana solo se abre con testigos de S3 o S11. Además, quedan fuera de `verificar`. | `s3-git.ts:48-93`; `s11-frontera.invariant.ts:69-87` (barrido) |
| `s4-cobertura` | Solo las carpetas que ya tienen un invariante cableado. | `s4-suites.ts:197-201`; `s4-cobertura.invariant.ts:68` (barrido) |

### 5.3 Conclusión

- **s3-tokens y los hex literales (P-H2).** El chequeo de hex de `s3-tokens` solo mira `ARCHIVOS_DEL_SPRINT`. Un `.ts` de datos en `v3/_servicios/` queda fuera **por ubicación**, así que para eso no hace falta pedido.
- **Lo que sí rompe tests es agregar los claros al tema sin tocar el padrón.** `s1-tokens`, `s1-bundle` y `s2-tokens` cuentan los tokens contra los de S0 más `AGREGADOS` (`v3/_lib/__tests__/padron-de-tokens.ts:140,288`) [leído]. Ese ajuste es parte de P-H2, del lado del home.
- **Ningún test del home se edita desde servicios.** Los barridos de 5.1 se corren en cada sprint, para comprobar que siguen verdes. Son livianos, ~3 s cada uno.

---

## 6. Ruta (O-4)

| Criterio | (A) `v3/[servicio]/page.tsx` | (B) Tres carpetas estáticas finas |
|---|---|---|
| Rutas tapadas | Ninguna. Un segmento estático le gana a uno dinámico del mismo nivel, así que `componentes`, `control-estatico`, `motion` y `tipografia` siguen resolviendo; las `_x` no son rutas. | Ninguna. |
| Rutas que se cuelan | Ninguna, con `dynamicParams = false`: solo los slugs de `generateStaticParams`, que salen de `PUBLICADOS` (§12.3). `/v3/paginas-web/x` da 404 porque no hay hijos. | Ninguna. |
| 404 de un slug desconocido | Explícito, por `dynamicParams = false`. | Natural: no hay carpeta. |
| Página 404 | La misma en las dos: `src/app/not-found.tsx`, que es `'use client'`, con la estética del sitio vivo y `<Link>` a `/` y `/contact` (`:166-183`, barrido). Si se pinta adentro del layout de /v3: [NO DETERMINABLE LEYENDO], se mide en S3. | Igual. |
| Padrones | Ninguno lista los `page.tsx` de /v3 ni recorre rutas. Los corchetes no afectan a `recorrer`. | Igual. |
| Metadata por página | `generateMetadata({ params })` sobre los datos. Sería el primer uso en el repo. | `export const metadata` estático en cada archivo: la convención de /v3 tal cual. |
| Tipos de `params` | `Promise<{ servicio: string }>` con `await`, angostado con `esServicioSlug` y `notFound()`. Es el patrón de `src/app/embed/[slug]/page.tsx:20-27,37` (barrido). | No hay params. |
| Precedente | Cero usos de `generateStaticParams` y de `dynamicParams` en `src/`. | Siete páginas estáticas en /v3. |
| B12 (escena por ruta) | Un solo archivo de ruta conoce el slug, y el template lo expone (con un atributo en la raíz o como lo defina B12). | El slug entra por 3 archivos, pero termina en el mismo template. |
| D8 (pasar a la raíz) | Un `[servicio]` en la raíz atrapa todo segmento desconocido de primer nivel (con el mismo 404 que hoy). | Quedan 3 carpetas explícitas en la raíz. |

**Recomendación (propuesta mía): (A),** como pide SPEC §4.
- **Por qué:** es una sola ruta y un solo `generateMetadata`, con el 404 como contrato explícito.
- **Cómo se verifica**, ya que no hay precedente en el repo:
  - en el S1b, con el dev: los slugs publicados, uno con datos pero sin publicar, un slug falso y `/v3/componentes`;
  - en el S4, con el build: tres HTML prerenderizados en `server/app/v3/`.
- **Salida si falla:** si `generateStaticParams` no anda en el dev de Next 16 con webpack y no converge en 60 min, se pasa a (B). Eso solo cambia los archivos de ruta; el template y los datos no se tocan.

---

## 7. Árbol de archivos propuesto

Todo lo nuevo vive en dos lugares: la ruta y una carpeta privada nueva, `v3/_servicios/`. Esa carpeta no existe y nadie la nombra: 0 referencias en `src/`.

```
src/app/v3/[servicio]/page.tsx                         ruta (S1b): generateStaticParams desde PUBLICADOS, dynamicParams = false
                                                       y generateMetadata (noindex y canonical propio, D12);
                                                       monta <PaginaDeServicio> y, como hermano, <Contacto />
src/app/v3/_servicios/tipos.ts                         SLUGS_DE_SERVICIO, ServicioSlug, esServicioSlug y todos los tipos (§8)
src/app/v3/_servicios/precios.ts                       PRECIOS_DESDE y precioDesde(slug): sin componentes, para B4
src/app/v3/_servicios/formato.ts                       usd(n) con Intl es-AR y el marcador «[a definir]» (§8.4)
src/app/v3/_servicios/rutas.ts                         RAIZ_DE_LAS_PAGINAS = '/v3' y hrefDe(slug) (S1a): para D8 cambia una línea;
                                                       PUBLICADOS (S1b), aparte de SERVICIOS: ['paginas-web'] y desde el S2 los tres
src/app/v3/_servicios/seo.ts                           metadataDe(servicio), jsonLdDe(servicio) y serializarJsonLd (S3)
src/app/v3/_servicios/datos/paginas-web.ts             datos (S1a)
src/app/v3/_servicios/datos/software-a-medida.ts       datos (S1a)
src/app/v3/_servicios/datos/ia-y-automatizaciones.ts   datos (S1a)
src/app/v3/_servicios/datos/servicios.ts               SERVICIOS (los tres, en el orden del SPEC) y servicioDe(slug)
src/app/v3/_servicios/datos/fuenteDeProyectos.ts       la única línea que sabe de dónde salen los proyectos (O-6, §8.3)
src/app/v3/_servicios/PaginaDeServicio.tsx             el template (server): raíz invertida, tapa P-H4, <main> y los bloques en el orden del SPEC
src/app/v3/_servicios/bloques/Problema.tsx             el h1
src/app/v3/_servicios/bloques/QueHacemos.tsx
src/app/v3/_servicios/bloques/QueIncluye.tsx           incluye y va aparte
src/app/v3/_servicios/bloques/Precio.tsx               elige el slot según precio.tipo
src/app/v3/_servicios/bloques/precio/Calibres.tsx
src/app/v3/_servicios/bloques/precio/Proyecto.tsx
src/app/v3/_servicios/bloques/precio/Planes.tsx        tabla con scroll horizontal dentro de su caja
src/app/v3/_servicios/bloques/Extra.tsx                slot opcional (el mantenimiento, en web)
src/app/v3/_servicios/bloques/Proceso.tsx
src/app/v3/_servicios/bloques/Prueba.tsx               casos (proyecto o propio) o el CTA del panel
src/app/v3/_servicios/bloques/Faq.tsx                  <details>/<summary>: server, sin JS
src/app/v3/_servicios/bloques/Llamado.tsx              el CTA: envoltorio con data-abre-contacto, data-servicio y data-precarga (D5),
                                                       con <Cta> adentro
src/app/v3/_servicios/bloques/DelBlog.tsx              no se monta si no hay artículos con href
src/app/v3/_servicios/bloques/Cierre.tsx               provisorio hasta B13: CTA simple más links
src/app/v3/_servicios/__tests__/datos.invariant.ts     (S1a)
src/app/v3/_servicios/__tests__/precios.invariant.ts   (S1a)
src/app/v3/_servicios/__tests__/pagina.invariant.tsx   (S1b)
src/app/v3/_servicios/__tests__/seo.invariant.ts       (S3)
```

### Por qué cada ubicación

- **`v3/[servicio]/`** es la única carpeta de ruta nueva. Ningún padrón lista rutas (§5).
- **`v3/_servicios/`**:
  - es privada y queda fuera de todos los padrones de «no registrado»: `s3`, `s5`, `s6` y `s7` miran otras carpetas;
  - no lleva `.css`, porque las hojas entran solo por el layout;
  - respeta los límites: no está en `_lib`, `_secciones`, `_chrome` ni `_componentes`.
  - La subcarpeta se llama `bloques/`, no `secciones/`, para no confundirse con `_secciones` ni con `Seccion`.
- **`_servicios/__tests__/`** es una carpeta nueva y sin cableados: `s4-cobertura` no la marca y `s8-montaje` §6 no la mira. Se corre a mano hasta que esté P-H7.
- **`precios.ts`** importa solo `tipos.ts` y `datos/*.ts`, que son textos y números: ni `.tsx`, ni `react`, ni `next`.
  - B4 lo importa desde `_secciones/servicios/` como `../../_servicios/precios` sin arrastrar el template. Un test vigila ese grafo de imports.
  - Costo: B4 se lleva los textos de los datos (unos pocos KB). Si B4 quiere cero copy, más adelante `precios.ts` puede pasar a ser la fuente de los números sin cambiar lo que exporta.
- **Lo que se importa del home** (se importa, no se edita):
  - `Contacto` (`_chrome/contacto/Contacto.tsx`);
  - `Cta` (`_componentes/chrome/Cta.tsx`);
  - `Titular` y `Textos` (`_componentes/tipografia/`);
  - `Envoltorio` (`_componentes/layout/Envoltorio.tsx:55-73`);
  - `Imagen` (`_componentes/medios/Imagen.tsx:41-54`, con `sizes` obligatorio);
  - el tipo `IdDeServicio` (`_secciones/_contrato/acento.ts:48`);
  - `PROYECTOS`, a través de `fuenteDeProyectos.ts`;
  - `LOGOTIPO`, la marca como texto (`_componentes/marca/sistema.ts:61`), para que «develOP» no se escriba suelto (D10, §12.2).
- **Lo que no se crea:** nada en `public/` (los pósters se referencian desde `/portfolio/<slug>/`), nada en `_estilos/`, ningún CSS nuevo.
- **Atributos e ids:**
  - los bloques se marcan con `data-bloque="<nombre>"`, que tiene 0 usos en `src`, para los tests;
  - nunca `data-panel`, ni `data-seccion-id` (el registro del home, `forma.ts:146`), ni `data-signo-de-la-tuya`, ni los ids reservados de la respuesta 4 (con los cuatro del Portfolio);
  - `data-seccion="invertida"` solo en la raíz.

---

## 8. Modelo de datos final

### 8.1 Tipos

```ts
// src/app/v3/_servicios/tipos.ts
import type { IdDeServicio } from '../_secciones/_contrato/acento'
import type { FUENTE_DE_PROYECTOS } from './datos/fuenteDeProyectos'

/** Los tres servicios, en el orden del SPEC. El tipo se deriva de la lista: una sola fuente. */
export const SLUGS_DE_SERVICIO = ['paginas-web', 'software-a-medida', 'ia-y-automatizaciones'] as const
export type ServicioSlug = (typeof SLUGS_DE_SERVICIO)[number]

export function esServicioSlug(valor: string): valor is ServicioSlug {
  return SLUGS_DE_SERVICIO.some((slug) => slug === valor)
}

/** El slug de un proyecto del portfolio. Se deriva de la fuente (O-6): servicios no lo escribe. */
export type ProyectoSlug = (typeof FUENTE_DE_PROYECTOS)[number]['slug']

/** USD. `null` = el dato todavía no existe ([a definir]): la UI nunca inventa un número. */
export type Usd = number | null

export interface Calibre {
  readonly nombre: string
  readonly desde: number
  readonly descripcion: string
  /** Lo propio del calibre. Vacío = no se muestra (el SPEC no lo da). */
  readonly incluye: readonly string[]
  /** Si trae panel para editar. `null` = [a definir] (SPEC §11: la Simple). */
  readonly autogestionable: boolean | null
}

export interface Plan {
  readonly nombre: string
  readonly mensual: number
  readonly conversaciones: number
  readonly soporte: string
  readonly cambiosWeb: string
  /** `null` = [a definir] (SPEC §7.3). */
  readonly funcionalidades: readonly string[] | null
}

export type Precio =
  | { readonly tipo: 'calibres'; readonly calibres: readonly Calibre[] }
  | { readonly tipo: 'proyecto'; readonly desde: number; readonly nota: string }
  | {
      readonly tipo: 'planes'
      readonly planes: readonly Plan[]
      readonly implementacionDesde: Usd
      readonly nota: string
    }

export interface ItemDeExtra {
  readonly nombre: string
  readonly detalle: string
  /** El precio tal como lo publica el SPEC («desde USD 50», «siempre incluidos»). `null` = [a definir]. */
  readonly precio: string | null
}

export interface Extra {
  readonly titulo: string
  readonly items: readonly ItemDeExtra[]
  readonly nota: string | null
}

/** Caso del portfolio (fuente única: PROYECTOS) o caso propio de servicios. */
export type Caso =
  | { readonly tipo: 'proyecto'; readonly slug: ProyectoSlug; readonly texto: string }
  | {
      readonly tipo: 'propio'
      readonly nombre: string
      readonly rubro: string | null
      readonly texto: string | null
      /** Captura con datos ficticios. `null` mientras no exista (SPEC §11). */
      readonly imagen: string | null
    }

export interface CtaDelPanel {
  readonly rotulo: string
  /** `null` = [a definir] (B7/C1). Con D11, en IA es '/login'. */
  readonly href: string | null
}

export interface Prueba {
  readonly casos: readonly Caso[]
  /** Una línea propia; por ejemplo, «2 sistemas más en desarrollo» (SPEC §7.2). */
  readonly nota: string | null
  readonly ctaPanel: CtaDelPanel | null
}

export interface PreguntaFrecuente {
  readonly pregunta: string
  /**
   * `null` = alguna parte no sale de una línea del SPEC: no se muestra en producción ni entra al JSON-LD.
   * Escrita = cada afirmación sale del SPEC, con `// SPEC §7.x` al lado. Regla y clasificación: D9 en §12.2.
   */
  readonly respuesta: string | null
}

export interface Articulo {
  readonly titulo: string
  /** `null` mientras no exista el blog. */
  readonly href: string | null
}

export interface Servicio {
  readonly slug: ServicioSlug
  /** El id del mismo servicio en el home: el contexto del acento sobre papel y la precarga del contacto. */
  readonly idEnElHome: IdDeServicio
  readonly nombre: string
  readonly acento: {
    /** Sobre noche. P-H2: literal hasta que theme-develop.css emita los claros; se reemplaza en esta línea. */
    readonly claro: string
  }
  /** Copy provisorio (// C2). El title se arma con LOGOTIPO: «develOP» no va suelto (D10). */
  readonly seo: { readonly title: string; readonly description: string }
  readonly problema: { readonly titulo: string; readonly texto: string }
  readonly queHacemos: { readonly titulo: string; readonly texto: string }
  readonly incluye: readonly string[]
  /** Vacío = no se muestra. */
  readonly aparte: readonly string[]
  readonly precio: Precio
  readonly extra: Extra | null
  readonly proceso: { readonly pasos: readonly string[]; readonly plazo: string }
  readonly prueba: Prueba
  readonly faq: readonly PreguntaFrecuente[]
  /** El SPEC no da el rótulo del botón: ver D10. */
  readonly cta: { readonly titulo: string; readonly texto: string; readonly boton: string }
  readonly articulos: readonly Articulo[]
}
```

- Cada archivo de datos exporta una constante tipada `Servicio`, por ejemplo `PAGINAS_WEB: Servicio`. Cero `any`.
- Los dos imports son de tipo: no hay ciclos en runtime.

### 8.2 Ajustes respecto de SPEC §6 (propuestas mías)

| SPEC §6 | Modelo final | Por qué |
|---|---|---|
| `acento: { claro; oscuro }` | `acento: { claro }` más `idEnElHome` | El oscuro ya es un token (`theme-develop.css:326-328`) y se resuelve por contexto. Escribir su valor sería una segunda fuente y rompería la regla del alias (`acento.ts:18-22`). `idEnElHome` sirve además para `data-precarga`. |
| Calibre: `incluye: string[]` | Igual, más `autogestionable: boolean \| null` | «Si la Simple tiene panel: [a definir]» (SPEC §7.1 y §11) es un dato del calibre. |
| `Plan` | Más `funcionalidades: string[] \| null` | «Qué funcionalidades trae cada plan: [a definir]» (SPEC §7.3). |
| `extra.items[].precio: string` | `string \| null` | «Plan mensual solo web: USD [a definir]». |
| Caso propio: `rubro`, `texto`, `imagen?` | `rubro`, `texto` e `imagen`, los tres `\| null` | El SPEC no da el rubro de las boletas ni textos para los casos de software, y las capturas están pendientes. |
| `prueba: { casos; ctaPanel?: boolean }` | `{ casos; nota; ctaPanel: { rotulo; href } \| null }` | «2 sistemas más en desarrollo», y el href del panel está [a definir]. |
| `faq: { pregunta; respuesta }` | `respuesta: string \| null` | Varias preguntas del SPEC no traen respuesta. |
| `cta: { titulo; texto }` | Más `boton` | El botón necesita un nombre accesible y el SPEC no lo da (D10). |
| `aparte?`, `extra?`, `articulos?` | Sin `?`: `[]` o `null` | Un solo modo de decir «no hay». |

### 8.3 `ProyectoSlug` y los casos provisorios (O-6)

**`ProyectoSlug` es un tipo derivado:** `(typeof FUENTE_DE_PROYECTOS)[number]['slug']`.
- Con `PROYECTOS` da `SlugDelProyecto` (`proyectos.ts:25`) sin nombrar ese tipo, que el contrato no expone.
- No hace falta pedido ni tocar `proyectos.ts`.

**La única dependencia con el home es una línea:**

```ts
// src/app/v3/_servicios/datos/fuenteDeProyectos.ts — con base db37bfb9 o posterior (PROYECTOS ya está):
export { PROYECTOS as FUENTE_DE_PROYECTOS } from '../../_secciones/trabajos/proyectos'
```

**Con la base de la rama (`54655181`) no hay casos provisorios: `PROYECTOS` ya llegó.**

El bloque que sigue no aplica. Queda como referencia de O-6: si la rama hubiera salido de antes de B1.1a, ese mismo archivo sería el único lugar con provisorios.

```ts
// O-6: reemplazar por PROYECTOS — cuando llegue el home, este archivo queda en la línea de arriba.
export const FUENTE_DE_PROYECTOS = [
  { slug: 'el-garage', nombre: 'El Garage', rubro: null, url: null, medios: null, alt: null },
  { slug: 'esquina-estudio', nombre: 'Esquina Estudio', rubro: null, url: null, medios: null, alt: null },
  { slug: 'banu-scents', nombre: 'Banú Scents', rubro: null, url: null, medios: null, alt: null },
] as const
```

- **Qué llevaría:** solo lo que nombra el SPEC (slug y nombre). Ni rubros ni URLs copiados del home, y sin pósters, porque `public/portfolio/` no existiría.
- **Por qué alcanza con cambiar una línea:** el template lee una forma angosta que aceptan las dos fuentes: `{ slug, nombre, rubro: string | null, url: string | null, medios: { poster: { escritorio, movil } } | null, alt: string | null }`. Las entradas de `PROYECTOS` encajan sin conversión.
- **Qué toma servicios de cada proyecto:** `nombre`, `rubro`, `url`, `medios.poster.{escritorio,movil}` y `alt`. Solo suma su propio `texto` (SPEC §7.1).
- **Qué no toma nunca:** `resena`, `problemaResuelto`, `problemaCliente`, `queHicimos` ni `resultado`.
  - Desde B1.1b, las reseñas y dos `problemaResuelto` salen de la llave del contenido inventado (§0.4). Con la llave apagada son marcadores; prendida, texto de relleno.
  - Lo vigila un test del S1b (§10).
- **Medidas de los pósters:** no están en `PROYECTOS` (P-H9). Hasta que estén, la relación de aspecto se declara una sola vez en el template, con el comentario `// P-H9`.

### 8.4 «[a definir]» solo en desarrollo

- `formato.ts` exporta `MARCADOR_A_DEFINIR = '[a definir]'` y funciones puras con el modo inyectado, para que se puedan testear: `textoOMarcador(valor, enDesarrollo)` y `usdOMarcador(n, enDesarrollo)`.
- El template calcula el modo una sola vez: `process.env.NODE_ENV !== 'production'`.
- **En desarrollo:** el marcador se ve donde falta el dato.
- **En producción:** el ítem que depende del dato no se monta (una fila sin precio, una pregunta sin respuesta, un caso sin texto). Nunca aparece un número.
- No se usa la llave del contenido inventado (`_contrato/llave.ts`): «[a definir]» no es relleno, es un dato que falta.

### 8.5 Acento, CTA y precios

**`acento.claro`** va en cada archivo de datos, con el comentario en la misma línea:
- `paginas-web.ts`: `claro: '#8FC0E8', // P-H2: reemplazar por el token claro del tema cuando exista`;
- `software-a-medida.ts`: `'#AFA0E8'`;
- `ia-y-automatizaciones.ts`: `'#7FCBA4'`.

**El CTA (`bloques/Llamado.tsx`)** sigue el patrón del home (`CtaDelServicio.tsx:16-24`), porque `Cta` y `CtaEnlace` no dejan pasar atributos (`v3/_componentes/chrome/Cta.tsx:160-184`) [leído]:
- un envoltorio con tres atributos (D5, aprobado: §12.2):
  - `data-abre-contacto="panel"`;
  - `data-servicio="<slug>"`, por contrato;
  - `data-precarga={idEnElHome}`;
- adentro, `<Cta rotulo={cta.boton} />`.

**`PRECIOS_DESDE`:**

```ts
// src/app/v3/_servicios/precios.ts — sin componentes: lo importa la sección Servicios del home (B4).
export interface PrecioDesde { readonly usd: number; readonly periodo: 'unico' | 'mensual' }
export const PRECIOS_DESDE: Readonly<Record<ServicioSlug, PrecioDesde>> // derivado de SERVICIOS, nunca escrito a mano
export function precioDesde(slug: ServicioSlug): PrecioDesde
```

- **Cómo se deriva:**
  - `calibres` → el menor `desde` (200);
  - `proyecto` → `desde` (1.000);
  - `planes` → el menor `mensual`, con periodo mensual (49).
- La implementación de IA queda en sus datos, en `null` hasta que se defina.
- Los datos de los tres servicios están desde el S1a (§12.3). Por eso, desde ese sprint:
  - `PRECIOS_DESDE` está completo;
  - `precioDesde` devuelve siempre un `PrecioDesde`, nunca `null`.
  - Un test lo vigila.

### 8.6 Del SPEC §7 a los datos: lo que queda en `null` o vacío

| Servicio | `null` o vacío (porque está [a definir] o el SPEC no lo da) |
|---|---|
| Páginas web | `calibres[Simple].autogestionable`; el ítem de `extra` «Plan mensual solo web»; `articulos[].href`; `calibres[].incluye = []`. En el FAQ, ninguna respuesta queda en `null` (§12.2). |
| Software a medida | De los casos propios: `rubro` (boletas), `texto` e `imagen`. En el FAQ: «¿Qué pasa si después necesito cambios?» y «¿El sistema es mío?» (§12.2). `articulos[].href`. |
| IA y automatizaciones | `planes[].funcionalidades`; `implementacionDesde`; `prueba.casos = []`; en el FAQ, «¿El bot reemplaza a mi equipo?» (§12.2); `articulos[].href`. `prueba.ctaPanel.href` ya no queda en `null`: es `'/login'` (D11). |

---

## 9. Pedidos al home

### 9.1 Los que define el CONTRATO

| Id | ¿Aplica? | Evidencia | Qué se pide (además de lo que dice el CONTRATO) |
|---|---|---|---|
| **P-H1** (abierto) | Sigue abierto, pero **ya hay un mecanismo** | `data-precarga` → `PRECARGA_POR_SERVICIO` (`contacto/contenido.ts:67-71`; `apertura.ts:122-125`). No hay campo «servicio»: está `intereses` (`contenido.ts:22-30`), que ya viaja a la API (`api/contacto/route.ts:32`). | Elegir entre: (a) el home lee `data-servicio` con los slugs y los traduce a intereses, o (b) servicios usa `data-precarga` con `idEnElHome` y P-H1 se cierra sin código del home. Ver P-H5 y D5. **V2:** servicios usa `data-precarga` desde el S1b (D5). El LOG le propone al home cerrar P-H1 con eso. |
| **P-H2** | **Sí** | No hay claros en el tema (`theme-develop.css:1444,1460-1462`). Los mismos valores ya son tokens `ds` en `globals.css:109,115,121`. | Emitir los tres claros en `theme-develop.css` (transcritos o apuntando a los `ds`) y sumarlos a `AGREGADOS` (`padron-de-tokens.ts:140,288`), para que no caigan s1-tokens, s1-bundle ni s2-tokens. Ajustar para el acento claro la regla «`text-acento` prohibido en la invertida» (`acento.ts:70-71,80-82`). Ideal: un contexto de noche por servicio (invertida más servicio), para que servicios no tenga que fijar el alias por `style`. |
| **P-H3** | **Sí** | Fragmentos relativos (`_chrome/enlaces.ts:14-21`); el viaje sale antes del `preventDefault` (`useDeslizamientoDelCta.ts:270,282`); el salto apunta a `#hero` (`SaltarAlContenido.tsx:84`); el tono del menú depende de `[data-panel]` (`useTonoDebajo.ts:19,22`). | En las subrutas: enlaces a `/v3#ancla` con `<a href>` y recarga, sin viajes; el salto al contenido apuntando al `<main>` de la página; y el tono correcto sobre una página oscura. Mientras tanto, servicios no monta la barra (D4). |
| **P-H4** | **Sí, anticipado leyendo** | Se monta en cualquier ancho (`EscenarioCompuerta.tsx:85-98`); el lazo queda en `'always'` sin `[data-panel]` (`visibilidad.ts:106,290-292`; `ataduraAlScroll.ts:128-129`); mide el texto cada 200/50 ms (`textoEnPantalla.ts:9,40,50-66`); deja escuchas no pasivas desde 1024 (`FinalDelPie.tsx:176`) y puede retener gestos (`recorridoDelFinal.ts:279,351,383`). | Pausar la escena o no montarla fuera del home hasta B12. **V2:** ya está abierto en el LOG (D3). El S1b suma FPS, memoria, tareas largas y la prueba del gesto. |

### 9.2 Pedidos nuevos

| Id | Qué | Por qué | Evidencia |
|---|---|---|---|
| **P-H5** | Definir el vocabulario de `data-servicio` antes de implementar P-H1. | El mismo atributo ya es el contexto del acento del tema, con otros valores (`web`, `ia-automatizacion`, `software`), y el home lo pone en ancestros de sus CTA. Si P-H1 lee `closest('[data-servicio]')`, un CTA del home sin atributo propio resuelve `web`, que es de otro vocabulario. Y el instrumento de contraste resuelve el acento desde el `[data-servicio]` más cercano. Opciones: que P-H1 lea solo el atributo del elemento que abre; que use `data-precarga`; o renombrar. **V2:** el LOG propone dejar `data-servicio` solo para el tema. Si el home lo confirma, servicios saca el suyo en un sprint posterior (D5). | `theme-develop.css:1350-1360`; `acento.ts:47-51`; `servicios/Servicios.tsx:120`; `TiraDeServicios.tsx:193`; `_lib/__tests__/s10-acceso-color.ts:192-196` |
| **P-H6** (condicional) | Que el contacto decida su modo sin depender de la barra, o que acepte el modo por prop. | Con `Contacto` solo, el modo queda en `'barra'` y en el teléfono abre la placa de escritorio, no la hoja compacta. Se abre si el S1b o el S3 miden que en 390×844 no entra o no se usa bien. | `apertura.ts:26,69`; `BarraDelHome.tsx:78-96` (barrido); `FormularioDeContacto.tsx:195,202` |
| **P-H7** | Scripts en `package.json` para los tests de servicios, cuando servicios se traiga al home. | `verificar` solo corre las suites declaradas en `package.json`. Una carpeta nueva queda invisible, y servicios no puede tocar `package.json`. La forma sería `test:sNN-servicios-<x>` con `npx tsx <archivo>`, más su agregado `test:sNN`. El número lo elige el home: s76 ya es Portfolio. | `s4-suites.ts:43-45,93`; `s4-cobertura.invariant.ts:145-155` (barrido) |
| **P-H8** (aviso para B4) | Decidir cómo admite el home precios cerrados en la sección Servicios. | El contrato de las secciones dice que los precios no están cerrados, y el escáner los rechaza sin lista blanca posible. B4 va a importar `PRECIOS_DESDE`, y ese escáner corre sobre el texto de la sección. Servicios no toca esos tests. | `_contrato/escaneo.ts:22,140-141`; `_contrato/inventado.ts:40-43`; `servicios/contenido.ts:21-22`; el escáner corre en `s6-servicios.invariant.tsx:179` y en `s6-render.invariant.tsx:127-129` (barrido) |
| **P-H9** (chico) | Agregar ancho y alto de los pósters a `MediosDelProyecto`. | `Imagen` exige `ancho` y `alto` (`_componentes/medios/Imagen.tsx:41-54`), pero `PROYECTOS` solo trae rutas. Las medidas varían por proyecto y hoy están solo en un `.json` de docs. | `proyectos.ts:33-36`; `docs/rediseno/entregas/b1-portfolio/medios.json` |
| **P-H10** (condicional) | Que el foco vuelva al botón al cerrar el modal, cuando se abrió desde un envoltorio. | El foco vuelve al elemento que tiene `data-abre-contacto`. Si es un `<div>`, como en `CtaDelServicio`, `focus()` no hace nada. Se abre si el S3 mide que el foco se pierde; también afecta al home. | `apertura.ts:63,137`; `CtaDelServicio.tsx:16-24`; `Cta.tsx:160-184` |

---

## 10. Partición S1a–S4

**V2:** es la partición que decidió Valentino (§12.3).
- El S1 de la V1 se partió en dos: el S1a (base y datos, sin UI) y el S1b (template, ruta y escena).
- El S2 queda solo con los slots.
- El S3 y el S4 siguen como en la V1. Solo cambian para reflejar las decisiones:
  - en el S3, `LOGOTIPO` y la metadata mínima que ya trae el S1b;
  - en el S4, la lista de tsc en la comparación y la condición de memoria del build (D18).

### Antes del S1a

- **Hecho por Valentino:** el worktree, `.env.local` y `node_modules` (§0.1), y las decisiones de §11 (§12).
- **Falta la memoria.** El S1a necesita 3 GB libres y el home quieto (§12.4). Al cerrar la V2 había 0,81 GB.

### Reglas para todos los sprints

- **Duración:** ~2 h. Si algo no converge en ~60 min, queda detrás de una bandera nuestra (una constante en `_servicios/`, nunca `entorno.ts`) y se reporta.
- **Memoria:**
  - Antes de cada proceso pesado se mira la memoria libre: `[math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB,1)`. Con menos de 3 GB no se corre, y se anota «VERIFICAR TRAS REINICIO».
  - Un solo proceso pesado a la vez entre los dos worktrees: dev, build, `verificar` o tsc.
  - Cómo se ve que el home está quieto (propuesta de CC): ningún proceso `node` con `rediseno-home` en su línea de comando (`Get-CimInstance Win32_Process`). Si hay alguno, se le pregunta a Valentino y no se mata nada.
- **Nada de escrituras reales:** los tests nunca llaman a `/api/contacto` ni a `/api/newsletter`. En el QA a mano, el formulario de contacto se abre y se cierra, pero nunca se envía.
- **Commit:**
  - Uno por sprint, con staging archivo por archivo.
  - Antes de commitear, `git status --short` (`CLAUDE.md:252-253`).
  - `SPEC.md` y `CONTRATO.md` no se commitean, salvo que Valentino lo pida.
- **Chequeos en cada sprint**, además de los tests propios:
  - los barridos del home de 5.1: `npm run test:s8-montaje`, `test:s8-escena`, `test:s40-3d-sonido`, `test:s53-pulido-2`, `test:s9-sentry` y `test:s4-paquete`;
  - lint por archivo;
  - tsc, comparado con la lista de la base: ningún error nuevo (§12.4).
- **Tailwind:** nunca deletrear una clase arbitraria entera en comentarios, tests ni `.md` (`CLAUDE.md:172-174`).

### S1a — La base, los tipos y los datos de los tres servicios (sin UI)

**Objetivo:**
- la base de `verificar` y de tsc, guardada;
- los tipos, el formato y las rutas;
- los datos completos de los tres servicios, `SERVICIOS` y `precios.ts`, con sus tests.
- Sin UI, sin ruta y sin dev.

**Pasos:**
1. **Memoria y home quieto.** Con menos de 3 GB libres, o con el home corriendo algo pesado, el sprint se frena acá: no se crea ningún archivo y se anota «VERIFICAR TRAS REINICIO» (§12.4).
2. **Git.** Correr `git status --short` y `git log -1`. Si HEAD no es `54655181`, correr `git diff --stat 54655181..HEAD` sobre los archivos citados en este plan. Si alguno cambió, se revalidan sus citas antes de escribir código.
3. **La base**, antes de crear un solo archivo, sin el dev y sin `.next` (§12.4):
   - Desde Git Bash, para que la redirección no cambie la codificación: `npm run verificar > /c/paginas-servicios-datos/verificar-base.txt 2>&1`. Va fuera del worktree (D16).
   - Primero se mira la salida real y recién después se escribe el extractor.
   - Salen dos listas:
     - `C:\paginas-servicios-datos\verificar-base.fallas.txt` (suite · invariante · afirmación);
     - `C:\paginas-servicios-datos\tsc-base.errores.txt`.
4. **Archivos:** `tipos.ts`, `formato.ts`, `rutas.ts`, `datos/fuenteDeProyectos.ts`, los tres archivos de datos, `datos/servicios.ts` (los tres, en orden) y `precios.ts`.
   - Las respuestas del FAQ siguen la tabla de D9 (§12.2), cada una con su `// SPEC §7.x`.
   - El copy que el SPEC no da va marcado `// C2`.
   - La marca sale de `LOGOTIPO` (D10).
5. **Tests:** `__tests__/datos.invariant.ts` y `__tests__/precios.invariant.ts`. Se corren a mano con `npx tsx`, porque ningún script los ve (P-H7).
6. **Chequeos:** lint por archivo, los barridos de 5.1 y tsc contra la lista de la base. Antes de tsc se mira la memoria.
7. **Cierre:** Valentino mira y después va el commit, archivo por archivo, con este plan (D19) y lo de arriba. `SPEC.md` y `CONTRATO.md` no se commitean.

**Criterios de aceptación:**
- **Datos:** los tres archivos tipan como `Servicio`, sin `any`. Los números son los del SPEC, y lo que está [a definir] queda en `null` (§8.6).
- **FAQ:** cada respuesta escrita sale entera del SPEC y lleva su `// SPEC §7.x`. Las demás quedan en `null` (§12.2).
- **Copy:** lo que el SPEC no da va marcado `// C2`. «develOP» no aparece suelto en `datos/`: sale de `LOGOTIPO`.
- **Acento:** cada `acento.claro` lleva su `// P-H2`, y no hay otro hex en `_servicios/`.
- **Precios:** `PRECIOS_DESDE` está completo (200 único, 1.000 único y 49 mensual) y `precioDesde` nunca devuelve `null`.
- **Gate:** lint limpio en lo tocado; tsc sin errores nuevos contra la base; tests propios y barridos de 5.1 en verde.
- **Entregables:** las dos listas de la base, en `C:\paginas-servicios-datos\`.

**Tests, cada uno con su control positivo:**
- **`datos.invariant.ts`:**
  - Los valores son los del SPEC. Control: un valor alterado se detecta.
    - calibres: 200, 600 y 1.000;
    - mantenimiento: desde 50 y desde 100;
    - software: desde 1.000;
    - planes: 49, 90 y 150 por mes, con 500, 3.000 y 5.000 conversaciones.
  - Todo `Caso` de tipo `proyecto` existe en `FUENTE_DE_PROYECTOS`. Control: un slug falso se detecta.
  - Los calibres van de menor a mayor precio. Control: invertidos, se detecta.
  - `SERVICIOS` tiene los tres slugs, en el orden del SPEC. Control: dos cambiados de lugar.
  - En el texto de `datos/*.ts`, cada respuesta que no es `null` lleva `// SPEC §7.` en su línea o en la de arriba. Control: una respuesta sin el comentario (propuesta de CC).
  - «develOP» no aparece literal en `datos/*.ts`. Control: un texto con la palabra suelta (propuesta de CC).
  - El único hex es el de `acento.claro`, en una línea con `// P-H2`. Control: un hex suelto se detecta.
- **`precios.invariant.ts`:**
  - `PRECIOS_DESDE` da 200 único, 1.000 único y 49 mensual.
  - Para cada slug de `SLUGS_DE_SERVICIO`, `precioDesde` devuelve un `PrecioDesde` con `usd` finito y mayor que 0.
  - Control de los dos: si se agrega un plan más barato, el mínimo cambia. La cifra se deriva, no se escribe.
  - En runtime, el grafo de imports de `precios.ts` no tiene `.tsx`, ni `react`, ni `next`, ni `proyectos.ts`, que desde B1.1b arrastra la llave del contenido inventado. Control: un grafo armado con un `.tsx` se detecta.

**Modelo:** Sonnet + Máx (SPEC §10).

**Riesgos:**
- la memoria: la base pide 3 GB libres y el home quieto;
- `verificar` es largo (10–20 min);
- inventar al completar el FAQ o los casos de software: van por la regla de D9, y lo que falta queda en `null`.

**Qué mira Valentino** (no hay pantalla):
- los datos contra el SPEC: los números, las respuestas del FAQ con su `// SPEC §7.x` y lo que quedó en `null`;
- la salida de los dos tests;
- las dos listas de la base, en `C:\paginas-servicios-datos\`.

### S1b — Template, bloques, ruta y escena

**Objetivo:** `/v3/paginas-web` armada con el template y los bloques, con la ruta (A) publicando solo Páginas web. La escena queda medida en runtime.

**Pasos:**
1. **Memoria, home quieto y git:** igual que en el S1a.
2. **Template y bloques:** `PaginaDeServicio.tsx` y todos los bloques de §7.
   - Precio con el slot `calibres`; Extra con el mantenimiento; Prueba con los casos de `PROYECTOS`.
   - Los slots `proyecto` y `planes` son del S2. El `switch` de `Precio.tsx` es exhaustivo, y esas dos ramas devuelven `null` con `// S2` (propuesta de CC).
3. **Chrome (D4):** sin `ChromeDelHome`. Van `Contacto` como hermano del template, un enlace a `/v3` y el cierre provisorio.
4. **Ruta:** `v3/[servicio]/page.tsx`.
   - `generateStaticParams` sale de `PUBLICADOS = ['paginas-web']`, una lista en `rutas.ts`, aparte de `SERVICIOS`. Además, `dynamicParams = false`.
   - `generateMetadata` mínima: `title` y `description` de los datos, `noindex`, y el canonical heredado pisado por el propio (D12). El resto del SEO es del S3.
   - Propuesta de CC: adelantar esa metadata mínima al S1b, para que la página no herede el canonical del home ni un solo día.
5. **Test:** `__tests__/pagina.invariant.tsx`.
6. **Chequeos:** lint por archivo, los barridos de 5.1 y tsc contra la base.
7. **Dev:** `npm run dev -- -p 3001`, en segundo plano, con el log en `C:\paginas-servicios-datos\dev-S1b.log`.
8. **Medición de la escena,** con la receta de abajo. Los números se suman a P-H4 (D3).
9. **Pasada visual (D13):** con `chrome-devtools` en el 3001, a 1280×800 y a 390×844, en formato ✅/⚠️/❌/❓.
10. **Cierre:** Valentino mira y confirma la pasada. Después va el commit.

**Criterios de aceptación:**
- **Estructura:** en `/v3/paginas-web` los bloques van en el orden de SPEC §5 (Del blog no se monta). Hay un solo `h1` (el problema) y la jerarquía de headings no salta niveles.
- **Precios:** «desde USD 200 / 600 / 1.000» sale de los datos. No hay números escritos en el JSX.
- **«[a definir]»:** en dev se ven los marcadores de §8.6; en modo producción (con test) no aparece ninguno.
- **Casos:** nombre, rubro y póster salen de `PROYECTOS`, y servicios solo pone su texto. Ningún valor de `resena` ni de `problemaResuelto` llega al marcado.
- **CTA:** el envoltorio lleva `data-abre-contacto="panel"`, `data-servicio="paginas-web"` y `data-precarga="web"`, y abre el modal con «web» marcado. Se prueba a mano: abrir y cerrar, sin enviar.
- **Lo que no tiene que aparecer:**
  - hex fuera del `--color-acento` de la raíz;
  - ids reservados (los de la respuesta 4, con los del Portfolio);
  - `data-panel`, `data-seccion-id` ni `data-signo-de-la-tuya`;
  - `any`.
- **Rutas:**
  - `/v3/paginas-web` da 200;
  - `/v3/software-a-medida`, `/v3/ia-y-automatizaciones` y `/v3/xyz` dan 404, aunque los datos de las dos primeras existan;
  - `/v3/componentes` da 200, y `/v3` sigue igual.
- **`<head>`:** tiene `noindex` y un canonical que no es el del home.
- **Gate:** lint limpio en lo tocado; tsc sin errores nuevos contra la base; tests propios y barridos de 5.1 en verde.
- **Entregables:** los números de la escena y la pasada visual, en el reporte.

**Tests (`pagina.invariant.tsx`, con `renderToStaticMarkup` y sin `Contacto`), cada uno con su control positivo:**
- hay un solo `h1` y lleva el título del problema. Control: dos `h1`;
- los `data-bloque` van en el orden del SPEC. Control: dos bloques cambiados de lugar;
- el CTA lleva los tres atributos. Control: sin `data-precarga`;
- el marcador aparece en dev y no en producción. Control: los modos cruzados;
- no hay ids reservados, ni `data-panel`, ni `data-signo-de-la-tuya`. Control: un `id="portfolio-la-tuya"` se detecta;
- el único hex del marcado es el de `--color-acento` en la raíz. Control: un hex suelto se detecta;
- ningún valor de `resena` ni de `problemaResuelto` de `PROYECTOS` aparece en el marcado. Control: un render que sí los pinta (propuesta de CC, por B1.1b);
- la ruta publica exactamente `PUBLICADOS`. Control: una lista con un slug sin publicar.
  - Si la ruta se puede importar en Node con tsx: [NO DETERMINABLE LEYENDO]. Si no se puede, se comprueba en el dev.

**Receta para medir la escena** (sin banderas de `entorno.ts`). Con las herramientas `chrome-devtools`, contra `http://localhost:3001/v3/paginas-web` y, como control, `http://localhost:3001/v3/tipografia`, a 1280×800 y a 390×844:
1. **Preparación.** Antes de medir, confirmar que la pestaña está visible y que `innerWidth > 0` (`CLAUDE.md:223-224`). No sacar capturas en el medio, porque congelan los pasos de render (`CLAUDE.md:229-230`); las capturas van al final.
2. **Consola:** errores y avisos a los 10 s. Separar las violaciones por escuchas no pasivas de los errores de verdad.
3. **NaN:** en una corrida aparte, con `?diag=carga` (es diagnóstico, no apaga nada), recorrer `__v3diag.estado()` y comprobar que todos los números son finitos. Anotar `escena.cargaLista`.
4. **FPS:** un contador de rAF, 10 s quieto y 10 s bajando con el teclado. Reportar p50 y p95 del cuadro.
5. **Tareas largas:** `PerformanceObserver('longtask')` durante esos 20 s, y el costo de `cajasDelTexto` en un trace corto de Performance.
6. **Memoria:**
   - `performance.memory.usedJSHeapSize` al entrar y a los 5 min;
   - el pool no paginado, antes y después: `(Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory).PoolNonpagedBytes`. Es la clase WMI, que no cambia con el idioma de Windows;
   - la memoria libre del sistema.
7. **Gesto** (desde 1024): cargar la página, ir al fondo apenas termina de cargar y despachar un `WheelEvent` hacia arriba, cancelable. Si queda `defaultPrevented`, el final está reteniendo el gesto. Repetir a los 10 s.
8. **Con los números:** si hay errores, NaN, retención o un costo que Valentino considere alto, se completa P-H4 con esos datos.

**Modelo:** Sonnet + Máx (SPEC §10).

**Riesgos:**
- la memoria: el dev, Chrome y WebGL juntos;
- es el primer `generateStaticParams` del repo: si no converge en 60 min, se pasa a (B) (D6);
- el modal en modo `barra` en el teléfono (P-H6).

**Qué mira Valentino:**
- `http://localhost:3001/v3/paginas-web`, a ancho de escritorio y a 390 en modo dispositivo; abrir y cerrar el CTA, sin enviar;
- `http://localhost:3001/v3/software-a-medida`, que en el S1b tiene que dar 404;
- la pasada visual, para confirmarla (D13).

### S2 — Los slots `proyecto` y `planes`; se publican los tres

**Objetivo:** las otras dos páginas. Los datos están desde el S1a: este sprint suma los dos slots de precio y pasa `PUBLICADOS` a los tres.

**Archivos:**
- `bloques/precio/Proyecto.tsx` y `bloques/precio/Planes.tsx`, y sus ramas en `Precio.tsx`;
- ajustes en `Prueba.tsx`: casos propios, `nota` y el CTA del panel a `/login` (D11);
- `rutas.ts`: `PUBLICADOS` pasa a tener los tres;
- `pagina.invariant.tsx`, ampliado.

**Criterios de aceptación:**
- Las tres rutas dan 200 y cualquier otro slug, 404.
- Salen de los datos: «desde USD 1.000», y los planes de 49 / 90 / 150 por mes con 500 / 3.000 / 5.000 conversaciones.
- Implementación y funcionalidades muestran «[a definir]» solo en dev.
- El bot de WhatsApp no se ofrece; como mucho, «próximamente» (SPEC §7.3).
- «Probá el panel» lleva a `/login` (D11).
- Por debajo de 1024, la tabla de planes scrollea adentro de su caja.
- Un solo acento por página.
- El gate y la pasada visual, como en el S1b.

**Tests:**
- `pagina`: los tres slots se renderizan y ninguno muestra un número sin dato. Control: un `null` de precio que se pintara como `0`.
- `pagina`: la ruta publica los tres. Control: uno que falte.
- `datos` y `precios` siguen en verde y no cambian: los datos y `PRECIOS_DESDE` están completos desde el S1a.

**Modelo:** Sonnet + Máx.

**Riesgos:**
- los casos de software sin rubro, texto ni captura: van en `null` y no se pintan;
- la tabla en 375.

**Qué mira Valentino:** `http://localhost:3001/v3/software-a-medida` y `http://localhost:3001/v3/ia-y-automatizaciones`, en escritorio y a 390.

### S3 — SEO, JSON-LD, FAQ accesible y pasada por debajo de 1024

**Objetivo:** metadata por página; JSON-LD `Service`, `FAQPage` y `BreadcrumbList`; migas visibles; FAQ usable con teclado; y todo bien apilado por debajo de 1024.

**Archivos:** `seo.ts`, la ruta (`generateMetadata` completa: la mínima ya está desde el S1b), `PaginaDeServicio.tsx` (el script de JSON-LD y las migas), `Faq.tsx` y `__tests__/seo.invariant.ts`.

**Criterios de aceptación:**
- **Metadata:**
  - `title` y `description` salen de los datos;
  - `robots` en noindex, como el resto de /v3 (D12);
  - sin canonical a la raíz: se pisa `alternates` y se verifica en el `<head>` renderizado.
- **JSON-LD válido:**
  - `Service`, con `LOGOTIPO` como nombre del proveedor (D10) y una `priceSpecification` mínima en USD (mensual en IA);
  - `FAQPage`, solo con las preguntas que tienen respuesta;
  - `BreadcrumbList` (Home › Servicio), con URLs absolutas armadas desde `rutas.ts`;
  - serializado con `<` escapado.
- **FAQ en `<details>/<summary>`:** se abre y se cierra con el teclado, las respuestas están en el HTML y se ve el anillo de foco (regla global, `theme-develop.css:1500-1504`).
- **Por debajo de 1024** (375, 390, 768, 860 y 1023): todo apila, nada desborda la página y la tabla scrollea en su caja.
- **Contraste** medido en el navegador con los colores computados (§4.4).
- **Foco:** vuelve al CTA al cerrar el modal. Si no vuelve, P-H10.
- **Modal en 390×844:** si no sirve, P-H6.

**Tests:** `seo`, con cuatro chequeos:
- el JSON-LD se parsea y tiene los tipos esperados. Control: uno roto;
- `FAQPage` excluye las respuestas en `null`. Control: una con `null` se detecta;
- el escape funciona. Control: un `</script>` dentro de un texto no cierra el script;
- «develOP» no aparece literal en `seo.ts` (D10). Control: un texto con la palabra suelta.

**Modelo:** Sonnet + Máx.

**Riesgos:**
- Lenis con `<details>`: al abrir cambia el alto; medir que el scroll no salte;
- Next combina la metadata de forma superficial: comprobar el `<head>`;
- el 404 con la estética del sitio vivo.

**Qué mira Valentino:**
- las tres URLs a 375, 390, 768 y en escritorio;
- la FAQ con Tab y Enter;
- el código fuente de la página, para ver el JSON-LD.

### S4 — Verificación completa, una sola vez

**Objetivo:** pasar el gate del proyecto (SPEC §10, O-5).

**Pasos:**
1. Chequear la memoria y apagar el dev.
2. **`verificar`, solo y en la misma condición que la base** (sin `.next`), con la salida en `C:\paginas-servicios-datos\verificar-S4.txt`.
3. **Comparar las dos listas con la base (las fallas de `verificar` y los errores de tsc): tiene que haber cero nuevas**, aunque estén dentro de un grupo que ya era rojo.
4. Lint de todo lo nuestro, tsc, tests propios y barridos de 5.1.
5. La pasada visual (D13).
6. **Build (D18: sí, si la memoria alcanza):**
   - `npm run build`, solo y desacoplado (~30 min, con nada al lado);
   - después, `next start -p 3001` para ver producción, sin ningún «[a definir]».
   - El build va **después** de `verificar`, porque con `.next` cambian los grupos rojos.

**Criterios de aceptación:**
- cero fallas de `verificar` y cero errores de tsc nuevos contra la base;
- lint y tsc limpios;
- si hubo build: 3 HTML en `server/app/v3/` y ningún marcador en producción.

**Modelo:** Sonnet + Máx. Solo corre y reporta; no escribe código.

**Qué mira Valentino:** las tres URLs en dev (o en producción, si hubo build). Después, mergea a mano en `rediseno/home`.

---

## 11. Riesgos y dudas

### 11.1 Decisiones que necesito de Valentino

**V2: Valentino ya las decidió todas.** Lo que decidió está en §12. Esta tabla queda como la propuesta original.

| # | Decisión | Mi propuesta |
|---|---|---|
| D1 | Crear el worktree (§0.1) y elegir desde qué commit. | Desde `rediseno/home` en ese momento. El S1 revisa el diff contra `db37bfb9`. |
| D2 | Cómo se instala `node_modules` en el worktree nuevo. | `npm ci` en el worktree nuevo, solo y con memoria suficiente. Usa el lockfile sin modificarlo; su `postinstall` corre `prisma generate`, que escribe en `node_modules` y no toca la base. Un junction al `node_modules` del home lo compartiría con B1. |
| D3 | Escena: ¿P-H4 se manda ya, o con los números del S1? | Ya, con la evidencia de lectura. El S1 suma los números. |
| D4 | La navbar, mientras no esté P-H3. | No montar `ChromeDelHome`. Solo `Contacto`, un enlace a `/v3` arriba (puede ser `Logotipo`, `_componentes/marca/Marca.tsx:25`) y el cierre provisorio. La barra montada tal cual deja cinco enlaces muertos y el salto roto. |
| D5 | ¿Sumar `data-precarga` al CTA desde el S1? | Sí: funciona hoy, sin tocar el home. `data-servicio` queda igual, por contrato. |
| D6 | Ruta (A) o (B). | (A). |
| D7 | Acento claro: hex en los datos (como dice el contrato) o `var()` de los tokens `ds` de `globals.css`. | Hex en los datos, con `// P-H2`. |
| D8 | Los ajustes al modelo de SPEC §6 (§8.2). | Aceptarlos; el chat los pasa al SPEC. |
| D9 | Las preguntas que no tienen respuesta en el SPEC. | `null`: no se muestran en producción hasta C2. Alternativa: respuestas armadas solo con hechos del SPEC, citando el párrafo, para que las apruebes. |
| D10 | El copy que el SPEC no da: el rótulo del botón del CTA, `seo.title` y `description`, y los títulos de bloque. | Botón con el patrón del home, «Quiero mi …» (`servicios/contenido.ts:118-122`); title `<nombre> · develOP`; description = `queHacemos.texto`; títulos = los nombres de SPEC §5. Todo provisorio hasta C2. |
| D11 | «Probá el panel»: ¿deshabilitado, o lleva a `/login`? | A `/login`, que existe (`_chrome/enlaces.ts:28`). Un botón deshabilitado sin explicación parece roto. |
| D12 | ¿`noindex` mientras vivan en /v3? | Sí, como todo /v3 (`v3/page.tsx:55-62`). |
| D13 | La pasada visual sin `visual-qa`, que no puede correr acá (§1.3). | La hace la sesión padre con `chrome-devtools` en el 3001, con el formato ✅/⚠️/❌/❓ de `visual-qa`, y la confirma Valentino. La otra opción es habilitar Claude_Preview y agregar una entrada para el 3001 en `launch.json`, pero es infraestructura compartida: lo decide Valentino. |
| D14 | ¿Tests con `npx tsx`? Es la convención del repo, y tsx solo está en la caché de npx. | Sí. La regla «nunca npx» queda para tsc. |
| D15 | ¿Qué hacer si tsc da OOM? | Usar `node --max-old-space-size=4096 .\node_modules\typescript\bin\tsc --noEmit`, la misma forma que usa `verificar`. |
| D16 | Dónde guardar la base y las salidas de `verificar`. | Fuera del worktree, en `C:\paginas-servicios-datos\`. Adentro las leerían Tailwind (que escanea los `.md`) y el detector de conflictos del paso 1b. |
| D17 | El puerto 3001. | Mientras corre el dev de servicios, el home no levanta `start:qa` ni `next-prod-qa`, que usan el 3001 (`package.json:12`; `.claude/launch.json:21`). |
| D18 | ¿Build en el S4? | Sí, una sola vez, solo y desacoplado, después de `verificar`. |
| D19 | ¿Se commitea este plan? | Sí, en el commit del S1. `SPEC.md` y `CONTRATO.md` quedan sin trackear. |
| D20 | El protocolo de `CLAUDE.md` pide `npm run build` y `npx prisma migrate status` antes y después de cada sprint (`CLAUDE.md:139-148`). | En este carril, reemplazarlo por el gate de SPEC §10: build una sola vez en el S4, y sin prisma, porque servicios no toca el schema ni la base. |

### 11.2 Riesgos

1. **La base se mueve:** B1 commiteó durante el S0, dos veces más antes de crear la rama. Mitigación: el paso 2 del S1a. Si después de tomar la base entra un merge de `rediseno/home`, la base se vuelve a tomar (§12.4).
2. **Memoria:** había 0,9 GB libres al cierre de la V1 (08:31) y 0,81 GB al cierre de la V2 (14:50). `verificar` tarda 10–20 min; tsc usa ≈2,5 GB; el dev, Chrome y WebGL se suman, con la fuga conocida. Un solo proceso pesado a la vez entre los dos worktrees.
3. **Tailwind 4 escanea docs y comentarios.** Una clase arbitraria deletreada en un `.md` o en un comentario se emite como regla, y puede romper el build señalando un archivo sano (`CLAUDE.md:172-174,221`). Si pasa, hay que borrar `.next` entero.
4. **El choque de `data-servicio`** (P-H5).
5. **La regla de precios del home frente a B4** (P-H8).
6. **Escena:** la retención del primer gesto hacia arriba al fondo (por la carrera) y el costo de la lectura del texto. Ver S1b.
7. **Ids y atributos reservados:**
   - ids prohibidos: `hero`, `quienes-somos`, `numeros`, `trabajos`, `servicios`, `tu-panel`, `por-que-develop`, `cierre` y `contacto`;
   - desde B1.1b, también `portfolio-el-garage`, `portfolio-esquina-estudio`, `portfolio-banu-scents` y `portfolio-la-tuya`;
   - nunca `data-panel`, `data-seccion-id` ni `data-signo-de-la-tuya`;
   - `data-seccion` solo con el valor `invertida`, y solo en la raíz.
8. **El formulario es real:** `/api/contacto` existe y tiene límite por IP. En el QA no se envía.
9. **D8 (del lado del home):**
   - fuera de `/v3`, las páginas pierden el prefijo que apaga el chrome viejo (`publicRoute.ts:42`), y también el `noindex`;
   - un `[servicio]` en la raíz atrapa todo segmento desconocido.
10. **El repo suelto en `C:\.git`:** cualquier comando de git corrido en una carpeta sin repo propio cae ahí y ve todo el disco. Con el worktree creado, ya no afecta a servicios. Borrarlo o no lo decide Valentino.
11. **El foco al cerrar el modal** (P-H10) y **el modal en el teléfono** (P-H6): se miden en el S1b y el S3.
12. **La llave del contenido inventado** (B1.1b): si servicios leyera `resena` o `problemaResuelto` de `PROYECTOS`, publicaría marcadores o relleno. Lo cubren §8.3 y un test del S1b.

---

## 12. Decisiones de Valentino

Valentino decidió lo que sigue al aprobar el S0. Donde CC completó algo para poder aplicarlo, dice **propuesta de CC**.

### 12.1 Las que van como se propusieron

| # | Decisión |
|---|---|
| D1 y D2 | Hechas: el worktree salió de `rediseno/home` y `node_modules` se instaló con `npm ci` (§0.1). |
| D3 | P-H4 ya está abierto en el LOG del proyecto. El S1b suma los números. |
| D4 | No se monta `ChromeDelHome`. Van `Contacto`, un enlace a `/v3` y el cierre provisorio. |
| D6 | Ruta (A). Si no converge en 60 min, se pasa a (B). |
| D7 | El hex del acento claro va en los datos, con `// P-H2`. |
| D8 | Los ajustes al modelo (§8.2), aceptados. |
| D11 | «Probá el panel» lleva a `/login`. |
| D12 | `noindex`, y se pisa el canonical heredado. |
| D13 | La pasada visual se hace con `chrome-devtools` en el 3001, en formato ✅/⚠️/❌/❓, y la confirma Valentino. `.claude/launch.json` no se toca. |
| D14, D15, D16, D17 y D20 | Sí, como en §11.1. |
| D18 | Sí, condicionado a la memoria. |
| D19 | El plan se commitea en el S1a. |

### 12.2 Las que cambian

**D5 — el CTA lleva tres atributos.**
- El envoltorio lleva `data-abre-contacto="panel"`, `data-servicio="<slug>"` (por contrato) y `data-precarga={idEnElHome}`.
- En Páginas web son `data-servicio="paginas-web"` y `data-precarga="web"`, que marca `web` en el formulario (`_chrome/contacto/contenido.ts:67-71`).
- El LOG le propone al home cerrar P-H1 con `data-precarga` y dejar `data-servicio` solo para el tema (P-H5).
- Si el home lo confirma, servicios saca su `data-servicio` en un sprint posterior.

**D9 — las respuestas del FAQ.**
- **La regla:**
  - la respuesta se escribe si **cada** afirmación sale de una línea del SPEC, con el comentario `// SPEC §7.x`;
  - si alguna parte no sale del SPEC, queda en `null` y no se publica.
- **Lo que decidió Valentino:**
  - salen «¿Cuánto tarda una web?» (el proceso de §7.1), «¿Qué incluye el portal del cliente?» (lo que incluye §7.1) y «¿Puedo ver las conversaciones?» (el panel de §7.3);
  - «¿El sistema es mío?» queda en `null`.
- **El resto lo clasificó CC con la misma regla** (propuesta de CC). Valentino lo confirma cuando mira los datos en el S1a.

| Servicio | Pregunta | ¿Sale? | De qué líneas del SPEC | Quién |
|---|---|---|---|---|
| Páginas web | ¿Cuánto tarda una web? | Sí | Los pasos y el plazo de referencia (`SPEC.md:150`). Va como referencia, nunca como promesa (`:73`). | Valentino |
| Páginas web | ¿Puedo editarla yo después? | Sí, acotada | Mediana y Premium son autogestionables (`:146-147`). La Simple no se nombra: si tiene panel está [a definir] (`:149`). | CC |
| Páginas web | ¿Qué pasa después de la entrega? | Sí, acotada | Lo que sale del mantenimiento (`:149`): los arreglos de algo roto siempre incluidos; los cambios medianos desde USD 50 y los grandes desde USD 100; todo extra se presupuesta antes. Quedan afuera el plan mensual y las ediciones desde el panel, que dependen de un [a definir]. | CC |
| Páginas web | ¿Qué incluye el portal del cliente? | Sí | Métricas, tickets y acceso a más servicios (`:139`). | Valentino |
| Páginas web | ¿El chatbot viene incluido? | Sí | El SPEC trae la respuesta: no, va aparte (`:152`; `:140`). | SPEC |
| Software a medida | ¿Cómo sé si necesito un sistema propio? | Sí | El problema (`:158`) y el CTA: «Una charla corta alcanza para saber si te podemos ayudar» (`:165`). | CC |
| Software a medida | ¿Qué pasa si después necesito cambios? | `null` | El SPEC no dice cómo se tratan los cambios después de la entrega. Los 1 o 2 meses de soporte (`:160`) no lo responden. | CC |
| Software a medida | ¿El sistema es mío? | `null` | [a definir] (`:164`, y §11 del SPEC). | Valentino |
| Software a medida | ¿Cuánto soporte incluye? | Sí | 1 o 2 meses gratis (`:160`; `:164`). | SPEC |
| IA y automatizaciones | ¿El bot reemplaza a mi equipo? | `null` | El SPEC dice que deriva a una persona (`:174`), pero no da el sí o el no que la pregunta pide. | CC |
| IA y automatizaciones | ¿Puedo ver las conversaciones? | Sí | Un panel propio para ver y configurar todo (`:174`). | Valentino |
| IA y automatizaciones | ¿Qué pasa si no sabe responder? | Sí | Deriva; nunca inventa (`:186`; `:174`). | SPEC |
| IA y automatizaciones | ¿Qué cuenta como una conversación? | Sí | Una charla completa, sin importar cuántos mensajes (`:186`). | SPEC |
| IA y automatizaciones | ¿Qué pasa si se agota la cuota del mes? | Sí | Sigue en modo básico y derivando (`:186`). | SPEC |
| IA y automatizaciones | ¿Qué pasa con los datos de mis visitantes? | Sí | Pide consentimiento antes de guardarlos (`:186`). | SPEC |

- Las líneas son de `docs/servicios/SPEC.md` (v2).
- «Quién» dice quién decidió si sale. «SPEC» significa que el SPEC ya trae la respuesta entre paréntesis.

**D10 — el copy provisorio y la marca.**
- El copy que el SPEC no da va como se propuso en §11.1, marcado `// C2`, que es la pasada de textos del final (`SPEC.md:133`):
  - el rótulo del botón, con el patrón del home: «Quiero mi …» (`_secciones/servicios/contenido.ts:118-122`);
  - `seo.title` = `<nombre> · <marca>`;
  - `seo.description` = `queHacemos.texto`;
  - los títulos de bloque = los nombres de SPEC §5.
- **La marca: el home ya exporta una constante, y se importa.** No se crea otra. [leído]
  - Es `LOGOTIPO = 'develOP'` (`_componentes/marca/sistema.ts:61`). Su comentario dice: «El logotipo, como texto. Es la palabra de la marca, sin transformar.»
  - `sistema.ts` no importa nada, así que no le suma componentes al grafo de `precios.ts`.
  - Ningún invariante limita quién lo importa. Hoy lo usan `Marca.tsx`, `s17-marca` y `s44-pie`.
- «develOP» nunca va escrito suelto en `_servicios/datos/**` ni en `seo.ts`. Lo vigilan el test de datos (S1a) y el de SEO (S3) (propuesta de CC).

### 12.3 La partición nueva

Reemplaza a la de la V1. El detalle de cada sprint está en §10.

| Sprint | Qué |
|---|---|
| S1a | La base de `verificar` y de tsc; tipos, formato y rutas; `fuenteDeProyectos`; los datos de **los tres** servicios; `SERVICIOS`; `precios.ts`; los tests de datos y de precios. Sin UI, sin ruta y sin dev. |
| S1b | El template, los bloques, la ruta (`generateStaticParams` desde `PUBLICADOS = ['paginas-web']`, una lista aparte de `SERVICIOS`), el test de página y la medición de la escena. |
| S2 | Los slots `proyecto` y `planes`. `PUBLICADOS` pasa a tener los tres. |
| S3 y S4 | Igual que en la V1. |

- **Consecuencia:** `PRECIOS_DESDE` está completo desde el S1a, y `precioDesde` devuelve siempre un `PrecioDesde`, nunca `null` (§8.5).
- **Dónde vive `PUBLICADOS`** (propuesta de CC): en `rutas.ts`, que es lo que decide qué rutas existen. En el S2 cambia una sola línea.

### 12.4 La base y el gate

- **Qué incluye:** la lista de fallas de `verificar` y la lista de errores de tsc.
- **El gate:** ningún error nuevo en ninguna de las dos.
- **Cuándo se toma:** solo con 3 GB libres o más y el home quieto. Si no, el sprint se frena antes de crear archivos.
- **Cómo** (propuesta de CC):
  - La salida de `verificar` ya trae la de tsc: el paso 2 imprime cada línea de error con el prefijo `  │ ` (`s4-verificar.ts:120`). La lista de tsc sale de ahí, sin otra corrida pesada.
  - Si el paso 2 no trae la lista (por ejemplo, por un OOM), tsc se corre aparte, solo y con heap de 4 GB (D15).
  - En `C:\paginas-servicios-datos\` quedan tres archivos: `verificar-base.txt` (la salida entera), `verificar-base.fallas.txt` y `tsc-base.errores.txt`.
  - **Qué cuenta como nuevo:** una falla o un error cuya línea no está en la lista de la base.
    - Servicios no edita archivos del home, así que sus líneas no se corren.
    - Todo error en `_servicios/` o en `[servicio]/` es nuevo por definición.
  - Si después de tomar la base entra un merge de `rediseno/home`, la base se vuelve a tomar antes de seguir.
