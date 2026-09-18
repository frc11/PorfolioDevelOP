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
 *   2. El token tiene consumidor, y el desenfoque también: la pastilla usa
 *      los dos. Un token sin consumidor es lo que esta corrección vino a
 *      arreglar; emitir otro igual sería repetir el defecto.
 *
 * ⚠️ **Modo pulido sacó el contraste contra el peor caso** (la tinta sobre la
 * superficie compuesta, y el control con la alfa 0,4 de la referencia): era
 * composición — dependía de qué hay detrás en cada tema.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { leer } from './s3-archivos'
import { SECCION_INVERTIDA, tokensDelBloque, tokensDelTema } from './s3-css'

const tokens = tokensDelTema()
const TOKEN = '--color-superficie-translucida'

/** Los dos extremos del sistema. Se releen del tema, no se transcriben. */
const PAPEL = tokens.get('--color-fondo') ?? ''

/** Lo que la sección invertida REDEFINE. Se lee del bloque, no del archivo
 *  entero: un recorrido plano devolvería el invertido como si fuera la base. */
const invertido = tokensDelBloque(SECCION_INVERTIDA)
const PAPEL_INV = invertido.get('--color-fondo') ?? ''

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
