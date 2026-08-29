/**
 * LAS SUITES, DERIVADAS DE `package.json` — no escritas a mano.
 *
 * ── El defecto que esto arregla ───────────────────────────────────────────
 *
 * Los agregados eran cadenas escritas a mano:
 *
 *     "test:s3": "npm run test:s3-tokens && npm run test:s3-layout && …"
 *
 * Una cadena a mano tiene dos modos de falla, y los dos ocurrieron:
 *
 *   · **Encadena con `&&`**: la primera falla corta el resto. En la corrida que
 *     motivó este sprint eso escondió SIETE invariantes, incluido el que
 *     verifica que la coreografía no cruza la compuerta.
 *   · **Se olvida uno**: `test:s3-peso` existía como script, tenía su archivo,
 *     y **no estaba en la cadena de `test:s3`**. Nunca corrió en un agregado y
 *     nadie lo notó, porque una lista escrita a mano no se queja de lo que le
 *     falta.
 *
 * Derivando la suite del propio `package.json`, un script `test:sN-loquesea`
 * entra al agregado por existir. No hay lista que mantener y no hay olvido
 * posible.
 *
 * ── Los checks de frontera se declaran, no se adivinan ────────────────────
 *
 * `test:s3-frontera` mide el MOMENTO del sprint, no el código: comparado contra
 * `HEAD` después del merge no tiene base. No entra en el agregado — pero
 * **tampoco se lo excluye por una heurística de nombre**. Está en
 * `CHECKS_DE_FRONTERA`, y si aparece un script con `frontera` en el nombre que
 * no esté declarado acá, la derivación **falla**. Un check que se autoexcluye
 * en silencio es la misma clase de agujero que este sprint viene tapando.
 */

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s4-corrida'

/** Los scripts que miden el momento del sprint. Declarados, uno por uno. */
export const CHECKS_DE_FRONTERA: readonly string[] = ['test:s3-frontera']

/** `test:s1-tokens` → suite `s1`. La cadena `test:s1` NO cae acá: pide guión. */
const RE_INVARIANTE = /^test:(s\d+[a-z]?)-(.+)$/
/** La forma que un script de invariante tiene que tener para poder correrse. */
const RE_COMANDO = /^npx tsx\s+(?:"([^"]+)"|(\S+))\s*$/

export interface Invariante {
  readonly script: string
  readonly comando: string
  readonly archivo: string
}

export interface Suite {
  readonly nombre: string
  readonly invariantes: readonly Invariante[]
}

export interface Derivacion {
  /** Las suites que entran en el agregado, en orden de declaración. */
  readonly permanentes: readonly Suite[]
  /** Los checks de frontera, juntos, en su propia suite. */
  readonly frontera: Suite
  /** Todo lo que no cerró. Vacío o el agregado no corre. */
  readonly problemas: readonly string[]
}

/** Los scripts de un `package.json` ya parseado, sin `any` y sin confiar. */
export function scriptsDe(datos: unknown): Record<string, string> {
  if (typeof datos !== 'object' || datos === null) return {}
  const scripts = (datos as { scripts?: unknown }).scripts
  if (typeof scripts !== 'object' || scripts === null) return {}
  const salida: Record<string, string> = {}
  for (const [clave, valor] of Object.entries(scripts)) {
    if (typeof valor === 'string') salida[clave] = valor
  }
  return salida
}

export function derivarSuites(scripts: Record<string, string>): Derivacion {
  const problemas: string[] = []
  const porSuite = new Map<string, Invariante[]>()
  const frontera: Invariante[] = []

  for (const [script, comando] of Object.entries(scripts)) {
    const esFrontera = CHECKS_DE_FRONTERA.includes(script)
    if (!esFrontera && /frontera/.test(script) && RE_INVARIANTE.test(script)) {
      problemas.push(
        `\`${script}\` parece un check de frontera y NO está declarado en CHECKS_DE_FRONTERA. ` +
          'Declaralo o renombralo: no se lo excluye por adivinanza.',
      )
      continue
    }
    const partes = RE_INVARIANTE.exec(script)
    if (partes === null) continue

    const forma = RE_COMANDO.exec(comando)
    if (forma === null) {
      problemas.push(`\`${script}\` no tiene la forma \`npx tsx <archivo>\`: "${comando}"`)
      continue
    }
    const archivo = forma[1] ?? forma[2]
    if (!existsSync(path.join(RAIZ, archivo))) {
      problemas.push(`\`${script}\` apunta a un archivo que no existe: ${archivo}`)
      continue
    }

    const invariante: Invariante = { script, comando, archivo }
    if (esFrontera) {
      frontera.push(invariante)
      continue
    }
    const suite = partes[1]
    const lista = porSuite.get(suite)
    if (lista === undefined) porSuite.set(suite, [invariante])
    else lista.push(invariante)
  }

  for (const declarado of CHECKS_DE_FRONTERA) {
    if (!(declarado in scripts)) {
      problemas.push(`\`${declarado}\` está declarado como check de frontera y no existe como script.`)
    }
  }

  const permanentes = [...porSuite.entries()]
    .map(([nombre, invariantes]) => ({ nombre, invariantes }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  for (const suite of permanentes) {
    if (suite.invariantes.length === 0) problemas.push(`la suite \`${suite.nombre}\` quedó vacía`)
  }

  return { permanentes, frontera: { nombre: 'frontera', invariantes: frontera }, problemas }
}

/**
 * El sentido inverso: instrumentos que existen en disco y **no tiene ningún
 * script que los corra**.
 *
 * Derivar la suite de `package.json` cubre "el script existe y no está en la
 * cadena". No cubre "el archivo existe y no tiene script": ese invariante no
 * corre nunca y desde `package.json` es invisible. Los directorios que se miran
 * son los de los invariantes ya cableados, así que un lane nuevo entra solo.
 */
export function instrumentosSinScript(derivacion: Derivacion): string[] {
  const cableados = new Set(
    [...derivacion.permanentes.flatMap((s) => s.invariantes), ...derivacion.frontera.invariantes].map(
      (i) => i.archivo.replace(/\\/g, '/'),
    ),
  )
  const directorios = [...new Set([...cableados].map((a) => path.posix.dirname(a)))].sort()
  const huerfanos: string[] = []
  for (const dir of directorios) {
    for (const nombre of readdirSync(path.join(RAIZ, dir))) {
      if (!/\.invariant\.tsx?$/.test(nombre)) continue
      const ruta = `${dir}/${nombre}`
      if (!cableados.has(ruta)) huerfanos.push(ruta)
    }
  }
  return huerfanos.sort()
}
