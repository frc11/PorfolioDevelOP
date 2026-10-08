/**
 * [PULIDO 4] C1 · LO QUE LA METAMORFOSIS LEE DEL DOM — dónde está cada letra y cada ícono de un valor (en px de su caja, sin
 * transformaciones: la escena sigue la caja en cada cuadro) y dónde va cada renglón de la frase del CTA. Sin `three`: sólo
 * el DOM. En el escenario el valor está en CSS 3D (llega desde la sala, gira contra el mouse y su columna va en el plano del
 * título): para medirlo plano, las transformadas de su camino se sacan un instante y se devuelven en la misma tarea (no hay
 * cuadro en el medio: no se ve).
 */

/** Las medidas de una fuente (unidades de la fuente): de ahí sale la línea de base de una letra en su caja del DOM. */
export interface MetricasDeLaFuente {
  readonly ascender: number
  readonly descender: number
  readonly resolution: number
}

/** Una letra medida: su carácter, el comienzo de su avance y su línea de base (px desde la esquina de su caja) y su cuerpo (px). */
export interface LetraMedida {
  readonly c: string
  readonly x: number
  readonly base: number
  readonly cuerpo: number
}

/** Un ícono medido: su SVG (el de Lucide, tal cual) y su caja (px desde la esquina de la caja del valor). */
export interface IconoMedido {
  readonly svg: string
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface ValorMedido {
  readonly letras: readonly LetraMedida[]
  readonly iconos: readonly IconoMedido[]
  /** El tamaño de su caja sin transformaciones (px): con su caja de ahora da la escala de ahora. */
  readonly ancho: number
  readonly alto: number
  /**
   * Con `raiz` (el escenario, clavado en la pantalla): dónde está su caja plana adentro de ella (px). La escena la sigue ahí,
   * pegada a la pantalla como el resto del CTA, y no en el plano del título (que con la cámara subiendo a C la achicaba hasta
   * perderse al lado del logo). Sin `raiz` (la lista), `null`: se sigue su caja de ahora.
   */
  readonly enLaRaiz: { readonly x: number; readonly y: number } | null
}

/** Lo que no se mide: las copias del espesor (CSS 3D) y lo que es sólo para el lector. */
const NO_SE_MIDE = '[data-parte="espesor"], .sr-only'

/** Saca las transformadas de `el` y de su camino hasta `raiz` (y de lo que tiene adentro); devuelve cómo ponerlas de vuelta. */
function aplanar(el: HTMLElement, raiz: Element | null): () => void {
  const tocados: { readonly e: HTMLElement; readonly antes: string }[] = []
  const sacar = (e: HTMLElement): void => {
    if (getComputedStyle(e).transform === 'none') return
    tocados.push({ e, antes: e.style.transform })
    e.style.transform = 'none'
  }
  for (let e: HTMLElement | null = el; e !== null && e !== raiz; e = e.parentElement) sacar(e)
  for (const e of el.querySelectorAll<HTMLElement>('*')) if (e.closest(NO_SE_MIDE) === null) sacar(e)
  return () => {
    for (let k = tocados.length - 1; k >= 0; k -= 1) tocados[k].e.style.transform = tocados[k].antes
  }
}

/** La línea de base de una letra en su caja del DOM: el contenido de la fuente centrado en la caja. */
export function baseEnLaCaja(arriba: number, alto: number, cuerpo: number, f: MetricasDeLaFuente): number {
  const caja = ((f.ascender - f.descender) / f.resolution) * cuerpo
  return arriba + (alto - caja) / 2 + (f.ascender / f.resolution) * cuerpo
}

/**
 * Mide un valor: cada letra visible (con su línea de base para la fuente `f`) y cada ícono, en px desde la esquina de su caja.
 * `raiz`: hasta dónde se sacan las transformadas (el escenario); `null`, hasta el documento.
 */
export function medirElValor(el: HTMLElement, f: MetricasDeLaFuente, raiz: Element | null): ValorMedido {
  const devolver = aplanar(el, raiz)
  try {
    const caja = el.getBoundingClientRect()
    const deLaRaiz = raiz?.getBoundingClientRect() ?? null
    const letras: LetraMedida[] = []
    const rango = document.createRange()
    const recorrido = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest(NO_SE_MIDE) === null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) })
    for (let nodo = recorrido.nextNode(); nodo !== null; nodo = recorrido.nextNode()) {
      if (!(nodo instanceof Text) || nodo.parentElement === null) continue
      const cuerpo = parseFloat(getComputedStyle(nodo.parentElement).fontSize)
      for (let k = 0; k < nodo.length; k += 1) {
        const c = nodo.data[k]
        if (c.trim() === '') continue
        rango.setStart(nodo, k)
        rango.setEnd(nodo, k + 1)
        const r = rango.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) continue
        letras.push({ c, x: r.left - caja.left, base: baseEnLaCaja(r.top - caja.top, r.height, cuerpo, f), cuerpo })
      }
    }
    const iconos: IconoMedido[] = []
    for (const svg of el.querySelectorAll('svg')) {
      if (svg.closest(NO_SE_MIDE) !== null) continue
      const r = svg.getBoundingClientRect()
      iconos.push({ svg: svg.outerHTML, x: r.left - caja.left, y: r.top - caja.top, ancho: r.width, alto: r.height })
    }
    return { letras, iconos, ancho: caja.width, alto: caja.height, enLaRaiz: deLaRaiz === null ? null : { x: caja.left - deLaRaiz.left, y: caja.top - deLaRaiz.top } }
  } finally {
    devolver()
  }
}

