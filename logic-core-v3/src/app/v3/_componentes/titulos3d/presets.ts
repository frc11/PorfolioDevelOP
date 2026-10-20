import type { FuenteDePagina } from '../../_lib/titulos3d/registro'
import type { AsientoDeLaLlegada } from '../../_lib/titulos3d/repeticiones'

/**
 * [B12a.4] EL PRESET DEL TÍTULO DE LAS PÁGINAS (D3, P-H14; `docs/rediseno/B12a-API.md` §3) — el mismo en todas las páginas: dos
 * variantes de Archivo, ninguna de las del home (la 62/700 del hero, la 100/600 y la 100/900 del CTA del final). La primera parte del
 * título va con `fuentes[0]` y la segunda con `fuentes[1]`, una debajo de la otra. Va en la pantalla (sigue al `h1` fijo de la intro),
 * llega con el gesto del titular del hero y se va con la caída de los otros títulos.
 *
 * La familia la elige Valentino entre las tres combinaciones de `?titulo=1|2|3` (sin la bandera, la 1). Elegida, la bandera se va y
 * `TITULO_DE_PAGINA` queda con esa: la firma no cambia.
 */
export interface PresetDelTitulo {
  readonly fuentes: readonly [FuenteDePagina, FuenteDePagina]
  /** Dónde asienta la llegada al frenar a mitad (`repeticiones.ts`). */
  readonly asiento: AsientoDeLaLlegada
  /** Se va con una caída, nunca de golpe ni hacia arriba. */
  readonly saleCayendo: true
}

/** Las tres combinaciones de la bandera: 1 · la ancha (125/800 y 125/300); 2 · angosta y ancha (75/800 y 112,5/300); 3 · la liviana arriba. */
export const COMBINACIONES_DEL_TITULO: readonly [PresetDelTitulo, PresetDelTitulo, PresetDelTitulo] = [
  { fuentes: ['archivo-125-800', 'archivo-125-300'], asiento: 'cercano', saleCayendo: true },
  { fuentes: ['archivo-75-800', 'archivo-112-300'], asiento: 'cercano', saleCayendo: true },
  { fuentes: ['archivo-125-300', 'archivo-125-800'], asiento: 'cercano', saleCayendo: true },
]

export const TITULO_DE_PAGINA: PresetDelTitulo = COMBINACIONES_DEL_TITULO[0]

/** La combinación de `?titulo=` (1, 2 o 3); cualquier otra cosa, la de siempre. */
export function combinacionDeLaBandera(valor: string | null): PresetDelTitulo {
  const i = valor === '1' || valor === '2' || valor === '3' ? Number(valor) - 1 : 0
  return COMBINACIONES_DEL_TITULO[i] ?? TITULO_DE_PAGINA
}

/**
 * La cara del DOM de cada fuente (la misma instancia, `scripts-retoque/fuentes-3d.py`): la declara el layout de `/v3` (`next/font/local`
 * sin precarga: se baja sólo donde se pinta) con esta variable, y el `h1` la pinta con su peso exacto (sin negrita sintética).
 */
export const CARA_DEL_DOM: Readonly<Record<FuenteDePagina, { readonly familia: string; readonly peso: number }>> = {
  'archivo-125-800': { familia: 'var(--font-v3-pagina-125-800)', peso: 800 },
  'archivo-125-300': { familia: 'var(--font-v3-pagina-125-300)', peso: 300 },
  'archivo-75-800': { familia: 'var(--font-v3-pagina-75-800)', peso: 800 },
  'archivo-112-300': { familia: 'var(--font-v3-pagina-112-300)', peso: 300 },
}

/**
 * Cuándo cae el título: con el avance de la intro en `avance` (el papel ya entró al cuadro) cae, por tiempo (`s`, la curva de la casa); al
 * volver arriba de ese punto, vuelve a llegar. Un gatillo, no un progresivo: la caída es entera.
 */
export const CAIDA_DEL_TITULO = { avance: 0.5, s: 0.6, curva: [0.25, 0.46, 0.45, 0.94] } as const

/**
 * Los títulos que las fuentes de página saben escribir (sus letras: `TEXTOS_DE_PAGINA` de `scripts-retoque/fuentes-3d.py`, la misma lista):
 * los nombres de las páginas de servicio (su `NOMBRE`, `_servicios/datos/*.ts` de paginas/servicios), los tres de `acento.ts` (los de la
 * ruta de prueba, `?nombre=`) y el de la prueba. s78 exige cada letra en cada instancia; un título nuevo obliga a regenerar.
 */
export const TITULOS_CON_LETRAS = ['Páginas web', 'Software a medida', 'IA y automatizaciones', 'Desarrollo web', 'Integraciones de IA y Automatizaciones', 'Prueba de la intro'] as const

/** Las dos partes del título: las dadas, o la primera palabra y el resto (unidas con un espacio dan el título). */
export function partesDelTitulo(titulo: string, partes?: readonly [string, string]): readonly [string, string] {
  if (partes !== undefined) return partes
  const espacio = titulo.indexOf(' ')
  return espacio < 0 ? [titulo, ''] : [titulo.slice(0, espacio), titulo.slice(espacio + 1)]
}
