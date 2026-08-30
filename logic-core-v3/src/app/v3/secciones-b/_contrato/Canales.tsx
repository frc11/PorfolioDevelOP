'use client'

import type { MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import type { EspecificacionDePieza } from '../../_lib/motion/fotograma'
import type { Patron } from '../../_lib/motion/patrones'
import { LineasDeTexto } from '../../motion/_componentes/LineasDeTexto'
import { Pieza } from '../../motion/_componentes/Pieza'
import { Piezas } from '../../motion/_componentes/Piezas'
import { Titular, type NivelDeTitular } from '../../_componentes/tipografia/Titular'
import { especificacionDe } from './motion'

/**
 * LOS CANALES — cómo se cuelga contenido de un progreso, con su variante sin él.
 *
 * ── El seam con la glue de S2, en un solo archivo ─────────────────────────
 *
 * Las tres piezas de abajo —`Pieza`, `Piezas`, `LineasDeTexto`— viven en
 * `motion/_componentes/`, que es la ruta de demostración de S2 y está declarada
 * como **deuda con fecha de baja**. Las tres son glue pura sobre `_lib/motion/`
 * y no importan nada del demo (`Piezas` importa un tipo, que se borra al
 * compilar), así que se consumen tal cual en vez de reescribirlas.
 *
 * **Este archivo es el único punto del lane que las importa.** El día que la
 * ruta de demostración se borre, lo que hay que arreglar es este archivo y nada
 * más — y el arreglo es mover tres archivos a `_lib/motion/`, no reescribir
 * nada. Está reportado como hallazgo del sprint.
 *
 * ── Por qué el contenido se escribe UNA vez ───────────────────────────────
 *
 * Con `progreso === null` no se monta `Pieza`: se renderiza el contenido pelado,
 * en su estado final. Es la misma solución que `Piezas` ya trae, y existe por
 * una razón concreta que S2 dejó escrita: repetir la rama sin movimiento en cada
 * consumidor sería una oportunidad por consumidor de que se desvíe. Un contenido
 * distinto abajo de 1025 es peor que unos KiB de más.
 */

/** El estado que `Piezas` espera. Se arma acá para que nadie lo arme dos veces. */
export interface EstadoDeCanal {
  readonly progreso: MotionValue<number> | null
  readonly cronograma: EspecificacionDePieza['cronograma']
  readonly spec: EspecificacionDePieza
}

export function estadoDeCanal(
  progreso: MotionValue<number> | null,
  patron: Patron,
  cantidad: number,
): EstadoDeCanal {
  const spec = especificacionDe(patron, cantidad)
  return { progreso, cronograma: spec.cronograma, spec }
}

export interface CanalDePiezasProps {
  readonly progreso: MotionValue<number> | null
  readonly patron: Patron
  readonly cantidad: number
  /** Clases de cada pieza. */
  readonly className?: string
  /** Clases del contenedor. */
  readonly contenedor?: string
  readonly como?: 'div' | 'span'
  readonly render: (indice: number) => ReactNode
}

/**
 * N piezas del mismo patrón, colgadas de un progreso.
 *
 * Es `Piezas` con la especificación ya armada desde el patrón medido: el
 * consumidor pasa el patrón y cuántas piezas tiene, no un cronograma.
 */
export function CanalDePiezas({
  progreso,
  patron,
  cantidad,
  className,
  contenedor,
  como = 'div',
  render,
}: CanalDePiezasProps): React.JSX.Element {
  return (
    <Piezas
      estado={estadoDeCanal(progreso, patron, cantidad)}
      cantidad={cantidad}
      className={className}
      contenedor={contenedor}
      como={como}
      render={render}
    />
  )
}

export interface CanalDePiezaProps {
  readonly progreso: MotionValue<number> | null
  readonly patron: Patron
  /** Cuántas piezas tiene el conjunto. Define el escalonado real. */
  readonly cantidad: number
  /** La posición dentro del escalonado. La pieza 0 arranca primero. */
  readonly indice: number
  readonly className?: string
  readonly como?: 'div' | 'span'
  readonly children: ReactNode
}

/**
 * UNA pieza de un conjunto, colocada por el consumidor.
 *
 * Existe porque `Piezas` emite `div` o `span` y hay marcado donde eso no
 * alcanza: una lista de once ítems tiene que ser `<ul><li>`, no once `div`, o
 * quien navegue por listas no la encuentra. Acá el consumidor pone su `<li>` y
 * la pieza va adentro.
 */
export function CanalDePieza({
  progreso,
  patron,
  cantidad,
  indice,
  className,
  como = 'div',
  children,
}: CanalDePiezaProps): React.JSX.Element {
  if (progreso === null) {
    return como === 'span' ? (
      <span className={className}>{children}</span>
    ) : (
      <div className={className}>{children}</div>
    )
  }
  return (
    <Pieza
      spec={especificacionDe(patron, cantidad)}
      indice={indice}
      progreso={progreso}
      como={como}
      className={className}
    >
      {children}
    </Pieza>
  )
}

export interface CanalDeUnaPiezaProps {
  readonly progreso: MotionValue<number> | null
  readonly patron: Patron
  readonly className?: string
  readonly como?: 'div' | 'span'
  readonly children: ReactNode
}

/**
 * Una sola pieza. Es el caso de P2 —un target por instancia, con el escalonado
 * inerte— y el de cualquier bloque que entra entero.
 */
export function CanalDeUnaPieza({
  progreso,
  patron,
  className,
  como = 'div',
  children,
}: CanalDeUnaPiezaProps): React.JSX.Element {
  return (
    <CanalDePieza
      progreso={progreso}
      patron={patron}
      cantidad={1}
      indice={0}
      className={className}
      como={como}
    >
      {children}
    </CanalDePieza>
  )
}

export interface CanalDeTitularProps {
  readonly progreso: MotionValue<number> | null
  readonly patron: Patron
  readonly texto: string
  readonly nivel: NivelDeTitular
  /** El elemento del documento. Sin default: elegirlo es una decisión. */
  readonly como: 'h1' | 'h2' | 'h3'
  readonly className?: string
}

/**
 * EL TITULAR LÍNEA POR LÍNEA — P1, el 58 % del corpus de la referencia.
 *
 * ── Por qué la tipografía va en el `<h_>` y no adentro ────────────────────
 *
 * `LineasDeTexto` avisa que sin las clases de tipografía la medición no vale:
 * dónde corta una línea depende del ancho, de la familia y del tamaño. Acá las
 * clases van en el titular y el divisor las HEREDA —`font-size`, `line-height` y
 * `letter-spacing` son heredables—, así que mide con la misma métrica con la que
 * se pinta, y el mismo `<Titular>` gobierna las dos ramas. Si las clases
 * estuvieran duplicadas en las dos, una podría desviarse.
 *
 * ⚠️ **Desviación declarada:** `LineasDeTexto` emite un `<div>`, y el modelo de
 * contenido de `h1`–`h6` es contenido de FRASE. La anidación es inválida contra
 * la especificación aunque el árbol de accesibilidad quede correcto —el nombre
 * del encabezado sale de la copia `sr-only` que el propio divisor emite—. Las
 * dos salidas eran peores: poner `role="heading"` sobre un `div` reemplaza un
 * elemento nativo por ARIA, y partir el texto fuera del encabezado duplica la
 * frase en el árbol. El arreglo limpio es de quien mantenga el sistema de
 * motion: una propiedad `como` en `LineasDeTexto` para que pueda emitir un
 * `span`. Queda reportado.
 */
export function CanalDeTitular({
  progreso,
  patron,
  texto,
  nivel,
  como,
  className,
}: CanalDeTitularProps): React.JSX.Element {
  return (
    <Titular nivel={nivel} como={como} className={className}>
      {progreso === null ? (
        texto
      ) : (
        <LineasDeTexto
          texto={texto}
          progreso={progreso}
          claves={patron.claves}
          curva={patron.curva}
          duracionDeclarada={patron.duracionDeclarada}
          escalonado={patron.escalonado}
        />
      )}
    </Titular>
  )
}
