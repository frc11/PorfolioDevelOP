/**
 * LeadOS — Autosave del trabajo escrito del setter (ficha / brief).
 *
 * Guarda en pausa (debounce trailing) con tres garantías que importan en la
 * cabina:
 *   - Coalescing: si llegan ediciones MIENTRAS se guarda, se reintenta lo más
 *     nuevo al terminar — nunca se pierde la última tecla por una carrera.
 *   - Tope de espera (`maxWaitMs`): aunque el setter no pare de tipear, se
 *     fuerza un guardado — acota lo que se pierde si se corta la conexión.
 *   - `enabled`: cuando es false el autosave queda inerte (no agenda, no
 *     guarda) pero sigue calculando `isDirty` para la guardia de salida.
 *
 * NO decide QUÉ persiste: recibe una `save` que DEBE reusar la server action de
 * dominio (con su ownership y SIN transición de stage). El hook no abre ningún
 * camino de escritura nuevo.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ActionResult } from '@/lib/action-utils'

export type AutosavePhase = 'idle' | 'saving' | 'saved' | 'error'

type UseAutosaveParams<T> = {
  /** Valor actual del formulario; se compara por `serialize` para detectar cambios. */
  value: T
  /** Persiste el valor. Debe reusar la action de dominio (ownership + sin transición). */
  save: (value: T) => Promise<ActionResult<unknown>>
  /** Si es false, el autosave no corre (pero `isDirty` se sigue calculando). */
  enabled: boolean
  /** Debounce desde la última tecla. */
  delayMs?: number
  /** Tope con cambios pendientes: fuerza guardado aunque siga tipeando. */
  maxWaitMs?: number
  /** Serializador para snapshot/comparación. Default `JSON.stringify`. */
  serialize?: (value: T) => string
}

type UseAutosaveResult = {
  phase: AutosavePhase
  isDirty: boolean
  /** Marca el valor actual como ya persistido (lo llama el guardado manual al tener éxito). */
  markSaved: () => void
}

const DEFAULT_DELAY_MS = 1200
const DEFAULT_MAX_WAIT_MS = 8000

export function useAutosave<T>({
  value,
  save,
  enabled,
  delayMs = DEFAULT_DELAY_MS,
  maxWaitMs = DEFAULT_MAX_WAIT_MS,
  serialize = (current) => JSON.stringify(current),
}: UseAutosaveParams<T>): UseAutosaveResult {
  const serialized = serialize(value)
  const [phase, setPhase] = useState<AutosavePhase>('idle')

  // Snapshot de lo último PERSISTIDO (no del último tipeo): su diferencia con
  // `serialized` es lo "sucio". Arranca en el valor inicial → mount no es sucio.
  const persistedRef = useRef(serialized)
  // Espejo del último valor para el guardado diferido (evita closures viejas).
  const latestRef = useRef<{ value: T; serialized: string }>({ value, serialized })
  const savingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstDirtyAtRef = useRef<number | null>(null)
  const scheduleRef = useRef<() => void>(() => {})

  // Espejos de props que el flush diferido lee (mismo motivo anti-closure).
  const enabledRef = useRef(enabled)
  const saveRef = useRef(save)
  const delayRef = useRef(delayMs)
  const maxWaitRef = useRef(maxWaitMs)

  useEffect(() => {
    enabledRef.current = enabled
    saveRef.current = save
    delayRef.current = delayMs
    maxWaitRef.current = maxWaitMs
    latestRef.current = { value, serialized }
  })

  const isDirty = serialized !== persistedRef.current

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const flush = useCallback(async () => {
    clearTimer()
    if (savingRef.current || !enabledRef.current) return
    const snapshot = latestRef.current
    if (snapshot.serialized === persistedRef.current) return

    savingRef.current = true
    setPhase('saving')
    let succeeded = false
    const persistedBefore = persistedRef.current
    try {
      const result = await saveRef.current(snapshot.value)
      if (persistedRef.current !== persistedBefore) {
        // El guardado manual (`markSaved`) corrió durante este request: él es
        // dueño del estado persistido ahora. No pisamos su phase ni su snapshot
        // (que puede ser más nuevo que el nuestro); solo dejamos que el re-arm
        // cubra ediciones aún posteriores. Evita un "error" falso si la red
        // falla después de un guardado manual exitoso.
        succeeded = true
      } else if (result.success) {
        persistedRef.current = snapshot.serialized
        firstDirtyAtRef.current = null
        succeeded = true
        setPhase('saved')
      } else {
        setPhase('error')
      }
    } catch {
      setPhase('error')
    } finally {
      savingRef.current = false
      // ¿Llegaron más ediciones mientras guardábamos? Reintentar lo más nuevo.
      // Solo en éxito: ante un error esperamos una edición nueva (no loopear
      // sobre un fallo duro como "lead ajeno" o "stage movido").
      if (succeeded && enabledRef.current && latestRef.current.serialized !== persistedRef.current) {
        scheduleRef.current()
      }
    }
  }, [clearTimer])

  const schedule = useCallback(() => {
    clearTimer()
    const now = Date.now()
    if (firstDirtyAtRef.current === null) firstDirtyAtRef.current = now
    const waited = now - firstDirtyAtRef.current
    const delay = Math.max(0, Math.min(delayRef.current, maxWaitRef.current - waited))
    timerRef.current = setTimeout(() => {
      void flush()
    }, delay)
  }, [clearTimer, flush])

  useEffect(() => {
    scheduleRef.current = schedule
  }, [schedule])

  // Agenda/cancela según ensuciamiento. La limpieza cancela el timer pendiente
  // al cambiar deps o al desmontar (cierre de pestaña con guardado en vuelo).
  useEffect(() => {
    if (serialized === persistedRef.current) {
      firstDirtyAtRef.current = null
      clearTimer()
      return
    }
    if (!enabled) return
    scheduleRef.current()
    return clearTimer
  }, [serialized, enabled, clearTimer])

  const markSaved = useCallback(() => {
    clearTimer()
    persistedRef.current = latestRef.current.serialized
    firstDirtyAtRef.current = null
    setPhase('saved')
  }, [clearTimer])

  return { phase, isDirty, markSaved }
}
