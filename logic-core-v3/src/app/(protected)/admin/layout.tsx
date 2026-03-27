import Link from 'next/link'
import { Bell, LogOut } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminMotionShell } from '@/components/admin/AdminMotionShell'
import { SidebarNav } from '@/components/admin/SidebarNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, unreadMessages, unreadLeads, openTickets] = await Promise.all([
    auth(),
    prisma.message.count({ where: { fromAdmin: false, read: false } }),
    prisma.contactSubmission.count({ where: { leadStatus: 'NUEVO' } }),
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
  ])

  const unreadNotifications =
    session?.user?.id && session.user.role === 'SUPER_ADMIN'
      ? await prisma.notification.count({
          where: { userId: session.user.id, read: false },
        })
      : 0
  const adminName = session?.user?.name ?? session?.user?.email ?? 'Admin'
  const avatarLabel = adminName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex h-screen overflow-hidden bg-[#080a0c] text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 40% at 20% 0%, rgba(6,182,212,0.06) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 30% at 90% 90%, rgba(16,185,129,0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      <SidebarNav
        unreadMessages={unreadMessages}
        unreadLeads={unreadLeads}
        openTickets={openTickets}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <header
          className="flex h-16 flex-shrink-0 items-center justify-between px-4 sm:px-6"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,10,12,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
            Panel de administracion
          </span>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/leads"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-all hover:text-zinc-200"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              title="Notificaciones"
            >
              <Bell size={14} />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-[1.1rem] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold leading-[1.1rem] text-zinc-950">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </Link>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-200">{adminName}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Super Admin</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-cyan-200 shadow-[0_0_24px_rgba(6,182,212,0.12)]">
                {avatarLabel || 'A'}
              </div>
            </div>

            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-all hover:text-zinc-200"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <LogOut size={12} />
                Cerrar sesion
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AdminMotionShell>{children}</AdminMotionShell>
        </main>
      </div>
    </div>
  )
}
