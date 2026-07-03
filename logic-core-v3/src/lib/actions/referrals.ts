'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { getOrCreateReferralCodeForOrg } from '@/lib/referrals/referrals.service'
import { type ActionResult } from './schemas'

/**
 * Genera (o devuelve) el código de referido de la org de la SESIÓN. Org-scoped: el orgId
 * sale de la sesión, nunca de un param del cliente. Idempotente (get-or-create).
 */
export async function generateMyReferralCodeAction(): Promise<ActionResult<{ code: string }>> {
  const session = await auth()
  const organizationId = session?.user?.organizationId

  if (!organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  try {
    const code = await getOrCreateReferralCodeForOrg(organizationId)
    revalidatePath('/dashboard/referidos')
    return { success: true, data: { code } }
  } catch (error) {
    console.error('generateMyReferralCodeAction error:', error)
    return { success: false, error: 'No se pudo generar tu código. Intentá de nuevo.' }
  }
}
