/**
 * SPRINT ESCENA 9 — T3 · las pruebas de material y luz en el MISMO cuadro: t3-mismo-cuadro.ts <prueba> [ancho alto]
 *
 * Con la prueba prendida, en los cinco momentos (asentados, como las hojas de siempre), la escena dibujada una vez por
 * variante en una sola tarea (`mismo-cuadro.ts`): el producto de hoy y cada variante, con el MISMO polvo, la misma
 * cámara y la misma pose. Guarda los cuadros y arma la hoja (los cuadros enteros) y los recortes al doble del logo.
 * Va a `escena9/t3-material-y-luz/<prueba>/`.
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { grilla, type Celda } from '../scripts-escena/hojas6'
import { abrir, carpeta } from './banco'
import { guardarMismoCuadro, type MismoCuadro } from './mismo-cuadro'

interface Prueba {
  readonly pedido: string
  readonly variantes: readonly string[]
  readonly rotulos: Readonly<Record<string, string>>
  readonly preparar: string
  /** Cómo se dibuja un cuadro (por defecto la escena al lienzo). */
  readonly dibujar?: string
  /** Lo que se hace en la página después de asentar cada momento (y 600 ms de espera). */
  readonly antes?: string
  /** Los momentos donde se compara (por nombre; todos si falta). */
  readonly momentos?: readonly string[]
}

export const PRUEBAS: Readonly<Record<string, Prueba>> = {
  material: {
    pedido: 'producto,material=satinado',
    variantes: ['no', 'satinado', 'brillante'],
    rotulos: { no: 'hoy (producto)', satinado: 'negro satinado', brillante: 'negro brillante' },
    preparar: '(k) => window.__materialDelLogoDelBanco.variante(k)',
  },
  sombra: {
    pedido: 'producto,sombra-logo',
    variantes: ['no', 'sombra'],
    rotulos: { no: 'hoy (solo la mancha)', sombra: 'con la sombra proyectada' },
    preparar: "(k) => window.__sombraDelLogoDelBanco.poner(k === 'sombra')",
  },
  bloom: {
    pedido: 'producto,bloom',
    // `directo`: la escena al lienzo como hoy (sin el posproceso); `no`: por el posproceso sin bloom (tiene que dar igual).
    variantes: ['directo', 'no', 'bloom'],
    rotulos: { directo: 'hoy (directo al lienzo)', no: 'por el posproceso, sin bloom', bloom: 'con bloom de noche' },
    preparar: "(k) => { window.__varianteDelBanco = k; window.__posprocesoDelBanco.bloom = k === 'bloom' ? 1 : 0 }",
    dibujar: "(window.__varianteDelBanco === 'directo' ? gl.render(escena, camara) : window.__posprocesoDelBanco.dibujar())",
    // La fugaz clavada a mitad de su cruce (sólo existe de noche, afuera del túnel).
    antes: 'window.__fugazDelBanco && window.__fugazDelBanco.ya(0.5)',
  },
}

const [NOMBRE, ANCHO, ALTO] = [process.argv[2] ?? 'material', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]
/** Para iterar: sólo estos momentos (separados por coma). */
const SOLO = process.argv[5]?.split(',')

async function cuadros(p: Prueba): Promise<Record<string, Omit<MismoCuadro, 'pngs'>>> {
  const dir = carpeta(`t3-material-y-luz/${NOMBRE}/cuadros`)
  const b = await abrir(p.pedido, ANCHO, ALTO)
  const salida: Record<string, Omit<MismoCuadro, 'pngs'>> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const m of MOMENTOS) {
      if ((p.momentos !== undefined && !p.momentos.includes(m.nombre)) || (SOLO !== undefined && !SOLO.includes(m.nombre))) continue
      await capturarMomento(b, m, sello)
      if (p.antes !== undefined) {
        await medir(b.p, p.antes)
        await new Promise((listo) => setTimeout(listo, 600))
      }
      const r = await guardarMismoCuadro(b, p.variantes, p.preparar, `${dir}/${m.nombre}-${String(ANCHO)}`, p.dibujar)
      salida[m.nombre] = { ancho: r.ancho, alto: r.alto, logo: r.logo, distintos: r.distintos }
      console.log(m.nombre, JSON.stringify(salida[m.nombre].distintos))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/mismo-cuadro-${String(ANCHO)}.json`, JSON.stringify(salida, null, 1))
  return salida
}

function hojas(p: Prueba): void {
  const base = carpeta(`t3-material-y-luz/${NOMBRE}`)
  const c = `${base}/cuadros`
  const medidas = JSON.parse(readFileSync(`${c}/mismo-cuadro-${String(ANCHO)}.json`, 'utf8')) as Record<string, MismoCuadro>
  const momentos = Object.keys(medidas)
  const fila = (m: string, recorte?: MismoCuadro['logo']): Celda[] =>
    p.variantes.map((v) => ({ archivo: `${c}/${m}-${String(ANCHO)}-${v}.png`, texto: `${m} - ${p.rotulos[v] ?? v}${recorte ? ' x2' : ''}`, ...(recorte ? { recorte } : {}) }))
  grilla(momentos.map((m) => fila(m)), ANCHO < 1024 ? 300 : 560, `${base}/hoja-${String(ANCHO)}.png`)
  for (const m of momentos) {
    const caja = medidas[m].logo
    if (caja !== null) grilla([fila(m, caja)], Math.min(caja[2] * 2, 900), `${base}/logo-x2-${m}-${String(ANCHO)}.png`)
  }
}

if (process.argv[1]?.endsWith('t3-mismo-cuadro.ts')) {
  const p = PRUEBAS[NOMBRE]
  if (p === undefined) throw new Error(`no hay prueba ${NOMBRE}`)
  cuadros(p).then(() => { hojas(p); process.exit(0) }, (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
