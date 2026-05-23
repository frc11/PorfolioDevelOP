import { z } from 'zod'
import { PlanKey } from '@prisma/client'

export const AssignPlanSchema = z.object({
  organizationId: z.string().trim().min(1, 'ID de cliente inválido.'),
  planKey: z.nativeEnum(PlanKey, {
    errorMap: () => ({ message: 'Plan inválido (STARTER / PRO / BUSINESS).' }),
  }),
  reason: z.string().trim().max(500).optional(),
})

export type AssignPlanInput = z.infer<typeof AssignPlanSchema>

export const SetBillingOverrideSchema = z.object({
  organizationId: z.string().trim().min(1, 'ID de cliente inválido.'),
  // Decimal en DB; el form envía number desde el cliente. 0 está permitido (cortesía).
  priceOverride: z.number().min(0).max(100_000),
  // ISO string desde el form. Se convierte a Date en la action.
  overrideUntil: z
    .string()
    .min(1, 'Fecha de vencimiento requerida.')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inválida.')
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      'La fecha de vencimiento debe ser futura.',
    ),
  reason: z.string().trim().max(500).optional(),
})

export type SetBillingOverrideInput = z.infer<typeof SetBillingOverrideSchema>

export const ClearBillingOverrideSchema = z.object({
  organizationId: z.string().trim().min(1, 'ID de cliente inválido.'),
})

export type ClearBillingOverrideInput = z.infer<typeof ClearBillingOverrideSchema>
