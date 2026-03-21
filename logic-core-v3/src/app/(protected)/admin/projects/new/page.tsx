import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { createProjectAction } from '@/lib/actions/projects'

export default async function NewProjectPage() {
  const clients = await prisma.organization.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/projects"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ChevronLeft size={14} />
          Volver a proyectos
        </Link>
        <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Proyectos
        </p>
        <h1 className="text-xl font-bold text-zinc-100">Nuevo proyecto</h1>
        <p className="mt-0.5 text-sm text-zinc-600">
          El proyecto quedará asignado al cliente seleccionado.
        </p>
      </div>

      <ProjectForm
        action={createProjectAction}
        mode="create"
        clients={clients}
        cancelHref="/admin/projects"
      />
    </div>
  )
}
