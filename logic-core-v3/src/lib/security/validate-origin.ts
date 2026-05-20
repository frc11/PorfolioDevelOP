import { prisma } from '@/lib/prisma'

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
 * - develop.com.ar siempre permitido
 */
export async function validateOrigin(
  input: ValidateOriginInput,
): Promise<ValidateOriginResult> {
  const { origin, botSlug } = input

  // En dev, permitir todo localhost
  if (
    process.env.NODE_ENV === 'development' &&
    origin &&
    (origin.includes('localhost') || origin.includes('127.0.0.1'))
  ) {
    return { allowed: true }
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

  // Match exacto o subdominio
  try {
    const originHost = new URL(origin).host
    for (const entry of bot.allowedDomains) {
      const clean = entry
        .replace(/^https?:\/\//, '')
        .replace(/^\*\./, '')
        .replace(/\/$/, '')

      if (originHost === clean) return { allowed: true, botConfigId: bot.id }
      if (originHost.endsWith('.' + clean)) return { allowed: true, botConfigId: bot.id }
    }
  } catch {
    return { allowed: false, reason: 'invalid_origin', botConfigId: bot.id }
  }

  return { allowed: false, reason: 'domain_not_allowed', botConfigId: bot.id }
}
