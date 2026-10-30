/**
 * [SERVICIOS S1b · V1 · L7a] LA PÁGINA DE UN SERVICIO — el template: una página, tres juegos de datos. [L7a] Armada con las piezas de la
 * página base (`/v3/pagina-base`, B12a-API §7 y §8), como cualquier página de `/v3`:
 *   · la INTRO del home (`Intro` → `IntroDeLaPagina`): sobre la escena, de noche, con la variante y el acento del servicio;
 *   · el CUERPO en papel (`CuerpoDelServicio`), adentro de la compuerta de la coreografía del home; el acento del papel entra por
 *     `--color-acento` con el token oscuro del servicio (`estiloDelAcentoSobrePapel`): ningún hex;
 *   · el CIERRE común (`CierreDeLaPagina`): Seis razones → el CTA (con el servicio de la página) → la resolución → el pie, y el FAQ de la
 *     página con sus 6 preguntas.
 * Lo que el V1 ponía y ahora pone el home se fue: el encabezado (la navbar la monta el layout), el contacto en la ruta (`ChromeDelHome`),
 * la salida de la variante en la raíz (`EnlaceDeRuta` la pide), el FAQ del cuerpo y el cierre provisorio (el cierre común).
 *
 * Server, salvo lo que vive en `movimiento/` y la compuerta. Los documentos JSON-LD van primero: no se ven.
 */

import { CierreDeLaPagina } from '../_componentes/pagina/cierre/CierreDeLaPagina'
import { CompuertaDelHome } from '../_secciones/CompuertaDelHome'

import { Intro } from './Intro'
import { JsonLd } from './JsonLd'
import { Despues, Entrega } from './bloques/AlFinal'
import { Extra } from './bloques/Extra'
import { LlamadoDelPrecio } from './bloques/Llamado'
import { Ejemplos, LoQuePodemosConstruir } from './bloques/Piezas'
import { Precio } from './bloques/Precio'
import { Proceso } from './bloques/Proceso'
import { QueHacemos } from './bloques/QueHacemos'
import { QueIncluye } from './bloques/QueIncluye'
import { Trabajos } from './bloques/Trabajos'
import { PRESETS_DE_LAS_PAGINAS } from './escena/presets'
import { MomentoDelServicio } from './momentos/MomentoDelServicio'
import { estiloDelAcentoSobrePapel } from './estiloDelAcento'
import type { Servicio } from './tipos'

/**
 * [L7a] Sin marcadores en ningún modo (L7: el texto es genérico pero real, sin corchetes): un dato que todavía no existe no se monta,
 * también en desarrollo. Los bloques siguen recibiendo el modo para que sus tests prueben las dos ramas.
 */
const EN_DESARROLLO = false

interface PaginaDeServicioProps {
  readonly servicio: Servicio
  /** Solo para los tests, que renderizan los dos modos. En la ruta no se pasa. */
  readonly enDesarrollo?: boolean
}

/**
 * El cuerpo en papel, en el orden de la página: qué es, para qué sirve, qué incluye, cuánto cuesta, lo hecho o lo posible, cómo, y el final.
 * Exportado para los tests: la página entera suma el cierre del home, que tiene los suyos.
 */
export function CuerpoDelServicio({ servicio, enDesarrollo }: { readonly servicio: Servicio; readonly enDesarrollo: boolean }): React.JSX.Element {
  return (
    <div style={estiloDelAcentoSobrePapel(servicio.idEnElHome)} className="text-tinta">
      <QueHacemos queHacemos={servicio.queHacemos} detalle={servicio.detalle} />
      <MomentoDelServicio servicio={servicio} />
      <Ejemplos ejemplos={servicio.ejemplos} />
      <QueIncluye incluye={servicio.incluye} aparte={servicio.aparte} />
      <Precio precio={servicio.precio} enDesarrollo={enDesarrollo} />
      <LlamadoDelPrecio servicio={servicio} />
      <Extra extra={servicio.extra} enDesarrollo={enDesarrollo} />
      <Trabajos prueba={servicio.prueba} />
      <LoQuePodemosConstruir posibles={servicio.posibles} />
      <Proceso proceso={servicio.proceso} prueba={servicio.prueba} enDesarrollo={enDesarrollo} />
      <Entrega entrega={servicio.entrega} />
      <Despues despues={servicio.despues} />
    </div>
  )
}

export function PaginaDeServicio({ servicio, enDesarrollo = EN_DESARROLLO }: PaginaDeServicioProps): React.JSX.Element {
  const preset = PRESETS_DE_LAS_PAGINAS[servicio.idEnElHome]
  return (
    <main className="relative z-10 overflow-x-clip">
      {/* Antes de la intro: nada entre la intro y el cuerpo, ni entre el cierre y el fin del `<main>` (B12a-API §7 y §8). */}
      <JsonLd servicio={servicio} />
      <Intro servicio={servicio} />
      <CompuertaDelHome>
        <CuerpoDelServicio servicio={servicio} enDesarrollo={enDesarrollo} />
      </CompuertaDelHome>
      <CierreDeLaPagina preset={preset} preguntas={servicio.faq} />
    </main>
  )
}
