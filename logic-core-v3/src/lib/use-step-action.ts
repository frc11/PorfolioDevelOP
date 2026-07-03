/**
 * LeadOS — El ciclo submit de los steps del wizard, en un solo lugar (A-16).
 *
 * Encapsula el patrón que los steps repetían a mano: ejecutar la server action
 * dentro de una transición, `toast.error` con el mensaje del server ante el
 * fallo, toast de éxito (fijo o derivado del payload de la action) y
 * `router.refresh()` para re-derivar el wizard del estado persistido.
 *
 * Lo que varía por step entra por parámetros — el hook NO homogeneiza
 * comportamiento ni decide QUÉ persiste:
 *   - `onError`: estado propio del step ante el fallo del server
 *     (setServerError, resets condicionales). Corre antes del `toast.error`.
 *   - `onSuccess`: estado propio tras el éxito (cerrar un modal, limpiar el
 *     form). Corre antes del toast de éxito y del refresh.
 *   - `successToast` omitido = sin toast (búsquedas que solo cargan datos).
 *   - `refresh: false` = sin `router.refresh()` (ídem).
 *
 * La validación con Zod queda EN el step: cada form arma su payload y decide
 * qué hacer con sus errores (per-campo, primer mensaje, abrir un modal).
 * `erroresPorCampo` es solo el mapeo ZodError → primer mensaje por campo que
 * los steps con errores per-campo copiaban idéntico.
 */
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ZodError } from 'zod'
import type { ActionResult } from '@/lib/action-utils'

export type StepActionOptions<TData> = {
  /** Toast de éxito: texto fijo o derivado del payload de la action. */
  successToast?: string | ((data: TData) => string)
  /** `router.refresh()` tras el éxito. Default true (el ciclo submit estándar). */
  refresh?: boolean
  /** Estado propio del step ante el error del server. */
  onError?: (error: string) => void
  /** Estado propio del step tras el éxito. */
  onSuccess?: (data: TData) => void
}

export function useStepAction() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function run<TData>(
    action: () => Promise<ActionResult<TData>>,
    options: StepActionOptions<TData> = {},
  ): void {
    const { successToast, refresh = true, onError, onSuccess } = options
    startTransition(async () => {
      const result = await action()
      if (!result.success) {
        onError?.(result.error)
        toast.error(result.error)
        return
      }
      onSuccess?.(result.data)
      if (successToast !== undefined) {
        toast.success(
          typeof successToast === 'function' ? successToast(result.data) : successToast,
        )
      }
      if (refresh) router.refresh()
    })
  }

  return { isPending, run }
}

/**
 * Mapeo ZodError → primer mensaje por campo — el loop que los steps con
 * errores per-campo (Evaluación, Brief) copiaban idéntico. Mismo criterio que
 * el original: solo `path[0]`, y gana el primer issue de cada campo.
 */
export function erroresPorCampo<Campo extends string>(
  error: ZodError,
): Partial<Record<Campo, string>> {
  const errores: Partial<Record<Campo, string>> = {}
  for (const issue of error.issues) {
    const campo = issue.path[0] as Campo | undefined
    if (campo && !errores[campo]) errores[campo] = issue.message
  }
  return errores
}
