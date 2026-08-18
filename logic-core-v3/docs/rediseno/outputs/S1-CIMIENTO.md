# S1-CIMIENTO — Reporte de cierre

- **Fecha:** 2026-08-15/16 · **Branch:** `rediseno/home` (sobre `main`) · **Worktree:** `C:\rediseno-home`
- **Sprints que ejecutan esto:** `docs/rediseno/sprints/S1-cimiento.md` (Bloques 1-4) + `docs/rediseno/sprints/S1-cont.md` (continuación tras corte por cuota, reemplaza el Bloque 1 con valores ya derivados).
- **Verificación:** `tsc --noEmit` exit 0, `eslint` exit 0 sobre los archivos tocados. **No autoconfirma que funciona porque compila — la verificación visual la hace el humano en localhost**, incluida la resolución de las 5 anclas en carga fría (no se corrió navegador en esta sesión).

---

## Archivo por archivo

| Archivo | Qué cambió |
|---|---|
| `src/app/globals.css` | `@theme static` reescrito: capa literal (papel `#F7F7F5`/tinta `#111111`/oscuro `#0E0E0E`, con `--color-ds-dark-ink` nuevo — ver colisión de nombre abajo), 3 acentos de servicio × 5 variantes (sólido/chip-bg/chip-fg/wash/on-dark), ámbar eliminado. Escala tipográfica con `--font-weight` por token (700→400) y tracking de display re-verificado para Chivo. `--color-ds-control-stroke`/`--shadow-ds-control` recalculados. Token nuevo `--spacing-ds-section-fade` para el fundido de `SectionShell`. `--font-sans`/`--font-mono`/`--font-ds-sans`/`--font-ds-mono` apuntan a Chivo. |
| `src/app/layout.tsx` | Geist/Geist_Mono → Chivo/Chivo_Mono (`next/font/google`, variables, sin array de `weight`). Alcanza portal + landings + sitio público (decisión aprobada explícitamente). |
| `src/components/design-system/accent.ts` | `ServiceAccent` pasa de 4 a 3 roles (`'web'\|'ia'\|'software'`). `automation` fuera de los 3 mapas de clases y de `SERVICE_ACCENTS`. |
| `src/components/design-system/SectionShell.tsx` | Prop nueva `wash?: ServiceAccent` (capacidad, sin consumidor todavía). Fondo: de `bg-ds-canvas` opaco a `background-image` de 4 paradas que funde a transparente en los bordes (`--spacing-ds-section-fade`), revelando el fondo de `HomeWrapper`. Default de `theme` cambiado a `'light'` (ajuste post-Parada-2). |
| `src/components/layout/HomeWrapper.tsx` | Recoloreado a los tokens nuevos (`#F7F7F5`/`#111111` claro, `#0E0E0E`/`#F7F7F5` oscuro). Honra `prefers-reduced-motion` (duración 0 en vez de 0.8s, ajuste post-Parada-2). Queda como único mecanismo de inversión vivo en el home — ver decisión abajo. |
| `src/app/page.tsx` | Reescrito sin `dynamic()`. 8 secciones envueltas en `SectionShell` — ver estructura abajo. |
| `src/components/sections/servicios/data.ts` | Frente "Automatización de procesos": `service: 'automation'` → `'ia'` (fallout mecánico, ver pendientes). |
| `src/app/styleguide/_components/ServiceRow.tsx` | Fila "Automatización": `service: 'automation'` → `'ia'` (mismo fallout). |
| `src/app/styleguide/_components/ComponentStates.tsx` | `DataStat` de ejemplo: `accent="automation"` → `accent="ia"`. |
| `src/app/styleguide/_components/PaletteBlock.tsx` | Swatch "Base dark / Texto": token `--color-ds-ink` → `--color-ds-dark-ink` (el rol de "texto sobre oscuro" se renombró; sin este cambio el swatch mostraría tinta `#111111` mal etiquetada). |
| `src/app/styleguide/_components/AccentPermutations.tsx` | **Borrado** (excepción explícitamente aprobada). Comparaba las 2 permutaciones del Gate 1 del ámbar; con el ámbar muerto y el Gate 1 ya cerrado, no tenía nada que comparar. |
| `src/app/styleguide/page.tsx` | Import y `<SgBlock id="acentos">` (con `<AccentPermutations/>`) eliminados; `GATE_ITEMS` sin esa entrada; índices `02`/`03`/`04` renumerados. |

**No se crearon archivos nuevos de componente.** Los 3 placeholders (carrusel, tu panel, por qué develOP) son JSX inline en `page.tsx`, como pide el documento ("nada más").

---

## Decisiones — Bloque 1 (tokens y tipografía)

