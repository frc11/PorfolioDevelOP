'use client'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeTitular } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { ContenidoDeSeccion, Seccion } from '../_contrato/Seccion'
import { DESCRIPCION, TITULO } from './contenido'
import { Galeria } from './Galeria'
import { Remate } from './Remate'

/**
 * SECCIÓN 06 — TU PANEL. Un caos ordenado de features (SPRINT PANEL 2).
 *
 * El encabezado ocupa el 30 % izquierdo y la primera feature llega en el 60 %
 * derecho; después, las demás aparecen más abajo en los lugares de
 * `TABLA_DEL_CAOS` (`geometria.ts`), con el fondo decorativo por detrás. Cierra
 * el remate: «Y más…» y el newsletter.
 *
 * ⚠ Sin `CabeceraDeSeccion`: lo único que montaba acá era `MarcaDeSeccion`, el
 * cuadradito de acento arriba a la izquierda. Es una pieza compartida por todas
 * las secciones (`_contrato/Rotulo.tsx`), así que no se toca: esta sección
 * simplemente no la monta.
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
        <Galeria encabezado={<Encabezado idDelTitular={idDelTitularDeSeccion(seccion.id)} />} />
        <Remate />
      </ContenidoDeSeccion>
    </Seccion>
  )
}

/** «Tu Panel» y su descripción. En escritorio, el 30 % izquierdo arriba del caos. */
function Encabezado({ idDelTitular }: { readonly idDelTitular: string }): React.JSX.Element {
  return (
    <div data-pieza="encabezado-del-panel" className="flex flex-col gap-[var(--spacing-6)] escritorio:absolute escritorio:top-0 escritorio:left-0 escritorio:z-[var(--z-elevado)] escritorio:w-3/10">
      <Bloque patron="P1" rango="ventana-visible">
        {(progreso) => (
          /* El `id` con el que la `<section>` se nombra va en el envoltorio:
             `CanalDeTitular` no acepta `id` (S11, defecto 10). */
          <div id={idDelTitular}>
            <CanalDeTitular progreso={progreso} patron="P1" texto={TITULO} nivel="titulo-xl" como="h2" />
          </div>
        )}
      </Bloque>
      <Cuerpo className="text-tinta-media">{DESCRIPCION}</Cuerpo>
    </div>
  )
}

/** Cuántas piezas anima cada patrón. Es lo que el instrumento cuenta en el HTML. */
export const PIEZAS_POR_PATRON = {
  /** El título: una instancia de P1. */
  P1: 1,
  /** Las 8 features y las 12 piezas del fondo (7 palabras y 5 objetos): un target cada una. */
  P2: 8 + 12,
} as const
