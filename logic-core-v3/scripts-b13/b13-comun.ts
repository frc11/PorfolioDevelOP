/**
 * BANCO DE B13 — la plomería que comparten los instrumentos de este bloque.
 *
 * ── Qué hereda, y de dónde ────────────────────────────────────────────────
 *
 * Todo lo resuelto se importa tal cual: el cliente de CDP, la receta ejecutable,
 * la captura y los perfiles (`scripts-b4/`); el puente de automatización y el
 * asentamiento del home (`scripts-b8/`, `scripts-b11/`); y **el instrumento que
 * declaró las deudas** —la máscara de glifo, los lectores de bloques, el
 * ocultamiento y la evaluación de una posición— que es el de `scripts-b8/` con
 * el recorte de la pastilla de `scripts-b11/`. Medir con otra copia sería medir
 * con otra vara, y este bloque tiene que comparar sus cifras con las de B11.
 *
 * ── Lo propio ─────────────────────────────────────────────────────────────
 *
 * El puerto (3000, el de la receta y el de ESTE worktree), la carpeta de
 * salidas, el perfil de Chrome —dos procesos sobre el mismo `userDataDir` y el
 * segundo no arranca— y el redondeo de las tablas.
 *
 * ⚠️ **El búfer de WebGL no se lee desde la página.** Toda cifra de la escena de
 * este bloque sale de `Page.captureScreenshot` de lo compuesto.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import type { Perfil } from '../scripts-b4/perfiles'
import { PERFILES_DE_B11, perfilDeB11 } from '../scripts-b11/b11-comun'

export { asentarElHome, cuatro, dos, type Sesion } from '../scripts-b11/b11-comun'

/** 3000: el puerto de ESTA sesión y de la receta canónica. */
export const ORIGEN = 'http://localhost:3000'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b13'

/** Las capturas intermedias, fuera de `docs/` y fuera de git. */
export const TEMP = '.b13-capturas'

/** A donde se mudan, con el navegador YA cerrado, las capturas del reporte. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/b13'

/** Los tres anchos, los mismos de B11 para que las cifras se puedan cruzar. */
export const PERFILES_DE_B13: readonly Perfil[] = PERFILES_DE_B11

export function perfilDeB13(id: string): Perfil {
  return perfilDeB11(id)
}

/** Las seis secciones que dejan ver la sala, en el orden del recorrido. */
export const LAS_SEIS = ['hero', 'quienes-somos', 'numeros', 'trabajos', 'por-que-develop', 'cierre'] as const
export type IdDeLasSeis = (typeof LAS_SEIS)[number]

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

/** Escribe un JSON de salida. Con el navegador cerrado: el dev server vigila `docs/`. */
export function escribirJson(nombre: string, datos: unknown): string {
  asegurarCarpetas()
  const destino = path.join(RAIZ_DE_SALIDAS, `${nombre}.json`)
  writeFileSync(destino, `${JSON.stringify(datos, null, 2)}\n`, 'utf8')
  return destino
}

/** Un número a n decimales, para que las tablas no publiquen dieciséis cifras. */
export function red(valor: number, decimales: number): number {
  const f = 10 ** decimales
  return Math.round(valor * f) / f
}