1. **`ds-*` se extiende en su lugar, no se reemplaza por un prefijo nuevo.** Evidencia verificada: `grep 'variant="ds-\|size="ds'` sobre `src/` da cero hits — ningún consumidor del portal renderiza las variantes `ds-*` de `ui/Button.tsx` directamente; solo `CtaButton` (dentro de la isla) las selecciona. El portal depende de que `Button.tsx` compile, no de sus valores.
2. **Colisión de nombre documentada en el propio `globals.css`:** `--color-ds-ink` valía `#EDE9E1` (texto del tema oscuro viejo). Ahora vale `#111111` ("tinta") y es un token **plano, no invertible** — el rol de "texto sobre oscuro" se renombró a `--color-ds-dark-ink` (`#F7F7F5`). Quien lea comentarios viejos que llamen a `--color-ds-ink` "texto del tema oscuro" está leyendo el significado anterior.
3. **Ámbar muerto**, incluido el rol `automation` en `ServiceAccent` y sus 5 consumidores (ver tabla de archivos). `AccentPermutations.tsx` borrado (excepción aprobada) porque su única razón de ser —comparar las dos permutaciones del ámbar— desapareció con el Gate 1 ya cerrado.
4. **Chivo/Chivo Mono reemplazan a Geist globalmente** (aprobado explícitamente: alcanza portal + landings, no solo el home). Variables (eje `wght` 100-900), sin array de `weight`.
5. **Peso como eje de jerarquía:** cada escalón de la tipografía declara su propio `--font-weight` (700 display-xl → 600 display-lg/subhead/eyebrow → 500 data/control → 400 lead/body). Antes solo `data` lo declaraba.
6. **Contrastes WCAG verificados por cálculo** (no a ojo): tinta/papel 17.60:1 · texto-sobre-oscuro/oscuro 18.00:1 · los 3 acentos sólidos ≥6:1 sobre papel · `fg-muted` 5.77:1 claro / 7.83:1 oscuro · `control-stroke` 3.49:1 claro / 3.41:1 oscuro (WCAG 1.4.11) · `rule` decorativa, no le aplica el mínimo de texto.

## Decisiones — Bloque 2 (SectionShell y HomeWrapper)

1. **Transición cromática:** `SectionShell` funde su propio fondo a transparente en los bordes (`background-image` de 4 paradas, no `mask-image` — un mask también desvanecería el contenido, no solo el fondo). Lo que se revela en esa franja es el fondo de `HomeWrapper`, que sigue tweeneando con Framer Motion entre los colores de tema (0.8s, ahora con `prefers-reduced-motion` respetado).
2. **Un solo sistema de inversión vivo en el home:** se conserva `HomeWrapper` (recoloreado), no porque el otro candidato se haya "desmontado", sino porque **investigado, no compite en el home** — su fondo queda permanentemente tapado por el de `HomeWrapper`. El otro candidato (bloque legacy `:root`/`[data-theme]` con `--color-void`/`--color-obsidian`/`--color-accent` + `body{background-color:var(--color-void)}`) **es consumo real y vivo del portal** (`setter-shell.tsx:28`, `shortcuts-help.tsx:37,80` — `bg-[var(--color-void)]`). No se tocó.
3. **Wash de servicio:** capacidad agregada (`wash?: ServiceAccent` en `SectionShell`, solo con efecto en `theme="light"`), sin consumidor en este sprint — S5 la usa más adelante.
4. **Default de `theme` cambiado a `'light'`** tras la Parada 2 (6 de 8 secciones son claras; un default oscuro producía errores por omisión).

---

## Estructura de `page.tsx`

| # | Sección | Tema (tabla) | Contenido en S1 | Id |
|---|---|---|---|---|
| 1 | Hero | claro | `<Hero/>` tal cual | `inicio` (propio del componente) |
| 2 | Quiénes somos | oscuro | `<About/>` tal cual — **conflicto de tema, ver pendientes** | `nosotros` (propio, duplicado — bug preexistente, no tocado) |
| 3 | Carrusel de palabras | claro | placeholder | `carrusel` |
| 4 | Trabajos | oscuro | `<Portfolio/>` tal cual | `portfolio` (propio) |
| 5 | Servicios | claro | `<OurServices/>` tal cual, no tocado | `servicios` (propio, frozen) |
| 6 | Tu panel | claro | placeholder | `panel` |
| 7 | Por qué develOP | claro | placeholder (WhyDevelOP no se monta) | `caracteristicas` (heredado para no romper la ancla) |
| 8 | Cierre | claro | `<PortalDemo/>` tal cual — **por eliminación, ver pendientes** | `cierre` |
| — | (fuera de las 8, chrome global) | — | `<Footer/>` tal cual | sin id, como hoy |

**Mapeo de los 6 componentes "tal cual" sobre las 8 filas — no estaba en el documento fila-por-fila.** 4 de 5 son correspondencia directa de contenido (Hero→1, About→2, Portfolio→4, OurServices→5). El 5°, `PortalDemo`, no calza con ninguna fila con sentido (la fila "tu panel" pide explícitamente placeholder, no `PortalDemo`) — cae en 8 por eliminación, fuera de lugar a propósito. `Footer` no es una de las 8: hoy no tiene id ni ancla propia, y el B0b lo describe como chrome de cierre global — se monta después de las 8, no adentro de la 8va. **Si esta asignación no es la que se pensaba, es una corrección de una línea en `page.tsx`, no una re-arquitectura.**

