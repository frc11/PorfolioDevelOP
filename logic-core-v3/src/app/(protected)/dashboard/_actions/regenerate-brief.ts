'use server'

import { auth } from '@/auth'
import { regenerateExecutiveBrief } from '@/lib/ai/executive-brief'
import { resolveOrgId } from '@/lib/preview'
import { revalidatePath } from 'next/cache'

export async function regenerateBriefAction() {
  const session = await auth()
  if (!session?.user) return { ok: false as const, error: 'No autorizado' }

  const orgId = await resolveOrgId()
  if (!orgId) return { ok: false as const, error: 'Sin organizacion' }

  const result = await regenerateExecutiveBrief(orgId)

  if (result.ok) {
    revalidatePath('/dashboard')
  }

  return result
}
