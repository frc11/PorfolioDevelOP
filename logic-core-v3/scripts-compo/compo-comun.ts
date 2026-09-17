/**
 * COMPO-1 · EL BANCO DE LA COMPOSICIÓN DEL HERO — bordes, distancias y piezas.
 *
 * ── Qué mide que los bancos anteriores NO miden ───────────────────────────
 *
 * `scripts-tapado/` contesta *cuánta tinta cae sobre el logo* y `scripts-texto/`
 * *de qué está hecho el alto del bloque*. Ninguno de los dos contesta las dos
 * preguntas que este sprint trae del dueño:
 *
 *   · **¿las cuatro piezas de la columna arrancan en el mismo borde?** — y no
 *     alcanza con la caja: un `padding` o una itálica mueven la TINTA sin mover
 *     el rectángulo, así que se miden los dos bordes y se publica la resta.
 *   · **¿cuánto aire queda entre el CTA y la pastilla de navegación?** — que es
 *     una distancia entre dos elementos que ni siquiera monta la misma sección.
 *
 * ── ⚠️ EL BORDE DE LA TINTA SE MIDE SOBRE EL PÍXEL, NO SOBRE EL RECTÁNGULO ──
 *
 * `getBoundingClientRect` devuelve la caja de layout. El CTA declara
 * `padding: var(--spacing-2)` en `_estilos/cta.css`, así que su caja arranca 8 px
 * a la izquierda de su primera letra; y la línea 2 del titular es una itálica,
 * cuyo primer glifo apoya su ink en otro lado que una romana. Las dos cosas son
 * invisibles para el rectángulo y las dos son exactamente lo que el ojo ve.
 *
 * Por eso el borde de tinta sale de la captura **C** —el texto SIN la escena,
 * la misma máscara de TAPADO-1— buscando la primera columna de píxeles que se
 * aparta del fondo plano dentro de la caja de cada pieza. Con `deviceScaleFactor`
 * 1 un píxel del PNG es un píxel de CSS y los dos bordes se restan sin convertir.
 *
 * ── ⚠️ SE MIDE CON LA PESTAÑA VISIBLE ────────────────────────────────────
 *
 * Reusa `enLaVentana` de `scripts-tapado/tapado-comun.ts` entero —pestaña nueva
 * por ancho, métricas antes de navegar, `[data-escena]` esperado y
 * `verificarVentana` que tira—: con la pestaña ocluida `innerWidth` da 0 y todo
 * rectángulo de layout es basura.
 */

import type { Imagen } from '../scripts-b4/png'
import { luz, type Rect } from '../scripts-tapado/mascaras'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/compo'
export const CARPETA_DE_CAPTURAS_DE_COMPO = 'docs/rediseno/capturas/compo'

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface Renglon {
  readonly x: number
  readonly ancho: number
  readonly alto: number
  readonly top: number
}

export interface PiezaLeida {
  readonly clave: string
  readonly caja: Caja | null
  /** Un rectángulo por caja de línea: cuántas son y dónde arranca cada una. */
  readonly renglones: readonly Renglon[]
  /** ⚠ `number | null`: `NaN` viaja como `null` por el protocolo. Ver `dosONulo`. */
  readonly fontSize: number | null
  readonly lineHeight: number | null
  readonly letterSpacing: number | null
  readonly familia: string
  readonly peso: string
  readonly estilo: string
  /** El texto pintado, para poder afirmar QUÉ pieza es sin depender del orden. */
  readonly texto: string
}

export interface LecturaDeCompo {
  readonly ventana: { readonly ancho: number; readonly alto: number }
  readonly pantalla: Caja | null
  readonly relleno: { readonly arriba: number; readonly abajo: number }
  readonly justificado: string
  readonly piezas: readonly PiezaLeida[]
  readonly bloque: Caja | null
  readonly pastilla: Caja | null
  /** Los huecos MEDIDOS entre cajas consecutivas del bloque, no leídos del `gap`. */
  readonly huecos: readonly { readonly de: string; readonly a: string; readonly px: number }[]
}

/**
 * EL LECTOR — una sola expresión de página, con el número de piezas ABIERTO.
 *
 * ⚠ **No asume dos líneas de titular.** Este sprint puede dejar tres abajo de
 * 1025 y dos arriba, así que el lector recorre los hijos del `h1` y publica los
 * que encuentra. Un lector con los índices escritos habría publicado `null` para
 * la tercera y nadie lo habría notado.
 *
 * La bajada se busca por `[data-nivel="cuerpo"]` **y también por su nivel
 * hermano** `[data-nivel="base"]`: el punto 3 del sprint la puede subir un
 * escalón, y un selector atado al nivel viejo dejaría de encontrarla justo
 * después del cambio que hay que medir. Cae a `p`, como `a-verdad.ts`.
 */
