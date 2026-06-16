'use client'

import { useEffect, useState, useTransition, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import type { ProjectStatus } from '@prisma/client'
import { Select } from '@/components/ui'
import { updateProjectStatus } from '../../_actions/project.actions'

const STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'REVIEW', label: 'Revision' },
  { value: 'COMPLETED', label: 'Completado' },
]

function isProjectStatus(value: string): value is ProjectStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
}

type ProjectStatusControlProps = {
  projectId: string
  status: ProjectStatus
}

/**
 * Control "Estado" de la ficha: consume el <Select> de ui (que ya portalea y es
 * sólido), con el estado actual puesto como valor. Al cambiar → updateProjectStatus
 * con update optimista + rollback. El spinner va FUERA del Select para no chocar
 * con su chevron (lección CLAUDE.md sobre status selectors).
 */
export function ProjectStatusControl({ projectId, status }: ProjectStatusControlProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState<ProjectStatus>(status)
  const [error, setError] = useState<string | null>(null)

  // Re-sincroniza con el server tras un refresh (mismo patrón que task-list).
  useEffect(() => {
    setValue(status)
  }, [status])

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.currentTarget.value
    if (!isProjectStatus(next) || next === value) {
      return
    }

    const previous = value
    setError(null)
    setValue(next)

    startTransition(async () => {
      const result = await updateProjectStatus({ projectId, status: next })

      if (!result.success) {
        setValue(previous)
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Estado</span>
        <Select
          aria-label="Estado del proyecto"
          value={value}
          onChange={handleChange}
          disabled={isPending}
          className="min-w-[170px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin text-cyan-200" /> : null}
      </div>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  )
}
