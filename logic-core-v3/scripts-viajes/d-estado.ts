/**
 * SPRINT VIAJES — ¿el estado después de un viaje es el que se tiene llegando por scroll?
 * d-estado.ts <ancho> <alto> [orígenes separados por coma]
 *
 * Para cada origen O y cada destino D (las 20 combinaciones entre Hero, Quiénes somos, Trabajos,
 * Servicios y Por qué develOP):
 *   · A — desde O (alcanzado por scroll y asentado), clic en D, y se espera a que la página quede quieta;
 *   · B — desde O, por scroll a pasos hasta el MISMO píxel, y se espera a que quede quieta.
 * Se comparan tres cosas, cada una contra su propio ruido:
 *   · el DOM del `<main>`: los estilos computados de todo lo que la coreografía escribe en línea
 *     (transform, opacidad, recorte, máscara), nombrado por su camino de marcas. Lo escondido
 *     cuenta sólo por estar escondido, y lo que se mueve SOLO en reposo (un cursor que titila, un
 *     carrusel) se detecta leyendo varias veces y se descarta;
 *   · la escena: una captura con el `<main>` escondido, promediada por bloques de 30 px (las motas
 *     corren solas y se promedian adentro del bloque), contra el ruido de la MISMA pose capturada
 *     más tarde, con la misma separación de tiempo que hay entre A y B;
 *   · el tono del botón del menú, donde lo hay (lee la noche de la escena).
 * Control positivo: la misma comparación contra 300 px antes del destino tiene que dar distinto.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { abrirBanco, esperar, scrollHasta, type Banco } from './banco'
import { clicEnElItem } from './b-humo'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const SECCIONES = ['hero', 'quienes-somos', 'trabajos', 'servicios', 'por-que-develop']
const ORIGENES = (process.argv[4] ?? SECCIONES.join(',')).split(',')
/** Opcional: sólo estos destinos (para repetir una fila). */
const SOLO = process.argv[6]?.split(',') ?? null
const DIR = `C:/Users/Valentino/.cache/b4-medicion/viajes/estado-${String(ANCHO)}`

type Dom = Record<string, string>

const LEER_EL_DOM = `(() => {
  const salida = {}
  const main = document.querySelector('[data-v3] main')
  const props = ['transform', 'opacity', 'clip-path', 'mask-image']
  const nombre = (el) => {
    const partes = []
    for (let a = el; a && a !== main; a = a.parentElement) {
      const marca = a.getAttribute('data-pieza') || a.getAttribute('data-parte') || a.getAttribute('data-panel') || a.getAttribute('data-capa')
      const hermanos = a.parentElement ? [...a.parentElement.children].filter((h) => h.tagName === a.tagName) : [a]
      partes.unshift((marca || a.tagName.toLowerCase()) + ':' + hermanos.indexOf(a))
    }
    return partes.join('/')
  }
  const oculto = (el) => {
    for (let a = el; a && a !== main; a = a.parentElement) if (getComputedStyle(a).visibility === 'hidden') return true
    return false
  }
  main.querySelectorAll('[style]').forEach((el) => {
    // Sólo lo que está en cuadro: fuera de él, lo que se recalcula por posición (el parallax del fondo) guarda
    // el último valor que escribió, y vuelve a escribir antes de verse.
    const r = el.getBoundingClientRect()
    if (r.bottom <= 0 || r.top >= innerHeight) return
    const cs = getComputedStyle(el)
    salida[nombre(el)] = oculto(el) ? 'oculto' : props.map((p) => cs.getPropertyValue(p)).join(' | ')
  })
  const boton = document.querySelector('[data-parte="boton-del-menu"]')
  if (boton) salida['boton-del-menu'] = boton.getAttribute('data-seccion') || 'claro'
  return salida
})()`

async function dom(b: Banco): Promise<Dom> {
  return medir<Dom>(b.p, LEER_EL_DOM)
}

/** Las claves que difieren entre dos lecturas. */
function difieren(a: Dom, b: Dom, ignorar: ReadonlySet<string>): string[] {
  const claves = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...claves].filter((k) => !ignorar.has(k) && a[k] !== b[k])
}

/** La escena sola: se esconde el `<main>` un par de cuadros y se captura. */
async function escena(b: Banco): Promise<Uint8Array> {
  await medir(b.p, `(() => { document.querySelector('[data-v3] main').style.visibility = 'hidden'; return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(0)))) })()`)
  const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  await medir(b.p, `(() => { document.querySelector('[data-v3] main').style.visibility = ''; return 0 })()`)
  return Buffer.from(shot.data, 'base64')
}

/** La luminancia media de cada bloque de 30 × 30 px. */
function bloques(png: Uint8Array): number[] {
  const img = decodificarPng(Buffer.from(png))
  const lado = 30
  const salida: number[] = []
  for (let by = 0; by + lado <= img.alto; by += lado) {
    for (let bx = 0; bx + lado <= img.ancho; bx += lado) {
      let suma = 0
      for (let y = by; y < by + lado; y += 1) {
        for (let x = bx; x < bx + lado; x += 1) {
          const i = (y * img.ancho + x) * 4
          suma += 0.2126 * img.datos[i] + 0.7152 * img.datos[i + 1] + 0.0722 * img.datos[i + 2]
        }
      }
      salida.push(suma / (lado * lado))
    }
  }
  return salida
}

