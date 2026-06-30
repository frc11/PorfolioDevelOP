'use server'

// P1.C — Acción org-scoped para el perfil de negocio del cliente. Por ahora un
// solo dato: el ticket promedio (USD), que el home usa para estimar la plata que
// genera la web. Mismo patrón de seguridad que el resto del dashboard cliente:
// el organizationId sale de la sesión (resolveOrgId), NUNCA del input → no hay
// vía para tocar otra org. Validación con Zod.

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'

const AverageTicketSchema = z.object({
  // USD entero, positivo. Tope defensivo amplio para no rechazar negocios de
  // ticket alto (inmobiliaria, autos), pero cerrar valores absurdos.
  averageTicketUsd: z.number().int().positive().max(100_000_000),
})

export type SaveAverageTicketResult = { ok: true } | { ok: false; error: string }

export async function saveAverageTicket(
  input: z.infer<typeof AverageTicketSchema>,
): Promise<SaveAverageTicketResult> {
  const organizationId = await resolveOrgId()
  if (!organizationId) return { ok: false, error: 'Tu sesión expiró. Volvé a entrar.' }

  const parsed = AverageTicketSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Ingresá un monto válido en dólares (entero, mayor a 0).' }
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { averageTicketUsd: parsed.data.averageTicketUsd },
  })

  revalidatePath('/dashboard')
  return { ok: true }
}
