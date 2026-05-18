// scripts/load-test/chatbot-baseline.ts
// Script para medir P50/P95/P99 del endpoint /api/chatbot/[slug]/chat
// Uso: npx tsx scripts/load-test/chatbot-baseline.ts

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const SLUG = process.env.BOT_SLUG ?? 'develop'
const CONCURRENT = Number(process.env.CONCURRENT ?? '3')
const TOTAL_REQUESTS = Number(process.env.TOTAL ?? '30')

const TEST_MESSAGES = [
  'Hola, qué hacen ustedes?',
  'Cuánto cuesta una página web?',
  'Trabajan con tiendas online?',
  'Me podés mandar info por WhatsApp?',
  'Necesito un chatbot para mi clínica',
  'Hacen automatizaciones también?',
  'Qué incluye el servicio?',
  'Quiero hablar con un asesor',
]

interface RequestResult {
  durationMs: number
  status: number
  success: boolean
  error?: string
}

async function sendChatRequest(message: string, sessionId: string): Promise<RequestResult> {
  const start = Date.now()

  try {
    const response = await fetch(`${BASE_URL}/api/chatbot/${SLUG}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        sessionId,
      }),
    })

    // Consumir el stream completo
    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done } = await reader.read()
        if (done) break
      }
    }

    return {
      durationMs: Date.now() - start,
      status: response.status,
      success: response.ok,
    }
  } catch (error) {
    return {
      durationMs: Date.now() - start,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

async function runBatch(): Promise<RequestResult[]> {
  const results: RequestResult[] = []

  // Procesar en chunks de CONCURRENT
  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT) {
    const batch = []
    for (let j = 0; j < CONCURRENT && i + j < TOTAL_REQUESTS; j++) {
      const message = TEST_MESSAGES[(i + j) % TEST_MESSAGES.length]
      const sessionId = `loadtest-${Date.now()}-${i + j}`
      batch.push(sendChatRequest(message, sessionId))
    }
    const batchResults = await Promise.all(batch)
    results.push(...batchResults)
    console.log(`[${results.length}/${TOTAL_REQUESTS}] Batch complete`)
  }

  return results
}

async function main() {
  console.log(`\n=== Chatbot Load Test ===`)
  console.log(`URL: ${BASE_URL}/api/chatbot/${SLUG}/chat`)
  console.log(`Total: ${TOTAL_REQUESTS} requests`)
  console.log(`Concurrent: ${CONCURRENT}`)
  console.log(`Starting...\n`)

  const startTime = Date.now()
  const results = await runBatch()
  const totalDuration = Date.now() - startTime

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const durations = successful.map(r => r.durationMs)

  console.log(`\n=== Results ===`)
  console.log(`Total time: ${(totalDuration / 1000).toFixed(2)}s`)
  console.log(`Successful: ${successful.length}/${results.length}`)
  console.log(`Failed: ${failed.length}/${results.length}`)

  if (durations.length > 0) {
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length

    console.log(`\nResponse times (ms):`)
    console.log(`  Min: ${min}`)
    console.log(`  Avg: ${Math.round(avg)}`)
    console.log(`  Max: ${max}`)
    console.log(`  P50: ${percentile(durations, 50)}`)
    console.log(`  P90: ${percentile(durations, 90)}`)
    console.log(`  P95: ${percentile(durations, 95)}`)
    console.log(`  P99: ${percentile(durations, 99)}`)
  }

  if (failed.length > 0) {
    console.log(`\nFailures:`)
    const errorCounts = new Map<string, number>()
    failed.forEach(f => {
      const key = `[${f.status}] ${f.error ?? 'unknown'}`
      errorCounts.set(key, (errorCounts.get(key) ?? 0) + 1)
    })
    for (const [error, count] of errorCounts.entries()) {
      console.log(`  ${error}: ${count}`)
    }
  }
}

main().catch(console.error)
