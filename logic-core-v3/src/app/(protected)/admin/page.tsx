import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Users, FolderKanban, MessageSquare, Zap } from 'lucide-react'

export default async function AdminPage() {
  const [session, clients, projects, unreadMessages, activeServices] = await Promise.all([
    auth(),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.message.count({ where: { read: false, fromAdmin: false } }),
    prisma.service.count({ where: { status: 'ACTIVE' } }),
  ])

  const SUMMARY_CARDS = [
    {
      label: 'Clientes activos',
      value: clients,
      icon: Users,
      glow: 'rgba(6,182,212,0.15)',
      iconColor: 'text-cyan-400',
      numColor: 'text-cyan-300',
      shadow: '0 0 24px rgba(6,182,212,0.08)',
    },
    {
      label: 'Proyectos en curso',
      value: projects,
      icon: FolderKanban,
      glow: 'rgba(59,130,246,0.15)',
      iconColor: 'text-blue-400',
      numColor: 'text-blue-300',
      shadow: '0 0 24px rgba(59,130,246,0.08)',
    },
    {
      label: 'Mensajes sin leer',
      value: unreadMessages,
      icon: MessageSquare,
      glow: 'rgba(245,158,11,0.15)',
      iconColor: 'text-amber-400',
      numColor: 'text-amber-300',
      shadow: '0 0 24px rgba(245,158,11,0.08)',
    },
    {
      label: 'Servicios activos',
      value: activeServices,
      icon: Zap,
      glow: 'rgba(16,185,129,0.15)',
      iconColor: 'text-green-400',
      numColor: 'text-green-300',
      shadow: '0 0 24px rgba(16,185,129,0.08)',
    },
  ]

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Panel de control
        </p>
        <h1 className="text-2xl font-bold text-zinc-100">
          Bienvenido, {session?.user?.name ?? 'Admin'}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Resumen general del portal develOP
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, glow, iconColor, numColor, shadow }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: shadow,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-zinc-500">{label}</p>
              <div
                className="rounded-lg p-1.5"
                style={{ background: glow }}
              >
                <Icon size={14} className={iconColor} />
              </div>
            </div>
            <p className={`mt-4 text-4xl font-bold tabular-nums ${numColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div
        className="mt-8 rounded-xl p-6"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h2 className="mb-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Actividad reciente
        </h2>
        <p className="text-sm text-zinc-700">Sin actividad registrada.</p>
      </div>
    </div>
  )
}
