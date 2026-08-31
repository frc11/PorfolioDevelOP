/**
 * INVARIANTE — el agregado cubre TODOS los invariantes que existen, y los
 * checks de frontera están declarados y afuera.
 *
 * Corre con `npm run test:s4-cobertura`.
 *
 * ── El caso que lo obligó ─────────────────────────────────────────────────
 *
 * `test:s3-peso` existía como script, tenía su archivo, y **no estaba en la
 * cadena de `test:s3`**. Nunca corrió en un agregado y nadie lo notó: una lista
 * escrita a mano no se queja de lo que le falta.
 *
 * Derivar la suite de `package.json` cierra ese agujero por construcción. Este
 * invariante custodia los dos que quedan:
 *
 *   · un **archivo** de invariante que no tenga ningún script — invisible desde
 *     `package.json`, así que se busca en el disco;
 *   · un **check de frontera** que se autoexcluya del agregado sin estar
 *     declarado.
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { suitesDelPaquete } from './s4-agregado'
import { RAIZ } from './s4-corrida'
import { CHECKS_DE_FRONTERA, derivarSuites, instrumentosSinScript, scriptsDe } from './s4-suites'

const derivacion = suitesDelPaquete()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La derivación desde package.json cierra')

afirmarIgual(derivacion.problemas, [], 'la derivación no reporta problemas')
afirmar(
  derivacion.permanentes.length > 0,
  `${derivacion.permanentes.length} suites permanentes`,
  derivacion.permanentes.map((s) => `${s.nombre}:${s.invariantes.length}`).join(' · '),
)
const cuantos = derivacion.permanentes.reduce((n, s) => n + s.invariantes.length, 0)
afirmar(cuantos > 0, `${cuantos} invariantes permanentes en total`, 'no es verde por vacío')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El caso concreto: `test:s3-peso` entró al agregado')

const enS3 = derivacion.permanentes
  .find((s) => s.nombre === 's3')
  ?.invariantes.map((i) => i.script) ?? []
afirmar(
  enS3.includes('test:s3-peso'),
  '`test:s3-peso` está en la suite s3 — el que la cadena a mano se había olvidado',
  `${enS3.length} invariantes en s3`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Ningún instrumento quedó sin script')

/**
 * ⚠ Se le pasan TODOS los scripts, no sólo los derivados. El repo tiene dos
 * cadenas —`test:sN-*` y `check:invariant:*`— y desde SITIO-S8 hay un directorio
 * (`src/lib/`) donde conviven. Un detector que sólo conociera la primera
 * reportaría como huérfanos a los de la segunda. Ver `s4-suites.ts`.
 */
