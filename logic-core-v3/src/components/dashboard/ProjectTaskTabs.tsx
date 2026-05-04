'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, Loader2, Calendar, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { TaskApprovalButtons } from './TaskApprovalButtons'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface SerializedTask {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  dueDate: string | null
  approvalStatus: string | null
  daysUntilDue: number | null
  isUrgent: boolean
}

interface ProjectTaskTabsProps {
  inProgress: SerializedTask[]
  todo: SerializedTask[]
  done: SerializedTask[]
  pendingApprovalCount: number
}

// ─── Business impact mapping ──────────────────────────────────────────────────

const IMPACT_MAP: Record<string, string> = {
  'Integración CMS': 'Podrás cargar y actualizar tu contenido sin depender del equipo técnico.',
  'Desarrollo frontend': 'La interfaz que tus clientes verán y usarán para interactuar con tu plataforma.',
  'Optimización SEO': 'Aumenta tu visibilidad en buscadores y atrae tráfico orgánico calificado.',
  'Soporte técnico': 'Garantiza que tu sistema esté operativo 24/7 sin interrupciones.',
  'Configuración API': 'Sincronización de datos en tiempo real en todas tus plataformas.',
  'Maquetación': 'Experiencia visual de alta gama que genera confianza inmediata en el usuario.',
}

function getImpact(title: string): string | null {
  return IMPACT_MAP[title] ?? null
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { key: TaskStatus; label: string; activeColor: string; activeBg: string }[] = [
  { key: 'IN_PROGRESS', label: 'En Curso',    activeColor: 'text-blue-400',    activeBg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'TODO',        label: 'Pendientes',  activeColor: 'text-zinc-300',     activeBg: 'bg-zinc-500/10 border-zinc-500/20' },
  { key: 'DONE',        label: 'Completadas', activeColor: 'text-emerald-400',  activeBg: 'bg-emerald-500/10 border-emerald-500/20' },
]

// ─── Task icon ────────────────────────────────────────────────────────────────

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'DONE')        return <CheckCircle2 size={16} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] flex-shrink-0" />
  if (status === 'IN_PROGRESS') return <Loader2     size={16} className="animate-spin text-blue-400 flex-shrink-0" />
  return                               <Clock       size={16} className="text-zinc-600 flex-shrink-0" />
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({ task, index }: { task: SerializedTask; index: number }) {
  const impact = getImpact(task.title)
  const isPendingApproval = task.approvalStatus === 'PENDING_APPROVAL'
  const isApproved = task.approvalStatus === 'APPROVED'
  const isDone = task.status === 'DONE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
      className={[
        'group relative rounded-2xl border border-t-white/10 border-l-white/10 border-white/5 bg-white/[0.02] px-5 sm:px-6 py-5 backdrop-blur-2xl shadow-lg transition-all duration-300',
        'hover:bg-white/[0.05] hover:border-white/15 hover:translate-x-0.5',
        task.isUrgent && !isDone
          ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.06)]'
          : '',
        isPendingApproval
          ? 'border-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.06)]'
          : '',
      ].join(' ')}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        {/* Left: title + badges + description */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <TaskStatusIcon status={task.status} />

            <p className={[
              'text-sm font-bold tracking-tight transition-colors',
              isDone ? 'text-zinc-500 line-through decoration-zinc-700/80' : 'text-zinc-100 group-hover:text-white',
            ].join(' ')}>
              {task.title}
            </p>

            {isPendingApproval && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Requiere aprobación
              </span>
            )}
            {isApproved && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                ✓ Aprobado
              </span>
            )}
          </div>

          {impact && (
            <p className="mt-1 text-xs text-zinc-600 italic pl-6 leading-relaxed max-w-lg">
              {impact}
            </p>
          )}

          {/* Description — reveal on hover */}
          {task.description && (
            <div className="overflow-hidden max-h-0 transition-all duration-500 group-hover:max-h-32 group-hover:mt-3">
              <div className="pt-3 border-t border-white/5 pl-6">
                <p className="text-[11px] leading-relaxed text-zinc-500 max-w-2xl">
                  {task.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: due date + approval buttons */}
        <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
          {task.dueDate && (
            <div className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black tracking-[0.15em] uppercase border',
              task.isUrgent && !isDone
                ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.12)]'
                : 'bg-black/20 border-white/5 text-zinc-600',
            ].join(' ')}>
              {task.isUrgent && !isDone ? (
                <AlertTriangle size={11} className="flex-shrink-0" />
              ) : (
                <Calendar size={11} className="flex-shrink-0" />
              )}
              <span>
                {new Date(task.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </span>
              {task.isUrgent && !isDone && task.daysUntilDue !== null && (
                <span className="font-bold">
                  · {task.daysUntilDue <= 0 ? 'Hoy' : `${task.daysUntilDue}d`}
                </span>
              )}
            </div>
          )}

          {isPendingApproval && (
            <TaskApprovalButtons taskId={task.id} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProjectTaskTabs({
  inProgress,
  todo,
  done,
  pendingApprovalCount,
}: ProjectTaskTabsProps) {
  const [activeTab, setActiveTab] = useState<TaskStatus>('IN_PROGRESS')

  const taskMap: Record<TaskStatus, SerializedTask[]> = {
    IN_PROGRESS: inProgress,
    TODO: todo,
    DONE: done,
  }

  const currentTasks = taskMap[activeTab]

  return (
    <div className="flex flex-col gap-5">
      {/* ── Approval banner ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {pendingApprovalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 backdrop-blur-xl"
            style={{ boxShadow: '0 0 30px rgba(245,158,11,0.07)' }}
          >
            {/* Pulsing edge highlight */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ animation: 'pulse 3s ease-in-out infinite', boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.25)' }}
            />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                  <MessageSquare size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-300">
                    {pendingApprovalCount}{' '}
                    {pendingApprovalCount === 1 ? 'entrega esperando' : 'entregas esperando'} tu aprobación
                  </p>
                  <p className="text-xs text-amber-500/70">
                    El equipo no puede continuar hasta que apruebes. Revisá abajo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('IN_PROGRESS')}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
              >
                Ver ahora
                <ArrowRight size={11} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex items-stretch gap-1.5 rounded-xl border border-white/5 bg-zinc-950/60 p-1 backdrop-blur-md">
        {TABS.map((tab) => {
          const count = taskMap[tab.key].length
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive ? tab.activeColor : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className={`absolute inset-0 rounded-lg border ${tab.activeBg}`}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              <span className="relative z-10 sm:hidden">
                {tab.key === 'IN_PROGRESS' ? 'Curso' : tab.key === 'TODO' ? 'Pend.' : 'Hecho'}
              </span>
              <span
                className={`relative z-10 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-black tabular-nums ${
                  isActive ? 'bg-white/15 text-inherit' : 'bg-white/5 text-zinc-700'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Task list ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="flex flex-col gap-3"
        >
          {currentTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center rounded-xl border border-white/5 bg-white/[0.015]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-white/5">
                <CheckCircle2 size={20} className="text-zinc-700" />
              </div>
              <p className="text-sm text-zinc-600">Sin tareas en esta categoría</p>
            </div>
          ) : (
            currentTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Link ver todo ────────────────────────────────────────────────────── */}
      {currentTasks.length > 0 && (
        <div className="flex justify-end">
          <Link
            href="/dashboard/messages?context=proyecto"
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 hover:text-cyan-400 transition-colors"
          >
            Hablar con el equipo
            <ArrowRight size={10} />
          </Link>
        </div>
      )}
    </div>
  )
}
