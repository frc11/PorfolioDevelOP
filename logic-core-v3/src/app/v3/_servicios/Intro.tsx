/**
 * [SERVICIOS S3b · M1 · V1] LA INTRO — la primera parte de las tres páginas (contrato v4 §0: las páginas son «home-based»).
 *
 * [V1] Es la del home: `IntroDeLaPagina` (B12a-API §2), con su preset (`escena/presets.ts`). El home pone el bloque y servicios su
 * contenido adentro (D2):
 *   · el bloque mide 1,5 pantallas (`PANTALLAS_DE_LA_INTRO`), es transparente (se ve la escena, de noche, con su variante) y lleva
 *     `data-intro-de-pagina` con el id de la página (el selector del tramo de la escena: el avance se mide sobre él),
 *     `data-seccion="invertida"` (los claros, sobre la noche) y `data-servicio` con el acento (el tema pone su claro);
 *   · el `h1` es el NOMBRE del servicio («Páginas web»), siempre en el DOM: el mismo texto que el título 3D cuando llegue su preset
 *     (P-H14, B12a.4); hasta entonces es el que se ve;
 *   · la bajada, dos párrafos sin heading, literales de los datos: la entrada del problema (su título) y su texto. Fija arriba mientras dura
 *     la intro.
 * Se fueron, porque los pone el home: nuestro atributo (`data-intro-de-servicio`), nuestro alto de una pantalla, la tapa interina que
 * pintaba la noche y la marca de la sección.
 */

import { IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { PRESETS_DE_LAS_PAGINAS } from './escena/presets'
import type { Servicio } from './tipos'

export function Intro({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    <IntroDeLaPagina
      titulo={servicio.nombre}
      preset={PRESETS_DE_LAS_PAGINAS[servicio.idEnElHome]}
      bajada={
        <>
          <ParrafoDeLaBajada>{servicio.problema.titulo}</ParrafoDeLaBajada>
          <ParrafoDeLaBajada>{servicio.problema.texto}</ParrafoDeLaBajada>
        </>
      }
    />
  )
}
