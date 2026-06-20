'use client'

import { useMemo, useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { zIndex } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { useKeyboardShortcuts, type ShortcutMap } from './use-keyboard-shortcuts'

/** Una fila de la ayuda: las teclas que la disparan + qué hace. */
export type Atajo = { teclas: string[]; accion: string }

/**
 * Ayuda mínima de "qué teclas" (discoverability), sin intrusión: una pastilla
 * fija abajo a la derecha; se abre con click o con `?` y se cierra con `Esc` o
 * click en cerrar. No es un modal — no atrapa el foco ni bloquea la página. El
 * mismo guard de `useKeyboardShortcuts` evita que `?` se dispare mientras se
 * escribe en un input.
 */
export function ShortcutsHelp({ atajos }: { atajos: Atajo[] }) {
  const [abierto, setAbierto] = useState(false)

  const bindings = useMemo<ShortcutMap>(() => {
    const map: ShortcutMap = { '?': () => setAbierto((valor) => !valor) }
    // `Esc` solo cierra cuando está abierto — así no le roba el `preventDefault`
    // a otros usos de Escape (cerrar un Select, etc.) cuando la ayuda no está.
    if (abierto) map.Escape = () => setAbierto(false)
    return map
  }, [abierto])
  useKeyboardShortcuts(bindings)

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2" style={{ zIndex: zIndex.overlay }}>
      {abierto && (
        <div
          role="dialog"
          aria-label="Atajos de teclado"
          className="w-64 rounded-2xl border border-white/[0.08] bg-[var(--color-void)]/90 p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px] backdrop-saturate-[180%]"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-200">Atajos de teclado</h2>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar ayuda"
              className="rounded-md p-0.5 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
          <ul className="space-y-1.5">
            {atajos.map((atajo) => (
              <li key={atajo.accion} className="flex items-center justify-between gap-3">
                <span className="min-w-0 text-[11px] leading-snug text-zinc-400">{atajo.accion}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {atajo.teclas.map((tecla) => (
                    <kbd
                      key={tecla}
                      className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-300"
                    >
                      {tecla}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-label="Atajos de teclado"
        aria-expanded={abierto}
        title="Atajos de teclado (?)"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40',
          abierto
            ? 'border-cyan-400/30 bg-cyan-500/15 text-cyan-200'
            : 'border-white/10 bg-[var(--color-void)]/80 text-zinc-400 backdrop-blur-[20px] hover:bg-white/[0.07] hover:text-zinc-200',
        )}
      >
        <Keyboard size={13} strokeWidth={1.5} aria-hidden />
        <kbd className="rounded border border-white/15 bg-white/[0.08] px-1 text-[10px] font-semibold">?</kbd>
      </button>
    </div>
  )
}
