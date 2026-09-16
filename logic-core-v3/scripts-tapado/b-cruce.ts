/**
 * TAPADO-1 · B — EL CRUCE A LO LARGO DEL SCROLL, sección por sección, a 390.
 *
 *     npx tsx scripts-tapado/b-cruce.ts --etiqueta=hoy --pasos=41
 *     npx tsx scripts-tapado/b-cruce.ts --etiqueta=centrado --composicion=centrado --pasos=41
 *
 * ── Qué contesta, y por qué no lo contestaba nadie ────────────────────────
 *
 * Todo lo que este repo midió del logo contra el texto se midió **en un
 * keyframe**: siete progresos, siete fotos. Eso es la foto, no la película. El
 * logo se mueve con la cámara —su centro recorre de 59,8 a 282,9 px a 390— y el
 * texto de cada sección entra y sale de pantalla con el scroll. La pregunta que
 * decide una composición no es *«¿alguna vez se cruzan?»* sino **«¿se cruzan
 * mientras esa sección está en pantalla y su texto se puede leer?»**.
 *
 * Este script barre el scroll de 0 a 1 en pasos finos y, en cada parada, mide
 * las ocho secciones a la vez. Por sección publica:
 *
 *   · el tramo de scroll en que su texto está en pantalla;
 *   · dentro de ese tramo, dónde cae la masa negra del logo;
 *   · la superposición **a lo largo del tramo** —mediana, peor parada y cuántas
 *     paradas pasan de cada umbral—, no en un punto;
 *   · **cuánto dura el cruce, en PANTALLAS de scroll**.
 *
 * ── ⚠️ ESTE SCRIPT MIDE Y NO TOCA ────────────────────────────────────────
 *
 * Las otras siete secciones son insumo: se miden para que exista la tabla, y
 * ninguna se mueve en este sprint.
 *
 * ── ⚠️ LA MISMA REGLA DEL BANCO: TRES CAPAS POR PARADA ───────────────────
 *
 * En cada parada se capturan las dos capas separadas (texto sin escena, escena
 * sola) por el motivo de `mascaras.ts`: las dos tintas son el mismo negro y una
 * resta las confunde justo donde el defecto ocurre.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import { progresoDelScroll } from '@/app/v3/_lib/escena/recorrido'
import { cruzar, leer, type Rect } from './mascaras'
import { mascaraDelLogo } from './logo-analitico'
import {
  ASENTAMIENTO_MS,
  COMPOSICION_CENTRADA,
  HOJA_DE_CAPAS,
  PONER_CAPA,
  RAIZ_DE_SALIDAS,
  SIN_LA_ESCENA,
  SOLO_LA_ESCENA,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  conChrome,
  cuatro,
  dos,
  enLaVentana,
  type EstadoDeCapas,
  type Ventana,
} from './tapado-comun'

/**
 * EL LECTOR DE LAS OCHO. Una sección es un `[data-panel]`; su texto son los
 * elementos que **dibujan glifos**, no sus envoltorios: por eso se filtra a los
 * que tienen texto propio y caja no vacía.
 */
const LECTOR_DE_SECCIONES = `(() => {
  const vh = window.innerHeight
  const propio = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0)
  return [...document.querySelectorAll('[data-panel]')].map((sec) => {
    const caja = sec.getBoundingClientRect()
    const piezas = [...sec.querySelectorAll('*')]
      .filter(propio)
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh)
      .map((r) => ({ x: r.x, y: r.y, ancho: r.width, alto: r.height }))
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const r of piezas) {
      x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y)
      x1 = Math.max(x1, r.x + r.ancho); y1 = Math.max(y1, r.y + r.alto)
    }
    return {
      id: sec.getAttribute('data-panel'),
      superficie: sec.getAttribute('data-superficie'),
      seccion: { x: caja.x, y: caja.y, ancho: caja.width, alto: caja.height },
      piezas,
      union: Number.isFinite(x0) ? { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 } : null,
    }
  })
})()`

