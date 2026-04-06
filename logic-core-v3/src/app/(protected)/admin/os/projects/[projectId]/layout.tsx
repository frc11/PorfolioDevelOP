import type { ReactNode } from 'react'
import { Building2, LogIn } from 'lucide-react'
import { ProjectStatus, ServiceStatus, ServiceType } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { startImpersonationAction } from '@/lib/actions/impersonation'
import { ProjectForm } from '../_components/project-form'
import { updateProjectStatus } from '../_actions/project.actions'
import { ProjectTabs } from './_components/project-tabs'

type ProjectLayoutProps = {
  children: ReactNode
  params: Promise<{
    projectId: string
  }>
}

const INTERNAL_ORGANIZATION_SLUG = 'agency-os-internal'

const STATUS_OPTIONS: ProjectStatus[] = [
  'PLANNING',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
]

function statusTone(status: ProjectStatus): string {
  switch (status) {
    case 'PLANNING':
      return 'border-zinc-400/20 bg-zinc-400/10 text-zinc-200'
    case 'IN_PROGRESS':
      return 'border-sky-400/20 bg-sky-400/10 text-sky-200'
    case 'REVIEW':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    case 'COMPLETED':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function statusLabel(status: ProjectStatus): string {
  switch (status) {
    case 'PLANNING':
      return 'Planning'
    case 'IN_PROGRESS':
      return 'En progreso'
    case 'REVIEW':
      return 'Revision'
    case 'COMPLETED':
      return 'Completado'
  }
}

function serviceTone(serviceType: ServiceType): string {
  switch (serviceType) {
    case 'WEB_DEV':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'AI':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'AUTOMATION':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'SOFTWARE':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
  }
}

function serviceLabel(serviceType: ServiceType): string {
  switch (serviceType) {
    case 'WEB_DEV':
      return 'Web'
    case 'AI':
      return 'AI'
    case 'AUTOMATION':
      return 'Automation'
    case 'SOFTWARE':
      return 'Software'
  }
}

function normalizeServiceType(
  project: {
    organization: {
      services: Array<{
        type: ServiceType
      }>
    }
    osLead: {
      serviceType: 'WEB' | 'AI_AGENT' | 'AUTOMATION' | 'CUSTOM_SOFTWARE' | null
    } | null
  }
): ServiceType | null {
  if (project.organization.services[0]?.type) {
    return project.organization.services[0].type
  }

  switch (project.osLead?.serviceType) {
    case 'WEB':
      return 'WEB_DEV'
    case 'AI_AGENT':
      return 'AI'
    case 'AUTOMATION':
      return 'AUTOMATION'
    case 'CUSTOM_SOFTWARE':
      return 'SOFTWARE'
    default:
      return null
  }
}

export default async function AgencyOsProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectId } = await params

  const [project, organizations] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: {
            services: {
              where: {
                status: ServiceStatus.ACTIVE,
              },
              orderBy: {
                startDate: 'desc',
              },
              take: 1,
              select: {
                type: true,
              },
            },
          },
        },
        osLead: {
          select: {
            id: true,
            serviceType: true,
          },
        },
      },
    }),
    prisma.organization.findMany({
      where: {
        slug: {
          not: INTERNAL_ORGANIZATION_SLUG,
        },
      },
      select: {
        id: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    }),
  ])

  if (!project) {
    redirect('/admin/os/projects')
  }

  const isInternalProject = project.organization.slug === INTERNAL_ORGANIZATION_SLUG
  const serviceType = normalizeServiceType(project)
  const companyName = isInternalProject
    ? 'Proyecto interno Agency OS'
    : project.organization.companyName

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Proyectos / Ficha
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{project.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{companyName}</span>
              {!isInternalProject ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                  <Building2 className="h-3.5 w-3.5" />
                  Cliente portal
                </span>
              ) : (
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                  Interno
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={[
                  'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                  statusTone(project.status),
                ].join(' ')}
              >
                {statusLabel(project.status)}
              </span>
              {serviceType ? (
                <span
                  className={[
                    'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                    serviceTone(serviceType),
                  ].join(' ')}
                >
                  {serviceLabel(serviceType)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isInternalProject ? (
              <form action={startImpersonationAction.bind(null, project.organization.id)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-400/15"
                >
                  <LogIn className="h-4 w-4" />
                  Ver como cliente
                </button>
              </form>
            ) : null}

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

            <ProjectForm
              triggerLabel="Editar"
              organizations={organizations}
              project={{
                id: project.id,
                organizationId: isInternalProject ? null : project.organization.id,
                name: project.name,
                description: project.description,
                serviceType,
                agreedAmount: project.agreedAmount?.toString() ?? null,
                monthlyRate: project.monthlyRate?.toString() ?? null,
                estimatedEndDate: project.estimatedEndDate?.toISOString() ?? null,
                leadId: project.osLeadId,
              }}
            />
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
