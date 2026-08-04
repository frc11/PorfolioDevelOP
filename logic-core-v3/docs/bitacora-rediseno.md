# Bitácora del rediseño — sitio público develOP

Archivo de apéndice. Cada sprint agrega su entrada al final; **nunca se sobrescribe**
lo anterior. Rama del bloque B1: `redesign/home` (desde `main`, sin mergear).

---

## Nota de arranque del bloque B1 — 2026-07-30

**El documento de sprint no existe en el repo.** El runner apuntaba a
`docs/sprints/sprint-b1-sistema-diseno.md`. Buscado en `docs/sprints/`, en todo el
árbol de trabajo y en el historial de todas las ramas (`git log --all
--diff-filter=A`): no está, y nunca estuvo versionado. Los únicos sprints del
rediseño en `docs/sprints/` son `sprint-b0-bis-cierre.md` y
`sprint-b05-sanidad-sitio.md`.

Se ejecutó igual porque **el prompt de arranque contiene la especificación completa
y sin ambigüedades de los tres sprints** (reglas absolutas, tokens con sus valores,
tabla de componentes, contenido del styleguide, criterios de cierre). Esa
especificación es la fuente de verdad usada. Queda anotado por dos razones: el
documento no está disponible para auditar el trabajo contra él, y si Franco tiene
una versión local sin commitear puede diferir de lo ejecutado.

**Estado de precondiciones.** `main` en `4dadd27`, árbol limpio, sin cambios de otra
sesión. B0 / B0-bis / B0.5 / B0.6 **no** están mergeados en `main`: el bloque corre
sobre un `main` previo, que es lo que el runner anticipaba. Sin solapamiento de
archivos (B1 toca `globals.css` y archivos nuevos).

---

## B1-S1 — Tokens, tipografía y reduced-motion · 2026-07-30

Commit: `feat(design-system): tokens base, escala tipográfica y reduced-motion global`
Archivo tocado: `logic-core-v3/src/app/globals.css` (**único**, +121 líneas, 0 borrados).

### Qué se hizo

**1. Bloque `@theme static` nuevo con 37 tokens del sistema.** Prefijo `ds` en todos
(`--color-ds-void`, `--text-ds-display-xl`, `--radius-ds-control`, …).

- Base dark: `void #0D0B09` · `surface #151210` · `ink #EDE9E1` · `ink-muted #A39C8F`
  · `border rgba(237,233,225,.10)`.
- Tema claro: `light-bg #F2EEE6` · `light-surface #EAE5DA` · `light-ink #1A1713`
  · `light-ink-muted #6E675C` · `light-border rgba(26,23,19,.12)`.
- Radios y elevación: `radius-ds-surface 0px` · `radius-ds-control 9px`
  · `shadow-ds-control` de 2 capas.
- Escala tipográfica completa (display-xl, display-lg, lead, body, eyebrow, data),
  con `line-height` / `letter-spacing` / `font-weight` declarados como modificadores
  `--text-*--*` de Tailwind 4, no como clases sueltas.
- Espaciado y layout: `spacing-ds-section clamp(6rem,14vh,11rem)`
  · `spacing-ds-gutter clamp(1.25rem,4vw,3rem)` · `container-ds-page 1240px`
  · `container-ds-prose 65ch`.

**2. Cuatro acentos de servicio**, con los valores del código actual
(`OurServices.tsx:77/95/113/131`): `web #06b6d4` · `ia #10b981` ·
`automation #f59e0b` · `software #8b5cf6`. Son los tonos sobrios de cada familia;
los neón del repo (`#00ff88`, `#00e1ff`) quedaron descartados.

**3. Bloque `prefers-reduced-motion` global.** No existía ninguno en el sitio.

### Decisiones tomadas (y por qué)

**Prefijo `ds`.** El sprint pedía "prefijo que no colisione con los existentes" pero
listaba nombres que **sí** colisionan: `--color-void` y `--color-accent` ya existen
en `globals.css` y el sitio los consume vivos (`body { background-color:
var(--color-void) }`, más los scopes `[data-theme='light'|'dark']`). Se resolvió con
el infijo `ds` **dentro de los namespaces de Tailwind** (`--color-ds-*`,
`--text-ds-*`, `--radius-ds-*`, `--spacing-ds-*`, `--container-ds-*`): cumple la
regla dura de no colisión y además genera utilities reales (`bg-ds-void`,
`text-ds-display-xl`, `rounded-ds-control`), que es lo que S2 necesita para no
hardcodear. El sprint no nombraba un prefijo concreto; esta es la elección.

**`@theme static` y no `@theme` a secas.** Primer intento: agregar los tokens al
`@theme` existente. El build salió verde pero **ninguno de los 37 tokens apareció en
el CSS emitido** — Tailwind 4.3 hace tree-shaking de las variables de tema que
ningún utility usa. Con eso, cualquier lectura por `var()` crudo (la inversión de
tema que S2 le da a `SectionShell`) se habría quedado sin valor, en silencio. Se
movieron a un `@theme static` propio, que fuerza la emisión. Verificado que **solo**
fuerza estos tokens: `--color-stone-950`, `--color-lime-300`, `--font-weight-thin`,
`--perspective-dramatic`, `--ease-snappy` siguen ausentes del build, o sea el tema
default de Tailwind sigue tree-shakeado.

**`1ms` y no `0.01ms` en el bloque de reduced-motion.** El patrón que circula usa
`animation-duration: 0.01ms`, que sobre una animación `infinite` la convierte en un
loop de ~100Hz — quema CPU en vez de aquietar (es el mismo problema que ya está
registrado para el reduced-path de `WhyDevelOP`). Se usó `1ms` +
`animation-iteration-count: 1`: corta los loops perpetuos a una iteración y deja los
reveals con `fill: both` aterrizando en su keyframe final, en lugar de quedar
clavados en `opacity: 0` — que es el modo clásico de romper una página al agregar
reduced-motion.

### Qué se midió

| Chequeo | Resultado |
|---|---|
| `npm run build` | ✅ verde (exit 0) |
| `npx tsc --noEmit` | ✅ 0 errores (baseline pre-sprint también 0) |
| `git diff` de `globals.css` | ✅ 121 inserciones, **0 borrados** — ninguna regla existente removida ni modificada |
| Diff del **CSS compilado** vs `main` | ✅ delta total = 37 propiedades nuevas dentro del `@layer theme{:root}` + 1 `@media (prefers-reduced-motion)`. Cero reglas removidas, cero alteradas, cero reordenamiento |
| Tokens emitidos y resolviendo en runtime | ✅ los 37, verificados por `getComputedStyle` |
| Tokens viejos intactos | ✅ `--color-void #030303`, `--color-accent #06b6d4` sin tocar en las 5 páginas |
| Home + 4 landings renderizando | ✅ h1 presente, sin overflow horizontal, sin errores de consola |
| Declaraciones de reduced-motion | ✅ animaciones infinitas 7→0, animaciones >50ms 8→0, transiciones >50ms 216→0 |

Recorrido de páginas (prod-QA `127.0.0.1:3001`, build de producción):

| Ruta | Elementos | Visibles | scrollHeight | overflow-X |
|---|---|---|---|---|
| `/` | 5510 | 2788 | 19537 | no |
| `/web-development` | 2013 | 1678 | 21988 | no |
| `/ai-implementations` | 1374 | 1081 | 9641 | no |
| `/process-automation` | 3528 | 2474 | 17588 | no |
| `/software-development` | 1651 | 1387 | 13092 | no |

### Qué NO se hizo, y por qué

**No hay capturas de pantalla.** El pane del browser no está desplegado en esta
sesión sin supervisión, así que la página no compone frames y `screenshot` falla por
timeout. Se reemplazó por dos verificaciones **más fuertes** para este cambio
puntual: el diff del CSS compilado (que prueba por construcción que ninguna regla
existente cambió — propiedades personalizadas que nadie referencia no pueden alterar
el render) y medición de layout por DOM en las 5 páginas. Aun así, **queda
flagueado**: nadie miró píxeles.

**No se observó el sitio con reduced-motion activado a nivel sistema.** No es
posible togglear la preferencia del SO desde esta sesión, y no correspondía cambiar
la configuración de la máquina de Franco. En su lugar se inyectaron las **mismas
declaraciones** sin el envoltorio `@media` y se midió el efecto real (tabla arriba):
los contadores caen a 0 y se restauran al quitar el bloque. Lo único no verificado
en vivo es el `@media` en sí, que está confirmado presente en el CSS emitido.
**Confirmación pendiente de Franco** con la preferencia prendida de verdad.

**No se tocaron `tailwind.config.ts` ni `src/lib/design-tokens.ts`.** Confirmado que
están desconectados del pipeline: `globals.css` no tiene directiva `@config`, y
Tailwind 4 es CSS-first. Se eliminan en el bloque final, no acá.

**No se neutralizó el scroll suave de Lenis** bajo reduced-motion. Es JS
(`SmoothScroll.tsx`) y no se alcanza desde CSS; tocarlo era salir del scope de S1
("un objetivo: los tokens"). Queda para un bloque posterior.

**No se limpiaron los tokens viejos** (`--color-void`, `--color-obsidian`,
`--color-accent`, `[data-theme='*']`). El sitio los consume vivos; se limpian en el
bloque final, como indica el sprint.

### Hallazgos fuera de scope

1. **`SectionTransition.tsx` es código muerto.** Cero consumidores (`grep` en todo
   `src/`). Importa relevar esto: es uno de los cuatro llamadores de
   `useThemeSection`, así que los disparadores de tema **vivos** son solo dos —
   `About.tsx` (×2, `'light'`) y `WhyDevelOP.tsx` (`'dark'`). Confirma exactamente el
   riesgo que anticipa S2: los dos mueren en el rediseño y el tema quedaría congelado
   en `light` (el estado inicial de `ThemeProvider`) sin ningún error de build.

2. **El launcher del chat está en `opacity: 0` en modo normal.** Un `<div>` de 56×56
   directo bajo `<body>`, con `animation: chatbotLauncherReveal .9s both` en
   `playState: running` de forma perpetua y una `CSSTransition` de Framer Motion
   encima, también `running`. Detectado en el home, sin nada inyectado y con
   `prefers-reduced-motion: false` — o sea **ajeno a este sprint** (el bloque nuevo
   está inerte). Vive en `src/modules/chatbot/components/LogicCompanion.tsx:199`. No
   se tocó: está fuera del scope de B1 y fuera del sitio público propiamente dicho.

3. **`next.config.ts` tiene `typescript.ignoreBuildErrors: true` y
   `eslint.ignoreDuringBuilds: true`.** `npm run build` verde **no** implica tipos
   verdes. Por eso `tsc --noEmit` se corre aparte en cada sprint de este bloque.
   Además Next 16.2.9 ya avisa que la clave `eslint` del config no está soportada.

### Qué necesita decidir Franco

Nada bloqueante para S2 ni S3. Lo que se acumula para el **Gate 1** (al cierre de
S3), desde este sprint:

1. **Permutación de acentos.** El código y `CLAUDE.md` asignan **los mismos cuatro
   hex** a servicios distintos. S1 dejó los valores del código; el styleguide de S3
   va a mostrar las dos opciones lado a lado.
2. **Confirmar el comportamiento con reduced-motion prendido** en su máquina (ver
   arriba).
3. **Revisar los valores de los tokens con ojo propio** — nadie vio píxeles en este
   sprint.

---

## B1-S2 — Componentes base · 2026-07-30

Commit: `feat(design-system): componentes base del sistema visual`

Archivos nuevos en `src/components/design-system/` — 457 líneas en total, ninguno
pasa de 79:

| Archivo | Qué es |
|---|---|
| `SectionShell.tsx` | Wrapper de sección, dueño del theming (79 líneas) |
| `Eyebrow.tsx` | Kicker mono/uppercase, prop `accent` |
| `ChapterLabel.tsx` | Label editorial `( 01 — LA PRUEBA )` |
| `DisplayHeading.tsx` | Titular display, `size` xl/lg, `as` h1/h2, `text-balance` |
| `Lead.tsx` | Subhead, corta a 55ch |
| `CtaButton.tsx` | CTA sobre `ui/Button`, `tone` primary/secondary, flecha |
| `Surface.tsx` | Panel plano, prop `padding`, sin relieve |
| `DataStat.tsx` | Valor mono + label, prop `accent` en el valor |
| `MonoLabel.tsx` | Etiqueta chica mono con tick de color opcional |
| `RuleDivider.tsx` | Regla de 1px con el color de borde del tema |
| `accent.ts` | Tipo `ServiceAccent` + mapas de clase literales |
| `index.ts` | Barrel |

Archivos existentes tocados — **tres, todos de forma aditiva**:
`src/app/globals.css` (+61), `src/components/ui/Button.tsx` (+27/−2),
`src/hooks/useThemeObserver.tsx` (+23).

### Qué se hizo

**1. `CtaButton` se construyó SOBRE `ui/Button`, extendiéndolo.** Se agregaron dos
variantes (`ds-primary`, `ds-secondary`) y un tamaño (`ds`) a los objetos que ya
tenía, y se ensancharon las dos uniones de tipo. Las cuatro variantes y los tres
tamaños existentes quedaron **byte a byte iguales**, igual que `baseClasses`.

El primario hace la inversión monocroma (`bg-ds-fg text-ds-canvas`), con canto
superior iluminado (`border-t border-t-ds-control-edge`), `--shadow-ds-control` de
2 capas, `--radius-ds-control`, `active` que hunde 2px y apaga la sombra, y
`focus-visible` con outline de 2px en el color de texto del tema. El secundario es
transparente con borde de 1px y plano — sin relieve, para no competir con el
primario. Ninguno anima `scale` en hover ni `letterSpacing`.

**2. Capa semántica de tokens + inversión por sección.** Cinco tokens de rol
(`--color-ds-canvas`, `--color-ds-panel`, `--color-ds-fg`, `--color-ds-fg-muted`,
`--color-ds-rule`) más `--color-ds-control-edge`, y dos scopes
`[data-ds-theme='dark'|'light']` que los reapuntan. También
`--container-ds-lead: 55ch` y `--text-ds-control: 1rem`.

**3. `useThemeSectionOptional`**, agregado a `useThemeObserver.tsx` sin tocar
`useTheme` ni `useThemeSection`.

### Decisiones tomadas (y por qué)

**Extender `Button.tsx` en vez de envolverlo — con medición, no por gusto.** El
sprint pedía construir sobre `Button` "extendiéndolo o envolviéndolo", y envolver
es menos invasivo, así que se probó eso primero. Se midió `twMerge` (el motor de
`cn()`) contra los tokens del sistema:

    'rounded-2xl' + 'rounded-ds-control'  =>  rounded-2xl rounded-ds-control    NO colapsa
    'text-sm px-5' + 'text-ds-control px-7'  =>  text-sm px-7 text-ds-control   NO colapsa
    'bg-cyan-400 text-zinc-950' + 'bg-ds-fg text-ds-canvas'  =>  bg-ds-fg text-ds-canvas    sí
    'border border-white/10' + 'border border-ds-rule'       =>  border border-ds-rule      sí
    'transition-colors' + 'transition-[translate,...]'        =>  transition-[translate,…]   sí

`twMerge` no reconoce `rounded-ds-control` como border-radius ni `text-ds-control`
como font-size (lo lee como color), así que envolver habría dejado el radio y el
tamaño de fuente decididos por el orden del CSS emitido — frágil y silencioso. Los
colores sí colapsan bien. Con esa evidencia, extender es el camino que el sprint
habilita explícitamente para este caso.

**El `active` hundido convive con `buttonPress` en vez de pelearse.** Tailwind 4
implementa `translate-y-*` con la propiedad CSS `translate`, no con `transform`
(verificado en el CSS emitido:
`.active\:translate-y-\[2px\]:active{--tw-translate-y:2px;translate:…}`). Framer
Motion escribe `transform`. Son propiedades distintas: **componen**. El botón baja
2px Y escala 0.97 al apretarlo, en vez de que una sobrescriba a la otra.

**`SectionShell` con tema LOCAL, no global.** Escribe `data-ds-theme` en su propio
`<section>` y los scopes de `globals.css` reapuntan ahí la capa semántica.
Consecuencias: funciona anidado (una sección oscura dentro de una crema), funciona
sin ningún provider montado, y ningún componente hijo necesita recibir el tema por
prop. Además dispara la inversión global del `<body>` vía
`useThemeSectionOptional` cuando entra en la banda central del viewport
(`margin: '-45% 0px -45% 0px'` — con márgenes más flojos dos secciones contiguas se
pelean el tema en el borde del scroll).

**Mecanismo de theming elegido — reporte pedido por el sprint.** Cómo funciona
hoy: `ThemeProvider` (montado en `app/page.tsx`) guarda el tema en estado y un
`useEffect` escribe `data-theme` en el `<html>`; los scopes `[data-theme='…']` de
`globals.css` reapuntan `--color-void` / `--color-obsidian` / `--color-accent`, y
`body` los consume. `useThemeSection(isInView, tema)` llama a `setTheme` cuando una
sección entra en viewport. **Llamadores vivos: solo dos** — `About.tsx` (×2,
`'light'`) y `WhyDevelOP.tsx` (`'dark'`). El tercero, `SectionTransition.tsx`, tiene
cero consumidores.

Se eligió **no reemplazar** ese sistema sino sumarse a él: `SectionShell` maneja sus
propios colores localmente (capa nueva, `data-ds-theme`) y además le avisa al
sistema viejo para que el `<body>` acompañe. Los dos conviven sin pisarse: son
atributos distintos sobre elementos distintos (`data-theme` en `<html>`,
`data-ds-theme` en cada `<section>`). Así el rediseño puede avanzar sección por
sección sin un corte global, y cuando About y WhyDevelOP mueran el tema no queda
congelado en claro.

**Se usó `useThemeSectionOptional` y no `useThemeSection`** porque el segundo llama
a `useTheme()`, que **tira** si no hay `ThemeProvider` arriba — y `SectionShell`
tiene que poder renderizar fuera del árbol del home. El hook nuevo lee el contexto
con `useContext` y no hace nada si está `undefined`.

### Qué se midió

| Chequeo | Resultado |
|---|---|
| `npm run build` | ✅ verde (exit 0) |
| `npx tsc --noEmit` | ✅ 0 errores |
| `npx eslint` sobre los 12 nuevos + los 3 tocados | ✅ 0 problemas |
| `git diff` de `Button.tsx` | ✅ 27 inserciones / 2 borrados, y los 2 borrados son las dos líneas de unión de tipo **ensanchadas**. Cero líneas de runtime modificadas |
| Diff del **CSS compilado** vs `main` | ✅ 53 fragmentos nuevos, **cero removidos, cero alterados, cero reordenados** |
| Utilities del sistema emitidas | ✅ las esperadas, más `outline-2`, `outline-offset-2`, `outline-ds-fg`, `motion-reduce:transition-none`, `tabular-nums`, `text-balance` |
| `--radius-ds-surface` → radio real | ✅ `.rounded-ds-surface{border-radius:var(--radius-ds-surface)}` = 0 |
| Ningún `any`, ningún archivo > 300 líneas | ✅ el más largo es `SectionShell.tsx`, 79 |

**Sobre los consumidores de `Button`: son 19, no 14.** El sprint decía 14; el conteo
real de archivos que importan `Button` en `src/` es 19 (`variant`: secondary ×21,
ghost ×19, primary ×3, danger ×3; `size`: sm ×31, md ×1). No cambia nada del plan,
pero el número del sprint estaba corto.

Los 19 quedan probados intactos por dos vías independientes: (a) el diff muestra que
ninguna clave existente de `variantClasses` / `sizeClasses` ni `baseClasses` se tocó
— es lookup por clave en un objeto, agregar claves no puede alterar el resultado de
las que ya estaban; (b) el diff del CSS compilado confirma que agregar utilities
nuevas **no** reordenó ni removió ninguna regla existente, que era el único riesgo
indirecto real (un cambio de orden puede invertir quién gana en un conflicto de
utilities preexistente). No hizo falta revertir la extensión ni caer al plan B de
envolver.

### Qué NO se hizo, y por qué

**El chequeo de teclado (`Tab` sobre `CtaButton` mostrando `focus-visible`) se corre
en S3, no acá.** Es una contradicción del propio sprint: S2 manda que los
componentes "no se usan todavía en ninguna sección del sitio — solo se construyen y
se muestran en el styleguide (S3)", y a la vez pide tabular sobre un componente que
en S2 no está renderizado en ninguna ruta. Se verificó lo que sí es verificable sin
consumidor: que las tres reglas de `focus-visible` (`outline-2`,
`outline-offset-2`, `outline-ds-fg`) están emitidas en el CSS. La prueba de teclado
real va en la entrada de S3.

**`CtaButton` no navega.** Es un `<button>`. En el sitio público la navegación va por
`triggerTransition()` del `TransitionContext` (archivo frozen), y cablearla es
trabajo de B2 — la tabla de componentes del sprint no pide `href`. Hoy acepta
`onClick` como cualquier `Button`.

**La flecha es el icono, no el copy.** El copy del sprint trae la flecha en el string
(«Escribinos por WhatsApp →»). `CtaButton` la renderiza como `<ArrowRight>` de
Lucide (`strokeWidth={1.5}`, `aria-hidden`), así que el styleguide pasa el texto
**sin** el `→` literal para no duplicarla. Si Franco prefiere el carácter en el copy,
se apaga con `withArrow={false}`.

**No se creó ningún componente fuera de la tabla del sprint**, ni se usó ninguno en
secciones reales del sitio.

### Hallazgos fuera de scope

1. **`--shadow-ds-control` es un valor único para los dos temas.** Sus dos capas son
   negras (`rgba(0,0,0,.9)` / `rgba(0,0,0,.5)`), pensadas contra el fondo oscuro. En
   una sección crema el botón primario es casi negro y esa sombra negra funciona como
   canto duro, que es la intención del relieve — pero es más pesada que en oscuro. Se
   dejó el valor del sprint tal cual: inventar un segundo valor era reinterpretar la
   dirección. **Vale mirarlo en el Gate 1.**

2. **`SectionTransition.tsx` sigue muerto** (ya reportado en S1). No se borró: la
   limpieza es del bloque final.

### Qué necesita decidir Franco

Nada bloqueante para S3. Se suma al Gate 1:

1. **La sombra del control en tema crema** (punto 1 de arriba).
2. **La flecha: icono o carácter en el copy** (`withArrow`).

---

## B1-S3 — Styleguide · 2026-07-30 · CIERRE DEL BLOQUE B1

Commit: `feat(design-system): styleguide con las 6 secciones y opciones para Gate 1`

