import { cn } from '@/lib/utils'

import { Envoltorio } from '../layout/Envoltorio'

/**
 * [L7] UNA SECCIÓN DE PAPEL del cuerpo de una página: opaca (la escena duerme debajo) y con el aire vertical de la base. Es la caja que
 * `pagina-base/CuerpoDeLaBase.tsx` repetía por sección; las páginas de L7 la importan en vez de copiarla.
 */
export const CONTENIDO_DE_LA_SECCION = 'flex flex-col gap-[var(--spacing-8)] py-[var(--spacing-20)]'

export function SeccionDePapel({ children, dato, className, claseDeContenido }: { readonly children: React.ReactNode; readonly dato?: string; readonly className?: string; readonly claseDeContenido?: string }): React.JSX.Element {
  return (
    <section {...(dato === undefined ? {} : { 'data-seccion-de-pagina': dato })} className={cn('relative bg-fondo text-tinta', className)}>
      <Envoltorio claseDeContenido={cn(CONTENIDO_DE_LA_SECCION, claseDeContenido)}>{children}</Envoltorio>
    </section>
  )
}
