import { Check, AlertCircle, Loader2, RotateCw } from 'lucide-react'
import type { CrmSyncStatus } from '@prisma/client'
import { Badge } from '@/components/ui/Badge'

interface CrmSyncBadgeProps {
  status: CrmSyncStatus
  size?: 'xs' | 'sm' | 'md'
}

const STATUS_CONFIG = {
  SUCCESS: {
    label: 'Sincronizado',
    variant: 'success' as const,
    icon: Check,
    spin: false,
  },
  FAILED: {
    label: 'Falló sync',
    variant: 'danger' as const,
    icon: AlertCircle,
    spin: false,
  },
  PENDING: {
    label: 'Sincronizando',
    variant: 'info' as const,
    icon: Loader2,
    spin: true,
  },
  RETRYING: {
    label: 'Reintentando',
    variant: 'warning' as const,
    icon: RotateCw,
    spin: true,
  },
} as const satisfies Record<CrmSyncStatus, {
  label: string
  variant: 'success' | 'danger' | 'info' | 'warning'
  icon: typeof Check
  spin: boolean
}>

/**
 * B5.8 — Chip de estado del sync a CRM. Pensado para mostrar en el historial
 * del card de config y dentro del detalle del lead. Lee el status EFECTIVO,
 * no el crudo: el caller ya tiene que haberlo pasado por getEffectiveSyncStatus().
 */
export function CrmSyncBadge({ status, size = 'sm' }: CrmSyncBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon

  return (
    <Badge
      variant={cfg.variant}
      size={size}
      icon={
        <Icon
          className={`h-3 w-3 ${cfg.spin ? 'animate-spin' : ''}`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      }
    >
      {cfg.label}
    </Badge>
  )
}
