/**
 * LA FORMA DEL LOGO, EN TRES PIEZAS SIMPLES — pura: dos TOROS (los dos cuencos de la «cp», acostados en el plano del
 * logo) y una CÁPSULA (el palo), en coordenadas del SVG (caja de 1024), sacadas del trazo del archivo: el cuenco de la
 * «c» es el arco de radio 257 que pasa por (38, 371) y (248, 207); el de la «p», el de radio 256 con el agujero de
 * 153; el palo baja de y 640 a 860 entre x 532 y 665. El tubo de cada toro es un poco más grueso que el trazo (53)
 * para cubrir también el espesor de la extrusión.
 *
 * Nació en ESCENA 5 como el obstáculo del polvo (5a: el logo no se atravesaba). **[ESCENA 9] T1:** el polvo en vuelo
 * ya no se entera del logo y el obstáculo se borró (la holgura, su cuenta en GLSL y su bandera); la forma queda porque
 * la leen el piso vivo (que ningún bloque toque al logo) y la fugaz (la caja del logo en el cuadro).
 */

export const FORMA_DEL_LOGO_SVG = {
  c: { x: 278, y: 462, radio: 203, tubo: 60 },
  p: { x: 745, y: 457, radio: 205, tubo: 60 },
  palo: { x: 598, desde: 640, hasta: 862, radio: 70 },
} as const

/** Las piezas en el espacio del grupo del logo: el centro de la caja de su trazo va al origen. */
export interface FormaDelLogo {
  readonly c: readonly [number, number, number, number]
  readonly p: readonly [number, number, number, number]
  readonly palo: readonly [number, number, number, number]
}

export function formaDelLogo(centroSvg: { readonly x: number; readonly y: number }, escala: number): FormaDelLogo {
  const f = FORMA_DEL_LOGO_SVG
  const x = (sx: number): number => (sx - centroSvg.x) * escala
  const y = (sy: number): number => -(sy - centroSvg.y) * escala
  return {
    c: [x(f.c.x), y(f.c.y), f.c.radio * escala, f.c.tubo * escala],
    p: [x(f.p.x), y(f.p.y), f.p.radio * escala, f.p.tubo * escala],
    palo: [x(f.palo.x), y(f.palo.desde), y(f.palo.hasta), f.palo.radio * escala],
  }
}
