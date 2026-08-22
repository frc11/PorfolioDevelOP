import type { ChoreoSection } from './choreographyTypes'

/**
 * LOS COMENTARIOS DEL ARRAY DE KEYFRAMES, como dato.
 *
 * ── Por qué existe este archivo ────────────────────────────────────────────
 *
 * El editor de S5 exporta el array entero de `choreography.ts` para que el
 * humano lo pegue de vuelta. Un export que emitiera solo los números tiraría a
 * la basura el razonamiento de cada keyframe —de dónde salió, qué se calculó,
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
 * ── Qué pasó en S9 ─────────────────────────────────────────────────────────
 *
 * Este archivo pasó de 180 líneas a esto porque **el recorrido pasó de 30
 * keyframes a 8**. Los comentarios del recorrido viejo no se perdieron ni se
 * editaron: se fueron con él a `variantCalibradaNotes.ts`, que sigue armándose
 * con `choreographyNotesFrontal.ts` y `choreographyNotesGiro.ts` intactos.
 *
 * ── Cómo se indexa ─────────────────────────────────────────────────────────
 *
 * Por el `name` del keyframe, no por su posición. Un índice posicional se
 * rompería al duplicar, al reordenar o al agregar uno a mano; el nombre
 * sobrevive a las tres. Un keyframe sin entrada acá se exporta sin comentario,
 * que es lo correcto: no todos tienen.
 *
 * ⚠️ **Corolario que se paga al renombrar:** el `name` es la clave. Si se
 * renombra un keyframe en `choreography.ts` y no acá, su comentario se cae en
 * el próximo export sin que nadie se entere.
 */

/**
 * El doc que va arriba del array, sin el censo.
 *
 * El censo lo cuenta el exportador sobre los datos vivos, porque un número
 * escrito a mano queda viejo al primer duplicado y un comentario que miente es
 * peor que ninguno.
 */
export const CHOREO_ARRAY_DOC: readonly string[] = [
  '⚠️ El censo de arriba dice "8 capturados" porque el exportador llama así a',
  'todo lo que viene del archivo. **Ninguna de estas ocho se capturó con el',
  'editor**: seis son poses compuestas y dos son sostenes. Lo que sí es literal',
  'es el "0 derivados" — este recorrido no tiene un solo keyframe de relleno.',
  '',
  'Una pose por tramo, más dos sostenes: el hero se queda quieto su pantalla',
  'entera (es el punto de llegada del preloader y la cámara no se mueve apenas',
  'entrás) y el cierre se clava desde 0,950 porque ahí van "develOP" y el',
  'slogan, y el texto sobre una cámara que todavía deriva se lee peor.',
  '',
  "Los cinco tramos que se mueven van `turn: 'literal'`: la vuelta se acumula",
  '130 + 55 + 10 + 115 + 50 = **360 exacto**. Con los ángulos de hoy `short`',
  'daría lo mismo —ningún salto pasa de 180°— pero la marca está para que la',
  'vuelta SOBREVIVA a que se editen los ángulos.',
  '',
  'La pose son CINCO canales: ángulo, altura, distancia y los dos de encuadre.',
  '`frameY` queda en cero en las seis, igual que en todo el recorrido anterior:',
  'el canal solo tiene recorrido por encima de una distancia de 11,4 y la',
  'composición de este track se resuelve con `frameX` y con la altura de cámara.',
  'La luz no entra en la pose desde S6: vive en `LIGHT_ARC`, abajo.',
]

/** La tabla de comentarios, indexada por el `name` del keyframe. */
export type KeyframeNotes = Readonly<Record<string, readonly string[]>>

