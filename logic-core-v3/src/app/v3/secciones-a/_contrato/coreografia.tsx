'use client'

import type { MotionValue } from 'motion/react'
import { createContext, useContext, useRef, type ReactNode } from 'react'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import type { Cronograma } from '../../_lib/motion/cronograma'
import type { EspecificacionDePieza } from '../../_lib/motion/fotograma'
import { PATRONES, type IdDePatron, type Patron } from '../../_lib/motion/patrones'
import { politicaDeMovimiento, useMovimientoReducido } from '../../_lib/motion/reducido'
import { useProgresoDePatron } from '../../_lib/motion/useProgresoDePatron'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'

/**
 * CÓMO SE CONSUME UN PATRÓN DE MOTION, DESDE UNA SECCIÓN.
 *
 * ── Por qué no se usa `BloqueDePatron` tal cual ────────────────────────────
 *
 * Porque `BloqueDePatron` es el bloque de LA MESA DE CALIBRACIÓN, no el de una
 * sección, y se le nota en dos lugares:
 *
 *   · recibe `ajustes` —las perillas de duración, escalonado y curva que la
 *     ruta `/v3/motion` necesita para poder calibrar sin recompilar—, y una
 *     sección no calibra: corre los valores medidos;
 *   · escribe `minHeight` derivado de `altoDelBloqueSvh()`, que es GEOMETRÍA
 *     DEL INSTRUMENTO: cuánto scroll gasta una demostración para que el gesto
 *     se lea entero. Para P2 eso son 50svh **por bloque**. Una sección que
 *     tenga cuatro bloques P2 mediría 200svh sin que nadie lo haya decidido, y
 *     su alto ya está declarado en `secciones.ts`.
 *
 * Lo que sí se consume sin tocar es EL SISTEMA: `PATRONES` con sus valores
 * medidos, `useProgresoDePatron` como motor, `politicaDeMovimiento` como
 * política, y las piezas (`piezas.tsx`). Este archivo no reimplementa ninguna
 * de esas cuatro cosas: las cablea con la forma que necesita una sección.
 *
 * ── La regla estructural, que se hereda entera ─────────────────────────────
 *
 * **El elemento que se mide nunca se transforma.** El `ref` del motor va en un
 * `div` pelado y todo lo que se mueve es descendiente suyo.
 * `getBoundingClientRect()` devuelve coordenadas contaminadas cuando hay
 * transformaciones activas —lección ya pagada en este repo— y medir el mismo
 * elemento que uno anima es la forma más directa de caer en eso.
 *
 * ── Las DOS compuertas, y por qué son dos ──────────────────────────────────
 *
 *   1. **`prefers-reduced-motion`** — la política de S2, total: no se monta el
 *      motor, no se parte el texto, no se escribe una transformada.
 *   2. **El ancho de 1025** — la misma compuerta del escenario y de la
 *      coreografía, con el mismo umbral y el mismo hook. Abajo del umbral no
 *      hay coreografía, y **el contenido tiene que estar completo igual**.
 *
 * Las dos apagan lo mismo y por eso comparten camino: con cualquiera de las dos
 * activa, el bloque entrega `progreso: null` y la sección renderiza su variante
 * quieta, que no es una degradación sino la otra mitad del diseño.
 *
 * ⚠ **Lo que esta compuerta NO hace, y hay que decirlo:** no saca el sistema de
 * motion del bundle abajo de 1025. La de S2 sí lo hace, porque ahí lo gateado
 * es una ruta entera (`dynamic(..., { ssr: false })`); acá lo gateado es el
 * comportamiento de un contenido que tiene que renderizarse en los dos lados
 * del umbral. Separar el árbol en dos chunks obligaría a cada sección a
 * escribirse dos veces. Es una decisión de la composición del home, no de este
 * lane, y queda reportada.
 */

/**
 * Los tres modos. `auto` es el único que usa la ruta; los otros dos existen
 * para los INSTRUMENTOS, y no es una concesión: es el mismo mecanismo por el
 * que `MotionConfig reducedMotion="always" | "never"` permite renderizar las
 * dos ramas de la preferencia en el mismo proceso y sin navegador.
 *
 * Sin este asiento, la afirmación "abajo de 1025 no hay coreografía" pasaría en
 * verde aunque no hubiera coreografía en ningún lado, porque en un render de
 * servidor `useAnchoMinimo` devuelve `false` siempre. El control positivo es
 * exactamente la otra rama.
 */
export type ModoDeCoreografia = 'auto' | 'siempre' | 'nunca'

const ContextoDeCoreografia = createContext<ModoDeCoreografia>('auto')

