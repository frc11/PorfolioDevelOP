/**
 * SPRINT ESCENA 9 — T2 · el logo de noche: t2-logo-noche.ts <cuadros|clips|hojas> [ancho alto]
 *
 * `cuadros`: con la prueba prendida (`logo-noche`), el MISMO cuadro dibujado cuatro veces (el producto de hoy y las tres
 * variantes: `mismo-cuadro.ts`) en tres momentos: la noche de Trabajos (donde se ve lavado), el amanecer congelado en
 * 5,8 s (el piso ya de día y el logo todavía guardando la noche) y el hero de día (tiene que ser idéntico: la cuenta de
 * píxeles distintos va al json). `clips`: el paso por la noche de Trabajos grabado con cada una, el logo al doble.
 * `hojas`: las hojas y los recortes al doble. `url`: sin banco, la prueba pedida en la URL (`/v3?pruebas=logo-noche=grueso`),
 * la noche de Trabajos capturada: lo que Valentino ve si la abre así. Va a `escena9/t2-logo-noche/`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta } from '../scripts-viajes/banco'
import { irA } from '../scripts-b4/navegador'
import { grabar, mover, topeMas } from '../scripts-escena/banco-escena'
import { FUERA, recorte, scrollSuave } from '../scripts-escena/clips6'
import { grilla, type Celda } from '../scripts-escena/hojas6'
import type { Banco } from '../scripts-viajes/banco'
import { abrir, carpeta } from './banco'
import { guardarMismoCuadro, type MismoCuadro } from './mismo-cuadro'

const [QUE, ANCHO, ALTO] = [process.argv[2] ?? 'cuadros', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]
const VARIANTES = ['no', 'fino', 'grueso', 'claro'] as const
const ROTULO: Readonly<Record<(typeof VARIANTES)[number], string>> = { no: 'hoy (producto)', fino: 'fino - borde negro', grueso: 'grueso - borde negro', claro: 'claro - borde blanco' }
const PREPARAR = '(k) => window.__logoDeNocheDelBanco.variante(k)'

const bordeDeTuPanel = (b: Banco, f: number): Promise<number> =>
  medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * ${String(f)}) })()`)

async function cuadros(): Promise<void> {
  const dir = carpeta('t2-logo-noche/cuadros')
  const b = await abrir('producto,logo-noche=fino', ANCHO, ALTO)
  const salida: Record<string, Omit<MismoCuadro, 'pngs'>> = {}
  const guardar = async (momento: string): Promise<void> => {
    const r = await guardarMismoCuadro(b, VARIANTES, PREPARAR, `${dir}/${momento}-${String(ANCHO)}`)
    salida[momento] = { ancho: r.ancho, alto: r.alto, logo: r.logo, distintos: r.distintos }
    console.log(momento, JSON.stringify(salida[momento]))
  }
  try {
    await mover(b, FUERA[0], FUERA[1])
    // 1 · la noche de Trabajos.
    await scrollHasta(b, await topeMas('trabajos', 0)(b))
    await esperar(3000)
    await guardar('noche-trabajos')
    // 2 · el amanecer congelado con el piso ya de día y el logo guardando la noche.
    await scrollHasta(b, await bordeDeTuPanel(b, 1.12))
    await medir(b.p, 'window.__amanecerDelBanco.congelar(0)')
    await scrollHasta(b, await bordeDeTuPanel(b, 0.12))
    await medir(b.p, 'window.__amanecerDelBanco.congelar(5.8)')
    await esperar(1200)
    await guardar('amanecer-5_8')
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
    // 3 · el hero de día: tiene que dar igual.
    await scrollHasta(b, 0)
    await esperar(2500)
    await guardar('dia-hero')
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/mismo-cuadro-${String(ANCHO)}.json`, JSON.stringify(salida, null, 1))
}

/** El paso por la noche de Trabajos (un scroll de una pantalla en 4 s, ida), con una variante. */
async function clip(variante: (typeof VARIANTES)[number]): Promise<void> {
  const dir = carpeta('t2-logo-noche/clips')
  const b = await abrir(variante === 'no' ? 'producto' : `producto,logo-noche=${variante}`, ANCHO, ALTO)
  try {
    await mover(b, FUERA[0], FUERA[1])
    const y = await topeMas('trabajos', 0)(b)
    await scrollHasta(b, y - ALTO * 0.6)
    await esperar(2500)
    const destino = `${dir}/noche-${String(ANCHO)}-${variante}`
    await grabar(b, destino, async () => {
      await esperar(500)
      await scrollSuave(b, y - ALTO * 0.6, y + ALTO * 0.4, 4000)
      await esperar(1500)
    }, ANCHO)
    const caja = await medir<MismoCuadro['logo']>(b.p, `(${cajaDelLogo})()`)
    if (caja !== null) recorte(`${destino}.mp4`, `${destino}-logo-x2.mp4`, ...caja)
    console.log(variante, JSON.stringify(caja))
  } finally {
    await b.cerrar()
  }
}

