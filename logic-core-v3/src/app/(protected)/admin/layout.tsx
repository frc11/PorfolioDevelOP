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
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <SidebarNav unreadMessages={unreadMessages} />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
          <span className="text-sm text-zinc-400">
            Panel de administración
          </span>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-300">
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
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                <LogOut size={13} />
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
