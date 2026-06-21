/**
 * 🧪 EXPERIMENTAL / DESCARTABLE — FG-2.0.
 *
 * Lab del experimento: testea si un formulario estructurado produce mejores
 * demos que el prompteo libre, para UN rubro (gastronomía). Gated SUPER_ADMIN por
 * el layout de /admin. NO está linkeado en el sidebar a propósito: se entra por
 * URL. SOLO LEE fichas (read-only) para autocompletar — no toca el flujo del
 * setter ni escribe nada. Borrar tras la decisión del experimento.
 *
 * Protocolo del experimento: docs/experimentos/fg2-brief-experimento.md
 */
import type { Metadata } from 'next'
import { FlaskConical } from 'lucide-react'
import { Callout } from '@/components/ui'
import { prisma } from '@/lib/prisma'
import { parseFicha } from '@/lib/leados/flow'
import type { LabLead } from '@/lib/leados/_experimental/fg2-brief-lab'
import { Fg2LabClient } from './_components/fg2-lab-client'

export const metadata: Metadata = {
  title: 'FG-2 Lab · LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

export default async function Fg2LabPage() {
  // Read-only: fichas con señal para precargar el formulario. Volumen chico
  // (un setter). Solo strings al cliente — sin Dates, nada que romper al serializar.
  const dossiers = await prisma.osLeadDossier.findMany({
    take: 200,
    orderBy: { updatedAt: 'desc' },
    select: {
      leadId: true,
      fichaJson: true,
      lead: {
        select: {
          businessName: true,
          industry: true,
          zone: true,
          instagramUrl: true,
          currentWebUrl: true,
          googleMapsUrl: true,
        },
      },
    },
  })

  const leads: LabLead[] = dossiers.flatMap((dossier) => {
    const ficha = parseFicha(dossier.fichaJson)
    if (!ficha) return []
    const tieneSenal = Boolean(ficha.resenas || ficha.contenidoReal || ficha.presenciaDigital)
    if (!tieneSenal) return []
    return [
      {
        id: dossier.leadId,
        businessName: dossier.lead.businessName,
        industry: dossier.lead.industry,
        zone: dossier.lead.zone,
        resenas: ficha.resenas ?? '',
        tonoContenido: ficha.contenidoReal ?? '',
        instagram: dossier.lead.instagramUrl ?? '',
        maps: dossier.lead.googleMapsUrl ?? '',
        web: dossier.lead.currentWebUrl ?? '',
      },
    ]
  })

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-white">
          <FlaskConical size={22} strokeWidth={1.5} className="text-cyan-300" />
          FG-2 Lab — Formulario estructurado (gastronomía)
        </h1>
        <Callout tone="warning" icon={FlaskConical} title="Prototipo experimental — descartable" accent>
          <p className="text-sm leading-relaxed text-zinc-300">
            Esto NO es producción ni parte del flujo del setter. Es el prototipo para correr el
            experimento de FG-2: ¿un formulario estructurado da mejores demos que el prompteo libre?
            Generá las 5 demos del rubro con este formulario, registrá costo y calidad con el harness,
            y compará contra 5 hechas a mano. El protocolo completo está en{' '}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-[11px] text-cyan-200">
              docs/experimentos/fg2-brief-experimento.md
            </code>
            .
          </p>
        </Callout>
      </header>

      <Fg2LabClient leads={leads} />
    </section>
  )
}
