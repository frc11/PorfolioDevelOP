'use client'

import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

interface ExampleProps {
  title: string
  description?: string
  code: string
  children: ReactNode
  background?: 'default' | 'transparent'
}

export function Example({
  title,
  description,
  code,
  children,
  background = 'default',
}: ExampleProps) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mb-8 space-y-3">
      <div>
        <h3 className="text-base font-medium text-zinc-200">{title}</h3>
        {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
      </div>

      <div
        className={`flex min-h-[120px] items-center justify-center rounded-2xl border border-white/10 p-6 ${
          background === 'default' ? 'bg-zinc-950/50' : 'bg-transparent'
        }`}
      >
        {children}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <button
          type="button"
          onClick={copyCode}
          className="absolute right-2 top-2 rounded-lg p-2 transition-colors hover:bg-white/[0.05]"
          aria-label="Copiar codigo"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
          ) : (
            <Copy className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
          )}
        </button>
        <pre className="overflow-x-auto p-4 pr-12 font-mono text-xs text-zinc-300">{code}</pre>
      </div>
    </div>
  )
}

interface SectionWrapperProps {
  title: string
  description?: string
  children: ReactNode
}

export function SectionWrapper({ title, description, children }: SectionWrapperProps) {
  return (
    <div>
      <div className="mb-6 border-b border-white/10 pb-6">
        <h2 className="text-2xl font-semibold text-zinc-100">{title}</h2>
        {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
      </div>
      {children}
    </div>
  )
}
