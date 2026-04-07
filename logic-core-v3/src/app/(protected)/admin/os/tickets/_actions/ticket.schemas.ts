import { TicketStatus } from '@prisma/client'
import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export const TicketIdSchema = z.string().trim().min(1, 'Invalid ticket id')
export const TicketStatusFilterSchema = z.preprocess(
  emptyStringToUndefined,
  z.union([z.nativeEnum(TicketStatus), z.literal('CLOSED')]).optional()
)
export const ListTicketsSchema = z.object({
  status: TicketStatusFilterSchema,
  organizationId: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1, 'Invalid organization id').optional()
  ),
})
export const GetTicketByIdSchema = TicketIdSchema
export const ReplyToTicketSchema = z.object({
  ticketId: TicketIdSchema,
  content: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1, 'La respuesta no puede estar vacia.')
  ),
})
export const UpdateTicketStatusSchema = z.object({
  ticketId: TicketIdSchema,
  status: z.union([z.nativeEnum(TicketStatus), z.literal('CLOSED')]),
})