export const LECTOR_COMPO = `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const h1 = pantalla.querySelector('h1')
  const bajada =
    pantalla.querySelector('[data-nivel="cuerpo"]') ??
    pantalla.querySelector('[data-nivel="base"]') ??
    pantalla.querySelector('p')
  const cta = pantalla.querySelector('a')
  const pastilla = document.querySelector('[data-parte="pastilla"]')
  const caja = (el) => {
    if (el === null || el === undefined) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, ancho: r.width, alto: r.height }
  }
  // ⚠️ LOS RENGLONES SE CUENTAN SOBRE LOS NODOS DE TEXTO, NO SOBRE EL ELEMENTO.
  // Un \`Range\` sobre el contenido de un elemento con hijos devuelve TAMBIÉN la
  // caja de borde de cada hijo, así que una pieza partida en dos \`<span>\`
  // publicaba CUATRO rectángulos —dos cajas y dos líneas— y por lo tanto cuatro
  // topes distintos cuando el redondeo no los junta. Medido acá: la bajada en
  // dos filas reportaba 4 renglones. Recorriendo los nodos de texto se mide
  // exactamente lo que se dibuja, y de paso las dos copias del rótulo del CTA
  // caen en el mismo tope y cuentan una sola vez.
  //
  // ⚠ El CTA sigue publicando DOS: sus dos copias del rótulo viven en el mismo
  // \`<a>\` y la segunda está \`position: absolute\` con una rotación, así que su
  // tope NO coincide con el de la primera. No es un renglón envuelto, y por eso
  // el CTA no se juzga por este campo sino por sus bordes de tinta.
  const renglones = (el) => {
    if (el === null || el === undefined) return []
    const caminante = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const rects = []
    for (let n = caminante.nextNode(); n !== null; n = caminante.nextNode()) {
      if ((n.textContent ?? '').trim() === '') continue
      const rango = document.createRange()
      rango.selectNodeContents(n)
      for (const r of rango.getClientRects()) if (r.width > 0.5 && r.height > 0.5) rects.push(r)
    }
    const porTope = new Map()
    for (const r of rects) {
      const clave = Math.round(r.top * 100) / 100
      const previo = porTope.get(clave)
      if (previo === undefined) porTope.set(clave, { x: r.x, ancho: r.width, alto: r.height, top: r.top })
      else porTope.set(clave, { x: Math.min(previo.x, r.x), ancho: Math.max(previo.x + previo.ancho, r.x + r.width) - Math.min(previo.x, r.x), alto: Math.max(previo.alto, r.height), top: previo.top })
    }
    return [...porTope.values()].sort((a, b) => a.top - b.top)
  }
  const pieza = (clave, el) => {
    if (el === null || el === undefined) {
      return { clave, caja: null, renglones: [], fontSize: 0, lineHeight: 0, letterSpacing: 0, familia: 'n/d', peso: 'n/d', estilo: 'n/d', texto: '' }
    }
    const s = getComputedStyle(el)
    return {
      clave,
      caja: caja(el),
      renglones: renglones(el),
      fontSize: parseFloat(s.fontSize),
      lineHeight: parseFloat(s.lineHeight),
      letterSpacing: parseFloat(s.letterSpacing),
      familia: s.fontFamily,
      peso: s.fontWeight,
      estilo: s.fontStyle,
      texto: (el.textContent ?? '').trim(),
    }
  }
  const lineas = h1 === null ? [] : [...h1.children]
  const piezas = [
    ...lineas.map((el, i) => pieza('titular-' + (i + 1), el)),
    pieza('bajada', bajada),
    pieza('cta', cta),
  ]
  const conCaja = piezas.filter((p) => p.caja !== null && p.caja.ancho > 0 && p.caja.alto > 0)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const p of conCaja) {
    x0 = Math.min(x0, p.caja.x); y0 = Math.min(y0, p.caja.y)
    x1 = Math.max(x1, p.caja.x + p.caja.ancho); y1 = Math.max(y1, p.caja.y + p.caja.alto)
  }
  const huecos = []
  for (let i = 1; i < conCaja.length; i += 1) {
    const a = conCaja[i - 1].caja
    const b = conCaja[i].caja
    huecos.push({ de: conCaja[i - 1].clave, a: conCaja[i].clave, px: b.y - (a.y + a.alto) })
  }
  const sp = getComputedStyle(pantalla)
  return {
    ventana: { ancho: window.innerWidth, alto: window.innerHeight },
    pantalla: caja(pantalla),
    relleno: { arriba: parseFloat(sp.paddingTop), abajo: parseFloat(sp.paddingBottom) },
    justificado: sp.justifyContent,
    piezas,
    bloque: Number.isFinite(x0) ? { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 } : null,
    pastilla: caja(pastilla),
    huecos,
  }
})()`

