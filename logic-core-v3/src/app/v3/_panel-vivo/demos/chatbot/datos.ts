/**
 * [NOCTURNO] B · LOS DATOS DE EJEMPLO DEL CHATBOT — un negocio de ejemplo («Tu negocio») con su asistente, sus
 * conversaciones y sus leads. Todo inventado y dicho como tal: los nombres llevan «Ejemplo», «Prueba» o «Demo», los mails
 * son de `ejemplo.com`, y no hay un solo precio (`_secciones/_contrato/inventado.ts`). Las horas son relativas a cuando
 * se mira (minutos antes de ahora).
 */

export type Rol = 'USER' | 'ASSISTANT'

export interface MensajeDeEjemplo {
  readonly rol: Rol
  readonly texto: string
}

export interface ConversacionDeEjemplo {
  readonly id: string
  /** Hace cuántos minutos fue su último mensaje. */
  readonly haceMin: number
  readonly ruta: string
  readonly tokens: readonly [number, number]
  readonly lead: { readonly nombre: string; readonly intencion: string } | null
  readonly mensajes: readonly MensajeDeEjemplo[]
}

/** El asistente del negocio de ejemplo (el título del encabezado del chatbot). */
export const NOMBRE_DEL_ASISTENTE = 'Asistente de Tu negocio'

/**
 * LA CONVERSACIÓN EN VIVO — la de arriba de todo, abierta: se despliega sola, mensaje a mensaje (con el «escribiendo…»
 * del asistente antes de cada respuesta), y termina dejando un lead.
 */
export const CONVERSACION_EN_VIVO: ConversacionDeEjemplo = {
  id: 'en-vivo',
  haceMin: 0,
  ruta: '/envios',
  tokens: [412, 538],
  lead: { nombre: 'Lucía Ejemplo', intencion: 'PURCHASE_READY' },
  mensajes: [
    { rol: 'USER', texto: 'Hola, ¿hacen envíos a domicilio?' },
    { rol: 'ASSISTANT', texto: '¡Hola! Sí, hacemos envíos en el día dentro de la zona. ¿Me decís tu barrio y te confirmo?' },
    { rol: 'USER', texto: 'Estoy en el centro. ¿Hasta qué hora toman pedidos?' },
    { rol: 'ASSISTANT', texto: 'Tomamos pedidos hasta las 18 h y llegan esa misma tarde. ¿Querés que te ayude a armarlo?' },
    { rol: 'USER', texto: 'Sí, dale. Me llamo Lucía.' },
    { rol: 'ASSISTANT', texto: '¡Genial, Lucía! Dejame tu mail o tu WhatsApp y una persona del equipo te escribe en un rato para cerrarlo.' },
    { rol: 'USER', texto: 'lucia@ejemplo.com' },
    { rol: 'ASSISTANT', texto: 'Listo, ya le pasé tu consulta al equipo. ¡Gracias por escribirnos!' },
  ],
}

/** Las de antes (se abren con su flecha y muestran su conversación entera). */
export const CONVERSACIONES_ANTERIORES: readonly ConversacionDeEjemplo[] = [
  {
    id: 'presupuesto',
    haceMin: 38,
    ruta: '/eventos',
    tokens: [655, 801],
    lead: { nombre: 'Martín Prueba', intencion: 'QUOTE_REQUEST' },
    mensajes: [
      { rol: 'USER', texto: 'Quisiera un presupuesto para un evento de la empresa.' },
      { rol: 'ASSISTANT', texto: '¡Con gusto! ¿Para cuántas personas y qué día sería?' },
      { rol: 'USER', texto: 'Unas cuarenta personas, el mes que viene.' },
      { rol: 'ASSISTANT', texto: 'Perfecto. Te armamos una propuesta a medida: ¿me dejás un mail para mandártela?' },
      { rol: 'USER', texto: 'martin@ejemplo.com' },
      { rol: 'ASSISTANT', texto: 'Anotado, Martín. El equipo te escribe hoy con la propuesta.' },
    ],
  },
  {
    id: 'stock',
    haceMin: 95,
    ruta: '/productos',
    tokens: [208, 264],
    lead: null,
    mensajes: [
      { rol: 'USER', texto: '¿Tienen el modelo grande en color negro?' },
      { rol: 'ASSISTANT', texto: 'Sí, lo tenemos en negro y en blanco. ¿Querés que te avise el equipo cuando ingrese más?' },
      { rol: 'USER', texto: 'No, gracias, paso por el local.' },
    ],
  },
  {
    id: 'cambio',
    haceMin: 240,
    ruta: '/mi-pedido',
    tokens: [377, 452],
    lead: { nombre: 'Carla Demo', intencion: 'HUMAN_REQUEST' },
    mensajes: [
      { rol: 'USER', texto: 'Hice un pedido ayer y necesito cambiar la dirección.' },
      { rol: 'ASSISTANT', texto: 'Te ayudo. Para cambiar un pedido te conviene hablar con alguien del equipo: ¿me dejás tu nombre y un teléfono?' },
      { rol: 'USER', texto: 'Carla, mi WhatsApp es el del pedido.' },
      { rol: 'ASSISTANT', texto: 'Gracias, Carla. Ya avisé al equipo y te escriben por WhatsApp.' },
    ],
  },
  {
    id: 'pagos',
    haceMin: 1380,
    ruta: '/',
    tokens: [152, 190],
    lead: null,
    mensajes: [
      { rol: 'USER', texto: '¿Aceptan transferencia?' },
      { rol: 'ASSISTANT', texto: 'Sí: transferencia, tarjeta y efectivo en el local. ¿Te ayudo con algo más?' },
    ],
  },
]

/** «Probalo»: lo que el visitante le puede preguntar al chatbot, y lo que responde (de ejemplo). */
export const PREGUNTAS_SUGERIDAS: readonly { readonly pregunta: string; readonly respuesta: string }[] = [
  { pregunta: '¿Qué horarios tienen?', respuesta: 'Atendemos de lunes a sábado. Si escribís fuera de horario te respondo igual, y el equipo te contacta apenas abre.' },
  { pregunta: '¿Cómo hago un pedido?', respuesta: 'Podés pedirme acá mismo: contame qué necesitás y te paso las opciones. Si preferís, te escribe una persona del equipo.' },
  { pregunta: '¿Tienen local para ir a ver?', respuesta: 'Sí, tenemos local a la calle. Si me dejás tu WhatsApp te mando la ubicación y los horarios.' },
  { pregunta: 'Quiero hablar con una persona', respuesta: '¡Claro! Dejame tu nombre y tu WhatsApp y alguien del equipo te escribe en el día.' },
]

/** Cada cuánto llega un mensaje de la conversación en vivo (ms) y cuánto «escribe» el asistente antes de responder. */
export const RITMO_DEL_CHAT = { mensajeMs: 2200, escribiendoMs: 1100 } as const
