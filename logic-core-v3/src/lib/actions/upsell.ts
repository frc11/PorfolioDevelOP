'use server'

import { auth } from '@/auth'
import { sendAgencyAlert } from '@/lib/alerts'
import { prisma } from '@/lib/prisma'
import { shouldCreateUpsellSubmission } from '@/lib/upsell/dedup'
import { revalidatePath } from 'next/cache'
import { type ActionResult, UpsellRequestSchema } from './schemas'

export async function requestUpsellAction(
  featureKey: string,
  featureName: string
): Promise<ActionResult> {
  const session = await auth()
  const userId = session?.user?.id
  const organizationId = session?.user?.organizationId

  if (!userId || !organizationId) {
    return { success: false, error: 'Sesión inválida.' }
  }

  const parsed = UpsellRequestSchema.safeParse({ featureKey, featureName })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
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
      return { success: false, error: 'No se encontró información de la cuenta.' }
    }

    const submissionMessage = `Solicitud de módulo premium: ${parsed.data.featureName}`

    const module = await prisma.premiumModule.findUnique({
      where: { slug: parsed.data.featureKey },
      select: { id: true },
    })

    if (module) {
      // Upsert atómico sobre el unique compuesto (organizationId, moduleId). En Neon
      // compila a INSERT ... ON CONFLICT DO UPDATE, así que dos clicks concurrentes
      // sobre un módulo que aún no tiene fila no se pisan: el check-then-act anterior
      // (findFirst → create) podía reventar con P2002 justo en el rage-click que este
      // sprint busca amortiguar, perdiendo ese incremento. El contador sube en cada
      // click, cree o actualice.
      await prisma.organizationModule.upsert({
        where: { organizationId_moduleId: { organizationId, moduleId: module.id } },
        update: {
          upsellRequestCount: { increment: 1 },
          upsellLastRequestedAt: new Date(),
        },
        create: {
          organizationId,
          moduleId: module.id,
          status: 'INACTIVE',
          priceLockedUsd: 0,
          upsellRequestCount: 1,
          upsellLastRequestedAt: new Date(),
        },
      })
    }

    // Dedup del lado ContactSubmission/notificación (P5.2). El contador de intensidad
    // (OrganizationModule.upsellRequestCount, arriba) ya deduplica por fila vía el unique
    // y NO se toca: el agujero era este bloque, que antes creaba una fila + alerta +
    // notificaciones en CADA click (5 clicks = 5 leads inbound idénticos). Idempotente por
    // (email de la sesión, featureKey) dentro de una ventana. El email sale de la sesión,
    // así que la consulta queda auto-scopeada al propio cliente (no puede leer submissions
    // de otro). El click repetido igual devuelve success: la UX no cambia, solo no spamea.
    const lastSubmission = await prisma.contactSubmission.findFirst({
      where: { email: user.email, service: parsed.data.featureKey },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    if (shouldCreateUpsellSubmission(lastSubmission?.createdAt ?? null, new Date())) {
      await prisma.contactSubmission.create({
        data: {
          name: user.name ?? org.companyName,
          email: user.email,
          company: org.companyName,
          service: parsed.data.featureKey,
          message: submissionMessage,
          read: false,
        },
      })

      sendAgencyAlert({
        type: 'LEAD_UPSELL',
        clientName: org.companyName,
        detail: `Solicitó activar ${parsed.data.featureName}. Contacto: ${user.email}.`,
        link: '/admin/leads',
      }).catch(() => {})

      try {
        const superAdmin = await prisma.user.findFirst({
          where: { role: 'SUPER_ADMIN' },
          select: { id: true },
        })

        await prisma.$transaction([
          prisma.notification.create({
            data: {
              userId,
              organizationId,
              type: 'INFO',
              title: `Solicitud enviada: ${parsed.data.featureName}`,
              message: `Tu solicitud para activar "${parsed.data.featureName}" fue recibida. Te contactaremos pronto.`,
            },
          }),
          ...(superAdmin
            ? [
                prisma.notification.create({
                  data: {
                    userId: superAdmin.id,
                    type: 'ACTION_REQUIRED',
                    title: `${org.companyName} está interesada en ${parsed.data.featureName}`,
                    message: `${org.companyName} solicitó activar el módulo "${parsed.data.featureName}".`,
                    actionUrl: '/admin/leads',
                  },
                }),
              ]
            : []),
        ])
      } catch (error) {
        console.error('[upsell] Error al crear notificaciones:', error)
      }
    }

    revalidatePath('/admin/leads')
    revalidatePath('/admin', 'layout')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: {
        featureKey: parsed.data.featureKey,
        featureName: parsed.data.featureName,
      },
    }
  } catch (error) {
    console.error('requestUpsellAction error:', error)
    return { success: false, error: 'Error al registrar la solicitud. Intentá de nuevo.' }
  }
}
