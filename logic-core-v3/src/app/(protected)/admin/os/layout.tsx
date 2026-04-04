import { auth } from '@/auth'
import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './_components/admin-sidebar'
import { AdminTopbar } from './_components/admin-topbar'

export const dynamic = 'force-dynamic'

export default async function AgencyOsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()

  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  const userName = session.user.name ?? session.user.email ?? 'Super Admin'

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden bg-[#080a0c] text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 85% 48% at 20% 0%, rgba(6,182,212,0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 34% at 100% 100%, rgba(16,185,129,0.05) 0%, transparent 64%)',
            'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 22%)',
          ].join(', '),
        }}
      />

      <AdminSidebar userName={userName} userRole={session.user.role} />

      <div className="relative h-full pl-[240px]">
        <div className="flex h-full flex-col p-4">
          <AdminTopbar />

          <main className="relative mt-4 flex-1 overflow-y-auto rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
