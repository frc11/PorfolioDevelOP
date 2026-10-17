/**
 * [B1] LAS BANDERAS DEL PORTFOLIO — leídas de la URL después de montar (como las de la escena), una vez por carga.
 *
 *   ?portfolio-lado=der (default) | izq     de qué lado entra el panel (el texto y el logo, del otro)
 *   ?portfolio-panel=tinta (default) | vidrio   el material del panel: el negro de la marca sólido, o el vidrio del sistema
 *   ?portfolio-dim=0…0,8                    cuánto se oscurece la escena con el panel adentro (default `DIM_POR_DEFECTO`)
 *   ?portfolio-paso=1 | 0.75 (default) | 0.6    las pantallas por paso (`pasos.ts`), para calibrar
 *   ?portfolio-camara=a | b | c             la pose del logo, para calibrar (default `a`)
 */

import { pasoDeLaBandera, type PantallasPorPaso } from './pasos'

export type LadoDelPanel = 'der' | 'izq'
export type MaterialDelPanel = 'tinta' | 'vidrio'
export type PoseDeLaCamara = 'a' | 'b' | 'c'

export interface BanderasDelPortfolio {
  readonly lado: LadoDelPanel
  readonly material: MaterialDelPanel
  readonly dim: number
  readonly paso: PantallasPorPaso
  readonly camara: PoseDeLaCamara
}

/** Cuánto se oscurece la escena con el panel adentro, sin bandera. A calibrar con hasta tres valores (§5.7, §11.3). */
export const DIM_POR_DEFECTO = 0.35
export const DIM_MAXIMO = 0.8

export const BANDERAS_POR_DEFECTO: BanderasDelPortfolio = {
  lado: 'der',
  material: 'tinta',
  dim: DIM_POR_DEFECTO,
  paso: pasoDeLaBandera(null),
  camara: 'a',
}

/** Las banderas de una consulta (`location.search`). Lo que no se reconoce cae al default. */
export function banderasDe(consulta: string): BanderasDelPortfolio {
  const q = new URLSearchParams(consulta)
  const dim = Number.parseFloat(q.get('portfolio-dim') ?? '')
  const camara = q.get('portfolio-camara')
  return {
    lado: q.get('portfolio-lado') === 'izq' ? 'izq' : 'der',
    material: q.get('portfolio-panel') === 'vidrio' ? 'vidrio' : 'tinta',
    dim: Number.isFinite(dim) ? Math.min(DIM_MAXIMO, Math.max(0, dim)) : DIM_POR_DEFECTO,
    paso: pasoDeLaBandera(q.get('portfolio-paso')),
    camara: camara === 'b' || camara === 'c' ? camara : 'a',
  }
}