**La ejecución autónoma termina acá.** El repo queda en `redesign/home`, sin
mergear. Lo que sigue necesita el Gate 1.

### Qué se hizo

`/styleguide` en `src/app/styleguide/` — 10 archivos, 1.176 líneas, el más largo
202 (`ComponentStates.tsx`). `noindex, nofollow, nocache` por metadata, verificado
en el HTML servido. Cinco bloques más el esqueleto del home:

| Bloque | Qué muestra |
|---|---|
| 01 Paleta | Los 16 tokens de color en swatches. Cada swatch **lee su propio valor del DOM** con `getComputedStyle`, así que no puede desincronizarse de `globals.css`. La capa semántica va dos veces, montada en dark y en crema, para ver la inversión sobre el mismo componente |
| 02 Acentos | Las **dos permutaciones** lado a lado, cada una en uso real: asignación desnuda, `MonoLabel` con tick, `DataStat` acentuado y las cuatro filas de servicio |
| 03 Tipografía | La escala completa con copy real del home, más **Geist vs Space Grotesk** en el mismo titular. Más un aviso y un tercer especimen: lo que el sitio renderiza HOY (ver hallazgo 1) |
| 04 Componentes | Los 10 de S2. Los interactivos van dos veces: vivos y con el estado forzado, para comparar normal/hover/active/focus-visible/disabled de un vistazo. También `loading` y las 4 variantes de `padding` de `Surface` |
| 05 Las 6 secciones | Esqueleto a ancho completo, con la arquitectura de temas y el copy real. La lámina de producto va dentro de S3 |

**Las dos permutaciones sin un solo hex hardcodeado.** Cada opción se expresa como
"a este servicio le toca el token de aquel otro" (`Record<ServiceAccent,
ServiceAccent>`), así que el styleguide sigue consumiendo los tokens del sistema.
Cyan queda en web development en las dos; los otros tres rotan.

**La fuente de prueba se carga solo en esta página.** `Space_Grotesk` se declara
en `_components/TypographyBlock.tsx`, no en `app/layout.tsx`: en el App Router
`next/font` preloadea por ruta. Si se descarta, se borra el archivo y no queda
nada colgado.

**La lámina de producto es CSS puro.** Marco con canto superior iluminado y sombra
corta de dos capas (el mismo relieve del control primario), chrome de dispositivo,
sidebar y cuerpo en wireframe de barras neutras, y un cartel
`[CAPTURA DEL PANEL — PENDIENTE DE FRANCO]`. Sin imágenes externas, sin blur, y
**sin ninguna cifra**: es el encuadre, no una captura falsa.

### Dos bugs encontrados y corregidos

Los dos aparecieron **midiendo el DOM**, no leyendo el código: el build, `tsc` y
`eslint` estaban verdes con los dos adentro.

**Bug 1 — `twMerge` borraba media escala tipográfica.** `tailwind-merge` no puede
saber si `text-<nombre-custom>` es un tamaño o un color: los dos utilities se
escriben igual. Los clasificaba en el mismo grupo y **descartaba uno**. Medido en
runtime, antes del fix:

| Componente | Clase que desaparecía | Efecto real |
|---|---|---|
| `CtaButton` primario | `text-ds-canvas` | `color` = `rgb(237,233,225)`, **el mismo que su fondo** — texto invisible |
| `Eyebrow` | `text-ds-eyebrow` | 16px sans sin tracking, en vez de 12px con .18em |
| `MonoLabel` / `ChapterLabel` | `text-ds-eyebrow` | idem |
| `Lead` | `text-ds-lead` | 16px en vez de `clamp(1.125rem…)` |
| `DataStat` | `text-ds-data` | perdía la escala de dato |
| `DisplayHeading` | `text-ds-fg` | tapado por herencia, no se veía |

Arreglado en la raíz: `cn()` ahora usa `extendTailwindMerge` declarando los siete
tokens `--text-ds-*` como grupo `font-size`. **Regresión medida sobre 5.615 strings
de `className` reales del repo** (excluyendo el sistema nuevo), sueltos y en pares
base+override: **0 diferencias** contra el `twMerge` por defecto. Extender el
config solo agrega nombres que reconocer.

**Bug 2 — los componentes no renderizaban Geist.** Consecuencia del hallazgo 1 de
abajo. Arreglado con un alias del sistema (`--font-ds-sans` / `--font-ds-mono`)
declarado en un scope `[data-ds-theme]`, que está **debajo del `<body>`** — que es
donde `next/font` deja las variables. Verificado en runtime: `Geist` y
`Geist Mono` resuelven. Los componentes pasaron de `font-sans`/`font-mono` a
`font-ds-sans`/`font-ds-mono`, y `SectionShell` fija la familia base para que el
texto de cuerpo la herede. **No se tocó `--font-sans` ni `--font-mono`**: eso
cambiaría la tipografía de todo el sitio.

### Qué se midió

| Chequeo | Resultado |
|---|---|
| `npm run build` | ✅ verde. `/styleguide` prerenderizada como estática (`○`) |
| `npx tsc --noEmit` | ✅ 0 errores |
| `npx eslint` sobre `src/app/styleguide/`, `design-system/`, `lib/utils.ts` | ✅ 0 problemas |
| `/styleguide` responde | ✅ HTTP 200 |
| `noindex` | ✅ `<meta name="robots" content="noindex, nofollow, nocache"/>` en el HTML servido |
| Sin links entrantes | ✅ `grep` de "styleguide" en todo `src/`, `public/`, `netlify/` y configs: solo 3 menciones, las tres en comentarios. Ningún `<Link>`, ningún `href`, ninguna entrada de navegación |
| Fuera del sitemap | ✅ **no existe ningún sitemap ni robots** en el repo (`sitemap.ts`, `robots.ts`, `public/sitemap.xml`, `public/robots.txt`: ninguno). No se creó ninguno — está fuera de scope |
| 1440×900 | ✅ sin overflow horizontal, 1 solo `<h1>`, las 43 superficies con radio `0px` |
| 390×844 | ✅ **0 elementos desbordando** el viewport. display-xl baja a 52px, lead a 18px, eyebrow 12px, CTA de 50px de alto (target táctil cómodo). Los grids colapsan a 1–2 columnas |
| Inversión de tema | ✅ S1 `#0d0b09` · S2 `#f2eee6` · S3 `#0d0b09` · S4 `#0d0b09` · S5 `#f2eee6` · S6 `#0d0b09` — exactamente la arquitectura pedida, y los tokens semánticos se reapuntan dentro de cada scope |
| **Teclado (diferido de S2)** | ✅ `Tab` cae en el `CtaButton`, `:focus-visible` matchea, outline `2px solid rgb(237,233,225)` con offset 2px. En el mismo elemento: radio 9px, canto superior `rgba(255,255,255,.85)`, y la sombra de dos capas exacta del token |
| Glassmorphism | ✅ 3 elementos con `backdrop-filter` en la página, los 3 del chrome del sitio actual (Navbar, launcher del chat, un panel flotante). **Ninguno dentro del `<main>` del styleguide** |
| Errores de consola | ✅ ninguno, en `/styleguide` y en las 5 páginas públicas |
| Diff del CSS compilado vs `main` | ✅ 101 fragmentos nuevos, **cero removidos, cero alterados, cero reordenados**. `--font-sans` y `--font-mono` del `@theme` original quedan idénticos |
| Home + 4 landings tras los cambios | ✅ conteos de elementos y visibles iguales a la medición de S1, sin overflow, tokens viejos intactos, y `[data-ds-theme]` = **0** en todas: el scope del sistema no se filtra al sitio |

### Qué NO se hizo, y por qué

**Sigue sin haber capturas de pantalla.** El pane del browser no se despliega en
esta sesión sin supervisión, así que la página no compone frames y `screenshot`
falla por timeout. Todo lo visual se verificó midiendo el DOM: colores computados,
tamaños de fuente resueltos, tracking, familias reales, radios, geometría de
overflow y estado de foco. Eso es lo que encontró los dos bugs — pero **nadie miró
píxeles en todo el bloque B1**. Es la limitación más importante de este cierre.

**El aviso tipográfico y los `[PENDIENTE]` quedaron a la vista** en la página. No
se limpiaron: son el punto.

**No se creó sitemap ni robots.txt** aunque no existen. Está fuera de scope (era
tarea de B0.5, que no está mergeado).

**No se sacó el chrome del sitio de `/styleguide`.** El Navbar y el launcher del
chat se renderizan encima, porque `/styleguide` no es ruta de portal. Agregarla a
`PORTAL_PREFIXES` era tocar un archivo compartido por una comodidad. El intro del
Preloader **no** corre ahí (verificado: no está en `MARKETING_ROUTES` y no es `/`).

**`CtaButton` sigue sin navegar** y las secciones del esqueleto no tienen motion
ni 3D. Es maqueta de estructura y jerarquía; el cableado es de B2.

**La numeración de capítulos del sprint va 01 → 03**, sin 02 (S2 es `( 01 )` y S3
es `( 03 )`). Se reprodujo tal cual está escrito, sin "arreglarlo". Ver decisión 4.

### Hallazgos fuera de scope

1. **El sitio público no está renderizando Geist. Ninguna página.** El `@theme`
   declara `--font-sans: var(--font-geist-sans)` en `:root`, pero `next/font` deja
   `--font-geist-sans` en una clase del `<body>`. Un custom property se resuelve en
   el elemento donde se declara: en `:root` la variable no existe, el valor queda
   **inválido**, y ese valor inválido es el que heredan todos los descendientes —
   incluso los que sí tienen `--font-geist-sans` definido. Resultado: `font-sans` y
   `font-mono` no aplican nada y todo cae en la fuente de interfaz del sistema
   operativo (Segoe UI en Windows). Verificado en runtime (`--font-sans` resuelve
   vacío) y en el CSS compilado de `main` — **es pre-existente e idéntico en
   `main`**, no lo introdujo este bloque. No se arregló porque cambia la tipografía
   de todo el sitio de golpe, lo cual no es una decisión de B1. El styleguide lo
   avisa y muestra el especimen para que se vea.

2. **El launcher del chat está en `opacity: 0` en modo normal** (ya reportado en
   S1). `src/modules/chatbot/components/LogicCompanion.tsx:199`.

3. **`SectionTransition.tsx` es código muerto** (S1). Se borra en el bloque final.

4. **La numeración de capítulos del sprint salta el 02.** Puede ser deliberado (hay
   6 secciones y solo algunas llevan capítulo) o un typo del documento.

5. **`next.config.ts` ignora tipos y lint en el build**, y Next 16.2.9 ya avisa que
   la clave `eslint` no está soportada.

6. **El documento de sprint `docs/sprints/sprint-b1-sistema-diseno.md` no existe**
   en el repo (ver la nota de arranque arriba).

---

## GATE 1 — lo que Franco tiene que decidir

Ordenado por lo que bloquea a B2.

### Bloquean B2

1. **Permutación de acentos.** `/styleguide#acentos`. Los mismos cuatro hex, dos
   repartos. Hoy los tokens tienen la **A**. Cambiar a B es editar cuatro hex en
   `globals.css`; ningún componente se toca.
   - **A (código actual):** web = cyan `#06b6d4` · ia = verde `#10b981` · automation = ámbar `#f59e0b` · software = violeta `#8b5cf6`
   - **B (CLAUDE.md):** web = cyan `#06b6d4` · ia = violeta `#8b5cf6` · automation = verde `#10b981` · software = ámbar `#f59e0b`

2. **Familia del display.** `/styleguide#tipografia`. Geist (ya cargada) o Space
   Grotesk (de prueba, solo en esa página). Space Grotesk la eligió el ejecutor:
   el sprint pedía "una grotesca con más carácter" sin nombrar ninguna. Cambiarla
   por otra es un `import` de una línea.

3. **El bug de Geist (hallazgo 1).** Esta decisión está **antes** que la 2: si
   `font-sans` no aplica, la comparación de familias se hace sobre un sitio que hoy
   muestra Segoe UI. Tres caminos: arreglarlo en el bloque final del rediseño,
   arreglarlo ya como sprint aparte, o dejarlo y decidir la tipografía sabiendo que
   el sitio actual no la usa.

### No bloquean, pero conviene resolverlas en el mismo Gate

4. **Sombra del control en tema crema.** `--shadow-ds-control` es un valor único
   para los dos temas y sus dos capas son negras. En crema el botón primario es
   casi negro y la sombra funciona como canto duro — la intención del relieve —
   pero pesa más que en oscuro. Se dejó el valor del sprint sin inventar un segundo.

5. **La flecha del CTA: icono o carácter.** El copy trae «… WhatsApp →».
   `CtaButton` la pinta como `<ArrowRight>` de Lucide y el styleguide pasa el texto
   sin el `→`. Se apaga con `withArrow={false}`.

6. **Numeración de capítulos** (hallazgo 4): ¿el salto 01 → 03 es a propósito?

7. **Los contrastes de S5 y las bios.** Están en placeholder porque el sprint no
   los define. Dato útil: `WhyDevelOP.tsx` ya tiene material — cuatro cards
   (Velocidad Absoluta, Cero Costos Ocultos, Soporte Directo, Propiedad Total) y un
   bloque "AGENCIAS TRADICIONALES / 76 DÍAS". **No se importó**: son cuatro y no
   tres, no están escritas como contrastes, y el "76" es una cifra sin verificar —
   justo del tipo que B0.5 está sacando del sitio.

8. **Mirar la página con ojos propios.** Nadie vio píxeles en todo B1 (ver arriba).
   Antes de aprobar el styleguide conviene abrir `/styleguide` en el navegador, a
   1440 y a 390.

### Cómo verla

```
cd logic-core-v3
npm install
npm run start:qa      # buildea y sirve en :3001
# luego http://127.0.0.1:3001/styleguide
```

---

## CONSOLIDACIÓN — las tres ramas hacia `redesign/home` · 2026-07-30

Decisión de Franco: **cero merges a `main` hasta el final del rediseño**. Producción
se queda como está y la decisión se toma con el trabajo terminado a la vista. Para
que las tres ramas paralelas no diverjan hasta volverse un merge caro, se unen acá:
`redesign/home` pasa a ser **la rama única del proyecto**.

### Qué se unió

| Rama | Qué traía |
|------|-----------|
| `fix/home-sanidad` | B0 + B0-bis: copy del home, `lang`, meta, HDRI self-hosteado, three fuera del bundle inicial (−42,8% de JS inicial) |
| `fix/fonts-geist-scope` | las variables de `next/font` movidas al scope correcto |
| `redesign/home` (base) | B1: tokens, componentes del sistema de diseño, `/styleguide` |

### Conflicto 1 — `Hero.tsx` (merge de `fix/home-sanidad`)

**Los dos lados.** `main` había agregado el FIX-GHOST-BOX (gate del `EffectComposer`
hasta el primer sizing real del canvas, para no pintar el cuadrado oscuro 300×150
durante la ventana de montaje) **dentro** del `HeroCanvas` inline de `Hero.tsx`.
`fix/home-sanidad`, en paralelo, extrajo ese mismo bloque a un `HeroCanvas.tsx`
propio para sacar three/fiber/drei/postprocessing del bundle inicial — pero partió
de la versión **previa** al fix. Git no lo vio como un conflicto de una línea: vio
400 líneas movidas contra 40 líneas cambiadas.

**Cómo se resolvió, conservando los dos.** `Hero.tsx` queda con la extracción (sin
un solo import de three, `HeroCanvas` por `next/dynamic ssr:false`) y el
FIX-GHOST-BOX se **portó** al nuevo `HeroCanvas.tsx`: `onSized` en
`HeroCanvasSizeSync` con guard de una sola vez (`sizedRef`), `postFxReady` gateando
el `EffectComposer`, y el dep array actualizado con `onSized`.

**Verificado:** el delta aplicado a `HeroCanvas.tsx` es línea por línea el mismo que
`main` había aplicado a `Hero.tsx`. Nada del fix se perdió y nada de la extracción
se revirtió.

### Conflicto 2 — `layout.tsx` (merge de `fix/fonts-geist-scope`)

**Los dos lados.** Mismo elemento `<html>`. `fix/home-sanidad` había cambiado
`lang="en"` → `lang="es"`; `fix/fonts-geist-scope` movió el `className` con las
variables de Geist del `<body>` al `<html>` (y dejó el porqué comentado).

**Cómo se resolvió, por unión.** El `<html>` queda con `lang="es"` **y** el
`className` con las dos variables **y** `suppressHydrationWarning` **y** los dos
comentarios (el del scroll-lock y el del scope de las variables). El `<body>` queda
solo con `antialiased`. Se conservan también, del mismo merge, el `alternates.canonical`
y la meta description sin el claim `+47`.

### El workaround de fuentes de B1, colapsado

B1 había duplicado `--font-ds-sans` / `--font-ds-mono` en un bloque
`[data-ds-theme]` de `globals.css` — existía **solo** para esquivar el bug de scope:
las variables vivían en el `<body>`, más abajo que `:root`, así que la declaración
del `@theme` quedaba inválida. Con el arreglo adentro, `next/font` deja las
variables en el `<html>` = el mismo elemento donde Tailwind emite `@theme`, y esa
segunda copia pasó a ser redundante. Se quitó: **una sola fuente de verdad, la del
`@theme`**.

Verificado después de quitarlo, en `/styleguide`: los 25 elementos `font-ds-sans`
resuelven `Geist, "Geist Fallback"` y los 200 `font-ds-mono` resuelven
`"Geist Mono", "Geist Mono Fallback"`. Ningún componente del sistema de diseño
perdió la fuente. No hizo falta revertir.

### Verificación de la consolidación

| Chequeo | Resultado |
|---|---|
| `npm install` (no `npm ci`) | ok |
| `npm run build` | ✅ exit 0 |
| `npx tsc --noEmit` | ✅ 0 errores |
| `getComputedStyle(document.body).fontFamily` en `/` | `Geist, "Geist Fallback"` |
| ídem en `/styleguide` | `Geist, "Geist Fallback"` |
| elemento `font-mono` | `"Geist Mono", "Geist Mono Fallback"` |
| `--font-ds-sans` leída en `:root` (sin el workaround) | `"Geist","Geist Fallback"` |
| mojibake en archivos del home | cero (los 8 casos vivos son de landings → B0.5 T4) |
| chunks de three en el documento inicial del home | cero de 23 scripts |
| `/styleguide` | 200 |
| errores de consola en `/` y `/styleguide` | cero |

**Nota sobre el hero 3D.** No se pudo verificar visualmente: el pane del navegador
no estaba compositando (`document.hidden === true`, **0 frames de rAF en 1 segundo**),
así que la coreografía del intro nunca arrancó y el canvas quedó en el default
300×150 de R3F. Esa medición es **nula**, no un hallazgo — el `<section>` del hero
sí mide 1280×720. El port del FIX-GHOST-BOX se verificó estáticamente (delta
idéntico al de `main`). **Queda para la verificación humana de Franco en el deploy
preview.**

### Efecto sobre el Gate 1

La **decisión 3 del Gate 1** ("el bug de Geist") queda **resuelta**: `font-sans` y
`font-mono` ahora sí aplican Geist en todo el sitio. La decisión 2 (familia del
display: Geist vs Space Grotesk) deja de estar viciada — la comparación ya se hace
contra el sitio mostrando su tipografía real y no Segoe UI. Las decisiones 1 y 4-8
siguen abiertas.

### Los dos que las tres ramas siguen sin conocer

- `fix/motion-sanidad-mobile` existe y **ya ejecutó B0.6 completo**. Ver la entrada
  de la Fase 3.
- `main` no recibe nada de esto. Sigue siendo lo que hay en producción.

---

## B0.5 — Sanidad del sitio público + SEO base · 2026-07-30

Ejecutado sobre `redesign/home` (no sobre la rama `fix/site-sanidad` que nombra el
sprint: acá todo va a la rama única). Su precondición de "B0 y B0-bis mergeados a
main" se ignoró a propósito — están adentro de esta rama por la consolidación.

### T1 — El claim «+47»: hecho

Los dos casos. En `VaultIA.tsx:184` era un `<p>` plano → texto directo. En
`RubrosIA.tsx:318` la estructura era «destacado + resto»
(`<strong>+47 negocios</strong> ya automatizados en Tucuman`), así que se respetó:
`<strong>Automatizaciones</strong> funcionando en negocios del NOA`. Concatenado
da exactamente el reemplazo especificado. `grep -rn "+47" src/` → **0**.

### T2 — Preguntas sin «¿»: 53 aperturas en 52 líneas

`audit/copy-preguntas-sin-apertura.txt` ya no existe, así que se regeneró el
listado con un barrido propio. Primer intento: 1.964 falsos positivos, porque el
regex confundía ternarios (`x > 0 ? 'red' : 'zinc'`). Afinado a «el signo cierra
el texto» (pegado a comilla, a `<` o a fin de línea) y acotado al sitio público:
**53 candidatos reales, cero ternarios**.

Aplicadas 53 aperturas en 52 líneas, 10 archivos. Una línea llevó dos
(`WebDevelopmentFaq.tsx:49` — «¿Qué pasa después de la entrega? ¿Me dejan solo?»).
Se aprovechó para acentuar el interrogativo de cada una (Que→Qué, Cuanto→Cuánto,
Como→Cómo) y pasar a voseo donde correspondía (Tenes→Tenés, Queres→Querés).

**Dos falsos positivos, no tocados** — ya tenían el signo de apertura en la línea
anterior del mismo bloque JSX:

- `sections/ROICalculator.tsx:180` — la apertura está en la 178.
- `sections/home/Footer.tsx:251` — la apertura está en la 239.

### T3 — Tildes: 266 palabras, 22 líneas de tilde sobrante, 13 casos puntuales

`audit/copy-tildes.txt` tampoco existe. Regenerado.

**El conteo real es muy superior al que reportó la auditoría (36).** Se aplicaron
**266 palabras en 190 líneas**. Se hizo con un diccionario que excluye a propósito
toda palabra ambigua — si, que, como, esta, estas, tu, solo, donde, cuanto,
practica, valido, titulo, publica — y que solo entra al interior de literales de
string y a líneas de texto JSX puro: nunca identificadores, keys sin comillas,
imports, comentarios ni clases CSS.

