# S3 — Preloader y Hero · Rediseño del Home develOP

## Cómo correr esta instrucción

- **Modelo:** Fable 5 (u Opus 5). **Esfuerzo:** `max`. **Modo rápido: OFF.** **Modo NO autónomo — `auto mode` APAGADO** (shift+tab): este sprint tiene paradas bloqueantes y en auto mode las atraviesa.
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- PowerShell: no encadenar con `&&`; rutas con paréntesis entre comillas; `tsc` siempre solo.
- **TRES PARADAS 🛑** bloqueantes.
- Skill `impeccable` instalada, **modo brand**, subordinada a este documento.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S2-MOTION.md` — el sistema de motion que este sprint consume.
2. `docs/rediseno/outputs/B0b-DELTA-MAIN.md` — secciones B1 (inventario de motion) y **B2 (scroll-lock: el mapa completo del intro actual)**.
3. `docs/rediseno/outputs/S1-CIMIENTO.md` — tokens y estructura.

## Qué construye este sprint

La entrada a la página: **preloader nuevo** y **hero nuevo**. Es lo primero que ve cualquier visitante y hoy es el peor problema de performance del sitio: **el scroll se libera recién a los ~9,8 segundos**.

Antes, un fix que bloquea todo lo demás: la primitiva `useScrollProgress` de S2 **no está entregando progreso** (verificado por el humano en la vitrina del styleguide: el parallax no se mueve, y con `prefers-reduced-motion` activado el comportamiento es idéntico, lo que confirma que el desplazamiento ya era cero).

## El trabajo — 4 bloques

### Bloque 0 · Fix del enganche de scroll

`useScrollProgress` (`design-system/motion/useScrollProgress.ts`) envuelve `useScroll` de `motion/react` y no recibe progreso.

**Hipótesis principal a verificar primero:** Lenis no mueve el scroll nativo de la ventana de la forma que `useScroll` espera. Lenis intercepta el gesto y aplica su propia posición; `motion/react` necesita estar informado de eso. Revisá cómo `SmoothScroll.tsx` instancia Lenis y si existe algún puente entre Lenis y el sistema de scroll de `motion/react`.

**Hipótesis secundarias**, si la principal no explica el síntoma: el contenedor de la vitrina no genera recorrido suficiente para que la ventana de `offset` avance; o el `ref` no está llegando al nodo medido; o el nodo medido tiene un transform activo que distorsiona `getBoundingClientRect` (el `Parallax` ya usa dos nodos por esta razón — verificá que el aislamiento funcione).

**Diagnosticá antes de arreglar.** Reportá causa raíz con evidencia, no un fix a ciegas.

El fix tiene que dejar `useScrollProgress` funcionando **en el home real**, no solo en la vitrina — el hero de este sprint y el cierre inmersivo de S6 dependen de él.

🛑 **PARADA 1:** mostrá la causa raíz con su evidencia, el fix que proponés, y qué otros consumidores de scroll podría afectar. Esperá el OK.

### Bloque 1 · Preloader nuevo

**Reemplaza al actual.** El B0b mapea el intro vigente: `Preloader.tsx`, `IntroLockupText`, `EarlyScrollLock`, `LOGO_READY_TIMEOUT_MS` y el lock que vive en `Hero.tsx:483-495` (html + body + `lenis.stop()`). Leelo antes de escribir.

**Secuencia pedida — 3 segundos en total:**

1. Pantalla negra. Aparece el **logo**.
2. Aparece **develOP**.
3. Aparece el slogan: **"Ingeniería para negocios reales"**.
4. El fondo **invierte de negro a blanco**; el logo y el texto invierten su color con él.
5. El conjunto **se levanta** y revela el hero.

**Condiciones no negociables:**

- **Nunca bloquea el scroll.** Si el usuario empuja durante el preloader, la página responde. Esto es lo opuesto a lo que hace el intro actual y es el motivo principal del sprint.
- **Solo en la primera visita de la sesión.** Volver al home desde otra ruta no lo repite. Usá `sessionStorage`.
- **`prefers-reduced-motion`:** sin secuencia. El contenido aparece directo, sin espera.
- **El contenido del hero se renderiza en servidor y existe detrás del preloader desde el primer paint.** El preloader es una capa encima, no un gate que retiene el contenido.
- **Sin 3D en el preloader.** El logo acá es la versión 2D/SVG. El 3D es del hero y carga en paralelo.

**Sobre los archivos frozen:** `TransitionContext.tsx` y `PreloaderContext.tsx` son frozen y el preloader actual los consume. Podés leerlos y consumir su API, no editarlos. **Si el preloader nuevo exige cambiarlos, frená y reportá** — no los toques.

Los componentes del preloader viejo **no se borran** en este sprint: dejan de usarse.

🛑 **PARADA 2:** el preloader es verificable en pantalla. Decime cómo verlo (ruta, y cómo resetear `sessionStorage` para repetirlo) y esperá el OK antes de seguir con el hero.

### Bloque 2 · Hero de dos capas

**Objetivo medible: el scroll disponible desde el primer frame.** Hoy son ~9,8 s.

La arquitectura ya existe en la historia del repo. El B0b la identifica como recuperable: `HeroArtifactLayer` y `HeroCanvas`, con base tipográfica renderizada en servidor sin readiness gate y 3D diferido desktop-only con HDRI self-hosteado. Recuperalos con `git show 78b510ac^:<ruta>` y adaptalos a los tokens de S1 y al sistema de motion de S2.

**Contenido del hero — decidido, no lo amplíes:**

- Titular: **"Tu negocio vendiendo en piloto automático"**
- Una línea de apoyo (podés reusar o acortar la actual)
- **Sin CTA de WhatsApp** — se decidió que en el hero es prematuro. Un enlace discreto hacia abajo alcanza.
- **Sin máquina de escribir.** `TypewriterText` hace `setState` cada 50–80 ms de forma permanente, sin gate de viewport ni de `prefers-reduced-motion`. Muere con el hero viejo.

**Tema:** claro (`#F7F7F5`), según la tabla de S1.

