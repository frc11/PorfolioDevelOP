/**
 * COMPO-2 · B — LA DERIVACIÓN PREVIA: la regla global y el §1, ANTES de tocar
 * una línea de marcado.
 *
 *     npx tsx scripts-compo2/b-derivacion.ts
 *
 * ── Por qué esto corre primero y sin navegador ────────────────────────────
 *
 * La instrucción pone dos paradas. La de la regla global —«verificá que entra
 * en un renglón en los ocho»— y la del §1 —«medí el alto ANTES de construir; si
 * con la marca grande y el centrado no entra, reportá cuánto falta antes de
 * aplicar»—. Una parada que se contesta después de construir no es una parada.
 *
 * Es el mismo método de `scripts-papel/a-derivacion.ts`: las tablas de avance de
 * los `.woff2` que se sirven y los tokens del tema, cero navegador y cero build.
 * Lo que cambia es la pregunta: allá era «¿cuánto tiene que medir el registro 1
 * para igualar al 2?», acá es «¿cuánto puede crecer la marca?».
 *
 * ── ⚠️ LOS SUPUESTOS, DECLARADOS ─────────────────────────────────────────
 *
 * · El avance sale de `hmtx` en la instancia por defecto del eje de peso, con
 *   `FACTOR_DEL_PESO_700` para la cara de display —el mismo que COMPO-1 derivó
 *   contra el mismo binario— y sin corregir la itálica, que se pinta en 300 y
 *   por lo tanto queda SOBREestimada: el error empuja al lado seguro.
 * · No hay kerning. Mismo supuesto que los cuatro instrumentos anteriores.
 * · El alto de una caja de línea es `tamaño × interlineado`. Los márgenes de
 *   colapso no existen acá: todas las piezas son ítems de un `flex-col`.
 * · **El alto del bloque de texto NO se modela: se toma MEDIDO** de
 *   `outputs/compo2/a-hoy.json`. El modelo de PAPEL-2 erraba 1,0 px contra el
 *   navegador y acá la cuenta decide un tamaño de marca; con el alto medido, el
 *   único término modelado es la marca misma.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FUENTE_DISPLAY, FUENTE_ITALICA, FUENTE_TITULO, anchoDeTexto } from '../src/app/v3/_lib/__tests__/s10-avance'
import { leerAvancesDe } from '../src/app/v3/_lib/__tests__/s10-woff2'
import { tokenPx } from '../src/app/v3/_lib/__tests__/s10-css'
import { tracking } from '../src/app/v3/_lib/__tests__/s10-mobile'
import { medidaDelTitular } from '../src/app/v3/_lib/__tests__/s3-banda-consecuencias'
import { CONTENIDO } from '../src/app/v3/_secciones/hero/contenido'
import { FACTOR_DEL_PESO_700 } from '../src/app/v3/_secciones/hero/composicion'
import { LOGOTIPO } from '../src/app/v3/_componentes/marca/sistema'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(AQUI, '..')
const SALIDA = path.join(RAIZ, 'docs/rediseno/outputs/compo2')

/** La razón de la caja de tinta del isotipo — `LOGO_INK_VIEWBOX` de `LogoMark`. */
const RAZON_DEL_ISOTIPO = 978.459 / 680.67

const DISPLAY = leerAvancesDe(FUENTE_DISPLAY)
const ITALICA = leerAvancesDe(FUENTE_ITALICA)
const ROMANA = leerAvancesDe(FUENTE_TITULO)

const FILA_1 = CONTENIDO.titularFila1.toUpperCase()
const FILA_2 = CONTENIDO.titularFila2.toUpperCase()
const FILA_3 = CONTENIDO.titularFila3.toUpperCase()
/** La frase entera de la bajada, con el espacio que el marcado deja en medio. */
const BAJADA = CONTENIDO.bajada

const emDisplay = (t: string): number => anchoDeTexto(DISPLAY, t, 1, tracking('display')) * FACTOR_DEL_PESO_700
const emItalica = (t: string): number => anchoDeTexto(ITALICA, t, 1, tracking('titulo'))
const emRomana = (t: string, pista: 'texto' | 'titulo'): number => anchoDeTexto(ROMANA, t, 1, tracking(pista))

