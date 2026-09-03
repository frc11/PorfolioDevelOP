/**
 * LOS DETECTORES DEL LANE A — funciones puras, separadas de sus afirmaciones.
 *
 * ── Por qué viven aparte del invariante ───────────────────────────────────
 *
 * Por la misma razón que `s3-escaneo.ts`: para que el **control positivo pueda
 * correr la MISMA función** contra una entrada deliberadamente rota. Un detector
 * que se prueba a sí mismo con otra copia del código no prueba nada, y un
 * detector sin control positivo puede estar ciego y verse igual de verde.
 *
 * Y por una segunda razón que apareció acá: `s5-codigo.invariant.ts` pasaba las
 * 300 líneas, que es la regla del repo aplicada también a los instrumentos.
 *
 * ── EL ALCANCE DE CADA DETECTOR NO ES EL MISMO, Y ESO ES EL PUNTO ─────────
 *
 * La primera versión de este escaneo corría los detectores de imports sobre
 * TODOS los archivos del lane, instrumentos incluidos, y falló con cinco rojos
 * que eran todos falsos. Los cinco venían del mismo lugar: **los invariantes
 * contienen a propósito la entrada equivocada de cada detector.**
 *
 *     "import { Pieza } from '../../motion/_componentes/Pieza'"   ← control positivo
 *     "import * as T from 'three'"                                ← control positivo
 *     veces(quieto, 'outline-none')                               ← lo que se afirma ausente
 *
 * Un escáner de texto no distingue un import de un string que contiene un
 * import, así que el arnés de las comprobaciones hacía fallar a las
 * comprobaciones. La salida NO es relajar el detector —eso lo dejaría ciego
 * para el caso real— sino **declarar el alcance**: los detectores de import y
 * de foco corren sobre `ARCHIVOS_ESCANEABLES`, que es lo que pinta pantalla.
 *
 * Lo que queda cubierto igual, y por eso el recorte no abre un agujero: **cada
 * sección afirma sobre su PROPIA fuente** que no importa de
 * `motion/_componentes`, que no importa `three` y que no apaga el anillo. O sea
 * que los cuatro componentes están mirados dos veces, desde afuera y desde
 * adentro; lo único que sale del alcance transversal son los instrumentos, que
 * no llegan a ninguna pantalla.
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { quitarComentarios } from './s3-escaneo'
import { CARPETAS_DE_SECCION, RAIZ } from './s5-archivos'

/** Los especificadores de import de un archivo, estáticos y dinámicos. */
export function importsDe(codigo: string): string[] {
  const limpio = quitarComentarios(codigo)
  const desde = [...limpio.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1])
  const dinamicos = [...limpio.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1])
  return [...desde, ...dinamicos]
}

const SLUGS = CARPETAS_DE_SECCION.map((c) => c.id)

/**
 * Un cruce entre secciones: un import relativo que sube de la carpeta propia y
 * baja a la de OTRA sección.
 *
 * Se mira el especificador y no el archivo resuelto porque el especificador es
 * lo que alguien escribe, y es donde se ve la intención.
 */
export function crucesEntreSecciones(archivo: string, codigo: string): string[] {
  const propio = CARPETAS_DE_SECCION.find((c) => archivo.startsWith(`${c.carpeta}/`))
  if (propio === undefined) return []
  return importsDe(codigo).filter((m) =>
    SLUGS.some((slug) => slug !== propio.id && new RegExp(`(^|/)\\.\\./${slug}/`).test(m)),
  )
}

/**
 * `three` y su ecosistema. El efecto de Trabajos es HTML con `perspective`:
 * está medido y confirmado contra el DOM vivo —44 targets, los 44 `Element`,
 * cero objetos de escena— y una importación acá sería exactamente el error que
 * la medición existe para evitar.
 */
export const RE_TRES_D = /(^|\/)three($|\/)|@react-three|@react-spring\/three|drei/

export function importsDe3D(codigo: string): string[] {
  return importsDe(codigo).filter((m) => RE_TRES_D.test(m))
}

/** Lo único que el lane puede importar de afuera del árbol de /v3. */
export const IMPORTS_PERMITIDOS = [
  'react',
  'react-dom',
  'react-dom/server',
  'next',
  'next/image',
  'motion/react',
  '@/lib/utils',
]

