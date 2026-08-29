import { cn } from '@/lib/utils'

/**
 * LA GRILLA — columnas FLUIDAS, canaletas FIJAS.
 *
 * ── El hallazgo, en una línea ─────────────────────────────────────────────
 *
 * Apareando las 177 grillas del sitio medido por ruta entre 1025 y 1920:
 *
 *   · **Anchos de columna: fluidos.** 151 de 177 (85,3%) cambian de ancho.
 *     `119,25px 834px` pasa a `472px 1416px`; `190px ×4` pasa a `202,5px ×4`.
 *   · **Gaps: fijos.** 177 de 177 idénticos. **Cero excepciones.**
 *
 * Columnas que respiran, canaletas que no. Por eso acá no hay ni un ancho de
 * columna en px: todas son `minmax(0, 1fr)` —que es lo que emite
 * `grid-cols-N`— salvo la lateral, que es el único ancho fijo medido.
 *
 * ── La canaleta conmuta en 1025, y eso también está medido ────────────────
 *
 * El gap dominante es **12px a 768 y 1024** (55 grillas) y **16px a 1025 y
 * 1920** (73 grillas). No interpola: conmuta en el breakpoint. Por eso el
 * modo por defecto es `conmutado` y usa la variante `escritorio:`, que
 * Tailwind genera desde `--breakpoint-escritorio`. El número 1025 no se
 * escribe en ningún lado.
 *
 * ── La grilla de 5 columnas no existe abajo de 1025 ───────────────────────
 *
 * Es la firma estructural del breakpoint: cero apariciones a 768 y a 1024, y
 * **40 apariciones** a 1025 y a 1920. Por eso `columnas: 5` cae a una sola
 * columna abajo del umbral en vez de apretar cinco en 375px.
 *
 * ⚠ Las clases están escritas enteras y literales. Tailwind escanea el código
 * fuente: una clase armada como `grid-cols-${n}` no la ve nadie y su regla no
 * se emite nunca.
 */

export type ColumnasDeGrilla = 1 | 2 | 3 | 4 | 5 | 'lateral'
export type CanalDeGrilla = 'conmutado' | 'compacto' | 'amplio'

/**
 * `lateral` es la única con un ancho declarado: **140px**, medido en 92
 * contenedores y corroborado por el rail de la referencia, que mide 140px
 * exactos. Colapsa abajo de `tablet` porque 140px fijos contra un viewport de
 * 375 dejan la columna fluida en 155px — eso no es una grilla, es un accidente.
 */
const CLASES_DE_COLUMNAS: Readonly<Record<ColumnasDeGrilla, string>> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 tablet:grid-cols-2',
  3: 'grid-cols-1 tablet:grid-cols-3',
  4: 'grid-cols-1 tablet:grid-cols-4',
  5: 'grid-cols-1 escritorio:grid-cols-5',
  lateral: 'grid-cols-1 tablet:grid-cols-[var(--columna-lateral)_minmax(0,1fr)]',
}

const CLASES_DE_CANAL: Readonly<Record<CanalDeGrilla, string>> = {
  conmutado:
    'gap-[var(--grilla-canal-compacto)] escritorio:gap-[var(--grilla-canal-amplio)]',
  compacto: 'gap-[var(--grilla-canal-compacto)]',
  amplio: 'gap-[var(--grilla-canal-amplio)]',
}

export interface GrillaProps {
  readonly children: React.ReactNode
  readonly columnas?: ColumnasDeGrilla
  readonly canal?: CanalDeGrilla
  readonly className?: string
}

export function Grilla({
  children,
  columnas = 1,
  canal = 'conmutado',
  className,
}: GrillaProps) {
  return (
    <div
      data-pieza="grilla"
      data-columnas={String(columnas)}
      data-canal={canal}
      className={cn('grid w-full', CLASES_DE_COLUMNAS[columnas], CLASES_DE_CANAL[canal], className)}
    >
      {children}
    </div>
  )
}

/** Las dos tablas, exportadas para que el instrumento las recorra en vez de
 *  buscar cadenas en el archivo. Una comprobación que lee el mismo dato que
 *  pinta la pantalla no puede quedar desincronizada del componente. */
export const TABLAS_DE_GRILLA = { columnas: CLASES_DE_COLUMNAS, canal: CLASES_DE_CANAL } as const
