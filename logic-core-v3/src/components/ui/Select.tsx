import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  invalid?: boolean
}

export function Select({ options, invalid, className, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-xl border bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 focus:outline-none',
        invalid
          ? 'border-red-400/40 focus:border-red-400/60'
          : 'border-white/10 focus:border-cyan-400/30',
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
