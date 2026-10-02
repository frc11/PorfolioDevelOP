/**
 * SPRINT 3D Y SONIDO — lo que comparten los bancos de este sprint: la carpeta de entregas (una por ticket), la compuerta
 * de memoria antes de cada parte y la verificación del servidor. Abrir /v3, el mouse, la rueda, grabar y armar un clip
 * son los del navbar (y los de INTERFAZ 1 debajo): con un Chrome propio por CDP, con el vsync puesto y la NVIDIA
 * (`BANCO_GPU=alta`; la placa se lee en la página y va en cada resultado).
 *
 * La compuerta de memoria: antes de cada parte, 1,5 GB libres; si no, espera 2 minutos y reintenta hasta 5 veces, y si
 * sigue baja corre igual (y lo dice). Si el servidor no contesta, la parte se corta con `SERVIDOR CAIDO` (se levanta a
 * mano, se matan sus hijos y se repite una vez).
 */
import { mkdirSync } from 'node:fs'
import { freemem } from 'node:os'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir } from '../scripts-b4/navegador'
import { CONTADOR } from '../scripts-escena/banco-escena'
import { ERRORES } from '../scripts-escena/formacion'
import { esperar, type Banco } from '../scripts-navbar/banco'

export { abrir, armarClip, correr, enCamaraLenta, esperar, grabar, ladoALado, placaCorta, raton, rueda, tecla, type Banco } from '../scripts-navbar/banco'

/**
 * Como `abrir` del navbar, con el pedido del banco de la escena (`producto,titulos=blanco`, `producto,titulos=no`…) y,
 * si hace falta, sin él (`null`: la página como la abre una persona, con la consulta de la URL). Con `contador`, las
 * llamadas de dibujo y los triángulos del último cuadro (`window.__dibujos`, el de ESCENA 5).
 */
export async function abrirCon(entorno: string | null, ancho: number, alto: number, consulta = '', reducido = false, contador = false): Promise<Banco> {
  const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/3d-sonido-${String(ancho)}`, ancho: ancho + 40, alto: alto + 140 })
  const p = await abrirPagina(chrome)
  const s = p.sessionId
  await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reducido ? 'reduce' : 'no-preference' }] }, s)
  await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 1024, screenWidth: ancho, screenHeight: alto }, s)
  const gancho = entorno === null ? '' : `window.__entornoDeLaEscena = '${entorno}';`
  await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `${gancho} ${ERRORES}; ${contador ? CONTADOR : ''}` }, s)
  await irA(p, `http://localhost:3000/v3${consulta === '' ? '' : `?${consulta}`}`)
  await esperar(6000)
  let estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  for (let intento = 0; intento < 4 && estado.visible !== 'visible'; intento += 1) {
    await p.conexion.enviar('Page.bringToFront', {}, s)
    await esperar(1500)
    estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  }
  if (estado.visible !== 'visible' || estado.ancho !== ancho) throw new Error(`la pestaña no está al frente o el ancho no es el pedido: ${JSON.stringify(estado)}`)
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

/** Un viaje con la barra (desde 1024) o con el menú del teléfono, como en el retoque 3 del navbar. */
export async function viajarA(b: Banco, id: string): Promise<void> {
  if (b.ancho >= 1024) {
    await medir(b.p, `document.querySelector('[data-pieza="barra"] a[href="#${id}"]').click()`)
    return
  }
  await medir(b.p, `document.querySelector('[data-parte="boton-del-menu"]').click()`)
  await esperar(1200)
  await medir(b.p, `document.querySelector('[data-pieza="menu-movil"] a[href="#${id}"]').click()`)
}

/** Una captura de lo que se ve (PNG), con un recorte opcional EN EL CUADRO (el `clip` de CDP va en la página: se le suma el scroll). */
export async function capturar(b: Banco, destino: string, recorte?: readonly [number, number, number, number]): Promise<void> {
  const [sx, sy] = await medir<[number, number]>(b.p, '[scrollX, scrollY]')
  const clip = recorte === undefined ? undefined : { x: recorte[0] + sx, y: recorte[1] + sy, width: recorte[2], height: recorte[3], scale: 1 }
  const r = await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png', ...(clip === undefined ? {} : { clip }) }, b.p.sessionId)
  const { writeFileSync } = await import('node:fs')
  writeFileSync(destino, Buffer.from((r as { data: string }).data, 'base64'))
  // Una captura congela los pasos de render (CLAUDE.md): se vuelve a emular el cuadro.
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: b.ancho, height: b.alto, deviceScaleFactor: 1, mobile: b.ancho < 1024, screenWidth: b.ancho, screenHeight: b.alto }, b.p.sessionId)
}

/** Las entregas de este sprint. */
export const DIR3 = 'C:/Users/Valentino/.cache/b4-medicion/3d-sonido'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIR3}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

const UMBRAL_GB = 1.5

/** Antes de cada parte: memoria y servidor. */
export async function antesDeLaParte(nombre: string): Promise<void> {
  for (let intento = 0; ; intento += 1) {
    const libre = freemem() / 1024 ** 3
    if (libre >= UMBRAL_GB) break
    if (intento >= 5) {
      console.log(`  ⚠ ${nombre}: ${libre.toFixed(2)} GB libres después de 5 esperas; corre igual`)
      break
    }
    console.log(`  … ${nombre}: ${libre.toFixed(2)} GB libres (< ${String(UMBRAL_GB)}); espera 2 min (${String(intento + 1)}/5)`)
    await esperar(120_000)
  }
  try {
    const r = await fetch('http://localhost:3000/v3', { signal: AbortSignal.timeout(90_000) })
    if (!r.ok) throw new Error(String(r.status))
  } catch (e) {
    throw new Error(`SERVIDOR CAIDO antes de ${nombre}: ${e instanceof Error ? e.message : String(e)}`)
  }
}
