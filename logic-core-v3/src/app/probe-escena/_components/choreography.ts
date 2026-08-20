import type { ChoreoKeyframe, ChoreoTramo, LightStop } from './choreographyTypes'

/**
 * LA COREOGRAFÍA — datos, no lógica.
 *
 * Este archivo es el que se abre para calibrar el movimiento: los keyframes de
 * cámara, los tramos y la curva de luz. El vocabulario que los describe está en
 * `choreographyTypes.ts`, la matemática que los consume en
 * `choreographySampler.ts` y la física que los modula en
 * `choreographyPhysics.ts`. Ninguno de los tres hay que tocarlo para mover la
 * cámara o la luz.
 *
 * ── Las 8 pantallas ────────────────────────────────────────────────────────
 *
 * El progreso 0→1 cubre 8 pantallas de scroll repartidas en seis tramos, así
 * que cada pantalla vale 0,125 exacto y los bordes de tramo caen en múltiplos
 * de esa fracción (ver `CHOREO_TRAMOS`).
 *
 * ── De dónde salen los números ─────────────────────────────────────────────
 *
 * Veintiuno de los treinta keyframes salen de una sesión de calibración
 * completa: el humano recorrió el track con el editor de S5 mirando la escena,
 * ajustó las posiciones capturadas y agregó **siete sostenes** con el botón de
 * duplicar. Los otros nueve van marcados `derived: true` y son míos: dos de S4,
 * que existen porque la descripción del recorrido pide sub-movimientos
 * SECUENCIALES ("en ese orden", "y luego") que dos posiciones no pueden
 * expresar, y **siete de S7, que le dan curvatura a los tramos**.
 *
 * ── S7 · los siete arcos ───────────────────────────────────────────────────
 *
 * El recorrido iba **en línea recta entre pose y pose**: la interpolación era
 * continua pero el CAMINO no tenía forma. Los siete intermedios lo sacan de la
 * recta —un arco, una demora, una anticipación— sin tocar una sola pose
 * compuesta ni un solo `at` existente. Cada uno documenta cuánto desvía el
 * camino (entre 1,08 y 3,03 de mundo) y por qué esa forma y no otra.
 *
 * **Demos no lleva ninguno**: el giro ya tiene cuatro waypoints y velocidad
 * pareja, y ahí no hay nada que arreglar.
 *
 * La vuelta de 360° sobrevive exacta: la tabla desenvuelta sigue terminando en
 * 360. Y el salto de velocidad más grande de todo el track **bajó** de 75,6 a
 * 49,7 alturas de cuadro por unidad de progreso, porque el arco del cierre
 * reparte entre dos segmentos el arranque brusco que tenía el `arrive`.
 *
 * ⚠️ **La calibración vivió en memoria durante una sesión entera y casi se
 * pierde.** El editor exporta al portapapeles, y si ese texto no se pega acá,
 * recargar la página lo borra todo. Ver el aviso grande en
 * `choreographyEditor.ts`: **exportar no es guardar.**
 *
 * **S6 tocó cinco cosas y todas están documentadas en el keyframe que cambió**:
 * el ease y el reparto del descenso de Números, el nombre del keyframe que
 * subía llamándose "se aleja", el ángulo repetido del giro de Demos, el final
 * reducido a tres beats limpios y el sostén del cierre. Ninguna pose compuesta
 * se movió.
 *
 * ── Cómo se edita esto ─────────────────────────────────────────────────────
 *
 * A mano, o con el **editor de keyframes** del propio probe (modo `editor` en
 * `/probe-escena`, S5): se elige un keyframe de la lista, se lo ajusta con los
 * sliders mirando la escena, y el botón de exportar devuelve este bloque
 * entero, actualizado y con estos mismos comentarios, para pegarlo acá. Las
 * ediciones del probe viven en memoria y no tocan el disco: **este archivo
 * sigue siendo la fuente de verdad.**
 *
 * Un detalle que importa si se edita a mano: **los comentarios de adentro del
 * array se editan en `choreographyNotes.ts`**, que es de donde el exportador
 * los saca. Cambiar uno acá y no allá se pierde en el próximo pegado. Todo lo
 * demás de este archivo —este doc, los tramos, el arco de luz— es comentario de
 * verdad y el editor no lo toca.
 *
 * ── Lo que se calibra primero ──────────────────────────────────────────────
 *
 * 1. **Los dos movimientos más violentos del recorrido**, medidos en alturas de
 *    cuadro por unidad de progreso: la caída de `demos · giro ½` (106) y el
 *    levantarse de `final · se levanta` (51). El resto del track corre entre 12
 *    y 31. Los dos son intención calibrada y el sprint no los marcó, pero si el
 *    recorrido se siente brusco, empiezan ahí.
 * 2. **`frameY` no hace nada por debajo de una distancia de 11,4** — la mitad
 *    del alto visible no llega a superar la media altura del logo, así que el
 *    recorrido disponible es cero. El recorrido calibrado usa distancias de 7 a
 *    16, o sea que el canal solo vive en cuatro de sus diez poses. Es
 *    probablemente por eso que quedó en cero en todas.
 * 3. **Dos de los siete sostenes ya no sostienen**: se los duplicó y después se
 *    les movió la pose, así que el nombre miente. Están marcados en su
 *    comentario.
 */

// ── Los tramos ──────────────────────────────────────────────────────────────

/** Pantallas de scroll que cubre el recorrido completo. */
export const CHOREO_SCREENS = 8

