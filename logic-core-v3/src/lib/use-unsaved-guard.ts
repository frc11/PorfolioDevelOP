/**
 * LeadOS — Guardia de salida del navegador.
 *
 * Mientras `isDirty` sea true, intercepta el cierre de pestaña / recarga dura /
 * navegación fuera del sitio con el diálogo nativo "los cambios no se
 * guardarán". Es la red de seguridad del trabajo escrito del setter para el
 * caso que el autosave no puede cubrir solo (cerrar la pestaña en pleno tipeo).
 *
 * No cubre la navegación SPA in-app (no dispara `beforeunload`): ese caso queda
 * cubierto por el autosave + el indicador de estado visible.
 */
import { useEffect } from 'react'

export function useUnsavedGuard(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return

    const handler = (event: BeforeUnloadEvent) => {
      // preventDefault + returnValue: lo que los navegadores (modernos y
      // legacy) exigen para disparar el diálogo de confirmación.
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
