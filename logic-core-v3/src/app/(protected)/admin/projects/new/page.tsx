import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { createProjectAction } from '@/lib/actions/projects'

export default async function NewProjectPage() {
  const clients = await prisma.client.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' },
  })

  return (
    <div>
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver a proyectos
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Nuevo proyecto</h1>
        <p className="mt-1 text-sm text-zinc-500">
          El proyecto quedará asignado al cliente seleccionado.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <ProjectForm
          action={createProjectAction}
          mode="create"
          clients={clients}
          cancelHref="/admin/projects"
        />
      </div>
    </div>
  )
}
