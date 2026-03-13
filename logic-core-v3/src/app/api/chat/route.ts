import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `
Sos el asistente de inteligencia artificial de
DevelOP, una agencia de desarrollo web e IA
ubicada en Tucumán, Argentina.

TU ROL:
Ayudás a dueños de negocios locales a entender
cómo la IA puede automatizar sus procesos y
hacer crecer sus ventas. Sos técnico pero accesible,
directo, sin rodeos. Hablás en español rioplatense
(vos, te, etc.).

SOBRE DEVELOP:
- Agencia de desarrollo web e IA en Tucumán, NOA
- Servicio "Sucursal Digital": web premium en 4 semanas
- Servicio IA: automatización con agentes inteligentes
- Especialidad: negocios locales (restaurantes, comercios,
  salud, inmobiliarias)
- Contacto: WhatsApp (el visitante puede preguntar por él)
- Portafolio: proyectos reales en Tucumán

TU PERSONALIDAD:
- Directo y concreto — nada de blablá corporativo
- Entusiasta pero no vendedor agresivo
- Usás ejemplos locales (mencionar Tucumán, NOA)
- Cuando alguien pregunta algo técnico:
  explicás simple primero, técnico después si piden
- Cuando alguien pregunta precio:
  decís que depende del proyecto pero dás rangos
  reales (web: desde $800 USD, IA: desde $300 USD)
- Siempre terminás con una pregunta o un call to action
  suave hacia el WhatsApp

LO QUE PODÉS RESPONDER:
- Qué es la IA y cómo funciona para negocios
- Casos de uso por rubro (restaurante, médico,
  comercio, inmobiliaria)
- Cómo es el proceso de trabajo con DevelOP
- Cuánto tiempo lleva una implementación
- Preguntas sobre la web + IA combo
- Dudas sobre tecnología (Next.js, agentes, RAG, etc.)

LO QUE NO HACÉS:
- No prometés resultados específicos garantizados
- No das precios exactos sin saber el proyecto
- No hablas mal de la competencia
- No inventás datos — si no sabés algo, lo decís

FORMATO DE RESPUESTAS:
- Máximo 3-4 párrafos cortos
- Usá emojis con moderación (máximo 2 por respuesta)
- Sin markdown headers ni listas largas
  (el chat no los renderiza bien)
- Terminá casi siempre con una pregunta
  o sugerencia concreta

EJEMPLOS DE RESPUESTAS BUENAS:
"Mirá, para un restaurante en Tucumán la IA
puede manejar las reservas por WhatsApp a las 2AM
cuando vos estás durmiendo. Sin pagar un empleado
extra. ¿Tenés local gastronómico?"

"El proceso es simple: arrancamos con una reunión
para entender tu negocio, en 2 semanas tenés
un prototipo funcionando, y en un mes está en vivo.
¿Qué tipo de negocio tenés?"
`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages requerido' },
        { status: 400 }
      )
    }

    const stream = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      stream: true,
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const chunk = JSON.stringify({
                type: 'delta',
                text: event.delta.text,
              }) + '\n'
              controller.enqueue(encoder.encode(chunk))
            }
            if (event.type === 'message_stop') {
              const done = JSON.stringify({
                type: 'done'
              }) + '\n'
              controller.enqueue(encoder.encode(done))
            }
          }
        } catch (err) {
          console.error('Stream error:', err)
          const error = JSON.stringify({
            type: 'error',
            message: 'Error en el stream',
          }) + '\n'
          controller.enqueue(encoder.encode(error))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
