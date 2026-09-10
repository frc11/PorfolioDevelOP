/**
 * B12 · LA REFERENCIA, TERCERA NAVEGACIÓN — cómo SALE de su sección oscura hacia
 * el blanco.
 *
 *     npx tsx scripts-b12/referencia-salida.ts
 *
 * ⚠️ **Por qué hay una tercera navegación, y se declara.** `scripts-b8/a-referencia.ts`
 * perfiló las 23 pantallas de `nk.studio` de a una pantalla —de ahí salen las
 * seis pantallas de sala negra (luminancia 0,0010) y el salto a la sección
 * blanca entre las pantallas 12 y 13— y `a-referencia-proyectos.ts` barrió la
 * región 2700 → 9000 de a un octavo de pantalla, o sea **la ENTRADA a lo oscuro
 * y el cuerpo de la sección**. Ninguna de las dos cubre la SALIDA: la pantalla en
 * la que lo oscuro se va y el papel llega, que es exactamente lo que el humano
 * pidió («una previa al blanco») y lo único que falta medir de la referencia.
 *
 * Esta corrida barre **10.350 → 12.150** —una pantalla a cada lado de la costura
 * 12/13— de a un octavo de pantalla, y en cada parada mide dos cosas:
 *
 *   · **La luminancia media del cuadro**, con el mismo lector de `mediaDeLaCaptura`
 *     que B8 usó para las 23 pantallas y para las nuestras: una sola vara.
 *   · **Las piezas que se mueven**: todo elemento visible con transformación u
 *     opacidad < 1 sin un ancestro que ya cumpla lo mismo, con su escala, su
 *     opacidad efectiva y su caja. Es el MISMO lector de
 *     `a-referencia-proyectos.ts`, copiado acá con su atributo propio para no
 *     pisar el `data-b8-pieza` de aquella corrida.
 *
 * ⚠️ De la referencia se MIDE, no se copia: lo que sale de acá son cifras
 * —cuánto dura, qué se mueve, si es una forma o un desvanecimiento— y ninguna
 * imagen, ningún asset y ninguna clase.
 */

import { esperarElPrimerCuadro, capturar } from '../scripts-b4/captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, scrollA } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { leerImagen } from '../scripts-b8/glifo-alfa'
import { mediaDeLaCaptura } from '../scripts-b8/particulas'

import { TEMP, asegurarCarpetas, jsonPendiente, mudarPendientes } from './b12-comun'

const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'
const ATRIBUTO = 'data-b12-pieza'

/** La costura 12/13 de `a-referencia.json`, con una pantalla a cada lado. */
const DESDE = 10350
const HASTA = 12150
const PASO = 900 / 8

interface PiezaLeida {
  readonly id: number
  readonly etiqueta: string
  readonly transformacion: 'ninguna' | '2d' | '3d'
  readonly escala: number
  readonly opacidad: number
  readonly y: number
  readonly alto: number
  readonly medios: number
  readonly texto: string
}

const LECTOR = `(() => {
  const marca = ${JSON.stringify(ATRIBUTO)}
  if (window.__b12Pieza === undefined) window.__b12Pieza = 0
  const cs = (el) => getComputedStyle(el)
  const animado = (el) => { const s = cs(el); return s.transform !== 'none' || parseFloat(s.opacity) < 1 }
  const opacidadEfectiva = (el) => { let o = 1; let n = el; while (n !== null && n !== document.documentElement) { o *= parseFloat(cs(n).opacity); n = n.parentElement } return o }
  const salida = []
  for (const el of document.querySelectorAll('body *')) {
    if (!animado(el)) continue
    const r = el.getBoundingClientRect()
    if (r.width < 24 || r.height < 12) continue
    if (r.bottom < 0 || r.top > innerHeight) continue
    let a = el.parentElement, anidado = false
    while (a !== null && a !== document.body) { if (animado(a)) { anidado = true; break } a = a.parentElement }
    if (anidado) continue
    const s = cs(el)
    const m = (s.transform.match(/-?[0-9.e+-]+/g) || []).map(Number)
    let tipo = 'ninguna', escala = 1
    if (s.transform.startsWith('matrix3d(') && m.length === 16) { tipo = '3d'; escala = Math.hypot(m[0], m[1]) }
    else if (s.transform.startsWith('matrix(') && m.length === 6) { tipo = '2d'; escala = Math.hypot(m[0], m[1]) }
    if (!el.hasAttribute(marca)) { el.setAttribute(marca, String(window.__b12Pieza)); window.__b12Pieza += 1 }
    salida.push({
      id: Number(el.getAttribute(marca)), etiqueta: el.tagName.toLowerCase(), transformacion: tipo, escala,
      opacidad: opacidadEfectiva(el), y: r.top, alto: r.height,
      medios: el.querySelectorAll('img,video,canvas').length,
      texto: (el.textContent || '').trim().slice(0, 60),
    })
  }
  return salida
})()`

async function principal(): Promise<void> {
  asegurarCarpetas()
  const perfil = perfilPorId('1440')
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('b12-referencia'), ancho: perfil.ancho, alto: perfil.alto + 120 })
  const filas: Record<string, unknown>[] = []
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, ORIGEN_DE_LA_REFERENCIA)
    await new Promise((r) => setTimeout(r, 4000))
    for (let y = DESDE; y <= HASTA; y += PASO) {
      const logrado = await scrollA(p, Math.round(y))
      await esperarElPrimerCuadro(p)
      await new Promise((r) => setTimeout(r, 700))
      const ruta = `${TEMP}/referencia-salida-${Math.round(y)}.png`
      await capturar(p, ruta)
      const media = mediaDeLaCaptura(leerImagen(ruta))
      const piezas = await medir<PiezaLeida[]>(p, LECTOR)
      filas.push({ scrollY: logrado, pantalla: Math.round((logrado / perfil.alto) * 100) / 100, gris: media.gris, luminancia: media.luminancia, piezas })
      console.log(
        `y=${String(logrado).padStart(6)} (pantalla ${(logrado / perfil.alto).toFixed(2)}) · gris ${media.gris.toFixed(1).padStart(6)} · luminancia ${media.luminancia.toFixed(4)} · ` +
          `${piezas.length} piezas móviles${piezas.length === 0 ? '' : `: ${piezas.map((x) => `#${x.id} ${x.etiqueta} α${x.opacidad.toFixed(2)} ×${x.escala.toFixed(3)}${x.medios > 0 ? ` (${x.medios} medios)` : ''}`).join(' · ')}`}`,
      )
    }
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
  jsonPendiente('referencia-salida', {
    origen: ORIGEN_DE_LA_REFERENCIA,
    perfil: perfil.id,
    ventana: { desde: DESDE, hasta: HASTA, paso: PASO },
    procedencia:
      'la costura entre la pantalla 12 (velada, luminancia 0,0366) y la 13 (sin-canvas, vista media 0,74) de docs/rediseno/outputs/b8/a-referencia.json, con una pantalla a cada lado',
    filas,
  })
  for (const e of mudarPendientes()) console.log(`escrito: ${e}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
