'use client'

import { cn } from '@/lib/utils'

type ThemedDateInputProps = {
  /** Etiqueta visible (también sirve de aria-label vía <label> envolvente). */
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Input de fecha nativo themed (sin dependencias de calendario). `color-scheme: dark`
 * pinta el picker nativo acorde al tema. Reutilizado por los filtros del board (Bloque B)
 * y por el filtro inbound "Personalizado" (Bloque D) para que matcheen.
 */
export function ThemedDateInput({ label, value, onChange, className }: ThemedDateInputProps) {
  return (
    <label className={cn('flex flex-col gap-1 text-[11px] text-zinc-400', className)}>
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ colorScheme: 'dark' }}
        className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
      />
    </label>
  )
}
