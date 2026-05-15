import { config } from 'dotenv'
config({ path: '.env.local' })

import { getLLMProvider, resetProviderCache } from '../src/modules/chatbot/index.server'
import { streamText } from 'ai'

resetProviderCache()

async function test() {
  const provider = getLLMProvider('google')
  const model = provider.getModel('gemini-2.5-flash')
  try {
    const result = streamText({ model, prompt: 'Respondé: Conexión Service Account Exitosa.' })
    let text = ''
    for await (const chunk of result.textStream) text += chunk
    console.log('✓ Vertex funciona:', text)
  } catch (e: any) {
    console.log('✗ Vertex falla:', e.message)
  }
}

test()
