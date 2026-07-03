/**
 * D5' — Invariante del helper puro maskSecret, consolidado desde 2 copias
 * byte-idénticas (maskFromInput en settings-console.tsx, maskSecret en
 * settings.actions.ts — máscara del token de Telegram, cliente y server).
 * Corre: npx tsx src/lib/mask-secret.invariant.ts (o npm run check:invariant:mask-secret)
 */
import assert from 'node:assert/strict'
import { maskSecret } from './mask-secret'

function run() {
  assert.equal(
    maskSecret('123456:ABCDEF7890'),
    '••••••••7890',
    'token largo: 8 bullets + los últimos 4 caracteres',
  )
  assert.equal(
    maskSecret('abc'),
    '••••••••abc',
    'token corto (<4 chars): slice(-4) devuelve el string completo sin padding — comportamiento preservado de ambas copias originales',
  )
  assert.equal(maskSecret(''), null, 'string vacío -> null (falsy check)')
  assert.equal(maskSecret(null), null, 'null -> null (caso del server, settings.osTelegramBotToken sin configurar)')
  assert.equal(maskSecret(undefined), null, 'undefined -> null')

  console.log('✓ mask-secret invariant OK — mismo output que maskFromInput/maskSecret originales')
}

run()
