# V3-B — La escena que se mueve desde el primer scroll

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-escena`, rama **`v3/escena`**. Sesión en `C:\v3-escena\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con otros tres lanes**, en otros worktrees.

## ⚠️ REGLA DE MÁQUINA

**NO corras `npm run build`. Nunca.** Cuatro sesiones en una máquina de 16 GB; cuatro builds la funden. **El build lo corre el humano después de mergear.**

Verificación: **`.\node_modules\.bin\tsc.cmd --noEmit`** + **eslint** + **invariantes con `npx tsx`**.

**NO corras el dev server, NO tomes capturas, NO abras navegador.**

---

## Qué hay que arreglar

Cuatro cosas. Dos las dijo el humano mirando; dos están medidas y anotadas en `DIRECCION-ESCENA.md`.

### 1 · El sostén del hero se va 🔴

> *"El fondo no scrollea con el mouse en un principio. Después de la parte de la mitad sí, pero al principio no."*

**No es un bug: es una decisión vieja que dejó de gustar.** El keyframe `hero · sostén` existe a propósito, con esta razón escrita: *"es el punto de llegada del preloader: no se mueve ni bien entrás"*.

**Sacalo.** La escena tiene que empezar a moverse con el primer píxel de scroll.

⚠️ **Y hay que ver qué se lleva puesto.** Ese sostén es lo que impide que la cámara haga los 130° hacia Quiénes somos en una sola pantalla. **Medí la velocidad angular resultante** en alturas de cuadro por unidad de progreso, contra la del recorrido actual. **Si el arranque queda violento, no lo dejes así: reportá el número y qué proponés.**

### 2 · El logo entra cortado 🔴

> *"No se ve toda la escena con el logo."*

En el Hero el logo entra por la derecha y **queda cortado por el borde del cuadro.** Está medido: la pose tiene `target frameX 0,68`, que lo empuja a la derecha.

- **Medí qué fracción del logo queda dentro del cuadro** en 1440, 1920 y 2560 — el humano mira en 1920 y ahí es peor.
- **Que entre entero**, o que el recorte sea una decisión declarada y no un accidente.
- ⚠️ **Ojo con el destino del preloader:** el logo del intro aterriza en la pose del hero, así que mover el encuadre **mueve dónde aterriza.** El lane A está trabajando justo en eso. **No lo coordines con él: reportá cuánto se movió el destino** y el humano lo cruza.

### 3 · El progreso sale de las secciones, no del documento 🔴

`DIRECCION-ESCENA.md` §7.46: el progreso se deriva de `document.documentElement.scrollHeight`, **que mide un documento con cosas que no son secciones.**

Está medido lo que eso cuesta: un pie fuera de la tabla suma 485 px a 1440 y 746 a 375, y **corre el progreso de 0,750 a 0,7201 / 0,6906** — que es donde §7.29 mide el contraste.

- **Que se derive de la extensión de las secciones.**
- **Con eso el defecto 6 se destraba solo**, y ese es el punto: hoy sacar el pie del `<main>` mueve el anclaje, y por eso está frenado.
- **Reportá que el progreso de cada sección no se movió** con el cambio, o cuánto se movió y por qué.

### 4 · El diferencial se re-ancla 🔴

§7.46, defecto 7. La superposición del logo con el titular es 6–16% en el mejor caso y **el contraste ahí es 1,11:1** — invisible. La salida de layout ya se descartó con un barrido exhaustivo de 81 bandas.

**El problema es la pose:** `demos` se compuso para una sección que mostraba demos, no para un titular de 107 caracteres. A p=0,750 el logo cubre **35,7% del cuadro**.

**Lo que hay que medir, y es el corazón de este punto:**

- **Para cada progreso entre 0,625 y 1,000: cuánto cuadro cubre el logo, y cuánto da el contraste.** Los dos juntos.
- Los dos extremos dejan lugar a que exista una ventana: **el logo cae de 35,7% a 5,3% entre p=0,750 y p=0,875**, y **el contraste cruza AA en p=0,878**.
- **Si la ventana existe, anclá el diferencial ahí** y verificá con `test:s10-logo`.
- **Si no existe, NO lo arregles.** Reportá la tabla completa. La alternativa es que el diferencial pase a `papel-opaco`, y eso pierde uno de los tres momentos de escena: **lo decide el humano.**

