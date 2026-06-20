/**
 * Único punto de envío a Telegram de toda la app (LeadOS + chatbot + cron).
 *
 * Fuente de verdad de credenciales — CONFIG-FIRST:
 *   1. `AgencySettings.osTelegramBotToken` + `osTelegramChatId` — editables por
 *      el admin en /admin/settings sin redeploy. Se usan SOLO si el par está
 *      completo (nunca se mezcla token de una fuente con chatId de otra).
 *   2. Fallback a env `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — bootstrap,
 *      entorno local, o mientras la config todavía esté vacía.
 *
 * Por qué config-first: la config existe para que el admin rote bot/chat desde
 * la UI. Env-first la dejaría muerta en prod (el env siempre está seteado, así
 * que su rama nunca se alcanzaría). Como la config arranca vacía, en prod cae al
 * env actual → las notis que ya funcionaban siguen llegando; apenas se completan
 * los campos en la UI, manda la config.
 *
 * Contrato: NUNCA lanza. Si no hay credenciales o el envío falla, loguea y
 * devuelve `false` — el flujo que lo llamó sigue intacto.
 */
import { prisma } from '@/lib/prisma'

export type TelegramParseMode = 'HTML' | 'Markdown'

interface TelegramCredentials {
  botToken: string
  chatId: string
}

interface SendTelegramOptions {
  /** Formato del mensaje. Default: 'HTML'. */
  parseMode?: TelegramParseMode
}

/**
 * Resuelve credenciales config-first / env-fallback tratando el par como unidad.
 * Nunca lanza: si la lectura de la DB falla, cae a env para no matar la noti
 * cuando el env está configurado.
 */
async function resolveTelegramCredentials(): Promise<TelegramCredentials | null> {
  try {
    const settings = await prisma.agencySettings.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { osTelegramBotToken: true, osTelegramChatId: true },
    })
    const configToken = settings?.osTelegramBotToken?.trim()
    const configChatId = settings?.osTelegramChatId?.trim()
    if (configToken && configChatId) {
      return { botToken: configToken, chatId: configChatId }
    }
  } catch (error) {
    console.error('[telegram] no se pudo leer AgencySettings, usando env:', error)
  }

  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const envChatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (envToken && envChatId) {
    return { botToken: envToken, chatId: envChatId }
  }

  return null
}

/**
 * Único sender de Telegram. Devuelve `true` si Telegram aceptó el mensaje,
 * `false` si no había credenciales o el envío falló (ya logueado). Nunca lanza.
 */
export async function sendTelegram(
  message: string,
  options: SendTelegramOptions = {},
): Promise<boolean> {
  const credentials = await resolveTelegramCredentials()
  if (!credentials) {
    console.warn('[telegram] sin credenciales (config ni env) — mensaje no enviado')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${credentials.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: credentials.chatId,
          text: message,
          parse_mode: options.parseMode ?? 'HTML',
        }),
      },
    )
    if (!response.ok) {
      console.error('[telegram] envío falló:', await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error('[telegram] error de red:', error)
    return false
  }
}

/**
 * Back-compat: notificación fire-and-forget en Markdown usada por el módulo
 * chatbot. Wrapper fino sobre `sendTelegram` — un solo sender real por debajo.
 */
export async function notifyTelegramOptional(message: string): Promise<void> {
  await sendTelegram(message, { parseMode: 'Markdown' })
}
