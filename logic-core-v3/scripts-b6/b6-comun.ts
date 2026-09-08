/**
 * BANCO DE B6-A — la plomería que comparten los instrumentos de este bloque.
 *
 * ── Por qué un banco propio y no el de B5 ─────────────────────────────────
 *
 * `scripts-b5/b5-comun.ts` clava `ORIGEN` en el **3000**. B6-A corre en el
 * **3001**: la sesión vecina (`C:\v3-defectos`, B7) usa el 3002 y el 3005, y el
 * 3000 no es de nadie hoy. Medir contra otro puerto es medir el sitio de otro
 * worktree sin enterarse — el modo de falla que `MEDICION-B4.md` §0 describe
 * para el `userDataDir` de Chrome, un piso más arriba. Por la misma razón el
 * perfil de Chrome es propio (`b6`): dos procesos sobre el mismo perfil y el
 * segundo no arranca.
 *
 * Lo que NO se reescribe es lo que ya está resuelto: el cliente de CDP, la
 * receta ejecutable y los perfiles (`scripts-b4/`), y el lector de cajas de
 * texto, el puente de automatización y la marca del intro (`scripts-b5/`). Este
 * archivo agrega el origen, las carpetas, la sesión y el asentamiento.
 *
 * ── ⚠️ LAS CUATRO REGLAS DE CAPTURA QUE B4-B DEJÓ, Y QUE ACÁ SE HEREDAN ──────
 *
 *   1. La escena tarda 300–700 ms en pintar su primer cuadro: `GRACIA_DE_ESCENA`
 *      antes de cada captura, siempre.
 *   2. Un recorte sólo vale con el scroll en la región que recorta: el escenario
 *      es `fixed`. Acá TODAS las capturas son de viewport, con el scroll puesto.
 *   3. ⚠️ **No se escribe en `docs/` mientras el navegador está abierto**: el
 *      dev server vigila el árbol y una escritura ahí dispara una recompilación
 *      que deja la página a medio compilar bajo la captura. Las capturas van a
 *      `.b6-capturas/` (ignorada) y los JSON se escriben DESPUÉS de cerrar.
 *   4. El preloader no arma bajo webdriver: `PUENTE_DE_AUTOMATIZACION` + la
 *      marca del intro, antes del primer pintado, como en B5.
 *
 * ── El búfer de WebGL no se lee desde la página ───────────────────────────
 *
 * `ProbeStage` monta con `alpha: false` y sin `preserveDrawingBuffer`: toda
 * medición de la escena de este bloque es `Page.captureScreenshot` de lo
 * compuesto. Ninguna cifra sale de `readPixels` ni de `drawImage`.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import {
  abrirPagina,
  cerrarPagina,
  emular,
  verificarLaPagina,
  type EstadoDeLaPagina,
  type Pagina,
} from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import { moverElPuntero, verificarQueLaPaginaEstaEntera } from '../scripts-b5/pagina'

export { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION, lectorDeCajasDeTexto } from '../scripts-b5/b5-comun'

/** ⚠️ 3001: el puerto de ESTA sesión. La vecina (B7) usa 3002 y 3005. */
export const ORIGEN = 'http://localhost:3001'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b6'

/** Las capturas intermedias, fuera de `docs/` y fuera de git (`.gitignore`). */
export const TEMP = '.b6-capturas'

/** A dónde se copian, con el navegador YA cerrado, las capturas que van al reporte. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/b6'

/** El perfil de todas las mediciones del bloque: el de B5, para poder comparar. */
export const PERFIL: Perfil = perfilPorId('1440')

/** El envoltorio de la escena. Lo emite `EscenaDelHome.tsx` como `data-escena`. */
export const SELECTOR_DE_LA_ESCENA = '[data-escena]'

/**
 * Cuánto se espera DESPUÉS del primer cuadro para que la escena se asiente:
 * el relevo del intro y la reanudación tardan más que el primer pintado.
 * Es lo que `e-discriminador.ts` de B5 esperaba, y por la misma razón.
 */
export const ASENTAMIENTO_MS = 4000

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
  /** Un origen distinto de `ORIGEN` — la referencia, una sola vez. */
  readonly origen?: string
}

/**
 * Abre un Chrome propio, deja la página verificada, corre el trabajo y cierra.
 *
 * El `finally` no es cortesía: si la medición tira y el Chrome queda vivo, el
 * `userDataDir` queda tomado y la corrida siguiente no arranca. Y la pausa
 * después de cerrar tampoco: `Browser.close` no espera a que el proceso suelte
 * el perfil (B5 lo pagó con «Inspected target navigated or closed»).
 */
export async function conLaPagina<T>(
  perfil: Perfil,
  ruta: string,
  trabajo: (s: Sesion) => Promise<T>,
  opciones: OpcionesDeNavegacion = {},
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('b6'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await emular(pagina, perfil, { movimientoReducido: opciones.movimientoReducido })
      for (const fuente of opciones.antesDelPintado ?? []) {
        await pagina.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: fuente }, pagina.sessionId)
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar('Page.navigate', { url: `${opciones.origen ?? ORIGEN}${ruta}` }, pagina.sessionId)
      await Promise.race([cargada, new Promise((r) => setTimeout(r, opciones.msMaximo ?? 60_000))])
      const estado = await verificarLaPagina(pagina, perfil)
      return await trabajo({ pagina, estado, perfil })
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}

/**
 * Deja el home en condiciones de medirse: primer cuadro, asentamiento, la página
 * entera (no a medio compilar) y el puntero en el centro, para que el
 * seguimiento del mouse de B5 aporte desplazamiento CERO a la pose.
 */
export async function asentarElHome(s: Sesion): Promise<void> {
  await esperarElPrimerCuadro(s.pagina)
  await new Promise((r) => setTimeout(r, ASENTAMIENTO_MS))
  await verificarQueLaPaginaEstaEntera(s.pagina, s.perfil)
  await moverElPuntero(s.pagina, s.perfil, Math.round(s.perfil.ancho / 2), Math.round(s.perfil.alto / 2))
}

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
}
