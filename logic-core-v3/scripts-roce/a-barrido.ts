/**
 * ROCE-1 · A — EL BARRIDO DEL CORRIMIENTO VERTICAL DEL BLOQUE.
 *
 *     npx tsx scripts-roce/a-barrido.ts --etiqueta=grueso --ancho=425,768 --hasta=72 --paso=8
 *     npx tsx scripts-roce/a-barrido.ts --etiqueta=fino --ancho=768 --valores=52,54,56,58
 *
 * ── Qué publica, y contra qué se lee ──────────────────────────────────────
 *
 * Una fila por corrimiento, y en cada una la superposición del titular con las
 * DOS MÁSCARAS de TAPADO-1 —C (el texto sobre fondo plano) y D (la escena sola)—
 * más la E de COMPO-2 (lo que hay detrás del texto con el resto de la página
 * puesta). La cifra del sprint es la de **D sobre el titular**: es la que la
 * instrucción cita («425 en 1,13 % y 768 en 3,18 %»).
 *
 * ⚠️ **El control va PRIMERO y en la misma carga.** La escena tiene motas
 * sueltas que no caen en el mismo píxel entre dos cargas —COMPO-2 midió el mismo
 * «hoy» en 4,12 · 4,33 · 4,34 %—, así que una fila de un barrido sólo es
 * comparable con las otras filas de ESE barrido. El control es el ancla.
 *
 * ⚠️ **Y publica el fondo del bloque contra el viewport**, que es la otra mitad
 * de la pregunta: el corrimiento que resuelve el roce no sirve si desborda.
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
import { BAJAR, CARPETA_DE_CAPTURAS, PIE_HOY_PX, RAIZ_DE_SALIDAS, corrimientoDe } from './roce-comun'

/** La máscara E, copiada literal de `scripts-compo2/a-medir.ts`. */
const SIN_EL_TEXTO_DEL_HERO =
  '[data-pantalla="hero"] h1,[data-pantalla="hero"] h1 *,' +
  '[data-pantalla="hero"] [data-nivel="cuerpo"],[data-pantalla="hero"] [data-nivel="cuerpo"] *,' +
  '[data-pantalla="hero"] [data-nivel="base"],[data-pantalla="hero"] [data-nivel="base"] *,' +
  '[data-pantalla="hero"] [data-pieza="logotipo"],[data-pantalla="hero"] [data-pieza="isotipo"],' +
  '[data-pantalla="hero"] a,[data-pantalla="hero"] a *{visibility:hidden!important}'

/** Lo que el banco necesita saber del pie ANTES de tocarlo, y para auditar después. */
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
  readonly sobreLaEscena: number
  /**
   * La misma fracción, pero contra la máscara ANALÍTICA del logo. La diferencia
   * con `sobreLaEscena` no es un refinamiento: es **otra pregunta**. El umbral
   * de luminancia cuenta como masa todo lo que está bien oscuro, y en el hero
   * eso incluye la celosía del piso y la sombra de contacto del propio logo; la
   * máscara analítica marcha rayos contra la SILUETA y sólo marca dónde hay
   * logo. «Que no roce el logo» es esta cifra; «que se lea» es la otra.
   */
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

function valoresDelBarrido(): readonly number[] {
  const crudo = argumento('valores', '')
  if (crudo !== '') {
    return crudo
      .split(',')
      .map((s) => Number.parseFloat(s.trim()))
      .filter((n) => Number.isFinite(n))
  }
  const hasta = Number.parseFloat(argumento('hasta', '72'))
  const paso = Number.parseFloat(argumento('paso', '8'))
  const lista: number[] = []
  for (let n = paso; n <= hasta + 1e-9; n += paso) lista.push(Number(n.toFixed(3)))
  return lista
}

