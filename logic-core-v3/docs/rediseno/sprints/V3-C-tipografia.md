# V3-C — La tipografía deja de encogerse

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`**: es un lane chico y coherente, con una decisión de sistema adentro. Los subagentes serían overhead.
- **Worktree:** `C:\v3-tipo`, rama **`v3/tipo`**. Sesión en `C:\v3-tipo\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con otros tres lanes.**

## ⚠️ REGLA DE MÁQUINA

**NO corras `npm run build`. Nunca.** Cuatro sesiones en 16 GB. **El build lo corre el humano después de mergear.**

Verificación: **`.\node_modules\.bin\tsc.cmd --noEmit`** + **eslint** + **invariantes con `npx tsx`**.

**NO corras el dev server, NO tomes capturas, NO abras navegador.**

---

## El problema

> *"El texto se ve muy chico a comparación de la página que quiero imitar."*

Y hay una causa concreta.

**La escala tipográfica es fluida en una banda de 375 a 1440 px.** Los seis niveles fluidos usan `clamp()` con `vw`, y **arriba de 1440 el `clamp` topa**: el texto se queda en el tamaño de 1440 mientras la ventana sigue ensanchándose.

**El humano mira en 1920.** Ahí la ventana es un 33% más ancha que el techo de la banda y **el texto está en su tamaño de 1440**. Proporcionalmente, todo se ve un tercio más chico de lo que debería.

⚠️ ~~**El sitio de referencia no tiene ese techo:** su tipografía sigue creciendo. Por eso "se ve más chico a comparación".~~

### ❌ CORRECCIÓN — esta premisa era FALSA, y se corrige acá con la medición

**Escrito al cerrar V3-C, con el número, y aprobado en su parada.**

La referencia **tiene el mismo techo que teníamos.** `docs/rediseno/s0/LAYOUT.md` §2.3 publica los seis niveles fluidos de `www.nk.studio` resueltos por ancho, sobre **24 volcados de `raw/fluid`** capturados en B1.3. A 1440 y a 1920 dan lo mismo, los seis:

| nivel | ref @1024 | ref @1440 | ref @1920 |
|---|---|---|---|
| `--text-fluido-micro` | 9,2188 | **10** | **10** |
| `--text-fluido-caption` | 11,6094 | **12** | **12** |
| `--text-fluido-titulo-s` | 18,4376 | **20** | **20** |
| `--text-fluido-titulo-m` | 26,5315 | **32** | **32** |
| `--text-fluido-titulo-l` | 36,1878 | **44** | **44** |
| `--text-fluido-titulo-xl` | 48,1878 | **56** | **56** |

La columna de 1024 está para que se vea que **el detector no está ciego**: adentro de la banda los seis SÍ crecen. Y §2.2 del mismo documento lo dice de frente: seis niveles independientes convergen en 1440,00 con residuo máximo de 0,00003px. **1440 no está "arriba del techo": ES el techo, exactamente** — de la referencia y del sistema.

**No se cita: se lee.** `s3-tipografia` §9 parsea esa tabla de `LAYOUT.md` ubicando las columnas por el encabezado, y afirma que entre 1440 y 1920 no crece ninguno, con su control positivo. Si el documento cambiara, el instrumento se entera.

**Qué queda entonces del sprint.** El defecto que dispara la instrucción es real y está medido —el titular del Hero cae de **75,3% a 56,5%** de la ventana entre 1440 y 1920— pero **su causa no es que la referencia haga otra cosa.** Extender la banda es por lo tanto una **DECISIÓN DE DESARROLLO DE develOP que se APARTA de la referencia**, y así queda escrita en `theme-develop.css`, en `tokens.invariant.ts` §2 y en el instrumento. No es una transferencia y nadie la puede volver a leer como tal.

**Y hay una segunda causa, medida, que este sprint NO podía tocar:** la cap height de Chivo es **4,72% más chica** que la de Instrument Sans, así que a igual tamaño en px las mayúsculas se leen más chicas y en Title Case la mayúscula domina el tamaño percibido. Va al próximo sprint con el argumento que la parada dejó escrito: **los anclajes de 375 y 1440 se transfirieron midiendo Instrument Sans, así que igualar el píxel no iguala el tamaño óptico — compensar puede ser MÁS fiel a la medición, no menos.** El argumento entero está en el docblock de la escala en `theme-develop.css`; no se resolvió acá porque compensar mueve los valores en 375 y en 1440, que este sprint tenía prohibido tocar.

---

## Qué hacer

### 1 · Medí antes de cambiar

- **Los ocho niveles resueltos** en 375, 1440, 1920 y 2560.
- **Cuánto ocupa el titular del Hero** como fracción del ancho de la ventana, en los cuatro. **Es el número que el ojo lee como "chico".**
- **Lo mismo para el sitio de referencia**, si `LAYOUT.md` o `DESIGN.md` lo tienen medido. Si no lo tienen, decilo — no lo estimes.

### 2 · La decisión de sistema

**El techo de 1440 sale de la medición** — la banda 375→1440 es donde la referencia se midió, y los valores en esos dos extremos están anclados a medición. **Extender la banda no invalida esos dos puntos**, pero sí agrega comportamiento donde no hubo medición.

**Evaluá las vías y elegí con el número:**

