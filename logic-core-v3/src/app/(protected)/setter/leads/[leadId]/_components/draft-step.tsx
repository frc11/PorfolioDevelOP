'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExternalLink, Lock, PencilLine, UploadCloud } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge, Button, Card, Field, Input, Toggle } from '@/components/ui'
import { GUIA_DRAFT } from '@/lib/leados/guidance-content'
import { guardarDraftUrl } from '@/app/(protected)/setter/_actions/dossier.actions'
import { DraftUrlInputSchema } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'

type DraftStepProps = {
  leadId: string
  stage: DossierStage | null
  draftUrl: string | null
}

export function DraftStep({ leadId, stage, draftUrl }: DraftStepProps) {
  const router = useRouter()
  const [url, setUrl] = useState(draftUrl ?? '')
  const [confirmoCarga, setConfirmoCarga] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [isPending, startTransition] = useTransition()

  const guardar = () => {
    const parsed = DraftUrlInputSchema.safeParse({ draftUrl: url, confirmoCarga })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisá la URL del draft')
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
      toast.success('Draft guardado — ahora pasá el self-check.')
      setEditando(false)
      setConfirmoCarga(false)
      router.refresh()
    })
  }

  // ── Fuera de construcción y sin draft: paso apagado ────────────────────────
  if (stage !== 'CONSTRUCCION' && !draftUrl) {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">{GUIA_DRAFT.titulo}</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Se habilita cuando arranques la construcción.
        </p>
      </Card>
    )
  }

  // ── Stages posteriores: resumen con link ───────────────────────────────────
  if (stage !== 'CONSTRUCCION' && draftUrl) {
    return (
      <Card variant="subtle" padding="lg">
        <h2 className="text-base font-semibold text-zinc-300">{GUIA_DRAFT.titulo}</h2>
        <a
          href={draftUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200"
        >
          <ExternalLink size={12} strokeWidth={1.5} />
          {draftUrl}
        </a>
      </Card>
    )
  }

  // ── CONSTRUCCION con draft guardado (y sin editar): estado verificado ──────
  if (draftUrl && !editando) {
    return (
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_DRAFT.titulo}</h2>
          <Badge tone="emerald" variant="soft">Draft publicado</Badge>
        </div>
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
          self-check se hace siempre sobre el draft vigente.
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
          Cambiar el link del draft
        </Button>
      </Card>
    )
  }

  // ── CONSTRUCCION: captura de la draftUrl ───────────────────────────────────
  return (
    <Card padding="lg" className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">{GUIA_DRAFT.titulo}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
          <LineaRicaText linea={GUIA_DRAFT.intro} />
        </p>
      </div>

      <ToolGuide id="netlifyDrop" />

      <ol className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
        {GUIA_DRAFT.pasos.map((paso, index) => (
          <li key={paso} className="flex gap-2">
            <span className="font-semibold text-cyan-300/80">{index + 1}.</span>
            {paso}
          </li>
        ))}
      </ol>

      <Field
        label={GUIA_DRAFT.campos.draftUrl.label}
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
        <Button
          onClick={guardar}
          loading={isPending}
          icon={<UploadCloud size={14} strokeWidth={1.5} />}
        >
          Guardar draft
        </Button>
        {editando && (
          <Button variant="ghost" onClick={() => setEditando(false)} disabled={isPending}>
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  )
}
