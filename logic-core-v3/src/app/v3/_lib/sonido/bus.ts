import type { Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · EL BUS DEL SONIDO — lo único que importan las piezas que suenan (la barra, el menú, las demos, las
 * fotos, la escena): `sonar` y `callar`, sin howler ni el sprite. Sin motor instalado (el sonido apagado, que es el
 * producto) no hacen nada: una comparación y vuelven. El motor (`motor.ts`, con howler) se carga recién cuando alguien
 * prende el sonido (`_chrome/sonido/`) y se instala acá.
 *
 * La escena llama desde su cuadro sólo en un cambio (un principal que nace, el guion del haz que arranca): nunca por
 * cuadro, y sin reservar nada.
 */
export interface Oido {
  readonly sonar: (s: Sonido) => void
  readonly callar: (s: Sonido) => void
}

let instalado: Oido | null = null

export function instalarElSonido(oido: Oido | null): void {
  instalado = oido
}

export function sonar(s: Sonido): void {
  if (instalado !== null) instalado.sonar(s)
}

export function callar(s: Sonido): void {
  if (instalado !== null) instalado.callar(s)
}