export const CHOREO_NOTES: KeyframeNotes = {
  hero: [
    'Sin `ease`: es el primer keyframe, no se llega a él desde ningún lado.',
    '',
    '**Esta pose es el destino del preloader.** `scene-framing.ts` la proyecta',
    'para saber dónde y de qué tamaño aterriza el logo 2D, así que moverla mueve',
    'el final de la secuencia de entrada. Da 451 px de ancho de tinta en',
    '1440×810, contra los 523 que daba la calibrada — un 14% más chico, aprobado',
    'a cambio del aire de sala.',
    '',
    'La distancia es de la arquitectónica (su hero está en 20 y da el mismo 57%',
    'de caja); la altura es compuesta, porque la tabla del sprint pide que el',
    'tramo siguiente BAJE y 6,40 es lo que deja los 10,0 de caída sin gastar el',
    'techo del rango, que Números necesita entero. El azimut 0 vive en la cuña',
    'frontal libre: es el único sector donde la cámara puede irse lejos sin que',
    'un plano suspendido se le meta delante.',
    '',
    '⚠️ **Perilla de reserva, NO aplicada:** la elevación de entrada quedó en',
    '18,6° contra los 31,0° de la calibrada, y eso es lo que el preloader usa',
    'para rotar su mesh al aterrizar. Subir la altura de 6,40 a ~7,50 la lleva a',
    '23,2° y cuesta 1,1 de caída en el tramo siguiente. Se juzga por grabación.',
  ],

  'hero · sostén': [
    'El patrón de sostén: misma pose que el keyframe anterior, más adelante en el',
    'recorrido. Es lo que hace literalmente verdadera la fila "Hero · 1 pantalla ·',
    '0° → 0°": sin él, el primer segmento arrancaría a interpolar hacia los 130°',
    'de Quiénes somos y la cámara ya estaría orbitando ~20° durante la pantalla',
    'del hero.',
    '',
    'No es relleno: dos keyframes con la misma pose no amortiguan un tramo, lo',
    'dejan quieto. La velocidad medida en todo el tramo es 0,0.',
  ],

  'quiénes somos': [
    '"El recorrido más largo. La cámara baja y se mete entre los planos',
    'suspendidos — el entorno pasa por delante del logo."',
    '',
    '130° de azimut y 132,6° de barrido 3D: es el tramo más amplio del recorrido.',
    'La altura cae 10,0 hasta el piso del rango útil y la distancia se cierra de',
    '19 a 11,5.',
    '',
    '── Los dos números que no se eligieron, se calcularon ─────────────────',
    '',
    '**11,5 lo impone la escena de S5.** El anillo de planos suspendidos vive',
    'entre radio 11,8 y 22, y fuera de la cuña frontal de ±40° una cámara más',
    'lejos que 11,8 siempre tiene un plano entre ella y el logo. 11,5 es el mismo',
    'número que la arquitectónica usa para todas sus poses fuera de la cuña, y',
    'acá deja el logo limpio EN la pose aunque el camino hasta ella no lo esté.',
    '',
    '**−3,60 lo impone el piso.** El offset de mouse baja la cámara',
    '`0,045 × distancia`, así que la altura mínima segura es',
    '`−4,304 + 0,045 × 11,5 = −3,787`. El −3,89 que S9 traía escrito era el',
    'margen a distancia 9 y acá no vale: a 11,5 la cámara se iría abajo del papel.',
    '−3,60 deja **0,187 de holgura**, verificada además simulando la inercia.',
    '',
    '── El entorno por delante, que acá es la intención ────────────────────',
    '',
    'Camino a esta pose la cámara pasa por detrás de dos planos —el de azimut 60°',
    '(p 0,198→0,222) y el de 118° (p 0,286→0,313)— y cada uno barre el logo',
    'entero por menos de una tercera parte de pantalla. Es lo que el sprint pide',
    'con "el entorno pasa por delante del logo", y es lo que hace que se lea que',
    'hay un LUGAR y no un objeto flotando.',
  ],

  números: [
    '"La cámara sube y se aleja: vista cenital parcial, la retícula aérea y las',
    'marcas de replanteo se leen como plano. Órbita corta pero desplazamiento',
    'vertical fuerte."',
    '',
    'Altura 9,00 —el techo del rango— desde los −3,60 anteriores: **12,6 de salto',
    'entre poses vecinas, el más grande de las cuatro coreografías** (la base',
    'tiene 7,8 y la dramática 11,4). Ésa es la contribución de la dramática, y es',
    'toda la razón por la que la órbita puede ser corta: 55° de azimut, pero',
    '**68,8° de barrido 3D** contando el vertical.',
    '',
    '── Por qué 185 y no los 200 de la tabla ───────────────────────────────',
    '',
    'Fuera de la cuña frontal hay exactamente **una** ventana donde la cámara',
    'puede alejarse: la que abre el plano grande de azimut 187° a radio 20,5.',
    'Ahí el tope limpio es 20,5; en 200 baja a 17,8 y en 210 a 16,0. 185 es el',
    'centro de esa ventana, y de paso deja el FONDO en la cuña libre —el fondo de',
    'una pose es su azimut opuesto— así que el cuadro se abre hacia el vacío',
    'justo cuando la cámara sube a leer el piso.',
  ],

  trabajos: [
    '"La cámara casi se detiene y mira hacia el fondo profundo. Encuadre',
    'despejado."',
    '',
    '10° de azimut: "casi se detiene" son diez grados, no cincuenta. Lo que sí se',
    'mueve es la altura —de 9,00 a 4,50, la cámara se NIVELA— y con eso el eje',
    'óptico deja de mirar el piso y se mete en la profundidad.',
    '',
    '── Es la plataforma del efecto Star Wars, y queda medida ──────────────',
    '',
    'El sprint que construya los proyectos emergiendo desde el fondo hereda esto,',
    'verificado sobre todo el tramo (p 0,500 a 0,625):',
    '',
    '  · cono libre de ±29° horizontal × ±17,5° vertical — **el cuadro entero**;',
    '  · **34 unidades de mundo de profundidad libre** sobre el eje;',
    '  · cero oclusión del logo en toda la pantalla.',
    '',
    'Ningún plano suspendido entra en ese corredor. Es el único tramo junto con',
    'Números que tiene el cuadro completamente despejado hacia atrás — el hero',
    'tiene ±10°, y Quiénes somos, Demos y el cierre tienen 0°, que es la masa',
    'oscura de fondo que la escena quiere ahí.',
    '',
    '`frameX` −0,85 empuja el logo contra el borde izquierdo justamente para eso:',
    'el corredor por donde vienen los proyectos es el resto del cuadro.',
  ],

  demos: [
    '"Vuelve a bajar al nivel del logo y se acerca. El momento más íntimo del',
    'recorrido."',
    '',
    '115° de órbita y la distancia de 20 a 9: es el tramo que más mueve la cámara',
    'en el espacio, y el pico de velocidad del recorrido (75,3) vive acá, a mitad',
    'de camino. **Es la única pose donde el logo llena el cuadro** —81% del alto',
    'en tinta— y es la excepción que la arquitectónica se reserva.',
    '',
    '── Por qué −2,60 y no 0 ───────────────────────────────────────────────',
    '',
    'La tabla pide además "sol visible en cuadro". El sol vive a elevación 29,6°',
    'en este punto del arco, así que para que entre en el encuadre la cámara',
    'tiene que estar MIRANDO HACIA ARRIBA lo suficiente: con media altura de',
    'cuadro de 17,5°, hace falta `altura ≤ −0,214 × distancia`, o sea −1,93 a',
    'distancia 9. −2,60 lo cumple con margen y sigue siendo "el nivel del logo"',
    '(la tinta va de −2,39 a +2,39): es un contrapicado de 16°, no un picado.',
    '',
    'Holgura contra el piso: 1,299.',
  ],

  cierre: [
    '"Retroceso largo. La cámara se va, el entorno se abre. Cierra en el mismo',
    'azimut que el hero pero mucho más lejos."',
    '',
    'De 9 a 27 de distancia: **el alejamiento más largo del recorrido**, y el que',
    'fija el rango completo de distancias del track (9 a 27, contra 7–16 de la',
    'base y 11,5–29 de la arquitectónica). El ángulo dice 360 y no 0 porque este',
    'archivo guarda el ángulo ACUMULADO; el panel lo publica envuelto y ahí se',
    'lee 0,0°, o sea el mismo azimut del hero.',
    '',
    'La altura −1,40 es el cierre de la dramática tal cual: un contrapicado de 3°',
    'que mira la marca desde apenas abajo, con el sol ya poniéndose detrás.',
    '',
    'El logo ocupa el 28% del alto del cuadro en tinta, así que quedan ~36% de',
    'aire arriba y abajo — sobra para el wordmark y una línea de slogan.',
    '',
    '`arrive` es la curva del sistema para lo que llega: el alejamiento resuelve',
    'temprano y después se demora, que es lo que deja la última pantalla quieta.',
  ],

  'cierre · sostén': [
    'Sostén de verdad: pose idéntica a la anterior. **La cámara se clava.**',
    '',
    'Sin él, la curva `arrive` seguía derivando a 0,77 alturas de cuadro por',
    'unidad de progreso en el último frame del recorrido, y el texto del cierre',
    'se apoya sobre una imagen que todavía se mueve. Con la llegada en 0,950 la',
    'velocidad medida es **0,00 desde p = 0,96 hasta el final**.',
    '',
    'El precio está medido y es chico: el retroceso pasa a repartirse en 0,20 de',
    'progreso en vez de 0,25, así que el mayor tirón del recorrido sube de 25,0 a',
    '**31,2** — todavía menos de la mitad de los 70,4 de la base.',
  ],
}

