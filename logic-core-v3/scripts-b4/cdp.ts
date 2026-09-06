/**
 * CLIENTE DEL PROTOCOLO DE DEVTOOLS — sin dependencias.
 *
 * ── ⚠️ POR QUÉ EXISTE, Y NO ES UNA PREFERENCIA ────────────────────────────
 *
 * `chrome-devtools-mcp` levanta **un** Chrome sobre **un** `userDataDir` fijo
 * (`~/.cache/chrome-devtools-mcp/chrome-profile`). Este bloque corre en paralelo
 * con otro lane en `C:\v3-costura`, y el otro lane lo tomó primero: cualquier
 * llamada de este lado devuelve, textual, «The browser is already running for …
 * Use a different `userDataDir` or stop the running browser first».
 *
 * Las dos salidas obvias eran las dos malas: **matar ese Chrome** rompe la
 * medición del otro lane en la mitad, y **esperar** deja este bloque sin
 * instrumento por tiempo indefinido. La tercera es ésta: **un Chrome propio,
 * sobre un perfil propio, manejado por CDP directo.**
 *
 * No suma una dependencia. `WebSocket` es global en Node desde la 22 —acá corre
 * la 24— y lanzar un proceso es `node:child_process`. Lo único que se agrega es
 * este archivo.
 *
 * ── Y da MÁS de lo que daba el MCP, que es lo que lo vuelve la salida buena ─
 *
 *   · `Emulation.setEmulatedMedia` con `prefers-reduced-motion: reduce`, que la
 *     herramienta MCP **no expone** y que la instrucción pide medir.
 *   · `Page.captureScreenshot` con `clip` y `captureBeyondViewport`, o sea la
 *     captura de una sección más alta que la ventana sin pegar cuadros.
 *   · Las cifras salen de un script commiteado y no de una transcripción de
 *     llamadas: se pueden volver a correr.
 *
 * ── La regla de método que este archivo NO puede violar ───────────────────
 *
 * El Chrome se lanza **con ventana**, y con los tres interruptores que apagan el
 * ahorro de energía de Chromium (`--disable-backgrounding-occluded-windows` y
 * sus dos hermanos). Con la ventana ocluida, Chrome saltea los rendering steps:
 * no despacha `scroll`, no corre `requestAnimationFrame` y `innerWidth` da 0.
 * Aun así **ninguna lectura de este banco se cree sin verificar**: ver
 * `verificarLaPagina` en `navegador.ts`.
 */

import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'

export const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

/** Los interruptores, cada uno con su motivo. Un flag sin motivo es carga de culto. */
export const BANDERAS: readonly string[] = [
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  // Los tres que sostienen la regla de la pestaña al frente.
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  // Ruido que cambiaría las cifras de red y de CPU del frente A.
  '--disable-features=Translate,MediaRouter,OptimizationHints,CalculateNativeWinOcclusion',
  '--disable-sync',
  '--metrics-recording-only',
  '--mute-audio',
]

/**
 * ⚠️ **UN PERFIL POR FRENTE, Y NO ES UN LUJO.** Es exactamente el choque que
 * obligó a escribir este archivo: dos procesos sobre el mismo `userDataDir` y el
 * segundo no arranca. Los tres frentes de la Fase 1 corren a la vez; si
 * compartieran perfil, dos de tres morirían con «The browser is already
 * running».
 */
export function perfilDeChrome(quien: string): string {
  return `C:\\Users\\Valentino\\.cache\\b4-medicion\\${quien}`
}

interface Pendiente {
  readonly resolver: (valor: Record<string, unknown>) => void
  readonly rechazar: (error: Error) => void
}

export type Manejador = (parametros: Record<string, unknown>) => void

/**
 * Una conexión al Chrome. `enviar` habla con el navegador; `enviarAlObjetivo`
 * habla con una pestaña, usando sesiones planas (`flatten: true`), que es lo que
 * el protocolo pide desde hace años y lo que evita tener un socket por pestaña.
 */
export class Conexion {
  private readonly socket: WebSocket
  private readonly pendientes = new Map<number, Pendiente>()
  private readonly manejadores = new Map<string, Manejador[]>()
  private siguiente = 1