**La tilde SOBRANTE no era un caso, era un patrón.** El sprint señalaba
`WebDevelopmentTimeline.tsx:66`. Al abrirlo apareció que las **cuatro** componentes
de la landing de web-development escriben «qué» y «cuándo» como relativo o
conjunción: «Una web qué no convierte», «para qué cada clic se sienta inmediato»,
«incluso cuándo el salón está cerrado». **22 líneas corregidas.** Se conservaron
los 25 «por qué» y todos los interrogativos indirectos legítimos de las otras
landings, verificados uno por uno: `ProcesoAutomation.tsx:78` («sepa qué hacer»),
`PipelineSoftware.tsx:458`, `IntegracionesAutomation.tsx:588`,
`ProcesoSoftware.tsx:49` y `:207`, `Footer.tsx:271` y `:670`,
`PortalDemoHeader.tsx:39-40`.

**Los cuatro casos puntuales que nombra el sprint:**

- `GarantiaIA.tsx` tuteo → voseo: definis→definís, ensenas→enseñás.
- `contact/page.tsx:208`: «Contanos brevemente que necesitas...» → «Contanos
  brevemente qué necesitás...» (tuteo + interrogativo indirecto).
- `contact/page.tsx:275`: «Elegí como hablar» → «Elegí cómo hablar».
- `WebDevelopmentTimeline.tsx:66`: la tilde sobrante, más solida→sólida.

`grep -rn "Tucuman" src/` → **0**, incluidos comentarios y keys.

### T4 — Higiene: hecho

Los 3 `.bak` borrados, verificado antes que ninguno estuviera importado (0
referencias). Los 8 mojibake de comentarios corregidos.

**Un tropiezo propio, corregido.** La reparación se hizo re-decodificando
latin1 → utf8, que es exacta para «Ã³»→«ó» pero **rompe** los caracteres de dibujo
de caja: `HeroAutomation.tsx:650` tenía doble mojibake y la pasada lo dejó en
U+FFFD. Se reescribió la línea a mano. Barrido de U+FFFD en `src/` → **0**.

### T5 — sitemap.ts y robots.ts: creados

Estructura de rutas verificada, no asumida: `src/app/` tiene el grupo
`(protected)` con **admin, dashboard y setter** adentro, más accept-invite, api,
bienvenida, cambiar-password, contact, embed, forgot-password, login,
reset-password, styleguide y las 4 landings.

`sitemap.ts` — las **6 rutas públicas y nada más**. Home 1.0, las 4 landings 0.8,
contact 0.5. Base `https://develop.com.ar`, el mismo dominio del `metadataBase`
del layout raíz. Verificado sirviendo el build: cero rutas privadas.

`robots.ts` — Allow `/` más 13 Disallow: las tres del grupo `(protected)`, `/api/`,
`/embed/`, las seis rutas de sesión y alta de cuenta, y `/styleguide`.

> **Decisión propia a confirmar:** `/styleguide` no estaba en la lista del sprint
> (es una ruta nueva, la creó B1). Se bloqueó igual: es una página interna del
> rediseño, y dejarla indexable justo mientras se escribe el robots sería un
> agujero evidente. Sacarla es borrar una línea.

### T6 — Mapeo de colores en CLAUDE.md: corregido

Verificado contra dos fuentes independientes antes de tocar el doc:
`globals.css:60-63` y los colores reales de cada landing. `CLAUDE.md` documentaba
mal 3 de los 4. Ahora dice: web → cyan `#06b6d4` · IA → verde/emerald `#10b981` ·
automation → ámbar `#f59e0b` · software → violeta `#8b5cf6`.

> **Cruce con el Gate 1.** La decisión 1 del Gate (permutación de acentos, A vs B)
> sigue siendo de Franco, y T6 acaba de alinear la documentación con **A** (el
> código actual). No la cierra: si Franco elige B, `CLAUDE.md` se vuelve a editar
> junto con los cuatro hex de `globals.css`. Queda anotado para que la decisión no
> se dé por tomada de rebote.

### Verificación

| Chequeo | Resultado |
|---|---|
| `npm run build` | ✅ exit 0, `/robots.txt` y `/sitemap.xml` prerenderizados |
| `npx tsc --noEmit` | ✅ 0 errores |
| grep del claim `+47` en `src/` | 0 |
| grep de mojibake en `src/` | 0 |
| grep de «Tucuman» en `src/` | 0 |
| archivos `.bak` | 0 |
| SSR de las 5 rutas públicas | 200 · mojibake 0 · claim 0 |
| `/robots.txt` y `/sitemap.xml` servidos | contenido correcto, 0 rutas privadas |
| errores de consola en `/web-development` y `/ai-implementations` | 0 |

**`eslint` sobre los 33 archivos tocados: 2 errores, los dos PRE-EXISTENTES.**
`react-hooks/set-state-in-effect` en `app/contact/page.tsx:73` (captura del `?ref`
del querystring) y en `software/DiagnosticoSoftware.tsx:520` (`setMounted(true)`).
Verificado contra `HEAD`: los dos ya estaban, y lo único que B0.5 tocó en esos
archivos son strings de copy. Arreglarlos es refactor de lógica de hooks — fuera
del scope de un sprint de sanidad de copy. **Se reportan, no se tocan.**

### Errores propios que hubo que revertir

Tres, encontrados por `tsc` y por revisión del diff. Vale anotarlos porque son el
riesgo estructural de cualquier pasada masiva sobre copy:

1. **Claves de objeto acentuadas.** `motor-resenas` en `ModuloActiveCard.tsx` y
   `pequeno` en `DiagnosticoSoftware.tsx` no son copy visible: son claves de
   lookup. Revertidas.
2. **Declaraciones de tipo acentuadas.** La heurística de «línea de texto JSX puro»
   no excluía los dos puntos, así que alcanzó a `solución: string` (interface
   `RubroData`) y `decisión: string` (interface `StoryMoment`) más sus 3 keys.
   Revertidas.
3. **Identificador dentro de un template literal.** `OurServices.tsx:4719` — la
   pasada entró al interior de un backtick sin saltear la expresión interpolada.
   Revertido; el label visible «SATISFACCIÓN» de la misma línea sí queda acentuado,
   que es lo correcto.

Regla que deja: sobre copy nunca alcanza con «está dentro de un string». Hay que
distinguir string-de-texto de string-de-clave, y saltear las interpolaciones
dentro de los template literals.

### Fuera de scope, anotado

- `WebDevelopmentByRubro.tsx:15` mantiene la propiedad `solucion` sin tilde en la
  interface `RubroData`, y `portal-demo/data.ts:7` mantiene `decision`. Son
  identificadores, no copy — correcto que sigan así.
- El bloque `metricPills` de `WebDevelopmentBento.tsx:70` y varios headline y
  problema de `WebDevelopmentByRubro.tsx` son copy de venta que quedó gramatical
  pero sigue sonando a borrador. No es asunto de un sprint de sanidad.

---

## B0.6 — Bugs de motion · 2026-07-30

### Cómo se resolvió, y por qué distinto a lo planeado

El sprint pedía ejecutar `docs/sprints/sprint-b06-motion-bugs.md`. **Ese archivo no
existe** — ni en `main`, ni en ninguna rama, ni en disco, ni en la historia
(`git log --all --diff-filter=A` no lo encuentra nunca).

Lo que sí existe es la rama **`fix/motion-sanidad-mobile`** (c54e608, pusheada),
que ya ejecutó B0.6 **completo**: T1 los 11 loops de `WhyDevelOP`, T2 el
`frameloop` del canvas del hero, T3 el `requestAnimationFrame` del marquee, y T4
declarado explícitamente como solo investigación. Con mediciones tomadas.

Consultado con Franco, se decidió **mergearla** en vez de re-implementar: conserva
las mediciones y la historia, y elimina la cuarta rama divergente en lugar de
crear un duplicado que después habría que reconciliar igual.

### Conflicto — `Hero.tsx` (el mismo choque, otra vez)

Idéntico en forma al de la consolidación: `fix/motion-sanidad-mobile` modificó el
`HeroCanvas` **inline** de `Hero.tsx` (agregándole la prop `frameloop`), mientras
que `fix/home-sanidad` lo había extraído a `HeroCanvas.tsx`.

**Resuelto conservando los dos lados**, y el corte cayó justo:

- Lo que T2 le hizo a `Hero()` —`sectionRef`, el estado `isHeroInView`, el
  `IntersectionObserver` con `rootMargin: '120px'`, y los dos
  `frameloop={isHeroInView ? 'always' : 'demand'}` en los dos puntos de montaje—
  **auto-mergeó sin tocar nada**: vive en la parte de `Hero.tsx` que la extracción
  no movió.
- Lo que T2 le hizo al componente `HeroCanvas` —la prop `frameloop` y su paso al
  `<Canvas>`— se **portó a `HeroCanvas.tsx`**, junto al FIX-GHOST-BOX que ya
  vivía ahí desde la consolidación. Los dos fixes conviven en el mismo `<Canvas>`.

`WhyDevelOP.tsx` (T1) auto-mergeó limpio pese a que `fix/home-sanidad` también lo
había tocado. Verificado con un diff contra esa rama: los **únicos** cambios que
introduce el merge son el gateo del `repeat` — nada de `fix/home-sanidad` se
perdió. `InfiniteReviews.tsx` (T3) no lo tocaba nadie más.

### Qué quedó adentro, verificado

**T1 — `WhyDevelOP`, 11 loops.** Cada `duration: shouldSimplify ? 0.01` que iba
junto a `repeat: Infinity` ahora lleva `repeat: shouldSimplify ? 0 : Infinity`.
El problema era que `duration: 0.01` **no** apaga la animación: la reinicia cada
frame indefinidamente, y como `shouldSimplify = shouldReduceMotion || isMobile`,
el camino de alivio salía más caro que la animación original. Medido por la rama:
192,7 mutaciones de `style` por segundo, perpetuas → 0. La rama de desktop queda
byte-idéntica.

Verificado que no quedó ninguno crudo: 0 líneas con `duration: shouldSimplify ?
0.01` seguidas de `repeat: Infinity` sin gatear. Las líneas 514 y 589 conservan el
`0.01` **sin** `repeat` — son animaciones de un solo disparo, no loops. Correcto
dejarlas.

> Anotado, fuera del alcance de T1 tal como está escrito: las líneas 766, 778 y
> 1026 del mismo archivo tienen `repeat: Infinity` con duraciones normales (3s, 2s,
> 2s) y **ningún** camino de `shouldSimplify`. No son el bug del 0.01, pero corren
> a 60fps para siempre también en mobile y con reduced-motion. No se tocaron.

**T2 — `frameloop` del canvas.** El `<Canvas>` no lo declaraba, así que R3F usaba
`'always'`: los 3 `useFrame` (HeroLogo, HeroLogoShadow, DesktopPointerSync) y los
3 pases del EffectComposer seguían renderizando con el hero fuera de pantalla.
Medido por la rama en mobile: 156 draw calls WebGL en viewport → 0 fuera → 152 al
volver. Arranca en `true` para no arriesgar la coreografía de intro.

**T3 — rAF del marquee.** El `IntersectionObserver` de `InfiniteReviews` gateaba el
trabajo pero el `requestAnimationFrame` quedaba **fuera** del `if (isVisible)`, así
que el loop corría a 60fps de por vida leyendo `window.scrollY`. Ahora arranca y se
cancela con la visibilidad, y al reentrar rebasa `lastTime` y `lastScrollY` para
que no pegue un salto de velocidad. Medido: 58-120 `paintFrame` por ventana en
viewport → 0 fuera.

### T4 — Informe del scroll-lock del intro (sin cambios de código)

**Quiénes escriben `documentElement.style.overflow`.** Tres dueños, sin refcount ni
coordinación, sobre la misma propiedad:

1. `EarlyScrollLock` — script inline inyectado al stream SSR antes de `</head>`,
   corre **antes del primer paint**. Lockea solo en `/` y **nunca** bajo
   `navigator.webdriver`.
2. `Hero` — efecto sobre `[lenis, phase]`: `hidden` mientras `phase !== 'done'`,
   vacío en `'done'`. Más un cleanup de desmontaje que limpia incondicionalmente.
3. `MarketingIntro` — su propio `lockScroll()` / `unlockScroll()`.

**Los dos primeros no coliden con el tercero**: `Hero` es home-only y
`MarketingIntro` corre solo en las 5 rutas de marketing (allow-list de
`marketing-routes.ts`, que excluye el home explícitamente). Son mutuamente
excluyentes por ruta.

**El hallazgo real es una asimetría entre los dos orquestadores de intro:**

| | red de seguridad | qué pasa si la coreografía se cuelga |
|---|---|---|
| `Hero` (home) | **sí** — `window.setTimeout` de 6s que fuerza `setPhase('done')` | el lock se libera a los 6s, con un `console.warn('Preloader safety timeout triggered')` |
| `MarketingIntro` (4 landings + contact) | **no** | el lock **no se libera** |

En `MarketingIntro`, los 8 puntos que llaman a `unlockScroll()` están todos aguas
abajo de la cadena secuencial de `await animate(...)` de Framer Motion, que es
rAF-driven, o bien en el cleanup de desmontaje. No hay ningún fallback de reloj de
pared. `MARKETING_READY_TIMEOUT_MS` existe pero solo acota el
`Promise.race([waitForLogoReady(), …])`, no la cadena de animación.

**Medido, no deducido.** En el navegador del harness (que resultó tener
`navigator.webdriver === false`, así que el corto-circuito de automation **no**
aplicó) y con el pane sin compositar — o sea rAF congelado, 0 frames por segundo:

- `/` (hard-load): `overflow: hidden` al entrar, y **liberado antes de los 6s**.
  La red de seguridad del `Hero` funciona. `setTimeout` corre aunque rAF no.
- `/contact` (hard-load): `overflow: hidden` en `<html>` y `<body>`,
  `scrollHeight <= innerHeight`, **seguía bloqueado a los 12 segundos**. Y el click
  en el link al home ni siquiera navegó: el velo del intro sigue arriba.

**Exposición real: acotada, no nula.** Un tab en segundo plano congela rAF, pero
Framer reanuda al enfocar, así que ese caso se autocura. El riesgo genuino es
cualquier camino que corte la cadena sin desmontar el componente — una excepción a
mitad de la secuencia, o un dispositivo lo bastante lento como para que un
`animate` quede starved. No se midió con qué frecuencia pasa en producción.

**Recomendación, NO implementada** (T4 es solo informe): darle a `MarketingIntro`
la misma red que el `Hero` ya tiene — un `setTimeout` de reloj de pared que llame a
`unlockScroll()` pase lo que pase. Son ~6 líneas y cierra la asimetría.

**Y un problema de método que conviene anotar:** este bug es **estructuralmente
invisible** para las herramientas del repo. `EarlyScrollLock` se saltea a sí mismo
bajo `navigator.webdriver`, y `PreloaderContext:125` salta la fase directo a
`'done'` bajo la misma condición. O sea: la única herramienta que podría cazar un
bug de scroll-lock está excluida por diseño. El discriminador para Franco es
manual: abrir `/contact` en un navegador normal y mirar si aparece
`Preloader safety timeout triggered` en la consola, o si la página queda sin
scroll.

### Verificación

| Chequeo | Resultado |
|---|---|
| `npm run build` | ✅ exit 0 |
| `npx tsc --noEmit` | ✅ 0 errores |
| 11 loops de `WhyDevelOP` gateados | sí, 0 crudos restantes |
| nada de `fix/home-sanidad` perdido en `WhyDevelOP` | verificado por diff contra esa rama |
| `frameloop` llega al `<Canvas>` | sí, junto al FIX-GHOST-BOX |
| las 9 rutas públicas + robots + sitemap | 200 |
| chunks de three en el documento inicial del home | 0 de 23 scripts |
| errores de consola en `/` | 0 |

**Sigue sin verificarse visualmente el hero 3D**, por la misma razón de la Fase 1:
el pane no compositaba (0 frames de rAF), así que la coreografía de intro nunca
arranca y el canvas queda en el default 300×150 de R3F. Es artefacto del entorno,
no del código. **Queda para la verificación humana de Franco en el deploy preview.**

---

## CIERRE DE LA CORRIDA — `redesign/home` es la rama única · 2026-07-30

### Qué quedó consolidado

`redesign/home` contiene ahora, en un solo lugar:

- **B1** (su base): tokens, componentes del sistema de diseño, `/styleguide`.
- **B0 + B0-bis** (de `fix/home-sanidad`): copy del home, `lang`, meta, HDRI
  self-hosteado, three fuera del bundle inicial.
- **El arreglo de fuentes** (de `fix/fonts-geist-scope`): las variables de
  `next/font` en el scope correcto. Todo el sitio renderiza Geist por primera vez.
- **B0.5**: sanidad de copy de las landings + `sitemap.ts` y `robots.ts`.
- **B0.6** (de `fix/motion-sanidad-mobile`): los tres bugs de motion.

**Las cuatro ramas quedaron absorbidas.** Ninguna tiene ya nada que
`redesign/home` no tenga. Borrarlas es decisión de Franco; no se tocaron.

**`main` no recibió nada.** Cero merges, cero pushes, cero deploys, ningún
fast-forward. Producción sigue exactamente como estaba.

### Los tres conflictos, y cómo se resolvieron

Los tres eran **la misma colisión estructural**: `fix/home-sanidad` extrajo el
bloque 3D de `Hero.tsx` a un `HeroCanvas.tsx` nuevo, mientras otras dos ramas
seguían editando ese bloque en su lugar original. Git no ve «400 líneas movidas
contra 40 editadas» como un conflicto de una línea: lo ve como el archivo entero.

1. **`Hero.tsx` vs `main`** (merge de `fix/home-sanidad`) — `main` había agregado
   el FIX-GHOST-BOX. Resuelto: `Hero.tsx` se queda con la extracción, el
   FIX-GHOST-BOX se porta a `HeroCanvas.tsx`. Delta verificado idéntico al de `main`.
2. **`layout.tsx`** (merge de `fix/fonts-geist-scope`) — mismo elemento `<html>`:
   una rama cambió `lang`, la otra movió el `className` de las fuentes. Resuelto
   por unión pura: quedaron los dos, más el canonical y la meta sin el claim `+47`.
3. **`Hero.tsx` vs `fix/motion-sanidad-mobile`** (merge de B0.6) — la misma
   colisión que 1, ahora con la prop `frameloop`. Resuelto igual: lo que T2 le hizo
   a `Hero()` auto-mergeó, la prop del componente se portó a `HeroCanvas.tsx`.

**En ningún caso se descartó el lado ajeno.** Los tres se cerraron conservando la
intención completa de las dos ramas, y en los tres se verificó después que nada de
ninguno de los dos lados se hubiera perdido.

### Qué se completó de cada fase

- **Fase 1 — consolidación:** cerrada en verde. Build 0, tsc 0, Geist aplicada en
  `/` y `/styleguide`, `font-mono` en Geist Mono, cero chunks de three en el
  documento inicial del home, `/styleguide` 200, cero errores de consola. El
  workaround de fuentes de B1 se colapsó a una sola fuente de verdad y se verificó
  que los 225 elementos del sistema de diseño siguen resolviendo Geist sin él.
- **Fase 2 — B0.5:** T1 a T6 completas. 53 aperturas de interrogación, 266 tildes,
  22 líneas de tilde sobrante, 3 `.bak`, 8 mojibake, sitemap y robots nuevos,
  `CLAUDE.md` corregido.
- **Fase 3 — B0.6:** T1, T2 y T3 adentro vía merge. T4 es informe, entregado.

### Qué se frenó, y por qué

- **El doc `sprint-b06-motion-bugs.md` no existe.** Se consultó con Franco antes de
  seguir y se decidió mergear `fix/motion-sanidad-mobile` en vez de re-implementar.
- **Los 2 errores de `eslint` no se tocaron.** `react-hooks/set-state-in-effect` en
  `app/contact/page.tsx:73` y `software/DiagnosticoSoftware.tsx:520`. Verificados
  como **pre-existentes en `HEAD`**; arreglarlos es refactor de lógica de hooks,
  fuera del scope de un sprint de copy.
- **`package-lock.json` quedó sin commitear.** `npm install` lo modificó (60+/84−),
  pero solo por churn de dependencias opcionales de plataforma (`@emnapi/*`,
  marcas `peer: true`). Fuera del scope y riesgoso para los otros lanes. Se
  restauró.
- **El hero 3D no se verificó visualmente.** El pane del navegador no compositaba
  (`document.hidden === true`, 0 frames de rAF por segundo), así que la coreografía
  de intro nunca arranca. Cualquier medición del canvas en ese entorno es nula.

### Informe del scroll-lock (T4), en una línea

`Hero` tiene una red de seguridad de 6 segundos que libera el scroll si la
coreografía se cuelga; **`MarketingIntro` no tiene ninguna** — sus 8 llamadas a
`unlockScroll()` están todas aguas abajo de `await animate(...)` rAF-driven.
Medido con rAF congelado: `/` se recuperó antes de los 6s, `/contact` seguía
bloqueado a los 12. Recomendación (no implementada): darle a `MarketingIntro` el
mismo `setTimeout` de reloj de pared. Detalle completo en la entrada de B0.6.

### Lo que espera decisión de Franco

**Gate 1 — bloquean B2:**

1. **Permutación de acentos, A vs B.** Sigue abierta. Ojo: T6 alineó `CLAUDE.md`
   con **A** (el código actual). Eso NO cierra la decisión — si elegís B, se
   reeditan los cuatro hex de `globals.css` y esa sección de `CLAUDE.md` juntos.
2. **Familia del display: Geist o Space Grotesk.** Sigue abierta, pero ahora es una
   comparación honesta: el sitio por fin muestra su tipografía real.
3. ~~El bug de Geist~~ — **RESUELTA** por la consolidación.

**Gate 1 — no bloquean:** las 4 a 8 siguen igual (sombra del control en tema crema,
flecha del CTA, numeración de capítulos, contrastes de S5 en placeholder, y mirar
la página con ojos propios).

**Nuevas, de esta corrida:**

4. **El texto de reemplazo de T1.** Quedó «Automatizaciones funcionando en negocios
   del NOA». Es copy de venta: si querés otra frase, es el momento.
5. **`/styleguide` bloqueado en `robots.ts`.** Decisión propia, no estaba en la
   lista del sprint. Sacarlo es borrar una línea.
6. **La red de seguridad de `MarketingIntro`.** Recomendada, no implementada.
7. **Los 2 `eslint` pre-existentes.** ¿Sprint aparte o se dejan?
8. **`WhyDevelOP.tsx:766, 778, 1026.**` Tres `repeat: Infinity` con duraciones
   normales y **sin** camino de `shouldSimplify`. No son el bug del 0.01 que
   arreglaba T1, pero corren a 60fps para siempre también en mobile y con
   reduced-motion. Fuera del scope de B0.6 tal como estaba escrito.
9. **Borrar las cuatro ramas absorbidas**, si estás de acuerdo en que ya no
   aportan nada.

