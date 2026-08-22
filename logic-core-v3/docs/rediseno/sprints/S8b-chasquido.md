# S8b — Chasquido, controlador y revelación 3D

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, lint limpio, y la comprobación estática. El intro no corre bajo automatización (`navigator.webdriver`): solo se verifica a ojo humano.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S8-PRELOADER.md` — el preloader actual, sus tres perillas, el timeline resuelto y el contrato `introHandoff.ts`.
2. `docs/rediseno/DIRECCION-ESCENA.md` — en particular §1 (preloader) y §2 (la coreografía y su pose inicial).
3. `src/components/layout/home-intro/` — el módulo entero.

## Contexto

S8 quedó bien y el humano lo aprobó, con tres correcciones y una idea nueva que cambia la arquitectura del final.

**Las correcciones:** el lockup necesita más tamaño y la secuencia un poco más de tiempo; el texto aparece y desaparece **con desplazamiento**, y tiene que ser **puro desvanecimiento, sin dirección** — "como una nube"; y el corte de color llega demasiado pronto después del relleno.

**La idea nueva:** el logo del preloader **es el logo 3D desde el principio**, visto de frente y con luz plana para que se lea como plano. Cuando al final se acomoda en la escena, el visitante descubre que siempre tuvo volumen. Deja de haber una entrega entre dos objetos: hay **un solo objeto**.

## La secuencia nueva

1. Pantalla **oscura**. El logo se **dibuja con un trazo**.
2. Aparecen **"develOP"** arriba e **"Ingeniería para negocios reales"** abajo.
3. El trazo **se completa y se rellena**.
4. **Espera de aproximadamente un segundo.** Todo quieto, relleno, legible.
5. **El chasquido:** cambio de color de golpe **y** un salto de escala hacia arriba, en el mismo frame.
6. **Achicamiento progresivo y dinámico** — sale rápido del pico y se asienta lento, como un objeto que aterriza.
7. **Antes de que el logo llegue a destino**, el texto y el fondo se desvanecen y queda la escena visible.
8. El logo **termina de achicarse hasta el tamaño del logo de la escena**, ya sobre ella.
9. El logo **se acomoda en su lugar** y empieza la página.

## Cómo resolver el 2D → 3D

El trazo no se puede dibujar sobre un mesh: `strokeDashoffset` es de SVG. Por eso:

**El trazo y el relleno son SVG plano. El cambio a 3D ocurre exactamente en el frame del chasquido.**

En ese frame ya cambian cuatro cosas a la vez (fondo, tinta, contorno→relleno, escala). Cambiar la quinta es imperceptible, y es lo que hace la ilusión: el visitante creyó ver un logo plano hasta que el objeto se acomoda y revela volumen.

Requisitos:

- El 3D tiene que estar **montado, cargado y quieto de frente** antes del chasquido, oculto detrás del SVG o con opacidad cero. Preparalo desde el arranque del intro.
- **Encuadre coincidente en el frame del cambio:** mismo tamaño aparente y misma posición en pantalla que el SVG que reemplaza. Si no coinciden, el chasquido se lee como un salto.
- **Luz plana y frontal** mientras dura la ilusión, para que no se lea el volumen. El modelado aparece recién cuando el objeto empieza a acomodarse.
- **Red de seguridad:** si el 3D no cargó cuando llega el chasquido, todo sigue en SVG y se desvanece normalmente. **El preloader no espera al 3D en ningún caso.** Reportá cómo lo resolviste.

## El destino

El logo se achica hasta el tamaño y la posición del **primer keyframe de la coreografía**. El humano confirmó que la escena arranca ahí y que si cambia de recorrido será un cambio ligero.

**El destino se lee de la coreografía, no se hardcodea.** Si el recorrido activo cambia, el preloader tiene que seguirlo sin editar dos lugares.

## El controlador

Un panel de desarrollo para iterar sin borrar `sessionStorage` en cada prueba. Es lo que va a permitir calibrar esto de verdad.

Tiene que dar:

- **Reproducir el intro completo** las veces que haga falta, sin recargar y sin tocar el almacenamiento.
- **Un control de progreso** para scrubear la secuencia y pararse en cualquier momento — sobre todo en el frame del chasquido, que es imposible de juzgar a velocidad real.
- **Los tiempos de cada fase**, editables en vivo.
- **Los tamaños**: el del lockup y el del destino, para hacerlos coincidir mirando.
- **Lectura del estado actual**: fase, progreso, y si el 3D está listo o se cayó al fallback.

Reglas: **solo en desarrollo**, nunca en producción — ni un byte en el bundle de producción. Escritura al DOM directo, cero `setState` por frame. Y que se pueda ocultar.

## Los ajustes de S8

**Tamaño:** el lockup necesita más presencia. Elegí y justificá, con el mobile contemplado.

**Tiempo:** la secuencia nueva es más larga que los 3,2 s actuales por la espera y el achicamiento. Elegí un default y justificalo; sigue siendo parametrizado y el humano lo va a calibrar con el controlador.

**Texto sin dirección:** entra y sale **solo con opacidad**. Sin desplazamiento, sin blur direccional, sin escala. Un desvanecimiento puro. La salida sigue siendo el espejo de la entrada.

**La espera antes del chasquido:** aproximadamente un segundo de quietud total con el logo ya relleno. Es lo que hace que el chasquido golpee.

**El chasquido:** salto de escala hacia arriba en el frame del cambio de color, y de ahí un asentamiento que sale rápido y se demora al final. Que la curva del asentamiento sea un parámetro, no un literal.

## Reglas absolutas

1. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. Si el logo 3D del preloader necesita un componente propio, **creá uno nuevo**.
2. **No toques `/probe-escena`.** Podés leer la coreografía para el destino, no modificarla.
3. **No construyas secciones del home** ni montes la escena completa.
4. **No romper Route B ni `DotMatrix`.**
5. **El preloader no bloquea el scroll en ningún momento, ni un frame.**
6. **El preloader no espera a que cargue nada.**
7. **Cero `any`.** **Cero `setState` por frame.**
8. **No sumar dependencias.**
9. **Nada de base de datos.**
10. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
11. **No auto-confirmás que funciona porque compila.**
12. Archivos de más de 300 líneas se parten.
13. **Extendé la comprobación estática** de S8 a la secuencia nueva: que el texto asiente antes del chasquido, que la espera exista, que el desvanecimiento arranque antes de que el logo llegue a destino, y que ninguna calibración de las perillas rompa el orden.

## Paradas

🛑 **PARADA 1** — antes de construir: mostrá (a) el timeline resuelto con la secuencia nueva y su justificación, (b) cómo resolvés el cambio 2D→3D en el frame del chasquido, con el encuadre coincidente y el fallback, (c) cómo lee el destino desde la coreografía, y (d) qué controles va a tener el panel. Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) `tsc`, lint y la comprobación estática, (b) archivos, (c) `git status`, (d) cómo usar el controlador, y (e) qué verificar a ojo, en orden. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S8b: chasquido, controlador y revelacion 3D del preloader"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S8b-chasquido.md.
Leela ENTERA antes de empezar, junto con S8-PRELOADER.md y la §1 y §2 de
DIRECCION-ESCENA.md, y tratalas como si te las hubiera escrito directamente.

Marco no negociable:
- Es un sprint de ESCRITURA de código, sobre el home.
- NO corras el dev server, NO abras navegador, NO despaches visual-qa.
  Verificación: tsc exit 0, lint limpio y la comprobación estática.
- No tocás archivos frozen ni /probe-escena (podés leer la coreografía).
- No montás la escena completa ni construís secciones.
- No rompés Route B ni DotMatrix.
- El preloader NO bloquea el scroll ni un frame, y NO espera a que cargue
  nada: si el 3D no está listo, cae al SVG y sigue.
- El controlador es solo de desarrollo: ni un byte en producción.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá. No me confirmes el entendimiento.
```
