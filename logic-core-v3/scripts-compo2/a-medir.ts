/**
 * COMPO-2 · A — LA MEDICIÓN: la columna, los renglones y la superposición.
 *
 *     npx tsx scripts-compo2/a-medir.ts --etiqueta=hoy
 *     npx tsx scripts-compo2/a-medir.ts --etiqueta=b425 --ancho=425 --sim=r1 \
 *       --valores=38,36,34,32,30 --capturas=no
 *
 * ── Qué hace, y por qué es UN banco y no dos ──────────────────────────────
 *
 * Las cinco preguntas de este sprint son la misma pregunta mirada de dos lados:
 * **cuánto mide la columna** (el §1 y el §0) y **cuánta tinta cae sobre el
 * logo** (el §2, el §3 y el §4). Medirlas en dos corridas distintas obligaría a
 * aparear dos cargas de la misma página, y una carga del dev server no es
 * idéntica a la siguiente —el chunk perezoso de la escena a veces llega tarde—.
 * Acá las dos salen del MISMO cuadro.
 *
 * La técnica de la superposición es la de TAPADO-1 y no cambia un píxel: tres
 * cuadros del mismo layout —A a la vista, C el texto sin la escena, D la escena
 * sola— más la cuarta máscara que TEXTO-3 tuvo que agregar —E, la página sin el
 * texto del Hero, o sea **lo que realmente hay detrás de los glifos** cuando el
 * panel es opaco—. `D` dice si la composición está sana; `E`, si la pantalla se
 * lee.
 *
 * ── LAS SIMULACIONES: por qué se miden con una hoja y no construyendo ─────
 *
 * Los §2, §3 y §4 piden DERIVAR un tamaño —«el mayor con el que la
 * superposición no sube»—, y eso es un barrido. Construir cada candidato
 * significaría tocar el árbol una vez por punto del barrido, con un build en el
 * medio; una hoja `!important` sobre la MISMA página deja una sola variable
 * cambiada, que es la condición para poder atribuir la diferencia. Es el mismo
 * mecanismo con el que `scripts-texto/d-superposicion.ts` barrió sus dieciocho
 * configuraciones.
 *
 * ⚠ El centinela: ninguna simulación de la familia `r1` toca el registro 2, así
 * que su cuerpo tiene que ser IDÉNTICO en todas las filas de un ancho. Si
 * cambia, la hoja de utilidades se cayó y lo que sigue no es una medición.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
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
import {
  CARPETA_DE_CAPTURAS,
  LECTOR,
  PONER_CONFIGURACION,
  RAIZ_DE_SALIDAS,
  SEL,
  type Caja,
  type Lectura,
  cuatro,
  dos,
} from './compo2-comun'

/**
 * ⚠ LA MÁSCARA E — la página sin el texto del Hero y con todo lo demás en su
 * lugar. Copiada de `scripts-texto/e-antes-despues.ts` con los dos niveles de
 * la bajada, por la misma razón que allá: un selector atado a un solo nivel
 * dejaría el párrafo VISIBLE en la máscara, o sea que «lo que hay detrás del
 * texto» incluiría su propia tinta.
 */
const SIN_EL_TEXTO_DEL_HERO =
  '[data-pantalla="hero"] h1,[data-pantalla="hero"] h1 *,' +
  '[data-pantalla="hero"] [data-nivel="cuerpo"],[data-pantalla="hero"] [data-nivel="cuerpo"] *,' +
  '[data-pantalla="hero"] [data-nivel="base"],[data-pantalla="hero"] [data-nivel="base"] *,' +
  '[data-pantalla="hero"] [data-pieza="logotipo"],[data-pantalla="hero"] [data-pieza="isotipo"],' +
  '[data-pantalla="hero"] a,[data-pantalla="hero"] a *{visibility:hidden!important}'

interface Configuracion {
  readonly clave: string
  readonly que: string
  readonly regla: string
  readonly captura: boolean
}

const SIN_CAPTURAS = argumento('capturas', '') === 'no'

