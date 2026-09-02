# V3-A — El preloader que entrega la escena

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-preloader`, rama **`v3/preloader`**. Sesión en `C:\v3-preloader\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con otros tres lanes**, en otros worktrees.

## ⚠️ REGLA DE MÁQUINA — la más importante de este prompt

**NO corras `npm run build`. Nunca. Ni una vez.**

Hay cuatro sesiones trabajando al mismo tiempo en una máquina de 16 GB. Cuatro builds simultáneos la funden: cada uno lanza workers de Node y la memoria comprometida se dispara. **El build lo corre el humano, una sola vez, después de mergear los cuatro.**

Tu verificación es: **`.\node_modules\.bin\tsc.cmd --noEmit`** + **eslint** + **tus invariantes con `npx tsx`**. Nada más.

**NO corras el dev server, NO tomes capturas, NO abras navegador.**

---

## Qué hay que arreglar

El humano miró el preloader en `/v3` y dio tres veredictos. Los tres son de comportamiento, no de gusto.

### 1 · El logo tiene que VOLAR, no desaparecer

> *"El logo negro, cuando cambia de color la escena, desaparece. La idea es que ese mismo logo negro vaya volando y se coloque en la posición del logo principal que estamos viendo. Y no que reemplace al otro: literalmente son el mismo logo."*

**Eso es lo que el diseño ya dice** — el acomodamiento existe, dura 2,4 s, y `samplePlace` alimenta desplazamiento, rotación y entrada en la luz con un solo número. **Pero en pantalla el logo desaparece.**

**Primero averiguá por qué.** Tres hipótesis, y hay que descartarlas con medición:

- **Aterriza fuera del cuadro** o en una posición que no es la del logo de la escena.
- **Se apaga antes de terminar** el viaje — el velo se va y se lleva el logo con él.
- **El destino se calcula contra una pose que ya no es la que corre.** ⚠️ El destino sale de la pose inicial de la coreografía, **y el anclaje de S9 cambió cómo se mapea el progreso.** Es la sospecha más fuerte y la primera que hay que revisar.

**Reportá la causa con su número antes de tocar nada.**

Y el requisito, que es lo que el humano describió: **al terminar, el logo del intro tiene que estar exactamente donde está el de la escena.** Si están a más de unos pocos píxeles, el relevo se ve. **Medí esa distancia, en píxeles, en al menos tres ventanas.**

### 2 · Las partículas se ACOMODAN, no se caen

> *"Lo de las partículas me gusta cómo empieza pero no cómo se van. Lo que podríamos hacer sería que esas mismas partículas se acomoden en la escena."*

Hoy caen hacia abajo y desaparecen antes de que el velo se vaya. **Esa caída era la tapadera del relevo**: las que caen son las del intro y las que quedan son las de la escena, y nunca se ven las dos.

**El humano quiere lo contrario: que sean las mismas.** Que en vez de irse, cada una viaje hasta una posición del campo de la escena y se quede.

⚠️ **Eso es un cambio de mecanismo, no de parámetro**, y tiene un problema real que hay que resolver: **las del intro viven en un rig ortográfico en píxeles de pantalla y las de la escena en un espacio 3D con perspectiva y paralaje.** No hay correspondencia natural.

**Evaluá las dos vías y elegí con el número:**

- **(a) Correspondencia real** — cada mota del intro se asigna a una de la escena, y viaja hasta su posición proyectada. Es lo que el humano pidió, y es lo caro.
- **(b) Convergencia sin correspondencia** — las del intro se acomodan hacia donde el campo de la escena tiene densidad, y el relevo se esconde en el momento de mayor coincidencia. Se ve casi igual y cuesta mucho menos.

**Si elegís (b), decilo explícito con la diferencia visible que tiene contra (a).** No lo presentes como si fuera lo mismo.

**Y el requisito que no se negocia:** en ningún instante pueden ser legibles dos poblaciones distintas. Hoy eso está garantizado con un margen medido; **con el mecanismo nuevo hay que volver a medirlo.**

### 3 · La escena aparece igual — eso está bien

Confirmado por el humano: después de que el logo desaparece, la escena aparece. **El problema es el logo, no el relevo de fondo.**

---

## Lo que NO cambia

