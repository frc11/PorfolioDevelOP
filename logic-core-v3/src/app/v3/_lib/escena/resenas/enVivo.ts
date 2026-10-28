/**
 * [NOCTURNO B2] LAS RESEÑAS EN VIVO — lo que el DOM del aro (`_secciones/por-que-develop/resenas/`) y la escena del aro
 * (`EscenaDeLasResenas.tsx`) se dicen en cada cuadro. Sin three ni React (como `ctaDelFinal/enVivo.ts`): lo importan los dos lados.
 *
 *   · el DOM escribe si el escenario está montado, la entrada (función del scroll o del gatillo), la bajada de B3, la placa señalada (hover o
 *     foco) y el arrastre; anota sus tarjetas (el texto de cada placa) y la capa que las contiene;
 *   · la escena escribe el giro, la reseña que muestra cada placa (cambia en la nuca del aro) y, en cada tarjeta, la transformada que la deja
 *     en el frente de su placa y cuánto se lee.
 */

import { ARO } from './aro'

export const RESENAS_EN_VIVO = {
  /** El escenario de las reseñas está montado (desde 1024 y con movimiento): la escena dibuja el aro. */
  activo: false,
  /** La entrada del aro (0, las cadenas afuera; 1, armado). */
  entrada: 0,
  /** [B3] La bajada por el hueco del piso (0 a 1): las placas se hunden; con 1 no se dibujan. */
  bajada: 0,
  /** [B3] Cuánto está abierto el anillo del piso bajo el aro (0 a 1). */
  hueco: 0,
  /** La placa señalada (hover del mouse o foco del teclado), o −1. */
  senalada: -1,
  /** El arrastre del puntero (por defecto desde C2-70) (cuánto se corrió desde el último cuadro, px del cuadro). */
  arrastre: { activo: false, dx: 0 },
  /** Con movimiento reducido el aro no gira (la rama del DOM no lo monta, pero por las dudas). */
  quieto: false,
  /** Lo que escribe la escena (el banco lo lee): el giro (rad, sin acotar) y su velocidad (rad/s). */
  giro: 0,
  velocidad: 0,
}

/** Las tarjetas del DOM, una por placa física (las anota el escenario), y la capa que las contiene (la escena le escribe el tamaño). */
export const TARJETAS_DEL_ARO: (HTMLElement | null)[] = Array.from({ length: ARO.placas }, () => null)
export const CAPA_DEL_ARO: { el: HTMLElement | null } = { el: null }

/** La reseña que muestra cada placa: la escena la cambia en la nuca del aro; el DOM se entera por la versión (pocas veces: una cada ~7 s). */
const RESENAS: number[] = Array.from({ length: ARO.placas }, (_, i) => i)
let version = 0
const oyentes = new Set<() => void>()

export const resenaDeCadaPlaca = (): readonly number[] => RESENAS
export const versionDeLasResenas = (): number => version

/** La escena: la placa `i` muestra la reseña `r` (sólo avisa si cambió). */
export function ponerLaResena(i: number, r: number): void {
  if (RESENAS[i] === r) return
  RESENAS[i] = r
  version += 1
  for (const f of oyentes) f()
}

export function suscribirALasResenas(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