interface CajaLeida {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

interface SeccionLeida {
  readonly id: string
  readonly superficie: string | null
  readonly seccion: CajaLeida
  readonly piezas: readonly CajaLeida[]
  readonly union: CajaLeida | null
}

interface Parada {
  readonly t: number
  readonly scrollY: number
  readonly pantalla: number
  readonly secciones: readonly {
    readonly id: string
    readonly enPantalla: boolean
    readonly glifos: number
    readonly sobreElLogo: number
    readonly fraccion: number
    readonly bajoAA: number
    readonly union: CajaLeida | null
  }[]
  readonly bandaDelLogo: { readonly desde: number; readonly hasta: number } | null
  /** El progreso del recorrido en esta parada, con la funcion de produccion. */
  readonly progreso: number
  readonly centroDelLogoPx: number
  readonly pixelesDeLogo: number
}

async function unaParada(
  pagina: Pagina,
  v: Ventana,
  etiqueta: string,
  t: number,
  maximo: number,
  extension: { readonly arriba: number; readonly abajo: number },
): Promise<Parada> {
  const y = Math.round(t * maximo)
  const scrollY = await scrollA(pagina, y)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 420)); return true })()`)
  const secciones = await medir<readonly SeccionLeida[]>(pagina, LECTOR_DE_SECCIONES)

  const c = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
  if (c.escena !== 'hidden') throw new Error(`t=${t}: la capa C no tomo — escena «${c.escena}»`)
  const cRuta = path.join(TEMP, `${etiqueta}-cruce-c.png`)
  await capturar(pagina, cRuta)

  const d = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (d.escena !== 'visible') throw new Error(`t=${t}: la capa D no tomo — escena «${d.escena}»`)
  const dRuta = path.join(TEMP, `${etiqueta}-cruce-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))

  const C = leer(cRuta)
  const D = leer(dRuta)

  /**
   * ⚠️ LA MÁSCARA DEL LOGO SALE DEL INSTRUMENTO ANALÍTICO, con el progreso que
   * la página tiene en esta parada — calculado con `progresoDelScroll`, LA MISMA
   * función que corre en producción, alimentada con la extensión de las
   * secciones leída del DOM. El porqué está en `logo-analitico.ts`.
   */
  const progreso = progresoDelScroll(scrollY, extension.arriba, extension.abajo, v.alto)
  const logo = mascaraDelLogo(progreso, v.ancho, v.alto)

  const medidas = secciones.map((s) => {
    let glifos = 0
    let sobreElLogo = 0
    let bajoAA = 0
    for (const p of s.piezas) {
      const r: Rect = { x: p.x, y: Math.max(0, p.y), ancho: p.ancho, alto: Math.min(p.alto, v.alto - Math.max(0, p.y)) }
      if (r.ancho <= 0 || r.alto <= 0) continue
      const x = cruzar(C, D, r, logo.bits)
      glifos += x.glifos
      sobreElLogo += x.sobreElLogo
      bajoAA += Number.isNaN(x.fraccionBajoAA) ? 0 : Math.round(x.fraccionBajoAA * x.glifos)
    }
    return {
      id: s.id,
      enPantalla: glifos > 0,
      glifos,
      sobreElLogo,
      fraccion: glifos === 0 ? 0 : sobreElLogo / glifos,
      bajoAA: glifos === 0 ? 0 : bajoAA / glifos,
      union: s.union,
    }
  })

  return {
    t,
    scrollY,
    pantalla: scrollY / v.alto,
    progreso,
    secciones: medidas,
    bandaDelLogo: logo.banda,
    centroDelLogoPx: logo.centroXPx,
    pixelesDeLogo: logo.celdas,
  }
}

