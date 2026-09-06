/**
 * LA RECETA DE `MEDICION-NAVEGADOR.md`, EJECUTABLE — extendida a mobile, a
 * `prefers-reduced-motion` y al estrangulamiento.
 *
 * Los cinco pasos de la receta son los mismos y en el mismo orden. Lo que cambia
 * es que acá son código y no una lista que alguien sigue a mano:
 *
 *   1. abrir la página            → `abrirPagina`
 *   2. emular el viewport         → `emular`
 *   3. recargar con la marca      → `irA` con `marcaDeIntro`
 *   4. VERIFICAR que existe       → `verificarLaPagina`  ⚠️ tira si no
 *   5. medir o capturar           → `medir` / `capturar`
 *
 * ⚠️ **El paso 4 tira, no avisa.** En la receta escrita es un párrafo que dice
 * «no se mide igual, para ver»; acá es una excepción. Es la única forma de que
 * la lección de agosto —una pestaña oculta hace que toda medición de scroll y de
 * layout dé cero— no se pueda saltear por apuro.
 */

import { Conexion, type ChromeLanzado } from './cdp'
import type { Estrangulamiento, Perfil } from './perfiles'

/** La clave que apaga el preloader. La emite `home-intro/introHandoff.ts`. */
export const MARCA_DE_INTRO = "try { sessionStorage.setItem('home:intro','1') } catch (e) {}"

export interface Pagina {
  readonly conexion: Conexion
  readonly sessionId: string
  readonly targetId: string
}

export async function abrirPagina(chrome: ChromeLanzado): Promise<Pagina> {
  const { targetId } = (await chrome.conexion.enviar('Target.createTarget', { url: 'about:blank' })) as {
    targetId: string
  }
  const { sessionId } = (await chrome.conexion.enviar('Target.attachToTarget', {
    targetId,
    flatten: true,
  })) as { sessionId: string }
  const pagina: Pagina = { conexion: chrome.conexion, sessionId, targetId }
  await chrome.conexion.enviar('Page.enable', {}, sessionId)
  await chrome.conexion.enviar('Runtime.enable', {}, sessionId)
  await chrome.conexion.enviar('Network.enable', {}, sessionId)
  return pagina
}

/**
 * PASO 2 — el viewport, el puntero, el medio emulado y el estrangulamiento.
 *
 * `setDeviceMetricsOverride` y no un `resize` de la ventana del sistema: la
 * receta lo dice y la razón es que el alto de la barra de título, la barra de
 * tareas y el escalado de Windows se meten en el número.
 */
export async function emular(
  p: Pagina,
  perfil: Perfil,
  opciones: {
    readonly estrangulamiento?: Estrangulamiento
    readonly movimientoReducido?: boolean
  } = {},
): Promise<void> {
  await p.conexion.enviar(
    'Emulation.setDeviceMetricsOverride',
    {
      width: perfil.ancho,
      height: perfil.alto,
      deviceScaleFactor: perfil.dpr,
      mobile: perfil.movil,
      screenWidth: perfil.ancho,
      screenHeight: perfil.alto,
    },
    p.sessionId,
  )
  // `maxTouchPoints` tiene que estar entre 1 y 16 SIEMPRE, incluso con
  // `enabled: false` — el protocolo rechaza el 0 con «Touch points must be
  // between 1 and 16». Con `enabled: false` el número no se usa.
  await p.conexion.enviar(
    'Emulation.setTouchEmulationEnabled',
    { enabled: perfil.tactil, maxTouchPoints: 5 },
    p.sessionId,
  )
  // `features` vacío BORRA el override anterior. Se manda siempre, para que una
  // corrida con la preferencia puesta no contamine a la siguiente.
  await p.conexion.enviar(
    'Emulation.setEmulatedMedia',
    {
      features:
        opciones.movimientoReducido === true
          ? [{ name: 'prefers-reduced-motion', value: 'reduce' }]
          : [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
    },
    p.sessionId,
  )
  const e = opciones.estrangulamiento
  await p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: e?.cpu ?? 1 }, p.sessionId)
  await p.conexion.enviar(
    'Network.emulateNetworkConditions',
    {
      offline: false,
      latency: e?.latenciaMs ?? 0,
      downloadThroughput: e?.bajadaBps ?? -1,
      uploadThroughput: e?.subidaBps ?? -1,
    },
    p.sessionId,
  )
}

