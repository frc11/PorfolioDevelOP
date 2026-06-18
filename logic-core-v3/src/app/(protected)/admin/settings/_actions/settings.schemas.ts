import { z } from 'zod'

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export const UpdateSettingsSchema = z.object({
  contactEmail: z.preprocess(emptyStringToNull, z.string().email().nullable()),
  contactWhatsapp: z.preprocess(emptyStringToNull, z.string().nullable()),
  websiteUrl: z.preprocess(emptyStringToNull, z.string().url().nullable()),
  alertWebhookUrl: z.preprocess(emptyStringToNull, z.string().url().nullable()),
  alertOnTickets: z.boolean(),
  alertOnLeads: z.boolean(),
  alertOnChurn: z.boolean(),
  alertOnExpiringSubscriptions: z.boolean(),
  alertOnClientMessages: z.boolean(),
  osWeeklyDemoTarget: z.coerce.number().int().min(0),
  osTelegramBotToken: z.preprocess(emptyStringToUndefined, z.string().optional()),
  osTelegramChatId: z.preprocess(emptyStringToNull, z.string().nullable()),
})
export const UpdateModulePricingSchema = z.object({
  // moduleKey es el slug real de la tabla PremiumModule (getSettings emite mod.slug).
  // Aca solo validamos formato (string no vacio); la existencia se chequea en la action.
  moduleKey: z.string().trim().min(1, 'Modulo invalido.'),
  price: z.coerce.number().min(0, 'Ingresa un precio valido.'),
})
