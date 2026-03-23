'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check } from 'lucide-react'
import { markNotificationAsRead } from '@/actions/dashboard-actions'
import { Notification } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/dashboard/EmptyState'

export function NotificationCenter({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update local state if initial props change
    setNotifications(initialNotifications)
  }, [initialNotifications])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = (id: string) => {
    // optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    startTransition(async () => {
      try {
        await markNotificationAsRead(id)
        router.refresh()
      } catch (error) {
        console.error(error)
      }
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-zinc-800/40 text-zinc-400 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-zinc-950 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 origin-top-right flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-5 py-3.5 backdrop-blur-md">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-100">Centro de Notificaciones</h3>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                {unreadCount} nuevas
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto overflow-x-hidden relative">
              {notifications.length === 0 ? (
                <EmptyState 
                  icon={Bell} 
                  title="Al día." 
                  description="No tienes notificaciones recientes."
                  iconColor="text-zinc-600"
                  className="py-10"
                />
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence>
                    {notifications.map((notif) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        key={notif.id}
                        className={`relative flex flex-col gap-1 border-b border-white/5 p-4 transition-colors hover:bg-white/[0.04] ${
                          !notif.read ? 'bg-cyan-500/[0.02]' : ''
                        }`}
                      >
                        {!notif.read && (
                          <motion.span
                            layoutId={`indicator-${notif.id}`}
                            className="absolute left-2.5 top-5 h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.9)]"
                          />
                        )}
                        <div className="ml-3 flex flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm tracking-tight ${!notif.read ? 'text-zinc-50 font-medium' : 'text-zinc-400'}`}>
                              {notif.title}
                            </p>
                            <span className="shrink-0 text-[10px] text-zinc-600 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className={`text-xs ${!notif.read ? 'text-zinc-300' : 'text-zinc-500'} line-clamp-2 leading-relaxed`}>
                            {notif.message}
                          </p>
                          <div className="mt-2.5 flex items-center gap-4">
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                disabled={isPending}
                                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-500 transition-colors hover:text-cyan-400 disabled:opacity-50"
                              >
                                <Check size={12} strokeWidth={2.5} />
                                Marcar leída
                              </button>
                            )}
                            {notif.actionUrl && (
                              <Link
                                href={notif.actionUrl}
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300"
                              >
                                Ir al Proyecto
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
