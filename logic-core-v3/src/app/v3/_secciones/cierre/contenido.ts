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
 * LAS SECCIONES QUE EL PIE ENLAZA — las ocho, **derivadas** (SITIO-S8).
 *
 * ── Qué eran, y por qué eran cuatro ────────────────────────────────────────
 *
 * Eran una lista escrita a mano —`servicios`, `tu-panel`, `por-que-develop`,
 * `cierre`— y no eran cuatro por una decisión: eran las cuatro secciones del
 * lane que escribió el pie, que era el único recorrido que ese lane conocía.
 * SITIO-S7 montó las ocho en el home y **no la tocó**, con la razón escrita:
 * ampliar lo que el pie OFRECE es contenido, y la instrucción de ese sprint
 * prohibía cambiar el contenido de una sección. Quedó anotado en §7.24.
 *
 * ── Qué son ahora, y por qué se DERIVAN ────────────────────────────────────
 *
 * Las ocho, sacadas de `IDS_DE_SECCION` —o sea de `_lib/secciones.ts`, la única
 * tabla del recorrido— y no de una lista escrita al lado. Es la regla del
 * proyecto para esta forma exacta (§7.27): *un número que cuenta una lista que
 * otro sprint puede alargar se deriva; uno que describe una decisión de
 * composición se escribe y se explica*. Cuántas secciones tiene el sitio es lo
 * primero: el sprint que agregue una novena la va a ver aparecer en el pie sin
 * acordarse de esta línea, que es exactamente lo que tiene que pasar.
 *
 * **El orden es el del RECORRIDO**, porque es el que sale derivado y es el
 * único defendible: el pie de un sitio que se lee de arriba abajo ofrece
 * volver, y volver tiene el orden en que se pasó. El orden anterior arrancaba
 * en Servicios —la QUINTA sección— y eso no era una composición: era dónde
 * empezaban las cuatro del lane.
 *
 * ⚠️ **LA CONSECUENCIA QUE ESTO TUVO, Y CÓMO SE RESOLVIÓ.** `CTA_DE_CIERRE`
 * tomaba su destino de `DESTINOS_DE_LA_RUTA[0]`, así que al cambiar el orden el
 * CTA se iba de `#servicios` a `#hero` y su rótulo —«Ver los servicios»— dejaba
 * de corresponder. Un botón que nombra un destino y lleva a otro es un defecto,
 * aunque el rótulo esté declarado relleno.
 *
 * **Se resolvió preservando el comportamiento**, que es la única salida que este
 * sprint podía tomar sin decidir contenido: el destino se ESCRIBIÓ —`#servicios`,
 * el mismo de siempre— y quedó desacoplado del orden del pie. Ver su docblock.
 * Cambiar a dónde empuja el cierre sigue siendo una decisión del humano.
 */
const SECCIONES_QUE_EL_PIE_ENLAZA: readonly string[] = IDS_DE_SECCION

/**
 * Los destinos del pie: las otras SIETE secciones del recorrido.
 *
 * **El Cierre no se enlaza a sí mismo.** Un enlace a la sección en la que ya
 * estás no lleva a ningún lado en el sentido que importa: no cambia nada. Está
 * en `ANCLAS_QUE_EXISTEN` porque existe; no está acá porque no sirve. Esa razón
 * es la misma de siempre y **el filtro se mantiene**: lo único que cambió es de
 * cuántas se filtra.
 */
/** [FINAL 3] Sin Números (no se monta) y con «Inicio» en lugar de «Hero». */
const SIN_ENLACE_EN_EL_PIE: readonly string[] = ['cierre', 'numeros']
const ROTULO_EN_EL_PIE: Readonly<Record<string, string>> = { hero: 'Inicio' }
export const DESTINOS_DE_LA_RUTA: readonly DestinoDeLaRuta[] = SECCIONES_QUE_EL_PIE_ENLAZA.filter(
  (id) => !SIN_ENLACE_EN_EL_PIE.includes(id),
).map((id) => ({ ancla: `#${id}`, rotulo: ROTULO_EN_EL_PIE[id] ?? seccionDe(id).nombre }))

/**
 * El CTA. Va en TINTA por instrucción —nunca acento— y lleva a un destino que
 * existe.
 *
 * ⚠️ El destino REAL de un cierre es contacto, y contacto no existe. Queda
 * reportado como pedido; mientras tanto el CTA no puede ser un botón muerto.
 *
 * ── Por qué el destino está ESCRITO y ya no sale de `[0]` (SITIO-S8) ───────
 *
 * Decía `DESTINOS_DE_LA_RUTA[0].ancla`, y eso funcionaba **por accidente**:
 * mientras la lista arrancaba en Servicios, `[0]` era `#servicios` y el rótulo
 * correspondía. Al derivar el recorrido del pie de la tabla, `[0]` pasó a ser
 * `#hero` y el CTA quedó diciendo «Ver los servicios» y llevando a otro lado.
 *
 * Escribirlo NO es una decisión de contenido nueva: es **exactamente el destino
 * que este botón tenía**, desacoplado del orden del pie, que es de donde nunca
 * tendría que haber salido. El rótulo y el destino son una sola decisión de
 * composición y por eso van juntos y escritos — la regla del proyecto es esa
 * (§7.27): *un número que describe una decisión se escribe y se explica; uno
 * que cuenta una lista que otro sprint puede alargar se deriva*. A dónde empuja
 * el cierre es lo primero.
 *
 * ⚠️ Lo que SIGUE ABIERTO y lo decide el humano: el rótulo está declarado
 * RELLENO en el docblock de este archivo, así que si el cierre tiene que
 * empujar a otro lado, se cambian las dos líneas de abajo a la vez.
 *
 * `ANCLAS_QUE_EXISTEN` custodia que el destino exista: `s8-cierre.invariant`
 * afirma que ningún `href` del marcado lleva a la nada.
 */
/**
 * [FINAL] El CTA del pie se fue: el llamado a hablar es el tiempo C del final, en «Por qué
 * develOP». El pie enlaza al contacto como una entrada más de su columna de contacto.
 */
export const CONTACTO_DEL_PIE = {
  rotulo: 'Hablanos',
  destino: '#contacto',
} as const

/** Qué clase de columna es cada una. Decide qué cuerpo se renderiza. */
export type ClaseDeColumna = 'recorrido' | 'contacto'

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
  // [FINAL] la columna de contacto enlaza al contacto; la dirección y las redes pasaron a la izquierda y al pie.
  { id: 'contacto', titulo: 'Contacto', clase: 'contacto' },
]

/**
 * [FINAL 3] EL PEDIDO — vacío. El contacto, las redes y la línea legal pasaron a datos
 * reales en `contacto.ts`; lo provisorio (las URLs de las redes) va con su TODO ahí, sin
 * marcador en pantalla.
 */
export const PEDIDO: readonly EntradaDePedido[] = []
