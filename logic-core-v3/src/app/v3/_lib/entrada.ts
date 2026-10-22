/**
 * [B12c] LA ENTRADA DEL SITIO — el preloader de la primera entrada del día (`_chrome/preloader/`) la tiene cerrada mientras tapa la
 * página; al irse la abre. Sin React ni three: dos datos y sus oyentes, como `carga.ts`.
 *
 *   · **Cerrada**, lo que llega una vez por carga espera tapado: la carga del home no se abre (`carga.ts`: el titular del hero y el logo
 *     que cae) y el título de una página no llega (`TituloDePagina`). Así se ven entrar cuando el blanco del preloader se fue.
 *   · **Las retenciones del scroll:** lo que llega con la entrada retiene el scroll hasta llegar (el logo que cae en el home, el título de
 *     una página). El preloader suelta su bloqueo cuando la entrada está abierta y no queda ninguna (o a su tope).
 *
 * Abierta desde el principio sin preloader (las otras entradas del día, las recargas, la navegación interna) y en el servidor. La decisión
 * la toma el script del `<head>` antes del primer pintado (`_chrome/preloader/decision.ts`) y la deja en la ventana; acá se lee la primera
 * vez que alguien pregunta (al hidratar ya está).
 */
type VentanaConLaDecision = Window & { __preloaderDelSitio?: { readonly activo?: unknown } }

let abierta: boolean | null = null
let retenciones = 0
const oyentes = new Set<() => void>()

function avisar(): void {
  for (const f of oyentes) f()
}

/** ¿Ya entró? Sin preloader, desde el principio; en el servidor, siempre. */
export function entradaAbierta(): boolean {
  if (abierta !== null) return abierta
  if (typeof window === 'undefined') return true
  abierta = (window as VentanaConLaDecision).__preloaderDelSitio?.activo !== true
  return abierta
}

/** El preloader se fue (su blanco terminó de fundirse): lo que esperaba a la entrada arranca. Una vez. */
export function abrirLaEntrada(): void {
  if (entradaAbierta()) return
  abierta = true
  avisar()
}

/** Lo que llega con la entrada retiene el scroll hasta llegar. Devuelve cómo soltarlo (una vez: soltar de nuevo no hace nada). */
export function retenerElScroll(): () => void {
  retenciones += 1
  avisar()
  let suelta = false
  return () => {
    if (suelta) return
    suelta = true
    retenciones -= 1
    avisar()
  }
}

export const scrollRetenido = (): boolean => retenciones > 0

export function suscribirALaEntrada(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
