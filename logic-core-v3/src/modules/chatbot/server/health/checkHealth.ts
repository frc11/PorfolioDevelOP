import { unsafeGlobalQuery } from '@/lib/isolation'
import { checkChatbotEnv } from '../config/envValidator'
import { getLLMProvider } from '../llm'
import { chatbotDebug, chatbotError } from '../logging'

export interface HealthCheckResult {
  ok: boolean
  timestamp: string
  checks: {
    env: { ok: boolean; details: ReturnType<typeof checkChatbotEnv> }
    database: { ok: boolean; latencyMs?: number; error?: string }
    llmProvider: { ok: boolean; provider?: string; modelsAvailable?: number; error?: string }
    bot: { ok: boolean; slug?: string; botName?: string; isActive?: boolean; error?: string }
  }
}

/**
 * Runs a comprehensive health check across all chatbot dependencies.
 * Returns structured result — does NOT throw.
 */
export async function checkChatbotHealth(slug: string = 'develop'): Promise<HealthCheckResult> {
  chatbotDebug('health_check.start', { slug })

  // 1. Env vars
  const envResult = checkChatbotEnv()

  // 2. Database
  let dbCheck: HealthCheckResult['checks']['database'] = { ok: false }
  try {
    const start = Date.now()
    // PLATFORM-HEALTH: liveness de la DB, sin eje de tenant.
    await unsafeGlobalQuery('PLATFORM-HEALTH: liveness de la DB (SELECT 1), sin tenant', (c) => c.$queryRaw`SELECT 1`)
    dbCheck = { ok: true, latencyMs: Date.now() - start }
  } catch (error) {
    dbCheck = { ok: false, error: error instanceof Error ? error.message : 'unknown' }
    chatbotError('health_check.db_failed', error)
  }

  // 3. LLM Provider — verify the runtime can instantiate the configured provider.
  //    The provider (currently Vertex AI / GoogleProvider) requires either
  //    GOOGLE_APPLICATION_CREDENTIALS (file path, local dev) or
  //    GOOGLE_VERTEX_CREDENTIALS_JSON (inline JSON, Netlify/production), plus
  //    CHATBOT_GCP_PROJECT_ID.  The legacy CHATBOT_GOOGLE_API_KEY is NOT used.
  //    getLLMProvider() → new GoogleProvider() → throws with a clear message if
  //    credentials are absent, so the try/catch gives us truthful health data.
  let llmCheck: HealthCheckResult['checks']['llmProvider'] = { ok: false }
  try {
    const provider = getLLMProvider()
    const models = provider.listModels()
    llmCheck = {
      ok: true,
      provider: provider.name,
      modelsAvailable: models.length,
    }
  } catch (error) {
    llmCheck = { ok: false, error: error instanceof Error ? error.message : 'unknown' }
    chatbotError('health_check.llm_failed', error)
  }

  // 4. Bot config
  let botCheck: HealthCheckResult['checks']['bot'] = { ok: false }
  try {
    // PLATFORM-HEALTH: lookup del bot por slug para el health check (default
    // 'develop'). Diagnóstico de plataforma resuelto por clave pública, sin tenant.
    const bot = await unsafeGlobalQuery(
      'PLATFORM-HEALTH: lookup del bot por slug para el health check (default develOP)',
      (c) =>
        c.botConfig.findUnique({
          where: { slug },
          select: { slug: true, botName: true, isActive: true },
        }),
    )
    if (!bot) {
      botCheck = { ok: false, error: `Bot with slug "${slug}" not found` }
    } else if (!bot.isActive) {
      botCheck = { ok: false, slug: bot.slug, botName: bot.botName, error: 'Bot is inactive' }
    } else {
      botCheck = { ok: true, slug: bot.slug, botName: bot.botName, isActive: bot.isActive }
    }
  } catch (error) {
    botCheck = { ok: false, error: error instanceof Error ? error.message : 'unknown' }
  }

  const allOk =
    envResult.allCriticalPresent && dbCheck.ok && llmCheck.ok && botCheck.ok

  chatbotDebug('health_check.complete', { allOk })

  return {
    ok: allOk,
    timestamp: new Date().toISOString(),
    checks: {
      env: { ok: envResult.allCriticalPresent, details: envResult },
      database: dbCheck,
      llmProvider: llmCheck,
      bot: botCheck,
    },
  }
}
