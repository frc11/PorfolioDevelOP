/**
 * LeadOS B5 — Schemas de input de las actions de revisión del admin.
 * Compartidos client-side (feedback por campo) y server-side (la action
 * re-parsea siempre, mismo criterio que el resto del repo).
 */
import { z } from 'zod'

export const LeadIdSchema = z.string().trim().min(1, 'Lead inválido')

/**
 * La URL permanente que el admin acaba de publicar a mano en Netlify bajo
 * develOP. El panel NO publica nada: solo la registra. https obligatorio.
 */
export const FinalUrlSchema = z
  .string()
  .trim()
  .url('Pegá una URL válida (https://…)')
  .refine((value) => value.startsWith('https://'), {
    message: 'La URL permanente tiene que ser https://',
  })

export const AprobarRevisionSchema = z.object({
  leadId: LeadIdSchema,
  finalUrl: FinalUrlSchema,
})

export type AprobarRevisionInput = z.infer<typeof AprobarRevisionSchema>

/**
 * Rechazo estructurado: los tres campos son obligatorios para que el setter
 * reciba dirección accionable, no un "está mal" a secas.
 */
export const RechazarRevisionSchema = z.object({
  leadId: LeadIdSchema,
  motivo: z
    .string()
    .trim()
    .min(1, 'Decí qué está mal — corto y directo')
    .max(280, 'Máximo 280 caracteres: si es más largo, va en el arreglo'),
  donde: z
    .string()
    .trim()
    .min(1, 'Decí dónde: sección o elemento de la demo')
    .max(280, 'Máximo 280 caracteres'),
  arreglo: z
    .string()
    .trim()
    .min(1, 'Decí el arreglo concreto: qué tiene que hacer el setter')
    .max(2000, 'Máximo 2000 caracteres'),
})

export type RechazarRevisionInput = z.infer<typeof RechazarRevisionSchema>
