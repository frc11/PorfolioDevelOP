'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Loader2, Smile } from 'lucide-react'
import { toast } from 'sonner'
import { useIsClient } from '../useIsClient'

// Chunk async (~75KB gzip): se descarga recién en el primer open del panel.
const EmojiPickerPanel = dynamic(() => import('./EmojiPickerPanel'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-zinc-500" strokeWidth={1.5} />
    </div>
  ),
})

interface EmojiPickerFieldProps {
  value: string | null
  onChange: (value: string | null) => void
}

// Espeja z.string().max(8) de saveBotConfig.ts — String.length cuenta UTF-16
// code units, la misma métrica que Zod, así que client y server no divergen.
// Emojis ZWJ complejos (👨‍👩‍👧‍👦 = 11 units) se rechazan enteros: truncar
// una secuencia ZWJ produce basura visual.
const AVATAR_EMOJI_MAX_UNITS = 8

const PANEL_W = 350
const PANEL_H = 400
const PANEL_MIN_H = 300
const GAP = 4
const MARGIN = 8

interface PanelPosition {
  top?: number
  bottom?: number
  left: number
  width: number
  height: number
}

// Variante del calcPosition de Select.tsx: el panel tiene tamaño propio (no el
// ancho del trigger), con clamp horizontal para mobile y alto degradable si
// ningún lado del trigger tiene los 400px completos.
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

export function EmojiPickerField({ value, onChange }: EmojiPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const mounted = useIsClient()

  const openPanel = useCallback(() => {
    if (!buttonRef.current) return
    setPanelPos(calcPosition(buttonRef.current))
    setOpen(true)
  }, [])

  const handlePick = useCallback(
    (emoji: string) => {
      if (emoji.length > AVATAR_EMOJI_MAX_UNITS) {
        toast.error('Ese emoji es demasiado complejo para guardarse. Probá con otro.')
        return
      }
      onChange(emoji)
      setOpen(false)
      buttonRef.current?.focus()
    },
    [onChange],
  )

  // Click-outside — chequea wrapper y panel (el portal rompe el containment)
  useEffect(() => {
    if (!open) return
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  // Scroll externo cierra (patrón Select). Resize REPOSICIONA en vez de cerrar:
  // en mobile, enfocar el search abre el teclado virtual → resize → con
  // close-on-resize el panel se cerraría solo al intentar buscar.
  useEffect(() => {
    if (!open) return
    const handleScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const handleResize = () => {
      if (buttonRef.current) setPanelPos(calcPosition(buttonRef.current))
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [open])

  // Escape global mientras está abierto — el foco puede estar dentro del picker
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div ref={wrapperRef} className="flex items-center gap-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Elegir emoji del avatar"
        className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-sm text-zinc-200 transition-colors focus:border-cyan-400/30 focus:outline-none"
      >
        {value ? (
          <span className="text-xl leading-none">{value}</span>
        ) : (
          <>
            <Smile className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
            <span className="text-zinc-500">Elegir emoji</span>
          </>
        )}
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          aria-hidden={true}
          className={`ml-auto shrink-0 text-zinc-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-sm border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
        >
          Quitar
        </button>
      )}

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
                {/* -2: el borde del shell (1px por lado) entra en el width fijado */}
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
    </div>
  )
}
