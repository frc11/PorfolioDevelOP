/**
 * [SERVICIOS S1b · S3b · M1] EL BLOQUE — la caja que comparten los bloques del cuerpo (plan §7).
 *
 * [S3b] Una sección OPACA en papel, en el lenguaje de las secciones opacas del home (Servicios y Tu panel):
 *   · la `<section>` a sangre con la superficie `papel-opaco` del home (`CLASES_DEL_PAPEL`) y sin margen: el aire va adentro, arriba
 *     de cada bloque, así que entre dos bloques no queda ninguna franja sin papel;
 *   · adentro, el `Envoltorio` (los 32 px fijos a los lados y el tope de 1920), la marca de la sección (el cuadrado del acento,
 *     `MarcaDeSeccion`, como en Servicios y en Números) y el título en `titulo-l`, el nivel del titular de Servicios;
 *   · sin vidrio: el papel es el fondo, y el acento es el oscuro del servicio (lo fija la raíz).
 *
 * El título a la izquierda y el contenido a la derecha desde 1024; por debajo, todo apila. El título entra por línea. El panel (la
 * columna del contenido) entra de una de tres maneras ([M1], la tabla del M0):
 *   · `progresivo` (el defecto): el revelado del home atado al scroll (`movimiento/Revelado`);
 *   · `gatillo`: entero al cruzar la línea de disparo y en espejo al volver a subir (`movimiento/Gatillo`): los CTA;
 *   · `quieto`: en su lugar, sin revelado (el FAQ: cambia de alto al abrir una pregunta y un revelado atado al scroll lo correría).
 *
 * `data-bloque` es el gancho de los tests (nunca `data-seccion`, `data-panel` ni ids del home). `Problema` (el `h1`, en la intro),
 * el CTA del precio (solo el botón), [M3] `Trabajos` (el video de fondo) y `Cierre` arman su propia caja.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { SUPERFICIES } from '../../_lib/superficies'
import { MarcaDeSeccion } from '../../_secciones/_contrato/Rotulo'
import { Gatillo } from '../movimiento/Gatillo'
import { Revelado } from '../movimiento/Revelado'
import { TitularQueEntra } from '../movimiento/TitularQueEntra'

/** La superficie de las secciones opacas del home (`papel-opaco`: el fondo y la tinta del papel). Se lee del home, no se escribe. */
export const CLASES_DEL_PAPEL = SUPERFICIES['papel-opaco'].clases

/** [M1] Los bloques, en el orden de la maqueta (M0 §1.3): la intro y los diez del cuerpo. */
export type NombreDeBloque =
  | 'problema'
  | 'que-hacemos'
  | 'que-incluye'
  | 'precio'
  | 'llamado-del-precio'
  | 'extra'
  | 'trabajos'
  | 'proceso'
  | 'faq'
  | 'llamado'
  | 'cierre'

/** Cómo entra el panel de un bloque. */
export type ReveladoDelPanel = 'progresivo' | 'gatillo' | 'quieto'

/** El id del título de un bloque. Sale de la fórmula del home (`titular-…`), con un prefijo propio para no chocar. */
export function idDelTituloDe(nombre: NombreDeBloque): string {
  return idDelTitularDeSeccion(`servicio-${nombre}`)
}

/** La columna del contenido: la mitad derecha desde 1024. La comparte el CTA del precio, que no tiene título. */
export const CLASES_DE_LA_COLUMNA_DEL_PANEL = 'min-w-0 escritorio:col-span-8'

interface BloqueProps {
  readonly nombre: NombreDeBloque
  readonly titulo: string
  readonly children: React.ReactNode
  readonly panel?: ReveladoDelPanel
}

function PanelQueEntra({ panel, children }: { readonly panel: ReveladoDelPanel; readonly children: React.ReactNode }): React.ReactNode {
  if (panel === 'quieto') return children
  return panel === 'gatillo' ? <Gatillo>{children}</Gatillo> : <Revelado>{children}</Revelado>
}

export function Bloque({ nombre, titulo, children, panel = 'progresivo' }: BloqueProps): React.JSX.Element {
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
          <div className={CLASES_DE_LA_COLUMNA_DEL_PANEL}>
            <PanelQueEntra panel={panel}>{children}</PanelQueEntra>
          </div>
        </div>
      </Envoltorio>
    </section>
  )
}
