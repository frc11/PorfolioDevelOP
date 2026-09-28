/**
 * SPRINT ESCENA 8 — T4, el cielo de día: cielo8.ts <momentos|amanecer> [variante]
 *
 * - `momentos`: por variante (las seis, o la pedida), los cinco momentos a 1440 × 900, con el recorrido
 *   asentado y verificado del banco. En cada uno, en la misma carga: la captura; el texto (cada elemento, WCAG)
 *   con el cielo y sin él (`__cieloDeDiaDelBanco.mostrar`); y el logo contra su anillo con el cielo y sin él
 *   (la cuenta de `contraste-formacion.ts`: la escena sola con todo, sin el cielo y sin el logo, dos veces). Lo
 *   que el cielo cambia en el cuadro (su mediana y p95, y su área) sale de la misma cuenta. Va a
 *   `cielo-dia/cuadros/` y `cielo-dia/medidas.json`.
 * - `wcag`: por variante y momento, cada texto a la vista contra su fondo con su color (la cuenta de `wcag6.ts`,
 *   la de ESCENA 7), con el cielo y sin él: el peor, lo que queda debajo de AA y la caída más grande de un mismo
 *   elemento (con el ruido: otra toma con el cielo). Va a `cielo-dia/texto-wcag.json`.
 * - `amanecer`: cada variante con el amanecer congelado en tres momentos (el frente en la formación, el piso
 *   vivo, el día), con el borde de Tu panel arriba: el paso de las estrellas a este cielo. Va a
 *   `cielo-dia/amanecer/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'
import { abrir8, carpeta8 } from './banco8'
import { contrasteDeLaFormacion, contrasteDelTexto, type Tomas } from './contraste-formacion'
import { cajasConColor } from './fondos6'
import { escenaSola } from './logo'
import { wcag } from './wcag6'

const [QUE, CUAL] = [process.argv[2] ?? 'momentos', process.argv[3] ?? '']
const VARIANTES = ['pintado-celeste', 'pintado-mono', 'bloques-celeste', 'bloques-mono', 'particulas-celeste', 'particulas-mono']

async function tomaCompleta(b: Banco): Promise<Buffer> {
  await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(0)))))')
  const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(s.data, 'base64')
}

async function momentos(variante: string): Promise<unknown[]> {
  const dir = carpeta8('cielo-dia/cuadros')
  const b = await abrir8(`producto,cielo-dia=${variante}`)
  const filas: unknown[] = []
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      const c = await capturarMomento(b, momento, sello)
      writeFileSync(`${dir}/${momento.nombre}-1440-${variante}.png`, c.png)
      // El texto, con el cielo y sin él (y el ruido: dos con el cielo).
      const con = await tomaCompleta(b)
      const otra = await tomaCompleta(b)
      await medir(b.p, 'window.__cieloDeDiaDelBanco.mostrar(false)')
      const sin = await tomaCompleta(b)
      await medir(b.p, 'window.__cieloDeDiaDelBanco.mostrar(true)')
      const texto = await contrasteDelTexto(b, con, sin)
      const ruido = (await contrasteDelTexto(b, con, otra)).peorCaida
      // El logo, con el cielo y sin él: la escena sola (con todo, sin el cielo, sin el logo), dos veces.
      const toma = async (cielo: boolean, logo: boolean): Promise<Buffer> => {
        await medir(b.p, `window.__cieloDeDiaDelBanco.mostrar(${String(cielo)}); window.__formacionDelBanco.mostrar(true, ${String(logo)})`)
        return escenaSola(b)
      }
      const series: Tomas[] = []
      for (let i = 0; i < 2; i += 1) series.push({ a: await toma(true, true), sinFormacion: await toma(false, true), sinLogo: await toma(true, false) })
      await medir(b.p, 'window.__cieloDeDiaDelBanco.mostrar(true); window.__formacionDelBanco.mostrar(true, true)')
      if (momento.nombre === 'por-que-develop') writeFileSync(`${dir}/${momento.nombre}-1440-${variante}-escena-sin-cielo.png`, series[0].sinFormacion)
      const logo = contrasteDeLaFormacion(series[0], series[1], `${dir}/${momento.nombre}-1440-${variante}-mascaras.png`)
      const fila = {
        variante,
        momento: momento.nombre,
        texto: { conCielo: texto.con, sinCielo: texto.sin, peorCaida: texto.peorCaida, ruido, textos: texto.textos },
        logo: { conCielo: logo.logoCon, sinCielo: logo.logoSin },
        cielo: { mediana: logo.copiasMediana, p95: logo.copiasP95, area: logo.copiasArea },
      }
      filas.push(fila)
      console.log(JSON.stringify(fila))
    }
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    if (errores.length > 0) console.log(JSON.stringify({ variante, errores: errores.slice(0, 4) }))
  } finally {
    await b.cerrar()
  }
  return filas
}

async function textoWcag(variante: string): Promise<unknown[]> {
  const b = await abrir8(`producto,cielo-dia=${variante}`)
  const filas: unknown[] = []
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const cajas = (await cajasConColor(b)) as Parameters<typeof wcag>[1]
      const con = wcag(await tomaCompleta(b), cajas)
      const otra = wcag(await tomaCompleta(b), cajas)
      await medir(b.p, 'window.__cieloDeDiaDelBanco.mostrar(false)')
      const sin = wcag(await tomaCompleta(b), cajas)
      await medir(b.p, 'window.__cieloDeDiaDelBanco.mostrar(true)')
      const caida = (a: typeof con, z: typeof con): { texto: string; caida: number; de: number; a: number } =>
        a.map((e, i) => ({ texto: e.texto, caida: Math.round((1 - e.razon / z[i].razon) * 1000) / 10, de: z[i].razon, a: e.razon })).reduce((x, y) => (y.caida > x.caida ? y : x), { texto: '-', caida: 0, de: 0, a: 0 })
      const minimo = (r: typeof con): number => Math.min(...r.map((e) => e.razon))
      const fila = { variante, momento: momento.nombre, textos: cajas.length, conCielo: minimo(con), sinCielo: minimo(sin), peorCaida: caida(con, sin), ruido: caida(otra, con).caida, bajoAA: con.filter((e) => e.razon < e.aa).map((e) => `${e.texto} ${String(e.razon)}`) }
      filas.push(fila)
      console.log(JSON.stringify(fila))
    }
  } finally {
    await b.cerrar()
  }
  return filas
}

/** Los momentos del amanecer con el cielo de día (s del guion): el frente en la formación, el piso vivo y el día. */
const MOMENTOS_DEL_AMANECER = [
  [0.6, 'noche'],
  [3.2, 'frente-en-la-formacion'],
  [5.8, 'el-piso-vivo'],
  [7.6, 'dia'],
] as const

