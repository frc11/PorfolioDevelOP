'use client'

import { Cta } from '../../_componentes/chrome/Cta'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { Gatillo } from '../_contrato/Gatillo'
import { CTA, NEWSLETTER } from './contenido'
import { NewsletterDelPanel } from './NewsletterDelPanel'
import { TituloQueSePinta } from './TituloQueSePinta'

/**
 * [B6] EL CTA DE TU PANEL, A PANTALLA COMPLETA — el titular «Tu panel crece con vos.» con el mismo pintado y la misma letra
 * que el título; debajo, la bajada; y una fila: a la izquierda «Probar el panel», en el medio una «o» chiquita y a la
 * derecha el formulario de novedades (el que ya envía, redondeado como los formularios del sitio). En el teléfono, apilado:
 * el botón, la «o» y el formulario.
 *
 * El botón todavía no hace nada (es un `<button>`, sin enlace que se rompa): cuando exista la prueba (C1), se despliega
 * como el login y la carga. La bajada y la fila entran con el gatillo del contrato (al cruzar la línea, en su lugar; se van
 * en espejo al volver a subir).
 */
export function CtaDelPanel(): React.JSX.Element {
  return (
    <div data-pieza="cta-del-panel" className="flex min-h-svh flex-col items-center justify-center gap-[var(--spacing-8)] py-[var(--spacing-20)]">
      <TituloQueSePinta renglones={CTA.titular} como="h3" className="w-full" />
      <Gatillo className="w-full">
        <div className="flex w-full flex-col items-center gap-[var(--spacing-12)]">
          <Cuerpo className="text-tinta-media max-w-[var(--medida-de-la-bajada)] text-center">{CTA.bajada}</Cuerpo>
          <div data-pieza="fila-del-cta" className="flex w-full flex-col items-center gap-[var(--spacing-6)] escritorio:flex-row escritorio:items-end escritorio:justify-center escritorio:gap-[var(--spacing-12)]">
            <div data-pieza="probar-el-panel" className="escritorio:pb-[var(--spacing-4)]">
              <Cta rotulo={CTA.boton} variante="bloque" />
            </div>
            <p data-pieza="o-del-cta" className="text-caption leading-texto text-tinta-tenue escritorio:pb-[var(--spacing-6)]">
              {CTA.o}
            </p>
            <div data-pieza="newsletter-del-panel" className="flex w-full max-w-[var(--ancho-del-formulario)] flex-col gap-[var(--spacing-3)] text-left">
              <Titular nivel="titulo-s" como="p">
                {NEWSLETTER.titulo}
              </Titular>
              <NewsletterDelPanel />
            </div>
          </div>
        </div>
      </Gatillo>
    </div>
  )
}
