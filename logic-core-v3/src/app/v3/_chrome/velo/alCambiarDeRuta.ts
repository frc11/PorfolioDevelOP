import { DIA_DEL_FINAL, NOCHE_DISPARADA } from '../../_lib/escena/nocheDisparada'
import { AVANCE_DE_LA_INTRO } from '../../_lib/escena/ruta/pistaDeLaIntro'
import { LENIS_DEL_SITIO } from '../../_lib/lenisDelSitio'

/**
 * [B12a.6] LO QUE SE REPONE AL CAMBIAR DE RUTA (riesgo R1 del plan): con la navegación cliente el layout persiste, y con él los almacenes
 * que cada carga de documento reiniciaba. Se reponen acá, en un solo lugar, debajo del velo: la noche disparada (la de la gota del
 * Portfolio), el día del final (el amanecer del pie), el avance de la intro. Y el scroll: arriba, o en el ancla de la ruta (una sección del
 * home), con Lenis si está, sin animación. Lo que la página nueva mide (las secciones, la gota, el final) lo vuelve a medir ella al montarse.
 */
export function reponerLosAlmacenes(): void {
  NOCHE_DISPARADA.cantidad = 0
  DIA_DEL_FINAL.activo = false
  AVANCE_DE_LA_INTRO.current = 0
}

/** El scroll de la ruta nueva: el ancla, si la trae y existe; si no, arriba. Devuelve dónde quedó. */
export function scrollDeLaRuta(): number {
  const ancla = window.location.hash.length > 1 ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null
  const y = ancla === null ? 0 : Math.max(0, ancla.getBoundingClientRect().top + window.scrollY)
  llevarElScrollA(y)
  return y
}

/** [B12a.7] El scroll a `y` sin animación, con Lenis medido de nuevo (su límite era el del documento de la ruta que se fue). */
export function llevarElScrollA(y: number): void {
  const lenis = LENIS_DEL_SITIO.instancia
  if (lenis !== null) {
    lenis.resize()
    lenis.scrollTo(y, { immediate: true, force: true })
  }
  window.scrollTo({ top: y, behavior: 'instant' })
}
