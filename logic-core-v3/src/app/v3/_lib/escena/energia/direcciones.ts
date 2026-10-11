import type { Estilo, NombreDelAspecto } from './dibujo/particulas'
import type { AjustesDelEnjambre } from './enjambre/simulacion'

/**
 * [PULIDO 17] O3 · LAS TRES DIRECCIONES (`docs/rediseno/REFERENCIAS-PLASMA.md`: qué es cada una y por qué). Comparten los arcos, la
 * temperatura, el gesto, los textos, el tono y el pie; cambia la partícula:
 *   · A · CHISPAS: las cargas de PULIDO 15 hechas luz (en la CPU; los arcos salen de ellas).
 *   · B · ENJAMBRE: miles de motas finísimas en la GPU, un medio que se enciende donde pasa la energía, alrededor de unos núcleos.
 *   · C · CORRIENTES SOBRE EL LOGO: la energía corre pegada a la superficie del logo (su campo de distancia), dibujada como estelas
 *     cortas; las calientes se sueltan y se van al aire. [O4] reemplazó a «estelas sueltas en el volumen» (se leía como lluvia).
 * `?plasma=a|b|c` elige; sin la bandera, la recomendada (`DIRECCION_RECOMENDADA`).
 */
export type Direccion = 'a' | 'b' | 'c'

export interface DeLaDireccion {
  readonly nombre: string
  /** Las brasas (CPU): en escritorio y en el teléfono. En A son las partículas; en B y C, los núcleos del enjambre. */
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
    aspecto: { brasas: { uLuz: [1, 0.2, 0.3, 3], uTamano: [0.02, 0.07, 0.8, 5.5], uMovida: [0, 1.6, 0.3, 6] } },
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
      simulacion: { uFlujo: [0.5, 1.2, 1.1, 1.2], uNucleosAjuste: [1.6, 0.6, 1.4, 0.4], uReparto: [3.4, 11, 2.4, 1.6], uEnergiaAjuste: [0.08, 0.35, 0.9, 3], uCursorAjuste: [4.6, 0.5, 2.4, 0.9], uSuperficie: [0, 0, 1, 0] },
    },
  },
  c: {
    nombre: 'corrientes',
    brasas: [40, 28],
    intensidadDeLasBrasas: 0.35,
    // Los núcleos, tenues y sin humo de día; las corrientes con tope de brillo (sin grumos) y de día un aura oscura en el borde del logo.
    aspecto: { brasas: { uDia: [0, 0, 0.6, 0.5] }, enjambre: { uLuz: [0.5, 0.16, 0.3, 2.5], uDia: [0.03, 0, 0.35, 0.7], uDiaForma: [2.2, 4, 0, 0] } },
    enjambre: {
      lado: [56, 40],
      estilo: 'estela',
      intensidad: 1,
      // Pegadas a la superficie del logo (la banda a 0,18 u), un campo rápido que corre de costado; las calientes (desde 0,72) se
      // sueltan; los núcleos apenas tiran (son los que descargan los arcos).
      simulacion: { uFlujo: [1.1, 1, 1.6, 1.6], uNucleosAjuste: [0.4, 0.7, 0.6, 0.5], uReparto: [3.6, 11, 2, 1.6], uEnergiaAjuste: [0.06, 0.4, 0.8, 2], uCursorAjuste: [4.6, 0.5, 2.4, 1.2], uSuperficie: [0.18, 7, 0.72, 1] },
    },
  },
}

/** La que queda como default de `?energia=plasma` (la justificación, en `docs/rediseno/PLASMA.md`). */
export const DIRECCION_RECOMENDADA: Direccion = 'a'

export function direccionDe(pedida: Direccion | 'no'): Direccion {
  return pedida === 'no' ? DIRECCION_RECOMENDADA : pedida
}