async function main(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  const pasos = Number.parseInt(argumento('pasos', '41'), 10)
  const anchoPedido = argumento('ancho', '390')
  const v = VENTANAS.find((w) => String(w.ancho) === anchoPedido)
  if (v === undefined) throw new Error(`no hay ventana declarada para --ancho=${anchoPedido}`)
  /**
   * `--composicion=centrado` reproduce el estado ANTERIOR del hero con una regla
   * en vez de revertir el archivo: mismo árbol, mismo bundle, una sola variable.
   */
  const composicion = argumento('composicion', 'hoy')
  if (composicion !== 'hoy' && composicion !== 'centrado') {
    throw new Error(`--composicion admite «hoy» o «centrado», llego «${composicion}»`)
  }

  const corrida = await conChrome(`tapado-cruce-${v.ancho}`, async (chrome) =>
    enLaVentana(
      chrome,
      v,
      async ({ pagina }) => {
        if (composicion === 'centrado') {
          const puesta = await medir<boolean>(
            pagina,
            `(async () => {
              const hoja = document.createElement('style')
              hoja.id = ${JSON.stringify(`${HOJA_DE_CAPAS}-composicion`)}
              hoja.textContent = ${JSON.stringify(COMPOSICION_CENTRADA)}
              document.head.appendChild(hoja)
              await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
              const el = document.querySelector('[data-pantalla="hero"]')
              return el !== null && getComputedStyle(el).justifyContent === 'center'
            })()`,
          )
          if (!puesta) throw new Error('la composicion «centrado» no tomo: el hero no quedo en justify-content:center')
        }
        const maximo = await medir<number>(pagina, 'document.documentElement.scrollHeight - window.innerHeight')
        /**
         * La extension de las ocho, leida del DOM igual que `medirLasSecciones`
         * la lee en produccion: es lo que `progresoDelScroll` necesita.
         */
        const extension = await medir<{ arriba: number; abajo: number }>(
          pagina,
          `(() => {
            const nodos = [...document.querySelectorAll('[data-panel]')]
            let arriba = Infinity
            let abajo = -Infinity
            for (const n of nodos) {
              const c = n.getBoundingClientRect()
              arriba = Math.min(arriba, c.top + window.scrollY)
              abajo = Math.max(abajo, c.bottom + window.scrollY)
            }
            return { arriba, abajo }
          })()`,
        )
        const paradas: Parada[] = []
        for (let i = 0; i < pasos; i += 1) {
          const t = i / (pasos - 1)
          const p = await unaParada(pagina, v, etiqueta, t, maximo, extension)
          const activas = p.secciones.filter((s) => s.enPantalla)
          console.log(
            `  t=${t.toFixed(3)} y=${String(p.scrollY).padStart(6)} (${p.pantalla.toFixed(2)} pant · progreso ${p.progreso.toFixed(3)}) · ` +
              activas.map((s) => `${s.id} ${(s.fraccion * 100).toFixed(0)}%`).join(' · '),
          )
          paradas.push(p)
        }
        return { maximo, extension, paradas }
      },
      { asentamientoMs: ASENTAMIENTO_MS },
    ),
  )

  // ── El resumen por sección: el tramo, la duración en pantallas y el cruce ──
  const ids = [...new Set(corrida.paradas.flatMap((p) => p.secciones.map((s) => s.id)))]
  const resumen = ids.map((id) => {
    const filas = corrida.paradas.map((p) => ({ t: p.t, y: p.scrollY, s: p.secciones.find((x) => x.id === id) }))
    const enPantalla = filas.filter((f) => f.s !== undefined && f.s.enPantalla)
    if (enPantalla.length === 0) {
      return { id, enPantallaDesde: null, enPantallaHasta: null, pantallasDeTramo: 0, paradas: 0 }
    }
    const desde = enPantalla[0]
    const hasta = enPantalla[enPantalla.length - 1]
    const fracciones = enPantalla.map((f) => f.s!.fraccion).sort((a, b) => a - b)
    const cruzan = enPantalla.filter((f) => f.s!.fraccion > 0.05)
    const pantallasDeCruce =
      cruzan.length === 0 ? 0 : (cruzan[cruzan.length - 1].y - cruzan[0].y) / VENTANAS.find((w) => w.ancho === v.ancho)!.alto
    return {
      id,
      enPantallaDesde: cuatro(desde.t),
      enPantallaHasta: cuatro(hasta.t),
      pantallasDeTramo: dos((hasta.y - desde.y) / v.alto),
      paradas: enPantalla.length,
      superposicionMediana: cuatro(fracciones[Math.floor(fracciones.length / 2)]),
      superposicionPeor: cuatro(fracciones[fracciones.length - 1]),
      peorEn: cuatro(enPantalla.reduce((a, b) => (b.s!.fraccion > a.s!.fraccion ? b : a)).t),
      paradasSobre5: cruzan.length,
      paradasSobre20: enPantalla.filter((f) => f.s!.fraccion > 0.2).length,
      pantallasDeCruce: dos(pantallasDeCruce),
      bajoAAMediano: cuatro(
        enPantalla.map((f) => f.s!.bajoAA).sort((a, b) => a - b)[Math.floor(enPantalla.length / 2)],
      ),
    }
  })

  console.log('\n  RESUMEN — el cruce a lo largo del tramo\n')
  console.log('  seccion             tramo t        pantallas   mediana   peor (en t)   >5%  >20%   cruce en pantallas')
  for (const r of resumen) {
    if (r.enPantallaDesde === null) continue
    console.log(
      `  ${r.id.padEnd(18)} ${r.enPantallaDesde.toFixed(3)}..${r.enPantallaHasta!.toFixed(3)}   ${String(r.pantallasDeTramo).padStart(6)}   ` +
        `${((r.superposicionMediana ?? 0) * 100).toFixed(1).padStart(6)} %  ${((r.superposicionPeor ?? 0) * 100).toFixed(1).padStart(6)} % (${r.peorEn?.toFixed(3)})  ` +
        `${String(r.paradasSobre5).padStart(3)}  ${String(r.paradasSobre20).padStart(4)}   ${String(r.pantallasDeCruce).padStart(6)}`,
    )
  }

  const salida = {
    etiqueta,
    composicion,
    ventana: v,
    pasos,
    cuando: new Date().toISOString(),
    instrumento: 'scripts-tapado/b-cruce.ts — barrido de scroll con dos capas por parada',
    maximo: corrida.maximo,
    extensionDeLasSecciones: corrida.extension,
    resumen,
    paradas: corrida.paradas,
  }
  writeFileSync(path.join(RAIZ_DE_SALIDAS, `b-cruce-${etiqueta}-${v.ancho}.json`), `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, `b-cruce-${etiqueta}-${v.ancho}.json`)}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
