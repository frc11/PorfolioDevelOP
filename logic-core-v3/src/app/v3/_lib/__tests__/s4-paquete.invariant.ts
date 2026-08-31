/**
 * INVARIANTE — la compuerta sobre `package.json` ve las tres cosas que tiene
 * que ver, y cada una con su mensaje.
 *
 * Corre con `npm run test:s4-paquete`.
 *
 * ── El agujero ────────────────────────────────────────────────────────────
 *
 * El merge de `rediseno/motion` dejó marcadores de conflicto adentro de
 * `package.json`. **`tsc --noEmit` dio exit 0 dos veces sobre ese árbol roto.**
 * No lee `package.json`. Con siete lanes por venir, cada uno agrega scripts y
 * cada merge va a tocar ese archivo.
 *
 * ── Los fixtures son archivos, no strings ─────────────────────────────────
 *
 * `s4-fixtures/paquete-roto-*.json` son `package.json` rotos de verdad, y por
 * eso `npm run verificar -- --paquete <fixture>` puede demostrar que el gate
 * falla —cada uno con su mensaje— sin romper el `package.json` real.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s4-corrida'
import {
  EXCLUSIONES,
  archivosDelRepo,
  conflictosEnElRepo,
  conflictosIncluyendoLoExcluido,
} from './s4-conflictos'
import { clavesDuplicadas, marcadoresDeConflicto, revisarPaquete } from './s4-paquete'

const FIXTURES = 'src/app/v3/_lib/__tests__/s4-fixtures'
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

const clases = (texto: string): string[] => [...new Set(revisarPaquete(texto).map((p) => p.clase))].sort()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El `package.json` de verdad pasa las tres')

const real = leer('package.json')
afirmarIgual(revisarPaquete(real), [], 'el package.json del repo está limpio')
afirmar(real.length > 1000, `y el gate leyó ${real.length} caracteres`, 'no es verde por vacío')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Un marcador de conflicto: se ve, y se nombra como lo que es')

const conMarcador = leer(`${FIXTURES}/paquete-roto-marcador.json`)
const marcadores = marcadoresDeConflicto(conMarcador)
afirmarIgual(marcadores.length, 3, 'las tres marcas del conflicto, con su número de línea')
console.log(marcadores.map((m) => `       ${m}`).join('\n'))

afirmarIgual(
  clases(conMarcador),
  ['json-invalido', 'marcador-de-conflicto'],
  'el gate lo reporta como conflicto de merge Y como JSON inválido',
)
afirmar(
  revisarPaquete(conMarcador)[0].detalle.includes('merge sin resolver'),
  'y el primer mensaje dice "merge sin resolver", no "Unexpected token"',
  revisarPaquete(conMarcador)[0].detalle,
)

controlPositivo(
  'el detector de marcadores NO se dispara con el package.json sano',
  real,
  (texto) => marcadoresDeConflicto(texto).length > 0,
)
controlPositivo(
  'ni con un `=======` que no está a principio de línea',
  '{ "a": "x ======= y" }',
  (texto) => marcadoresDeConflicto(texto).length > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Una clave duplicada: JSON válido, y aun así rota')

const conDuplicada = leer(`${FIXTURES}/paquete-roto-clave-duplicada.json`)

/**
 * LA MEDICIÓN QUE JUSTIFICA EL RECORREDOR PROPIO. `JSON.parse` no se queja: se
 * queda con la última y descarta la anterior. Si el gate confiara en el parser,
 * este archivo pasaría en verde con un script pisado.
 */
interface Paquete {
  readonly scripts?: Record<string, string>
}
const parseado = JSON.parse(conDuplicada) as Paquete
afirmar(
  (parseado.scripts?.['test:s1'] ?? '').startsWith('echo'),
  'JSON.parse se queda con la ÚLTIMA y pisa la anterior en silencio',
  parseado.scripts?.['test:s1'],
)
afirmarIgual(Object.keys(parseado.scripts ?? {}).length, 3, 'y devuelve 3 claves donde el archivo escribe 4')

