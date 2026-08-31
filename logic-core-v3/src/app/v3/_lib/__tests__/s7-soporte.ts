import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * LA PLOMERÍA DE `s7-contrato` — leer el disco y mirar imports.
 *
 * Vive aparte por dos razones, y la segunda es la que importa:
 *
 *   · el invariante cruzó las 300 líneas, y la regla del repo es partir — la
 *     regla que ese mismo invariante afirma, así que cazarse a sí mismo era la
 *     forma más limpia de estrenarla;
 *   · **un detector se prueba corriendo la MISMA función contra una entrada
 *     rota**, y para eso la función tiene que estar afuera del archivo que la
 *     usa. Un detector que se prueba a sí mismo con otra copia del código no
 *     prueba nada.
 */

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
export const SECCIONES = 'src/app/v3/_secciones'
export const CONTRATO = `${SECCIONES}/_contrato`

export const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')

/**
 * El código sin comentarios.
 *
 * ⚠ Hace falta y no es cosmético: este sprint DOCUMENTA por qué cada nombre de
 * los dos contratos desapareció, y esa documentación nombra los nombres. Un
 * detector que mirara el archivo entero encontraría su propia explicación y
 * pondría en rojo justamente el trabajo de haberla escrito. Es la misma
 * corrección que `motion-bundle` ya había tenido que hacer sobre su chequeo del
 * umbral: el archivo EXPLICA la compuerta y eso es correcto; lo que no puede es
 * declararla.
 */
export function sinComentariosNiCadenas(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
    .replace(/\/\/[^\n]*/g, ' ')
    // El CONTENIDO de las cadenas también sale: un mensaje de afirmación que
    // NOMBRA la pieza vieja está diciendo qué se comprueba, no importándola.
    // Las comillas se conservan para no pegar identificadores vecinos.
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``')
}

export function recorrer(relativo: string, acumulado: string[] = []): string[] {
  if (!existsSync(path.join(RAIZ, relativo))) return acumulado
  for (const entrada of readdirSync(path.join(RAIZ, relativo), { withFileTypes: true })) {
    const hijo = `${relativo}/${entrada.name}`
    if (entrada.isDirectory()) recorrer(hijo, acumulado)
    else acumulado.push(hijo)
  }
  return acumulado.sort()
}

/** Los módulos que un archivo importa, con o sin `type`. */
export function importsDe(fuente: string): string[] {
  return [...fuente.matchAll(/^\s*import\s[\s\S]*?from\s+'([^']+)'/gm)].map((m) => m[1])
}

/** Los que importan un VALOR: `import type` se borra al compilar y no pesa. */
export function importsDeValor(fuente: string): string[] {
  return [...fuente.matchAll(/^\s*import\s+(?!type\s)([\s\S]*?)from\s+'([^']+)'/gm)]
    .filter((m) => !/^\{\s*type\s/.test(m[1].trim()) || /,/.test(m[1]))
    .map((m) => m[2])
}
