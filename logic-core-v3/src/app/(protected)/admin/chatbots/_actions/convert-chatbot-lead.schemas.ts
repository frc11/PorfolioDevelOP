import { z } from 'zod'

export const ConvertChatbotLeadSchema = z.object({
  chatbotLeadId: z.string().trim().min(1, 'Lead inválido.'),
})
