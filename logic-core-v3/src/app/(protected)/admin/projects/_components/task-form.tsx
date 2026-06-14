'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { TaskStatus } from '@prisma/client'
import { Button, Input, Select } from '@/components/ui'
import {
  createTask,
  updateTask,
} from '@/app/(protected)/admin/team/_actions/task.actions'
import { OverlayModal } from './overlay-modal'

type TaskAssignee = {
  id: string
  name: string | null
  email: string | null
}

type EditableTask = {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  estimatedHours: number | null
  assignedToId: string | null
}

type TaskFormProps = {
  projectId: string
  assignees: TaskAssignee[]
  triggerLabel?: string
  task?: EditableTask
}

type TaskFormState = {
  title: string
  description: string
  assignedToId: string
  estimatedHours: string
  status: '' | TaskStatus
}

type FormErrors = Partial<Record<keyof TaskFormState, string>>

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35'

function createInitialState(task?: EditableTask): TaskFormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    assignedToId: task?.assignedToId ?? '',
    estimatedHours: task?.estimatedHours !== null && task?.estimatedHours !== undefined ? String(task.estimatedHours) : '',
    status: task?.status ?? '',
  }
}

function collectErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
): FormErrors {
  return issues.reduce<FormErrors>((accumulator, issue) => {
    const field = issue.path[0]

    if (typeof field === 'string') {
      accumulator[field as keyof TaskFormState] = issue.message
    }

    return accumulator
  }, {})
}

export function TaskForm({
  projectId,
  assignees,
  triggerLabel = 'Nueva tarea',
  task,
}: TaskFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<TaskFormState>(() => createInitialState(task))
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const isEditMode = Boolean(task)
  const title = useMemo(() => (isEditMode ? 'Editar tarea' : 'Nueva tarea'), [isEditMode])

  useEffect(() => {
    setFormState(createInitialState(task))
  }, [task])

  const updateField = <Field extends keyof TaskFormState>(
    field: Field,
    value: TaskFormState[Field]
  ) => {
    setFormState((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => ({ ...current, [field]: undefined }))
  }

  const closeModal = () => {
    setIsOpen(false)
    setServerError(null)
    setFormErrors({})
    setFormState(createInitialState(task))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const validationIssues: Array<{ path: PropertyKey[]; message: string }> = []

    if (formState.title.trim().length === 0) {
      validationIssues.push({ path: ['title'], message: 'Title is required' })
    }

    if (formState.estimatedHours.trim().length > 0) {
      const value = Number(formState.estimatedHours.replace(',', '.'))
      if (!Number.isFinite(value) || value < 0) {
        validationIssues.push({
          path: ['estimatedHours'],
          message: 'Estimated hours must be zero or positive',
        })
      }
    }

    if (validationIssues.length > 0) {
      setFormErrors(collectErrors(validationIssues))
      return
    }

    const payload = {
      title: formState.title,
      description: formState.description,
      assignedToId: formState.assignedToId,
      estimatedHours: formState.estimatedHours,
      status: formState.status,
    }

    startTransition(async () => {
      const result =
        isEditMode && task
          ? await updateTask({
              taskId: task.id,
              ...payload,
            })
          : await createTask({
              projectId,
              title: payload.title,
              description: payload.description,
              assignedToId: payload.assignedToId,
              estimatedHours: payload.estimatedHours,
            })

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
        eyebrow="develOP / Proyectos / Tareas"
        panelClassName="max-w-2xl"
      >
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Título</label>
            <Input
              value={formState.title}
              onChange={(event) => updateField('title', event.target.value)}
              className={inputClassName}
              placeholder="Home QA, automatización onboarding, mejoras CRM..."
            />
            {formErrors.title ? (
              <p className="mt-2 text-xs text-rose-300">{formErrors.title}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Descripción</label>
            <textarea
              value={formState.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={`${inputClassName} min-h-28 resize-none`}
              placeholder="Qué hay que resolver, criterios de cierre, dependencias..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Asignado a</label>
              <Select
                value={formState.assignedToId}
                onChange={(event) => updateField('assignedToId', event.target.value)}
                className={inputClassName}
              >
                <option value="">Sin asignar</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name ?? assignee.email ?? 'Super Admin'}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Horas estimadas</label>
              <Input
                inputMode="decimal"
                value={formState.estimatedHours}
                onChange={(event) => updateField('estimatedHours', event.target.value)}
                className={inputClassName}
                placeholder="4"
              />
              {formErrors.estimatedHours ? (
                <p className="mt-2 text-xs text-rose-300">{formErrors.estimatedHours}</p>
              ) : null}
            </div>

            {isEditMode ? (
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-200">Estado</label>
                <Select
                  value={formState.status}
                  onChange={(event) =>
                    updateField('status', event.target.value as TaskFormState['status'])
                  }
                  className={inputClassName}
                >
                  <option value="TODO">Pendiente</option>
                  <option value="IN_PROGRESS">En progreso</option>
                  <option value="DONE">Completada</option>
                </Select>
              </div>
            ) : null}
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
              <span>{isPending ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear tarea'}</span>
            </Button>
          </div>
        </form>
      </OverlayModal>
    </>
  )
}
