/**
 * [SERVICIOS S3b · M1 · V1 · L7a] LA INTRO — la primera parte de las tres páginas: la del home (`IntroDeLaPagina`, B12a-API §2), con su
 * preset (`escena/presets.ts`). El home pone el bloque (su alto, su atributo, la sección invertida, `data-servicio`) y servicios su
 * contenido adentro:
 *   · el título es el NOMBRE del servicio: el `h1` del DOM y el título 3D, el mismo texto (P-H13);
 *   · la bajada, dos párrafos sin heading: la entrada del problema (su título) y su texto;
 *   · [L7a] «de qué se trata»: lo que hacemos, en una línea (`queHacemos.texto`); el cuerpo lo cuenta con detalle.
 */

import { IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'
import { PRESETS_DE_LAS_PAGINAS } from './escena/presets'
import type { Servicio } from './tipos'

const ETIQUETA_DE_QUE_SE_TRATA = 'De qué se trata'

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
      deQueSeTrata={
        <>
          <EtiquetaDeSeccion sangria={false}>{ETIQUETA_DE_QUE_SE_TRATA}</EtiquetaDeSeccion>
          <Cuerpo>{servicio.queHacemos.texto}</Cuerpo>
        </>
      }
    />
  )
}
