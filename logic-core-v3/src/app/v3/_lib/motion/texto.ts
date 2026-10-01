import type { NombreDeCurva } from './curvas'
import type { Fotograma } from './patrones'
import { P1 } from './patrones-tipografia'

/**
 * [INTERFAZ 1] T1 · EL SISTEMA DE MOVIMIENTO DEL TEXTO — una sola familia para todo /v3.
 *
 * Tres formas de entrar y nada más: el TÍTULO por línea con máscara (P1 tal cual, lo medido en la referencia: cada línea
 * sube desde una altura de sí misma), el PÁRRAFO por línea con máscara (más corto y más junto: un párrafo se lee, no se
 * anuncia) y la ETIQUETA por palabra con máscara (pocas palabras: la línea sería una sola pieza). Las tres con la MISMA
 * curva (`principal`, power1.out, la del 84,5 % de los tweens medidos) y duraciones de una sola escala (1 · 0,8 · 0,6 de
 * la de P1). Todo atado al scroll y reversible, como el resto del sistema: lo que cambia es la forma de la pieza, no el
 * motor (`useProgresoDePatron` sigue dando el progreso, y el bloque decide sus anclas).
 *
 * La máscara es la ventana `overflow-hidden` de cada pieza (`LineasDeTexto`, `PalabrasDeTexto`): sin ella la pieza pasa
 * de largo en vez de aparecer.
 *
 * Los títulos llevan además la inercia (`inercia.ts`).
 */
export type TipoDeTexto = 'titulo' | 'parrafo' | 'etiqueta'

export interface FamiliaDeTexto {
  /** En qué se parte el texto. */
  readonly pieza: 'linea' | 'palabra'
  readonly claves: readonly Fotograma[]
  readonly curva: NombreDeCurva
  /** En segundos de la referencia: el cronograma lo reparte sobre el progreso (`cronograma.ts`). */
  readonly duracionDeclarada: number
  readonly escalonado: number
}

/** La única curva del texto. */
export const CURVA_DEL_TEXTO: NombreDeCurva = P1.curva

/** La escala de duraciones: fracciones de la de P1. */
export const ESCALA_DEL_TEXTO = { titulo: 1, parrafo: 0.8, etiqueta: 0.6 } as const

export const FAMILIA_DEL_TEXTO: Readonly<Record<TipoDeTexto, FamiliaDeTexto>> = {
  titulo: {
    pieza: 'linea',
    claves: P1.claves,
    curva: CURVA_DEL_TEXTO,
    duracionDeclarada: P1.duracionDeclarada * ESCALA_DEL_TEXTO.titulo,
    escalonado: P1.escalonado,
  },
  parrafo: {
    pieza: 'linea',
    claves: [{ clave: 'yPercent', desde: 100, hasta: 0 }],
    curva: CURVA_DEL_TEXTO,
    duracionDeclarada: P1.duracionDeclarada * ESCALA_DEL_TEXTO.parrafo,
    escalonado: P1.escalonado * ESCALA_DEL_TEXTO.parrafo * 0.75,
  },
  etiqueta: {
    pieza: 'palabra',
    claves: [{ clave: 'yPercent', desde: 110, hasta: 0 }],
    curva: CURVA_DEL_TEXTO,
    duracionDeclarada: P1.duracionDeclarada * ESCALA_DEL_TEXTO.etiqueta,
    escalonado: P1.escalonado * ESCALA_DEL_TEXTO.etiqueta * 0.5,
  },
}
