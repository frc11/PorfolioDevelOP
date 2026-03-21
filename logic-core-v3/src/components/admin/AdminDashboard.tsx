'use client'

import { motion } from 'framer-motion'
import { Users, FolderKanban, MessageSquare, Zap } from 'lucide-react'

interface AdminDashboardProps {
  userName: string | null | undefined
  clients: number
  projects: number
  unreadMessages: number
  activeServices: number
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

const CARDS = (
  clients: number,
  projects: number,
  unreadMessages: number,
  activeServices: number
) => [
  {
    label: 'Clientes activos',
    value: clients,
    icon: Users,
    accentRgb: '6,182,212',
    iconClass: 'text-cyan-400',
    numClass: 'text-cyan-300',
  },
  {
    label: 'Proyectos en curso',
    value: projects,
    icon: FolderKanban,
    accentRgb: '16,185,129',
    iconClass: 'text-emerald-400',
    numClass: 'text-emerald-300',
  },
  {
    label: 'Mensajes sin leer',
    value: unreadMessages,
    icon: MessageSquare,
    accentRgb: '139,92,246',
    iconClass: 'text-violet-400',
    numClass: 'text-violet-300',
  },
  {
    label: 'Servicios activos',
    value: activeServices,
    icon: Zap,
    accentRgb: '234,179,8',
    iconClass: 'text-yellow-400',
    numClass: 'text-yellow-300',
  },
]

export function AdminDashboard({
  userName,
  clients,
  projects,
  unreadMessages,
  activeServices,
}: AdminDashboardProps) {
  const cards = CARDS(clients, projects, unreadMessages, activeServices)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      {/* Page title */}
      <motion.div variants={itemVariants}>
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Panel de control
        </p>
        <h1 className="text-2xl font-bold text-zinc-100">
          Bienvenido,{' '}
          <span
            className="text-transparent"
            style={{
              backgroundImage: 'linear-gradient(90deg, #22d3ee, #10b981)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            {userName ?? 'Admin'}
          </span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Resumen general del portal develOP
        </p>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, accentRgb, iconClass, numClass }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              boxShadow: `0 0 32px rgba(${accentRgb}, 0.12)`,
              transition: { duration: 0.2 },
            }}
            className="relative overflow-hidden rounded-2xl p-5 transition-colors"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {/* Ambient glow top-right */}
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, rgba(${accentRgb},0.5) 0%, transparent 70%)` }}
            />

            <div className="relative flex items-start justify-between gap-3">
              {/* Icon */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `rgba(${accentRgb}, 0.12)` }}
              >
                <Icon size={18} className={iconClass} />
              </div>

              {/* Value */}
              <p className={`text-4xl font-bold tabular-nums leading-none ${numClass}`}>
                {value}
              </p>
            </div>

            <p className="mt-4 text-xs font-medium tracking-wide text-zinc-500">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <p className="mb-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Actividad reciente
        </p>
        <div className="flex items-center gap-3 py-4">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <p className="text-xs text-zinc-700">Sin actividad registrada</p>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </motion.div>
    </motion.div>
  )
}