/** La regla que pone la bajada en UN renglón: la regla global del sprint. */
const UN_RENGLON = `${SEL.bajada}{display:block!important}`
/** La regla que centra el bloque en el viewport: el §1. */
const CENTRADO = `${SEL.pantalla}{justify-content:center!important}`
/** La regla que desmonta la pastilla: el §2b y el §3a. */
const SIN_PASTILLA = '[data-parte="pastilla"]{display:none!important}'
/** El pie sin la reserva de la pastilla: lo que HARÍA caer al bloque. */
const PIE_SIN_RESERVA = `${SEL.pantalla}{padding-bottom:8px!important}`
/**
 * El relleno de arriba igualado al de abajo: sin esto, `justify-content:center`
 * centra en la CAJA DE CONTENIDO y no en el viewport, porque `pt-20` (80 px) y
 * el pie de papel (8 px) no son el mismo número. El §1 pide centrado en el
 * viewport, así que la simulación tiene que igualar los dos.
 */
const AIRE_SIMETRICO = `${SEL.pantalla}{padding-top:8px!important}`
/**
 * SUBIR EL BLOQUE — un margen abajo de la grilla, que es EXACTAMENTE el
 * mecanismo que COMPO-1 §6 ya usa en la banda 860–1024
 * (`claseDelAireDelPieEnPortatil`). No es una invención de la simulación: es la
 * misma palanca, en otra banda.
 */
const SUBIR = (px: number): string => `${SEL.pantalla} > div{margin-bottom:${px}px!important}`

function listaDeValores(): readonly number[] {
  const crudo = argumento('valores', '')
  if (crudo === '') return []
  return crudo
    .split(',')
    .map((s) => Number.parseFloat(s.trim()))
    .filter((n) => Number.isFinite(n))
}

/**
 * LAS FAMILIAS DE SIMULACIÓN. Cada una contesta UNA pregunta del sprint y
 * ninguna mezcla dos palancas: si una fila mueve dos cosas, la diferencia deja
 * de ser atribuible.
 */
function configuraciones(base: Lectura): readonly Configuracion[] {
  const familia = argumento('sim', '')
  const valores = listaDeValores()
  const control: Configuracion = {
    clave: '0-arbol',
    que: 'el arbol como esta, sin una sola regla encima',
    regla: '',
    captura: true,
  }
  const de = (clave: string): Lectura['piezas'][number] | undefined => base.piezas.find((p) => p.clave === clave)

  if (familia === '') return [control]

  if (familia === 'regla0') {
    return [
      control,
      { clave: 'un-renglon', que: 'REGLA 0 simulada: la bajada en UN renglon', regla: UN_RENGLON, captura: false },
    ]
  }

  if (familia === 'r1') {
    return [
      control,
      ...valores.map((px) => ({
        clave: `r1-${px}`,
        que: `el registro 1 a ${px} px`,
        regla: `${SEL.registro1}{font-size:${px}px!important}`,
        captura: false,
      })),
    ]
  }

  if (familia === 'r1-con-regla0') {
    return [
      control,
      { clave: 'solo-regla0', que: 'REGLA 0 sola, para separar su efecto', regla: UN_RENGLON, captura: false },
      ...valores.map((px) => ({
        clave: `r1-${px}`,
        que: `REGLA 0 + el registro 1 a ${px} px`,
        regla: `${UN_RENGLON}${SEL.registro1}{font-size:${px}px!important}`,
        captura: false,
      })),
    ]
  }

  if (familia === 'r1-subido') {
    // La REGLA 0 baja el bloque (se apoya abajo y perdió un renglón). Esta
    // familia le devuelve ese alto como margen, así que el TITULAR queda donde
    // está hoy, y recién ahí barre el tamaño. Sin esto, el barrido mediría el
    // registro 1 contra una posición que la regla global ya movió.
    const offset = Number.parseFloat(argumento('offset', '0'))
    const marco = `${UN_RENGLON}${SUBIR(offset)}`
    return [
      control,
      { clave: 'solo-regla0', que: 'REGLA 0 sola', regla: UN_RENGLON, captura: false },
      { clave: `subido-${offset}`, que: `REGLA 0 + el bloque subido ${offset} px`, regla: marco, captura: false },
      ...valores.map((px) => ({
        clave: `r1-${px}`,
        que: `REGLA 0 + subido ${offset} px + el registro 1 a ${px} px`,
        regla: `${marco}${SEL.registro1}{font-size:${px}px!important}`,
        captura: false,
      })),
    ]
  }

  if (familia === 'pastilla') {
    return [
      control,
      { clave: 'sin-pastilla', que: 'la pastilla desmontada, el pie INTACTO', regla: SIN_PASTILLA, captura: false },
      {
        clave: 'sin-pastilla-y-sin-reserva',
        que: 'la pastilla desmontada Y el pie a 8 px: lo que HARIA caer al bloque',
        regla: `${SIN_PASTILLA}${PIE_SIN_RESERVA}`,
        captura: false,
      },
    ]
  }

  if (familia === 'marca') {
    // El §1: la regla global, el centrado y la marca escalada por un factor
    // UNICO — el isotipo y la palabra crecen en la misma proporcion, que es lo
    // que «la palabra acompaña, proporcional al isotipo» quiere decir.
    const iso = de('isotipo')
    const logo = de('logotipo')
    const altoHoy = iso?.caja?.alto ?? 0
    const tamanoHoy = logo?.fontSize ?? 0
    const marco = `${UN_RENGLON}${CENTRADO}${AIRE_SIMETRICO}`
    return [
      control,
      {
        clave: 'regla0-centrado-aire',
        que: 'REGLA 0 + centrado vertical + aire simetrico, con la marca como esta',
        regla: marco,
        captura: false,
      },
      ...valores.map((k) => ({
        clave: `k-${k.toFixed(4)}`,
        que: `REGLA 0 + centrado + aire + la marca x${k.toFixed(4)} (isotipo ${(altoHoy * k).toFixed(2)} px, palabra ${(tamanoHoy * k).toFixed(2)} px)`,
        regla:
          marco +
          `${SEL.isotipo}{height:${(altoHoy * k).toFixed(3)}px!important}` +
          `${SEL.logotipo}{font-size:${(tamanoHoy * k).toFixed(3)}px!important}`,
        captura: false,
      })),
    ]
  }

  throw new Error(`familia de simulacion desconocida: «${familia}»`)
}

