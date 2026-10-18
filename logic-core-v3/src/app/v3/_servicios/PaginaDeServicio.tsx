/**
 * [SERVICIOS S1b · S3b] LA PÁGINA DE UN SERVICIO — el template (plan §7): una página, tres juegos de datos (SPEC §5).
 *
 * Server, sin JS propio. Los bloques van en el orden de SPEC §5; el de Del blog no se monta mientras no haya artículos con
 * href. El modal de contacto NO está acá: la ruta lo monta como hermano, fuera de esta raíz, para que conserve sus tokens de papel
 * y su acento por defecto (plan §4.2).
 *
 * ── Las dos partes (S3b, contrato v4 §0) ──────────────────────────────────
 *   · La INTRO (`Intro`): la primera pantalla, transparente sobre la tapa interina, con el `h1`, su bajada y el enlace al home.
 *     Es lo único invertido de la página (el único `data-seccion`) y lleva el acento claro. La llena el home con la escena en B12.
 *   · El CUERPO, del Qué hacemos al cierre provisorio: secciones opacas en papel (`Bloque`, `Cierre`), con tinta y el acento
 *     oscuro. Al scrollear tapa la tapa: la intro se va con el papel encima, sin costura entre las dos.
 *
 * ── La raíz ────────────────────────────────────────────────────────────────
 *   · `relative z-10`: el contenido queda por encima del lienzo de la escena, que el layout de /v3 monta debajo de todo (P-H4: la
 *     escena se monta en cualquier subruta y no se puede apagar desde acá). La tapa de la intro (`-z-10`) pinta dentro de este
 *     contexto: arriba del lienzo y abajo del cuerpo.
 *   · El acento del cuerpo entra por la custom property `--color-acento`, con el token oscuro del servicio
 *     (`estiloDelAcentoSobrePapel`): ningún hex. La intro lo pisa con el claro.
 *   · Los documentos JSON-LD van al final: no se ven, y así la intro es lo primero de la página.
 *
 * El modo (desarrollo o producción) se calcula UNA vez, acá, y baja a los bloques que tienen datos que pueden faltar.
 */

import { Intro } from './Intro'
import { JsonLd } from './JsonLd'
import { Cierre } from './bloques/Cierre'
import { DelBlog } from './bloques/DelBlog'
import { Extra } from './bloques/Extra'
import { Faq } from './bloques/Faq'
import { Llamado } from './bloques/Llamado'
import { Precio } from './bloques/Precio'
import { Proceso } from './bloques/Proceso'
import { Prueba } from './bloques/Prueba'
import { QueHacemos } from './bloques/QueHacemos'
import { QueIncluye } from './bloques/QueIncluye'
import { estiloDelAcentoSobrePapel } from './estiloDelAcento'
import type { Servicio } from './tipos'

/** En producción `[a definir]` no se ve nunca y el ítem que depende del dato no se monta (plan §8.4). */
const EN_DESARROLLO = process.env.NODE_ENV !== 'production'

interface PaginaDeServicioProps {
  readonly servicio: Servicio
  /** Solo para los tests, que renderizan los dos modos. En la ruta no se pasa: manda `NODE_ENV`. */
  readonly enDesarrollo?: boolean
}

export function PaginaDeServicio({ servicio, enDesarrollo = EN_DESARROLLO }: PaginaDeServicioProps): React.JSX.Element {
  return (
    <div style={estiloDelAcentoSobrePapel(servicio.idEnElHome)} className="relative z-10 text-tinta">
      <Intro servicio={servicio} />
      <main>
        <QueHacemos queHacemos={servicio.queHacemos} />
        <QueIncluye incluye={servicio.incluye} aparte={servicio.aparte} />
        <Precio precio={servicio.precio} enDesarrollo={enDesarrollo} />
        <Extra extra={servicio.extra} enDesarrollo={enDesarrollo} />
        <Proceso proceso={servicio.proceso} />
        <Prueba prueba={servicio.prueba} enDesarrollo={enDesarrollo} />
        <Faq faq={servicio.faq} enDesarrollo={enDesarrollo} />
        <Llamado servicio={servicio} />
        <DelBlog articulos={servicio.articulos} />
      </main>
      <Cierre servicio={servicio} />
      <JsonLd servicio={servicio} />
    </div>
  )
}