export function importsFueraDeLaLista(codigo: string): string[] {
  return importsDe(codigo).filter(
    (m) => !m.startsWith('.') && !m.startsWith('node:') && !IMPORTS_PERMITIDOS.includes(m),
  )
}

/** Base de datos, zonas del otro socio, navegación imperativa y `any`. */
export const PROHIBIDOS: readonly [string, RegExp][] = [
  ['prisma', /\bprisma\b/i],
  ['PrismaClient', /\bPrismaClient\b/],
  ['OsLead', /\bOsLead\w*/],
  ['ActivityChannel', /\bActivityChannel\b/],
  ['/setter', /['"@/][^'"]*\/setter\b/],
  ['/leados', /['"@/][^'"]*\/leados\b/],
  ['router.push', /\brouter\.push\s*\(/],
  ['any', /:\s*any\b|<any>|\bas\s+any\b/],
]

export function hayProhibido(codigo: string): boolean {
  return PROHIBIDOS.some(([, p]) => p.test(codigo))
}

export interface ParidadDeEstado {
  readonly hover: number
  readonly foco: number
  readonly grupoHover: number
  readonly grupoFoco: number
}

/**
 * La paridad hover / foco, contada por archivo.
 *
 * En el chrome de S3 se verifica sobre las HOJAS, porque ahí vive toda la
 * coreografía de estado. Las secciones no pueden escribir hojas —`_estilos/` es
 * compartido— así que su única forma de expresar un estado es la variante de
 * Tailwind, y la paridad se verifica sobre esa variante.
 *
 * La regla operativa es por ARCHIVO y no por clase: una utilidad puede tener su
 * gemela dos líneas más abajo, y exigir el gemelo pegado daría falsos rojos
 * sobre código correcto. Alcanza para cazar el caso real, que es una sección
 * que responde al puntero y no al teclado.
 */
export function paridadDeEstado(codigo: string): ParidadDeEstado {
  const limpio = quitarComentarios(codigo)
  const contar = (re: RegExp): number => (limpio.match(re) ?? []).length
  return {
    hover: contar(/(?<!group-)\bhover:/g),
    foco: contar(/(?<!group-)\bfocus-visible:/g),
    grupoHover: contar(/\bgroup-hover:/g),
    grupoFoco: contar(/\bgroup-focus-visible:/g),
  }
}

export function sinGemela(codigo: string): boolean {
  const p = paridadDeEstado(codigo)
  return (p.hover > 0 && p.foco === 0) || (p.grupoHover > 0 && p.grupoFoco === 0)
}

const DIR_INSTRUMENTOS = 'src/app/v3/_lib/__tests__'

/**
 * Los instrumentos de S5 que existen EN DISCO.
 *
 * Del disco y no de una lista escrita: cubre los que existan, los haya tocado
 * este árbol de trabajo o no. Es la corrección que S4 le hizo a S3, donde la
 * lista salía de `git status` y después del commit medía CERO — con lo cual la
 * regla de las 300 líneas dejaba de cubrir a nadie, en silencio.
 */
/**
 * De una lista de rutas, las que ALGÚN archivo de la otra lista NOMBRA por su
 * nombre de archivo.
 *
 * Se busca el `basename` y no la ruta entera porque un import relativo escribe
 * `'./banu.png'`: exigir la ruta repo-relativa daría vacío contra un consumo que
 * existe, que es la forma exacta del verde por vacío.
 */
export function archivosQueNombran(candidatos: readonly string[], fuentes: readonly string[]): string[] {
  return candidatos.filter((candidato) => {
    const nombre = path.basename(candidato)
    return fuentes.some((fuente) => readFileSync(path.join(RAIZ, fuente), 'utf8').includes(nombre))
  })
}

export function instrumentosDeS5(): string[] {
  return readdirSync(path.join(RAIZ, DIR_INSTRUMENTOS))
    .filter((nombre) => /^s5-.*\.tsx?$/.test(nombre))
    .map((nombre) => `${DIR_INSTRUMENTOS}/${nombre}`)
    .sort()
}
