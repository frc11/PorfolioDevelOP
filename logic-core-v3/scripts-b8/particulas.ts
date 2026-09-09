/**
 * LAS PARTÍCULAS EN UNA CAPTURA — cuántas, de qué tamaño, cuánto brillan.
 *
 * Es aritmética pura sobre una imagen RGBA ya decodificada, y corre igual sobre
 * una captura de la referencia (su canvas solo) que sobre una nuestra (la escena
 * sola): es lo que hace comparables los dos números. No toca el DOM de nadie.
 *
 * ── Qué es una partícula acá ──────────────────────────────────────────────
 *
 * Sobre fondo oscuro: un grupo conexo (4 vecinos) de píxeles cuyo gris supera
 * el umbral. El umbral no es absoluto: es **el fondo más un salto**, donde el
 * fondo es la mediana de gris de la imagen —un cielo con gradiente tiene una
 * mediana, no un valor— y el salto es `SALTO_SOBRE_EL_FONDO`. Un grupo más
 * grande que `AREA_MAXIMA` no es una partícula: es un panel, un logo o una
 * nube, y se descarta contando cuántos hubo.
 *
 * Se publican el conteo, la densidad por 100 000 px², la distribución de áreas
 * (mediana y p90, en px y en diámetro equivalente), el brillo pico mediano y
 * la fracción de píxeles que ocupan.
 */

import type { Imagen } from '../scripts-b5/silueta'

export const SALTO_SOBRE_EL_FONDO = 40
export const AREA_MAXIMA = 400

export interface Particula {
  readonly area: number
  readonly pico: number
  readonly x: number
  readonly y: number
}

export interface CensoDeParticulas {
  readonly fondoGris: number
  readonly umbral: number
  readonly cantidad: number
  readonly porCienMilPx: number
  readonly fraccionDelArea: number
  readonly areaMediana: number
  readonly areaP90: number
  readonly diametroMediano: number
  readonly diametroP90: number
  readonly picoMediano: number
  readonly picoP90: number
  readonly descartadosGrandes: number
  readonly porTamano: { readonly hasta3: number; readonly hasta10: number; readonly hasta30: number; readonly mas: number }
}

function gris(img: Imagen, i: number): number {
  const k = i * 4
  return 0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2]
}

function percentil(ordenado: readonly number[], q: number): number {
  if (ordenado.length === 0) return Number.NaN
  return ordenado[Math.min(ordenado.length - 1, Math.floor(q * ordenado.length))]
}

export function censarParticulas(img: Imagen): CensoDeParticulas {
  const total = img.ancho * img.alto
  const grises = new Float32Array(total)
  for (let i = 0; i < total; i += 1) grises[i] = gris(img, i)
  const ordenados = Array.from(grises).sort((a, b) => a - b)
  const fondo = percentil(ordenados, 0.5)
  const umbral = fondo + SALTO_SOBRE_EL_FONDO
  const visitado = new Uint8Array(total)
  const particulas: Particula[] = []
  let descartadosGrandes = 0
  const pila: number[] = []
  for (let inicio = 0; inicio < total; inicio += 1) {
    if (visitado[inicio] === 1 || grises[inicio] < umbral) continue
    let area = 0
    let pico = 0
    let sx = 0
    let sy = 0
    pila.push(inicio)
    visitado[inicio] = 1
    while (pila.length > 0) {
      const i = pila.pop() as number
      area += 1
      const g = grises[i]
      if (g > pico) pico = g
      const x = i % img.ancho
      const y = (i - x) / img.ancho
      sx += x
      sy += y
      const vecinos = [x > 0 ? i - 1 : -1, x < img.ancho - 1 ? i + 1 : -1, y > 0 ? i - img.ancho : -1, y < img.alto - 1 ? i + img.ancho : -1]
      for (const v of vecinos) {
        if (v < 0 || visitado[v] === 1 || grises[v] < umbral) continue
        visitado[v] = 1
        pila.push(v)
      }
    }
    if (area > AREA_MAXIMA) descartadosGrandes += 1
    else particulas.push({ area, pico, x: sx / area, y: sy / area })
  }
  const areas = particulas.map((p) => p.area).sort((a, b) => a - b)
  const picos = particulas.map((p) => p.pico).sort((a, b) => a - b)
  const diametro = (a: number): number => 2 * Math.sqrt(a / Math.PI)
  const ocupado = particulas.reduce((n, p) => n + p.area, 0)
  return {
    fondoGris: Math.round(fondo * 10) / 10,
    umbral: Math.round(umbral * 10) / 10,
    cantidad: particulas.length,
    porCienMilPx: Math.round((particulas.length / total) * 100000 * 100) / 100,
    fraccionDelArea: Math.round((ocupado / total) * 100000) / 100000,
    areaMediana: percentil(areas, 0.5),
    areaP90: percentil(areas, 0.9),
    diametroMediano: Math.round(diametro(percentil(areas, 0.5)) * 100) / 100,
    diametroP90: Math.round(diametro(percentil(areas, 0.9)) * 100) / 100,
    picoMediano: Math.round(percentil(picos, 0.5) * 10) / 10,
    picoP90: Math.round(percentil(picos, 0.9) * 10) / 10,
    descartadosGrandes,
    porTamano: {
      hasta3: areas.filter((a) => a <= 3).length,
      hasta10: areas.filter((a) => a > 3 && a <= 10).length,
      hasta30: areas.filter((a) => a > 10 && a <= 30).length,
      mas: areas.filter((a) => a > 30).length,
    },
  }
}

/** Qué fracción de píxeles cambió de gris más de `salto` entre dos capturas del mismo tamaño. */
export function fraccionQueCambio(a: Imagen, b: Imagen, salto = 12): number {
  if (a.ancho !== b.ancho || a.alto !== b.alto) throw new Error('las dos capturas no tienen el mismo tamaño')
  const total = a.ancho * a.alto
  let cambiaron = 0
  for (let i = 0; i < total; i += 1) if (Math.abs(gris(a, i) - gris(b, i)) > salto) cambiaron += 1
  return cambiaron / total
}

/** La luminancia media (relativa, 0–1) y el gris medio de una captura entera. */
export function mediaDeLaCaptura(img: Imagen): { readonly gris: number; readonly luminancia: number } {
  const total = img.ancho * img.alto
  let sg = 0
  let sl = 0
  const lineal = (c: number): number => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    sg += 0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2]
    sl += 0.2126 * lineal(img.datos[k]) + 0.7152 * lineal(img.datos[k + 1]) + 0.0722 * lineal(img.datos[k + 2])
  }
  return { gris: Math.round((sg / total) * 10) / 10, luminancia: Math.round((sl / total) * 10000) / 10000 }
}
