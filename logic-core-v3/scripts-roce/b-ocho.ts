/**
 * ROCE-1 · B — LOS OCHO ANCHOS, ANTES Y DESPUÉS, EN LA MISMA CARGA.
 *
 *     npx tsx scripts-roce/b-ocho.ts --etiqueta=cierre
 *
 * ── Por qué el «antes» se reproduce con una regla y no revirtiendo el archivo ─
 *
 * Es el método que TAPADO-1 (`COMPOSICION_CENTRADA`) y COMPO-2 (`UN_RENGLON`)
 * ya usan: **el mismo árbol, el mismo bundle, el mismo chunk de la escena y UNA
 * sola variable cambiada** es la única condición bajo la cual una diferencia se
 * puede atribuir. Revertir el archivo y volver a construir cambiaría además la
 * carga, y la escena no sale idéntica de dos cargas: COMPO-2 midió el mismo
 * «hoy» en 4,12 · 4,33 · 4,34 %.
 *
 * ── ⚠️ LA REGLA DEL «ANTES» REPONE LAS TRES BANDAS, NO UNA ───────────────
 *
 * Lo que este sprint cambia es UN término de la banda 768–859 de
 * `claseDelAireDelPieEnPortatil`. Una regla sin media query pondría ese margen
 * también en 320, 375, 390 y 425 —donde la clase no aplica— y movería anchos que
 * el «antes» tiene que dejar quietos: el resultado ya no sería el antes, sería
 * otro estado. Por eso la regla repone la CASCADA ENTERA con los tres cortes
 * declarados del tema, y en los siete anchos que no son 768 su efecto tiene que
 * ser **cero medido** — que es una comprobación y no un supuesto.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { progresoDelScroll } from '@/app/v3/_lib/escena/recorrido'

import { capturar } from '../scripts-b4/captura'
import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import { mascaraDelLogo, type MascaraDelLogo } from '../scripts-tapado/logo-analitico'
import { bandasDeMasa, cruzar, leer, type Rect } from '../scripts-tapado/mascaras'
import {
  ASENTAMIENTO_MS,
  PONER_CAPA,
  SIN_LA_ESCENA,
  SOLO_LA_ESCENA,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  conChrome,
  enLaVentana,
  type EstadoDeCapas,
  type Ventana,
} from '../scripts-tapado/tapado-comun'
import { LECTOR, PONER_CONFIGURACION, type Caja, type Lectura, cuatro, dos } from '../scripts-compo2/compo2-comun'
import { CARPETA_DE_CAPTURAS, RAIZ_DE_SALIDAS, SEL_GRILLA } from './roce-comun'

/**
 * EL «ANTES»: el valor de COMPO-2 para la banda de 768, con las otras dos bandas
 * repuestas tal cual para que la cascada sea la misma. Los tres cortes son los
 * del tema (`--breakpoint-tablet` 768, `--breakpoint-medio` 860,
 * `--breakpoint-escritorio` 1025) y el `max-width` del primero no hace falta:
 * los siguientes lo pisan, igual que las variantes `min-width` de Tailwind.
 */
const ANTES_DE_ROCE_1 =
  `@media (min-width:768px){${SEL_GRILLA}{margin-bottom:calc(var(--text-base)*var(--leading-texto))!important}}` +
  `@media (min-width:860px){${SEL_GRILLA}{margin-bottom:var(--spacing-4)!important}}` +
  `@media (min-width:1025px){${SEL_GRILLA}{margin-bottom:0px!important}}`

const SIN_EL_TEXTO_DEL_HERO =
  '[data-pantalla="hero"] h1,[data-pantalla="hero"] h1 *,' +
  '[data-pantalla="hero"] [data-nivel="cuerpo"],[data-pantalla="hero"] [data-nivel="cuerpo"] *,' +
  '[data-pantalla="hero"] [data-nivel="base"],[data-pantalla="hero"] [data-nivel="base"] *,' +
  '[data-pantalla="hero"] [data-pieza="logotipo"],[data-pantalla="hero"] [data-pieza="isotipo"],' +
  '[data-pantalla="hero"] a,[data-pantalla="hero"] a *{visibility:hidden!important}'

const LECTOR_DEL_PIE = `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const grilla = pantalla.firstElementChild
  return {
    rellenoAbajo: parseFloat(getComputedStyle(pantalla).paddingBottom),
    margenDeLaGrilla: grilla === null ? 0 : parseFloat(getComputedStyle(grilla).marginBottom),
  }
})()`

interface Pie {
  readonly rellenoAbajo: number
  readonly margenDeLaGrilla: number
}

