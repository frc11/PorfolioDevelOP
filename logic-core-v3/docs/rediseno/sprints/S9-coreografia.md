# S9 — La coreografía definitiva

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build`. Nada de esto dice que se vea bien.

## Lecturas obligatorias

1. `docs/rediseno/DIRECCION-ESCENA.md` — la fuente de verdad de las decisiones.
2. `docs/rediseno/outputs/S7-*.md` — sobre todo el arco del sol, las tres variantes y los siete intermedios.
3. `src/app/probe-escena/_components/` — el módulo entero: `choreography.ts`, `choreographySampler.ts`, el módulo de variantes, y el arco de luz.
4. Los archivos del intro que leen la pose inicial de la coreografía (`scene-framing.ts`, `logo-footprint.ts` y quien los consuma). **Este sprint los afecta:** ver §5.

---

## Qué decide este sprint

Hoy hay cuatro recorridos: la base calibrada a mano y tres variantes propuestas en S7. El dueño del proyecto miró las cuatro y decidió:

**La coreografía definitiva es un mix de la arquitectónica y la dramática.** La arquitectónica aporta la lectura del espacio —distancia, aire, el logo chico en un lugar grande—. La dramática aporta la amplitud: contrastes de altura, picados y contrapicados, cambios audaces entre tramos.

**Y se borran todos los keyframes derivados.** Los arcos intermedios (`quiénes somos · arco de entrada`, `persona 2 · cruce apex`, `números · arco de caída`, y todos los demás marcados `derived: true`) existían para guiar la cámara mientras el recorrido no estaba definido. Ya está definido. Se van.

El resultado es **seis keyframes reales, cero relleno.** Eso no es una simplificación: es lo que produce el movimiento grande. Con puntos lejanos el rig interpola de verdad y la cámara recorre; con arcos intermedios cada tramo queda amortiguado.

**La referencia sigue siendo nk.studio: movimientos amplios, mucho recorrido del entorno, más vueltas, más observación.**

---

## Parte 1 · El recorrido

Seis tramos, ocho pantallas de scroll. **Regla dura de amplitud: ningún tramo mueve la cámara menos de 90° de órbita**, salvo el hero, que es reposo por diseño. Los 360° se reparten desparejo, no en sextos iguales.

| Tramo | Pantallas | Órbita | Intención | Sol |
|---|---|---|---|---|
| **Hero** | 1 | 0° → 0° | Reposo. Solo vira e inercia del mouse. Es el punto de llegada del preloader: la cámara no se mueve apenas entrás. | Bajo, rasante. Sombras largas. |
| **Quiénes somos** | 2 | 0° → 130° | El recorrido más largo. La cámara **baja y se mete entre los planos suspendidos** — el entorno pasa por delante del logo. Acá es donde se ve que hay un lugar y no un objeto flotando. | Sube. Primera lectura clara del volumen. |
| **Números** | 1 | 130° → 200° | La cámara **sube y se aleja**: vista cenital parcial, la retícula aérea y las marcas de replanteo se leen como plano. Órbita corta pero desplazamiento vertical fuerte. | Alto. Luz plana, casi sin sombra. |
| **Trabajos** | 1 | 200° → 250° | La cámara casi se detiene y **mira hacia el fondo profundo**. Encuadre despejado. | Empieza a caer. |
| **Demos** | 1 | 250° → 310° | Vuelve a bajar al nivel del logo y se acerca. El momento más íntimo del recorrido. | Bajo, contraluz. Sol visible en cuadro. |
| **Cierre** | 2 | 310° → 360° | Retroceso largo. La cámara se va, el entorno se abre. Cierra en el mismo azimut que el hero pero mucho más lejos. | Se pone. Escena apagada al final. |

**Los ángulos de la tabla son la intención, no un decreto.** Si al componer encontrás que un reparto distinto lee mejor respetando la regla de los 90°, hacelo y justificalo.

### Cómo mezclar las dos variantes

No es un promedio numérico. Es una decisión por eje:

- **Distancia y encuadre:** de la arquitectónica. El espacio es protagonista, el logo no llena el cuadro salvo en Demos.
- **Altura y contraste entre tramos:** de la dramática. Los saltos de picado a contrapicado son lo que da amplitud.
- **Target y composición:** tuyo. Es donde tenés que poner criterio: qué parte del entorno queda en cuadro en cada tramo.

**Documentá cada keyframe** con de dónde salió cada valor —arquitectónica, dramática o compuesto por vos— y por qué.

### El encuadre de Trabajos

El tramo de Trabajos es **la plataforma del efecto Star Wars**, que se construye en un sprint posterior: los proyectos emergiendo desde el fondo profundo hacia la cámara. **En este sprint no lo construyas.** Lo único que tenés que hacer es dejar el encuadre preparado: cámara casi detenida, mirando hacia el fondo, con profundidad disponible por delante y sin geometría que tape la zona por donde van a venir los proyectos.

Reportá qué volumen de cuadro queda libre en ese tramo, para que el sprint del Star Wars sepa con qué cuenta.

---

## Parte 2 · Los derivados se borran

Sacá **todos** los keyframes marcados `derived: true` de la coreografía definitiva.

Dos cosas que verificar al hacerlo:

1. **Que ningún derivado esté sosteniendo una pose que importa.** El patrón de sostén (dos keyframes con la misma pose y distinto `at`) se implementó duplicando; si alguna de esas copias quedó marcada como derivada, borrarla elimina el sostén, no un arco. Revisá caso por caso antes de borrar y decí cuáles conservaste como reales.
2. **Que sacarlos no introduzca un tirón.** Medí con la unidad ya establecida —alturas de cuadro por unidad de progreso— y reportá el pico de velocidad antes y después. Si algún tramo queda con un tirón, la solución **no** es volver a meter un intermedio: es mover el `at` o el `ease` del keyframe real.

Las tres variantes de S7 y la base **se conservan** en el archivo como material de referencia. Lo que cambia es cuál es la activa por defecto.

---

## Parte 3 · El arco del sol se recalcula

El arco del sol está ligado al progreso y su relación con el nivel de luz es `level = sin(elevación)/sin(36°)`. **Cambiar el recorrido cambia dónde queda el sol en cuadro.** El 11,2% de visibilidad medido en S7 fue contra el recorrido viejo y ya no vale.

Lo que hay que hacer:

- **Recalcular la visibilidad del sol** contra las poses nuevas y reportar el porcentaje.
- **Verificar el ángulo mínimo de incidencia** a lo largo de todo el recorrido. En S7 pasó de 4° a 29°; si con las alturas nuevas vuelve a bajar cerca de 4°, hay tramos donde el logo se va a ver plano y sin forma. Reportalo con el número.
- **Que el descenso del sol siga coincidiendo con el arco de luz.** Las dos curvas cuentan la misma historia y no pueden contradecirse: cuando la intensidad baja hacia el cierre, el sol tiene que estar bajo.
- Si con el recorrido nuevo la visibilidad del sol o el modelado del logo empeoran de forma significativa, **ajustá el arco del sol** —es lo que se acomoda— y decí qué cambiaste.

---

## Parte 4 · El arreglo pendiente de Números

En el tramo de Números, con el offset de mouse al máximo, la cámara queda **1 mm por debajo del plano del piso**. Es un bug de composición que ya se detectó mirando.

Arreglo: **la altura mínima del tramo pasa a −3,89** (era −3,90). Aplicalo sobre la pose que corresponda en el recorrido nuevo, y **verificalo estáticamente**: comprobá que la altura efectiva —pose más el offset máximo de mouse, más lo que agregue la inercia en el peor caso— nunca sea negativa respecto del piso. Si el recorrido nuevo cambia esa altura, recalculá el margen en vez de copiar el −3,89.

---

## Parte 5 · El acoplamiento con el preloader ⚠️

**Esto es lo que más riesgo tiene de romperse sin que nadie lo note.**

El acomodamiento del preloader lee la **pose inicial de la coreografía** para saber a qué tamaño y posición tiene que llegar el logo. El destino no está escrito a mano: se calcula. Cambiar el keyframe del hero **cambia el destino del preloader**.

Los números conocidos: la base deja el logo en 504 px de ancho en desktop; la arquitectónica, en 290 px. Son 2,3× de diferencia. Si el mix hereda la distancia de la arquitectónica, el logo va a terminar **notablemente más chico** que hoy al final del preloader.

Lo que tenés que hacer:

1. **Reportar el ancho del logo en píxeles** que produce la pose inicial nueva, en desktop y en mobile, contra los 504 px actuales.
2. **Correr todas las comprobaciones del intro** (`introTimeline`, `introSampling`, `introFlight`, `introSilhouette`, `introShading`, `scene-framing`) y reportar el resultado. Algunas cifras publicadas van a cambiar: es esperable. Lo que **no** puede cambiar es una propiedad del arreglo `PROPERTIES`.
3. **Si el logo queda demasiado chico**, no lo arregles inventando un clamp nuevo ni tocando el preloader: **frená y reportá**, con el número. Es una decisión de composición del humano, no tuya. La salida probable es acercar la pose del hero, pero eso lo decide él.
4. `DEST_WIDTH_MARGIN` sigue viviendo en `scene-framing.ts` y sigue siendo la única fuente del clamp. No lo reimplementes.

---

## Parte 6 · El archivo es la fuente de verdad

**Regla de este sprint, no negociable:** los keyframes definitivos quedan **escritos en `choreography.ts`**, no exportados desde el editor.

Ya se perdió una calibración entera de 24 keyframes por confiar en el portapapeles del editor. El criterio de aceptación es que el archivo commiteado contenga el recorrido; si el editor exporta lo mismo, mejor, pero el archivo manda.

El editor tiene que seguir funcionando sobre el recorrido nuevo: si borrar los derivados o cambiar la variante activa rompe la lista, el exportador o el selector, **arreglalos: son parte del entregable.**

---

## Reglas absolutas

1. **No toques el home.** Todo vive en `probe-escena`, salvo la lectura de los módulos del intro que la Parte 5 exige — y ahí solo se **lee** y se **mide**, no se edita nada del preloader sin frenar antes.
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No construyas el efecto Star Wars.** Solo dejás el encuadre preparado.
4. **No montes la escena en el home.** Ese es el sprint siguiente.
5. **No sumar dependencias.**
6. **Blanco y negro.** Sin iconografía de tecnología ni elementos orgánicos.
7. **Cero `any`.** **Cero `setState` por frame** en el loop.
8. **Nada de base de datos.**
9. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
10. **No corras el dev server ni verifiques en pantalla.**
11. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.
12. Archivos de más de 300 líneas se parten.

## Paradas

🛑 **PARADA 1** — antes de escribir nada:

- (a) **La tabla completa de los seis keyframes** con todos sus valores: `at`, `ease`, ángulo, altura, distancia, target. Una fila por keyframe, y por cada valor, de dónde salió (arquitectónica / dramática / tuyo).
- (b) **La lista de derivados que vas a borrar**, y cuáles conservás como reales porque sostienen una pose.
- (c) **El pico de velocidad** antes y después, en alturas de cuadro por unidad de progreso.
- (d) **El ancho del logo en píxeles** que produce la pose inicial nueva, contra los 504 actuales — el número de la Parte 5.
- (e) Qué le pasa al sol: visibilidad recalculada y ángulo mínimo de incidencia.

Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) `tsc`, eslint y `npm run build`, (b) el resultado de **todas** las comprobaciones estáticas, incluidas las seis del intro, (c) archivos, (d) `git status`, (e) qué quedó anotado para el sprint del Star Wars sobre el encuadre de Trabajos. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S9: coreografia definitiva"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S9-coreografia.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint de composición y datos, aislado en /probe-escena.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. Nada más.
- No tocás el home ni ningún archivo frozen. No montás la escena en el
  home y no construís el efecto Star Wars.
- Los keyframes definitivos van ESCRITOS en choreography.ts. Exportar del
  editor no cuenta: el archivo es la fuente de verdad.
- Si el cambio de coreografía deja el logo del preloader demasiado chico,
  FRENÁ Y REPORTÁ con el número. No lo arregles por tu cuenta.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame en el loop.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Parada 1. No me confirmes el entendimiento.
```
