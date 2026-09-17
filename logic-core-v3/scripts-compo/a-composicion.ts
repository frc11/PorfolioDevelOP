/**
 * COMPO-1 · A — LA COMPOSICIÓN DEL HERO EN LOS OCHO ANCHOS.
 *
 *     npx tsx scripts-compo/a-composicion.ts --etiqueta=antes
 *     npx tsx scripts-compo/a-composicion.ts --etiqueta=despues
 *
 * Mide, sobre EL ÁRBOL y sin una sola regla puesta encima:
 *
 *   · cada pieza de la columna —las líneas del titular, la bajada y el CTA— con
 *     su tamaño, su cara, sus renglones y su caja;
 *   · **los dos bordes izquierdos** de cada una: el de la CAJA y el de la TINTA,
 *     y la resta entre ellos (§4 del sprint);
 *   · el alto del bloque y los huecos medidos entre piezas;
 *   · **la distancia del borde de abajo del CTA al borde de arriba de la
 *     pastilla** de navegación (§6), en sus dos lecturas: caja contra caja, y
 *     tinta contra caja.
 *
 * ⚠ **No mide superposición.** Ésa es de `scripts-texto/e-antes-despues.ts`, que
 * ya tiene las dos máscaras de TEXTO-3 y no se duplica acá.
 *
 * ⚠ La captura A se copia al árbol **con todas las pestañas cerradas**: el dev
 * server vigila el repo y un archivo escrito con la página abierta dispara un
 * recompilado en medio de la medición.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import { leer } from '../scripts-tapado/mascaras'
import {
  ASENTAMIENTO_MS,
  PONER_CAPA,
  SIN_LA_ESCENA,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  conChrome,
  enLaVentana,
  type EstadoDeCapas,
  type Ventana,
} from '../scripts-tapado/tapado-comun'
import {
  CARPETA_DE_CAPTURAS_DE_COMPO,
  LECTOR_COMPO,
  RAIZ_DE_SALIDAS,
  bordesDeTinta,
  dos,
  dosONulo,
  type LecturaDeCompo,
} from './compo-comun'

interface Copia {
  readonly desde: string
  readonly hasta: string
}

async function medirVentana(pagina: Pagina, v: Ventana, etiqueta: string, copias: Copia[]): Promise<unknown> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)

  const lectura = await medir<LecturaDeCompo | null>(pagina, LECTOR_COMPO)
  if (lectura === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero`)

  // A — la página como se ve. Es la del informe; no se mide.
  const aRuta = path.join(TEMP, `compo-${etiqueta}-${v.ancho}-a.png`)
  await capturar(pagina, aRuta)
  copias.push({
    desde: aRuta,
    hasta: path.join(CARPETA_DE_CAPTURAS_DE_COMPO, `${etiqueta}-${v.ancho}x${v.alto}.png`),
  })

  // C — el texto SIN la escena: el fondo queda plano y la tinta se separa por
  // umbral sin depender de lo que haya detrás.
  const sinEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
  if (sinEscena.escena !== 'hidden' || sinEscena.titular !== 'visible') {
    throw new Error(`a ${v.ancho}: la capa C no tomo — escena «${sinEscena.escena}», titular «${sinEscena.titular}»`)
  }
  const cRuta = path.join(TEMP, `compo-${etiqueta}-${v.ancho}-c.png`)
  await capturar(pagina, cRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const C = leer(cRuta)

  const bordesDe = (caja: { x: number; y: number; ancho: number; alto: number } | null) =>
    caja === null || caja.ancho <= 0 || caja.alto <= 0
      ? null
      : bordesDeTinta(C, { x: caja.x, y: caja.y, ancho: caja.ancho, alto: caja.alto })

  const piezas = lectura.piezas.map((p) => {
    const bordes = bordesDe(p.caja)
    const tinta = bordes?.izquierda ?? null
    return {
      clave: p.clave,
      texto: p.texto,
      fontSize: dosONulo(p.fontSize),
      lineHeight: dosONulo(p.lineHeight),
      letterSpacing: dosONulo(p.letterSpacing),
      familia: p.familia,
      peso: p.peso,
      estilo: p.estilo,
      renglones: p.renglones.length,
      anchoMaximoDelRenglon: p.renglones.length === 0 ? 0 : dos(Math.max(...p.renglones.map((r) => r.ancho))),
      caja: p.caja === null ? null : { x: dos(p.caja.x), y: dos(p.caja.y), ancho: dos(p.caja.ancho), alto: dos(p.caja.alto) },
      bordeDeLaCaja: p.caja === null ? null : dos(p.caja.x),
      bordeDeLaTinta: tinta,
      /** La resta: cuánto se corre la tinta respecto de su propia caja. */
      sangriaDeLaTinta: p.caja === null || tinta === null ? null : dos(tinta - p.caja.x),
      fondoDeLaTinta: bordes?.abajo ?? null,
      pixelesDeTinta: bordes?.pixeles ?? 0,
    }
  })

  const cta = lectura.piezas.find((p) => p.clave === 'cta') ?? null
  const cajaDelCta = cta?.caja ?? null
  const pastilla = lectura.pastilla
  /** El fondo de la TINTA del CTA, leído del píxel: la última fila dibujada
   *  dentro de su caja. Con el registro `rotulo` esa fila es el subrayado. */
  const fondoDeLaTintaDelCta = piezas.find((p) => p.clave === 'cta')?.fondoDeLaTinta ?? null

  const aire =
    cajaDelCta === null || pastilla === null
      ? null
      : {
          fondoDelCta: dos(cajaDelCta.y + cajaDelCta.alto),
          topeDeLaPastilla: dos(pastilla.y),
          /** Caja contra caja: lo que el layout reserva. */
          cajaACaja: dos(pastilla.y - (cajaDelCta.y + cajaDelCta.alto)),
          /** Tinta contra caja: lo que el ojo ve. El CTA lleva 8 px de relleno. */
          tintaACaja: fondoDeLaTintaDelCta === null ? null : dos(pastilla.y - fondoDeLaTintaDelCta),
        }

  const bordes = piezas.map((p) => p.bordeDeLaTinta).filter((x): x is number => x !== null)
  const bordesDeCaja = piezas.map((p) => p.bordeDeLaCaja).filter((x): x is number => x !== null)

  const fila = {
    ancho: v.ancho,
    alto: v.alto,
    justificado: lectura.justificado,
    relleno: lectura.relleno,
    pantalla: lectura.pantalla === null ? null : { alto: dos(lectura.pantalla.alto) },
    piezas,
    /** La dispersión de los cuatro bordes: 0 es «al píxel». */
    dispersionDeLaTinta: bordes.length === 0 ? null : dos(Math.max(...bordes) - Math.min(...bordes)),
    dispersionDeLaCaja: bordesDeCaja.length === 0 ? null : dos(Math.max(...bordesDeCaja) - Math.min(...bordesDeCaja)),
    bloque:
      lectura.bloque === null
        ? null
        : { x: dos(lectura.bloque.x), y: dos(lectura.bloque.y), ancho: dos(lectura.bloque.ancho), alto: dos(lectura.bloque.alto) },
    huecos: lectura.huecos.map((h) => ({ ...h, px: dos(h.px) })),
    pastilla: pastilla === null ? null : { x: dos(pastilla.x), y: dos(pastilla.y), ancho: dos(pastilla.ancho), alto: dos(pastilla.alto) },
    aireHastaLaPastilla: aire,
  }

  console.log(
    `    bloque ${String(fila.bloque?.alto ?? 0).padStart(6)} px · ` +
      `bordes tinta [${bordes.join(', ')}] disp ${fila.dispersionDeLaTinta} · ` +
      `aire CTA→pastilla caja ${aire?.cajaACaja ?? 'n/d'} / tinta ${aire?.tintaACaja ?? 'n/d'}`,
  )
  for (const p of piezas) {
    console.log(
      `      ${p.clave.padEnd(10)} ${String(p.fontSize).padStart(6)} px · ${p.renglones} renglon(es) · ` +
        `caja x ${String(p.bordeDeLaCaja).padStart(6)} · tinta x ${String(p.bordeDeLaTinta).padStart(5)} · ` +
        `sangria ${String(p.sangriaDeLaTinta).padStart(5)} · «${p.texto.slice(0, 40)}»`,
    )
  }
  return fila
}

async function main(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CARPETA_DE_CAPTURAS_DE_COMPO, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'arbol')
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const filas: unknown[] = []
  const copias: Copia[] = []
  for (const v of ventanas) {
    console.log(`\n  ${v.ancho}x${v.alto}`)
    const fila = await conChrome(`compo-${v.ancho}`, async (chrome) =>
      enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta, copias), {
        asentamientoMs: ASENTAMIENTO_MS,
      }),
    )
    filas.push(fila)
  }
  for (const c of copias) copyFileSync(c.desde, c.hasta)

  const ruta = path.join(RAIZ_DE_SALIDAS, `a-composicion-${etiqueta}.json`)
  writeFileSync(
    ruta,
    `${JSON.stringify(
      {
        etiqueta,
        cuando: new Date().toISOString(),
        instrumento:
          'scripts-compo/a-composicion.ts — las piezas del hero con sus DOS bordes izquierdos (caja y tinta, esta ultima leida del pixel sobre la captura C) y el aire del CTA hasta la pastilla',
        filas,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${ruta}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
