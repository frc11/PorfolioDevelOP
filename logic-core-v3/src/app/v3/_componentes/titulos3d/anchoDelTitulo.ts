import type { FuenteDePagina } from '../../_lib/titulos3d/registro'
import METRICAS from '../../_fuentes/metricas-del-titulo.json'

import type { PresetDelTitulo } from './presets'

/**
 * [B12a.8] T1 · EL ANCHO DEL TÍTULO DE UNA PÁGINA, EN EM — el título va en UNA línea (nunca una palabra sola en un renglón) y su tamaño es
 * la parte del ancho que le toca dividida por su ancho en em: `font-size: calc(var(--ancho-del-titulo) / var(--em-del-titulo))`. La
 * parte la pone la composición (`ComposicionDeLaIntro.tsx`: el 70 % de la columna centrada, el 92 % de una columna de costado o, abajo
 * de 1024, del ancho útil); el ancho en em sale de acá, sin medir el DOM: el avance de cada letra y el kerning de sus pares en la
 * instancia de cada parte (`metricas-del-titulo.json`, que escribe `scripts-retoque/fuentes-3d.py` con las mismas instancias que pintan
 * el DOM y el 3D). Así el servidor pinta el tamaño final y nada salta al cargar.
 */
type Metricas = { readonly avance: Readonly<Record<string, number>>; readonly kerning: Readonly<Record<string, number>> }

const DE_CADA_FUENTE: Readonly<Record<FuenteDePagina, Metricas>> = METRICAS

/** Una letra que la instancia no tiene (un título nuevo sin regenerar): el ancho medio de una minúscula. */
const SIN_LETRA = 0.55

/** El ancho de un texto en em en una instancia: la suma de los avances y el kerning de cada par. */
export function anchoEnEm(texto: string, fuente: FuenteDePagina): number {
  const m = DE_CADA_FUENTE[fuente]
  const letras = [...texto]
  let ancho = 0
  for (let i = 0; i < letras.length; i += 1) {
    const letra = letras[i] ?? ''
    ancho += m.avance[letra] ?? SIN_LETRA
    const siguiente = letras[i + 1]
    if (siguiente !== undefined) ancho += m.kerning[letra + siguiente] ?? 0
  }
  return ancho
}

/** El ancho del título en una línea (em): la primera parte en su cara, el espacio (de la cara del `h1`: la de la primera) y la segunda. */
export function anchoDelTitulo(partes: readonly [string, string], preset: PresetDelTitulo): number {
  const primera = anchoEnEm(partes[0], preset.fuentes[0])
  return partes[1] === '' ? primera : primera + anchoEnEm(' ', preset.fuentes[0]) + anchoEnEm(partes[1], preset.fuentes[1])
}
