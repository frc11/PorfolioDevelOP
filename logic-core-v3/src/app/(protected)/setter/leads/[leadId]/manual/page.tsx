import { notFound, redirect } from 'next/navigation'
import { rutaManual } from '@/lib/leados/manual'
import { cargarManualDelLead } from './_data'

export const dynamic = 'force-dynamic'

type ManualIndexProps = {
  params: Promise<{ leadId: string }>
}

/**
 * Entrada del manual sin pantalla: re-deriva la posición del lead y aterriza
 * en la actual. La posición nunca se persiste — cada entrada la recalcula de
 * stage + datos capturados + checklist.
 */
export default async function ManualDelLeadPage({ params }: ManualIndexProps) {
  const { leadId } = await params
  const manual = await cargarManualDelLead(leadId)
  // Regla de oro de ownership: lead ajeno o inexistente → 404, sin leakear.
  if (!manual) notFound()
  redirect(rutaManual(leadId, manual.posicion.actual))
}
