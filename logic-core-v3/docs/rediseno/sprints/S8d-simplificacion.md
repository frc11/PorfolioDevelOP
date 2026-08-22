# S8d — Secuencia simplificada del preloader

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **UNA SOLA SESIÓN DE CLAUDE CODE SOBRE ESTE WORKTREE.** En S8c dos sesiones se pisaron durante ocho minutos y se perdió trabajo. Si detectás otra sesión activa, frená y avisá.
- **UNA PARADA 🛑** bloqueante, antes del commit.
- **NO abras navegador ni despaches `visual-qa`.** Verificación: `tsc` exit 0, lint limpio, comprobaciones estáticas y `npm run build`.
- Continuación directa de S8, S8b y S8c, que siguen **sin commitear**.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S8c-CORRECCION.md` — el estado actual, el arreglo del especular y el motor.
2. `src/components/layout/home-intro/` — el módulo entero.

## Qué pasó

El humano verificó S8c sobre la escena del probe. **El chasquido y el juego de escalas no le gustan y se eliminan.** La secuencia se simplifica, y a cambio se pide más cuidado en el acomodamiento.

## La secuencia nueva

1. **El logo se dibuja** con un trazo, en blanco sobre fondo oscuro.
2. **Aparecen las letras** — el efecto actual está aprobado y no se toca.
3. **El trazo se completa y se rellena** (blanco).
4. **Transformación de color, transicional.** No es un corte seco: es una transición. El fondo pasa de oscuro a claro, el logo de blanco a negro, las letras de claro a oscuro. **Y en esa misma transición el logo pasa de SVG 2D a mesh 3D**: lo que se desvanece es el 2D blanco, lo que aparece es el 3D negro.
5. **Desaparece la letra.**
6. **Cuando la letra terminó de irse, desaparece el fondo.** En ese orden, no simultáneos.
7. **El logo se acomoda** en su lugar de la escena.

## Lo que se elimina

- **El chasquido.** No hay salto de escala ni cambio de golpe.
- **El pico** (`INTRO_SNAP_PEAK`) y toda su lógica.
- **El achicamiento** como gesto propio.
- **El escalón de color.** Ahora es una transición con duración.

Sacá el código muerto que quede, y todo lo que exista solo para sostenerlos: perillas, canales de muestreo, comprobaciones. Reportá qué eliminaste.

## Regla nueva: el logo no cambia de tamaño

**El logo tiene, desde el primer frame, el tamaño que va a tener en la escena.** No se agranda ni se achica en ningún momento de la secuencia.

Eso significa:
- El tamaño del lockup se deriva del destino —el primer keyframe de la coreografía— y no al revés.
- Las letras se dimensionan y se ubican en relación a ese tamaño.
- En el acomodamiento **solo cambian posición y orientación**, nunca escala.

## El acomodamiento

Es lo único que queda del final y hay que hacerlo bien.

**Simultáneo, no secuencial.** Hoy el logo primero se desplaza en plano y después rota a su orientación 3D, y se lee como dos movimientos pegados. **El desplazamiento espacial y la rotación sobre su propio eje tienen que ocurrir al mismo tiempo**, desde el primer frame del gesto hasta el último. Un solo movimiento continuo.

**Más lento.** El humano dice que incluso a tres segundos se ve rápido. Elegí una duración generosa y justificala; sigue siendo una perilla.

**Con físicas y sombra.** Al acomodarse, el logo entra en la iluminación de la escena: recibe la luz, proyecta sombra, y muestra su volumen. Hoy sale de la emisiva plana (el arreglo del especular de S8c). Esa transición de "plano sin luz" a "iluminado por la escena" tiene que ocurrir **durante** el acomodamiento, no antes ni después.

## El cambio 2D → 3D durante una transición

En S8c el cambio estaba escondido por el corte seco. Ahora que la transición tiene duración, hay que resolverlo de otra forma: el SVG blanco se desvanece mientras el mesh negro aparece, **sincronizados con el cambio de fondo**.

El requisito sigue siendo el mismo: **la silueta tiene que coincidir píxel a píxel** durante todo el cruce, o se va a leer como dos objetos distintos superpuestos. La cámara ortográfica en espacio de píxeles que resolvió esto en S8b sigue siendo la base.

**El fallback no cambia:** si el mesh no está listo cuando arranca la transición, todo sigue en SVG —que también puede pasar de blanco a negro— y el acomodamiento ocurre igual, sin volumen. El preloader no espera a nada.

## Sobre el preview

En `/probe-escena?intro` van a convivir el logo del preloader y el de la escena. **Es esperable y no es un bug**: el preview monta el preloader encima de una escena que ya tiene su logo. Cuando la escena se monte en el home va a ser uno solo.

Si podés hacer que la escena oculte su logo mientras el preview corre, mejor — pero **solo si no implica tocar la escena ni la coreografía**. Si lo implica, no lo hagas y dejalo anotado.

## Reglas absolutas

1. **No toques el efecto de aparición del texto.** Está aprobado.
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No modifiques la escena ni la coreografía del probe.** La única excepción sigue siendo el montaje del preview.
4. **No montes la escena en el home** ni construyas secciones.
5. **No romper Route B ni `DotMatrix`.**
6. **El preloader no bloquea el scroll ni un frame, y no espera a que cargue nada.**
7. **Cero `any`.** **Cero `setState` por frame.**
8. **No sumar dependencias.**
9. **Nada de base de datos.**
10. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
11. **Ni un byte del controlador ni del preview en producción.** Verificalo con `npm run build` y grep, con control positivo.
12. **No auto-confirmás que funciona porque compila.**
13. Archivos de más de 300 líneas se parten.
14. **Adaptá las comprobaciones estáticas** a la secuencia nueva: que el tamaño del logo sea constante durante toda la secuencia, que la letra termine de irse antes de que el fondo empiece, que desplazamiento y rotación del acomodamiento arranquen y terminen juntos, y que ninguna calibración rompa el orden. Las que verificaban el chasquido y el achicamiento se eliminan.

## Cierre

🛑 **PARADA:** mostrá (a) `tsc`, lint, comprobaciones y build con el grep, (b) el timeline nuevo con su justificación, (c) cómo resolvés el cruce 2D→3D durante la transición y cómo garantizás que la silueta coincida, (d) cómo hacés simultáneos el desplazamiento y la rotación, (e) qué código eliminaste, y (f) archivos y `git status`. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S8: preloader con trazo, transicion de color y acomodamiento"` → `git push`. El commit lleva S8, S8b, S8c y S8d juntos.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S8d-simplificacion.md.
Leela ENTERA antes de empezar, junto con S8c-CORRECCION.md, y tratalas como
si te las hubiera escrito directamente.

Marco no negociable:
- Es un sprint de ESCRITURA de código, continuación de S8, S8b y S8c (sin
  commitear, en el mismo working tree).
- Una sola sesión de CC sobre este worktree. Si detectás otra, frená y avisá.
- NO abras navegador ni despaches visual-qa. Verificación: tsc, lint,
  comprobaciones estáticas y npm run build con grep.
- No tocás archivos frozen. No modificás la escena ni la coreografía del
  probe: la única excepción es el montaje del preview.
- No montás la escena en el home ni construís secciones.
- No rompés Route B ni DotMatrix.
- El preloader NO bloquea el scroll ni un frame, y NO espera a que cargue
  nada.
- El efecto de aparición del texto está aprobado y no se toca.
- El logo NO cambia de tamaño en ningún momento de la secuencia.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá. No me confirmes el entendimiento.
```
