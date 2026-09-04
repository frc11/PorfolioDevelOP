# B3 — La escena premium

La vuelta de la escena, y la marca en tres registros.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** **Fable 5.1**. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** Son dos piezas de juicio geométrico y de timing, no unidades paralelas: los subagentes se pisarían en `_lib/escena/`.
- **Worktree:** `C:\v3-escena-premium`, rama **`v3/escena-premium`**. Sesión en `C:\v3-escena-premium\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con B2 (los momentos), en otro worktree.**

## ⚠️ El puerto es 3002, y solo el 3002

```powershell
npm run dev -- -p 3002
```

**Todo lo que midas es en `http://localhost:3002/v3`.** Hay otra sesión en el 3001: **si medís en el 3000 o en el 3001, medís el sitio de otro.**

Chrome al frente, y la receta de `docs/rediseno/MEDICION-NAVEGADOR.md`.

⚠️ **El build va en primer plano** —tres tareas de fondo murieron sin salida en B1— y **el chequeo de procesos filtra por línea de comando**: hay tres `node` permanentes que son `chrome-devtools-mcp` y **no se matan**.

---

## Por qué existe este bloque

Franco midió el sitio de referencia con instrumentación real y encontró mecanismos que **explican por qué se siente caro**. Dos de ellos existen en su material, están documentados con sus números, **y no están en nuestro sitio.**

Este bloque construye esos dos. **Es el que decide si la escena se lee como premium o como "tiene un fondo 3D".**

---

## Parte 1 · La vuelta de la escena 🔴

### Qué pasa hoy

La escena está anclada por sección: se ve en Hero, Quiénes somos, Números y Trabajos; **desaparece detrás de Servicios y Tu panel**, que son paneles opacos; y **vuelve en Por qué develOP**, con el ancla en 0,8525.

**Durante esas dos secciones el progreso avanza sin que nadie lo vea** — de 0,625 a 0,750 en el diseño original. Cuando reaparece, la cámara está en otro lado.

**Y reaparece de golpe.** El panel opaco se va, y atrás hay una escena que ya se movió. **Es el momento más caro del recorrido y hoy no tiene tratamiento.**

### Lo que la referencia hace en ese momento

Franco lo midió: **un `ShaderMaterial` de pantalla completa, con 7 uniforms, que mezcla los render targets de la escena que sale y la que entra. 1.111 ms.** Es el mecanismo que el humano llamó **"la gota"** y lo puso en su lista de lo que copiaría.

En nk sirve para intercambiar entre catorce escenas. **Nosotros tenemos una**, así que el uso es otro: **el reingreso.**

### Qué construir

- **La escena vuelve con un tratamiento, no de golpe.**
- ⚠️ **Medí primero qué pasa hoy**, con scroll real en el navegador: **cuántos cuadros hay entre que el panel de Tu panel deja de tapar y la escena está completamente visible**, y **cuánto se movió la cámara mientras nadie la veía**, en grados de órbita y en unidades de distancia. **Si el salto es chico, el tratamiento es chico.** No construyas 1.111 ms para tapar 200.
- **La forma la elegís vos**, y es donde Fable tiene que trabajar: una onda que barre, un desvanecimiento de profundidad, una entrada de foco. **Lo que no puede ser es un `opacity` de cero a uno**, que es lo que tiene hoy de hecho.
- ⚠️ **Ninguna pose se toca.** Ni el anclaje, ni el progreso, ni las poses. **Esto es cómo se revela lo que ya está**, no qué hay.
- ⚠️ **Y el contraste del titular del diferencial no puede empeorar.** Está en 4,98:1 y fue caro conseguirlo. Medilo sobre el píxel real, durante toda la transición, no solo al final.

### Lo que hay que medir contra nk

**Una navegación, una medición. Se mide, no se copia.**

