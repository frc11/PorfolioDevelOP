/**
 * LeadOS B3/B4 — Armado de los bloques de texto copiables que el setter pega
 * en las herramientas externas (Evaluador, Gem de diseño, Claude Design).
 * Puro string-building, sin dependencias: legible por humanos e IA. Las
 * herramientas viven AFUERA del panel; acá solo se arma el input.
 */
import type { Brief, Evaluacion, Ficha } from '@/lib/leados/contracts'
import { formatFechaHora } from '@/lib/leados/flow'

export type CopyBlockLead = {
  businessName: string
  industry: string | null
  zone: string | null
  instagramUrl: string | null
  currentWebUrl: string | null
  googleMapsUrl: string | null
}

const IG_MANEJADO_LABELS: Record<string, string> = {
  DUENO: 'el dueño',
  CM: 'un community manager',
  NO_SABE: 'no se pudo determinar',
}

function seccion(titulo: string, contenido: string | undefined | null): string | null {
  const texto = contenido?.trim()
  if (!texto) return null
  return `${titulo}\n${texto}`
}

/** Bloque limpio de la ficha para pegar en el Evaluador externo. */
export function buildFichaCopyBlock(lead: CopyBlockLead, ficha: Ficha): string {
  const meta = [
    lead.industry ? `Rubro: ${lead.industry}` : null,
    lead.zone ? `Zona: ${lead.zone}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const links = [
    lead.instagramUrl ? `Instagram: ${lead.instagramUrl}` : null,
    lead.currentWebUrl ? `Web actual: ${lead.currentWebUrl}` : null,
    lead.googleMapsUrl ? `Google Maps: ${lead.googleMapsUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const identidad = [
    ficha.identidad?.igManejadoPor
      ? `Quién maneja el Instagram: ${IG_MANEJADO_LABELS[ficha.identidad.igManejadoPor]}`
      : null,
    ficha.identidad?.notas ?? null,
  ]
    .filter(Boolean)
    .join('\n')

  const partes = [
    `FICHA DE OBSERVACIÓN — ${lead.businessName}`,
    meta || null,
    links || null,
    seccion('IDENTIDAD', identidad),
    seccion('PRESENCIA DIGITAL', ficha.presenciaDigital),
    seccion('RESEÑAS (copiadas tal cual)', ficha.resenas),
    seccion('CONTENIDO REAL (logo / fotos / tono)', ficha.contenidoReal),
    seccion('SEÑALES OPERATIVAS', ficha.senalesOperativas),
    seccion('OTRAS OBSERVACIONES', ficha.otros),
  ]

  return partes.filter(Boolean).join('\n\n')
}

/** Ficha + evaluación en un bloque: el input del Gem de diseño. */
export function buildBriefInputBlock(
  lead: CopyBlockLead,
  ficha: Ficha,
  evaluacion: Evaluacion,
): string {
  const evaluacionBlock = [
    'EVALUACIÓN',
    `Score: ${evaluacion.score}/5 — Veredicto: ${evaluacion.veredicto}`,
    evaluacion.razonamiento,
  ].join('\n')

  return [buildFichaCopyBlock(lead, ficha), evaluacionBlock].join('\n\n')
}

/**
 * B6 — Input del Gem de outreach para el opener: el mismo paquete
 * ficha+evaluación del Gem de diseño, con el pedido dolor-first arriba.
 * El criterio del copy vive en Fundamentos (externo); acá solo se arma
 * el input, igual que B3 arma el del Evaluador.
 */
export function buildOpenerInputBlock(
  lead: CopyBlockLead,
  ficha: Ficha,
  evaluacion: Evaluacion,
): string {
  return [
    `INPUT PARA EL GEM DE OUTREACH — opener para ${lead.businessName}`,
    'Pedido: redactá un primer DM de Instagram dolor-first. Corto, humano, que nombre algo real del negocio. SIN link, SIN precio, SIN vender — el objetivo es que respondan.',
    buildBriefInputBlock(lead, ficha, evaluacion),
  ].join('\n\n')
}

/**
 * B6 — Input del Gem de outreach para asistir objeciones: deflect-a-reunión
 * (el setter nunca cotiza ni negocia — el criterio vive en Fundamentos).
 */
export function buildObjecionInputBlock(lead: CopyBlockLead): string {
  return [
    `INPUT PARA EL GEM DE OUTREACH — objeción de ${lead.businessName}`,
    'Pedido: el negocio preguntó por precio/condiciones u objetó. Redactá una respuesta corta que NO cotice ni negocie nada: redirigí a coordinar una reunión con el equipo.',
    'OBJECIÓN RECIBIDA (pegala acá abajo antes de enviar):\n>>>',
  ].join('\n\n')
}

/**
 * B6 — Segundo mensaje del flujo invertido: la demo aprobada con su link
 * permanente. Base editable por el setter al pegarla — el link va acá y
 * SOLO acá, nunca en el opener.
 */
export function buildDemoMensajeBlock(lead: CopyBlockLead, finalUrl: string): string {
  return [
    `Te armé algo para que veas en 30 segundos cómo podría verse ${lead.businessName} online — sin compromiso, decime qué te parece:`,
    finalUrl,
  ].join('\n\n')
}

/**
 * B7 — Los 3 horarios reales para pasarle al prospecto, en huso de Buenos
 * Aires. Base editable: el setter la adapta a la conversación.
 */
export function buildHorariosMensajeBlock(slots: string[]): string {
  const lineas = slots.map((slot, i) => `${i + 1}. ${formatFechaHora(slot)}`)
  return [
    'Buenísimo! Te paso tres horarios para la reunión (hora Argentina):',
    lineas.join('\n'),
    '¿Cuál te queda mejor? Si ninguno te sirve, decime y busco otro.',
  ].join('\n\n')
}

/** B4 — El brief en un bloque pegable: el primer mensaje para Claude Design. */
export function buildConstruccionBlock(lead: CopyBlockLead, brief: Brief): string {
  const partes = [
    `BRIEF DE DEMO — ${lead.businessName}`,
    [
      lead.industry ? `Rubro: ${lead.industry}` : null,
      lead.zone ? `Zona: ${lead.zone}` : null,
    ]
      .filter(Boolean)
      .join(' · ') || null,
    seccion('CONCEPTO', brief.concepto),
    brief.secciones.length > 0
      ? `SECCIONES (en este orden)\n${brief.secciones.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : null,
    seccion('LLAMADO A LA ACCIÓN', brief.cta),
    seccion('NOTAS DE MARCA', brief.notasMarca),
    seccion('BRIEF COMPLETO DEL GEM DE DISEÑO', brief.pegadoGem),
  ]

  return partes.filter(Boolean).join('\n\n')
}
