/**
 * CAMARA-1 · D — LA SIMULACIÓN: captura con la distancia propuesta, y la
 * devuelve.
 *
 *     npx tsx scripts-camara/d-simulacion.ts --distancia=40 --etiqueta=d40
 *
 * ── ⚠️ ESTE SCRIPT ESCRIBE EN EL ÁRBOL Y LO DEVUELVE. Cómo se garantiza ───
 *
 * `choreography.ts` es la ÚNICA puerta a la distancia en runtime: el rig arma su
 * pista con `buildTrack(CHOREO_KEYFRAMES)` adentro de un closure
 * (`pistaDelHome.ts`) y no hay ningún canal —ni store, ni prop, ni query— por el
 * que se pueda inyectar otra desde afuera. Para ver la palanca con el renderer
 * de verdad hay que escribir el archivo.
 *
 * Las tres cosas que hacen que eso sea auditable y no un riesgo:
 *
 *   1. **El original se guarda FUERA del árbol** —en el directorio temporal del
 *      sistema— antes de tocar nada. La regla del repo es explícita: nunca un
 *      respaldo adentro del árbol que se respalda.
 *   2. **La restauración va en `finally`**, así que corre también si la medición
 *      tira o si el navegador se cae.
 *   3. **Se verifica el sha256 al cerrar** y se imprime. Si no coincide con el
 *      de entrada, el script termina con código 1 y lo dice: un árbol que quedó
 *      sucio tiene que ser una FALLA, no una nota al pie.
 *
 * ── ⚠️ Y LO QUE LA SIMULACIÓN **NO** ES ──────────────────────────────────
 *
 * `choreography.ts` tiene UN número por keyframe, así que escribirlo aplica la
 * distancia en TODOS los anchos, 1440 y 1920 incluidos. La palanca real estaría
 * condicionada —el PASO 2 mide con qué y a qué costo—, y por eso acá **no se
 * capturan los dos de escritorio**: mostrarlos movidos sería mostrar un artefacto
 * del banco, no una propuesta.
 */

import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import { cruzar, leer, type Rect } from '../scripts-tapado/mascaras'
import {
  ASENTAMIENTO_MS,
  PONER_CAPA,
  SIN_LA_ESCENA,
  SOLO_LA_ESCENA,
  TEMP,
  VENTANAS as VENTANAS_TAPADO,
  conChrome,
  enLaVentana,
  type EstadoDeCapas,
  type Ventana as VentanaTapado,
} from '../scripts-tapado/tapado-comun'
import { CARPETA_DE_CAPTURAS, RAIZ_DE_SALIDAS, argumento, cuatroDecimales, dosDecimales } from './camara-comun'

const ARCHIVO = 'src/app/v3/_lib/escena/choreography.ts'
const LINEA_DEL_HERO = 'pose: { angleDeg: 0, height: 6.4, distance: 19, frameX: 0.5, frameY: 0 },'

/** Los seis en alcance. Escritorio NO se captura: ver el docblock. */
const ANCHOS_POR_DEFECTO = [320, 375, 390, 425, 768, 1024]

const LECTOR = `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const h1 = pantalla.querySelector('h1')
  const cuerpos = [...pantalla.querySelectorAll('[data-nivel="cuerpo"], p')]
  const cta = pantalla.querySelector('a')
  const caja = (el) => {
    if (el === null || el === undefined) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, ancho: r.width, alto: r.height }
  }
  const todos = [h1, ...cuerpos, cta].filter((e) => e !== null && e !== undefined)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const el of todos) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y)
    x1 = Math.max(x1, r.x + r.width); y1 = Math.max(y1, r.y + r.height)
  }
  return {
    titular: caja(h1),
    bloque: Number.isFinite(x0) ? { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 } : null,
  }
})()`

interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}
interface Rectangulos {
  readonly titular: Caja | null
  readonly bloque: Caja | null
}

