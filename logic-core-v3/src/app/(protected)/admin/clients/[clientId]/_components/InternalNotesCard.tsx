'use client'

import { useState } from 'react'
import { Check, Loader2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui'
import { TEXTAREA_CLASS } from '@/modules/chatbot/components/admin/onboarding/field-styles'
import { updateClientInternalNotes } from '@/modules/chatbot/server/admin/updateClientInternalNotes'

const INTERNAL_NOTES_MAX = 5000

interface InternalNotesCardProps {
  clientId: string
  initialNotes: string | null
}

// Notas internas con edición INLINE en el tab Overview (sin ir al editor). El
// editor del cliente sigue pudiendo editarlas; acá guarda solo este campo vía
// updateClientInternalNotes. Estados: lectura, edición, guardando, error.
export function InternalNotesCard({ clientId, initialNotes }: InternalNotesCardProps) {
  const [saved, setSaved] = useState(initialNotes ?? '')
  const [draft, setDraft] = useState(initialNotes ?? '')
  const [editing, setEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit() {
    setDraft(saved)
    setError(null)
    setEditing(true)
  }

  function cancel() {
    setDraft(saved)
    setError(null)
    setEditing(false)
  }

  async function save() {
    setError(null)
    setIsSaving(true)
    try {
      const res = await updateClientInternalNotes({
        organizationId: clientId,
        internalNotes: draft.trim() || null,
      })
      const next = res.internalNotes ?? ''
      setSaved(next)
      setDraft(next)
      setEditing(false)
      toast.success('Notas internas guardadas')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar las notas.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Notas internas
        </p>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-cyan-300"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className={TEXTAREA_CLASS}
            rows={5}
            maxLength={INTERNAL_NOTES_MAX}
            disabled={isSaving}
            placeholder="Contexto, acuerdos o recordatorios internos sobre este cliente..."
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-600">
              {draft.length}/{INTERNAL_NOTES_MAX}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-cyan-300 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : saved ? (
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{saved}</p>
      ) : (
        <p className="text-sm italic text-zinc-500">
          Sin notas internas. Tocá &quot;Editar&quot; para agregarlas.
        </p>
      )}
    </Card>
  )
}