| medición | por qué |
|---|---|
| Cuánto dura una transición de escena en nk, del primer píxel al último | La vara del ritmo |
| Qué se mueve durante la transición: ¿la cámara sigue? ¿el DOM queda quieto? | Franco midió que el entorno se reemplaza **mientras el DOM encima queda quieto** |
| Si hay una forma geométrica reconocible o es un desvanecimiento | Define qué construir |
| Cuánto tarda el ojo en volver a leer texto encima | El contraste durante la transición |

---

## Parte 2 · La marca en tres registros 🔴

### El diagnóstico de Franco

Su sistema de diseño lo dice, y es una observación de conjunto:

> **Lo que lo haría funcionar es el sistema, no el objeto** — logotipo, separador, prefijo y objeto operando como conjunto.

**Nosotros tenemos el logotipo y el objeto 3D.** No tenemos **separador** ni **prefijo**. Y por eso la marca se lee como un símbolo suelto en vez de como un sistema.

### Qué construir

- **El separador** — la pieza tipográfica que marca la relación entre la marca y lo que la sigue.
- **El prefijo de servicio** — lo que convierte el código de color en estructura. Franco lo propuso junto con **el logo tomando el acento del servicio en las subpáginas**, y esa idea fue aceptada.
- ⚠️ **Con la paleta y la tipografía cerradas.** Chivo y Chivo Mono. Papel `#F7F7F5`, tinta `#111111`, y los tres acentos. **Sobre fondo oscuro el acento va como relleno o subrayado, nunca como texto** — 2,71 · 2,99 · 2,46.
- **Instrument Serif tiene una sola aparición en todo el sitio y todavía no se decidió dónde.** Si el separador es su lugar, **proponelo con su razón.** No la uses en dos lados.

### Dónde vive

**Empezá por dónde ya hay marca:** la pastilla de navegación, el pie, el rótulo de sección. **No inventes lugares nuevos** — si el sistema pide una aparición que hoy no existe, **frená y reportá.**

### Lo que hay que medir contra nk

| medición | por qué |
|---|---|
| Dónde aparece la marca en su home, y en qué registro cada vez | Frecuencia y variación |
| Qué separa el logotipo de lo que le sigue | Es el registro que nos falta |
| Cómo cambia la marca entre secciones, si cambia | |

---

## Parte 3 · La disolución en partículas — solo si sobra tiempo

Franco midió un **desvanecimiento cruzado de una malla de 457 vértices contra 4.000 partículas, 610 ms.**

Nuestra escena ya tiene ~1.000 partículas y un logo de malla. **El mecanismo es el mismo.**

**Es opcional.** Si las Partes 1 y 2 salen limpias y queda margen, evaluala y **reportá qué costaría** antes de construirla. **Si no, no la empieces.**

---

## Reglas absolutas

