/**
 * BANCO DE B5 — la plomería que comparten los instrumentos de este bloque.
 *
 * ── Por qué un banco propio y no el de B4 ─────────────────────────────────
 *
 * `scripts-b4/b-comun.ts` clava `ORIGEN` en el **3002**, que es donde corría
 * aquel bloque. B5 corre en el **3000**, que es el puerto de la receta
 * canónica. Medir contra el 3002 desde acá sería medir el sitio de otro
 * worktree sin enterarse — el mismo modo de falla que `MEDICION-B4.md` §0
 * describe para el `userDataDir` de Chrome, un piso más arriba.
 *
 * Lo que NO se reescribe es lo que ya está resuelto: el cliente de CDP
 * (`scripts-b4/cdp.ts`), la receta ejecutable (`scripts-b4/navegador.ts`) y la
 * tabla de perfiles (`scripts-b4/perfiles.ts`) se importan tal cual. Este
 * archivo agrega exactamente tres cosas que B5 necesita y B4 no tenía.
 *
 * ── 1. El `initScript` es un parámetro, no una constante ──────────────────
 *
 * `irA` de B4 pone SIEMPRE la marca del intro (`home:intro='1'`). B5 tiene que
 * poder medir los dos lados de esa marca —con intro y sin intro— porque el
 * hallazgo D11-bis de este bloque vive justamente ahí. Así que acá el script
 * previo al primer pintado se pasa entero.
 *
 * ── 2. ⚠️ EL PUENTE DE `navigator.webdriver`, Y POR QUÉ NO ES HACER TRAMPA ──
 *
 * El `<script>` pre-paint del layout raíz **no arma el intro bajo
 * automatización** (`introBoot.tsx`: `navigator.webdriver!==true`). Es una
 * decisión buena —una corrida headless no debería esperar 4,275 s de
 * secuencia— y tiene un corolario que costó caro: **ninguna medición
 * automatizada de este repo vio nunca correr el preloader**, y por lo tanto
 * ninguna vio en qué estado deja a la escena.
 *
 * `puenteDeAutomatizacion` define `navigator.webdriver` en `false` ANTES de
 * cualquier script del documento. No cambia el producto: **saca el detector de
 * automatización del medio para que el producto se comporte como se comporta
 * con una persona.** La distinción importa: lo que se fuerza es la ENTRADA del
 * instrumento (que el navegador no se anuncie como robot), no la SALIDA que
 * después se afirma.
 *
 * ── 3. El origen y la carpeta de salidas ──────────────────────────────────
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import {
  abrirPagina,
  cerrarPagina,
  emular,
  verificarLaPagina,
  type EstadoDeLaPagina,
  type Pagina,
} from '../scripts-b4/navegador'
import type { Perfil } from '../scripts-b4/perfiles'

import { mkdirSync, writeFileSync } from 'node:fs'

/** ⚠️ 3000: el puerto de `MEDICION-NAVEGADOR.md`. B4 corría en 3002. */
export const ORIGEN = 'http://localhost:3000'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/b5'

/** La marca de sesión que apaga el preloader. La emite `home-intro/introHandoff.ts`. */
export const MARCA_DE_INTRO = "try { sessionStorage.setItem('home:intro','1') } catch (e) {}"

/** Lo contrario: borra la marca, así el intro vuelve a armarse en esta sesión. */
export const SIN_MARCA_DE_INTRO = "try { sessionStorage.removeItem('home:intro') } catch (e) {}"

/**
 * ⚠️ Ver el punto 2 del docblock. Va SIEMPRE que se quiera ver el producto como
 * lo ve una persona, y su ausencia también es una decisión que hay que declarar.
 */
export const PUENTE_DE_AUTOMATIZACION =
  "try { Object.defineProperty(navigator, 'webdriver', { get: () => false }) } catch (e) {}"

/**
 * LA CAJA DEL TEXTO — UNA por elemento, y **sin lo que no pinta**.
 *
 * Devuelve el fuente de un lector que corre adentro de la página. Vive acá y no
 * copiado en cada instrumento porque los dos que lo usan tienen que medir la
 * misma caja: dos definiciones de «dónde está el texto» producen dos cifras de
 * contraste que no se pueden comparar.
 *
 * ── ⚠️ EL FILTRO DE `clip-path`, Y LO QUE COSTÓ NO TENERLO ────────────────
 *
 * El titular del hero contiene **dos copias del texto**: las tres líneas que se
 * ven, y un `<span class="sr-only">` con la frase entera sin cortar. Ese span
 * lleva `clip-path: inset(50%)` —no pinta un solo píxel— pero **mide 1.076 px de
 * ancho**, contra los 451 de la línea visible más larga. Sumado a la unión, la
 * caja del titular pasaba de terminar en x 666 a terminar en **x 1.263**, o sea
 * **por encima del logo**, que vive entre 687 y 1.191.
 *
 * La consecuencia se midió: con esa caja, el método viejo de máscara marcaba
 * **939 píxeles «bajo AA» sobre el logo** que no son texto — son los bordes del
 * propio logo moviéndose entre capturas. Es la misma familia del defecto
 * D-B5.2: un elemento `sr-only` de tamaño no nulo contaminando una medición que
 * lo toma por contenido.
 *
 * El filtro es el que corresponde a la causa: **se saltea todo nodo de texto que
 * tenga un ancestro con `clip-path` distinto de `none`**, porque eso es
 * exactamente lo que hace que no pinte. No se filtra por la clase `sr-only`, que
 * es una convención y podría no estar.
 */