interface Cruces {
  readonly glifos: number
  /** La máscara por LUMINANCIA: todo lo bien oscuro de la escena. «¿Se lee?». */
  readonly sobreLaEscena: number
  /** La máscara ANALÍTICA: sólo la silueta del logo. «¿Roza el logo?». */
  readonly sobreElLogo: number
  readonly detrasDelTexto: number
  readonly tintaBajoAA: number
  readonly contrasteMediano: number
}

function medirCaja(
  caja: Caja | null,
  C: ReturnType<typeof leer>,
  D: ReturnType<typeof leer>,
  E: ReturnType<typeof leer>,
  L: MascaraDelLogo,
): Cruces | null {
  if (caja === null || caja.ancho <= 0 || caja.alto <= 0) return null
  const r: Rect = { x: caja.x, y: caja.y, ancho: caja.ancho, alto: caja.alto }
  const x = cruzar(C, D, r)
  const l = cruzar(C, D, r, L.bits)
  const d = cruzar(C, E, r)
  return {
    glifos: x.glifos,
    sobreLaEscena: cuatro(x.fraccionDeTinta),
    sobreElLogo: cuatro(l.fraccionDeTinta),
    detrasDelTexto: cuatro(d.fraccionDeTinta),
    tintaBajoAA: cuatro(x.fraccionBajoAA),
    contrasteMediano: dos(d.contrasteMediano),
  }
}

