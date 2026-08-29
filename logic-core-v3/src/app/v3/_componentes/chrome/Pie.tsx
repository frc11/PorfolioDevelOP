import { cn } from '@/lib/utils'

import { Envoltorio } from '../layout/Envoltorio'
import { Grilla } from '../layout/Grilla'
import { Titular } from '../tipografia/Titular'

/**
 * EL PIE — la estructura. Sin textos, sin enlaces, sin logo.
 *
 * ── Por qué vale la pena construirlo antes que el contenido ───────────────
 *
 * Es el componente más replicado del sitio medido: **la mitad de las
 * instancias de animación son un pie repetido en cada página**, y sus 0,70 a
 * 1,40 vh son lo ÚNICO que se repite igual en las seis URLs. Construirlo una
 * vez y bien es la mitad del trabajo de animación del sitio.
 *
 * ── La inversión es un dato, no una arquitectura ──────────────────────────
 *
 * `invertido` no pinta un color: escribe `data-seccion="invertida"`, que es el
 * bloque que `theme-develop.css` ya trae de S0. Ese bloque redefine
 * `--color-fondo`, `--color-tinta` y los dos bordes, así que las MISMAS clases
 * pintan las dos versiones. Y el anillo de foco se da vuelta solo, sin que
 * este archivo lo mencione, porque `--color-foco` ES `var(--color-tinta)`.
 *
 * Cuál de las dos usa el sitio no lo decide este sprint. El pie de la
 * referencia es oscuro; develOP invierte el tema por defecto y su escena es
 * una sala clara, así que esa relación se da vuelta entera y hay que
 * diseñarla, no asumirla. El default es `false` —papel— y cambiarlo es un
 * valor, no una reescritura.
 */

export interface PieProps {
  readonly children: React.ReactNode
  /** Escribe `data-seccion="invertida"`. El default NO decide la estética. */
  readonly invertido?: boolean
  readonly className?: string
}

export function Pie({ children, invertido = false, className }: PieProps) {
  return (
    <footer
      data-pieza="pie"
      data-seccion={invertido ? 'invertida' : undefined}
      className={className}
    >
      {/* El apilado va en la caja de CONTENIDO, que es la que tiene los hijos:
          un `gap` sobre el `<footer>`, cuyo único hijo es el envoltorio, no
          separaría nada. */}
      <Envoltorio claseDeContenido="flex flex-col gap-[var(--spacing-12)]">{children}</Envoltorio>
    </footer>
  )
}

/**
 * El título de cierre — `text.titulo-xl`, `tracking.titulo`, peso normal.
 * Los tres medidos, y el nivel más grande de la escala.
 *
 * `como="h2"` por defecto y no `h1`: el pie cierra una página que ya tiene su
 * `h1` arriba. Es pisable, porque en una página sin encabezado propio el
 * cierre puede ser el primero.
 */
export function TituloDeCierreDelPie({
  children,
  como = 'h2',
  className,
}: {
  readonly children: React.ReactNode
  readonly como?: 'h1' | 'h2' | 'h3'
  readonly className?: string
}) {
  return (
    <Titular nivel="titulo-xl" como={como} peso="normal" className={cn('text-balance', className)}>
      {children}
    </Titular>
  )
}

/**
 * El bloque de tres columnas del pie — 10 apariciones entre home y estudio.
 *
 * Es una grilla del sistema, no una excepción: columnas fluidas, canaleta fija
 * que conmuta en 1025. Colapsa a una sola columna abajo de `tablet`, que es lo
 * que hace la referencia y lo único razonable a 375px.
 */
export function BloqueDeColumnasDelPie({
  children,
  className,
}: {
  readonly children: React.ReactNode
  readonly className?: string
}) {
  return (
    <Grilla columnas={3} canal="conmutado" className={className}>
      {children}
    </Grilla>
  )
}
