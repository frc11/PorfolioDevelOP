'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { ok, fail, toErrorMessage, type ActionResult } from '@/lib/action-utils'

/**
 * develOP confirma que el referido contrató un plan: PENDING → CONVERTED. La transición
 * se guarda con `updateMany({ where: { status: 'PENDING' } })` (atómica, sin read-then-write)
 * para no saltar estados. Admin-only.
 */
export async function markReferralConvertedAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    if (!id?.trim()) return fail('Referido inválido.')

    const result = await prisma.referral.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'CONVERTED' },
    })
    if (result.count === 0) return fail('El referido no está pendiente o no existe.')

    revalidatePath('/admin/referrals')
    revalidatePath('/dashboard/referidos')
    return ok({ id })
  } catch (error) {
    return fail(toErrorMessage(error, 'No se pudo marcar como convertido.'))
  }
}

/**
 * Se acreditó el mes bonificado al referente: CONVERTED → REWARDED + rewardedAt. La
 * aplicación de facturación la hace develOP; esto solo registra que se aplicó. Admin-only.
 */
export async function markReferralRewardedAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    if (!id?.trim()) return fail('Referido inválido.')

    const result = await prisma.referral.updateMany({
      where: { id, status: 'CONVERTED' },
      data: { status: 'REWARDED', rewardedAt: new Date() },
    })
    if (result.count === 0) return fail('El referido no está convertido o no existe.')

    revalidatePath('/admin/referrals')
    revalidatePath('/dashboard/referidos')
    return ok({ id })
  } catch (error) {
    return fail(toErrorMessage(error, 'No se pudo marcar como bonificado.'))
  }
}
