/**
 * BANCO DE B7 — la plomería del bloque de los defectos abiertos.
 *
 * ── Por qué un archivo propio y no el de B4 ni el de B5 ────────────────────
 *
 * Por el mismo motivo por el que B5 escribió el suyo: **el origen está clavado
 * en el banco, y medir contra el puerto equivocado es medir el sitio de otro
 * worktree sin enterarse.** `scripts-b4/b-comun.ts` clava el 3002 y
 * `scripts-b5/b5-comun.ts` el 3000. B7 corre en el **3002**, en paralelo con
 * otra sesión que tiene el 3001, así que el número se declara acá y una sola
 * vez — y se puede pisar con `B7_ORIGEN` para medir un build de producción en
 * otro puerto sin tocar una línea.
 *
 * Lo que NO se reescribe es lo que ya está resuelto y commiteado: el cliente de
 * CDP (`scripts-b4/cdp.ts`), la receta ejecutable (`scripts-b4/navegador.ts`),
 * la tabla de perfiles (`scripts-b4/perfiles.ts`) y los tres verbos de página de
 * B5 (`scripts-b5/pagina.ts`). Este archivo agrega dos cosas.
 *
 * ── 1. La preferencia se pone en el ENTORNO, y se COMPRUEBA que llegó ──────
 *
 * `conLaPagina` acepta `movimientoReducido` y lo baja a
 * `Emulation.setEmulatedMedia`, que es el navegador y no un render. Y después
 * `verificarLaPreferencia` lee `matchMedia('(prefers-reduced-motion: reduce)')
 * .matches` **desde la página** y **tira** si no coincide con lo que se pidió.
 *
 * Esa segunda mitad es la regla «verde por arnés» de B4-B, aplicada al propio
 * instrumento: sin ella, «con la preferencia no se monta nada» podría estar
 * midiendo una corrida en la que la preferencia nunca llegó. La entrada bajo
 * prueba viene de afuera del árbol, así que se verifica que entró — no se
 * fuerza.
 *
 * ── 2. El puente de `navigator.webdriver`, heredado de B5 ─────────────────
 *
 * `introBoot.tsx` apaga el intro cuando `navigator.webdriver === true` (D11).
 * Se hereda la constante de B5 en vez de copiarla: lo que se fuerza es la
 * ENTRADA del instrumento —que el navegador no se anuncie como robot—, nunca la
 * salida que después se afirma.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import {
  abrirPagina,
  cerrarPagina,
  emular,
  medir,
  verificarLaPagina,
  type EstadoDeLaPagina,
  type Pagina,
} from '../scripts-b4/navegador'
import type { Perfil } from '../scripts-b4/perfiles'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b5/b5-comun'

export { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION }

/** ⚠️ 3002: el puerto de B7. La sesión vecina usa el 3001. */
export const ORIGEN = process.env.B7_ORIGEN ?? 'http://localhost:3002'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b7'

export function guardarJson(asunto: string, dato: unknown): string {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const ruta = `${RAIZ_DE_SALIDAS}/${asunto}.json`
  writeFileSync(ruta, `${JSON.stringify(dato, null, 2)}\n`, 'utf8')
  return ruta
}

export function dos(n: number): number {
  return Math.round(n * 100) / 100
}

export function cuatro(n: number): number {
  return Math.round(n * 10000) / 10000
}

export interface Sesion {
  readonly pagina: Pagina
  readonly estado: EstadoDeLaPagina
  readonly perfil: Perfil
}

export interface OpcionesDeNavegacion {
  /** Scripts que corren ANTES del primer pintado, en orden. */
  readonly antesDelPintado?: readonly string[]
  readonly msMaximo?: number
  /** `Emulation.setEmulatedMedia` con `prefers-reduced-motion: reduce`. */
  readonly movimientoReducido?: boolean
  /** El nombre del perfil de Chrome. Uno por frente que corra a la vez. */
  readonly quien?: string
}

/**
 * ⚠️ **LA PREFERENCIA SE LEE DE LA PÁGINA Y TIENE QUE COINCIDIR.**
 *
 * Es la mitad que le faltaba a `reducido.invariant.tsx`: la emulación se pide
 * por el protocolo, pero **quien tiene que verla es el media query del
 * documento**. Si no coincide, la corrida entera no dice nada y se corta acá en
 * vez de publicar un número que nadie puede interpretar.
 */
export async function verificarLaPreferencia(p: Pagina, esperada: boolean): Promise<boolean> {
  const leida = await medir<boolean>(
    p,
    `window.matchMedia('(prefers-reduced-motion: reduce)').matches`,
  )
  if (leida !== esperada) {
    throw new Error(
      `la preferencia NO llegó al documento: se emuló ${esperada} y matchMedia devuelve ${leida}`,
    )
  }
  return leida
}

/**
 * Abre un Chrome propio, deja la página verificada, corre el trabajo y cierra.
 *
 * El `finally` y la pausa de 900 ms son de B5 y por su misma razón: si la
 * medición tira con el Chrome vivo, el `userDataDir` queda tomado y la corrida
 * siguiente no arranca.
 */
export async function conLaPagina<T>(
  perfil: Perfil,
  ruta: string,
  trabajo: (s: Sesion) => Promise<T>,
  opciones: OpcionesDeNavegacion = {},
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome(opciones.quien ?? 'b7'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await emular(pagina, perfil, { movimientoReducido: opciones.movimientoReducido })
      for (const fuente of opciones.antesDelPintado ?? [MARCA_DE_INTRO]) {
        await pagina.conexion.enviar(
          'Page.addScriptToEvaluateOnNewDocument',
          { source: fuente },
          pagina.sessionId,
        )
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar('Page.navigate', { url: `${ORIGEN}${ruta}` }, pagina.sessionId)
      await Promise.race([cargada, new Promise((r) => setTimeout(r, opciones.msMaximo ?? 90_000))])
      const estado = await verificarLaPagina(pagina, perfil)
      await verificarLaPreferencia(pagina, opciones.movimientoReducido === true)
      return await trabajo({ pagina, estado, perfil })
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}
