/**
 * TEXTO DE RELLENO — neutro a propósito.
 *
 * No es copy del sitio ni una aproximación a él: es material de calibración. Si
 * dijera algo, el ojo leería el mensaje en vez de mirar el movimiento, que es lo
 * único que esta ruta existe para juzgar.
 *
 * Los tres bloques de P1 están dimensionados para caer en 1, 3 y 6 líneas al
 * ancho de la columna del demo —el rango medido en la referencia—, pero **la
 * cantidad real la decide el navegador**: es exactamente la razón por la que el
 * divisor mide en vez de calcular. Si la ventana es más angosta, el bloque de
 * tres cae en cuatro, y eso es correcto.
 */

/** P1 — un renglón. El caso mínimo: una sola línea, sin escalonado visible. */
export const UNA_LINEA = 'Una sola línea, sin escalonado.'

/** P1 — tres renglones a la medida de la columna. */
export const TRES_LINEAS =
  'Tres líneas que suben una detrás de otra, cada una desde una altura de sí misma, con dos décimas de retraso entre una y la siguiente.'

/** P1 — seis renglones: el extremo alto del rango medido. */
export const SEIS_LINEAS =
  'Seis líneas, que es el bloque más largo que la medición encontró en la referencia. A esta cantidad el escalonado se vuelve el rasgo dominante del gesto: la primera línea ya llegó a su lugar cuando la última todavía no empezó a moverse, y el ojo lee una cascada en vez de un bloque. Es donde se decide si dos décimas son muchas o pocas.'

/** P2 — el bloque entero, sin partir. */
export const BLOQUE_ENTERO =
  'El bloque completo sube desde media altura propia. No hay líneas ni piezas: un solo objeto, medio segundo, la misma curva.'

/** P3 — el párrafo que se enciende, palabra por palabra. */
export const PARRAFO_QUE_ENCIENDE =
  'Este párrafo ya está en pantalla desde el principio, en gris, y se enciende palabra por palabra a medida que el recorrido avanza. Nada se mueve de lugar: es el único patrón del sistema que solo cambia el brillo.'

/** P6 — el texto que cruza. Corto: el gesto es el recorrido, no la lectura. */
export const TEXTO_QUE_CRUZA = 'Doscientos ochenta píxeles de lado a lado'

/** P4 — once ítems, la cantidad medida en la referencia. */
export const ITEMS_DE_LISTA: readonly string[] = [
  'Diagnóstico',
  'Arquitectura',
  'Interfaz',
  'Implementación',
  'Integraciones',
  'Automatización',
  'Contenido',
  'Medición',
  'Optimización',
  'Soporte',
  'Evolución',
]

/** P5 — el bloque que crece a velocidad constante. */
export const BLOQUE_QUE_CRECE =
  'A velocidad constante. Sin curva, atado al scroll: se siente como un control de volumen y no como una animación.'

/** P7 — los doce planos. Es el mecanismo con el que van a entrar los proyectos. */
export const PLANOS: readonly string[] = [
  'Proyecto uno',
  'Proyecto dos',
  'Proyecto tres',
  'Proyecto cuatro',
  'Proyecto cinco',
  'Proyecto seis',
  'Proyecto siete',
  'Proyecto ocho',
  'Proyecto nueve',
  'Proyecto diez',
  'Proyecto once',
  'Proyecto doce',
]

/** P8 — 32 piezas. P9 — 18. Las dos cantidades son las medidas. */
export const PIEZAS_DEL_VUELO = 32
export const PIEZAS_DE_LA_GRILLA = 18
