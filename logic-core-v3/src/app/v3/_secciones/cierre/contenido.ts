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
 * el pedido a Franco escrito en el vocabulario de `_contrato/escaneo.ts`.
 *
 * **Ningún número.** Ni uno: el único dígito de esta sección es el `08` del
 * rótulo, que lo pone `EncabezadoDeSeccion` desde `NUMERO_DE_CONTRATO` y está
 * declarado en `NUMEROS_PERMITIDOS`.
 */

import { IDS_DE_SECCION, seccionDe } from '../_contrato/forma'
import type { Marcador } from '../_contrato/marcadores'
import type { EntradaDePedido } from '../_contrato/pedido'

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
 * Las anclas que existen en la ruta. Es la lista contra la que el instrumento
 * verifica que ningún `href` lleve a la nada.
 *
 * Salían de las CUATRO secciones del lane, porque el pie vivía en una ruta de
 * demostración que montaba cuatro. Desde SITIO-S7 el pie vive en el home y el
 * home monta las OCHO, así que la lista de lo que existe son las ocho — se
 * deriva de la tabla del recorrido y no se escribe.
 */
export const ANCLAS_QUE_EXISTEN: readonly string[] = IDS_DE_SECCION.map((id) => `#${id}`)

/**
 * ⚠ LAS SECCIONES QUE EL PIE ENLAZA, QUE NO SON TODAS LAS QUE EXISTEN.
 *
 * Son las mismas cuatro de siempre. **Ampliarlo a las ocho es una decisión de
 * CONTENIDO** —qué ofrece el pie como recorrido— y este sprint compone lo que
 * había, no decide lo que nadie decidió. Queda anotado como abierto para la
 * etapa de contenido, que es la que sigue.
 */
const SECCIONES_QUE_EL_PIE_ENLAZA: readonly string[] = [
  'servicios',
  'tu-panel',
  'por-que-develop',
  'cierre',
]

/**
 * Los destinos del pie: las otras tres secciones del recorrido.
 *
 * **El Cierre no se enlaza a sí mismo.** Un enlace a la sección en la que ya
 * estás no lleva a ningún lado en el sentido que importa: no cambia nada. Está
 * en `ANCLAS_QUE_EXISTEN` porque existe; no está acá porque no sirve.
 */
export const DESTINOS_DE_LA_RUTA: readonly DestinoDeLaRuta[] = SECCIONES_QUE_EL_PIE_ENLAZA.filter(
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

/**
 * EL PEDIDO — lo que falta en esta sección, con su formato.
 *
 * Se agrega en SITIO-S7: el lane que escribió la sección declaraba lo
 * provisional en prosa y con marcadores visibles, pero **el pedido no era un
 * dato**, así que no se podía producir un documento con él ni comprobar que no
 * se quedara viejo. `s7-pedido` cruza esta tabla contra el texto renderizado en
 * los dos sentidos: un marcador en pantalla sin entrada acá falla, y una
 * entrada que pide algo que ya no se ve, también.
 *
 * El archivo donde se edita NO se escribe acá: sale del registro.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'PEDIDOS_DE_CONTACTO[0]',
    clase: 'enlace',
    marcador: '[ENLACE]',
    que: 'La dirección de contacto: mail, WhatsApp o el destino que corresponda.',
    formato: 'Una URL o un `mailto:`. El rótulo visible va aparte.',
  },
  {
    ruta: 'PEDIDOS_DE_CONTACTO[1]',
    clase: 'enlace',
    marcador: '[ENLACE]',
    que: 'Las redes, una por red, con el perfil real.',
    formato: 'Una URL por red.',
  },
  {
    ruta: 'LINEA_DE_CIERRE.piezas',
    clase: 'prosa',
    marcador: '[FECHA]',
    que: 'El año del pie de página.',
    formato: 'Cuatro dígitos. Se puede derivar de la fecha del build.',
  },
  {
    ruta: 'LINEA_DE_CIERRE.piezas',
    clase: 'prosa',
    marcador: '[NOMBRE]',
    que: 'La razón social, si va a figurar.',
    formato: 'Nombre legal completo. Una línea.',
  },
]
