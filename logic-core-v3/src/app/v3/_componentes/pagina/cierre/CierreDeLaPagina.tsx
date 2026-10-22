'use client'

import { ATRIBUTO_DEL_CIERRE_DE_NOCHE, ATRIBUTO_DEL_CIERRE_DE_PAGINA, PARTES_DEL_CIERRE } from '../../../_lib/escena/ruta/atributoDelCierre'
import type { PresetDeLaEscena } from '../../../_lib/escena/ruta/preset'
import { ModoDelPieForzado } from '../../../_lib/pie3d/registro'
import { CompuertaDelHome } from '../../../_secciones/CompuertaDelHome'
import { ATRIBUTO_DE_SERVICIO } from '../../../_secciones/_contrato/acento'
import { PrecargaDelCta } from '../../ctaDelFinal/CtaDelFinal'
import { FaqDelPie } from '../../faq/FaqDelPie'
import type { PreguntaFrecuente } from '../../faq/preguntas'

import { PieDelCierre } from './PieDelCierre'
import { SeisRazonesDelCierre } from './SeisRazonesDelCierre'

/**
 * [B13] EL CIERRE DE UNA PÁGINA — la pieza común del home que cualquier página monta al final de su `<main>`, después del cuerpo en papel:
 *
 *   1 · **Seis razones** (`SeisRazonesDelCierre`): las mismas seis de develOP, con la misma entrada que en el home, y la frase que se
 *       transforma en el CTA (la transformación de B3, sin el aro de las reseñas). El CTA abre el contacto con el servicio de la página
 *       (`data-precarga`, el acento del preset: `PrecargaDelCta`).
 *   2 · **La resolución**: una pantalla de la sala sola. La escena le pasa a la variante de la página la señal del tramo del pie
 *       (`PropsDeLaVariante.resolucion`, 0 → 1): lo que movió se acomoda y el piso queda liso y calmo; la cámara va a la pose del pie.
 *   3 · **El pie** (`PieDelCierre`): el del home, plano, que llega recién con el piso calmo.
 *   4 · [B10] **El FAQ, después del pie** (`FaqDelPie`), con las preguntas de la página: desde 1024, en la pantalla del pie con gatillo
 *       (las columnas del pie se hunden y nacen sus bloques); abajo, en lista. Sin preguntas, no hay FAQ.
 *
 * La escena es la de la página (su preset y su variante): el preset declara este bloque en `tramos.pie` (`SELECTOR_DEL_CIERRE`), que la
 * despierta, y la escena hace sobre él el final del home (`_lib/escena/ruta/cierreDeLaPagina.ts`). De noche, el texto va en los claros (la
 * sección invertida, como la intro) y lo que la escena escribe (la frase en volumen y el CTA), en papel. Abajo de 1024, el modo plano: la
 * lista y el pie apilado, como el home a ese ancho. Cómo se monta: `docs/rediseno/B12a-API.md` §8.
 */
/** [B10] El pie del cierre, para el FAQ (el foco ahí lo saca; sus columnas se hunden). */
const SELECTOR_DEL_PIE_DEL_CIERRE = `[${ATRIBUTO_DEL_CIERRE_DE_PAGINA}] [data-parte="${PARTES_DEL_CIERRE.pie}"]`

export function CierreDeLaPagina({ preset, preguntas = [] }: { readonly preset: PresetDeLaEscena; readonly preguntas?: readonly PreguntaFrecuente[] }): React.JSX.Element {
  const deNoche = preset.noche === 'noche'
  return (
    <div
      {...{ [ATRIBUTO_DEL_CIERRE_DE_PAGINA]: preset.id }}
      {...(deNoche ? { [ATRIBUTO_DEL_CIERRE_DE_NOCHE]: '' } : {})}
      {...(preset.acento === null ? {} : { [ATRIBUTO_DE_SERVICIO]: preset.acento })}
      data-seccion={deNoche ? 'invertida' : undefined}
      className="relative text-tinta"
    >
      <CompuertaDelHome>
        <PrecargaDelCta.Provider value={preset.acento}>
          <SeisRazonesDelCierre deNoche={deNoche} />
        </PrecargaDelCta.Provider>
        {/* La resolución: la sala sola, una pantalla (el bloque no tiene contenido: lo que pasa, pasa en la escena). */}
        <div data-parte={PARTES_DEL_CIERRE.resolucion} aria-hidden="true" className="h-svh" />
        <PieDelCierre />
        {/* El pie de una página es plano: el FAQ lo hunde en el DOM. */}
        <ModoDelPieForzado.Provider value="plano">
          <FaqDelPie preguntas={preguntas} pie={SELECTOR_DEL_PIE_DEL_CIERRE} />
        </ModoDelPieForzado.Provider>
      </CompuertaDelHome>
    </div>
  )
}
