import type { FormaDeLaPieza } from './registro'

/**
 * [RETOQUE DEL PIE] P2 · LO QUE LA ESCENA LEE DEL DOM DE CADA PIEZA — una vez por armado (al anotarse, al cambiar el
 * cuadro o la caja), nunca por cuadro. Todo en px CSS: la caja en el documento (sin la transformada que la escena le
 * escribe a la pieza: se suelta un momento para medir) y lo de adentro relativo a su esquina de arriba a la izquierda.
 *
 *   · las letras que se ven, cada una con su lugar (lo que el navegador compuso: el interletrado, el kerning, el renglón),
 *     su cuerpo y su peso (la escena tiene la Chivo 400, 500 y 600); en mayúsculas si el DOM las pinta así;
 *   · los íconos (`svg`): su caja, sus trazos y su grosor;
 *   · en el formulario, los pozos (los campos) y la tecla (Enviar): las letras son las de sus rótulos y la de la tecla.
 */
export type PesoDelPie = 400 | 500 | 600

export interface CajaDelPie {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly radio: number
}

export interface LetraDelPie {
  readonly ch: string
  readonly x: number
  /** La caja del carácter (su arriba y su alto): de ahí sale la línea de base, con las medidas de la fuente. */
  readonly arriba: number
  readonly alto: number
  readonly cuerpo: number
  readonly peso: PesoDelPie
  readonly enLaTecla: boolean
  /** [PULIDO 9] H2 · en Archivo (el título de la tarjeta de gracias, `data-fuente="archivo"`); si no, en Chivo. */
  readonly archivo?: boolean
}

export interface TrazoDelPie {
  readonly d: readonly string[]
  readonly x: number
  readonly y: number
  /** Los px de la caja del ícono por unidad de su `viewBox`, y el grosor del trazo (unidades del `viewBox`). */
  readonly escala: number
  readonly grosor: number
  readonly enLaTecla: boolean
}

export interface MedidaDeLaPieza {
  readonly caja: CajaDelPie
  readonly letras: readonly LetraDelPie[]
  readonly trazos: readonly TrazoDelPie[]
  readonly pozos: readonly CajaDelPie[]
  readonly tecla: CajaDelPie | null
}

const PESOS: readonly PesoDelPie[] = [400, 500, 600]

/** El peso disponible más cercano al que pinta el DOM. */
export function pesoDelPie(peso: number): PesoDelPie {
  return PESOS.reduce((a, b) => (Math.abs(b - peso) < Math.abs(a - peso) ? b : a))
}

const LA_TECLA = '[data-forma="principal"]'

function radioDe(el: Element | null): number {
  return el === null ? 0 : parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
}

function cajaRelativa(el: Element, origen: DOMRect, radio: number): CajaDelPie {
  const r = el.getBoundingClientRect()
  return { x: r.left - origen.left, y: r.top - origen.top, ancho: r.width, alto: r.height, radio }
}

/** ¿Este texto se ve? Ni el del lector (`sr-only`) ni la copia muda del rollover (`aria-hidden`). */
function seVe(n: Node, raiz: Element): boolean {
  const padre = n.parentElement
  // [PULIDO 10] J3 · ni lo que se queda vivo en el DOM sobre la pieza (la carga del botón: `data-sin-volumen`).
  if (padre === null || padre.closest('.sr-only') !== null || padre.closest('[data-sin-volumen]') !== null) return false
  const mudo = padre.closest('[aria-hidden="true"]')
  return mudo === null || !raiz.contains(mudo)
}

function letrasDe(raiz: HTMLElement, origen: DOMRect, solo: ((e: Element) => boolean) | null): LetraDelPie[] {
  const letras: LetraDelPie[] = []
  const rango = document.createRange()
  const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT)
  for (let n = recorrido.nextNode(); n !== null; n = recorrido.nextNode()) {
    const padre = n.parentElement
    if (!(n instanceof Text) || padre === null || !seVe(n, raiz) || (solo !== null && !solo(padre))) continue
    const estilo = getComputedStyle(padre)
    const mayusculas = estilo.textTransform === 'uppercase'
    const cuerpo = parseFloat(estilo.fontSize)
    const peso = pesoDelPie(parseInt(estilo.fontWeight, 10) || 400)
    const enLaTecla = padre.closest(LA_TECLA) !== null
    const archivo = padre.closest('[data-fuente="archivo"]') !== null
    for (let k = 0; k < n.length; k += 1) {
      const c = n.data[k]
      if (c.trim() === '') continue
      rango.setStart(n, k)
      rango.setEnd(n, k + 1)
      const r = rango.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      letras.push({ ch: mayusculas ? c.toLocaleUpperCase('es') : c, x: r.left - origen.left, arriba: r.top - origen.top, alto: r.height, cuerpo, peso, enLaTecla, archivo })
    }
  }
  return letras
}

