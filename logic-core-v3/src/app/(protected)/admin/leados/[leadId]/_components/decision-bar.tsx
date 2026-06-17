'use client'

/**
 * LeadOS B5 — Las dos acciones primarias de la revisión. APROBAR exige pegar
 * la finalUrl (el panel registra, no publica); RECHAZAR exige qué/dónde/
 * arreglo. Al resolver, salta al siguiente ítem de la cola (o vuelve a ella).
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import { Modal } from '@/components/ui'
import { aprobarRevision, rechazarRevision } from '../../_actions/revision.actions'
import {
  AprobarRevisionSchema,
  RechazarRevisionSchema,
} from '../../_actions/revision.schemas'

type DecisionBarProps = {
  leadId: string
  businessName: string
}

type RechazoFields = {
  motivo: string
  donde: string
  arreglo: string
}

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-rose-300">{message}</p>
}

export function DecisionBar({ leadId, businessName }: DecisionBarProps) {
  const router = useRouter()
  const [modal, setModal] = useState<'aprobar' | 'rechazar' | null>(null)
  const [finalUrl, setFinalUrl] = useState('')
  const [rechazo, setRechazo] = useState<RechazoFields>({ motivo: '', donde: '', arreglo: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Reset completo del modal (cierra + limpia inputs + limpia errores). Sin
  // guard de isPending: lo usa también el camino de éxito (que corre pending).
  const resetAndClose = () => {
    setModal(null)
    setFinalUrl('')
    setRechazo({ motivo: '', donde: '', arreglo: '' })
    setFieldErrors({})
    setServerError(null)
  }

  // Cierre manual (Cancelar / X / backdrop): no interrumpe una acción en curso.
  const closeModal = () => {
    if (isPending) return
    resetAndClose()
  }

  // Tras un veredicto: cerrar+resetear el modal y refrescar en el lugar. Regla
  // del lane: en admin nunca router.push directo → router.refresh(). La demo
  // deja de estar EN_REVISION, así que la página re-renderiza sin esta barra y
  // muestra el estado nuevo; "Siguiente en la cola" (link del header) avanza.
  const resolverYRefrescar = () => {
    resetAndClose()
    router.refresh()
  }

  const handleAprobar = () => {
    if (isPending) return
    setServerError(null)
    const parsed = AprobarRevisionSchema.safeParse({ leadId, finalUrl })
    if (!parsed.success) {
      setFieldErrors({ finalUrl: parsed.error.issues[0]?.message ?? 'URL inválida' })
      return
    }
    setFieldErrors({})
    startTransition(async () => {
      const result = await aprobarRevision(parsed.data)
      if (!result.success) {
        setServerError(result.error)
        return
      }
      resolverYRefrescar()
    })
  }

  const handleRechazar = () => {
    if (isPending) return
    setServerError(null)
    const parsed = RechazarRevisionSchema.safeParse({ leadId, ...rechazo })
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    startTransition(async () => {
      const result = await rechazarRevision(parsed.data)
      if (!result.success) {
        setServerError(result.error)
        return
      }
      resolverYRefrescar()
    })
  }

  const updateRechazo = (field: keyof RechazoFields, value: string) => {
    setRechazo((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <h3 className="text-base font-semibold text-white">Tu veredicto</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Aprobar registra la URL permanente que ya publicaste. Rechazar le da al
        setter dirección concreta de retrabajo.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setModal('aprobar')}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/20"
        >
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
          Aprobar
        </button>
        <button
          type="button"
          onClick={() => setModal('rechazar')}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-5 py-3 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/20"
        >
          <XCircle className="h-4 w-4" strokeWidth={1.5} />
          Rechazar
        </button>
      </div>

      <Modal
        open={modal === 'aprobar'}
        onClose={closeModal}
        title="Aprobar demo"
        description={`Publicaste la demo de ${businessName} a mano (Netlify, bajo develOP). Pegá acá la URL permanente — el panel solo la registra.`}
        size="md"
        closeOnBackdrop={!isPending}
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAprobar}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/15 px-4 py-2.5 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/25 disabled:opacity-50"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Confirmar aprobación
            </button>
          </>
        }
      >
        <div className="space-y-2">
          <label htmlFor="final-url" className="text-xs font-medium text-zinc-400">
            URL permanente
          </label>
          <input
            id="final-url"
            type="url"
            value={finalUrl}
            onChange={(event) => {
              setFinalUrl(event.target.value)
              setFieldErrors((current) => ({ ...current, finalUrl: '' }))
            }}
            placeholder="https://demo-negocio.develop.com.ar"
            disabled={isPending}
            className={inputClassName}
          />
          <FieldError message={fieldErrors.finalUrl} />
          {serverError ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {serverError}
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={modal === 'rechazar'}
        onClose={closeModal}
        title="Rechazar con dirección"
        description={`El setter va a ver esto tal cual en su panel como guía de retrabajo de ${businessName}.`}
        size="md"
        closeOnBackdrop={!isPending}
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRechazar}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/25 disabled:opacity-50"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Confirmar rechazo
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="rechazo-motivo" className="text-xs font-medium text-zinc-400">
              Qué está mal (corto)
            </label>
            <input
              id="rechazo-motivo"
              type="text"
              value={rechazo.motivo}
              onChange={(event) => updateRechazo('motivo', event.target.value)}
              placeholder="El hero no dice qué hace el negocio"
              disabled={isPending}
              className={`mt-1.5 ${inputClassName}`}
            />
            <FieldError message={fieldErrors.motivo} />
          </div>

          <div>
            <label htmlFor="rechazo-donde" className="text-xs font-medium text-zinc-400">
              Dónde (sección / elemento)
            </label>
            <input
              id="rechazo-donde"
              type="text"
              value={rechazo.donde}
              onChange={(event) => updateRechazo('donde', event.target.value)}
              placeholder="Hero, título principal"
              disabled={isPending}
              className={`mt-1.5 ${inputClassName}`}
            />
            <FieldError message={fieldErrors.donde} />
          </div>

          <div>
            <label htmlFor="rechazo-arreglo" className="text-xs font-medium text-zinc-400">
              Arreglo concreto (qué hacer)
            </label>
            <textarea
              id="rechazo-arreglo"
              value={rechazo.arreglo}
              onChange={(event) => updateRechazo('arreglo', event.target.value)}
              placeholder="Cambiar el título por el rubro + zona, ej: 'Panadería artesanal en Tafí Viejo'"
              rows={4}
              disabled={isPending}
              className={`mt-1.5 ${inputClassName} resize-y`}
            />
            <FieldError message={fieldErrors.arreglo} />
          </div>

          {serverError ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {serverError}
            </p>
          ) : null}
        </div>
      </Modal>
    </section>
  )
}
