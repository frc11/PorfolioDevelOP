'use server'

import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PREMIUM_FEATURE_KEYS, PREMIUM_FEATURE_LABELS, type PremiumFeatureKey } from '@/lib/premium-features'
import { seedOnboardingTasksForOrg } from '@/lib/onboarding/seed-tasks-for-org'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function uniqueSlug(base: string, excludeOrgId?: string): Promise<string> {
  let slug = slugify(base)
  let counter = 1

  while (true) {
    const existing = await prisma.organization.findFirst({
      where: {
        slug,
        ...(excludeOrgId ? { NOT: { id: excludeOrgId } } : {}),
      },
    })

    if (!existing) return slug

    slug = `${slugify(base)}-${counter}`
    counter += 1
  }
}

export async function createClientAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const companyName = (formData.get('companyName') as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const logoUrl = (formData.get('logoUrl') as string | null)?.trim() || null

  if (!companyName || !email || !password || !name) {
    return 'Todos los campos obligatorios deben estar completos.'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'El email no tiene un formato valido.'
  }

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return 'Ya existe un usuario con ese email.'
  }

  const slug = await uniqueSlug(companyName)
  const hashedPassword = await bcrypt.hash(password, 12)

  let newOrgId: string | undefined
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.ORG_MEMBER,
          emailVerified: new Date(),
        },
      })

      const org = await tx.organization.create({
        data: { companyName, slug, logoUrl },
      })

      newOrgId = org.id

      await tx.orgMember.create({
        data: { userId: user.id, organizationId: org.id, role: 'ADMIN' },
      })
    })
  } catch {
    return 'Error al crear el cliente. Intenta de nuevo.'
  }

  if (newOrgId) {
    await seedOnboardingTasksForOrg(newOrgId).catch((e) =>
      console.error('[Onboarding] Error seeding tasks:', e),
    )
  }

  revalidatePath('/admin/clients')
  redirect('/admin/clients')
}

export async function updateClientAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const clientId = (formData.get('clientId') as string | null) ?? ''
  const companyName = (formData.get('companyName') as string | null)?.trim() ?? ''
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const logoUrl = (formData.get('logoUrl') as string | null)?.trim() || null
  const analyticsPropertyId =
    (formData.get('analyticsPropertyId') as string | null)?.trim() || null
  const siteUrl = (formData.get('siteUrl') as string | null)?.trim() || null
  const n8nWorkflowIds = ((formData.get('n8nWorkflowIds') as string | null) ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  if (!clientId) return 'ID de cliente invalido.'
  if (!companyName || !name) {
    return 'Nombre de empresa y contacto son obligatorios.'
  }

  const org = await prisma.organization.findUnique({
    where: { id: clientId },
    select: {
      companyName: true,
      members: {
        where: { role: 'ADMIN' },
        select: { userId: true },
        take: 1,
      },
    },
  })

  if (!org) return 'Cliente no encontrado.'

  const slug = companyName !== org.companyName ? await uniqueSlug(companyName, clientId) : undefined
  const adminUserId = org.members[0]?.userId

  try {
    await prisma.$transaction([
      prisma.organization.update({
        where: { id: clientId },
        data: {
          companyName,
          logoUrl,
          analyticsPropertyId,
          siteUrl,
          n8nWorkflowIds,
          ...(slug ? { slug } : {}),
        },
      }),
      ...(adminUserId
        ? [
            prisma.user.update({
              where: { id: adminUserId },
              data: {
                name,
              },
            }),
          ]
        : []),
    ])
  } catch {
    return 'Error al actualizar el cliente. Intenta de nuevo.'
  }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect(`/admin/clients/${clientId}`)
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  const clientId = (formData.get('clientId') as string | null) ?? ''
  if (!clientId) return

  const org = await prisma.organization.findUnique({ where: { id: clientId } })
  if (!org) return

  await prisma.organization.delete({ where: { id: clientId } })

  revalidatePath('/admin/clients')
  redirect('/admin/clients')
}

export async function toggleClientFeatureAction(input: {
  clientId: string
  featureKey: PremiumFeatureKey
  enabled: boolean
}) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'No autorizado.' }
  }

  if (!PREMIUM_FEATURE_KEYS.includes(input.featureKey)) {
    return { success: false, error: 'Módulo inválido.' }
  }

  const organization = await prisma.organization.findUnique({
    where: { id: input.clientId },
    select: {
      companyName: true,
      members: {
        where: { role: 'ADMIN' },
        select: {
          userId: true,
          user: {
            select: {
              unlockedFeatures: true,
            },
          },
        },
        take: 1,
      },
    },
  })

  const adminUser = organization?.members[0]

  if (!organization || !adminUser) {
    return { success: false, error: 'Cliente no encontrado.' }
  }

  const nextFeatures = input.enabled
    ? Array.from(new Set([...adminUser.user.unlockedFeatures, input.featureKey]))
    : adminUser.user.unlockedFeatures.filter((feature) => feature !== input.featureKey)

  await prisma.user.update({
    where: { id: adminUser.userId },
    data: {
      unlockedFeatures: nextFeatures,
    },
  })

  revalidatePath(`/admin/clients/${input.clientId}/edit`)
  revalidatePath(`/admin/clients/${input.clientId}`)
  revalidatePath('/dashboard', 'layout')

  return {
    success: true,
    features: nextFeatures,
    message: `Módulo ${PREMIUM_FEATURE_LABELS[input.featureKey]} ${input.enabled ? 'activado' : 'desactivado'} para ${organization.companyName}`,
  }
}
