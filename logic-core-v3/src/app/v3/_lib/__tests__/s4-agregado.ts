/**
 * EL AGREGADO — corre TODOS los invariantes de una suite, reporta TODOS, y sale
 * distinto de cero si alguno falló.
 *
 *     npx tsx src/app/v3/_lib/__tests__/s4-agregado.ts s1 [--completo]
 *
 * ── El defecto que reemplaza ──────────────────────────────────────────────
 *
 * `test:s1`, `test:s2` y `test:s3` encadenaban con `&&`. Una falla cortaba la
 * cadena. En la corrida real que motivó este sprint eso significó que
 * `test:s1-fuentes`, `test:s1-compuerta`, `test:s1-superficies`,
 * `test:s1-bundle`, `test:s2-galeria`, `test:s2-bundle` y `test:s2-css`
 * **nunca corrieron** — y `test:s2-bundle` es el que verifica que la
 * coreografía no cruza la compuerta.
 *
 * Un agregado que se detiene en la primera falla no informa "hay una falla":
 * informa "hay al menos una falla y no sé nada del resto". Las dos frases
 * suenan igual en una terminal y significan cosas muy distintas.
 *
 * ── Qué imprime ───────────────────────────────────────────────────────────
 *
 * Una línea por invariante con sus cifras, la salida COMPLETA de los que
 * fallaron —donde está lo que hay que leer— y un total al pie. Con `--completo`
 * imprime la salida de todos.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ, Resultado, correr, fallo } from './s4-corrida'
import { Suite, derivarSuites, scriptsDe } from './s4-suites'

export function suitesDelPaquete(): ReturnType<typeof derivarSuites> {
  const texto = readFileSync(path.join(RAIZ, 'package.json'), 'utf8')
  let datos: unknown
  try {
    datos = JSON.parse(texto)
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error)
    return { permanentes: [], frontera: { nombre: 'frontera', invariantes: [] }, problemas: [`package.json no parsea: ${detalle}`] }
  }
  return derivarSuites(scriptsDe(datos))
}

function linea(r: Resultado): string {
  const estado = fallo(r) ? 'FALLA' : r.fueraDeVentana > 0 ? 'parcial' : 'ok'
  const cifras = r.resumio
    ? `${r.afirmaciones} afirm · ${r.controles} ctrl+ · ${r.fallas} fallas${r.fueraDeVentana > 0 ? ` · ${r.fueraDeVentana} fuera de ventana` : ''}`
    : 'SIN RESUMEN — el invariante no llegó a cerrar'
  return `  ${estado.padEnd(7)} ${r.script.padEnd(24)} ${cifras}  (${(r.ms / 1000).toFixed(1)}s, exit ${r.codigo})`
}

export interface Totales {
  readonly corridos: number
  readonly fallados: number
  readonly afirmaciones: number
  readonly controles: number
  readonly fueraDeVentana: number
}

export function totalizar(resultados: readonly Resultado[]): Totales {
  return {
    corridos: resultados.length,
    fallados: resultados.filter(fallo).length,
    afirmaciones: resultados.reduce((n, r) => n + r.afirmaciones, 0),
    controles: resultados.reduce((n, r) => n + r.controles, 0),
    fueraDeVentana: resultados.reduce((n, r) => n + r.fueraDeVentana, 0),
  }
}

/** Corre la suite entera. Devuelve los resultados: no decide el código de salida. */
export function correrSuite(suite: Suite, completo: boolean): Resultado[] {
  console.log(`\n═══ AGREGADO ${suite.nombre} — ${suite.invariantes.length} invariantes, sin cortar en la primera falla`)
  const resultados: Resultado[] = []
  for (const invariante of suite.invariantes) {
    const r = correr(invariante.script, invariante.comando)
    resultados.push(r)
    console.log(linea(r))
    if (completo || fallo(r)) {
      console.log(`\n  ── salida de ${r.script} ${'─'.repeat(Math.max(0, 52 - r.script.length))}`)
      console.log(r.salida.replace(/^/gm, '  │ '))
      console.log('  ──')
    }
  }
  const t = totalizar(resultados)
  console.log(`\n  TOTAL ${suite.nombre}: ${t.corridos} invariantes · ${t.afirmaciones} afirmaciones · ${t.controles} controles positivos · ${t.fueraDeVentana} fuera de ventana · ${t.fallados} invariantes con falla`)
  return resultados
}

function principal(): void {
  const argumentos = process.argv.slice(2)
  const completo = argumentos.includes('--completo')
  const pedida = argumentos.find((a) => !a.startsWith('--'))

  const derivacion = suitesDelPaquete()
  if (derivacion.problemas.length > 0) {
    console.error('\nEl agregado NO corre: la derivación de suites desde package.json tiene problemas.')
    for (const p of derivacion.problemas) console.error(`  · ${p}`)
    process.exit(1)
  }

  const todas = [...derivacion.permanentes, derivacion.frontera]
  const suite = todas.find((s) => s.nombre === pedida)
  if (pedida === undefined || suite === undefined) {
    console.error(`\nUso: s4-agregado.ts <suite> [--completo]   suites: ${todas.map((s) => s.nombre).join(' ')}`)
    process.exit(1)
  }
  if (suite.invariantes.length === 0) {
    console.error(`\nLa suite \`${suite.nombre}\` no tiene invariantes: eso es verde por vacío, no verde.`)
    process.exit(1)
  }

  const resultados = correrSuite(suite, completo)
  process.exit(totalizar(resultados).fallados === 0 ? 0 : 1)
}

if (process.argv[1] !== undefined && process.argv[1].endsWith('s4-agregado.ts')) principal()
