import { z } from 'zod'

export const ContactSubmissionIdSchema = z
  .string()
  .trim()
  .min(1, 'Invalid contact submission id')
export const ConvertInboundToLeadSchema = z.object({
  contactSubmissionId: ContactSubmissionIdSchema,
})

/** Períodos del filtro de Inbound. */
export const INBOUND_PERIODS = ['1w', '1m', '6m', '1y', 'custom'] as const
export type InboundPeriod = (typeof INBOUND_PERIODS)[number]

/** Default único del período inbound (último mes) — referenciado donde haga falta. */
export const INBOUND_DEFAULT_PERIOD: InboundPeriod = '1m'

/**
 * Rango temporal del listado inbound (server-driven via searchParams). En 'custom'
 * exige `from`/`to` (YYYY-MM-DD) con from <= to; el resto usa un preset relativo.
 */
export const InboundRangeSchema = z
  .object({
    // Acepta el string crudo de searchParams; un período inválido cae al default.
    period: z
      .string()
      .optional()
      .transform((value) => value ?? INBOUND_DEFAULT_PERIOD)
      .pipe(z.enum(INBOUND_PERIODS).catch(INBOUND_DEFAULT_PERIOD)),
    from: z.string().trim().min(1).optional(),
    to: z.string().trim().min(1).optional(),
  })
  .refine((value) => value.period !== 'custom' || (Boolean(value.from) && Boolean(value.to)), {
    message: 'El rango personalizado requiere fecha desde y hasta',
    path: ['from'],
  })
  .refine(
    (value) => {
      if (value.period !== 'custom' || !value.from || !value.to) {
        return true
      }
      const from = new Date(value.from)
      const to = new Date(value.to)
      return (
        !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from.getTime() <= to.getTime()
      )
    },
    { message: 'La fecha desde debe ser anterior o igual a la fecha hasta', path: ['to'] },
  )

export type InboundRangeInput = z.input<typeof InboundRangeSchema>
export type InboundRange = z.output<typeof InboundRangeSchema>
