/**
 * [SERVICIOS S1b · S3b · M1] 1 · LA INTRO POR DENTRO — el `h1` de la página y su bajada (SPEC §5: título grande y una línea, sin
 * precio ni CTA).
 *
 * [M1] El `h1` es el NOMBRE del servicio («Páginas web»): el mismo texto que el título 3D que B12a monta con su preset, así que queda
 * siempre en el DOM. El problema baja a la bajada: dos párrafos y ningún heading, cada uno literal de los datos (la entrada, que es el
 * título del problema, y su texto). Arriba, la marca de la sección en el acento (el claro, el de la intro), como en el cuerpo.
 *
 * [S3b] Va en la intro (`Intro`), sobre la tapa y sin panel: la sección es transparente y llena lo que queda de la pantalla debajo del
 * encabezado. Todo entra por línea con el canal del texto del home.
 *
 * Dónde se apoya el bloque: abajo, por debajo de 1025, como el titular del hero del home; desde 1025, arriba. El revelado del home
 * llega cuando la caja queda 240 px por encima del pie del cuadro (`ventana-visible`), y con el bloque apoyado abajo la bajada
 * cargaría a medio revelar. Por debajo de 1025 no hay revelado y el texto sale quieto.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { MarcaDeSeccion } from '../../_secciones/_contrato/Rotulo'
import { TitularQueEntra } from '../movimiento/TitularQueEntra'
import type { Servicio } from '../tipos'
import { idDelTituloDe } from './Bloque'

export function Problema({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  const idDelTitulo = idDelTituloDe('problema')
  return (
    <section
      data-bloque="problema"
      aria-labelledby={idDelTitulo}
      className="flex flex-1 flex-col justify-end py-12 escritorio:justify-start escritorio:py-20"
    >
      <Envoltorio>
        <div className="flex flex-col gap-6 escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
          <MarcaDeSeccion className="escritorio:col-span-12" />
          <TitularQueEntra
            id={idDelTitulo}
            texto={servicio.nombre}
            nivel="titulo-xl"
            como="h1"
            className="text-balance"
            claseDelBloque="block w-full escritorio:col-span-10"
          />
          <div data-pieza="bajada-de-la-intro" className="flex flex-col gap-3 escritorio:col-span-7">
            <TitularQueEntra
              texto={servicio.problema.titulo}
              tipo="parrafo"
              nivel="titulo-m"
              como="p"
              className="text-balance"
              claseDelBloque="block w-full"
            />
            <TitularQueEntra
              texto={servicio.problema.texto}
              tipo="parrafo"
              nivel="titulo-s"
              como="p"
              peso="liviano"
              className="text-tinta-media"
              claseDelBloque="block w-full"
            />
          </div>
        </div>
      </Envoltorio>
    </section>
  )
}
