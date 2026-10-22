import { RUTA_DEL_HOME } from '../../_lib/veloDeNavegacion'
import { REGISTRO_DE_VARIANTES } from '../../_variantes/registro'
import { LEGIBILIDAD_POR_DEFECTO, fuentesConLaLegibilidad } from '../titulos3d/legibilidad'
import { CARA_DEL_DOM, TITULO_DE_PAGINA } from '../titulos3d/presets'

/** [T0] Las dos fuentes del título de una página, con la legibilidad elegida (`peso`: la liviana un paso más pesada). */
const FUENTES_DEL_DESTINO = fuentesConLaLegibilidad(TITULO_DE_PAGINA.fuentes, LEGIBILIDAD_POR_DEFECTO)

/**
 * [B12a.8] CALENTAR EL DESTINO — mientras el puntero está encima del enlace (o tiene el foco) y mientras el velo cubre: lo que la página
 * nueva va a pedir apenas se monta y se puede pedir antes. Para una página: las dos fuentes de su título (las 3D, con un import dinámico:
 * el chrome no carga three, y las del DOM, con `document.fonts.load`), así el título se arma tapado. Para el home, nada: sus fuentes
 * vienen con el lienzo. Una sola vez por fuente; nunca falla.
 */
const pedidas = new Set<string>()

const rutaDe = (href: string): string => href.split('#')[0]?.split('?')[0] ?? href

export function calentarElDestino(href: string): void {
  const ruta = rutaDe(href)
  if (ruta === RUTA_DEL_HOME || ruta === '' || !ruta.startsWith(`${RUTA_DEL_HOME}/`) || pedidas.has(ruta)) return
  pedidas.add(ruta)
  // [T0] 11 · 1 · y los trozos de las variantes del registro: la escena destapa con la variante de la página ya dibujada (`listaDeLaRuta.ts`).
  for (const cargar of Object.values(REGISTRO_DE_VARIANTES)) void cargar().catch(() => undefined)
  void import('../../_lib/escena/titulos3d/fuentesDePagina')
    .then((m) => Promise.all(FUENTES_DEL_DESTINO.map((f) => m.cargarLaFuenteDePagina(f))))
    .catch(() => undefined)
  if (typeof document === 'undefined' || document.fonts === undefined) return
  // Las variables de las caras las declara el layout en su contenedor (`[data-v3]`).
  const raiz = getComputedStyle(document.querySelector('[data-v3]') ?? document.documentElement)
  for (const f of FUENTES_DEL_DESTINO) {
    const familia = raiz.getPropertyValue(CARA_DEL_DOM[f].familia.slice(4, -1)).trim()
    if (familia !== '') void document.fonts.load(`${String(CARA_DEL_DOM[f].peso)} 1em ${familia}`).catch(() => undefined)
  }
}
