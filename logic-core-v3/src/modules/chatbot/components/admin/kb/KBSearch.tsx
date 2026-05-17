'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Search, X } from 'lucide-react'

interface SearchResult {
  section: string
  sectionLabel: string
  preview: string
  matchIndex: number
}

interface KBSearchProps {
  kb: Record<string, string>
  sectionLabels: Record<string, string>
  onJumpToSection: (section: string, matchIndex: number) => void
}

export function KBSearch({ kb, sectionLabels, onJumpToSection }: KBSearchProps) {
  const [query, setQuery] = useState('')

  const results = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return []

    const searchLower = query.toLowerCase()
    const out: SearchResult[] = []

    for (const [section, content] of Object.entries(kb)) {
      if (!content) continue
      const contentLower = content.toLowerCase()
      const index = contentLower.indexOf(searchLower)
      if (index === -1) continue

      const start = Math.max(0, index - 40)
      const end = Math.min(content.length, index + query.length + 40)
      const preview = `${start > 0 ? '...' : ''}${content.slice(start, end)}${end < content.length ? '...' : ''}`

      out.push({
        section,
        sectionLabel: sectionLabels[section] ?? section,
        preview,
        matchIndex: index,
      })
    }

    return out
  }, [query, kb, sectionLabels])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar en la KB..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] py-2.5 pl-10 pr-10 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/30 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-white/[0.05]"
          >
            <X className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {query.length >= 2 && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="px-3 text-sm italic text-zinc-500">
              Sin resultados para &quot;{query}&quot;
            </p>
          ) : (
            <>
              <p className="px-3 text-xs text-zinc-500">
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((result) => (
                <button
                  key={`${result.section}-${result.matchIndex}`}
                  type="button"
                  onClick={() => onJumpToSection(result.section, result.matchIndex)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-cyan-400">
                    {result.sectionLabel}
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {highlightMatch(result.preview, query)}
                  </p>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function highlightMatch(text: string, query: string): ReactNode {
  const escapedQuery = escapeRegExp(query)
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-cyan-400/20 text-cyan-200">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
