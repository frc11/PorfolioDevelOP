import { SOMBRA_DEL_PIE, alfaDeLaSombra, blandaDeLaSombra } from '../pie3d/sombras'
import { FLOOR_Y } from '../probeScene'
import type { BaseDelPie, PiezaDePie, PoseDeLaPieza } from './caidaDelPie'

/**
 * [PULIDO 19] Q4 · LA SOMBRA DE CONTACTO DE UNA PIEZA QUE CAE (puro): lo que la pieza tapa del piso, visto desde arriba, con la
 * oclusión de contacto que el piso vivo ya sabía pintar (`pie3d/sombras.ts`, de P2; apagada en NOCTURNO FINAL A4 para la pared
 * que flota). De pie en la pared, nada: la sombra entra con la bajada. Bajando, un filo bajo el canto (el espesor), más oscuro y
 * nítido cuanto más cerca del piso. Volcando, la huella crece desde el canto hacia atrás (el alto por el seno del ángulo, más el
 * canto por el coseno) hasta la placa entera, y la sombra se aclara y se ablanda con la ALTURA MEDIA de la placa sobre su huella
 * (una placa levantada tapa poco); al apoyarse se condensa: acostada, el ribete blando alrededor de la placa, al ras, lo que la
 * asienta. La huella sale en la base del pie (`derecha`, `atras`), como los lugares. Sin reservas por cuadro: el mismo registro.
 * [PULIDO 20] R1 · y se va al incrustarse (la cara al ras no tapa nada).
 */
export const SOMBRA_DE_LA_PIEZA = {
  /** El medio de la huella en el mundo. */
  x: 0,
  z: 0,
  /** Sus medias extensiones (u) a lo largo de `derecha` y de `atras`, con lo que la mancha sobra (`SOMBRA_DEL_PIE.sobra`). */
  medioAncho: 0,
  medioFondo: 0,
  /** La blandura del borde (u) y el alfa (0: ninguna). */
  blanda: 0,
  alfa: 0,
}

/** La sombra de la pieza `p` (sus medidas) en la pose `pose` (`poseDeLaPiezaQueCae`: su canto en el mundo), en la base `b` del pie. */
export function sombraDeLaPiezaQueCae(p: Pick<PiezaDePie, 'ancho' | 'alto' | 'espesor'>, pose: PoseDeLaPieza, b: BaseDelPie): typeof SOMBRA_DE_LA_PIEZA {
  const S = SOMBRA_DE_LA_PIEZA
  if (pose.bajada <= 0) {
    S.x = pose.x
    S.z = pose.z
    S.medioAncho = 0
    S.medioFondo = 0
    S.blanda = 0
    S.alfa = 0
    return S
  }
  // La huella desde el canto hacia atrás: la placa volcada y su canto.
  const seno = Math.sin(pose.a)
  const coseno = Math.cos(pose.a)
  const fondo = p.alto * seno + p.espesor * coseno
  S.x = pose.x + (b.atrasX * fondo) / 2
  S.z = pose.z + (b.atrasZ * fondo) / 2
  S.medioAncho = p.ancho / 2 + SOMBRA_DEL_PIE.sobra
  S.medioFondo = fondo / 2 + SOMBRA_DEL_PIE.sobra
  // La altura media de la placa sobre su huella (0 de pie, 0 acostada, lo más alta a mitad del vuelco), sobre la del canto.
  const h = pose.y - FLOOR_Y + (p.alto * p.alto * seno * coseno) / (2 * fondo)
  S.blanda = blandaDeLaSombra(h)
  S.alfa = alfaDeLaSombra(h) * pose.bajada * (1 - pose.hundido)
  return S
}
