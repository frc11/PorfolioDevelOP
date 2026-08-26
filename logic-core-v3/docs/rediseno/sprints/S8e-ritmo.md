# S8e — Cerrar el ritmo del preloader

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **UNA PARADA 🛑** bloqueante, al cerrar.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (necesita `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente y conocido, no lo investigues).

## La situación

Hay **trabajo sin commitear en el working tree** de un sprint anterior llamado S8e. Son exactamente tres archivos:

```
src/components/layout/home-intro/introTimeline.ts
src/components/layout/home-intro/introTimeline.invariant.ts
src/components/layout/home-intro/introSampling.invariant.ts
```

Ese trabajo adoptó los tiempos del preloader clásico de `main` (`src/components/ui/Preloader.tsx`) como base del preloader nuevo. Fue revisado y aprobado **con tres condiciones que nunca se aplicaron**. Los sprints S9, S10 y S11 pasaron por encima sin tocar esos archivos, y siguen ahí.

**Este sprint aplica las tres condiciones y cierra S8e. Nada más.**

## Lecturas obligatorias

1. **Los tres archivos del working tree**, tal como están. Son el punto de partida: no los rehagas.
2. `docs/rediseno/outputs/S8-PRELOADER.md` — el estado publicado de S8d, incluido el mecanismo del cruce de contraste.
3. `src/components/ui/Preloader.tsx` en `main` — el clásico, solo como referencia de dónde salieron los números.

Lo que S8e resolvió y **no se toca**: `strokeS` 0,85 · `fillS` 0,45 · `holdS` 0,95 · `colorS` 1,40 · `INK_FLIP_FRAC` re-anclado a 0,2186 · `REFERENCE_PHASES.strokeS` espejado a 0,85 · `SWAP_FRAC` 0,18 sin tocar · `veilOutS` 0,70 sin tocar. Y la decisión de **no** adoptar `WRITE_MS`, `ERASE_MS` ni `HOME_CROSSFADE_SECONDS` sigue en pie, con su argumento del techo de 0,765 s.

---

## Condición 1 · `placeS` sube a 2,4

S8e puso `placeS` en 0,78, adoptando `COMPRESS_SECONDS` del clásico. **Está rechazado.**

El valor anterior era 3,60, calibrado mirando la pantalla después de descartar 3,0 por rápido. Bajar a 0,78 lleva el pico de 282 px/s a ~1300 px/s y la rotación de 23,5°/s a ~108°/s. No es adoptar el clásico: allá el acomodamiento era un deslizamiento corto sobre una pantalla que ya tenía el contenido detrás; acá es un viaje con giro que **entrega la escena 3D**. Es el último cuadro antes del home.

Tampoco vuelve a 3,60, porque entonces el sprint no acorta nada.

**`placeS` = 2,4.** Pico esperado ~423 px/s: 1,5× la calibración aprobada, no 4,6×.

Lo que tenés que hacer:

- Aplicar el valor y **recalcular la línea de tiempo resuelta entera** (trazo, relleno, espera, color, tinta, relevo, letra, fondo, acomodo), con los instantes en segundos.
- **Reportar el total nuevo** contra los tres puntos de referencia ya publicados: clásico 7,27 s · S8d 8,15 s · S8e con 0,78 → 5,73 s.
- **Reportar el pico de velocidad y de rotación** con el valor nuevo, contra 282 px/s y 23,5°/s.
- Dejar anotado en el código y en el reporte que **es la única perilla del sprint que se decide mirando**, con los dos vecinos: si queda atropellado 3,0, si queda lento 1,8.

---

## Condición 2 · El check en rojo se arregla

`introSampling` tiene una comprobación en rojo: *"detecta el cruce estirado · 4 cuadros flojos contra 2 con la ventana angosta"*. S8e la dejó roja a propósito, con el diagnóstico escrito arriba: es ruido de cuantización porque el control **cuenta cuadros enteros a 60 fps** y su umbral cae en el ruido de fase.

El arreglo real ya está identificado en ese mismo comentario: **medir el cruce en segundos por interpolación, en vez de contar cuadros enteros.** Hacelo ahora.

- **La propiedad que custodia no cambia.** El cruce de contraste sigue teniendo que quedar por debajo del umbral que S8d estableció; lo único que cambia es cómo se mide.
- **Control positivo obligatorio.** Antes de afirmar que el cruce es corto, el instrumento tiene que demostrar que detecta uno estirado: metele una calibración sintética con el cruce ensanchado a propósito y verificá que falla. Sin eso, un check que mide por interpolación puede pasar por construcción.
- **Reportá el valor del cruce en segundos** con el instrumento nuevo, en las once calibraciones, contra el umbral.
- Si al medir bien resulta que alguna calibración **sí** viola la propiedad, **frená y reportá**. No la ajustes para que pase.

No se deja ningún check verde por vacío.

---

## Condición 3 · El `.md` del sprint

El repo tiene un documento por sprint y esa es la fuente de verdad. S8e no escribió el suyo.

- **`docs/rediseno/sprints/S8e-ritmo.md`** — la instrucción, o sea este archivo.
- **`docs/rediseno/outputs/S8E-RITMO.md`** — el reporte: la tabla completa de perillas (adoptadas del clásico, descartadas con su razón, y las que no tienen equivalente), la línea de tiempo resuelta, el total nuevo, el cruce medido con el instrumento nuevo, y la nota de `placeS` como la perilla a calibrar mirando.
- **El output de S8d NO se edita.** Sigue publicando 8,15 s y el 44% del acomodamiento: queda como registro histórico de S8d. Dejá una nota en el `.md` nuevo diciendo que esas cifras son históricas y cuáles las reemplazan.

Si `S8-PRELOADER.md` sigue publicando **504 px** como ancho del logo del preloader, corregilo o anotá que es histórico: el número real desde S9 es **451 px** en desktop 1440×810. Verificalo contra `scene-framing` antes de escribirlo.

---

## Reglas absolutas

1. **Solo esos tres archivos y los documentos.** Si necesitás tocar algo más, **frená y reportá**.
2. **No toques nada de `probe-escena/`.** S11 acaba de cerrar ahí y está commiteado.
3. **No toques el home.**
4. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
5. **No cambies ningún mecanismo.** Este sprint mueve números y arregla un instrumento de medición. Nada más.
6. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.**
7. **Ninguna comprobación queda verde por vacío.**
8. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
9. **No corras el dev server ni verifiques en pantalla.**
10. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc --noEmit`, eslint y `npm run build`.
- (b) **Las seis suites del intro**: `introTimeline`, `introSampling`, `introFlight`, `introSilhouette`, `introShading`, `scene-framing`. Todas en verde, incluida la que estaba roja. Con el control positivo declarado.
- (c) **La línea de tiempo resuelta** con `placeS` = 2,4, el total nuevo, y el pico de velocidad y rotación.
- (d) **El cruce de contraste medido en segundos** en las once calibraciones, contra el umbral.
- (e) Archivos y `git status`.
- (f) Confirmación de que ninguna propiedad del arreglo `PROPERTIES` cambió.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S8e: ritmo del preloader clasico"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S8e-ritmo.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Hay trabajo SIN COMMITEAR en el working tree, en tres archivos de
  home-intro/. Ese trabajo es el punto de partida: NO lo rehagas, no lo
  descartes, no lo revises de cero. Leelo y aplicale las tres condiciones.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. El OOM del build es preexistente:
  usá NODE_OPTIONS=--max-old-space-size=8192 y no lo investigues.
- Solo esos tres archivos y los documentos. NO toques probe-escena/, ni el
  home, ni ningún archivo frozen. Si necesitás tocar algo más, FRENÁ Y
  REPORTÁ.
- Este sprint mueve números y arregla un instrumento de medición. No
  cambia ningún mecanismo.
- El check que hoy está en rojo se arregla midiendo por interpolación, no
  ajustando el umbral. Control positivo obligatorio: tiene que demostrar
  que detecta un cruce estirado antes de afirmar que el real es corto.
- Si al medir bien alguna calibración viola la propiedad, FRENÁ Y
  REPORTÁ. No la ajustes para que pase.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
