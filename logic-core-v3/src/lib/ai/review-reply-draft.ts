import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateReviewReplyDraft(params: {
  businessName: string
  rating: number
  reviewerName: string
  reviewComment: string | null
}): Promise<string> {
  const systemPrompt = `Sos un asistente que genera respuestas profesionales a reseñas de Google Business Profile.

REGLAS:
- En español rioplatense (vos, tenés, te), tono cálido pero profesional.
- Máximo 2 oraciones, total ~140-180 caracteres.
- Si la reseña es 5 estrellas: agradecer con calidez.
- Si es 4 estrellas: agradecer e invitar a contar qué se puede mejorar.
- Si es 3 estrellas: reconocer el feedback, ofrecer contactar.
- Si es 1-2 estrellas: empatía, NO defensiva, ofrecer contactar para resolver.
- Siempre mencionar el nombre del reviewer al inicio.
- Cerrar con frase de marca personal del negocio.
- NO usar emojis. NO usar exclamaciones excesivas.
- NO prometer cosas que no podés cumplir.`

  const userPrompt = `Negocio: ${params.businessName}
Reseña de: ${params.reviewerName}
Rating: ${params.rating}/5
Comentario: ${params.reviewComment ?? '(sin texto, solo rating)'}

Generá la respuesta.`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 250,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Sin respuesta de Claude')
  }
  return textBlock.text.trim()
}
