/**
 * [SERVICIOS S1b · S3b] EL BLOQUE — la caja que comparten los bloques del cuerpo (plan §7).
 *
 * [S3b] Una sección OPACA en papel, en el lenguaje de las secciones opacas del home (Servicios y Tu panel):
 *   · la `<section>` a sangre con la superficie `papel-opaco` del home (`CLASES_DEL_PAPEL`) y sin margen: el aire va adentro, arriba
 *     de cada bloque, así que entre dos bloques no queda ninguna franja sin papel;
 *   · adentro, el `Envoltorio` (los 32 px fijos a los lados y el tope de 1920), la marca de la sección (el cuadrado del acento,
 *     `MarcaDeSeccion`, como en Servicios y en Números) y el título en `titulo-l`, el nivel del titular de Servicios;
 *   · sin vidrio: el papel es el fondo, y el acento es el oscuro del servicio (lo fija la raíz).
 *
 * El título a la izquierda y el contenido a la derecha desde 1024; por debajo, todo apila. El título entra por línea y el contenido,
 * entero, con los patrones de revelado del home (`movimiento/`), salvo el panel del FAQ (`panelQuieto`: cambia de alto al abrir una
 * pregunta y un revelado atado al scroll lo correría). El panel es la columna del contenido.
 *
 * `data-bloque` es el gancho de los tests (nunca `data-seccion`, `data-panel` ni ids del home). Los nombres son los de SPEC §5, en
 * su orden. `Problema` (el `h1`, en la intro) y `Cierre` arman su propia caja.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { SUPERFICIES } from '../../_lib/superficies'
import { MarcaDeSeccion } from '../../_secciones/_contrato/Rotulo'
import { Revelado } from '../movimiento/Revelado'
import { TitularQueEntra } from '../movimiento/TitularQueEntra'

/** La superficie de las secciones opacas del home (`papel-opaco`: el fondo y la tinta del papel). Se lee del home, no se escribe. */
export const CLASES_DEL_PAPEL = SUPERFICIES['papel-opaco'].clases

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
  /** El panel se queda en su lugar, sin revelado (el del FAQ: cambia de alto al abrir una pregunta). El título entra igual. */
  readonly panelQuieto?: boolean
}

export function Bloque({ nombre, titulo, children, panelQuieto = false }: BloqueProps): React.JSX.Element {
  const idDelTitulo = idDelTituloDe(nombre)
  return (
    <section data-bloque={nombre} aria-labelledby={idDelTitulo} className={`${CLASES_DEL_PAPEL} pt-12 escritorio:pt-20`}>
      <Envoltorio>
        <div className="flex flex-col gap-8 escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
          <div className="flex flex-col gap-4 escritorio:col-span-4">
            <MarcaDeSeccion />
            <TitularQueEntra
              id={idDelTitulo}
              texto={titulo}
              nivel="titulo-l"
              como="h2"
              className="text-balance"
              claseDelBloque="block w-full"
            />
          </div>
          <div className="min-w-0 escritorio:col-span-8">{panelQuieto ? children : <Revelado>{children}</Revelado>}</div>
        </div>
      </Envoltorio>
    </section>
  )
}
