/**
 * INVARIANTE — la cuarta superficie: el papel translúcido, y la corrección a
 * S0 que la trajo.
 *
 * Corre con `npm run test:s3-papel`.
 *
 * ── Qué corrige ───────────────────────────────────────────────────────────
 *
 * S0 emitió `--blur-panel: 12px` —medido en la pastilla flotante— y ninguna
 * superficie translúcida sobre la cual ese desenfoque signifique algo.
 * `backdrop-filter` sobre un fondo opaco no se ve: el sistema declaró un
 * desenfoque sin declarar sobre qué. La mitad que faltaba es esta.
 *
 * ── Qué afirma ────────────────────────────────────────────────────────────
 *
 *   1. La alfa NO se inventó: sale de la escala de opacidad del sistema.
 *   2. La tinta pasa AA como texto sobre la superficie compuesta **con el
 *      fondo peor caso detrás**, en los DOS temas.
 *   3. La alfa MEDIDA en la referencia (0,4) **no pasa** — ése es el control
 *      positivo que hace que el punto 2 signifique algo, y es además la razón
 *      documentada por la que nuestro valor no es el suyo.
 *   4. El token tiene consumidor, y el desenfoque también: la pastilla usa
 *      los dos. Un token sin consumidor es lo que esta corrección vino a
 *      arreglar; emitir otro igual sería repetir el defecto.
 *
 * ── El peor caso, y por qué es ése ────────────────────────────────────────
 *
 * La pastilla flotante **no se invierte con lo que pasa por atrás**: su tema
 * lo fija su ancestro en el DOM, no lo que se ve a través. Así que una
 * pastilla clara viajando sobre una sección invertida es una configuración
 * real, y el fondo peor caso de cada tema es el fondo del OTRO.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from './afirmar'
import { leer } from './s3-archivos'
import { SECCION_INVERTIDA, tokensDelBloque, tokensDelTema } from './s3-css'

const tokens = tokensDelTema()
const TOKEN = '--color-superficie-translucida'

/** Los dos extremos del sistema. Se releen del tema, no se transcriben. */
const PAPEL = tokens.get('--color-fondo') ?? ''
const TINTA = tokens.get('--color-tinta') ?? ''

/** Lo que la sección invertida REDEFINE. Se lee del bloque, no del archivo
 *  entero: un recorrido plano devolvería el invertido como si fuera la base. */
const invertido = tokensDelBloque(SECCION_INVERTIDA)
const PAPEL_INV = invertido.get('--color-fondo') ?? ''
const TINTA_INV = invertido.get('--color-tinta') ?? ''

interface Rgba {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

function leerRgba(valor: string): Rgba | null {
  const m = /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)[\s,/]+([\d.]+)\s*\)/.exec(valor)
  if (m === null) return null
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: Number(m[4]) }
}

const leerHex = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Compone la superficie sobre un fondo y devuelve el hex resultante.
 *
 * Se redondea a 8 bits **antes** de medir a propósito: es lo que la pantalla
 * pinta de verdad, y medir sobre el flotante daría una razón que nadie ve.
 */
function componer(frente: Rgba, fondoHex: string): string {
  const f = leerHex(fondoHex)
  const canal = (delFrente: number, delFondo: number): string =>
    Math.round(frente.a * delFrente + (1 - frente.a) * delFondo)
      .toString(16)
      .padStart(2, '0')
  return `#${canal(frente.r, f[0])}${canal(frente.g, f[1])}${canal(frente.b, f[2])}`
}

/** La razón de la tinta sobre la superficie compuesta con `fondo` detrás. */
function razonSobre(superficie: Rgba, fondo: string, tinta: string): number {
  return razonDeContraste(tinta, componer(superficie, fondo))
}

const AA_TEXTO = 4.5

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El token existe en los dos temas, y su alfa sale de la escala')

const claro = leerRgba(tokens.get(TOKEN) ?? '')
const oscuro = leerRgba(invertido.get(TOKEN) ?? '')

afirmar(claro !== null, `${TOKEN} existe en el tema claro`, tokens.get(TOKEN))
afirmar(oscuro !== null, `  y está redefinido en la sección invertida`, invertido.get(TOKEN))
afirmarIgual([claro?.r, claro?.g, claro?.b], leerHex(PAPEL), '  el claro ES el papel, canal por canal')
afirmarIgual([oscuro?.r, oscuro?.g, oscuro?.b], leerHex(PAPEL_INV), '  y el oscuro ES el fondo invertido')

const opacidadCasi = Number(tokens.get('--opacity-casi'))
afirmarIgual(claro?.a, opacidadCasi, 'la alfa clara es --opacity-casi, no un número inventado')
afirmarIgual(oscuro?.a, opacidadCasi, 'y la oscura es la misma')
afirmarIgual(opacidadCasi, 0.6, '  que vale 0,6')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La tinta pasa AA con el fondo PEOR CASO detrás')

const razonClaro = claro === null ? 0 : razonSobre(claro, PAPEL_INV, TINTA)
const razonInvertido = oscuro === null ? 0 : razonSobre(oscuro, PAPEL, TINTA_INV)

