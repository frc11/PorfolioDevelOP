/**
 * EL FORMULARIO DE CONTACTO — el copy, las opciones y la precarga. **[CONTACTO]**
 *
 * PROPUESTA del planificador, adaptada del de nk: voseo, frases cortas y sin genéricos.
 * El mail y WhatsApp salen del archivo de contacto del pie, que es la única fuente.
 */

import { HREF_DEL_MAIL, MAIL, WHATSAPP } from '../../_secciones/cierre/contacto'

export const TITULO = 'Armemos algo juntos.'

/** La bajada, en tres tramos: el mail y WhatsApp van como enlaces reales. */
export const BAJADA = {
  antes: 'Completá el formulario o escribinos a ',
  mail: { rotulo: MAIL, href: HREF_DEL_MAIL },
  medio: ' o por ',
  whatsapp: { rotulo: 'WhatsApp', href: WHATSAPP.href },
  despues: '. Lo que te quede más cómodo.',
} as const

/** Lo que se puede pedir. `id` es estructura; `rotulo` es copy. */
export const INTERESES = [
  { id: 'web', rotulo: 'Una página web' },
  { id: 'tienda', rotulo: 'Una tienda online' },
  { id: 'rediseno', rotulo: 'Un rediseño' },
  { id: 'software', rotulo: 'Software a medida' },
  { id: 'chatbot', rotulo: 'Un chatbot con IA' },
  { id: 'automatizaciones', rotulo: 'Automatizaciones' },
  { id: 'no-se', rotulo: 'Todavía no sé, lo vemos juntos' },
] as const

export type Interes = (typeof INTERESES)[number]['id']

export const PREGUNTAS = {
  intereses: '¿Qué querés hacer?',
  presupuesto: '¿Tenés un presupuesto?',
  persona: '¿Con quién hablamos?',
} as const

/** Los campos: el rótulo que va adentro de la píldora y su ejemplo. */
export const CAMPOS = {
  presupuesto: { rotulo: 'Presupuesto', ejemplo: 'Un número, un rango o «todavía no sé»' },
  nombre: { rotulo: 'Nombre', ejemplo: 'ej.: Ana Pérez' },
  medio: { rotulo: 'Email o WhatsApp', ejemplo: 'ej.: ana@tuempresa.com' },
  empresa: { rotulo: 'Empresa (opcional)', ejemplo: 'ej.: Tu Empresa' },
  mensaje: { rotulo: '¿Qué tenés en mente?', ejemplo: 'ej.: Que la gente nos encuentre y nos escriba' },
} as const

export const PIE = 'Todo es obligatorio salvo la empresa. Si es vago, está perfecto.'

/** Mientras no haya backend el envío abre WhatsApp: el rótulo lo dice. Cambia junto con `enviarContacto`. */
export const ROTULO_DEL_ENVIO = 'Enviar por WhatsApp'

/** Lo que se dice después de enviar. Nunca un «¡Enviado!»: el mensaje todavía no salió. */
export const DESPUES_DEL_ENVIO = {
  texto: 'Te abrimos WhatsApp con el mensaje armado: sólo falta que lo mandes desde ahí.',
  reintento: 'Si no se abrió, abrilo acá',
} as const

export const ROTULO_DE_CERRAR = 'Cerrar el formulario de contacto'

/** Lo que cada «Quiero mi…» de Servicios deja marcado al abrir. */
export const PRECARGA_POR_SERVICIO: Readonly<Record<string, readonly Interes[]>> = {
  web: ['web'],
  software: ['software'],
  'ia-automatizacion': ['chatbot', 'automatizaciones'],
}
