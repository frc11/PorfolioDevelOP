/**
 * [SERVICIOS M1] 6 · TRABAJOS — el slot del video (M0 §4). Reemplaza a la sección de casos con pósters, que se fue.
 *
 * El video no existe todavía (lo graba y lo monta el M3): hasta entonces el slot es su marcador, que en desarrollo se ve y en
 * producción no se monta. Lo que el slot sigue llevando es lo que la sección vieja tenía y NO es un caso:
 *   · en IA, «Probá el panel» (el `CtaEnlace` del home a `/login`, D11), que en la réplica va con la demo del panel;
 *   · en Software, su nota («2 sistemas más en desarrollo»).
 * Ningún caso de Páginas web aparece en las otras dos páginas: los trabajos de cada servicio van en su «Cómo trabajamos».
 *
 * Entra con el GATILLO (la tabla del M0). Si no queda nada que mostrar, el bloque no existe.
 */

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { textoOMarcador } from '../formato'
import type { Prueba } from '../tipos'
import { Bloque } from './Bloque'

const TITULO = 'Trabajos' // C2: provisorio (el texto del video lo dicta Valentino, D6)
const ROTULO_DEL_VIDEO = 'Video de trabajos' // C2: provisorio

interface TrabajosProps {
  readonly prueba: Prueba
  readonly enDesarrollo: boolean
}

export function Trabajos({ prueba, enDesarrollo }: TrabajosProps): React.JSX.Element | null {
  // El montaje del M3 todavía no existe: es un dato que falta, con el marcador en desarrollo y nada en producción.
  const marcadorDelVideo = textoOMarcador(null, enDesarrollo)
  const { ctaPanel } = prueba
  const hayPanel = ctaPanel !== null && (ctaPanel.href !== null || textoOMarcador(null, enDesarrollo) !== null)
  if (marcadorDelVideo === null && prueba.nota === null && !hayPanel) return null
  return (
    <Bloque nombre="trabajos" titulo={TITULO} panel="gatillo">
      <div className="flex flex-col gap-8">
        {marcadorDelVideo === null ? null : <Cuerpo className="text-tinta-media">{`${ROTULO_DEL_VIDEO}: ${marcadorDelVideo}`}</Cuerpo>}
        {prueba.nota === null ? null : <Cuerpo className="text-tinta-media">{prueba.nota}</Cuerpo>}
        {hayPanel ? <PanelDeLaDemo ctaPanel={ctaPanel} enDesarrollo={enDesarrollo} /> : null}
      </div>
    </Bloque>
  )
}

/** «Probá el panel» (IA): un enlace de verdad. Sin destino todavía ([a definir]) es solo un marcador de desarrollo. */
function PanelDeLaDemo({
  ctaPanel,
  enDesarrollo,
}: {
  readonly ctaPanel: NonNullable<Prueba['ctaPanel']>
  readonly enDesarrollo: boolean
}): React.JSX.Element | null {
  if (ctaPanel.href === null) {
    const marcador = textoOMarcador(null, enDesarrollo)
    return marcador === null ? null : <Cuerpo className="text-tinta-media">{`${ctaPanel.rotulo}: ${marcador}`}</Cuerpo>
  }
  return (
    <div>
      <CtaEnlace href={ctaPanel.href} rotulo={ctaPanel.rotulo} />
    </div>
  )
}
