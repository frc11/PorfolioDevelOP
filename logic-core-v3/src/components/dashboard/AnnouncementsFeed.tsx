'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { markAnnouncementsSeenAction } from '@/lib/actions/announcements'
import type { AnnouncementFeedItem } from '@/lib/announcements/get-announcements-for-org'

// Mismo patrón de posicionamiento que NotificationCenter: el <header> del
// DashboardLayoutClient tiene backdrop-blur → es containing block de todo
// position:fixed descendiente, así que el panel se portalea a document.body y se
// ancla al viewport con coords fixed calculadas desde el botón.
const PANEL_W = 340
const GAP = 12
const MARGIN = 8

type PanelPosition = { top: number; right: number; width: number }

function calcPosition(trigger: HTMLElement): PanelPosition {
  const rect = trigger.getBoundingClientRect()
  const width = Math.min(PANEL_W, window.innerWidth - MARGIN * 2)
  const right = Math.min(
    Math.max(MARGIN, window.innerWidth - rect.right),
    window.innerWidth - width - MARGIN,
  )
  return { top: rect.bottom + GAP, right, width }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

export function AnnouncementsFeed({
  initialItems,
  initialUnread,
}: {
  initialItems: AnnouncementFeedItem[]
  initialUnread: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<PanelPosition | null>(null)
  const [mounted, setMounted] = useState(false)
  const [unread, setUnread] = useState(initialUnread)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => setUnread(initialUnread), [initialUnread])

  const openPanel = useCallback(() => {
    if (!buttonRef.current) return
    setPos(calcPosition(buttonRef.current))
    setIsOpen(true)

    // "El badge se apaga al ver": al abrir, marcamos las vigentes como vistas.
    // Optimista + persistencia en segundo plano; idempotente en el server.
    if (unread > 0) {
      setUnread(0)
      startTransition(async () => {
        await markAnnouncementsSeenAction()
        router.refresh()
      })
    }
  }, [unread, router])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      buttonRef.current?.focus()
    }
    const handleScroll = (event: Event) => {
      if (panelRef.current?.contains(event.target as Node)) return
      setIsOpen(false)
    }
    const handleResize = () => {
      if (buttonRef.current) setPos(calcPosition(buttonRef.current))
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  const badgeLabel = unread > 9 ? '9+' : String(unread)
  const hasUnread = unread > 0

  return (
    <>
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={hasUnread ? `Novedades, ${unread} sin leer` : 'Novedades'}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-zinc-800/40 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Sparkles size={15} strokeWidth={1.5} />

        <AnimatePresence>
          {hasUnread && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-violet-500 px-0.5 shadow-[0_0_8px_rgba(139,92,246,0.7)] ring-2 ring-zinc-950"
            >
              <span className="absolute inset-0 rounded-full bg-violet-400 opacity-60 animate-ping" />
              <span className="relative z-10 text-[9px] font-bold leading-none text-white">
                {badgeLabel}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && pos && (
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-label="Panel de novedades"
                initial={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(6px)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={{ position: 'fixed', top: pos.top, right: pos.right, width: pos.width, zIndex: 210 }}
                className="flex origin-top-right flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              >
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Sparkles size={14} strokeWidth={1.5} className="text-violet-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Novedades</h3>
                    <p className="text-[10px] text-zinc-500">El panel crece con vos</p>
                  </div>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {initialItems.length === 0 ? (
                    <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
                        <Sparkles size={18} strokeWidth={1.5} className="text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-300">Todavía no hay novedades</p>
                        <p className="mt-0.5 text-[10px] text-zinc-600">
                          Cuando lancemos algo nuevo, lo vas a ver acá.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {initialItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative flex flex-col gap-1 px-4 py-3"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: item.read ? undefined : 'rgba(139,92,246,0.06)',
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {!item.read && (
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" aria-hidden />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                              <p className="mt-0.5 text-xs leading-5 text-zinc-400">{item.body}</p>
                              <p className="mt-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
                                {formatDate(item.publishedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
