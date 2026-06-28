import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { ProjectStatus, ServiceStatus, ServiceType, OsServiceType, Prisma } from '@prisma/client'
import { MessageSquare, FolderOpen } from 'lucide-react'
import { ProjectEmptyState } from '@/components/dashboard/ProjectEmptyState'
import { EmptyStateMuted, emptyMutedCtaCls } from '@/components/ui/EmptyStateMuted'
import Link from 'next/link'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AnimatedProgressBar } from '@/components/dashboard/AnimatedProgressBar'
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter'
import { ProjectTaskTabs } from '@/components/dashboard/ProjectTaskTabs'
import type { SerializedTask } from '@/components/dashboard/ProjectTaskTabs'

// ─── Status badge config ───────────────────────────────────────────────────────

// Tokens del status pill alineados al statusTone del admin
// (admin/projects/[projectId]/layout.tsx): IN_PROGRESS = sky, texto *-200.
const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING:    'border-zinc-400/20 bg-zinc-400/10 text-zinc-200',
  IN_PROGRESS: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  REVIEW:      'border-amber-400/20 bg-amber-400/10 text-amber-200',
  COMPLETED:   'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING:    'Planificación',
  IN_PROGRESS: 'En Curso',
  REVIEW:      'En Revisión',
  COMPLETED:   'Completado',
}

// ─── Task serialization ────────────────────────────────────────────────────────

function serializeTask(task: {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDate: Date | null
  approvalStatus: string | null
}): SerializedTask {
  const daysUntilDue = task.dueDate
    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86_400_000)
    : null

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    approvalStatus: task.approvalStatus ?? null,
    daysUntilDue,
    isUrgent: daysUntilDue !== null && daysUntilDue <= 3 && task.status !== 'DONE',
  }
}

// ─── Detail-field helpers (S4c) — mismo criterio que el admin ────────────────────

function formatCurrency(value: Prisma.Decimal): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value.toString()))
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

// Tipo de proyecto: NO es columna de Project. Se deriva como el admin —
// osLead.serviceType (legacy) mapeado, si no organization.services[0].type activo.
function mapOsServiceType(type: OsServiceType | null): ServiceType | null {
  switch (type) {
    case OsServiceType.WEB:             return ServiceType.WEB_DEV
    case OsServiceType.AI_AGENT:        return ServiceType.AI
    case OsServiceType.AUTOMATION:      return ServiceType.AUTOMATION
    case OsServiceType.CUSTOM_SOFTWARE: return ServiceType.SOFTWARE
    default:                            return null
  }
}

const SERVICE_LABEL: Record<ServiceType, string> = {
  WEB_DEV:    'Web',
  AI:         'AI',
  AUTOMATION: 'Automation',
  SOFTWARE:   'Software',
}

function deriveServiceLabel(project: {
  organization: { services: { type: ServiceType }[] } | null
  osLead: { serviceType: OsServiceType | null } | null
}): string | null {
  const serviceType =
    mapOsServiceType(project.osLead?.serviceType ?? null) ??
    project.organization?.services[0]?.type ??
    null
  return serviceType ? SERVICE_LABEL[serviceType] : null
}

