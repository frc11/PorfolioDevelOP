'use client'

/**
 * LeadOS B5 — Las dos acciones primarias de la revisión. APROBAR exige pegar
 * la finalUrl (el panel registra, no publica); RECHAZAR exige qué/dónde/
 * arreglo. Al resolver, cierra+resetea el modal y refresca en el lugar.
 *
 * Los dos modales replican la estructura del form de "nuevo lead"
 * (lead-form.tsx): overlay portaleado a `document.body` (`createPortal` +
 * `useIsClient`), `<form onSubmit>` y los primitivos compartidos `Button`/
 * `Input`. El portal a body es CLAVE: el `<main>` del admin tiene
 * `backdrop-filter`, que crea un containing block y atrapa cualquier `position:
 * fixed` descendiente — por eso el `<Modal>` compartido (que NO portalea)
 * quedaba pegado dentro del `<main>` en vez de centrarse sobre el viewport.
 */
import { useState, useTransition } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useIsClient } from '@/lib/use-is-client'
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

type OverlayProps = {
  open: boolean
  onClose: () => void
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}

/**
 * Overlay portaleado a `<body>` — MISMA estructura que el modal de "nuevo lead"
 * (lead-form.tsx). El portal escapa el containing block que crea el
 * `backdrop-filter` del `<main>` del admin (sin él, un modal `fixed` queda
 * atrapado dentro del `<main>` y no centra sobre el viewport). No se usa el
 * `<Modal>` compartido (no portalea) ni el `OverlayModal` del lane Proyectos
 * (aislamiento entre lanes) — se replica la estructura local.
 */
function Overlay({ open, onClose, eyebrow, title, description, children }: OverlayProps) {
  const isClient = useIsClient()
  if (!isClient || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0c1016]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow ? <p className="text-xs tracking-tight text-zinc-500">{eyebrow}</p> : null}
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h3>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
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

  // Cierre manual (Cancelar / X): no interrumpe una acción en curso.
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

  const handleAprobar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

  const handleRechazar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

      <Overlay
        open={modal === 'aprobar'}
        onClose={closeModal}
        eyebrow="develOP / LeadOS"
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
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {serverError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isPending}
              className="border border-emerald-400/25 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
            >
              <span>{isPending ? 'Aprobando...' : 'Confirmar aprobación'}</span>
            </Button>
          </div>
        </form>
      </Overlay>

      <Overlay
        open={modal === 'rechazar'}
        onClose={closeModal}
        eyebrow="develOP / LeadOS"
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
            <label htmlFor="rechazo-motivo" className="mb-2 block text-sm font-medium text-zinc-200">
              Qué está mal (corto)
            </label>
            <Input
              id="rechazo-motivo"
              type="text"
              value={rechazo.motivo}
              onChange={(event) => updateRechazo('motivo', event.target.value)}
              placeholder="El hero no dice qué hace el negocio"
              className={inputClassName}
            />
            {fieldErrors.motivo ? (
              <p className="mt-2 text-xs text-rose-300">{fieldErrors.motivo}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="rechazo-donde" className="mb-2 block text-sm font-medium text-zinc-200">
              Dónde (sección / elemento)
            </label>
            <Input
              id="rechazo-donde"
              type="text"
              value={rechazo.donde}
              onChange={(event) => updateRechazo('donde', event.target.value)}
              placeholder="Hero, título principal"
              className={inputClassName}
            />
            {fieldErrors.donde ? (
              <p className="mt-2 text-xs text-rose-300">{fieldErrors.donde}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="rechazo-arreglo" className="mb-2 block text-sm font-medium text-zinc-200">
              Arreglo concreto (qué hacer)
            </label>
            <textarea
              id="rechazo-arreglo"
              value={rechazo.arreglo}
              onChange={(event) => updateRechazo('arreglo', event.target.value)}
              placeholder="Cambiar el título por el rubro + zona, ej: 'Panadería artesanal en Tafí Viejo'"
              rows={4}
              className={`${inputClassName} resize-y`}
            />
            {fieldErrors.arreglo ? (
              <p className="mt-2 text-xs text-rose-300">{fieldErrors.arreglo}</p>
            ) : null}
          </div>

          {serverError ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {serverError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isPending}
              className="border border-rose-400/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
            >
              <span>{isPending ? 'Rechazando...' : 'Confirmar rechazo'}</span>
            </Button>
          </div>
        </form>
      </Overlay>
    </section>
  )
}
