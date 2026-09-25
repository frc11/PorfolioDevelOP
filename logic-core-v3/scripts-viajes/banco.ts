/**
 * SPRINT VIAJES — el banco del sprint: abrir /v3 en un ancho, moverse por scroll o por viaje, y
 * leer el estado de la página. Sobre el Chrome propio de `scripts-b4/` (CDP), siempre con el
 * candado tomado por quien lo corre.
 *
 * ⚠ Emula `prefers-reduced-motion: no-preference` salvo que se pida lo contrario: el Chrome de
 * medición viene con movimiento reducido y con eso cada sección pinta su árbol quieto, o sea una
 * pose que no es la del sitio.
 */
import { writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome, type ChromeLanzado } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir, type Pagina } from '../scripts-b4/navegador'

export const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

export interface Banco {
  readonly p: Pagina
  readonly ancho: number
  readonly alto: number
  /** Re-manda la emulación: una captura congela los pasos de render (CLAUDE.md). */
  readonly emular: () => Promise<unknown>
  readonly cerrar: () => Promise<void>
}

export async function abrirBanco(ancho: number, alto: number, opciones: { readonly reducido?: boolean; readonly perfil?: string; readonly antesDeCargar?: string } = {}): Promise<Banco> {
  const chrome: ChromeLanzado = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/${opciones.perfil ?? 'viajes'}-${String(ancho)}`, ancho: ancho + 40, alto: alto + 140 })
  const p = await abrirPagina(chrome)
  const s = p.sessionId
  const emular = (): Promise<unknown> =>
    p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 1024, screenWidth: ancho, screenHeight: alto }, s)
  await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: opciones.reducido === true ? 'reduce' : 'no-preference' }] }, s)
  await emular()
  // Un script que corre antes que la página (una bandera, un instrumento): lo pide SPRINT ESCENA.
  if (opciones.antesDeCargar !== undefined) await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: opciones.antesDeCargar }, s)
  await irA(p, 'http://localhost:3000/v3')
  await esperar(4000)
  const estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  if (estado.visible !== 'visible' || estado.ancho !== ancho) throw new Error(`la pestaña no está al frente o el ancho no es el pedido: ${JSON.stringify(estado)}`)
  return {
    p,
    ancho,
    alto,
    emular,
    cerrar: async () => {
      await cerrarPagina(p)
      await cerrarChrome(chrome)
    },
  }
}

/** El tope de una sección en el documento. */
export function topeDe(b: Banco, id: string): Promise<number> {
  return medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return r.top + scrollY })()`)
}

/**
 * LLEGAR POR SCROLL — de a pasos chicos, como una rueda, y con espera para que todo lo que corre
 * por tiempo (el barrido, el túnel, el rodillo, la cámara) se asiente. Es la referencia contra la
 * que se compara el viaje.
 */
export async function scrollHasta(b: Banco, destino: number, pasoPx = 90, msPorPaso = 22): Promise<number> {
  await medir<number>(
    b.p,
    `(async () => { const d = ${String(destino)}; const paso = d > scrollY ? ${String(pasoPx)} : -${String(pasoPx)}; for (let a = scrollY; paso > 0 ? a < d : a > d; a += paso) { window.scrollTo(0, a); await new Promise((r) => setTimeout(r, ${String(msPorPaso)})) } window.scrollTo(0, d); return 1 })()`,
  )
  await esperar(2500)
  return medir<number>(b.p, 'scrollY')
}

export async function captura(b: Banco, destino: string): Promise<void> {
  const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  writeFileSync(destino, Buffer.from(shot.data, 'base64'))
  await b.emular()
}
