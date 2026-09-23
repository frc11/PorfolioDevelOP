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

/**
 * ⚠️ **LA VENTANA QUE RECORTA — la mitad del gesto que no es el patrón.**
 *
 * Un canal con P1 o P2 sube su pieza desde abajo. Lo que hace que eso se LEA
 * como una aparición —y no como un texto que pasa de largo— es que la pieza
 * salga de detrás de una línea: el `overflow-hidden` de esta ventana. El
 * docblock original lo dice sin vueltas: *«sin la máscara, las claves siguen
 * corriendo y no se nota: ésa fue la regresión del titular»*.
 *
 * El relleno y su margen negativo se cancelan en el layout —aportan cero— y
 * sólo corren el borde de recorte, para que no se coma ni una cola de «p» ni el
 * trazo que un titular lleva debajo de la línea de base.
 *
 * ⚠️ **Vive acá porque la usan TRES secciones.** Nació en
 * `quienes-somos/geometria.ts` como `ventanaDelTexto`, y cuando Trabajos y
 * Servicios tuvieron que reproducir su gesto la opción era copiar la cadena dos
 * veces más. Tres copias de una clase que tiene que ser la misma son tres
 * formas de desincronizarse en silencio. Quiénes somos conserva la suya —es de
 * otro lane— y el invariante afirma que las dos dicen lo mismo.
 *
 * ⚠️ **Y no va sobre una caja con focalizables adentro.** El anillo de foco
 * del tema se dibuja con desplazamiento POSITIVO, así que un `overflow-hidden`
 * se lo come; es lo que `s5-compacto` vigila. Para texto —que es para lo que
 * esto existe— no hay nada que recortar de más.
 */
export const VENTANA_QUE_RECORTA = 'block overflow-hidden py-2 -my-2'

export interface LlegadaEnCurvaProps {
  readonly progreso: Progreso
  /** Desde qué lado entra. Sin declararlo, entra desde la derecha. */
  readonly sentido?: 'desde-la-izquierda' | 'desde-la-derecha'
  readonly className?: string
  readonly children: ReactNode
}

/**
 * LA LLEGADA EN CURVA — una foto que entra desde abajo y a la derecha, más chica
 * y torcida, y viaja en curva hasta su lugar mientras crece y se endereza.
 *
 * ── Scrubbeada, y esta vez a propósito ────────────────────────────────────
 *
 * Va atada al scroll y no a un umbral: el usuario que vuelve para arriba ve la
 * foto DESHACER el camino por la misma curva. Por eso toma `progreso` —el mismo
 * `MotionValue` que mueve al resto del sitio, desde `useProgresoDePatron`— y no
 * un `whileInView`. Lo que hace que se PERCIBA, y que la versión anterior no
 * tenía, es la ventana: con el ancla de la mitad del cuadro el recorrido entero
 * cabe en un tercio de pantalla, no en `alto + 160` px de scroll.
 *
 * Los cuatro valores y la razón de las dos curvas están en `LLEGADA_EN_CURVA`.
 *
 * Con `progreso === null` —abajo de 1025 y con `prefers-reduced-motion`— no se
 * monta nada: la foto sale en su lugar, como el resto de los canales.
 */
export function LlegadaEnCurva(props: LlegadaEnCurvaProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null) return <primitivas.LlegadaEnCurva {...props} />
  return <span className={props.className}>{props.children}</span>
}

/** Qué se dibuja sobre el tramo: la raya debajo, o la raya que lo tacha. */
export type TipoDeTrazo = 'subrayado' | 'tachado'

export interface TrazoProps {
  readonly progreso: Progreso
  readonly tipo: TipoDeTrazo
  /** El peso del tramo. La raya es del sistema; el peso lo decide la sección. */
  readonly className?: string
  /** El tramo de texto que lleva la raya. */
  readonly children: ReactNode
}

/**
 * UN TRAMO DE TEXTO CON SU RAYA, dibujada por el scroll.
 *
 * El aspecto vive en `_estilos/trazo.css` y la raya es un elemento propio, no
 * un pseudo-elemento: la rama animada le escribe `scaleX` y a un
 * pseudo-elemento no se le escribe desde JS.
 *
 * **La rama quieta la muestra YA DIBUJADA y sin una transformada en el
 * marcado** —`scaleX(1)` lo pone la hoja—, que es lo que hace que
 * `prefers-reduced-motion` no necesite un tercer camino: con la preferencia
 * puesta la compuerta no instala la coreografía y acá se cae en este mismo
 * árbol.
 */
