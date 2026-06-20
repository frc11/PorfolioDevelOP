'use client'

import { useEffect, useRef } from 'react'

export type ShortcutMap = Record<string, (event: KeyboardEvent) => void>

/**
 * ¿El foco está en algo donde el usuario ESCRIBE? Entonces el atajo no corre —
 * regla de accesibilidad no negociable: no secuestrar teclas que hacen falta
 * para tipear/operar un control. Cubre inputs, textareas, selects nativos,
 * contenteditable y los combobox/listbox propios (`Select.tsx`, que manejan sus
 * flechas/Enter/Escape).
 */
function esEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return target.closest('[role="textbox"],[role="listbox"],[role="combobox"]') !== null
}

/**
 * Atajos de teclado a nivel ventana para las superficies del setter. `bindings`
 * mapea `event.key` → handler. No dispara si:
 *   - hay modificador (Ctrl/Cmd/Alt) → los atajos del navegador/OS quedan intactos;
 *   - el foco está en un campo de escritura (`esEditable`);
 *   - otro handler ya hizo `preventDefault`.
 * Solo entonces hace `preventDefault` y corre el handler. Los bindings se leen
 * por ref para no re-suscribir el listener en cada render.
 */
export function useKeyboardShortcuts(bindings: ShortcutMap, enabled = true): void {
  const bindingsRef = useRef(bindings)

  useEffect(() => {
    bindingsRef.current = bindings
  })

  useEffect(() => {
    if (!enabled) return

    function onKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented) return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (esEditable(event.target)) return

      const handler = bindingsRef.current[event.key]
      if (!handler) return

      event.preventDefault()
      handler(event)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
