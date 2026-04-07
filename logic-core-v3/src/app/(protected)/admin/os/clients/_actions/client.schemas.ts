import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export const ClientOrganizationIdSchema = z.string().trim().min(1, 'ID de cliente invalido.')
export const GetClientByIdSchema = ClientOrganizationIdSchema
export const GetClientHealthScoreSchema = ClientOrganizationIdSchema
export const ToggleModulePremiumSchema = z.object({
  organizationId: ClientOrganizationIdSchema,
  moduleKey: z.preprocess(emptyStringToUndefined, z.string().min(1, 'Modulo invalido.')),
  enabled: z.boolean(),
})
