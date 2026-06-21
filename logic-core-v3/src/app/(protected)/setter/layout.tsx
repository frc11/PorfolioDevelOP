import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bell, LogOut, Radar } from 'lucide-react'
import { auth } from '@/auth'
import { signOutAction } from '@/actions/auth-actions'
import { contarNovedadesSinLeer } from '@/lib/leados/novedades'
import { SetterShell } from './_components/setter-shell'

export const dynamic = 'force-dynamic'

/**
 * Shell propio de la zona /setter (B3 · B0.1): grilla rail + contenido (la
 * geometría la maneja `SetterShell`), sin nada del sitio público — la
 * navbar/chat widget se apagan vía PORTAL_PREFIXES en publicRoute.ts. El
 * topbar (marca, usuario, logout) se renderiza acá en el server y se pasa al
 * shell; el rail queda como placeholder para la navegación del sprint 0.2.
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
  // Badge persistente: el setter ve novedades pendientes desde cualquier ruta de
  // /setter (no solo el home). Lectura liviana e indexada; resiliente (0 si falla).
  const novedadesSinLeer = session.user.id
    ? await contarNovedadesSinLeer(session.user.id)
    : 0

  const topbar = (
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
        {novedadesSinLeer > 0 && (
          <Link
            href="/setter"
            aria-label={`${novedadesSinLeer} novedades sin ver`}
            title={`${novedadesSinLeer} novedades sin ver`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-cyan-300"
          >
            <Bell size={15} strokeWidth={1.5} aria-hidden />
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-bold tabular-nums text-black">
              {novedadesSinLeer > 9 ? '9+' : novedadesSinLeer}
            </span>
          </Link>
        )}
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
            <LogOut size={15} strokeWidth={1.5} aria-hidden />
          </button>
        </form>
      </div>
    </header>
  )

  return <SetterShell topbar={topbar}>{children}</SetterShell>
}
