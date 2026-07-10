/**
 * RE-2 — Invariante de `configCache.ts`: el cache NO debe envenenarse con un fallo,
 * y el reintento automático debe reusar exactamente `chatRetryPolicy.ts` (INFRA.2:
 * solo transitorios — red/5xx —, backoff real 2s/4s, acotado a 3 intentos, NUNCA 4xx).
 *
 *   npm run test:re2
 *   (o: npx tsx src/modules/chatbot/shared/__tests__/config-cache.invariant.ts)
 *
 * No hay librería de mocks en el repo (mismo idioma que `captureStderr` en
 * persist-failure-sink.invariant.ts): se stubea `globalThis.fetch` temporalmente y se
 * restaura. Como el backoff es real (no hay reloj inyectable en `configCache.ts` — a
 * propósito, para no tocar su firma pública solo por testeabilidad), este archivo
 * tarda ~10s de pared (2s + 6s + 2s de los 3 casos que efectivamente reintentan).
 *
 * Casos:
 *   1. Éxito al primer intento → resuelve la config, un solo fetch.
 *   2. Éxito ya cacheado → una 2ª llamada al mismo slug NO vuelve a fetchear.
 *   3. 503 una vez, después 200 → reintenta (backoff real) y resuelve con éxito.
 *   4. 503 × 3 (agota) → resuelve null, y el SIGUIENTE llamado al mismo slug
 *      vuelve a fetchear desde cero (no quedó cacheada la falla).
 *   5. 404 (4xx) → NUNCA reintenta, resuelve null de inmediato.
 *   6. Red caída (fetch rechaza) una vez, después 200 → se clasifica como
 *      transitorio igual que un 5xx, reintenta y resuelve con éxito.
 */
import assert from 'node:assert/strict'
import { prefetchBotConfig } from '../configCache'
import type { PublicBotConfig } from '../publicConfig'

let passed = 0
async function check(label: string, fn: () => Promise<void>): Promise<void> {
  await fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

console.log('RE-2 — config-cache.invariant (tarda ~10s: backoff real de chatRetryPolicy)')

const FAKE_CONFIG = { botName: 'Test Bot', accentColor: '#06b6d4' } as unknown as PublicBotConfig

interface FetchStub {
  calls: number
  restore: () => void
}

/** Stubea `globalThis.fetch`; `handler` decide la respuesta para la llamada nº `calls` (0-indexed). */
function stubFetch(handler: (callIndex: number) => Response): FetchStub {
  const original = globalThis.fetch
  const stub: FetchStub = {
    calls: 0,
    restore: () => {
      globalThis.fetch = original
    },
  }
  globalThis.fetch = (async () => {
    const index = stub.calls
    stub.calls += 1
    return handler(index)
  }) as typeof fetch
  return stub
}

/** Igual que `stubFetch`, pero `handler` puede lanzar (simula fetch rechazado por red). */
function stubFetchThrowing(handler: (callIndex: number) => Response): FetchStub {
  const original = globalThis.fetch
  const stub: FetchStub = {
    calls: 0,
    restore: () => {
      globalThis.fetch = original
    },
  }
  globalThis.fetch = (async () => {
    const index = stub.calls
    stub.calls += 1
    return handler(index) // puede lanzar sync — cae en el catch de fetchConfigOnce igual que un fetch rechazado
  }) as typeof fetch
  return stub
}

const okResponse = () => new Response(JSON.stringify(FAKE_CONFIG), { status: 200 })
const serverErrorResponse = () => new Response('', { status: 503 })
const notFoundResponse = () => new Response(JSON.stringify({ error: 'not found' }), { status: 404 })

async function main(): Promise<void> {
  await check('éxito al primer intento → resuelve la config, un solo fetch', async () => {
    const stub = stubFetch(() => okResponse())
    const result = await prefetchBotConfig('inv-happy-path')
    stub.restore()
    assert.deepEqual(result, FAKE_CONFIG)
    assert.equal(stub.calls, 1)
  })

  await check('éxito cacheado (sin TTL) → una 2ª llamada NO vuelve a fetchear', async () => {
    // Ningún fetch debería dispararse: si lo hiciera, este stub lanza y el test falla.
    const stub = stubFetch(() => {
      throw new Error('no debería fetchear — el éxito de arriba ya está cacheado')
    })
    const result = await prefetchBotConfig('inv-happy-path')
    stub.restore()
    assert.deepEqual(result, FAKE_CONFIG)
    assert.equal(stub.calls, 0)
  })

  await check('503 una vez → reintenta (backoff real) y resuelve con éxito', async () => {
    const stub = stubFetch((i) => (i === 0 ? serverErrorResponse() : okResponse()))
    const result = await prefetchBotConfig('inv-retry-once-5xx')
    stub.restore()
    assert.deepEqual(result, FAKE_CONFIG)
    assert.equal(stub.calls, 2)
  })

  await check(
    '503 × 3 (agota) → null, y el próximo llamado al MISMO slug vuelve a fetchear',
    async () => {
      const stub = stubFetch(() => serverErrorResponse())
      const result = await prefetchBotConfig('inv-exhaust-5xx')
      assert.equal(result, null)
      assert.equal(stub.calls, 3, 'CHAT_RETRY_MAX_ATTEMPTS=3: 1 intento inicial + 2 reintentos')
      stub.restore()

      // El cache NO debe haber persistido la falla: el próximo llamado al MISMO
      // slug tiene que volver a fetchear (no servir el null envenenado de nuevo).
      const recoveryStub = stubFetch(() => okResponse())
      const recovered = await prefetchBotConfig('inv-exhaust-5xx')
      recoveryStub.restore()
      assert.deepEqual(recovered, FAKE_CONFIG)
      assert.equal(recoveryStub.calls, 1, 'debe haber vuelto a fetchear desde cero, no servir el fallo cacheado')
    },
  )

  await check('404 (4xx) → NUNCA reintenta, resuelve null de inmediato', async () => {
    const stub = stubFetch(() => notFoundResponse())
    const result = await prefetchBotConfig('inv-client-error-404')
    stub.restore()
    assert.equal(result, null)
    assert.equal(stub.calls, 1, '4xx nunca es transitorio — chatRetryPolicy no lo reintenta')
  })

  await check('red caída una vez (fetch rechaza) → se trata como transitorio, reintenta y resuelve', async () => {
    const stub = stubFetchThrowing((i) => {
      if (i === 0) throw new Error('network down')
      return okResponse()
    })
    const result = await prefetchBotConfig('inv-retry-once-network')
    stub.restore()
    assert.deepEqual(result, FAKE_CONFIG)
    assert.equal(stub.calls, 2)
  })

  console.log(`\n✅ RE-2 config-cache OK — ${passed} checks`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