async function medirVentana(
  pagina: Pagina,
  v: Ventana,
  etiqueta: string,
  copias: { desde: string; hasta: string }[],
): Promise<Record<string, unknown>> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, '(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()')

  const pieDeHoy = await medir<Pie | null>(pagina, LECTOR_DEL_PIE)
  if (pieDeHoy === null) throw new Error(`a ${v.ancho}: no hay [data-pantalla="hero"]`)
  if (Math.abs(pieDeHoy.rellenoAbajo - PIE_HOY_PX) > 0.01) {
    throw new Error(
      `a ${v.ancho}: el relleno de abajo mide ${pieDeHoy.rellenoAbajo} px y el banco supone ${PIE_HOY_PX}. ` +
        'La palanca de este barrido es ese relleno: con otro valor el corrimiento que publica es mentira.',
    )
  }
  const margenBase = pieDeHoy.margenDeLaGrilla

  // D — la escena sola. Una vez por ancho: ninguna regla del banco la toca.
  const soloEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (soloEscena.escena !== 'visible' || soloEscena.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa D no tomo — escena «${soloEscena.escena}», titular «${soloEscena.titular}»`)
  }
  const dRuta = path.join(TEMP, `roce-${etiqueta}-${v.ancho}-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const D = leer(dRuta)

  const sinTexto = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_EL_TEXTO_DEL_HERO))
  if (sinTexto.escena !== 'visible' || sinTexto.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa E no tomo — escena «${sinTexto.escena}», titular «${sinTexto.titular}»`)
  }
  const eRuta = path.join(TEMP, `roce-${etiqueta}-${v.ancho}-e.png`)
  await capturar(pagina, eRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const E = leer(eRuta)

  /**
   * ⚠️ LA MÁSCARA L — LA SILUETA DEL LOGO, PEDIDA AL INSTRUMENTO ANALÍTICO.
   *
   * El progreso se calcula con `progresoDelScroll`, LA MISMA función que corre
   * en producción, alimentada con la extensión de los paneles leída del DOM —
   * exactamente como `scripts-tapado/b-cruce.ts` ya lo hace. El hero en reposo
   * está en `scrollY = 0`, así que este progreso es el del primer cuadro y no
   * uno supuesto.
   *
   * ⚠ Ninguna regla de este banco toca la escena, así que la máscara se pide UNA
   * vez por ancho y vale para todas las filas del barrido: lo único que se mueve
   * es el texto.
   */
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
  if (L.celdas === 0) {
    throw new Error(`a ${v.ancho}: la mascara analitica del logo salio vacia con progreso ${progreso}`)
  }

  const base = await medir<Lectura | null>(pagina, LECTOR)
  if (base === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero`)
  const cajaDelTitular = base.piezas.find((p) => p.clave === 'titular')?.caja ?? null
  const bandas =
    cajaDelTitular === null
      ? []
      : bandasDeMasa(D, cajaDelTitular.x, cajaDelTitular.x + cajaDelTitular.ancho).map((b) => ({
          desde: b.desde,
          hasta: b.hasta,
          alto: b.hasta - b.desde + 1,
        }))

  const corrimientos = [0, ...valoresDelBarrido()]
  const filas: Record<string, unknown>[] = []
  let altoDeControl: number | null = null

  for (const n of corrimientos) {
    await medir<boolean>(pagina, PONER_CONFIGURACION(n === 0 ? '' : BAJAR(n, margenBase)))
    const l = await medir<Lectura | null>(pagina, LECTOR)
    if (l === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero con corrimiento ${n}`)
    const pie = await medir<Pie | null>(pagina, LECTOR_DEL_PIE)
    if (pie === null) throw new Error(`a ${v.ancho}: el lector del pie fallo con corrimiento ${n}`)

    /**
     * ⚠ EL CENTINELA DEL BARRIDO: esta palanca MUEVE el bloque y no lo deforma.
     * Si el alto de la columna cambia entre dos filas, el relleno dejó de
     * empujar y empezó a comprimir, y las dos filas no son comparables.
     */
    const alto = l.columna?.alto ?? 0
    if (altoDeControl === null) altoDeControl = alto
    else if (Math.abs(alto - altoDeControl) > 0.01) {
      throw new Error(
        `a ${v.ancho}, corrimiento ${n}: la columna mide ${alto} px y en el control media ${altoDeControl}. ` +
          'El relleno tiene que MOVER el bloque, no cambiarle el alto.',
      )
    }
    const efectivo = corrimientoDe(pie.rellenoAbajo, pie.margenDeLaGrilla, margenBase)
    if (Math.abs(efectivo - n) > 0.01) {
      throw new Error(`a ${v.ancho}: se pidio un corrimiento de ${n} px y el pie dice ${efectivo}`)
    }

    /**
     * A — la página como se ve, una por corrimiento. No se mide: es lo que el
     * dueño mira para decidir entre dos números que el banco no puede elegir por
     * él. Va detrás de una bandera porque un barrido de quince puntos generaría
     * quince capturas y el tope del sprint es 50.
     */
    if (argumento('capturas', '') === 'si') {
      const aRuta = path.join(TEMP, `roce-${etiqueta}-${v.ancho}-n${n}-a.png`)
      await capturar(pagina, aRuta)
      copias.push({
        desde: aRuta,
        hasta: path.join(CARPETA_DE_CAPTURAS, `${etiqueta}-${v.ancho}x${v.alto}-baja${n}.png`),
      })
    }

    const sinEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
    if (sinEscena.escena !== 'hidden' || sinEscena.titular !== 'visible') {
      throw new Error(`a ${v.ancho}: la capa C no tomo con corrimiento ${n}`)
    }
    const cRuta = path.join(TEMP, `roce-${etiqueta}-${v.ancho}-n${n}-c.png`)
    await capturar(pagina, cRuta)
    await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
    const C = leer(cRuta)

    const pieza = (clave: string): Caja | null => l.piezas.find((p) => p.clave === clave)?.caja ?? null
    const titular = medirCaja(pieza('titular'), C, D, E, L)
    const fila = {
      corrimiento: n,
      rellenoAbajo: dos(pie.rellenoAbajo),
      margenDeLaGrilla: dos(pie.margenDeLaGrilla),
      columna:
        l.columna === null
          ? null
          : { arriba: dos(l.columna.y), abajo: dos(l.columna.y + l.columna.alto), alto: dos(alto) },
      aireBajoElBloque: dos(l.ventana.alto - (l.columna === null ? 0 : l.columna.y + l.columna.alto)),
      desborda: l.columna !== null && l.columna.y + l.columna.alto > l.ventana.alto + 0.01,
      cajaDelTitular: pieza('titular'),
      cruces: {
        titular,
        registro1: medirCaja(pieza('registro1'), C, D, E, L),
        registro2: medirCaja(pieza('registro2'), C, D, E, L),
        bajada: medirCaja(pieza('bajada'), C, D, E, L),
        cta: medirCaja(pieza('cta'), C, D, E, L),
        columna: medirCaja(l.columna, C, D, E, L),
      },
    }
    filas.push(fila)
    const pct = (x: number | undefined): string => `${((x ?? Number.NaN) * 100).toFixed(2).padStart(6)} %`
    const c = fila.cruces
    console.log(
      `    baja ${String(n).padStart(6)} px  pie ${String(fila.rellenoAbajo).padStart(5)}+${String(fila.margenDeLaGrilla).padStart(5)}` +
        `  titular: escena ${pct(titular?.sobreLaEscena)} LOGO ${pct(titular?.sobreElLogo)}` +
        `  R1 ${pct(c.registro1?.sobreElLogo)}  R2 ${pct(c.registro2?.sobreElLogo)}` +
        `  columna ${pct(c.columna?.sobreElLogo)}` +
        `  fondo ${String(fila.columna?.abajo ?? 0).padStart(7)}  aire ${String(fila.aireBajoElBloque).padStart(6)}`,
    )
  }
  await medir<boolean>(pagina, PONER_CONFIGURACION(''))

  console.log(`    masa oscura en la columna del titular: ${bandas.map((b) => `${b.desde}-${b.hasta}`).join(' · ')}`)
  console.log(
    `    silueta del logo (mascara analitica): filas ${L.banda === null ? 'n/d' : `${L.banda.desde}-${L.banda.hasta}`} · ${L.celdas} px`,
  )
  return {
    ancho: v.ancho,
    alto: v.alto,
    margenBase: dos(margenBase),
    bandasDeMasaEnLaColumna: bandas,
    logoAnalitico: { progreso: cuatro(progreso), banda: L.banda, celdas: L.celdas, centroXPx: dos(L.centroXPx) },
    filas,
  }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'barrido')
  const soloAncho = argumento('ancho', '425,768')
  const ventanas = VENTANAS.filter((v) => soloAncho.split(',').includes(String(v.ancho)))
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const filas: unknown[] = []
  const copias: { desde: string; hasta: string }[] = []
  for (const v of ventanas) {
    console.log(`\n  ${v.ancho}x${v.alto}`)
    filas.push(
      await conChrome(`roce-${v.ancho}`, async (chrome) =>
        enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta, copias), {
          asentamientoMs: ASENTAMIENTO_MS,
        }),
      ),
    )
  }
  for (const c of copias) copyFileSync(c.desde, c.hasta)

  const ruta = path.join(RAIZ_DE_SALIDAS, `a-${etiqueta}.json`)
  writeFileSync(
    ruta,
    `${JSON.stringify(
      {
        etiqueta,
        cuando: new Date().toISOString(),
        instrumento:
          'scripts-roce/a-barrido.ts — el corrimiento vertical como variable, con las dos mascaras de TAPADO-1 (C y D) y la E de COMPO-2',
        palanca: 'padding-bottom del hero (y, pasados los 72 px, el margin-bottom de la grilla)',
        filas,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
