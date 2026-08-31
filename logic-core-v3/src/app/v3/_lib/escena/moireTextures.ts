import { clamp01 } from './probeScene'

/**
 * LOS GENERADORES DE TRAMA de la envolvente (S10).
 *
 * Viven acá y no en `probeMoire.ts` por el límite de 300 líneas del repo, y el
 * corte tiene costura real: allá están los números y su razonamiento, acá cómo se
 * dibujan. Los dos son **puros**: se llaman desde un `useMemo` y
 * `react-hooks/purity` no perdona un efecto ahí adentro.
 *
 * ── Una celda, no una banda ────────────────────────────────────────────────
 *
 * Cada textura es **una sola celda** que se repite en las dos direcciones. Por
 * eso la línea se dibuja CENTRADA en el borde de la celda (distancia al borde más
 * cercano, con envoltura) y no adentro: así el mosaico cierra sin costura y el
 * grosor de la línea es el mismo en el borde que en el medio.
 *
 * ── La envolvente no está acá ──────────────────────────────────────────────
 *
 * El desvanecido de los bordes de la banda va por **alfa de vértice**, no
 * horneado en esta textura. La razón es dura: la capa gruesa desplaza su
 * `offset.y` en cada frame, y una envolvente horneada en la textura se
 * desplazaría con ella — el borde de la pantalla subiría y bajaría con la deriva.
 *
 * three lee el alfa del canal VERDE (`alphamap_fragment`), así que los tres
 * canales se escriben iguales.
 */

/**
 * El perfil de una línea: 1 adentro, 0 afuera, con un flanco suave de `edge`.
 *
 * El flanco no es un detalle: un escalón duro tiene armónicos hasta el infinito y
 * son ellos los que aliasean. Con el borde suavizado sobre unos téxeles, la línea
 * degrada a gris parejo cuando el mipmap la achica, en vez de titilar.
 */
function stroke(distance: number, half: number, edge: number): number {
  return clamp01((half + edge - distance) / (2 * edge))
}

/**
 * LA CELDA DE LA RETÍCULA — la trama de la capa gruesa, que es la del hero.
 *
 * Dos líneas por celda, una vertical y una horizontal, unidas (no multiplicadas:
 * una retícula es la UNIÓN de las dos familias, no su intersección).
 *
 * `base` es el alfa del hueco entre líneas, como fracción del techo. No es una
 * concesión: es lo que hace que la envolvente sea una superficie con una trama
 * encima y no una reja flotando en el aire, y es la mitad del peso tonal que la
 * escena necesita después de perder los planos.
 */
export function createGridCellData(
  size: number,
  duty: number,
  base: number
): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const edge = 0.75 / size
  const half = duty / 2

  for (let y = 0; y < size; y += 1) {
    const v = (y + 0.5) / size
    const dv = Math.min(v, 1 - v)
    const horizontal = stroke(dv, half, edge)

    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size
      const du = Math.min(u, 1 - u)
      const vertical = stroke(du, half, edge)

      const line = Math.max(vertical, horizontal)
      const alpha = base + (1 - base) * line
      const i = (y * size + x) * 4
      const value = Math.round(clamp01(alpha) * 255)
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
  }

  return data
}

/**
 * LA CELDA DE LA TRAMA FINA — la misma retícula **más un punto en cada cruce**.
 *
 * El punto es el campo de puntos de `DotMatrix` puesto en el paso de la retícula:
 * en el sitio el punto mide 0,05 sobre un paso de 0,6 (8,3%) y acá 8,5%. Va solo
 * en la capa fina: la retícula del hero no tiene puntos, y sumarlos a las dos
 * sería contar el mismo patrón dos veces.
 *
 * De paso, el punto le hace bien al batido: es una marca compacta y más densa que
 * la línea, así que el cruce entre las dos capas gana contraste justo donde el
 * moiré se lee.
 */
export function createDottedGridCellData(
  size: number,
  duty: number,
  dotDiameter: number,
  base: number
): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const edge = 0.75 / size
  const half = duty / 2
  const dotRadius = dotDiameter / 2

  for (let y = 0; y < size; y += 1) {
    const v = (y + 0.5) / size
    const dv = Math.min(v, 1 - v)
    const horizontal = stroke(dv, half, edge)

    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size
      const du = Math.min(u, 1 - u)
      const vertical = stroke(du, half, edge)

      // El punto vive en el cruce, o sea en la esquina de la celda: la distancia
      // que importa es la que ya se calculó para las dos líneas.
      const dot = stroke(Math.hypot(du, dv), dotRadius, edge)

      const mark = Math.max(Math.max(vertical, horizontal), dot)
      const alpha = base + (1 - base) * mark
      const i = (y * size + x) * 4
      const value = Math.round(clamp01(alpha) * 255)
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
  }

  return data
}

/**
 * LA ENVOLVENTE VERTICAL, como alfa de vértice.
 *
 * Sube de 0 a 1 en la rampa de abajo y vuelve a 0 en la de arriba, con
 * suavizado para que no tenga codo. `v` es la coordenada vertical normalizada de
 * la banda, 0 abajo y 1 arriba.
 */
export function bandEnvelope(v: number, fade: number): number {
  const ramp = Math.min(clamp01(v / fade), clamp01((1 - v) / fade))
  return ramp * ramp * (3 - 2 * ramp)
}
