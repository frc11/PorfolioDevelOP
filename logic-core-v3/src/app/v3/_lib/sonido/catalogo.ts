import type { Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · LOS SONIDOS, UNO POR UNO — qué es cada uno, cuánto suena y cada cuánto puede repetirse. Los archivos
 * los genera `scripts-retoque/sonidos.ts` (`sprite.ts`); las fuentes y la licencia, `docs/rediseno/SONIDO.md`.
 *
 * [RETOQUE 3D] Al producto, con el parlante apagado por defecto. Los volúmenes son los finales de Valentino (el tic de la
 * barra 0,1; el roce de las fotos 0,1; abrir y cerrar 0,1; el pulso 1; el encendido 0,2). Se fueron el túnel, el amanecer
 * y los dos ambientes de día y de noche.
 *
 * [CIERRE RETOQUE 3D] S1 · el clic de la barra y el de los CTA son el mismo: el pestillo (el candidato d); los demás
 * candidatos de clic se borraron. S2 · el ambiente ya no es un bucle en un archivo: es generativo, en tiempo real
 * (`ambienteGenerativo.ts`). [RONDA 2] F6 · queda Bruma, de fábrica, al 0,5 (Vidrio y Gotas se borraron).
 *
 *   · `separacionMs`: lo mínimo entre dos del mismo (un hover que barre la barra no ametralla).
 *   · `exclusivo`: mientras suena no se vuelve a largar (el encendido).
 */
export interface DelSonido {
  readonly que: string
  readonly volumen: number
  readonly separacionMs: number
  readonly exclusivo: boolean
}

export const SONIDOS: Readonly<Record<Sonido, DelSonido>> = {
  tic: { que: 'El hover de la barra y de los CTA: un tic muy suave', volumen: 0.1, separacionMs: 45, exclusivo: false },
  clic: { que: 'Los demás enlaces y botones: un clic', volumen: 0.22, separacionMs: 60, exclusivo: false },
  pestillo: { que: 'El clic de la barra y de los CTA: un pestillo (dos golpes)', volumen: 0.15, separacionMs: 60, exclusivo: false },
  abre: { que: 'Abrir el menú o una demo (el Genie)', volumen: 0.1, separacionMs: 120, exclusivo: false },
  cierra: { que: 'Cerrar el menú o una demo (el Genie)', volumen: 0.1, separacionMs: 120, exclusivo: false },
  pulso: { que: 'El pulso del logo: un golpe grave casi imperceptible', volumen: 1, separacionMs: 900, exclusivo: false },
  encendido: { que: 'El haz que se enciende: el zumbido sigue a los intentos que fallan y al golpe', volumen: 0.2, separacionMs: 0, exclusivo: true },
  foto: { que: 'El hover de las fotos del equipo: un roce mínimo', volumen: 0.1, separacionMs: 120, exclusivo: false },
  // [PULIDO 4] C2 · el golpe del encastre (el logo conecta y nace la súper onda): por encima del pulso, sin saturar. `?golpe=b`, con la sala.
  'golpe-a': { que: 'El golpe del encastre: el pulso más grave con un sub-golpe debajo', volumen: 1, separacionMs: 1500, exclusivo: false },
  'golpe-b': { que: 'El golpe del encastre, con una cola corta de la sala', volumen: 1, separacionMs: 1500, exclusivo: false },
}

/** Lo que pide el sitio: un sonido del sprite. */
export type Pedido = Sonido

/** El ambiente generativo: qué es (lo arma `ambienteGenerativo.ts`, sin archivo). */
export const AMBIENTE = 'Bruma — colchones lentos de dos o tres notas que entran y se van muy despacio, con silencios largos'

/** El volumen del ambiente ([RONDA 2] F6: 0,5) y el general (todo pasa por acá: el sitio suena bajo). */
export const VOLUMEN_DEL_AMBIENTE = 0.5
export const VOLUMEN_GENERAL = 0.7
