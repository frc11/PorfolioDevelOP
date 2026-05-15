import { getLLMProvider } from '../llm'
import { streamText } from 'ai'
import { chatbotDebug, chatbotError } from '../logging'

export interface SmokeTestResult {
  ok: boolean
  durationMs: number
  response?: string
  tokensIn?: number
  tokensOut?: number
  error?: string
}

/**
 * Performs a minimal end-to-end test: calls the LLM with a trivial prompt.
 * Confirms that the API key is valid and the model is reachable.
 */
export async function runLLMSmokeTest(): Promise<SmokeTestResult> {
  const start = Date.now()
  try {
    const provider = getLLMProvider()
    const model = provider.getModel('gemini-2.5-flash')

    chatbotDebug('smoke_test.start', { provider: provider.name })

    const result = streamText({
      model,
      prompt: 'Responder con una sola palabra: hola',
      temperature: 0,
    })

    let response = ''
    for await (const chunk of result.textStream) {
      response += chunk
    }
    const usage = await result.usage
    const durationMs = Date.now() - start

    chatbotDebug('smoke_test.complete', { durationMs, tokensOut: usage.outputTokens })

    return {
      ok: true,
      durationMs,
      response: response.trim(),
      tokensIn: usage.inputTokens ?? 0,
      tokensOut: usage.outputTokens ?? 0,
    }
  } catch (error) {
    chatbotError('smoke_test.failed', error)
    return {
      ok: false,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'unknown',
    }
  }
}
