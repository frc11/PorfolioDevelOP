/**
 * LA SUPERPOSICIÓN — nuestra tabla contra la de heatbureau.com, muesca por muesca.
 *
 *     npx tsx scripts-b4/ref-tabla.ts            (la referencia)
 *     npx tsx scripts-b4/ref-tabla.ts --nuestra  (nuestra página)
 *     npx tsx scripts-b4/ref-comparar.ts
 *
 * No mide nada: lee los dos volcados crudos de la MISMA sonda y los pone uno al
 * lado del otro en la regla de ella (`yRef`). Sale un archivo de texto legible.
 *
 * ── ⚠️ TRES COMPARACIONES, Y SÓLO DOS PUEDEN COINCIDIR ─────────────────────
 *
 *   A · **la escala PROPIA de cada capa** contra la de su capa en ella. Es la
 *       tabla: tiene que coincidir.
 *   B · **el tamaño EN PANTALLA**, normalizado al cuadro, contra lo que mediría
 *       NUESTRA caja con SUS escalas medidas multiplicadas a lo largo de NUESTRA
 *       cadena. Lo nuestro sale del DOM y la predicción de sus escalas: si las
 *       capas no estuvieran anidadas de verdad, no coincidiría. Para los
 *       proyectos la caja es el cuadro; para el CTA es nuestra ventana —0,62 del
 *       cuadro con la conversión de la tabla—, una decisión nuestra y declarada.
 *   C · **el tamaño en pantalla contra el SUYO crudo.** NO puede coincidir, y se
 *       muestra la razón medida al lado de la que se explica: en los proyectos es
 *       `1 / (s0 · s1)` —sus #0 y #1, que nuestra cadena no tiene—; en el CTA
 *       además la caja, porque su botón mide 244 px y nuestra ventana 893.
 *
 * ── EL MARGEN: un píxel de scroll y un píxel de pantalla ────────────────────
 *
 * Una muestra coincide si cae sobre la curva de ella con a lo sumo **1 px de
 * corrimiento de scroll** y **1 px de diferencia en pantalla**. Son las dos
 * resoluciones del instrumento: una muesca aterriza en un píxel entero de scroll
 * en los dos sitios, y una caja se pinta en píxeles enteros.
 *
 * ── Y QUÉ PESA CADA MUESTRA ─────────────────────────────────────────────────
 *
 * Las muestras se cuentan por separado: en su PISO (antes de arrancar), en la
 * RAMPA y en su TOPE. Las de piso y tope no son gratis —prueban que la capa esté
 * en 0 antes de su scroll y que su tope sea el de la tabla sin redondear— pero la
 * que prueba la curva es la rampa, y el resumen dice cuántas hay.
 */

import { readFileSync, writeFileSync } from 'node:fs'

const CACHE = 'C:/Users/Valentino/.cache/b4-medicion'
const SALIDA = `${CACHE}/ref-comparacion.txt`

interface Capa {
  readonly id: number
  readonly rol?: string | null
  readonly ancho: number
  readonly escalaAcumulada: number
  readonly escalaPropia: number
}
interface Paso {
  readonly scrollY: number
  readonly yRef?: number
  readonly anchoDelCuadro?: number
  readonly escenarioPropio?: number
  readonly capas: readonly Capa[]
}

/** El cuadro útil de la referencia: 1.440 menos los 15 px de su barra de scroll. */
const CUADRO_DE_ELLA = 1425
/** Su CTA es un botón de 244 px de ancho: la caja base que su cadena escala. */
const CAJA_DE_SU_CTA = 244 / CUADRO_DE_ELLA
/** Nuestra ventana del CTA mide 0,62 del cuadro y lleva la conversión de la tabla. */
const ANCHO_DEL_CTA = 0.62
const CONVERSION = 1 / (1.3 * 0.9 * 1.2 * 1.05 * 0.4)
const CAJA_DE_NUESTRO_CTA = ANCHO_DEL_CTA * CONVERSION

/** Las rampas de ella que usa nuestra cadena, para saber cuánto recorre cada curva en 1 px. */
const RAMPAS: Record<string, { readonly de: number; readonly a: number; readonly arranca: number; readonly topa: number }> = {
  escenario: { de: 1, a: 1.3, arranca: 199, topa: 1420 },
  '#2': { de: 0, a: 0.9, arranca: 810, topa: 1720 },
  '#3': { de: 0, a: 1.2, arranca: 1303, topa: 1983 },
  '#4': { de: 0, a: 1.05, arranca: 1636, topa: 2236 },
  '#5': { de: 0, a: 0.4, arranca: 1873, topa: 2290 },
}
const pendienteEn = (k: string, y: number): number => {
  const r = RAMPAS[k]
  return y > r.arranca && y < r.topa ? (r.a - r.de) / (r.topa - r.arranca) : 0
}
const tramo = (k: string, y: number): 'piso' | 'rampa' | 'tope' => {
  const r = RAMPAS[k]
  return y <= r.arranca ? 'piso' : y >= r.topa ? 'tope' : 'rampa'
}

