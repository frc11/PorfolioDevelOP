import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SidebarNav } from '@/components/admin/SidebarNav'
import { LogOut } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, unreadMessages] = await Promise.all([
    auth(),
    prisma.message.count({ where: { fromAdmin: false, read: false } }),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-[#080a0c] text-zinc-100">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 40% at 20% 0%, rgba(6,182,212,0.06) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 30% at 90% 90%, rgba(16,185,129,0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Sidebar */}
      <SidebarNav unreadMessages={unreadMessages} />

      {/* Main column */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex h-14 flex-shrink-0 items-center justify-between px-6"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,10,12,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
            Panel de administración
          </span>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {session?.user?.name ?? session?.user?.email}
            </span>

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
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
