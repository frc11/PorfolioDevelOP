import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import type { OnboardingTaskCategory } from '@prisma/client'

const CATEGORY_ICONS: Record<OnboardingTaskCategory, string> = {
  SETUP: '⚙️',
  DATA_CONNECTIONS: '🔌',
  CONTENT: '📄',
  TRAINING: '📞',
  GO_LIVE: '🚀',
}

export async function OnboardingStatusCard({ organizationId }: { organizationId: string }) {
  const tasks = await prisma.onboardingTask.findMany({
    where: { organizationId },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      title: true,
      status: true,
      category: true,
    },
  })

  if (tasks.length === 0) return null

  const total = tasks.length
  const completedOrSkipped = tasks.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'SKIPPED',
  ).length

  if (completedOrSkipped === total) return null

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length
  const percentage = Math.round((completedCount / total) * 100)

  const nextTasks = tasks
    .filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS')
    .slice(0, 3)

  return (
    <div
      style={{
        background: 'rgba(6,182,212,0.04)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(6,182,212,0.12)',
        borderRadius: '24px',
      }}
      className="p-6 sm:p-8"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/75">
        Estamos configurando tu negocio
      </p>

      <h2 className="mt-3 text-xl font-semibold leading-snug text-white">
        Configurando tu panel —{' '}
        <span className="text-cyan-300">
          {completedCount} de {total}
        </span>{' '}
        listas
      </h2>

      {/* Barra de progreso */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-zinc-600">{percentage}%</p>

      {/* Próximas tareas */}
      {nextTasks.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {nextTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 text-sm">
              <span className="text-base leading-none">{CATEGORY_ICONS[task.category]}</span>
              <span className="text-zinc-300">{task.title}</span>
              {task.status === 'IN_PROGRESS' && (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  En curso
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <p className="mt-6 text-xs leading-relaxed text-zinc-500">
        develOP se está encargando. Te avisamos por mensaje cuando completemos cada paso.
      </p>

      <div className="mt-4">
        <Link
          href="/dashboard/messages?prefill=conexiones"
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-400/15 hover:text-cyan-200"
        >
          Hablar con mi equipo
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  )
}
