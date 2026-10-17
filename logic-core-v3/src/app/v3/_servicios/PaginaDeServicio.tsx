/**
 * [SERVICIOS S1b] LA PÁGINA DE UN SERVICIO — el template (plan §7): una página, tres juegos de datos (SPEC §5).
 *
 * Server, sin JS propio. Los bloques van en el orden de SPEC §5; el de Del blog no se monta mientras no haya artículos con
 * href. El modal de contacto NO está acá: la ruta lo monta como hermano, fuera de esta raíz invertida, para que conserve sus
 * tokens de papel y su acento por defecto (plan §4.2).
 *
 * ── La raíz (plan §3 y §4) ────────────────────────────────────────────────
 *   · `data-seccion="invertida"` da vuelta el tema: noche y tinta clara. Es el ÚNICO `data-seccion` de la página, y está acá.
 *   · `relative z-10`: el contenido queda por encima del lienzo de la escena, que el layout de /v3 monta debajo de todo
 *     (P-H4: la escena se monta en cualquier subruta y no se puede apagar desde acá).
 *   · La tapa: una capa `fixed -z-10` con el fondo, adentro del contexto de esta raíz. Queda por encima del lienzo y debajo del
 *     contenido, y cubre también lo que la raíz no alcanza (el rebote del scroll, una ventana más alta que la página). Tapa
 *     la escena, no baja su costo. Es la red de seguridad hasta que el home la resuelva.
 *   · El acento entra por la custom property `--color-acento`, con el claro del servicio (`estiloDelAcento`).
 *
 * El modo (desarrollo o producción) se calcula UNA vez, acá, y baja a los bloques que tienen datos que pueden faltar.
 */

import { Encabezado } from './Encabezado'
import { Cierre } from './bloques/Cierre'
import { DelBlog } from './bloques/DelBlog'
import { Extra } from './bloques/Extra'
import { Faq } from './bloques/Faq'
import { Llamado } from './bloques/Llamado'
import { Precio } from './bloques/Precio'
import { Problema } from './bloques/Problema'
import { Proceso } from './bloques/Proceso'
import { Prueba } from './bloques/Prueba'
import { QueHacemos } from './bloques/QueHacemos'
import { QueIncluye } from './bloques/QueIncluye'
import { estiloDelAcento } from './estiloDelAcento'
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
    <div
      data-seccion="invertida"
      style={estiloDelAcento(servicio.acento.claro)}
      className="relative z-10 min-h-svh bg-fondo text-tinta"
    >
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-fondo" />
      <Encabezado />
      <main>
        <Problema servicio={servicio} />
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
    </div>
  )
}
