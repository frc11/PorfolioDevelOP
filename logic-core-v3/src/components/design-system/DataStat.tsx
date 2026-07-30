import { cn } from '@/lib/utils'
import { accentTextClass, type ServiceAccent } from './accent'
import { Eyebrow } from './Eyebrow'

interface DataStatProps {
  /** El dato ya formateado. El componente no formatea ni calcula nada. */
  value: string
  label: string
  /** Acento aplicado al valor, no al label. */
  accent?: ServiceAccent
  className?: string
}

/**
 * Dato duro: valor en `--text-ds-data` (mono, 500) con su label de Eyebrow
 * debajo. `tabular-nums` para que una columna de cifras quede alineada.
 */
export function DataStat({ value, label, accent, className }: DataStatProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span
        className={cn(
          'font-ds-mono text-ds-data tabular-nums',
          accent ? accentTextClass[accent] : 'text-ds-fg',
        )}
      >
        {value}
      </span>
      <Eyebrow>{label}</Eyebrow>
    </div>
  )
}
