import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-400/30 focus:outline-none ${className ?? ''}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
