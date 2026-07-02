'use server'

// P2.B.2 — el dueño elige frecuencia y cantidad de leads destacados del
// reporte ejecutivo semanal. Mismo patrón que saveAverageTicket
// (business-profile.actions.ts): objeto tipado + Zod + resolveOrgId() (el
// organizationId sale SIEMPRE de la sesión, nunca de un parámetro) +
// {ok}|{error}. NO el patrón de updateNotificationPrefsAction (FormData sin
// Zod, sin soporte de impersonation).

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import {
  ExecutiveReportPrefsSchema,
  type ExecutiveReportPrefsInput,
} from './executive-report-prefs.schemas'

export type SaveExecutiveReportPrefsResult = { ok: true } | { ok: false; error: string }

export async function saveExecutiveReportPrefs(
  input: ExecutiveReportPrefsInput,
): Promise<SaveExecutiveReportPrefsResult> {
  const organizationId = await resolveOrgId()
  if (!organizationId) return { ok: false, error: 'Tu sesión expiró. Volvé a entrar.' }

  const parsed = ExecutiveReportPrefsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      executiveReportFrequency: parsed.data.frequency,
      executiveReportLeadCount: parsed.data.leadCount,
      // Elegir una frecuencia activa desde el dashboard es una señal explícita
      // de "quiero volver a recibirlo" — limpiamos el opt-out del link de
      // unsubscribe (hoy no existe ningún otro camino de vuelta, ver P2.B.2 en
      // la bitácora). Si eligió "No recibir" no tocamos el flag viejo: DISABLED
      // ya bloquea el envío por su cuenta (build.ts chequea ambos con OR).
      ...(parsed.data.frequency !== 'DISABLED' ? { executiveReportOptOut: false } : {}),
    },
  })

  revalidatePath('/dashboard/cuenta/perfil')
  return { ok: true }
}
