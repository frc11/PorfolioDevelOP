/**
 * EL ENVÍO DEL CONTACTO — una sola puerta. **[CONTACTO]**
 *
 * Todavía no hay backend: `enviarContacto` arma el mensaje con lo que cargó la persona y
 * abre el correo con ese texto ([CIERRE RETOQUE 3D] N1: era WhatsApp, que se fue de todos lados). Conectar el backend es
 * cambiar SÓLO esta función (y el rótulo del botón, `ROTULO_DEL_ENVIO`). La validación es pura y vive acá, al lado.
 */

import { MAIL } from '../../_secciones/cierre/contacto'
import { INTERESES, type Interes } from './contenido'

export interface DatosDeContacto {
  readonly intereses: readonly Interes[]
  readonly presupuesto: string
  readonly nombre: string
  readonly medio: string
  readonly empresa: string
  readonly mensaje: string
}

export type CampoConError = 'intereses' | 'presupuesto' | 'nombre' | 'medio' | 'mensaje'
export type ErroresDeContacto = Partial<Record<CampoConError, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TELEFONO = /^\+?[\d\s()-]{8,}$/

/** Lo que falta o está mal, campo por campo. Vacío = se puede enviar. */
export function validarContacto(d: DatosDeContacto): ErroresDeContacto {
  const e: ErroresDeContacto = {}
  if (d.intereses.length === 0) e.intereses = 'Elegí al menos una opción.'
  if (d.presupuesto.trim().length === 0) e.presupuesto = 'Contanos un número, un rango o «todavía no sé».'
  if (d.nombre.trim().length < 2) e.nombre = 'Decinos cómo te llamás.'
  const medio = d.medio.trim()
  if (!EMAIL.test(medio) && !(TELEFONO.test(medio) && medio.replace(/\D/g, '').length >= 8)) e.medio = 'Un email o un teléfono.'
  if (d.mensaje.trim().length < 3) e.mensaje = 'Contanos aunque sea en una línea.'
  return e
}

/** El texto del mail. */
export function mensajeDeContacto(d: DatosDeContacto): string {
  const rotulos = d.intereses.map((id) => INTERESES.find((i) => i.id === id)?.rotulo ?? id)
  const empresa = d.empresa.trim()
  return [
    `Hola develOP, soy ${d.nombre.trim()}${empresa.length > 0 ? `, de ${empresa}` : ''}.`,
    `Quiero: ${rotulos.join(', ')}.`,
    `Presupuesto: ${d.presupuesto.trim()}.`,
    d.mensaje.trim(),
    `Me contactan por: ${d.medio.trim()}`,
  ].join('\n')
}

export const ASUNTO_DEL_MAIL = 'Contacto desde la web de develOP'

export function urlDelMail(d: DatosDeContacto): string {
  return `mailto:${MAIL}?subject=${encodeURIComponent(ASUNTO_DEL_MAIL)}&body=${encodeURIComponent(mensajeDeContacto(d))}`
}

export type ResultadoDelEnvio =
  | { readonly estado: 'invalido'; readonly errores: ErroresDeContacto }
  | { readonly estado: 'abierto-en-el-mail'; readonly url: string }

/** LA puerta del envío. Hoy: valida y abre el correo. Nunca dice «enviado». */
export function enviarContacto(d: DatosDeContacto, abrir: (url: string) => void = (u) => window.location.assign(u)): ResultadoDelEnvio {
  const errores = validarContacto(d)
  if (Object.keys(errores).length > 0) return { estado: 'invalido', errores }
  const url = urlDelMail(d)
  abrir(url)
  return { estado: 'abierto-en-el-mail', url }
}
