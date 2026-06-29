'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, Clock, Loader2, Calendar, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Tabs, type ValueTabItem } from '@/components/ui'
import { adminHoverCls } from '@/lib/hover'
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

const TAB_DEFS: { value: TaskStatus; label: string }[] = [
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'TODO',        label: 'Pendientes' },
  { value: 'DONE',        label: 'Completadas' },
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
    // S5 — split wrapper: el lift (scale/ring/shadow de adminHoverCls) va en este div
    // NO-Framer; el inner es motion.div (entrance) y el CSS hover:scale no pelea con su
    // transform inline. Mismo patrón que los tiles del admin (task-list / overview).
    <div className={['grid rounded-[24px]', adminHoverCls].join(' ')}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.04 }}
        className={[
          'group relative rounded-[24px] border border-white/10 bg-black/20 px-5 sm:px-6 py-5 transition-colors',
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
              'text-sm font-semibold tracking-tight transition-colors',
              isDone ? 'text-zinc-500 line-through decoration-zinc-700/80' : 'text-zinc-100 group-hover:text-white',
            ].join(' ')}>
              {task.title}
            </p>

            {isPendingApproval && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Requiere aprobación
              </span>
            )}
            {isApproved && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
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
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium',
              task.isUrgent && !isDone
                ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.12)]'
                : 'bg-black/20 border-white/10 text-zinc-400',
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
                <span className="font-semibold">
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
    </div>
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

  // A7.2: el banner "Ver ahora" debe llevar al tab donde REALMENTE está la entrega
  // pendiente de aprobación (una entrega pasa a aprobación con status DONE → cae en
  // "Completadas"). Se deriva del tab que la contiene, no se hardcodea a "En curso".
  // Se prioriza DONE (su estado real); fallback DONE por type-safety (el banner solo
  // se muestra cuando existe al menos una pendiente).
  const pendingApprovalTab: TaskStatus =
    (['DONE', 'IN_PROGRESS', 'TODO'] as TaskStatus[]).find((status) =>
      taskMap[status].some((task) => task.approvalStatus === 'PENDING_APPROVAL')
    ) ?? 'DONE'

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
                  <p className="text-sm font-semibold text-amber-300">
                    {pendingApprovalCount}{' '}
                    {pendingApprovalCount === 1 ? 'entrega esperando' : 'entregas esperando'} tu aprobación
                  </p>
                  <p className="text-xs text-amber-500/70">
                    El equipo no puede continuar hasta que apruebes. Revisá abajo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab(pendingApprovalTab)}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
              >
                Ver ahora
                <ArrowRight size={11} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Tabs
        layoutId="project-task-tabs"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TaskStatus)}
        items={TAB_DEFS.map<ValueTabItem>((t) => ({
          value: t.value,
          label: t.label,
          badge: taskMap[t.value].length,
        }))}
      />

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
            <div className="flex flex-col items-center gap-3 py-14 text-center rounded-2xl border border-white/10 bg-zinc-950/70">
              {/* A7.4: una sola forma (se sacó el círculo anidado del ícono).
                  A7.5: fondo NEUTRO opaco (zinc-950/70) para que el glow verde ambiente
                  del shell del dashboard NO se filtre por el box — no hay clase verde acá,
                  era bleed del fondo a través de un bg casi-transparente (bg-white/[0.015]).
                  On-token admin (rounded-2xl + border-white/10), sin acento nuevo. */}
              <CheckCircle2 size={28} className="text-zinc-700" />
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
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 hover:text-cyan-400 transition-colors"
          >
            Hablar con el equipo
            <ArrowRight size={10} />
          </Link>
        </div>
      )}
    </div>
  )
}