const LEADING_TITULO = tokenPx('--leading-titulo', 0)
const LEADING_TEXTO = tokenPx('--leading-texto', 0)
/** El hueco de la columna y el piso de respiro: el MISMO token. */
const HUECO = tokenPx('--spacing-2', 0)

interface PiezaMedida {
  readonly clave: string
  readonly fontSize: number
  readonly renglones: number
  readonly anchoDeTinta: number
  readonly caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number } | null
}
interface FilaMedida {
  readonly ancho: number
  readonly alto: number
  readonly configuraciones: readonly {
    readonly clave: string
    readonly utilDeLaPantalla: number
    readonly relleno: { readonly arriba: number; readonly abajo: number }
    readonly celdaDeLaBajada: number
    readonly columna: { readonly arriba: number; readonly abajo: number; readonly alto: number } | null
    readonly bloqueDeTexto: { readonly arriba: number; readonly abajo: number; readonly alto: number } | null
    readonly piezas: readonly PiezaMedida[]
  }[]
}

function medido(archivo: string): readonly FilaMedida[] {
  const crudo = JSON.parse(readFileSync(path.join(SALIDA, archivo), 'utf8')) as { filas: readonly FilaMedida[] }
  return crudo.filas
}

const HOY = medido('a-hoy.json')
const CON_REGLA_0 = medido('a-regla0.json')

const lineas: string[] = []
const p = (s: string): void => {
  lineas.push(s)
  console.log(s)
}

// ═══════════════════════════════════════════════════════════════════════════
// REGLA GLOBAL · ¿ENTRA LA FRASE ENTERA EN UN RENGLÓN, EN LOS OCHO?
// ═══════════════════════════════════════════════════════════════════════════

const AVANCE_BAJADA = emRomana(BAJADA, 'texto')
p('═══ COMPO-2 · REGLA 0 · LA BAJADA EN UN RENGLON ═══')
p('')
p(`«${BAJADA}» — ${BAJADA.length} caracteres · ${AVANCE_BAJADA.toFixed(5)} em (Chivo, tracking ${tracking('texto')})`)
p('')
p('ancho  tamaño  tinta modelada  tinta MEDIDA  caja de la bajada  margen   ¿entra?')
interface FilaDeLaRegla0 {
  readonly ancho: number
  readonly tamano: number
  readonly tintaModelada: number
  readonly tintaMedida: number
  readonly caja: number
  readonly margen: number
  readonly entra: boolean
  readonly renglonesHoy: number
  readonly techoDeCaracteres: number
}
const regla0: FilaDeLaRegla0[] = []
for (const f of HOY) {
  const c = f.configuraciones[0]
  const bajada = c.piezas.find((x) => x.clave === 'bajada')
  const tamano = bajada?.fontSize ?? 0
  const tintaModelada = AVANCE_BAJADA * tamano
  // El renglón único MEDIDO: en 1440 y 1920 la bajada ya sale en uno solo, así
  // que su `anchoDeTinta` de hoy ES la frase entera. En los seis restantes lo
  // trae la corrida de la simulación.
  // ⚠ **LA TINTA DE LA FRASE ENTERA ES LA CAJA DEL `<p>`, NO SU `anchoDeTinta`.**
  // El rango va por NODO DE TEXTO y la frase son DOS —una por `<span>`—, así
  // que `anchoDeTinta` devuelve el más ancho de los dos (126,50) y no la suma
  // con el espacio en medio. El párrafo, en cambio, es un ítem de una columna
  // `items-start`: su caja se achica al contenido, o sea que su ancho ES el
  // renglón. Medirlo por el rango publicaría la mitad de la frase.
  const deLaSim = CON_REGLA_0.find((x) => x.ancho === f.ancho)?.configuraciones.find((x) => x.clave === 'un-renglon')
  const tintaMedida = deLaSim?.piezas.find((x) => x.clave === 'bajada')?.caja?.ancho ?? 0
  const caja = c.celdaDeLaBajada
  regla0.push({
    ancho: f.ancho,
    tamano,
    tintaModelada,
    tintaMedida,
    caja,
    margen: caja - tintaMedida,
    entra: tintaMedida <= caja && (deLaSim?.piezas.find((x) => x.clave === 'bajada')?.renglones ?? 9) === 1,
    renglonesHoy: bajada?.renglones ?? 0,
    techoDeCaracteres: Math.floor(caja / (tintaMedida / BAJADA.length)),
  })
}
for (const r of regla0) {
  p(
    `${String(r.ancho).padStart(5)}  ${r.tamano.toFixed(2).padStart(6)}  ${r.tintaModelada.toFixed(2).padStart(14)}  ` +
      `${r.tintaMedida.toFixed(2).padStart(12)}  ${r.caja.toFixed(2).padStart(17)}  ${r.margen.toFixed(2).padStart(6)}   ` +
      `${r.entra ? 'SI' : 'NO'}   (hoy ${r.renglonesHoy} renglones · techo ${r.techoDeCaracteres} caracteres)`,
  )
}
p('')
p(`el ancho que MANDA es el mas angosto: ${regla0.reduce((a, b) => (a.margen <= b.margen ? a : b)).ancho} px, con ${regla0.reduce((a, b) => (a.margen <= b.margen ? a : b)).margen.toFixed(2)} px de margen`)
p('')

