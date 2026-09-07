import { medir } from '../scripts-b4/navegador'
import type { Pagina } from '../scripts-b4/navegador'
import type { Perfil } from '../scripts-b4/perfiles'

import { lectorDeCajasDeTexto } from './b5-comun'
import type { CajaDeTexto } from './glifo'

/**
 * LAS TRES COSAS QUE LOS INSTRUMENTOS DE B5 LE HACEN A LA PÁGINA.
 *
 * Mover el puntero de verdad, apagar una capa, y leer la caja del texto. Las
 * tres las usan `b-paralaje.ts` y `e-discriminador.ts`, y las tres tienen que
 * hacerse **igual** en los dos: si el discriminador ocultara la escena de otra
 * forma que el medidor de contraste, su veredicto no diría nada sobre lo que el
 * medidor mide.
 */

export interface CajaYTinta {
  /** Una caja POR ELEMENTO. Ver el docblock de `glifo.ts`: la unión miente. */
  readonly cajas: readonly CajaDeTexto[]
  readonly caja: CajaDeTexto
  readonly tinta: readonly [number, number, number]
  readonly texto: string
  readonly elementos: number
  /** Cuántos nodos se saltearon por tener un ancestro con `clip-path`. */
  readonly nodosSalteadosPorRecorte: number
}

/**
 * ⚠️ **EL PUNTERO SE MUEVE DE VERDAD, POR CDP.**
 *
 * `Input.dispatchMouseEvent` produce un evento de confianza que r3f trata como
 * cualquier otro, y —lo que importa— **pasa por el hit-test del navegador**. Un
 * `PointerEvent` sintético despachado sobre un elemento elegido a mano se saltea
 * ese hit-test, que es exactamente donde estaba el defecto que B5 encontró: el
 * div de r3f nunca es el blanco de un `pointermove` real.
 *
 * Van DOS eventos: uno al centro y otro al destino. Con uno solo, un `pointermove`
 * que llega mientras el árbol todavía no conectó sus listeners se pierde.
 */
export async function moverElPuntero(p: Pagina, perfil: Perfil, x: number, y: number): Promise<void> {
  for (const punto of [
    { x: Math.round(perfil.ancho / 2), y: Math.round(perfil.alto / 2) },
    { x, y },
  ]) {
    await p.conexion.enviar(
      'Input.dispatchMouseEvent',
      { type: 'mouseMoved', x: punto.x, y: punto.y, button: 'none', buttons: 0 },
      p.sessionId,
    )
  }
}

/**
 * Apaga o prende una capa con `visibility`, y **devuelve si tomó**.
 *
 * `visibility: hidden` y no `display: none` a propósito: conserva el layout, así
 * que la caja del texto medida antes sigue valiendo sobre la captura de después.
 * Devolver el resultado no es cortesía — una captura de «fondo» tomada con la
 * capa todavía visible es una medición que se ve bien y no dice nada.
 */
export async function ocultarPorSelector(p: Pagina, selector: string, oculto: boolean): Promise<boolean> {
  return medir<boolean>(
    p,
    `(async () => {
      const nodos = [...document.querySelectorAll(${JSON.stringify(selector)})]
      for (const el of nodos) el.style.visibility = ${oculto ? "'hidden'" : "''"}
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      return nodos.every((el) => getComputedStyle(el).visibility === ${oculto ? "'hidden'" : "'visible'"})
    })()`,
  )
}

/** La caja del texto y su color, leídos del DOM. Nunca de un token. */
export async function cajaYTinta(p: Pagina, selector: string): Promise<CajaYTinta> {
  return medir<CajaYTinta>(p, lectorDeCajasDeTexto(selector))
}

/**
 * ⚠️ **QUE LA PÁGINA ESTÉ ENTERA, Y NO A MEDIO COMPILAR.**
 *
 * `next dev` recompila cuando un archivo cambia, y una corrida que empieza justo
 * después de tocar una constante puede fotografiar la página **sin hoja de
 * estilos**, con el cartel «Compiling…» encima. Pasó: una corrida devolvió 12.402
 * píxeles de glifo donde las otras seis daban 39.628, y la captura mostraba una
 * lista de viñetas en serif sobre blanco.
 *
 * El detector es geométrico y no mira un cartel: **las ocho secciones, con sus
 * altos múltiplos exactos del viewport**. Una página sin CSS no cumple ninguna de
 * las dos cosas.
 */
export async function verificarQueLaPaginaEstaEntera(p: Pagina, perfil: Perfil): Promise<void> {
  const estado = await medir<{ paneles: number; altos: number[]; docH: number }>(
    p,
    `(() => {
      const ps = [...document.querySelectorAll('[data-panel]')]
      return {
        paneles: ps.length,
        altos: ps.map((x) => Math.round(x.getBoundingClientRect().height)),
        docH: document.documentElement.scrollHeight,
      }
    })()`,
  )
  const problemas: string[] = []
  if (estado.paneles !== 8) problemas.push(`hay ${estado.paneles} paneles y tienen que ser 8`)
  const fueraDeGrilla = estado.altos.filter((a) => a % perfil.alto !== 0)
  if (fueraDeGrilla.length > 0) {
    problemas.push(`altos que no son múltiplo de ${perfil.alto}: ${fueraDeGrilla.join(', ')}`)
  }
  if (problemas.length > 0) {
    throw new Error(
      `la página no está entera (¿el dev server recompilando?) — ${problemas.join(' · ')}. docH=${estado.docH}`,
    )
  }
}