### Verificación humana (la tuya)

Deploy preview de `redesign/home`, las 5 rutas públicas **primero en el teléfono**.
Es la primera vez que vas a ver el sitio con su tipografía real, el copy sano y sin
los bugs de motion, todo junto.

Los cuatro puntos que reportó el sprint de fuentes: el label «WhatsApp» de
`/contact` a 375px, los titulares pineados de `/web-development` y
`/software-development` en movimiento, y el overhang del `develOP` del hero.

Sumar a esa lista: **el hero 3D del home**, que ningún agente pudo ver.

Después, `/styleguide` en el teléfono → **Gate 1**.

**B2 no se abre hasta que pases ese Gate.**

## B0.7 — Red de seguridad del scroll en `MarketingIntro` · 2026-07-30

Cierra los puntos que B0.6 dejó como informe o como decisión pendiente: la red de
seguridad (punto 6 del Gate), los tres `repeat: Infinity` sin gate (punto 8) y la
línea de `/styleguide` en `robots.ts` (punto 5).

### T1 — La red de seguridad · HECHO

`src/components/ui/MarketingIntro.tsx`. Se replicó el mecanismo del `Hero`
(`src/components/layout/Hero.tsx:158-169`): un `window.setTimeout` anclado al
montaje que, si la coreografía no terminó, fuerza el estado final. `setTimeout` no
depende del `requestAnimationFrame`, así que sigue disparando exactamente en el
caso que rompía — el rAF congelado.

Cambios de forma, no de coreografía:

- `lockScroll` / `unlockScroll` / `finish` salieron del cuerpo del effect a
  `useCallback` de nivel de componente. Ahora hay **una sola** implementación que
  comparten los 8 `unlockScroll()` de la coreografía, el cleanup de desmontaje y la
  red nueva. Estables (leen `lenisRef`), así que no re-disparan el effect.
- `finishedRef` hace el cierre **one-shot**: coreografía y red compiten, gana el
  primero, el otro queda no-op. Sin doble `unlockScroll()`, sin doble evento
  `chrome:revealed`, sin salto visual.
- Si la red dispara, además setea `isCancelledRef` para cortar la coreografía en su
  próximo checkpoint, por si el rAF revive después.
- El effect de la red depende de `done`: cuando la coreografía termina bien, el
  cleanup cancela el timer y **nunca** dispara.

**El umbral: 6000 ms, igual al del `Hero`.** Es el máximo que permite la regla
«menor o igual al de Hero», y hace falta hasta el último milisegundo — ver el
margen medido abajo. Anclado al montaje, no a la navegación: el montaje ocurre
entre 330 y 1060 ms después del `commit` del documento, así que el presupuesto real
de la coreografía es 6000 ms desde que arranca.

### T2 — Medición

Harness: Playwright **headed**. En headless Chromium no compone, el rAF queda a
0 fps y la corrida «normal» termina midiendo el mismo cuelgue que se quiere
reproducir — la misma trampa que ya había mordido en B0.6. `navigator.webdriver`
forzado a `false` en un `addInitScript`, que corre antes que cualquier script de
página: sin eso, `isAutomationEnvironment()` y el `EarlyScrollLock` se
cortocircuitan y el bug no se reproduce. La condición de falla se simula
reemplazando `requestAnimationFrame` por una función que nunca invoca el callback.

Tiempo desde el `commit` del documento hasta que el scroll queda libre
(`documentElement.style.overflow` y `body.style.overflow` vacíos):

| ruta | rAF vivo — antes | rAF vivo — después | rAF congelado — antes | rAF congelado — después |
|---|---|---|---|---|
| `/` (Hero) | 10467 ms | 10275 ms | 9279 ms | 9372 ms |
| `/contact` | 5209 ms | 5329 ms | **> 15000 ms TRABADO** | **6335 ms** |
| `/web-development` | 6170 ms | 6534 ms | **> 15000 ms TRABADO** | **6866 ms** |

`/` no cambia: su red ya existía y es la que dispara con el rAF congelado. Las dos
rutas de marketing pasaban de no recuperarse nunca a recuperarse en ~6,3 y ~6,9 s
(montaje + 6000). Con el rAF vivo los números coinciden dentro del ruido de corrida
a corrida (±400 ms sobre ~5-6 s), o sea: **el intro normal se comporta igual que
antes**, misma secuencia, sin flash ni salto.

**El margen es ajustado, y es lo único que quedó incómodo.** Duración de la
coreografía medida desde el montaje, en las 5 rutas que montan `MarketingIntro`:

| ruta | montaje | fin | duración desde el montaje | margen contra los 6000 ms |
|---|---|---|---|---|
| `/contact` | 334 ms | 6042 ms | 5707 ms | **293 ms** |
| `/web-development` | 823 ms | 6114 ms | 5291 ms | 709 ms |
| `/ai-implementations` | 722 ms | 5565 ms | 4843 ms | 1157 ms |
| `/software-development` | 1061 ms | 6038 ms | 4976 ms | 1024 ms |
| `/process-automation` | 949 ms | 5926 ms | 4977 ms | 1023 ms |

Esto es en un desktop rápido contra un servidor local. El sumando que manda es el
readiness gate del 3D (`MARKETING_READY_TIMEOUT_MS`, tope 2500 ms): si en una
máquina lenta llega a su tope, la coreografía tarda ~6420 ms y **la red le corta los
últimos ~400 ms al toldo** — el velo desaparece de golpe cuando ya está medio fuera
de pantalla. Es un caso que de por sí ya está degradado (significa que el 3D nunca
cargó en 2,5 s), pero es un caso real. Ver el punto 10 del Gate.

Caminos de desbloqueo verificados, además del hard-load:

- **Client-nav `/` → `/contact` con el rAF congelado:** el scroll se libera a los
  5837 ms de la navegación. Ahí `MarketingIntro` ni siquiera monta —
  `shouldRunMarketingIntro` solo dispara en la ruta de entrada; lo que traba y
  libera es el Shutter, que ya tenía su propia red en `TransitionContext.tsx:53`.
- **Desmontaje a mitad del intro:** no se pudo forzar. Con el rAF congelado la
  transición del Shutter tampoco puede completarse, así que el click de salida no
  navega y **la red nueva es la que libera** (4655 ms después del click, ~6,1 s
  desde la carga). El cleanup de desmontaje no cambió de comportamiento en este
  sprint: es el mismo `unlockScroll()` de siempre, solo que ahora hoisteado.

### T3 — Los 3 `repeat: Infinity` sin gate · HECHO

`WhyDevelOP.tsx`: `OwnershipVisual` (la card y sus 2 barras) y `RoiVisual` (el punto
del final de la curva). Se les puso el mismo gate que ya tenían sus hermanos de
`MainNodesVisual` / `MainAIVisual`: `useIsMobileViewport()` sumado al
`useReducedMotion()` que ya estaba, y `duration: shouldSimplify ? 0.01 : X` +
`repeat: shouldSimplify ? 0 : Infinity`. Sin helper compartido: el archivo se
reemplaza más adelante.

Medición: `getComputedStyle` muestreado 50 veces cada 50 ms. El atributo `style`
inline **no sirve** — motion delega en WAAPI cuando puede y el inline queda viejo.
Valores distintos > 1 ⇒ el loop corre.

| nodo | condición | antes | después |
|---|---|---|---|
| card + barras de `ownership` | **mobile 390×844** | keyframe animado (`translateY(-4px)`, opacity 0,36/0,24) | **estático final** (`none`, opacity 0,9/0,6) |
| punto del ROI | **mobile 390×844** | **ANIMANDO** (50 valores distintos) | **estático** |
| card + barras de `ownership` | desktop + reduced-motion | estático | estático |
| punto del ROI | desktop + reduced-motion | estático | estático |
| card + barras de `ownership` | **desktop sin reduced-motion** | lectura X | **idéntica byte a byte** |
| punto del ROI | **desktop sin reduced-motion** | ANIMANDO (49) | ANIMANDO (48) |

Desktop sin reduced-motion no cambia — verificado contra un build de la versión
anterior, no solo por inspección del código. Detalle honesto: en ese harness la card
de `ownership` se lee **estática también en desktop**, sentada en su primer
keyframe. Pero se lee exactamente igual antes y después, así que sea lo que sea que
la congela, es pre-existente y ajeno a este sprint.

### T4 — `/styleguide` fuera de `robots.ts` · HECHO

Una línea. La página ya lleva `robots: { index: false, follow: false }` en su
metadata (`app/styleguide/page.tsx:26`) y no tiene ningún link entrante.
`/robots.txt` verificado en el build de producción: sin la línea de styleguide, con
las 12 rutas privadas intactas.

### Verificación

- `npm run build` verde. `npx tsc --noEmit` → 0 errores. `eslint` sobre los 3
  archivos tocados → 0. Los 2 errores pre-existentes de `contact/page.tsx` y
  `DiagnosticoSoftware.tsx` quedaron como estaban.
- `npm install` no hizo falta; `package-lock.json` no se movió.
- Errores de consola: 0 en `/`, `/contact` y `/styleguide`. En `/web-development`
  hay 4, **pre-existentes** (idénticos en el build de antes): dos 404 de recurso y
  dos violaciones de CSP report-only del iframe de `template-zero.netlify.app`.

### T5 — Los 17 `repeat: Infinity` restantes de `WhyDevelOP.tsx` · HECHO

Cierra el punto 11 que había quedado abierto en T3. Relevado antes de tocar nada:
`grep -n "Infinity"` sobre el archivo daba 31 sitios con `repeat: Infinity` — 14 ya
gateados por sprints previos (`OwnershipVisual`, `MainNodesVisual`, `MainAIVisual`,
`RoiVisual`) y **17 sin gatear**, coincidiendo exacto con el número estimado en T3:

| componente | líneas | detalle |
|---|---|---|
| `ClockVisual` | 1048-1053, 1054-1059, 1061-1065 | solo `useReducedMotion`, sin `isMobile`; el 3er anillo no tenía ni siquiera el gate de reduced-motion |
| `LayersVisual` | 1077-1087 | ídem, `duration`/`repeat` nunca gateados |
| `DashboardVisual` | 1105-1110, 1116-1120, 1127-1132 | ídem (3 loops) |
| `AgentsVisual` | 1146-1151, 1154-1163 | ídem (2 loops) |
| `GearVisual` | 1179-1182, 1185-1196 | ídem (2 loops) |
| `MetricsVisual` | 1213-1216 (ticker, 3 instancias), 1234-1239 | la barra de 1234 no tenía **ningún** gate, ni de reduced-motion |
| `LogoPulseVisual` | 1250-1258, 1259-1263 | ídem (2 loops) |
| `WhyDevelopBackground` | 1479-1483, 1484-1488 | ídem, los 2 glows de fondo de toda la sección |

Ningún caso de un solo disparo mezclado en el lote — los 31 sitios listados por el
grep son loops de verdad. Se les aplicó a los 17 el mismo patrón que ya tenían sus
14 hermanos: `useIsMobileViewport()` sumado al `useReducedMotion()` que ya estaba
en cada componente, `duration: shouldSimplify ? 0.01 : X` y
`repeat: shouldSimplify ? 0 : Infinity`. Sin helper compartido, caso por caso, tal
como pedía el sprint. Ningún caso quedó afuera por no admitir el patrón estándar.

### Medición

Primer intento con el pane de preview del harness: `document.hidden` daba `true`
(el pane no estaba compositando — mismo síntoma ya conocido de otras corridas) y
`document.getAnimations()` devolvía cero animaciones de Framer en cualquier
condición, mobile o desktop. Se migró a un harness Playwright standalone
(`chromium.launch()`, invocado desde el scratchpad vía `NODE_PATH` al
`node_modules` del repo) apuntando a un servidor real en `:3050`.

Segunda trampa: contra `next dev`, el WebSocket de HMR fallaba en loop
(`ERR_INVALID_HTTP_RESPONSE`) y el click de cambio de pestaña nunca actualizaba
`aria-selected` — parecía que las pestañas estaban rotas. No lo estaban: el ruido
de reconexión de HMR se comía el estado de React. Con `npm run build` +
`next start -p 3050` (el mismo build ya verificado) el cambio de pestaña
funcionó al primer click.

Método final: `getComputedStyle` de todo `#caracteristicas` (transform, opacity,
filter, boxShadow), 20 muestras cada 150 ms, arrancando 2 s después del cambio de
pestaña para no confundir el settle de las transiciones de un solo disparo del
cross-fade de paneles (`AnimatePresence mode="wait"`) con un loop real. La barra de
`MetricsVisual` anima `width`, que no está en esa lista de propiedades — se
verificó aparte, igual que `GearVisual` (SVG, su `<g>`/`<rect>` colapsaban en el
mismo bucket genérico que otros SVG de la sección).

| nodo | mobile 390×844 (sin reduced-motion) | desktop sin reduced-motion |
|---|---|---|
| `ClockVisual` (3 anillos) | **estático**, 1 valor distinto en 20 muestras | **ANIMANDO**, 20 valores distintos |
| `LayersVisual` (3 cards) | estático | ANIMANDO |
| `DashboardVisual` (barras + dot) | estático | ANIMANDO |
| `AgentsVisual` (glow + bubbles) | estático | ANIMANDO |
| `GearVisual` (`<g>` rotando + 8 `<rect>`) | estático, matrices y opacidad fijas | ANIMANDO, matrices y opacidad (0,22→0,88 etc.) variando en las 20 muestras |
| `MetricsVisual` ticker (×3) | estático, `transform: none` fijo | ANIMANDO, `translateY` corriendo |
| `MetricsVisual` barra de ancho | estático, `40.7969px` fijo en las 20 muestras | ANIMANDO, `74.23px → 41.11px` |
| `LogoPulseVisual` (glow + scale) | estático | ANIMANDO |
| `WhyDevelopBackground` (2 glows) | estático | ANIMANDO |

Con `prefers-reduced-motion: reduce` emulado (Playwright `reducedMotion: 'reduce'`)
en mobile y en desktop: **0 elementos de Framer animando** en las 3 pestañas, en
ambos casos. Desktop sin reduced-motion quedó verificado contra el mismo build de
producción recién generado (no solo inspección de código) — todo lo que animaba
antes de este sprint (los 14 loops ya gateados + los one-shot de
`AgencyComparisonVisual`) sigue animando exactamente igual.

Ruido fuera de scope, no tocado: 3 elementos usan `animate-pulse`/`animate-ping` de
Tailwind (CSS puro, no Framer) — siguen corriendo perpetuos en todas las
condiciones salvo cuando Playwright fuerza `reduced-motion` (que aparentemente
desactiva animaciones CSS a nivel de motor, no solo las que consultan la media
query). Preexistentes, ajenos a este sprint.

### Verificación

- `npm run build` verde. `npx tsc --noEmit` → 0 errores. `eslint` sobre el archivo
  → 0.
- `npm install` no hizo falta; `package-lock.json` no se movió.
- `git status` solo modifica `WhyDevelOP.tsx` (49 inserciones, 33 borrados).
- Errores de consola: 0 en `/` (verificado contra el build de producción en la
  corrida de medición).

### Lo que sigue esperando decisión de Franco

10. **El margen de la red de seguridad.** 293 ms en `/contact` sobre un desktop
    rápido. Tres salidas, ninguna implementada: (a) dejarlo así y aceptar que en un
    desktop lento la red le corte la cola al toldo; (b) subir las dos redes (Hero y
    MarketingIntro) a ~8000 ms — mantiene un solo patrón, pero alarga la ventana de
    trabazón; (c) armar el timer de `MarketingIntro` **después** del readiness gate
    — el gate ya está acotado por `setTimeout` a 2500 ms, así que no puede colgarse,
    y así los 6000 ms cubren enteros la parte que sí depende del rAF. (c) es la
    mejor técnicamente, pero mete un segundo anclaje en el repo.

11. ~~**Los otros `repeat: Infinity` de `WhyDevelOP.tsx`.**~~ Cerrado en T5: los 17
    loops restantes quedaron gateados y verificados en runtime. `WhyDevelOP.tsx` no
    tiene ningún `repeat: Infinity` sin `shouldSimplify` — los 3 `animate-pulse`/
    `animate-ping` de Tailwind que quedan corriendo son CSS, no Framer, y no eran
    parte del pedido.

---

## B0.8 — Anclas rotas del chatbot y del menú mobile · 2026-07-31

Bugs pre-existentes de navegación, ajenos al rediseño. Un solo objetivo: que ningún
link del sitio público apunte a un ancla inexistente. Verificado sobre el build de
producción (`start:qa`, :3001) con Playwright a 390px.

### T1 — Censo completo (verificado contra el código, no contra los probes)

**Chatbot — `navigateToPage.ts` `VALID_PATHS`**

| Destino ofrecido | ¿Existe? | Acción | Runtime |
|---|---|---|---|
| `/web-development` · `/ai-implementations` · `/process-automation` · `/software-development` | ✅ rutas | — | ✅ llega |
| `/#nosotros` | ✅ `About.tsx:411` y `:471` | — | ⚠️ ver nota T4 |
| `/#portafolio` | ❌ `portafolio` no existe; el id real es `portfolio` (`Portfolio.tsx:726`) | → `/#portfolio` | ⚠️ ver nota T4 |
| `/#calculadora` | ❌ `calculadora` solo existe en `CalculadoraAutomation.tsx:955`, montado únicamente en `/process-automation` | → `/process-automation#calculadora` | ✅ llega (top −48px) |
| `/#servicios` | ✅ `OurServices.tsx:9632` | — | ⚠️ ver nota T4 |

**Menú mobile de las 4 landings — `Navbar.tsx` `getNavItems`**

| Landing | Ítem | Ancla vieja | Ancla nueva | Runtime 390px |
|---|---|---|---|---|
| las 4 | Inicio | `#hero` ❌ no existía en ningún lado | `#hero` (id **agregado** a los 4 heroes) | ✅ top 0 ×4 |
| `/process-automation` | Proceso | `#proceso` ✅ `ProcesoAutomation.tsx:832` | sin cambio | ✅ top 0 |
| `/ai-implementations` | Proceso | `#proceso` ❌ | `#proceso` (id **agregado** a `PipelineIA.tsx:1107`) | ✅ top −48 |
| `/web-development` | Proceso | `#proceso` ❌ | `#web-development-timeline` (ya existía, `:660`) | ✅ top −48 |
| `/software-development` | Proceso | `#proceso` ❌ | `#pipeline` (ya existía, `PipelineSoftware.tsx:333`) | ✅ top 0 |
| las 4 | FAQ | `#faq` ❌ no existía en ningún lado | `#faq` (id **agregado** a las 4 secciones FAQ) | ✅ top −48 ×4 |
| las 4 | Contacto | `/contact` ✅ | — | ✅ |

**Home — `Navbar.tsx` `MAIN_NAV_ITEMS` y `DynamicDock.tsx` `NAV_ITEMS`**
`#inicio` (`Hero.tsx:175`), `#nosotros`, `#portfolio`, `#servicios`, `#caracteristicas`
(`WhyDevelOP.tsx:1629`) y `/contact`: **los 6 existen**. Verificados por menú mobile:
✅ los 4 probados. `#caracteristicas` aterriza en `top −793` — es el centrado
deliberado de `TransitionContext:28,41`, no un fallo.

**Footer** (`Footer.tsx:56-61, 352`): solo externos (LinkedIn, Instagram, X, mailto,
wa.me). Nada roto.

**Hallazgos nuevos, fuera de lo que describían los probes**

| Link | Ancla vieja | Ancla nueva | Runtime |
|---|---|---|---|
| `HeroIA.tsx:764` "Proba la IA ahora" | `#live-chat` ❌ no existe | `#demo-ia` (`DemoIA.tsx:711`) | ✅ top −48 |
| `VaultIA.tsx:392` "Probar la IA primero" | `#live-chat` ❌ | `#demo-ia` | ✅ (mismo selector) |
| `ProcesoAutomation.tsx:872` "Planificar flujo" | `#contacto` ❌ no existe | `#contacto-form` (`CtaAutomation.tsx:481`) | ✅ en pantalla |

Sobre el último: aterriza en `top 704` y no en `top ≈ 0`, pero **no es un fallo** —
`scrollY 22949 + viewport 844 = bodyH 23793`: la página ya está en su fondo absoluto
y el ancla no puede subir más. La sección queda visible.

**Verificados como sanos, sin tocar:** `HeroAutomation.tsx:1412` `#calculadora` ·
`:1462` `#flujo` · `HeroSoftware.tsx:420` `#diagnostico` · `:460` `#pipeline` ·
`PainBentoSoftware.tsx:697` `#diagnostico` · los 4 `getElementById('contacto-form')`
de los CTA (el id existe en las 4 landings).

### T2 / T3 — Qué se corrigió

Regla respetada: **se corrige el link, no el destino.** No se renombró ningún `id`.
Donde el `id` correcto no existía en ninguna parte pero la sección sí (`#hero` ×4,
`#faq` ×4, `#proceso` en IA), se frenó y Franco decidió **agregar el id faltante** —
que no es renombrar: esas secciones no tenían `id`, así que la adición no rompe
ningún consumidor previo. Nada se quitó del menú: los 4 ítems siguen en las 4 landings.

`getNavItems` pasó a resolver el ancla de "Proceso" por ruta
(`PROCESO_ANCHOR_BY_ROUTE`), porque en 2 de las 4 landings la sección de proceso ya
tenía id propio. `HASH_TO_LABEL` sumó las dos entradas nuevas para que el tab activo
siga marcando.

### T4 — Navegación del widget por recarga completa: RELEVADO, NO APLICADO

`useChatbot.ts:487` hace `window.location.href = path`. **No se tocó.** El bloqueo es
estructural y está medido:

- `ChatWidgetMount` se monta en `layout.tsx:112`, **fuera** del `<TransitionProvider>`
  que cierra en `:95`. `useTransitionContext()` dentro del widget tiraría excepción hoy.
- `TransitionContext.tsx` es frozen: no se puede agregarle un hook opcional.
- El embed de terceros (`ChatbotEmbed.tsx:401`) ya usa su propio `handleNavigate` por
  `postMessage`, así que **no** se vería afectado: el único consumidor real de
  `navigateTo` es `LogicCompanion.tsx:162`.

Opciones y costo:
1. **Mover `ChatWidgetMount` adentro del provider** — lo mete también dentro de
   `<SmoothScroll>` (Lenis). Riesgo real sobre un launcher `position: fixed`; exige
   re-verificar el launcher en las 5 rutas públicas. No es "acotado y de bajo riesgo".
2. `router.push()` en `LogicCompanion` — evita la recarga sin necesitar el provider,
   pero viola la regla de `CLAUDE.md` para el sitio público.