/** Dónde está la caja de un valor ahora (px de la pantalla) y en qué escala (su columna va en el plano del título). */
export interface CajaDeAhora {
  x: number
  y: number
  escala: number
}

/**
 * Dónde está la caja del valor: la de ahora (con las transformadas de su camino: donde se lo ve) o, con `plano` (0 a 1), la
 * plana adentro de la raíz (pegada a la pantalla). En el arranque de la transformación la escena lo toma donde se lo ve y en el
 * primer tramo lo lleva a la plana.
 */
export function cajaDeAhora(el: HTMLElement, medido: ValorMedido, raiz: Element | null, plano: number, salida: CajaDeAhora): void {
  const r = el.getBoundingClientRect()
  const [x, y, escala] = [r.left, r.top, medido.ancho > 0 ? r.width / medido.ancho : 1]
  if (medido.enLaRaiz === null || raiz === null) {
    ;[salida.x, salida.y, salida.escala] = [x, y, escala]
    return
  }
  const q = raiz.getBoundingClientRect()
  salida.x = x + (q.left + medido.enLaRaiz.x - x) * plano
  salida.y = y + (q.top + medido.enLaRaiz.y - y) * plano
  salida.escala = escala + (1 - escala) * plano
}

/** Un renglón de la frase del CTA en la pantalla: su texto, si es el destacado (700) y su caja (px), con el cuerpo del DOM. */
export interface RenglonDeLaFrase {
  readonly texto: string
  readonly fuerte: boolean
  readonly izquierda: number
  readonly arriba: number
  readonly ancho: number
  readonly alto: number
  readonly cuerpo: number
}

/**
 * Los renglones de la frase del CTA, como se ven: las partes (`frase`: las dos mitades y el destacado) que caen en el mismo
 * renglón del DOM van juntas (desde escritorio, las dos mitades en uno; en el teléfono, cada una en el suyo). La escena las
 * arma en Archivo (el DOM es la Chivo: la fuente del sitio en Archivo es sólo de mayúsculas) centradas en su renglón.
 */
export function renglonesDeLaFrase(partes: readonly HTMLElement[], fuertes: readonly boolean[]): RenglonDeLaFrase[] {
  const salida: { texto: string; fuerte: boolean; x0: number; x1: number; arriba: number; alto: number; cuerpo: number }[] = []
  partes.forEach((el, k) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0) return
    const texto = (el.textContent ?? '').trim()
    const cuerpo = parseFloat(getComputedStyle(el).fontSize)
    const ultimo = salida[salida.length - 1]
    if (ultimo !== undefined && ultimo.fuerte === fuertes[k] && Math.abs(ultimo.arriba - r.top) < 0.5 * r.height) {
      ultimo.texto = `${ultimo.texto} ${texto}`
      ultimo.x0 = Math.min(ultimo.x0, r.left)
      ultimo.x1 = Math.max(ultimo.x1, r.right)
      return
    }
    salida.push({ texto, fuerte: fuertes[k] === true, x0: r.left, x1: r.right, arriba: r.top, alto: r.height, cuerpo })
  })
  return salida.map((r) => ({ texto: r.texto, fuerte: r.fuerte, izquierda: r.x0, arriba: r.arriba, ancho: r.x1 - r.x0, alto: r.alto, cuerpo: r.cuerpo }))
}
