/**
 * [B12a.6] LA SEÑAL DEL VELO DE LA NAVEGACIÓN — sin react: la pide quien navega (`_componentes/navegacion/EnlaceDeRuta.tsx`) y la atiende
 * el velo del layout (`_chrome/velo/VeloDeNavegacion.tsx`), como la señal de la salida de la variante. Acá, porque `_componentes` no
 * importa de `_chrome`.
 *
 * [B12a.8] El color ya no es la noche del destino: lo decide el velo, que contrasta con lo que tapa. Y el velo avisa a la ventana cuándo
 * empieza a cubrir y cuándo la página nueva tiene su scroll (`EVENTOS_DEL_VELO`): la píldora de la navbar, que vive en el layout, se
 * desliza a su lugar del destino mientras el velo pasa.
 */

/** El home (`/v3`; con D8, `/`). */
export const RUTA_DEL_HOME = '/v3'

/** Lo que pide quien navega: `cubierto` se llama con el cuadro cubierto entero. */
export interface PedidoDelVelo {
  readonly cubierto: () => void
}

let atender: ((p: PedidoDelVelo) => void) | null = null

/** Cubre el cuadro con el velo y resuelve cuando está cubierto entero; sin el velo montado, en el acto. Se resuelve siempre. */
export function cubrirConElVelo(): Promise<void> {
  return new Promise((resolver) => {
    if (atender === null) resolver()
    else atender({ cubierto: resolver })
  })
}

/** Sólo el velo del layout: atiende los pedidos mientras está montado. */
export function atenderElVelo(a: (p: PedidoDelVelo) => void): () => void {
  atender = a
  return () => {
    if (atender === a) atender = null
  }
}

/**
 * [B12a.8] Los avisos del velo en `window`: `cubre`, al empezar a cubrir (por un enlace o por la flecha: la página que se va todavía está);
 * `repuso`, con la ruta nueva montada y su scroll puesto (debajo del velo, antes de destapar). [B12a.8] `destapa`, al empezar a destapar
 * (en un cuadro del rAF, con el hilo libre: lo que arranque ahí no queda «empezado en el pasado»); `quieto`, al terminar.
 */
export const EVENTOS_DEL_VELO = { cubre: 'v3:velo-cubre', repuso: 'v3:velo-repuso', destapa: 'v3:velo-destapa', quieto: 'v3:velo-quieto' } as const

/**
 * [B12a.8] (4) EL VELO EN CURSO — cubriendo, tapando o destapando (lo escribe el velo al marcar su fase; `quieto` avisa al terminar). Lo
 * leen las obras pesadas del home que no hacen falta para su primer cuadro: la frase 3D del CTA del final y las piezas del pie (unos 360 y
 * 165 ms cada vez, medido en el build) y los títulos del ocio. Llegando al home con el velo, se armaban mientras el velo tapaba y destapaba:
 * la página nueva esperaba tapada más de 1 s y el destape tironeaba. Ahora esperan al velo quieto, salvo lo que está a la vista (la vuelta
 * al pie con la flecha): eso se arma tapado, como antes.
 */
export const VELO_EN_CURSO = { activo: false }

/** Cerca del cuadro (media pantalla de margen): lo que se ve al destapar o apenas se scrollea. */
const aLaVista = (el: Element | null): boolean => {
  if (el === null) return false
  const r = el.getBoundingClientRect()
  return r.bottom > -0.5 * window.innerHeight && r.top < 1.5 * window.innerHeight
}

/** ¿Esta obra espera al velo? Sí mientras el velo está en curso y ninguno de sus lugares está a la vista. */
export function esperaAlVelo(lugares: readonly (Element | null)[]): boolean {
  return VELO_EN_CURSO.activo && !lugares.some(aLaVista)
}

/** Corre `f` ya con el velo quieto, o cuando quede quieto. Devuelve cómo cancelarla. */
export function cuandoElVeloQuede(f: () => void): () => void {
  if (!VELO_EN_CURSO.activo) {
    f()
    return () => undefined
  }
  window.addEventListener(EVENTOS_DEL_VELO.quieto, f, { once: true })
  return () => window.removeEventListener(EVENTOS_DEL_VELO.quieto, f)
}
