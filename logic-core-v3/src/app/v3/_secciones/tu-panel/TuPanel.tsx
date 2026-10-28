'use client'

import { useRef } from 'react'

import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { pantallasDe, type PropsDeSeccion } from '../_contrato/forma'
import { ContenidoDeSeccion, Seccion } from '../_contrato/Seccion'
import { PALABRA_DEL_TITULO, TARJETAS, TITULO } from './contenido'
import { CtaDelPanel } from './CtaDelPanel'
import { Fila } from './Fila'
import { ALTO_EN_EL_DOCUMENTO, CLASE_DE_LA_PALABRA_DEL_TITULO, CLASE_DEL_TITULO_ANGOSTO, LADOS, variablesDeLaSeccion } from './geometria'
import { TituloQueSePinta } from './TituloQueSePinta'
import { useTramoDelPanel } from './tramo'

/**
 * SECCIÓN 06 — TU PANEL. [B6] La sección del Panel (craneada el 2026-10-21):
 *
 *   1. el título «El panel donde controlás TODO», grande y de lado a lado, que se pinta de gris claro a tinta palabra por
 *      palabra con el scroll y termina con su centro en la mitad de la pantalla (`TituloQueSePinta`, `pintado.ts`); [C2 60b]
 *      detrás, pálida y disimulada, «Lo que nos distingue»; abajo de 1024, más grande y en tres renglones;
 *   2. un respiro;
 *   3. los tres módulos alternados (derecha, izquierda, derecha), cada uno con su palabra fundida, su título y su
 *      descripción del lado opuesto (`Fila`), y el candado de la rueda (`Tarjeta`, `candado.ts`);
 *   4. el CTA (`CtaDelPanel`).
 *
 * [C2 60b] Los espacios se achicaron (ítem 15) y la sección mide su contenido en todo ancho: el `<section>` se monta sin el
 * piso de la tabla (`ALTO_EN_EL_DOCUMENTO`) y se anota a la escena (`tramo.ts`), que sigue viendo los 700svh de antes.
 *
 * ⚠ Sin `CabeceraDeSeccion`: lo único que montaba acá era `MarcaDeSeccion`, el cuadradito de acento. Es una pieza
 * compartida por todas las secciones (`_contrato/Rotulo.tsx`), así que no se toca: esta sección no la monta.
 */
export function TuPanel({ seccion }: PropsDeSeccion): React.JSX.Element {
  const raiz = useRef<HTMLOListElement>(null)
  useTramoDelPanel(raiz, pantallasDe(seccion))
  return (
    <Seccion seccion={{ ...seccion, alto: ALTO_EN_EL_DOCUMENTO }} style={variablesDeLaSeccion()}>
      <ContenidoDeSeccion claseDeContenido="@container flex flex-col">
        {/* La cabecera (el título solo): adonde viaja «Panel» de la barra (`destinosDelViaje.ts`). Con el aire de arriba, el viaje
            la deja con su centro arriba de la mitad: llega pintada. */}
        <div className="shrink-0 pt-[var(--spacing-20)] escritorio:pt-[var(--aire-arriba)]">
          <div data-pieza="encabezado-del-panel" className="relative isolate">
            <span aria-hidden="true" data-pieza="palabra-del-titulo" className={CLASE_DE_LA_PALABRA_DEL_TITULO}>
              {`${PALABRA_DEL_TITULO[0]} `}
              <br data-corte="" className="escritorio:hidden" />
              {PALABRA_DEL_TITULO[1]}
            </span>
            <TituloQueSePinta renglones={TITULO} como="h2" id={idDelTitularDeSeccion(seccion.id)} className={CLASE_DEL_TITULO_ANGOSTO} />
          </div>
        </div>
        <div aria-hidden="true" data-pieza="respiro-del-panel" className="h-[var(--respiro-angosto)] shrink-0 escritorio:h-[var(--respiro)]" />
        <ol ref={raiz} data-pieza="modulos-del-panel" className="@container flex shrink-0 flex-col gap-y-[var(--entre-filas-angosto)] escritorio:gap-y-[var(--entre-filas)]">
          {TARJETAS.map((tarjeta, i) => (
            <Fila key={tarjeta.palabra} tarjeta={tarjeta} lado={LADOS[i]} />
          ))}
        </ol>
        <div aria-hidden="true" data-pieza="antes-del-cta" className="h-[var(--entre-filas-angosto)] shrink-0 escritorio:h-[var(--antes-del-cta)]" />
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
