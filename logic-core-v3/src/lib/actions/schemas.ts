import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client'
import { z } from 'zod'

export type ActionResult<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

export const SendMessageSchema = z.object({
  content: z.string().trim().min(1, 'El mensaje no puede estar vacío.').max(1000, 'El mensaje es demasiado largo.'),
})

export const CreateTicketSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres.'),
  description: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
})

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  companyName: z.string().trim().min(2, 'La empresa debe tener al menos 2 caracteres.'),
  logoUrl: z.union([z.string().trim().url('La URL del logo no es válida.'), z.literal(''), z.null()]).optional(),
})

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual.'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
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

export const TicketIdSchema = z.object({
  ticketId: z.string().trim().min(1, 'Ticket no especificado.'),
})

export const TicketReplySchema = z.object({
  ticketId: z.string().trim().min(1, 'Ticket no especificado.'),
  content: z.string().trim().min(1, 'La respuesta no puede estar vacía.').max(1000, 'La respuesta es demasiado larga.'),
})

export const UpdateTicketStatusSchema = z.object({
  ticketId: z.string().trim().min(1, 'Ticket no especificado.'),
  status: z.nativeEnum(TicketStatus),
})

export const UpsellRequestSchema = z.object({
  featureKey: z.string().trim().min(1, 'Feature inválida.'),
  featureName: z.string().trim().min(1, 'Nombre de feature inválido.'),
})

export const ContactFormSchema = z.object({
  name: z.string().trim().min(2, 'Nombre inválido.'),
  email: z.string().trim().email('El email no es válido.'),
  phone: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  service: z.string().trim().optional().nullable(),
  message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
})

export const TaskApprovalSchema = z.object({
  taskId: z.string().trim().min(1, 'Tarea inválida.'),
})

export const TaskRejectionSchema = z.object({
  taskId: z.string().trim().min(1, 'Tarea inválida.'),
  reason: z.string().trim().min(3, 'Indicá el motivo del rechazo.').max(1000, 'El motivo es demasiado largo.'),
})
