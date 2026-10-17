/**
 * [SERVICIOS S3] EL JSON-LD EN LA PÁGINA — un `<script type="application/ld+json">` por documento (`seo.ts`).
 *
 * Server, sin JS: el JSON va en el HTML servido, que es donde lo lee un buscador. El contenido es de los datos y pasa por
 * `serializarJsonLd`, que lo deja a salvo de cerrar la etiqueta; por eso es el único lugar donde la página usa
 * `dangerouslySetInnerHTML`. No es texto visible: no cambia lo que se lee ni el árbol de encabezados.
 */

import { jsonLdDe, serializarJsonLd } from './seo'
import type { Servicio } from './tipos'

export function JsonLd({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    <>
      {jsonLdDe(servicio).map((documento) => (
        <script
          key={String(documento['@type'])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(documento) }}
        />
      ))}
    </>
  )
}