/**
 * Los seis tramos. `from`/`to` son múltiplos exactos de 1/8 y cubren [0, 1] sin
 * huecos ni solapes — el sampler se apoya en eso para la lectura del tramo
 * actual.
 */
export const CHOREO_TRAMOS: readonly ChoreoTramo[] = [
  { name: 'hero', screens: 1, from: 0, to: 0.125 },
  { name: 'quiénes somos', screens: 2, from: 0.125, to: 0.375 },
  { name: 'números', screens: 1, from: 0.375, to: 0.5 },
  { name: 'portfolio', screens: 1, from: 0.5, to: 0.625 },
  { name: 'demos', screens: 1, from: 0.625, to: 0.75 },
  { name: 'movimiento final + cierre', screens: 2, from: 0.75, to: 1 },
]

// ── Los keyframes ───────────────────────────────────────────────────────────

/**
 * El recorrido. 30 keyframes: 21 capturados + 9 derivados.
 *
 * ⚠️ El censo de arriba cuenta 21 "capturados", y **siete de esos son sostenes
 * creados con el editor**, no capturas: los que terminan en `· sostén`. El
 * origen es un dato de la SESIÓN de edición y muere al pegar el bloque en el
 * archivo, así que desde acá la única marca que queda es el nombre. Dos de esos
 * siete, además, ya no sostienen nada: se los duplicó y después se les movió la
 * pose. Cada uno lo dice en su comentario.
 *
 * Los derivados son dos de S4 (sub-movimientos que las capturas no expresaban)
 * y **siete de S7**: los que se llaman `· arco de …` y le dan curvatura a su
 * tramo. Se pueden borrar los siete sin perder una sola pose compuesta — el
 * recorrido vuelve a ser el de S6, en línea recta entre pose y pose.
 *
 * La pose son CINCO canales: ángulo, altura, distancia y los dos de encuadre.
 * La luz salió de acá en S6 y vive en `LIGHT_ARC`, abajo — que desde S7 lleva
 * además la posición del sol, porque el sol Y la luz principal son lo mismo.
 */
