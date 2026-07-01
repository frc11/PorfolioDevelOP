import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileSpreadsheet } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import { ImportarProspectosForm } from './importar-prospectos-form'

export const metadata: Metadata = {
  title: 'Importar prospectos · LeadOS',
}

export const dynamic = 'force-dynamic'

export default async function ImportarProspectosPage() {
  // Gate server-side (no alcanza el middleware): solo un setter logueado entra.
  await requireSetter()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="LeadOS"
        title="Importar una lista"
        description="Subí un CSV con varios negocios de una — esa lista que te pasó Franco. Cada fila entra fría, en ficha, a tu cartera: como si los cargaras uno por uno."
        icon={FileSpreadsheet}
      />

      <ImportarProspectosForm />

      <Link
        href="/setter/nuevo"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
      >
        <ArrowLeft size={13} strokeWidth={1.5} aria-hidden />
        Cargar uno solo a mano
      </Link>
    </div>
  )
}
