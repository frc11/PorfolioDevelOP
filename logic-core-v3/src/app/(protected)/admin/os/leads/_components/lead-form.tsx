'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, X } from 'lucide-react'
import {
  createLead,
  updateLead,
} from '../_actions/lead.actions'
import { CreateLeadSchema } from '../_actions/lead.schemas'
import type { PipelineServiceType } from './lead-pipeline'

type LeadFormProps = {
  lead?: {
    id: string
    businessName: string
    contactName?: string | null
    phone?: string | null
    email?: string | null
    industry?: string | null
    zone?: string | null
    source?: string | null
    serviceType?: PipelineServiceType | null
    instagramUrl?: string | null
    currentWebUrl?: string | null
    googleMapsUrl?: string | null
    notes?: string | null
  }
  triggerLabel?: string
}

type LeadFormState = {
  businessName: string
  contactName: string
  phone: string
  email: string
  industry: string
  zone: string
  source: string
  serviceType: '' | PipelineServiceType
  instagramUrl: string
  currentWebUrl: string
  googleMapsUrl: string
  notes: string
}

type FormErrors = Partial<Record<keyof LeadFormState, string>>

const SOURCE_OPTIONS = ['Google Maps', 'Referido', 'Inbound', 'Instagram', 'Otro'] as const
const SERVICE_OPTIONS: Array<{ label: string; value: PipelineServiceType }> = [
  { label: 'WEB', value: 'WEB' },
  { label: 'AI Agent', value: 'AI_AGENT' },
  { label: 'Automation', value: 'AUTOMATION' },
  { label: 'Custom Software', value: 'CUSTOM_SOFTWARE' },
]

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35'

function createInitialState(lead?: LeadFormProps['lead']): LeadFormState {
  return {
    businessName: lead?.businessName ?? '',
    contactName: lead?.contactName ?? '',
    phone: lead?.phone ?? '',
    email: lead?.email ?? '',
    industry: lead?.industry ?? '',
    zone: lead?.zone ?? '',
    source: lead?.source ?? '',
    serviceType: lead?.serviceType ?? '',
    instagramUrl: lead?.instagramUrl ?? '',
    currentWebUrl: lead?.currentWebUrl ?? '',
    googleMapsUrl: lead?.googleMapsUrl ?? '',
    notes: lead?.notes ?? '',
  }
}

function collectErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
): FormErrors {
  return issues.reduce<FormErrors>((accumulator, issue) => {
    const field = issue.path[0]

    if (typeof field === 'string') {
      accumulator[field as keyof LeadFormState] = issue.message
    }

    return accumulator
  }, {})
}

export function LeadForm({ lead, triggerLabel = 'Nuevo lead' }: LeadFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [formState, setFormState] = useState<LeadFormState>(() => createInitialState(lead))
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isEditMode = Boolean(lead)
  const title = useMemo(() => (isEditMode ? 'Editar lead' : 'Nuevo lead'), [isEditMode])

  useEffect(() => {
    setFormState(createInitialState(lead))
  }, [lead])

  const updateField = <Field extends keyof LeadFormState>(
    field: Field,
    value: LeadFormState[Field]
  ) => {
    setFormState((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => ({ ...current, [field]: undefined }))
  }

  const closeModal = () => {
    setIsOpen(false)
    setServerError(null)
    setFormErrors({})
    setFormState(createInitialState(lead))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const parsed = CreateLeadSchema.safeParse(formState)
    if (!parsed.success) {
      setFormErrors(collectErrors(parsed.error.issues))
      return
    }

    setFormErrors({})

    startTransition(async () => {
      const result =
        isEditMode && lead
          ? await updateLead({ leadId: lead.id, ...parsed.data })
          : await createLead(parsed.data)

      if (!result.success) {
        setServerError(result.error)
        return
      }

      closeModal()
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0c1016]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Agency OS / Leads
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-200">
                    Business name
                  </label>
                  <input
                    value={formState.businessName}
                    onChange={(event) => updateField('businessName', event.target.value)}
                    className={inputClassName}
                    placeholder="Nombre del negocio"
                  />
                  {formErrors.businessName ? (
                    <p className="mt-2 text-xs text-rose-300">{formErrors.businessName}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Contacto</label>
                  <input
                    value={formState.contactName}
                    onChange={(event) => updateField('contactName', event.target.value)}
                    className={inputClassName}
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Teléfono</label>
                  <input
                    value={formState.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    className={inputClassName}
                    placeholder="+54 9 ..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Email</label>
                  <input
                    value={formState.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className={inputClassName}
                    placeholder="contacto@empresa.com"
                  />
                  {formErrors.email ? (
                    <p className="mt-2 text-xs text-rose-300">{formErrors.email}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Industria</label>
                  <input
                    value={formState.industry}
                    onChange={(event) => updateField('industry', event.target.value)}
                    className={inputClassName}
                    placeholder="Rubro o sector"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Zona</label>
                  <input
                    value={formState.zone}
                    onChange={(event) => updateField('zone', event.target.value)}
                    className={inputClassName}
                    placeholder="Ubicación"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Origen</label>
                  <select
                    value={formState.source}
                    onChange={(event) => updateField('source', event.target.value)}
                    className={inputClassName}
                  >
                    <option value="">Seleccionar origen</option>
                    {SOURCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Servicio</label>
                  <select
                    value={formState.serviceType}
                    onChange={(event) =>
                      updateField('serviceType', event.target.value as LeadFormState['serviceType'])
                    }
                    className={inputClassName}
                  >
                    <option value="">Seleccionar servicio</option>
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">
                    Instagram URL
                  </label>
                  <input
                    value={formState.instagramUrl}
                    onChange={(event) => updateField('instagramUrl', event.target.value)}
                    className={inputClassName}
                    placeholder="https://instagram.com/..."
                  />
                  {formErrors.instagramUrl ? (
                    <p className="mt-2 text-xs text-rose-300">{formErrors.instagramUrl}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">
                    Web actual
                  </label>
                  <input
                    value={formState.currentWebUrl}
                    onChange={(event) => updateField('currentWebUrl', event.target.value)}
                    className={inputClassName}
                    placeholder="https://empresa.com"
                  />
                  {formErrors.currentWebUrl ? (
                    <p className="mt-2 text-xs text-rose-300">{formErrors.currentWebUrl}</p>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-200">
                    Google Maps URL
                  </label>
                  <input
                    value={formState.googleMapsUrl}
                    onChange={(event) => updateField('googleMapsUrl', event.target.value)}
                    className={inputClassName}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Notas</label>
                  <textarea
                    value={formState.notes}
                    onChange={(event) => updateField('notes', event.target.value)}
                    className={`${inputClassName} min-h-32 resize-none`}
                    placeholder="Contexto comercial, observaciones, próximos pasos..."
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
                  onClick={closeModal}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  <span>{isPending ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear lead'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