async function medirVentana(
  pagina: Pagina,
  v: Ventana,
  etiqueta: string,
  copias: { desde: string; hasta: string }[],
): Promise<Record<string, unknown>> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, '(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()')

  const soloEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (soloEscena.escena !== 'visible' || soloEscena.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa D no tomo`)
  }
  const dRuta = path.join(TEMP, `roce8-${etiqueta}-${v.ancho}-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const D = leer(dRuta)

  const sinTexto = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_EL_TEXTO_DEL_HERO))
  if (sinTexto.escena !== 'visible' || sinTexto.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa E no tomo`)
  }
  const eRuta = path.join(TEMP, `roce8-${etiqueta}-${v.ancho}-e.png`)
  await capturar(pagina, eRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const E = leer(eRuta)

  const extension = await medir<{ readonly arriba: number; readonly abajo: number }>(
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
  const scrollDeReposo = await medir<number>(pagina, 'window.scrollY')
  const progreso = progresoDelScroll(scrollDeReposo, extension.arriba, extension.abajo, v.alto)
  const L = mascaraDelLogo(progreso, v.ancho, v.alto)
  if (L.celdas === 0) throw new Error(`a ${v.ancho}: la mascara analitica del logo salio vacia`)

  const configuraciones = [
    { clave: 'despues', que: 'el arbol como queda tras ROCE-1', regla: '', captura: true },
    { clave: 'antes', que: 'el valor de COMPO-2 repuesto con la cascada de tres bandas', regla: ANTES_DE_ROCE_1, captura: false },
  ] as const

  const filas: Record<string, unknown>[] = []
  for (const c of configuraciones) {
    await medir<boolean>(pagina, PONER_CONFIGURACION(c.regla))
    const l = await medir<Lectura | null>(pagina, LECTOR)
    if (l === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero en «${c.clave}»`)
    const pie = await medir<Pie | null>(pagina, LECTOR_DEL_PIE)
    if (pie === null) throw new Error(`a ${v.ancho}: el lector del pie fallo en «${c.clave}»`)

    if (c.captura) {
      const aRuta = path.join(TEMP, `roce8-${etiqueta}-${v.ancho}-a.png`)
      await capturar(pagina, aRuta)
      copias.push({ desde: aRuta, hasta: path.join(CARPETA_DE_CAPTURAS, `${etiqueta}-${v.ancho}x${v.alto}.png`) })
    }

    const sinEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
    if (sinEscena.escena !== 'hidden' || sinEscena.titular !== 'visible') {
      throw new Error(`a ${v.ancho}: la capa C no tomo en «${c.clave}»`)
    }
    const cRuta = path.join(TEMP, `roce8-${etiqueta}-${v.ancho}-${c.clave}-c.png`)
    await capturar(pagina, cRuta)
    await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
    const C = leer(cRuta)

    const pieza = (clave: string): Caja | null => l.piezas.find((p) => p.clave === clave)?.caja ?? null
    const bandas =
      pieza('titular') === null
        ? []
        : bandasDeMasa(D, pieza('titular')!.x, pieza('titular')!.x + pieza('titular')!.ancho).map((b) => ({
            desde: b.desde,
            hasta: b.hasta,
            alto: b.hasta - b.desde + 1,
          }))
    filas.push({
      clave: c.clave,
      que: c.que,
      justificado: l.justificado,
      rellenoAbajo: dos(pie.rellenoAbajo),
      margenDeLaGrilla: dos(pie.margenDeLaGrilla),
      pastillaVisible: l.pastillaVisible,
      ventana: l.ventana,
      columna:
        l.columna === null
          ? null
          : { arriba: dos(l.columna.y), abajo: dos(l.columna.y + l.columna.alto), alto: dos(l.columna.alto) },
      aireBajoElBloque: dos(l.ventana.alto - (l.columna === null ? 0 : l.columna.y + l.columna.alto)),
      fraccionDelViewport: dos(((l.columna?.alto ?? 0) / l.ventana.alto) * 100),
      desborda: l.columna !== null && l.columna.y + l.columna.alto > l.ventana.alto + 0.01,
      piezas: l.piezas
        .filter((p) => p.caja !== null && p.caja.alto > 0.5)
        .map((p) => ({
          clave: p.clave,
          fontSize: dos(p.fontSize),
          renglones: p.renglones?.cantidad ?? 0,
          caja: { x: dos(p.caja!.x), y: dos(p.caja!.y), ancho: dos(p.caja!.ancho), alto: dos(p.caja!.alto) },
        })),
      bandasDeMasaEnLaColumna: bandas,
      cruces: {
        titular: medirCaja(pieza('titular'), C, D, E, L),
        registro1: medirCaja(pieza('registro1'), C, D, E, L),
        registro2: medirCaja(pieza('registro2'), C, D, E, L),
        bajada: medirCaja(pieza('bajada'), C, D, E, L),
        cta: medirCaja(pieza('cta'), C, D, E, L),
        columna: medirCaja(l.columna, C, D, E, L),
      },
    })
    const t = filas[filas.length - 1].cruces as { titular: Cruces | null }
    const pct = (x: number | undefined): string => `${((x ?? Number.NaN) * 100).toFixed(2).padStart(6)} %`
    console.log(
      `    ${c.clave.padEnd(8)} pie ${String(dos(pie.rellenoAbajo)).padStart(5)}+${String(dos(pie.margenDeLaGrilla)).padStart(5)}` +
        `  titular: LOGO ${pct(t.titular?.sobreElLogo)} · escena ${pct(t.titular?.sobreLaEscena)} · detras ${pct(t.titular?.detrasDelTexto)}` +
        `  columna ${String(filas[filas.length - 1].columna === null ? 'n/d' : (filas[filas.length - 1].columna as { arriba: number; abajo: number }).arriba).padStart(7)}` +
        ` → ${String(filas[filas.length - 1].columna === null ? 'n/d' : (filas[filas.length - 1].columna as { arriba: number; abajo: number }).abajo).padStart(7)}` +
        `  aire ${String(filas[filas.length - 1].aireBajoElBloque).padStart(6)}`,
    )
  }
  await medir<boolean>(pagina, PONER_CONFIGURACION(''))

  return {
    ancho: v.ancho,
    alto: v.alto,
    procedencia: v.procedencia,
    logoAnalitico: { progreso: cuatro(progreso), banda: L.banda, celdas: L.celdas, centroXPx: dos(L.centroXPx) },
    configuraciones: filas,
  }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'cierre')
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => soloAncho.split(',').includes(String(v.ancho)))
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const filas: unknown[] = []
  const copias: { desde: string; hasta: string }[] = []
  for (const v of ventanas) {
    console.log(`\n  ${v.ancho}x${v.alto}`)
    filas.push(
      await conChrome(`roce8-${v.ancho}`, async (chrome) =>
        enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta, copias), {
          asentamientoMs: ASENTAMIENTO_MS,
        }),
      ),
    )
  }
  for (const c of copias) copyFileSync(c.desde, c.hasta)

  const ruta = path.join(RAIZ_DE_SALIDAS, `b-${etiqueta}.json`)
  writeFileSync(
    ruta,
    `${JSON.stringify(
      {
        etiqueta,
        cuando: new Date().toISOString(),
        instrumento: 'scripts-roce/b-ocho.ts — los ocho anchos, antes y despues en la misma carga, con las tres mascaras (C/D/E) y la silueta analitica del logo',
        antes: ANTES_DE_ROCE_1,
        filas,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${ruta} · ${copias.length} capturas en ${CARPETA_DE_CAPTURAS}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
