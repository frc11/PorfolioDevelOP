/**
 * BANCO DE VIDRIO — el prototipo del logo claro, medido sin tocar el árbol.
 *
 * ⚠️ **NINGUNA VARIANTE SE APLICA AL CÓDIGO.** El pedido es explícito: las tres
 * variantes viven sólo como capturas y el árbol queda como estaba. Por eso el
 * material se cambia **desde el navegador**, caminando la escena de three.js por
 * CDP: se le escribe al material vivo, se saca la foto y se deshace. No hay un
 * `git show` que restaurar porque no hubo edición.
 *
 * La escena se alcanza por el `__r3f` que `react-three-fiber` cuelga del propio
 * `<canvas>`. Es API interna de la librería y por eso la sonda la VERIFICA antes
 * de usarla, en vez de suponerla.
 */

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
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b5/b5-comun'

export const ORIGEN = 'http://localhost:3000'
export const SALIDAS = 'docs/rediseno/outputs/vidrio'

/** Los dos anchos que el pedido nombra. */
export const PERFILES: readonly Perfil[] = [perfilPorId('768'), perfilPorId('375')]

/** Lo que la escena tarda en pintar su primer cuadro y asentarse (B5/B6/B8). */
export const ASENTAMIENTO_MS = 4500

export interface Sesion {
  readonly pagina: Pagina
  readonly estado: EstadoDeLaPagina
  readonly perfil: Perfil
}

export function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function conLaPagina<T>(
  perfil: Perfil,
  trabajo: (s: Sesion) => Promise<T>,
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('vidrio'),
    ancho: Math.max(perfil.ancho, 520),
    alto: perfil.alto + 120,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await emular(pagina, perfil)
      for (const fuente of [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION]) {
        await pagina.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: fuente }, pagina.sessionId)
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar('Page.navigate', { url: `${ORIGEN}/v3` }, pagina.sessionId)
      await Promise.race([cargada, esperar(90_000)])
      const estado = await verificarLaPagina(pagina, perfil)
      return await trabajo({ pagina, estado, perfil })
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await esperar(900)
  }
}

/** Scroll real, con dos cuadros de gracia. La receta prohíbe verificarlo por geometría. */
export async function scrollA(p: Pagina, y: number): Promise<number> {
  return medir<number>(
    p,
    `(async () => {
      window.scrollTo(0, ${y})
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      return window.scrollY
    })()`,
  )
}
