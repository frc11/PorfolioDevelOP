import { X } from 'lucide-react'
import type { Ref } from 'react'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'

import { TEXTO_DE_DEMOS, type Demo } from './catalogo'

/**
 * EL CROMO DE LA VENTANA DE UNA DEMO — el de la ventana del CTA: el semáforo, la
 * barra con la URL real y una cruz. **[DEMOS]**
 *
 * Uno solo para dos usos, así no pueden diferir en un píxel: la ventana viva lo
 * monta con sus controles (el rojo y la cruz cierran, la barra abre el template en
 * otra pestaña) y cada tira del Genie lo monta QUIETO —sin un botón ni un enlace—,
 * porque las tiras son una imagen partida y no una segunda ventana.
 */
export function CromoDeLaVentana({
  demo,
  alCerrar,
  refDelPrimerControl,
}: {
  readonly demo: Demo
  /** Sin él, el cromo es la copia quieta de una tira del Genie. */
  readonly alCerrar?: () => void
  readonly refDelPrimerControl?: Ref<HTMLButtonElement>
}): React.JSX.Element {
  const direccion = demo.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const semaforo = 'bg-semaforo-rojo block size-3 shrink-0 rounded-full'
  const barra = 'border-fondo rounded-sutil ml-4 min-w-0 flex-1 truncate border px-3 py-1 text-center'
  const cruz = 'ml-4 flex size-8 shrink-0 items-center justify-center rounded-full'
  const url = (
    <Cuerpo como="span" className="font-codigo">
      {direccion}
    </Cuerpo>
  )
  return (
    <div data-parte="cromo" className="flex shrink-0 items-center gap-2 px-5 py-4">
      {alCerrar === undefined ? (
        <span aria-hidden="true" className={semaforo} />
      ) : (
        <button ref={refDelPrimerControl} type="button" aria-label={TEXTO_DE_DEMOS.cerrar} onClick={alCerrar} className={semaforo} />
      )}
      <span aria-hidden="true" className="bg-semaforo-amarillo block size-3 shrink-0 rounded-full" />
      <span aria-hidden="true" className="bg-semaforo-verde block size-3 shrink-0 rounded-full" />
      {alCerrar === undefined ? (
        <span className={barra}>{url}</span>
      ) : (
        <a href={demo.url} target="_blank" rel="noopener noreferrer" className={barra}>
          {url}
        </a>
      )}
      {alCerrar === undefined ? (
        <span className={cruz}>
          <X aria-hidden="true" strokeWidth={1.5} className="size-5" />
        </span>
      ) : (
        <button type="button" aria-label={TEXTO_DE_DEMOS.cerrar} onClick={alCerrar} className={cruz}>
          <X aria-hidden="true" strokeWidth={1.5} className="size-5" />
        </button>
      )}
    </div>
  )
}
