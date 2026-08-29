/**
 * INVARIANTE — el agregado corre TODOS los invariantes y reporta TODAS las
 * fallas.
 *
 * Corre con `npm run test:s4-agregado`.
 *
 * ── Qué se está custodiando ───────────────────────────────────────────────
 *
 * Los agregados encadenaban con `&&`. En la corrida que motivó este sprint, dos
 * invariantes fallaron y **siete no llegaron a correr** — entre ellos
 * `test:s2-bundle`, el que verifica que la coreografía no cruza la compuerta.
 * Nadie lo supo hasta que se corrieron a mano.
 *
 * La propiedad que reemplaza a esa cadena es una sola: **con dos invariantes
 * fallando a propósito, el agregado tiene que reportar los dos, no el primero.**
 * Es exactamente lo que se mide acá.
 *
 * ── Por qué con fixtures y no con los invariantes de verdad ───────────────
 *
 * Porque para probarlo hay que tener fallas, y romper un invariante real para
 * demostrarlo es cambiar el sujeto. Los tres fixtures de `s4-fixtures/` fallan
 * o pasan siempre, no verifican nada del sitio, y no tienen script: existen
 * sólo para esta comprobación.
 *
 * El fixture que PASA importa tanto como los dos que fallan: sin él, un
 * agregado que devolviera "falla" para todo también daría verde acá.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { correrSuite, totalizar } from './s4-agregado'
import { fallo } from './s4-corrida'
import { Invariante, Suite } from './s4-suites'

const DIR = 'src/app/v3/_lib/__tests__/s4-fixtures'
const fixture = (nombre: string): Invariante => ({
  script: `fixture:${nombre}`,
  comando: `npx tsx ${DIR}/${nombre}.invariant.ts`,
  archivo: `${DIR}/${nombre}.invariant.ts`,
})

const SUITE_DE_PRUEBA: Suite = {
  nombre: 'fixtures',
  invariantes: [fixture('falla-a'), fixture('pasa'), fixture('falla-b')],
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Con dos fallas a propósito, el agregado reporta las dos')

/**
 * El orden del padrón es a-pasa-b a propósito: si el agregado cortara en la
 * primera falla, `pasa` y `falla-b` no aparecerían. Que `falla-b` esté al final
 * es lo que distingue "corrió todo" de "corrió hasta la primera falla".
 */
const resultados = correrSuite(SUITE_DE_PRUEBA, false)
const total = totalizar(resultados)

afirmarIgual(resultados.length, 3, 'corrió los tres fixtures, no se detuvo en el primero')
afirmarIgual(
  resultados.map((r) => r.script),
  ['fixture:falla-a', 'fixture:pasa', 'fixture:falla-b'],
  'y los reportó a los tres, en orden',
)

const fallados = resultados.filter(fallo).map((r) => r.script)
afirmarIgual(fallados, ['fixture:falla-a', 'fixture:falla-b'], 'las DOS fallas están en el reporte')
afirmarIgual(total.fallados, 2, 'y el total las cuenta como dos')

const queDioBien = resultados.filter((r) => !fallo(r)).map((r) => r.script)
afirmarIgual(queDioBien, ['fixture:pasa'], 'el que pasa se reporta como pasado: el agregado no dice "falla" a todo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las cifras del resumen salen de la salida real, no de un supuesto')

afirmar(
  resultados.every((r) => r.resumio),
  'los tres cerraron con su línea de resumen',
  resultados.map((r) => `${r.script}=${r.afirmaciones}a/${r.fallas}f`).join(' · '),
)
afirmarIgual(total.afirmaciones, 4, 'suma 4 afirmaciones: 1 + 1 + (1 + 1 control positivo)')
afirmarIgual(total.controles, 1, 'y 1 control positivo, el del fixture que pasa')
afirmarIgual(total.fueraDeVentana, 0, 'ningún fixture está fuera de ventana')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los controles del propio corredor')

controlPositivo(
  'el corredor cuenta como falla un invariante que NO llegó a resumir',
  { script: 'x', comando: '', codigo: 0, afirmaciones: 0, fallas: 0, fueraDeVentana: 0, controles: 0, resumio: false, ms: 0, salida: '' },
  (r) => !fallo(r),
)
controlPositivo(
  'y uno que salió en cero pero reportó fallas',
  { script: 'x', comando: '', codigo: 0, afirmaciones: 3, fallas: 1, fueraDeVentana: 0, controles: 0, resumio: true, ms: 0, salida: '' },
  (r) => !fallo(r),
)
controlPositivo(
  'y uno que resumió limpio pero salió distinto de cero',
  { script: 'x', comando: '', codigo: 1, afirmaciones: 3, fallas: 0, fueraDeVentana: 0, controles: 0, resumio: true, ms: 0, salida: '' },
  (r) => !fallo(r),
)

cerrar('s4-agregado.invariant')
