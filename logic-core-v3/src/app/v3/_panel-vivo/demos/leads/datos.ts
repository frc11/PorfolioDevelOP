import type { ChatbotLead, ChatbotLeadIntent, ChatbotLeadStatus, LeadCategory } from '@prisma/client'

import type { LeadWithScore } from '@/modules/chatbot/components/dashboard/ClientLeadsTable'

import { CONVERSACIONES_ANTERIORES, CONVERSACION_EN_VIVO, type MensajeDeEjemplo } from '../chatbot/datos'

/**
 * [NOCTURNO] B · LOS LEADS DE EJEMPLO — los contactos que dejó el chatbot del negocio de ejemplo, con el tipo REAL del
 * panel (`LeadWithScore`: el `ChatbotLead` de Prisma, sólo como tipo, más su puntaje y su clase), para que la columna
 * importada (`LeadPipelineColumn`) los reciba como recibe los de verdad. Nombres de ejemplo, mails de `ejemplo.com`,
 * teléfonos con el 5555 de las películas. Los que llegan en vivo, en orden; Lucía es la de la conversación de la demo
 * del chatbot.
 */
export interface SenalDelLead {
  readonly key: string
  readonly label: string
  readonly points: number
  readonly kind: 'positive' | 'combo' | 'penalty' | 'dq'
}

export interface LeadDeEjemplo {
  readonly lead: LeadWithScore
  /** Lo que charló con el chatbot (el detalle lo muestra). */
  readonly charla: readonly MensajeDeEjemplo[]
  readonly origen: string
  readonly campana: string | null
  readonly estabaViendo: string
}

interface Datos {
  readonly id: string
  readonly nombre: string
  readonly email: string | null
  readonly telefono: string | null
  readonly intencion: ChatbotLeadIntent
  readonly clase: 'hot' | 'warm' | 'cold' | 'dq'
  readonly puntaje: number | null
  readonly haceMin: number
  readonly estado?: ChatbotLeadStatus
  readonly categoria?: LeadCategory
  readonly senales: readonly SenalDelLead[]
  readonly charla: readonly MensajeDeEjemplo[]
  readonly origen: string
  readonly campana?: string
  readonly estabaViendo: string
}

function armar(d: Datos, ahora: number): LeadDeEjemplo {
  const cuando = new Date(ahora - d.haceMin * 60_000)
  const lead: ChatbotLead = {
    id: d.id,
    botConfigId: 'bot-de-ejemplo',
    conversationId: null,
    name: d.nombre,
    email: d.email,
    phone: d.telefono,
    intent: d.intencion,
    message: null,
    category: d.categoria ?? 'sales',
    requestedAppointment: d.intencion === 'SCHEDULE_VISIT',
    mentionedFinancing: false,
    mentionedTradeIn: false,
    askedSpecificModel: false,
    providedPhone: d.telefono !== null,
    providedEmail: d.email !== null,
    channel: 'widget',
    signals: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: d.campana ?? null,
    firstContactedAt: cuando,
    score: d.puntaje,
    classification: d.clase,
    scoreSignals: null,
    notificationSent: true,
    notificationSentAt: cuando,
    status: d.estado ?? 'NEW',
    internalNotes: null,
    lastStatusChangeAt: null,
    convertedToOsLeadId: null,
    capturedAt: cuando,
    updatedAt: cuando,
  }
  return {
    lead: { ...lead, effectiveScore: d.puntaje, effectiveClassification: d.clase, decayTierLabel: null, scoreExplanation: [...d.senales] },
    charla: d.charla,
    origen: d.origen,
    campana: d.campana ?? null,
    estabaViendo: d.estabaViendo,
  }
}

const charlaDe = (id: string): readonly MensajeDeEjemplo[] => CONVERSACIONES_ANTERIORES.find((c) => c.id === id)?.mensajes ?? []

const S = {
  telefono: { key: 'phone', label: 'Dejó su teléfono', points: 15, kind: 'positive' },
  mail: { key: 'email', label: 'Dejó su mail', points: 10, kind: 'positive' },
  compra: { key: 'purchase', label: 'Dijo que quiere comprar', points: 30, kind: 'positive' },
  cotizacion: { key: 'quote', label: 'Pidió una cotización', points: 25, kind: 'positive' },
  visita: { key: 'visit', label: 'Quiere agendar una visita', points: 20, kind: 'positive' },
  persona: { key: 'human', label: 'Pidió hablar con una persona', points: 15, kind: 'positive' },
  combo: { key: 'combo', label: 'Contacto completo y apuro por comprar', points: 10, kind: 'combo' },
  vaga: { key: 'vague', label: 'Consulta general, sin apuro', points: -5, kind: 'penalty' },
} as const satisfies Record<string, SenalDelLead>

