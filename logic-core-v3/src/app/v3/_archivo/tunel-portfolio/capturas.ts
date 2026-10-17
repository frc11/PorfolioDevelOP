/**
 * LAS CAPTURAS POR DISPOSITIVO — la dirección de arte de Trabajos. **[MÓVIL-TRABAJOS]**
 *
 * Cada proyecto tiene la captura de su sitio en tres cortes: la de escritorio
 * (1920 × 1080, la que declara el contenido), la de tablet (Safari de iPad,
 * 820 × 1180 a DPR 2) y la de móvil (Safari de iPhone, 390 × 844 a DPR 2). Son la
 * primera pantalla de cada sitio vista en ese aparato, no un recorte de la de
 * escritorio.
 *
 * Las rutas de tablet y móvil se DERIVAN de la de escritorio, así el contenido
 * sigue declarando un medio por proyecto. `trabajos.invariant` §26 lee los seis
 * archivos del disco y afirma que miden lo que dice acá.
 *
 * Los dos cortes son los del tema: móvil es lo que `max-movil:` toma (menos de
 * `--breakpoint-movil`, 426) y tablet lo que `max-escritorio:` toma (menos de 1024).
 * Un `<source media>` no puede leer una propiedad del tema, así que el número va
 * escrito y el invariante lo ata al CSS.
 */

import type { CSSProperties } from 'react'

import { COMPOSICION_MIN_ANCHO_PX } from '../../_lib/compuerta'

export type CorteDeCaptura = 'movil' | 'tablet'

/** `--breakpoint-movil`: el primer ancho que ya no es móvil. */
export const CORTE_DE_MOVIL_PX = 426

/** Lo que miden los archivos de tablet y de móvil. Iguales para los tres proyectos. */
export const MEDIDA_POR_CORTE: Readonly<Record<CorteDeCaptura, { readonly ancho: number; readonly alto: number }>> = {
  movil: { ancho: 780, alto: 1688 },
  tablet: { ancho: 1640, alto: 2360 },
}

/**
 * La consulta de cada `<source>`. El navegador toma la PRIMERA que cumple, así
 * que el orden es móvil, tablet y, si ninguna cumple, la imagen de escritorio.
 * Los 0,02 px son para que un ancho fraccionario entre 425 y 426 no quede sin
 * corte (la misma cuenta que usa el tema con `width <`).
 */
export const CONSULTA_DEL_CORTE: Readonly<Record<CorteDeCaptura, string>> = {
  movil: `(max-width: ${String(CORTE_DE_MOVIL_PX - 0.02)}px)`,
  tablet: `(max-width: ${String(COMPOSICION_MIN_ANCHO_PX - 0.02)}px)`,
}

export const CORTES: readonly CorteDeCaptura[] = ['movil', 'tablet']

/** La ruta de un corte, derivada de la de escritorio. */
export function fuenteDelCorte(fuente: string, corte: CorteDeCaptura): string {
  if (!fuente.endsWith('.webp')) throw new Error(`la captura no es webp: ${fuente}`)
  return fuente.replace(/\.webp$/, `-${corte}.webp`)
}

/** Cuál de las tres fuentes elige un ancho. Pura: la misma regla que aplica el navegador. */
export function corteParaElAncho(ancho: number): CorteDeCaptura | 'escritorio' {
  if (ancho < CORTE_DE_MOVIL_PX) return 'movil'
  if (ancho < COMPOSICION_MIN_ANCHO_PX) return 'tablet'
  return 'escritorio'
}

/**
 * Las proporciones de la caja, como propiedades: la caja de la captura toma la de
 * su corte por CSS (`max-movil:` y `max-escritorio:`), así la caja y el archivo
 * elegido cambian en el mismo ancho sin una rama de JS.
 */
export function estiloDeLaCaja(medida: { readonly ancho: number; readonly alto: number }): CSSProperties {
  const { movil, tablet } = MEDIDA_POR_CORTE
  return {
    '--relacion-escritorio': `${String(medida.ancho)} / ${String(medida.alto)}`,
    '--relacion-tablet': `${String(tablet.ancho)} / ${String(tablet.alto)}`,
    '--relacion-movil': `${String(movil.ancho)} / ${String(movil.alto)}`,
    '--proporcion-tablet': (tablet.ancho / tablet.alto).toFixed(5),
    '--proporcion-movil': (movil.ancho / movil.alto).toFixed(5),
  } as CSSProperties
}