console.log(`  claro      ${TINTA} sobre ${claro === null ? '?' : componer(claro, PAPEL_INV)}  (fondo ${PAPEL_INV} detrás)  →  ${razonClaro.toFixed(4)}:1`)
console.log(`  invertida  ${TINTA_INV} sobre ${oscuro === null ? '?' : componer(oscuro, PAPEL)}  (fondo ${PAPEL} detrás)  →  ${razonInvertido.toFixed(4)}:1`)

afirmar(razonClaro >= AA_TEXTO, `la tinta pasa AA sobre el papel translúcido`, `${razonClaro.toFixed(4)}:1`)
afirmar(razonInvertido >= AA_TEXTO, `y la tinta clara también, en la sección invertida`, `${razonInvertido.toFixed(4)}:1`)

// Sobre el fondo de su PROPIO tema —el caso cómodo— tiene que pasar holgado.
const razonClaroPropio = claro === null ? 0 : razonSobre(claro, PAPEL, TINTA)
afirmar(
  razonClaroPropio > razonClaro,
  '  y sobre su propio papel pasa con más holgura, como corresponde',
  `${razonClaroPropio.toFixed(4)}:1 contra ${razonClaro.toFixed(4)}:1 en el peor caso`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL CONTROL — la alfa medida en la referencia NO pasa')

/**
 * `rgba(236, 236, 236, 0.4)` es el halo del cursor sobre sección clara, y es
 * la única alfa clara medida en toda la referencia. Reproducirla acá es lo
 * que el método manda; el resultado es lo que obligó a subirla.
 *
 * Este control hace dos cosas a la vez: prueba que la medición de arriba no
 * es una función que devuelve "pasa" siempre, y documenta por qué nuestro
 * valor no es el suyo.
 */
const ALFA_MEDIDA_EN_LA_REFERENCIA = 0.4
const conAlfaDeEllos = claro === null ? null : { ...claro, a: ALFA_MEDIDA_EN_LA_REFERENCIA }
const razonDeEllosClaro = conAlfaDeEllos === null ? 0 : razonSobre(conAlfaDeEllos, PAPEL_INV, TINTA)
const conAlfaDeEllosInv = oscuro === null ? null : { ...oscuro, a: ALFA_MEDIDA_EN_LA_REFERENCIA }
const razonDeEllosInv = conAlfaDeEllosInv === null ? 0 : razonSobre(conAlfaDeEllosInv, PAPEL, TINTA_INV)

console.log(`  con la alfa de ellos (0,4):  claro ${razonDeEllosClaro.toFixed(4)}:1  ·  invertida ${razonDeEllosInv.toFixed(4)}:1`)

afirmar(razonDeEllosClaro < AA_TEXTO, '[control positivo] con 0,4 la tinta NO pasa en claro', `${razonDeEllosClaro.toFixed(4)}:1`)
afirmar(razonDeEllosInv < AA_TEXTO, '[control positivo] ni en la sección invertida', `${razonDeEllosInv.toFixed(4)}:1`)

// Y el escalón intermedio: 0,5 pasa en claro y falla invertida. Es la razón
// por la que la alfa no se quedó ahí, y es la que muestra que el piso lo fija
// el tema invertido, no el claro.
const conMedia = claro === null ? null : { ...claro, a: 0.5 }
const conMediaInv = oscuro === null ? null : { ...oscuro, a: 0.5 }
const razonMediaClaro = conMedia === null ? 0 : razonSobre(conMedia, PAPEL_INV, TINTA)
const razonMediaInv = conMediaInv === null ? 0 : razonSobre(conMediaInv, PAPEL, TINTA_INV)
afirmar(
  razonMediaClaro >= AA_TEXTO && razonMediaInv < AA_TEXTO,
  'con 0,5 pasa en claro y falla invertida: el piso lo fija el tema oscuro',
  `${razonMediaClaro.toFixed(4)}:1 contra ${razonMediaInv.toFixed(4)}:1`,
)

controlPositivo(
  'la razón de contraste no devuelve "pasa" para cualquier par',
  ['#F7F7F5', '#F1F1EF'] as const,
  ([a, b]) => razonDeContraste(a, b) >= AA_TEXTO,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El token tiene consumidor, y el desenfoque dejó de estar muerto')

const hoja = leer('src/app/v3/_estilos/navegacion.css')
afirmar(hoja.includes(`var(${TOKEN})`), 'la pastilla consume la superficie translúcida')
afirmar(hoja.includes('backdrop-filter'), '  y aplica un backdrop-filter')
afirmar(hoja.includes('var(--blur-panel)'), '  con --blur-panel, que era el token sin superficie')
afirmar(tokens.has('--blur-panel'), 'y --blur-panel sigue siendo el que emitió S0', tokens.get('--blur-panel'))

controlPositivo(
  'el buscador de consumidores vería un token que nadie usa',
  '--color-que-nadie-consume',
  (nombre) => hoja.includes(`var(${nombre})`),
)

cerrar('s3-papel-translucido.invariant')