export const CHOREO_KEYFRAMES: readonly ChoreoKeyframe[] = [
  // ── Tramo 1 · Hero ───────────────────────────────────────────────────────
  //
  // "la cámara mira alto y baja hasta encuadrar el hero"
  {
    // Sin `ease`: es el primer keyframe, no se llega a él desde ningún lado.
    //
    // Hasta S5 este keyframe llevaba `keyIntensity: 0` adentro de su pose, o sea
    // que el recorrido arrancaba literalmente a oscuras y subía la luz en la
    // primera transición. Nadie diseñó eso: es lo que queda cuando se compone una
    // posición con el slider de luz en el piso. La luz ya no vive en la pose.
    at: 0,
    name: 'entrada · mirada alta',
    pose: { angleDeg: 0, height: 9, distance: 15, frameX: 0.9, frameY: 0 },
  },
  {
    // ═══ DERIVADO · S7 · curvatura ═══
    //
    // La bajada del hero era una RECTA: la cámara caía 9 de altura y se acercaba 4
    // sobre la línea que une las dos poses. Este intermedio la saca de esa línea:
    // se corre 7° de azimut y **se queda lejos** (15,4 contra los 15 de arranque)
    // mientras baja, así que el acercamiento resuelve al final en vez de repartirse
    // parejo. El camino se desvía **2,77 de mundo** de la recta — 0,57 alturas de
    // cuadro, o sea medio cuadro de excursión.
    //
    // `linear` y no `shift`: la bajada es UNA gesticulación y este punto vive
    // adentro. Con `shift` la cámara se frenaría en el medio del descenso.
    //
    // Ninguna pose del humano se tocó: el arco va ENTRE las dos.
    at: 0.068,
    name: 'hero · arco de bajada',
    derived: true,
    ease: 'linear',
    pose: { angleDeg: -7, height: 4.6, distance: 15.4, frameX: 0.9, frameY: 0 },
  },
  {
    // `arrive` — la curva del sistema para lo que ENTRA. El descenso desde 9,00
    // aterriza en el encuadre del hero, no lo cruza, y se acerca de 15 a 11
    // mientras baja.
    at: 0.125,
    name: 'hero',
    ease: 'arrive',
    pose: { angleDeg: 0, height: 0, distance: 11, frameX: 0.75, frameY: 0 },
  },
  {
    // El patrón de sostén: misma pose que el keyframe anterior, más adelante en el
    // recorrido. La cámara LLEGA al hero en 0,125 y se queda quieta hasta 0,188,
    // así que el encuadre se puede leer en vez de cruzarse. Es el arreglo del
    // pendiente №1 de S4 ("la pose de cada tramo cae en su borde") y se hace con el
    // botón "duplicar" del editor.
    at: 0.188,
    name: 'hero · sostén',
    ease: 'arrive',
    pose: { angleDeg: 0, height: 0, distance: 11, frameX: 0.75, frameY: 0 },
  },

  // ── Tramo 2 · Quiénes somos (dos personas) ───────────────────────────────
  {
    // ═══ DERIVADO · S7 · curvatura ═══
    //
    // Entre el sostén del hero y la persona 1 la cámara subía 5, se acercaba 2 y
    // barría el logo de un lado al otro de la pantalla, todo sobre una recta. Acá
    // el gesto se ordena en dos tiempos: **primero sube** (3,40 de 5,00) y **se
    // mantiene lejos** (10,70), y recién después el logo cruza. El `frameX` queda
    // en 0,30 —todavía a la derecha— para que el barrido no arranque hasta que la
    // cámara ya se levantó.
    //
    // Desvío de la recta: 1,39 de mundo. Es el más chico de los siete, y tiene por
    // qué: acá la excursión que importa es la de TIEMPO, no la de espacio.
    //
    // `shift`: el intermedio ES un beat. La cámara se demora arriba antes del
    // cruce, que es lo que la referencia hace y este recorrido no hacía.
    at: 0.223,
    name: 'quiénes somos · arco de entrada',
    derived: true,
    ease: 'shift',
    pose: { angleDeg: 5.5, height: 3.4, distance: 10.7, frameX: 0.3, frameY: 0 },
  },
  {
    // "baja el encuadre horizontal, sube el vertical y se acerca al logo, TODO
    // AL MISMO TIEMPO" — una sola transición, sin intermedios.
    //
    // La ambigüedad de "el vertical" quedó resuelta al calibrar, y a favor de la
    // ALTURA DE CÁMARA: `frameY` está en cero en todo el recorrido. No es un
    // olvido — ver la nota de `demos · giro ½` sobre por qué ese canal casi no
    // tiene efecto a las distancias que este recorrido usa.
    at: 0.25,
    name: 'quiénes somos · persona 1',
    ease: 'shift',
    pose: { angleDeg: 0, height: 5, distance: 9, frameX: -0.8, frameY: 0 },
  },
  {
    // Sostén de verdad: pose idéntica a la anterior. Se llega y se aguanta.
    at: 0.293,
    name: 'quiénes somos · persona 1 · sostén',
    ease: 'shift',
    pose: { angleDeg: 0, height: 5, distance: 9, frameX: -0.8, frameY: 0 },
  },
  {
    // ═══ DERIVADO ═══
    //
    // "sube el vertical, sube el horizontal, y LUEGO vuelve a bajar el
    // vertical". Ese "luego" pide un intermedio que las capturas no tienen.
    //
    // Lo que hace es el **cruce**: `frameX` barre de −0,80 a +0,80 —el logo cruza
    // la pantalla entera de izquierda a derecha, que es lo que deja lugar para la
    // segunda persona— y acá va por el medio, en −0,16. La altura hace una
    // excursión chica hacia abajo (5,00 → 4,54 → 5,00) y la distancia una hacia
    // afuera (9,00 → 10,70 → 9,00): la cámara se abre un poco en el cruce y vuelve.
    // Es lo que impide que el barrido se lea como un desplazamiento plano.
    //
    // **Los cinco números son interpolación, no captura.** Para matar la excursión
    // de altura, poner 5; para la de distancia, poner 9. Un número cada una.
    at: 0.335,
    name: 'persona 2 · cruce (apex)',
    derived: true,
    ease: 'linear',
    pose: { angleDeg: 0, height: 4.5431, distance: 10.7012, frameX: -0.1568, frameY: 0 },
  },
  {
    at: 0.375,
    name: 'quiénes somos · persona 2',
    ease: 'shift',
    pose: { angleDeg: 0, height: 5, distance: 9, frameX: 0.8, frameY: 0 },
  },
  {
    // ⚠️ **Se llama "sostén" pero NO sostiene.** Salió del botón duplicar y después
    // se le movió la pose: la altura baja de 5,00 a 2,65, la distancia se abre a
    // 9,83 y el encuadre vuelve del borde (0,80 → 0,57). Es un beat propio —el
    // arranque del descenso a Números— con el nombre que le quedó del duplicado.
    //
    // Es además el segmento más rápido del primer medio recorrido: 28,0 alturas de
    // cuadro por unidad de progreso. Renombrarlo son dos strings (acá y en
    // `choreography.ts`); se deja como está para no romper la referencia del video
    // ya grabado.
    at: 0.395,
    name: 'quiénes somos · persona 2 · sostén',
    ease: 'shift',
    pose: { angleDeg: 0, height: 2.6492, distance: 9.8298, frameX: 0.5698, frameY: 0 },
  },

  // ── Tramo 3 · Números ────────────────────────────────────────────────────
  {
    // ═══ DERIVADO · S7 · curvatura ═══
    //
    // La caída a Números era el tramo recto más largo de la primera mitad: 6,5 de
    // altura en línea, con la distancia apenas moviéndose. Acá la caída **se abre
    // hacia afuera** (9,83 → 10,60 → 9,00) y **se demora arriba**: la altura queda
    // en 0,10 cuando la recta ya la habría llevado a −0,75. La cámara se aleja un
    // paso, se cuelga, y recién ahí se desploma.
    //
    // El azimut NO se toca y es deliberado: Números es la pantalla frontal del
    // recorrido —todo el tramo vive en 0°— y un barrido lateral rompería esa
    // frontalidad. Acá la curvatura es de altura y distancia, no de ángulo.
    //
    // Desvío de la recta: 1,08. Es el más chico de los siete en espacio, y el que
    // más cambia el TIEMPO del gesto.
    at: 0.414,
    name: 'números · arco de caída',
    derived: true,
    ease: 'shift',
    pose: { angleDeg: 0, height: 0.1, distance: 10.6, frameX: 0.6, frameY: 0 },
  },
  {
    // ═══ DERIVADO ═══
    //
    // "reduce altura, aumenta distancia (EN ESE ORDEN, SECUENCIAL)". Secuencial
    // = un keyframe en el medio: la altura ya abajo, con la distancia todavía sin
    // abrir.
    //
    // Al calibrar, la altura de este keyframe bajó hasta **−3,90, el piso del
    // rango**: la cámara rasa el papel. Es la pose más baja del recorrido junto con
    // las tres de Demos.
    //
    // ── S6 · 1: `linear` → `shift` ─────────────────────────────────────────
    //
    // Con `linear` la cámara llegaba al fondo a velocidad plena y el keyframe
    // siguiente la frenaba de golpe. `linear` es para los waypoints que viven
    // ADENTRO de una gesticulación, y éste no lo es: la propia descripción dice
    // SECUENCIAL, o sea que acá TERMINA el "baja la altura" y recién entonces
    // arranca el "se aleja". Un final de gesto pide una curva de llegada.
    //
    // ── S6 · 2: `at` 0,464 → 0,445 ─────────────────────────────────────────
    //
    // Éste es el arreglo del tirón, y hay que medirlo en **alturas de cuadro** —
    // cuánto se mueve y cuánto cambia de tamaño el objeto EN PANTALLA, que es la
    // única unidad en la que una bajada y un alejamiento se comparan.
    //
    // Los tres beats de la pantalla de Números corrían a **17,9 / 47,4 / 19,3** por
    // unidad de progreso: el del medio —bajar a −3,90 y volver a subir a 1,00 en
    // 0,024 de progreso— iba a **más del doble** que sus dos vecinos. Eso es el
    // tirón, y se lee como un rebote.
    //
    // Con los `at` en 0,445 y 0,491 quedan en **24,7 / 24,7 / 25,8**, o sea una
    // dispersión del 4,5% contra el 105% que había. **La pantalla dura exactamente
    // lo mismo y ninguna pose se tocó**: lo único que cambió es cuánto le toca a
    // cada beat.
    at: 0.445,
    name: 'números · baja la altura',
    derived: true,
    ease: 'shift',
    pose: { angleDeg: 0, height: -3.9, distance: 9, frameX: 0.4762, frameY: 0 },
  },
  {
    // ── S6: renombrado, y el `at` 0,488 → 0,491 ────────────────────────────
    //
    // ANTES se llamaba `números · se aleja`, y el nombre mentía: de −3,90 a 1,00
    // son 4,90 de altura contra 2,00 de distancia. Medido en pantalla, la subida
    // pesa **más del triple** que el alejamiento. Un keyframe que dice una cosa y
    // hace otra es la clase de dato que después nadie se anima a tocar.
    //
    // El movimiento no cambió — cambió el nombre, que ahora dice las dos cosas en
    // el orden en que pesan. El `at` es la otra mitad del arreglo del tirón, y está
    // explicado en el keyframe anterior.
    at: 0.491,
    name: 'números · sube y se aleja',
    ease: 'shift',
    pose: { angleDeg: 0, height: 1, distance: 11, frameX: 0.0129, frameY: 0 },
  },
  {
    // "y luego vuelve a subir altura y a acercarse".
    //
    // Ojo con esa frase, porque el dato calibrado la reparte distinto: la subida de
    // altura ya ocurrió en el keyframe anterior, acá la cámara **se sigue alejando**
    // (11,0 → 14,1) y el acercarse llega recién en el sostén (14,1 → 12,0). El
    // gesto descrito existe, pero repartido en tres keyframes y no en uno.
    at: 0.5,
    name: 'números',
    ease: 'shift',
    pose: { angleDeg: 0, height: 1, distance: 14.1, frameX: 0, frameY: 0 },
  },
  {
    // ═══ DERIVADO · S7 · curvatura ═══
    //
    // **Este arreglo el segmento más lento de todo el recorrido.** De `números` a
    // su sostén la cámara derivaba en línea recta a 4,5 alturas de cuadro por
    // unidad de progreso, contra las 12 a 31 del resto del track: una pantalla
    // entera de deriva plana.
    //
    // Ahora el camino pasa **por arriba**: sube a 2,00 (por encima de sus dos
    // extremos, que están en 1,00 y 0,00) y se abre a 14,60 (por encima de 14,10 y
    // de 12,00), con 4° de barrido lateral que vuelven a cero. Es un arco de verdad
    // —la cámara sale de la recta por los dos canales a la vez— y el tramo pasa de
    // un pico de 12,0 a uno de 34,0.
    //
    // `linear`: la deriva es una sola gesticulación lenta y no quiere un beat en el
    // medio.
    at: 0.531,
    name: 'números · deriva en arco',
    derived: true,
    ease: 'linear',
    pose: { angleDeg: -4, height: 2, distance: 14.6, frameX: -0.1, frameY: 0 },
  },
  {
    // ⚠️ **Otro que se llama "sostén" y no sostiene**: baja la altura a 0 y se
    // acerca a 12. Además vive en 0,563, o sea DENTRO de la pantalla de Portfolio y
    // no de la de Números. Las dos cosas son deliberadas —es el cierre del gesto de
    // Números derramándose en la pantalla siguiente— pero se leen mal desde el
    // nombre.
    at: 0.563,
    name: 'números · sostén',
    ease: 'shift',
    pose: { angleDeg: 0, height: 0, distance: 12, frameX: 0, frameY: 0 },
  },

  // ── Tramo 4 · Portfolio ──────────────────────────────────────────────────
  {
    // ═══ DERIVADO · S7 · curvatura ═══
    //
    // **Es el intermedio que más desvía el camino: 3,03 de mundo, 0,82 alturas de
    // cuadro.** Y va en el segmento más cargado del recorrido fuera de Demos.
    //
    // El "acercamiento diagonal" era una recta que hacía las tres cosas repartidas
    // parejo. Acá la cámara **toma la curva por afuera**: el ángulo se ADELANTA (27
    // de 45 cuando la recta daría 24), la distancia se SOSTIENE (11,00 cuando la
    // recta ya iría por 9,50) y la altura LLEGA TARDE (1,90 contra 3,20). O sea:
    // primero gira quedándose lejos, y recién sobre el final se mete y sube.
    //
    // Es el mismo movimiento con otra forma. La pose de `portfolio` no se tocó.
    at: 0.589,
    name: 'portfolio · arco de aproximación',
    derived: true,
    ease: 'shift',
    pose: { angleDeg: 27, height: 1.9, distance: 11, frameX: -0.24, frameY: 0 },
  },
  {
    // "se acerca, rota hacia la derecha y sube la altura — un ACERCAMIENTO
    // DIAGONAL": las tres a la vez, una sola transición sobre toda la pantalla.
    // `frameX` −1,00 deja el logo pegado a la izquierda para que el contenido
    // ocupe arriba a la derecha.
    //
    // Es el segmento más cargado del recorrido fuera de Demos: 31,2 alturas de
    // cuadro por unidad de progreso, con 726 grados por unidad encima.
    at: 0.625,
    name: 'portfolio',
    ease: 'shift',
    pose: { angleDeg: 45, height: 6, distance: 7, frameX: -1, frameY: 0 },
  },
  {
    // Sostén de verdad: pose idéntica a la anterior.
    at: 0.643,
    name: 'portfolio · sostén',
    ease: 'shift',
    pose: { angleDeg: 45, height: 6, distance: 7, frameX: -1, frameY: 0 },
  },

  // ── Tramo 5 · Demos ──────────────────────────────────────────────────────
  //
  // "rota 360° MIENTRAS baja la altura, y termina con la cámara mirando el logo
  // desde abajo a la izquierda hacia arriba a la derecha".
  //
  // ── S6: el giro dejó de frenar en el medio ───────────────────────────────
  //
  // ANTES `giro ¼` y `giro ½` tenían el MISMO ángulo, así que entre los dos la
  // cámara no rotaba: solo caía. El giro corría a **5294 / 0 / 2250 / 2571**
  // grados por unidad de progreso — arrancaba al doble de velocidad, frenaba en
  // seco y volvía a arrancar. Eso es el frenar-caer-arrancar.
  //
  // AHORA corre a **2500 / 2500 / 2500 / 2571**, con una dispersión del 2,8%. Lo
  // consiguen dos cambios y ninguno toca una pose compuesta: el ángulo repetido
  // de `giro ½` pasa a 180 (el punto medio exacto de sus vecinos) y los `at` de
  // `giro ¼` y `giro ½` se corren a 0,679 y 0,697. El primer tramo tenía 0,017
  // de progreso para 90°: era el doble de rápido que cualquier otro.
  //
  // El comentario viejo prometía "proporcional al ángulo (74° / 31° / 83,5° /
  // 74° sobre 262,5°)". Esos números eran de una captura anterior y hacía rato
  // que no describían el dato. La vuelta ahora va **45 → 135 → 180 → 225 → 315**
  // y el tramo 6 la completa hasta 360.
  //
  // Los cinco van `turn: 'literal'`: es la marca explícita de "acá se da la
  // vuelta entera, no se vuelve por donde se vino".
  {
    at: 0.679,
    name: 'demos · giro ¼',
    ease: 'linear',
    turn: 'literal',
    pose: { angleDeg: 135, height: 3.9, distance: 7, frameX: -0.5, frameY: 0 },
  },
  {
    // ── S6: 135° → 180°, y el `at` 0,675 → 0,697 ───────────────────────────
    //
    // ANTES este keyframe tenía **el mismo ángulo que `giro ¼`**, así que entre los
    // dos la cámara no rotaba: solo se desplomaba 7,8 de altura. El 135 repetido no
    // era una composición — es lo que queda cuando se compone un waypoint moviendo
    // altura, distancia y encuadre sin tocar el slider de ángulo.
    //
    // 180 es exactamente el punto medio entre sus dos vecinos (135 y 225), así que
    // la vuelta pasa por su mitad en la mitad del tramo. El porqué completo está en
    // el separador del tramo, arriba.
    //
    // **Este es el momento más violento de todo el recorrido**: 106 alturas de
    // cuadro por unidad de progreso, cuatro veces cualquier otro. Es la caída de
    // 3,90 a −3,90 en 0,018. No se tocó —es intención calibrada y el sprint no la
    // marcó— pero queda medido, porque es lo primero que va a doler si el recorrido
    // se siente brusco.
    //
    // Su `frameY` de 0,10 es el único distinto de cero del recorrido, y **no hace
    // nada**: el encuadre vertical solo tiene recorrido cuando la mitad del alto
    // visible supera la media altura del logo, o sea a partir de una distancia de
    // **11,4**. Acá la cámara está a 8. Se deja porque cambiarlo tampoco haría nada.
    at: 0.697,
    name: 'demos · giro ½',
    ease: 'linear',
    turn: 'literal',
    pose: { angleDeg: 180, height: -3.9, distance: 8, frameX: 0, frameY: 0.1 },
  },
  {
    at: 0.715,
    name: 'demos · giro ¾',
    ease: 'linear',
    turn: 'literal',
    pose: { angleDeg: 225, height: -3.9, distance: 7, frameX: -0.5, frameY: 0 },
  },
  {
    // La cámara termina ABAJO (altura −3,90, el piso del rango) y el logo salta a
    // la derecha (`frameX` +1,00) para dejarle abajo a la izquierda a las demos.
    at: 0.75,
    name: 'demos',
    ease: 'shift',
    turn: 'literal',
    pose: { angleDeg: 315, height: -3.9, distance: 7, frameX: 1, frameY: 0 },
  },
  {
    // Sostén de verdad: pose idéntica a la anterior. Es el más largo del recorrido
    // (0,038 de progreso), y tiene por qué: viene de la vuelta entera.
    at: 0.788,
    name: 'demos · sostén',
    ease: 'shift',
    turn: 'literal',
    pose: { angleDeg: 315, height: -3.9, distance: 7, frameX: 1, frameY: 0 },
  },

  // ── Tramo 6 · Movimiento final + cierre ──────────────────────────────────
  //
  // "se levanta, gira un poco, baja, y se aleja".
  //
  // ── S6: de cuatro beats a TRES ───────────────────────────────────────────
  //
  // ANTES había un cuarto keyframe entre `gira` y el cierre —`final · baja`, en
  // 354,09°— y el ángulo del final iba **315 → 360 → 354,09 → 0**. Ese retroceso
  // de casi 6° no está en la intención descrita y se lee como una vacilación,
  // seguida de otro cambio tan chico que no se percibe.
  //
  // AHORA son tres beats limpios: **se levanta, gira hasta 360, se aleja al
  // cierre.** El "baja" de la descripción no se perdió: la altura cae de 4,50 a
  // 1,50 dentro del último beat, junto con el alejamiento, y ahí se lee como una
  // sola cosa en vez de como dos.
  //
  // Cada uno va `shift` para que se lean como beats y no como un barrido
  // continuo. El cierre es la excepción y explica su curva en su comentario.
  //
  // Lo que NO se tocó y conviene tener medido: el levantarse corre a **51,4
  // alturas de cuadro por unidad de progreso** —8,4 de altura en 0,037— y es el
  // segundo movimiento más violento del recorrido, después de la caída de
  // `giro ½`. Es intención calibrada y el sprint no lo marcó.
  //
  // ── S7: el ascensor se convirtió en arco ─────────────────────────────────
  //
  // El levantarse ya no sube por una vertical: un intermedio derivado lo saca de
  // la recta. El detalle está en su propio comentario, acá abajo.
  {
    // ═══ DERIVADO · S7 · curvatura ═══
    //
    // De `demos · sostén` a `final · se levanta` la cámara subía **8,4 en línea
    // recta vertical**, con el ángulo y la distancia clavados: un ascensor. Era el
    // movimiento más geométricamente pobre del recorrido, y a la vez el segundo más
    // rápido (51,4 alturas de cuadro por unidad de progreso).
    //
    // Ahora es un arco: **se aleja a 8,60** y **se corre 9° de azimut** mientras
    // sube, y las dos excursiones vuelven a su valor en el keyframe siguiente. La
    // cámara sale de la vertical, describe una curva y llega a la misma pose.
    // Desvío de la recta: 2,01 de mundo.
    //
    // Los 9° van hacia ATRÁS (315 → 306 → 315), en contra del sentido en que la
    // vuelta venía girando. Es lo que hace que se lea como un impulso y no como el
    // principio del giro siguiente.
    at: 0.809,
    name: 'final · arco de subida',
    derived: true,
    ease: 'shift',
    pose: { angleDeg: 306, height: 0.9, distance: 8.6, frameX: 0.86, frameY: 0 },
  },
  {
    at: 0.825,
    name: 'final · se levanta',
    ease: 'shift',
    pose: { angleDeg: 315, height: 4.5, distance: 7, frameX: 1, frameY: 0 },
  },
  {
    // El beat que cierra la vuelta: 315 → 360. Desde S6 la cierra ACÁ y no en el
    // keyframe siguiente, que es lo que deja al cierre dedicado a alejarse.
    at: 0.85,
    name: 'final · gira',
    ease: 'shift',
    pose: { angleDeg: 360, height: 4.5, distance: 8, frameX: 0, frameY: 0 },
  },
  {
    // ═══ DERIVADO · S7 · curvatura ═══
    //
    // La retirada al cierre era un deslizamiento recto: bajar 3 y alejarse 8 al
    // mismo tiempo. Acá la cámara **pasa por arriba**: la altura sube a 5,40 —por
    // encima de sus DOS extremos (4,50 y 1,50)— antes de asentarse, y la distancia
    // se adelanta a 12,60. Se levanta para irse, y recién entonces baja.
    //
    // **Y de paso disuelve el tirón más grande del recorrido.** El `arrive` del
    // cierre arranca a 1,84× la velocidad de cuerda, así que en `final · gira` la
    // velocidad saltaba de 3,4 a 74,2 alturas de cuadro por unidad de progreso: 75,6
    // de salto, el mayor de todo el track. Con el intermedio en el medio el salto
    // baja a **49,7** y el pico del tramo de 77,4 a 54,5. No se tocó ni el `arrive`
    // ni ninguna pose: el salto se reparte entre dos segmentos.
    //
    // `linear`: la retirada es UNA gesticulación, y un `shift` acá pondría a la
    // cámara a frenar justo cuando tiene que estar yéndose.
    at: 0.868,
    name: 'cierre · arco de retirada',
    derived: true,
    ease: 'linear',
    pose: { angleDeg: 360, height: 5.4, distance: 12.6, frameX: 0, frameY: 0 },
  },
  {
    // ── S6: `at` 0,938 → 0,890, y el encuadre a cero ───────────────────────
    //
    // Acá llega el cierre y desde acá se sostiene. **El sostén pasó de media
    // pantalla a 0,88 de pantalla**, que es lo que pedía "el cierre no sostiene".
    //
    // Se paga con velocidad: el alejamiento de 0,850 a 0,890 corre a 27,7 alturas
    // de cuadro por unidad de progreso, contra las 12,6 que corría en 0,088. Es un
    // intercambio real y es un número — pero 12,6 lo dejaba como el segmento más
    // lento del recorrido justo antes del final, y con `arrive` el alejamiento
    // resuelve en el primer tercio y se demora en el resto igual.
    //
    // `frameX` va de −0,02 a **0 exacto**: una pantalla de cierre con el logo
    // centrado y dos textos simétricos no puede tener un descentrado que nadie
    // eligió. −0,02 sobre un recorrido de ±1 es ruido de arrastrar un slider.
    at: 0.89,
    name: 'cierre · sostén',
    ease: 'arrive',
    pose: { angleDeg: 360, height: 1.5, distance: 16, frameX: 0, frameY: 0 },
  },
  {
    // "se aleja del todo y queda el logo", con la sala apagándose. `arrive` para
    // que el alejamiento resuelva rápido y después se demore. El arco de luz usa la
    // misma curva en su último tramo, así que la sala termina de apagarse en el
    // mismo momento en que la cámara se detiene.
    //
    // ── S6: la presencia del cierre ────────────────────────────────────────
    //
    // Acá va a ir "develOP" arriba y el slogan abajo, así que la composición se
    // midió para eso: con FOV 35 y distancia de ojo 16,07, **el logo ocupa el 70,7%
    // del alto del cuadro y deja 14,6% de aire arriba y 14,6% abajo** — sobre una
    // ventana de 1080 son 158 px de cada lado, que alcanzan de sobra para un
    // wordmark y una línea de slogan.
    //
    // **La distancia y la altura NO se tocaron, y es una decisión.** El sprint pedía
    // "más presencia del logo" leyendo un cierre que se veía chico y apenas visible;
    // medido, el logo ya ocupaba dos tercios del cuadro. Lo que lo hacía invisible
    // era la luz: 2,0 de intensidad a **2000 K** —ámbar profundo— sobre un objeto
    // casi negro. Con el arco, el cierre queda en nivel 0,34 neutro-frío y el
    // contraluz se resiste hasta 0,59, que es lo que lo recorta. Agrandarlo más se
    // comería el aire donde va el texto.
    //
    // El ángulo dice 360 y no 0: es la misma posición de cámara, pero este archivo
    // guarda el ángulo ACUMULADO y escribir 0 después de un 360 contradice su propia
    // convención. El panel lo publica envuelto, así que ahí se sigue leyendo 0,0°.
    //
    // El track TERMINA ACÁ. La cola que describe el recorrido ("después las letras
    // se van, la cámara se mueve a otros ángulos y termina en el CTA final") no
    // tiene posiciones capturadas y no se inventó: cuando se compongan esos ángulos,
    // se agregan a este array.
    at: 1,
    name: 'cierre',
    ease: 'arrive',
    pose: { angleDeg: 360, height: 1.5, distance: 16, frameX: 0, frameY: 0 },
  },
]