/** Los cuatro bordes de la tinta DIBUJADA dentro de un rectángulo. */
export interface BordesDeTinta {
  readonly izquierda: number
  readonly derecha: number
  readonly arriba: number
  readonly abajo: number
  /** Cuántos píxeles de tinta se encontraron. Cero devuelve `null`, no un borde. */
  readonly pixeles: number
}

/**
 * LOS BORDES DE LA TINTA dentro de un rectángulo de la captura C.
 *
 * El fondo de C es plano —la escena está escondida— así que la moda del
 * rectángulo ES el fondo y cualquier apartamiento por arriba del corte es tinta
 * dibujada. Es la misma derivación que `cruzar` hace para contar glifos, acotada
 * a la pregunta de dónde empieza y dónde termina.
 *
 * ⚠️ **Y por eso el CTA se mide acá y no con un `Range`.** Su marcado son DOS
 * copias del rótulo —una de ellas `position: absolute` con `opacity: 0`— más un
 * subrayado que es un `<span>` vacío con relleno de color: un `Range` sobre el
 * `<a>` devuelve rectángulos de la copia que NO se pinta y ninguno del
 * subrayado, que sí se pinta. La captura no tiene esa ambigüedad: lo que está
 * dibujado, está.
 *
 * Devuelve `null` si el rectángulo no tiene un solo píxel de tinta: un cero
 * silencioso sería indistinguible de «arranca en el borde».
 */
export function bordesDeTinta(img: Imagen, r: Rect): BordesDeTinta | null {
  const x0 = Math.max(0, Math.floor(r.x))
  const y0 = Math.max(0, Math.floor(r.y))
  const x1 = Math.min(img.ancho, Math.ceil(r.x + r.ancho))
  const y1 = Math.min(img.alto, Math.ceil(r.y + r.alto))
  if (x1 <= x0 || y1 <= y0) return null

  const cubetas = new Map<number, number>()
  let area = 0
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const v = Math.round(luz(img.datos, (y * img.ancho + x) * 4))
      cubetas.set(v, (cubetas.get(v) ?? 0) + 1)
      area += 1
    }
  }
  let fondo = 255
  let mejor = -1
  for (const [v, n] of cubetas) {
    if (n > mejor) {
      mejor = n
      fondo = v
    }
  }
  const piso = Math.max(4, area * 0.002)
  let lejos = 0
  for (const [v, n] of cubetas) {
    if (n < piso) continue
    const d = Math.abs(v - fondo)
    if (d > lejos) lejos = d
  }
  const umbral = lejos / 2
  if (umbral <= 0) return null

  let izquierda = Number.POSITIVE_INFINITY
  let derecha = Number.NEGATIVE_INFINITY
  let arriba = Number.POSITIVE_INFINITY
  let abajo = Number.NEGATIVE_INFINITY
  let pixeles = 0
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const c = luz(img.datos, (y * img.ancho + x) * 4)
      if (Math.abs(c - fondo) < umbral) continue
      pixeles += 1
      if (x < izquierda) izquierda = x
      if (x > derecha) derecha = x
      if (y < arriba) arriba = y
      if (y > abajo) abajo = y
    }
  }
  return pixeles === 0 ? null : { izquierda, derecha, arriba, abajo, pixeles }
}

export const dos = (n: number): number => Number(n.toFixed(2))

/**
 * ⚠ `NaN` VIAJA COMO `null` POR EL PROTOCOLO, y eso hay que absorberlo acá.
 *
 * `Runtime.evaluate` con `returnByValue` serializa el resultado, y en esa
 * serialización `NaN` se convierte en `null`. Las tres propiedades computadas
 * que pueden dar `NaN` son reales y no un error: `letter-spacing` y
 * `line-height` valen la palabra `normal` en cualquier elemento que no declare
 * la suya —el `<a>` del CTA es uno—, y `parseFloat('normal')` es `NaN`.
 *
 * Así que el redondeo tiene que saber decir «no hay número» en vez de romperse,
 * y publicar `null` en el JSON: escribir un 0 ahí sería inventar un interletrado
 * que nadie declaró.
 */
export const dosONulo = (n: number | null | undefined): number | null =>
  typeof n === 'number' && Number.isFinite(n) ? Number(n.toFixed(2)) : null
