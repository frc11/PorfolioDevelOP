'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'motion/react'
import { Loader2, Smile } from 'lucide-react'
import { useIsClient } from '@/lib/use-is-client'

// Se CONSUME el EmojiPickerPanel del modulo chatbot (no se clona ni edita). Es default
// export y carga emoji-picker-react (~307KB): igual que el chatbot, via next/dynamic ssr:false.
const EmojiPickerPanel = dynamic(
  () => import('@/modules/chatbot/components/admin/config/EmojiPickerPanel'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" strokeWidth={1.5} />
      </div>
    ),
  },
)

type PanelPosition = {
  top?: number
  bottom?: number
  left: number
  width: number
  height: number
}

// Tamanos/margenes espejados del EmojiPickerField del chatbot (mismo selector).
const PANEL_W = 350
const PANEL_H = 400
const PANEL_MIN_H = 300
const GAP = 4
const MARGIN = 8

// Misma logica que EmojiPickerField.calcPosition: panel con tamano propio, clamp horizontal
// en mobile, flip-up cuando no hay espacio abajo (el composer vive al fondo del viewport).
function calcPosition(trigger: HTMLElement): PanelPosition {
  const rect = trigger.getBoundingClientRect()
  const width = Math.min(PANEL_W, window.innerWidth - MARGIN * 2)
  const left = Math.min(Math.max(MARGIN, rect.left), window.innerWidth - width - MARGIN)
  const spaceBelow = window.innerHeight - rect.bottom - GAP
  const spaceAbove = rect.top - GAP
  const flipUp = spaceBelow < PANEL_H && spaceAbove > spaceBelow
  const space = flipUp ? spaceAbove : spaceBelow
  const height = Math.max(PANEL_MIN_H, Math.min(PANEL_H, space - MARGIN))
  return {
    top: flipUp ? undefined : rect.bottom + GAP,
    bottom: flipUp ? window.innerHeight - rect.top + GAP : undefined,
    left,
    width,
    height,
  }
}

type EmojiPickerButtonProps = {
  onPick: (emoji: string) => void
  disabled?: boolean
}

/**
 * Boton de emoji a la izquierda del composer de tickets. Abre un popover portaleado a
 * document.body (el backdrop-filter del <main> del admin atraparia/clipearia un overlay
 * normal) con el EmojiPickerPanel compartido del chatbot. Al elegir, llama onPick(emoji);
 * el caller lo inserta en el textarea. open/close, posicion y cierres son internos.
 */
export function EmojiPickerButton({ onPick, disabled }: EmojiPickerButtonProps) {
  const mounted = useIsClient()
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const openPanel = useCallback(() => {
    if (!triggerRef.current) return
    setPanelPos(calcPosition(triggerRef.current))
    setOpen(true)
  }, [])

  const handlePick = useCallback(
    (emoji: string) => {
      onPick(emoji)
      setOpen(false)
    },
    [onPick],
  )

  // Click-outside: chequea trigger Y panel (el portal rompe el containment del DOM).
  useEffect(() => {
    if (!open) return
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  // Scroll/resize cierran; Escape cierra (capture para el scroll, ignora el scroll del panel).
  useEffect(() => {
    if (!open) return
    const handleScroll = (event: Event) => {
      if (panelRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    const handleResize = () => setOpen(false)
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Insertar emoji"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:text-zinc-200 focus:border-cyan-400/35 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Smile className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && panelPos && (
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-label="Selector de emoji"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: panelPos.top,
                  bottom: panelPos.bottom,
                  left: panelPos.left,
                  width: panelPos.width,
                  height: panelPos.height,
                  zIndex: 210,
                }}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl backdrop-blur-[20px] backdrop-saturate-[180%]"
              >
                {/* -2: el borde 1px por lado del shell entra en el width/height fijado. */}
                <EmojiPickerPanel
                  onPick={handlePick}
                  width={panelPos.width - 2}
                  height={panelPos.height - 2}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
