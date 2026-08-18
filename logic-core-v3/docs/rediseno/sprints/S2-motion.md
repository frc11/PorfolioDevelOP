# S2 — Sistema de motion · Rediseño del Home develOP

## Cómo correr esta instrucción

- **Modelo:** Fable 5 (u Opus 5). **Esfuerzo:** `max`. **Modo rápido: OFF.** Modo NO autónomo.
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- PowerShell: no encadenar con `&&`; rutas con paréntesis entre comillas; `tsc` siempre solo.
- **DOS PARADAS 🛑** bloqueantes.
- La skill `impeccable` está instalada. Usala en **modo brand**, subordinada a este documento.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S1-CIMIENTO.md` — el sprint anterior, con sus tres pendientes anotados.
2. `docs/rediseno/outputs/B0b-DELTA-MAIN.md` — secciones B1 (inventario de motion), B2 (scroll-lock) y B3 (Lenis).

## Qué construye este sprint

**El sistema de movimiento de toda la página.** No construye ninguna sección: construye la física que después van a obedecer nueve componentes distintos.

El objetivo, en las palabras del dueño del proyecto: *"que se mueva TODA la página, que se sienta viva"*. Eso no se logra con efectos llamativos sino con **coherencia**: cada elemento entra con la misma curva, la misma duración y el mismo desfase, de modo que el conjunto se lea como un organismo y no como una lista de secciones animadas por separado.

Referencias de comportamiento (no de estética): bakkenbaeck.com y oddcommon.com. Lo que las distingue no es tener más animación, sino que toda su animación responde a un mismo sistema.

**Este sprint no debe cambiar cómo se ve la página en reposo.** Cambia cómo se comporta.

## Contexto: lo que viene después

El sistema tiene que servir a estos componentes, que se construyen en sprints posteriores. No los construyas; solo asegurate de que el sistema los soporte:

- Reveals de entrada en scroll (todas las secciones)
- Transición cromática entre secciones (`SectionShell`, ya existe)
- Expansión de ancho ligada al progreso de scroll (hero)
- Scroll horizontal fluido con marquee (servicios)
- Sliders y carruseles (trabajos, panel)
- Objeto 3D que reacciona al progreso de scroll (hero y cierre)
- Texto que muta palabra por palabra al scrollear (carrusel de palabras)

## El trabajo — 4 bloques

### Bloque 1 · Auditoría y decisión

El árbol ya tiene primitivas de animación: `FadeIn`, `StaggerWrapper`, `AnimatedCounter`, `MagneticCta`, `KineticText`, `TypewriterText`, más lo que encuentres. Y `SectionShell` (de S1) ya tiene su propio tween.

Relevá: qué existe, qué duraciones/curvas usa cada una, cuántos consumidores tiene, y **cuántas físicas distintas conviven hoy** en el sitio público.

Decidí y justificá: ¿extendés las primitivas existentes o creás un set nuevo al lado? Criterio: **una sola física viva en el home**, sin romper consumidores del portal.

**Marcá explícitamente** cualquier primitiva que use `rAF` + `setState` en el camino caliente, o que actualice estado de React en cada frame de scroll. Eso no se propaga al sistema nuevo: en caminos calientes se escribe al DOM o a un `MotionValue` directamente.

🛑 **PARADA 1:** mostrá el inventario, cuántas físicas conviven y tu decisión con su justificación. Esperá el OK.

### Bloque 2 · Tokens de motion

Definí el vocabulario del sistema. Pocos valores, bien elegidos — si hay más de seis duraciones, el sistema no es un sistema.

Tiene que cubrir, como mínimo:

- **Duraciones** por escala del elemento: micro (hover, botón), elemento (una card entrando), sección (la transición cromática), página (el intro).
- **Curvas de easing**, con nombre semántico y su razón de ser. La curva es lo que le da carácter al movimiento: elegila con criterio y justificá la elección, no copies un default.
- **Distancia de entrada** de los reveals (cuántos píxeles sube un elemento al aparecer). Un solo valor, no uno por componente.
- **Desfase (stagger)** entre elementos hermanos.
- **Umbral de disparo**: a qué porcentaje del viewport se considera que un elemento entró.

Dónde viven es tu decisión: variables CSS en `globals.css`, un módulo TS tipado, o ambos. Justificá. Requisito: **consumibles desde `motion/react` y desde CSS**, porque algunos componentes van a usar uno y otros el otro.

**`prefers-reduced-motion` es parte del sistema, no un agregado.** Definí qué hace cada token bajo movimiento reducido — la regla general es que las distancias van a cero y las duraciones se acortan drásticamente, pero los cambios de color y opacidad pueden mantenerse suaves.

### Bloque 3 · Primitivas

Construí el set mínimo que los nueve componentes van a consumir. Menos es mejor: si una primitiva solo la va a usar un componente, no es primitiva.

Como mínimo:

1. **Reveal de entrada** — un elemento aparece al entrar al viewport, con los tokens del sistema. Debe soportar desfase entre hermanos.
2. **Progreso de scroll** — un hook que devuelva el progreso normalizado (0→1) de un elemento respecto del viewport, para atar transformaciones al scroll en vez de al tiempo. Es la base de la expansión de ancho del hero y del objeto 3D.
3. **Parallax sutil** — desplazamiento a distinta velocidad ligado al progreso. Es uno de los ingredientes de "que se mueva toda la página". Que la intensidad sea un parámetro, no un valor fijo.

Reglas duras para las tres:
- Nada de `setState` por frame. Usá `MotionValue`, `useTransform`, o escritura directa al DOM.
- Listeners de scroll pasivos.
- Deben respetar `prefers-reduced-motion` sin que el consumidor tenga que acordarse.
- Tipadas, cero `any`, con props documentadas en un docblock: el próximo sprint las va a consumir a partir de un contrato escrito.

### Bloque 4 · Aplicación, verificación y cierre

**4a · Resolver el pendiente de S1.** La transición cromática de `SectionShell` hoy es **temporal** (tween de duración fija disparado por entrada en viewport). La referencia buscada (wearecollins.com) es **espacial**: el color avanza con el gesto de scroll. Con el hook de progreso del Bloque 3 ya construido, evaluá y decidí: ¿se liga al progreso de scroll o se mantiene temporal? Justificá y, si la cambiás, dejá el comportamiento anterior documentado en el reporte.

**4b · Calibrar Lenis.** El B0b tiene los settings actuales de `SmoothScroll.tsx`. La sensación de "página viva" depende en buena medida de esta calibración. Revisá `lerp`/duración y el comportamiento táctil, y ajustá si corresponde — **con cuidado: Lenis está apagado en el portal y en touch por razones que el B0b documenta.** No cambies dónde está apagado; solo la calibración donde está activo.

**4c · Vitrina en `/styleguide`.** Agregá una sección de motion que muestre los tokens y las primitivas funcionando: las curvas visualizadas, un reveal de ejemplo, un stagger, el parallax. **Este es el entregable verificable del sprint**: es donde el humano va a poder juzgar si la física se siente bien antes de que se aplique a la página entera.

**4d · Verificación.** `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3\`, solo, sin encadenar: **EXIT 0**. Lint limpio en lo tocado. Reporte en `docs/rediseno/outputs/S2-MOTION.md` con: inventario y decisión del Bloque 1, tokens con su justificación, contrato de cada primitiva (props, tipos, comportamiento), qué decidiste en 4a y 4b, y qué queda pendiente.

🛑 **PARADA 2:** mostrá (a) salida de `tsc`, (b) archivos modificados, (c) `git status`, y (d) **cómo verificar la vitrina de motion en el navegador** (ruta exacta y qué mirar). Esperá el OK.

Con el OK: staging archivo por archivo (nunca `git add .`) → `git commit -m "S2: sistema de motion, tokens y primitivas"` → `git push`.

**Último mensaje, textual:** "El sprint compila y pasa tsc. La verificación visual la hace el humano en localhost."

## Reglas absolutas

1. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
2. **No construyas secciones.** Este sprint es sistema, no contenido. No toques `page.tsx` salvo que una primitiva lo exija, y si pasa, reportalo.
3. **No tocar `OurServices.tsx`.**
4. **Cero `any`.** TypeScript strict.
5. **No sumar dependencias.** `motion/react` (nunca `framer-motion` directo), Lenis y Tailwind 4 ya instalados.
6. **Nada de base de datos.**
7. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
8. **No auto-confirmás que funciona porque compila.** El movimiento lo juzga el humano.
9. **Paradas de criterio:** cambios de permisos/autorización, o decisiones de lógica de negocio, contratos de datos o máquinas de estado → frenás y reportás.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S2-motion.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint de ESCRITURA de código.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- No tocás archivos frozen, ni OurServices.tsx, ni construís secciones.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá con el Bloque 1. No me confirmes el entendimiento.
```
