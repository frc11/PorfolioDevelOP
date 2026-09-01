/**
 * EL BARRIDO DE `s8-montaje.invariant.ts` — lo que lee del disco y de
 * `package.json`, aparte de las afirmaciones que lo leen a él.
 *
 * ── ⚠️ POR QUÉ SE PARTIÓ, Y POR DÓNDE (SITIO-S10) ──────────────────────────
 *
 * El invariante estaba en **300 líneas exactas**, o sea con CERO margen contra
 * el límite del repo: el próximo que le agregara un chequeo lo ponía en rojo
 * por largo, y descubrir una deuda de tamaño mientras se intenta otra cosa es
 * la peor forma de descubrirla. Se partió con margen, que es §7.13 aplicada en
 * vez de anotada una tercera vez.
 *
 * **La costura es de NATURALEZA, no «por la mitad para que entre».** De un lado
 * el barrido —lo que recorre `src/`, lo que parsea `package.json`, lo que
 * compone los largos—, del otro las afirmaciones y sus controles positivos. Es
 * la misma costura de `_secciones/cierre/soporte.ts` y `_chrome/__tests__/soporte.ts`.
 *
 * ⚠️ **Y por eso cada función de acá recibe su entrada por parámetro.** El
 * invariante tiene que poder correr la MISMA función contra una entrada
 * deliberadamente equivocada; un detector que sólo sabe leer un global no se
 * puede probar. Los controles positivos siguen del otro lado, que es donde el
 * arnés los cuenta.
 *
 * ⚠️ **Este archivo NO termina en `.invariant.ts` a propósito:** `s4-cobertura`
 * busca los `*.invariant.ts` que ningún script corre y los reporta como
 * instrumentos huérfanos (regla 14). Un módulo de apoyo con ese sufijo entraría
 * a esa lista sin tener nada que correr.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { ENCHUFES, FRENTES, RAIZ, archivosSinRegistrar, especificadoresDeImport, existe, leer, recorrer } from './s8-padron'
import { invariantesCableados } from './s4-suites'
import { medirLargos, repartir, type Largo, type Reparto } from './s8-largos'

/** Todo `.ts`/`.tsx` de `src/`, en rutas relativas a la raíz. */
export const TODO_SRC: readonly string[] = recorrer('src').filter((a) => /\.tsx?$/.test(a))

/**
 * ¿El fuente importa `marcaEscena`?
 *
 * ⚠ **Se miran los ESPECIFICADORES de import, no el texto del archivo**, y el
 * primer intento de S8 salió verde por vacío por no hacerlo: borrar comentarios
 * y cadenas es correcto para un IDENTIFICADOR (§7.25), pero **el especificador
 * de un import ES una cadena** y borrarlas borra justo lo que hay que
 * encontrar. Lo destapó su propio control positivo, y por eso el detector vive
 * afuera del invariante: se prueba corriendo la MISMA función contra una rota.
 */
export const veLaMarca = (fuente: string): boolean =>
  especificadoresDeImport(fuente).some((m) => /marcaEscena$/.test(m))

/** Los archivos del corpus que importan la marca. */
export const importanLaMarca = (archivos: readonly string[]): string[] =>
  archivos.filter((a) => veLaMarca(leer(a)))

/**
 * Los scripts de `package.json`, ya estrechados a `Record<string, string>`.
 * El JSON entra como `unknown` y se estrecha a mano —sin un solo `any`— porque
 * un `as` sobre el archivo entero sería creerle a un archivo que este mismo
 * instrumento está auditando.
 */
export function scriptsDelPaquete(): Record<string, string> {
  const paquete: unknown = JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8'))
  const scripts: Record<string, string> = {}
  if (typeof paquete === 'object' && paquete !== null) {
    const crudos = (paquete as { scripts?: unknown }).scripts
    if (typeof crudos === 'object' && crudos !== null) {
      for (const [k, v] of Object.entries(crudos)) if (typeof v === 'string') scripts[k] = v
    }
  }
  return scripts
}

/**
 * Los `.invariant` que viven en una carpeta de frente y NO tiene ningún script.
 *
 * ⚠ **La pregunta se le hace a `package.json`, no al padrón** — preguntársela
 * al padrón de S8 puso esto en rojo cuando S9 sumó tres invariantes CON script.
 * Recibe el conjunto de cableados por parámetro para que se pueda probar contra
 * uno vacío, que es la entrada que lo haría reportar todo.
 */
export function invariantesSueltos(cableados: ReadonlySet<string> = invariantesCableados()): string[] {
  return FRENTES.flatMap((f) => recorrer(f.carpeta)).filter(
    (a) => /\.invariant\.tsx?$/.test(a) && !cableados.has(a),
  )
}

/**
 * Los largos del sprint ENTERO: enchufes + entregables + los módulos de apoyo
 * que los frentes dejaron sin declarar. La cobertura es del sprint y no de la
 * lista, que es lo que §7.17 pedía.
 */
export function largosDelSprint(): { readonly medidos: Largo[]; readonly reparto: Reparto } {
  const medidos = medirLargos(
    [...ENCHUFES, ...FRENTES.flatMap((f) => f.entregables), ...archivosSinRegistrar()],
    existe,
    leer,
  )
  return { medidos, reparto: repartir(medidos) }
}
