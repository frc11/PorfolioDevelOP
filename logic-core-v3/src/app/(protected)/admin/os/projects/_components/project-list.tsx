'use client'

import { FolderKanban } from 'lucide-react'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'
import { ProjectCard, type ProjectCardData } from './project-card'

export type ProjectListItem = ProjectCardData

type ProjectListProps = {
  projects: ProjectListItem[]
}

export function ProjectList({ projects }: ProjectListProps) {
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
    <div className="grid gap-4 xl:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
