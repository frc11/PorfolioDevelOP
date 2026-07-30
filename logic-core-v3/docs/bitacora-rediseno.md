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
