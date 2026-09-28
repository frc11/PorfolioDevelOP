/**
 * SPRINT ESCENA 8 — las hojas. hojas8.ts <limite|amanecer|cielo>
 *
 * Grillas con rótulo (la `grilla` de ESCENA 6) con las capturas que dejan los bancos de este sprint en
 * `escena8/<carpeta>/`.
 */
import { readdirSync } from 'node:fs'

import { DIR8 } from './banco8'
import { MOMENTOS, grilla, type Celda } from './hojas6'

const QUE = process.argv[2] ?? ''

/** T2 · antes (`limite=no`) y después, en el hero y en el pie; el pie de la trama al doble. */
function limite(): void {
  const d = `${DIR8}/limite-moire/cuadros`
  const c = (m: string, cual: string): string => `${d}/${m}-1440-${cual}.png`
  grilla(['hero', 'pie'].map((m) => [{ archivo: c(m, 'antes'), texto: `${m} - antes (flotando)` }, { archivo: c(m, 'despues'), texto: `${m} - despues (anclada)` }]), 960, `${DIR8}/limite-moire/hoja-hero-y-pie.png`)
  // El pie de la trama: en el hero, arriba a la izquierda; en el pie, a media altura a la derecha.
  const zonas: Record<string, readonly [number, number, number, number]> = { hero: [0, 150, 720, 220], pie: [720, 360, 720, 220] }
  const filas: Celda[][] = ['hero', 'pie'].flatMap((m) => [[{ archivo: c(m, 'antes'), texto: `${m} x2 - antes`, recorte: zonas[m] }], [{ archivo: c(m, 'despues'), texto: `${m} x2 - despues`, recorte: zonas[m] }]])
  grilla(filas, 1440, `${DIR8}/limite-moire/hoja-pie-de-la-trama-x2.png`)
}

/** T3 · los momentos congelados en orden, y el tirón a la frase reproducido congelado. */
function amanecer(): void {
  const d = `${DIR8}/amanecer/cuadros`
  const archivos = readdirSync(d).filter((a) => a.endsWith('.png')).sort((a, b) => Number(a.split('-')[0].replace('_', '.')) - Number(b.split('-')[0].replace('_', '.')))
  const celdas = archivos.map((a) => ({ archivo: `${d}/${a}`, texto: `${a.split('-')[0].replace('_', '.')} s -${a.replace(/^[\d_]+-/, '').replace('.png', '').replace(/-/g, ' ')}` }))
  const filas: Celda[][] = []
  for (let i = 0; i < celdas.length; i += 3) filas.push(celdas.slice(i, i + 3))
  grilla(filas, 640, `${DIR8}/amanecer/hoja-momentos.png`)
  for (const destino of ['frase', 'valores', 'cta']) {
    const t = `${DIR8}/amanecer/contraste/${destino}`
    const instantes = readdirSync(t).filter((a) => a.endsWith('.png')).sort()
    // Seis instantes repartidos: el primero, cuatro del medio y el último.
    const elegidos = [0, 0.3, 0.5, 0.65, 0.8, 1].map((u) => instantes[Math.round(u * (instantes.length - 1))])
    const celdasT = [...new Set(elegidos)].map((a) => ({ archivo: `${t}/${a}`, texto: `tiron a ${destino} - ${a.replace('t', '').replace('.png', '').replace('_', ',')} s` }))
    const filasT: Celda[][] = []
    for (let i = 0; i < celdasT.length; i += 3) filasT.push(celdasT.slice(i, i + 3))
    grilla(filasT, 640, `${DIR8}/amanecer/hoja-tiron-a-${destino}.png`)
  }
}

const VARIANTES = ['pintado', 'bloques', 'particulas'] as const

/** T4 · por variante: los cinco momentos sin cielo (el producto) y con cada tono; el paso del amanecer. */
function cielo(): void {
  const d = `${DIR8}/cielo-dia/cuadros`
  for (const v of VARIANTES) {
    const filas: Celda[][] = [
      MOMENTOS.map((m) => ({ archivo: `${d}/${m}-1440-sin-cielo.png`, texto: `${m} - sin cielo (el producto)` })),
      MOMENTOS.map((m) => ({ archivo: `${d}/${m}-1440-${v}-celeste.png`, texto: `${m} - ${v} celeste` })),
      MOMENTOS.map((m) => ({ archivo: `${d}/${m}-1440-${v}-mono.png`, texto: `${m} - ${v} mono` })),
    ]
    grilla(filas, 480, `${DIR8}/cielo-dia/hoja-${v}.png`)
    // Donde más cielo se ve: Por qué develOP, grande.
    grilla([[{ archivo: `${d}/por-que-develop-1440-${v}-celeste.png`, texto: `por que develOP - ${v} celeste` }, { archivo: `${d}/por-que-develop-1440-${v}-mono.png`, texto: `por que develOP - ${v} mono` }]], 960, `${DIR8}/cielo-dia/hoja-${v}-por-que-develop.png`)
  }
  const a = `${DIR8}/cielo-dia/amanecer`
  const pasos = ['0_6-noche', '3_2-frente-en-la-formacion', '5_8-el-piso-vivo', '7_6-dia']
  const filas: Celda[][] = VARIANTES.flatMap((v) => ['celeste', 'mono'].map((t) => pasos.map((p) => ({ archivo: `${a}/${v}-${t}-${p}.png`, texto: `${v} ${t} - ${p.replace(/^[\d_]+-/, '').replace(/-/g, ' ')}` }))))
  grilla(filas, 400, `${DIR8}/cielo-dia/hoja-amanecer.png`)
}

if (process.argv[1]?.endsWith('hojas8.ts')) {
  if (QUE === 'limite') limite()
  else if (QUE === 'amanecer') amanecer()
  else if (QUE === 'cielo') cielo()
  else throw new Error(`no sé qué es «${QUE}»`)
}