/** Qué capa suya es cada una nuestra. */
const PAREJAS = [
  { nuestra: 'escenario', suya: 'escenario' },
  { nuestra: 'proyecto-0', suya: '#2' },
  { nuestra: 'proyecto-1', suya: '#3' },
  { nuestra: 'proyecto-2', suya: '#4' },
  { nuestra: 'cta', suya: '#5' },
] as const
const CADENA = ['escenario', '#2', '#3', '#4', '#5']

const refCruda = JSON.parse(readFileSync(`${CACHE}/ref-tabla-crudo.json`, 'utf8')) as Paso[]
const nuestraCruda = JSON.parse(readFileSync(`${CACHE}/ref-tabla-nuestra-crudo.json`, 'utf8')) as {
  readonly antesDelTunel: readonly { scrollY: number; mayorAncho: number; cuantas?: number }[]
  readonly pasos: readonly Paso[]
}

type Lectura = Map<string, { propia: number; enPantalla: number }>

/** Las escalas propias de ella en un `y`: sus seis imágenes y el escenario. */
function suyasEn(paso: Paso): Lectura {
  const m: Lectura = new Map()
  for (const c of paso.capas) m.set(`#${String(c.id)}`, { propia: c.escalaPropia, enPantalla: c.ancho / CUADRO_DE_ELLA })
  const d0 = paso.capas.find((c) => c.id === 0)
  if (d0 !== undefined && d0.escalaPropia !== 0) m.set('escenario', { propia: d0.escalaAcumulada / d0.escalaPropia, enPantalla: Number.NaN })
  return m
}

/** Las nuestras en un `y`, por rol. El escenario, de su propio elemento. */
function nuestrasEn(paso: Paso): Lectura {
  const cuadro = paso.anchoDelCuadro ?? 1440
  const m: Lectura = new Map()
  for (const c of paso.capas) if (c.rol !== null && c.rol !== undefined) m.set(c.rol, { propia: c.escalaPropia, enPantalla: c.ancho / cuadro })
  if (paso.escenarioPropio !== undefined && Number.isFinite(paso.escenarioPropio)) {
    m.set('escenario', { propia: paso.escenarioPropio, enPantalla: Number.NaN })
  }
  return m
}

const ref = new Map<number, Lectura>()
for (const p of refCruda) if (p.capas.length > 0) ref.set(Math.round(p.scrollY), suyasEn(p))

const filas: string[] = []
const resumen: string[] = []
const f = (v: number, d = 5): string => (Number.isFinite(v) ? v.toFixed(d).padStart(d + 3) : '    —   ')

const antes = nuestraCruda.antesDelTunel
const minimoCensado = Math.min(...antes.map((a) => a.cuantas ?? 0))
const sinPareja = nuestraCruda.pasos.filter((p) => !ref.has(Math.round(p.yRef ?? Number.NaN))).map((p) => Math.round(p.yRef ?? Number.NaN))

filas.push('SUPERPOSICIÓN — nuestra tabla contra la de heatbureau.com, en la regla de ella')
filas.push('Misma sonda (scripts-b4/ref-tabla.ts), 1440 × 900, muescas de rueda reales, cada paso posado.')
filas.push('Margen: 1 px de corrimiento de scroll y 1 px de pantalla. Ver el docblock de scripts-b4/ref-comparar.ts.')
filas.push('')
filas.push(
  `ANTES DEL TÚNEL (llegada y huida del cartel): ${antes.length} muestras, entre ${String(minimoCensado)} y ${String(Math.max(...antes.map((a) => a.cuantas ?? 0)))} capas censadas en cada una, la más ancha ${Math.max(...antes.map((a) => a.mayorAncho)).toFixed(2)} px` +
    (minimoCensado < 4 ? '   ⚠️ UNA MUESTRA CENSÓ MENOS DE 4 CAPAS: ese 0 puede ser un túnel que no estaba' : ''),
)
filas.push(`Filas nuestras sin muesca de ella en el mismo yRef (no se comparan): ${sinPareja.length === 0 ? 'ninguna' : sinPareja.join(', ')}`)
filas.push('')

