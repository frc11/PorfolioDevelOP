'use client'

import { useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { NotificationCenter } from './NotificationCenter'
import { AnnouncementsFeed } from './AnnouncementsFeed'
import { PageTransition } from './PageTransition'
import { ScrollTopOnNavigate } from './ScrollTopOnNavigate'
import { signOutAction } from '@/actions/auth-actions'
import { VersionBadge } from '@/components/layout/VersionBadge'
import { zIndex } from '@/lib/design-tokens'
import type { Notification } from '@prisma/client'
import type { AnnouncementFeedItem } from '@/lib/announcements/get-announcements-for-org'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  banners?: React.ReactNode
  companyName: string
  unreadMessages: number
  hotLeadsCount?: number
  activeModuleSlugs: string[]
  notifications: Notification[]
  announcements: AnnouncementFeedItem[]
  announcementsUnread: number
  userDisplayName?: string
}

export function DashboardLayoutClient({
  children,
  banners,
  companyName,
  unreadMessages,
  hotLeadsCount = 0,
  activeModuleSlugs,
  notifications,
  announcements,
  announcementsUnread,
  userDisplayName,
}: DashboardLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const initials = companyName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || companyName.slice(0, 2).toUpperCase()

  return (
    <div
      className="fixed inset-0 bg-[#080a0c] text-zinc-100 selection:bg-cyan-500/30"
      style={{ zIndex: zIndex.appShell }}
    >
      {/* Ambient glow — mismas capas que el admin (AdminLayoutClient) */}
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

      {/* Scrim del drawer mobile */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm lg:hidden"
          style={{ zIndex: zIndex.appDrawerBackdrop }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fijo, siempre montado; se desliza en mobile (patrón CSS del admin) */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[240px] transition-transform lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: zIndex.appDrawer }}
      >
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute right-3 top-3 rounded-xl p-2 text-zinc-400 hover:bg-white/[0.05] lg:hidden"
          style={{ zIndex: zIndex.appDrawerClose }}
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <SidebarNav
          companyName={companyName}
          unreadMessages={unreadMessages}
          hotLeadsCount={hotLeadsCount}
          activeModuleSlugs={activeModuleSlugs}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </aside>

      {/* Columna de contenido */}
      <div className="relative flex h-full flex-col lg:pl-[240px]">
        {banners && <div className="flex-shrink-0">{banners}</div>}

        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          {/* Topbar — card glass estilo AdminTopbar */}
          <header className="flex h-16 flex-shrink-0 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 backdrop-blur-xl sm:px-5">
            {/* Left: hamburguesa (mobile) + empresa */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Abrir menú"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-zinc-800/40 text-zinc-400 transition-colors hover:text-zinc-200 lg:hidden"
              >
                <Menu size={18} strokeWidth={1.5} />
              </button>

              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black tracking-wider text-cyan-400"
                  style={{
                    background: 'rgba(6,182,212,0.12)',
                    border: '1.5px solid rgba(6,182,212,0.28)',
                    boxShadow: '0 0 16px rgba(6,182,212,0.12)',
                  }}
                >
                  {initials}
                </div>
                <span className="hidden truncate text-sm font-semibold tracking-wide text-zinc-200 sm:block">
                  {companyName}
                </span>
              </div>
            </div>

            {/* Right: usuario + notificaciones + sign-out */}
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
              {userDisplayName && (
                <span className="hidden max-w-[160px] truncate text-xs text-zinc-500 lg:block">
                  {userDisplayName}
                </span>
              )}

              <AnnouncementsFeed initialItems={announcements} initialUnread={announcementsUnread} />

              <NotificationCenter initialNotifications={notifications} />

              <form action={signOutAction}>
                <button
                  type="submit"
                  title="Cerrar sesión"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-95"
                >
                  <LogOut size={15} strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </header>

          {/* Superficie principal. El backdrop-filter vive en una capa hermana
              (no en <main>): aplicado sobre <main> lo convertiría en containing
              block de todo position:fixed descendiente, atrapando los modales del
              portal cliente dentro de la card en vez de anclarse al viewport. Al
              mantenerlo fuera del árbol de {children}, los fixed vuelven al
              viewport. Mismo patrón que el admin (AdminLayoutClient). */}
          <div className="relative mt-4 min-h-0 flex-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md"
            />
            <main className="absolute inset-0 overflow-y-auto overflow-x-hidden rounded-[28px] p-4 sm:p-6">
              <ScrollTopOnNavigate />
              <PageTransition>{children}</PageTransition>
            </main>
          </div>

          <footer className="flex items-center justify-between px-1 py-2 text-xs text-zinc-700">
            <span>develOP Portal</span>
            <VersionBadge />
          </footer>
        </div>
      </div>
    </div>
  )
}
