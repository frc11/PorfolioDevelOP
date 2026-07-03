import { Badge } from '@/components/ui'

/** Badge fijo del paso: la secuencia del shell es provisoria por diseño. */
export function BadgeProvisorio() {
  return (
    <Badge tone="amber" variant="outline">
      Guía preliminar — en validación
    </Badge>
  )
}
