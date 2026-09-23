'use client'

import { useMotionValue } from 'motion/react'

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
 *    final de Quiénes somos. Una banda diagonal cruza el cuadro en 760 ms y la
 *    sala queda con los colores de la noche. Scrolleando para arriba la misma
 *    animación corre al revés (`gota.ts`, `nocheDisparada.ts`).
 * 2. **El cartel.** «Portfolio» y su bajada, creciendo desde su esquina de arriba
 *    a la izquierda. El cuerpo se pinta palabra por palabra en la meseta, y
 *    después el cartel HUYE — se aleja en z y se desvanece.
 * 3. **El túnel.** Mientras el cartel huye nace la primera captura, centrada, y
 *    crece. Al llegar al tamaño en que el proyecto se lee, nace la siguiente
 *    adentro; la anterior sigue creciendo y se sale del cuadro por los bordes,
 *    donde sigue viéndose. Cuando la última llega al límite de la pantalla,
 *    empieza el tramo de demos.
 *
 * El recorrido de cámara que precede a todo esto **no vive acá**: lo lleva
 * Números, que es de quién es ese tramo de la coreografía.
 *
 * ── El orden del marcado ES el orden de pintura ───────────────────────────
 *
 * Hermanos posicionados se pintan en orden de documento: el cartel primero,
 * después el túnel que lo cubre al crecer, y adentro del túnel las capturas en
 * su orden, así que **la que acaba de nacer queda arriba de las viejas** — que es
 * lo que hace cierto «nace adentro de la anterior». La gota va al final y
 * **afuera del bloque**: tapa el cuadro entero durante el disparo, contenido
 * incluido, que es lo que hace que el relevo no se vea.
 *
 * ── ⚠️ EL TÚNEL YA NO PASA POR `ProgresoAmortiguado`, Y ES A PROPÓSITO ────
 *
 * Lo envolvía un `useSpring` de 0,5 s —la persecución compartida del sistema, que
 * Quiénes somos sigue usando—. El túnel ahora lleva la suya adentro, con su
 * propia constante declarada: lo que el humano mide al soltar el scroll es UN
 * número y tiene que haber UN número en el código. Dos amortiguaciones en serie
 * habrían dado un tiempo que no es ninguna de las dos.
 */
export function Trabajos({ seccion }: PropsDeSeccion): React.JSX.Element {
  // ⚠️ UN SOLO valor amortiguado para el cartel y el túnel: lo escribe el túnel y
  // lo lee el cartel, así que subiendo el cartel no puede volver encima del túnel.
  const mostrado = useMotionValue(0)
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
              <PortadaDeTrabajos seccion={seccion} progreso={progreso} mostrado={mostrado} />
              {/* El recorte del túnel NO va acá: va adentro, como estilo, porque
                  necesita un margen de recorte y eso no es una clase. Ver el
                  docblock de `RECORTE_DEL_TUNEL` en `CapaDelTunel.tsx`. */}
              <CapaDelTunel progreso={progreso} mostrado={mostrado} className="pointer-events-none absolute inset-0" />
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
