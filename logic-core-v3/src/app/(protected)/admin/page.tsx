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
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      label: 'Proyectos en curso',
      value: projects,
      icon: FolderKanban,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Mensajes sin leer',
      value: unreadMessages,
      icon: MessageSquare,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Servicios activos',
      value: activeServices,
      icon: Zap,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
  ]

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">
          Bienvenido, {session?.user?.name ?? 'Admin'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Resumen general del portal
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`rounded-lg border ${border} ${bg} p-5`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className={`mt-3 text-3xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder recent activity */}
      <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          Actividad reciente
        </h2>
        <p className="text-sm text-zinc-600">Sin actividad registrada.</p>
      </div>
    </div>
  )
}
