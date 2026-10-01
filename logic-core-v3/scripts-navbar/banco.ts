/**
 * SPRINT NAVBAR V3 — lo que comparten los bancos de este sprint: la carpeta de entregas (una por ticket), cómo se abre /v3
 * (el producto, con los ganchos del banco) y cómo se viaja con la barra propia o con el menú del teléfono. Lo demás (la
 * rueda, el mouse, las teclas, grabar y armar un clip) es lo de INTERFAZ 1.
 *
 * Contra el servidor de desarrollo, con un Chrome propio por CDP, con el vsync puesto (lo que se ve) y la NVIDIA
 * (`BANCO_GPU=alta`; la placa se lee en la página y va en cada resultado).
 */
import { mkdirSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir } from '../scripts-b4/navegador'
import { ERRORES } from '../scripts-escena/formacion'
import { esperar, type Banco } from '../scripts-interfaz1/banco'

export { armarClip, correr, enCamaraLenta, esperar, grabar, ladoALado, raton, rueda, tecla, type Banco } from '../scripts-interfaz1/banco'

/** Las entregas de este sprint. */
export const DIRN = 'C:/Users/Valentino/.cache/b4-medicion/navbar'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIRN}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

export interface OpcionesDelBanco {
  readonly reducido?: boolean
  /** Bajar la CPU (×4 es un teléfono de gama media). */
  readonly cpu?: number
  /**
   * Cuánto más ancho puede salir el cuadro sin cortar. Sólo para la rama de movimiento reducido a 390: el renglón del
   * carrusel de Trabajos se pasa del borde y la página mide 402 (hallazgo del sprint, anterior a él).
   */
  readonly anchoTolerado?: number
}

/** Abre /v3 con los ganchos del banco, la pestaña al frente y el ancho verificado. */
export async function abrir(ancho: number, alto: number, o: OpcionesDelBanco = {}): Promise<Banco> {
  const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/navbar-${String(ancho)}`, ancho: ancho + 40, alto: alto + 140 })
  const p = await abrirPagina(chrome)
  const s = p.sessionId
  await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: o.reducido === true ? 'reduce' : 'no-preference' }] }, s)
  await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 1024, screenWidth: ancho, screenHeight: alto }, s)
  if (ancho < 1024) await p.conexion.enviar('Emulation.setTouchEmulationEnabled', { enabled: false }, s)
  await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `window.__entornoDeLaEscena = 'producto'; ${ERRORES}` }, s)
  await irA(p, 'http://localhost:3000/v3')
  await esperar(5000)
  let estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  for (let intento = 0; intento < 4 && estado.visible !== 'visible'; intento += 1) {
    await p.conexion.enviar('Page.bringToFront', {}, s)
    await esperar(1500)
    estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  }
  if (estado.ancho !== ancho && estado.ancho - ancho <= (o.anchoTolerado ?? 0)) console.log(`  ⚠ el cuadro mide ${String(estado.ancho)} y no ${String(ancho)} (tolerado)`)
  else if (estado.visible !== 'visible' || estado.ancho !== ancho) throw new Error(`la pestaña no está al frente o el ancho no es el pedido: ${JSON.stringify(estado)}`)
  if (o.cpu !== undefined) await p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: o.cpu }, s)
  const placa = await medir<string>(p, `(() => { const c = document.createElement('canvas').getContext('webgl'); const i = c && c.getExtension('WEBGL_debug_renderer_info'); return i ? String(c.getParameter(i.UNMASKED_RENDERER_WEBGL)) : 'desconocida' })()`)
  return {
    p,
    ancho,
    alto,
    placa,
    cerrar: async () => {
      await cerrarPagina(p)
      await cerrarChrome(chrome)
    },
  }
}

/** La placa, corta, para los rótulos. */
export const placaCorta = (b: Banco): string => (b.placa.includes('NVIDIA') ? 'NVIDIA' : b.placa.includes('AMD') ? 'AMD' : b.placa)
