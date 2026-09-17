/**
 * BANCO DE MOVIL-1 — la plomería para medir la escena a 390×844, y nada más.
 *
 * ── Qué hereda y qué escribe ──────────────────────────────────────────────
 *
 * El cliente de CDP, el lanzador de Chrome y los lectores se importan tal cual
 * de `scripts-b4/` y `scripts-b8/`. Lo propio es **una sola cosa, y es la razón
 * por la que este archivo existe**: el `deviceScaleFactor`.
 *
 * ── ⚠️ POR QUÉ ESTE BANCO NO PUEDE USAR `scripts-b4/perfiles.ts` ──────────
 *
 * Aquel banco clava `dpr: 1` en los siete perfiles, con su motivo escrito: con
 * `x2` la captura pesa cuatro veces y **el canvas 3D cambia su resolución de
 * render**, así que ninguna cifra sería comparable con las `x1` ya publicadas.
 * Para medir LAYOUT eso es correcto y no se toca.
 *
 * **Para medir el costo de la escena es exactamente lo contrario, y si no se
 * dice el número sale mal.** Con `deviceScaleFactor: 1`, `window.devicePixelRatio`
 * vale 1, y r3f ACOTA su `dpr={[min, max]}` contra él: el techo de 1,5 nunca se
 * alcanza y el canvas renderiza 390×844 píxeles. O sea que **bajar el techo de
 * 1,5 a 1 mediría CERO diferencia** — el instrumento estaría comparando un
 * número contra sí mismo, que es el modo de falla que este repo nombra «verde
 * por arnés». Un teléfono de verdad tiene `devicePixelRatio` 3.
 *
 * Así que acá el factor va en 3, y se declara lo que eso compra y lo que no:
 *
 *   · **compra** que el techo de `dpr` MUERDA, que es la variable del sprint;
 *   · **no compra** la GPU de un teléfono, ni su térmica, ni WebKit. Abajo
 *     corre Blink sobre la GPU de esta máquina. Lo que se mide es **cuánto
 *     cambia el costo entre dos configuraciones sobre el mismo hardware**, no
 *     cuántos cuadros por segundo hace un iPhone.
 *
 * ── ⚠️ Y POR QUÉ EL ESTRANGULAMIENTO DE CPU NO ES LA MITAD QUE FALTA ──────
 *
 * `Emulation.setCPUThrottlingRate` frena **el hilo principal**, no la GPU. Una
 * escena cuyo costo es relleno —la celosía analítica corre sobre el 51–73 % del
 * cuadro y las dos celosías cubren 51 % y 57 %— puede no moverse un cuadro con
 * 4× de CPU. Eso no es que el instrumento falle: es el resultado, y distingue
 * «estamos limitados por GPU» de «estamos limitados por JS». Por eso se mide en
 * los dos regímenes y se publican los dos.
 */

import { mkdirSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, medir, type Pagina } from '../scripts-b4/navegador'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b5/b5-comun'

/** El puerto de ESTE worktree y de la receta canónica. */
export const ORIGEN = 'http://localhost:3000'

/** Las salidas del bloque, dentro del árbol. Se escriben con el navegador CERRADO. */
export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/movil'

/** A donde van las capturas del reporte. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/movil'

/**
 * Las capturas intermedias, FUERA del árbol: el dev server vigila el repo y una
 * captura escrita adentro lo hace recompilar en medio de la medición. Es la
 * misma decisión que tomó `scripts-ancho1/`.
 */
export const TEMP = path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'movil-capturas')

/**
 * LA VENTANA. 390×844 es la que pide la instrucción, y es además el viewport de
 * layout del iPhone 14/15 en vertical.
 */
export const VENTANA = { ancho: 390, alto: 844 } as const

/** El `devicePixelRatio` de un teléfono de gama alta. Ver el docblock del archivo. */
export const DPR_FISICO = 3

/**
 * LOS DOS REGÍMENES DE CPU, con su nombre de DevTools.
 *
 * `1` es el hardware de esta máquina sin frenar; `4` es el preset «mid-tier
 * mobile» de DevTools y el que usa Lighthouse en su perfil móvil.
 */
export const REGIMENES = [
  { id: 'cpu1', nombre: 'sin estrangular (1×)', cpu: 1 },
  { id: 'cpu4', nombre: 'mid-tier mobile (4×)', cpu: 4 },
] as const

export type Regimen = (typeof REGIMENES)[number]

export interface SesionMovil {
  readonly pagina: Pagina
  readonly regimen: Regimen
}