// ── El arco del sol (S6 · reescrito en S7) ──────────────────────────────────

/**
 * EL SOL Y LA LUZ PRINCIPAL SON LA MISMA COSA, Y ESTA ES SU TABLA.
 *
 * ── Qué reemplaza, y en dos etapas ─────────────────────────────────────────
 *
 * Hasta S5 cada keyframe llevaba `keyIntensity` y `keyKelvin` adentro de su
 * pose: veinticuatro valores sueltos, con el recorrido arrancando literalmente
 * a oscuras y el cierre en 2,0 a 2000 K. S6 los sacó de la pose y los convirtió
 * en esta curva.
 *
 * **S7 le sumó la posición, y ese es el cambio de fondo.** Hasta acá el cuerpo
 * visible del sol no existía y la principal era una constante fija del rig. Un
 * sol dibujado por un lado y una key por el otro son **dos soles**: en cuanto
 * uno se mueve, la sombra deja de caer desde donde se ve la fuente y el espacio
 * deja de ser creíble. Así que hay una sola tabla y una sola dirección:
 *
 * - lo que ilumina,
 * - lo que proyecta la sombra,
 * - y lo que se ve en el cuadro
 *
 * son el mismo objeto en la misma posición. `probeSun.ts` dibuja el cuerpo;
 * `lightRig.ts` coloca la luz; los dos leen de acá.
 *
 * ── La relación que ata el nivel con la elevación ──────────────────────────
 *
 * > **`level` = sin(elevación) / sin(36°)**
 *
 * No es una coincidencia bonita: es la definición. La irradiancia que una
 * fuente lejana deposita sobre una superficie horizontal es proporcional al
 * seno de su elevación, así que **la sala no se apaga porque bajamos un
 * número: se apaga porque el sol baja.** Los cuatro niveles de S6 —1 · 1 ·
 * 0,84 · 0,60 · 0,34— salen de las cuatro elevaciones de abajo, y 36° es la
 * elevación que S6 había calibrado para la principal. O sea: **el arco arranca
 * exactamente en la key de S6 y desciende desde ahí.** Nada de lo calibrado se
 * perdió.
 *
 * ⚠️ Si se mueve un `level` hay que mover su `elevationDeg`, y al revés. Son
 * dos caras del mismo dato y el reporte de S7 tiene la cuenta.
 *
 * ── La forma, y por qué esta ───────────────────────────────────────────────
 *
 * Los cinco puntos caen todos en bordes de pantalla (0, 4/8, 6/8, 7/8, 8/8), la
 * misma retícula que usa el resto del recorrido:
 *
 * - **0 → 0,5 · mediodía.** Hero, quiénes somos y números van a luz plena. Son
 *   los tramos donde se lee contenido, y bajarle la luz a una sección que
 *   alguien está leyendo es cobrarle al lector el efecto. La elevación no se
 *   mueve; **el azimut sí** (de −42° a −32°), que es exactamente lo que hace un
 *   sol cerca del mediodía: barre en horizontal sin bajar.
 * - **0,5 → 0,75 · la tarde empieza.** Nivel 0,84, elevación 29,6°. El azimut
 *   cruza el frente (−32° → +6°) mientras la cámara está del otro lado dando la
 *   vuelta: **es ahí donde el sol entra en cuadro.**
 * - **0,75 → 0,875 · la caída real.** Nivel 0,60, elevación 20,7°. El
 *   movimiento final ya ocurre en penumbra y la sombra se alarga.
 * - **0,875 → 1 · el cierre.** Nivel 0,34, elevación 11,5°, con `arrive`: la
 *   luz muere rápido y después se demora, así que la última pantalla llega
 *   apagada y se SOSTIENE apagada en vez de seguir bajando hasta el final.
 *
 * ── El azimut: por qué barre, cuánto, y hacia dónde ────────────────────────
 *
 * **92° en todo el recorrido** — menos de un cuarto de vuelta. No es una vuelta
 * y no puede serlo: la principal tiene que modelar el logo en TODO el track, y
 * un sol que barre de más deja tramos con la cara vista a oscuras.
 *
 * El barrido está colocado para que el sol cruce el eje de la cámara **cuando
 * la cámara está abajo mirando hacia arriba**, que es el único momento en que
 * un sol puede entrar en cuadro. Los números están en el reporte de S7; el
 * resumen es:
 *
 * | | key fija de S6 | este arco |
 * |---|---:|---:|
 * | sol en cuadro, todo el recorrido | 2,6% | **4,2%** |
 * | sol en cuadro, dentro de Demos + final | 6,9% | **11,2%** |
 * | γ mínimo de modelado en todo el track | **5°** (luz plana) | **29°** |
 *
 * Ese γ es el ángulo entre la luz y el observador medido desde el objeto: 0 =
 * luz plana desde atrás de la cámara, 45–70 = tres cuartos, >130 = contraluz.
 * **El arco no solo hace visible al sol: arregla un punto de luz plana que la
 * key fija tenía en `final · se levanta`.**
 *
 * ── La temperatura ────────────────────────────────────────────────────────
 *
 * Sube hacia el AZUL, y sigue siendo la decisión más opinable del rig. El
 * recorrido calibrado a mano terminaba en **2000 K**: ámbar profundo, una sala
 * que se apaga como se apaga el tungsteno. Va para el otro lado por una razón
 * que ya está en el repo: **este set es papel neutro**, y S4 rechazó un default
 * cálido justo porque el papel renderizaba rosado. A 2000 K se tiñen el
 * ciclorama, los planos y la niebla, o sea la escena entera y no solo el logo.
 *
 * **Para el cierre ámbar: cambiar el 7700 de abajo por ~2200.** Un número.
 *
 * ── Lo que NO está acá ─────────────────────────────────────────────────────
 *
 * Cómo se reparte el nivel entre las tres luces, el hemisférico, la niebla y el
 * cuerpo del sol está en `probeLighting.ts`, y no es un reparto plano: el
 * ambiente se apaga más rápido que la principal y el contraluz se resiste. Es
 * lo que hace que la escena gane contraste al oscurecerse en vez de volverse
 * gris.
 */
