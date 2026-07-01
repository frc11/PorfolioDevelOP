'use client'

import Link from 'next/link'
import { FileSpreadsheet, Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui'

/**
 * Cartera vacía del home-hub. Client component porque EmptyState es client y
 * los íconos de Lucide no sobreviven la serialización RSC desde la page.
 */
export function HomeEmpty() {
  return (
    <div className="flex flex-col items-center gap-3">
      <EmptyState
        icon={Inbox}
        size="lg"
        title="Tu cartera está vacía"
        description="Franco te asigna negocios para prospectar — y vos también podés cargar los tuyos. Aparecen acá, agrupados por lo que toca hacer con cada uno."
        cta={{ label: 'Cargar un prospecto', href: '/setter/nuevo' }}
      />
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