export function lectorDeCajasDeTexto(selector: string): string {
  return `(() => {
  const nodos = [...document.querySelectorAll(${JSON.stringify(selector)})]
  if (nodos.length === 0) throw new Error('no existe ' + ${JSON.stringify(selector)})
  const recortado = (el) => {
    let n = el
    while (n !== null && n !== document.documentElement) {
      if (getComputedStyle(n).clipPath !== 'none') return true
      n = n.parentElement
    }
    return false
  }
  const cajas = []
  let salteados = 0
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  let e0 = Infinity, f0 = Infinity, e1 = -Infinity, f1 = -Infinity
  const anda = (nodo) => {
    for (const n of nodo.childNodes) {
      if (n.nodeType === 3 && n.nodeValue.trim().length > 0) {
        if (recortado(n.parentElement)) { salteados += 1; continue }
        const r = document.createRange()
        r.selectNodeContents(n)
        for (const caja of r.getClientRects()) {
          if (caja.width <= 0 || caja.height <= 0) continue
          x0 = Math.min(x0, caja.left); y0 = Math.min(y0, caja.top)
          x1 = Math.max(x1, caja.right); y1 = Math.max(y1, caja.bottom)
          e0 = Math.min(e0, caja.left); f0 = Math.min(f0, caja.top)
          e1 = Math.max(e1, caja.right); f1 = Math.max(f1, caja.bottom)
        }
      } else if (n.nodeType === 1) anda(n)
    }
  }
  for (const el of nodos) {
    e0 = Infinity; f0 = Infinity; e1 = -Infinity; f1 = -Infinity
    anda(el)
    if (isFinite(e0)) cajas.push({ x: e0, y: f0, ancho: e1 - e0, alto: f1 - f0 })
  }
  if (!isFinite(x0)) throw new Error('sin nodos de texto con caja en ' + ${JSON.stringify(selector)})
  const cs = getComputedStyle(nodos[0])
  const m = cs.color.match(/-?[0-9.]+/g).slice(0, 3).map(Number)
  return {
    cajas,
    caja: { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 },
    tinta: m,
    texto: nodos.map((n) => n.textContent || '').join(' ').replace(/\\s+/g, ' ').trim().slice(0, 60),
    elementos: nodos.length,
    nodosSalteadosPorRecorte: salteados,
  }
})()`
}

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
}

/**
 * Abre un Chrome propio, deja la página verificada, corre el trabajo y cierra.
 *
 * El `finally` no es cortesía: si la medición tira y el Chrome queda vivo, el
 * `userDataDir` queda tomado y la corrida siguiente no arranca.
 */
export async function conLaPagina<T>(
  perfil: Perfil,
  ruta: string,
  trabajo: (s: Sesion) => Promise<T>,
  opciones: OpcionesDeNavegacion = {},
): Promise<T> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('b5'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await emular(pagina, perfil, { movimientoReducido: opciones.movimientoReducido })
      for (const fuente of opciones.antesDelPintado ?? [MARCA_DE_INTRO]) {
        await pagina.conexion.enviar(
          'Page.addScriptToEvaluateOnNewDocument',
          { source: fuente },
          pagina.sessionId,
        )
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar('Page.navigate', { url: `${ORIGEN}${ruta}` }, pagina.sessionId)
      await Promise.race([cargada, new Promise((r) => setTimeout(r, opciones.msMaximo ?? 60_000))])
      const estado = await verificarLaPagina(pagina, perfil)
      return await trabajo({ pagina, estado, perfil })
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    /**
     * ⚠️ **UNA PAUSA DESPUÉS DE CERRAR, Y NO ES CORTESÍA.** `cerrarChrome`
     * manda `Browser.close` y después `kill()`, pero no espera a que el proceso
     * suelte el `userDataDir`. Con varios casos en un mismo bucle —que es como
     * corre `c-reducido.ts`— el Chrome siguiente arranca sobre un perfil
     * todavía tomado y la corrida muere con «Inspected target navigated or
     * closed» a mitad de camino. Medio segundo alcanza y se paga una vez por
     * caso.
     */
    await new Promise((r) => setTimeout(r, 900))
  }
}
