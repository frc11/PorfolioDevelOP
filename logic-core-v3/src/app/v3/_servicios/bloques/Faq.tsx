/**
 * [SERVICIOS S1b] 8 · FAQ — las preguntas en acordeón (SPEC §5). `<details>`/`<summary>` del navegador: server, sin JS, con
 * teclado y con las respuestas en el HTML.
 *
 * Una pregunta sin respuesta (`null`: alguna parte no sale del SPEC, regla D9) es [a definir]: el marcador en desarrollo y,
 * en producción, la pregunta no se monta.
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { textoOMarcador } from '../formato'
import type { PreguntaFrecuente } from '../tipos'
import { Bloque } from './Bloque'

const TITULO = 'FAQ' // C2: provisorio (el nombre de SPEC §5)

interface FaqProps {
  readonly faq: readonly PreguntaFrecuente[]
  readonly enDesarrollo: boolean
}

export function Faq({ faq, enDesarrollo }: FaqProps): React.JSX.Element | null {
  const preguntas = faq.flatMap((item) => {
    const respuesta = textoOMarcador(item.respuesta, enDesarrollo)
    return respuesta === null ? [] : [{ pregunta: item.pregunta, respuesta }]
  })
  if (preguntas.length === 0) return null
  return (
    <Bloque nombre="faq" titulo={TITULO}>
      <div className="flex flex-col">
        {preguntas.map(({ pregunta, respuesta }) => (
          <details key={pregunta} className="border-b border-borde py-4">
            <summary className="cursor-pointer marker:text-acento">
              <Titular nivel="titulo-s" como="span">
                {pregunta}
              </Titular>
            </summary>
            <Cuerpo className="mt-3 max-w-[var(--breakpoint-tablet)] text-tinta-media">{respuesta}</Cuerpo>
          </details>
        ))}
      </div>
    </Bloque>
  )
}
