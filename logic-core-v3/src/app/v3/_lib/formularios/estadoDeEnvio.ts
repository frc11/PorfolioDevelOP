/**
 * [C2 · 20] EL ESTADO DE ENVÍO — la parte pura del estándar de envío de los formularios de /v3 (`_componentes/formularios/EstadoDeEnvio.tsx`).
 * El del pie NO lo usa (decisión de Valentino: queda como está).
 *
 * Quien monta el formulario dice en qué está el envío (`EstadoDelEnvio`); el componente lo muestra con su propio reloj (`VistaDelEnvio`):
 *
 *   reposo   → el formulario
 *   enviando → el formulario se desvanece y en su lugar aparece la carga de develOP (el logo girando), ya girando
 *   exito    → la carga se desvanece y aparece el encastre del logo (el de la tarjeta del resultado) con el mensaje de éxito
 *   error    → lo mismo con el encastre que no entra y el mensaje de error
 *
 * Pasados `ENVIO.mensajeMs` desde que el encastre aterrizó, el componente avisa (`alVolver`) y quien lo monta vuelve a `reposo`: el
 * formulario regresa con un fundido, vacío después del éxito (lo vacía quien lo monta) y con lo escrito después del error. La carga se
 * ve por lo menos `ENVIO.minimoDeLaCargaMs` aunque la respuesta llegue antes: así no parpadea.
 */

export type EstadoDelEnvio = 'reposo' | 'enviando' | 'exito' | 'error'
export type VistaDelEnvio = 'formulario' | 'carga' | 'exito' | 'error'
/** Cómo terminó el envío: lo recibe `alVolver` (después del éxito, quien lo monta vacía el formulario). */
export type ResultadoDelEnvio = 'exito' | 'error'

export const ENVIO = {
  /** El fundido del formulario, la carga y el mensaje (s). */
  fundidoS: 0.4,
  /** Con movimiento reducido: un fundido corto (y la carga sin girar, el encastre en su estado final). */
  fundidoReducidoS: 0.12,
  /** La carga se ve por lo menos esto (ms), aunque la respuesta llegue antes. */
  minimoDeLaCargaMs: 600,
  /** El mensaje se queda esto (ms) desde que el encastre aterrizó; después vuelve el formulario. */
  mensajeMs: 3000,
} as const

export interface MensajeDelEnvio {
  readonly titulo: string
  readonly linea: string
}

export interface MensajesDelEnvio {
  readonly exito: MensajeDelEnvio
  readonly error: MensajeDelEnvio
}

/** El error es el mismo en todos los formularios (`05-TEXTOS.md`, «Estado de envío»). */
const ERROR_DEL_ENVIO: MensajeDelEnvio = { titulo: 'Algo falló', linea: 'No se pudo enviar. Probá de nuevo en un rato o escribinos por WhatsApp.' }

/** Los textos, tal cual `05-TEXTOS.md` («Estado de envío»): el de contacto (por defecto) y el de la newsletter. */
export const MENSAJES_DEL_ENVIO = {
  contacto: { exito: { titulo: '¡Recibido!', linea: 'Ya lo estamos leyendo. Te contestamos pronto.' }, error: ERROR_DEL_ENVIO },
  newsletter: { exito: { titulo: '¡Listo!', linea: 'Te vamos a avisar cuando sumemos algo nuevo.' }, error: ERROR_DEL_ENVIO },
} as const satisfies Record<string, MensajesDelEnvio>

/** Lo que se ve con cada estado. */
export function vistaDelEstado(estado: EstadoDelEnvio): VistaDelEnvio {
  if (estado === 'reposo') return 'formulario'
  if (estado === 'enviando') return 'carga'
  return estado
}

/**
 * Cuánto esperar (ms) antes de pasar de la vista actual a la siguiente: si se sale de la carga, lo que le falta para su mínimo (contado
 * desde que apareció, `cargaDesdeMs`); en cualquier otro paso, nada.
 */
export function esperaParaPasar(actual: VistaDelEnvio, siguiente: VistaDelEnvio, cargaDesdeMs: number, ahoraMs: number, minimoMs: number = ENVIO.minimoDeLaCargaMs): number {
  if (actual !== 'carga' || siguiente === 'carga') return 0
  return Math.max(0, cargaDesdeMs + minimoMs - ahoraMs)
}

/** El fundido de cada paso (s), según la preferencia de movimiento. */
export function fundidoDelEnvio(reducido: boolean): number {
  return reducido ? ENVIO.fundidoReducidoS : ENVIO.fundidoS
}
