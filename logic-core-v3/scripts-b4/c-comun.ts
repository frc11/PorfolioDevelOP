/**
 * FRENTE C · LO QUE SUS CUATRO MEDICIONES COMPARTEN.
 *
 * Sólo lo que usan DOS o más de los cuatro scripts del frente. Lo que usa uno
 * solo vive en su script: compartir de más es tan malo como compartir de menos
 * (`sitio.ts`, docblock).
 *
 * ⚠️ **Nada de acá toca el banco.** `perfiles.ts`, `navegador.ts`, `captura.ts`,
 * `sitio.ts`, `capturas.ts` y `cdp.ts` son del padre; este archivo los usa.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { medir, type Pagina } from './navegador'

export const SITIO = 'http://localhost:3002/v3'
export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b4'

/**
 * ⚠️ **NINGUNA CAPTURA SE ESCRIBE ADENTRO DEL REPO MIENTRAS EL NAVEGADOR ESTÁ
 * ABIERTO, Y NO ES UNA MANÍA — ESTÁ MEDIDO.**
 *
 * `docs/` **no** está en `.gitignore`, así que un PNG nuevo ahí cae adentro del
 * árbol que vigilan el `next dev` de este worktree y la auto-detección de
 * fuentes de Tailwind 4 (la misma trampa que `CLAUDE.md` documenta para un
 * `distDir` alternativo). Medido con `c-anclas.ts`: escribiendo las capturas en
 * su destino final, dos aterrizajes de la misma corrida dieron `top` de 1.066 y
 * de −1.979 px y el documento saltó de 16.224 a 19.025 px y volvió; sin escribir
 * un byte, las 21 lecturas dan 72 px y se repiten entre corridas.
 *
 * La salida es escribir en `os.tmpdir()` y **mudar los archivos después de
 * cerrar el navegador**, que es lo que hacen estas dos funciones.
 */
export const RAIZ_TEMPORAL = path.join(os.tmpdir(), 'b4-frente-c')

export interface CapturaPendiente {
  readonly temporal: string
  readonly destino: string
}

export function rutaTemporal(nombre: string): string {
  mkdirSync(RAIZ_TEMPORAL, { recursive: true })
  return path.join(RAIZ_TEMPORAL, nombre)
}

/** Muda las capturas a su destino en el repo. Se llama con el navegador YA cerrado. */
export function mudarLasCapturas(pendientes: readonly CapturaPendiente[]): void {
  for (const p of pendientes) {
    mkdirSync(path.dirname(p.destino), { recursive: true })
    copyFileSync(p.temporal, p.destino)
  }
}

/** Escribe una medición en JSON, creando la carpeta si hace falta. */
export function guardarJson(nombre: string, datos: unknown): string {
  const destino = path.join(RAIZ_DE_SALIDAS, nombre)
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  writeFileSync(destino, `${JSON.stringify(datos, null, 2)}\n`, 'utf8')
  return destino
}

export interface Asentamiento {
  /** `scrollY` cuando se dejó de mover. */
  readonly y: number
  /** Cuántas lecturas hicieron falta. Si es el tope, NO se asentó. */
  readonly lecturas: number
  readonly seAsento: boolean
  readonly ms: number
}

/**
 * ⚠️ **ESPERA A QUE EL SCROLL PARE DE VERDAD, Y NO UN NÚMERO DE MILISEGUNDOS.**
 *
 * Un salto de ancla puede ser instantáneo o suave según `scroll-behavior`, y
 * dormir «lo suficiente» es exactamente la clase de suposición que este banco no
 * acepta: si el salto fuera suave y la espera corta, el `top` medido sería el de
 * la mitad del viaje y parecería un desvío del `scroll-padding-top`.
 *
 * Devuelve `seAsento: false` cuando llegó al tope de lecturas todavía moviéndose,
 * para que la cifra que salga de ahí se pueda descartar en vez de publicarse.
 */
export async function esperarQueElScrollSeAsiente(
  p: Pagina,
  opciones: { readonly lecturasIguales?: number; readonly tope?: number; readonly msPorLectura?: number } = {},
): Promise<Asentamiento> {
  const iguales = opciones.lecturasIguales ?? 4
  const tope = opciones.tope ?? 120
  const ms = opciones.msPorLectura ?? 32
  return medir<Asentamiento>(
    p,
    `(async () => {
      const t0 = performance.now()
      let previo = window.scrollY
      let seguidas = 0
      for (let i = 1; i <= ${tope}; i += 1) {
        await new Promise((r) => setTimeout(r, ${ms}))
        const y = window.scrollY
        if (y === previo) seguidas += 1
        else seguidas = 0
        previo = y
        if (seguidas >= ${iguales}) {
          return { y, lecturas: i, seAsento: true, ms: performance.now() - t0 }
        }
      }
      return { y: window.scrollY, lecturas: ${tope}, seAsento: false, ms: performance.now() - t0 }
    })()`,
  )
}

export interface Caja {
  readonly top: number
  readonly bottom: number
  readonly left: number
  readonly right: number
  readonly ancho: number
  readonly alto: number
}

/** El solape de dos cajas, en píxeles por eje. `> 0` en los dos = se tapan. */
export function solape(a: Caja, b: Caja): { readonly x: number; readonly y: number; readonly seTapan: boolean } {
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left)
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  return { x, y, seTapan: x > 0 && y > 0 }
}

/**
 * La fuente, como texto, de la lectura de ESTILO EN LÍNEA del censo.
 *
 * ⚠️ Es la MISMA que usa `censo.ts` —recorrer `*` y leer `getAttribute('style')`—
 * y por eso se escribe una vez acá: `c-reducido.ts` afirma que con la preferencia
 * puesta esa lectura da cero, y si usara otra definición de «estilo en línea» su
 * cero no sería comparable con el del censo del frente B.
 */
export const LECTURA_DE_ESTILO_EN_LINEA = `(() => {
  const conEstilo = []
  for (const el of document.querySelectorAll('*')) {
    const s = el.getAttribute('style')
    if (s !== null && s.length > 0) conEstilo.push({ etiqueta: el.tagName.toLowerCase(), estilo: s })
  }
  return conEstilo
})()`

/** Redondeo a dos decimales, que es la precisión con la que se publican estas tablas. */
export function dos(n: number): number {
  return Math.round(n * 100) / 100
}
