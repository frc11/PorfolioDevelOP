/**
 * BANCO DE BOTON-1 — la plomería que comparten el lado de la referencia y el
 * nuestro. **Los dos botones se miden con ESTE archivo o no son comparables.**
 *
 * Es la misma razón por la que `scripts-b4/perfiles.ts` existe: dos frentes que
 * emulan «1440» a ojo producen dos tablas que parecen la misma y no lo son. Acá
 * el riesgo es peor, porque lo que se compara son TIEMPOS: si un lado esperara
 * 2,0 s tras el hover y el otro 3,0, uno de los dos reportaría un gesto que
 * «no termina» por no haberlo esperado.
 *
 * ── La regla de la referencia, ejecutable ─────────────────────────────────
 *
 * `MEDICION-NAVEGADOR.md` §4: contra un sitio ajeno, **una navegación, una
 * medición, y se cierra la pestaña**. Acá eso es literal: `a-referencia.ts`
 * hace UN `Page.navigate` y adentro de esa única carga entran el inventario,
 * los dos ciclos de hover muestreados, las capturas de los cuatro estados y la
 * tira de cuadros. Lo que queda en disco son números escritos con nuestras
 * palabras — ni un selector, ni una clase, ni un valor de su CSS.
 *
 * ── El puntero se mueve de verdad, y por un camino ────────────────────────
 *
 * `Input.dispatchMouseEvent` produce un evento de confianza que pasa por el
 * hit-test del navegador (`scripts-b5/pagina.ts`). Acá además va por un CAMINO
 * de varios pasos y no de un salto: un salto de un punto lejano al centro del
 * botón entra por el borde y sale por el borde en el mismo cuadro, y cualquier
 * efecto que dependa de la posición dentro de la caja —un magnético, un
 * degradado que sigue al cursor— no se vería nunca.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { codificarPngRgba, decodificarPng } from '../scripts-b4/png'
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

import {
  FUENTE_DEL_GRABADOR,
  type Grabacion,
  type NodoEstatico,
  type Preparacion,
} from './pagina-de-boton'

/** El dev server de ESTA sesión. Verificado con `curl` antes de abrir el navegador. */
export const ORIGEN = 'http://localhost:3000'

export const ORIGEN_DE_LA_REFERENCIA = 'https://www.nk.studio'

/** Donde van los JSON destilados que el reporte cita. */
export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/boton'

/** Donde van las capturas del reporte. Se copian con el navegador YA cerrado. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/boton'

/**
 * EL CRUDO — las series por cuadro y las 18 tomas de la tira, FUERA del repo.
 *
 * Dos motivos, los dos ya pagados por este proyecto. Uno: `next dev` vigila el
 * árbol, y escribir adentro mientras el navegador está abierto dispara una
 * recompilación que deja la página a medio compilar bajo la captura
 * (`scripts-b8/b8-comun.ts`, regla 3). Dos: la grabación de un ciclo pesa
 * megabytes y no es evidencia de nada por sí sola — lo que se cita es el
 * destilado, y ése sí va a `docs/`.
 *
 * Va al temporal del sistema y no al scratchpad de la sesión para que el
 * comando se pueda repetir mañana sin editar una ruta.
 */
export const CRUDO = path.join(tmpdir(), 'boton-1')

/**
 * El perfil. 1440×900 es el ancho donde `COMPONENTS.md` §3.2 midió el CTA de la
 * referencia; medir en otro haría que la columna «antes» y la columna «nk» de
 * la tabla final no se pudieran cruzar con lo ya publicado.
 */
export const PERFIL: Perfil = perfilPorId('1440')

/**
 * Cuánto se espera con el puntero quieto, de cada lado del gesto.
 *
 * 3.000 ms no es un número redondo elegido por cómodo: el intercambio medido de
 * la referencia dura 1.300 ms y su subrayado 400 + 600 = 1.000, así que 3.000
 * deja **más del doble** del gesto más largo conocido. Si algo siguiera
 * moviéndose al final de la ventana, la serie lo muestra y el reporte lo dice
 * en vez de recortarlo.
 */
