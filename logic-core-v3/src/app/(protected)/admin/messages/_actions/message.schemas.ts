import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export const MessageOrganizationIdSchema = z.string().trim().min(1, 'Invalid organization id')
export const GetConversationSchema = MessageOrganizationIdSchema
export const MarkAsReadSchema = MessageOrganizationIdSchema
export const SendMessageSchema = z.object({
  organizationId: MessageOrganizationIdSchema,
  content: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1, 'El mensaje no puede estar vacio.')
  ),
})
