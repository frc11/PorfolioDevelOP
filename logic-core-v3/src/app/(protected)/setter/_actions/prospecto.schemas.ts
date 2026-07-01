import { z } from 'zod'

/**
 * Sprint A.1 — Validación del alta propia del setter. Vive separada de la action
 * (sin `'use server'`) para reusarla TAMBIÉN en el cliente (feedback inmediato del
 * form) sin arrastrar dependencias server-only.
 *
 * Mismo idiom que el alta del admin (`lead.schemas.ts`): un string vacío del form
 * es "sin dato", no `""` — se normaliza a `undefined` para que el campo quede null
 * en la DB en vez de un string vacío.
 */
const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const optionalString = z.preprocess(emptyToUndefined, z.string().optional())
const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email('Email inválido').optional(),
)
const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url('Link inválido — pegá la URL completa (https://…)').optional(),
)

/**
 * Alta propia del setter. SOLO los campos que el setter controla: `businessName`
 * es el único mínimo para entrar a FICHA; el resto es contexto opcional de lo que
 * sabe del negocio que encontró.
 *
 * Sin `assignedToId`, `caliente` ni `source`: el `z.object` DESCARTA cualquier
 * clave extra que mande el cliente — primera línea del anti-IDOR de escritura. La
 * segunda y definitiva es `ownedLeadCreateData`, que fuerza el dueño a la sesión.
 */
export const NuevoProspectoSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, 'Poné el nombre del negocio — es lo mínimo para empezar la ficha')
    .max(200, 'Demasiado largo para un nombre de negocio'),
  contactName: optionalString,
  phone: optionalString,
  email: optionalEmail,
  industry: optionalString,
  zone: optionalString,
  instagramUrl: optionalUrl,
  currentWebUrl: optionalUrl,
  notes: optionalString,
})

export type NuevoProspectoInput = z.infer<typeof NuevoProspectoSchema>
