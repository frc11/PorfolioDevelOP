/**
 * Sandbox 360dialog — seed del WabaChannel real (verificación viva B1-S1/B1-S2).
 *
 * Crea/actualiza un WabaChannel de la org de prueba (`san-miguel`) con el
 * phoneNumberId/wabaId reales del número sandbox, cifra la API key de
 * 360dialog con secret-box (MOTOR_CHANNEL_SECRET_KEY) y genera credenciales
 * de webhook nuevas. Imprime channelToken + webhookSecret UNA sola vez —
 * son necesarios para el paso 2 (configurar el webhook) y no se persisten
 * en claro en ningún lado.
 *
 * La API key JAMÁS se pasa por argv (quedaría en el historial de shell /
 * process list): se pide por stdin con eco desactivado.
 *
 * Uso:
 *   npx tsx scripts/dev/sandbox-360-seed-channel.ts \
 *     --phoneNumberId=<id> --wabaId=<id> --displayPhoneNumber="+54 9 11 ...."
 *   # pide la API key de forma interactiva (oculta)
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

function parseArgs(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const arg of process.argv.slice(2)) {
    const match = /^--([^=]+)=(.*)$/.exec(arg)
    if (match) out[match[1]] = match[2]
  }
  return out
}

/** Lee un valor sensible de stdin sin hacer echo. TTY-only (no pipes en CI). */
async function readHiddenInput(promptText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error('stdin no es un TTY: corré este script en una terminal interactiva.'))
      return
    }
    process.stdout.write(promptText)
    process.stdin.resume()
    process.stdin.setRawMode(true)
    process.stdin.setEncoding('utf8')

    let value = ''
    const onData = (chunk: string): void => {
      for (const char of chunk) {
        if (char === '\n' || char === '\r') {
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdin.removeListener('data', onData)
          process.stdout.write('\n')
          resolve(value)
          return
        }
        if (char === '') {
          // Ctrl+C
          process.stdout.write('\n')
          process.exit(130)
        }
        if (char === '') {
          // backspace
          value = value.slice(0, -1)
          continue
        }
        value += char
      }
    }
    process.stdin.on('data', onData)
  })
}

async function main(): Promise<void> {
  const args = parseArgs()
  const { phoneNumberId, wabaId, displayPhoneNumber } = args

  if (!phoneNumberId || !wabaId || !displayPhoneNumber) {
    console.error(
      '[sandbox-360] Faltan argumentos. Uso:\n' +
        '  npx tsx scripts/dev/sandbox-360-seed-channel.ts \\\n' +
        '    --phoneNumberId=<id> --wabaId=<id> --displayPhoneNumber="+54 9 11 ...."',
    )
    process.exit(1)
  }

  const { prisma } = await import('../../src/lib/prisma')
  const { createSecretBox } = await import('../../src/lib/crypto/secret-box')
  const { generateChannelWebhookCredentials } = await import(
    '../../src/modules/motor/domain/channel-credentials'
  )

  const organization = await prisma.organization.findUnique({
    where: { slug: 'san-miguel' },
    select: { id: true, slug: true },
  })
  if (!organization) {
    console.error('[sandbox-360] No existe la org "san-miguel". Corré `npm run seed` primero.')
    process.exit(1)
  }

  const apiKey = await readHiddenInput('API key de 360dialog (D360-API-KEY, oculta): ')
  if (!apiKey.trim()) {
    console.error('[sandbox-360] API key vacía, abortando.')
    process.exit(1)
  }

  const secretBox = createSecretBox('MOTOR_CHANNEL_SECRET_KEY')
  const encrypted = secretBox.encrypt(apiKey.trim())
  const webhookCreds = generateChannelWebhookCredentials()

  // phoneNumberId no es unique en el schema (unique real es channelToken) —
  // resolvemos el upsert a mano por (organizationId, phoneNumberId).
  const existing = await prisma.wabaChannel.findFirst({
    where: { organizationId: organization.id, phoneNumberId },
    select: { id: true },
  })

  const channelData = {
    wabaId,
    displayPhoneNumber,
    status: 'ACTIVE' as const,
    provider: 'D360',
    channelToken: webhookCreds.channelToken,
    webhookSecretHash: webhookCreds.webhookSecretHash,
    apiKeyEncrypted: encrypted.encrypted,
    apiKeyIv: encrypted.iv,
    apiKeyTag: encrypted.tag,
  }

  const channel = existing
    ? await prisma.wabaChannel.update({ where: { id: existing.id }, data: channelData })
    : await prisma.wabaChannel.create({
        data: { organizationId: organization.id, phoneNumberId, ...channelData },
      })

  console.log('\n[sandbox-360] ── Canal listo ──────────────────────────────')
  console.log(`channelId            : ${channel.id}`)
  console.log(`organizationId       : ${organization.id} (${organization.slug})`)
  console.log(`phoneNumberId        : ${phoneNumberId}`)
  console.log(`wabaId               : ${wabaId}`)
  console.log(`displayPhoneNumber   : ${displayPhoneNumber}`)
  console.log('\n[sandbox-360] Credenciales del webhook (ÚNICA vez que se muestran):')
  console.log(`channelToken (URL)   : ${webhookCreds.channelToken}`)
  console.log(`webhookSecret (Bearer): ${webhookCreds.webhookSecret}`)
  console.log(
    '\n[sandbox-360] Guardalas en el doc de sesión (no en git). El secret NO se puede recuperar' +
      ' después — si se pierde, hay que volver a correr este script.',
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[sandbox-360] Falló:', err)
  process.exit(1)
})