  private constructor(socket: WebSocket) {
    this.socket = socket
    this.socket.addEventListener('message', (evento: MessageEvent) => {
      const mensaje = JSON.parse(String(evento.data)) as {
        id?: number
        method?: string
        params?: Record<string, unknown>
        result?: Record<string, unknown>
        error?: { message: string }
      }
      if (typeof mensaje.id === 'number') {
        const p = this.pendientes.get(mensaje.id)
        if (p === undefined) return
        this.pendientes.delete(mensaje.id)
        if (mensaje.error !== undefined) p.rechazar(new Error(mensaje.error.message))
        else p.resolver(mensaje.result ?? {})
        return
      }
      if (typeof mensaje.method === 'string') {
        for (const m of this.manejadores.get(mensaje.method) ?? []) m(mensaje.params ?? {})
      }
    })
  }

  static async abrir(url: string): Promise<Conexion> {
    const socket = new WebSocket(url)
    await new Promise<void>((resolver, rechazar) => {
      socket.addEventListener('open', () => resolver(), { once: true })
      socket.addEventListener('error', () => rechazar(new Error(`no se pudo abrir ${url}`)), { once: true })
    })
    return new Conexion(socket)
  }

  al(evento: string, manejador: Manejador): void {
    const lista = this.manejadores.get(evento) ?? []
    lista.push(manejador)
    this.manejadores.set(evento, lista)
  }

  enviar(metodo: string, parametros: Record<string, unknown> = {}, sessionId?: string): Promise<Record<string, unknown>> {
    const id = this.siguiente
    this.siguiente += 1
    const sobre: Record<string, unknown> = { id, method: metodo, params: parametros }
    if (sessionId !== undefined) sobre.sessionId = sessionId
    this.socket.send(JSON.stringify(sobre))
    return new Promise((resolver, rechazar) => {
      this.pendientes.set(id, { resolver, rechazar })
    })
  }

  cerrar(): void {
    this.socket.close()
  }
}

export interface ChromeLanzado {
  readonly proceso: ChildProcess
  readonly conexion: Conexion
  readonly perfil: string
  readonly puerto: number
}

/**
 * Lanza un Chrome propio y se conecta.
 *
 * ⚠️ **El puerto se pide en 0 y se LEE de `DevToolsActivePort`.** Fijar un
 * número a mano es la forma de descubrir, tres corridas después, que se estaba
 * midiendo el navegador de otro proceso que ya tenía ese puerto — que es el
 * mismo modo de falla que el puerto 3001/3002 de este sprint, un piso más abajo.
 */
export async function lanzarChrome(opciones: {
  readonly perfil: string
  readonly ancho: number
  readonly alto: number
  readonly limpiarPerfil?: boolean
  /** Dónde poner la ventana. Con tres frentes a la vez, tres ventanas encimadas. */
  readonly x?: number
  readonly y?: number
}): Promise<ChromeLanzado> {
  const { perfil } = opciones
  if (opciones.limpiarPerfil === true && existsSync(perfil)) rmSync(perfil, { recursive: true, force: true })
  const marca = path.join(perfil, 'DevToolsActivePort')
  if (existsSync(marca)) rmSync(marca, { force: true })

  const proceso = spawn(
    CHROME,
    [
      '--remote-debugging-port=0',
      `--user-data-dir=${perfil}`,
      `--window-size=${opciones.ancho},${opciones.alto}`,
      `--window-position=${opciones.x ?? 0},${opciones.y ?? 0}`,
      ...BANDERAS,
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: false },
  )

  const puerto = await esperarElPuerto(marca)
  const version = (await (await fetch(`http://127.0.0.1:${puerto}/json/version`)).json()) as {
    webSocketDebuggerUrl: string
  }
  const conexion = await Conexion.abrir(version.webSocketDebuggerUrl)
  return { proceso, conexion, perfil, puerto }
}

async function esperarElPuerto(marca: string, msMaximo = 30_000): Promise<number> {
  const hasta = Date.now() + msMaximo
  while (Date.now() < hasta) {
    if (existsSync(marca)) {
      const primera = readFileSync(marca, 'utf8').split('\n')[0].trim()
      const n = Number(primera)
      if (Number.isInteger(n) && n > 0) return n
    }
    await new Promise((r) => setTimeout(r, 120))
  }
  throw new Error(`Chrome no publicó su puerto en ${msMaximo} ms — no se lanzó, o el perfil está tomado`)
}

/** Cierra el navegador. Se llama SIEMPRE, incluso cuando la medición falló. */
export async function cerrarChrome(chrome: ChromeLanzado): Promise<void> {
  try {
    await chrome.conexion.enviar('Browser.close')
  } catch {
    // Si ya se cayó, el kill de abajo alcanza.
  }
  chrome.conexion.cerrar()
  chrome.proceso.kill()
}
