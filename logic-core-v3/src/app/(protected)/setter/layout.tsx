import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogOut, Radar } from 'lucide-react'
import { auth } from '@/auth'
import { signOutAction } from '@/actions/auth-actions'

export const dynamic = 'force-dynamic'

/**
 * Shell propio de la zona /setter (B3): header mínimo (panel, usuario,
 * logout) y nada del sitio público — la navbar/chat widget se apagan vía
 * PORTAL_PREFIXES en publicRoute.ts.
 */
export default async function SetterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()

  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SETTER') {
    redirect(session.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')
  }

  const userName = session.user.name ?? session.user.email ?? 'Setter'

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
        <header className="flex h-16 shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 backdrop-blur-xl">
          <Link href="/setter" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <Radar size={18} strokeWidth={1.5} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-white">
                LeadOS
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
                develOP
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-300 sm:block">
              {userName}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-95"
              >
                <LogOut size={15} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 py-8">{children}</main>
      </div>
    </div>
  )
}