for (const pareja of PAREJAS) {
  const cuenta = { piso: { n: 0, dentro: 0 }, rampa: { n: 0, dentro: 0 }, tope: { n: 0, dentro: 0 } }
  let peorA = 0
  let peorB = 0
  const razonesC: number[] = []
  filas.push(`══ ${pareja.nuestra.toUpperCase()}  ←→  su ${pareja.suya} ${'═'.repeat(50)}`)
  filas.push('  yRef  tramo │  A · escala propia             │  B · en pantalla / cuadro contra su cadena │  C · contra su capa cruda')
  filas.push('              │   ella    nuestra      Δ    ok │  predicha  nuestra      Δ    margen  ok │  la suya   medida  explicada')
  for (const paso of nuestraCruda.pasos) {
    const y = Math.round(paso.yRef ?? Number.NaN)
    const suyas = ref.get(y)
    if (suyas === undefined) continue
    const n = nuestrasEn(paso).get(pareja.nuestra)
    const s = suyas.get(pareja.suya)
    if (n === undefined || s === undefined) continue
    const t = tramo(pareja.suya, y)
    // A
    const dA = n.propia - s.propia
    const margenA = 1 / 1440 + pendienteEn(pareja.suya, y)
    const okA = Math.abs(dA) <= margenA
    peorA = Math.max(peorA, Math.abs(dA) / margenA)
    if (pareja.nuestra === 'escenario') {
      cuenta[t].n += 1
      cuenta[t].dentro += okA ? 1 : 0
      filas.push(`${String(y).padStart(6)}  ${t.padEnd(5)} │ ${f(s.propia)} ${f(n.propia)} ${f(dA, 6)} ${okA ? 'sí' : 'NO'} │ (el escenario no tiene caja propia que medir)`)
      continue
    }
    // B: lo que mediría nuestra caja con SUS escalas por nuestra cadena
    const hasta = CADENA.indexOf(pareja.suya)
    let predicha = CADENA.slice(0, hasta + 1).reduce((p, k) => p * (suyas.get(k)?.propia ?? Number.NaN), 1)
    if (pareja.nuestra === 'cta') predicha *= CAJA_DE_NUESTRO_CTA
    // El margen en pantalla: 1 px de pintura más lo que la curva recorre en 1 px
    // de scroll, que en un producto es la suma de las tasas de toda la cadena.
    const tasa = CADENA.slice(0, hasta + 1).reduce((acc, k) => acc + pendienteEn(k, y) / Math.max(suyas.get(k)?.propia ?? 1, 1e-9), 0)
    const margenB = 1 / 1440 + (predicha > 0 ? predicha * tasa : 0)
    const dB = n.enPantalla - predicha
    const okB = Math.abs(dB) <= margenB
    peorB = Math.max(peorB, Math.abs(dB) / margenB)
    cuenta[t].n += 1
    cuenta[t].dentro += okA && okB ? 1 : 0
    // C: la razón medida contra la que se explica
    const s0 = suyas.get('#0')?.propia ?? Number.NaN
    const s1 = suyas.get('#1')?.propia ?? Number.NaN
    const explicada = (1 / (s0 * s1)) * (pareja.nuestra === 'cta' ? CAJA_DE_NUESTRO_CTA / CAJA_DE_SU_CTA : 1)
    const medida = s.enPantalla > 0 ? n.enPantalla / s.enPantalla : Number.NaN
    if (Number.isFinite(medida)) razonesC.push(medida / explicada)
    filas.push(
      `${String(y).padStart(6)}  ${t.padEnd(5)} │ ${f(s.propia)} ${f(n.propia)} ${f(dA, 6)} ${okA ? 'sí' : 'NO'} │ ${f(predicha)} ${f(n.enPantalla)} ${f(dB, 6)} ${f(margenB, 5)} ${okB ? 'sí' : 'NO'} │ ${f(s.enPantalla)}  ${Number.isFinite(medida) ? `×${medida.toFixed(3)}` : '   —  '}  ${Number.isFinite(medida) ? `×${explicada.toFixed(3)}` : ''}`,
    )
  }
  filas.push('')
  const partes = (['piso', 'rampa', 'tope'] as const).map((k) => `${k} ${String(cuenta[k].dentro)}/${String(cuenta[k].n)}`).join(' · ')
  const residuo =
    razonesC.length === 0 ? '' : `   C: medida / explicada entre ${Math.min(...razonesC).toFixed(3)} y ${Math.max(...razonesC).toFixed(3)} (${String(razonesC.length)} muestras con tamaño)`
  resumen.push(
    `${pareja.nuestra.padEnd(11)} ←→ su ${pareja.suya.padEnd(9)}  adentro del margen: ${partes}   peor A ${(peorA * 100).toFixed(1)} %` +
      (pareja.nuestra === 'escenario' ? '' : `  peor B ${(peorB * 100).toFixed(1)} % del margen`) +
      residuo,
  )
}

const texto = [...filas, 'RESUMEN (piso = antes de arrancar · rampa = creciendo · tope = ya topada)', ...resumen, ''].join('\n')
writeFileSync(SALIDA, texto)
console.log(resumen.join('\n'))
console.log(`\ncomparación en ${SALIDA}`)
