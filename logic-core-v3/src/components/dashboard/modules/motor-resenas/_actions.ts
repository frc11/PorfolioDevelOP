'use server'

import { auth } from '@/auth'
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
  const session = await auth()
  if (!session?.user) return { ok: false as const, error: 'No autorizado' }

  const isActive = await isModuleActive(params.organizationId, 'motor-resenas')
  if (!isActive) return { ok: false as const, error: 'Módulo no activo' }

  const org = await prisma.organization.findUnique({
    where: { id: params.organizationId },
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
  const session = await auth()
  if (!session?.user) return { ok: false as const, error: 'No autorizado' }

  const isActive = await isModuleActive(params.organizationId, 'motor-resenas')
  if (!isActive) return { ok: false as const, error: 'Módulo no activo' }

  const result = await replyToReview(
    params.organizationId,
    params.reviewName,
    params.comment,
  )

  if (result.ok) {
    revalidatePath('/dashboard/modules/motor-resenas')
    revalidatePath('/dashboard/resultados/reputacion')
  }

  return result
}
