'use client'

// P1.C-fix1 — Empty state animado de las secciones del home (Origen, Embudo).
// Vive en un Client Component a propósito: la animación (FadeIn → motion) y el
// ícono (lucide, que es una función-componente) NO pueden cruzar la frontera
// Server→Client como props. El Server Component (LeadOrigins/LeadFunnel) le pasa
// SOLO data serializable (un `variant` string + textos); el ícono se resuelve
// acá adentro por la key. Misma animación y diseño B13 que antes.

import { Compass, Filter, type LucideIcon } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'

export type SectionEmptyVariant = 'origin' | 'funnel'

const ICONS: Record<SectionEmptyVariant, LucideIcon> = {
  origin: Compass,
  funnel: Filter,
}

interface SectionEmptyStateProps {
  variant: SectionEmptyVariant
  title: string
  description: string
}

export function SectionEmptyState({ variant, title, description }: SectionEmptyStateProps) {
  return (
    <FadeIn>
      {/* Tratamiento MUTED (dashed, sin cápsula teal) — canon del repo para
          secciones/listas sin datos ("calibrando"). */}
      <EmptyStateMuted icon={ICONS[variant]} title={title} description={description} />
    </FadeIn>
  )
}