3. Dejarlo (elegido).

**Consecuencia medida, y es peor de lo que decía el probe.** En carga fría de
`/#hash` (contexto nuevo, `/#hash` como primera navegación), el preloader del home
resetea el scroll y **el salto nativo al ancla nunca ocurre**: `scrollY = 0` para
`#nosotros`, `#portfolio` y `#servicios` por igual. O sea: corregir la grafía de
`/#portafolio` → `/#portfolio` deja el destino **válido** (verificado: aterriza bien
cuando el scroll no queda pisado — same-document da `top 0`), pero el chatbot va a
seguir sin aterrizar visiblemente en ninguna ancla del **home** hasta que se resuelva
T4. Las 4 rutas de servicio y `/process-automation#calculadora` sí funcionan enteras.

Esto **no es una regresión de este sprint**: afecta idénticamente a `#nosotros` y
`#servicios`, que no se tocaron y que los probes daban por sanos.

### Verificación

- `npm run build` verde · `npx tsc --noEmit` → 0 · `eslint` sobre los 13 archivos → 0
  nuevos. El único error de eslint (`react-hooks/set-state-in-effect` en `Navbar.tsx`)
  es **pre-existente**: se reproduce igual en `HEAD:183`, mis cambios solo lo corrieron
  a `:195`.
- `npm install` no hizo falta; `package-lock.json` no se movió.
- Runtime: 20/20 anclas presentes en el HTML de producción (SSR, curl) + click-through
  real a 390px con Playwright sobre el build de producción.
- **Errores de consola: 0 nuevos**, medido — no afirmado. Se capturó el set
  normalizado en `HEAD` (build aparte en :3007) y en la rama: `diff` idéntico
  (5 entradas pre-existentes: 404s de assets de templates externos y una violación
  CSP report-only por los iframes de Netlify).

### Nota de método

El pane del preview no compositaba (`rAF` medido en **0 fps**), lo que congela Lenis y
Framer y habría dado falsos ❌ en toda verificación de scroll. Se midió el rAF antes de
reportar y se movió la verificación a Playwright headless, que sí compone. A 390px el
launcher del chatbot se superpone al botón del menú mobile y se come el hit-test: hubo
que usar `dispatchEvent('click')`. **Esa superposición es un hallazgo pre-existente,
fuera de scope, sin corregir.**

### Fuera de scope, anotado y no implementado

- `ShowcaseSection.tsx:580` — `<Link href="#">Ver proyecto →</Link>`. No es un ancla
  rota sino un placeholder sin destino; darle uno es decisión de producto.
- La superposición launcher del chatbot / botón del menú mobile a 390px.
- T4 (arriba).

---

## B2-S1 — Hero tipográfico · 2026-07-31

Commit: `feat(home): hero tipografico del sistema nuevo`
Rama: `redesign/home` (checkout local nuevo desde `origin/redesign/home` @ `c216079`;
el worktree principal estaba en `b0-isolation-motor-chatbot`, que no tiene el sistema
de diseño de B1). `package-lock.json` **idéntico** entre ambas ramas → no hizo falta
`npm install`, y el lockfile no se movió.

### Qué se hizo

**El hero es ahora dos capas desacopladas.**

**Capa 1 — base tipográfica.** `Hero.tsx` reescrito entero, solo con piezas de
`components/design-system/`: `SectionShell` (tema dark) · `Eyebrow` ·
`DisplayHeading size="xl" as="h1"` · `Lead` · `CtaButton` · microcopy. Es un
**Server Component**: no lleva `'use client'` ni una línea de JS propia, así que se
pinta con el HTML del documento. `id="inicio"` conservado.

**Capa 2 — artefacto 3D como mejora progresiva.** `HeroArtifactLayer.tsx` (nuevo)
monta el canvas **solo en desktop (`min-width: 1024px`), solo sin
`prefers-reduced-motion`, y recién en el primer hueco de `requestIdleCallback`**
posterior al paint. Aparece con un fade cuando el SVG está cargado y extruido.
`frameloop` gateado por `IntersectionObserver`. No toca `overflow`, no toca Lenis, no
espera a nadie: si el canvas nunca carga, el hero ya está completo.

**Murió el intro del home.** `Preloader.tsx` pasó de orquestador (velo negro,
readiness gate de 2500 ms, trazado del logo, lockup de texto, hold de lectura,
borrado, compresión) a **router de tres líneas** hacia `MarketingIntro`. La rama de
marketing quedó **intacta**: las 5 rutas conservan su intro, su gate de hard-load y su
red de seguridad de 6 s. `EarlyScrollLock.tsx` **borrado** (cero importadores
verificados por grep antes de tocarlo).

### Decisiones tomadas (y por qué)

**El reveal de entrada es CSS, no Framer Motion.** Un `initial={{opacity:0}}` de
Framer se serializa en el HTML del SSR: el bloque nace invisible y no aparece hasta
que hidrata. Para una capa cuyo requisito explícito es "verse terminada por sí sola",
eso es exactamente el modo de fallar equivocado. Se agregó `--animate-ds-reveal` al
`@theme static` (verificado en el CSS emitido: la utility y el `@keyframes ds-reveal`
están en el bundle). El bloque global de `prefers-reduced-motion` que dejó B1-S1 ya lo
aterriza en su keyframe final —visible— en 1 ms.

**`CtaButton` acepta `href` y entonces es un `<a>`.** El destino del hero es externo
(wa.me). Un destino tiene que poder abrirse en pestaña nueva, copiarse con click
derecho y anunciarse como enlace. Para no copiar el string de clases a otro archivo
—que es lo que las deja divergir— se extrajo `buttonClasses()` de `ui/Button` como
export aditivo; `Button` la usa internamente y el `<a>` la reusa. De paso los mapas de
variantes salieron del cuerpo del componente al scope de módulo (se recreaban en cada
render). Las clases no cambiaron. Variante nueva visible en `/styleguide`.

**`SectionShell` ganó `spacing='none'`.** El hero necesita su propio ritmo vertical
para reservar el alto del chrome flotante. **No alcanzaba con pasar `pt-*`/`pb-*` por
`className`**: se midió contra el `cn` del repo y `twMerge` NO colapsa `py-ds-section`
contra `pt-*`/`pb-*` — las tres clases sobreviven y quién gana lo decide el orden del
CSS emitido, no el del código. Es el mismo fallo silencioso que ya documentó
`DS_FONT_SIZE_CLASSES`. La prop lo hace explícito.

**El canvas ya no lleva `EffectComposer`.** Dos razones que apuntan al mismo lado: (1)
`ChromaticAberration` es literalmente meter color, y la dirección es monocroma; (2) la
lección aprendida del repo prohíbe el composer en canvas chicos y transparentes —el
hero viejo se salvaba por ser full-bleed de página, este es in-box, o sea el caso
prohibido. Se fue con él el gate `postFxReady`, que existía solo para esquivar el
cuadrado oscuro. `DotMatrixMesh` tampoco se monta más acá (desconectado del home; el
archivo sigue vivo para `/login`, `/forgot-password` y `/accept-invite`). Se cayeron
también `HeroCanvasSizeSync` (el canvas ahora llena su propio wrapper y r3f lo
dimensiona solo) y `HeroLogoShadow` (una sombra negra sobre fondo casi negro no aporta
nada).

**`useChromeRevealed` dejó de depender de `PreloaderContext`.** El home entró en la
rama "cualquier otra ruta": revela al instante. De haber dejado la condición vieja
(`phase === 'done'`), `phase` se habría quedado en `'drawing'` para siempre —nadie la
escribe ya— y el dock y el widget no habrían aparecido nunca en el home.

**El HDRI se conserva.** No es decorativo: el material del artefacto es `metalness=1`
/ `roughness=0` / `clearcoat=1`, un espejo. Sin entorno que reflejar se renderiza
negro plano. Pesa 1641 KB, se pide a los ~2,3 s, solo en desktop.

### Verificación (medida, no afirmada)

`npm run build` verde · `eslint` sobre los 11 archivos tocados → **0** · `tsc --noEmit`
→ **1 error, preexistente y ajeno** (`src/lib/searchconsole.ts`, conflicto de tipos
`googleapis`/`google-gax`; archivo no tocado, `git status` limpio para él).

> ⚠ **`npm run build` muere con OOM (exit 134, heap de 2 GB) en esta máquina** salvo
> que se le pase `NODE_OPTIONS=--max-old-space-size=8192`. Es preexistente: la primera
> corrida, sobre el árbol sin tocar, falló igual. Afecta a `npm run start:qa`, que
> encadena un build.

Runtime, Playwright sobre el build de producción servido (`next start`):

| viewport | scroll bloqueado | scroll libre | rueda real | `<canvas>` | consola |
|---|---|---|---|---|---|
| 1440×900 | **nunca** | 169 ms (1er tick de rAF) | OK 690px | 1 | 0 |
| 1280×800 | **nunca** | 241 ms (1er tick) | OK 690px | 1 | 0 |
| 1440×760 | **nunca** | 237 ms (1er tick) | OK 691px | 1 | 0 |
| 390×844 | **nunca** | 226 ms (1er tick) | OK 690px | **0** | 0 |

- **Tiempo hasta scroll libre: baseline 9,77 s → disponible desde el primer frame.**
  El probe corre antes que cualquier script de la página y nunca observó el scroll
  bloqueado (`everLocked: false` en los 4 viewports, en el primer tick de rAF).
  Prueba estructural complementaria: cero `documentElement.style.overflow` /
  `lenis.stop()` en el camino del home (los que quedan son modales de producto, el
  menú mobile y las rutas de marketing).
- **Nota de método:** el baseline de 9,77 s **no se pudo re-medir** con Playwright. El
  lock viejo tenía guarda `navigator.webdriver !== true` y `isAutomationEnvironment()`
  saltaba la fase a `'done'`, así que bajo automatización el intro viejo nunca corría.
  La cifra viene del PROBE (suma de constantes del código).
- **JS del documento inicial de `/`** (suma de los `<script src>` que declara el HTML
  servido): **1494,5 KB raw / 443,9 KB gzip → 1484,2 / 441,0**. Baja poco, y era lo
  esperable: el peso del home no está en el hero. **Chunks de three/r3f en el documento
  inicial: 0, antes y después** — ya eran diferidos.
- **Peso y momento de la capa 2** (desktop): `4198…js` 3,9 KB @ ~1,84 s ·
  `6187…js` 71,2 KB @ ~1,84 s · `studio_small_03_1k.hdr` 1641 KB @ ~2,3 s. Todo
  después de que la página es scrolleable (~0,2 s). **A 390px no se pide ninguno de
  los tres.**
- **Hallazgo de presupuesto:** el grueso de three/r3f **no** es del hero — lo baja el
  **widget de chat**, que tiene avatares R3F y se monta en todas las rutas públicas,
  mobile incluido. Por eso el canvas del hero solo suma ~75 KB de JS sobre lo que ya
  bajaba. Es el candidato real para el presupuesto mobile, no el hero.
- H1 a 390px: entra sin desbordar, sin scroll horizontal de documento, 52 px, 4 líneas
  sin cortes feos.
- **0 errores de consola** en los 4 viewports. Es el total, no el delta: no puede haber
  "nuevos" cuando el total es cero.
- Las 5 rutas de marketing, las 3 de auth y `/styleguide` responden 200.

### Un ajuste que salió de medir, no de mirar

Con el `py-ds-section` genérico el microcopy caía **debajo del dock flotante** (a
1440×900 terminaba en 832 y el dock arranca en 816: 16 px de solape; a 1280×800, 60 px).
Se le dio al hero ritmo propio (`spacing="none"` + `pt` reducido) y separaciones
explícitas en vez de un `gap` parejo. Resultado: holgura **+63 px** a 1440×900 y
**+16 px** a 1280×800.

**Residual, sin resolver:** a **1440×760** (portátil bajo) el microcopy queda 66 px por
debajo del borde superior del dock. Con un H1 de 4 líneas a 112 px no entra: el
contenido mide 686 px y arriba del dock hay 676 px. **No se forzó** — el dock es
justamente lo que S2-T3 rediseña ("logo + anclas + CtaButton compacto"), y ajustar el
hero contra una geometría que cambia en el sprint siguiente es trabajo tirado. Queda
anotado con el número.

### Nota de método — verificación visual

Se despachó el subagente `visual-qa` como manda `CLAUDE.md`. **No pudo entregar
reporte:** primero quedó bloqueado porque el servidor estaba en un puerto no declarado
en `.claude/launch.json` (archivo trackeado por git, no se tocó por estar fuera de
scope), y al reanudarlo perdió el acceso a sus herramientas de preview. La verificación
visual se hizo con Playwright + screenshots leídos a mano, que además compone de verdad
— la bitácora de B1-S3 ya había registrado el pane de preview midiendo **0 fps de rAF**,
lo que congela WebGL y da falsos negativos justo en lo que había que mirar.

**El artefacto 3D se lee bien sobre el fondo oscuro**, verificado en captura: el HDRI le
da un filo especular claro contra el `#0D0B09`. Era el riesgo abierto del sprint.

### Fuera de scope, anotado y NO implementado

- **Cinco fallbacks distintos** hardcodeados para `NEXT_PUBLIC_WHATSAPP_NUMBER`:
  `5493816223508` (×5), `543812223344` (×2), `5493815000000` (Footer),
  `5493815555555`, `543813165293` (`/contact`). `src/lib/whatsapp.ts` es el destino al
  que migrarlos; los call-sites no se tocaron. El prefill sí quedó unificado ahí
  (mismo texto que ya repetían `Footer.tsx` y `PortalDemoCTA.tsx`).
- **`PreloaderProvider` quedó inerte.** Tras este sprint **nadie llama a
  `usePreloader()`**. Sigue montado en el layout raíz porque `PreloaderContext.tsx` es
  frozen; de él solo se consumen el tipo `PreloaderPhase` (por `HeroArtifact`, también
  frozen) y `isAutomationEnvironment()` (por `MarketingIntro`).
- **`src/lib/home-routes.ts` quedó huérfano** (cero importadores). Se purga en S2-T2.
- **`MagneticCta` quedó con cero importadores.** Se purga en S2-T2.
- **Superposición launcher del chat / botón del menú mobile a 390px**, ahora con
  medidas: launcher `310–366 × 764–820`, botón `318–366 × 772–820` — lo **cubre por
  completo**. El launcher usa `z-index: 2.147.000.100` (escala de widget embebible),
  así que no se resuelve por z-index sino por posición. Se arregla en S2-T3.
- **`HeroArtifact.tsx` (frozen) tiene un float perpetuo** (`Math.sin(elapsedTime)` en
  su `useFrame`), que contradice el "nada perpetuo" de la dirección. No se tocó por
  estar congelado. Sí queda gateado por viewport vía `frameloop`.
- El HDRI de 1641 KB podría reemplazarse por `Lightformer`s procedurales de drei (cero
  asset) si el peso de desktop pasa a ser objetivo.

### Archivos

Modificados: `src/components/layout/Hero.tsx` · `src/components/layout/HeroCanvas.tsx` ·
`src/components/layout/useChromeRevealed.ts` · `src/components/ui/Preloader.tsx` ·
`src/components/ui/Button.tsx` · `src/components/design-system/CtaButton.tsx` ·
`src/components/design-system/SectionShell.tsx` · `src/app/layout.tsx` ·
`src/app/globals.css` · `src/app/styleguide/_components/ComponentStates.tsx`

Creados: `src/components/layout/HeroArtifactLayer.tsx` · `src/lib/whatsapp.ts`

Borrado: `src/components/layout/EarlyScrollLock.tsx`

---

## B2-S2 — Purga y navegación · 2026-07-31

Commit: `refactor(home): purga del intro, el 3D y la navegación vieja`
Rama: `redesign/home` (desde `0e4c9b0`, el commit de B2-S1). `package-lock.json`
no se movió — no hizo falta `npm install`.

Cierra el bloque B2. Se detiene acá: B3 necesita los datos publicables del caso
Concesionaria, que todavía no existen en ningún documento del proyecto.

### T1 — Bifurcación del intro y navegación por hash

**La bifurcación quedó bien.** Verificado en build de producción servida:
`/` no corre ningún intro y el scroll está libre desde el primer frame
(`overflow: visible` en `<html>` y `<body>`, cero estilos inline, `scrollTo(0,600)`
responde). `/web-development` sigue con su intro completo — trazado del logo,
relleno y lockup "CONSTRUIMOS LO QUE IMAGINAS" — y las 3 rutas de auth siguen
renderizando (`/login` con su canvas de `DotMatrix` y su formulario).

**La navegación por hash en carga fría NO quedó arreglada, y la causa no era el
preloader.** Este era el criterio de éxito de T1 y hay que reportarlo derecho.
Se encontraron tres causas, con medición:

1. **`SmoothScroll.tsx` forzaba el home a scroll 0 en cada carga.** Dos llamadas
   (`window.scrollTo(0,0)` y `lenis.scrollTo(0)`) cuyo comentario decía
   explícitamente que existían "para que el preloader tape la posición correcta y
   el slot del logo del hero se mida desde 0". B2-S1 borró esa coreografía; lo
   único que seguían haciendo era pisar el scroll nativo al hash. **Corregido**:
   se saltean cuando la URL trae ancla, se conservan para la entrada sin ancla.
2. **Las secciones destino no existen cuando el navegador resuelve el hash.**
   `app/page.tsx` las monta con `next/dynamic` + placeholder. Medido en producción:
   el documento arranca en **16.823px** y llega a **21.561px** una vez que todo
   montó — `#portfolio` es un placeholder de 0px de alto en el instante del salto,
   así que no hay caja a la que ir. A los 7s de una carga limpia siguen los 7
   placeholders puestos: montan recién al acercarse con scroll.
3. **`#nosotros` está declarado dos veces** (variante mobile y desktop de
   `About.tsx`). `getElementById` devuelve la primera, que en desktop está en
   `display:none`.

(2) y (3) son del terreno que B3/B4 rediseña — el brief dice que las anclas se
remapean ahí. No se tocaron.

**Un intento descartado, anotado para que no se repita.** Se escribió un helper de
~90 líneas en `SmoothScroll` que reintentaba por `requestAnimationFrame` hasta que
el destino tuviera caja, eligiendo entre ids duplicados el que renderiza. **No
aterrizaba de forma reproducible** (el destino no aparece si no se scrollea hacia
él: es circular) y le peleaba el control a Lenis. Se revirtió entero. Queda el
diagnóstico escrito en el comentario de `SmoothScroll.tsx`. La conclusión: el
arreglo real no es reintentar el scroll, es que el destino tenga caja cuando el
hash se resuelve.

**Nota de método — una medición contaminada.** Durante la verificación se
rebuildeó con la página abierta en el navegador. Eso invalida los nombres
hasheados de los chunks y la página viva empieza a tirar `ChunkLoadError`, cae en
el error boundary y deja los boundaries de streaming de React colgados. Varias
mediciones intermedias de esta sesión salieron de ese estado y fueron descartadas;
las que quedan en esta bitácora se rehicieron sobre servidor reiniciado y pestaña
nueva, sin rebuilds en el medio. **Regla: no rebuildear con la pestaña de
verificación abierta.**

### T2 — Purga

Borrados tras verificar cero importadores archivo por archivo (**91,5 KB** de
fuente):

| Archivo | Motivo |
|---|---|
| `sections/home/PortalDemo.tsx` (63,5 KB) | huérfano; el vivo es `sections/portal-demo/PortalDemo.tsx` |
| `sections/AIBentoGrid.tsx` (16,2 KB) | huérfano |
| `ui/buttons/MagneticCta.tsx` (7 KB) | lo reemplazó `CtaButton` en B2-S1 |
| `ui/TypewriterText.tsx` (2,6 KB) | su único consumidor era `AIBentoGrid` |
| `lib/home-routes.ts` (1,4 KB) | gate del intro del home, muerto desde B2-S1 |
| `layout/SectionTransition.tsx` (0,7 KB) | huérfano autodocumentado |
| `layout/DynamicDock.tsx` | lo reemplaza la barra nueva (ver T3) |

**Desconectados, no borrados.** `CustomCursor` y `NoiseOverlay` salieron de
`layout.tsx`. Eran las dos únicas piezas montadas globalmente (fuera de
`PublicOnlyComponents`), así que sacarlas de ahí las saca de todas las
superficies. Los dos contradicen la dirección: el cursor custom está prohibido —y
además escondía el del sistema con un `cursor:none` global en ≥768px, un costo de
accesibilidad por un adorno— y el grano animado corría a `steps(10)` infinito
sobre todo el viewport, en toda ruta, sin gate de visibilidad. Verificado después:
`/login` reporta `cursor: auto`, el nativo volvió. Los archivos quedan sin
consumidores.

`DotMatrix.tsx` no se tocó — ya lo había desconectado del home B2-S1, y lo siguen
usando `/login`, `/forgot-password` y `/accept-invite`.

`PreloaderProvider` sigue inerte: nadie llama `usePreloader()` (verificado, solo
quedan su definición y un comentario). Es frozen, no se tocó.

**HDRI**: `public/hdri/studio_small_03_1k.hdr` se sirve desde el propio origen
(`/hdri/...`), no desde `githubusercontent`. La única mención a ese dominio en
`HeroCanvas.tsx` es el comentario que explica por qué se self-hosteó.

### T3 — Navegación

`Navbar` + `DynamicDock` se reemplazaron por **una barra superior plana**, en un
solo archivo (`Navbar.tsx`); el dock se borró.

**Por qué arriba y no abajo — resuelve por posición dos bugs medidos**, no es
preferencia:

- A 390px el launcher del chat cubría por completo el botón del menú. Su z-index
  es `2.147.000.100`, así que no había forma de ganarle apilando. **Medido
  ahora**: botón del menú en `y 15–49`, launcher en `y 804–860` — **755px de
  separación, cero solape**. (Antes: botón `318–366 × 772–820`, launcher
  `310–366 × 764–820`.)
- El microcopy del hero caía debajo del dock flotante. Sin chrome fijo abajo la
  colisión no puede existir.

**Qué se fue con el dock**: el glassmorphism (`blur(48px) saturate(180%)`), los
radios y píldoras, los 7 iconos de Lucide (la flecha del `CtaButton` es el único
icono del sistema; las anclas son texto y el disparador del menú dice "Menú"), las
dos animaciones infinitas (shimmer del CTA y latido del logo), `getLightLevel()`
—la heurística de luz por umbrales de scroll que el dock reimplementaba al margen
de `ThemeContext`— y los **dos listeners de scroll sin coordinar** (Framer
`useScroll` en `Navbar` + `addEventListener` nativo en el dock). La barra es
chrome: va siempre en tema oscuro vía `data-ds-theme`, el mismo mecanismo de
`SectionShell`, y es persistente (no se esconde al scrollear).