export interface EstadoMovil {
  readonly visibilityState: string
  readonly innerWidth: number
  readonly innerHeight: number
  readonly dpr: number
  readonly alturaDelDocumento: number
  readonly rafCorre: boolean
}

/**
 * PASO 4 DE LA RECETA — y tira, no avisa.
 *
 * Es la misma comprobación de `scripts-b4/navegador.ts` con el `dpr` esperado
 * puesto en el de este banco. La lección de agosto entera: con la pestaña
 * ocluida el navegador saltea los rendering steps, no corre `rAF` y
 * `innerWidth` da 0 — y **todo lo que este bloque mide son cuadros**.
 */
export async function verificar(p: Pagina): Promise<EstadoMovil> {
  const estado = await medir<EstadoMovil>(
    p,
    `(async () => {
      const rafCorre = await new Promise((r) => {
        const t = setTimeout(() => r(false), 1000)
        requestAnimationFrame(() => { clearTimeout(t); r(true) })
      })
      return {
        visibilityState: document.visibilityState,
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
  if (estado.innerWidth !== VENTANA.ancho) problemas.push(`innerWidth=${estado.innerWidth}, se pidió ${VENTANA.ancho}`)
  if (estado.innerHeight !== VENTANA.alto) problemas.push(`innerHeight=${estado.innerHeight}, se pidió ${VENTANA.alto}`)
  if (estado.dpr !== DPR_FISICO) problemas.push(`devicePixelRatio=${estado.dpr}, se pidió ${DPR_FISICO}`)
  if (!estado.rafCorre) problemas.push('requestAnimationFrame NO corrió en 1 s')
  if (problemas.length > 0) throw new Error(`la página no está en condiciones de medirse — ${problemas.join(' · ')}`)
  return estado
}

/**
 * Abre un Chrome propio a 390×844 con `deviceScaleFactor` 3, deja la página
 * verificada, corre el trabajo y cierra.
 *
 * El `finally` no es cortesía: si la medición tira y el Chrome queda vivo, el
 * `userDataDir` queda tomado y la corrida siguiente no arranca.
 */
export async function conElHomeMovil<T>(
  regimen: Regimen,
  trabajo: (s: SesionMovil) => Promise<T>,
  opciones: { readonly ruta?: string; readonly origen?: string; readonly quien?: string } = {},
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome(opciones.quien ?? 'movil'),
    // La ventana del sistema tiene que poder contener el viewport emulado.
    ancho: VENTANA.ancho + 40,
    alto: VENTANA.alto + 140,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await pagina.conexion.enviar(
        'Emulation.setDeviceMetricsOverride',
        {
          width: VENTANA.ancho,
          height: VENTANA.alto,
          deviceScaleFactor: DPR_FISICO,
          mobile: true,
          screenWidth: VENTANA.ancho,
          screenHeight: VENTANA.alto,
        },
        pagina.sessionId,
      )
      await pagina.conexion.enviar(
        'Emulation.setTouchEmulationEnabled',
        { enabled: true, maxTouchPoints: 5 },
        pagina.sessionId,
      )
      await pagina.conexion.enviar(
        'Emulation.setEmulatedMedia',
        { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] },
        pagina.sessionId,
      )
      await pagina.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: regimen.cpu }, pagina.sessionId)
      /**
       * ⚠️ **SIN CACHÉ, Y NO ES UN DETALLE: ES UN DEFECTO QUE ESTE BANCO YA
       * COMETIÓ.** El `userDataDir` se reusa entre corridas (limpiarlo cuesta un
       * arranque de Chrome por medición), así que la segunda corrida encontró la
       * hoja de estilos y las cuatro fuentes en caché y `transferSize` devolvió 0
       * para las cinco. Resultado: el total BAJÓ 79 KiB entre dos árboles donde lo
       * único que había pasado era AGREGAR la escena. Con la caché apagada cada
       * corrida es una visita fría, que es la que la pregunta del sprint hace.
       */
      await pagina.conexion.enviar('Network.setCacheDisabled', { cacheDisabled: true }, pagina.sessionId)
      for (const fuente of [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO]) {
        await pagina.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: fuente }, pagina.sessionId)
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar(
        'Page.navigate',
        { url: `${opciones.origen ?? ORIGEN}${opciones.ruta ?? '/v3'}` },
        pagina.sessionId,
      )
      await Promise.race([cargada, new Promise((r) => setTimeout(r, 60_000))])
      await verificar(pagina)
      return await trabajo({ pagina, regimen })
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}

/** Cuánto se le da a la escena para armarse antes de medir. */
export const ASENTAMIENTO_MS = 5000

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

export const dos = (n: number): number => Number(n.toFixed(2))