async function medirVentana(pagina: Pagina, v: VentanaTapado, etiqueta: string): Promise<Record<string, unknown>> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)
  const rect = await medir<Rectangulos | null>(pagina, LECTOR)
  if (rect === null || rect.titular === null || rect.bloque === null) {
    throw new Error(`a ${v.ancho}: no hay bloque de texto en el hero`)
  }

  const aRuta = path.join(TEMP, `${etiqueta}-${v.ancho}-a.png`)
  await capturar(pagina, aRuta)

  const c = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
  if (c.escena !== 'hidden' || c.titular !== 'visible') throw new Error(`a ${v.ancho}: la capa C no tomo`)
  const cRuta = path.join(TEMP, `${etiqueta}-${v.ancho}-c.png`)
  await capturar(pagina, cRuta)

  const d = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (d.escena !== 'visible' || d.titular !== 'hidden') throw new Error(`a ${v.ancho}: la capa D no tomo`)
  const dRuta = path.join(TEMP, `${etiqueta}-${v.ancho}-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))

  const C = leer(cRuta)
  const D = leer(dRuta)
  const cruce = (caja: Caja): Record<string, unknown> => {
    const r: Rect = { x: caja.x, y: caja.y, ancho: caja.ancho, alto: caja.alto }
    const x = cruzar(C, D, r)
    return {
      caja: { x: dosDecimales(caja.x), y: dosDecimales(caja.y), ancho: dosDecimales(caja.ancho), alto: dosDecimales(caja.alto) },
      glifos: x.glifos,
      tintaSobreLogo: cuatroDecimales(x.fraccionDeTinta),
      cajaSobreLogo: cuatroDecimales(x.fraccionDeCaja),
      tintaBajoAA: cuatroDecimales(x.fraccionBajoAA),
    }
  }

  const destino = path.join(CARPETA_DE_CAPTURAS, `${etiqueta}-${v.ancho}x${v.alto}.png`)
  copyFileSync(aRuta, destino)
  return { ancho: v.ancho, alto: v.alto, captura: destino, titular: cruce(rect.titular), bloque: cruce(rect.bloque) }
}

async function main(): Promise<void> {
  const distancia = Number.parseFloat(argumento('distancia', '40'))
  const etiqueta = argumento('etiqueta', `d${argumento('distancia', '40')}`)
  if (!Number.isFinite(distancia) || distancia <= 0) throw new Error(`--distancia invalida: ${distancia}`)

  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  mkdirSync(TEMP, { recursive: true })

  const original = readFileSync(ARCHIVO)
  const hashOriginal = createHash('sha256').update(original).digest('hex')
  const respaldo = path.join(TEMP, 'choreography.ts.original')
  writeFileSync(respaldo, original)
  console.log(`  original: sha256 ${hashOriginal}`)
  console.log(`  respaldo FUERA del arbol: ${respaldo}`)

  const texto = original.toString('utf8')
  if (!texto.includes(LINEA_DEL_HERO)) throw new Error('no encontre la pose del hero: el archivo cambio de forma')

  const filas: Record<string, unknown>[] = []
  try {
    const modificado = texto.replace(LINEA_DEL_HERO, LINEA_DEL_HERO.replace('distance: 19', `distance: ${distancia}`))
    writeFileSync(ARCHIVO, modificado, 'utf8')
    console.log(`\n  APLICADO distance: ${distancia} en el keyframe del hero. El dev server recompila...\n`)
    // El dev server necesita ver el cambio antes de la primera carga.
    await new Promise((r) => setTimeout(r, 6000))

    const pedidos = argumento('anchos', '')
    const anchos = pedidos === '' ? ANCHOS_POR_DEFECTO : pedidos.split(',').map((x) => Number.parseInt(x, 10))
    for (const ancho of anchos) {
      const v = VENTANAS_TAPADO.find((x) => x.ancho === ancho)
      if (v === undefined) throw new Error(`sin ventana declarada para ${ancho}`)
      const fila = await conChrome(`camara-${ancho}`, async (chrome) =>
        enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta), {
          asentamientoMs: ASENTAMIENTO_MS,
        }),
      )
      const t = fila.titular as { tintaSobreLogo: number; tintaBajoAA: number; glifos: number }
      const b = fila.bloque as { tintaSobreLogo: number }
      console.log(
        `  ${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)}  titular: tinta ${(t.tintaSobreLogo * 100).toFixed(1).padStart(5)} %` +
          ` · bajo AA ${(t.tintaBajoAA * 100).toFixed(1).padStart(5)} %` +
          ` · ${String(t.glifos).padStart(5)} px   |   bloque: ${(b.tintaSobreLogo * 100).toFixed(1).padStart(5)} %`,
      )
      filas.push(fila)
    }
  } finally {
    writeFileSync(ARCHIVO, original)
    const hashFinal = createHash('sha256').update(readFileSync(ARCHIVO)).digest('hex')
    const igual = hashFinal === hashOriginal
    console.log(`\n  RESTAURADO: sha256 ${hashFinal} — ${igual ? 'IDENTICO al original' : 'DISTINTO: EL ARBOL QUEDO SUCIO'}`)
    if (!igual) process.exitCode = 1
  }

  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, `d-simulacion-${etiqueta}.json`),
    `${JSON.stringify({ cuando: new Date().toISOString(), distancia, etiqueta, filas }, null, 2)}\n`,
    'utf8',
  )
  console.log(`  -> ${path.join(RAIZ_DE_SALIDAS, `d-simulacion-${etiqueta}.json`)}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