---

## Pendiente / riesgos — para sprints siguientes

**Bloqueantes de contenido, no de código:**
- **Conflicto de tema en "Quiénes somos":** la tabla pide oscuro; `About.tsx` fuerza `'light'` internamente (`useThemeSection`, líneas 402 y 461). Por instrucción explícita no se forzó ni se editó — los dos anuncios de tema conviven hasta que About se reemplace (S2). Se va a notar en el cruce sección 2→3 de la transición cromática.
- **`#nosotros` sigue duplicado** dentro de `About.tsx` (árbol mobile + desktop, bug preexistente del B0b). No se tocó — About no está en el scope de este sprint.
- **`ORDERED_SERVICE_IDS` de `OurServices.tsx` sigue cruzando `#servicio-3`/`#servicio-4`** — no se tocó, `OurServices.tsx` está fuera de scope por regla absoluta.

**De diseño, ya anotados en código con comentario:**
- **El CTA "siempre tinta" está declarado en tokens, no aplicado:** `ui/Button.tsx` (frozen para este sprint) sigue pintando `ds-primary` con `bg-ds-fg` (invertible por tema), no con el nuevo `--color-ds-ink` (plano). Falta ese cambio en un sprint que sí pueda tocar `ui/Button.tsx`.
- **Riesgo de legibilidad: CTA tinta `#111111` sobre sección oscura `#0E0E0E`** — botón y fondo casi al mismo valor de luminancia. El `--shadow-ds-control` oscuro se subió al máximo razonable (0.9/0.55) pero no resuelve el problema por sí solo; probablemente necesite un borde el día que el CTA se actualice. **Verificación visual humana pendiente.**
- **Tracking de los display (`-0.035em`/`-0.025em`/`-0.015em`) es un ajuste direccional para Chivo**, no medido en navegador. **Verificación visual humana pendiente.**
- **`DisplayHeading.tsx`/`Subhead.tsx` (no tocados) hardcodean `font-medium` (500) como clase explícita.** Con los nuevos `--text-ds-*--font-weight` (700/600 en varios tokens), hay que confirmar en el navegador si la clase explícita gana por orden de CSS y pisa el peso del token — si es así, esos dos componentes necesitan que se les saque `font-medium` en un sprint que los toque, para que la jerarquía por peso funcione.
- **Transición cromática solo visible entre secciones placeholder en S1.** Los 6 componentes legacy pintan su propio fondo opaco (`Hero.tsx` `bg-[#f1f2f4]`, etc.), así que el fundido de `SectionShell` queda tapado ahí — es exactamente el resultado esperado del sprint ("va a verse mezclada"), no un bug. Se vuelve visible progresivamente a medida que S2-S6 reemplacen cada componente legacy.
- **Punto abierto, no bloqueante (anotado por pedido explícito):** el disparo de la transición es `useInView` + tween de duración FIJA (0.8s) — temporal, no espacial/ligado al progreso del scroll (el efecto de referencia tipo Collins cambia más rápido si scrolleás más rápido). Puede sentirse bien igual gracias al fundido de bordes, o puede sentirse desconectado del gesto — a verificar visualmente con Valentino en pantalla. Si hace falta, la alternativa es ligarlo a `scrollYProgress` en un sprint aparte.

**Menores, fuera de scope, no tocados:**
- `styleguide/_components/TypographyBlock.tsx` y la nota del bloque "tipografía" en `styleguide/page.tsx` todavía mencionan Geist y lenguaje de "Gate 1" pendiente — ahora parcialmente stale.
- `--color-ds-control-edge` sigue siendo un token fantasma (referenciado en `PaletteBlock.tsx`/`ProductPlate.tsx`, nunca definido) — bug preexistente del B0b, no introducido ni corregido acá.
- El frente "Automatización de procesos" en `sections/servicios/data.ts` sigue siendo una fila separada de "Agentes de IA" pese a compartir ahora el mismo acento — si conviene fusionar el contenido en una sola fila es una decisión de copy/estructura para un sprint aparte, no resuelta acá (el fix de este sprint fue mecánico: solo el acento).

---

## Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit   → exit 0, sin errores (baseline del B0b era 0, sigue en 0)
.\node_modules\.bin\eslint.cmd <archivos tocados>   → exit 0, sin errores ni warnings
```

`git status` (antes de cualquier commit): 11 archivos modificados + 1 borrado (`AccentPermutations.tsx`), todos dentro del scope declarado. `docs/rediseno/sprints/S1-cont.md` queda sin trackear — es el documento de instrucción de esta continuación, se sugiere commitear junto con este reporte.

**El sprint compila y pasa tsc. La verificación visual la hace el humano en localhost.**
