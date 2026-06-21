'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { VersionBadge } from '@/components/layout/VersionBadge'

interface AdminLayoutClientProps {
  children: ReactNode
  userName: string
  userRole: string
  pendingAlerts: number
  revisionPendientes: number
  revisionCalientes: number
}

export function AdminLayoutClient({
  children,
  userName,
  userRole,
  pendingAlerts,
  revisionPendientes,
  revisionCalientes,
}: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="fixed inset-0 z-[80] bg-[#080a0c] text-zinc-100">
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

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-[120] rounded-xl border border-white/10 bg-zinc-900/90 p-2.5 backdrop-blur lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[110] h-screen w-[240px] transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 z-[130] rounded-xl p-2 text-zinc-400 hover:bg-white/[0.05] lg:hidden"
          aria-label="Cerrar menu"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <AdminSidebar
          userName={userName}
          userRole={userRole}
          pendingAlerts={pendingAlerts}
          revisionPendientes={revisionPendientes}
          revisionCalientes={revisionCalientes}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="relative h-full lg:pl-[240px]">
        <div className="flex h-full flex-col p-3 pt-16 sm:p-4 lg:pt-4">
          <AdminTopbar />

          {/* Superficie principal. El backdrop-filter vive en una capa hermana
              (no en <main>): aplicado sobre <main> lo convertía en containing
              block de todo position:fixed descendiente, obligando a portalear
              cada modal al body. Al moverlo fuera del árbol de {children}, los
              fixed vuelven a anclarse al viewport. El efecto visual es idéntico:
              misma card con borde, tinte, sombra y blur del fondo. */}
          <div className="relative mt-4 min-h-0 flex-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md"
            />
            <main className="absolute inset-0 overflow-y-auto rounded-[28px] p-4 sm:p-6">
              {children}
            </main>
          </div>

          <footer className="flex items-center justify-between px-1 py-2 text-xs text-zinc-700">
            <span>develOP Admin</span>
            <VersionBadge />
          </footer>
        </div>
      </div>
    </div>
  )
}
