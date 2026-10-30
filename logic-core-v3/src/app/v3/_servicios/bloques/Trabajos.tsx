/**
 * [SERVICIOS M1 · M3] 6 · TRABAJOS — el video de trabajos (M0 §4): los sitios de los clientes intercalados con las demos propias.
 *
 * Arma su propia caja (como `Problema`, el CTA del precio y `Cierre`): la `<section>` en papel, como todo el cuerpo, y adentro un
 * cuadro de una pantalla de alto con el video de fondo (`movimiento/VideoDeFondo`), el velo de tinta en degradé (D4,
 * `veloDelVideo.ts`) y el texto en `text-fondo` sobre el velo, abajo, donde el velo es más denso. Sin la marca del acento: sobre el
 * velo, el oscuro del servicio no pasa (M0 §4.7).
 *
 * El texto entero (el título y la línea) entra con el GATILLO, con su guarda en reposo: «gatillo para el texto» (M0 §2.3). El título
 * NO entra por línea como en los demás bloques: vive al pie de un cuadro de una pantalla, y el revelado por línea termina con el pie a
 * 240 px del borde de abajo, así que con el cuadro justo en pantalla quedaba a medio revelar (medido a 1440).
 *
 * [M3] Solo Páginas web tiene video. Software e IA no muestran este video ni ningún caso web: con `prueba.video` en `null` el slot no
 * se monta (su nota y «Probá el panel» quedan en los datos para la réplica).
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { VideoDeFondo } from '../movimiento/VideoDeFondo'
import type { Prueba } from '../tipos'
import { CLASES_DEL_PAPEL, idDelTituloDe } from './Bloque'
import { CLASES_DEL_VELO } from './veloDelVideo'

const TITULO = 'Trabajos' // C2: provisorio

export function Trabajos({ prueba }: { readonly prueba: Prueba }): React.JSX.Element | null {
  const { video } = prueba
  if (video === null) return null
  const idDelTitulo = idDelTituloDe('trabajos')
  return (
    <section data-bloque="trabajos" aria-labelledby={idDelTitulo} className={`${CLASES_DEL_PAPEL} pt-12 escritorio:pt-20`}>
      <Envoltorio>
        <div className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-tinta">
          <VideoDeFondo horizontal={video.horizontal} vertical={video.vertical}>
            <div aria-hidden="true" className={`absolute inset-0 ${CLASES_DEL_VELO}`} />
            {/* Por debajo de 1024 el texto llega hasta el borde derecho: `pb-20` le deja lugar al botón de pausa, abajo a la derecha. */}
            <Gatillo className="relative max-w-2xl p-6 pb-20 escritorio:p-12">
              <div className="flex flex-col gap-4">
                <Titular id={idDelTitulo} nivel="titulo-l" como="h2" className="text-balance text-fondo">
                  {TITULO}
                </Titular>
                <Cuerpo className="text-fondo">{video.linea}</Cuerpo>
              </div>
            </Gatillo>
          </VideoDeFondo>
        </div>
      </Envoltorio>
    </section>
  )
}
