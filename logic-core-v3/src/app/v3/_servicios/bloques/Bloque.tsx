/**
 * [SERVICIOS S1b] EL BLOQUE — la caja que comparten los bloques de la página (plan §7).
 *
 * La sección con su nombre accesible (`aria-labelledby` apunta al `h2`), el título a la izquierda y el contenido a la
 * derecha desde 1024. Por debajo, todo apila. Sin CSS nuevo: tokens y utilidades del tema.
 *
 * `data-bloque` es el gancho de los tests (nunca `data-seccion`, `data-panel` ni ids del home). Los nombres son los de
 * SPEC §5, en su orden. `Problema` (el `h1`) y `Cierre` arman su propia caja y por eso no pasan por acá.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'

export type NombreDeBloque =
  | 'problema'
  | 'que-hacemos'
  | 'que-incluye'
  | 'precio'
  | 'extra'
  | 'proceso'
  | 'prueba'
  | 'faq'
  | 'llamado'
  | 'del-blog'
  | 'cierre'

/** El id del título de un bloque. Sale de la fórmula del home (`titular-…`), con un prefijo propio para no chocar. */
export function idDelTituloDe(nombre: NombreDeBloque): string {
  return idDelTitularDeSeccion(`servicio-${nombre}`)
}

interface BloqueProps {
  readonly nombre: NombreDeBloque
  readonly titulo: string
  readonly children: React.ReactNode
}

export function Bloque({ nombre, titulo, children }: BloqueProps): React.JSX.Element {
  const idDelTitulo = idDelTituloDe(nombre)
  return (
    <section data-bloque={nombre} aria-labelledby={idDelTitulo} className="border-t border-borde py-12 escritorio:py-20">
      <Envoltorio>
        <div className="flex flex-col gap-8 escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
          <Titular nivel="titulo-l" como="h2" id={idDelTitulo} className="text-balance escritorio:col-span-4">
            {titulo}
          </Titular>
          <div className="min-w-0 escritorio:col-span-8">{children}</div>
        </div>
      </Envoltorio>
    </section>
  )
}
