/**
 * LOS COMENTARIOS DEL ARRAY DE KEYFRAMES, como dato.
 *
 * ── Por qué existe este archivo ────────────────────────────────────────────
 *
 * El editor de S5 exporta el array entero de `choreography.ts` para que el
 * humano lo pegue de vuelta. Un export que emitiera solo los números tiraría a
 * la basura el razonamiento de cada keyframe —de dónde salió, qué se inventó,
 * qué mirar para corregirlo— que es justamente lo que hace que ese archivo se
 * pueda calibrar sin leer código. Así que los comentarios tienen que estar
 * disponibles como texto para poder re-emitirlos.
 *
 * ── La regla, y es una sola ────────────────────────────────────────────────
 *
 * **Los comentarios del array se editan ACÁ.** Los `//` que hoy están adentro
 * de `CHOREO_KEYFRAMES` son la salida de este archivo, no su fuente: cada
 * export los regenera. Cambiar un comentario allá y no acá se pierde en el
 * próximo pegado.
 *
 * Todo lo demás de `choreography.ts` —el doc de módulo, los tramos, el arco de
 * luz— son comentarios de verdad y no pasan por acá: el editor no los toca.
 *
 * ── Cómo se indexa ─────────────────────────────────────────────────────────
 *
 * Por el `name` del keyframe, no por su posición. Un índice posicional se
 * rompería al duplicar, al reordenar o al agregar uno a mano; el nombre
 * sobrevive a las tres. Un keyframe sin entrada acá se exporta sin comentario,
 * que es lo correcto: no todos tienen.
 *
 * ⚠️ **Corolario que se paga al renombrar:** el `name` es la clave. Si se
 * renombra un keyframe en `choreography.ts` y no acá, su comentario se cae en el
 * próximo export sin que nadie se entere. S6 renombró uno
 * (`números · se aleja` → `números · sube y se aleja`) y movió su entrada con él.
 */

/**
 * El doc que va arriba del array, sin el censo.
 *
 * El censo lo cuenta el exportador sobre los datos vivos, porque un número
 * escrito a mano queda viejo al primer duplicado y un comentario que miente es
 * peor que ninguno.
 */
export const CHOREO_ARRAY_DOC: readonly string[] = [
  '⚠️ El censo de arriba cuenta 21 "capturados", y **siete de esos son sostenes',
  'creados con el editor**, no capturas: los que terminan en `· sostén`. El',
  'origen es un dato de la SESIÓN de edición y muere al pegar el bloque en el',
  'archivo, así que desde acá la única marca que queda es el nombre. Dos de esos',
  'siete, además, ya no sostienen nada: se los duplicó y después se les movió la',
  'pose. Cada uno lo dice en su comentario.',
  '',
  'La pose son CINCO canales: ángulo, altura, distancia y los dos de encuadre.',
  'La luz salió de acá en S6 y vive en `LIGHT_ARC`, abajo.',
]

