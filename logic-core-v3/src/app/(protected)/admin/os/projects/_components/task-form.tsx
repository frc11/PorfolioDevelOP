'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { OsTaskStatus } from '@prisma/client'
import {
  createTask,
  updateTask,
} from '@/app/(protected)/admin/os/team/_actions/task.actions'

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
  status: OsTaskStatus
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
  status: '' | OsTaskStatus
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0c1016]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Agency OS / Proyectos / Tareas
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
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">Título</label>
                <input
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
                  <select
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
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Horas estimadas</label>
                  <input
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
                    <select
                      value={formState.status}
                      onChange={(event) =>
                        updateField('status', event.target.value as TaskFormState['status'])
                      }
                      className={inputClassName}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROGRESO">En progreso</option>
                      <option value="COMPLETADA">Completada</option>
                    </select>
                  </div>
                ) : null}
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
                  <span>{isPending ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear tarea'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
