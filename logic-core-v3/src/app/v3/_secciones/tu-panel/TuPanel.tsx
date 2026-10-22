'use client'

import { useRef } from 'react'

import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import type { PropsDeSeccion } from '../_contrato/forma'
import { ContenidoDeSeccion, Seccion } from '../_contrato/Seccion'
import { useBanderasDelPanel } from './banderas'
import { TARJETAS, TITULO } from './contenido'
import { CtaDelPanel } from './CtaDelPanel'
import { Fila } from './Fila'
import { LADOS, variablesDeLaSeccion } from './geometria'
import { TituloQueSePinta } from './TituloQueSePinta'
import { useTramoDelPanel } from './tramo'

/**
 * SECCIÓN 06 — TU PANEL. [B6] La sección del Panel (craneada el 2026-10-21):
 *
 *   1. el título «El panel donde controlás TODO», grande y de lado a lado, que se pinta de gris claro a tinta palabra por
 *      palabra con el scroll y termina con su centro en la mitad de la pantalla (`TituloQueSePinta`, `pintado.ts`);
 *   2. un respiro (el único tramo que crece: la sección llena los 700svh de la tabla en todo escritorio);
 *   3. los tres módulos alternados (derecha, izquierda, derecha), cada uno con su palabra fundida, su título y su
 *      descripción del lado opuesto (`Fila`), y el candado de la rueda (`Tarjeta`, `candado.ts`);
 *   4. el CTA a pantalla completa (`CtaDelPanel`).
 *
 * En el teléfono, todo apilado. Abajo de 1024 la sección mide su contenido y se anota a la escena (`tramo.ts`).
 *
 * ⚠ Sin `CabeceraDeSeccion`: lo único que montaba acá era `MarcaDeSeccion`, el cuadradito de acento. Es una pieza
 * compartida por todas las secciones (`_contrato/Rotulo.tsx`), así que no se toca: esta sección no la monta.
 */
export function TuPanel({ seccion }: PropsDeSeccion): React.JSX.Element {
  const { grupo, palabra } = useBanderasDelPanel()
  const raiz = useRef<HTMLOListElement>(null)
  useTramoDelPanel(raiz)
  return (
    <Seccion seccion={seccion} style={variablesDeLaSeccion(seccion.alto)}>
      <ContenidoDeSeccion claseDeContenido="@container flex flex-col escritorio:min-h-[var(--alto-de-la-tabla)]">
        {/* La cabecera (el título solo): adonde viaja «Panel» de la barra (`destinosDelViaje.ts`). Con el aire de arriba, el viaje
            la deja con su centro arriba de la mitad: llega pintada. */}
        <div className="shrink-0 pt-[var(--spacing-20)] escritorio:pt-[var(--aire-arriba)]">
          <div data-pieza="encabezado-del-panel">
            <TituloQueSePinta renglones={TITULO} como="h2" id={idDelTitularDeSeccion(seccion.id)} />
          </div>
        </div>
        <div aria-hidden="true" data-pieza="respiro-del-panel" className="h-[var(--respiro-angosto)] shrink-0 escritorio:h-auto escritorio:min-h-[var(--respiro)] escritorio:grow" />
        <ol ref={raiz} data-pieza="modulos-del-panel" className="@container flex shrink-0 flex-col gap-y-[var(--entre-filas-angosto)] escritorio:gap-y-[var(--entre-filas)]">
          {TARJETAS.map((tarjeta, i) => (
            <Fila key={tarjeta.palabra} tarjeta={tarjeta} lado={LADOS[i]} grupo={grupo} palabra={palabra} />
          ))}
        </ol>
        <div aria-hidden="true" className="h-[var(--entre-filas-angosto)] shrink-0 escritorio:h-[var(--entre-filas)]" />
        <CtaDelPanel />
      </ContenidoDeSeccion>
    </Seccion>
  )
}

/** Cuántas piezas anima cada patrón (con la coreografía). Es lo que el instrumento cuenta en el HTML. */
export const PIEZAS_POR_PATRON = {
  /** Los títulos que suben: el título y la descripción de cada módulo. */
  P1: 2 * TARJETAS.length,
  /** La llegada de cada módulo y de cada palabra fundida. */
  P2: 2 * TARJETAS.length,
} as const
