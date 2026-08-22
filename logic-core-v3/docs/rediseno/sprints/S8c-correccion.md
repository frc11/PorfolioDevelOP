# S8c — Corrección de la secuencia del preloader

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **UNA PARADA 🛑** bloqueante, antes del commit.
- **NO abras navegador ni despaches `visual-qa`.** Verificación: `tsc` exit 0, lint limpio, comprobaciones estáticas, y `npm run build` para el chequeo de producción.
- Continuación directa de S8 y S8b, que siguen **sin commitear** en el working tree.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S8b-CHASQUIDO.md` y `S8-PRELOADER.md`.
2. `src/components/layout/home-intro/` — el módulo entero.

## Qué pasó

El humano verificó S8b en pantalla. El trazo, las letras y el ritmo hasta la espera están **bien** — el efecto de aparición del texto es exactamente el buscado y no se toca.

De ahí en adelante la secuencia quedó armada distinto de lo especificado, y hay un bug.

### El bug

**En el frame del chasquido el logo queda claro, no negro.** El fondo invierte a claro correctamente, pero el logo aparece en un tono claro con contorno oscuro, en vez de tinta negra plena. Diagnosticá la causa —puede estar en el material del mesh, en la luz frontal saturando, o en el `fill` del SVG— y arreglalo. En el frame del corte el logo tiene que ser **negro pleno sobre fondo claro**.

### Lo que quedó mal armado

1. **En el chasquido escala solo el logo.** Las letras se quedan en su tamaño original, así que el logo ampliado las tapa.
2. **No hay espera después del chasquido**: el achicamiento arranca inmediatamente.
3. **El achicamiento no es del conjunto.** El logo se mueve hacia su destino mientras las letras siguen en su lugar y su tamaño.
4. **El fondo se desvanece con el texto todavía visible**, así que se ve el hero por detrás mientras el lockup sigue ahí.
5. **El logo no se achica en el lugar** antes de acomodarse: mezcla el achicamiento con el desplazamiento al destino.

## La secuencia correcta

Textual, del dueño del proyecto:

1. **El logo se dibuja** con su tamaño inicial.
2. **Aparecen las letras** — el efecto actual está bien y no se toca.
3. **Se termina de dibujar y se pinta** el relleno.
4. **Chasquido:** el logo pasa de golpe al **tamaño que va a tener el logo 3D en la animación**, y **las letras se amplían proporcionalmente con él**. Todo el lockup escala como una unidad, manteniendo sus proporciones internas.
5. **Una espera mínima**, con todo quieto en ese tamaño.
6. **Todo se achica dinámicamente al mismo tiempo** — logo y letras juntos, como un conjunto.
7. **En el camino del achicamiento**, las letras y el fondo se desvanecen. **Juntos**, no uno antes que el otro.
8. **Cuando el logo alcanza el tamaño real que tendrá en la animación**, recién ahí **se acomoda a su lugar** y arranca la página.

Diferencias clave respecto de lo implementado, para que no queden dudas:

- **El chasquido escala el conjunto entero**, no solo el logo.
- **El achicamiento y el desplazamiento al destino son dos gestos distintos y consecutivos**, no simultáneos: primero se achica en el lugar, después se acomoda.
- **El texto y el fondo se van juntos**, durante el achicamiento.
- **El acomodamiento es lo último**, con el lockup ya desaparecido.

## Prueba sobre la escena real

El humano necesita ajustar el preloader **contra el fondo que realmente va a aparecer detrás**. Hoy solo puede probarlo sobre el home, donde la escena todavía no existe, y por eso el aterrizaje se ve fuera de lugar.

**Excepción a la regla de no tocar `/probe-escena`, solo para esto:** hacé que el preloader se pueda correr **sobre la escena del probe**, con su controlador. Resolvelo de la forma menos invasiva posible — un parámetro en la URL, un botón en el panel, o lo que ensucie menos.

Requisitos:
- **No modifica la escena ni la coreografía.** El probe sigue funcionando exactamente igual cuando el preloader no se invoca.
- **Es una herramienta de desarrollo:** ni un byte en producción, igual que el controlador.
- El controlador del preloader tiene que estar disponible ahí, para poder scrubear contra la escena real.

Reportá cómo lo resolviste y qué habría que sacar el día que se limpie.

## Ajustes de tiempo

La secuencia nueva tiene un beat más (la espera post-chasquido) y separa el achicamiento del acomodamiento. Recalculá el timeline, agregá las perillas que hagan falta al controlador, y justificá los defaults. Sigue todo parametrizado.

## Reglas absolutas

1. **No toques el efecto de aparición del texto.** Está aprobado.
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No modifiques la escena ni la coreografía del probe.** La única excepción es el mecanismo para invocar el preloader ahí.
4. **No construyas secciones del home** ni montes la escena en el home.
5. **No romper Route B ni `DotMatrix`.**
6. **El preloader no bloquea el scroll ni un frame, y no espera a que cargue nada.**
7. **Cero `any`.** **Cero `setState` por frame.**
8. **No sumar dependencias.**
9. **Nada de base de datos.**
10. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
11. **No auto-confirmás que funciona porque compila.**
12. Archivos de más de 300 líneas se parten.
13. **Extendé las comprobaciones estáticas** a la secuencia nueva: que el conjunto escale como unidad, que la espera exista, que el achicamiento termine antes de que arranque el acomodamiento, y que texto y fondo se vayan juntos.

## Cierre

🛑 **PARADA:** mostrá (a) `tsc`, lint, comprobaciones y build, (b) **la causa del bug del logo claro y cómo lo arreglaste**, (c) el timeline nuevo con su justificación, (d) archivos y `git status`, (e) cómo correr el preloader sobre la escena del probe, y (f) qué verificar a ojo, en orden. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S8: preloader con trazo, chasquido y revelacion 3D"` → `git push`. El commit lleva S8, S8b y S8c juntos: los tres viven en los mismos archivos y separarlos sería artificial.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S8c-correccion.md.
Leela ENTERA antes de empezar, junto con S8b-CHASQUIDO.md, y tratalas como
si te las hubiera escrito directamente.

Marco no negociable:
- Es un sprint de ESCRITURA de código, continuación de S8 y S8b (sin
  commitear, en el mismo working tree).
- NO abras navegador ni despaches visual-qa. Verificación: tsc, lint,
  comprobaciones estáticas y npm run build.
- No tocás archivos frozen. No modificás la escena ni la coreografía del
  probe: la única excepción es el mecanismo para invocar el preloader ahí.
- No montás la escena en el home ni construís secciones.
- No rompés Route B ni DotMatrix.
- El preloader NO bloquea el scroll ni un frame, y NO espera a que cargue
  nada.
- El efecto de aparición del texto está aprobado y no se toca.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo funciona porque compila.

Arrancá. No me confirmes el entendimiento.
```
