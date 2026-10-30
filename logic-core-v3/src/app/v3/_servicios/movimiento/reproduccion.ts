/**
 * [SERVICIOS M3] CUÁNDO ANDA EL VIDEO DE TRABAJOS — puro (sin react ni next), para que los tests lo prueben en Node.
 *
 * Anda solo si TODO se cumple: sin movimiento reducido, con la fuente ya pedida, en pantalla, sin la pausa de quien mira y con el
 * scroll quieto (ESCENA 10 T2 del home: cada cuadro nuevo durante el scroll le cuesta cuadros a la página). Nunca hay `autoplay`:
 * lo arranca `play()` cuando esto da verdadero, y con movimiento reducido no da verdadero nunca.
 */

export interface MomentoDelVideo {
  readonly reducido: boolean
  readonly conFuente: boolean
  readonly enPantalla: boolean
  readonly pausadoPorQuienMira: boolean
  readonly scrollEnMovimiento: boolean
}

export function debeReproducirse(m: MomentoDelVideo): boolean {
  return !m.reducido && m.conFuente && m.enPantalla && !m.pausadoPorQuienMira && !m.scrollEnMovimiento
}

/** [V1] Lo que pausa el botón, para su nombre (`BotonPausa` lo arma: «Pausar el video de trabajos»). C2: provisorio. */
export const DE_LA_PAUSA = 'el video de trabajos'
