/**
 * [NOCTURNO] B · LOS TICKETS DE EJEMPLO — pedidos de cambios del negocio de ejemplo a develOP, con la forma de
 * `TicketListItem` (`components/dashboard/SoporteBoard.tsx`) y sus mensajes (los del detalle). Lo que se mueve solo:
 * el equipo toma un ticket abierto y resuelve uno en curso (el ciclo de un ticket). Sin cifras de develOP (el tiempo de
 * respuesta real del panel no va en la landing).
 */
export type EstadoDelTicket = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
export type PrioridadDelTicket = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type CategoriaDelTicket = 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'

export interface MensajeDelTicket {
  readonly deDevelop: boolean
  readonly texto: string
  readonly haceMin: number
}

export interface TicketDeEjemplo {
  readonly id: string
  readonly title: string
  readonly status: EstadoDelTicket
  readonly priority: PrioridadDelTicket
  readonly category: CategoriaDelTicket
  readonly haceMin: number
  readonly mensajes: readonly MensajeDelTicket[]
}

export const TICKETS_DE_EJEMPLO: readonly TicketDeEjemplo[] = [
  {
    id: 'tk-horario',
    title: 'Cambiar el horario de atención en la página de contacto',
    status: 'OPEN',
    priority: 'MEDIUM',
    category: 'FEATURE_REQUEST',
    haceMin: 25,
    mensajes: [{ deDevelop: false, texto: 'Ahora abrimos también los sábados a la mañana. ¿Lo pueden cambiar en la web?', haceMin: 25 }],
  },
  {
    id: 'tk-foto',
    title: 'Sumar las fotos nuevas del local a la galería',
    status: 'OPEN',
    priority: 'LOW',
    category: 'FEATURE_REQUEST',
    haceMin: 180,
    mensajes: [{ deDevelop: false, texto: 'Les mandé las fotos por mail. Si pueden, que la del frente vaya primera.', haceMin: 180 }],
  },
  {
    id: 'tk-formulario',
    title: 'El formulario de contacto no me llega al mail',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    category: 'TECHNICAL',
    haceMin: 300,
    mensajes: [
      { deDevelop: false, texto: 'Desde ayer no me llegan las consultas del formulario.', haceMin: 300 },
      { deDevelop: true, texto: 'Lo estamos revisando. Mientras, las consultas quedan guardadas en tu panel.', haceMin: 280 },
    ],
  },
  {
    id: 'tk-portada',
    title: 'Actualizar el texto de la portada',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    category: 'FEATURE_REQUEST',
    haceMin: 3 * 24 * 60,
    mensajes: [
      { deDevelop: false, texto: 'Queremos que la portada diga que ahora hacemos envíos.', haceMin: 3 * 24 * 60 },
      { deDevelop: true, texto: '¡Listo! Ya está publicado. Mirala y contanos.', haceMin: 3 * 24 * 60 - 90 },
    ],
  },
  {
    id: 'tk-whatsapp',
    title: 'Agregar el botón de WhatsApp en el celular',
    status: 'RESOLVED',
    priority: 'LOW',
    category: 'TECHNICAL',
    haceMin: 8 * 24 * 60,
    mensajes: [
      { deDevelop: false, texto: 'En el celular no se ve el botón de WhatsApp.', haceMin: 8 * 24 * 60 },
      { deDevelop: true, texto: 'Resuelto: ahora aparece abajo a la derecha en todas las pantallas.', haceMin: 8 * 24 * 60 - 120 },
    ],
  },
]

/** Lo que se mueve solo, un cambio por paso: el equipo toma la foto y resuelve el formulario. */
export const CICLO_DE_EJEMPLO: readonly { readonly id: string; readonly pasaA: EstadoDelTicket; readonly respuesta: string }[] = [
  { id: 'tk-foto', pasaA: 'IN_PROGRESS', respuesta: 'Ya las estamos subiendo; la del frente va primera.' },
  { id: 'tk-formulario', pasaA: 'RESOLVED', respuesta: 'Resuelto: era el filtro de spam de tu correo. Ya te llegan.' },
]

export const RITMO_DE_LOS_TICKETS = { pasoMs: 3200 } as const
