'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[]
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, invalid, className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        className={cn(
          'w-full appearance-none rounded-xl border bg-white/[0.02] pl-3 py-2 text-sm text-zinc-200 transition-colors focus:outline-none [color-scheme:dark]',
          invalid
            ? 'border-red-400/40 focus:border-red-400/60'
            : 'border-white/10 focus:border-cyan-400/30',
          className,
          'pr-10',
        )}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        aria-hidden={true}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
    </div>
  ),
)

Select.displayName = 'Select'
