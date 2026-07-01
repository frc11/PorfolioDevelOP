import { z } from 'zod'

export const ANNOUNCEMENT_TITLE_MAX = 120
export const ANNOUNCEMENT_BODY_MAX = 2000

/**
 * Validación de "publicar novedad". Se valida en cliente (feedback inmediato) y en el
 * server action (fuente de verdad). `expiresOn` es el string yyyy-mm-dd del <input
 * type="date"> ('' = sin caducidad); la conversión a Date la hace el action.
 */
export const CreateAnnouncementSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres.')
      .max(ANNOUNCEMENT_TITLE_MAX, 'El título es demasiado largo.'),
    body: z
      .string()
      .trim()
      .min(5, 'El cuerpo debe tener al menos 5 caracteres.')
      .max(ANNOUNCEMENT_BODY_MAX, 'El cuerpo es demasiado largo.'),
    audience: z.enum(['ALL', 'ORG']),
    organizationId: z.string().trim().min(1).optional().nullable(),
    expiresOn: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.audience !== 'ORG' || Boolean(data.organizationId), {
    path: ['organizationId'],
    message: 'Elegí la organización para una novedad segmentada.',
  })

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>