function trazosDe(raiz: HTMLElement, origen: DOMRect, solo: ((e: Element) => boolean) | null): TrazoDelPie[] {
  const trazos: TrazoDelPie[] = []
  for (const svg of raiz.querySelectorAll('svg')) {
    if ((solo !== null && !solo(svg)) || svg.classList.contains('animate-spin') || svg.closest('[data-sin-volumen]') !== null) continue
    const r = svg.getBoundingClientRect()
    const caja = svg.viewBox.baseVal
    const lado = caja !== null && caja.width > 0 ? caja.width : 24
    const d = [...svg.querySelectorAll('path')].map((p) => p.getAttribute('d') ?? '').filter((x) => x !== '')
    if (r.width === 0 || d.length === 0) continue
    trazos.push({ d, x: r.left - origen.left, y: r.top - origen.top, escala: r.width / lado, grosor: parseFloat(svg.getAttribute('stroke-width') ?? '') || 1.5, enLaTecla: svg.closest(LA_TECLA) !== null })
  }
  return trazos
}

/** Mide la pieza (con su propia transformada suelta un momento: la medida es la del lugar del DOM). */
export function medirLaPieza(el: HTMLElement, forma: FormaDeLaPieza): MedidaDeLaPieza {
  const antes = el.style.transform
  el.style.transform = ''
  const r = el.getBoundingClientRect()
  const primerHijo = el.firstElementChild
  const caja: CajaDelPie = { x: r.left + scrollX, y: r.top + scrollY, ancho: r.width, alto: r.height, radio: forma === 'placa' ? radioDe(primerHijo) : radioDe(el) }
  let medida: MedidaDeLaPieza
  if (forma === 'formulario') {
    // Del formulario, en 3D: los rótulos y la tecla; lo que se escribe, los errores y el resultado quedan en el DOM.
    // [PULIDO 9] H2 · y lo que va en relieve de la tarjeta de gracias (`data-relieve`).
    const deLaPlaca = (e: Element): boolean => e.closest(`label, ${LA_TECLA}, [data-relieve]`) !== null
    const tecla = el.querySelector(LA_TECLA)
    medida = {
      caja,
      letras: letrasDe(el, r, deLaPlaca),
      trazos: trazosDe(el, r, (e) => e.closest(LA_TECLA) !== null),
      pozos: [...el.querySelectorAll('input, textarea')].map((c) => cajaRelativa(c, r, radioDe(c))),
      tecla: tecla === null ? null : cajaRelativa(tecla, r, radioDe(tecla.firstElementChild)),
    }
  } else {
    medida = { caja, letras: letrasDe(el, r, null), trazos: forma === 'placa' ? trazosDe(el, r, null) : [], pozos: [], tecla: null }
  }
  el.style.transform = antes
  return medida
}

/** Lo que cambia la geometría (todo menos el lugar en el documento): si es igual, la pieza no se rearma. */
export function firmaDeLaForma(m: MedidaDeLaPieza): string {
  const n = (v: number): string => v.toFixed(1)
  return [
    n(m.caja.ancho), n(m.caja.alto), n(m.caja.radio),
    m.letras.map((l) => `${l.ch}${n(l.x)},${n(l.arriba)},${n(l.cuerpo)},${String(l.peso)}${l.archivo === true ? 'A' : ''}`).join(';'),
    m.trazos.map((t) => `${t.d.join('|')}@${n(t.x)},${n(t.y)},${n(t.escala)}`).join(';'),
    m.pozos.map((p) => `${n(p.x)},${n(p.y)},${n(p.ancho)},${n(p.alto)}`).join(';'),
    m.tecla === null ? '' : `${n(m.tecla.x)},${n(m.tecla.y)},${n(m.tecla.ancho)},${n(m.tecla.alto)}`,
  ].join('/')
}
