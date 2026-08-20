import type { KeyframeNotes } from './choreographyNotes'

/**
 * COMENTARIOS DEL ARRAY · segunda mitad del recorrido.
 *
 * De `portfolio` a `cierre`: **la mitad que gira.** Acá está la vuelta entera de
 * Demos, el movimiento final y el cierre, y con ellos los dos movimientos más
 * violentos del track y sus tres arreglos de S6.
 *
 * Ver `choreographyNotesFrontal.ts` para la primera mitad y el porqué del corte.
 */
export const NOTES_GIRO: KeyframeNotes = {
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

  'final · arco de subida': [
    '═══ DERIVADO · S7 · curvatura ═══',
    '',
    'De `demos · sostén` a `final · se levanta` la cámara subía **8,4 en línea',
    'recta vertical**, con el ángulo y la distancia clavados: un ascensor. Era el',
    'movimiento más geométricamente pobre del recorrido, y a la vez el segundo más',
    'rápido (51,4 alturas de cuadro por unidad de progreso).',
    '',
    'Ahora es un arco: **se aleja a 8,60** y **se corre 9° de azimut** mientras',
    'sube, y las dos excursiones vuelven a su valor en el keyframe siguiente. La',
    'cámara sale de la vertical, describe una curva y llega a la misma pose.',
    'Desvío de la recta: 2,01 de mundo.',
    '',
    'Los 9° van hacia ATRÁS (315 → 306 → 315), en contra del sentido en que la',
    'vuelta venía girando. Es lo que hace que se lea como un impulso y no como el',
    'principio del giro siguiente.',
  ],

  'final · gira': [
    'El beat que cierra la vuelta: 315 → 360. Desde S6 la cierra ACÁ y no en el',
    'keyframe siguiente, que es lo que deja al cierre dedicado a alejarse.',
  ],

  'cierre · arco de retirada': [
    '═══ DERIVADO · S7 · curvatura ═══',
    '',
    'La retirada al cierre era un deslizamiento recto: bajar 3 y alejarse 8 al',
    'mismo tiempo. Acá la cámara **pasa por arriba**: la altura sube a 5,40 —por',
    'encima de sus DOS extremos (4,50 y 1,50)— antes de asentarse, y la distancia',
    'se adelanta a 12,60. Se levanta para irse, y recién entonces baja.',
    '',
    '**Y de paso disuelve el tirón más grande del recorrido.** El `arrive` del',
    'cierre arranca a 1,84× la velocidad de cuerda, así que en `final · gira` la',
    'velocidad saltaba de 3,4 a 74,2 alturas de cuadro por unidad de progreso: 75,6',
    'de salto, el mayor de todo el track. Con el intermedio en el medio el salto',
    'baja a **49,7** y el pico del tramo de 77,4 a 54,5. No se tocó ni el `arrive`',
    'ni ninguna pose: el salto se reparte entre dos segmentos.',
    '',
    '`linear`: la retirada es UNA gesticulación, y un `shift` acá pondría a la',
    'cámara a frenar justo cuando tiene que estar yéndose.',
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
