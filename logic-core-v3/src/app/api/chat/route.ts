import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getContextualPrompt } from '@/modules/ai-companion/lib/constants'
import { detectIntent, getStrategicResponse } from '@/modules/ai-companion/lib/sales-strategy'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { messages, currentPath } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages requerido' }, { status: 400 })
    }

    // System prompt contextual según ruta
    let systemPrompt = getContextualPrompt(currentPath)

    // Detectar intent en último mensaje del usuario
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMessage) {
      const text =
        typeof lastUserMessage.content === 'string'
          ? lastUserMessage.content
          : ''
      const intent = detectIntent(text)
      const strategicResponse = getStrategicResponse(intent)

      if (strategicResponse && intent !== 'unknown') {
        systemPrompt += `\n\nINTENT DETECTADO: ${intent}\nRESPUESTA SUGERIDA (úsala como guía, no la copies textual): ${strategicResponse}`
      }
    }

    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content:
          typeof m.content === 'string'
            ? m.content
            : Array.isArray(m.content)
              ? m.content
                  .filter((p: { type?: string }) => p?.type === 'text')
                  .map((p: { text?: string }) => p.text || '')
                  .join('')
              : '',
      })),
      temperature: 0.75,
      maxTokens: 800,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
