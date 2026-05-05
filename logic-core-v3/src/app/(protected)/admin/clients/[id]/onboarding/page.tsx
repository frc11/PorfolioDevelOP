import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { OnboardingTaskCategory } from '@prisma/client'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AdminSurface } from '@/components/admin/admin-ui'
import { prisma } from '@/lib/prisma'
import { TaskRow } from './TaskRow'

const CATEGORY_LABELS: Record<OnboardingTaskCategory, string> = {
  SETUP: 'Configuración inicial',
  DATA_CONNECTIONS: 'Conexiones de datos',
  CONTENT: 'Contenido',
  TRAINING: 'Capacitación',
  GO_LIVE: 'Lanzamiento',
}

const CATEGORY_ICONS: Record<OnboardingTaskCategory, string> = {
  SETUP: '⚙️',
  DATA_CONNECTIONS: '🔌',
  CONTENT: '📄',
  TRAINING: '📞',
  GO_LIVE: '🚀',
}

const CATEGORY_ORDER: OnboardingTaskCategory[] = [
  'SETUP',
  'DATA_CONNECTIONS',
  'CONTENT',
  'TRAINING',
  'GO_LIVE',
]

export default async function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [org, tasks] = await Promise.all([
    prisma.organization.findUnique({
      where: { id },
      select: { companyName: true },
    }),
    prisma.onboardingTask.findMany({
      where: { organizationId: id },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!org) notFound()

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const remaining = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'SKIPPED',
  ).length

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div>
          <Link
            href={`/admin/clients/${id}`}
            className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            Volver al cliente
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/75">
            Onboarding
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {org.companyName}
          </h1>
        </div>
      </FadeIn>

      {/* Progress header */}
      <FadeIn delay={0.05}>
        <AdminSurface>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Progreso global
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {completed}
                <span className="text-zinc-500">/{total}</span>
                <span className="ml-2 text-lg font-normal text-zinc-400">
                  tareas completadas ({percentage}%)
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm">
              <span className="text-zinc-400">Para go-live: </span>
              <span className="font-semibold text-amber-300">{remaining} restantes</span>
            </div>
          </div>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </AdminSurface>
      </FadeIn>

      {/* Categorías */}
      {tasks.length === 0 ? (
        <FadeIn delay={0.1}>
          <AdminSurface>
            <p className="text-sm text-zinc-500">
              Esta organización no tiene tareas de onboarding todavía.
            </p>
          </AdminSurface>
        </FadeIn>
      ) : (
        CATEGORY_ORDER.map((category, i) => {
          const categoryTasks = tasks.filter((t) => t.category === category)
          if (categoryTasks.length === 0) return null

          const catCompleted = categoryTasks.filter((t) => t.status === 'COMPLETED').length

          return (
            <FadeIn key={category} delay={0.05 * (i + 2)}>
              <AdminSurface>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {catCompleted}/{categoryTasks.length} completadas
                    </p>
                  </div>
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-cyan-500/60 transition-all duration-500"
                      style={{
                        width: `${Math.round((catCompleted / categoryTasks.length) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {categoryTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </AdminSurface>
            </FadeIn>
          )
        })
      )}
    </div>
  )
}
