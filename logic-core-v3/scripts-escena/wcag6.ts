/**
 * SPRINT ESCENA 6 · 1 — el contraste WCAG del texto sobre la escena, con el anillo del pulso detrás.
 * wcag6.ts [ancho]
 *
 * Lee las tomas de `fondos6.ts` (antes y después, cinco fases y la toma sin anillo) y las cajas con su
 * color de CSS. Por cada elemento: la luminancia del texto sale de su color; la del fondo, de la
 * mediana de los píxeles de su caja que NO son glifo (los que se alejan del color del texto). La razón
 * es la de WCAG. AA pide 4,5 (3 para texto grande: 24 px, o 18,66 px en negrita).
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { decodificarPng } from '../scripts-b4/png'
import { DIR6 } from './banco-escena'
import { FASES } from './fondos6'

const ANCHO = Number(process.argv[2] ?? 1440)
const MOMENTOS = ['hero', 'quienes-somos', 'trabajos-de-noche', 'por-que-develop', 'pie']

interface CajaConColor {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly texto: string
  readonly color: string
  readonly px: number
  readonly peso: number
}

const lineal = (c: number): number => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const luminancia = (r: number, g: number, b: number): number => 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
const razon = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

function rgb(color: string): [number, number, number] {
  const m = color.match(/[\d.]+/g) ?? ['0', '0', '0']
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}

export function wcag(png: Buffer, cajas: readonly CajaConColor[]): { texto: string; razon: number; aa: number }[] {
  const img = decodificarPng(png)
  return cajas.map((c) => {
    const [tr, tg, tb] = rgb(c.color)
    const lt = luminancia(tr, tg, tb)
    const fondo: number[] = []
    for (let y = Math.max(0, c.y); y < Math.min(img.alto, c.y + c.alto); y += 1) {
      for (let x = Math.max(0, c.x); x < Math.min(img.ancho, c.x + c.ancho); x += 1) {
        const i = (y * img.ancho + x) * 4
        const [r, g, b] = [img.datos[i], img.datos[i + 1], img.datos[i + 2]]
        // Un píxel de glifo (o de su borde) se parece al color del texto: queda afuera del fondo.
        if (Math.abs(r - tr) + Math.abs(g - tg) + Math.abs(b - tb) < 150) continue
        fondo.push(luminancia(r, g, b))
      }
    }
    fondo.sort((a, b) => a - b)
    const lb = fondo.length === 0 ? lt : fondo[Math.floor(fondo.length / 2)]
    const grande = c.px >= 24 || (c.px >= 18.66 && c.peso >= 700)
    return { texto: c.texto, razon: Math.round(razon(lt, lb) * 100) / 100, aa: grande ? 3 : 4.5 }
  })
}

function principal(): void {
  const salida: Record<string, unknown> = {}
  const cajasDe = JSON.parse(readFileSync(`${DIR6}/fondos-texto/contraste-${String(ANCHO)}-despues.json`, 'utf8')) as Record<string, { cajas: CajaConColor[] }>
  for (const momento of MOMENTOS) {
    const cajas = cajasDe[momento].cajas
    const base = (cual: string, fase: string): Buffer => readFileSync(`${DIR6}/fondos-texto/cuadros/${momento}-${String(ANCHO)}-${cual}-${fase}.png`)
    const sin = wcag(base('despues', 'sin-anillo'), cajas)
    const peorPorFase = (cual: string): { fase: number; minimo: number; peor: string; bajoAA: string[] }[] =>
      FASES.map((fase) => {
        const r = wcag(base(cual, fase.toFixed(1)), cajas)
        const k = r.reduce((j, e, i) => (e.razon < r[j].razon ? i : j), 0)
        return { fase, minimo: r[k].razon, peor: r[k].texto, bajoAA: r.filter((e) => e.razon < e.aa).map((e) => `${e.texto} ${String(e.razon)}`) }
      })
    const kSin = sin.reduce((j, e, i) => (e.razon < sin[j].razon ? i : j), 0)
    // La peor caída de un mismo elemento, contra la toma sin anillo.
    const caidas = FASES.map((fase) => {
      const r = wcag(base('despues', fase.toFixed(1)), cajas)
      return r.map((e, i) => ({ texto: e.texto, caida: (1 - e.razon / sin[i].razon) * 100, razon: e.razon }))
    }).flat()
    const peor = caidas.reduce((a, b) => (b.caida > a.caida ? b : a))
    salida[momento] = {
      elementos: cajas.length,
      sinAnillo: { minimo: sin[kSin].razon, peor: sin[kSin].texto, bajoAA: sin.filter((e) => e.razon < e.aa).map((e) => `${e.texto} ${String(e.razon)}`) },
      antes: peorPorFase('antes'),
      despues: peorPorFase('despues'),
      peorCaidaDespues: { texto: peor.texto, caida: Math.round(peor.caida * 10) / 10, razon: peor.razon },
    }
    console.log(momento, JSON.stringify(salida[momento]))
  }
  writeFileSync(`${DIR6}/fondos-texto/wcag-${String(ANCHO)}.json`, JSON.stringify(salida, null, 1))
}

if (/[\\/]wcag6\.ts$/.test(process.argv[1] ?? '')) principal()
