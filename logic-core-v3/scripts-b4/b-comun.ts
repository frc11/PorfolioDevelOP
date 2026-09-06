/**
 * FRENTE B · MOBILE — lo que comparten los seis instrumentos de este frente.
 *
 * No es banco compartido: el banco es de los tres frentes y su dueño es el
 * padre. Esto es la plomería del frente B, y por eso vive en `b-*.ts`.
 *
 * ── Lo único que decide ───────────────────────────────────────────────────
 *
 * `conLaPagina` es la receta de `MEDICION-NAVEGADOR.md` en un solo lugar: un
 * Chrome propio sobre el perfil `b` —uno por frente, o el segundo no arranca—,
 * abrir, emular, navegar con la marca del intro, **verificar**, medir, y cerrar
 * el navegador SIEMPRE, incluso cuando la medición tiró.
 *
 * ⚠️ **El puerto es el 3002.** El otro lane corre en el 3001 y medir ahí sería
 * medir el sitio de otro worktree sin enterarse.
 *
 * ⚠️ **Un Chrome por perfil, cerrado antes del siguiente.** Emular un viewport
 * nuevo sobre una página ya pintada deja medidas tomadas con el layout viejo y
 * `svh` resuelto contra el alto anterior; `irA` recarga, pero además el alto de
 * la VENTANA del sistema cambia por perfil y no se puede cambiar en caliente.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import type { Frente } from './capturas'
import {
  abrirPagina,
  cerrarPagina,
  emular,
  irA,
  verificarLaPagina,
  type EstadoDeLaPagina,
  type Pagina,
} from './navegador'
import type { Perfil } from './perfiles'

/** La letra de este frente. Va en la ruta de toda captura y de todo JSON. */
export const FRENTE: Frente = 'b'

/** ⚠️ 3002 y no 3000: la receta canónica dice 3000, este bloque corre en 3002. */
export const ORIGEN = 'http://localhost:3002'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b4'
export const CARPETA_DE_CAPTURAS = `docs/rediseno/capturas/b4/${FRENTE}`

/** El instrumento de este frente NO estrangula: ver `perfiles.ts`, «el estrangulamiento es un eje aparte». */
export const ESTRANGULAMIENTO_DECLARADO = 'ninguno' as const

export function guardarJson(asunto: string, dato: unknown): string {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const ruta = `${RAIZ_DE_SALIDAS}/${FRENTE}-${asunto}.json`
  writeFileSync(ruta, `${JSON.stringify(dato, null, 2)}\n`, 'utf8')
  return ruta
}

export function asegurarCarpetaDeCapturas(): void {
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
}

export interface Sesion {
  readonly pagina: Pagina
  readonly estado: EstadoDeLaPagina
  readonly perfil: Perfil
}

/**
 * Abre un Chrome propio, deja la página verificada, corre el trabajo y cierra.
 *
 * El `finally` no es cortesía: si la medición tira y el Chrome queda vivo, el
 * `userDataDir` de este frente queda tomado y **la corrida siguiente no
 * arranca** — que es exactamente el choque de `MEDICION-B4.md` §0 un piso más
 * abajo.
 */
export async function conLaPagina<T>(
  perfil: Perfil,
  ruta: string,
  trabajo: (s: Sesion) => Promise<T>,
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome(FRENTE),
    // Chrome no abre ventanas más angostas que ~500 px; el viewport de layout
    // lo fija igual `setDeviceMetricsOverride`, así que la ventana sólo tiene
    // que existir y estar al frente.
    ancho: Math.max(perfil.ancho, 520),
    alto: Math.min(perfil.alto + 120, 1160),
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, `${ORIGEN}${ruta}`)
    const estado = await verificarLaPagina(p, perfil)
    const resultado = await trabajo({ pagina: p, estado, perfil })
    await cerrarPagina(p)
    return resultado
  } finally {
    await cerrarChrome(chrome)
  }
}

/** El pie de todo JSON de este frente: qué instrumento lo produjo y bajo qué condiciones. */
export interface Procedencia {
  readonly frente: Frente
  readonly instrumento: string
  readonly origen: string
  readonly estrangulamiento: string
  readonly emulado: true
  readonly fecha: string
  readonly nota: string
}

export function procedencia(instrumento: string, nota: string): Procedencia {
  return {
    frente: FRENTE,
    instrumento,
    origen: ORIGEN,
    estrangulamiento: ESTRANGULAMIENTO_DECLARADO,
    emulado: true,
    fecha: new Date().toISOString(),
    nota,
  }
}

/** Redondeo a dos decimales, que es la precisión con la que este frente publica. */
export function dos(n: number): number {
  return Math.round(n * 100) / 100
}