// ═══════════════════════════════════════════════════════════════════════════
// §1 · LA MARCA GRANDE, EL CENTRADO Y EL ALTO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EL FACTOR DE LA MARCA — uno solo, y es una RAZÓN entre dos hechos medidos.
 *
 * El isotipo mide hoy UNA caja de línea del registro 1 (`tamaño × interlineado`)
 * y su ancho sale del `viewBox` recortado a la tinta. Pedirle que su ancho
 * IGUALE el ancho de tinta del titular —que es el mismo para los dos registros
 * desde que PAPEL-2 §3 los emparejó— fija el factor sin elegir un número:
 *
 *     ancho del isotipo  = alto × razón del viewBox = tamaño₁ × interlineado × razón × k
 *     ancho del titular  = tamaño₁ × avance(«TU NEGOCIO»)
 *     k = avance / (interlineado × razón)
 *
 * No depende del ancho de pantalla: depende de la cara y del dibujo. Por eso es
 * el MISMO número en los dos anchos de papel, que es lo que impide que la marca
 * cambie de forma entre dos teléfonos —el defecto que COMPO-1 le arregló al
 * titular—.
 */
const AVANCE_FILA_1 = emDisplay(FILA_1)
const AVANCE_FILA_2 = emDisplay(FILA_2)
const AVANCE_FILA_3 = emItalica(FILA_3)
const AVANCE_LOGOTIPO = emRomana(LOGOTIPO, 'titulo')
const FACTOR_DE_LA_MARCA = AVANCE_FILA_1 / (LEADING_TITULO * RAZON_DEL_ISOTIPO)

p('═══ COMPO-2 · §1 · LA MARCA, EL CENTRADO Y EL ALTO ═══')
p('')
p(`avance de «${FILA_1}» (display 700): ${AVANCE_FILA_1.toFixed(5)} em`)
p(`avance de «${FILA_2}» (display 700): ${AVANCE_FILA_2.toFixed(5)} em`)
p(`avance de «${FILA_3}» (italica 300): ${AVANCE_FILA_3.toFixed(5)} em`)
p(`avance de «${LOGOTIPO}» (romana 600): ${AVANCE_LOGOTIPO.toFixed(5)} em`)
p(`razon del viewBox del isotipo: ${RAZON_DEL_ISOTIPO.toFixed(5)}  ·  --leading-titulo ${LEADING_TITULO}  ·  hueco ${HUECO} px`)
p('')
p(`FACTOR DE LA MARCA = ${AVANCE_FILA_1.toFixed(5)} / (${LEADING_TITULO} x ${RAZON_DEL_ISOTIPO.toFixed(5)}) = ${FACTOR_DE_LA_MARCA.toFixed(5)}`)
p('')

