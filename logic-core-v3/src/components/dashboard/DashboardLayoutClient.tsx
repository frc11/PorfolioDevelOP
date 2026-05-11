'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, LogOut } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { NotificationCenter } from './NotificationCenter'
import { PageTransition } from './PageTransition'
import { signOutAction } from '@/actions/auth-actions'
import type { Notification } from '@prisma/client'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  banners?: React.ReactNode
  companyName: string
  unreadMessages: number
  unlockedFeatures: string[]
  activeModuleSlugs: string[]
  notifications: Notification[]
  userDisplayName?: string
}

export function DashboardLayoutClient({
  children,
  banners,
  companyName,
  unreadMessages,
  unlockedFeatures,
  activeModuleSlugs,
  notifications,
  userDisplayName,
}: DashboardLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const initials = companyName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || companyName.slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-[#040506] text-zinc-100 selection:bg-cyan-500/30">
      {/* Noise Texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />
      {/* Ambient Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(circle at 15% 0%, rgba(6,182,212,0.08) 0%, transparent 40%)',
            'radial-gradient(circle at 85% 100%, rgba(16,185,129,0.05) 0%, transparent 40%)',
          ].join(', '),
        }}
      />

      {/* Desktop Sidebar */}
      <div className="relative z-10 hidden md:flex">
        <SidebarNav
          companyName={companyName}
          unreadMessages={unreadMessages}
          unlockedFeatures={unlockedFeatures}
          activeModuleSlugs={activeModuleSlugs}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              key="mobile-sidebar"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <SidebarNav
                companyName={companyName}
                unreadMessages={unreadMessages}
                unlockedFeatures={unlockedFeatures}
                showCloseButton
                onClose={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="relative z-10 flex flex-1 flex-col min-h-0 min-w-0 overflow-x-hidden">
        {banners}

        {/* Header */}
        <header
          className="relative z-20 flex h-14 sm:h-16 flex-shrink-0 items-center justify-between px-4 sm:px-8 gap-4"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(4,5,6,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Left: hamburger (mobile) + company info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Abrir menú"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
            >
              <Menu size={18} />
            </button>

            {/* Company avatar + name */}
            <div className="flex items-center gap-2.5 min-w-0">
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
              <span className="truncate text-sm font-semibold tracking-wide text-zinc-200 hidden sm:block">
                {companyName}
              </span>
            </div>
          </div>

          {/* Right: user + notifications + sign out */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {userDisplayName && (
              <span className="hidden lg:block text-xs text-zinc-500 max-w-[160px] truncate">
                {userDisplayName}
              </span>
            )}

            <NotificationCenter initialNotifications={notifications} />

            <form action={signOutAction}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-all hover:text-red-400 hover:bg-red-500/10 active:scale-95"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto w-full p-3 sm:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
