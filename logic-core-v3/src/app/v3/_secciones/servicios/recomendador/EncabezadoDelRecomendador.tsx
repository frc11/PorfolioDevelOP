'use client'

import type { CSSProperties } from 'react'

import { Gatillo } from '../../_contrato/Gatillo'
import { TituloQueSePintaAlLlegar, type Renglon } from '../escenario/TituloQueSePintaAlLlegar'
import { TEXTOS_DEL_RECOMENDADOR } from './logica'

/**
 * [C2-51] EL ENCABEZADO DEL RECOMENDADOR (ítem 14) — [L4] a la izquierda (un tercio del ancho desde 1024), centrado en alto contra el recomendador:
 *   · el título con la presencia de los títulos grandes del sitio: la letra y el pintado de «Nuestros servicios» y del Panel
 *     (`TituloQueSePintaAlLlegar`, la display en mayúsculas que se pinta de gris a tinta al quedar a la vista), en tres renglones;
 *   · debajo, el texto que explica para qué sirve, más grande que un párrafo (el registro de la bajada de Servicios, un escalón abajo),
 *     que se levanta en su lugar al cruzar la línea de disparo (`Gatillo` desde abajo, el de la entrada del CTA del Panel).
 */

/** El título en tres renglones parejos (la letra se ajusta al ancho del renglón más largo: `TAMANO_DEL_TITULO_DEL_RECOMENDADOR`). */
export const RENGLONES_DEL_TITULO_DEL_RECOMENDADOR: readonly Renglon[] = [{ palabras: ['¿No', 'sabés'] }, { palabras: ['qué', 'necesita'] }, { palabras: ['tu', 'negocio?'] }]

/**
 * El tamaño: el ancho del encabezado sobre `divisor` (el renglón más largo, «QUÉ NECESITA», mide unas 7,1 veces su cuerpo en la
 * display: entra con aire), con tope en `tope` svh, el de «Nuestros servicios».
 */
export const TAMANO_DEL_TITULO_DEL_RECOMENDADOR = { divisor: 8.4, tope: 11 } as const

const VARIABLES_DEL_TITULO = {
  '--divisor-del-titulo': String(TAMANO_DEL_TITULO_DEL_RECOMENDADOR.divisor),
  '--tope-del-titulo': `${String(TAMANO_DEL_TITULO_DEL_RECOMENDADOR.tope)}svh`,
} as CSSProperties

export const ID_DEL_TITULO_DEL_RECOMENDADOR = 'titulo-del-recomendador'

export function EncabezadoDelRecomendador(): React.JSX.Element {
  return (
    <div data-parte="encabezado-del-recomendador" className="@container flex flex-col gap-[var(--spacing-6)] escritorio:gap-[var(--spacing-8)]" style={VARIABLES_DEL_TITULO}>
      <TituloQueSePintaAlLlegar renglones={RENGLONES_DEL_TITULO_DEL_RECOMENDADOR} progreso={null} id={ID_DEL_TITULO_DEL_RECOMENDADOR} como="h3" className="text-left" />
      <Gatillo desde="abajo" className="max-w-[calc(var(--spacing-20)*9)]">
        <div data-parte="texto-del-recomendador" className="font-cuerpo text-fluido-titulo-s leading-texto text-tinta flex flex-col gap-[var(--spacing-4)]">
          {TEXTOS_DEL_RECOMENDADOR.parrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Gatillo>
    </div>
  )
}
