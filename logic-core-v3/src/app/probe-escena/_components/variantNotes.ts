import type { ChoreoSection } from '@/app/v3/_lib/escena/choreographyTypes'

/**
 * LOS COMENTARIOS DE LAS TRES VARIANTES, como dato.
 *
 * Misma separación que `choreographyNotes.ts` hace con la coreografía base, y
 * por la misma razón: **el exportador re-emite estos textos**, así que tienen
 * que existir como strings y no como comentarios de código. Un export que
 * devolviera solo números convertiría cada pegado en una pérdida.
 *
 * ── La regla, otra vez ─────────────────────────────────────────────────────
 *
 * **Los comentarios de adentro de cada array de variante se editan ACÁ.** Los
 * `//` que están en `variantIntima.ts`, `variantArquitectonica.ts` y
 * `variantDramatica.ts` son la SALIDA de este archivo. Cambiar uno allá y no
 * acá se pierde en el próximo pegado.
 *
 * El doc de módulo de cada variante —la tesis, la tabla de números, las tres
 * decisiones propias— sí es comentario de verdad y vive en su archivo: eso no
 * pasa por el exportador y nadie lo regenera.
 *
 * ── Por qué las tres juntas y no una tabla por archivo ─────────────────────
 *
 * Porque son cortas. Las variantes son propuestas: su razonamiento vive en el
 * doc de módulo de cada una, y acá abajo queda solo lo que va ADENTRO del
 * array — seis separadores de tramo y dos o tres notas por variante. Tres
 * archivos de setenta líneas serían tres importaciones para leer lo mismo.
 */

// ── Intima ────────────────────────────────────────────────────────────────

/** El doc que va arriba del array. El censo lo recalcula el exportador. */
export const INTIMA_DOC: readonly string[] = [
  'Recorrido ÍNTIMO. Distancias de 6,4 a 11,5 — el logo desborda el cuadro en',
  '21 de sus 24 poses y nunca baja del 86% del alto: el espacio entra por el',
  'costado que el encuadre libera, no por arriba ni por abajo.',
  '',
  'Todas las poses son propuestas: ninguna se compuso mirando la escena. La',
  'coreografía calibrada a mano es `CHOREO_KEYFRAMES`, en `choreography.ts`.',
]

/** Separador de tramo, indexado por el `name` del keyframe que lo SIGUE. */
export const INTIMA_SECTIONS: Readonly<Record<string, ChoreoSection>> = {
  'entrada · sobre el canto': {
    title: 'Tramo 1 · Hero',
    body: [
      'Arranca cerca y arriba: lo primero que se ve es el canto superior de la',
      'extrusión, no la silueta. La bajada resuelve en un arco que además se',
      'acerca de 11,5 a 7,6.',
    ],
  },
  'quiénes somos · persona 1': {
    title: 'Tramo 2 · Quiénes somos (dos personas)',
    body: [
      'Las dos personas se resuelven con ÁNGULO, no con encuadre: −26° para una',
      'y +22° para la otra, a 6,6 de distancia. De tan cerca, girar 48° cambia',
      'el objeto entero — se pasa de ver una cara a ver la otra por el canto.',
    ],
  },
  'números · al ras': {
    title: 'Tramo 3 · Números',
    body: [
      'El punto más bajo y más cercano de la variante: la cámara rasa el papel a',
      '6,4 del logo. Y de ahí, el único respiro del recorrido.',
    ],
  },
  'portfolio · arco de aproximación': {
    title: 'Tramo 4 · Portfolio',
    body: [],
  },
  'demos · giro ¼': {
    title: 'Tramo 5 · Demos',
    body: [
      'La vuelta entera a 6,4–7,2 de distancia, en cuatro tramos de 67,5°. De',
      'tan cerca la vuelta no muestra el objeto girando: muestra el objeto',
      'pasando, que es otra cosa.',
    ],
  },
  'final · arco de subida': {
    title: 'Tramo 6 · Movimiento final + cierre',
    body: [
      'El cierre se aleja a 11,5 —lo más lejos que esta variante llega— y ahí el',
      'logo entra entero por segunda y última vez, ocupando el 98% del alto.',
      'Justo, sin aire: es un cierre que no deja lugar para texto arriba y abajo,',
      'y eso hay que decidirlo mirando.',
    ],
  },
}

