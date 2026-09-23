/**
 * EL CONTENIDO DE «TU PANEL» — las features, como DATO.
 *
 * SPRINT PANEL: la sección dejó de ser captura + tres bloques + lista y pasó a
 * ser una galería al estilo de nk/news. Todo lo que el usuario va a cambiar —la
 * imagen de cada tarjeta, su texto alternativo, el título o la etiqueta— está
 * acá, en `TARJETAS`, y ningún componente escribe una frase propia.
 *
 * **Ningún número y ninguna captura falsa.** Mientras no haya capturas reales,
 * cada tarjeta muestra el placeholder rayado del sitio y el marcador del pedido
 * encima: una pantalla de panel inventada, con datos, sería contenido inventado.
 */

import { sizesPorViewport } from '../../_lib/imagen'
import type { Marcador } from '../_contrato/marcadores'
import type { EntradaDePedido } from '../_contrato/pedido'

export const ID = 'tu-panel'

/** El nombre visible del rótulo. Es contenido, no el id. */
export const NOMBRE = 'Tu panel'

/**
 * EL ENCABEZADO — SPRINT PANEL 2. Ocupa el 30 % izquierdo en escritorio; la
 * descripción entra en dos renglones como mucho a ese ancho.
 */
export const TITULO = 'Tu Panel'
export const DESCRIPCION = 'Tu acceso al proyecto. Ves cómo va y pedís lo que necesites, sin esperar un mail.'

/** Una tarjeta de la galería. `imagen` y `alt` son lo que se cambia cuando lleguen las capturas. */
export interface Tarjeta {
  readonly titulo: string
  /** Va donde nk pone la fecha: chica, en mayúsculas, debajo del título. */
  readonly etiqueta: string
  /** Ruta servida desde `public/`. Hoy, el placeholder rayado. */
  readonly imagen: string
  /** `''` mientras la imagen sea el placeholder: un rayado no se describe como una pantalla. */
  readonly alt: string
}

/** El placeholder rayado de B12 §4.3, con la medida de una captura real. */
const PLACEHOLDER = '/placeholders/panel.png'

/**
 * LAS OCHO, en el orden de la instrucción. Cada título arranca con un verbo en
 * voseo: es lo que la persona HACE en el panel, no lo que el panel «ofrece».
 */
export const TARJETAS: readonly Tarjeta[] = [
  { titulo: 'Revisá cada conversación de tu chatbot', etiqueta: 'Chatbot', imagen: PLACEHOLDER, alt: '' },
  { titulo: 'Recibí los leads ya calificados que consultaron tu página', etiqueta: 'Leads', imagen: PLACEHOLDER, alt: '' },
  { titulo: 'Creá tickets para que cambiemos lo que necesites', etiqueta: 'Soporte', imagen: PLACEHOLDER, alt: '' },
  { titulo: 'Chateá con nosotros directo, por lo que sea', etiqueta: 'Soporte', imagen: PLACEHOLDER, alt: '' },
  { titulo: 'Pedí servicios nuevos a medida que los sumamos', etiqueta: 'Servicios', imagen: PLACEHOLDER, alt: '' },
  { titulo: 'Mirá el resumen de tu proyecto', etiqueta: 'Proyecto', imagen: PLACEHOLDER, alt: '' },
  { titulo: 'Seguí tus resultados', etiqueta: 'Resultados', imagen: PLACEHOLDER, alt: '' },
  { titulo: 'Configurá cómo responde tu chatbot', etiqueta: 'Chatbot', imagen: PLACEHOLDER, alt: '' },
]

/** El cierre de la galería, a tamaño de titular. Los puntos van aparte: entran uno por uno. */
export const Y_MAS = 'Y más'
export const PUNTOS_DE_Y_MAS = 3

/**
 * EL NEWSLETTER — se mudó del pie del Cierre (SPRINT PANEL 2).
 *
 * ⚠️ Sigue DESHABILITADO, y por la misma razón que en el pie: no hay a dónde
 * mandarlo. No existe una ruta ni una acción de suscripción en el repo (lo de
 * Brevo son campañas y correos del panel de clientes), y un formulario habilitado
 * sin destino se enviaría a esta misma página y parecería que funcionó.
 */
export const NEWSLETTER = {
  id: 'tu-panel-novedades',
  titulo: 'Sé el primero en enterarte de las nuevas features',
  rotulo: 'Tu correo',
  placeholder: 'nombre@dominio',
  rotuloDeEnvio: 'Suscribirme',
  ayuda: 'Todavía no hay a dónde mandarlo: el envío se habilita cuando exista la lista.',
} as const

/** Las palabras del fondo. Decorativas: no se anuncian. */
export const PALABRAS_DEL_FONDO = ['Panel', 'Control', 'Resumen', 'Tickets', 'Leads', 'Resultados', 'Chatbot'] as const

/**
 * LA CAPTURA — la medida que se le pide a cada imagen, y el marcador que se lee
 * encima mientras falte. `s21-fotos` cruza `fuente`, `ancho` y `alto` contra el
 * archivo del disco.
 */
export const MARCADOR_DE_LA_CAPTURA: Marcador = '[CAPTURA DEL PANEL]'

export const CAPTURA = {
  marcador: MARCADOR_DE_LA_CAPTURA,
  fuente: PLACEHOLDER,
  ancho: 1920,
  alto: 1080,
  /** La feature más ancha ocupa el 45 % del ancho: es la que manda el candidato de la escalera. */
  sizes: sizesPorViewport(45),
} as const

/**
 * EL PEDIDO — lo que falta en esta sección. `s7-pedido` cruza esta tabla contra
 * el texto renderizado en los dos sentidos.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'TARJETAS[i].imagen',
    clase: 'captura',
    marcador: '[CAPTURA DEL PANEL]',
    quienLoTrae: 'valentino',
    que:
      'Una captura del panel por tarjeta, de la pantalla que nombra su título (conversaciones, leads, tickets, ' +
      'chat, servicios, resumen, resultados, configuración del chatbot). Con datos de muestra: ningún dato real de un cliente.',
    formato: 'PNG o WEBP, 1920 × 1200 px (16:10). La ruta va en `TARJETAS[i].imagen` y su descripción en `TARJETAS[i].alt`.',
  },
]
