'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// P1-12: convierte el valor de FormData a string sin un `as` que enmascare el
// tipo real (FormDataEntryValue puede ser File). No-string → ''.
function formString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : ''
}

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const OnboardingProfileSchema = z.object({
  companyName: z.string().min(1, 'El nombre de empresa es requerido.'),
  logoUrl: z.preprocess(
    emptyToUndefined,
    z.string().url('La URL del logo no es válida.').optional()
  ),
})

interface OnboardingData {
  primaryColor?: string
  secondaryColor?: string
  toneOfVoice?: string
  targetAudience?: string
  domainCredentials?: string
  socialCredentials?: string
}

// ─── Save profile from bienvenida wizard ──────────────────────────────────────

export async function saveOnboardingProfile(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const organizationId = await resolveOrgId()

  if (!organizationId) {
    return 'Sesión inválida. Por favor ingresá de nuevo.'
  }

  const parsed = OnboardingProfileSchema.safeParse({
    companyName: formString(formData.get('companyName')).trim(),
    logoUrl: formString(formData.get('logoUrl')).trim(),
  })

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? 'Datos inválidos.'
  }

  const { companyName, logoUrl } = parsed.data

  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        companyName,
        ...(logoUrl ? { logoUrl } : {}),
        onboardingCompleted: true,
      },
    })
  } catch {
    return 'Error al guardar el perfil. Intentá de nuevo.'
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

// ─── Complete full onboarding (brand + access) ────────────────────────────────

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
    revalidatePath('/dashboard', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error in completeOnboardingAction:', error)
    return { success: false, error: 'Ocurrió un error al procesar el onboarding.' }
  }
}