/** Comentario de un keyframe, indexado por su `name`. No todos tienen. */
export const INTIMA_NOTES: Readonly<Record<string, readonly string[]>> = {
  'números': [
    'EL RESPIRO. Es la única pose de la primera mitad donde el logo entra entero',
    '(98% del alto del cuadro a 11,2 de distancia). Sin este momento el',
    'recorrido no tiene con qué comparar los fragmentos que muestra el resto.',
  ],
  'cierre': [
    'A 11,5 el logo ocupa el 98% del alto: **entra justo y sin aire**. En la base',
    'el cierre deja 14,6% arriba y abajo para el wordmark y el slogan; acá no',
    'hay lugar para ninguno de los dos. Es coherente con la tesis y es',
    'exactamente el punto donde hay que decidir si la tesis aguanta el contenido',
    'real. La salida es un número: subir la distancia a ~16.',
  ],
}

// ── Arquitectonica ────────────────────────────────────────────────────────

/** El doc que va arriba del array. El censo lo recalcula el exportador. */
export const ARQUITECTONICA_DOC: readonly string[] = [
  'Recorrido ARQUITECTÓNICO. Distancias de 11,5 a 29 — el logo nunca desborda el',
  'cuadro y el espacio que S5 construyó entra de verdad: planos suspendidos,',
  'retícula del techo, pilares y el dibujo del piso.',
  '',
  'Las poses lejanas viven en la cuña libre (±40° del eje frontal, donde no hay',
  'planos suspendidos) y las que se salen de ella se quedan a menos de 11,8, o',
  'sea por dentro del anillo entero. Ningún plano cruza el segmento cámara→logo',
  'en ninguna pose: el más cerca pasa a 3,09 de mundo.',
  '',
  'Todas las poses son propuestas: ninguna se compuso mirando la escena. La',
  'coreografía calibrada a mano es `CHOREO_KEYFRAMES`, en `choreography.ts`.',
]

/** Separador de tramo, indexado por el `name` del keyframe que lo SIGUE. */
export const ARQUITECTONICA_SECTIONS: Readonly<Record<string, ChoreoSection>> = {
  'entrada · la sala entera': {
    title: 'Tramo 1 · Hero',
    body: [
      'Arranca a 29 y a 9 de altura: el cuadro más abierto de las cuatro',
      'coreografías. Se ve la sala antes que la marca, que es exactamente lo',
      'contrario de lo que hace la base.',
    ],
  },
  'quiénes somos · arco de entrada': {
    title: 'Tramo 2 · Quiénes somos (dos personas)',
    body: [
      'Las dos personas se resuelven con ENCUADRE y no con ángulo: ±0,75 a 15,5',
      'de distancia deja media pantalla libre de un lado, con el logo entero del',
      'otro. A esta distancia el encuadre tiene recorrido de sobra.',
    ],
  },
  'números · arco de caída': {
    title: 'Tramo 3 · Números',
    body: [
      'Una excursión hacia abajo —única de la variante— para que la retícula del',
      'techo entre por arriba, y de ahí el retroceso más largo del recorrido:',
      'de 14,5 a 23 en una pantalla.',
    ],
  },
  'portfolio · arco de aproximación': {
    title: 'Tramo 4 · Portfolio',
    body: [
      'Lo más cerca que la variante llega (11,5) y lo más alto (8,4): un picado',
      'franco sobre el logo, con el dibujo del piso ocupando el fondo entero.',
    ],
  },
  'demos · giro ¼': {
    title: 'Tramo 5 · Demos',
    body: [
      'La vuelta entera a 11,5 de distancia — el techo que impone el anillo de',
      'planos, no una elección estética. A esta escala lo que gira es la',
      'SALA: los planos suspendidos barren el cuadro, se tapan entre ellos y',
      'destapan el ciclorama. Es la única variante donde el paralaje entre los',
      'elementos del espacio se lee de verdad.',
    ],
  },
  'final · arco de subida': {
    title: 'Tramo 6 · Movimiento final + cierre',
    body: [
      'El cierre se va a 29 con el logo en el 39% del alto del cuadro: 30% de',
      'aire arriba y abajo, el doble que la base. Es el cierre que más lugar',
      'deja para el wordmark y el slogan.',
    ],
  },
}

/** Comentario de un keyframe, indexado por su `name`. No todos tienen. */
export const ARQUITECTONICA_NOTES: Readonly<Record<string, readonly string[]>> = {
  'entrada · la sala entera': [
    'A 29 de distancia y en azimut 0 —dentro de la cuña libre— ningún plano',
    'suspendido queda entre la cámara y el logo. Es la restricción que gobierna',
    'toda la variante y acá es donde más apretada queda.',
  ],
  'portfolio': [
    'Azimut 42 a distancia 11,5: se sale de la cuña libre, así que se queda por',
    'DENTRO del anillo de planos —el más cercano de los once está a 11,8—. Ése',
    'es el mecanismo que mantiene la variante sana en todo el recorrido, y es',
    'el que le fija el techo de distancia al giro que viene después.',
  ],
}

