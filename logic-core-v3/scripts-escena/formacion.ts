/**
 * SPRINT ESCENA 4 — la formación. formacion.ts <ancho> <alto> "<variantes>" ["<momentos>"] [carpeta]
 *
 * Una captura por variante y por momento, con el mismo recorrido del banco de ESCENA 3 (por scroll, a
 * pasos, asentada y verificada). Una variante es un pedido para `_lib/escena/entorno.ts`:
 * `E1,E4,E6,E7` es el producto, y se le suma `L1` o `L2`, `densidad=menos|mas`, `mirada`…
 *
 * Con formación, además mide: el contraste del logo contra su entorno y el del texto, con la
 * formación y sin ella en la misma carga (`contraste-formacion.ts`), y cuántas copias caen adentro
 * del cuadro. Todo va a `~/.cache/b4-medicion/escena4/<carpeta>/`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, type Banco } from '../scripts-viajes/banco'
import { CONTADOR, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'
import { rotuloDe } from './comparar'
import { contrasteDeLaFormacion, contrasteDelTexto, type ContrasteDeLaFormacion, type Tomas } from './contraste-formacion'
import { escenaSola } from './logo'

export const DIR4 = 'C:/Users/Valentino/.cache/b4-medicion/escena4'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const VARIANTES = (process.argv[4] ?? 'E1,E4,E6,E7').split(' ').filter(Boolean)
const QUE_MOMENTOS = (process.argv[5] ?? 'hero quienes-somos trabajos-de-noche por-que-develop pie').split(' ').filter(Boolean)
const CARPETA = process.argv[6] ?? 'formacion/cuadros'

/** Lo que el componente publica para el banco. */
const HAY_FORMACION = 'typeof window.__formacionDelBanco === "object"'

/** Junta los errores de la consola (un shader que no compila lo dice por ahí). */
export const ERRORES = `window.__errores = []; for (const k of ['error', 'warn']) { const f = console[k].bind(console); console[k] = (...a) => { window.__errores.push(k + ': ' + a.map(String).join(' ').slice(0, 300)); f(...a) } }`

/** Seis tomas de la escena sola: con todo, sin formación, sin logo, dos veces. */
async function medirElContraste(b: Banco, base: string): Promise<ContrasteDeLaFormacion> {
  const toma = async (formacion: boolean, logo: boolean): Promise<Buffer> => {
    await medir(b.p, `window.__formacionDelBanco.mostrar(${String(formacion)}, ${String(logo)})`)
    return escenaSola(b)
  }
  const series: Tomas[] = []
  for (let i = 0; i < 2; i += 1) series.push({ a: await toma(true, true), sinFormacion: await toma(false, true), sinLogo: await toma(true, false) })
  await medir(b.p, 'window.__formacionDelBanco.mostrar(true, true)')
  writeFileSync(`${base}-escena.png`, series[0].a)
  writeFileSync(`${base}-escena-sin-formacion.png`, series[0].sinFormacion)
  return contrasteDeLaFormacion(series[0], series[1], `${base}-mascaras.png`)
}

/** Una captura completa, dos cuadros después de pedirla. */
async function tomaCompleta(b: Banco): Promise<Buffer> {
  await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(0))))')
  const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(s.data, 'base64')
}

/**
 * El texto con la formación y sin ella, en la misma carga. Y el RUIDO: dos capturas iguales, con la
 * formación, difieren igual porque el polvo se mueve; una caída menor que el ruido no es de la formación.
 */
async function medirElTexto(b: Banco): Promise<{ con: number; sin: number; peorCaida: number; ruido: number; textos: number }> {
  const con = await tomaCompleta(b)
  const otra = await tomaCompleta(b)
  await medir(b.p, 'window.__formacionDelBanco.mostrar(false, true)')
  const sin = await tomaCompleta(b)
  await medir(b.p, 'window.__formacionDelBanco.mostrar(true, true)')
  const medida = await contrasteDelTexto(b, con, sin)
  return { ...medida, ruido: (await contrasteDelTexto(b, con, otra)).peorCaida }
}

async function principal(): Promise<void> {
  const dir = `${DIR4}/${CARPETA}`
  mkdirSync(dir, { recursive: true })
  const filas: unknown[] = []
  for (const variante of VARIANTES) {
    const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${variante}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
    try {
      const sello = await selloDeCarga(b)
      const ultimo = MOMENTOS.map((m) => m.nombre).filter((n) => QUE_MOMENTOS.includes(n)).pop()
      for (const momento of MOMENTOS) {
        const c = await capturarMomento(b, momento, sello)
        if (!QUE_MOMENTOS.includes(momento.nombre)) continue
        const nombre = `${momento.nombre}-${String(ANCHO)}-${rotuloDe(variante)}`
        writeFileSync(`${dir}/${nombre}.png`, c.png)
        const hay = await medir<boolean>(b.p, HAY_FORMACION)
        const medida = hay ? { ...(await medirElContraste(b, `${dir}/${nombre}`)), texto: await medirElTexto(b) } : null
        const visibles = hay ? await medir<number>(b.p, 'window.__formacionDelBanco.visibles()') : 0
        const copias = hay ? await medir<{ copias: number; instancias: number }>(b.p, '({ copias: window.__formacionDelBanco.copias, instancias: window.__formacionDelBanco.instancias })') : null
        const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
        const fila = { variante, momento: momento.nombre, ancho: ANCHO, y: c.y, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos), visibles, ...copias, ...medida }
        filas.push(fila)
        console.log(JSON.stringify(fila))
        if (momento.nombre === ultimo) break
      }
      const errores = await medir<string[]>(b.p, 'window.__errores')
      if (errores.length > 0) console.log(JSON.stringify({ variante, errores: errores.slice(0, 8) }))
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${dir}/medidas-${String(ANCHO)}-${String(Date.now())}.json`, JSON.stringify(filas, null, 2))
}

if (process.argv[1]?.endsWith('formacion.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
