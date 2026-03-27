'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function updateSubscriptionAction(
  orgId: string,
  formData: FormData,
): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') return

  const planName = (formData.get('planName') as string | null)?.trim() ?? ''
  const price = parseFloat((formData.get('price') as string | null) ?? '0')
  const renewalDateStr = (formData.get('renewalDate') as string | null)?.trim() || null

  if (!planName || Number.isNaN(price)) return

  const renewalDate = renewalDateStr ? new Date(`${renewalDateStr}T00:00:00.000Z`) : null

  await prisma.subscription.upsert({
    where: { organizationId: orgId },
    update: { planName, price, renewalDate },
    create: { organizationId: orgId, planName, price, renewalDate, status: 'ACTIVE' },
  })

  revalidatePath(`/admin/clients/${orgId}`)
  revalidatePath('/dashboard/facturacion')
}
