'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Clock3, LoaderCircle, Plus, Trash2 } from 'lucide-react'
import {
  createTimeEntry,
  deleteTimeEntry,
} from '@/app/(protected)/admin/os/team/_actions/time-entry.actions'
import { ConfirmDialog } from '@/app/(protected)/admin/os/_components/confirm-dialog'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'

type TaskOption = {
  id: string
  title: string
}

type GroupedProjectTimeEntries = Array<{
  taskId: string
  taskTitle: string
  projectId: string
  totalHours: number
  entries: Array<{
    id: string
    taskId: string
    userId: string
    hours: number
    date: string
    notes: string | null
    createdAt: string
    task: {
      id: string
      title: string
      projectId: string
    }
    user: {
      id: string
      name: string | null
      email: string | null
    }
  }>
}>

type TimeEntryPanelProps = {
  tasks: TaskOption[]
  groupedEntries: GroupedProjectTimeEntries
}

type QuickEntryState = {
  taskId: string
  hours: string
  date: string
  notes: string
}

type TimeEntryRecord = GroupedProjectTimeEntries[number]['entries'][number]

function formatHours(value: number): string {
  return `${value.toFixed(1)} h`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function initialDateValue(): string {
  return new Date().toISOString().slice(0, 10)
}

function cloneGroups(groups: GroupedProjectTimeEntries): GroupedProjectTimeEntries {
  return groups.map((group) => ({
    ...group,
    entries: group.entries.map((entry) => ({
      ...entry,
      task: { ...entry.task },
      user: { ...entry.user },
    })),
  }))
}

function removeEntryFromGroups(
  groups: GroupedProjectTimeEntries,
  entryId: string
): GroupedProjectTimeEntries {
  return groups
    .map((group) => {
      const nextEntries = group.entries.filter((entry) => entry.id !== entryId)
      const removedEntry = group.entries.find((entry) => entry.id === entryId)
      const removedHours = removedEntry?.hours ?? 0

      return {
        ...group,
        totalHours: Number((group.totalHours - removedHours).toFixed(2)),
        entries: nextEntries,
      }
    })
    .filter((group) => group.entries.length > 0)
}

export function TimeEntryPanel({
  tasks,
  groupedEntries,
}: TimeEntryPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryRecord | null>(null)
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null)
  const [localGroups, setLocalGroups] = useState<GroupedProjectTimeEntries>(groupedEntries)
  const [formState, setFormState] = useState<QuickEntryState>({
    taskId: tasks[0]?.id ?? '',
    hours: '',
    date: initialDateValue(),
    notes: '',
  })

  useEffect(() => {
    setLocalGroups(groupedEntries)
  }, [groupedEntries])

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      taskId: current.taskId || tasks[0]?.id || '',
    }))
  }, [tasks])

  const totalEntries = useMemo(
    () => localGroups.reduce((sum, group) => sum + group.entries.length, 0),
    [localGroups]
  )

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!formState.taskId) {
      setError('Selecciona una tarea.')
      return
    }

    const parsedHours = Number(formState.hours.replace(',', '.'))
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      setError('Ingresa una cantidad de horas valida.')
      return
    }

    if (!formState.date) {
      setError('Selecciona una fecha.')
      return
    }

    startTransition(async () => {
      const result = await createTimeEntry({
        taskId: formState.taskId,
        hours: formState.hours,
        date: formState.date,
        notes: formState.notes,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      setFormState({
        taskId: tasks[0]?.id ?? '',
        hours: '',
        date: initialDateValue(),
        notes: '',
      })
      router.refresh()
    })
  }

  const handleDelete = (entry: TimeEntryRecord) => {
    const previousGroups = cloneGroups(localGroups)
    setError(null)
    setDeletingEntryId(entry.id)
    setEntryToDelete(null)
    setLocalGroups((current) => removeEntryFromGroups(current, entry.id))

    startTransition(async () => {
      const result = await deleteTimeEntry(entry.id)

      if (!result.success) {
        setLocalGroups(previousGroups)
        setError(result.error)
        setDeletingEntryId(null)
        return
      }

      setDeletingEntryId(null)
      router.refresh()
    })
  }

  return (
    <>
      <section className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-white">Carga rapida de horas</h3>
            <p className="text-sm text-zinc-400">
              Registra trabajo real por tarea y manten el costo/hora actualizado.
            </p>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_160px_180px]">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">Tarea</label>
                <select
                  value={formState.taskId}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, taskId: event.target.value }))
                  }
                  disabled={tasks.length === 0 || isPending}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
                >
                  <option value="">Seleccionar tarea</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">Horas</label>
                <input
                  inputMode="decimal"
                  value={formState.hours}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, hours: event.target.value }))
                  }
                  disabled={isPending}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">Fecha</label>
                <input
                  type="date"
                  value={formState.date}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, date: event.target.value }))
                  }
                  disabled={isPending}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Notas</label>
              <textarea
                value={formState.notes}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, notes: event.target.value }))
                }
                disabled={isPending}
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
                placeholder="Que se hizo, bloqueo, avance, revision..."
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending || tasks.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{isPending ? 'Guardando...' : 'Registrar horas'}</span>
              </button>
            </div>
          </form>
        </section>

        {totalEntries === 0 ? (
          <EmptyState
            icon={Clock3}
            title="Todavia no hay horas registradas"
            description="Empieza cargando el primer bloque de trabajo real para este proyecto."
          />
        ) : (
          <section className="space-y-4">
            {localGroups.map((group) => (
              <article
                key={group.taskId}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <div className="flex flex-col gap-2 border-b border-white/10 bg-black/20 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{group.taskTitle}</h4>
                    <p className="mt-1 text-sm text-zinc-500">{group.entries.length} registros</p>
                  </div>

                  <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                    Subtotal: {formatHours(group.totalHours)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-black/10 text-left text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 font-medium">Tarea</th>
                        <th className="px-4 py-3 font-medium">Miembro</th>
                        <th className="px-4 py-3 font-medium">Horas</th>
                        <th className="px-4 py-3 font-medium">Notas</th>
                        <th className="px-4 py-3 font-medium">Accion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-white/[0.03]">
                      {group.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-4 text-zinc-300">{formatDate(entry.date)}</td>
                          <td className="px-4 py-4 text-zinc-100">{entry.task.title}</td>
                          <td className="px-4 py-4 text-zinc-300">
                            {entry.user.name ?? entry.user.email ?? 'Super Admin'}
                          </td>
                          <td className="px-4 py-4 text-cyan-200">{formatHours(entry.hours)}</td>
                          <td className="px-4 py-4 text-zinc-400">
                            {entry.notes?.trim() ? entry.notes : 'Sin notas'}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => setEntryToDelete(entry)}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-500/15 disabled:opacity-60"
                            >
                              {deletingEntryId === entry.id ? (
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              <span>Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      <ConfirmDialog
        open={entryToDelete !== null}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (!entryToDelete) {
            return
          }

          handleDelete(entryToDelete)
        }}
        title="Eliminar registro de horas"
        description="Se eliminara este registro de tiempo del historial del proyecto."
        confirmLabel="Eliminar registro"
        variant="danger"
        isPending={entryToDelete ? deletingEntryId === entryToDelete.id : false}
      />
    </>
  )
}