/**
 * PASO 3 — navegar con la marca del intro puesta ANTES del primer pintado.
 *
 * `Page.addScriptToEvaluateOnNewDocument` es el equivalente exacto del
 * `initScript` de la receta, y por la misma razón: el `<script>` pre-paint del
 * layout raíz lee la clave antes de pintar. Un `evaluate` posterior llegaría
 * tarde y dejaría el overlay de 4,275 s encima de la primera medición.
 */
export async function irA(
  p: Pagina,
  url: string,
  opciones: { readonly marcaDeIntro?: boolean; readonly msMaximo?: number } = {},
): Promise<void> {
  if (opciones.marcaDeIntro !== false) {
    await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: MARCA_DE_INTRO }, p.sessionId)
  }
  const cargada = new Promise<void>((resolver) => {
    p.conexion.al('Page.loadEventFired', () => resolver())
  })
  await p.conexion.enviar('Page.navigate', { url }, p.sessionId)
  await Promise.race([cargada, new Promise((r) => setTimeout(r, opciones.msMaximo ?? 60_000))])
}

export interface EstadoDeLaPagina {
  readonly visibilityState: string
  readonly hasFocus: boolean
  readonly innerWidth: number
  readonly innerHeight: number
  readonly dpr: number
  readonly alturaDelDocumento: number
  readonly rafCorre: boolean
}

/**
 * PASO 4 — la verificación que la receta exige, con una comprobación DE MÁS.
 *
 * La receta pide cuatro campos. Acá hay un quinto: **`rafCorre`**, que resuelve
 * un `requestAnimationFrame` con un tope de 1 s. `visibilityState: 'visible'` es
 * necesario y no suficiente —una ventana puede reportarse visible y aun así
 * tener los rendering steps salteados—, y todo lo que este bloque mide del
 * recorrido depende de que `rAF` corra. Es la lección de agosto, comprobada en
 * vez de supuesta.
 *
 * `hasFocus` se registra y NO bloquea: una pestaña visible sin foco despacha
 * rendering steps igual. Con dos Chrome en pantalla —el otro lane tiene el
 * suyo— exigir foco haría fallar mediciones buenas.
 */
export async function verificarLaPagina(p: Pagina, perfil: Perfil): Promise<EstadoDeLaPagina> {
  const estado = await medir<EstadoDeLaPagina>(
    p,
    `(async () => {
      const rafCorre = await new Promise((r) => {
        const t = setTimeout(() => r(false), 1000)
        requestAnimationFrame(() => { clearTimeout(t); r(true) })
      })
      return {
        visibilityState: document.visibilityState,
        hasFocus: document.hasFocus(),
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        dpr: window.devicePixelRatio,
        alturaDelDocumento: document.documentElement.scrollHeight,
        rafCorre,
      }
    })()`,
  )
  const problemas: string[] = []
  if (estado.visibilityState !== 'visible') problemas.push(`visibilityState="${estado.visibilityState}"`)
  if (estado.innerWidth !== perfil.ancho) problemas.push(`innerWidth=${estado.innerWidth}, se pidió ${perfil.ancho}`)
  if (estado.innerHeight !== perfil.alto) problemas.push(`innerHeight=${estado.innerHeight}, se pidió ${perfil.alto}`)
  if (estado.dpr !== perfil.dpr) problemas.push(`dpr=${estado.dpr}, se pidió ${perfil.dpr}`)
  if (!estado.rafCorre) problemas.push('requestAnimationFrame NO corrió en 1 s')
  if (problemas.length > 0) {
    throw new Error(`la página no está en condiciones de medirse — ${problemas.join(' · ')}`)
  }
  return estado
}

/** PASO 5a — leer. `awaitPromise` para que una expresión asíncrona se pueda esperar. */
export async function medir<T>(p: Pagina, expresion: string): Promise<T> {
  const r = (await p.conexion.enviar(
    'Runtime.evaluate',
    { expression: expresion, awaitPromise: true, returnByValue: true },
    p.sessionId,
  )) as { result?: { value?: T }; exceptionDetails?: { text?: string; exception?: { description?: string } } }
  if (r.exceptionDetails !== undefined) {
    throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text ?? 'excepción en la página')
  }
  return r.result?.value as T
}

/** Mueve el scroll de verdad y espera dos cuadros. La receta prohíbe verificar scroll por geometría. */
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

export async function cerrarPagina(p: Pagina): Promise<void> {
  await p.conexion.enviar('Target.closeTarget', { targetId: p.targetId })
}
