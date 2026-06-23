import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client'
import { z } from 'zod'

export const CreateTicketSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres.'),
  description: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
})

export const TicketReplySchema = z.object({
  ticketId: z.string().trim().min(1, 'Ticket no especificado.'),
  content: z
    .string()
    .trim()
    .min(1, 'La respuesta no puede estar vacía.')
    .max(2000, 'La respuesta es demasiado larga.'),
})

export const UpdateTicketStatusSchema = z.object({
  ticketId: z.string().trim().min(1, 'Ticket no especificado.'),
  status: z.union([z.nativeEnum(TicketStatus), z.literal('CLOSED')]),
})
