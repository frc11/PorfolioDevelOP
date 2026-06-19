'use client'

import { useState } from 'react'
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

// Textarea inline con un botón "Expandir" que abre el mismo contenido en un modal
// centrado con fondo blurreado (surface glass), usando el MarkdownEditor del KB
// (Editar / Split / Preview). value/onChange se comparten, así que lo que se edita
// en el modal queda reflejado en el campo inline y en el estado del wizard.
export function ExpandableTextField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: ExpandableTextFieldProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <label className="block text-sm text-zinc-400">{label}</label>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-cyan-300"
        >
          <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Expandir
        </button>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={TEXTAREA_CLASS}
        rows={rows}
        placeholder={placeholder}
      />

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={label}
        size="xl"
        surface="glass"
        footer={
          <button
            type="button"
            onClick={() => setExpanded(false)}
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
