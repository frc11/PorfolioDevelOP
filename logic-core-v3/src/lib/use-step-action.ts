/**
 * LeadOS — El ciclo submit de los steps del wizard, en un solo lugar (A-16).
 *
 * Encapsula el patrón que los steps repetían a mano: ejecutar la server action
 * dentro de una transición, `toast.error` con el mensaje del server ante el
 * fallo y toast de éxito (fijo o derivado del payload de la action).
 *
 * P28 — Ya NO hace `router.refresh()`. Toda action de este dominio revalida, y
 * la respuesta del POST de la server action YA TRAE el árbol re-renderizado de
 * la pantalla actual: React lo aplica solo. El refresh pedía ESE MISMO árbol una
 * segunda vez — un render de servidor entero (~290 ms) por acción, para nada.
 * Medido, no deducido: `npm run test:perf` compara el texto de `main` antes y
 * después de cada acción; sin el refresh sigue cambiando en las tres pasadas, y
 * el camino crítico de red baja de ~1,4 s a ~0,95 s.
 *
 * Lo que varía por step entra por parámetros — el hook NO homogeneiza
 * comportamiento ni decide QUÉ persiste:
 *   - `onError`: estado propio del step ante el fallo del server
 *     (setServerError, resets condicionales). Corre antes del `toast.error`.
 *   - `onSuccess`: estado propio tras el éxito (cerrar un modal, limpiar el
 *     form). Corre antes del toast de éxito.
 *   - `successToast` omitido = sin toast (búsquedas que solo cargan datos).
 *
 * La validación con Zod queda EN el step: cada form arma su payload y decide
 * qué hacer con sus errores (per-campo, primer mensaje, abrir un modal).
 * `erroresPorCampo` es solo el mapeo ZodError → primer mensaje por campo que
 * los steps con errores per-campo copiaban idéntico.
 */
import { useTransition } from 'react'
import { toast } from 'sonner'
import type { ZodError } from 'zod'
import type { ActionResult } from '@/lib/action-utils'

export type StepActionOptions<TData> = {
  /** Toast de éxito: texto fijo o derivado del payload de la action. */
  successToast?: string | ((data: TData) => string)
  /**
   * Estado propio del step ante el error del server. Recibe el copy y, si la
   * action lo emitió, el `code` estructurado (4.1) — matchear por código, nunca
   * por substring del mensaje.
   */
  onError?: (error: string, code?: string) => void
  /** Estado propio del step tras el éxito. */
  onSuccess?: (data: TData) => void
}

export function useStepAction() {
  const [isPending, startTransition] = useTransition()

  function run<TData>(
    action: () => Promise<ActionResult<TData>>,
    options: StepActionOptions<TData> = {},
  ): void {
    const { successToast, onError, onSuccess } = options
    startTransition(async () => {
      const result = await action()
      if (!result.success) {
        onError?.(result.error, result.code)
        toast.error(result.error)
        return
      }
      onSuccess?.(result.data)
      if (successToast !== undefined) {
        toast.success(
          typeof successToast === 'function' ? successToast(result.data) : successToast,
        )
      }
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
