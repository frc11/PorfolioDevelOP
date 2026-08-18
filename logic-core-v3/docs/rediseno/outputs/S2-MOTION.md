# S2-MOTION — Reporte de cierre

- **Fecha:** 2026-08-18 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S2-motion.md` (Bloques 1-4)
- **Verificación:** `tsc --noEmit` exit 0. `eslint` exit 0 sobre los archivos tocados. **No autoconfirma que funciona porque compila — la verificación visual la hace el humano en localhost.**

---

## Bloque 1 — Inventario y decisión (aprobado en Parada 1)

Relevamiento (agente `Explore`, muy exhaustivo) sobre el sitio público post-S1: **31 físicas de motion distintas conviviendo en el home** (8 curvas de easing literales, 10 configuraciones de spring, ninguna tokenizada), más 3 sistemas de tema/fondo corriendo en simultáneo (`HomeWrapper` 0.8s `easeInOut` · `body` CSS 0.6s `cubic-bezier(0.16,1,0.3,1)` tapado · dock 0.8s con trigger propio).

Caminos calientes marcados (no se propagan al sistema): `OurServices.tsx:273-293` (rAF + 2 setState/frame, frozen), `DynamicDock.tsx:440-446` (setState por evento de scroll en toda ruta pública), `TypewriterText.tsx` (setState cada 50-80ms permanente), más 4 de gravedad menor (`About`, `Navbar`, `OurServices` rail, Lenis rAF sin cleanup).

**Decisión:** set nuevo al lado (`design-system/motion/`), no extensión de las primitivas existentes. Razones: (1) el sitio público no tenía primitivas de sistema para extender — 31 físicas ad-hoc, ninguna diseñada para serlo; (2) el set del portal (`FadeIn`/`StaggerWrapper`/`AnimatedCounter`) tiene 18+ consumidores propios y otra física — no se toca; (3) las primitivas legacy del home (`TypewriterText`/`KineticText`/`MagneticCta`) mueren con sus secciones en S3-S6. Única excepción: el seed CSS `--animate-ds-reveal`/`ds-rise` (0 consumidores vivos, con la lección de LCP ya medida) se re-parametriza para vivir dentro del sistema nuevo. Convergencia por **sustitución**, no por edición.

Dos limpiezas aprobadas: matar la `transition` fantasma del `body` (`globals.css`) y agregar el `cancelAnimationFrame` faltante en el cleanup de Lenis.

---

## Bloque 2 — Tokens (`src/components/design-system/motion/tokens.ts`)

Espejados 1:1 por nombre en `globals.css` (`@theme static`, sección "Motion — vocabulario del sistema"). Framer consume el módulo TS; CSS puro consume las variables por `var()`. Sin puente por `getComputedStyle` (costo de runtime/SSR mayor que la duplicación explícita); la vitrina de `/styleguide` expone visualmente si diverge.

**Duraciones** (`MOTION_DURATION`, segundos):

| Escala | Valor | Uso |
|---|---|---|
| `micro` | 0.15 | Hover, botón — retroalimentación sobre algo ya visible |
| `elemento` | 0.6 | Una card entrando — **valor canónico ya fijado en `CLAUDE.md`** ("Framer Motion — section reveal"), no inventado |
| `seccion` | 0.8 | Transición cromática entre secciones — coincide con el tween ya calibrado de `HomeWrapper` (S1) |
| `pagina` | 1.2 | Momento autoral de una sola vez — magnitud documentada, no aplicada a `Preloader.tsx` en este sprint (fuera de scope) |

**Curvas** (`MOTION_EASE`) — dos, no las ocho que convivían:

- **`arrive`** — `[0.25, 0.46, 0.45, 0.94]` (ease-out-quad). Es la curva canónica de `CLAUDE.md`, y la que ya vivía en `ds-reveal`/`ds-rise`. Se eligió sobre las otras dos variantes "confident arrival" del B1 (`[0.16,1,0.3,1]`, `[0.22,1,0.36,1]` — familia expo-out, casi idénticas entre sí) porque expo-out sube casi vertical al principio — el registro más efectista de las tres. Ease-out-quad desacelera de forma más pareja, sin el pico inicial abrupto: más "sólido", menos "juguetón". Se usa para todo lo que ENTRA a pantalla.
- **`shift`** — `[0.4, 0, 0.2, 1]` (estándar de Material, simétrica). Ya en producción como `DOCK_EASE` (`DynamicDock.tsx:356`) — se reutiliza, no se inventa. Se usa para cambios de estado sobre algo YA visible (hover, botón, toggle).
- **Deliberadamente no hay una tercera curva "para scroll":** los valores ligados al progreso (`Parallax`, `useScrollProgress`) no tienen una curva temporal — su forma la da el mapeo de rango entrada→salida, no un easing de tiempo.

**Distancia de entrada:** `REVEAL_DISTANCE_PX = 20` — el mismo valor que `CLAUDE.md` fija en su ejemplo de "section reveal". Reemplaza los 16px de `ds-reveal`/`ds-rise` (S1) y los 24/28/40px sueltos de las secciones legacy (que mueren con sus componentes, no se migran).

**Stagger:** `REVEAL_STAGGER_S = 0.06` (60ms/hermano) con tope `REVEAL_MAX_STAGGER_INDEX = 5` — el retraso adicional total se estabiliza en 360ms sin importar cuántos hermanos haya de ahí en más (evita que un listado largo tarde más de 1s en revelarse completo).

**Umbral de disparo:** `REVEAL_VIEWPORT = { once: true, amount: 0.2 }` — ni tan temprano como los `viewport={{once:true}}` sin `amount` que el B1 encontró en `Footer.tsx` (disparan con 1px visible), ni tan tarde que se sienta reactivo.

**`prefers-reduced-motion`:** `REDUCED_MOTION = { distancePx: 0, opacityDurationS: 0.2 }`. Con distancia 0 no queda nada que desplazar (el transform no necesita además una duración reducida: inicio y fin son el mismo punto); la opacidad conserva `0.2s` — drásticamente más corta que `elemento` (0.6s) pero no un corte instantáneo, tal como permite el documento ("los cambios de color y opacidad pueden mantenerse suaves"). El parallax fuerza su intensidad a 0 bajo movimiento reducido, mismo principio aplicado a un valor continuo en vez de a un tween.

**Limpiezas aplicadas en `globals.css`:**
- `ds-reveal`/`ds-rise` reparametrizados: `var(--duration-ds-elemento)`, `var(--ease-ds-arrive)`, `var(--motion-ds-reveal-distance)` en vez de literales (0.9s→0.6s, 16px→20px).
- `body { transition: ... }` eliminado — era una TERCERA física de tema (0.6s `cubic-bezier(0.16,1,0.3,1)`) corriendo tapada bajo el tween de `HomeWrapper`. `background-color`/`color` del `body` se conservan (siguen siendo consumo vivo del portal vía `--color-void`/`--color-obsidian`, documentado en S1).
- Override de `--motion-ds-reveal-distance: 0px` agregado dentro del bloque `@media (prefers-reduced-motion: reduce)` ya existente — hace explícita la distancia cero a nivel de valor, no solo enmascarada por la duración de 1ms del bloque global.

---

## Bloque 3 — Primitivas (`src/components/design-system/motion/`)

### `Reveal` (`Reveal.tsx`)

```ts
interface RevealProps {
  children: ReactNode
  index?: number          // posición para el desfase; sin índice, sin desfase
  scale?: RevealScale     // 'elemento' | 'seccion' | 'pagina' — default 'elemento'
  className?: string
}
```

Un elemento aparece al entrar al viewport (`whileInView`, dispara por `IntersectionObserver`, no por scroll — cero `setState` por frame). Distancia, curva y umbral **no son props**: es la garantía de "una sola física en el home". Bajo `prefers-reduced-motion`, la distancia colapsa a 0 y solo la opacidad conserva una duración corta (0.2s); el desfase entre hermanos se conserva (comunica orden, no es decorativo).

### `useScrollProgress` (`useScrollProgress.ts`)

```ts
function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  options?: { offset?: UseScrollOptions['offset'] },
): MotionValue<number>
```

Envuelve `useScroll` de `motion/react`. Progreso 0→1 de `target` respecto del viewport (default: el elemento completo atravesándolo). Devuelve el `MotionValue` crudo — pasarlo a `useTransform` o escribirlo directo al DOM no dispara re-render. No resuelve `prefers-reduced-motion` por diseño: es una medición, no un efecto visible; el consumidor que la convierte en desplazamiento (`Parallax`) es responsable de eso.

### `Parallax` (`Parallax.tsx`)

```ts
interface ParallaxProps {
  children: ReactNode
  intensityPx: number    // sin default — el documento pide que sea un parámetro
  className?: string
}
```

Desplazamiento a distinta velocidad ligado al progreso, no al tiempo. **Dos nodos, no uno:** el externo es el que mide (`useScrollProgress`), el interno es el que se mueve (`useTransform` + `style={{y}}`). Medir y mover el mismo elemento retroalimenta el cálculo — `getBoundingClientRect()` da coordenadas incorrectas con un transform activo, lección ya documentada en `CLAUDE.md` (abril 2026). Bajo `prefers-reduced-motion`, la intensidad efectiva colapsa a 0.

Las tres, cero `any`, listeners de scroll pasivos (internos de `motion/react`, ninguna agrega uno propio).

---

## Bloque 4a — Transición cromática: se mantiene temporal

Evaluado con `useScrollProgress` ya construido. **Decisión: no se liga a `scrollYProgress` en este sprint.** Tres razones (documentadas también en el docblock de `HomeWrapper.tsx`):

1. El disparo actual (`SectionShell`, banda `-45%`) ya es anticipado — se activa cuando el centro del viewport entra a la sección siguiente, típicamente lejos todavía del fundido de borde físico. El fundido en sí (`background-image` de `SectionShell`) ya es 100% espacial (CSS estático, sin JS); solo el COLOR revelado detrás tenía una duración fija. Para secciones de altura normal, el tween de 0.8s termina con margen antes de que el fundido se vuelva visible.
2. Ligarlo de verdad al gesto exige conocer la posición del borde entre DOS secciones en todo momento — rompe el principio explícito de "no neighbor-awareness" de `SectionShell`, o exige medir dinámicamente la altura de las 8 secciones (`ResizeObserver` + estado compartido) para derivar límites como fracción del scroll total. Es arquitectura nueva, no una calibración — y las alturas reales de las secciones todavía no existen (3 de 8 son placeholder de S1).
3. Forzar el cambio ahora, sobre secciones sin contenido final, resolvería un problema que todavía no se puede verificar visualmente.

**Lo que sí cambió:** `HomeWrapper` dejó de usar literales propios (`0.8`, `'easeInOut'`) y pasa a `MOTION_DURATION.seccion`/`MOTION_EASE.arrive` — antes de este sprint corría con una curva DISTINTA a la de los reveals; ahora es la misma física. Si en un sprint futuro (con las 8 secciones ya con contenido real) la verificación humana confirma que se siente desconectada del gesto, `useScrollProgress` es la base para ligarla — con el costo de arquitectura ya anotado arriba.

## Bloque 4b — Lenis

**Calibración:** `duration` 1.5s → **1.1s**. La fórmula de easing NO se tocó — ya era el expo-out default de la propia librería, no un valor propio. 1.5s era 25% más lento que el default documentado de Lenis (1.2s); con la identidad "precisa y sólida" del sistema, 1.1s queda apenas más ajustado que ese default, no solo revertido a él. No se tocó dónde Lenis está apagado (portal, dispositivos touch — `SmoothScroll.tsx:71-76,30-34`).

**Limpieza:** se agregó el `cancelAnimationFrame` faltante en el cleanup del loop `raf` — antes, el loop de Lenis podía seguir pidiendo frames tras un desmontaje (cambio de ruta) hasta que el navegador lo recolectara solo.

**Advertencia para la verificación humana (no se actuó sobre esto, solo se documenta):** `DynamicDock.tsx` hace `setState` por cada evento de scroll en toda ruta pública (`window.addEventListener('scroll', ...)` → re-render del dock completo por frame). Si el scroll se siente pesado al verificar, puede ser ese camino caliente compitiendo por el frame, no la calibración de Lenis ni las primitivas nuevas. `DynamicDock.tsx` no se tocó — fuera de scope de este sprint.

## Bloque 4c — Vitrina en `/styleguide`

Sección nueva `id="motion"` (índice `04`, entre "Componentes" y "Las 6 secciones" — esta última renumerada a `05`). `src/app/styleguide/_components/MotionBlock.tsx`:

- **Curvas:** `arrive` y `shift` lado a lado — un gráfico SVG de la forma paramétrica de cada bezier (muestreo propio, sin librería nueva) más una pista con un punto animado replayable, ambas a la misma duración para que la única diferencia visible sea la curva.
- **Duraciones:** tabla con las 4 escalas, su valor y su uso.
- **Reveal + stagger:** un elemento individual, y una grilla de 8 con índice creciente — el tope de stagger se ve directamente (06/07/08 aparecen juntos). Botón "Reproducir de nuevo" (remonta por `key`, re-dispara `whileInView`).
- **Parallax:** bloque de 100vh con `intensityPx=160` (generoso a propósito para que el efecto sea inequívoco en la vitrina).

**Cómo verificar:** `npm run dev` → `http://localhost:3000/styleguide` → nav superior, link "Motion", o `/styleguide#motion`. Mirar: (1) que `arrive` se sienta más "sólida/pareja" que `shift` al reproducir las dos pistas; (2) que el reveal individual y el stagger de 8 items respeten el tope (últimos 3 juntos); (3) scrollear el bloque de parallax completo y ver el desplazamiento de la tarjeta central; (4) con `prefers-reduced-motion` activado en el sistema, repetir todo y confirmar que no hay desplazamiento, solo fades cortos.

