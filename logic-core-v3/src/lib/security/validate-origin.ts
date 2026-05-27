import { prisma } from '@/lib/prisma'
import { originMatchesAllowed } from './origin-matcher'

interface ValidateOriginInput {
  origin: string | null
  botSlug: string
}

export interface ValidateOriginResult {
  allowed: boolean
  reason?: string
  botConfigId?: string
}

/**
 * Valida si un origen está autorizado a usar el chatbot.
 * Reglas:
 * - Sin allowedDomains configurados: rechaza (excepto localhost en dev)
 * - Con allowedDomains: matchea exacto + subdominios
 * - localhost siempre permitido en NODE_ENV=development
 * - localhost permitido en prod builds cuando QA_ALLOW_LOCALHOST=1
 *   (escape hatch para el server next-prod-qa de MS-7 — opt-in, nunca
 *   activado en deploys reales)
 * - develop.com.ar siempre permitido
 */
export async function validateOrigin(
  input: ValidateOriginInput,
): Promise<ValidateOriginResult> {
  const { origin, botSlug } = input

  const isLocalhost =
    !!origin &&
    (origin.includes('localhost') || origin.includes('127.0.0.1'))

  // En dev, permitir todo localhost
  if (process.env.NODE_ENV === 'development' && isLocalhost) {
    return { allowed: true }
  }

  // QA local sobre prod build (next-prod-qa): opt-in vía env var.
  // Cubre dos casos: cross-origin con Origin=localhost (iframe, script
  // embed apuntando a localhost), y same-origin GET donde el browser omite
  // el header Origin (caso típico del config fetch del propio sitio del
  // portfolio en build prod local). El flag es opt-in, nunca activo en
  // deploys reales.
  if (process.env.QA_ALLOW_LOCALHOST === '1' && (isLocalhost || !origin)) {
    return { allowed: true, reason: 'qa_allow_localhost' }
  }

  // Sin origin (curl, same-origin, SSR) — solo en no-prod
  if (!origin) {
    return {
      allowed: process.env.NODE_ENV !== 'production',
      reason: 'no_origin',
    }
  }

  const bot = await prisma.botConfig.findUnique({
    where: { slug: botSlug },
    select: { id: true, allowedDomains: true, isActive: true },
  })

  if (!bot) return { allowed: false, reason: 'bot_not_found' }
  if (!bot.isActive) return { allowed: false, reason: 'bot_inactive' }

  // Dominio de develOP siempre permitido (antes del check de allowedDomains)
  if (
    origin === 'https://develop.com.ar' ||
    origin === 'https://www.develop.com.ar'
  ) {
    return { allowed: true, botConfigId: bot.id }
  }

  // Sin dominios configurados → bloquea en prod
  if (bot.allowedDomains.length === 0) {
    return { allowed: false, reason: 'no_domains_configured', botConfigId: bot.id }
  }

  // Match exacto o subdominio (delegado al matcher compartido)
  if (originMatchesAllowed(origin, bot.allowedDomains)) {
    return { allowed: true, botConfigId: bot.id }
  }

  return { allowed: false, reason: 'domain_not_allowed', botConfigId: bot.id }
}
