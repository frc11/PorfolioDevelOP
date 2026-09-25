/**
 * s27 · UN DOM FALSO, lo justo para `destinosDelViaje.ts`: cajas con su tope y su alto, atributos,
 * y las cuatro consultas que el módulo hace. Las coordenadas van en el DOCUMENTO; la caja que
 * devuelve `getBoundingClientRect` las corre por el scroll de la ventana falsa, como el navegador.
 */

export interface CajaFalsa {
  readonly tope: number
  readonly alto: number
}

export class NodoFalso {
  parentElement: NodoFalso | null = null
  readonly style = { position: '' }
  private readonly consultas = new Map<string, NodoFalso | null>()
  private readonly listas = new Map<string, NodoFalso[]>()
  private readonly cercanos = new Map<string, NodoFalso | null>()

  constructor(
    private readonly caja: CajaFalsa,
    private readonly atributos: Readonly<Record<string, string>> = {},
    readonly pegado = false,
  ) {}

  getAttribute(nombre: string): string | null {
    return this.atributos[nombre] ?? null
  }

  getBoundingClientRect(): { top: number; bottom: number; height: number } {
    const top = this.caja.tope - VENTANA.scrollY
    return { top, bottom: top + this.caja.alto, height: this.caja.alto }
  }

  responde(selector: string, nodo: NodoFalso | null): this {
    this.consultas.set(selector, nodo)
    return this
  }

  lista(selector: string, nodos: NodoFalso[]): this {
    this.listas.set(selector, nodos)
    return this
  }

  cercano(selector: string, nodo: NodoFalso | null): this {
    this.cercanos.set(selector, nodo)
    return this
  }

  querySelector(selector: string): NodoFalso | null {
    return this.consultas.get(selector) ?? null
  }

  querySelectorAll(selector: string): NodoFalso[] {
    return this.listas.get(selector) ?? []
  }

  closest(selector: string): NodoFalso | null {
    return this.cercanos.get(selector) ?? null
  }
}

export const VENTANA = { scrollY: 0, innerHeight: 900 }
const DOCUMENTO = { documentElement: { scrollHeight: 30_000 } }

/** Monta los globales que el módulo lee (`window`, `document`, `getComputedStyle`) y los devuelve al terminar. */
export function conDomFalso<T>(alto: number, despeje: number, cuerpo: () => T): T {
  const antes = { window: globalThis.window, document: globalThis.document, getComputedStyle: globalThis.getComputedStyle }
  VENTANA.innerHeight = alto
  const estilo = (el: unknown): { position: string; scrollPaddingTop: string } => ({
    position: el instanceof NodoFalso && el.pegado && el.style.position === '' ? 'sticky' : 'static',
    scrollPaddingTop: `${String(despeje)}px`,
  })
  Object.assign(globalThis, { window: VENTANA, document: DOCUMENTO, getComputedStyle: estilo })
  try {
    return cuerpo()
  } finally {
    Object.assign(globalThis, antes)
  }
}