1. **Rama `v3/escena-premium`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. Para leer `HEAD`: `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **Tu zona es `_lib/escena/` y los componentes de marca.** ⚠️ **NO toques `anclaje.ts`, `recorrido.ts`, `secciones.ts` ni las secciones**: son del sprint paralelo. Si los necesitás, **frená y reportá.**
3. **Ninguna pose se toca.** Ni el arco del sol, ni la celosía, ni la penumbra, ni el moiré, ni el anclaje. **Este bloque cambia cómo se revela la escena y cómo se compone la marca, no qué hay en la escena.**
4. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
5. **No toques el preloader, el contenido, el home actual, `/probe-escena` ni `src/lib/scene-camera.ts`.**
6. **De nk se MIDE, no se copia:** ni un shader, ni un selector, ni un asset. Los números sí. **Una navegación, una medición.**
7. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
8. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
9. ⚠️ **Todo lo nuevo entra por la compuerta de 1025**, con el mecanismo que ya existe. **Reusalo, no construyas otro**, y verificá sobre la salida del build que el chunk no viaja abajo del umbral, con control positivo.
10. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío.**
11. **Regla 11:** toda cifra con su instrumento — la captura es evidencia.
12. **PowerShell:** no hay `&&`, no hay heredoc.
13. **No auto-confirmás que se ve bien.** Podés decir "la transición dura 840 ms y el contraste no baja de 4,98:1". No podés decir "queda mejor".
14. Archivos de más de 300 líneas se parten. Los seis heredados de la mudanza, no.
15. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `verificar`, build **en primer plano**, y `frontera`.
- (b) **La medición contra nk**, las dos tablas.
- (c) **La vuelta de la escena**: cuántos cuadros dura hoy y cuánto se movió la cámara oculta; qué construiste, cuánto dura, y **el contraste del titular durante toda la transición**.
- (d) **La marca**: qué registros construiste, dónde aparecen, y con qué razón. Y qué pasa con Instrument Serif.
- (e) **El peso**: que el chunk nuevo no viaja abajo de 1025, con control.
- (f) **Que ninguna pose, ni el anclaje, ni el progreso se movieron un bit.**
- (g) Capturas, archivos y `git status`.
- (h) **Todo lo que frenó.**
- (i) Si evaluaste la Parte 3, qué costaría.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B3: la escena premium"` → `git push -u origin v3/escena-premium`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B3-escena-premium.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-escena-premium, rama v3/escena-premium. Corre EN PARALELO
  con otro sprint en C:\v3-momentos.
- ⚠️ TU PUERTO ES EL 3002 Y SOLO EL 3002: npm run dev -- -p 3002. La otra
  sesión usa el 3001. Si medís en otro puerto estás midiendo el sitio de
  otro y no te vas a enterar.
- NO uses subagentes: son dos piezas de juicio geométrico y de timing, y se
  pisarían en _lib/escena/.
- Este bloque construye dos mecanismos que Franco MIDIÓ en la referencia y
  que no tenemos: la transición con la que la escena vuelve a verse después
  de las dos secciones opacas, y la marca en tres registros —logotipo,
  separador, prefijo— porque hoy tenemos solo el logotipo y el objeto 3D, y
  por eso la marca se lee como símbolo suelto.
- ⚠️ MEDÍ ANTES DE CONSTRUIR: cuántos cuadros hay hoy entre que el panel
  deja de tapar y la escena se ve entera, y cuánto se movió la cámara
  mientras nadie la veía. Si el salto es chico, el tratamiento es chico. No
  construyas 1.111 ms para tapar 200.
- NINGUNA POSE se toca. Ni el arco del sol, ni la celosía, ni el moiré, ni
  el anclaje, ni el progreso. Este bloque cambia CÓMO SE REVELA lo que ya
  está, no qué hay.
- El contraste del titular del diferencial está en 4,98:1 y fue caro. Medilo
  sobre el píxel real DURANTE TODA la transición, no solo al final.
- De nk se MIDE, no se copia: ni un shader, ni un selector, ni un asset. Los
  números sí. Una navegación, una medición: es un sitio ajeno en producción.
- NO toques anclaje.ts, recorrido.ts, secciones.ts ni las secciones: son del
  sprint paralelo. Tampoco el preloader, el contenido, el home actual,
  /probe-escena, scene-camera.ts ni los frozen.
- Todo lo nuevo entra por la compuerta de 1025 con el mecanismo que ya
  existe. Reusalo, y verificá sobre la salida del build con control
  positivo.
- La Parte 3 (la disolución en partículas) es OPCIONAL: solo si las dos
  primeras salen limpias. Si no, no la empieces.
- El build va EN PRIMER PLANO. El chequeo de procesos filtra por LÍNEA DE
  COMANDO: hay tres node permanentes que son chrome-devtools-mcp y NO se
  matan.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento, y la captura es evidencia.
- Git: commit y push en v3/escena-premium. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte, y git stash. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- Si morís por cuota, no des por hecho tu trabajo: reportá qué falta.

Arrancá. No me confirmes el entendimiento.
```
