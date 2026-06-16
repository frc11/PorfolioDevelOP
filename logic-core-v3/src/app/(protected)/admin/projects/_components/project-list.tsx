'use client'

import { useState, type DragEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import type { ProjectStatus } from '@prisma/client'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { ProjectCard, type ProjectCardData } from './project-card'

export type ProjectListItem = ProjectCardData

// Wiring de drag & drop que el board inyecta. El board es dueño del estado
// optimista y de la action; project-list sólo cablea las zonas y los handles.
export type ProjectDnd = {
  draggingId: string | null
  dragOverStatus: ProjectStatus | null
  onCardDragStart: (project: ProjectListItem) => void
  onCardDragEnd: () => void
  onSectionDragOver: (status: ProjectStatus) => void
  onSectionDragLeave: (status: ProjectStatus) => void
  onSectionDrop: (status: ProjectStatus) => void
}

type ProjectListProps = {
  projects: ProjectListItem[]
  dnd?: ProjectDnd
  onDeleteProject?: (projectId: string) => void
}

// Siempre visibles, en este orden, aunque la sección esté vacía.
const STATUS_SECTIONS: Array<{ status: ProjectStatus; label: string }> = [
  { status: 'PLANNING', label: 'Planning' },
  { status: 'IN_PROGRESS', label: 'En progreso' },
  { status: 'REVIEW', label: 'Revision' },
  { status: 'COMPLETED', label: 'Completado' },
]

// Preview capado por sección: muestra ~1 fila (PREVIEW_VISIBLE_COUNT cards,
// calibrable) + un asomo de la siguiente con fade al borde inferior. El resto se
// ve en el popup del estado; sin scroll interno. Todo calibrable.
const PREVIEW_VISIBLE_COUNT = 4
const PREVIEW_MAX_HEIGHT = '42rem'
const PREVIEW_MASK = 'linear-gradient(to bottom, #000 calc(100% - 7rem), transparent)'

type ProjectCardItemProps = {
  project: ProjectListItem
  dnd?: ProjectDnd
  onDeleteProject?: (projectId: string) => void
  confirming: boolean
  onConfirmOpen: () => void
  onConfirmClose: () => void
}

/**
 * Card de proyecto con su tacho + confirmación scoped. Width-agnostic (`w-full`):
 * el padre fija el ancho (carril del board o grilla del popup). El drag nativo
 * vive acá; los controles van con `data-no-drag` para no iniciarlo.
 */
function ProjectCardItem({
  project,
  dnd,
  onDeleteProject,
  confirming,
  onConfirmOpen,
  onConfirmClose,
}: ProjectCardItemProps) {
  return (
    <div
      draggable={dnd ? true : undefined}
      onDragStart={
        dnd
          ? (event) => {
              // No iniciar drag desde el tacho / la confirmación.
              if ((event.target as HTMLElement).closest('[data-no-drag]')) {
                event.preventDefault()
                return
              }
              dnd.onCardDragStart(project)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', project.id)
            }
          : undefined
      }
      onDragEnd={dnd ? () => dnd.onCardDragEnd() : undefined}
      className={[
        'relative flex w-full transition-opacity',
        dnd ? 'cursor-grab active:cursor-grabbing' : '',
        dnd?.draggingId === project.id ? 'opacity-50' : '',
      ].join(' ')}
    >
      <ProjectCard project={project} />

      {onDeleteProject ? (
        <button
          type="button"
          data-no-drag
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onConfirmOpen()
          }}
          aria-label={`Eliminar proyecto ${project.name}`}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/10 text-rose-300 backdrop-blur-sm transition-colors hover:bg-rose-500/20"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      ) : null}

      {confirming && onDeleteProject ? (
        // Confirmación scoped (estilo Leads): overlay absolute inset-0 → blur
        // SÓLO sobre esta card, diálogo centrado. rounded propio (sin
        // overflow-hidden en el wrapper para no cortar la sombra de la card).
        // Todo data-no-drag + stopPropagation (la card navega por <Link>).
        <div
          data-no-drag
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onConfirmClose()
          }}
          className="absolute inset-0 z-20 flex items-center justify-center rounded-[26px] bg-[#05070a]/70 p-4 backdrop-blur-md"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Eliminar proyecto"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            className="w-full max-w-[260px] rounded-2xl border border-white/10 bg-[#11161d] p-4 shadow-2xl"
          >
            <p className="text-sm font-semibold text-white">Eliminar proyecto</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              ¿Seguro que querés eliminar{' '}
              <span className="font-medium text-white">{project.name}</span>? Se eliminará junto con
              sus tareas, registros de tiempo e hitos.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onConfirmClose()
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onConfirmClose()
                  onDeleteProject(project.id)
                }}
                className="rounded-xl border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-500/25"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ProjectList({ projects, dnd, onDeleteProject }: ProjectListProps) {
  const reduce = useReducedMotion()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const draggingProject =
    dnd && dnd.draggingId ? projects.find((project) => project.id === dnd.draggingId) : undefined

  return (
    <div className="space-y-6">
      {STATUS_SECTIONS.map((section) => {
        const sectionProjects = projects.filter((project) => project.status === section.status)
        const canDrop = draggingProject !== undefined && draggingProject.status !== section.status
        const showDropHint = canDrop && dnd?.dragOverStatus === section.status
        const isCapped = sectionProjects.length > PREVIEW_VISIBLE_COUNT

        const handleSectionDragOver = (event: DragEvent<HTMLElement>) => {
          if (canDrop && dnd) {
            event.preventDefault()
            dnd.onSectionDragOver(section.status)
          }
        }
        const handleSectionDragLeave = (event: DragEvent<HTMLElement>) => {
          // Sólo limpiar al salir de la sección de verdad, no al cruzar hijos.
          if (canDrop && dnd && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
            dnd.onSectionDragLeave(section.status)
          }
        }
        const handleSectionDrop = (event: DragEvent<HTMLElement>) => {
          if (!dnd) {
            return
          }
          event.preventDefault()
          dnd.onSectionDrop(section.status)
        }

        return (
          <section
            key={section.status}
            onDragOver={handleSectionDragOver}
            onDragLeave={handleSectionDragLeave}
            onDrop={handleSectionDrop}
            className={[
              'rounded-[28px] border bg-white/5 p-5 backdrop-blur-xl transition-colors',
              showDropHint ? 'border-cyan-400/40 bg-cyan-400/[0.06]' : 'border-white/10',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-white">{section.label}</h3>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-zinc-400">
                {sectionProjects.length}
              </span>
            </div>

            {sectionProjects.length > 0 ? (
              <div
                // Preview capado: ~1 fila + asomo de la siguiente con fade
                // (mask-image) si hay más de PREVIEW_VISIBLE_COUNT; sin scroll
                // interno. El resto se ve en el popup del estado.
                className={`relative mt-5 ${isCapped ? 'overflow-hidden' : ''}`}
                style={
                  isCapped
                    ? {
                        maxHeight: PREVIEW_MAX_HEIGHT,
                        maskImage: PREVIEW_MASK,
                        WebkitMaskImage: PREVIEW_MASK,
                      }
                    : undefined
                }
              >
                <motion.div
                  className="flex flex-wrap items-stretch gap-4"
                  variants={staggerContainer}
                  initial={reduce ? false : 'hidden'}
                  animate="visible"
                >
                  {sectionProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      variants={staggerItem}
                      className="flex w-[340px] shrink-0"
                    >
                      <ProjectCardItem
                        project={project}
                        dnd={dnd}
                        onDeleteProject={onDeleteProject}
                        confirming={confirmingId === project.id}
                        onConfirmOpen={() => setConfirmingId(project.id)}
                        onConfirmClose={() => setConfirmingId(null)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <p
                className={[
                  'mt-5 rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition-colors',
                  showDropHint
                    ? 'border-cyan-400/40 bg-cyan-400/[0.06] text-cyan-100'
                    : 'border-white/10 bg-black/10 text-zinc-500',
                ].join(' ')}
              >
                {showDropHint
                  ? 'Soltá acá para mover a esta columna.'
                  : 'Sin proyectos en este estado para los filtros actuales.'}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