/** Bloque de comentario que va ANTES del keyframe, indexado por su `name`. */
export const CHOREO_NOTES: Readonly<Record<string, readonly string[]>> = {
  'entrada · mirada alta': [
    'Sin `ease`: es el primer keyframe, no se llega a él desde ningún lado.',
    '',
    'Hasta S5 este keyframe llevaba `keyIntensity: 0` adentro de su pose, o sea',
    'que el recorrido arrancaba literalmente a oscuras y subía la luz en la',
    'primera transición. Nadie diseñó eso: es lo que queda cuando se compone una',
    'posición con el slider de luz en el piso. La luz ya no vive en la pose.',
  ],

  hero: [
    '`arrive` — la curva del sistema para lo que ENTRA. El descenso desde 9,00',
    'aterriza en el encuadre del hero, no lo cruza, y se acerca de 15 a 11',
    'mientras baja.',
  ],

  'hero · sostén': [
    'El patrón de sostén: misma pose que el keyframe anterior, más adelante en el',
    'recorrido. La cámara LLEGA al hero en 0,125 y se queda quieta hasta 0,188,',
    'así que el encuadre se puede leer en vez de cruzarse. Es el arreglo del',
    'pendiente №1 de S4 ("la pose de cada tramo cae en su borde") y se hace con el',
    'botón "duplicar" del editor.',
  ],

  'quiénes somos · persona 1': [
    '"baja el encuadre horizontal, sube el vertical y se acerca al logo, TODO',
    'AL MISMO TIEMPO" — una sola transición, sin intermedios.',
    '',
    'La ambigüedad de "el vertical" quedó resuelta al calibrar, y a favor de la',
    'ALTURA DE CÁMARA: `frameY` está en cero en todo el recorrido. No es un',
    'olvido — ver la nota de `demos · giro ½` sobre por qué ese canal casi no',
    'tiene efecto a las distancias que este recorrido usa.',
  ],

  'quiénes somos · persona 1 · sostén': [
    'Sostén de verdad: pose idéntica a la anterior. Se llega y se aguanta.',
  ],

  'persona 2 · cruce (apex)': [
    '═══ DERIVADO ═══',
    '',
    '"sube el vertical, sube el horizontal, y LUEGO vuelve a bajar el',
    'vertical". Ese "luego" pide un intermedio que las capturas no tienen.',
    '',
    'Lo que hace es el **cruce**: `frameX` barre de −0,80 a +0,80 —el logo cruza',
    'la pantalla entera de izquierda a derecha, que es lo que deja lugar para la',
    'segunda persona— y acá va por el medio, en −0,16. La altura hace una',
    'excursión chica hacia abajo (5,00 → 4,54 → 5,00) y la distancia una hacia',
    'afuera (9,00 → 10,70 → 9,00): la cámara se abre un poco en el cruce y vuelve.',
    'Es lo que impide que el barrido se lea como un desplazamiento plano.',
    '',
    '**Los cinco números son interpolación, no captura.** Para matar la excursión',
    'de altura, poner 5; para la de distancia, poner 9. Un número cada una.',
  ],

  'quiénes somos · persona 2 · sostén': [
    '⚠️ **Se llama "sostén" pero NO sostiene.** Salió del botón duplicar y después',
    'se le movió la pose: la altura baja de 5,00 a 2,65, la distancia se abre a',
    '9,83 y el encuadre vuelve del borde (0,80 → 0,57). Es un beat propio —el',
    'arranque del descenso a Números— con el nombre que le quedó del duplicado.',
    '',
    'Es además el segmento más rápido del primer medio recorrido: 28,0 alturas de',
    'cuadro por unidad de progreso. Renombrarlo son dos strings (acá y en',
    '`choreography.ts`); se deja como está para no romper la referencia del video',
    'ya grabado.',
  ],

  'números · baja la altura': [
    '═══ DERIVADO ═══',
    '',
    '"reduce altura, aumenta distancia (EN ESE ORDEN, SECUENCIAL)". Secuencial',
    '= un keyframe en el medio: la altura ya abajo, con la distancia todavía sin',
    'abrir.',
    '',
    'Al calibrar, la altura de este keyframe bajó hasta **−3,90, el piso del',
    'rango**: la cámara rasa el papel. Es la pose más baja del recorrido junto con',
    'las tres de Demos.',
    '',
    '── S6 · 1: `linear` → `shift` ─────────────────────────────────────────',
    '',
    'Con `linear` la cámara llegaba al fondo a velocidad plena y el keyframe',
    'siguiente la frenaba de golpe. `linear` es para los waypoints que viven',
    'ADENTRO de una gesticulación, y éste no lo es: la propia descripción dice',
    'SECUENCIAL, o sea que acá TERMINA el "baja la altura" y recién entonces',
    'arranca el "se aleja". Un final de gesto pide una curva de llegada.',
    '',
    '── S6 · 2: `at` 0,464 → 0,445 ─────────────────────────────────────────',
    '',
    'Éste es el arreglo del tirón, y hay que medirlo en **alturas de cuadro** —',
    'cuánto se mueve y cuánto cambia de tamaño el objeto EN PANTALLA, que es la',
    'única unidad en la que una bajada y un alejamiento se comparan.',
    '',
    'Los tres beats de la pantalla de Números corrían a **17,9 / 47,4 / 19,3** por',
    'unidad de progreso: el del medio —bajar a −3,90 y volver a subir a 1,00 en',
    '0,024 de progreso— iba a **más del doble** que sus dos vecinos. Eso es el',
    'tirón, y se lee como un rebote.',
    '',
    'Con los `at` en 0,445 y 0,491 quedan en **24,7 / 24,7 / 25,8**, o sea una',
    'dispersión del 4,5% contra el 105% que había. **La pantalla dura exactamente',
    'lo mismo y ninguna pose se tocó**: lo único que cambió es cuánto le toca a',
    'cada beat.',
  ],

  'números · sube y se aleja': [
    '── S6: renombrado, y el `at` 0,488 → 0,491 ────────────────────────────',
    '',
    'ANTES se llamaba `números · se aleja`, y el nombre mentía: de −3,90 a 1,00',
    'son 4,90 de altura contra 2,00 de distancia. Medido en pantalla, la subida',
    'pesa **más del triple** que el alejamiento. Un keyframe que dice una cosa y',
    'hace otra es la clase de dato que después nadie se anima a tocar.',
    '',
    'El movimiento no cambió — cambió el nombre, que ahora dice las dos cosas en',
    'el orden en que pesan. El `at` es la otra mitad del arreglo del tirón, y está',
    'explicado en el keyframe anterior.',
  ],

  números: [
    '"y luego vuelve a subir altura y a acercarse".',
    '',
    'Ojo con esa frase, porque el dato calibrado la reparte distinto: la subida de',
    'altura ya ocurrió en el keyframe anterior, acá la cámara **se sigue alejando**',
    '(11,0 → 14,1) y el acercarse llega recién en el sostén (14,1 → 12,0). El',
    'gesto descrito existe, pero repartido en tres keyframes y no en uno.',
  ],

  'números · sostén': [
    '⚠️ **Otro que se llama "sostén" y no sostiene**: baja la altura a 0 y se',
    'acerca a 12. Además vive en 0,563, o sea DENTRO de la pantalla de Portfolio y',
    'no de la de Números. Las dos cosas son deliberadas —es el cierre del gesto de',
    'Números derramándose en la pantalla siguiente— pero se leen mal desde el',
    'nombre.',
  ],

  portfolio: [
    '"se acerca, rota hacia la derecha y sube la altura — un ACERCAMIENTO',
    'DIAGONAL": las tres a la vez, una sola transición sobre toda la pantalla.',
    '`frameX` −1,00 deja el logo pegado a la izquierda para que el contenido',
    'ocupe arriba a la derecha.',
    '',
    'Es el segmento más cargado del recorrido fuera de Demos: 31,2 alturas de',
    'cuadro por unidad de progreso, con 726 grados por unidad encima.',
  ],

  'portfolio · sostén': ['Sostén de verdad: pose idéntica a la anterior.'],

  'demos · giro ½': [
    '── S6: 135° → 180°, y el `at` 0,675 → 0,697 ───────────────────────────',
    '',
    'ANTES este keyframe tenía **el mismo ángulo que `giro ¼`**, así que entre los',
    'dos la cámara no rotaba: solo se desplomaba 7,8 de altura. El 135 repetido no',
    'era una composición — es lo que queda cuando se compone un waypoint moviendo',
    'altura, distancia y encuadre sin tocar el slider de ángulo.',
    '',
    '180 es exactamente el punto medio entre sus dos vecinos (135 y 225), así que',
    'la vuelta pasa por su mitad en la mitad del tramo. El porqué completo está en',
    'el separador del tramo, arriba.',
    '',
    '**Este es el momento más violento de todo el recorrido**: 106 alturas de',
    'cuadro por unidad de progreso, cuatro veces cualquier otro. Es la caída de',
    '3,90 a −3,90 en 0,018. No se tocó —es intención calibrada y el sprint no la',
    'marcó— pero queda medido, porque es lo primero que va a doler si el recorrido',
    'se siente brusco.',
    '',
    'Su `frameY` de 0,10 es el único distinto de cero del recorrido, y **no hace',
    'nada**: el encuadre vertical solo tiene recorrido cuando la mitad del alto',
    'visible supera la media altura del logo, o sea a partir de una distancia de',
    '**11,4**. Acá la cámara está a 8. Se deja porque cambiarlo tampoco haría nada.',
  ],

  demos: [
    'La cámara termina ABAJO (altura −3,90, el piso del rango) y el logo salta a',
    'la derecha (`frameX` +1,00) para dejarle abajo a la izquierda a las demos.',
  ],

  'demos · sostén': [
    'Sostén de verdad: pose idéntica a la anterior. Es el más largo del recorrido',
    '(0,038 de progreso), y tiene por qué: viene de la vuelta entera.',
  ],

  'final · gira': [
    'El beat que cierra la vuelta: 315 → 360. Desde S6 la cierra ACÁ y no en el',
    'keyframe siguiente, que es lo que deja al cierre dedicado a alejarse.',
  ],

  'cierre · sostén': [
    '── S6: `at` 0,938 → 0,890, y el encuadre a cero ───────────────────────',
    '',
    'Acá llega el cierre y desde acá se sostiene. **El sostén pasó de media',
    'pantalla a 0,88 de pantalla**, que es lo que pedía "el cierre no sostiene".',
    '',
    'Se paga con velocidad: el alejamiento de 0,850 a 0,890 corre a 27,7 alturas',
    'de cuadro por unidad de progreso, contra las 12,6 que corría en 0,088. Es un',
    'intercambio real y es un número — pero 12,6 lo dejaba como el segmento más',
    'lento del recorrido justo antes del final, y con `arrive` el alejamiento',
    'resuelve en el primer tercio y se demora en el resto igual.',
    '',
    '`frameX` va de −0,02 a **0 exacto**: una pantalla de cierre con el logo',
    'centrado y dos textos simétricos no puede tener un descentrado que nadie',
    'eligió. −0,02 sobre un recorrido de ±1 es ruido de arrastrar un slider.',
  ],

  cierre: [
    '"se aleja del todo y queda el logo", con la sala apagándose. `arrive` para',
    'que el alejamiento resuelva rápido y después se demore. El arco de luz usa la',
    'misma curva en su último tramo, así que la sala termina de apagarse en el',
    'mismo momento en que la cámara se detiene.',
    '',
    '── S6: la presencia del cierre ────────────────────────────────────────',
    '',
    'Acá va a ir "develOP" arriba y el slogan abajo, así que la composición se',
    'midió para eso: con FOV 35 y distancia de ojo 16,07, **el logo ocupa el 70,7%',
    'del alto del cuadro y deja 14,6% de aire arriba y 14,6% abajo** — sobre una',
    'ventana de 1080 son 158 px de cada lado, que alcanzan de sobra para un',
    'wordmark y una línea de slogan.',
    '',
    '**La distancia y la altura NO se tocaron, y es una decisión.** El sprint pedía',
    '"más presencia del logo" leyendo un cierre que se veía chico y apenas visible;',
    'medido, el logo ya ocupaba dos tercios del cuadro. Lo que lo hacía invisible',
    'era la luz: 2,0 de intensidad a **2000 K** —ámbar profundo— sobre un objeto',
    'casi negro. Con el arco, el cierre queda en nivel 0,34 neutro-frío y el',
    'contraluz se resiste hasta 0,59, que es lo que lo recorta. Agrandarlo más se',
    'comería el aire donde va el texto.',
    '',
    'El ángulo dice 360 y no 0: es la misma posición de cámara, pero este archivo',
    'guarda el ángulo ACUMULADO y escribir 0 después de un 360 contradice su propia',
    'convención. El panel lo publica envuelto, así que ahí se sigue leyendo 0,0°.',
    '',
    'El track TERMINA ACÁ. La cola que describe el recorrido ("después las letras',
    'se van, la cámara se mueve a otros ángulos y termina en el CTA final") no',
    'tiene posiciones capturadas y no se inventó: cuando se compongan esos ángulos,',
    'se agregan a este array.',
  ],
}