// ── Dramatica ─────────────────────────────────────────────────────────────

/** El doc que va arriba del array. El censo lo recalcula el exportador. */
export const DRAMATICA_DOC: readonly string[] = [
  'Recorrido DRAMÁTICO. Recorre el rango vertical entero (−3,9 a 9) varias',
  'veces: once cruces por el nivel del objeto en ocho pantallas, o sea once',
  'cambios de picado a contrapicado.',
  '',
  'Es además la variante compuesta CON el arco del sol a la vista: baja la',
  'cámara al piso justo cuando el sol cruza el frente, así que es la única',
  'donde la fuente de luz entra en cuadro por decisión y no por casualidad.',
  '',
  'Todas las poses son propuestas: ninguna se compuso mirando la escena. La',
  'coreografía calibrada a mano es `CHOREO_KEYFRAMES`, en `choreography.ts`.',
]

/** Separador de tramo, indexado por el `name` del keyframe que lo SIGUE. */
export const DRAMATICA_SECTIONS: Readonly<Record<string, ChoreoSection>> = {
  'entrada · cenital': {
    title: 'Tramo 1 · Hero',
    body: [
      'Entra casi desde arriba (9 de altura a 12 de distancia, picado de 37°) y',
      'termina en el PISO. La primera pantalla del sitio recorre el rango',
      'vertical completo, de arriba del todo a abajo del todo.',
    ],
  },
  'quiénes somos · arco de entrada': {
    title: 'Tramo 2 · Quiénes somos (dos personas)',
    body: [
      'Las dos personas se distinguen por ALTURA, no por lado: las dos a +9 —el',
      'techo del rango— con una caída a −1,4 en el medio. El cruce no es un',
      'barrido lateral: es un desplome y una recuperación.',
    ],
  },
  'números · arco de caída': {
    title: 'Tramo 3 · Números',
    body: [
      'Del piso (−3,9 a 8 de distancia, contrapicado de 26°) a 7,4 de altura y',
      '17 de distancia en una sola pantalla. Es el salto de punto de vista más',
      'grande del recorrido.',
    ],
  },
  'portfolio · arco de aproximación': {
    title: 'Tramo 4 · Portfolio',
    body: [
      'El arco de aproximación pasa por DEBAJO (−2) antes de subir a 8,6: la',
      'cámara se agacha para entrar y se levanta al llegar.',
    ],
  },
  'demos · giro ¼': {
    title: 'Tramo 5 · Demos',
    body: [
      'La vuelta entera con la cámara en el piso durante tres cuartos de ella.',
      '`giro ½` toca −3,9 mirando 24° hacia arriba, que es donde el sol cruza el',
      'frente: la única pose de las cuatro coreografías compuesta PARA que la',
      'fuente de luz entre en cuadro.',
    ],
  },
  'final · arco de subida': {
    title: 'Tramo 6 · Movimiento final + cierre',
    body: [
      'Sube al techo del rango (8,6) y de ahí se desploma al cierre en −1,4. El',
      'último movimiento del recorrido es una caída de 10 unidades mientras se',
      'aleja: la marca se agranda contra el observador justo cuando la sala se',
      'apaga.',
    ],
  },
}

/** Comentario de un keyframe, indexado por su `name`. No todos tienen. */
export const DRAMATICA_NOTES: Readonly<Record<string, readonly string[]>> = {
  hero: [
    'ALTURA −3,2: el hero mira la marca DESDE ABAJO. Es la decisión más fuerte',
    'de la variante y la que hay que juzgar primero, porque define la primera',
    'impresión del sitio entero. Un contrapicado dice "esto es más grande que',
    'vos"; el picado de la base dice "esto se puede abarcar". Son dos sitios',
    'distintos.',
  ],
  'demos · giro ½': [
    'El piso del rango (−3,9) a 8,6 de distancia, con 24° de contrapicado, en el',
    'punto del progreso donde el arco del sol cruza el frente. **Es la pose donde',
    'el sol entra en cuadro**, y está puesta ahí a propósito.',
  ],
  cierre: [
    'Contrapicado de cierre: −1,4 de altura a 18 de distancia, con el logo en el',
    '63% del alto del cuadro. Deja aire para el wordmark y el slogan, y los deja',
    'POR ENCIMA de la línea de visión — que es coherente con una variante que',
    'mira la marca desde abajo todo el tiempo.',
  ],
}
