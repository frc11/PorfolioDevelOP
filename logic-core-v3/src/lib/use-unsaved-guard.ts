/**
 * LeadOS — Guardia de salida del navegador.
 *
 * Mientras `isDirty` sea true, intercepta el cierre de pestaña / recarga dura /
 * navegación fuera del sitio con el diálogo nativo "los cambios no se
 * guardarán". Es la red de seguridad del trabajo escrito del setter para el
 * caso que el autosave no puede cubrir solo (cerrar la pestaña en pleno tipeo).
 *
 * ── P23: la salida SPA ───────────────────────────────────────────────────────
 * `beforeunload` NO dispara en la navegación in-app. Este archivo decía que ese
 * caso quedaba "cubierto por el autosave + el indicador de estado visible", y
 * para seis de los siete formularios es verdad. Para el VEREDICTO no: es de una
 * sola pasada, sin autosave y sin borrador (A-24), así que salir con «Volver a
 * tu día» perdía el juicio entero sin decir nada.
 *
 * Por eso el aviso de salida interna es OPT-IN (`avisaEnSalidaInterna`): lo pide
 * el formulario que no tiene autosave detrás. Los que sí lo tienen no lo piden
 * y no cambian en nada — prenderlo ahí sería preguntar por trabajo que se está
 * guardando solo, y el debounce haría preguntar de más.
 *
 * El estado vive en un store de módulo y no en un contexto porque las dos
 * puntas no comparten árbol: el que ensucia es un formulario del Registro y el
 * que pregunta es el enlace de la cabecera, que `PantallaManual` y
 * `EstadoManual` montan por separado. Sólo puede haber un formulario sin
 * autosave a la vez (una pantalla del manual por vez), así que la clave del
 * store es el propio efecto: el último que monta manda, y al desmontar limpia.
 */
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

type Suscriptor = () => void

/** Los dueños que declaran trabajo sin registrar AHORA. */
const sucios = new Set<symbol>()
const suscriptores = new Set<Suscriptor>()

function avisar() {
  for (const s of suscriptores) s()
}

function suscribir(s: Suscriptor) {
  suscriptores.add(s)
  return () => {
    suscriptores.delete(s)
  }
}

function leer() {
  return sucios.size > 0
}

/** En el server no hay trabajo sin registrar: el store es del cliente. */
function leerEnServer() {
  return false
}

/**
 * ¿Hay trabajo cargado y sin registrar en la pantalla de ahora?
 *
 * Lo consume el enlace de salida del manual para preguntar antes de irse. Es
 * `useSyncExternalStore` y no un contexto por lo que explica la cabecera: las
 * dos puntas no comparten árbol.
 */
export function useHayTrabajoSinRegistrar(): boolean {
  return useSyncExternalStore(suscribir, leer, leerEnServer)
}

/**
 * Marca el trabajo sin registrar de un formulario.
 *
 * @param isDirty          si hay algo cargado que todavía no se guardó
 * @param avisaEnSalidaInterna  además del diálogo del navegador, publicar el
 *   estado para que la navegación in-app pregunte. Sólo lo pide el formulario
 *   SIN autosave — ver la cabecera.
 */
export function useUnsavedGuard(
  isDirty: boolean,
  opciones?: { avisaEnSalidaInterna?: boolean },
): void {
  const avisaEnSalidaInterna = opciones?.avisaEnSalidaInterna ?? false

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

  // Identidad estable por montaje: el store cuenta DUEÑOS, no renders.
  const duenio = useRef<symbol | null>(null)
  if (duenio.current === null) duenio.current = Symbol('trabajo-sin-registrar')

  useEffect(() => {
    const clave = duenio.current
    if (!clave) return
    if (!avisaEnSalidaInterna || !isDirty) {
      if (sucios.delete(clave)) avisar()
      return
    }
    if (!sucios.has(clave)) {
      sucios.add(clave)
      avisar()
    }
    return () => {
      if (sucios.delete(clave)) avisar()
    }
  }, [isDirty, avisaEnSalidaInterna])
}

/**
 * Baja la marca a mano — la llama el formulario cuando el registro SÍ entró, para
 * que la navegación que viene después (la que hace el propio submit) no pregunte
 * por un trabajo que ya está guardado.
 */
export function useOlvidarTrabajoSinRegistrar(): () => void {
  return useCallback(() => {
    if (sucios.size === 0) return
    sucios.clear()
    avisar()
  }, [])
}
