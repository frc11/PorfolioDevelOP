import type { Estilo, NombreDelAspecto } from './dibujo/particulas'
import type { AjustesDelEnjambre } from './enjambre/simulacion'

/**
 * [PULIDO 17] O3 · LAS DIRECCIONES (`docs/rediseno/REFERENCIAS-PLASMA.md`: qué es cada una y por qué). Comparten los arcos, la
 * temperatura, el gesto, los textos, el tono y el pie; cambia la partícula:
 *   · A · CHISPAS: las cargas de PULIDO 15 hechas luz (en la CPU; los arcos salen de ellas). [PULIDO 18] El producto.
 *   · B · ENJAMBRE: miles de motas finísimas en la GPU, un medio que se enciende donde pasa la energía, alrededor de unos núcleos.
 *     [PULIDO 18] Se queda en su bandera hasta que exista el efecto de cristal de la dimensión espejo (de ahí sale).
 * [PULIDO 18] P1.0 · C (las corrientes sobre el logo) se borró con su código. `?plasma=a|b` elige; sin la bandera, A.
 */
export type Direccion = 'a' | 'b'

export interface DeLaDireccion {
  readonly nombre: string
  /** Las brasas (CPU): en escritorio y en el teléfono. En A son las partículas; en B, los núcleos del enjambre. */
  readonly brasas: readonly [number, number]
  /** Cuánto brillan las brasas (1: las de A; los núcleos, menos: son parte del medio). */
  readonly intensidadDeLasBrasas: number
  /** Lo que la dirección cambia del aspecto de sus brasas y de su enjambre (sobre el de su estilo, `dibujo/particulas.ts`). */
  readonly aspecto?: { readonly brasas?: Partial<Record<NombreDelAspecto, readonly [number, number, number, number]>>; readonly enjambre?: Partial<Record<NombreDelAspecto, readonly [number, number, number, number]>> }
  /**
   * El enjambre (GPU): el lado de la textura (lado² partículas) en escritorio y en el teléfono, su estilo, su intensidad y los ajustes
   * de su simulación (el flujo, los núcleos, el reparto, la energía, el puntero); sin enjambre, null.
   */
  readonly enjambre: { readonly lado: readonly [number, number]; readonly estilo: Estilo; readonly intensidad: number; readonly simulacion: AjustesDelEnjambre } | null
}

export const DIRECCIONES: Readonly<Record<Direccion, DeLaDireccion>> = {
  a: {
    nombre: 'chispas',
    brasas: [600, 300],
    intensidadDeLasBrasas: 1,
    // Chispas suaves de tamaños muy distintos (no bokeh: poco desenfoque); de día, energía oscura translúcida con su destello blanco.
    // [PULIDO 18] P1.d · más partícula, menos nube: núcleos chicos y nítidos con un halo corto (el doble del núcleo, tenue), tamaños
    // por una ley de potencia (de 0,012 a 0,08 u), casi sin desenfoque (era el bokeh: 0,3 px por u y hasta 6 px), un tope de 3,2 px.
    aspecto: { brasas: { uLuz: [1.3, 0.18, 0.14, 2], uTamano: [0.012, 0.08, 0.7, 3.2], uMovida: [0, 1.2, 0.06, 1.5] } },
    enjambre: null,
  },
  b: {
    nombre: 'enjambre',
    brasas: [40, 28],
    intensidadDeLasBrasas: 0.35,
    // Los núcleos, tenues y sin humo de día (si no, manchas); el medio, motas suaves, casi sin humo de día.
    aspecto: { brasas: { uDia: [0, 0, 0.6, 0.5] }, enjambre: { uTamano: [0.015, 0.05, 0.7, 4.5], uLuz: [0.32, 0.12, 0.45, 3], uFuente: [5, 0.9, 0.6, 0.25], uDia: [0, 0, 0.7, 0.55], uDelante: [0.7, 3.6, 0.6, 0] } },
    enjambre: {
      lado: [128, 80],
      estilo: 'mota',
      intensidad: 1,
      // Más adentro (cerca del logo), núcleos fuertes (nubes y filamentos que se forman y se deshacen), en reposo casi apagadas.
      simulacion: { uFlujo: [0.5, 1.2, 1.1, 1.2], uNucleosAjuste: [1.6, 0.6, 1.4, 0.4], uReparto: [3.4, 11, 2.4, 1.6], uEnergiaAjuste: [0.08, 0.35, 0.9, 3], uCursorAjuste: [4.6, 0.5, 2.4, 0.9] },
    },
  },
}

/** La del producto (sin `?plasma=`; la justificación, en `docs/rediseno/PLASMA.md`). */
export const DIRECCION_RECOMENDADA: Direccion = 'a'

export function direccionDe(pedida: Direccion | 'no'): Direccion {
  return pedida === 'no' ? DIRECCION_RECOMENDADA : pedida
}