**Qué se conservó**: los `id` de destino, `triggerTransition()` para toda
navegación interna, el revelado en lockstep con el widget de chat
(`useChromeRevealed` + tokens de `chromeReveal`), el menú mobile con su submenú de
servicios, y el acceso al portal. El observador de sección activa ahora mira
**solo los destinos del nav** en vez de todo `section[id], div[id]` del documento.

**Dos correcciones de calidad en el archivo nuevo** (en archivos que el sprint
reescribe el objetivo es cero hallazgos): el hash se lee con `useSyncExternalStore`
en vez de espejarlo a `useState` desde un efecto —de paso la barra ahora reacciona
a `hashchange`, cosa que antes no hacía— y el reseteo al cambiar de ruta se hace
ajustando estado durante el render, el patrón que documenta React, en vez de un
efecto que pinta un frame con el menú de la ruta anterior abierto.

**Agregados al sistema, no inline**: `--spacing-ds-nav` (alto de la barra; lo
consumen la barra y el `scroll-padding-top` del `<html>`, que si no toda ancla
aterriza tapada) y la densidad `compact` del `CtaButton` (tamaño `ds-compact` en
`ui/Button`), expuesta en `/styleguide`.

### T4 — WhatsApp

Migrados **15 call-sites** en 13 archivos a `src/lib/whatsapp.ts`. Se agregó
`getWhatsappDigits()` porque `/contact` arma además un `tel:` con el mismo número.

**Verificado byte a byte, no afirmado**: se comparó el href viejo (el literal que
estaba en el fuente) contra el nuevo para los 12 casos representativos →
**12/12 idénticos**. El único que cambia bytes es `CalculadoraAutomation`, que
tenía una `é` sin codificar en el querystring; el texto decodificado que recibe
WhatsApp es el mismo (es un arreglo, no un cambio).

De paso se cerraron **seis** call-sites que servían `https://wa.me/undefined` si
faltaba la variable de entorno (`WebDevelopmentTimeline`, `VaultIA`,
`PricingSection`, `CalculadoraAutomation`, y los dos de `ShowcaseSoftware`, que no
estaban en el censo de B2-S1 porque no tenían literal de fallback que grepear).

**Uno NO se migró, a propósito**: `components/ia/CalculadorIA.tsx:316` tiene
`5493815674738` hardcodeado y **no lee la variable de entorno**. Es el único punto
del sitio que hoy sirve un número realmente distinto, no un fallback muerto —
unificarlo cambiaría el destino que se sirve en producción. Queda como está,
reportado para que lo decida una persona.

### Verificación (medida, no afirmada)

- `npm run build` verde · `tsc --noEmit`: **1 error, el preexistente y ajeno** de
  `searchconsole.ts` (conflicto `googleapis`/`google-gax`) · eslint: **0 nuevos**
  (los 2 que este sprint introdujo en `Navbar.tsx` se corrigieron; los 3 restantes
  en archivos tocados son preexistentes y ajenos a las líneas migradas).
- **Scroll libre desde el primer frame** en `/`. El baseline de 9,77s no aplica
  más: no hay nada que esperar.
- **Cero mensajes de consola** en carga limpia de `/` (medido con tracking activo
  y recarga, no afirmado).
- **390px**: sin desborde horizontal; H1 a 52px en 4 líneas; microcopy visible
  (bottom 691 de 844); **el canvas 3D no se monta y su chunk `4198` no se pide**.
- **1440×760**: el microcopy termina en 797 con viewport 760 → queda **37px bajo
  el borde, sin nada que lo tape**. Antes quedaba 66px por debajo del dock, que sí
  lo cubría. Mejora, pero no queda holgado: el H1 a 4 líneas no entra en 760px de
  alto. Si molesta, la palanca es acotar `--text-ds-display-xl`, que es un token
  del sistema y afecta a todo — por eso no se tocó acá.
- **Desktop**: el chunk del hero se pide a los 583ms (después del contenido) y el
  canvas monta a los 769ms.
- **Detector plano** (`npx impeccable detect`): **51** hallazgos sobre la
  superficie pública (`app/page.tsx`, `app/contact`, las 4 landings,
  `components/{layout,design-system,sections,ia,automation,software,ui}`). El
  baseline dado era 46, pero **el alcance de esa medición no está documentado**,
  así que los dos números no son directamente comparables. Lo que sí se verificó,
  hallazgo por hallazgo: **ninguno cae en una línea escrita por este sprint**.
  `Navbar.tsx`, `Hero.tsx`, `SmoothScroll.tsx`, `SectionShell.tsx` y
  `CtaButton.tsx` dan **cero**. Los 10 que aparecen en archivos tocados están en
  líneas lejos de las migradas (p. ej. `CtaIA.tsx:321`, cuando la migración tocó
  la 6 y la 440). Corrida completa del repo: se abandonó a los 20 minutos sin
  terminar.

### Fuera de scope, anotado y NO implementado

- **El artefacto 3D no se revela.** En desktop el canvas monta y pinta, pero su
  capa de fade se queda en `opacity: 0` de forma permanente (medido a lo largo de
  ~110s): `onReady` nunca llega. Se ve apenas un arco tenue casi negro sobre el
  fondo oscuro. No se tocó ninguno de los tres archivos involucrados
  (`HeroArtifactLayer`, `HeroCanvas`, `HeroArtifact` —frozen—): es un defecto de
  B2-S1, no una regresión de este sprint. **Es lo primero a revisar del bloque.**
- **Three.js sigue bajando en mobile**, pero ya no por el hero: a 390px el chunk
  del hero no se pide y aun así entran `bd904a5c` (364 KB) y `b536a0f1` (341 KB).
  En `/` el único otro consumidor de R3F es el avatar del widget de chat. Si el
  presupuesto mobile es objetivo, ese avatar es el próximo blanco.
- **`ShowcaseSection.tsx:580`** tiene un `<Link href="#">` placeholder. No es del
  home; se reporta y no se toca.
- **Atributos `data-cursor` inertes** en 6 archivos: sin `CustomCursor` no hacen
  nada. Limpieza cosmética para cuando se toquen esos archivos.
- **`CustomCursor.tsx` y `NoiseOverlay.tsx` quedaron sin consumidores.** Se
  desconectaron, no se borraron (el brief pedía desconectar lo COMPARTIDO). Una
  poda posterior puede levantarlos.

### Archivos

Modificados: `src/app/layout.tsx` · `src/app/globals.css` · `src/app/contact/page.tsx` ·
`src/app/styleguide/_components/ComponentStates.tsx` ·
`src/components/layout/Navbar.tsx` · `src/components/layout/Hero.tsx` ·
`src/components/layout/SmoothScroll.tsx` · `src/components/ui/Button.tsx` ·
`src/components/design-system/CtaButton.tsx` ·
`src/components/design-system/SectionShell.tsx` · `src/hooks/useThemeObserver.tsx` ·
`src/lib/whatsapp.ts` · `src/lib/chromeReveal.ts` ·
`src/components/sections/home/Footer.tsx` ·
`src/components/sections/portal-demo-cta/PortalDemoCTA.tsx` ·
`src/components/sections/software-development/SoftwareDevelopmentCta.tsx` ·
`src/components/sections/web-development/WebDevelopmentCta.tsx` ·
`src/components/sections/web-development/WebDevelopmentTimeline.tsx` ·
`src/components/sections/web-development/PricingSection.tsx` ·
`src/components/ia/CtaIA.tsx` · `src/components/ia/VaultIA.tsx` ·
`src/components/automation/CtaAutomation.tsx` ·
`src/components/automation/VaultAutomation.tsx` ·
`src/components/automation/CalculadoraAutomation.tsx` ·
`src/components/software/DiagnosticoSoftware.tsx` ·
`src/components/software/ShowcaseSoftware.tsx`

Borrados: `src/components/layout/DynamicDock.tsx` ·
`src/components/layout/SectionTransition.tsx` ·
`src/components/sections/home/PortalDemo.tsx` ·
`src/components/sections/AIBentoGrid.tsx` · `src/components/ui/TypewriterText.tsx` ·
`src/components/ui/buttons/MagneticCta.tsx` · `src/lib/home-routes.ts`

---

## B2-S3 — La capa 3D del hero se revela · 2026-08-03

Commit: `fix(home): revela la capa 3D del hero con red de seguridad`
Rama: `redesign/home` (desde `5d844bb`).

Un solo objetivo: que el artefacto 3D se revele en desktop. No se rediseñó el
hero, no se tocó la capa tipográfica, no se tocó ningún token del sistema.
Archivo de código modificado: **uno**, `src/components/layout/HeroArtifactLayer.tsx`.

### T1 — La contradicción entre B2-S1 y B2-S2, resuelta

Las dos mediciones anteriores decían cosas incompatibles. B2-S1: "el artefacto
se lee bien sobre el fondo oscuro, verificado en captura". B2-S2: "la capa se
queda en `opacity: 0` de forma permanente, medido a lo largo de ~110 s".

**Las dos describen algo real. La de B2-S2 es un artefacto del entorno de
medición, no un defecto del build.**

La cadena de `onReady`, reconstruida con archivo:línea:

| # | Dónde | Qué hace |
|---|---|---|
| 1 | `HeroArtifactLayer.tsx:106` | declara `isRevealed` |
| 2 | `HeroArtifactLayer.tsx:138` | `handleReady = () => setIsRevealed(true)` |
| 3 | `HeroArtifactLayer.tsx:162` | `animate={{ opacity: isRevealed ? 1 : 0 }}` |
| 4 | `HeroArtifactLayer.tsx:166` | pasa `onReady` a `HeroCanvas` |
| 5 | `HeroCanvas.tsx:159` | pasa `onReady` a `ReadySignal`, dentro del `<Suspense>` |
| 6 | `HeroCanvas.tsx:71-88` | `ReadySignal` suspende en el SVG y, al montar, dispara `onReady()` tras dos `requestAnimationFrame` |

En un navegador que **renderiza**, esa cadena **se completa**. Medido sobre el
build de producción, Playwright, 1440x900, tres corridas:

| corrida | capa montada | capa revelada (`opacity` 1) |
|---|---|---|
| 1 | 1711 ms | **3409 ms** |
| 2 | 1889 ms | **3869 ms** |
| 3 | 2021 ms | **4075 ms** |

Dónde se corta, entonces. La cadena depende de que el documento produzca
**rendering steps**. Si no los produce —pestaña en segundo plano, ventana
ocluida, pane de preview— pasan dos cosas a la vez:

1. El `ResizeObserver` de `react-use-measure` **nunca entrega**. Sin eso, el
   gate de r3f en `react-three-fiber.cjs.dev.js:91`
   (`if (containerRect.width > 0 && containerRect.height > 0 && canvas)`) no se
   abre nunca, y `root.render(children)` no llega a correr: `ReadySignal` **ni
   siquiera se monta**.
2. Aunque se montara, los dos `requestAnimationFrame` no corren.

Reproducido de punta a punta en una pestaña oculta, contra el mismo build:

```
document.visibilityState = "hidden"   ·   frames de rAF en 1 s = 0
capa: opacity 0 durante 42 s seguidos (sin cambio)
<canvas>: 300x150  <- el default del elemento; r3f nunca lo dimensionó
requests de /logodevelOP.svg y /hdri/*.hdr: NINGUNO
```

Un único `window.dispatchEvent(new Event('resize'))` sintético destrabó todo:
el canvas pasó a 416x416, el SVG y el HDRI se pidieron por primera vez, y
`isRevealed` (leído del fiber de React) pasó a `true`. Es la prueba de que la
cadena estaba entera y lo que faltaba era el frame.

**Y la trampa de medición que anticipaba el brief existe y está confirmada:**

```
capa (motion.div)  -> getComputedStyle(...).opacity = "0"
<canvas> adentro   -> getComputedStyle(...).opacity = "1"
```

`opacity` no es heredada, así que el `<canvas>` computa `1` aunque su ancestro
esté en `0`. Medir el `<canvas>` en vez de su capa contenedora da verde siempre.

**Conclusión.** La captura de B2-S1 era correcta: reproducida con el mismo
método (Playwright sobre build de producción) se ve exactamente lo que
describía, filo especular incluido. Lo que B2-S2 midió es el síntoma exacto de
un contexto sin rAF —el mismo que la propia bitácora de B1-S3 ya había
registrado en el pane de preview, y el que volvió a aparecer en este sprint—, y
no se reproduce en un navegador que pinta. No se puede verificar a posteriori en
qué entorno corrió B2-S2; lo que sí se puede afirmar es que el conjunto de
síntomas que reportó se reproduce al 100% bajo esa condición y al 0% fuera de
ella.

**Pero B2-S2 apuntaba a una fragilidad real**, y buscándola apareció algo peor.

### T1.b — El hallazgo que nadie estaba buscando

La cadena de readiness tiene seis eslabones (chunk -> medición del contenedor ->
configuración de r3f -> SVG -> HDRI de 1,6 MB -> dos rAF). Se probó qué pasa si
uno falla. **El HDRI que no baja no dejaba la capa invisible: se llevaba puesto
el home entero.**

`<Canvas>` re-lanza hacia afuera cualquier error de su árbol (r3f lo atrapa con
su ErrorBoundary interno y lo re-tira desde `CanvasImpl`). Sin nadie que lo
contenga, escalaba hasta el `error.tsx` de la ruta. Medido sobre el build
previo, con el `.hdr` bloqueado:

```
heroAlive: false          <- el <h1> del hero ya no existe
scrollHeight: 900         <- la página entera reemplazada
scrollWorks: false        <- no scrollea
texto en pantalla: "ERROR DEL SISTEMA - Algo salió mal"
```

Un bloqueador, un proxy corporativo o un corte de red en un asset **decorativo**
tumbaba la home. Mismo resultado con el SVG bloqueado. Era una violación directa
de la condición 1 de la capa 2 ("cero bloqueo de scroll") y de lo que el propio
docblock del hero afirmaba: *"si el canvas nunca carga, el hero ya está completo
y usable"* — que hasta este sprint era falso.

### T2 — El arreglo

Dos piezas, las dos en `HeroArtifactLayer.tsx`. **No se reescribió la cadena de
readiness**: `onReady` sigue siendo el camino normal, y es el que corre siempre
que el navegador pinta.

**1. Red de seguridad del reveal (`REVEAL_SAFETY_MS = 6000`).** Mismo mecanismo
y mismo umbral que la red del scroll de `MarketingIntro`
(`MARKETING_SCROLL_SAFETY_MS`) -> un solo patrón en el repo, por la misma razón:
`setTimeout` no depende del rAF ni de la cadena de carga, que es exactamente
donde esta capa se cuelga. Se arma cuando el canvas se monta, no al montar el
componente: hasta ahí no hay nada que esperar. Es idempotente — si `onReady`
llega primero el cleanup cancela el timer; si dispara primero deja el mismo
estado final.

Revelar de más no cuesta nada, y esto es lo que hace que el umbral sea barato:
el canvas es transparente y el artefacto trae su propio fade de material
(`HeroArtifact`, opacidad 0->1 en el `useFrame`), así que una capa revelada antes
de tiempo **se ve igual que una sin revelar: vacía**. El costo de revelar de
menos, en cambio, es que no aparezca nunca.

**2. `CanvasErrorBoundary`.** Contiene el fallo del canvas en la capa. Al fallar
renderiza `null`: la caja queda vacía y la base tipográfica del hero —que es el
hero terminado— sigue intacta. Sin UI de error porque no hay nada que comunicar:
el artefacto es decorativo y la caja es `aria-hidden`. Sin esto, la red de
seguridad no alcanzaba: no sirve garantizar `opacity: 1` sobre un subárbol que
un error acaba de desmontar.

Se evaluó reutilizar un boundary existente: **no hay**. Los 20+ `error.tsx` del
repo son boundaries de ruta de Next (reciben `error`/`reset`), no envuelven un
componente. `AdminErrorBoundary` / `SectionErrorBoundary` son de esa familia.

### Verificación (medida, no afirmada)

`npm run build` **verde** · `tsc --noEmit` -> **1 error, byte a byte idéntico al
baseline** (`searchconsole.ts`, preexistente y ajeno; `diff` contra el baseline
sin diferencias) · `eslint` sobre los 3 archivos del hero -> **0**. Baseline del
repo, para contexto: 79 errores / 52 warnings, ninguno en estos archivos.

**Tabla de `opacity` de la capa a 1440x900, build de producción.** Se miden la
capa y el `<canvas>` por separado, a propósito, para dejar visible la trampa:

| t (ms) | capa (`motion.div`) | `<canvas>` | attr del canvas | scroll bloqueado |
|---|---|---|---|---|
| 424 | *(sin montar)* | — | — | no |
| 1002 | *(sin montar)* | — | — | no |
| 2004 | **0** | — | — | no |
| 5007 | **1** | 1 | 416x416 | no |
| 8019 | **1** | 1 | 416x416 | no |
| 12006 | **1** | 1 | 416x416 | no |

Antes del arreglo, en el mismo build y viewport, la tabla es idéntica: el camino
normal ya funcionaba. La diferencia está en los escenarios de abajo.

**La prueba de la red de seguridad.** Se simuló que el evento de readiness no
llega, colgando el asset (la ruta nunca responde y nunca falla -> ni `onReady` ni
error boundary; sin la red, `opacity: 0` para siempre):

| asset colgado | capa montada | capa revelada | delta desde el montaje | errores |
|---|---|---|---|---|
| HDRI (`.hdr`) | 1993 ms | 8580 ms | **6587 ms** | 0 |
| SVG del logo | 2082 ms | 8641 ms | **6559 ms** | 0 |
| chunk del canvas | 1987 ms | 8571 ms | **6584 ms** | 0 |

Los ~6,6 s son los 6000 ms del umbral más los 600 ms del fade de entrada
(`opacity > 0.99`) y la granularidad de 100 ms del muestreo. En los tres casos
el hero siguió vivo y la página scrolleable.

**Antes / después, con el asset caído (no colgado):**

| escenario | build previo | con el fix |
|---|---|---|
| HDRI caído | hero **muerto**, scroll **muerto**, pantalla de error | capa `opacity 1`, **hero vivo**, **scroll OK** |
| SVG caído | hero **muerto**, scroll **muerto**, pantalla de error | capa `opacity 1`, **hero vivo**, **scroll OK** |

**Las condiciones de la capa 2, una por una:**

- **A 390px no se monta ni se pide nada.** `display: none`, capa sin montar,
  **0 contextos WebGL**, **0 requests del chunk del hero**, **0 del HDRI**. El
  chunk se identificó por contenido (en producción sale con hash), y la
  referencia positiva a 1440 lo pide 1 vez (`4198.e70aac245b121123.js`) -> el
  detector no es un falso negativo. El único `/logodevelOP.svg` a 390px es el
  logo del navbar (a 1440 hay 2: navbar + loader del 3D).
- **`prefers-reduced-motion`**: no se monta. 0 chunk, 0 HDRI, 0 WebGL.
- **`frameloop` gateado**: draw calls de WebGL contadas en ventanas de 2 s ->
  **240 dentro del viewport, 0 fuera**. Fuera de pantalla no renderiza un frame.
- **Scroll libre desde el primer frame**: primera muestra que scrollea a
  **221 ms** en 1440 y **222 ms** en 390, con `overflow: visible` en `html` y
  `body`. En todos los escenarios de fallo también.
- **Carga diferida**: la capa monta a ~2,0 s, después del contenido.
- **Monocromo**: ver abajo.

**Consola.** Cero errores nuevos, medido contra el build previo servido en
paralelo, no afirmado. El único error que aparece en ambos builds es un
**React #418** (hydration mismatch) bajo `prefers-reduced-motion` — **idéntico
antes y después**, preexistente y ajeno a este arreglo (ver *Fuera de scope*).
Los errores en los escenarios de asset caído son el fallo de red en sí, que es
inevitable; lo que cambió es que ya no tumban la página. El `console.warn` del
boundary es deliberado y es warning, no error.

### T3.1 — Cómo se ve el artefacto

Se lee **monocromo**, y la condición 6 no necesita ajuste. **No hay aberración
cromática que atenuar**: `HeroCanvas` no monta `EffectComposer` —lo sacó B2-S1 a
propósito, documentado en su docblock (la dirección es monocroma, y la lección
del repo prohíbe el composer en canvas chicos transparentes). La preocupación de
la condición 6 no aplica a esta implementación; se verificó que no hay ninguna
fuente de color en el pipeline.

Lo que se ve: el lazo del logo en material negro metálico, con un filo especular
frío —blanco/gris acero, del HDRI de estudio— cayendo sobre el flanco derecho.
Neutro, sin tinte que pelee con la dirección.

**Una observación para juicio del humano, no un defecto:** el artefacto es muy
oscuro contra el `#0D0B09`. La lectura depende **casi por completo** del filo
especular; el flanco izquierdo y la base son negro sobre casi-negro y
prácticamente no se distinguen. Se lee como una insinuación, no como un objeto
sólido — que puede ser exactamente la intención. **No se tocó**: subirle
presencia es una decisión de dirección de arte, no un arreglo, y este sprint
tenía un solo objetivo. Anotado para B1-S5, que es el sprint de calibración.

**Caveat de método:** las capturas salen de Chromium con SwiftShader
(rasterizado por software). El material y los colores son fieles; el brillo y la
riqueza del reflejo en una GPU real serán algo mayores, nunca menores. La
observación de "muy oscuro" es entonces un piso, no un techo.

### Nota de método — verificación visual

Se despachó el subagente `visual-qa` como manda `CLAUDE.md`. **No pudo entregar
reporte**, por la misma razón que en B2-S1: no tiene acceso a sus herramientas de
preview en este contexto (y el servidor corría en un puerto no declarado en
`.claude/launch.json`, archivo trackeado y fuera de scope). Es una limitación del
harness, no un hallazgo sobre el hero.

La verificación visual se hizo con Playwright sobre el build de producción, con
capturas leídas a mano. Sigue siendo el método más confiable acá por lo mismo que
este sprint terminó de demostrar: el pane de preview mide **0 fps de rAF**, lo que
congela WebGL y da falsos negativos exactamente en lo que hay que mirar. Es,
literalmente, el bug que se acaba de diagnosticar.

### Fuera de scope, anotado y NO implementado

- **React #418 (hydration mismatch) bajo `prefers-reduced-motion` en `/`.**
  Presente **igual** en el build previo y en el actual -> preexistente, ajeno a
  este sprint. No se investigó de dónde sale. Es el único error de consola vivo
  en la home.
