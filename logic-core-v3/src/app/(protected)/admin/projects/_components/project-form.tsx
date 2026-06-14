'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ServiceType } from '@prisma/client'
import { Button, Input, Select } from '@/components/ui'
import { createProject, updateProject } from '../_actions/project.actions'
import { CreateProjectSchema } from '../_actions/project.schemas'
import { OverlayModal } from './overlay-modal'

type OrganizationOption = {
  id: string
  companyName: string
}

type ProjectFormProps = {
  triggerLabel?: string
  organizations: OrganizationOption[]
  project?: {
    id: string
    organizationId?: string | null
    name: string
    description?: string | null
    serviceType?: ServiceType | null
    agreedAmount?: string | null
    monthlyRate?: string | null
    estimatedEndDate?: string | null
    leadId?: string | null
  }
}

type ProjectFormState = {
  organizationId: string
  name: string
  description: string
  serviceType: '' | ServiceType
  agreedAmount: string
  monthlyRate: string
  estimatedEndDate: string
  leadId: string
}

type FormErrors = Partial<Record<keyof ProjectFormState, string>>

const SERVICE_OPTIONS: Array<{ label: string; value: ServiceType }> = [
  { label: 'Web', value: 'WEB_DEV' },
  { label: 'AI', value: 'AI' },
  { label: 'Automation', value: 'AUTOMATION' },
  { label: 'Software', value: 'SOFTWARE' },
]

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35'

function formatCurrencyPreview(value: string): string {
  const normalized = Number(value.replace(',', '.'))

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(normalized) ? normalized : 0)
}

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function createInitialState(project?: ProjectFormProps['project']): ProjectFormState {
  if (project) {
    return {
      organizationId: project.organizationId ?? '',
      name: project.name,
      description: project.description ?? '',
      serviceType: project.serviceType ?? '',
      agreedAmount: project.agreedAmount ?? '',
      monthlyRate: project.monthlyRate ?? '',
      estimatedEndDate: toDateInputValue(project.estimatedEndDate),
      leadId: project.leadId ?? '',
    }
  }

  return {
    organizationId: '',
    name: '',
    description: '',
    serviceType: '',
    agreedAmount: '',
    monthlyRate: '',
    estimatedEndDate: '',
    leadId: '',
  }
}

function collectErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
): FormErrors {
  return issues.reduce<FormErrors>((accumulator, issue) => {
    const field = issue.path[0]

    if (typeof field === 'string') {
      accumulator[field as keyof ProjectFormState] = issue.message
    }

    return accumulator
  }, {})
}

export function ProjectForm({
  triggerLabel = 'Nuevo proyecto',
  organizations,
  project,
}: ProjectFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<ProjectFormState>(() => createInitialState(project))
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const isEditMode = Boolean(project)
  const title = useMemo(() => (isEditMode ? 'Editar proyecto' : 'Nuevo proyecto'), [isEditMode])
  const selectedOrganization = organizations.find(
    (organization) => organization.id === formState.organizationId
  )

  useEffect(() => {
    setFormState(createInitialState(project))
  }, [project])

  const updateField = <Field extends keyof ProjectFormState>(
    field: Field,
    value: ProjectFormState[Field]
  ) => {
    setFormState((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => ({ ...current, [field]: undefined }))
  }

  const closeModal = () => {
    setIsOpen(false)
    setServerError(null)
    setFormErrors({})
    setFormState(createInitialState(project))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const payload = {
      organizationId: formState.organizationId || null,
      name: formState.name,
      description: formState.description,
      serviceType: formState.serviceType,
      agreedAmount: formState.agreedAmount,
      monthlyRate: formState.monthlyRate,
      estimatedEndDate: formState.estimatedEndDate,
      leadId: formState.leadId,
    }

    const parsed = CreateProjectSchema.safeParse(payload)

    if (!parsed.success) {
      setFormErrors(collectErrors(parsed.error.issues))
      return
    }

    setFormErrors({})

    startTransition(async () => {
      const result =
        isEditMode && project
          ? await updateProject({ projectId: project.id, ...payload })
          : await createProject(payload)

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
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="secondary"
        className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
      >
        {triggerLabel}
      </Button>

      <OverlayModal
        open={isOpen}
        onClose={closeModal}
        title={title}
        eyebrow="develOP / Proyectos"
        panelClassName="max-w-3xl"
      >
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Vincular a cliente del portal (opcional)
              </label>
              <Select
                value={formState.organizationId}
                onChange={(event) => updateField('organizationId', event.target.value)}
                className={inputClassName}
              >
                <option value="">Proyecto interno de develOP</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.companyName}
                  </option>
                ))}
              </Select>
              {selectedOrganization ? (
                <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">{selectedOrganization.companyName}</p>
                    <p className="mt-1 text-amber-100/80">
                      El cliente verá este proyecto en su dashboard.
                    </p>
                  </div>
                </div>
              ) : null}
              {formErrors.organizationId ? (
                <p className="mt-2 text-xs text-rose-300">{formErrors.organizationId}</p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Nombre del proyecto
              </label>
              <Input
                value={formState.name}
                onChange={(event) => updateField('name', event.target.value)}
                className={inputClassName}
                placeholder="Landing, automatizacion, MVP..."
              />
              {formErrors.name ? (
                <p className="mt-2 text-xs text-rose-300">{formErrors.name}</p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Descripcion
              </label>
              <textarea
                value={formState.description}
                onChange={(event) => updateField('description', event.target.value)}
                className={`${inputClassName} min-h-28 resize-none`}
                placeholder="Alcance, objetivos y entregables..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Servicio</label>
              <Select
                value={formState.serviceType}
                onChange={(event) =>
                  updateField('serviceType', event.target.value as ProjectFormState['serviceType'])
                }
                className={inputClassName}
              >
                <option value="">Sin clasificar</option>
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {formErrors.serviceType ? (
                <p className="mt-2 text-xs text-rose-300">{formErrors.serviceType}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Entrega estimada
              </label>
              <Input
                type="date"
                value={formState.estimatedEndDate}
                onChange={(event) => updateField('estimatedEndDate', event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Monto acordado
              </label>
              <Input
                inputMode="decimal"
                value={formState.agreedAmount}
                onChange={(event) => updateField('agreedAmount', event.target.value)}
                className={inputClassName}
                placeholder="2500"
              />
              <p className="mt-2 text-xs text-zinc-500">
                {formatCurrencyPreview(formState.agreedAmount)}
              </p>
              {formErrors.agreedAmount ? (
                <p className="mt-2 text-xs text-rose-300">{formErrors.agreedAmount}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Monthly rate
              </label>
              <Input
                inputMode="decimal"
                value={formState.monthlyRate}
                onChange={(event) => updateField('monthlyRate', event.target.value)}
                className={inputClassName}
                placeholder="Opcional"
              />
              {formState.monthlyRate ? (
                <p className="mt-2 text-xs text-zinc-500">
                  {formatCurrencyPreview(formState.monthlyRate)}
                </p>
              ) : null}
              {formErrors.monthlyRate ? (
                <p className="mt-2 text-xs text-rose-300">{formErrors.monthlyRate}</p>
              ) : null}
            </div>
          </div>

          {serverError ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {serverError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
            <Button
              type="button"
              onClick={closeModal}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isPending}
              className="border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
            >
              <span>{isPending ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear proyecto'}</span>
            </Button>
          </div>
        </form>
      </OverlayModal>
    </>
  )
}