---

## Lo que NO cambia

- **Ninguna pose.** Están calibradas a ojo y aprobadas por grabación. Este lane cambia **el sostén, el encuadre del hero, de dónde sale el progreso y a qué progreso se ancla el diferencial.** No los valores de las poses.
- **El arco del sol, la celosía, la penumbra, el moiré, las partículas de la escena.**
- **El ritmo del preloader** — es del lane A.

⚠️ **`src/lib/scene-camera.ts` se lee y no se toca:** es del sitio vivo, y §7.44 documenta que su copia de `travelX` está desactualizada. **No es de este lane.**

---

## Reglas absolutas

1. **Rama `v3/escena`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`** — cualquier escritura de git en el árbol lo convierte a CRLF con `core.autocrlf`. Para leer `HEAD`, `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **Tu zona es `src/app/v3/_lib/escena/` y `_lib/anclaje.ts`.** Si necesitás tocar `home-intro/`, `theme-develop.css` o los archivos de contenido, **frená y reportá**: son de los otros lanes.
3. **`secciones.ts` la podés leer; si tenés que escribirla, frená y reportá** — la comparten los cuatro.
4. **NO toques el home actual, `/probe-escena`, `src/lib/scene-camera.ts`, ni los frozen.**
5. **NO corras `npm run build`.**
6. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
7. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
8. **Toda cifra con su instrumento en el repo.**
9. **PowerShell:** no hay `&&`, no hay heredoc.
10. **No auto-confirmás que se ve bien.**
11. Archivos de más de 300 líneas se parten. Los seis heredados de la mudanza, no.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc` y eslint. **Sin build.**
- (b) Tus invariantes con sus controles.
- (c) **El sostén sacado**, y la velocidad angular del arranque contra la de antes.
- (d) **La fracción del logo dentro del cuadro** en 1440, 1920 y 2560, antes y después. Y **cuánto se movió el destino del preloader.**
- (e) **El progreso derivado de las secciones**, y que el de cada sección no se movió.
- (f) **La tabla del diferencial**: cobertura y contraste por progreso, y si la ventana existe.
- (g) Archivos y `git status`.
- (h) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "V3-B: la escena se mueve desde el primer scroll"` → `git push -u origin v3/escena`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/V3-B-escena.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-escena, rama v3/escena. Corren OTROS TRES LANES en paralelo.
- ⚠️ NO CORRAS npm run build. NUNCA. Cuatro sesiones en una máquina de 16 GB:
  cuatro builds la funden. El build lo corro yo después de mergear. Tu
  verificación es tsc + eslint + invariantes con tsx.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- Tu zona es _lib/escena/ y _lib/anclaje.ts. NO toques home-intro/,
  theme-develop.css, los archivos de contenido, /v3/page.tsx ni
  src/lib/scene-camera.ts. secciones.ts la leés; si tenés que escribirla,
  FRENÁ Y REPORTÁ.
- Este lane NO cambia NINGUNA POSE: están calibradas a ojo y aprobadas por
  grabación. Cambia el sostén, el encuadre del hero, de dónde sale el
  progreso, y a qué progreso se ancla el diferencial.
- El sostén del hero se SACA: la escena tiene que moverse desde el primer
  píxel de scroll. Pero medí qué velocidad angular queda en el arranque: ese
  sostén impedía hacer 130° en una pantalla. Si queda violento, reportá el
  número y qué proponés.
- El logo entra cortado y el humano mira en 1920. Medí la fracción dentro del
  cuadro en 1440, 1920 y 2560. Y ojo: mover el encuadre mueve dónde aterriza
  el logo del preloader, que es lo que otro lane está arreglando. NO lo
  coordines: reportá cuánto se movió el destino.
- El diferencial: medí cobertura del logo Y contraste juntos, para cada
  progreso entre 0,625 y 1,000. Si hay una ventana donde los dos pasan,
  anclalo ahí. Si NO existe, NO lo arregles: reportá la tabla. La
  alternativa pierde un momento de escena y la decide el humano.
- NUNCA git stash ni ninguna escritura de git en el árbol: con core.autocrlf
  convierte a CRLF. Para leer HEAD, git show HEAD:<ruta>.
- Git: commit y push en v3/escena. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- Ninguna comprobación verde por vacío. Toda cifra con su instrumento.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
