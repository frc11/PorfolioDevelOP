import type { FuenteDePagina } from '../../_lib/titulos3d/registro'
import type { AsientoDeLaLlegada } from '../../_lib/titulos3d/repeticiones'

/**
 * [B12a.4] EL PRESET DEL TÍTULO DE LAS PÁGINAS (D3, P-H14; `docs/rediseno/B12a-API.md` §3) — el mismo en todas las páginas: dos
 * variantes de Archivo, ninguna de las del home (la 62/700 del hero, la 100/600 y la 100/900 del CTA del final). La primera parte del
 * título va con `fuentes[0]` y la segunda con `fuentes[1]`, una debajo de la otra. Va en la pantalla (sigue al `h1` fijo de la intro),
 * llega con el gesto del titular del hero y se va con la caída de los otros títulos.
 *
 * [L6] La familia quedó fija: la 1 de las cuatro que Valentino comparó (la del «6»: ancha, negra y fina, 125/800 y 125/300). Ya no hay bandera
 * `?titulo=` ni página de comparación: las páginas que vienen copian esta base. T1: el título va en UNA línea, grande (`anchoDelTitulo.ts`):
 * las dos partes una al lado de la otra, cada una en su cara.
 */
export interface PresetDelTitulo {
  readonly fuentes: readonly [FuenteDePagina, FuenteDePagina]
  /** Dónde asienta la llegada al frenar a mitad (`repeticiones.ts`). */
  readonly asiento: AsientoDeLaLlegada
  /** Se va con una caída, nunca de golpe ni hacia arriba. */
  readonly saleCayendo: true
}

export const TITULO_DE_PAGINA: PresetDelTitulo = { fuentes: ['archivo-125-800', 'archivo-125-300'], asiento: 'cercano', saleCayendo: true }

/**
 * La cara del DOM de cada fuente (la misma instancia, `scripts-retoque/fuentes-3d.py`): la declara el layout de `/v3` (`next/font/local`
 * sin precarga: se baja sólo donde se pinta) con esta variable, y el `h1` la pinta con su peso exacto (sin negrita sintética).
 */
export const CARA_DEL_DOM: Readonly<Record<FuenteDePagina, { readonly familia: string; readonly peso: number }>> = {
  'archivo-125-800': { familia: 'var(--font-v3-pagina-125-800)', peso: 800 },
  'archivo-125-300': { familia: 'var(--font-v3-pagina-125-300)', peso: 300 },
  'archivo-75-800': { familia: 'var(--font-v3-pagina-75-800)', peso: 800 },
  'archivo-75-900': { familia: 'var(--font-v3-pagina-75-900)', peso: 900 },
  'archivo-75-500': { familia: 'var(--font-v3-pagina-75-500)', peso: 500 },
  'archivo-125-200': { familia: 'var(--font-v3-pagina-125-200)', peso: 200 },
  'archivo-125-500': { familia: 'var(--font-v3-pagina-125-500)', peso: 500 },
  'archivo-125-400': { familia: 'var(--font-v3-pagina-125-400)', peso: 400 },
}

/**
 * Cuándo cae el título: [B12a.8] cuando al tramo del título le falta `antes` (en pantallas) para soltarse (su fondo llega al alto de lo que
 * va fijo: de ahí en más el `h1` sube con el scroll), cae por tiempo (`s`, la curva de la casa); al volver arriba de ese punto, vuelve a
 * llegar. Antes de soltarse: el título en volumen nunca sube con el `h1`. Un gatillo, no un progresivo: la caída es entera.
 */
export const CAIDA_DEL_TITULO = { antes: 0.2, s: 0.6, curva: [0.25, 0.46, 0.45, 0.94] } as const

/** ¿Cae el título? `fondo`: el fondo del tramo del título en el cuadro (px); `fijo`: el alto de lo que va fijo; `alto`: el del cuadro. */
export function caeElTitulo(fondo: number, fijo: number, alto: number, antes: number = CAIDA_DEL_TITULO.antes): boolean {
  return fondo - fijo < antes * alto
}

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
