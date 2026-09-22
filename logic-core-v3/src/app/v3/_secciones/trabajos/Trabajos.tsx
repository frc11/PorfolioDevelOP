'use client'

import { ProgresoAmortiguado } from '../_contrato/canales'
import { Bloque, type Progreso } from '../_contrato/coreografia'
import type { PropsDeSeccion } from '../_contrato/forma'
import { Seccion } from '../_contrato/Seccion'

import { CapaDeLaGota } from './CapaDeLaGota'
import { CapaDelTunel } from './CapaDelTunel'
import { PortadaDeTrabajos, RamaQuieta } from './piezas'

/**
 * 04 · TRABAJOS — el preludio, la conversión y el túnel. **[PORTFOLIO]**
 *
 * ── Los tres tiempos, en el orden en que se leen ─────────────────────────
 *
 * 1. **La conversión.** No es un tramo de scroll: es un GATILLO, y lo dispara el
 *    final de Quiénes somos. Un círculo de borde suave entra ya grande desde
 *    fuera del encuadre y cierra en medio segundo; al terminar **se va**, y lo
 *    que queda es la sala con los colores de la noche. Scrolleando para arriba
 *    la misma animación corre al revés (`gota.ts`, `nocheDisparada.ts`).
 * 2. **El cartel.** «Portfolio» y su bajada, creciendo desde su esquina de arriba
 *    a la izquierda. El cuerpo se pinta palabra por palabra en la meseta, y
 *    después el cartel HUYE — se aleja en z y se desvanece.
 * 3. **La cadena.** Las fotos nacen una en la esquina de la anterior y crecen sin
 *    moverse de lugar; el texto de cada trabajo crece con ellas, a la misma
 *    escala normalizada, y huye como el cartel. Las fotos no huyen: se quedan
 *    hasta que la siguiente las tapa entera, y ahí se retiran en silencio.
 *
 * El recorrido de cámara que precede a todo esto **no vive acá**: lo lleva
 * Números, que es de quién es ese tramo de la coreografía. Por qué no se puede
 * mudar adentro de esta sección está escrito en `PANTALLAS_DE_NUMEROS`.
 *
 * ── El orden del marcado ES el orden de pintura ───────────────────────────
 *
 * Hermanos posicionados se pintan en orden de documento: la portada primero,
 * después el túnel que la cubre al crecer, y los nombres arriba de todo, que es
 * lo que los deja legibles sobre una imagen que desborda el cuadro. La gota va
 * al final y **afuera del bloque**: tapa el cuadro entero durante el disparo,
 * contenido incluido, que es lo que hace que el relevo no se vea.
 *
 * ── ⚠️ La persecución envuelve SÓLO al túnel ──────────────────────────────
 *
 * `ProgresoAmortiguado` es un transformador de progreso, no un gesto: el túnel
 * lo necesita —para que el movimiento siga después de soltar el scroll— y la
 * gota no, porque una conversión que se pasa de largo y vuelve sería un
 * parpadeo. Los nombres lo usan adentro, sólo para su llegada.
 */
export function Trabajos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    // ⚠️ Sin `bg-fondo` en móvil: la sección es `oscuro-transparente` y la
    // oscuridad la tiene que dar la SALA, no el panel. Pintarla acá tapaba el
    // canvas abajo de 1025 y con él lo único que esta sección viene a mostrar.
    // Quien la lleva a la noche en los dos lados del umbral es el disparo.
    <Seccion seccion={seccion} className="relative max-escritorio:min-h-[inherit]">
      {/* ⚠️ El `min-h-[inherit]` viaja por la cadena ENTERA o no llega: el bloque
          está entre la sección y el envoltorio, y sin él el envoltorio hereda el
          cero del bloque en vez del alto del panel. Medido: la rama quieta
          quedaba 2.419 px más corta que su sección. */}
      <Bloque patron="P7" anclaje="seccion" lente="escena" className="relative h-full w-full max-escritorio:min-h-[inherit]">
        {(progreso: Progreso) => {
          if (progreso === null) return <RamaQuieta seccion={seccion} />
          return (
            <>
              <PortadaDeTrabajos seccion={seccion} progreso={progreso} />
              <ProgresoAmortiguado progreso={progreso}>
                {(perseguido) =>
                  perseguido === null ? null : (
                    <CapaDelTunel
                      progreso={perseguido}
                      className="pointer-events-none absolute inset-0"
                    />
                  )
                }
              </ProgresoAmortiguado>
            </>
          )
        }}
      </Bloque>

      {/* Hermano del bloque, no descendiente: vale en las dos ramas y el
          `s7-arboles` §4 de la rama quieta sigue valiendo. */}
      <CapaDeLaGota className="bg-fondo pointer-events-none fixed inset-0 z-50" />
    </Seccion>
  )
}