- **El HDRI de 1,6 MB es el cuello de botella del reveal.** Con throttling
  fast-3G la capa tarda **~11 s** desde el montaje (contra ~1,8 s sin
  throttling): la red de seguridad la revela a los 6 s y el artefacto entra
  después. Funciona, pero la palanca real es el peso del `.hdr` — comprimirlo o
  bajarlo de resolución. No se tocó: es un asset, no la cadena de readiness.
- **`ReadySignal` comparte el `<Suspense>` con `<Environment>`**
  (`HeroCanvas.tsx:158-165`), así que `onReady` espera al HDRI aunque el SVG ya
  esté listo. Separarlos haría que el logo aparezca antes y el reflejo después.
  Es un cambio de comportamiento visual, no un arreglo — queda anotado.
- **El escenario "chunk caído" del barrido no bloqueó nada**: el patrón de ruta
  apuntaba al nombre de desarrollo y en producción el chunk sale con hash. La
  cobertura real del chunk viene de la prueba de colgado (identifica el chunk
  por contenido), que sí es válida.

### Archivos

Modificados: `src/components/layout/HeroArtifactLayer.tsx` ·
`docs/bitacora-rediseno.md`

---

## Instalación de Impeccable y baseline del detector · 2026-07-31

Rama `redesign/home`, sobre `c216079`. **No se tocó una sola línea de código de producto**: esta entrada es harness + medición.

### Qué es y qué no es acá

Impeccable aporta vocabulario y detección de anti-patrones. **No aporta dirección estética.** La dirección del sitio ya está cerrada ("instrumento de precisión, editorial") y la manda el proyecto. Donde el detector contradiga la dirección, gana develOP y queda anotado como descartado.

### Versión y estado del hook

- **Versión instalada: `impeccable` v3.5.0** (`npx impeccable install`, ejecutado desde `logic-core-v3/`).
- El instalador detectó como raíz de proyecto la **raíz del repo** (`PorfolioDevelOP/`), no `logic-core-v3/`. Instaló en dos targets:
  - `.claude/skills/impeccable/` + hook mergeado en `.claude/settings.local.json`
  - `.github/skills/impeccable/` + `.github/hooks/impeccable.json` (Copilot)
- **El hook quedó activo.** Dos disparos: `PostToolUse` sobre `Edit|Write|MultiEdit` (timeout 5s, chequeo inmediato) y `Stop` (timeout 30s, pasada profunda con todas las reglas).
- **El merge no pisó nada.** El instalador hace `{...existing, hooks: merged}` y solo escribe `.bak` si el JSON previo no parsea — no hubo `.bak`, así que no se perdió configuración local.
- **Verificado a mano en Windows**: se le pasó un payload de `PostToolUse` real al hook y devolvió `hookSpecificOutput` correcto, exit 0. El comando usa sintaxis POSIX (`[ ! -f … ] || node …`), o sea que depende de que el harness lo corra bajo Git Bash — se verificó bajo Git Bash, no bajo `cmd`.
- **`.claude/` está en el `.gitignore` de este repo** ("tooling local de agentes, no es código del proyecto") y **no se tocó el .gitignore**. Consecuencia operativa: el skill y el hook de Claude Code **no se versionan** — en una máquina nueva hay que correr `npx impeccable install` otra vez. Sí quedan versionados `.github/skills|hooks`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` y los reportes.

### El baseline (el número contra el que se mide cada bloque)

Detector determinista, local, sin modelo ni API key. Auditar no consume tokens. Reporte completo en `docs/impeccable-baseline.md`; salida cruda en `docs/impeccable-baseline.json`.

| Scope | Hallazgos |
|---|---:|
| `src/` completo | **115** (todos severidad `warning`, cero `error`) |
| Scope pedido "sitio público" (`src/app` + `sections` + `ia` + `automation` + `software`) | 65 |
| ↳ de esos, dentro de `src/app/(protected)` y `src/app/api` (portal, no es sitio público) | 19 |
| ↳ **superficie pública real** | **46** ← este es el número del rediseño |
| `src/components/design-system/` | **0** ← este es el techo a sostener |

Desglose de `src/` por tipo: `gray-on-color` 56 · `gradient-text` 37 · `ai-color-palette` 6 · `side-tab` 5 · `overused-font` 5 · `bounce-easing` 3 · `layout-transition` 2 · `broken-image` 1. **51 de los 115 son categoría `slop`** (44%).

Desglose de los 46 públicos: `gradient-text` 34 · `ai-color-palette` 4 · `gray-on-color` 3 · `layout-transition` 2 · `bounce-easing` 2 · `side-tab` 1.

**El 74% del slop público es una sola cosa: `bg-clip-text` + gradiente en titulares y métricas.** Y está *distribuido*, no concentrado: 30 de los 36 archivos afectados tienen exactamente un hallazgo. Los peores son `WebDevelopmentBento.tsx` y `home/Portfolio.tsx` con 4 cada uno. Se limpia bloque por bloque; no hay un componente podrido que arreglar de una.

Reales y accionables además del gradiente: `layout-transition` en `OurServices.tsx:7639` (anima `width`) y `VaultIA.tsx:226` (anima `padding`) — contradicen la regla de performance del propio repo; `bounce-easing` en `WebDevelopmentBento.tsx:171` y `ComparadorSection.tsx:44` (`bounce-chevron … infinite`), que es motion perpetuo, anti-referencia explícita de la dirección nueva.

### Descartados (Impeccable pierde contra la dirección de develOP)

1. **`overused-font` ×5 y 4 de los 5 `side-tab`: son plantillas de email HTML.** `font-family:Arial` y `border-left: 4px solid` en `client-notifications/templates.ts`, `sendLeadNotification.ts`, `notify-message.ts`, `detectBotIssues.ts`, `auth.ts`. Arial es fallback deliberado en clientes de correo. El detector no distingue email de web. **Falso positivo de contexto.**
2. **La regla `overused-font` lista Geist como tipografía "sobreexpuesta".** La dirección fija Geist + Geist Mono, y la mono es elemento de identidad. **Gana develOP; no se reabre la discusión de tipografía.**
3. `gray-on-color` ×56 no se descarta — es contraste, no estética — pero **se difiere**: solo 3 caen en superficie pública, el resto es portal/chatbot.

### `PRODUCT.md` y `DESIGN.md`

Escritos en la raíz del repo con la dirección **ya cerrada**; no se dejó que la herramienta inventara nada.

- **`PRODUCT.md`** declara alcance explícito: **solo el sitio de marketing** (home + 4 landings + contacto). El portal queda fuera de alcance por escrito, para que Impeccable no opine sobre pantallas que ya tienen su propio lenguaje visual cerrado. Registra el CTA único por WhatsApp, la voz (voseo, sin jerga de agencia), y la lista de lo que **no existe y no se puede fabricar**: sin testimonios, sin logos de clientes, sin benchmarks, sin casos publicados, sin pricing.
- **`DESIGN.md`** sigue el spec oficial (frontmatter de tokens + 8 secciones canónicas). Los tokens **se extrajeron del `@theme static` real** de `globals.css`, no se inventaron. Sidecar en `.impeccable/design.json` con las 6 primitivas del sistema como snippets HTML/CSS autocontenidos.
- **Gate 1 queda abierto y anotado, no resuelto.** El brief de dirección dice que el acento de Software es *índigo*; el token vigente es `#8b5cf6` (violeta), y `globals.css` ya deja anotado que `CLAUDE.md` asigna los mismos cuatro hex a servicios distintos. `DESIGN.md` refleja el código y marca la decisión como pendiente de Franco en `/styleguide`.

### Efecto lateral de tener `DESIGN.md`: el hook se vuelve mucho más ruidoso

Con `DESIGN.md` presente se activa la regla **`design-system-color`**, que compara cada color literal contra la paleta del sistema. Medido: sobre `home/Portfolio.tsx` el detector plano reporta **4** hallazgos y el hook reporta **39**. Es esperado —el sitio todavía no está rediseñado y casi ningún color literal pertenece a la paleta nueva— pero conviene saberlo antes de asustarse: durante B2 el hook va a gritar en cada archivo viejo que se toque. El número que importa sigue siendo el del detector plano.

### Reglas de uso vigentes (hasta que B2 esté terminado y revisado)

**Permitido ya:** `npx impeccable detect` cuantas veces se quiera, el hook automático durante los sprints, y `/impeccable audit` + `/impeccable critique` (solo lectura).

**Prohibido:** `/impeccable polish`, `bolder`, `quieter`, `distill`, `animate` y cualquier comando que escriba código; Live Mode; y cualquier corrida masiva sobre el sitio entero. Motivo: mientras B2 construye estructura, un segundo agente reescribiendo estética en paralelo genera estética por acumulación — que es exactamente lo que produjo el estado actual del sitio. Las herramientas de escritura entran después, sobre una sección por vez.

### Cómo se re-mide al cerrar cada bloque

```bash
npx impeccable detect src/app src/components/sections src/components/ia src/components/automation src/components/software
```

Contra **46**. Y `npx impeccable detect src/components/design-system` tiene que seguir dando **0**.

> El detector sale con **exit code 2** cuando encuentra hallazgos. No es un fallo de la herramienta.

---

## Calibración del sistema · 2026-08-03

No es un rediseño: es una pasada de corrección sobre valores y defectos ya
identificados. La arquitectura se dio por buena y no se tocó — el theming local de
`SectionShell`, el padding vertical, la disciplina plana, los pares de texto
calibrados y la matriz de estados del styleguide quedaron como estaban.

### La causa raíz, y por qué era una sola

Los pisos de todos los `clamp()` se habían elegido como **mínimos individuales**,
cada uno defendible por separado. Pero en mobile todos tocan su piso a la vez, así
que el piso no es una lista de mínimos: **es la escala completa que ve la mayoría de
la audiencia**. La jerarquía existía en el rango fluido y colapsaba justo donde vive
el negocio.

Medido a 390px, antes: `lead` 18 contra `body` 17 (1.06× — el único separador real
era el color) y la cifra de `data` 32 contra un titular de 36 (0.89× — el dato
competía con el título de su propia sección).

Los pisos se re-eligieron como escala. Las dos invariantes se verificaron con un
**barrido continuo de 320 a 1920px**, no solo en los tres breakpoints — y ahí
apareció un valor que pasaba en 390 y 1440 pero fallaba en el medio (`data` daba
0.85 a 768px con la primera rampa propuesta), así que la rampa se rehízo.

| | 390px | 768px | 1440px | peor caso 320–1920 |
|---|---|---|---|---|
| `lead`/`body` (≥1.20) | 1.06 → **1.25** | 1.06 → **1.25** | 1.29 → **1.29** | **1.25** a 320px |
| `data`/`display-lg` (≤0.75) | 0.89 → **0.67** | 0.83 → **0.70** | 0.82 → **0.71** | **0.706** a 1372px |

Escala renderizada a 390px, después: 52 · 36 · 26 · 24 · 20 · 16 · 12.

**El peldaño que faltaba.** Entre `display-lg` (68px) y `lead` (22px) había un salto
de 3.09× sin nada en el medio, así que las secciones con estructura interna caían
del titular directo a la mono de 12px. `--text-ds-subhead` lo ocupa: ahora son 1.79×
y 1.73× a 1440. Es escala, no una familia nueva.

**El bug de la unidad `ch`.** `ch` es relativo al `font-size` **del propio
elemento**. El subhead a 55ch sobre 22px rendía 802px contra los 732px de la prosa a
65ch sobre 17px: el subhead salía **más ancho** que la prosa, lo contrario de lo
documentado. Se recalculó a 42ch en vez de pasar a una medida absoluta — `ch` es la
unidad correcta para una medida de lectura, y un `rem` se habría roto igual de
silencioso en cualquier elemento que no corriera al tamaño para el que se calculó.
Verificado en el DOM: 612.6px contra 732.2px.

### La dosis del acento es de color, no de área

El acento vivía en un tick de 6×6 px: **36 px² por fila**. Con tan poca área,
sacarle el color a las cuatro filas casi no perdía información — un identificador
que no identifica. Ahora pinta el nombre del frente (`Subhead`) y su plazo: **16.412
px² por fila**, medido en el DOM. El tick se fue porque repetía el mismo dato. Sigue
sin haber glow, gradiente ni borde lateral: la anti-referencia es de forma, no de
tamaño.

**Los acentos viven solo sobre oscuro**, y ahora es regla escrita y no un hueco.
Tres de los cuatro no llegan a 3:1 sobre crema (cian 2.10, verde 2.19, ámbar 1.86).

**Dos observaciones se dejaron medidas y sin resolver, a propósito.** El violeta es
el más flojo sobre oscuro (4.64:1 contra 7.7–9.1) y cian-contra-verde es el par más
cercano (0.125 OKLab, la mitad del siguiente par). Los dos se arreglan moviendo un
hex — y los cuatro hex están congelados en `CLAUDE.md` y pendientes del Gate 1, que
todavía puede permutar qué color le toca a qué servicio. Mover un valor ahora sería
decidir el Gate por la ventana.

> El sprint pedía "oscurecer" el violeta para acercarlo a los otros tres. Sobre
> lienzo oscuro eso va al revés: oscurecer **baja** el contraste. Para acercarlo
> habría que aclararlo.

### El CTA

- **Se fue el canto superior iluminado.** Medía **1.18:1** contra el fondo del
  propio botón: no era una señal débil, era una línea que solo existía en la spec.
  El relieve son dos señales, no tres.
- **Un solo press.** Convivían `active:translate-y-[2px]` (CSS) y `whileTap: scale
  .97` (Framer), sin pisarse porque animan propiedades distintas. Quedó el
  hundimiento: un objeto físico se hunde, no se comprime. El gateo vive en
  `hasFramerPress()`, del lado de la variante, así que vale también para quien use
  `Button` directo. La rama con `href` dejó de ser `motion.a` y es un `<a>` pelado.
- **El secundario tiene frontera.** Usaba el token de regla (1.23:1) y WCAG 1.4.11
  pide 3:1 para el borde de un componente interactivo: el botón no tenía frontera en
  reposo y aparecía recién en `hover` — o sea nunca a touch, y con el `hover` más
  visible que el reposo. Token propio `--color-ds-control-stroke`: **3.55:1** en
  oscuro, **3.48:1** en crema.
- **`disabled` sigue perceptible**: 1.73:1 en oscuro y 1.74:1 en crema, más visible
  que el borde en **reposo** del diseño anterior. WCAG exime a los controles
  inactivos del mínimo; lo que se exigía acá era que se siga viendo.
- **La sombra invierte con el tema.** Estaba en `@theme static` con negro al 90%,
  calculada contra lienzo oscuro. Se movió a la capa semántica. Verificado en el DOM
  que `shadow-[var(--shadow-ds-control)]` resuelve por elemento: `rgba(0,0,0,.9)` en
  oscuro, `rgba(26,23,19,.30)` en crema.

### El índice de capítulos, y la colisión que frenó el sprint

`ChapterLabel` estaba en 2 de 6 secciones y con dos formatos (`( 01 )` en la
segunda, `( 03 — Un lunes cualquiera )` en la tercera): dos marcas sueltas que no
numeraban nada. Ahora están las seis, correlativas, **solo con el número** — el
título repetía el titular que va justo debajo. **El hero lleva el `01`**: una
portada sin numerar deja el índice arrancando en "01" sobre la segunda sección, que
era justo la inconsistencia a corregir.

**T7 chocó con T4 y se frenó, como pedía el sprint.** La alternancia estricta
arrancando en oscuro deja S4 en crema — y S4 "Cuatro frentes" era la única sección
con acentos, tres de los cuales no llegan a 3:1 sobre claro. Se reportó con la
medición en vez de improvisar otro orden. **Franco eligió intercambiar S4 y S5.**

Orden final: `01` oscura (hero) · `02` crema (la prueba) · `03` oscura (la prueba
viva) · `04` crema (los 3 contrastes) · `05` oscura (los 4 frentes, con acentos) ·
`06` crema (cierre). Verificado en el DOM: **cero empalmes con el mismo tema** y
**cero acentos sobre crema**. Cerrar en crema es consecuencia deseada — obliga a que
el CTA funcione sobre claro, que era un hueco real: los 22 botones del styleguide
vivían sobre oscuro.

### Dos premisas del sprint que no se sostuvieron

1. **`/styleguide` sí estaba recibiendo el chrome.** Confirmado: `isPortalRoute()`
   solo excluía los cuatro prefijos de portal. Se agregó `CHROME_FREE_PREFIXES` y un
   `isChromeFreeRoute()` que consultan los dos gates — `isPortalRoute` se conservó
   aparte porque responde otra pregunta ("esto es producto?"). Verificado en el DOM
   de la página: **0 `backdrop-filter`, 0 gradientes**, y el único `<nav>` es el
   índice propio del styleguide.
2. **`NoiseOverlay` ya no corría en ninguna ruta.** La premisa describía el estado
   pre-B2-S2; el componente se había desmontado ahí y no le quedaba ni un consumidor
   en todo el repo. Desmontado no hacía nada, pero el archivo seguía llevando adentro
   una animación `infinite` a 5 Hz sin gate de `prefers-reduced-motion` — lo que la
   lista de "Don't" prohíbe — y alcanzaba con volver a importarlo. **Se borró.**
   `CustomCursor.tsx` está en la misma situación y queda anotado para una poda aparte.

### Verificación

- `npm run build` verde · `tsc --noEmit` limpio · `prisma migrate status` al día.
- Escala, medidas, sombras, bordes, temas y acentos medidos **en el DOM** a 390 /
  768 / 1440, no estimados.
- Hero de B2-S1 intacto a 390 y 1440: sin overflow horizontal, sin canvas en mobile,
  scroll disponible, `( 01 )` presente, CTA sin `border-top`.
- Detector: `design-system` sigue en **0** (el techo). Superficie pública 65 → **64**.

### Lo que quedó pendiente

**T8 (legibilidad del artefacto 3D) no se ejecutó.** Requiere juicio visual y
capturas antes/después a 1440px, y el Browser pane no estaba compositando en toda la
sesión (`screenshot` devolvía "the pane is not displayed"). Con el pane oculto el
`rAF` no dispara: medir la capa 3D ahí no mide el artefacto, mide un cuelgue que no
existe. Se prefirió dejarlo abierto antes que cerrarlo a ciegas. Todo lo demás se
verificó por DOM, que no depende del compositor.

---

## B2-S4 — Legibilidad del artefacto 3D y poda de muertos · 2026-08-04

Cierra el T8 que B1-S5 dejó abierto (juicio visual, sin compositor disponible),
resuelve la observación de cian↔verde que quedaba pendiente del Gate 1 y borra el
último archivo desmontado.

**Método de captura: Playwright headed, no el Browser pane.** El pane falló en cinco
sprints consecutivos sobre este mismo objetivo. Se lanzó un Chromium con ventana real
y se **midió el `rAF` antes de afirmar nada**: 33/s antes, 32/s después. Con la
pestaña oculta el `rAF` queda en 0 y no arranca la cadena del canvas — ahí no se mide
el artefacto, se mide un cuelgue inexistente. El revelado se midió sobre el
**contenedor** (`motion.div`), no sobre el canvas: `getComputedStyle(canvas).opacity`
devuelve `"1"` aunque su capa esté en 0.

### T1 — El artefacto 3D (el punto principal)

**La causa está en el material, y el material está congelado.** `HeroArtifact.tsx`
pinta `color="#000000"` con `metalness={1}`: como metal eso deja F0 = 0, así que el
objeto **no refleja nada de frente**, sólo en ángulos rasantes. Lo único que responde
frontalmente es el `clearcoat` (capa dieléctrica, F0 = 0.04) — el barrido brillante
que ya tenía la panza de la "p" es el clearcoat espejando un softbox del HDRI al 4 %.

Se recorrió el orden que fija el sprint y se descartó con medición, no por argumento:

1. **Encuadre.** Probado en las dos direcciones (yaw −0.4 y +0.5). Rotar sólo **mueve
   el único parche iluminado de un flanco al otro**: con −0.4 desaparece el barrido y
   queda una silueta plana; con +0.5 se ilumina la izquierda y se apaga la derecha. Es
   el mismo problema espejado, no un arreglo. Con F0 = 0 no hay orientación que
   ilumine una cara frontal plana.
2. **Material.** Congelado. No se toca.
3. **Iluminación.** Acá cae el arreglo.

Dentro de iluminación también hubo descartes medidos, que quedan escritos porque son
la parte no obvia:

- **Luces puntuales no sirven.** Con `roughness={0}` / `clearcoatRoughness={0}` la
  superficie es un espejo perfecto, y un espejo refleja una fuente puntual en un
  ángulo sólido casi nulo. Tres `directionalLight` fuertes no cambiaron nada. A un
  espejo lo ilumina el **entorno**, no las luces.
- **Subir el HDRI solo tampoco.** A `environmentIntensity={6}` la derecha se quema y
  la izquierda apenas pasa a gris azulado: es un HDRI de un solo lado, y escalarlo
  amplifica el desbalance en vez de corregirlo.
- **Un relleno frontal grande apaga el barrido.** Las caras frontales planas comparten
  normal, así que reflejan todas la misma dirección: lo que se ponga ahí sale
  **uniforme**. Con relleno alto el objeto queda gris plano, sin metal.
- **Un relleno frontal chico deja un corte recto.** Por lo mismo, el borde duro de una
  fuente finita se espeja como una **línea recta atravesando el objeto**.
- **Cualquier panel tapa el HDRI que tiene detrás.** Los paneles grandes ocultaban el
  lóbulo brillante al cubo de render y el barrido desaparecía.

**El rig que quedó** son dos piezas, en `HeroCanvas.tsx` (no congelado):
`environmentIntensity={2.2}` sobre el HDRI —degradé fotográfico, sin bordes, que es lo
que da el carácter metálico— más **tres `Lightformer` circulares concéntricos**, sólo
a la izquierda y con `z` positivo (detrás de la cámara, que es la dirección que
espejan las caras frontales). Concéntricos y en escalones porque aproximan una caída
suave donde un solo círculo dejaba el corte recto; sólo a la izquierda porque a la
derecha taparían el barrido.

También se sacó el `ambientLight intensity={1.5}`: **no aportaba un solo fotón**. La
luz ambiente sólo alimenta el término difuso y con `metalness=1` el difuso es 0; el
clearcoat es puramente especular. Verificado sacándola — el render queda
indistinguible.

**Resultado, medido sobre el mismo recorte en las dos capturas:**

