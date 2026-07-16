import type { Metadata } from 'next'
import Link from 'next/link'
import { FileSpreadsheet, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import { prisma } from '@/lib/prisma'
import { ownedListWhere } from '@/lib/leados/isolation'
import { NuevoProspectoForm } from './nuevo-prospecto-form'

export const metadata: Metadata = {
  title: 'Cargar prospecto · LeadOS',
}

export const dynamic = 'force-dynamic'

export default async function NuevoProspectoPage() {
  // Gate server-side (no alcanza el middleware): solo un setter logueado entra.
  const userId = await requireSetter()

  // Nombres ya en la cartera del setter — para el aviso NO bloqueante de posible
  // duplicado. Aislado por dueño (`ownedListWhere`): jamás alcanza otra cartera.
  const existentes = await prisma.osLead.findMany({
    where: ownedListWhere(userId),
    select: { businessName: true },
  })
  const nombresExistentes = existentes.map((lead) => lead.businessName)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="LeadOS"
        title="Cargar un prospecto"
        description="Un negocio que encontraste vos. Arranca en Ficha, como cualquier otro — y aparece en tu foco para que lo evalúes."
        icon={UserPlus}
      />
      <NuevoProspectoForm nombresExistentes={nombresExistentes} />

      <Link
        href="/setter/nuevo/importar"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
      >
        <FileSpreadsheet size={13} strokeWidth={1.5} aria-hidden />
        ¿Tenés una lista? Importá varios de una
      </Link>
    </div>
  )
}
