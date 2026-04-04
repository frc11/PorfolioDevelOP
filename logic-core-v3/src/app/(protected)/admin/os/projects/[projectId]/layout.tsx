import type { ReactNode } from 'react'
import { OsProjectStatus, OsServiceType, Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProjectForm } from '../_components/project-form'
import { updateProjectStatus } from '../_actions/project.actions'
import { ProjectTabs } from './_components/project-tabs'

type ProjectLayoutProps = {
  children: ReactNode
  params: Promise<{
    projectId: string
  }>
}

type ProjectRecord = Prisma.OsProjectGetPayload<{
  include: {
    lead: {
      select: {
        id: true
      }
    }
  }
}>

const STATUS_OPTIONS: OsProjectStatus[] = [
  'EN_DESARROLLO',
  'EN_REVISION',
  'ENTREGADO',
  'EN_MANTENIMIENTO',
  'CANCELADO',
]

function statusTone(status: OsProjectStatus): string {
  switch (status) {
    case 'EN_DESARROLLO':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'EN_REVISION':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'ENTREGADO':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'EN_MANTENIMIENTO':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    case 'CANCELADO':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
  }
}

function statusLabel(status: OsProjectStatus): string {
  switch (status) {
    case 'EN_DESARROLLO':
      return 'En desarrollo'
    case 'EN_REVISION':
      return 'En revisión'
    case 'ENTREGADO':
      return 'Entregado'
    case 'EN_MANTENIMIENTO':
      return 'En mantenimiento'
    case 'CANCELADO':
      return 'Cancelado'
  }
}

function serviceTone(serviceType: OsServiceType): string {
  switch (serviceType) {
    case 'WEB':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'AI_AGENT':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'AUTOMATION':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'CUSTOM_SOFTWARE':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
  }
}

function serviceLabel(serviceType: OsServiceType): string {
  switch (serviceType) {
    case 'WEB':
      return 'Web'
    case 'AI_AGENT':
      return 'AI Agent'
    case 'AUTOMATION':
      return 'Automation'
    case 'CUSTOM_SOFTWARE':
      return 'Custom Software'
  }
}

function buildProjectFormData(project: ProjectRecord) {
  return {
    id: project.id,
    businessName: project.businessName,
    contactName: project.contactName,
    contactPhone: project.contactPhone,
    contactEmail: project.contactEmail,
    name: project.name,
    description: project.description,
    serviceType: project.serviceType,
    agreedAmount: project.agreedAmount.toString(),
    monthlyRate: project.monthlyRate?.toString() ?? null,
    estimatedEndDate: project.estimatedEndDate?.toISOString() ?? null,
    leadId: project.leadId,
  }
}

export default async function AgencyOsProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectId } = await params

  const project = await prisma.osProject.findUnique({
    where: { id: projectId },
    include: {
      lead: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!project) {
    redirect('/admin/os/projects')
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Proyectos / Ficha
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{project.name}</h2>
            <p className="mt-2 text-sm text-zinc-400">{project.businessName}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={[
                  'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                  statusTone(project.status),
                ].join(' ')}
              >
                {statusLabel(project.status)}
              </span>
              <span
                className={[
                  'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                  serviceTone(project.serviceType),
                ].join(' ')}
              >
                {serviceLabel(project.serviceType)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <details className="relative">
              <summary className="list-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-black/30">
                Cambiar estado
              </summary>

              <div className="absolute right-0 top-14 z-20 min-w-[220px] rounded-2xl border border-white/10 bg-[#11161d]/95 p-2 shadow-2xl backdrop-blur-xl">
                {STATUS_OPTIONS.filter((status) => status !== project.status).map((status) => (
                  <form
                    key={status}
                    action={async () => {
                      'use server'
                      await updateProjectStatus({
                        projectId: project.id,
                        status,
                      })
                    }}
                  >
                    <button
                      type="submit"
                      className="flex w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5"
                    >
                      {statusLabel(status)}
                    </button>
                  </form>
                ))}
              </div>
            </details>

            <ProjectForm project={buildProjectFormData(project)} triggerLabel="Editar" />
          </div>
        </div>

        <div className="mt-6">
          <ProjectTabs projectId={project.id} />
        </div>
      </div>

      {children}
    </section>
  )
}