export const ESPERA_MS = 3000

/** Los pasos del camino del puntero. Con uno solo sería un salto. */
export const PASOS_DEL_CAMINO = 14

export interface Punto {
  readonly x: number
  readonly y: number
}

export function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export function dos(n: number): number {
  return Math.round(n * 100) / 100
}

export function tres(n: number): number {
  return Math.round(n * 1000) / 1000
}

export function guardarJson(asunto: string, dato: unknown): string {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const ruta = `${RAIZ_DE_SALIDAS}/${asunto}.json`
  writeFileSync(ruta, `${JSON.stringify(dato, null, 2)}\n`, 'utf8')
  return ruta
}

export interface Sesion {
  readonly pagina: Pagina
  readonly estado: EstadoDeLaPagina
  readonly perfil: Perfil
}

export interface OpcionesDeSesion {
  readonly origen: string
  readonly ruta: string
  /** La marca que apaga nuestro preloader. En un sitio ajeno NO se manda. */
  readonly marcaDeIntro: boolean
  readonly perfilDeChrome: string
  readonly msMaximo?: number
}

/**
 * Abre un Chrome propio, deja la página verificada por la receta, corre el
 * trabajo y cierra. El `finally` no es cortesía: un Chrome vivo deja el
 * `userDataDir` tomado y la corrida siguiente no arranca.
 */
export async function conLaPagina<T>(
  opciones: OpcionesDeSesion,
  trabajo: (s: Sesion) => Promise<T>,
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome(opciones.perfilDeChrome),
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await emular(pagina, PERFIL)
      const previos = [PUENTE_DE_AUTOMATIZACION, FUENTE_DEL_GRABADOR]
      if (opciones.marcaDeIntro) previos.unshift(MARCA_DE_INTRO)
      for (const fuente of previos) {
        await pagina.conexion.enviar(
          'Page.addScriptToEvaluateOnNewDocument',
          { source: fuente },
          pagina.sessionId,
        )
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar(
        'Page.navigate',
        { url: `${opciones.origen}${opciones.ruta}` },
        pagina.sessionId,
      )
      await Promise.race([cargada, esperar(opciones.msMaximo ?? 60_000)])
      const estado = await verificarLaPagina(pagina, PERFIL)
      return await trabajo({ pagina, estado, perfil: PERFIL })
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await esperar(900)
  }
}

/** Mueve el puntero por un camino de `pasos` tramos. Cada paso es un evento real. */
export async function moverPorCamino(
  p: Pagina,
  desde: Punto,
  hasta: Punto,
  pasos: number = PASOS_DEL_CAMINO,
): Promise<void> {
  for (let i = 1; i <= pasos; i += 1) {
    const f = i / pasos
    await p.conexion.enviar(
      'Input.dispatchMouseEvent',
      {
        type: 'mouseMoved',
        x: Math.round(desde.x + (hasta.x - desde.x) * f),
        y: Math.round(desde.y + (hasta.y - desde.y) * f),
        button: 'none',
        buttons: 0,
      },
      p.sessionId,
    )
  }
}

/**
 * El punto de reposo: la esquina del viewport más lejana al centro del CTA.
 *
 * Que sea la MÁS lejana importa por dos motivos. Uno, que el camino de entrada
 * tenga longitud —un reposo pegado al botón entraría en dos pasos—. Dos, que
 * ningún resto de hover quede prendido: si el puntero quedara sobre otro
 * control, lo que se mediría «después de salir» sería el CTA en reposo pero la
 * página con otra cosa encendida.
 */