**Mobile:** sin 3D. Entrada tipográfica **diseñada**, no una versión degradada del desktop. El B0b advierte que el Hero vivo baja el HDRI de una CDN en runtime mientras existe uno self-hosteado huérfano: usá el self-hosteado.

**Un detalle chico que entra acá:** el ancla `#trabajos` no resuelve (verificado por el humano; `#servicios` sí). Revisá el id de la sección y el destino del enlace, y dejalo funcionando.

### Bloque 3 · Logo con el scroll, versión mínima

Con `useScrollProgress` ya arreglado, montá la reacción básica: **al scrollear fuera del hero, el logo se aleja y se desvanece.**

**Coreografía mínima a propósito.** La coreografía fina —velocidad, curva, rotación, el momento exacto de salida y el retorno en la sección 7— se diseña en un sprint aparte, con las referencias delante. Acá solo dejás el mecanismo montado y **los valores expuestos como constantes con nombre, fáciles de ajustar**.

En mobile: el logo no se acerca ni se aleja.

### Verificación y cierre

1. `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3\`, solo: **EXIT 0**.
2. Lint limpio en lo tocado.
3. **Medí el tiempo hasta scroll disponible** y reportá el antes (~9,8 s documentado) y el después.
4. Reporte en `docs/rediseno/outputs/S3-HERO.md`: causa raíz y fix del Bloque 0, arquitectura del preloader, qué se recuperó de la historia y qué se adaptó, constantes de la coreografía y dónde viven, y pendientes.

🛑 **PARADA 3:** (a) `tsc`, (b) archivos tocados, (c) `git status`, (d) medición de scroll disponible, (e) cómo verificar en el navegador. Esperá el OK.

Con el OK: staging archivo por archivo (nunca `git add .`) → `git commit -m "S3: preloader nuevo, hero de dos capas y enganche de scroll"` → `git push`.

**Último mensaje, textual:** "El sprint compila y pasa tsc. La verificación visual la hace el humano en localhost."

## Reglas absolutas

1. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
2. **`DotMatrix` ata login, forgot-password y accept-invite** (B0b). Si tocás algo que lo involucre, verificá esas tres rutas.
3. **No tocar `OurServices.tsx`.** No construyas otras secciones: este sprint es preloader + hero.
4. **No borrar archivos.** Lo que sale de uso queda en disco.
5. **Cero `any`.** TypeScript strict.
6. **No sumar dependencias.**
7. **Consumí el sistema de S2.** Nada de curvas, duraciones ni distancias literales nuevas: si falta un token, lo agregás al sistema y lo justificás.
8. **Nada de `setState` por frame.** `MotionValue`, `useTransform` o escritura directa al DOM.
9. **Nada de base de datos.**
10. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
11. **No auto-confirmás que funciona porque compila.**
12. **Paradas de criterio:** permisos/autorización, o lógica de negocio, contratos de datos y máquinas de estado → frenás y reportás.

## Trabajo por tandas

Cerrá y reportá en 2 líneas al terminar cada bloque. Si la sesión muere por cuota, lo hecho se conserva y la siguiente retoma desde ahí.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S3-hero.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus tres paradas son obligatorias.

Marco no negociable:
- Es un sprint de ESCRITURA de código.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- No tocás archivos frozen ni OurServices.tsx. Si el preloader exige
  cambiar TransitionContext o PreloaderContext, frenás y reportás.
- Consumís los tokens de S1 y el sistema de motion de S2: nada de valores
  literales nuevos.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá con el Bloque 0. No me confirmes el entendimiento.
```
