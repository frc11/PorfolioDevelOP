'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  /** Snippet text to render and copy. Already built — keep this component pure. */
  snippet: string
  /** Toast message after a successful copy. Defaults to a friendly Spanish one. */
  toastMessage?: string
  /** Accessible label for the copy button. */
  copyAriaLabel?: string
}

/**
 * Pre-formatted code block with a clipboard button. Shared between
 * ClientInstallView (dashboard) and InstallTab (admin) so the snippet UX
 * doesn't drift between the two surfaces.
 */
export function SnippetCopyBlock({
  snippet,
  toastMessage = 'Snippet copiado',
  copyAriaLabel = 'Copiar snippet',
}: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success(toastMessage)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="rounded-xl bg-zinc-950 border border-white/10 p-4 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {snippet}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
        aria-label={copyAriaLabel}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
        ) : (
          <Copy className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        )}
      </button>
    </div>
  )
}
