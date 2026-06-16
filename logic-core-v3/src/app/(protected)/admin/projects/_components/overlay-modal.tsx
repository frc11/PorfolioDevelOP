'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const emptySubscribe = () => () => {}

/** Hydration-safe client gate (no setState-in-effect). False on the server, true after mount. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

type OverlayModalProps = {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  children: ReactNode
  /** Tailwind max-width utility for the panel, e.g. `max-w-3xl`. */
  panelClassName?: string
  /** When false, Escape and backdrop clicks do not close the modal. */
  dismissible?: boolean
}

/**
 * Lane-local modal shell. Portals to `document.body` so the overlay escapes the
 * admin `<main>` `backdrop-filter` containing-block trap and darkens the whole
 * viewport regardless of scroll. Handles backdrop + centering, body scroll lock,
 * Escape / backdrop close, focus to the panel and focus return on close, and the
 * dialog aria contract.
 */
export function OverlayModal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  panelClassName = 'max-w-2xl',
  dismissible = true,
}: OverlayModalProps) {
  const isClient = useIsClient()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const requestClose = useCallback(() => {
    if (dismissible) {
      onClose()
    }
  }, [dismissible, onClose])

  // Keep the latest dismiss handler in a ref so the open-effect below depends
  // only on `open` and does not re-run (re-locking scroll / re-capturing focus)
  // on every parent render.
  const requestCloseRef = useRef(requestClose)
  useEffect(() => {
    requestCloseRef.current = requestClose
  }, [requestClose])

  useEffect(() => {
    if (!open) {
      return
    }

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        requestCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = previousOverflow

      const toFocus = previouslyFocused.current
      if (toFocus && document.contains(toFocus)) {
        toFocus.focus()
      }
    }
  }, [open])

  if (!isClient || !open) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md"
      onClick={requestClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-[28px] border border-white/10 bg-[#0c1016]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] outline-none backdrop-blur-xl ${panelClassName}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="text-xs tracking-tight text-zinc-500">{eyebrow}</p>
            ) : null}
            <h3
              id={titleId}
              className="mt-2 text-2xl font-semibold tracking-tight text-white"
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  )
}
