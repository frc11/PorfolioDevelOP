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

/** Lo que `git status` reporta como tocado, ya normalizado. */
export function rutasTocadas(): string[] {
  return git('status', '--porcelain')
    .split('\n')
    .map((linea) => linea.slice(3).trim().replace(/^"|"$/g, ''))
    .filter((ruta) => ruta.length > 0)
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