- **(a) Extender la banda** hasta 1920 o 2560, conservando exactos los valores de 375 y 1440 y prolongando la misma pendiente.
- **(b) Sacar el techo** y dejar que crezca sin límite arriba de 1440. Cuidado con lo que pasa en un monitor ultra ancho.
- **(c) Un segundo tramo** con otra pendiente arriba de 1440.

**Lo que no se negocia:**

- **Los valores en 375 y en 1440 no se mueven.** Son los dos puntos medidos y todo el sistema descansa en ellos. **Verificalo con `test:s3-tipografia`** — si se movió alguno, el cambio está mal.
- **La escala tiene que seguir siendo una escala** en todos los anchos: dos niveles no pueden colisionar. A 375 ya casi pasa —`titulo-s` está en 17 px y `base` en 16— así que **verificá la separación de los ocho niveles en los cuatro anchos.**
- **`micro` ya no es fluido**, por una razón escrita: de las tres condiciones —piso ≥ 10, techo anclado en 10, banda no nula— solo se pueden tener dos. **No lo vuelvas fluido sin resolver esa contradicción.**

### 3 · Y verificá lo que se mueve solo

Cambiar la escala mueve todo lo que depende del alto del texto:

- **El divisor de líneas** del sistema de motion: más grande el texto, menos líneas por bloque, y P1 anima por línea.
- **Los altos de las secciones** declarados en `secciones.ts`. ⚠️ **No la edites** — la comparten los cuatro lanes. **Reportá si algún alto queda corto.**
- **El pinneado de Servicios y de Trabajos.**

**Corré `test:s10-mobile` y `test:s3-tipografia` y reportá qué se movió.**

---

## Lo que NO cambia

- **La familia.** Chivo y Chivo Mono, con Instrument Serif reservada para una sola aparición. **Prohibidas: Inter, Roboto, Geist, Space Grotesk, Bricolage.**
- **El interlineado y el interletrado.** Son multiplicadores adimensionales y transfieren.
- **Ningún color, radio, sombra ni duración.**
- **El contenido.**

---

## Reglas absolutas

1. **Rama `v3/tipo`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`** — cualquier escritura de git en el árbol lo pasa a CRLF. Para leer `HEAD`, `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **Tu zona es la escala tipográfica de `theme-develop.css` y sus instrumentos.** **Solo los tokens de texto.** Si necesitás tocar un color, un radio o una duración, **frená y reportá.**
3. **NO toques `home-intro/`, `_lib/escena/`, los archivos de contenido, `secciones.ts`, `anclaje.ts`, ni `/v3/page.tsx`.**
4. **NO toques el home actual, `/probe-escena`, ni los frozen.**
5. **NO corras `npm run build`.**
6. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.**
7. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
8. **Toda cifra con su instrumento en el repo.**
9. **PowerShell:** no hay `&&`, no hay heredoc.
10. **No auto-confirmás que se ve bien.**

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc` y eslint. **Sin build.**
- (b) Tus invariantes con sus controles.
- (c) **Los ocho niveles en 375, 1440, 1920 y 2560**, antes y después.
- (d) **La fracción de ventana que ocupa el titular del Hero** en los cuatro, antes y después. Y la de la referencia si está medida.
- (e) **Que 375 y 1440 no se movieron.**
- (f) **La separación entre niveles** en los cuatro anchos.
- (g) **Qué se movió** en el divisor de líneas, en los altos de sección y en el pinneado.
- (h) Archivos y `git status`.
- (i) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "V3-C: la tipografia deja de encogerse"` → `git push -u origin v3/tipo`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/V3-C-tipografia.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-tipo, rama v3/tipo. Corren OTROS TRES LANES en paralelo.
- ⚠️ NO CORRAS npm run build. NUNCA. Cuatro sesiones en una máquina de 16 GB.
  El build lo corro yo después de mergear. Tu verificación es tsc + eslint +
  invariantes con tsx.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- Tu zona es SOLO la escala tipográfica de theme-develop.css y sus
  instrumentos. Si necesitás tocar un color, un radio o una duración, FRENÁ
  Y REPORTÁ. NO toques home-intro/, _lib/escena/, los archivos de contenido,
  secciones.ts, anclaje.ts ni /v3/page.tsx.
- El problema: la banda fluida topa en 1440 y yo miro en 1920, así que el
  texto se queda en su tamaño de 1440 mientras la ventana es 33% más ancha.
  La referencia no tiene ese techo.
- Los valores en 375 y en 1440 NO SE MUEVEN: son los dos puntos medidos y
  todo el sistema descansa en ellos. Verificalo.
- La escala tiene que seguir siendo una escala en TODOS los anchos: dos
  niveles no pueden colisionar. A 375 ya casi pasa.
- micro ya no es fluido por una razón escrita: no lo vuelvas fluido sin
  resolver esa contradicción.
- Cambiar la escala mueve el divisor de líneas, los altos de sección y el
  pinneado. Corré test:s10-mobile y test:s3-tipografia y reportá qué se
  movió. secciones.ts NO la edites: la comparten los cuatro lanes.
- NUNCA git stash ni ninguna escritura de git en el árbol: con core.autocrlf
  convierte a CRLF. Para leer HEAD, git show HEAD:<ruta>.
- Git: commit y push en v3/tipo. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas.
- Ninguna comprobación verde por vacío. Toda cifra con su instrumento.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