export function Trazo(props: TrazoProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null) return <primitivas.Trazo {...props} />
  return (
    <span data-trazo={props.tipo} className={props.className}>
      {props.children}
      <span data-parte="linea" />
    </span>
  )
}

/**
 * EL SIGNO ≠ — tres trazos, no el carácter de la fuente.
 *
 * Va como SVG y no como glifo porque los tres trazos se dibujan por separado y
 * en dos tiempos: las dos barras con el subrayado, la diagonal con el tachado.
 * La caja es cuadrada y el alto lo pone quien lo monta.
 */
export const TRAZOS_DEL_SIGNO = {
  /** El lado de la caja, en unidades de usuario. El trazo NO escala con ella: lo fija `vector-effect`. */
  lado: 100,
  /**
   * El origen de cada trazo va en FRACCIONES de su propia caja y no en unidades
   * del `viewBox`: `motion` fuerza `transform-box: fill-box` en un SVG y pisa
   * cualquier `transform-origin` que se le escriba, así que el único origen que
   * respeta es el suyo (`originX` / `originY`).
   */
  /** Las dos barras del «=». Nacen en su punto medio —el centro de su caja— y se extienden a los dos lados a la vez. */
  barras: [
    { clave: 'arriba', origenX: 0.5, origenY: 0.5, x1: 8, y1: 38, x2: 92, y2: 38 },
    { clave: 'abajo', origenX: 0.5, origenY: 0.5, x1: 8, y1: 62, x2: 92, y2: 62 },
  ],
  /** La diagonal, PARTIDA: cada mitad nace en su extremo de AFUERA —una esquina de su caja— y crece hasta encontrarse en el centro. */
  mitadesDeLaDiagonal: [
    { clave: 'baja', origenX: 0, origenY: 1, x1: 24, y1: 84, x2: 50, y2: 50 },
    { clave: 'alta', origenX: 1, origenY: 0, x1: 76, y1: 16, x2: 50, y2: 50 },
  ],
} as const

export interface SignoDistintoProps {
  readonly progreso: Progreso
  readonly className?: string
}

/**
 * El signo con su animación de dibujado, atado al MISMO progreso del trazo del
 * titular. La rama quieta —y `prefers-reduced-motion`— lo muestra ya dibujado,
 * sin un solo `stroke-dashoffset` en el marcado.
 */
export function SignoDistinto(props: SignoDistintoProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null) return <primitivas.SignoDistinto {...props} />
  const { lado, barras, mitadesDeLaDiagonal: mitades } = TRAZOS_DEL_SIGNO
  return (
    <svg
      data-signo="distinto"
      aria-hidden="true"
      viewBox={`0 0 ${lado} ${lado}`}
      className={props.className}
    >
      {barras.map((t) => (
        <g key={t.clave} data-parte="barra">
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        </g>
      ))}
      {mitades.map((t) => (
        <g key={t.clave} data-parte="diagonal">
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        </g>
      ))}
    </svg>
  )
}

/**
 * EL PROGRESO QUE PERSIGUE AL SCROLL — la primitiva de la persecución.
 *
 * Una transformación atada al scroll es una FUNCIÓN del scroll: se frena cuando
 * el dedo se frena. Acá el scroll mueve un OBJETIVO y la pieza lo persigue con
 * retardo, así que al soltar sigue viajando y recién ahí se asienta. Es lo que
 * hace que en dos scrolls se vea todo el movimiento en vez de un pedazo.
 *
 * Va como primitiva del seam y no adentro de una foto **porque es un
 * transformador de progreso y no un gesto**: cualquier canal puede envolverse
 * en ella. La rama quieta entrega `null`, que es lo mismo que entrega un bloque
 * sin coreografía — abajo de 1025 y con `prefers-reduced-motion` no hay nada
 * que perseguir.
 */
export interface ProgresoAmortiguadoProps {
  readonly progreso: Progreso
  readonly children: (progreso: Progreso) => ReactNode
}

export function ProgresoAmortiguado(props: ProgresoAmortiguadoProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null && props.progreso !== null) return <primitivas.ProgresoAmortiguado {...props} />
  return <>{props.children(null)}</>
}
