import type { ChoreoSection } from './choreographyTypes'
import { NOTES_FRONTAL } from './choreographyNotesFrontal'
import { NOTES_GIRO } from './choreographyNotesGiro'

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
 * ── Por qué son tres archivos y no uno ─────────────────────────────────────
 *
 * La tabla de comentarios pasó de 500 líneas y se partió **por la mitad del
 * recorrido**: `choreographyNotesFrontal.ts` de la entrada a Números —donde la
 * cámara vive en azimut 0— y `choreographyNotesGiro.ts` de Portfolio al cierre,
 * que es la mitad que gira. Acá quedan el doc del array, los separadores de
 * tramo y la unión de las dos mitades, que es de donde el exportador lee.
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
  'Los derivados son dos de S4 (sub-movimientos que las capturas no expresaban)',
  'y **siete de S7**: los que se llaman `· arco de …` y le dan curvatura a su',
  'tramo. Se pueden borrar los siete sin perder una sola pose compuesta — el',
  'recorrido vuelve a ser el de S6, en línea recta entre pose y pose.',
  '',
  'La pose son CINCO canales: ángulo, altura, distancia y los dos de encuadre.',
  'La luz salió de acá en S6 y vive en `LIGHT_ARC`, abajo — que desde S7 lleva',
  'además la posición del sol, porque el sol Y la luz principal son lo mismo.',
]

/** Bloque de comentario que va ANTES del keyframe, indexado por su `name`. */
/** La tabla de comentarios, indexada por el `name` del keyframe. */
export type KeyframeNotes = Readonly<Record<string, readonly string[]>>

/**
 * Las dos mitades, unidas. **Es el único lugar del que el exportador lee**, así
 * que un keyframe cuyo comentario esté en cualquiera de los dos archivos sale
 * emitido igual.
 */
export const CHOREO_NOTES: KeyframeNotes = { ...NOTES_FRONTAL, ...NOTES_GIRO }

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

  'quiénes somos · arco de entrada': {
    title: 'Tramo 2 · Quiénes somos (dos personas)',
    body: [],
  },

  'números · arco de caída': {
    title: 'Tramo 3 · Números',
    body: [],
  },

  'portfolio · arco de aproximación': {
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

  'final · arco de subida': {
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
      '',
      '── S7: el ascensor se convirtió en arco ─────────────────────────────────',
      '',
      'El levantarse ya no sube por una vertical: un intermedio derivado lo saca de',
      'la recta. El detalle está en su propio comentario, acá abajo.',
    ],
  },
}

/**
 * Ancho al que el exportador rellena el separador de tramo, contando la sangría
 * y el `// `. Es el que ya tiene el archivo.
 */
export const SECTION_RULE_WIDTH = 78