const PAPEL = [320, 375] as const
interface Presupuesto {
  readonly ancho: number
  readonly alto: number
  readonly utilHoy: number
  readonly utilSimetrico: number
  readonly bloqueDeTextoHoy: number
  readonly bloqueDeTextoConRegla0: number
  readonly logotipoHoy: number
  readonly isotipoHoy: number
  readonly marcaHoy: number
  readonly techoPorAlto: number
  readonly techoPorAncho: number
  readonly techoPorAltoConPtHoy: number
  readonly factor: number
  readonly isotipoAlto: number
  readonly isotipoAncho: number
  readonly logotipoTamano: number
  readonly columna: number
  readonly sobrante: number
  readonly aireArriba: number
  readonly aireAbajo: number
  readonly cajaDelTitular: number
}

const presupuestos: Presupuesto[] = []
for (const ancho of PAPEL) {
  const hoy = HOY.find((f) => f.ancho === ancho)
  const conRegla0 = CON_REGLA_0.find((f) => f.ancho === ancho)
  if (hoy === undefined || conRegla0 === undefined) throw new Error(`falta la medicion de ${ancho}`)
  const c = hoy.configuraciones[0]
  const alto = hoy.alto
  const bloqueHoy = c.bloqueDeTexto?.alto ?? 0
  const bloqueConRegla0 = conRegla0.configuraciones.find((x) => x.clave === 'un-renglon')?.bloqueDeTexto?.alto ?? 0
  const logotipoHoy = c.piezas.find((x) => x.clave === 'logotipo')?.caja?.alto ?? 0
  const isotipoHoy = c.piezas.find((x) => x.clave === 'isotipo')?.caja?.alto ?? 0
  const tamanoLogotipoHoy = c.piezas.find((x) => x.clave === 'logotipo')?.fontSize ?? 0
  const marcaHoy = logotipoHoy + HUECO + isotipoHoy

  // El aire: `pt-20` es AIRE declarado (`Hero.tsx`) y el pie de papel ya vale
  // `--spacing-2`. Con el bloque centrado el aire lo pone el centrado y el
  // relleno pasa a ser el PISO, así que los dos extremos llevan el mismo piso.
  const utilHoy = c.utilDeLaPantalla
  const utilSimetrico = alto - HUECO * 2

  // El techo por ALTO: la columna entera mas un respiro de un hueco por lado.
  const fijo = HUECO + bloqueConRegla0
  const porAlto = (utilSimetrico - HUECO * 2 - fijo) / (logotipoHoy + HUECO + isotipoHoy - HUECO)
  const porAltoConPtHoy = (utilHoy - HUECO * 2 - fijo) / (logotipoHoy + isotipoHoy)
  // El techo por ANCHO: el isotipo no puede pasarse de la caja del titular.
  const cajaDelTitular = medidaDelTitular(ancho)
  const porAncho = cajaDelTitular / RAZON_DEL_ISOTIPO / isotipoHoy

  const k = FACTOR_DE_LA_MARCA
  const isotipoAlto = isotipoHoy * k
  const columna = logotipoHoy * k + HUECO + isotipoAlto + HUECO + bloqueConRegla0
  const sobrante = utilSimetrico - columna
  presupuestos.push({
    ancho,
    alto,
    utilHoy,
    utilSimetrico,
    bloqueDeTextoHoy: bloqueHoy,
    bloqueDeTextoConRegla0: bloqueConRegla0,
    logotipoHoy,
    isotipoHoy,
    marcaHoy,
    techoPorAlto: (utilSimetrico - HUECO * 2 - fijo) / (logotipoHoy + isotipoHoy),
    techoPorAncho: porAncho,
    techoPorAltoConPtHoy: porAltoConPtHoy,
    factor: k,
    isotipoAlto,
    isotipoAncho: isotipoAlto * RAZON_DEL_ISOTIPO,
    logotipoTamano: tamanoLogotipoHoy * k,
    columna,
    sobrante,
    aireArriba: HUECO + sobrante / 2,
    aireAbajo: HUECO + sobrante / 2,
    cajaDelTitular,
  })
  void porAlto
}

