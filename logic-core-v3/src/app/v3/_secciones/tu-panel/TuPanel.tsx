'use client'

import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeTitular } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { CabeceraDeSeccion, ContenidoDeSeccion, Seccion } from '../_contrato/Seccion'
import { TITULAR } from './contenido'
import { Galeria } from './Galeria'
import { YMas } from './YMas'

/**
 * SECCIÓN 06 — TU PANEL. La galería de lo que se hace adentro del panel.
 *
 * SPRINT PANEL: era captura + tres bloques + la lista de capacidades, en dos
 * pantallas. Ahora es el titular de siempre, la galería al estilo de nk/news
 * (grilla escalonada, parallax, hover y ampliación) y «Y más…» al final. Lo
 * medido de nk y cómo se tradujo a tokens está en `galeria.ts` y en
 * `docs/rediseno/SPRINT-PANEL.md`.
 *
 * El titular sigue siendo P1 línea por línea. La galería y «Y más…» leen la
 * misma compuerta que los canales: con la coreografía apagada (abajo de 1025 o
 * con movimiento reducido) no hay parallax ni entrada, y el marcado es el mismo.
 */
export function TuPanel({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      {/* `py-20` son los 80 px que la pastilla de navegación se lleva del pie y
          de la cabeza de la pantalla (`_lib/navegacion.ts`). */}
      <ContenidoDeSeccion
        className="flex min-h-svh flex-col py-[var(--spacing-20)]"
        claseDeContenido="flex flex-1 flex-col gap-[var(--spacing-20)]"
      >
        <CabeceraDeSeccion />

        <Bloque patron="P1" rango="ventana-visible">
          {(progreso) => (
            /* El `id` con el que la `<section>` se nombra va en el envoltorio:
               `CanalDeTitular` no acepta `id` (S11, defecto 10). */
            <div id={idDelTitularDeSeccion(seccion.id)}>
              <CanalDeTitular progreso={progreso} patron="P1" texto={TITULAR} nivel="titulo-l" como="h2" />
            </div>
          )}
        </Bloque>

        <Galeria />

        <YMas />
      </ContenidoDeSeccion>
    </Seccion>
  )
}

/** Cuántas piezas anima cada patrón. Es lo que el instrumento cuenta en el HTML. */
export const PIEZAS_POR_PATRON = {
  /** El titular entero: una instancia de P1, partida en líneas por el divisor. */
  P1: 1,
} as const
