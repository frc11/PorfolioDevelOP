'use server'

import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  type ActionResult,
  UpdatePasswordSchema,
  UpdateProfileSchema,
} from './schemas'

export type ProfileActionState = ActionResult | null

export interface NotificationPrefs {
  projectUpdates: boolean
  teamMessages: boolean
  metricAlerts: boolean
  developNews: boolean
  emailNotificationsOnMessage: boolean
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  const userId = session?.user?.id

  if (!organizationId || !userId) {
    return { success: false, error: 'Sesión inválida.' }
  }

  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get('name'),
    companyName: formData.get('companyName'),
    logoUrl: formData.get('logoUrl'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    const logoUrl =
      parsed.data.logoUrl && parsed.data.logoUrl !== '' ? parsed.data.logoUrl : null

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name: parsed.data.name },
      }),
      prisma.organization.update({
        where: { id: organizationId },
        data: {
          companyName: parsed.data.companyName,
          logoUrl,
        },
      }),
    ])

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('updateProfileAction error:', error)
    return { success: false, error: 'No se pudo actualizar el perfil.' }
  }
}

export async function updateContactAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()
  const organizationId = session?.user?.organizationId

  if (!organizationId) {
    return { success: false, error: 'Sesión inválida.' }
  }

  const whatsapp = ((formData.get('whatsapp') as string | null) ?? '').trim() || null

  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { whatsapp },
    })

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    console.error('updateContactAction error:', error)
    return { success: false, error: 'No se pudo actualizar el contacto.' }
  }
}

export async function updateNotificationPrefsAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  const userId = session?.user?.id

  if (!organizationId || !userId) {
    return { success: false, error: 'Sesión inválida.' }
  }

  const prefs: NotificationPrefs = {
    projectUpdates: formData.get('projectUpdates') === 'true',
    teamMessages: formData.get('teamMessages') === 'true',
    metricAlerts: formData.get('metricAlerts') === 'true',
    developNews: formData.get('developNews') === 'true',
    emailNotificationsOnMessage: formData.get('emailNotificationsOnMessage') === 'true',
  }

  const organizationPrefs = {
    projectUpdates: prefs.projectUpdates,
    teamMessages: prefs.teamMessages,
    metricAlerts: prefs.metricAlerts,
    developNews: prefs.developNews,
  }

  try {
    await prisma.$transaction([
      prisma.organization.update({
        where: { id: organizationId },
        data: { notificationPrefs: organizationPrefs },
      }),
      prisma.orgMember.updateMany({
        where: { organizationId, userId },
        data: { emailNotificationsOnMessage: prefs.emailNotificationsOnMessage },
      }),
    ])

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard/cuenta/perfil')
    return { success: true }
  } catch (error) {
    console.error('updateNotificationPrefsAction error:', error)
    return { success: false, error: 'No se pudieron guardar las preferencias.' }
  }
}

export async function requestAccountDeletionAction(): Promise<ActionResult> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  const userId = session?.user?.id

  if (!organizationId || !userId) {
    return { success: false, error: 'Sesión inválida.' }
  }

  try {
    await prisma.ticket.create({
      data: {
        title: 'Solicitud de eliminación de cuenta',
        category: 'OTHER',
        priority: 'HIGH',
        status: 'OPEN',
        organizationId,
        userId,
        messages: {
          create: {
            content:
              'El cliente solicita la eliminación de su cuenta y todos los datos asociados. Por favor procesar esta solicitud según los procedimientos vigentes.',
            userId,
            isAdmin: false,
          },
        },
      },
    })

    revalidatePath('/dashboard/soporte')
    return { success: true }
  } catch (error) {
    console.error('requestAccountDeletionAction error:', error)
    return { success: false, error: 'No se pudo crear la solicitud de eliminación.' }
  }
}

export async function updatePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: 'Sesión inválida.' }
  }

  const parsed = UpdatePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user?.password) {
      return { success: false, error: 'No se encontró contraseña registrada.' }
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password)
    if (!isValid) {
      return { success: false, error: 'La contraseña actual es incorrecta.' }
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    console.error('updatePasswordAction error:', error)
    return { success: false, error: 'No se pudo actualizar la contraseña.' }
  }
}
