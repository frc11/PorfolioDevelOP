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
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️  EL `successToast` NO ES SÓLO EL ACUSE: ES LO QUE HACE QUE LA PANTALLA SE
 *     ACTUALICE. Sacarlo deja la pantalla congelada en el estado viejo.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Suena raro y está medido (P29 · P30 · P31). La cadena completa:
 *
 *   1. `run()` despacha la action. Next envuelve ese despacho en
 *      `React.startTransition` SIEMPRE (`callServer`, en
 *      `next/dist/client/app-call-server.js`): producto no puede evitarlo.
 *   2. El estado del router queda en una promesa que `AppRouter` consume con
 *      `use()`, así que el render de la transición SUSPENDE
 *      (`root.suspendedLanes |= 0x200`, `root.warmLanes |= 0x200`).
 *   3. La action responde (~0,9 s) y React entrega EXACTAMENTE UN ping. Si en
 *      ese reintento el árbol RSC revalidado todavía no resolvió, el render se
 *      re-suspende — y de esa segunda suspensión NO LLEGA NINGÚN PING MÁS:
 *      `getNextLanes` no vuelve a elegir un lane marcado «warm».
 *   4. Sólo una actualización de estado no-idle en el mismo root lo destraba:
 *      `markRootUpdated` pone `suspendedLanes = 0` y `warmLanes = 0`, React
 *      reintenta, y con los datos ya listos COMMITEA.
 *   5. Hoy, en producción, esa actualización es EL AUTO-CIERRE DEL CARTEL de
 *      sonner, a los 4000 ms de haberse montado. Por eso el setter ve el
 *      resultado de su acción a los ~4,7 s y no al segundo.
 *
 * Medido: sin cartel, `mc1` no refleja NUNCA — 75 s con el dossier ya escrito en
 * la base y un único ping a los 973 ms.
 *
 * QUÉ LO ROMPE (las cuatro, en silencio y con todos los gates en verde):
 *   · sacar el `<Toaster>` de `app/layout.tsx`;
 *   · pasarle un `duration` corto (medido: 800 ms anda —cierra a ~1,4 s—, 150 ms
 *     NO: el cierre cae adentro de la ventana de la carrera y no commitea nunca);
 *   · quitarle el `successToast` a una acción que revalida;
 *   · migrar de sonner a otra librería de avisos que no monte/desmonte con
 *     `setState` en este mismo root.
 *
 * CÓMO VERIFICARLO — hacen falta los dos, y ninguno alcanza solo:
 *   npm run check:invariant:reflejo   (la FORMA: Toaster montado, duration,
 *                                      cartel en cada acción que revalida)
 *   npm run test:setter -- 31-reflejo (la CONDUCTA: que la pantalla commitee)
 *
 * ES UNA LIMITACIÓN ACEPTADA A PROPÓSITO, no un descuido. Las alternativas se
 * midieron y se descartaron con evidencia —empujón deliberado (el umbral es una
 * carrera, 800-1100 ms), estado optimista (cambia QUÉ ve el setter), subir React
 * (19.2.8 se atasca 6/6), volver a `router.refresh()` (refutado, y devuelve el
 * render de servidor que P28 sacó)—. Todo en `docs/perf-p30/REPORTE.md`.
 *
 * OJO con la regla simplificada: NO es «toda acción emite cartel». La que no
 * revalida no lo necesita, porque no hay árbol de servidor esperando commit —
 * `ofrecerHorarios` (m16) es ese caso, medido: refleja 4/4 a ~0,7 s sin ningún
 * cartel, empujada por su propio `setState` en `onSuccess`.
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
