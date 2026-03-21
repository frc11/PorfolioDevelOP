import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { updateProjectAction } from '@/lib/actions/projects'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [project, clients] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        organizationId: true,
      },
    }),
    prisma.organization.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: 'asc' },
    }),
  ])

  if (!project) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/projects/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ChevronLeft size={14} />
          Volver al detalle
        </Link>
        <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Proyectos
        </p>
        <h1 className="text-xl font-bold text-zinc-100">
          Editar — {project.name}
        </h1>
      </div>

      <ProjectForm
        action={updateProjectAction}
        mode="edit"
        clients={clients}
        initialValues={{
          projectId: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          organizationId: project.organizationId,
        }}
        cancelHref={`/admin/projects/${id}`}
      />
    </div>
  )
}
