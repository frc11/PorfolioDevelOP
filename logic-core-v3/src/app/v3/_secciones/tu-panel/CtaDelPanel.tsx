'use client'

import { AvisoDeScroll } from '../../_componentes/avisos/AvisoDeScroll'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { Gatillo } from '../_contrato/Gatillo'
import { BotonDeProbar } from './BotonDeProbar'
import { CTA, NEWSLETTER } from './contenido'
import { NewsletterDelPanel } from './NewsletterDelPanel'
import { TituloQueSePinta } from './TituloQueSePinta'

/**
 * [B6] EL CTA DE TU PANEL, A PANTALLA COMPLETA, sobre el papel (la escena no entra: la sección es papel opaco hasta su fin). [C2 · 60c]
 * Rehecho con la captura `lote2/01` y el ítem 15 de la revisión:
 *
 *   1. arriba, el titular «Tu panel crece con vos.» con el pintado del título; debajo, la bajada nueva, un poco más grande;
 *   2. dos columnas separadas por una línea vertical que en el medio se corta y deja «o si no» en el hueco:
 *      · izquierda: «Probar el panel» (grande, menos que el titular), su texto con «acá.» SOLO en el último renglón (un bloque propio:
 *        lo fuerza la estructura, no el ancho), una flecha punteada que baja y señala el botón, y el botón grande (`BotonDeProbar`);
 *      · derecha: «Suscribite a las novedades», su texto y el form chico (`NewsletterDelPanel`);
 *   3. abajo de todo, el aviso de scroll («Seguí bajando, que todavía hay más»).
 *
 * Abajo de 1024 (teléfono y tablet), una columna: la bajada; «Probar el panel» con su botón; el divisor acostado con «o si no»; las
 * novedades; el aviso. La bajada, las dos columnas y el divisor entran con el gatillo del contrato DESDE ABAJO (al cruzar la línea,
 * en su lugar; se van en espejo al volver a subir), como el resto del sitio: el deslizamiento lateral se fue.
 */
/** [L4] Abajo de 1024 los títulos de las dos columnas («Probar el panel», «Suscribite a las novedades») más grandes: de ~32 px a un fluido de 36 a 52. */
const TITULO_DE_LA_COLUMNA_EN_EL_TELEFONO = 'max-escritorio:text-[length:var(--titulo-de-la-columna-angosto)]'

export function CtaDelPanel(): React.JSX.Element {
  return (
    <div data-pieza="cta-del-panel" className="flex min-h-svh flex-col items-center justify-center gap-[var(--spacing-8)] py-[var(--spacing-12)]">
      <TituloQueSePinta renglones={CTA.titular} como="h3" className="w-full" />
      <Gatillo desde="abajo" className="w-full">
        <p data-pieza="bajada-del-cta" className="font-cuerpo text-fluido-titulo-s leading-texto text-tinta-media mx-auto max-w-[var(--medida-de-la-bajada)] text-center">
          {CTA.bajada}
        </p>
      </Gatillo>
      <div data-pieza="fila-del-cta" className="mt-[var(--spacing-4)] flex w-full flex-col items-center gap-[var(--spacing-8)] escritorio:flex-row escritorio:items-stretch escritorio:gap-[var(--spacing-12)]">
        <Gatillo desde="abajo" className="w-full escritorio:flex-1">
          <div data-pieza="columna-probar" className="mx-auto flex max-w-[var(--ancho-del-formulario)] flex-col items-center gap-[var(--spacing-4)] text-center">
            <Titular nivel="titulo-l" como="h4" className={TITULO_DE_LA_COLUMNA_EN_EL_TELEFONO}>
              {CTA.probar.titulo}
            </Titular>
            <Cuerpo className="text-tinta-media">
              {/* Un solo nodo de texto con su espacio: «Probala acá.» se anuncia de corrido. */}
              {`${CTA.probar.texto} `}
              <span data-parte="remate-del-texto" className="text-tinta font-medio block">
                {CTA.probar.remate}
              </span>
            </Cuerpo>
            <FlechaPunteada />
            <BotonDeProbar />
          </div>
        </Gatillo>
        <Gatillo desde="abajo" className="flex w-full flex-col escritorio:w-auto escritorio:flex-row escritorio:self-stretch">
          <Divisor />
        </Gatillo>
        <Gatillo desde="abajo" className="w-full escritorio:flex-1">
          <div data-pieza="columna-novedades" className="mx-auto flex max-w-[var(--ancho-del-formulario)] flex-col items-center gap-[var(--spacing-4)] text-center">
            <Titular nivel="titulo-m" como="h4" className={TITULO_DE_LA_COLUMNA_EN_EL_TELEFONO}>
              {NEWSLETTER.titulo}
            </Titular>
            <Cuerpo className="text-tinta-media">{NEWSLETTER.texto}</Cuerpo>
            <NewsletterDelPanel />
          </div>
        </Gatillo>
      </div>
      <AvisoDeScroll texto={CTA.aviso} className="mt-[var(--spacing-8)]" />
    </div>
  )
}

/**
 * El divisor: dos tramos de línea con «o si no» en el hueco del medio. En escritorio, vertical y del alto de las columnas; abajo de
 * 1024, acostado y de lado a lado.
 */
function Divisor(): React.JSX.Element {
  const tramo = 'bg-borde-fuerte h-px flex-1 escritorio:h-auto escritorio:w-px'
  return (
    <div data-pieza="o-del-cta" className="flex w-full items-center gap-[var(--spacing-4)] escritorio:h-full escritorio:w-auto escritorio:flex-col">
      <span aria-hidden="true" data-parte="tramo" className={tramo} />
      <p className="text-cuerpo leading-texto text-tinta-media whitespace-nowrap">{CTA.o}</p>
      <span aria-hidden="true" data-parte="tramo" className={tramo} />
    </div>
  )
}

/**
 * La flecha punteada que sale del texto y señala el botón. [L4] Rehecha: una sola curva en S suave (sale a la izquierda, gira y baja
 * derecho al botón), a tamaño real (1 unidad = 1 px: sin escalas que desparejen los puntos), puntos redondos a paso fijo, y una punta
 * en V que mira en el sentido en que termina el trazo (hacia abajo, al botón).
 */
function FlechaPunteada(): React.JSX.Element {
  return (
    <svg data-pieza="flecha-punteada" viewBox="0 0 120 100" width="120" height="100" fill="none" aria-hidden="true" focusable="false" className="text-tinta-media block overflow-visible">
      <path d="M 22 4 C 108 6, 60 46, 60 84" stroke="currentColor" strokeWidth={2.5} strokeDasharray="0 9" strokeLinecap="round" />
      <path d="M 50 86 L 60 98 L 70 86" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
