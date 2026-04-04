'use client'

import { useMemo, useState, useTransition } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { OsServiceType } from '@prisma/client'
import { convertLeadToProject } from '../_actions/project.actions'
import { ConvertLeadToProjectSchema } from '../_actions/project.schemas'

type ConvertLeadDialogProps = {
  lead: {
    id: string
    businessName: string
    contactName?: string | null
    phone?: string | null
    email?: string | null
    serviceType?: OsServiceType | null
    status: string
  }
  triggerLabel?: string
}

type ConvertFormState = {
  name: string
  agreedAmount: string
  monthlyRate: string
  description: string
  estimatedEndDate: string
}

type FormErrors = Partial<Record<keyof ConvertFormState, string>>

function serviceLabel(serviceType?: OsServiceType | null): string {
  switch (serviceType) {
    case 'WEB':
      return 'Web'
    case 'AI_AGENT':
      return 'AI Agent'
    case 'AUTOMATION':
      return 'Automation'
    case 'CUSTOM_SOFTWARE':
      return 'Custom Software'
    default:
      return 'Sin servicio'
  }
}

function formatCurrencyPreview(value: string): string {
  const normalized = Number(value.replace(',', '.'))

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(normalized) ? normalized : 0)
}

function collectErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
): FormErrors {
  return issues.reduce<FormErrors>((accumulator, issue) => {
    const field = issue.path[0]

    if (typeof field === 'string') {
      accumulator[field as keyof ConvertFormState] = issue.message
    }

    return accumulator
  }, {})
}

export function ConvertLeadDialog({
  lead,
  triggerLabel = 'Convertir a proyecto',
}: ConvertLeadDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [formState, setFormState] = useState<ConvertFormState>({
    name: `${lead.businessName} - Implementación`,
    agreedAmount: '',
    monthlyRate: '',
    description: '',
    estimatedEndDate: '',
  })

  const missingServiceType = useMemo(() => !lead.serviceType, [lead.serviceType])

  const updateField = <Field extends keyof ConvertFormState>(
    field: Field,
    value: ConvertFormState[Field]
  ) => {
    setFormState((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => ({ ...current, [field]: undefined }))
  }

  const closeDialog = () => {
    setIsOpen(false)
    setServerError(null)
    setFormErrors({})
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const payload = {
      leadId: lead.id,
      ...formState,
    }

    const parsed = ConvertLeadToProjectSchema.safeParse(payload)

    if (!parsed.success) {
      setFormErrors(collectErrors(parsed.error.issues))
      return
    }

    setFormErrors({})

    startTransition(async () => {
      const result = await convertLeadToProject(payload)

      if (!result.success) {
        setServerError(result.error)
        return
      }

      closeDialog()
      router.push(`/admin/os/projects/${result.data.id}`)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/15"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0c1016]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Agency OS / Leads / Conversión
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Convertir lead en proyecto
                </h3>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-lg font-medium text-white">{lead.businessName}</p>
              <div className="mt-3 grid gap-3 text-sm text-zinc-400 md:grid-cols-2">
                <p>{lead.contactName ?? 'Sin contacto'}</p>
                <p>{lead.email ?? 'Sin email'}</p>
                <p>{lead.phone ?? 'Sin teléfono'}</p>
                <p>{serviceLabel(lead.serviceType)}</p>
              </div>
            </div>

            {missingServiceType ? (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Este lead todavía no tiene serviceType. Configuralo antes de convertirlo a proyecto.
              </div>
            ) : null}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Nombre del proyecto</label>
                  <input
                    value={formState.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35"
                    placeholder="Implementación, sprint 1, MVP..."
                  />
                  {formErrors.name ? (
                    <p className="mt-2 text-xs text-rose-300">{formErrors.name}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Monto acordado</label>
                  <input
                    inputMode="decimal"
                    value={formState.agreedAmount}
                    onChange={(event) => updateField('agreedAmount', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35"
                    placeholder="2500"
                  />
                  <p className="mt-2 text-xs text-zinc-500">{formatCurrencyPreview(formState.agreedAmount)}</p>
                  {formErrors.agreedAmount ? (
                    <p className="mt-2 text-xs text-rose-300">{formErrors.agreedAmount}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Monthly rate</label>
                  <input
                    inputMode="decimal"
                    value={formState.monthlyRate}
                    onChange={(event) => updateField('monthlyRate', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35"
                    placeholder="Opcional"
                  />
                  {formState.monthlyRate ? (
                    <p className="mt-2 text-xs text-zinc-500">{formatCurrencyPreview(formState.monthlyRate)}</p>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Descripción</label>
                  <textarea
                    value={formState.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35"
                    placeholder="Alcance, entregables y notas de arranque..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Entrega estimada</label>
                  <input
                    type="date"
                    value={formState.estimatedEndDate}
                    onChange={(event) => updateField('estimatedEndDate', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35"
                  />
                </div>
              </div>

              {serverError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {serverError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || missingServiceType}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  <span>{isPending ? 'Convirtiendo...' : 'Crear proyecto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
