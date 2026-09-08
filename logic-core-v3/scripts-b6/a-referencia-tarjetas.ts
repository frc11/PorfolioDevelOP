/**
 * LA REFERENCIA, SEGUNDA MIRADA — sus paneles oscuros CHICOS. Complemento de
 * `a-referencia.ts` para la PARADA 1 (a).
 *
 *     npx tsx scripts-b6/a-referencia-tarjetas.ts [--y=1800]
 *
 * El perfil pantalla por pantalla inventarió paneles de un quinto del viewport
 * para arriba y no encontró ninguno oscuro translúcido con texto: sus secciones
 * oscuras son el canvas desnudo. Pero la captura de la pantalla 2 muestra
 * tarjetas de cifras con un fondo oscuro translúcido de ~190×300 px, y ésas SÍ
 * son «un panel oscuro con texto encima de la escena»: lo que la instrucción
 * pide medir. Acá se inventarían por propiedades computadas (alfa < 1 o
 * desenfoque, en cuadro, de medio por ciento del viewport para arriba), y para
 * CADA una se mide cuánta escena atraviesa su superficie sola (var con la
 * tarjeta / var de la sala desnuda, en su rectángulo) y el contraste bajo el
 * glifo de su texto. Una navegación más, declarada: la primera no podía
 * verlas por su umbral de tamaño.
 */

