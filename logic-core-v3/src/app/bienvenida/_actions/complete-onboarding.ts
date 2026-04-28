'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CompleteOnboardingSchema = z.object({
  companyName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contactEmail: z.string().email('Email inválido').optional(),
  whatsapp: z.string().optional(),
  ga4MeasurementId: z.string().optional(),
  rubro: z.enum(['automotive', 'health', 'fitness', 'beauty', 'gastronomy', 'retail', 'real-estate', 'other']).optional(),
})

export async function completeOnboardingAction(input: z.infer<typeof CompleteOnboardingSchema>) {
  const session = await auth()
  if (!session?.user) {
    return { ok: false as const, error: 'No autorizado' }
  }

  const organizationId = await resolveOrgId()
  if (!organizationId) {
    return { ok: false as const, error: 'Organización no encontrada' }
  }

  const parsed = CompleteOnboardingSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      companyName: parsed.data.companyName,
      whatsapp: parsed.data.whatsapp,
      analyticsPropertyId: parsed.data.ga4MeasurementId,
      // TODO: Agregar contactEmail a Organization en próximos sprints
      // TODO: Agregar rubro a Organization en próximos sprints
      onboardingCompleted: true,
    },
  })

  // Actualizar también la marca si se seleccionó rubro (opcional)
  if (parsed.data.rubro) {
    await prisma.clientBrandProfile.upsert({
      where: { organizationId },
      update: {
        targetAudience: `Rubro: ${parsed.data.rubro}`,
      },
      create: {
        organizationId,
        targetAudience: `Rubro: ${parsed.data.rubro}`,
      }
    })
  }

  revalidatePath('/dashboard', 'layout')
  return { ok: true as const }
}
