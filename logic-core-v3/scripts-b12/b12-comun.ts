/**
 * BANCO DE B12 — la plomería que comparten los instrumentos de este bloque.
 *
 * ── Por qué un banco propio, otra vez ─────────────────────────────────────
 *
 * Por lo mismo que B6-A, B8 y B11 tuvieron el suyo: **el puerto y la carpeta
 * de salidas**. `scripts-b11/b11-comun.ts` clava `RAIZ_DE_SALIDAS` en
 * `outputs/b11` y su perfil de Chrome en `b11`; escribir ahí desde este bloque
 * pisaría las cifras que firman el reporte de B11. El origen sí es el mismo
 * —el 3000 de la receta canónica (`docs/rediseno/MEDICION-NAVEGADOR.md`)— y por
 * eso se re-exporta en vez de re-escribirse.
 *
 * ── Lo que hereda, y de dónde ─────────────────────────────────────────────
 *
 * TODO lo que ya está resuelto se importa tal cual, y es deliberado: medir con
 * otra copia del instrumento sería medir con otra vara. De `scripts-b4/`, el
 * cliente de CDP, los perfiles, la captura y el censo; de `scripts-b8/`, el
 * puente de automatización, la máscara de glifo y los lectores de bloques; de
 * `scripts-b11/`, el asentamiento del home con reintentos de entereza y el
 * perfil 2560 con su procedencia.
 *
 * ── ⚠️ LAS CUATRO REGLAS DE CAPTURA DE B4-B, y cómo se cumplen acá ────────
 *
 *   1. La escena tarda 300–700 ms en pintar: gracia antes de cada captura
 *      (`asentarElHome`, heredado de B11).
 *   2. Un recorte sólo vale con el scroll ahí.
 *   3. **No se escribe en `docs/` con el navegador abierto**: el dev server
 *      vigila el árbol. Los PNG van a `.b12-capturas/` y los JSON se mudan a
 *      `docs/` con TODOS los Chrome ya cerrados (`mudarPendientes`).
 *   4. El preloader no arma bajo webdriver: puente + marca del intro, antes del
 *      primer pintado.
 *
 * ── El búfer de WebGL no se lee desde la página ───────────────────────────
 *
 * Toda cifra de la escena de este bloque es `Page.captureScreenshot` de lo
 * compuesto. Ninguna sale de `readPixels` ni de `drawImage`.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import type { Perfil } from '../scripts-b4/perfiles'
import { asentarElHome, ORIGEN, PERFIL_2560, perfilDeB11 } from '../scripts-b11/b11-comun'
import { conLaPagina, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION, type Sesion } from '../scripts-b8/b8-comun'

export { cuatro, dos, SELECTOR_DE_LA_ESCENA, type Sesion } from '../scripts-b8/b8-comun'
export { asentarElHome, ORIGEN, PERFIL_2560, perfilDeB11 }

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b12'

/** Las capturas intermedias, fuera de `docs/` y fuera de git. */
export const TEMP = '.b12-capturas'

/** A donde se mudan, con el navegador YA cerrado, las capturas del reporte. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/b12'

/** Los dos anchos de la instrucción para el censo y las capturas. */
export const PERFILES_DE_B12: readonly Perfil[] = [perfilDeB11('1440'), perfilDeB11('1920')]

/**
 * Abre el home de ESTE worktree en un Chrome propio, verificado, y corre el
 * trabajo. Es `conElHome` de B11 con el perfil de Chrome de este bloque: dos
 * procesos sobre el mismo `userDataDir` y el segundo no arranca.
 */
export async function conElHome<T>(perfil: Perfil, trabajo: (s: Sesion) => Promise<T>, quien = 'b12'): Promise<T> {
  return conLaPagina(perfil, '/v3', trabajo, {
    antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO],
    origen: ORIGEN,
    perfilDeChrome: quien,
  })
}

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

export interface Pendiente {
  readonly temporal: string
  readonly destino: string
}

const pendientes: Pendiente[] = []

/** Escribe un JSON en el temporal y lo deja pendiente de mudar a `outputs/b12/`. */
export function jsonPendiente(nombre: string, datos: unknown): string {
  asegurarCarpetas()
  const temporal = path.join(TEMP, `${nombre}.json`)
  writeFileSync(temporal, `${JSON.stringify(datos, null, 2)}\n`, 'utf8')
  pendientes.push({ temporal, destino: path.join(RAIZ_DE_SALIDAS, `${nombre}.json`) })
  return temporal
}

/** Deja una captura del temporal pendiente de copiarse a `capturas/b12/`. */
export function capturaPendiente(temporal: string, nombre: string): void {
  pendientes.push({ temporal, destino: path.join(CARPETA_DE_CAPTURAS, nombre) })
}

/** Con TODOS los navegadores cerrados: muda lo pendiente a `docs/`. */
export function mudarPendientes(): readonly string[] {
  const escritos: string[] = []
  for (const p of pendientes.splice(0)) {
    mkdirSync(path.dirname(p.destino), { recursive: true })
    copyFileSync(p.temporal, p.destino)
    escritos.push(p.destino.replace(/\\/g, '/'))
  }
  return escritos
}

/** Cuántas pendientes hay sin mudar. Para el `finally` de los scripts. */
export function pendientesSinMudar(): number {
  return pendientes.length
}

export function pantallas(y: number, ventana: number): number {
  return Math.round((y / ventana) * 1000) / 1000
}
