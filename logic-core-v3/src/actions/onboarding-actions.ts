'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { revalidatePath } from 'next/cache'

interface OnboardingData {
  primaryColor?: string
  secondaryColor?: string
  toneOfVoice?: string
  targetAudience?: string
  domainCredentials?: string
  socialCredentials?: string
}

export async function completeOnboardingAction(data: OnboardingData) {
  const session = await auth()
  const organizationId = await resolveOrgId()
  
  if (!organizationId) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Guardar Brand Profile
      if (data.primaryColor || data.secondaryColor || data.toneOfVoice || data.targetAudience) {
        await tx.clientBrandProfile.upsert({
          where: { organizationId },
          update: {
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            toneOfVoice: data.toneOfVoice,
            targetAudience: data.targetAudience,
          },
          create: {
            organizationId,
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            toneOfVoice: data.toneOfVoice,
            targetAudience: data.targetAudience,
          }
        })
      }

      // 2. Guardar Credenciales Técnicas en Bóveda si existen
      if (data.domainCredentials) {
        await tx.clientAsset.create({
          data: {
            organizationId,
            name: 'Credenciales de Dominio/Hosting',
            url: 'ENCRIPTADO_EN_TEXTO',
            type: 'ACCESS',
            description: data.domainCredentials
          }
        })
      }

      if (data.socialCredentials) {
        await tx.clientAsset.create({
          data: {
            organizationId,
            name: 'Credenciales de Redes Sociales',
            url: 'ENCRIPTADO_EN_TEXTO',
            type: 'ACCESS',
            description: data.socialCredentials
          }
        })
      }

      // 3. Destrabar cuenta
      await tx.organization.update({
        where: { id: organizationId },
        data: { onboardingCompleted: true }
      })
    })

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error in completeOnboardingAction:', error)
    return { success: false, error: 'Ocurrió un error al procesar el onboarding.' }
  }
}