/** La zona del recorte: el centro del cuadro, donde el logo pasa durante el paso entero. */
const cajaDelLogo = `() => [Math.round(innerWidth * 0.25) & ~1, Math.round(innerHeight * 0.08) & ~1, Math.round(innerWidth * 0.5) & ~1, Math.round(innerHeight * 0.84) & ~1]`

/** Sin banco (ningún `__entornoDeLaEscena`): la prueba pedida en la URL. */
async function url(): Promise<void> {
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena9-url' })
  try {
    await irA(b.p, 'http://localhost:3000/v3?pruebas=logo-noche=grueso')
    await esperar(5000)
    const sinBanco = await medir<boolean>(b.p, 'typeof window.__entornoDeLaEscena === "undefined" && typeof window.__gpuDelBanco === "undefined"')
    await scrollHasta(b, await topeMas('trabajos', 0)(b))
    await esperar(3000)
    const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
    writeFileSync(`${carpeta('t2-logo-noche')}/url-sin-banco-grueso-${String(ANCHO)}.png`, Buffer.from(shot.data, 'base64'))
    console.log(JSON.stringify({ sinBanco }))
  } finally {
    await b.cerrar()
  }
}

function hojas(): void {
  const dir = carpeta('t2-logo-noche')
  const c = `${dir}/cuadros`
  for (const momento of ['noche-trabajos', 'amanecer-5_8', 'dia-hero']) {
    const base = `${c}/${momento}-${String(ANCHO)}`
    if (!existsSync(`${base}-no.png`)) continue
    const fila = VARIANTES.map((v): Celda => ({ archivo: `${base}-${v}.png`, texto: `${momento} - ${ROTULO[v]}` }))
    grilla([fila.slice(0, 2), fila.slice(2)], ANCHO < 1024 ? 375 : 720, `${dir}/hoja-${momento}-${String(ANCHO)}.png`)
    const json = JSON.parse(readFileSync(`${c}/mismo-cuadro-${String(ANCHO)}.json`, 'utf8')) as Record<string, MismoCuadro>
    const caja = json[momento]?.logo
    if (caja === null || caja === undefined) continue
    const recortes = VARIANTES.map((v): Celda => ({ archivo: `${base}-${v}.png`, texto: `logo x2 - ${ROTULO[v]}`, recorte: caja }))
    grilla([recortes.slice(0, 2), recortes.slice(2)], caja[2] * 2, `${dir}/logo-x2-${momento}-${String(ANCHO)}.png`)
  }
}

if (process.argv[1]?.endsWith('t2-logo-noche.ts')) {
  const correr = async (): Promise<void> => {
    if (QUE === 'cuadros') await cuadros()
    else if (QUE === 'clips') for (const v of VARIANTES) await clip(v)
    else if (QUE === 'url') await url()
    else hojas()
  }
  correr().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
