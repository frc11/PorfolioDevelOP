'use server'

import { resolveOrgId } from '@/lib/preview'
import { resolveScopedOrgId } from '@/lib/security/org-scope'
import { isModuleActive } from '@/lib/modules/check-activation'
import { generateReviewReplyDraft } from '@/lib/ai/review-reply-draft'
import { replyToReview } from '@/lib/integrations/google-business-profile'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function generateDraft(params: {
  organizationId: string
  rating: number
  reviewerName: string
  reviewComment: string | null
}) {
  // La org NUNCA se confía del parámetro del cliente: se deriva de la sesión y
  // el organizationId recibido debe coincidir, si no se rechaza (anti-IDOR).
  // Todo lo que sigue opera con la org de la SESIÓN, nunca con params.
  const organizationId = resolveScopedOrgId(await resolveOrgId(), params.organizationId)
  if (!organizationId) return { ok: false as const, error: 'No autorizado' }

  const isActive = await isModuleActive(organizationId, 'motor-resenas')
  if (!isActive) return { ok: false as const, error: 'Módulo no activo' }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { companyName: true },
  })
  if (!org) return { ok: false as const, error: 'Organización no encontrada' }

  try {
    const draft = await generateReviewReplyDraft({
      businessName: org.companyName ?? 'tu negocio',
      rating: params.rating,
      reviewerName: params.reviewerName,
      reviewComment: params.reviewComment,
    })
    return { ok: true as const, draft }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : 'Error generando draft',
    }
  }
}

export async function replyAction(params: {
  organizationId: string
  reviewName: string
  comment: string
}) {
  // Mismo guard: la org sale de la sesión. Evita que un usuario de otra org
  // publique respuestas en el Google Business Profile de un tercero.
  const organizationId = resolveScopedOrgId(await resolveOrgId(), params.organizationId)
  if (!organizationId) return { ok: false as const, error: 'No autorizado' }

  const isActive = await isModuleActive(organizationId, 'motor-resenas')
  if (!isActive) return { ok: false as const, error: 'Módulo no activo' }

  const result = await replyToReview(
    organizationId,
    params.reviewName,
    params.comment,
  )

  if (result.ok) {
    revalidatePath('/dashboard/modules/motor-resenas')
    revalidatePath('/dashboard/resultados/reputacion')
  }

  return result
}
