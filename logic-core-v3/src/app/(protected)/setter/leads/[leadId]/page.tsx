import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Lead · LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

type SetterLeadPageProps = {
  params: Promise<{ leadId: string }>
}

/**
 * 5.6 — El corte: el manual ES la experiencia del lead. La raíz redirige al
 * índice del manual, el ÚNICO derivador (ownership → 404 sin leakear, deriva
 * la posición del stage + datos capturados y aterriza en la pantalla actual).
 * Los links entrantes (cartera, foco, novedades, alta) siguen apuntando acá —
 * una sola puerta; los `revalidatePath` de las actions siguen válidos.
 */
export default async function SetterLeadPage({ params }: SetterLeadPageProps) {
  const { leadId } = await params
  redirect(`/setter/leads/${leadId}/manual`)
}
