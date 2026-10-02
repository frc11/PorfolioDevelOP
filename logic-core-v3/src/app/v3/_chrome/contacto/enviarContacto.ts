/**
 * EL ENVÍO DEL CONTACTO — una sola puerta. **[CONTACTO]**
 *
 * [RONDA 2] F1 · ENVÍA: valida y lo manda a `/api/contacto` (el servidor vuelve a validar con Zod y lo frena el límite
 * por IP); hoy el endpoint recibe y valida, y la conexión al servicio real es de la etapa siguiente. Sin `mailto` ni
 * WhatsApp. La validación es pura y vive acá, al lado.
 */

import { enviarAlServidor, type ResultadoDelEnvio as RespuestaDelServidor } from '../../_lib/formularios/enviar'
import { EMAIL, TELEFONO } from '../../_lib/formularios/validar'
import type { Interes } from './contenido'

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

export type ResultadoDelEnvio =
  | { readonly estado: 'invalido'; readonly errores: ErroresDeContacto }
  | { readonly estado: 'enviado' }
  | { readonly estado: 'error'; readonly mensaje: string }

/** LA puerta del envío: valida y lo manda al endpoint (el que envía se puede cambiar, para el invariante). Nunca dice «enviado» sin la respuesta. */
export async function enviarContacto(d: DatosDeContacto, enviar: (ruta: string, datos: Readonly<Record<string, unknown>>) => Promise<RespuestaDelServidor> = enviarAlServidor): Promise<ResultadoDelEnvio> {
  const errores = validarContacto(d)
  if (Object.keys(errores).length > 0) return { estado: 'invalido', errores }
  const r = await enviar('/api/contacto', { origen: 'panel', intereses: d.intereses, presupuesto: d.presupuesto.trim(), nombre: d.nombre.trim(), medio: d.medio.trim(), empresa: d.empresa.trim(), mensaje: d.mensaje.trim() })
  return r.ok ? { estado: 'enviado' } : { estado: 'error', mensaje: r.error }
}