import { copyFileSync, mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'

import { CARPETA_DE_CAPTURAS, PERFIL, PUENTE_DE_AUTOMATIZACION, TEMP, asegurarCarpetas, conLaPagina, guardarJson } from './b6-comun'
import { evaluarLaPosicion, type LecturaDeBloque } from './c-bloques'
import { estadisticaDeLuminancia, leerImagen } from './glifo-alfa'
import { APAGAR_LA_TINTA, LECTOR_DE_BLOQUES_EN, type Bloque, type TintaApagada } from './lectores'
import { OCULTAR_NODOS, OCULTAR_TODO_MENOS, OCULTAR_TODO_MENOS_INFORMANDO, type Ocultamiento } from './ocultar'

const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'
const CANVASES = `[...document.querySelectorAll('canvas')].filter((c) => { const r = c.getBoundingClientRect(); return r.width * r.height >= 0.25 * innerWidth * innerHeight })`
const ATRIBUTO = 'data-b6-tarjeta'

const argumento = (nombre: string, defecto: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}
const Y = Number(argumento('y', '1800'))

interface Tarjeta {
  readonly i: number
  readonly etiqueta: string
  readonly alfa: number
  readonly luminanciaDelFondo: number
  readonly backdrop: string
  readonly rect: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly caracteres: number
}

/** Elementos en cuadro con alfa en (0,1) o desenfoque, de medio por ciento del viewport para arriba, sin anidar. */
const INVENTARIO_DE_TARJETAS = `(() => {
  const salida = []
  let i = 0
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    const m = cs.backgroundColor.match(/[\\d.]+/g)
    if (m === null) continue
    const alfa = m.length > 3 ? Number(m[3]) : 1
    const translucido = (alfa > 0 && alfa < 1) || cs.backdropFilter !== 'none'
    if (!translucido) continue
    // Un overlay escondido (su menú, su cargador) también es translúcido: no se mide lo que no se ve.
    if (cs.visibility !== 'visible' || Number(cs.opacity) === 0 || cs.display === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width * r.height < 0.005 * innerWidth * innerHeight) continue
    if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue
    if (el.closest('[${ATRIBUTO}]') !== null && el.closest('[${ATRIBUTO}]') !== el) continue
    el.setAttribute('${ATRIBUTO}', String(i))
    const lum = (0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2])) / 255
    salida.push({ i, etiqueta: el.tagName.toLowerCase(), alfa, luminanciaDelFondo: lum, backdrop: cs.backdropFilter, rect: { x: r.left, y: r.top, ancho: r.width, alto: r.height }, caracteres: (el.innerText || '').trim().length })
    i += 1
  }
  return salida
})()`

async function principal(): Promise<void> {
  asegurarCarpetas()
  const salida = await conLaPagina(
    PERFIL,
    '/',
    async ({ pagina, perfil }) => {
      await esperarElPrimerCuadro(pagina)
      await new Promise((r) => setTimeout(r, 4000))
      // Su scroller tarda en tomar el primer salto: se insiste, verificando, hasta cinco veces.
      let logrado = -1
      for (let intento = 0; intento < 5 && Math.abs(logrado - Y) > 2; intento += 1) {
        await scrollA(pagina, Y)
        await new Promise((r) => setTimeout(r, 700))
        logrado = await medir<number>(pagina, 'window.scrollY')
      }
      await esperarElPrimerCuadro(pagina)
      if (Math.abs(logrado - Y) > 2) throw new Error(`el scroll quedó en ${logrado} después de cinco intentos`)
      const tarjetas = await medir<Tarjeta[]>(pagina, INVENTARIO_DE_TARJETAS)
      console.log(`y=${Y}: ${tarjetas.length} paneles translúcidos en cuadro`)
      for (const t of tarjetas) {
        console.log(`    #${t.i} <${t.etiqueta}> ${Math.round(t.rect.ancho)}×${Math.round(t.rect.alto)} en (${Math.round(t.rect.x)}, ${Math.round(t.rect.y)}) · ${t.alfa}@${t.luminanciaDelFondo.toFixed(3)} · ${t.backdrop} · ${t.caracteres} caracteres`)
      }
      const leidos = await medir<Bloque[]>(pagina, LECTOR_DE_BLOQUES_EN('[document.body]'))
      const base = `${TEMP}/referencia-tarjetas-${Y}`
      const rutas = { C: `${base}-C.png`, A: `${base}-A.png`, T: `${base}-T.png`, S: `${base}-S.png`, V: `${base}-A.png` }
      await capturar(pagina, rutas.C)
      const apagada = await medir<TintaApagada>(pagina, APAGAR_LA_TINTA(true))
      const rebeldes = new Set(apagada.rebeldes.map((r) => r.n))
      const bloques = leidos.filter((b) => !rebeldes.has(b.n))
      await capturar(pagina, rutas.A)
      await medir(pagina, APAGAR_LA_TINTA(false))
      if (!(await medir<boolean>(pagina, OCULTAR_NODOS(CANVASES, true)))) throw new Error('los canvas no quedaron ocultos')
      await capturar(pagina, rutas.T)
      await medir(pagina, OCULTAR_NODOS(CANVASES, false))
      const soloCanvas = await medir<Ocultamiento>(pagina, OCULTAR_TODO_MENOS_INFORMANDO('[]', CANVASES, true))
      if (!soloCanvas.conservados.every((c) => c.visibility === 'visible')) throw new Error('sus canvas no quedaron solos')
      await esperarElPrimerCuadro(pagina, 300)
      await capturar(pagina, rutas.S)
      await medir(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false))
      // V por tarjeta: la tarjeta sola (sus hijos escondidos) sobre los canvas.
      const rutasV: string[] = []
      for (const t of tarjetas) {
        const raiz = `[document.querySelector('[${ATRIBUTO}="${t.i}"]')]`
        const oculto = await medir<Ocultamiento>(pagina, OCULTAR_TODO_MENOS_INFORMANDO(raiz, CANVASES, true))
        if (!oculto.conservados.every((c) => c.visibility === 'visible')) {
          throw new Error(`la tarjeta ${t.i} no quedó sola — conservados ${JSON.stringify(oculto.conservados)}, ${oculto.marcados} marcados, rebeldes ${JSON.stringify(oculto.rebeldes.slice(0, 5))}`)
        }
        await esperarElPrimerCuadro(pagina, 300)
        const ruta = `${base}-V${t.i}.png`
        await capturar(pagina, ruta)
        await medir(pagina, OCULTAR_TODO_MENOS('[]', CANVASES, false))
        rutasV.push(ruta)
      }
      const viewport = { x: 0, y: 0, ancho: perfil.ancho, alto: perfil.alto }
      const A = leerImagen(rutas.A)
      const S = leerImagen(rutas.S)
      const lectura = evaluarLaPosicion({ C: leerImagen(rutas.C), A, T: leerImagen(rutas.T), S, V: A }, bloques, viewport, Y, rutas)
      const porTarjeta = tarjetas.map((t, k) => {
        const V = leerImagen(rutasV[k])
        const region = { x0: Math.max(0, Math.floor(t.rect.x)), y0: Math.max(0, Math.floor(t.rect.y)), x1: Math.min(perfil.ancho, Math.ceil(t.rect.x + t.rect.ancho)), y1: Math.min(perfil.alto, Math.ceil(t.rect.y + t.rect.alto)) }
        const sala = estadisticaDeLuminancia(S, region)
        const sola = estadisticaDeLuminancia(V, region)
        const adentro = (b: LecturaDeBloque): boolean => {
          const caja = bloques.find((x) => `${x.etiqueta}|${x.pieza ?? ''}|${x.nivel ?? ''}|${x.texto}` === b.clave)?.cajas[0]
          return caja !== undefined && caja.x >= t.rect.x - 1 && caja.y >= t.rect.y - 1 && caja.x + caja.ancho <= t.rect.x + t.rect.ancho + 1 && caja.y + caja.alto <= t.rect.y + t.rect.alto + 1
        }
        const texto = lectura.bloques.filter(adentro)
        const plenas = texto.map((b) => b.peorAPlena)
        const medianas = texto.map((b) => b.medianaContraste).sort((a, b) => a - b)
        return {
          ...t,
          sala,
          sola,
          pasaLuminancia: sala.varianza > 1e-9 ? sola.varianza / sala.varianza : Number.NaN,
          pasaGris: sala.grisDesvio > 1e-6 ? sola.grisDesvio / sala.grisDesvio : Number.NaN,
          bloques: texto.length,
          peorPlena: plenas.length === 0 ? Number.NaN : Math.min(...plenas),
          medianaDeMedianas: medianas.length === 0 ? Number.NaN : medianas[Math.floor(medianas.length / 2)],
          fallan: texto.filter((b) => !b.pasaAA).length,
        }
      })
      return { y: Y, tarjetas: porTarjeta, pantalla: lectura, capturas: { ...rutas, V: rutasV } }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION], origen: ORIGEN_DE_LA_REFERENCIA, msMaximo: 90_000 },
  )
  const pct = (v: number): string => (Number.isNaN(v) ? '  —  ' : `${(v * 100).toFixed(1).padStart(5)}%`)
  console.log('  tarjeta  tamaño       fondo (alfa@lum, backdrop)          sala media   con tarjeta   pasa lum · gris   texto  peor plena  mediana  fallan')
  for (const t of salida.tarjetas) {
    console.log(
      `  #${String(t.i).padEnd(3)} <${t.etiqueta}> ${String(Math.round(t.rect.ancho)).padStart(4)}×${String(Math.round(t.rect.alto)).padEnd(4)}  ${`${t.alfa}@${t.luminanciaDelFondo.toFixed(3)} ${t.backdrop}`.padEnd(34)}  ${t.sala.media.toFixed(3)}        ${t.sola.media.toFixed(3)}        ${pct(t.pasaLuminancia)} · ${pct(t.pasaGris)}   ${String(t.bloques).padStart(3)}    ${Number.isNaN(t.peorPlena) ? '  —  ' : t.peorPlena.toFixed(2).padStart(5)}      ${Number.isNaN(t.medianaDeMedianas) ? '  —  ' : t.medianaDeMedianas.toFixed(2)}    ${t.fallan}`,
    )
  }
  console.log(`  fuera de las tarjetas (toda la pantalla): ${salida.pantalla.bloques.length} bloques · sala ${salida.pantalla.escena.sinPanel.media.toFixed(3)} · pasa ${pct(salida.pantalla.escena.varianzaConContenido)} lum`)
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  copyFileSync(salida.capturas.C, `${CARPETA_DE_CAPTURAS}/referencia-tarjetas-y${Y}-C.png`)
  copyFileSync(salida.capturas.S, `${CARPETA_DE_CAPTURAS}/referencia-tarjetas-y${Y}-S.png`)
  console.log(`  ${guardarJson('a-referencia-tarjetas', salida)} · ${salida.tarjetas.length} tarjetas`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