| | antes | después |
|---|---:|---:|
| Píxeles visibles del artefacto | 15.258 | **47.536** (3,1×) |
| Spread RGB promedio (monocromía) | 16,46 | **4,11** |
| % de píxeles con spread > 20 | 35,9 % | **5,9 %** |
| Brillo promedio | 167 | 88 |

El área visible se **triplicó** y el render quedó **4× más neutro**: la monocromía
mejoró, no se degradó. Más oscuro en promedio y mucho más visible en total es
exactamente "instrumento de precisión iluminado", no "objeto con luz propia".

Capturas: [`hero-1440x900-antes.png`](proof-screenshots/b2-s4/hero-1440x900-antes.png)
· [`hero-1440x900-despues.png`](proof-screenshots/b2-s4/hero-1440x900-despues.png).
Quedan además las 9 variantes intermedias del descarte, con el nombre de cada hipótesis.

**Las siete condiciones de la capa 2, medidas:**

| Condición | Medición |
|---|---|
| Cero bloqueo de scroll | `scrollY` 0 → 2500 |
| Carga diferida | sin pedidos 3D hasta que la capa monta |
| No monta a 390px | 0 canvas, **0 pedidos 3D** |
| No monta con `prefers-reduced-motion` | 0 canvas, **0 pedidos 3D** |
| Presupuesto sin aumentar | **delta 0 bytes** (1.733.868 antes y después) |
| Monocromo | spread promedio 16,46 → **4,11** |
| `frameloop` gateado | fuera de vista **4** draw calls en 2,5 s; en vista **724** en 2 s |

Draw calls por frame: **2 antes, 2 después**. No se agregó geometría.

### T2 — Distinguibilidad de los acentos: se distinguen, no se tocó ningún hex

Capturado a 1440 y a 390 con los cuatro acentos puestos. **Las cuatro filas se
distinguen por su acento en las dos anchuras**, cian incluido contra verde, y hasta en
las mono de 12px de los plazos. La observación del critique estaba medida sobre un
tick de 36 px²; sobre los 13.704–16.646 px² que hoy ocupan los nombres, los 0.125 de
OKLab alcanzan de sobra. **Punto cerrado sin mover ningún valor.**

Se documentó en `DESIGN.md` como regla nueva —*la distinguibilidad depende del área*—
con las dos capturas como evidencia, y de paso quedó escrita al derecho la
instrucción que el sprint anterior tenía al revés: **sobre lienzo oscuro se aclara
para subir contraste, no se oscurece**. No hizo falta aplicarla; queda para que nadie
la aplique invertida. El Gate 1 se marcó **cerrado con la opción A** en `DESIGN.md` y
en `accent.ts`. `CLAUDE.md` no se tocó: los cuatro hex siguen exactamente igual.

Queda abierta y anotada una sola observación: el violeta es el más flojo sobre oscuro
(4.64:1 contra 7.7–9.1). Pasa 3:1. No se toca.

> **Nota de numeración.** El sprint pedía "la sección de servicios (S4)". En el código
> los cuatro frentes son **S5** (`id="home-s5"`); S4 es "Por qué develOP", que no lleva
> acentos. Se capturó S5, que es inequívocamente la sección de los cuatro acentos. El
> cruce viene de B1-S5, que intercambió las dos secciones para que la única con acentos
> cayera en posición oscura.

### T3 — `CustomCursor.tsx` borrado

`grep` sobre `.ts/.tsx/.js/.mjs`: **cero importadores**. Los cuatro hits que quedaban
eran comentarios. Borrado, y actualizados los tres comentarios que lo nombraban
(`layout.tsx`, `design-tokens.ts`, `ChatWindow.tsx`) para que no apunten a un archivo
que ya no existe.

### Verificación

- `npm run build` **verde** · `npx tsc --noEmit` **0 errores** (el preexistente de
  `searchconsole.ts` tampoco aparece) · `eslint` sobre los cuatro archivos tocados: **0**.
- Detector: `design-system` sigue en **0** (el techo) · superficie pública **64**,
  igual que el baseline. Cero nuevos.
- Consola: **1 entrada antes, 1 después** — la misma advertencia de shader de THREE,
  preexistente. Cero errores nuevos, medidos contra build previo, servidor reiniciado
  y pestaña nueva.

### Fuera de scope — anotado, no implementado

**Las clases `cursor-none` siguen puestas y ahora esconden el cursor del sistema sin
reemplazo.** `CustomCursor` se desmontó en B2-S2, pero las clases quedaron sobre
elementos **interactivos** en `Portfolio.tsx` (4, incluidas dos flechas de navegación),
`About.tsx`, `CalculadoraAutomation.tsx` (2), `FlujoAutomation.tsx`,
`PortfolioWebCases.tsx`, `LogicCompanion.tsx` y `ChatWindow.tsx` — este último con una
regla CSS `cursor: none` propia en `:695`. Hoy un usuario que pasa por encima de esos
elementos **no ve ningún cursor**. Es una regresión de accesibilidad ya viva en la
rama, anterior a este sprint. Necesita una pasada propia.

---

## B3-S1 — S2, el caso real · 2026-08-04

`Portfolio.tsx` deja de ser un carrusel de seis tarjetas y pasa a ser la lámina de
un case study: **un** caso real arriba, demos conceptuales abajo, y la jerarquía
diciendo cuál es cuál.

### La regla de contenido, aplicada

Lo único real que entró tal cual es **Concesionaria San Miguel** y su rubro. Todo lo
demás está marcado. No se inventó ninguna cifra, ningún porcentaje, ningún nombre de
cliente y ningún plazo: los placeholders tienen la **forma** del texto final (misma
extensión, misma estructura) y el **contenido** dice que falta.

Lo que sí se escribió son los **labels** de las cifras (`CONSULTAS CANALIZADAS`,
`TIEMPO A PRODUCCIÓN`, `VEHÍCULOS PUBLICADOS`): el label es la categoría de lo que se
midió — una decisión ya tomada — y escribirlo es lo que deja juzgar si la fila de
datos tiene el peso que la sección necesita. El valor es el dato, y el valor está
marcado.

Los cinco demos inventados (Clínica Médica, Gimnasio, Restaurante, Inmobiliaria,
Portal SaaS) **se fueron**: eran rubros elegidos sin decisión comercial detrás,
presentados con la misma tarjeta que el cliente real. Quedan tres slots marcados
`[RUBRO 1..3]` y la aclaración pasó de nota al pie en gris chico a cuerpo de la
sección: «No son clientes: son demostraciones».

### Decisiones

**Server Component, cero JS.** El archivo no lleva `'use client'`. Se fueron
`useState`, `useRef`, `useInView`, `useMotionValue`, `useTransform` y
`AnimatePresence` — todo eso existía para mover el carrusel. El reveal es
`animate-ds-reveal`, la animación CSS del sistema (opacity + translateY, una sola
iteración, y el bloque global de `prefers-reduced-motion` la aterriza en su keyframe
final). Sin Framer no hay `initial={{opacity:0}}` serializado en el SSR, así que la
sección no tiene el modo de fallar «si el JS no llega, no se ve nada».

**Un solo árbol JSX.** El responsive va por clases. La versión anterior servía
`PortfolioDesktop` y `PortfolioMobile` **completos** y los tapaba con
`hidden md:block` / `block md:hidden`: los dos árboles viajaban en el HTML.

**Sin acentos.** La sección corre en crema (`data-ds-theme="light"`, verificado en el
DOM: `rgb(242, 238, 230)`). Tres de los cuatro acentos no llegan a 3:1 sobre ese
lienzo — cian 2.10, verde 2.19, ámbar 1.86. No hay excepción que pedir.

**El `ChapterLabel` va solo con el número.** El sprint pedía `( 02 — LA PRUEBA )`,
pero el formato con título es justo el que B1-S5 sacó del home porque repetía el
titular de la sección, que va dos líneas más abajo. Lo que decía el título lo dice el
`MonoLabel` de al lado (`CASO REAL`), que es la etiqueta del contenido y no un segundo
kicker. Es el mismo par que ya tenía el esqueleto de `/styleguide`.

### El bug que apareció midiendo, no leyendo

La primera versión metía los resultados en la columna angosta de un grid de dos
columnas, al lado de la narración. **Las tres cifras se pisaban entre ellas a 1440.**
`--text-ds-data` llega a 48px en mono: una cifra de 6-9 caracteres pide ~170px, y esa
columna daba ~150px. No se ve leyendo el JSX — se ve en la captura.

Los resultados pasaron a **ancho completo**, debajo de la narración. Cada cifra tiene
ahora ~380px. Y además es lo que la sección quiere decir: en la lámina de la prueba la
cifra es el objeto principal, no una nota al margen. Costo: la sección creció de 1.39 a
**1.69 pantallas** a 1440. Se paga.

### Verificación

Medida con **Playwright headed** contra el build de producción en `:3001`, servidor
reiniciado. El Browser pane de esta sesión no compone: deja las siete secciones
`dynamic()` colgadas en su fallback, la hidratación nunca termina y toda geometría da
0. Queda anotado porque va a volver a pasar.

| Gate | Resultado |
|---|---|
| `npm run build` | **verde** |
| `npx tsc --noEmit` | **exit 0** |
| `eslint` sobre `Portfolio.tsx` | **0** |
| `section#portfolio` en el DOM | **1** |
| `<h2>` «Esto ya funciona.» en el DOM | **1** a 1440 y a 390 |
| Heading en el HTML servido (sin el payload RSC) | **1** |
| Restos del carrusel viejo (`NUESTROS TRABAJOS`, `POR RUBRO`, `DEMOS Y CONCEPTOS`) | **0** |
| `backdrop-filter` en la sección | **0** |
| `background-image: *gradient*` en la sección | **0** |
| Radio ≠ 0 en superficies no interactivas | **0** |
| Scroll horizontal | **no**, a 1440 y a 390 |
| Errores de consola | **0** a 1440 y a 390 |
| Detector — `design-system/` | **0** (se sostiene) |
| Detector — superficie pública | **60** contra baseline 64. Bajó 4: los cuatro `gradient-text` vivían en este archivo |
| Detector — `Portfolio.tsx` solo | **0** |

**Altura de la sección**

| Viewport | Alto | En pantallas |
|---|---:|---:|
| 1440 × 900 | 1520 px | **1.69** |
| 390 × 844 | 1893 px | **2.24** |

Los 2.24 de mobile son con placeholders de forma realista, que es el punto: el texto
marcado ocupa lo que va a ocupar el definitivo. El número es interpretable, no una
medición de relleno arbitrario.

**Peso.** El chunk de la ruta `/` quedó en 79.78 KB gz contra 79.64 KB antes (+0.14).
El total de `static/chunks` bajó de 2342.3 a 2338.8 KB gz y desapareció un chunk: es
el JS del carrusel yéndose. El chunk de `/page` sube apenas porque las piezas del
sistema de diseño que la sección ahora importa cruzan a ese lado del corte.

### Fuera de scope — anotado, no implementado

1. **`About.tsx` sigue sirviendo dos árboles JSX completos.** Es la otra mitad del
   patrón que infló el documento. El HTML servido de `/` quedó en **421.3 KB**; no
   tengo baseline del documento previo a este sprint (la primera medición ya fue con
   S1 puesto), así que el número queda como referencia, no como delta.
2. **`page.tsx` sigue importando `Portfolio` con `next/dynamic` y un `loading:` de
   `animate-pulse`.** Ahora que la sección es un Server Component sin JS propio, ese
   `dynamic()` no code-splitea nada útil. Buildea y sirve bien, así que no se tocó:
   `page.tsx` no es de este sprint.
3. **Los `[RUBRO 1..3]` y el `[URL DEL CASO]` son decisión de Franco**, no deuda
   técnica. La lista consolidada de placeholders, con archivo y línea, va al cerrar B3.

> **Gate de merge.** Esta rama tiene placeholders a la vista. **No se mergea a `main`**
> hasta que Franco cierre el contenido marcado.

---

## B3-S2 — S3, el panel del lunes · 2026-08-04 · CIERRE DEL BLOQUE B3

El concepto se conserva entero —tres momentos de una mañana, no una lista de
features— y la ejecución se rehace completa.

### Lo que se sacó por falso, no por feo

Esta es la sección que sirve de prueba, así que cada cosa que aparece se verificó
**contra el código del portal**. Lo que la versión anterior afirmaba y el panel
no hace:

| Afirmaba | Realidad |
|---|---|
| «develOP filtró los 14 mails, 8 mensajes y 3 alertas que te llegaron» | El panel **no lee tu correo**. `AttentionStack` arma sus ítems con datos propios: entregas, facturas, reseñas, conexiones |
| «8 ventas cerradas» · «$340K facturados» | `WeekResultsData` **no tiene** métrica de ventas ni de facturación |
| «Comparativa contra mes anterior» | La comparación es contra la **semana** anterior |
| Gráfico de barras de siete días | No existe en `WeekResultsGrid` |
| Health Score 78, dimensiones 82/74/79 | La capacidad existe; **las cifras eran inventadas** |
| 47 leads, +12%, 2 reseñas de Google | Ídem: los tipos son reales, los números no |

Lo que sí quedó, con su fuente: el **Health Score** (`lib/health-score.ts`, total
0-100 y tres dimensiones con los nombres exactos del portal), **Tu Atención Hoy**
(`lib/dashboard/attention.ts`, tipos `billing` / `approval` / `message` /
`connection` / `review` con su prioridad), **Resultados de la semana**
(`lib/dashboard/week-results.ts`, contra la semana anterior) y el **resumen
ejecutivo escrito por IA** (`lib/ai/executive-brief.ts`). Todas las cifras van
marcadas.

`visits` quedó **afuera a propósito**: está hardcodeado en 0 porque no hay
integración de analítica, y la card real muestra «— Sin integración aún».
Mostrarla en la sección de la prueba sería vender una integración que no existe.

### Decisiones

**Sin Framer Motion en el árbol.** Se fueron `DashboardStoryBackground` (~200
líneas de gradientes radiales, blurs `3xl`, ocho SVG decorativos y **dos loops
`Infinity` corriendo de por vida**), los mockups con `conic-gradient` y
`boxShadow` de color, el CTA propio con glow, y la línea conectora con su
destello perpetuo. `useReducedMotion` se sigue importando de `motion/react`, pero
por dentro es un `matchMedia`: no arrastra el motor de animación.

**El contrato de motion vive en `useEscenaCycle`.** Fuera del viewport el
`setInterval` **no se crea** — el efecto depende de `enViewport`, así que React
corre su `clearInterval` al salir de pantalla. No hay `requestAnimationFrame` en
toda la sección.

**La selección manual corta el avance automático para siempre.** Quien toca un
paso del riel deja de recibir cambios de escena: es una salida del loop para
quien quiere leer tranquilo, no una comodidad.

**Legible a mitad de ciclo.** El riel con las tres horas está siempre completo y
la escena activa se marca sobre él. Quien llega cuando va por la segunda ve las
tres, sabe que son tres y sabe en cuál está.

**`PortalDemo` salió del `SectionWrapper`** en `page.tsx`. No es cosmético: ese
wrapper envuelve a su hijo en un `motion.div` con
`initial={{ opacity: 0, y: 40 }}`, y Framer serializa ese `initial` en el HTML
del SSR — la sección nacía invisible y dependía del JS para aparecer, encima con
un segundo reveal ajeno montado arriba del reveal del sistema. `Hero` y
`Portfolio` tampoco lo usan. `OurServices` lo conserva: no es de este sprint.

### El bug que introduje y cómo se cazó

La primera versión ramificaba el JSX con un booleano `estatico`: una escena si
había motion, las tres si no. **Error de hidratación React #418**, medido en
runtime con `reducedMotion: 'reduce'`. La causa: `useReducedMotion()` devuelve
`false` en el servidor y `true` en el cliente, así que el HTML del SSR y el
primer render del cliente salían distintos.

El arreglo no fue un flag `mounted`: **las tres escenas están siempre en el DOM y
quién se ve lo decide CSS**, con la variante `motion-reduce:`. El marcado es
idéntico en servidor y cliente, y quien pidió menos movimiento ve las tres
escenas desde el primer paint sin depender de un solo byte de JS. El fade sale
gratis de paso: un elemento en `display:none` no corre sus animaciones, así que
al pasar a `block` la de entrada arranca de cero.

**El #418 que queda en `/` con reduced-motion NO es de esta sección.**
Discriminador empírico, no deducción: el mismo error aparece con reduced-motion
en `/web-development`, `/process-automation` y `/software-development`, que **no
montan `PortalDemo`**, y no aparece en `/contact`. Es un componente compartido de
las landings que ramifica su marcado con `useReducedMotion`. Preexistente y
fuera de scope.

### Verificación

Playwright headed contra el build de producción en `:3001`, servidor reiniciado
en cada corrida.

| Gate | Resultado |
|---|---|
| `npm run build` | **verde** |
| `npx tsc --noEmit` | **exit 0** |
| `eslint` sobre `portal-demo/` + `page.tsx` | **0** |
| `section#portal-demo` en el DOM | **1** |
| `h2` de la sección en el HTML servido | **1** (contando el tag de cierre) |
| `h2` de S2 en el mismo documento | **1** |
| `backdrop-filter` / gradiente / radio en superficies | **0 / 0 / 0** |
| Scroll horizontal | **no**, a 1440 y a 390 |
| Errores de consola (motion normal) | **0** a 1440 y a 390 |
| Detector — `design-system/` | **0** |
| Detector — superficie pública | **59** contra baseline 64 |

**Peso.** El presupuesto era ≤80 KB gz de JS **adicional**. La sección no agrega:
**resta**.

| Momento | Chunk de la ruta `/` |
|---|---:|
| Pre-B3 | 79.64 KB gz |
| Post-S1 | 79.78 KB gz |
| **Post-S2** | **74.60 KB gz** |

−5.18 KB gz contra post-S1 y −5.04 contra el baseline del bloque. El HTML servido
de `/` bajó de 421.3 a **402.0 KB**.

**Motion gateado — medido, no afirmado.** Instrumentando `setInterval` /
`clearInterval` y `requestAnimationFrame` antes de que cargue la app:

| Estado | Temporizadores vivos | rAF de la sección |
|---|---:|---:|
| Sección fuera del viewport | **2** | 0 |
| Sección dentro del viewport | **3** | 0 |
| Reduced-motion, dentro del viewport | **2** | 0 |

El 2 → 3 → 2 es el loop naciendo y muriendo con el viewport. Con reduced-motion
nunca llega a 3: el intervalo no se crea. Los 2 temporizadores de base y el rAF
perpetuo que sí corre en la página son **preexistentes** (Lenis, ya fichado en
esta bitácora como pendiente): la sección no suma ninguno.

**Reduced-motion**: 3 escenas visibles de 3, 3 láminas visibles, la escena no
avanza en 6 s. Con motion normal: 1 visible de 3, y avanza 8:30 → 9:00 sola.

**Alturas**

| Sección | 1440 × 900 | 390 × 844 |
|---|---:|---:|
| S2 — el caso real | 1520 px · **1.69** pantallas | 1893 px · **2.24** |
| S3 — el panel | 1087 px · **1.21** pantallas | 1591 px · **1.89** |
| S3 con reduced-motion | 1886 px · **2.10** | — |

Las tres escenas apiladas del modo estático explican los 2.10: es el modo que
muestra todo junto.

### Un segundo bug de composición, cazado en la captura

Las etiquetas de las métricas salían **truncadas** —«RESPONDI…», «COMPLETA…»— y
las del Health Score partidas en dos líneas. El interior de la lámina mide ~370px
a 1440 (570 de lámina menos la barra lateral) y ahí no entran tres columnas.
Pasaron a filas: etiqueta a la izquierda, cifra a la derecha, regla abajo. No se
ve leyendo el JSX.

---

## Inventario de placeholders pendientes — GATE DE MERGE

**Ninguna rama con estos placeholders a la vista se mergea a `main`.** Son 15, en
dos archivos:

| Archivo | Línea | Placeholder |
|---|---:|---|
| `sections/home/Portfolio.tsx` | 54 | `[CONTEXTO — 1 línea: qué perdían antes de develOP]` |
| `sections/home/Portfolio.tsx` | 56 | `[ENTREGABLE — 2 a 3 líneas: …]` |
| `sections/home/Portfolio.tsx` | 57 | `[URL DEL CASO]` |
| `sections/home/Portfolio.tsx` | 66 | `[+00%]` — consultas canalizadas |
| `sections/home/Portfolio.tsx` | 67 | `[00 días]` — tiempo a producción |
| `sections/home/Portfolio.tsx` | 68 | `[000]` — vehículos publicados |
| `sections/home/Portfolio.tsx` | 73 | `[RUBRO 1]` + `[QUÉ RESUELVE — 1 línea]` |
| `sections/home/Portfolio.tsx` | 74 | `[RUBRO 2]` + `[QUÉ RESUELVE — 1 línea]` |
| `sections/home/Portfolio.tsx` | 75 | `[RUBRO 3]` + `[QUÉ RESUELVE — 1 línea]` |
| `sections/portal-demo/data.ts` | 87 | `[00]` — score |
| `sections/portal-demo/data.ts` | 88 | `[+00%]` — delta de métrica |
| `sections/portal-demo/data.ts` | 89 | `[00]` — entero de métrica |
| `sections/portal-demo/data.ts` | 104 | `[ENTREGA QUE ESPERA APROBACIÓN]` |
| `sections/portal-demo/data.ts` | 105 | `[RESEÑA SIN RESPONDER]` |
| `sections/portal-demo/data.ts` | 106 | `[FACTURA POR VENCER]` |

Lo que **no** es placeholder y queda tal cual: **Concesionaria San Miguel** y su
rubro; los nombres de las capacidades del panel (Health Score, Tu Atención Hoy,
Resultados de la semana, Salud Digital / Comercial / Operativa, Leads,
Respondidos, Completadas); y los labels de las cifras del caso. Todo eso está
verificado contra el código o es dato real.

### Fuera de scope — anotado, no implementado

1. **#418 con reduced-motion en las tres landings** (`/web-development`,
   `/process-automation`, `/software-development`) y en `/`. Componente
   compartido que ramifica marcado con `useReducedMotion`. Necesita el mismo
   tratamiento que se le dio acá: la diferencia va en CSS, no en JSX.
2. **`About.tsx` sigue sirviendo dos árboles JSX completos.** Es la otra mitad
   del patrón que infló el documento.
3. **`page.tsx` sigue envolviendo `OurServices` en `SectionWrapper`**, con el
   mismo `initial` de Framer serializado en el SSR.
4. **`Portfolio` sigue importado con `next/dynamic`** aunque ya no tenga JS
   propio: ese `dynamic()` no code-splitea nada útil.