export function puntoDeReposo(caja: readonly number[], perfil: Perfil): Punto {
  const cx = caja[0] + caja[2] / 2
  const cy = caja[1] + caja[3] / 2
  const esquinas: readonly Punto[] = [
    { x: 6, y: 6 },
    { x: perfil.ancho - 6, y: 6 },
    { x: 6, y: perfil.alto - 6 },
    { x: perfil.ancho - 6, y: perfil.alto - 6 },
  ]
  let mejor = esquinas[0]
  let mejorD = -1
  for (const e of esquinas) {
    const d = (e.x - cx) ** 2 + (e.y - cy) ** 2
    if (d > mejorD) {
      mejorD = d
      mejor = e
    }
  }
  return mejor
}

export function centroDe(caja: readonly number[]): Punto {
  return { x: Math.round(caja[0] + caja[2] / 2), y: Math.round(caja[1] + caja[3] / 2) }
}

export async function preparar(
  p: Pagina,
  opciones: { readonly texto?: string; readonly selector?: string; readonly indice?: number },
): Promise<Preparacion> {
  return medir<Preparacion>(p, `window.__boton.preparar(${JSON.stringify(opciones)})`)
}

export interface RotuloVisible {
  readonly etiqueta: string
  readonly texto: string
  readonly rect: readonly number[]
  readonly hijos: number
}

export async function rotulos(p: Pagina): Promise<readonly RotuloVisible[]> {
  return medir<readonly RotuloVisible[]>(p, 'window.__boton.rotulos()')
}

export async function foto(p: Pagina): Promise<readonly NodoEstatico[]> {
  return medir<readonly NodoEstatico[]>(p, 'window.__boton.foto()')
}

export async function caja(p: Pagina): Promise<readonly number[]> {
  return medir<readonly number[]>(p, 'window.__boton.caja()')
}

export async function golpea(
  p: Pagina,
  punto: Punto,
): Promise<{ readonly hay: boolean; readonly dentro: boolean; readonly etiqueta: string }> {
  return medir(p, `window.__boton.golpea(${punto.x}, ${punto.y})`)
}

export interface AnimacionViva {
  readonly tipo: string
  readonly propiedad: string
  readonly duracion: number | null
  readonly retardo: number | null
  readonly curva: string
  readonly objetivo: string
  readonly pseudo: string | null
  readonly tiempo: number | null
}

export async function animaciones(p: Pagina): Promise<readonly AnimacionViva[]> {
  return medir<readonly AnimacionViva[]>(p, 'window.__boton.animaciones()')
}

/**
 * EL CICLO — dos veces entrar y salir, muestreado por cuadro.
 *
 * ⚠️ **El segundo ciclo no es un control de más: es la mitad de la respuesta
 * del PASO 1.** Si al salir el rótulo se quedara donde el hover lo dejó, el
 * segundo hover arrancaría desde un estado distinto del primero y el gesto no
 * se podría repetir. Con un solo ciclo eso sería indistinguible de un regreso
 * perfecto.
 */
export async function ciclo(
  s: Sesion,
  reposo: Punto,
  centro: Punto,
  vueltas = 2,
): Promise<Grabacion> {
  const p = s.pagina
  await moverPorCamino(p, centro, reposo)
  await esperar(1200)
  await medir<number>(p, 'window.__boton.arrancar()')
  await esperar(500)
  for (let v = 0; v < vueltas; v += 1) {
    await medir<number>(p, `window.__boton.marcar("entrar")`)
    await moverPorCamino(p, reposo, centro)
    await esperar(ESPERA_MS)
    await medir<number>(p, `window.__boton.marcar("salir")`)
    await moverPorCamino(p, centro, reposo)
    await esperar(ESPERA_MS)
  }
  return medir<Grabacion>(p, 'window.__boton.parar()')
}

