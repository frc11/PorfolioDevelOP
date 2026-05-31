'use client'

import { FolderKanban } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { EmptyState } from '@/components/ui'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { ProjectCard, type ProjectCardData } from './project-card'

export type ProjectListItem = ProjectCardData

type ProjectListProps = {
  projects: ProjectListItem[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const reduce = useReducedMotion()

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Todavia no hay proyectos para mostrar"
        description="Crea el primero o ajusta los filtros para ver mas resultados."
      />
    )
  }

  return (
    <motion.div
      className="grid gap-4 xl:grid-cols-2"
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="visible"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={staggerItem}>
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </motion.div>
  )
}
