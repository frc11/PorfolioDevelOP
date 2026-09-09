/**
 * BANCO DE B8 — la plomería que comparten los instrumentos de este bloque.
 *
 * ── Por qué un banco propio ────────────────────────────────────────────────
 *
 * Por lo mismo que B6-A tuvo el suyo: el puerto. `scripts-b5/b5-comun.ts` clava
 * `ORIGEN` en el 3000 y esta sesión corre en el **3001**; medir contra otro
 * puerto es medir el sitio de otro worktree sin enterarse. Y el perfil de Chrome
 * es propio (`b8`): dos procesos sobre el mismo `userDataDir` y el segundo no
 * arranca (`scripts-b4/cdp.ts`).
 *
 * ⚠️ **Lo que este banco HEREDA de `scripts-b6/` y no puede importar.** B6-A
 * vive en `v3/escena-viva` (21b9d89e) y esa rama NO es ancestro de `v3/luz`:
 * `lectores.ts`, `ocultar.ts`, `glifo-alfa.ts` y `c-bloques.ts` son copias
 * atribuidas de las de B6-A, con el prefijo de atributo cambiado a `b8`. El día
 * que las dos ramas se mergeen, las copias de acá se borran a favor de las de
 * `scripts-b6/`: son el mismo instrumento, y dos instrumentos iguales con dos
 * nombres son la forma de que un día midan distinto.
 *
 * Lo que sí se importa tal cual es lo ya resuelto: el cliente de CDP, la receta
 * ejecutable, la captura y los perfiles (`scripts-b4/`); el lector de cajas, el
 * puente de automatización y la máscara de glifo (`scripts-b5/`).
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
 *      `.b8-capturas/` (ignorada) y los JSON se escriben DESPUÉS de cerrar.
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

/** 3001: el puerto de ESTA sesion. La vecina (C:\v3-sincronia) usa el 3002. */
export const ORIGEN = 'http://localhost:3001'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b8'

/** Las capturas intermedias, fuera de `docs/` y fuera de git (`.gitignore`). */
export const TEMP = '.b8-capturas'

/** A donde se copian, con el navegador YA cerrado, las capturas que van al reporte. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/b8'

/** El perfil de las mediciones comparables con B5/B6/B7: 1440x900. */
export const PERFIL: Perfil = perfilPorId('1440')

/** El envoltorio de la escena. Lo emite `EscenaDelHome.tsx` como `data-escena`. */
export const SELECTOR_DE_LA_ESCENA = '[data-escena]'

/** Cuanto se espera DESPUES del primer cuadro para que la escena se asiente (B5, B6). */
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
  /** Un origen distinto de `ORIGEN`: la referencia, una sola vez. */
  readonly origen?: string
  /** Otro perfil de Chrome (`perfilDeChrome`), para no pisar el de la corrida vecina. */
  readonly perfilDeChrome?: string
}

/**
 * Abre un Chrome propio, deja la pagina verificada, corre el trabajo y cierra.
 *
 * El `finally` no es cortesia: si la medicion tira y el Chrome queda vivo, el
 * `userDataDir` queda tomado y la corrida siguiente no arranca. Y la pausa
 * despues de cerrar tampoco: `Browser.close` no espera a que el proceso suelte
 * el perfil (B5 lo pago con «Inspected target navigated or closed»).
 */
export async function conLaPagina<T>(
  perfil: Perfil,
  ruta: string,
  trabajo: (s: Sesion) => Promise<T>,
  opciones: OpcionesDeNavegacion = {},
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome(opciones.perfilDeChrome ?? 'b8'),
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
 * Deja el home en condiciones de medirse: primer cuadro, asentamiento, la pagina
 * entera (no a medio compilar) y el puntero en el centro, para que el
 * seguimiento del mouse aporte desplazamiento CERO a la pose.
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
