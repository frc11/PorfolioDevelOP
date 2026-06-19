'use client'

import { useRef, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Modal } from '@/components/ui'
import { MarkdownEditor } from '../kb/MarkdownEditor'
import { TEXTAREA_CLASS } from './field-styles'

interface ExpandableTextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}

// Textarea inline + botón "Expandir" que abre el contenido en un modal centrado
// con fondo blurreado (surface glass), usando el MarkdownEditor del KB (Editar /
// Split / Preview). value/onChange se comparten. Además abre el modal al hacer
// FOCUS en el textarea; un guard breve evita el loop de reapertura: al cerrar, el
// foco vuelve al textarea y volvería a dispararse el auto-open.
export function ExpandableTextField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: ExpandableTextFieldProps) {
  const [expanded, setExpanded] = useState(false)
  // Mientras está activo, el focus del textarea NO reabre el modal. Se libera
  // solo tras un instante, así un focus genuino posterior sí vuelve a abrir.
  const reopenGuard = useRef(false)

  function handleClose() {
    setExpanded(false)
    reopenGuard.current = true
    window.setTimeout(() => {
      reopenGuard.current = false
    }, 300)
  }

  function handleFocus() {
    if (reopenGuard.current) return
    setExpanded(true)
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <label className="block text-sm text-zinc-400">{label}</label>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.06] hover:text-cyan-300"
        >
          <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Expandir
        </button>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={handleFocus}
        className={TEXTAREA_CLASS}
        rows={rows}
        placeholder={placeholder}
      />

      <Modal
        open={expanded}
        onClose={handleClose}
        title={label}
        size="xl"
        surface="glass"
        footer={
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-cyan-400 px-5 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-cyan-300"
          >
            Listo
          </button>
        }
      >
        <MarkdownEditor value={value} onChange={onChange} rows={16} placeholder={placeholder} />
      </Modal>
    </div>
  )
}
