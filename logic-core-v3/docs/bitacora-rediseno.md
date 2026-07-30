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
