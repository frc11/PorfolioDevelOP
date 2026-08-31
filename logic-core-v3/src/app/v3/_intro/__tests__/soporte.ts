/**
 * LOS DETECTORES DEL FRENTE DEL INTRO — **afuera del invariante, a propósito.**
 *
 * Es el patrón de `s7-soporte.ts` y de `s8-padron.ts`, y la razón es una sola:
 * **un detector se prueba corriendo la MISMA función contra una entrada
 * deliberadamente rota**. Si el predicado viviera adentro del archivo que lo
 * usa, el control positivo tendría que reescribirlo — y entonces probaría la
 * copia, no el detector.
 *
 * Nada de acá pinta pantalla: son lectores de texto y un hash. No hay un solo
 * valor de diseño en este archivo.
 */

import { createHash } from 'node:crypto'

import { RAIZ, leer, sinComentariosNiCadenas } from '../../_lib/__tests__/s7-soporte'

export { RAIZ, leer }

/**
 * ¿El archivo pide `especificador` con un import ESTÁTICO?
 *
 * Las dos mitades hacen falta y ninguna sola alcanza:
 *
 *   · **tiene** un `import … from '<especificador>'` de valor —no `import
 *     type`, que se borra al compilar y no pone nada en el HTML del servidor—;
 *   · **y no tiene** un `import('<especificador>')` perezoso, que es la forma
 *     que dejaría el overlay fuera del HTML del servidor y produciría el flash
 *     del hero que el gate pre-paint existe para no tener.
 *
 * Se mira el fuente CON las cadenas puestas: el especificador de un import ES
 * una cadena, y borrarlas es el error que `s8-montaje` ya documentó — el
 * detector queda ciego y su afirmación pasa verde por vacío.
 */
export function montaDeFormaEstatica(fuente: string, especificador: string): boolean {
  const escapado = especificador.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const estatico = new RegExp(`^\\s*import\\s+(?!type\\s)[\\s\\S]*?from\\s+'${escapado}'`, 'm')
  const perezoso = new RegExp(`import\\(\\s*'${escapado}'\\s*\\)`)
  return estatico.test(fuente) && !perezoso.test(fuente)
}

/**
 * Los IDENTIFICADORES de una lista que el archivo realmente usa, con los
 * comentarios y el contenido de las cadenas borrados.
 *
 * Es para lo que se PROHÍBE: `lenis.stop()`, `new Audio()`, `await`. Un docblock
 * que explica *"no llama `lenis.stop()`"* dice qué NO hace — y un detector que
 * lo contara pondría en rojo justamente el trabajo de haberlo escrito (§7.25).
 * `HomeIntro.tsx` tiene esa frase literal, así que sin este borrado el chequeo
 * de la condición 2 fallaría contra su propia documentación.
 */
export function identificadoresUsados(fuente: string, agujas: readonly string[]): string[] {
  const limpio = sinComentariosNiCadenas(fuente)
  return agujas.filter((aguja) => limpio.includes(aguja))
}

/**
 * Los TEXTOS de una lista que el archivo contiene, con los comentarios borrados
 * y **las cadenas puestas**.
 *
 * Es para lo que se EXIGE y vive adentro de una cadena: `pointer-events-none`,
 * `aria-hidden`, `data-home-intro-overlay`. Buscarlos con las cadenas borradas
 * daría cero siempre. Son dos lectores y no uno porque son dos preguntas
 * distintas, y usar el de la otra pregunta es exactamente cómo se consigue un
 * verde por vacío.
 */
export function textosPresentes(fuente: string, agujas: readonly string[]): string[] {
  const limpio = fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
  return agujas.filter((aguja) => limpio.includes(aguja))
}

/**
 * La identidad de un archivo: SHA-256 de su contenido con los fines de línea
 * normalizados.
 *
 * ── Por qué un hash, y por qué contra el DISCO y no contra `git` ──────────
 *
 * `PreloaderContext.tsx` y `TransitionContext.tsx` son **archivos congelados**:
 * la regla del repo dice que se leen y jamás se editan. Un hash fijado es la
 * forma exacta de esa regla — cualquier edición, de cualquier sprint, lo mueve.
 *
 * Comparar contra `git` mediría el momento del sprint y vencería al commitear
 * (regla 12 de §3): después del commit el diff es vacío por construcción y el
 * chequeo pasaría en verde sin haber verificado nada. El disco no vence.
 *
 * `\r` se saca porque este repo se clona en Windows y un `core.autocrlf`
 * distinto cambiaría el hash sin que el archivo haya cambiado.
 */
export function identidad(relativo: string): string {
  return identidadDeTexto(leer(relativo))
}

/**
 * La misma cuenta, sobre un texto en vez de un archivo. Existe para que el
 * control positivo pueda correr el MISMO hasher contra un contenido alterado
 * sin tener que escribir el archivo en el disco.
 */
export function identidadDeTexto(contenido: string): string {
  return createHash('sha256').update(contenido.replace(/\r/g, ''), 'utf8').digest('hex')
}
