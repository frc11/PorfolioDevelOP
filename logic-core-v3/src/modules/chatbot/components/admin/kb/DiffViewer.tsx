'use client'

import { diffWordsWithSpace } from 'diff'

interface DiffViewerProps {
  oldValue: string
  newValue: string
}

export function DiffViewer({ oldValue, newValue }: DiffViewerProps) {
  if (oldValue === newValue) {
    return (
      <p className="p-4 text-sm italic text-zinc-500">
        Sin cambios en este campo
      </p>
    )
  }

  const diff = diffWordsWithSpace(oldValue, newValue)

  return (
    <div className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-zinc-950/50 p-4 font-mono text-sm leading-relaxed">
      {diff.map((part, index) => {
        if (part.added) {
          return (
            <span key={index} className="bg-emerald-500/20 px-0.5 text-emerald-200">
              {part.value}
            </span>
          )
        }
        if (part.removed) {
          return (
            <span key={index} className="bg-red-500/20 px-0.5 text-red-300 line-through">
              {part.value}
            </span>
          )
        }
        return (
          <span key={index} className="text-zinc-400">
            {part.value}
          </span>
        )
      })}
    </div>
  )
}
