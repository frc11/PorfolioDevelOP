import { z } from 'zod'

const emptyValueToUndefined = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  return value
}

export const ProjectIdSchema = z.string().cuid('Invalid project id')
export const PaymentIdSchema = z.string().cuid('Invalid payment id')

const positiveNumberSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().positive('Amount must be positive')
)

export const CreateMaintenancePaymentSchema = z.object({
  projectId: ProjectIdSchema,
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  amount: positiveNumberSchema,
})

export const MarkMaintenancePaidSchema = z.object({
  paymentId: PaymentIdSchema,
})
