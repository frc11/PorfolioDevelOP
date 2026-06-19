import { ProjectStatus } from '@prisma/client'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui'
import { HoverScaleCard } from '@/app/(protected)/admin/clients/_components/HoverScaleCard'
import { ProjectManager } from '@/components/admin/managers/ProjectManager'

interface ProjectsTabProps {
  clientId: string
}

export async function ProjectsTab({ clientId }: ProjectsTabProps) {
  const projects = await prisma.project.findMany({
    where: { organizationId: clientId },
    include: {
      tasks: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { name: 'asc' },
  })

  const activeProject =
    projects.find((project) => project.status === ProjectStatus.IN_PROGRESS) ??
    projects.find((project) => project.status === ProjectStatus.REVIEW) ??
    projects[0]

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Proyectos
        </p>
        {projects.length === 0 ? (
          <Card variant="dashed" padding="xl" className="text-center text-sm text-zinc-500">
            Este cliente no tiene proyectos cargados.
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="block"
              >
                <HoverScaleCard>
                  <Card padding="sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-100">{project.name}</h3>
                        {project.description && (
                          <p className="mt-1 text-xs text-zinc-400">{project.description}</p>
                        )}
                      </div>
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-300">
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-3 text-xs text-zinc-400">
                      <span>{project.tasks.length} tareas</span>
                      <span>{project.tasks.filter((task) => task.approvalStatus === 'PENDING_APPROVAL').length} pendientes de aprobacion</span>
                    </div>
                  </Card>
                </HoverScaleCard>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Crear entregable
        </p>
        {activeProject ? (
          <ProjectManager projectId={activeProject.id} organizationId={clientId} />
        ) : (
          <Card variant="dashed" padding="sm" className="border-red-500/20 bg-red-500/5 text-sm text-red-400">
            Se debe crear un proyecto primero.
          </Card>
        )}
      </div>
    </div>
  )
}
