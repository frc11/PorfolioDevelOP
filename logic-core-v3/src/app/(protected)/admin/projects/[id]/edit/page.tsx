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
        clientId: true,
      },
    }),
    prisma.client.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: 'asc' },
    }),
  ])

  if (!project) notFound()

  return (
    <div>
      <Link
        href={`/admin/projects/${id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver al detalle
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">
          Editar — {project.name}
        </h1>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <ProjectForm
          action={updateProjectAction}
          mode="edit"
          clients={clients}
          initialValues={{
            projectId: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            clientId: project.clientId,
          }}
          cancelHref={`/admin/projects/${id}`}
        />
      </div>
    </div>
  )
}
