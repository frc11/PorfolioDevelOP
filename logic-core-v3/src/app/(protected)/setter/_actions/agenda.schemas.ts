/**
 * LeadOS B7 — Schemas de input del Paso 10 (agendar la reunión).
 * Compartidos client-side (feedback por campo) y server-side (la action
 * re-parsea siempre). Las notas de traspaso son OBLIGATORIAS: sin contexto
 * no hay traspaso — Franco entra a la reunión sabiendo con quién habla.
 */
import { z } from 'zod'

export const ConfirmarReunionSchema = z.object({
  /** El setter confirma que habla con el dueño/decisor ANTES de ofrecer. */
  decisorConfirmado: z
    .boolean()
    .refine((valor) => valor === true, 'Confirmá que estás hablando con quien decide'),
  /** Start ISO con offset, tal como lo devolvió Cal.com (huso BA). */
  slotStart: z
    .string()
    .datetime({ offset: true, message: 'Elegí uno de los horarios ofrecidos' }),
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre del prospecto — como para saludarlo al entrar')
    .max(120, 'Demasiado largo para un nombre'),
  email: z
    .string()
    .trim()
    .email('Cal.com necesita un email válido — ahí le llega la confirmación'),
  notasTraspaso: z
    .string()
    .trim()
    .min(
      30,
      'Las notas de traspaso son obligatorias: qué le duele, qué espera, qué tono tiene — lo que Franco necesita para entrar a la reunión',
    )
    .max(2000, 'Resumilas en menos de 2000 caracteres'),
})

export type ConfirmarReunionInput = z.infer<typeof ConfirmarReunionSchema>
