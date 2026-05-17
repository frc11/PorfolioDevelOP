'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Columns, Edit3, Eye } from 'lucide-react'
import { estimateTokens } from '@/lib/tokens-estimate'

type ViewMode = 'edit' | 'preview' | 'split'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Empeza a escribir...',
  rows = 12,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>('split')
  const tokens = estimateTokens(value)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <ModeButton active={mode === 'edit'} onClick={() => setMode('edit')} icon={Edit3} label="Editar" />
          <ModeButton active={mode === 'split'} onClick={() => setMode('split')} icon={Columns} label="Split" />
          <ModeButton active={mode === 'preview'} onClick={() => setMode('preview')} icon={Eye} label="Preview" />
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{value.length} chars</span>
          <span>~{tokens} tokens</span>
        </div>
      </div>

      <div className={`grid ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-px bg-white/5`}>
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="min-w-0 resize-y bg-zinc-950/50 p-4 font-mono text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:bg-zinc-950"
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className="prose prose-invert prose-sm max-w-none overflow-auto bg-zinc-950/50 p-4 text-sm"
            style={{ minHeight: `${rows * 1.5}rem` }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || '*(vacio)*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Edit3
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
        active
          ? 'bg-cyan-400/15 text-cyan-300'
          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      {label}
    </button>
  )
}
