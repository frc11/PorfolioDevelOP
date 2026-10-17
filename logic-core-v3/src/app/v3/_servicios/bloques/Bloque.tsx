/**
 * [SERVICIOS S1b] EL BLOQUE — la caja que comparten los bloques de la página (plan §7).
 *
 * La sección con su nombre accesible (`aria-labelledby` apunta al `h2`) y adentro un panel de vidrio: el título a la izquierda y el
 * contenido a la derecha desde 1024; por debajo, todo apila. La sección es transparente (sin fondo propio) y el panel es el vidrio
 * del Portfolio; el título entra por línea y el panel, entero, con los patrones de revelado del home (`movimiento/`).
 *
 * `data-bloque` es el gancho de los tests (nunca `data-seccion`, `data-panel` ni ids del home). Los nombres son los de SPEC §5, en
 * su orden. `Problema` (el `h1`, sin panel: va directo sobre el fondo) y `Cierre` arman su propia caja.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { TitularQueEntra } from '../movimiento/TitularQueEntra'
import { PanelDeVidrio } from './PanelDeVidrio'

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
    <section data-bloque={nombre} aria-labelledby={idDelTitulo} className="py-3 escritorio:py-4">
      <Envoltorio>
        <PanelDeVidrio>
          <div className="flex flex-col gap-8 escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
            <TitularQueEntra
              id={idDelTitulo}
              texto={titulo}
              nivel="titulo-l"
              como="h2"
              className="text-balance"
              claseDelBloque="block w-full escritorio:col-span-4"
            />
            <div className="min-w-0 escritorio:col-span-8">{children}</div>
          </div>
        </PanelDeVidrio>
      </Envoltorio>
    </section>
  )
}