for (const b of presupuestos) {
  p(`@${b.ancho}x${b.alto}`)
  p(`   util HOY (pt-20 + pb-2):                    ${b.utilHoy.toFixed(2)} px`)
  p(`   util con el aire SIMETRICO (pt-2 + pb-2):   ${b.utilSimetrico.toFixed(2)} px`)
  p(`   bloque de texto HOY (medido):               ${b.bloqueDeTextoHoy.toFixed(2)} px`)
  p(`   bloque de texto con la REGLA 0 (medido):    ${b.bloqueDeTextoConRegla0.toFixed(2)} px   (-${(b.bloqueDeTextoHoy - b.bloqueDeTextoConRegla0).toFixed(2)})`)
  p(`   la marca HOY: palabra ${b.logotipoHoy.toFixed(2)} + hueco ${HUECO} + isotipo ${b.isotipoHoy.toFixed(2)} = ${b.marcaHoy.toFixed(2)} px`)
  p(`   TECHOS del factor:`)
  p(`      por ALTO con el aire simetrico y un respiro de ${HUECO} px por lado: x${b.techoPorAlto.toFixed(4)}`)
  p(`      por ALTO si se dejara \`pt-20\`:                                     x${b.techoPorAltoConPtHoy.toFixed(4)}`)
  p(`      por ANCHO (el isotipo en la caja de ${b.cajaDelTitular.toFixed(2)} px):                  x${b.techoPorAncho.toFixed(4)}`)
  p(`   FACTOR APLICADO x${b.factor.toFixed(5)}`)
  p(`      isotipo ${b.isotipoAlto.toFixed(2)} px de alto x ${b.isotipoAncho.toFixed(2)} de ancho  (hoy ${b.isotipoHoy.toFixed(2)} x ${(b.isotipoHoy * RAZON_DEL_ISOTIPO).toFixed(2)})`)
  p(`      palabra ${b.logotipoTamano.toFixed(2)} px  (hoy ${(b.logotipoTamano / b.factor).toFixed(2)})`)
  p(`      columna ${b.columna.toFixed(2)} px de ${b.utilSimetrico.toFixed(2)} utiles  ->  sobrante ${b.sobrante.toFixed(2)} px`)
  p(`      aire arriba ${b.aireArriba.toFixed(2)} px · aire abajo ${b.aireAbajo.toFixed(2)} px  ${b.sobrante >= HUECO * 2 ? 'ENTRA' : '<- NO ENTRA con el respiro pedido'}`)
  p('')
}

const TOPE = Math.min(...presupuestos.map((b) => Math.min(b.techoPorAlto, b.techoPorAncho)))
p(`el techo COMUN a los dos anchos es x${TOPE.toFixed(4)} y el factor derivado es x${FACTOR_DE_LA_MARCA.toFixed(5)} — ${FACTOR_DE_LA_MARCA <= TOPE ? 'queda por debajo' : 'SE PASA'}`)
p('')

mkdirSync(SALIDA, { recursive: true })
writeFileSync(
  path.join(SALIDA, 'b-derivacion.json'),
  `${JSON.stringify(
    {
      avances: {
        fila1: AVANCE_FILA_1,
        fila2: AVANCE_FILA_2,
        fila3: AVANCE_FILA_3,
        logotipo: AVANCE_LOGOTIPO,
        bajadaEntera: AVANCE_BAJADA,
      },
      razonDelIsotipo: RAZON_DEL_ISOTIPO,
      leadingTitulo: LEADING_TITULO,
      leadingTexto: LEADING_TEXTO,
      hueco: HUECO,
      factorDeLaMarca: FACTOR_DE_LA_MARCA,
      techoComun: TOPE,
      regla0,
      presupuestos,
    },
    null,
    2,
  )}\n`,
)
writeFileSync(path.join(SALIDA, 'b-derivacion.txt'), `${lineas.join('\n')}\n`)
console.log(`\nescrito en ${path.relative(RAIZ, SALIDA)}`)