- **El trazo, las letras, el relleno y la transformación de color.** Todo eso el humano lo aprobó mirando. **Ni un milisegundo.**
- **Solo primera visita de sesión. Nunca bloquea el scroll. No espera a que cargue nada. Sin sonido.**
- **`prefers-reduced-motion`**: no se monta.
- **El logo nunca cambia de tamaño.**
- **Los seis predicados de `PROPERTIES` y `PARTICLES_BEFORE_VEIL`.** Si el mecanismo nuevo obliga a cambiar el séptimo, **proponelo con su razón.**

⚠️ **`PreloaderContext.tsx` y `TransitionContext.tsx` son archivos congelados.** Se leen y se consumen; **jamás se editan.** Si el arreglo los necesita distintos, **frená y reportá.**

---

## Reglas absolutas

1. **Rama `v3/preloader`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`** — con `core.autocrlf` cualquier escritura de git en el árbol lo convierte a CRLF y pone instrumentos en rojo sin que una línea cambie. Para leer `HEAD`, `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **Tu zona es `src/components/layout/home-intro/` y lo que el intro consuma.** Si necesitás tocar `_lib/escena/`, `theme-develop.css` o los archivos de contenido, **frená y reportá**: son de los otros tres lanes.
3. **NO toques `/v3/page.tsx`, `secciones.ts`, `anclaje.ts`** — son superficie compartida.
4. **NO toques el home actual, `/probe-escena`, ni los frozen.**
5. **NO corras `npm run build`.**
6. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
7. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
8. **Toda cifra con su instrumento en el repo.**
9. **PowerShell:** no hay `&&`, no hay heredoc. `tsc` es `.\node_modules\.bin\tsc.cmd --noEmit`.
10. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.
11. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc` y eslint. **Sin build.**
- (b) Tus invariantes, con sus controles positivos.
- (c) **Por qué el logo desaparecía**, con el número.
- (d) **La distancia entre donde aterriza el logo del intro y donde está el de la escena**, en píxeles, en tres ventanas.
- (e) **Qué vía elegiste para las partículas** y la diferencia visible contra la otra.
- (f) **Que las dos poblaciones nunca se ven juntas**, con el margen medido.
- (g) Archivos y `git status`.
- (h) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "V3-A: el preloader entrega la escena"` → `git push -u origin v3/preloader`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/V3-A-preloader.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-preloader, rama v3/preloader. Corren OTROS TRES LANES en
  paralelo en otros worktrees.
- ⚠️ NO CORRAS npm run build. NUNCA, ni una vez. Cuatro sesiones en una
  máquina de 16 GB: cuatro builds la funden. El build lo corro yo después de
  mergear. Tu verificación es tsc + eslint + tus invariantes con tsx.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- Tu zona es home-intro/. NO toques _lib/escena/, theme-develop.css, los
  archivos de contenido, /v3/page.tsx, secciones.ts ni anclaje.ts: son de
  los otros lanes o superficie compartida. Si los necesitás, FRENÁ Y REPORTÁ.
- El trazo, las letras, el relleno y la transformación de color están
  APROBADOS mirando: ni un milisegundo.
- El logo tiene que VOLAR hasta la posición del logo de la escena y ser EL
  MISMO, no reemplazarlo. Hoy desaparece. Averiguá POR QUÉ antes de tocar
  nada, y sospechá primero del anclaje de S9: el destino se calcula contra
  la pose inicial y S9 cambió cómo se mapea el progreso.
- Las partículas se ACOMODAN en la escena en vez de caerse. Es un cambio de
  mecanismo. Si elegís la vía barata, decilo explícito con la diferencia
  visible contra la cara. No la presentes como si fuera lo mismo.
- En ningún instante pueden verse dos poblaciones de partículas: hoy hay un
  margen medido y con el mecanismo nuevo hay que volver a medirlo.
- PreloaderContext.tsx y TransitionContext.tsx son FROZEN: se leen, jamás se
  editan. Si los necesitás distintos, FRENÁ Y REPORTÁ.
- NUNCA git stash ni ninguna escritura de git en el árbol: con core.autocrlf
  convierte a CRLF. Para leer HEAD, git show HEAD:<ruta>.
- Git: commit y push en v3/preloader. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- Ninguna comprobación verde por vacío. Toda cifra con su instrumento.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
