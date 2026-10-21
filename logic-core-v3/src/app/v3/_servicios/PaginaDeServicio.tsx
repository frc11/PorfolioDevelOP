/**
 * [SERVICIOS S1b · S3b · M1 · V1] LA PÁGINA DE UN SERVICIO — el template (plan §7): una página, tres juegos de datos (SPEC §5).
 *
 * Server, salvo la raíz (`movimiento/RaizDeLaPagina`, [V1]) y lo que vive en `movimiento/`. El modal de contacto NO está acá: la ruta lo
 * monta como hermano, fuera de esta raíz, para que conserve sus tokens de papel y su acento por defecto (plan §4.2).
 *
 * ── Las partes (S3b, contrato v4 §0; [V1] la intro con la escena) ─────────
 *   · El ENCABEZADO (`Encabezado`): el enlace al home, sobre la escena, en claro.
 *   · La INTRO (`Intro`, [V1] la del home: `IntroDeLaPagina`): 1,5 pantallas transparentes sobre la escena, de noche, con su variante, el
 *     `h1` (el nombre) y la bajada. Junto con el encabezado, lo único invertido de la página.
 *   · El CUERPO, del Qué hacemos al cierre provisorio: secciones opacas en papel, con tinta y el acento oscuro. Tapan la escena.
 *
 * ── [M1] El orden de la maqueta (M0 §1.3), con cómo entra cada uno ────────
 *     1 Qué hacemos · progresivo        6 Trabajos (el video, M3) · gatillo; solo en Páginas web
 *     2 Qué incluye · progresivo        7 Cómo trabajamos · progresivo
 *     3 Precio · progresivo             8 FAQ · el panel quieto
 *     4 El CTA del precio · gatillo     9 El llamado · gatillo
 *     5 Extra · progresivo (si hay)    10 El cierre provisorio · sin revelado
 *   «Del blog» salió del orden hasta que exista el blog (los artículos siguen en los datos).
 *
 * ── La raíz ────────────────────────────────────────────────────────────────
 *   · `relative z-10`: el contenido queda por encima del lienzo de la escena, que el layout de /v3 monta debajo de todo (P-H4). [V1] La
 *     tapa interina se fue: la escena se ve a través del encabezado y de la intro, y el papel del cuerpo la tapa.
 *   · El acento del cuerpo entra por la custom property `--color-acento`, con el token oscuro del servicio
 *     (`estiloDelAcentoSobrePapel`): ningún hex. La intro lleva el de su servicio por `data-servicio` (lo pone el home).
 *   · [V1] Atiende el clic en cualquier enlace que se va de la página: antes de navegar, la salida de la variante (P-H29d).
 *   · Los documentos JSON-LD van al final: no se ven.
 *
 * El modo (desarrollo o producción) se calcula UNA vez, acá, y baja a los bloques que tienen datos que pueden faltar.
 */

import { Encabezado } from './Encabezado'
import { Intro } from './Intro'
import { JsonLd } from './JsonLd'
import { Cierre } from './bloques/Cierre'
import { Extra } from './bloques/Extra'
import { Faq } from './bloques/Faq'
import { Llamado, LlamadoDelPrecio } from './bloques/Llamado'
import { Precio } from './bloques/Precio'
import { Proceso } from './bloques/Proceso'
import { QueHacemos } from './bloques/QueHacemos'
import { QueIncluye } from './bloques/QueIncluye'
import { Trabajos } from './bloques/Trabajos'
import { estiloDelAcentoSobrePapel } from './estiloDelAcento'
import { RaizDeLaPagina } from './movimiento/RaizDeLaPagina'
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
    <RaizDeLaPagina estilo={estiloDelAcentoSobrePapel(servicio.idEnElHome)} className="relative z-10 text-tinta">
      <Encabezado />
      <Intro servicio={servicio} />
      <main>
        <QueHacemos queHacemos={servicio.queHacemos} />
        <QueIncluye incluye={servicio.incluye} aparte={servicio.aparte} />
        <Precio precio={servicio.precio} enDesarrollo={enDesarrollo} />
        <LlamadoDelPrecio servicio={servicio} />
        <Extra extra={servicio.extra} enDesarrollo={enDesarrollo} />
        <Trabajos prueba={servicio.prueba} />
        <Proceso proceso={servicio.proceso} prueba={servicio.prueba} enDesarrollo={enDesarrollo} />
        <Faq faq={servicio.faq} enDesarrollo={enDesarrollo} />
        <Llamado servicio={servicio} />
      </main>
      <Cierre servicio={servicio} />
      <JsonLd servicio={servicio} />
    </RaizDeLaPagina>
  )
}