/**
 * Separador de tramo, indexado por el `name` del keyframe que lo SIGUE.
 *
 * Desde S9 la asociación es directa —una pose por tramo— así que el separador
 * de cada tramo cae sobre el keyframe que ese tramo termina. El único que
 * rompe el patrón es el hero, cuyo sostén vive en el borde del tramo 2 y sin
 * embargo pertenece al 1: es la LLEGADA del tramo 1.
 */
export const CHOREO_SECTIONS: Readonly<Record<string, ChoreoSection>> = {
  hero: {
    title: 'Tramo 1 · Hero',
    body: [
      '"Reposo. Solo vira e inercia del mouse. Es el punto de llegada del',
      'preloader: la cámara no se mueve apenas entrás."',
    ],
  },

  'quiénes somos': {
    title: 'Tramo 2 · Quiénes somos (dos personas)',
    body: [],
  },

  números: {
    title: 'Tramo 3 · Números',
    body: [],
  },

  trabajos: {
    title: 'Tramo 4 · Trabajos',
    body: [],
  },

  demos: {
    title: 'Tramo 5 · Demos',
    body: [],
  },

  cierre: {
    title: 'Tramo 6 · Cierre',
    body: [],
  },
}

/**
 * Ancho al que el exportador rellena el separador de tramo, contando la sangría
 * y el `// `. Es el que ya tiene el archivo.
 */
export const SECTION_RULE_WIDTH = 78