const todosLosScripts = scriptsDe(JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8')))
const huerfanos = instrumentosSinScript(derivacion, todosLosScripts)
afirmarIgual(huerfanos, [], 'todo archivo `.invariant.*` de los directorios cableados tiene su script')
afirmar(
  Object.keys(todosLosScripts).some((s) => s.startsWith('check:invariant:')),
  '  y el detector ve las DOS cadenas: `check:invariant:*` también cablea',
  `${Object.keys(todosLosScripts).filter((s) => s.startsWith('check:invariant:')).length} scripts de la otra cadena`,
)

controlPositivo(
  'el buscador de huérfanos vería uno',
  derivacion,
  (d) => {
    const sinUno = {
      ...d,
      permanentes: d.permanentes.map((s) =>
        s.nombre === 's3' ? { ...s, invariantes: s.invariantes.filter((i) => i.script !== 'test:s3-peso') } : s,
      ),
    }
    return instrumentosSinScript(sinUno).length === 0
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los checks de frontera: declarados, y fuera del agregado')

afirmar(
  derivacion.frontera.invariantes.length === CHECKS_DE_FRONTERA.length,
  `${derivacion.frontera.invariantes.length} check(s) de frontera, los declarados`,
  CHECKS_DE_FRONTERA.join(' · '),
)
const enPermanentes = derivacion.permanentes.flatMap((s) => s.invariantes.map((i) => i.script))
afirmarIgual(
  enPermanentes.filter((s) => CHECKS_DE_FRONTERA.includes(s)),
  [],
  'ninguno de ellos entró en una suite permanente',
)

controlPositivo(
  'la derivación no deja pasar un check de frontera sin declarar',
  { 'test:s9-frontera': 'npx tsx src/app/v3/_lib/__tests__/afirmar.ts' },
  (scripts) => derivarSuites(scripts).problemas.length === 0,
)
controlPositivo(
  'ni un script con una forma de comando que no sabe correr',
  { 'test:s9-loquesea': 'node --loader ts-node/esm cualquier-cosa.ts' },
  (scripts) => derivarSuites(scripts).problemas.length === 0,
)
controlPositivo(
  'ni uno que apunte a un archivo inexistente',
  { 'test:s9-loquesea': 'npx tsx src/app/v3/_lib/__tests__/no-existe.invariant.ts' },
  (scripts) => derivarSuites(scripts).problemas.length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los instrumentos de S4 no pasan las 300 líneas')

const DIR = 'src/app/v3/_lib/__tests__'
const DE_S4 = readdirSync(path.join(RAIZ, DIR))
  .filter((n) => /^(s4-|poda\.ts$|padron-de-tokens\.ts$|afirmar\.ts$)/.test(n) && /\.tsx?$/.test(n))
  .map((n) => `${DIR}/${n}`)
  .sort()

const medidos = DE_S4.map((archivo) => ({
  archivo,
  lineas: readFileSync(path.join(RAIZ, archivo), 'utf8').split('\n').length,
}))
afirmarIgual(medidos.filter((m) => m.lineas > 300), [], `ninguno de los ${DE_S4.length} archivos de S4 pasa las 300 líneas`)
afirmar(DE_S4.length > 0, `${DE_S4.length} archivos medidos`, medidos.map((m) => `${path.basename(m.archivo)}:${m.lineas}`).join(' · '))

controlPositivo(
  'el medidor ve un archivo de 301 líneas',
  { archivo: 'inventado.ts', lineas: 301 },
  (m) => m.lineas <= 300,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Cada suite tiene su script, y ningún agregado vuelve a encadenar')

const scripts = scriptsDe(JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8')))
const CORREDOR = 'npx tsx src/app/v3/_lib/__tests__/s4-agregado.ts'
const NOMBRES = [...derivacion.permanentes.map((s) => s.nombre), derivacion.frontera.nombre]

/**
 * Una suite existe apenas alguien agrega un script `test:sN-loquesea`, pero el
 * atajo `test:sN` que la corre hay que escribirlo. Sin esto, un lane nuevo
 * tendría su suite viva en `npm run verificar` y ningún comando propio — y lo
 * notaría el día que lo necesite, no el día que lo olvidó.
 */
const sinAtajo = NOMBRES.filter((n) => scripts[`test:${n}`] !== `${CORREDOR} ${n}`)
afirmarIgual(sinAtajo, [], `las ${NOMBRES.length} suites tienen su \`test:<suite>\` apuntando al corredor`)

/**
 * EL GUARDIÁN DEL PROBLEMA 0, escrito como propiedad y no como intención: si
 * alguien vuelve a poner una cadena de `npm run … && npm run …` en un agregado,
 * esto falla. Una falla temprana que esconde a las que vienen después no informa
 * "hay una falla": informa "no sé nada del resto".
 */
const encadenados = Object.entries(scripts)
  .filter(([clave, comando]) => NOMBRES.includes(clave.replace(/^test:/, '')) && comando.includes('&&'))
  .map(([clave]) => clave)
afirmarIgual(encadenados, [], 'ningún agregado encadena con `&&`')

controlPositivo<Record<string, string>>(
  'el detector de encadenado lo vería',
  { 'test:s1': 'npm run test:s1-tokens && npm run test:s1-fuentes' },
  (falsos) =>
    Object.entries(falsos).filter(
      ([clave, comando]) => NOMBRES.includes(clave.replace(/^test:/, '')) && comando.includes('&&'),
    ).length === 0,
)
controlPositivo<Record<string, string>>(
  'y el de atajos vería uno que apunta a otra suite',
  { ...scripts, 'test:s1': `${CORREDOR} s2` },
  (falsos) => NOMBRES.filter((n) => falsos[`test:${n}`] !== `${CORREDOR} ${n}`).length === 0,
)

cerrar('s4-cobertura.invariant')
