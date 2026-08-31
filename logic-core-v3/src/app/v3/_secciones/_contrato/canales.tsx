'use client'

import type { ReactNode } from 'react'

import { Titular, type NivelDeTitular } from '../../_componentes/tipografia/Titular'
import type { IdDePatron } from '../../_lib/motion/patrones'

import { usePrimitivas, type Progreso } from './coreografia'

/**
 * LOS CANALES — cómo se cuelga contenido de un progreso, con su rama quieta.
 *
 * ── Por qué están en su propio archivo ────────────────────────────────────
 *
 * Porque `coreografia.tsx` cruzó las 300 líneas y la regla del repo es partir.
 * El corte no es por tamaño: **el seam es una cosa y los canales son otra.** El
 * seam declara qué se puede reemplazar y quién decide; los canales son las
 * formas concretas en que un contenido se cuelga de un progreso —una pieza, N
 * piezas, un titular partido en líneas—. Se leen por separado porque se cambian
 * por razones distintas.
 *
 * ── La regla que los cuatro comparten ─────────────────────────────────────
 *
 * Con `progreso === null` **no se monta la primitiva animada**: se renderiza el
 * contenido pelado, en su estado final. No es "el mismo componente con la
 * duración en cero" —eso seguiría midiendo, seguiría suscrito y seguiría
 * escribiendo `transform` en cada cuadro para terminar mostrando lo mismo— es
 * otro árbol, más chico.
 *
 * Y como en el seam: **ni un import de valor del sistema de motion.** Los tipos
 * sí; los tipos se borran al compilar.
 */

export interface CanalDePiezaProps {
  readonly progreso: Progreso
  readonly patron: IdDePatron
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
 * Existe —en vez de sólo el envoltorio que emite las N— porque hay marcado
 * donde eso no alcanza: una lista de once ítems tiene que ser `<ul><li>`, no
 * once `div`, o quien navegue por listas no la encuentra. Acá el consumidor
 * pone su `<li>` y la pieza va adentro.
 */
export function CanalDePieza(props: CanalDePiezaProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null) return <primitivas.CanalDePieza {...props} />
  return props.como === 'span' ? (
    <span className={props.className}>{props.children}</span>
  ) : (
    <div className={props.className}>{props.children}</div>
  )
}

export interface CanalDeUnaPiezaProps {
  readonly progreso: Progreso
  readonly patron: IdDePatron
  readonly className?: string
  readonly como?: 'div' | 'span'
  readonly children: ReactNode
}

/**
 * Una sola pieza. Es el caso de P2 —un target por instancia, con el escalonado
 * inerte— y el de cualquier bloque que entra entero.
 *
 * Los dos lanes escribieron este envoltorio por su cuenta: el lane A lo repitió
 * como `SubeEntero` en tres secciones y el lane B lo tenía en su contrato. Acá
 * está una sola vez, que era el punto de unificar los contratos.
 */
export function CanalDeUnaPieza({
  progreso,
  patron,
  className,
  como,
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

export interface CanalDePiezasProps {
  readonly progreso: Progreso
  readonly patron: IdDePatron
  readonly cantidad: number
  /** Clases de cada pieza. */
  readonly className?: string
  /** Clases del contenedor. */
  readonly contenedor?: string
  readonly como?: 'div' | 'span'
  readonly render: (indice: number) => ReactNode
}

/** N piezas del mismo patrón, con su contenedor, colgadas de un progreso. */
export function CanalDePiezas(props: CanalDePiezasProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null) return <primitivas.CanalDePiezas {...props} />
  const Etiqueta = props.como === 'span' ? 'span' : 'div'
  return (
    <div className={props.contenedor}>
      {Array.from({ length: props.cantidad }, (_, indice) => (
        <Etiqueta key={indice} className={props.className}>
          {props.render(indice)}
        </Etiqueta>
      ))}
    </div>
  )
}

export interface CanalDeTitularProps {
  readonly progreso: Progreso
  readonly patron: IdDePatron
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
 * El divisor mide dónde corta cada línea, y esa medición depende del ancho, de
 * la familia y del tamaño. Acá las clases van en el titular y el divisor las
 * HEREDA —`font-size`, `line-height` y `letter-spacing` son heredables—, así
 * que mide con la misma métrica con la que se pinta, y el mismo `<Titular>`
 * gobierna las dos ramas. Duplicadas, una podría desviarse.
 */
export function CanalDeTitular(props: CanalDeTitularProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null)
    return <primitivas.CanalDeTitular {...props} />
  return (
    <Titular nivel={props.nivel} como={props.como} className={props.className}>
      {props.texto}
    </Titular>
  )
}

export interface TextoPorLineasProps {
  readonly progreso: Progreso
  readonly patron: IdDePatron
  readonly texto: string
  /** La etiqueta del documento. **Sin valor por defecto**: es una decisión. */
  readonly como: 'h1' | 'h2' | 'h3' | 'p'
  /**
   * Las clases de tipografía del bloque. **Obligatorias**: el divisor mide
   * dónde corta cada línea, y una medición tomada sin la tipografía definitiva
   * agrupa las palabras con la métrica equivocada.
   */
  readonly className: string
  readonly id?: string
}

/**
 * UN TEXTO QUE ENTRA LÍNEA POR LÍNEA, con el árbol de encabezados intacto.
 *
 * Es la variante del lane A y se conserva porque resuelve algo que la del lane
 * B declara como desviación: `LineasDeTexto` emite un `<div>`, y el modelo de
 * contenido de `h1`–`h6` es contenido de FRASE, así que `<h1><div>` es marcado
 * inválido. Acá las dos funciones del encabezado se separan —el texto entero en
 * un `sr-only`, que es el que entra al árbol de accesibilidad, y el bloque
 * visual partido en líneas con `aria-hidden`— y el texto se anuncia UNA vez.
 *
 * En la rama quieta no hay nada que separar: el titular es el titular.
 *
 * ⚠ El arreglo de verdad sigue siendo una prop `como` en `LineasDeTexto`, que
 * dejaría el encabezado como contenedor único y ahorraría el nodo extra. Es un
 * cambio al sistema de motion y sigue reportado.
 */
export function TextoPorLineas(props: TextoPorLineasProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null)
    return <primitivas.TextoPorLineas {...props} />
  const Etiqueta = props.como
  return (
    <Etiqueta id={props.id} data-texto-por-lineas="entero" className={props.className}>
      {props.texto}
    </Etiqueta>
  )
}

/**
 * El atributo que marca el estado del divisor. Lo busca el instrumento para
 * distinguir las dos ramas sin depender del texto, que es relleno y va a
 * cambiar.
 */
export const ATRIBUTO_TEXTO_POR_LINEAS = 'data-texto-por-lineas'
