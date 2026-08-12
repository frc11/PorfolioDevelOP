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

  // P5-A: el material del negocio. Mismo criterio que el resto del archivo —
  // lo que está vacío se OMITE; nunca se rellena ni se anuncia como faltante.
  const materiales = ficha.materiales

  const materialLinks = [
    materiales?.resenasUrl ? `Reseñas: ${materiales.resenasUrl}` : null,
    materiales?.imagenesUrl ? `Logo y fotos: ${materiales.imagenesUrl}` : null,
    materiales?.otraRedUrl ? `Otra red: ${materiales.otraRedUrl}` : null,
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
    seccion('DÓNDE ESTÁ EL MATERIAL', materialLinks || undefined),
    seccion('QUÉ VENDE Y A QUÉ PRECIO', materiales?.queVende),
    seccion('CÓMO HABLA EL NEGOCIO DE SÍ MISMO', materiales?.comoSePresenta),
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
  // P3#11: la cantidad real de slots, no un "tres" fijo que ya no describe la
  // oferta si el setter carga uno o dos.
  const cantidad = slots.length === 1 ? 'un horario' : `${slots.length} horarios`
  return [
    `Buenísimo! Te paso ${cantidad} para la reunión (hora Argentina):`,
    lineas.join('\n'),
    '¿Cuál te queda mejor? Si ninguno te sirve, decime y busco otro.',
  ].join('\n\n')
}

/**
 * B4 — El brief en un bloque pegable: el primer mensaje para Claude Design.
 *
 * B8A-II: incluye también los MATERIALES REALES del negocio (reseñas textuales
 * como prueba social, tono/contenido, y de dónde bajar el logo y las fotos).
 * El shell de construcción pide usarlos, pero antes vivían sólo en la ficha
 * (lejos del paso) y NO viajaban en este bloque — el setter quedaba pegando un
 * plano sin la materia prima. Ahora el bloque es auto-suficiente.
 *
 * P5-A: suma el material que la ficha empezó a juntar en M1 — dónde bajar el
 * logo y las fotos, dónde se leen las reseñas, qué vende y a qué precio, y cómo
 * habla el negocio de sí mismo. Sin esto los campos nuevos se cargaban y no
 * llegaban a la construcción. Degradación igual que siempre: lo vacío se OMITE,
 * nunca se rellena ni se anuncia como faltante.
 */
export function buildConstruccionBlock(
  lead: CopyBlockLead,
  brief: Brief,
  ficha: Ficha | null,
): string {
  // P5-A: el material que el setter junta en la ficha entra acá. La dirección
  // de las imágenes va PRIMERA porque es la respuesta directa al título de la
  // sección; los links del alta quedan como respaldo.
  const materiales = ficha?.materiales

  const assets = [
    materiales?.imagenesUrl ? `Logo y fotos: ${materiales.imagenesUrl}` : null,
    lead.instagramUrl ? `Instagram: ${lead.instagramUrl}` : null,
    lead.googleMapsUrl ? `Google Maps: ${lead.googleMapsUrl}` : null,
    lead.currentWebUrl ? `Web actual: ${lead.currentWebUrl}` : null,
    materiales?.otraRedUrl ? `Otra red: ${materiales.otraRedUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  // Las reseñas viajan con su dirección cuando la hay: el texto crudo es la
  // prueba social y el link permite ir a buscar más. Si falta cualquiera de los
  // dos, queda solo el otro; si faltan ambos, la sección no aparece.
  const resenasBloque = [
    ficha?.resenas ?? null,
    materiales?.resenasUrl ? `Se leen acá: ${materiales.resenasUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n\n')

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
    seccion('RESEÑAS REALES (usalas textuales como prueba social)', resenasBloque || undefined),
    seccion('CONTENIDO Y TONO REAL (logo / fotos / estilo)', ficha?.contenidoReal),
    // P5-A: qué vende y cómo habla el negocio — lo que evita que la demo salga
    // genérica. Antes no existían como campo en ningún punto del flujo.
    seccion('QUÉ VENDE Y A QUÉ PRECIO (usá estos datos reales, no inventes)', materiales?.queVende),
    seccion(
      'CÓMO HABLA EL NEGOCIO DE SÍ MISMO (escribí los textos en ESTA voz, no en una genérica)',
      materiales?.comoSePresenta,
    ),
    // A-21 (5.3): las señales operativas (horarios, delivery, turnos) son material
    // de demo — moldean la sección de horarios, la disponibilidad y el CTA. Antes
    // solo viajaban al Evaluador vía `buildFichaCopyBlock`; se re-sirven acá a Claude
    // Design tras verificar que NO hay evidencia (código ni bitácora) de que su
    // exclusividad al Evaluador fuera intencional — la propia ficha ya las lleva al
    // Gem de diseño/outreach vía `buildBriefInputBlock`, así que la ausencia acá era
    // estructural, no una decisión. (`otros` y `referenciasFicha` del mismo hallazgo
    // quedan fuera de este scope.)
    seccion(
      'SEÑALES OPERATIVAS (horarios, delivery, turnos — reflejalos en la demo)',
      ficha?.senalesOperativas,
    ),
    seccion('DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES', assets || undefined),
    seccion('BRIEF COMPLETO DEL GEM DE DISEÑO', brief.pegadoGem),
  ]

  return partes.filter(Boolean).join('\n\n')
}
