'use client'

import { Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui'

/**
 * Cartera vacía del home-hub. Client component porque EmptyState es client y
 * los íconos de Lucide no sobreviven la serialización RSC desde la page.
 */
export function HomeEmpty() {
  return (
    <EmptyState
      icon={Inbox}
      size="lg"
      title="Todavía no tenés leads asignados"
      description="Franco te asigna los negocios a prospectar y aparecen acá, agrupados por lo que hay que hacer con cada uno."
    />
  )
}
