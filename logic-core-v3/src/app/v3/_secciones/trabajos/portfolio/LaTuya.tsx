'use client'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'

import { TIRA_DE_LA_TUYA } from './estado'
import { PROPORCION_DEL_MEDIO } from './medios'
import { pasoDeLaPortada } from './pasos'
import { CLASES_DE_LA_TIRA, CabeceraDeLaTira, idsDeLaTira } from './Tira'
import type { PortfolioVivo } from './usePortfolio'

/** El elemento cuyo rectángulo ocupa el «?» 3D: lo dibuja la escena con un pase con scissor (`_lib/escena/SignoDeLaTuya.tsx`). */
export const ATRIBUTO_DEL_SIGNO = 'data-signo-de-la-tuya'

/**
 * El hueco del «?»: transparente (deja ver el lienzo, donde la escena dibuja el signo) y con una sombra del color de la tira que
 * pinta TODO lo demás de la tira (la tira recorta: `overflow-clip`). Así la tira no lleva fondo propio mientras está activa.
 */
const CLASE_DEL_HUECO = 'w-full shadow-[0_0_0_100vmax_var(--color-fondo)]'

/**
 * [B1] «LA PRÓXIMA ES LA TUYA» — la última tira (plan §5.5). El «?» satinado gira despacio en el hueco de arriba (lo pinta la
 * escena, sin un contexto nuevo); abajo, la frase y el botón que abre la hoja de contacto de siempre (`data-abre-contacto="panel"`,
 * `_chrome/contacto/apertura.ts`): no hay un modal nuevo. Sin desenfoque en ningún material (taparía al «?»): con `vidrio` esta tira
 * va con el negro de la marca, que es el color con el que la escena limpia el hueco.
 */
export function LaTuya({ activa, vivo }: { readonly activa: boolean; readonly vivo: PortfolioVivo }): React.JSX.Element {
  const ids = idsDeLaTira('la-tuya')
  const c = CONTENIDO.laTuya
  return (
    <div data-tira="la-tuya" data-activa={activa} className={cn(CLASES_DE_LA_TIRA.base, activa ? CLASES_DE_LA_TIRA.activa : cn(CLASES_DE_LA_TIRA.lomo, CLASES_DE_LA_TIRA.material.tinta))}>
      <div id={ids.medio} hidden={!activa} className="px-8 pt-12">
        <div {...{ [ATRIBUTO_DEL_SIGNO]: '' }} aria-hidden="true" className={CLASE_DEL_HUECO} style={{ aspectRatio: PROPORCION_DEL_MEDIO }} />
      </div>
      <CabeceraDeLaTira id={ids.cabecera} indice={TIRA_DE_LA_TUYA} activa={activa} nombre={c.nombre} controla={`${ids.medio} ${ids.region}`} alElegir={() => vivo.saltarAlPaso(pasoDeLaPortada(TIRA_DE_LA_TUYA))} />
      <div id={ids.region} hidden={!activa} className="flex min-h-0 flex-1 flex-col gap-6 px-8 pb-12 pt-2">
        <Titular nivel="titulo-m" como="p">{c.frase}</Titular>
        <Cuerpo className="text-tinta/70">{c.bajada}</Cuerpo>
        <button
          type="button"
          data-abre-contacto="panel"
          className="mt-auto self-start font-titulo text-tinta underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {c.boton}
        </button>
      </div>
    </div>
  )
}