export const LIGHT_ARC: readonly LightStop[] = [
  // Mediodía. La elevación es la que S6 calibró para la key: el arco arranca ahí.
  { at: 0, level: 1, kelvin: 6500, azimuthDeg: -42, elevationDeg: 36 },
  // Meseta de luz: el nivel y la elevación no se mueven hasta el final de Números.
  // El azimut sí, y despacio — un sol cerca del mediodía barre sin bajar.
  { at: 0.5, level: 1, kelvin: 6500, azimuthDeg: -32, elevationDeg: 36, ease: 'linear' },
  // Portfolio y Demos. Baja apenas: al giro no se le apaga la luz. El azimut cruza
  // el frente mientras la cámara está atrás — acá es donde el sol entra en cuadro.
  { at: 0.75, level: 0.84, kelvin: 6850, azimuthDeg: 6, elevationDeg: 29.6, ease: 'shift' },
  // El movimiento final, ya en penumbra y con la sombra alargándose.
  { at: 0.875, level: 0.6, kelvin: 7300, azimuthDeg: 38, elevationDeg: 20.7, ease: 'linear' },
  // El cierre. `arrive` = llega apagado temprano y sostiene.
  { at: 1, level: 0.34, kelvin: 7700, azimuthDeg: 50, elevationDeg: 11.5, ease: 'arrive' },
]