// Fecha de inicio: NO es columna. Se deriva (mín de osLead.createdAt + milestones +
// maintenance), mismo criterio que el admin (page.tsx deriveStartDate).
function deriveStartDate(project: {
  osLead: { createdAt: Date } | null
  paymentMilestones: { createdAt: Date }[]
  maintenancePayments: { createdAt: Date }[]
}): Date | null {
  const candidates = [
    project.osLead?.createdAt,
    ...project.paymentMilestones.map((m) => m.createdAt),
    ...project.maintenancePayments.map((m) => m.createdAt),
  ].filter((v): v is Date => Boolean(v))
  if (candidates.length === 0) return null
  return new Date(Math.min(...candidates.map((c) => c.getTime())))
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>
}) {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const projects = await prisma.project.findMany({
    where: { organizationId },
    orderBy: [{ status: 'asc' }, { id: 'desc' }],
    include: {
      tasks: { orderBy: { id: 'asc' } },
      // S4c: el tipo de proyecto y la fecha de inicio NO son columnas de Project;
      // se derivan vía relaciones, mismo criterio que el admin. Selects mínimos.
      organization: {
        select: {
          services: {
            where: { status: ServiceStatus.ACTIVE },
            orderBy: { startDate: 'desc' },
            take: 1,
            select: { type: true },
          },
        },
      },
      osLead: { select: { serviceType: true, createdAt: true } },
      paymentMilestones: { select: { createdAt: true } },
      maintenancePayments: { select: { createdAt: true } },
    },
  })

  // ── Empty state ────────────────────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <FadeIn>
          <header className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs tracking-tight text-zinc-500">Tablero</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Mi proyecto</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Estado actual y hoja de ruta estratégica
            </p>
          </header>
        </FadeIn>

        <FadeIn delay={0.08}>
          <EmptyStateMuted
            icon={FolderOpen}
            title="Tu proyecto está siendo preparado"
            description="En breve verás toda la hoja de ruta acá. El equipo de develOP está trabajando en los detalles."
          >
            <Link href="/dashboard/messages?context=proyecto" className={emptyMutedCtaCls}>
              <MessageSquare size={16} strokeWidth={1.5} />
              Hablar con el equipo
            </Link>
          </EmptyStateMuted>
        </FadeIn>
      </div>
    )
  }

  // ── Project selection ────────────────────────────────────────────────────────
  // Multi-tenant: `projects` ya viene scopeado por organizationId de la SESIÓN. El
  // searchParam `?p=<id>` solo ELIGE dentro de ese set; un id ajeno cae al fallback
  // (proyecto en curso, o el primero) → cero leak cross-tenant. Nunca findUnique(id).
  const { p: selectedId } = await searchParams
  const fallback = projects.find((p) => p.status === 'IN_PROGRESS') ?? projects[0]
  const project =
    (typeof selectedId === 'string'
      ? projects.find((p) => p.id === selectedId)
      : undefined) ?? fallback

  // ── Data prep ──────────────────────────────────────────────────────────────
  // `project.tasks` viene tipado por el `include` — sin `any`.
  const tasks = project.tasks

  const doneCount   = tasks.filter((t) => t.status === 'DONE').length
  const totalCount  = tasks.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const pendingApprovalCount = tasks.filter((t) => t.approvalStatus === 'PENDING_APPROVAL').length

  // Serialize tasks for the client component
  const serialized = {
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').map(serializeTask),
    todo:       tasks.filter((t) => t.status === 'TODO').map(serializeTask),
    done:       tasks.filter((t) => t.status === 'DONE').map(serializeTask),
  }

  // ── Detail fields (S4c) — solo los presentes; campo null → tile oculto ───────
  const serviceLabel = deriveServiceLabel(project)
  const startDate = deriveStartDate(project)
  const detailFields: { label: string; value: string }[] = [
    ...(serviceLabel ? [{ label: 'Tipo', value: serviceLabel }] : []),
    ...(project.agreedAmount
      ? [{ label: 'Monto acordado', value: formatCurrency(project.agreedAmount) }]
      : []),
    ...(startDate ? [{ label: 'Inicio', value: formatDate(startDate) }] : []),
    ...(project.estimatedEndDate
      ? [{ label: 'Entrega estimada', value: formatDate(project.estimatedEndDate) }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-8 pb-20">

      {/* ── 1. HEADER ─────────────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <header className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-xs tracking-tight text-zinc-500">Tablero</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Mi proyecto</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Estado actual y hoja de ruta estratégica
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${PROJECT_STATUS_STYLE[project.status]}`}
            >
              {project.status === 'IN_PROGRESS' && (
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
                </span>
              )}
              {project.status === 'COMPLETED' && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              )}
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
          </div>
        </header>
      </FadeIn>

      {/* ── PROJECT SWITCHER — solo si el org tiene >1 proyecto ───────────────── */}
      {projects.length > 1 && (
        <FadeIn delay={0.03}>
          <nav aria-label="Seleccionar proyecto" className="flex flex-wrap items-center gap-2">
            {projects.map((p) => {
              const active = p.id === project.id
              return (
                <Link
                  key={p.id}
                  href={`?p=${p.id}`}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'inline-flex max-w-[14rem] items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200',
                  ].join(' ')}
                >
                  <span className="truncate">{p.name}</span>
                </Link>
              )
            })}
          </nav>
        </FadeIn>
      )}

      {/* ── 2. HERO — progress card ────────────────────────────────────────── */}
      <FadeIn delay={0.06}>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          {/* Project name + description + big % */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold tracking-tight text-white">{project.name}</h2>
              {project.description && (
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-400">
                  {project.description}
                </p>
              )}
            </div>

            {totalCount > 0 && (
              <div className="flex flex-shrink-0 flex-col items-start gap-1 sm:items-end">
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter
                    value={progressPct}
                    className="text-3xl font-semibold tracking-tight text-white"
                  />
                  <span className="text-xl font-semibold text-zinc-500">%</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {doneCount}/{totalCount} tareas completadas
                </p>
              </div>
            )}
          </div>

          {/* Progress bar — INTACTA (cyan + spring + sweep + copy). Solo si hay
              tareas; el estado vacío vive en el EmptyState de abajo. */}
          {totalCount > 0 && (
            <AnimatedProgressBar progressPct={progressPct} />
          )}

          {/* Detail fields (S4c) — tiles read-only del proyecto seleccionado */}
          {detailFields.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {detailFields.map((field) => (
                <div
                  key={field.label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {field.label}
                  </p>
                  <p className="mt-2 text-sm text-white">{field.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* ── 3. TASK TABS ──────────────────────────────────────────────────── */}
      <FadeIn delay={0.14}>
        {totalCount === 0 ? (
          <ProjectEmptyState />
        ) : (
          <ProjectTaskTabs
            inProgress={serialized.inProgress}
            todo={serialized.todo}
            done={serialized.done}
            pendingApprovalCount={pendingApprovalCount}
          />
        )}
      </FadeIn>

    </div>
  )
}
