'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { Loader2, Smile } from 'lucide-react'

// Reusa el panel de emoji del chatbot (misma dependencia que el admin).
// Lazy + ssr:false → chunk descargado solo en el primer open.
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

const PANEL_W = 340
const PANEL_H = 380
const PANEL_MIN_H = 240
const GAP = 8
const MARGIN = 8

type PanelPosition = { left: number; bottom: number; width: number; height: number }

// El composer vive al fondo del layout → el panel abre hacia arriba.
// Portaleado a body con position:fixed para no quedar clippeado por overflow-hidden.
function calcPosition(trigger: HTMLElement): PanelPosition {
  const rect = trigger.getBoundingClientRect()
  const width = Math.min(PANEL_W, window.innerWidth - MARGIN * 2)
  const left = Math.min(Math.max(MARGIN, rect.left), window.innerWidth - width - MARGIN)
  const spaceAbove = rect.top - GAP - MARGIN
  const height = Math.max(PANEL_MIN_H, Math.min(PANEL_H, spaceAbove))
  const bottom = window.innerHeight - rect.top + GAP
  return { left, bottom, width, height }
}

type EmojiPopoverProps = {
  onPick: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPopover({ onPick, disabled }: EmojiPopoverProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<PanelPosition | null>(null)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => setMounted(true), [])

  const openPanel = useCallback(() => {
    if (!buttonRef.current) return
    setPos(calcPosition(buttonRef.current))
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const handleScroll = (event: Event) => {
      if (panelRef.current?.contains(event.target as Node)) return
      setOpen(false)
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
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Insertar emoji"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Smile className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {mounted && open && pos
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Selector de emoji"
              style={{
                position: 'fixed',
                left: pos.left,
                bottom: pos.bottom,
                width: pos.width,
                height: pos.height,
                zIndex: 210,
              }}
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl backdrop-blur-[20px] backdrop-saturate-[180%]"
            >
              <EmojiPickerPanel
                onPick={(emoji) => {
                  onPick(emoji)
                  setOpen(false)
                }}
                width={pos.width - 2}
                height={pos.height - 2}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
