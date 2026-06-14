'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ProjectStatus } from '@prisma/client'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { ProjectCard, type ProjectCardData } from './project-card'

export type ProjectListItem = ProjectCardData

type ProjectListProps = {
  projects: ProjectListItem[]
}

// Siempre visibles, en este orden, aunque la sección esté vacía.
const STATUS_SECTIONS: Array<{ status: ProjectStatus; label: string }> = [
  { status: 'PLANNING', label: 'Planning' },
  { status: 'IN_PROGRESS', label: 'En progreso' },
  { status: 'REVIEW', label: 'Revision' },
  { status: 'COMPLETED', label: 'Completado' },
]

export function ProjectList({ projects }: ProjectListProps) {
  const reduce = useReducedMotion()

  return (
    <div className="space-y-6">
      {STATUS_SECTIONS.map((section) => {
        const sectionProjects = projects.filter((project) => project.status === section.status)

        return (
          <section
            key={section.status}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-white">{section.label}</h3>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-zinc-400">
                {sectionProjects.length}
              </span>
            </div>

            {sectionProjects.length > 0 ? (
              <motion.div
                className="mt-5 flex gap-4 overflow-x-auto pb-2"
                variants={staggerContainer}
                initial={reduce ? false : 'hidden'}
                animate="visible"
              >
                {sectionProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={staggerItem}
                    className="w-[340px] shrink-0"
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center text-sm text-zinc-500">
                Sin proyectos en este estado para los filtros actuales.
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
