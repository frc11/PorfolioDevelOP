import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

/** Espejo del Input del kit UI en versión textarea. */
export function TextArea({ invalid, className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        'min-h-[88px] w-full resize-y rounded-xl border bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none',
        invalid
          ? 'border-red-400/40 focus:border-red-400/60'
          : 'border-white/10 focus:border-cyan-400/30',
        className,
      )}
      {...props}
    />
  )
}
