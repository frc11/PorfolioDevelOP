/**
 * [B1] LOS DEEP LINKS DEL PORTFOLIO — un ancla por proyecto y una para «la tuya», en el paso de cada uno (plan §5.8; B2 los
 * usa). Cada ancla es un elemento posicionado adentro de la sección una pantalla antes del centro de su paso: el salto nativo la
 * pone arriba del cuadro, o sea con la regla en el centro del paso. Sin JS, el salto cae en ese paso; con JS, `usePortfolio` lo
 * corrige al píxel y los viajes del menú van por `destinosDelViaje.ts`.
 */

import { PROYECTOS } from '../proyectos'


export interface AnclaDelPortfolio {
  readonly id: string
  readonly paso: number
}

export const ANCLA_DE_LA_TUYA = 'portfolio-la-tuya'

export const ANCLAS_DEL_PORTFOLIO: readonly AnclaDelPortfolio[] = [
  ...PROYECTOS.map((p, i) => ({ id: `portfolio-${p.slug}`, paso: i })),
  { id: ANCLA_DE_LA_TUYA, paso: PROYECTOS.length },
]
