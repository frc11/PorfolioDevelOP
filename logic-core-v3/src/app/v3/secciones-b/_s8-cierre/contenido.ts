/**
 * EL CONTENIDO DEL CIERRE — como DATO, con sus marcadores.
 *
 * ── Por qué los rótulos de los enlaces NO están escritos acá ───────────────
 *
 * Un enlace del pie que dice "Servicios" y va a `#servicios` tiene DOS cosas
 * que se pueden desincronizar: el destino y el nombre. Acá se derivan las dos
 * de la misma fila de `_lib/secciones.ts` —la tabla que escribe el lane A— así
 * que no hay forma de que el rótulo diga una cosa y el ancla lleve a otra. El
 * día que el lane A renombre una sección, el pie la renombra con ella.
 *
 * ── Qué es relleno y qué no ────────────────────────────────────────────────
 *
 * El titular, el rótulo del CTA, los títulos de columna y el texto de ayuda del
 * formulario son RELLENO con la longitud y la estructura retórica correctas: es
 * para juzgar composición, no para leerlo como definitivo. Lo que NO es relleno
 * son los nombres de las secciones (salen de la tabla) y los marcadores, que son
 * el pedido a Franco escrito en el vocabulario de `_contrato/contenido.ts`.
 *
 * **Ningún número.** Ni uno: el único dígito de esta sección es el `08` del
 * rótulo, que lo pone `EncabezadoDeSeccion` desde `NUMERO_DE_CONTRATO` y está
 * declarado en `NUMEROS_PERMITIDOS`.
 */

import type { Marcador } from '../_contrato/contenido'
import { ORDEN_DE_SECCIONES_B, seccionDe } from '../_contrato/secciones'

/** El nombre visible de la sección, para el rótulo de la columna lateral. */
export const ETIQUETA_DE_SECCION = 'Cierre'

/**
 * El titular de cierre. Corto y grande: es lo último que se lee, y va en
 * `titulo-xl`, el nivel más grande de la escala.
 */
export const TITULAR_DE_CIERRE = 'Lo que sigue lo armamos con vos'

export interface DestinoDeLaRuta {
  /** El ancla. El `id` lo pone `Panel` desde la tabla del sitio. */
  readonly ancla: string
  /** El nombre visible. Sale de la MISMA fila que el ancla. */
  readonly rotulo: string
}

/**
 * Las cuatro anclas que existen en esta ruta. Es la lista contra la que el
 * instrumento verifica que ningún `href` lleve a la nada.
 */
export const ANCLAS_QUE_EXISTEN: readonly string[] = ORDEN_DE_SECCIONES_B.map((id) => `#${id}`)

/**
 * Los destinos del pie: las otras tres secciones del recorrido.
 *
 * **El Cierre no se enlaza a sí mismo.** Un enlace a la sección en la que ya
 * estás no lleva a ningún lado en el sentido que importa: no cambia nada. Está
 * en `ANCLAS_QUE_EXISTEN` porque existe; no está acá porque no sirve.
 */
export const DESTINOS_DE_LA_RUTA: readonly DestinoDeLaRuta[] = ORDEN_DE_SECCIONES_B.filter(
  (id) => id !== 'cierre',
).map((id) => ({ ancla: `#${id}`, rotulo: seccionDe(id).nombre }))

/**
 * El CTA. Va en TINTA por instrucción —nunca acento— y lleva a un destino que
 * existe: la primera sección del recorrido.
 *
 * ⚠️ El destino REAL de un cierre es contacto, y contacto no existe. Queda
 * reportado como pedido; mientras tanto el CTA no puede ser un botón muerto.
 */
export const CTA_DE_CIERRE = {
  rotulo: 'Ver los servicios',
  destino: DESTINOS_DE_LA_RUTA[0].ancla,
} as const

/** Qué clase de columna es cada una. Decide qué cuerpo se renderiza. */
export type ClaseDeColumna = 'recorrido' | 'pedido' | 'novedades'

export interface ColumnaDelPie {
  readonly id: string
  readonly titulo: string
  readonly clase: ClaseDeColumna
}

/**
 * Las tres columnas del pie. Son las N piezas del conjunto de P2 y su cantidad
 * es la que alimenta el escalonado: `cantidad = COLUMNAS.length`, no un número
 * escrito al lado.
 */
export const COLUMNAS: readonly ColumnaDelPie[] = [
  { id: 'recorrido', titulo: 'El recorrido', clase: 'recorrido' },
  { id: 'contacto', titulo: 'Contacto', clase: 'pedido' },
  { id: 'novedades', titulo: 'Novedades', clase: 'novedades' },
]

export interface PedidoDeEnlace {
  readonly marcador: Marcador
  /** Qué va acá, escrito para que alguien lo lea. Es el pedido. */
  readonly descripcion: string
}

/**
 * LA COLUMNA QUE NO SE PUEDE MONTAR — redes y dirección de contacto.
 *
 * No hay destino real, y un enlace que no lleva a ningún lado es la misma clase
 * de defecto que un formulario con éxito falso. Entonces se muestra LA FORMA de
 * la columna con el marcador como TEXTO, nunca como `<a>`.
 */
export const PEDIDOS_DE_CONTACTO: readonly PedidoDeEnlace[] = [
  { marcador: '[ENLACE]', descripcion: 'la dirección de contacto, cuando exista' },
  { marcador: '[ENLACE]', descripcion: 'las redes, una por red' },
]

/**
 * EL FORMULARIO DE NOVEDADES — montado DESHABILITADO, con el motivo escrito.
 *
 * `FormularioDeNovedades` no declara `action` ni `onSubmit`, y un `<form>` sin
 * `action` se envía a la URL actual por GET: dejarlo habilitado recargaría la
 * página con el correo en la barra y parecería que funcionó. Ese es el éxito
 * falso, y es deuda conocida del pie del sitio vivo.
 *
 * El texto de ayuda no es una nota al pie: el componente lo ata con
 * `aria-describedby`, así que se anuncia junto al campo.
 */
export const NOVEDADES = {
  id: 'cierre-novedades',
  rotulo: 'Tu correo',
  placeholder: 'nombre@dominio',
  rotuloDeEnvio: 'Suscribirme',
  ayuda:
    'El envío está deshabilitado: todavía no hay destino. Habilitado sin destino, el formulario ' +
    'se enviaría a esta misma página y parecería que funcionó.',
} as const

/**
 * LA LÍNEA DE CIERRE — la última del documento.
 *
 * Fecha, razón social y legales no existen todavía y no se inventan: van con su
 * marcador, en texto, y la nota dice qué entra ahí.
 */
export const LINEA_DE_CIERRE = {
  marca: 'develOP',
  piezas: ['[FECHA]', '[NOMBRE]', '[ENLACE]'] as readonly Marcador[],
  nota: 'La fecha, la razón social y los legales entran acá cuando existan.',
} as const
