import { z } from 'zod'
import { avatarImageUrlSchema } from '@/modules/chatbot/server/admin/avatarImageUrlSchema'

export type ActionResult<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

export const SendMessageSchema = z.object({
  content: z.string().trim().min(1, 'El mensaje no puede estar vacío.').max(1000, 'El mensaje es demasiado largo.'),
})

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  companyName: z.string().trim().min(2, 'La empresa debe tener al menos 2 caracteres.'),
  avatarImageUrl: avatarImageUrlSchema,
  avatarEmoji: z.string().trim().max(8, 'Emoji inválido.').nullable(),
  avatarInitials: z.string().trim().max(2, 'Máximo 2 caracteres.').nullable(),
})

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual.'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
      .regex(/[A-Z]/, 'La nueva contraseña debe incluir al menos una mayúscula.')
      .regex(/[0-9]/, 'La nueva contraseña debe incluir al menos un número.'),
    confirmPassword: z.string().min(1, 'Confirmá tu nueva contraseña.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'La nueva contraseña y la confirmación no coinciden.',
  })

export const OrganizationIdSchema = z.object({
  organizationId: z.string().trim().min(1, 'Cliente no especificado.'),
})

export const NotificationIdSchema = z.object({
  id: z.string().trim().min(1, 'Notificación inválida.'),
})

export const UpsellRequestSchema = z.object({
  featureKey: z.string().trim().min(1, 'Feature inválida.'),
  featureName: z.string().trim().min(1, 'Nombre de feature inválido.'),
})

// P3-A.1 — id de location GBP para setActiveLocation. Acepta id pelado o resource name;
// la validación real de pertenencia es server-side (re-descubre con los tokens de la org).
export const SetActiveLocationSchema = z.object({
  locationId: z.string().trim().min(1, 'Ubicación inválida.').max(200, 'Ubicación inválida.'),
})

export const ContactFormSchema = z.object({
  name: z.string().trim().min(2, 'Nombre inválido.'),
  email: z.string().trim().email('El email no es válido.'),
  phone: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  service: z.string().trim().optional().nullable(),
  message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
  // P5.5 — código de referido que trajo a este negocio (viene del link /contact?ref=...).
  referralCode: z.string().trim().max(64, 'Código inválido.').optional().nullable(),
})

export const TaskApprovalSchema = z.object({
  taskId: z.string().trim().min(1, 'Tarea inválida.'),
})

export const TaskRejectionSchema = z.object({
  taskId: z.string().trim().min(1, 'Tarea inválida.'),
  reason: z.string().trim().min(3, 'Indicá el motivo del rechazo.').max(1000, 'El motivo es demasiado largo.'),
})

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Email inválido.')
    .max(254, 'Email demasiado largo.')
    .email('Email inválido.'),
})

export const ResetPasswordSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(32, 'Token inválido o ausente.')
      .max(128, 'Token inválido.')
      .regex(/^[a-f0-9]+$/i, 'Token inválido.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(128, 'Contraseña demasiado larga.'),
    confirm: z.string().min(1, 'Confirmá la contraseña.'),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Las contraseñas no coinciden.',
  })

export const ResendCredentialsParamsSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, 'Usuario inválido.')
    .max(64, 'Usuario inválido.')
    .regex(/^[a-z0-9]+$/i, 'Usuario inválido.'),
})
