import { NUMERO_DE_WHATSAPP } from '../../_secciones/cierre/contacto'

/**
 * [B10] EL FAQ DESPUÉS DEL PIE — sus datos: cada página pasa las suyas (6 por página; el home, `_secciones/cierre/faq.ts`; la página
 * base, `pagina-base/faq.ts`). El texto va en el HTML (las preguntas y TODAS las respuestas, aunque en escritorio se vea una por vez) y en
 * los datos estructurados de FAQ (`FAQPage`, schema.org): lo que el buscador lee es lo mismo que la persona.
 */
export interface PreguntaFrecuente {
  readonly pregunta: string
  readonly respuesta: string
}

/** Cuántas entran en el bloque de la izquierda (lo pidió Valentino: «hasta 6 preguntas»). */
export const MAXIMO_DE_PREGUNTAS = 6

/** Los textos del FAQ (de B10, como los pidió Valentino). */
export const TEXTOS_DEL_FAQ = {
  titulo: 'Preguntas frecuentes',
  /** El aviso del bloque de la derecha, antes de la primera pregunta. */
  aviso: 'Tocá una pregunta y mirá lo que pasa.',
  /** El bloque chico que sube con la primera respuesta. */
  dudas: '¿Te quedaron dudas? Escribinos',
} as const

/** WhatsApp con el número del repo (el del pie: `contacto.ts`) y un mensaje que dice de dónde viene. */
const MENSAJE_DESDE_EL_FAQ = 'Hola develOP, leí las preguntas frecuentes y me quedó una duda.'
export const WHATSAPP_DEL_FAQ = `https://wa.me/${NUMERO_DE_WHATSAPP}?text=${encodeURIComponent(MENSAJE_DESDE_EL_FAQ)}`

/** Las que se muestran: a lo sumo `MAXIMO_DE_PREGUNTAS`, sin vacías. */
export function preguntasDelFaq(preguntas: readonly PreguntaFrecuente[]): readonly PreguntaFrecuente[] {
  return preguntas.filter((p) => p.pregunta.trim() !== '' && p.respuesta.trim() !== '').slice(0, MAXIMO_DE_PREGUNTAS)
}

/** Los datos estructurados de FAQ (schema.org `FAQPage`) de esas preguntas. */
export function datosEstructuradosDelFaq(preguntas: readonly PreguntaFrecuente[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntasDelFaq(preguntas).map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
    })),
  }
}

/**
 * El JSON para un `<script type="application/ld+json">`, sin poder cerrarlo: `<` va escapado (un `</script>` en un texto no corta el
 * bloque) y también los separadores de renglón de Unicode, que algunos analizadores no aceptan sueltos.
 */
export function jsonParaElScript(datos: Record<string, unknown>): string {
  let json = JSON.stringify(datos).replace(/</g, '\\u003c')
  // Los separadores se arman por su código (escritos a mano llegan como un salto de renglón de verdad y cortan la expresión).
  for (const codigo of [0x2028, 0x2029]) json = json.split(String.fromCharCode(codigo)).join(`\\u${codigo.toString(16)}`)
  return json
}

/** Los ids del FAQ (una sola instancia por página). */
export const IDS_DEL_FAQ = {
  titulo: 'faq-del-pie-titulo',
  pregunta: (i: number): string => `faq-del-pie-pregunta-${String(i)}`,
  respuesta: (i: number): string => `faq-del-pie-respuesta-${String(i)}`,
} as const