function medirCaja(
  caja: Caja | null,
  C: ReturnType<typeof leer>,
  D: ReturnType<typeof leer>,
  E: ReturnType<typeof leer>,
): Record<string, unknown> | null {
  if (caja === null || caja.ancho <= 0 || caja.alto <= 0) return null
  const r: Rect = { x: caja.x, y: caja.y, ancho: caja.ancho, alto: caja.alto }
  const x = cruzar(C, D, r)
  const d = cruzar(C, E, r)
  return {
    caja: { x: dos(caja.x), y: dos(caja.y), ancho: dos(caja.ancho), alto: dos(caja.alto) },
    glifos: x.glifos,
    sobreLaEscena: cuatro(x.fraccionDeTinta),
    tintaBajoAA: cuatro(x.fraccionBajoAA),
    detrasDelTexto: {
      tintaSobreMasa: cuatro(d.fraccionDeTinta),
      tintaBajoAA: cuatro(d.fraccionBajoAA),
      contrasteMediano: dos(d.contrasteMediano),
    },
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

  const base = await medir<Lectura | null>(pagina, LECTOR)
  if (base === null) throw new Error(`a ${v.ancho}: el lector no encontro la pantalla del hero`)

  // D — la escena sola, y E — lo que hay detras del texto. Una sola vez por
  // ancho: ninguna regla de este banco toca ni la escena ni la superficie.
  const soloEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (soloEscena.escena !== 'visible' || soloEscena.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa D no tomo — escena «${soloEscena.escena}», titular «${soloEscena.titular}»`)
  }
  const dRuta = path.join(TEMP, `compo2-${etiqueta}-${v.ancho}-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const D = leer(dRuta)

  /**
   * ⚠ DÓNDE ESTÁ LA MASA, y no sólo cuánta tinta le cae encima. La fracción
   * dice CUÁNTO se solapa; las bandas dicen POR QUÉ LADO, que es lo que decide
   * si la palanca es subir el bloque o achicarlo. Se leen de la máscara D sobre
   * la columna del texto, con el mismo `bandasDeMasa` de TAPADO-1.
   */
  const cajaDelTitular = base.piezas.find((p) => p.clave === 'titular')?.caja ?? null
  const bandas =
    cajaDelTitular === null
      ? []
      : bandasDeMasa(D, cajaDelTitular.x, cajaDelTitular.x + cajaDelTitular.ancho).map((b) => ({
          desde: b.desde,
          hasta: b.hasta,
          alto: b.hasta - b.desde + 1,
        }))

  const sinTexto = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_EL_TEXTO_DEL_HERO))
  if (sinTexto.escena !== 'visible' || sinTexto.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa E no tomo — escena «${sinTexto.escena}», titular «${sinTexto.titular}»`)
  }
  const eRuta = path.join(TEMP, `compo2-${etiqueta}-${v.ancho}-e.png`)
  await capturar(pagina, eRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const E = leer(eRuta)

  const filas: Record<string, unknown>[] = []
  let fsR2DelControl: number | null = null
  for (const c of configuraciones(base)) {
    await medir<boolean>(pagina, PONER_CONFIGURACION(c.regla))
    const l = await medir<Lectura | null>(pagina, LECTOR)
    if (l === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero en «${c.clave}»`)
    const r2 = l.piezas.find((p) => p.clave === 'registro2')?.fontSize ?? 0
    if (fsR2DelControl === null) fsR2DelControl = r2
    else if (argumento("sim", "").startsWith("r1") && Math.abs(r2 - fsR2DelControl) > 0.01) {
      throw new Error(
        `a ${v.ancho}, en «${c.clave}»: el registro 2 mide ${r2} px y en el control media ${fsR2DelControl}. ` +
          'Ninguna regla de esta familia lo toca: la hoja de utilidades se cayo.',
      )
    }

    if (c.captura && !SIN_CAPTURAS) {
      const aRuta = path.join(TEMP, `compo2-${etiqueta}-${v.ancho}-a.png`)
      await capturar(pagina, aRuta)
      copias.push({ desde: aRuta, hasta: path.join(CARPETA_DE_CAPTURAS, `${etiqueta}-${v.ancho}x${v.alto}.png`) })
    }

    const sinEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
    if (sinEscena.escena !== 'hidden' || sinEscena.titular !== 'visible') {
      throw new Error(`a ${v.ancho}: la capa C no tomo en «${c.clave}»`)
    }
    const cRuta = path.join(TEMP, `compo2-${etiqueta}-${v.ancho}-${c.clave}-c.png`)
    await capturar(pagina, cRuta)
    await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
    const C = leer(cRuta)

    const util = l.ventana.alto - l.relleno.arriba - l.relleno.abajo
    const alto = l.columna?.alto ?? 0
    filas.push({
      clave: c.clave,
      que: c.que,
      regla: c.regla,
      justificado: l.justificado,
      relleno: l.relleno,
      utilDeLaPantalla: dos(util),
      columna: l.columna === null ? null : { arriba: dos(l.columna.y), abajo: dos(l.columna.y + l.columna.alto), alto: dos(alto) },
      holgura: dos(util - alto),
      fraccionDelViewport: dos((alto / l.ventana.alto) * 100),
      bloqueDeTexto:
        l.bloqueDeTexto === null
          ? null
          : { arriba: dos(l.bloqueDeTexto.y), abajo: dos(l.bloqueDeTexto.y + l.bloqueDeTexto.alto), alto: dos(l.bloqueDeTexto.alto) },
      celdaDelTitular: dos(l.celdaDelTitular),
      celdaDeLaBajada: dos(l.celdaDeLaBajada),
      pastillaVisible: l.pastillaVisible,
      fondoDelPanel: l.fondoDelPanel,
      piezas: l.piezas.map((p) => ({
        clave: p.clave,
        fontSize: dos(p.fontSize),
        renglones: p.renglones?.cantidad ?? 0,
        anchoDeTinta: dos(p.renglones?.anchoMaximo ?? 0),
        altoDeLinea: dos(p.renglones?.altoDeLinea ?? 0),
        caja: p.caja === null ? null : { x: dos(p.caja.x), y: dos(p.caja.y), ancho: dos(p.caja.ancho), alto: dos(p.caja.alto) },
      })),
      cruces: {
        titular: medirCaja(l.piezas.find((p) => p.clave === 'titular')?.caja ?? null, C, D, E),
        registro1: medirCaja(l.piezas.find((p) => p.clave === 'registro1')?.caja ?? null, C, D, E),
        registro2: medirCaja(l.piezas.find((p) => p.clave === 'registro2')?.caja ?? null, C, D, E),
        columna: medirCaja(l.columna, C, D, E),
      },
    })

    const t = filas[filas.length - 1].cruces as { titular: { sobreLaEscena: number; detrasDelTexto: { tintaSobreMasa: number; contrasteMediano: number } } | null }
    const r1 = l.piezas.find((p) => p.clave === 'registro1')
    const reg2 = l.piezas.find((p) => p.clave === 'registro2')
    console.log(
      `    ${c.clave.padEnd(22)} titular ${((t.titular?.sobreLaEscena ?? Number.NaN) * 100).toFixed(1).padStart(5)} %` +
        ` · DETRAS ${((t.titular?.detrasDelTexto.tintaSobreMasa ?? Number.NaN) * 100).toFixed(1).padStart(5)} %` +
        ` · contraste ${(t.titular?.detrasDelTexto.contrasteMediano ?? Number.NaN).toFixed(2).padStart(6)}:1` +
        ` · columna ${alto.toFixed(1).padStart(6)} px de ${util.toFixed(0).padStart(4)} (holgura ${(util - alto).toFixed(1).padStart(6)})` +
        ` · R1 ${r1?.renglones?.cantidad ?? 0}x${(r1?.fontSize ?? 0).toFixed(1)} tinta ${(r1?.renglones?.anchoMaximo ?? 0).toFixed(1)}` +
        ` · R2 ${reg2?.renglones?.cantidad ?? 0}x${(reg2?.fontSize ?? 0).toFixed(1)} tinta ${(reg2?.renglones?.anchoMaximo ?? 0).toFixed(1)}` +
        ` · bajada ${l.piezas.find((p) => p.clave === 'bajada')?.renglones?.cantidad ?? 0}`,
    )
  }
  await medir<boolean>(pagina, PONER_CONFIGURACION(''))
  console.log(
    `    masa del logo en la columna: ${bandas.length === 0 ? 'ninguna' : bandas.map((b) => `${b.desde}-${b.hasta} (${b.alto})`).join(' · ')}`,
  )
  return { ancho: v.ancho, alto: v.alto, bandasDeMasaEnLaColumna: bandas, configuraciones: filas }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'hoy')
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => soloAncho.split(',').includes(String(v.ancho)))
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const filas: unknown[] = []
  const copias: { desde: string; hasta: string }[] = []
  for (const v of ventanas) {
    console.log(`\n  ${v.ancho}x${v.alto}`)
    const fila = await conChrome(`compo2-${v.ancho}`, async (chrome) =>
      enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta, copias), {
        asentamientoMs: ASENTAMIENTO_MS,
      }),
    )
    filas.push(fila)
  }
  // Recién acá, con TODAS las pestañas cerradas: el dev server vigila el repo y
  // un archivo escrito adentro del árbol con la página abierta dispara un
  // recompilado y una recarga en caliente. Lección de TEXTO-2.
  for (const c of copias) copyFileSync(c.desde, c.hasta)

  const ruta = path.join(RAIZ_DE_SALIDAS, `a-${etiqueta}.json`)
  writeFileSync(
    ruta,
    `${JSON.stringify(
      {
        etiqueta,
        cuando: new Date().toISOString(),
        sim: argumento('sim', ''),
        valores: listaDeValores(),
        instrumento: 'scripts-compo2/a-medir.ts — la columna entera con sus renglones y el cruce de TAPADO-1 con las dos mascaras de fondo',
        filas,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${ruta}${copias.length === 0 ? '' : ` · ${copias.length} capturas en ${CARPETA_DE_CAPTURAS}`}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
