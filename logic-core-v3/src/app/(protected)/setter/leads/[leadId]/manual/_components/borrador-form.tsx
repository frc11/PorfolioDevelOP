'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExternalLink, PencilLine, UploadCloud } from 'lucide-react'
import { Badge, Button, Field, Input, Toggle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { GUIA_DRAFT } from '@/lib/leados/guidance-content'
import { guardarDraftUrl } from '@/app/(protected)/setter/_actions/dossier.actions'
import { DraftUrlInputSchema } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { EnlaceChequeoFinal } from './enlace-chequeo'

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
/**
 * Los errores del form, POR CONTROL. Antes era un `string` plano que salía de
 * `issues[0].message` y se colgaba siempre del campo de URL: el interruptor sin
 * tildar pintaba de rojo un campo correcto y mandaba al lector de pantalla a
 * corregir donde no estaba el problema. El `path` del issue ya decía de quién
 * era el error — lo único que faltaba era no tirarlo.
 */
type ErroresBorrador = { draftUrl?: string; confirmoCarga?: string; general?: string }

export function BorradorForm({
  leadId,
  draftUrl,
  chequeoAccesible,
}: {
  leadId: string
  draftUrl: string | null
  /** ¿La posición derivada alcanza el chequeo final? (lo decide el server). */
  chequeoAccesible: boolean
}) {
  const router = useRouter()
  const [url, setUrl] = useState(draftUrl ?? '')
  const [confirmoCarga, setConfirmoCarga] = useState(false)
  const [errores, setErrores] = useState<ErroresBorrador>({})
  const [editando, setEditando] = useState(false)
  const [isPending, startTransition] = useTransition()
  const confirmoCargaId = useId()
  const errorConfirmoId = `${confirmoCargaId}-error`

  const guardar = () => {
    const parsed = DraftUrlInputSchema.safeParse({ draftUrl: url, confirmoCarga })
    if (!parsed.success) {
      const siguientes: ErroresBorrador = {}
      for (const issue of parsed.error.issues) {
        const campo = issue.path[0]
        if (campo === 'draftUrl' || campo === 'confirmoCarga') {
          siguientes[campo] ??= issue.message
        } else {
          siguientes.general ??= issue.message
        }
      }
      // Un issue sin path reconocible no puede quedar mudo: se muestra al pie.
      if (!siguientes.draftUrl && !siguientes.confirmoCarga && !siguientes.general) {
        siguientes.general = 'Revisá la URL del borrador'
      }
      setErrores(siguientes)
      return
    }
    setErrores({})
    startTransition(async () => {
      const result = await guardarDraftUrl(leadId, parsed.data)
      if (!result.success) {
        // El server re-parsea el MISMO schema: su mensaje puede ser el del
        // interruptor. Sin path que leer, va al pie — nunca al campo de URL.
        setErrores({ general: result.error })
        toast.error(result.error)
        return
      }
      // El acuse dice lo que PASÓ. Nombrar acá el chequeo final era nombrar un
      // destino sin poder enlazarlo: un toast no lleva a ninguna parte y se va
      // solo a los pocos segundos. El paso siguiente vive abajo, en el panel que
      // este mismo guardado deja en pantalla — nombrado Y enlazado.
      toast.success('Borrador guardado.')
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
          Ya podés pasar{' '}
          <EnlaceChequeoFinal
            leadId={leadId}
            draftUrl={draftUrl}
            destinoAccesible={chequeoAccesible}
          />
          . Si rehiciste
          la demo, volvé a publicar en Netlify Drop y actualizá el link acá — se chequea siempre
          el borrador vigente.
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
        error={errores.draftUrl}
        hint={GUIA_DRAFT.campos.draftUrl.hint}
      >
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          invalid={Boolean(errores.draftUrl)}
          placeholder="https://algo-unico.netlify.app"
          type="url"
        />
      </Field>

      {/* El interruptor es tan obligatorio como la URL — y hasta este sprint era
          el único de los dos SIN asterisco, o sea que lo obligatorio se marcaba
          como opcional. `Field` no lo envuelve porque su `label`+`htmlFor`
          apunta a un control del kit; acá el nombre accesible ya lo pone el
          propio `Toggle`, así que la marca y el error se arman al lado. */}
      <div
        className={cn(
          'space-y-1.5 rounded-xl border p-3',
          errores.confirmoCarga
            ? 'border-red-400/40 bg-red-500/[0.04]'
            : 'border-white/[0.06] bg-white/[0.02]',
        )}
      >
        <div className="flex items-center gap-3">
          <Toggle
            checked={confirmoCarga}
            onChange={setConfirmoCarga}
            label="Confirmo que abrí el link y carga"
            required
            invalid={Boolean(errores.confirmoCarga)}
            describedBy={errores.confirmoCarga ? errorConfirmoId : undefined}
          />
          <span className="text-xs leading-relaxed text-zinc-300">
            Abrí el link en otra pestaña y confirmá que la demo carga bien antes de guardar.
            <span className="text-red-400" aria-hidden="true">
              {' *'}
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </span>
        </div>
        {errores.confirmoCarga && (
          <p id={errorConfirmoId} role="alert" className="text-xs text-red-400">
            {errores.confirmoCarga}
          </p>
        )}
      </div>

      {errores.general && (
        <p role="alert" className="text-xs text-red-400">
          {errores.general}
        </p>
      )}

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
