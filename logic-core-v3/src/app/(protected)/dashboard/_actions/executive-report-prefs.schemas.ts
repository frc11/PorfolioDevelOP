import { z } from 'zod'
import { ExecutiveReportFrequency } from '@prisma/client'

// P2.B.2 — separado de executive-report-prefs.actions.ts a propósito: un
// archivo 'use server' solo puede exportar funciones async (Next.js lo
// rechaza en build si exporta algo más), así que el schema reusable vive acá.
// Mismo patrón que admin/clients/_actions/plan.schemas.ts.
export const ExecutiveReportPrefsSchema = z.object({
  frequency: z.nativeEnum(ExecutiveReportFrequency, {
    errorMap: () => ({ message: 'Frecuencia inválida.' }),
  }),
  // Cantidad de leads destacados del reporte — mismo set fijo que ofrece el
  // Select (3 / 5 / 10). Union de literales en vez de un rango: rechaza
  // cualquier valor que no sea exactamente una de las 3 opciones ofrecidas.
  leadCount: z.union([z.literal(3), z.literal(5), z.literal(10)], {
    errorMap: () => ({ message: 'Cantidad de leads inválida (3, 5 o 10).' }),
  }),
})

export type ExecutiveReportPrefsInput = z.infer<typeof ExecutiveReportPrefsSchema>
