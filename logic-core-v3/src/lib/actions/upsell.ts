'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function requestUpsellAction(
  featureKey: string,
  featureName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  const userId = session?.user?.id
  const organizationId = session?.user?.organizationId

  if (!userId || !organizationId) {
    return { ok: false, error: 'Sesión inválida.' }
  }

  // Fetch org + user info for the submission
  const [org, user] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { companyName: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ])

  if (!org || !user?.email) {
    return { ok: false, error: 'No se encontró información de la cuenta.' }
  }

  const submissionMessage = `Solicitud de módulo premium: ${featureName}`

  try {
    await prisma.contactSubmission.create({
      data: {
        name: user.name ?? org.companyName,
        email: user.email,
        company: org.companyName,
        service: featureKey,
        message: submissionMessage,
        read: false,
      },
    })
  } catch {
    return { ok: false, error: 'Error al registrar la solicitud. Intentá de nuevo.' }
  }

  // Notify SUPER_ADMIN — non-blocking, swallow errors
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
          title: `Solicitud de módulo: ${featureName}`,
          message: `${org.companyName} solicitó activar el módulo "${featureName}".`,
          actionUrl: '/admin/leads',
          read: false,
        },
      })
    }
  } catch (err) {
    console.error('[upsell] Error al crear notificación para SUPER_ADMIN:', err)
  }

  revalidatePath('/admin/leads')

  return { ok: true }
}
