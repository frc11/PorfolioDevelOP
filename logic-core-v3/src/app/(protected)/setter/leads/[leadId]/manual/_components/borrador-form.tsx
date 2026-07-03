'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExternalLink, PencilLine, UploadCloud } from 'lucide-react'
import { Badge, Button, Field, Input, Toggle } from '@/components/ui'
import { GUIA_DRAFT } from '@/lib/leados/guidance-content'
import { guardarDraftUrl } from '@/app/(protected)/setter/_actions/dossier.actions'
import { DraftUrlInputSchema } from '@/app/(protected)/setter/_actions/dossier.schemas'

/**
 * M13 — la captura del borrador (5.4, tramo Borrador). Presentación del manual
 * (vocabulario 2.x: «borrador», no «draft») sobre el MISMO camino de escritura
 * del wizard: misma action (`guardarDraftUrl` — ownership y el literal
 * `confirmoCarga` adentro) y mismo schema (`DraftUrlInputSchema`, que valida que
 * sea un link real y https). El chrome (Netlify Drop, los pasos, el brief a la
 * vista) vive en el módulo `m13-borrador`; acá solo el núcleo de escritura con su
 * confirmación de carga humana. Dos estados vivos: captura, y verificado (link
 * publicado con la opción de cambiarlo mientras siga en construcción). El resumen
 * de consulta post-construcción lo dibuja el módulo server (sin interacción).
 */
export function BorradorForm({ leadId, draftUrl }: { leadId: string; draftUrl: string | null }) {
  const router = useRouter()
  const [url, setUrl] = useState(draftUrl ?? '')
  const [confirmoCarga, setConfirmoCarga] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [isPending, startTransition] = useTransition()

  const guardar = () => {
    const parsed = DraftUrlInputSchema.safeParse({ draftUrl: url, confirmoCarga })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisá la URL del borrador')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await guardarDraftUrl(leadId, parsed.data)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success('Borrador guardado — ahora pasá el chequeo final.')
      setEditando(false)
      setConfirmoCarga(false)
      router.refresh()
    })
  }

  // ── Borrador publicado (y sin editar): estado verificado con el link ────────
  if (draftUrl && !editando) {
    return (
      <div className="space-y-3">
        <Badge tone="emerald" variant="soft">
          Borrador publicado
        </Badge>
        <a
          href={draftUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-cyan-300 hover:text-cyan-200"
        >
          <ExternalLink size={13} strokeWidth={1.5} className="shrink-0" />
          {draftUrl}
        </a>
        <p className="text-xs leading-relaxed text-zinc-500">
          Si rehiciste la demo, volvé a publicar en Netlify Drop y actualizá el link acá — el
          chequeo final se hace siempre sobre el borrador vigente.
        </p>
        <Button
          variant="ghost"
          size="sm"
          icon={<PencilLine size={13} strokeWidth={1.5} />}
          onClick={() => {
            setUrl(draftUrl)
            setEditando(true)
          }}
        >
          Cambiar el link del borrador
        </Button>
      </div>
    )
  }

  // ── Captura de la URL del borrador ──────────────────────────────────────────
  return (
    <div className="space-y-4">
      <Field
        label="URL del borrador"
        required
        error={error ?? undefined}
        hint={GUIA_DRAFT.campos.draftUrl.hint}
      >
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          invalid={Boolean(error)}
          placeholder="https://algo-unico.netlify.app"
          type="url"
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <Toggle
          checked={confirmoCarga}
          onChange={setConfirmoCarga}
          label="Confirmo que abrí el link y carga"
        />
        <span className="text-xs leading-relaxed text-zinc-300">
          Abrí el link en otra pestaña y confirmá que la demo carga bien antes de guardar.
        </span>
      </label>

      <div className="flex items-center gap-3">
        <Button onClick={guardar} loading={isPending} icon={<UploadCloud size={14} strokeWidth={1.5} />}>
          Guardar borrador
        </Button>
        {editando && (
          <Button variant="ghost" onClick={() => setEditando(false)} disabled={isPending}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}
