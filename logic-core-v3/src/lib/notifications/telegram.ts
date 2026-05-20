/**
 * Sends a Telegram notification if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set.
 * Silently skips if not configured — safe to call unconditionally.
 */
export async function notifyTelegramOptional(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })
  } catch (error) {
    console.error('[Telegram] Failed to send notification:', error)
  }
}
