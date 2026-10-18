/**
 * [SERVICIOS S3b] LA INTRO — la primera pantalla de las tres páginas (contrato v4 §0: las páginas son «home-based»).
 *
 * La intro con la escena la hace el home en B12; servicios solo RESERVA el bloque: transparente (sin fondo propio), con el `h1` y
 * su bajada (`Problema`) y, arriba, el enlace al home (`Encabezado`). Se lee sobre la tapa interina, y el cuerpo, que es opaco, la
 * tapa al scrollear.
 *
 * ── Lo que la hace intro ──────────────────────────────────────────────────
 *   · `data-intro-de-servicio`, con el slug: el gancho por el que B12 la encuentra. Nunca `data-panel`, `data-seccion-id`,
 *     `data-servicio` ni un id que el home busque.
 *   · `data-seccion="invertida"`, el ÚNICO de la página (Paso 0 del S3b): el tema da vuelta el fondo, las tintas y los bordes adentro
 *     de este bloque y en ningún otro lado, así que el cuerpo queda en el papel del tema sin tocar el tema. Con la inversión en la
 *     raíz, devolver el cuerpo al papel pediría escribir los hex del papel o una regla nueva en el tema.
 *   · `text-tinta` en el mismo elemento: el color se hereda ya resuelto, así que la tinta clara se pide acá y no en la raíz.
 *   · El acento claro del servicio (`estiloDelAcentoSobreNoche`, P-H2): el del cuadrado de la marca. El cuerpo usa el oscuro.
 *   · La tapa interina, ADENTRO de este bloque para pintar la noche: `fixed inset-0 -z-10`, por encima del lienzo de la escena y
 *     debajo de todo el contenido de la raíz. Tapa la escena, no baja su costo, y se va con B12.
 *   · El encabezado también va adentro: en claro, y con el anillo de foco claro (el foco ES la tinta).
 */

import { Encabezado } from './Encabezado'
import { Problema } from './bloques/Problema'
import { estiloDelAcentoSobreNoche } from './estiloDelAcento'
import type { Servicio } from './tipos'

/** El atributo por el que B12 encuentra la intro. Una sola fuente: la intro lo emite y los tests lo buscan. */
export const ATRIBUTO_DE_LA_INTRO = 'data-intro-de-servicio'

/** Una pantalla, como piso: si el título se parte en más líneas, la intro crece en vez de desbordar sobre el papel. */
const ALTO_DE_LA_INTRO = 'min-h-svh' // el alto lo fija B12

export function Intro({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    <div
      {...{ [ATRIBUTO_DE_LA_INTRO]: servicio.slug }}
      data-seccion="invertida"
      style={estiloDelAcentoSobreNoche(servicio.acento.claro)}
      className={`flex flex-col text-tinta ${ALTO_DE_LA_INTRO}`}
    >
      {/* La tapa interina: lo único opaco de la intro. Se va con B12. */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-fondo" />
      <Encabezado />
      <Problema servicio={servicio} />
    </div>
  )
}
