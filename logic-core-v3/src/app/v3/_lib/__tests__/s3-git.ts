/**
 * LA PLOMERÍA DE GIT — y la regla que un padrón de rutas tiene que respetar.
 *
 * ── LA REGLA, y de dónde salió ────────────────────────────────────────────
 *
 * **Todo padrón que se compare contra rutas de `git` tiene que resolverse
 * contra el TOPLEVEL del repositorio, no contra el directorio de trabajo.**
 *
 * No es una precaución teórica. En este proyecto la raíz del repositorio es
 * `C:\v3-chrome` y la aplicación vive en `logic-core-v3/`, así que
 * `git status --porcelain` y `git show HEAD:…` hablan en rutas con ese
 * prefijo mientras los padrones del sprint lo escriben sin él. La primera
 * versión de `s3-frontera.invariant.ts` comparaba
 * `src/app/theme-develop.css` contra `logic-core-v3/src/app/theme-develop.css`:
 * no coincidían nunca, y la afirmación **"ningún archivo prohibido fue
 * tocado" habría pasado en verde con el repo entero destruido**.
 *
 * Y es justamente el check en el que se apoya correr dos sprints en paralelo
 * en worktrees distintos. Estaba ciego.
 *
 * Lo cazó un contrapeso, no una relectura: exigir que los archivos del propio
 * sprint —que con certeza están tocados, porque son altas— aparezcan en la
 * lista. Si el padrón y `git` no hablan el mismo idioma, ese número da cero.
 * **Cualquier padrón contra rutas de git necesita ese contrapeso**, no sólo
 * el prefijo bien puesto: el prefijo se puede volver a romper, y el
 * contrapeso lo nota.
 */

import { execFileSync } from 'node:child_process'

import { RAIZ } from './s3-archivos'

export function git(...argumentos: string[]): string {
  return execFileSync('git', argumentos, {
    cwd: RAIZ,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
}

/** El camino desde el toplevel hasta acá. Vacío si coinciden. */
export const PREFIJO = git('rev-parse', '--show-prefix').trim()

/** Una ruta del padrón, en el idioma de `git`. */
export const enElRepo = (relativo: string): string => `${PREFIJO}${relativo}`

/** Una línea de `git status --porcelain`, partida en su estado y su ruta. */
function lineasDeEstado(): { readonly estado: string; readonly ruta: string }[] {
  return git('status', '--porcelain')
    .split('\n')
    .filter((linea) => linea.trim().length > 0)
    .map((linea) => ({
      estado: linea.slice(0, 2),
      ruta: linea.slice(3).trim().replace(/^"|"$/g, ''),
    }))
    .filter((x) => x.ruta.length > 0)
}

/** Lo que `git status` reporta como tocado, ya normalizado. */
export function rutasTocadas(): string[] {
  return lineasDeEstado().map((x) => x.ruta)
}

/**
 * LAS RUTAS DADAS DE ALTA — sin trackear (`??`) o agregadas (`A`).
 *
 * ⚠ **Es una lista distinta de `rutasTocadas()`, y la distinción es la que
 * arregla el detector de ventana de los checks de frontera (SITIO-S11).**
 *
 * Un check de frontera vale mientras SU sprint esté sin commitear, y lo prueba
 * con testigos: los archivos que ese sprint CREÓ. Cruzarlos contra «tocados»
 * confunde dos estados que no se parecen en nada —«el sprint dueño está en
 * vuelo» y «un sprint POSTERIOR modificó un archivo que aquel creó»—, y el
 * segundo pasa todo el tiempo: `_estilos/navegacion.css` es de S3 y lo tocaron
 * S10 y S11. Un alta, en cambio, sólo la hace quien crea el archivo: los
 * sprints que vienen después lo modifican (`M`), nunca lo dan de alta.
 */
export function rutasDadasDeAlta(): string[] {
  return lineasDeEstado().filter((x) => esAlta(x.estado)).map((x) => x.ruta)
}

/**
 * Si los dos caracteres de estado de `git status --porcelain` describen un ALTA.
 *
 * Se exporta aparte de `rutasDadasDeAlta()` **para que se pueda controlar**: esa
 * lee `git` y no acepta una entrada fabricada, así que sin esta función el
 * filtro que decide la ventana de un check de frontera no tendría cómo
 * demostrar que distingue un alta de una modificación. Es la misma razón por la
 * que `evaluarVentana` recibe la lista en vez de pedirla.
 */
export function esAlta(estado: string): boolean {
  return estado === '??' || estado.includes('A')
}

/**
 * Los tokens declarados en un CSS, con su valor.
 *
 * Vive acá y no en `s3-css.ts` porque su entrada es el TEXTO que devuelve
 * `git show`, no un archivo del disco, y porque no necesita entender reglas:
 * para comparar dos versiones del mismo archivo alcanza con el conjunto plano
 * de pares nombre/valor.
 */
export function tokensDeclaradosEn(css: string): Map<string, string> {
  const limpio = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const mapa = new Map<string, string>()
  for (const m of limpio.matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:([^;}]+)/g)) {
    mapa.set(m[1], m[2].trim())
  }
  return mapa
}
