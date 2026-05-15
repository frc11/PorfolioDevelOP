import { z } from 'zod'

export const ContactSubmissionIdSchema = z
  .string()
  .trim()
  .min(1, 'Invalid contact submission id')
export const ConvertInboundToLeadSchema = z.object({
  contactSubmissionId: ContactSubmissionIdSchema,
})
