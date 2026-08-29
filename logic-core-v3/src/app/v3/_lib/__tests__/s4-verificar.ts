/**
 * `npm run verificar` — LA COMPUERTA DE CIERRE.
 *
 *     npm run verificar [--completo] [--paquete <ruta>]
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * El merge de `rediseno/motion` dejó marcadores de conflicto adentro de
 * `package.json`. **`tsc --noEmit` dio exit 0 dos veces sobre ese árbol roto**
 * — no lee `package.json`. Recién `npm run` lo destapó. O sea: el árbol se dio
 * por verificado dos veces con un archivo de scripts partido al medio.
 *
 * ── Los cuatro pasos, EN ORDEN Y SIN `&&` ─────────────────────────────────
 *
 *   1. `package.json` es JSON válido, sin marcadores de conflicto y sin claves
 *      duplicadas.
 *   2. `tsc --noEmit`.
 *   3. Los agregados de invariantes — todos los que existan.
 *   4. Resumen, y código de salida distinto de cero si algo falló.
 *
 * **Ningún paso corta a los siguientes.** Es la misma lección que el Problema 0
 * de este sprint: una falla temprana que esconde lo que viene después no
 * informa "hay una falla", informa "no sé nada del resto".
 *
 * ── Lo que este gate NO corre, y es a propósito ───────────────────────────
 *
 * Los **checks de frontera** (`npm run test:frontera`) miden el momento del
 * sprint, no el código: comparan el árbol de trabajo contra `HEAD` y sólo
 * significan algo ANTES del commit. Meterlos acá los haría inútiles el día
 * después de cada merge. El gate lo recuerda al pie.
 *
 * ── `--paquete <ruta>`, y por qué existe ──────────────────────────────────
 *
 * Apunta el paso 1 a otro archivo. **Sirve sólo para el control positivo**: un
 * `package.json` con un marcador de conflicto y otro con una clave duplicada
 * tienen que hacer fallar este gate, cada uno con su mensaje, y eso no se puede
 * demostrar rompiendo el `package.json` de verdad.
 */

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { correrSuite, suitesDelPaquete, totalizar } from './s4-agregado'
import { RAIZ } from './s4-corrida'
import { revisarPaquete } from './s4-paquete'

interface Paso {
  readonly nombre: string
  readonly ok: boolean
  readonly detalle: string
}

function paso1Paquete(ruta: string): Paso {
  const relativa = path.relative(RAIZ, ruta).replace(/\\/g, '/') || ruta
  console.log(`\n═══ PASO 1 — ${relativa}: JSON válido, sin conflictos, sin claves duplicadas`)
  let texto: string
  try {
    texto = readFileSync(ruta, 'utf8')
  } catch {
    console.error(`  FALLA no se pudo leer ${relativa}`)
    return { nombre: '1 · package.json', ok: false, detalle: 'ilegible' }
  }
  const problemas = revisarPaquete(texto)
  if (problemas.length === 0) {
    console.log(`  ok   sin marcadores de conflicto, JSON válido, cero claves duplicadas`)
    return { nombre: '1 · package.json', ok: true, detalle: 'limpio' }
  }
  for (const p of problemas) console.error(`  FALLA [${p.clase}] ${p.detalle}`)
  const clases = [...new Set(problemas.map((p) => p.clase))].join(', ')
  return { nombre: '1 · package.json', ok: false, detalle: `${problemas.length} problema(s): ${clases}` }
}

function paso2Tsc(): Paso {
  console.log('\n═══ PASO 2 — tsc --noEmit')
  const desde = Date.now()
  const proceso = spawnSync(
    process.execPath,
    [path.join(RAIZ, 'node_modules/typescript/bin/tsc'), '--noEmit'],
    { cwd: RAIZ, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true },
  )
  const segundos = ((Date.now() - desde) / 1000).toFixed(1)
  const salida = `${proceso.stdout ?? ''}${proceso.stderr ?? ''}`.trim()
  if (proceso.status === 0) {
    console.log(`  ok   sin errores de tipos  (${segundos}s)`)
    return { nombre: '2 · tsc --noEmit', ok: true, detalle: `${segundos}s` }
  }
  console.error(salida.replace(/^/gm, '  │ '))
  const errores = (salida.match(/error TS\d+/g) ?? []).length
  return { nombre: '2 · tsc --noEmit', ok: false, detalle: `${errores} error(es) de tipos` }
}

function paso3Agregados(completo: boolean): Paso[] {
  console.log('\n═══ PASO 3 — los agregados de invariantes')
  const derivacion = suitesDelPaquete()
  if (derivacion.problemas.length > 0) {
    console.error('  FALLA la derivación de suites desde package.json no cerró:')
    for (const p of derivacion.problemas) console.error(`        · ${p}`)
    return [{ nombre: '3 · agregados', ok: false, detalle: `${derivacion.problemas.length} problema(s) de derivación` }]
  }
  if (derivacion.permanentes.length === 0) {
    console.error('  FALLA cero suites permanentes: eso es verde por vacío, no verde.')
    return [{ nombre: '3 · agregados', ok: false, detalle: 'sin suites' }]
  }
  console.log(
    `  suites derivadas de package.json: ${derivacion.permanentes.map((s) => `${s.nombre}(${s.invariantes.length})`).join(' · ')}` +
      `  ·  fuera del agregado: frontera(${derivacion.frontera.invariantes.length})`,
  )
  return derivacion.permanentes.map((suite) => {
    const t = totalizar(correrSuite(suite, completo))
    return {
      nombre: `3 · agregado ${suite.nombre}`,
      ok: t.fallados === 0,
      detalle: `${t.corridos} invariantes · ${t.afirmaciones} afirmaciones · ${t.controles} controles positivos · ${t.fueraDeVentana} fuera de ventana · ${t.fallados} con falla`,
    }
  })
}

function principal(): void {
  const argumentos = process.argv.slice(2)
  const completo = argumentos.includes('--completo')
  const i = argumentos.indexOf('--paquete')
  const rutaDelPaquete =
    i >= 0 && argumentos[i + 1] !== undefined
      ? path.resolve(RAIZ, argumentos[i + 1])
      : path.join(RAIZ, 'package.json')

  const pasos: Paso[] = [paso1Paquete(rutaDelPaquete), paso2Tsc(), ...paso3Agregados(completo)]

  console.log('\n═══ PASO 4 — resumen')
  for (const p of pasos) console.log(`  ${(p.ok ? 'ok' : 'FALLA').padEnd(6)} ${p.nombre.padEnd(22)} ${p.detalle}`)
  const fallados = pasos.filter((p) => !p.ok)
  console.log(
    `\n  verificar: ${pasos.length} pasos, ${fallados.length} con falla` +
      (fallados.length === 0 ? '' : ` — ${fallados.map((p) => p.nombre).join(', ')}`),
  )
  console.log('  · los checks de frontera NO corren acá: `npm run test:frontera`, y va ANTES del commit.')
  process.exit(fallados.length === 0 ? 0 : 1)
}

principal()
