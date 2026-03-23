import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { resolveOrgId, isAdminPreview } from '@/lib/preview'
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { PreviewBanner } from '@/components/dashboard/PreviewBanner'
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { LogOut } from 'lucide-react'
import { signOut } from '@/auth'
import { PageTransition } from '@/components/dashboard/PageTransition'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const preview = await isAdminPreview()

  if (!organizationId) redirect('/login')

  const [client, unreadMessages, notifications] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { companyName: true, onboardingCompleted: true },
    }),
    prisma.message.count({
      where: { organizationId, fromAdmin: true, read: false },
    }),
    prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
  ])

  if (!client) redirect('/login')
  
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isBienvenida = pathname.startsWith('/bienvenida')

  if (!client.onboardingCompleted && !preview && !isBienvenida) {
    redirect('/bienvenida')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#040506] text-zinc-100 selection:bg-cyan-500/30">
      {/* Premium Ambient glow & Noise */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(circle at 15% 0%, rgba(6,182,212,0.08) 0%, transparent 40%)',
            'radial-gradient(circle at 85% 100%, rgba(16,185,129,0.05) 0%, transparent 40%)',
          ].join(', '),
        }}
      />

      {/* Sidebar */}
      <SidebarNav
        companyName={client.companyName}
        unreadMessages={unreadMessages}
      />

      {/* Main column */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <SubscriptionBanner />
        
        {/* Preview banner (admin only) */}
        {preview && <PreviewBanner companyName={client.companyName} />}

        {/* Header */}
        <header
          className="relative z-20 flex h-16 flex-shrink-0 items-center justify-between px-8"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            background: 'rgba(4,5,6,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase bg-gradient-to-r from-zinc-300 to-zinc-600 bg-clip-text text-transparent">
            {client.companyName}
          </span>

          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400 mr-2 hidden sm:inline-block">
              {session?.user?.name ?? session?.user?.email}
            </span>

            {/* Centro de Notificaciones */}
            <NotificationCenter initialNotifications={notifications} />

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
                <span className="hidden sm:inline-block font-medium">Salir</span>
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto w-full p-2 sm:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
