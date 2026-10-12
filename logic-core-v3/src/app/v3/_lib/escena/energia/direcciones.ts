import type { NombreDelAspecto } from './dibujo/particulas'

/**
 * [PULIDO 17] O3 · LAS DIRECCIONES (`docs/rediseno/REFERENCIAS-PLASMA.md`: qué era cada una y por qué). Quedó UNA:
 *   · A · CHISPAS: las cargas de PULIDO 15 hechas luz (en la CPU; los arcos salen de ellas). [PULIDO 18] El producto.
 * [PULIDO 18] P1.0 · C (las corrientes sobre el logo) se borró con su código. [PULIDO 19] Q0 · B (el enjambre de motas en la GPU) se
 * borró con su código, su simulación y su estilo (la decisión del humano: el cristal de la dimensión espejo la reemplaza); con ella se
 * fue `?plasma=`: no hay qué elegir. La estructura queda (una dirección con nombre): el plasma A es el producto.
 */
export type Direccion = 'a'

export interface DeLaDireccion {
  readonly nombre: string
  /** Las brasas (CPU): en escritorio y en el teléfono. */
  readonly brasas: readonly [number, number]
  /** Cuánto brillan las brasas. */
  readonly intensidadDeLasBrasas: number
  /** Lo que la dirección cambia del aspecto de sus brasas (sobre el de su estilo, `dibujo/particulas.ts`). */
  readonly aspecto?: { readonly brasas?: Partial<Record<NombreDelAspecto, readonly [number, number, number, number]>> }
}

export const DIRECCIONES: Readonly<Record<Direccion, DeLaDireccion>> = {
  a: {
    nombre: 'chispas',
    // [PULIDO 19] Q1.a · más densidad: de 600 y 300 a 800 y 400 (con el dominio de la vista todas están en el cuadro).
    brasas: [800, 400],
    intensidadDeLasBrasas: 1,
    // Chispas suaves de tamaños muy distintos (no bokeh: poco desenfoque); de día, energía oscura translúcida con su destello blanco.
    // [PULIDO 18] P1.d · más partícula, menos nube: núcleos chicos y nítidos con un halo corto (2,5 veces el núcleo, tenue), tamaños
    // por una ley de potencia (de 0,012 a 0,08 u), casi sin desenfoque (era el bokeh: 0,3 px por u y hasta 6 px), un tope de 3,2 px.
    // El núcleo, brillante (2,8): con 1,3 y el reposo en 0,18, de noche eran puntitos tenues y el plasma perdía presencia (mini-banco).
    // P1.c · de día, su propia ganancia: un alfa chico sobre el papel no se ve (la noche suma luz sobre negro, que sí): el cuerpo, 2,6
    // y la mitad visible en reposo; el velo, angosto (con tope en el sombreador). [PULIDO 19] Q1.b · la FUENTE apenas (de 0,75 a 0,2, y más
    // ancha: 9 u): el plasma está en toda la vista, con un poco más cerca del logo.
    aspecto: { brasas: { uFuente: [9, 0.2, 0.55, 0.22], uLuz: [2.8, 0.26, 0.2, 2.5], uTamano: [0.012, 0.08, 0.7, 3.2], uMovida: [0, 1.2, 0.06, 1.5], uChispa: [2.3, 0.5, 0.55, 7], uNucleo: [1.5, 0, 0, 0], uDia: [2.6, 0.55, 0.5, 0.6], uDiaForma: [1.6, 1.2, 0.45, 0] } },
  },
}

/** La del producto (la justificación, en `docs/rediseno/PLASMA.md`). */
export const DIRECCION_RECOMENDADA: Direccion = 'a'