async function amanecer(variante: string): Promise<void> {
  const dir = carpeta8('cielo-dia/amanecer')
  const b = await abrir8(`producto,cielo-dia=${variante}`)
  try {
    const borde = (k: number): Promise<number> => medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * ${String(k)}) })()`)
    const desde = await borde(1.12)
    const mirada = await borde(0.12)
    await scrollHasta(b, desde)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(0)')
    await scrollHasta(b, mirada)
    for (const [s, nombre] of MOMENTOS_DEL_AMANECER) {
      await medir(b.p, `window.__amanecerDelBanco.congelar(${String(s)})`)
      await esperar(900)
      writeFileSync(`${dir}/${variante}-${String(s).replace('.', '_')}-${nombre}.png`, await tomaCompleta(b))
    }
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  const cuales = CUAL === '' ? VARIANTES : [CUAL]
  if (QUE === 'momentos') {
    const filas: unknown[] = []
    for (const v of cuales) filas.push(...(await momentos(v)))
    writeFileSync(`${carpeta8('cielo-dia')}/medidas${CUAL === '' ? '' : `-${CUAL}`}.json`, JSON.stringify(filas, null, 1))
    return
  }
  if (QUE === 'wcag') {
    const filas: unknown[] = []
    for (const v of cuales) filas.push(...(await textoWcag(v)))
    writeFileSync(`${carpeta8('cielo-dia')}/texto-wcag${CUAL === '' ? '' : `-${CUAL}`}.json`, JSON.stringify(filas, null, 1))
    return
  }
  if (QUE === 'amanecer') {
    for (const v of cuales) await amanecer(v)
    return
  }
  throw new Error(`no sé qué es «${QUE}»`)
}

if (process.argv[1]?.endsWith('cielo8.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
