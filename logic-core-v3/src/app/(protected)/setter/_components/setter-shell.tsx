'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { zIndex } from '@/lib/design-tokens'
import { SetterNav } from './setter-nav'

interface SetterShellProps {
  /** Topbar server-renderizado (marca + usuario + logout). Sin lógica acá. */
  topbar: ReactNode
  children: ReactNode
}

/**
 * Shell visual de /setter (B0.1): grilla rail + contenido espejando la
 * geometría del admin (`fixed inset-0`, rail de 240px, contenido scrolleable,
 * drawer en mobile). El rail monta la navegación (`SetterNav`, B0.2); este
 * shell sigue siendo dueño solo de la geometría y del estado del drawer. Cero
 * lógica de datos/sesión: el topbar (incluido el logout) llega ya renderizado
 * desde el server layout.
 */
export function SetterShell({ topbar, children }: SetterShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      className="fixed inset-0 bg-[var(--color-void)] text-zinc-100"
      style={{ zIndex: zIndex.appShell }}
    >
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        style={{ zIndex: zIndex.appNavTrigger }}
        className="fixed left-4 top-4 rounded-xl border border-white/10 bg-zinc-900/90 p-2.5 backdrop-blur lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          style={{ zIndex: zIndex.appDrawerBackdrop }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        style={{ zIndex: zIndex.appDrawer }}
        className={`fixed left-0 top-0 h-screen w-[240px] transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          style={{ zIndex: zIndex.appDrawerClose }}
          className="absolute right-3 top-3 rounded-xl p-2 text-zinc-400 hover:bg-white/[0.05] lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Rail del setter (B0.2): la geometría es de SetterShell; el contenido
            de navegación (destinos + activo + triggerTransition) vive en SetterNav. */}
        <div className="flex h-full w-[240px] flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
          <SetterNav onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      <div className="relative h-full lg:pl-[240px]">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-3 pt-16 sm:p-4 lg:pt-4">
          {topbar}

          <main className="relative mt-4 min-h-0 flex-1 overflow-y-auto py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