export interface Recorte {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface CapturaHecha {
  readonly estado: string
  readonly archivo: string
  readonly bytes: number
  /** El reloj de la página ANTES y DESPUÉS de pedir la foto: el corchete del instante. */
  readonly relojAntes: number
  readonly relojDespues: number
  /** El corchete del instante de la foto, contado desde que entró el puntero. */
  readonly desdeElHover: readonly [number, number] | null
  readonly congelada: number
  readonly recorte: Recorte
  /** La caja del CTA antes y después de la foto — el control del `:hover` perdido. */
  readonly cajaAntes: readonly number[]
  readonly cajaDespues: readonly number[]
}

/** El aire alrededor del CTA que entra en la captura. Abajo va más, por el subrayado y su brillo. */
export const MARGEN_DE_CAPTURA = { izquierda: 56, arriba: 40, derecha: 72, abajo: 72 }

export function recorteDe(caja: readonly number[], perfil: Perfil): Recorte {
  const x = Math.max(0, Math.floor(caja[0] - MARGEN_DE_CAPTURA.izquierda))
  const y = Math.max(0, Math.floor(caja[1] - MARGEN_DE_CAPTURA.arriba))
  const x2 = Math.min(perfil.ancho, Math.ceil(caja[0] + caja[2] + MARGEN_DE_CAPTURA.derecha))
  const y2 = Math.min(perfil.alto, Math.ceil(caja[1] + caja[3] + MARGEN_DE_CAPTURA.abajo))
  return { x, y, width: Math.max(1, x2 - x), height: Math.max(1, y2 - y) }
}

/**
 * ⚠️ **EL `clip` DE `Page.captureScreenshot` APAGA EL `:hover`. Medido acá.**
 *
 * Es el defecto de instrumento de este sprint, y es exactamente la clase que
 * da un número plausible: la foto sale, pesa lo que tiene que pesar, y muestra
 * el botón EN REPOSO aunque el puntero esté encima. La primera corrida de este
 * banco sacó así las cuatro capturas de los dos botones y las tres de estado de
 * hover eran, todas, el reposo.
 *
 * El discriminador fue cambiar una variable por vez (`scripts-boton/_diag2.ts`,
 * borrado al cerrar): con el puntero quieto sobre el CTA del hero, la cadena
 * `:hover` del documento y el alto de la ventana de recorte, leídos antes y
 * después de cada forma de sacar la foto.
 *
 * | forma | `:hover` después | alto de la ventana |
 * |---|---|---|
 * | `captureScreenshot` **con `clip`** | **vacío** | 51 → **47** |
 * | `captureScreenshot` **sin `clip`** | intacto | 51 |
 * | `startScreencast` (42 cuadros en 1,5 s) | intacto | 51 |
 *
 * O sea que la culpa no es de capturar: es del `clip`, que por debajo pasa por
 * un ciclo de `Emulation.setDeviceMetricsOverride` y con él se va la posición
 * emulada del puntero. **La salida es capturar la ventana entera y recortar
 * acá**, con el decodificador que el repo ya tiene. Cuesta un PNG de 1440×900
 * por foto y devuelve la única cosa que la captura tenía que mostrar.
 *
 * Corolario para el banco: `scripts-b4/captura.ts` usa `clip` en todos lados y
 * está bien, porque ninguna de sus mediciones depende del puntero. Esta sí, y
 * por eso el recorte vive acá y no allá.
 */
export async function capturarRecorte(p: Pagina, destino: string, recorte: Recorte): Promise<number> {
  const r = (await p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, p.sessionId)) as {
    data: string
  }
  const entera = decodificarPng(Buffer.from(r.data, 'base64'))
  const x0 = Math.max(0, Math.min(entera.ancho - 1, Math.round(recorte.x)))
  const y0 = Math.max(0, Math.min(entera.alto - 1, Math.round(recorte.y)))
  const ancho = Math.max(1, Math.min(entera.ancho - x0, Math.round(recorte.width)))
  const alto = Math.max(1, Math.min(entera.alto - y0, Math.round(recorte.height)))
  const datos = new Uint8Array(ancho * alto * 4)
  for (let y = 0; y < alto; y += 1) {
    const origen = ((y0 + y) * entera.ancho + x0) * 4
    datos.set(entera.datos.subarray(origen, origen + ancho * 4), y * ancho * 4)
  }
  const bytes = codificarPngRgba(ancho, alto, datos)
  writeFileSync(destino, bytes)
  return bytes.length
}