export function ProveedorDeCoreografia({
  modo,
  children,
}: {
  readonly modo: ModoDeCoreografia
  readonly children: ReactNode
}): React.JSX.Element {
  return <ContextoDeCoreografia value={modo}>{children}</ContextoDeCoreografia>
}

/**
 * Si la coreografía corre. Los tres hooks se llaman siempre —las reglas de los
 * hooks no admiten ramas— y lo único que cambia es cuál de los tres decide.
 *
 * La preferencia de movimiento reducido gana en los tres modos, `siempre`
 * incluido: la política de S2 es total y un asiento de instrumento no puede
 * abrir un agujero en ella.
 */
export function useCoreografiaActiva(): boolean {
  const modo = useContext(ContextoDeCoreografia)
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_ESCENARIO)
  const politica = politicaDeMovimiento(useMovimientoReducido())

  if (!politica.montaElMotorDeProgreso) return false
  if (modo === 'nunca') return false
  if (modo === 'siempre') return true
  return arribaDelUmbral
}

/** Lo que el bloque le entrega a su contenido. */
export interface EstadoDeSeccion {
  /** El progreso del patrón, o `null` si no hay coreografía. */
  readonly progreso: MotionValue<number> | null
  /** La especificación de pieza, lista para `Pieza` y para `TextoPorLineas`. */
  readonly spec: EspecificacionDePieza
  /** El cronograma con la cantidad real de piezas ya aplicada. */
  readonly cronograma: Cronograma
}

export interface BloqueDeSeccionProps {
  /** Qué patrón. Los valores salen de `PATRONES`, sin perillas. */
  readonly patron: IdDePatron
  /** Cuántas piezas anima este bloque. Define el escalonado real. */
  readonly piezas: number
  readonly className?: string
  readonly children: (estado: EstadoDeSeccion) => ReactNode
}

/** La especificación, armada desde los valores medidos del patrón. */
function specDe(patron: Patron, piezas: number): EspecificacionDePieza {
  return {
    claves: patron.claves,
    tramos: patron.tramos,
    pointerEvents: patron.pointerEvents,
    curva: patron.curva,
    cronograma: {
      duracionDeclarada: patron.duracionDeclarada,
      escalonado: patron.escalonado,
      cantidad: piezas,
    },
  }
}

/**
 * El estilo del bloque: SÓLO la perspectiva, y sólo cuando el patrón la
 * declara.
 *
 * Sin alto mínimo —ése es el punto de no usar el bloque del demo— y sin ninguna
 * otra propiedad. La perspectiva sí va, y va acá: se midió `perspective: 1000px`
 * **en un ancestro** de los 44 planos de la referencia, no en cada plano. Es la
 * diferencia entre doce planos compartiendo un punto de fuga y doce planos con
 * doce puntos de fuga distintos.
 */
function estiloDelBloque(patron: Patron): React.CSSProperties | undefined {
  if (patron.perspectivaPx === undefined) return undefined
  return { perspective: `${patron.perspectivaPx}px` }
}

function BloqueConMotor({
  patron,
  piezas,
  className,
  children,
}: BloqueDeSeccionProps): React.JSX.Element {
  const definicion = PATRONES[patron]
  const spec = specDe(definicion, piezas)

  // El `ref` se crea acá y baja al motor. No sube: leer una propiedad que
  // contiene un `ref` durante el render dispara `react-hooks/refs`.
  const ref = useRef<HTMLDivElement | null>(null)

  const progreso = useProgresoDePatron({
    ref,
    anclas: definicion.anclas,
    inerciaSegundos: typeof definicion.scrub === 'number' ? definicion.scrub : null,
  })

  return (
    <div ref={ref} className={className} style={estiloDelBloque(definicion)}>
      {children({ progreso, spec, cronograma: spec.cronograma })}
    </div>
  )
}

/**
 * La variante sin coreografía. **No llama a un solo hook del sistema de
 * motion**: ni motor, ni medición, ni suscripción al scroll. No es el mismo
 * componente con las duraciones en cero — es otro árbol, más chico.
 */
function BloqueQuieto({
  patron,
  piezas,
  className,
  children,
}: BloqueDeSeccionProps): React.JSX.Element {
  const definicion = PATRONES[patron]
  const spec = specDe(definicion, piezas)
  return (
    <div className={className} style={estiloDelBloque(definicion)}>
      {children({ progreso: null, spec, cronograma: spec.cronograma })}
    </div>
  )
}

export function BloqueDeSeccion(props: BloqueDeSeccionProps): React.JSX.Element {
  return useCoreografiaActiva() ? <BloqueConMotor {...props} /> : <BloqueQuieto {...props} />
}
