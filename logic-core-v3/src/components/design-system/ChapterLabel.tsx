import { cn } from '@/lib/utils'

interface ChapterLabelProps {
  /** Ordinal ya formateado, con su cero adelante: "01", "02". */
  number: string
  /** Nombre del capítulo. Sin título rinde solo `( 01 )`. */
  title?: string
  className?: string
}

/**
 * Label editorial de capítulo: `( 01 — LA PRUEBA )`.
 *
 * Es la convención estructural tomada de las referencias: numera los capítulos
 * de la página para que el recorrido se lea como un índice y no como una pila
 * de secciones.
 *
 * Los paréntesis y el guión son ornamento tipográfico y van `aria-hidden`: a un
 * lector de pantalla le llega "01 LA PRUEBA", no la puntuación.
 */
export function ChapterLabel({ number, title, className }: ChapterLabelProps) {
  return (
    <p className={cn('font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted', className)}>
      <span aria-hidden="true">(&nbsp;&nbsp;</span>
      {number}
      {title ? (
        <>
          <span aria-hidden="true">&nbsp;&nbsp;—&nbsp;&nbsp;</span>
          {title}
        </>
      ) : null}
      <span aria-hidden="true">&nbsp;&nbsp;)</span>
    </p>
  )
}
