/**
 * [SERVICIOS S1b/S3] 8 · FAQ — las preguntas en acordeón (SPEC §5). `<details>`/`<summary>` del navegador: server, sin JS, con
 * teclado (Enter y Espacio abren y cierran, y el anillo de foco es el de la regla global) y con las respuestas en el HTML, también
 * cerradas.
 *
 * El marcado es el que un lector de pantalla recorre bien: una LISTA de preguntas (`ul` con `role="list"`, que conserva su
 * semántica sin viñetas), cada `li` con UN `<details>` y su `<summary>` primero, que lleva solo la pregunta; la respuesta va
 * después, en su párrafo. Sin `aria-expanded` ni `tabindex` propios: el elemento nativo ya los resuelve, y ponerlos encima es
 * pisarlos. Lo que se lee acá es lo mismo que sale en el JSON-LD `FAQPage` (`seo.ts`): pregunta y respuesta, palabra por palabra.
 *
 * Una pregunta sin respuesta (`null`: alguna parte no sale del SPEC, regla D9) es [a definir]: el marcador en desarrollo y,
 * en producción, la pregunta no se monta (y tampoco sale en el JSON-LD).
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
      <ul role="list" className="flex flex-col">
        {preguntas.map(({ pregunta, respuesta }) => (
          <li key={pregunta} className="border-b border-borde py-4">
            <details>
              <summary className="cursor-pointer marker:text-acento">
                <Titular nivel="titulo-s" como="span">
                  {pregunta}
                </Titular>
              </summary>
              <Cuerpo className="mt-3 max-w-[var(--breakpoint-tablet)] text-tinta-media">{respuesta}</Cuerpo>
            </details>
          </li>
        ))}
      </ul>
    </Bloque>
  )
}
