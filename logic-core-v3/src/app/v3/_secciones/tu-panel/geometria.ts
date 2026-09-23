/**
 * LA GEOMETRÍA DE LA GALERÍA — el ritmo de la grilla y la cuenta del parallax,
 * medidos en nk/news (SPRINT PANEL, fase 0; tabla en `docs/rediseno/SPRINT-PANEL.md`).
 *
 * Funciones puras y clases escritas enteras: el escáner de Tailwind lee este
 * archivo tal cual, así que ninguna clase se arma con una plantilla.
 */

import type { NivelDeTitular } from '../../_componentes/tipografia/Titular'

/** Cómo se ubica una tarjeta en la grilla de tres columnas, desde `escritorio`. */
export interface LugarEnLaGrilla {
  /** Clases de columna. Abajo de 1025 no hacen nada: la grilla es de una columna. */
  readonly clase: string
  /** Cuántas de las tres columnas ocupa: arma su `sizes`. */
  readonly columnas: 1 | 2 | 3
  /** nk baja el título de 32 a 18 px en las dos chicas del bloque M + S + S. */
  readonly nivel: NivelDeTitular
}

/**
 * EL RITMO DE nk, `nth-child(7n + k)`: grande · mediana + chica + chica
 * desfasada · grande · chica + mediana. La cuarta va a la tercera columna y sube
 * 5 rem (80 px = `--spacing-20`) para que la columna derecha quede escalonada.
 */
const RITMO: readonly LugarEnLaGrilla[] = [
  { clase: 'escritorio:col-span-3', columnas: 3, nivel: 'titulo-m' },
  { clase: 'escritorio:col-span-2', columnas: 2, nivel: 'titulo-m' },
  { clase: 'escritorio:col-span-1', columnas: 1, nivel: 'titulo-s' },
  {
    clase: 'escritorio:col-span-1 escritorio:col-start-3 escritorio:relative escritorio:-top-[var(--spacing-20)]',
    columnas: 1,
    nivel: 'titulo-s',
  },
  { clase: 'escritorio:col-span-3', columnas: 3, nivel: 'titulo-m' },
  { clase: 'escritorio:col-span-1', columnas: 1, nivel: 'titulo-m' },
  { clase: 'escritorio:col-span-2', columnas: 2, nivel: 'titulo-m' },
]

export function lugarDe(indice: number): LugarEnLaGrilla {
  return RITMO[indice % RITMO.length]
}

/**
 * LOS CANALES DE nk: 120 px entre columnas y 70 entre filas, sobre un marco de
 * 1016. Se escriben como múltiplos de `--spacing-20` para que den el píxel medido.
 */
export const CLASE_DE_LA_GRILLA =
  'grid grid-cols-1 gap-y-[calc(var(--spacing-20)*0.875)] escritorio:grid-cols-3 escritorio:gap-x-[calc(var(--spacing-20)*1.5)]'

// ── El parallax ────────────────────────────────────────────────────────────

/** La imagen mide 130 % del alto de su marco: el sobrante es lo que puede viajar. */
export const ALTO_DE_LA_IMAGEN = 1.3

/**
 * nk viaja 1,3 veces el «recorrido justo» (el sobrante repartido entre la
 * entrada y la salida del marco): 0,1515 px por px de scroll con un marco de 571
 * y un viewport de 900, 0,111 con 358 y 0,054 con 145.
 */
export const VELOCIDAD_DEL_PARALLAX = 1.3

/**
 * Cuánto se corre la imagen dentro de su marco, en px, para un marco con `arriba`
 * y `alto` (del `getBoundingClientRect`) en un viewport de `alto` px.
 *
 * Negativo = la imagen sube respecto del marco. Con el marco centrado en la
 * pantalla la imagen queda centrada (−15 % del marco), y al bajar la página la
 * imagen baja más despacio que el marco. Se acota al sobrante: el borde de la
 * imagen nunca entra en el marco.
 */
export function corrimientoDelParallax(arriba: number, altoDelMarco: number, altoDeLaPantalla: number): number {
  const sobrante = (ALTO_DE_LA_IMAGEN - 1) * altoDelMarco
  const recorrido = altoDeLaPantalla + altoDelMarco
  const progreso = (altoDeLaPantalla - arriba) / recorrido
  const crudo = -sobrante / 2 + (progreso - 0.5) * sobrante * VELOCIDAD_DEL_PARALLAX
  return Math.min(0, Math.max(-sobrante, crudo))
}
