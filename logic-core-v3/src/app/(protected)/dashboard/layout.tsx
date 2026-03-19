import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const clientId = session?.user?.clientId

  if (!clientId) redirect('/login')

  const [client, unreadMessages] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: { companyName: true },
    }),
    prisma.message.count({
      where: { clientId, fromAdmin: true, read: false },
    }),
  ])

  if (!client) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <SidebarNav
        companyName={client.companyName}
        unreadMessages={unreadMessages}
      />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
          <span className="text-sm text-zinc-400">{client.companyName}</span>

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
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