/** Los que ya estaban en el panel. */
const ANTES: readonly Datos[] = [
  { id: 'lead-martin', nombre: 'Martín Prueba', email: 'martin@ejemplo.com', telefono: '+54 9 11 5555-0101', intencion: 'QUOTE_REQUEST', clase: 'hot', puntaje: 88, haceMin: 38, senales: [S.cotizacion, S.mail, S.telefono], charla: charlaDe('presupuesto'), origen: 'Tu sitio · chatbot', campana: 'Eventos de fin de año', estabaViendo: '/eventos' },
  { id: 'lead-carla', nombre: 'Carla Demo', email: null, telefono: '+54 9 11 5555-0102', intencion: 'HUMAN_REQUEST', clase: 'warm', puntaje: 62, haceMin: 240, estado: 'CONTACTED', senales: [S.persona, S.telefono], charla: charlaDe('cambio'), origen: 'Tu sitio · chatbot', estabaViendo: '/mi-pedido' },
  { id: 'lead-diego', nombre: 'Diego Ejemplo', email: 'diego@ejemplo.com', telefono: null, intencion: 'INFO', clase: 'cold', puntaje: 24, haceMin: 2 * 24 * 60, senales: [S.mail, S.vaga], charla: charlaDe('pagos'), origen: 'Google · búsqueda', estabaViendo: '/' },
  { id: 'lead-paula', nombre: 'Paula Prueba', email: 'paula@ejemplo.com', telefono: null, intencion: 'OTHER', clase: 'cold', puntaje: 18, haceMin: 9 * 24 * 60, estado: 'LOST', senales: [S.mail, S.vaga], charla: charlaDe('stock'), origen: 'Instagram', estabaViendo: '/productos' },
]

/** Los que llegan en vivo, en este orden (uno por paso). */
const LLEGAN: readonly Datos[] = [
  { id: 'lead-lucia', nombre: 'Lucía Ejemplo', email: 'lucia@ejemplo.com', telefono: null, intencion: 'PURCHASE_READY', clase: 'hot', puntaje: 93, haceMin: 0, senales: [S.compra, S.mail, S.combo], charla: CONVERSACION_EN_VIVO.mensajes, origen: 'Tu sitio · chatbot', estabaViendo: '/envios' },
  { id: 'lead-sofia', nombre: 'Sofía Demo', email: 'sofia@ejemplo.com', telefono: '+54 9 11 5555-0103', intencion: 'SCHEDULE_VISIT', clase: 'warm', puntaje: 67, haceMin: 0, senales: [S.visita, S.telefono], charla: [{ rol: 'USER', texto: '¿Puedo pasar a ver los productos el sábado?' }, { rol: 'ASSISTANT', texto: '¡Sí! El sábado atendemos. ¿Me dejás un teléfono y te confirmamos el horario?' }, { rol: 'USER', texto: 'Sí, es el 11 5555-0103.' }], origen: 'Tu sitio · chatbot', estabaViendo: '/local' },
  { id: 'lead-tomas', nombre: 'Tomás Prueba', email: 'tomas@ejemplo.com', telefono: null, intencion: 'INFO', clase: 'cold', puntaje: 31, haceMin: 0, senales: [S.mail], charla: [{ rol: 'USER', texto: '¿Hacen envíos fuera de la zona?' }, { rol: 'ASSISTANT', texto: 'Por ahora sólo dentro de la zona. Si querés, te avisamos cuando lleguemos a la tuya: ¿me dejás un mail?' }, { rol: 'USER', texto: 'tomas@ejemplo.com' }], origen: 'Facebook', estabaViendo: '/envios' },
  { id: 'lead-valeria', nombre: 'Valeria Ejemplo', email: 'valeria@ejemplo.com', telefono: '+54 9 11 5555-0104', intencion: 'QUOTE_REQUEST', clase: 'hot', puntaje: 90, haceMin: 0, senales: [S.cotizacion, S.telefono, S.mail], charla: [{ rol: 'USER', texto: 'Necesito una cotización para la oficina, son varios pedidos cada mes.' }, { rol: 'ASSISTANT', texto: '¡Genial! Te armamos una propuesta para empresas. ¿Me dejás tu teléfono y tu mail?' }, { rol: 'USER', texto: '11 5555-0104 y valeria@ejemplo.com' }], origen: 'Tu sitio · chatbot', campana: 'Empresas', estabaViendo: '/empresas' },
]

/** El descartado (la vista «Descartados»): no es una consulta comercial. */
const DESCARTADO: Datos = { id: 'lead-proveedor', nombre: 'Proveedor de ejemplo', email: 'ventas@ejemplo.com', telefono: null, intencion: 'OTHER', clase: 'dq', puntaje: null, haceMin: 300, categoria: 'provider', senales: [{ key: 'dq', label: 'Ofrece sus productos: es un proveedor, no un cliente', points: 0, kind: 'dq' }], charla: [{ rol: 'USER', texto: 'Hola, somos distribuidores y queremos ofrecerles nuestros productos.' }, { rol: 'ASSISTANT', texto: 'Gracias por escribir. Te dejo el mail del equipo para propuestas comerciales.' }], origen: 'Tu sitio · chatbot', estabaViendo: '/' }

export function leadsDeEjemplo(ahora: number): { readonly antes: readonly LeadDeEjemplo[]; readonly llegan: readonly LeadDeEjemplo[]; readonly descartado: LeadDeEjemplo } {
  return { antes: ANTES.map((d) => armar(d, ahora)), llegan: LLEGAN.map((d) => armar(d, ahora)), descartado: armar(DESCARTADO, ahora) }
}

/** Cada cuánto llega un lead (ms) y cuánto dura el chip «Nuevo» (el del sistema: 6 s). */
export const RITMO_DE_LOS_LEADS = { llegaMs: 2600, nuevoMs: 6000 } as const
