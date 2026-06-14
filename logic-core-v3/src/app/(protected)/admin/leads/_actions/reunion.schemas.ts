/**
 * LeadOS B7 — Schemas del cierre de loop post-reunión (SOLO admin).
 * GANADO lo marca Franco — es el evento que a futuro dispara el 20%
 * (acá solo se registra, sin cálculo de comisión).
 */
import { z } from 'zod'
import { RESULTADO_REUNION_VALUES } from '@/lib/leados/contracts'
import { LeadIdSchema } from './lead.schemas'

export const MarcarRealizadaSchema = z.object({
  leadId: LeadIdSchema,
})

export const ResultadoReunionInputSchema = z.object({
  leadId: LeadIdSchema,
  tipo: z.enum(RESULTADO_REUNION_VALUES),
  nota: z
    .string()
    .trim()
    .max(1000, 'Resumila en menos de 1000 caracteres')
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
})

export type ResultadoReunionInput = z.infer<typeof ResultadoReunionInputSchema>
