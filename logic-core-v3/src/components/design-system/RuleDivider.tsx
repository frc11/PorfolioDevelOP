import { cn } from '@/lib/utils'

interface RuleDividerProps {
  className?: string
}

/**
 * Regla horizontal de 1px con el color de borde del tema.
 *
 * `border-0` + `h-px` + fondo en vez del `border-top` que trae el preflight de
 * Tailwind: así el grosor es exactamente 1px real y el color sale del token.
 */
export function RuleDivider({ className }: RuleDividerProps) {
  return <hr className={cn('h-px w-full border-0 bg-ds-rule', className)} />
}
