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
