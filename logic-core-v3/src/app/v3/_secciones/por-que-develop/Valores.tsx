import { BadgeCheck, LayoutDashboard, MessagesSquare, PenTool, Ruler, Timer, type LucideIcon } from 'lucide-react'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import type { IconoDeValor, Valor } from './contenido'

/**
 * LOS ÍCONOS DE LOS VALORES — una librería (Lucide, la que el repo ya usa), un trazo
 * (1,5, la regla de `CLAUDE.md`) y el color de la tinta, que es un token. **[FINAL]**
 *
 *   Hecho a medida           Ruler            la regla de medir
 *   Diseño que se destaca    PenTool          la pluma del trazo propio
 *   Rápido, sin atajos       Timer            el tiempo, sin la flecha del atajo
 *   Calidad que se nota      BadgeCheck       el sello de lo revisado
 *   Tu panel, tu control     LayoutDashboard  el panel, tal cual
 *   Hablás con quien lo hace MessagesSquare   la conversación directa
 */
export const ICONOS: Readonly<Record<IconoDeValor, LucideIcon>> = {
  medida: Ruler,
  diseno: PenTool,
  rapido: Timer,
  calidad: BadgeCheck,
  panel: LayoutDashboard,
  personas: MessagesSquare,
}

/** Un valor: ícono, título y línea. El ícono es decoración: el título ya dice qué es. */
export function PiezaDeValor({
  valor,
  className,
  lineaPlena = false,
}: {
  readonly valor: Valor
  readonly className?: string
  /** La línea a tinta plena: sobre el logo gris de la noche, `tinta-media` da 2,31:1 y sólo la plena pasa AA. */
  readonly lineaPlena?: boolean
}): React.JSX.Element {
  const Icono = ICONOS[valor.clave]
  return (
    <div data-pieza="valor" data-valor={valor.clave} className={`flex flex-col gap-[var(--spacing-2)] ${className ?? ''}`}>
      <Icono aria-hidden="true" strokeWidth={1.5} className="text-tinta size-[var(--spacing-6)] shrink-0" />
      <Titular nivel="titulo-s" como="h3">
        {valor.titulo}
      </Titular>
      <Cuerpo como="p" className={lineaPlena ? undefined : 'text-tinta-media'}>
        {valor.linea}
      </Cuerpo>
    </div>
  )
}
