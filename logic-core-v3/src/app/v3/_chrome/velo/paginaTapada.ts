import { scrollDeLaRuta } from './alCambiarDeRuta'

/**
 * [B12b] LA PÁGINA QUE LLEGA, TAPADA POR LA ESCENA — en el viaje del CTA de un servicio no hay banda: lo que cubre el cuadro es la escena
 * (el papel del home ya se levantó). Con la navegación cliente el `<main>` de la página nueva entra en el commit con el scroll del home
 * todavía puesto (el `<Link>` va con `scroll={false}`): el documento, más corto, lo acota y el primer cuadro mostraría el papel del fondo
 * de la página. Por eso, antes de navegar, se observa el documento y cada `<main>` NUEVO entra transparente y con el scroll de su ruta,
 * en la microtarea del commit (antes de pintar). Al destapar, aparece encima de la escena (su texto: el título va en el lienzo).
 */

export interface PaginaTapada {
  /** Aparece la página nueva (de transparente a entera en `ms`) y avisa al terminar; si no llegó ninguna, en el acto. */
  readonly mostrar: (ms: number, alTerminar: () => void) => void
  /** Deja de observar y devuelve lo tapado como estaba (sin aparecer: una navegación que no fue). */
  readonly soltar: () => void
}

/** Sólo con banco: el defecto del control (`window.__defectosDelViaje = 'sin-tapar'`: la página nueva entra a la vista, con el scroll viejo). */
const sinTapar = (): boolean => (window as Window & { __defectosDelViaje?: unknown }).__defectosDelViaje === 'sin-tapar'

export function taparLaPaginaQueLlega(): PaginaTapada {
  const viejas = new Set(document.querySelectorAll('main'))
  const tapadas = new Set<HTMLElement>()
  let reubicada = false
  const revisar = (): void => {
    if (sinTapar()) return
    for (const m of document.querySelectorAll<HTMLElement>('main')) {
      if (viejas.has(m) || tapadas.has(m)) continue
      // Sin transición: la de `deslizamiento.css` la dejaría aparecer a la vista antes del destape.
      m.style.transition = 'none'
      m.style.opacity = '0'
      tapadas.add(m)
      if (!reubicada) {
        reubicada = true
        scrollDeLaRuta()
      }
    }
  }
  const observador = new MutationObserver(revisar)
  observador.observe(document.body, { childList: true, subtree: true })
  return {
    mostrar: (ms, alTerminar) => {
      observador.disconnect()
      const conectadas = [...tapadas].filter((m) => m.isConnected)
      tapadas.clear()
      if (conectadas.length === 0) {
        alTerminar()
        return
      }
      let faltan = conectadas.length
      for (const m of conectadas) {
        m.style.opacity = ''
        const a = m.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' })
        a.onfinish = a.oncancel = () => {
          m.style.transition = ''
          faltan -= 1
          if (faltan === 0) alTerminar()
        }
      }
    },
    soltar: () => {
      observador.disconnect()
      for (const m of tapadas) {
        m.style.opacity = ''
        void m.offsetWidth // la transición se devuelve después del valor: no se dispara un fundido
        m.style.transition = ''
      }
      tapadas.clear()
    },
  }
}
