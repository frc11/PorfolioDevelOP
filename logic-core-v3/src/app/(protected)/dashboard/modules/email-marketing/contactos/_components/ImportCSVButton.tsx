'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { importContactsAction } from '../../_actions'

type Result = { ok?: boolean; created?: number; skipped?: number; error?: string } | null

export function ImportCSVButton() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<Result>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const csv = ev.target?.result as string
      const fd = new FormData()
      fd.append('csv', csv)

      startTransition(async () => {
        const res = await importContactsAction(fd)
        setResult(res as Result)
        if (fileRef.current) fileRef.current.value = ''
      })
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-40"
      >
        <Upload size={13} strokeWidth={1.5} />
        {isPending ? 'Importando…' : 'Importar CSV'}
      </button>

      {result?.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <CheckCircle size={12} strokeWidth={1.5} className="text-emerald-400 flex-shrink-0" />
          <span className="text-[11px] text-emerald-400">
            {result.created} contacto{result.created !== 1 ? 's' : ''} importado{result.created !== 1 ? 's' : ''}
            {result.skipped ? ` · ${result.skipped} omitido${result.skipped !== 1 ? 's' : ''}` : ''}
          </span>
        </div>
      )}

      {result?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
          <AlertCircle size={12} strokeWidth={1.5} className="text-red-400 flex-shrink-0" />
          <span className="text-[11px] text-red-400">{result.error}</span>
        </div>
      )}
    </div>
  )
}
