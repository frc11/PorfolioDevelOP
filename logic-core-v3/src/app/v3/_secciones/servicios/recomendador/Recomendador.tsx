'use client'

import { useId, useState } from 'react'

import { Cta } from '../../../_componentes/chrome/Cta'
import { CLASE_DE_LA_PILDORA, ErrorDelCampo } from '../../../_componentes/formularios/Campos'
import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { servicioDe, type IdDeServicio } from '../../_contrato/acento'
import { EnlaceDelServicio, nombreDelServicio } from '../escenario/PanelDeServicio'
import { PREGUNTAS_DEL_RECOMENDADOR, servicioRecomendado } from './preguntas'

/**
 * [B4] EL RECOMENDADOR — después de los tres servicios, sin gatillo y con scroll normal. A la izquierda, «¿No sabés qué servicio
 * elegir?» y su texto; a la derecha, unas preguntas sobre los problemas del cliente (a redactar: van con la llave del contenido
 * inventado) y el servicio recomendado, con el CTA a su página (el viaje: `EnlaceDelServicio`) o el contacto con el servicio
 * precargado (`data-abre-contacto="panel"` + `data-precarga`). No manda nada a ningún lado: se resuelve en la página.
 */

export const TITULO_DEL_RECOMENDADOR = '¿No sabés qué servicio elegir?'
export const TEXTO_DEL_RECOMENDADOR = 'No te preocupes: preparamos un formulario que, a partir de tus problemas, nos deja ofrecerte la mejor solución.'
export const FALTAN_RESPUESTAS = 'Contestá las tres preguntas para ver qué te recomendamos.'

export function Recomendador(): React.JSX.Element {
  const id = useId()
  const [respuestas, setRespuestas] = useState<readonly (IdDeServicio | null)[]>(PREGUNTAS_DEL_RECOMENDADOR.map(() => null))
  const [pedido, setPedido] = useState(false)
  const recomendado = servicioRecomendado(respuestas)
  const faltan = pedido && recomendado === null
  const elegir = (i: number, servicio: IdDeServicio): void => setRespuestas((antes) => antes.map((r, k) => (k === i ? servicio : r)))

  return (
    <div data-pieza="recomendador" className="mx-auto grid w-full max-w-[var(--container-tope)] grid-cols-1 items-start gap-[var(--spacing-12)] px-[var(--pad-lateral-compacto)] py-[var(--spacing-20)] escritorio:min-h-svh escritorio:grid-cols-2 escritorio:items-center">
      <div className="flex flex-col gap-[var(--spacing-4)]">
        <Titular nivel="titulo-l" como="h3">
          {TITULO_DEL_RECOMENDADOR}
        </Titular>
        <Cuerpo className="text-tinta-media">{TEXTO_DEL_RECOMENDADOR}</Cuerpo>
      </div>
      {/* Sin nombre propio: no es una región (el documento ya tiene sus landmarks); cada pregunta se nombra por su `legend`. */}
      <form
        noValidate
        className="flex flex-col gap-[var(--spacing-6)]"
        onSubmit={(e) => {
          e.preventDefault()
          setPedido(true)
        }}
      >
        {PREGUNTAS_DEL_RECOMENDADOR.map((pregunta, i) => (
          <fieldset key={`pregunta-${String(i)}`} className="flex flex-col gap-[var(--spacing-2)]" aria-describedby={faltan && respuestas[i] === null ? `${id}-falta` : undefined}>
            <legend className="font-cuerpo text-cuerpo leading-texto font-semi mb-[var(--spacing-2)]">{pregunta.texto}</legend>
            {pregunta.opciones.map((opcion) => {
              const campo = `${id}-pregunta-${String(i)}-${opcion.servicio}`
              return (
                // Con `id` y `for`: el nombre accesible sale del rótulo (lo leen los instrumentos de s10), como en los campos del sitio.
                <label key={opcion.servicio} htmlFor={campo} data-foco="pastilla" className={`${CLASE_DE_LA_PILDORA} text-cuerpo cursor-pointer`}>
                  <input id={campo} type="radio" name={`${id}-pregunta-${String(i)}`} value={opcion.servicio} checked={respuestas[i] === opcion.servicio} onChange={() => elegir(i, opcion.servicio)} />
                  <span>{opcion.texto}</span>
                </label>
              )
            })}
          </fieldset>
        ))}
        <div className="flex flex-col items-start gap-[var(--spacing-2)]">
          <Cta rotulo="Ver qué me recomiendan" type="submit" />
          <ErrorDelCampo id={`${id}-falta`} texto={faltan ? FALTAN_RESPUESTAS : undefined} />
        </div>
        <div role="status" aria-live="polite">
          {pedido && recomendado !== null ? <Resultado servicio={recomendado} /> : null}
        </div>
      </form>
    </div>
  )
}

function Resultado({ servicio }: { readonly servicio: IdDeServicio }): React.JSX.Element {
  return (
    <div data-pieza="resultado-del-recomendador" data-servicio={servicio} className="flex flex-col gap-[var(--spacing-4)] border-t border-borde pt-[var(--spacing-6)]">
      <Cuerpo>
        Te recomendamos <strong className="text-acento font-semi">{nombreDelServicio(servicioDe(servicio))}</strong>.
      </Cuerpo>
      <div className="flex flex-wrap items-center gap-[var(--spacing-6)]">
        <EnlaceDelServicio id={servicio} />
        <div data-abre-contacto="panel" data-precarga={servicio}>
          <Cta rotulo="Prefiero contarles mi caso" />
        </div>
      </div>
    </div>
  )
}
