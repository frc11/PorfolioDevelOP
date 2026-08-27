'use client'

// EmptyState es client y los íconos de Lucide no sobreviven la serialización
// RSC: este boundary se marca client entero (convención del repo).
import { SearchX } from 'lucide-react'
import { EmptyState } from '@/components/ui'

export default function SetterNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      size="lg"
      title="Ese lead no está en tu cartera"
      description="O no existe, o no está asignado a vos. Volvé al inicio y seguí con los tuyos."
      cta={{ label: 'Volver a tu día', href: '/setter' }}
    />
  )
}
