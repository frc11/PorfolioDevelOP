'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { regenerateExecutiveBrief } from '@/lib/ai/executive-brief'
import { resolveOrgId } from '@/lib/preview'
import { revalidatePath } from 'next/cache'

export async function regenerateBriefAction() {
  const session = await auth()
  if (!session?.user) return { ok: false as const, error: 'No autorizado' }

  // Esta action no recibe input del caller; lo único validable es el orgId que
  // resuelve el contexto (sesión / impersonación). Lo pasamos por Zod como
  // defense-in-depth antes de gastar la llamada al LLM (P1-12).
  const orgId = z.string().min(1).safeParse(await resolveOrgId())
  if (!orgId.success) return { ok: false as const, error: 'Sin organizacion' }

  const result = await regenerateExecutiveBrief(orgId.data)

  if (result.ok) {
    revalidatePath('/dashboard')
  }

  return result
}