/** La diferencia media entre los bloques de dos capturas (0–255). */
function diferencia(a: Uint8Array, b: Uint8Array): number {
  const pa = bloques(a)
  const pb = bloques(b)
  let suma = 0
  for (let i = 0; i < pa.length; i += 1) suma += Math.abs(pa[i] - pb[i])
  return suma / pa.length
}

/**
 * Espera a que el DOM quede quieto —dos lecturas iguales a 600 ms— hasta un tope (el túnel
 * persigue a 500 px/s: desde abajo tarda). Después lee cuatro veces más en 2,4 s: lo que se mueve
 * con la página quieta (un cursor que titila, un carrusel) es autónomo y no entra en la comparación.
 */
async function quieta(b: Banco, maxMs = 20_000): Promise<{ dom: Dom; solos: Set<string>; ms: number }> {
  const t0 = Date.now()
  let antes = await dom(b)
  for (;;) {
    await esperar(600)
    const ahora = await dom(b)
    if (difieren(antes, ahora, new Set()).length === 0 || Date.now() - t0 > maxMs) break
    antes = ahora
  }
  const ms = Date.now() - t0
  const solos = new Set<string>()
  const base = await dom(b)
  for (let i = 0; i < 4; i += 1) {
    await esperar(600)
    difieren(base, await dom(b), new Set()).forEach((k) => solos.add(k))
  }
  return { dom: base, solos, ms }
}

async function llegarAlOrigen(b: Banco, knots: Record<string, number>, origen: string): Promise<void> {
  await scrollHasta(b, 0)
  await scrollHasta(b, knots[origen])
  await quieta(b)
}

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'viajes-estado' })
  const informe: unknown[] = []
  try {
    await medir(b.p, `(() => { const a = document.createElement('a'); a.href = '#hero'; a.setAttribute('data-pieza', 'nav-enlace'); a.setAttribute('data-instrumento', ''); a.style.display = 'none'; document.querySelector('[data-pieza="navegacion"]').appendChild(a); return 0 })()`)
    const viajarA = async (id: string): Promise<void> => {
      if (id === 'hero') await medir(b.p, `(() => { document.querySelector('[data-instrumento]').click(); return 0 })()`)
      else await clicEnElItem(b, id)
      for (let i = 0; i < 80; i += 1) {
        await esperar(100)
        if (!(await medir<boolean>(b.p, `document.querySelector('[data-v3] main').hasAttribute('data-v3-deslizando')`))) break
      }
      await esperar(600)
    }
    // Los nudos: a dónde llega cada viaje desde el Hero (o los que ya se midieron, por argumento).
    const knots: Record<string, number> = process.argv[5] === undefined ? { hero: 0 } : (JSON.parse(process.argv[5]) as Record<string, number>)
    for (const id of SECCIONES.slice(1)) {
      if (knots[id] !== undefined) continue
      await scrollHasta(b, 0)
      await viajarA(id)
      knots[id] = await medir<number>(b.p, 'scrollY')
    }
    console.log(JSON.stringify({ ancho: ANCHO, knots }))

    for (const origen of ORIGENES) {
      for (const destino of SECCIONES.filter((s) => s !== origen && (SOLO === null || SOLO.includes(s)))) {
        // A — el viaje.
        await llegarAlOrigen(b, knots, origen)
        const t0 = Date.now()
        await viajarA(destino)
        const a = await quieta(b)
        const yA = await medir<number>(b.p, 'scrollY')
        const escenaA = await escena(b)
        const separacion = Date.now() - t0
        // B — el scroll, al mismo píxel.
        await llegarAlOrigen(b, knots, origen)
        await scrollHasta(b, yA)
        const b1 = await quieta(b)
        const escenaB = await escena(b)
        const yB = await medir<number>(b.p, 'scrollY')
        // El ruido de la escena: la MISMA pose, capturada con una separación parecida a la de A y B.
        await esperar(Math.min(separacion, 12_000))
        const escenaB2 = await escena(b)
        // Control positivo: 300 px antes del destino (después, si no hay 300 px antes) tiene que diferir.
        await scrollHasta(b, yA >= 300 ? yA - 300 : yA + 300)
        const corrido = await quieta(b)
        const escenaCorrida = await escena(b)
        const ignorar = new Set([...a.solos, ...b1.solos, ...corrido.solos])
        const domDistinto = difieren(a.dom, b1.dom, ignorar)
        const fila = {
          origen,
          destino,
          yA,
          yB,
          dom: domDistinto.length,
          muestra: domDistinto.slice(0, 4).map((k) => `${k}: ${a.dom[k] ?? '-'} ≠ ${b1.dom[k] ?? '-'}`),
          control: difieren(corrido.dom, b1.dom, ignorar).length,
          escena: +diferencia(escenaA, escenaB).toFixed(2),
          ruido: +diferencia(escenaB, escenaB2).toFixed(2),
          escenaControl: +diferencia(escenaCorrida, escenaB).toFixed(2),
          autonomos: ignorar.size,
          asentoMs: b1.ms,
        }
        writeFileSync(`${DIR}/${origen}-a-${destino}-viaje.png`, escenaA)
        writeFileSync(`${DIR}/${origen}-a-${destino}-scroll.png`, escenaB)
        informe.push(fila)
        console.log(JSON.stringify(fila))
      }
    }
    writeFileSync(`${DIR}/informe-${ORIGENES.join('+')}${SOLO === null ? '' : `-a-${SOLO.join('+')}`}.json`, JSON.stringify(informe, null, 2))
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
