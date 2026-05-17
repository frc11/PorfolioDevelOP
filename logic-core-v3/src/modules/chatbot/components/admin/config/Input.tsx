import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-xl border bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none ${
        invalid
          ? 'border-red-400/40 focus:border-red-400/60'
          : 'border-white/10 focus:border-cyan-400/30'
      } ${className ?? ''}`}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
