import { randomBytes } from 'node:crypto'
import type { Referral, ReferralStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendAgencyAlert } from '@/lib/alerts'
import { decideReferralAttribution } from './attribution'
import { generateReferralCodeCandidate, normalizeReferralCode } from './code'

const CODE_GENERATION_ATTEMPTS = 6

function randomSuffix(): string {
  return randomBytes(3).toString('hex') // 6 hex chars; normalize los pasa a mayúsculas
}

/** Código de referido de una org, o null si todavía no generó uno. Read-only. */
export async function getReferralCodeForOrg(organizationId: string): Promise<string | null> {
  const existing = await prisma.referralCode.findUnique({
    where: { organizationId },
    select: { code: true },
  })
  return existing?.code ?? null
}

/**
 * Devuelve el código de la org, creándolo si no existe (idempotente por el unique
 * `organizationId`). Reintenta ante colisión del `code` global (P2002). Org-scoped: el
 * código pertenece a la org que se pasa (la sesión resuelve el orgId, nunca el cliente).
 */
export async function getOrCreateReferralCodeForOrg(organizationId: string): Promise<string> {
  const existing = await prisma.referralCode.findUnique({
    where: { organizationId },
    select: { code: true },
  })
  if (existing) return existing.code

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { companyName: true, slug: true },
  })
  const seed = org?.slug || org?.companyName || 'develop'

  for (let attempt = 0; attempt < CODE_GENERATION_ATTEMPTS; attempt += 1) {
    const code = generateReferralCodeCandidate(seed, randomSuffix())
    try {
      const created = await prisma.referralCode.create({
        data: { organizationId, code },
        select: { code: true },
      })
      return created.code
    } catch {
      // Otra request creó el código de esta org en paralelo, o colisión de `code`.
      // Releemos: si ya existe el de la org, lo devolvemos; si no, reintentamos.
      const now = await prisma.referralCode.findUnique({
        where: { organizationId },
        select: { code: true },
      })
      if (now) return now.code
    }
  }

  throw new Error('No se pudo generar un código de referido único.')
}

/** Referidos hechos por una org (org-scoped, más recientes primero). */
export async function getReferralsForOrg(organizationId: string): Promise<Referral[]> {
  return prisma.referral.findMany({
    where: { referrerOrgId: organizationId },
    orderBy: { createdAt: 'desc' },
  })
}

/** Conteo por estado para el panel del cliente. */
export function summarizeReferrals(referrals: readonly Referral[]): Record<ReferralStatus, number> {
  const counts: Record<ReferralStatus, number> = { PENDING: 0, CONVERTED: 0, REWARDED: 0 }
  for (const referral of referrals) counts[referral.status] += 1
  return counts
}

export interface AttributionResult {
  attributed: boolean
  reason?: string
}

/**
 * Atribuye un referido a partir de un contacto entrante con código. Reúne los hechos,
 * delega la decisión anti-abuso a `decideReferralAttribution`, y si procede crea el
 * Referral (PENDING) y avisa a develOP. Resiliente: nunca lanza (un fallo acá no debe
 * tumbar el alta del contacto que la invoca).
 */
export async function attributeReferralFromContact(input: {
  code: string
  referredEmail: string
}): Promise<AttributionResult> {
  try {
    const code = normalizeReferralCode(input.code)
    if (!code) return { attributed: false, reason: 'empty' }

    const referralCode = await prisma.referralCode.findUnique({
      where: { code },
      select: {
        organizationId: true,
        organization: {
          select: {
            companyName: true,
            members: { select: { user: { select: { email: true } } } },
          },
        },
      },
    })

    const referredEmail = input.referredEmail.trim().toLowerCase()
    const referrerFound = Boolean(referralCode)

    const [existingCustomer, existingReferral] = referrerFound
      ? await Promise.all([
          prisma.user.findFirst({ where: { email: referredEmail }, select: { id: true } }),
          prisma.referral.findFirst({
            where: { referrerOrgId: referralCode!.organizationId, referredEmail },
            select: { id: true },
          }),
        ])
      : [null, null]

    const decision = decideReferralAttribution({
      referrerFound,
      referredEmail,
      referrerMemberEmails:
        referralCode?.organization.members.map((member) => member.user.email) ?? [],
      referredIsExistingCustomer: Boolean(existingCustomer),
      alreadyReferred: Boolean(existingReferral),
    })

    if (!decision.attribute) return { attributed: false, reason: decision.reason }

    await prisma.referral.create({
      data: {
        referrerOrgId: referralCode!.organizationId,
        referredEmail,
        status: 'PENDING',
      },
    })

    const referrerName = referralCode!.organization.companyName
    sendAgencyAlert({
      type: 'LEAD_EXTERNAL',
      clientName: referrerName,
      detail: `Referido entrante de ${referrerName}. Contacto referido: ${referredEmail}. Pendiente de conversión (confirmar contratación de plan).`,
      link: '/admin/referrals',
    }).catch(() => {})

    try {
      const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true },
      })
      if (superAdmin) {
        await prisma.notification.create({
          data: {
            userId: superAdmin.id,
            type: 'ACTION_REQUIRED',
            title: `Nuevo referido de ${referrerName}`,
            message: `${referrerName} refirió a ${referredEmail}. Confirmá la conversión para aplicar el mes bonificado.`,
            actionUrl: '/admin/referrals',
          },
        })
      }
    } catch (error) {
      console.error('[referrals] notificación admin falló:', error)
    }

    return { attributed: true }
  } catch (error) {
    console.error('attributeReferralFromContact error:', error)
    return { attributed: false, reason: 'error' }
  }
}
