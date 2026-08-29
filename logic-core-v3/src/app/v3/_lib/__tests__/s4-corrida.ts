/**
 * CORRER UN INVARIANTE Y LEER SU RESULTADO — la pieza de abajo del agregado.
 *
 * ── Por qué un proceso hijo y no un `import()` ────────────────────────────
 *
 * Porque `cerrar()` termina con `process.exit()`. Cargar los invariantes en el
 * mismo proceso mataría al corredor en el primero, que es exactamente el
 * defecto que este sprint viene a arreglar en otra forma.
 *
 * ── Por qué se corre el comando LITERAL de `package.json` ─────────────────
 *
 * El agregado no reconstruye el comando: ejecuta la cadena tal cual está
 * declarada. Si alguien rompe un script en un merge —el caso que destapó todo
 * esto— el corredor se come el error en vez de esquivarlo, y eso es lo que
 * queremos que pase.
 *
 * ── Qué se lee de la salida, y qué pasa si no está ────────────────────────
 *
 * `cerrar()` imprime `nombre: N afirmaciones, M fallas[, K fuera de ventana]`.
 * De ahí salen las tres cifras del resumen. Los controles positivos se cuentan
 * por sus marcas `[control positivo]`.
 *
 * ⚠ Si esa línea NO aparece, el invariante murió antes de cerrar —una excepción
 * al importar, por ejemplo— y **se cuenta como falla aunque el código de salida
 * diga cero**. Un invariante que no llega a resumir no verificó nada, y un
 * corredor que lo dé por bueno es un verde por vacío con más pasos.
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cinco niveles: __tests__ → _lib → v3 → app → src → raíz del proyecto. */
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

export interface Resultado {
  readonly script: string
  readonly comando: string
  readonly codigo: number
  readonly afirmaciones: number
  readonly fallas: number
  readonly fueraDeVentana: number
  readonly controles: number
  /** Si se encontró la línea de resumen de `cerrar()`. */
  readonly resumio: boolean
  readonly ms: number
  readonly salida: string
}

const RE_RESUMEN = /^\S+: (\d+) afirmaciones, (\d+) fallas(?:, (\d+) fuera de ventana)?\s*$/gm

/** La última línea de resumen de la salida, o `null` si no hay ninguna. */
export function leerResumen(salida: string): { afirmaciones: number; fallas: number; fueraDeVentana: number } | null {
  RE_RESUMEN.lastIndex = 0
  let ultimo: RegExpExecArray | null = null
  let m: RegExpExecArray | null = RE_RESUMEN.exec(salida)
  while (m !== null) {
    ultimo = m
    m = RE_RESUMEN.exec(salida)
  }
  if (ultimo === null) return null
  return {
    afirmaciones: Number.parseInt(ultimo[1], 10),
    fallas: Number.parseInt(ultimo[2], 10),
    fueraDeVentana: ultimo[3] === undefined ? 0 : Number.parseInt(ultimo[3], 10),
  }
}

export function contarControles(salida: string): number {
  return (salida.match(/\[control positivo\]/g) ?? []).length
}

/** Un resultado se considera fallado si falló, si murió, o si no resumió. */
export function fallo(r: Resultado): boolean {
  return r.codigo !== 0 || r.fallas > 0 || !r.resumio
}

export function correr(script: string, comando: string): Resultado {
  const desde = Date.now()
  const proceso = spawnSync(comando, {
    cwd: RAIZ,
    shell: true,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  })
  const ms = Date.now() - desde
  const stdout = proceso.stdout ?? ''
  const stderr = proceso.stderr ?? ''
  const salida = stderr.length > 0 ? `${stdout}\n[stderr]\n${stderr}` : stdout
  const resumen = leerResumen(salida)
  return {
    script,
    comando,
    codigo: proceso.status === null ? 1 : proceso.status,
    afirmaciones: resumen?.afirmaciones ?? 0,
    fallas: resumen?.fallas ?? 0,
    fueraDeVentana: resumen?.fueraDeVentana ?? 0,
    controles: contarControles(salida),
    resumio: resumen !== null,
    ms,
    salida,
  }
}