---

## Pendiente / riesgos — para sprints siguientes

- **Transición cromática temporal, no espacial** (Bloque 4a) — diferido hasta que las 8 secciones tengan contenido real y se pueda verificar visualmente si hace falta. Camino ya identificado: `useScrollProgress` + romper o resolver el "no neighbor-awareness" de `SectionShell`.
- **`DynamicDock.tsx` hace `setState` por evento de scroll** en toda ruta pública — no se tocó (fuera de scope), pero compite por frame con cualquier primitiva nueva. Candidato a un sprint de limpieza de chrome.
- **`AnimatedCounter` de `HeroMetrics.tsx`** (rAF + `setState` por frame, landing `/web-development`) — deuda anotada, no se tocó: no es una sección del home, fuera de alcance de S2.
- **Calibración de Lenis (1.1s) sin verificación humana en navegador** — es un cambio razonado (contra el default documentado de la librería), pero la sensación real la juzga Valentino en localhost, no este reporte.
- **`--color-ds-control-edge` sigue siendo un token fantasma** (preexistente, no introducido ni tocado en S2).

---

## Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit   → exit 0, sin errores
.\node_modules\.bin\eslint.cmd <archivos tocados>   → exit 0, sin errores ni warnings
```

Archivos nuevos: `src/components/design-system/motion/{tokens,Reveal,useScrollProgress,Parallax,index}.ts(x)`, `src/app/styleguide/_components/MotionBlock.tsx`, este reporte.
Archivos modificados: `src/app/globals.css`, `src/app/styleguide/page.tsx`, `src/components/layout/HomeWrapper.tsx`, `src/components/layout/SmoothScroll.tsx`.

**El sprint compila y pasa tsc. La verificación visual la hace el humano en localhost.**
