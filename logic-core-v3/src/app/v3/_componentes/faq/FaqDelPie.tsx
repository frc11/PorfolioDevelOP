'use client'

import { useSyncExternalStore } from 'react'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { ModoDelPieForzado, useModoDelPie, usePieListo } from '../../_lib/pie3d/registro'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { FaqEnEscenario } from './FaqEnEscenario'
import { FaqEnLista } from './FaqEnLista'
import { datosEstructuradosDelFaq, jsonParaElScript, preguntasDelFaq, type PreguntaFrecuente } from './preguntas'

/**
 * [B10] EL FAQ, DESPUÉS DEL PIE, EN TODAS LAS PÁGINAS — lo monta el pie: el del home (`_secciones/cierre/Cierre.tsx`) y el del cierre de
 * una página (`_componentes/pagina/cierre/CierreDeLaPagina.tsx`), cada uno con sus preguntas.
 *
 *   · **Desde 1024 y con movimiento: el escenario** (`FaqEnEscenario`): en la pantalla del pie, con gatillo; el pie se hunde y nacen los
 *     dos bloques. En el servidor (y al hidratar) sale así, cerrado: no suma nada al documento ni se ve.
 *   · **Abajo de 1024 o con menos movimiento: la lista** (`FaqEnLista`), sin efectos y sin WhatsApp.
 *
 * En los dos, el texto entero en el HTML y en los datos estructurados de FAQ (`FAQPage`). Lo de adentro va siempre plano
 * (`ModoDelPieForzado`): sus bloques no son piezas del pie de volumen. `pie`: el selector del pie del que nace (el foco ahí lo saca y, si es
 * plano, sus columnas se hunden); `colgada`: la lista cuelga después del pie sin sumarle alto al layout (el home: ver `FaqEnLista`).
 */
export interface PropsDelFaq {
  readonly preguntas: readonly PreguntaFrecuente[]
  readonly pie: string
  readonly colgada?: boolean
}

const sinCambios = (): (() => void) => () => undefined

export function FaqDelPie({ preguntas, pie, colgada = false }: PropsDelFaq): React.JSX.Element | null {
  const hidratado = useSyncExternalStore(sinCambios, () => true, () => false)
  const ancho = useAnchoMinimo(CONSULTA_ESCENARIO)
  const reducido = useMovimientoReducido()
  // El pie del que nace: el de volumen (armado) lo hunde la escena; si no, este DOM.
  const volumen = useModoDelPie() === 'volumen'
  const pieListo = usePieListo()
  const lista = preguntasDelFaq(preguntas)
  if (lista.length === 0) return null
  const escenario = !hidratado || (ancho && !reducido)
  return (
    <>
      {/* Los datos son para el buscador: el lector no los anuncia (sin caja: no ocupa lugar en la grilla del pie). */}
      <div aria-hidden="true" className="hidden">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonParaElScript(datosEstructuradosDelFaq(lista)) }} />
      </div>
      <ModoDelPieForzado.Provider value="plano">
        {escenario ? <FaqEnEscenario preguntas={lista} pie={pie} volumen={volumen && pieListo} activo={hidratado} /> : <FaqEnLista preguntas={lista} colgada={colgada} />}
      </ModoDelPieForzado.Provider>
    </>
  )
}
