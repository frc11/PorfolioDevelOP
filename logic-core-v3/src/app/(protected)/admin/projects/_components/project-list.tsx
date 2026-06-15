'use client'

import type { DragEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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
}

// Siempre visibles, en este orden, aunque la sección esté vacía.
const STATUS_SECTIONS: Array<{ status: ProjectStatus; label: string }> = [
  { status: 'PLANNING', label: 'Planning' },
  { status: 'IN_PROGRESS', label: 'En progreso' },
  { status: 'REVIEW', label: 'Revision' },
  { status: 'COMPLETED', label: 'Completado' },
]

export function ProjectList({ projects, dnd }: ProjectListProps) {
  const reduce = useReducedMotion()

  const draggingProject =
    dnd && dnd.draggingId ? projects.find((project) => project.id === dnd.draggingId) : undefined

  return (
    <div className="space-y-6">
      {STATUS_SECTIONS.map((section) => {
        const sectionProjects = projects.filter((project) => project.status === section.status)
        const canDrop = draggingProject !== undefined && draggingProject.status !== section.status
        const showDropHint = canDrop && dnd?.dragOverStatus === section.status

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
              <motion.div
                // Fallback WRAP (pre-aprobado): la rueda vertical no panea
                // overflow-x nativo, así que en vez de scroll horizontal frágil,
                // las cards envuelven a varios renglones; ninguna queda cortada.
                className="mt-5 flex flex-wrap items-stretch gap-4"
                variants={staggerContainer}
                initial={reduce ? false : 'hidden'}
                animate="visible"
              >
                {sectionProjects.map((project) => (
                  // motion.div hace el stagger; el drag nativo HTML5 va en un
                  // <div> plano interno (motion reinterpreta onDragStart como su
                  // propio gesto de pan, sin dataTransfer).
                  <motion.div
                    key={project.id}
                    variants={staggerItem}
                    className="flex w-[340px] shrink-0"
                  >
                    <div
                      draggable={dnd ? true : undefined}
                      onDragStart={
                        dnd
                          ? (event) => {
                              dnd.onCardDragStart(project)
                              event.dataTransfer.effectAllowed = 'move'
                              event.dataTransfer.setData('text/plain', project.id)
                            }
                          : undefined
                      }
                      onDragEnd={dnd ? () => dnd.onCardDragEnd() : undefined}
                      className={[
                        'flex w-full transition-opacity',
                        dnd ? 'cursor-grab active:cursor-grabbing' : '',
                        dnd?.draggingId === project.id ? 'opacity-50' : '',
                      ].join(' ')}
                    >
                      <ProjectCard project={project} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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
