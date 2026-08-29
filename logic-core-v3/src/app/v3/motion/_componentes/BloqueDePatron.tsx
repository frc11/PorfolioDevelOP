'use client'

import type { MotionValue } from 'motion/react'
import { useRef, type ReactNode } from 'react'

import { duracionAplicada, type Cronograma } from '../../_lib/motion/cronograma'
import { altoDelBloqueSvh } from '../../_lib/motion/escenografia'
import type { EspecificacionDePieza } from '../../_lib/motion/fotograma'
import type { Patron } from '../../_lib/motion/patrones'
import { politicaDeMovimiento, useMovimientoReducido } from '../../_lib/motion/reducido'
import { useProgresoDePatron } from '../../_lib/motion/useProgresoDePatron'
import { useProgresoEnTiempoReal } from '../../_lib/motion/useProgresoEnTiempoReal'
import { AJUSTES_MEDIDOS, UMBRAL_DE_ENTRADA, type Ajustes } from './ajustes'

/**
 * EL BLOQUE DE UN PATRÓN — el elemento que se MIDE, y el motor que cuelga de él.
 *
 * ── La regla estructural del sistema ───────────────────────────────────────
 *
 * **El elemento que se mide nunca se transforma.** Este componente renderiza un
 * `div` sin transformada y le pone el `ref` del motor; todo lo que se mueve es
 * descendiente suyo. No es una convención: `getBoundingClientRect()` devuelve
 * coordenadas contaminadas cuando hay transformaciones activas —una lección ya
 * pagada en este repo— y medir el mismo elemento que uno anima es la forma más
 * directa de caer en eso. Acá no se puede: el `ref` está en un solo lugar y ese
 * lugar es un `div` pelado.
 *
 * Además es lo que hace que el ancla signifique lo que dice: en la referencia el
 * disparador es el elemento en su lugar del documento, no el elemento desplazado.
 *
 * ── Movimiento reducido: dos componentes, no una rama ──────────────────────
 *
 * Con la preferencia activa se monta `BloqueQuieto`, que **no llama a ningún hook
 * del sistema**: ni motor de progreso, ni medición, ni suscripción al scroll. No
 * es el mismo componente con las duraciones en cero; es otro árbol, más chico.
 * Los hijos reciben `progreso: null` y renderizan su estado final.
 */

/** Lo que el bloque le pasa a su contenido. */
export interface EstadoDelBloque {
  /** El progreso del patrón, o `null` si el movimiento está reducido. */
  readonly progreso: MotionValue<number> | null
  /** El cronograma con los ajustes ya aplicados. */
  readonly cronograma: Cronograma
  /** La especificación de pieza lista para usar. */
  readonly spec: EspecificacionDePieza
}

export interface BloqueDePatronProps {
  readonly patron: Patron
  readonly ajustes: Ajustes
  /** Cuántas piezas anima este bloque. Define el escalonado real. */
  readonly cantidadDePiezas: number
  readonly className?: string
  readonly children: (estado: EstadoDelBloque) => ReactNode
}

/** Aplica las perillas a los valores medidos del patrón. */
function specDe(patron: Patron, ajustes: Ajustes, cantidadDePiezas: number): EspecificacionDePieza {
  return {
    claves: patron.claves,
    tramos: patron.tramos,
    pointerEvents: patron.pointerEvents,
    curva: ajustes.curvaForzada ?? patron.curva,
    cronograma: {
      duracionDeclarada: patron.duracionDeclarada * ajustes.factorDeDuracion,
      escalonado: patron.escalonado * ajustes.factorDeEscalonado,
      cantidad: cantidadDePiezas,
    },
  }
}

/**
 * El alto mínimo del bloque, en `svh`, derivado del ancla del patrón. Con `0` no
 * se escribe la propiedad: el contenido manda.
 */
function estiloDelBloque(patron: Patron): React.CSSProperties {
  const alto = altoDelBloqueSvh(patron.anclas)
  const estilo: React.CSSProperties = {}
  if (alto > 0) estilo.minHeight = `${alto}svh`
  // La perspectiva es del ancestro, no de la pieza: es lo que se midió en la
  // referencia (`perspective: 1000px` en un ancestro de los 44 planos).
  if (patron.perspectivaPx !== undefined) estilo.perspective = `${patron.perspectivaPx}px`
  return estilo
}

function BloqueConMotor({
  patron,
  ajustes,
  cantidadDePiezas,
  className,
  children,
}: BloqueDePatronProps): React.JSX.Element {
  const spec = specDe(patron, ajustes, cantidadDePiezas)

  // El `ref` se crea acá y baja a los dos motores. No sube: una propiedad que
  // contiene un `ref` no se puede leer durante el render (`react-hooks/refs`), y
  // el `div` de abajo es el único lugar donde se usa.
  const ref = useRef<HTMLDivElement | null>(null)

  const porScroll = useProgresoDePatron({
    ref,
    anclas: patron.anclas,
    inerciaSegundos:
      ajustes.conInercia && typeof patron.scrub === 'number' ? patron.scrub : null,
  })

  const porReloj = useProgresoEnTiempoReal({
    ref,
    duracionTotal: duracionAplicada(spec.cronograma),
    umbral: UMBRAL_DE_ENTRADA,
    activo: ajustes.modo === 'tiempo-real',
  })

  const progreso = ajustes.modo === 'tiempo-real' ? porReloj : porScroll

  return (
    <div ref={ref} className={className} style={estiloDelBloque(patron)}>
      {children({ progreso, cronograma: spec.cronograma, spec })}
    </div>
  )
}

function BloqueQuieto({
  patron,
  ajustes,
  cantidadDePiezas,
  className,
  children,
}: BloqueDePatronProps): React.JSX.Element {
  const spec = specDe(patron, ajustes, cantidadDePiezas)
  return (
    <div className={className} style={estiloDelBloque(patron)}>
      {children({ progreso: null, cronograma: spec.cronograma, spec })}
    </div>
  )
}

export function BloqueDePatron(props: BloqueDePatronProps): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const politica = politicaDeMovimiento(reducido)
  return politica.montaElMotorDeProgreso ? (
    <BloqueConMotor {...props} />
  ) : (
    <BloqueQuieto {...props} />
  )
}

/** Los ajustes de arranque, re-exportados para que el demo tenga un solo origen. */
export { AJUSTES_MEDIDOS }