export type ChoreoSection = {
  /** Texto del separador. El exportador lo rellena con `─` hasta el ancho fijo. */
  readonly title: string
  /** Bloque que sigue al separador. Vacío = solo el separador. */
  readonly body: readonly string[]
}

/**
 * Separador de tramo, indexado por el `name` del keyframe que lo SIGUE.
 *
 * Ojo con una asimetría real del archivo: los separadores NO caen en los bordes
 * de `CHOREO_TRAMOS`. El keyframe "hero" está en `at` 0,125 —que es el borde
 * del tramo 2— y sin embargo vive bajo el título del tramo 1, porque es la
 * LLEGADA del tramo 1. La asociación es de autor, no derivable, y por eso está
 * escrita a mano acá.
 */
export const CHOREO_SECTIONS: Readonly<Record<string, ChoreoSection>> = {
  'entrada · mirada alta': {
    title: 'Tramo 1 · Hero',
    body: ['"la cámara mira alto y baja hasta encuadrar el hero"'],
  },

  'quiénes somos · persona 1': {
    title: 'Tramo 2 · Quiénes somos (dos personas)',
    body: [],
  },

  'números · baja la altura': {
    title: 'Tramo 3 · Números',
    body: [],
  },

  portfolio: {
    title: 'Tramo 4 · Portfolio',
    body: [],
  },

  'demos · giro ¼': {
    title: 'Tramo 5 · Demos',
    body: [
      '"rota 360° MIENTRAS baja la altura, y termina con la cámara mirando el logo',
      'desde abajo a la izquierda hacia arriba a la derecha".',
      '',
      '── S6: el giro dejó de frenar en el medio ───────────────────────────────',
      '',
      'ANTES `giro ¼` y `giro ½` tenían el MISMO ángulo, así que entre los dos la',
      'cámara no rotaba: solo caía. El giro corría a **5294 / 0 / 2250 / 2571**',
      'grados por unidad de progreso — arrancaba al doble de velocidad, frenaba en',
      'seco y volvía a arrancar. Eso es el frenar-caer-arrancar.',
      '',
      'AHORA corre a **2500 / 2500 / 2500 / 2571**, con una dispersión del 2,8%. Lo',
      'consiguen dos cambios y ninguno toca una pose compuesta: el ángulo repetido',
      'de `giro ½` pasa a 180 (el punto medio exacto de sus vecinos) y los `at` de',
      '`giro ¼` y `giro ½` se corren a 0,679 y 0,697. El primer tramo tenía 0,017',
      'de progreso para 90°: era el doble de rápido que cualquier otro.',
      '',
      'El comentario viejo prometía "proporcional al ángulo (74° / 31° / 83,5° /',
      '74° sobre 262,5°)". Esos números eran de una captura anterior y hacía rato',
      'que no describían el dato. La vuelta ahora va **45 → 135 → 180 → 225 → 315**',
      'y el tramo 6 la completa hasta 360.',
      '',
      'Los cinco van `turn: \'literal\'`: es la marca explícita de "acá se da la',
      'vuelta entera, no se vuelve por donde se vino".',
    ],
  },

  'final · se levanta': {
    title: 'Tramo 6 · Movimiento final + cierre',
    body: [
      '"se levanta, gira un poco, baja, y se aleja".',
      '',
      '── S6: de cuatro beats a TRES ───────────────────────────────────────────',
      '',
      'ANTES había un cuarto keyframe entre `gira` y el cierre —`final · baja`, en',
      '354,09°— y el ángulo del final iba **315 → 360 → 354,09 → 0**. Ese retroceso',
      'de casi 6° no está en la intención descrita y se lee como una vacilación,',
      'seguida de otro cambio tan chico que no se percibe.',
      '',
      'AHORA son tres beats limpios: **se levanta, gira hasta 360, se aleja al',
      'cierre.** El "baja" de la descripción no se perdió: la altura cae de 4,50 a',
      '1,50 dentro del último beat, junto con el alejamiento, y ahí se lee como una',
      'sola cosa en vez de como dos.',
      '',
      'Cada uno va `shift` para que se lean como beats y no como un barrido',
      'continuo. El cierre es la excepción y explica su curva en su comentario.',
      '',
      'Lo que NO se tocó y conviene tener medido: el levantarse corre a **51,4',
      'alturas de cuadro por unidad de progreso** —8,4 de altura en 0,037— y es el',
      'segundo movimiento más violento del recorrido, después de la caída de',
      '`giro ½`. Es intención calibrada y el sprint no lo marcó.',
    ],
  },
}

/**
 * Ancho al que el exportador rellena el separador de tramo, contando la sangría
 * y el `// `. Es el que ya tiene el archivo.
 */
export const SECTION_RULE_WIDTH = 78
