'use client'

import { Cta } from '../_componentes/chrome/Cta'
import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { CompuertaDelHome } from '../_secciones/CompuertaDelHome'
import { CanalDeUnaPieza } from '../_secciones/_contrato/canales'
import { Bloque } from '../_secciones/_contrato/coreografia'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { conLlave } from '../_secciones/_contrato/inventado'

import { RELLENO_DE_LA_BASE } from './relleno'

/**
 * [B12a.8] EL CUERPO DE LA PÁGINA BASE — el papel, después de la intro: tres secciones de ejemplo con las piezas del home y el lugar del pie.
 * Envuelto en la compuerta del home (`CompuertaDelHome`): la coreografía se instala desde 1024 y con movimiento (el gatillo, en todo
 * ancho); sin ella, todo a la vista y quieto. Cada sección muestra una cosa:
 *   1 · un REVELADO PROGRESIVO: el bloque sigue al scroll (`Bloque` con el patrón P2 en su ventana visible y su canal);
 *   2 · el GATILLO COMÚN: entra entero al cruzar la línea de disparo y se va en espejo al subir (`Gatillo`);
 *   3 · el CIERRE: un CTA que abre el contacto con el servicio marcado (`data-abre-contacto="panel"` y `data-precarga`) y un enlace a otra
 *       página de `/v3` (`EnlaceDeRuta`: pide la salida de la variante y el velo antes de navegar).
 * Después, el lugar del pie genérico (B13, provisorio). Los títulos de sección dicen qué pieza muestran; los textos son relleno detrás de
 * la llave.
 */
const SECCION = 'bg-fondo text-tinta relative'
const CONTENIDO = 'flex flex-col gap-[var(--spacing-6)] py-[var(--spacing-20)]'

export function CuerpoDeLaBase(): React.JSX.Element {
  return (
    <CompuertaDelHome>
      <section data-ejemplo="progresivo" className={SECCION}>
        <Envoltorio claseDeContenido={CONTENIDO}>
          <EtiquetaDeSeccion sangria={false}>Ejemplo 1 · revelado progresivo</EtiquetaDeSeccion>
          <Bloque patron="P2" rango="ventana-visible" className="flex max-w-[48ch] flex-col gap-[var(--spacing-4)]">
            {(progreso) => (
              <CanalDeUnaPieza progreso={progreso} patron="P2" className="flex flex-col gap-[var(--spacing-4)]">
                <Titular nivel="titulo-l" como="h2">
                  Una sección que sigue al scroll
                </Titular>
                <Cuerpo>{conLlave(RELLENO_DE_LA_BASE.progresivo)}</Cuerpo>
              </CanalDeUnaPieza>
            )}
          </Bloque>
        </Envoltorio>
      </section>
      <section data-ejemplo="gatillo" className={SECCION}>
        <Envoltorio claseDeContenido={CONTENIDO}>
          <EtiquetaDeSeccion sangria={false}>Ejemplo 2 · el gatillo común</EtiquetaDeSeccion>
          <Gatillo className="flex max-w-[48ch] flex-col gap-[var(--spacing-4)]">
            <Titular nivel="titulo-l" como="h2">
              Una sección que entra entera
            </Titular>
            <Cuerpo>{conLlave(RELLENO_DE_LA_BASE.gatillo)}</Cuerpo>
          </Gatillo>
        </Envoltorio>
      </section>
      <section data-ejemplo="cierre" className={SECCION}>
        <Envoltorio claseDeContenido={CONTENIDO}>
          <EtiquetaDeSeccion sangria={false}>Ejemplo 3 · el cierre</EtiquetaDeSeccion>
          <Titular nivel="titulo-l" como="h2">
            Un CTA que abre el contacto
          </Titular>
          <Cuerpo className="max-w-[48ch]">{conLlave(RELLENO_DE_LA_BASE.cierre)}</Cuerpo>
          {/* El contacto abre con el servicio de la página marcado (`data-precarga`, el id del servicio). */}
          <div data-pieza="cta-de-la-base" data-abre-contacto="panel" data-precarga="web" className="self-start">
            <Cta rotulo="Hablemos" />
          </div>
          {/* La salida de la variante: el enlace pide la señal (P-H29d) y el velo juntos, y navega con la página quieta (el lienzo sigue). */}
          <EnlaceDeRuta href="/v3" className="self-start underline underline-offset-4">
            Volver al home (la salida de la variante)
          </EnlaceDeRuta>
        </Envoltorio>
      </section>
      {/* [B13] El lugar del pie genérico de las páginas (con la escena y la variante, como el del home): provisorio hasta B13. */}
      <section data-pie-de-pagina="provisorio" className="bg-tinta text-fondo relative">
        <Envoltorio claseDeContenido="py-[var(--spacing-20)]">
          <Cuerpo>[PIE DE LA PÁGINA] El pie genérico de las páginas llega con B13.</Cuerpo>
        </Envoltorio>
      </section>
    </CompuertaDelHome>
  )
}
