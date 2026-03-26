'use server'

import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { PREVIEW_COOKIE } from '@/lib/preview'
import { prisma } from '@/lib/prisma'

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function updateSubscriptionAction(
  orgId: string,
  formData: FormData
): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') return

  const planName = (formData.get('planName') as string | null)?.trim() ?? ''
  const price = parseFloat((formData.get('price') as string | null) ?? '0')
  const renewalDateStr = (formData.get('renewalDate') as string | null)?.trim() || null

  if (!planName || isNaN(price)) return

  // "YYYY-MM-DD" from <input type="date"> → parse as UTC midnight to avoid timezone shifts
  const renewalDate = renewalDateStr ? new Date(`${renewalDateStr}T00:00:00.000Z`) : null

  await prisma.subscription.upsert({
    where: { organizationId: orgId },
    update: { planName, price, renewalDate },
    create: { organizationId: orgId, planName, price, renewalDate, status: 'ACTIVE' },
  })

  revalidatePath(`/admin/clients/${orgId}`)
  revalidatePath('/dashboard/facturacion')
}

// ─── Preview ──────────────────────────────────────────────────────────────────

export async function startClientPreview(orgId: string) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') return

  const jar = await cookies()
  jar.set(PREVIEW_COOKIE, orgId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // No maxAge → session cookie, clears when browser closes
  })

  redirect('/dashboard')
}
