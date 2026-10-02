import { BadgeCheck, LayoutDashboard, MessagesSquare, PenTool, Ruler, Timer, type LucideIcon } from 'lucide-react'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { ConEspesor } from '../../_componentes/volumen/ConEspesor'
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
export function PiezaDeValor({ valor, className, espesor = false }: { readonly valor: Valor; readonly className?: string; readonly espesor?: boolean }): React.JSX.Element {
  return (
    <div data-pieza="valor" data-valor={valor.clave} className={`flex flex-col gap-[var(--spacing-2)] ${espesor ? 'transform-3d' : ''} ${className ?? ''}`}>
      {/* [CIERRE RETOQUE 3D] D1 · en el escenario el ícono y el título tienen espesor: al moverse la cámara se les ven los costados. */}
      {espesor ? (
        <ConEspesor copia={<CabezaDelValor valor={valor} como="p" />}>
          <CabezaDelValor valor={valor} como="h3" />
        </ConEspesor>
      ) : (
        <CabezaDelValor valor={valor} como="h3" />
      )}
      <Cuerpo como="p">
        {valor.linea}
      </Cuerpo>
    </div>
  )
}

/** El ícono y el título de un valor (como `p`, la copia del espesor: el índice de encabezados no la cuenta). */
function CabezaDelValor({ valor, como }: { readonly valor: Valor; readonly como: 'h3' | 'p' }): React.JSX.Element {
  const Icono = ICONOS[valor.clave]
  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <Icono aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-6)] shrink-0" />
      <Titular nivel="titulo-s" como={como}>
        {valor.titulo}
      </Titular>
    </div>
  )
}
