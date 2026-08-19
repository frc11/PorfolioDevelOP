# PROBE-ESCENA — ¿Aguanta el logo una órbita de 360°?

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **UNA PARADA 🛑** bloqueante, antes del commit.
- Sesión limpia (`/clear` previo).

## Lecturas obligatorias

1. `docs/rediseno/outputs/S3-HERO.md` — en particular la sección de cierre: el diagnóstico de por qué R3F escribe `state.pointer` por su cuenta, y el estado actual del logo 2D y del canvas.
2. `src/components/layout/HeroCanvas.tsx` y `HeroArtifactLayer.tsx` — cómo se monta hoy el canvas.
3. `src/lib/logo-footprint.ts` — la calibración de encuadre existente.

## Por qué existe este probe

El home de develOP va a tener una **escena 3D persistente**: el logo en un estudio, con una cámara que lo orbita 360° a lo largo de cuatro tramos de scroll, con inercia, offset de mouse e iluminación que cambia en el recorrido.

Antes de construir esa coreografía —que son varios sprints— hay que responder **una sola pregunta que puede matarla entera**:

> El logo es una **extrusión plana de un SVG**. ¿Aguanta que la cámara lo mire desde todos los ángulos, o hay posiciones donde se ve pobre, plano o feo?

**Este probe no construye la coreografía.** Construye una escena de prueba manipulable para que un humano decida, mirando, cómo tiene que ser esa coreografía.

## La escena buscada

La referencia es el hero actual del sitio, pero llevado a escena tridimensional:

- **Logo negro mate** (no cromado). Decisión tomada: el cromado exige un HDRI de 1,27 MiB solo para tener algo que reflejar, y desde ángulos oblicuos se ensucia. Un material mate con luces propias se ve sólido desde cualquier lado y **elimina el HDRI del presupuesto de red**. Medir cuánto baja el peso es parte del entregable.
- **Fondo claro** de estudio (papel `#F7F7F5`), con **sombra proyectada al piso** — como en el hero actual.
- **Partículas en profundidad**: hoy los puntos son una malla plana detrás del logo. Acá tienen que ser partículas distribuidas en el volumen de la escena, a distintas distancias, de modo que la cámara al moverse genere paralaje real entre ellas. Es lo que convierte un fondo en un espacio.
- **Un par de elementos de ambiente**, con criterio y sin cargar la escena: el logo es el protagonista. Usá tu juicio de diseño; si algo compite con el logo, sacalo.

## Lo que hay que construir

Una ruta de prueba **`/probe-escena`**, no enlazada desde ningún lado, con:

1. **La escena** descrita arriba.
2. **Una cámara que orbita el logo**, con estos controles manipulables en pantalla (sliders o inputs, sin pretensión estética):
   - **ángulo** de la órbita, 0° a 360°
   - **altura** de la cámara
   - **distancia** al logo
   - **intensidad y temperatura** de la luz principal
   - un botón que **recorra la órbita completa** automáticamente, para ver el ciclo entero de corrido
3. **Lectura en pantalla de los valores actuales** de esos parámetros, para que el humano pueda anotar las posiciones que le gusten y pasarlas al sprint de coreografía. Escribí los valores al DOM directo, sin `setState` por frame.

**Sin scroll, sin inercia, sin secciones, sin offset de mouse.** Todo eso es del sprint siguiente. Acá solo importa: cómo se ve el logo desde cada ángulo.

## La cuestión del perfil

Al ser una extrusión, en el perfil exacto (90° y 270°) el logo es una lámina. La hipótesis a probar es que **variando la altura de la cámara en esos tramos** —de modo que lo mire escorzado desde arriba o desde abajo en vez de de canto puro— el momento deja de ser pobre y puede volverse interesante.

Verificá esa hipótesis y reportá si funciona. Si no funciona, reportá qué alternativas ves (más profundidad de extrusión, biselado del canto, otra cosa) sin implementarlas.

## Entregables del reporte

`docs/rediseno/outputs/PROBE-ESCENA.md` con:

1. **Qué se construyó** y cómo correrlo.
2. **Peso real de la escena sin HDRI**, medido sobre build de producción, comparado contra los ~1,42 MiB actuales. Es el número que decide si el 3D en mobile es viable.
3. **Performance**: FPS con la órbita corriendo, y qué pasa con las partículas en cantidad. Si medís en desktop, decilo: no extrapoles a mobile.
4. **Tu lectura de los ángulos**: en cuáles el logo se ve sólido y en cuáles no, y si la variación de altura resuelve el perfil.
5. **Qué le hace falta a esta escena** para sostener cuatro paradas de coreografía — lo que veas que falta, no lo que imagines que se pide.

## Reglas absolutas

1. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. **Si necesitás un artefacto distinto para la escena, creá uno nuevo**: no edites el frozen.
2. **No toques el home.** Ni `page.tsx`, ni `HeroSection`, ni `HomeIntro`, ni el canvas actual. Este probe vive aislado en su ruta.
3. **No sumar dependencias.** R3F, drei y three ya están instalados.
4. **Cero `any`.** Cero `setState` por frame.
5. **Nada de base de datos.**
6. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
7. **No auto-confirmás que se ve bien.** Vos construís el instrumento; el juicio estético es del humano.
8. Recordá la trampa de la pestaña oculta: con la pestaña ocluida no hay rAF ni mediciones válidas. Si no podés ver la escena, decilo en vez de inferir.

## Cierre

`.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3\`, solo: **EXIT 0**. Lint limpio en lo tocado.

🛑 **PARADA:** mostrá (a) `tsc`, (b) archivos, (c) `git status`, (d) la URL y cómo usar los controles, y (e) el peso medido sin HDRI. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "probe: escena 3D con orbita de camara"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/PROBE-ESCENA.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Es un sprint de ESCRITURA de código, aislado en su propia ruta.
- No tocás el home ni ningún archivo frozen.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any.
- No construís la coreografía: construís el instrumento para diseñarla.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo en pantalla.

Arrancá. No me confirmes el entendimiento.
```
