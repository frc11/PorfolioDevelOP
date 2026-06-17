'use client'

/**
 * LeadOS — Acordeón de la ficha de observación con apertura por HOVER,
 * exactamente una sección abierta a la vez (default: la primera). Mejora
 * progresiva sobre click; reglas:
 *   - Hover con intención (debounce ~110ms): pasar el mouse de largo no abre.
 *   - Lock anti-cascada: durante la transición se ignoran los `mouseenter`, así
 *     el reflow al abrir/cerrar no dispara aperturas espurias bajo el cursor.
 *   - Nunca colapsa todo al salir del panel (evita flicker): siempre queda una
 *     sección abierta hasta que se hoverea/activa otra.
 *   - Headers de altura estable; sólo anima el body (grid-rows 0fr↔1fr +
 *     opacity, ease del proyecto, <300ms). `prefers-reduced-motion`: instantáneo.
 *   - A11y: headers son `<button>` (disclosure) con `aria-expanded` +
 *     `aria-controls` apuntando al region; el body colapsado sale del árbol de
 *     accesibilidad (`aria-hidden`). Click y foco de teclado abren igual — el
 *     hover es un extra, no el único camino.
 *
 * La sección abierta se trackea por `key` (no por índice): si el set de bloques
 * con contenido cambia, sigue habiendo exactamente una abierta (la primera como
 * fallback) en lugar de quedar cero abiertas.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/use-reduced-motion'

export type FichaAccordionItem = {
  key: string
  label: string
  texto: string
}

const HOVER_INTENT_MS = 110
const ANIM_MS = 260
// Margen sobre la animación: el lock se libera a ANIM_MS + buffer para absorber
// el jitter de scheduling y el offset hasta que la transición empieza a pintar.
const LOCK_BUFFER_MS = 60
// Ease firma del proyecto (CLAUDE.md) — ease-out suave, nunca ease-in/linear.
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

export function FichaAccordion({ items }: { items: FichaAccordionItem[] }) {
  const reduced = useReducedMotion()
  const [openKey, setOpenKey] = useState<string>(() => items[0]?.key ?? '')
  // Ref espejo del openKey, para dedupe sincrónico ante eventos rápidos (sin
  // closures viejas). Se mantiene al día SÓLO en `commitOpen` —único lugar que
  // cambia openKey— así no se escribe el ref durante el render.
  const openKeyRef = useRef(openKey)

  const intentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locked = useRef(false)

  // Si el openKey quedó viejo (cambió el set de bloques), abrir el primero —
  // garantiza que SIEMPRE haya exactamente una sección abierta.
  const openExists = items.some((item) => item.key === openKey)
  const effectiveOpenKey = openExists ? openKey : (items[0]?.key ?? '')

  const clearIntent = useCallback(() => {
    if (intentTimer.current) {
      clearTimeout(intentTimer.current)
      intentTimer.current = null
    }
  }, [])

  const commitOpen = useCallback(
    (key: string) => {
      clearIntent()
      if (openKeyRef.current === key) return // no-op: no lockea ni agenda
      openKeyRef.current = key
      setOpenKey(key)
      // Lock por la duración de la transición (+buffer): mientras corre, el
      // reflow no puede disparar un cambio de sección no pedido.
      locked.current = true
      if (lockTimer.current) clearTimeout(lockTimer.current)
      lockTimer.current = setTimeout(
        () => {
          locked.current = false
        },
        (reduced ? 0 : ANIM_MS) + LOCK_BUFFER_MS,
      )
    },
    [clearIntent, reduced],
  )

  const handleEnter = useCallback(
    (key: string) => {
      if (locked.current) return // anti-cascada: ignorar hover durante la transición
      clearIntent()
      intentTimer.current = setTimeout(() => commitOpen(key), HOVER_INTENT_MS)
    },
    [clearIntent, commitOpen],
  )

  // El mouse se va antes de cumplirse el debounce → cancelar la intención. No
  // cierra nada: siempre queda exactamente una sección abierta.
  const handleLeave = useCallback(() => clearIntent(), [clearIntent])

  // Click / foco de teclado: apertura inmediata, sin pasar por el hover-intent.
  const handleActivate = useCallback((key: string) => commitOpen(key), [commitOpen])

  useEffect(
    () => () => {
      if (intentTimer.current) clearTimeout(intentTimer.current)
      if (lockTimer.current) clearTimeout(lockTimer.current)
    },
    [],
  )

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = item.key === effectiveOpenKey
        const regionId = `ficha-acc-${item.key}`
        return (
          <div
            key={item.key}
            className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={regionId}
              onMouseEnter={() => handleEnter(item.key)}
              onMouseLeave={handleLeave}
              onFocus={() => handleActivate(item.key)}
              onClick={() => handleActivate(item.key)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:text-zinc-100 focus-visible:outline-none"
            >
              <span>{item.label}</span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 shrink-0 text-zinc-500', isOpen && 'rotate-180 text-zinc-300')}
                style={{
                  transition: reduced ? 'none' : `transform ${ANIM_MS}ms ${EASE}`,
                  willChange: 'transform',
                }}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
            <div
              id={regionId}
              role="region"
              aria-hidden={!isOpen}
              className="grid"
              style={{
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                opacity: isOpen ? 1 : 0,
                transition: reduced
                  ? 'none'
                  : `grid-template-rows ${ANIM_MS}ms ${EASE}, opacity ${ANIM_MS}ms ${EASE}`,
              }}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-wrap px-3 pb-3 text-xs leading-5 text-zinc-300">
                  {item.texto}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
