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

/**
 * Un valor: ícono, título y línea. El ícono es decoración: el título ya dice qué es.
 *
 * **[FINAL 2]** Sin un solo color propio: todo hereda la tinta de la sección. En el escenario
 * es la oscura y plena —la línea en `tinta-media` daba 2,98–4,44:1 sobre las sombras de la
 * celosía, a 1440 y a 1024—, y abajo de 1024 es la del papel que usa la mezcla.
 */
export function PiezaDeValor({ valor, className }: { readonly valor: Valor; readonly className?: string }): React.JSX.Element {
  const Icono = ICONOS[valor.clave]
  return (
    <div data-pieza="valor" data-valor={valor.clave} className={`flex flex-col gap-[var(--spacing-2)] ${className ?? ''}`}>
      <Icono aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-6)] shrink-0" />
      <Titular nivel="titulo-s" como="h3">
        {valor.titulo}
      </Titular>
      <Cuerpo como="p">
        {valor.linea}
      </Cuerpo>
    </div>
  )
}