afirmarIgual(clavesDuplicadas(conDuplicada), ['scripts.test:s1'], 'el recorredor sí la ve, y la nombra con su ruta')
afirmarIgual(clases(conDuplicada), ['clave-duplicada'], 'el gate la reporta como clave duplicada y nada más: el JSON es válido')

controlPositivo(
  'el recorredor NO ve duplicados donde no los hay',
  real,
  (texto) => clavesDuplicadas(texto).length > 0,
)
controlPositivo(
  'y no confunde la misma clave en objetos hermanos',
  '{ "a": { "x": 1 }, "b": { "x": 2 } }',
  (texto) => clavesDuplicadas(texto).length > 0,
)
afirmarIgual(
  clavesDuplicadas('{ "a": { "x": 1, "x": 2 }, "b": [ { "y": 1, "y": 2 } ] }'),
  ['a.x', 'b[].y'],
  'y sí los ve anidados, con la ruta completa',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('EL REPO ENTERO — marcadores de conflicto, y la exclusión que los hace posibles')

/**
 * Agregado en SITIO-S7. El gate miraba `package.json` porque ése fue el archivo
 * que un merge rompió; este sprint mergeó DOS lanes y un marcador sin resolver
 * adentro de un `.md`, un `.css` o un `.json` que nadie importa no rompe el
 * build, no rompe los tipos, y se commitea.
 */
const conflictos = conflictosEnElRepo()
afirmarIgual(
  conflictos.map((h) => `${h.archivo} — ${h.detalle}`),
  [],
  'ningún archivo del repo tiene un merge sin resolver',
)

/**
 * ⚠ EL CONTROL POSITIVO DE LA EXCLUSIÓN, QUE ES LO QUE LA HACE HONESTA.
 *
 * Sin esto, "cero conflictos" sería compatible con un escáner que no mira nada.
 * El mismo escáner, sin la exclusión, TIENE que encontrar los marcadores que
 * `s4-fixtures/` guarda a propósito. Y si un día dejaran de estar, esta
 * comprobación falla y hay que borrar la exclusión — que es exactamente lo que
 * impide que una exclusión sobreviva a su razón.
 */
const conLoExcluido = conflictosIncluyendoLoExcluido()
afirmar(
  conLoExcluido.length > conflictos.length,
  `el MISMO escáner, sin la exclusión, encuentra ${conLoExcluido.length} marcador(es)`,
  conLoExcluido.map((h) => h.archivo).join(' · '),
)

for (const exclusion of EXCLUSIONES) {
  console.log(`  excluido: ${exclusion.ruta}`)
  console.log(`            ${exclusion.motivo}`)
  if (!exclusion.tieneMarcadoresAPropósito) continue
  const adentro = conLoExcluido.filter((h) => h.archivo.startsWith(`${exclusion.ruta}/`))
  afirmar(
    adentro.length > 0,
    `  y \`${exclusion.ruta}\` SIGUE teniendo los marcadores que justifican excluirlo`,
    `${adentro.length} en ${new Set(adentro.map((h) => h.archivo)).size} archivo(s)`,
  )
}

/** Y que el alcance no sea vacío: un escáner que no lee archivos no ve nada. */
const archivos = archivosDelRepo()
afirmar(archivos.length > 100, `el escáner recorrió ${archivos.length} archivos de texto del repo`)
afirmar(
  archivos.some((a) => a === 'package.json'),
  '  incluido `package.json`, que es el que rompió el merge que motivó todo esto',
)
afirmar(
  archivos.some((a) => a.endsWith('.md')),
  '  y los `.md`, que es donde un marcador no rompe nada y se publica',
)

controlPositivo(
  'el detector de conflictos ve un marcador en un texto cualquiera',
  '<<<<<<< HEAD',
  (texto: string) => marcadoresDeConflicto(texto).length === 0,
)

cerrar('s4-paquete.invariant')
