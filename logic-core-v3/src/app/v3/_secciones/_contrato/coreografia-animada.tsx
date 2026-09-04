'use client'

import { useCallback, useRef } from 'react'

import { Titular } from '../../_componentes/tipografia/Titular'
import type { ParDeAnclas } from '../../_lib/motion/anclas'
import { PATRONES } from '../../_lib/motion/patrones'
import { useProgresoDePatron } from '../../_lib/motion/useProgresoDePatron'
import { LineasDeTexto } from '../../motion/_componentes/LineasDeTexto'
import { Pieza } from '../../motion/_componentes/Pieza'
import { Piezas } from '../../motion/_componentes/Piezas'

import type {
  CanalDePiezaProps,
  CanalDePiezasProps,
  CanalDeTitularProps,
  TextoPorLineasProps,
} from './canales'
import type { BloqueProps, PrimitivasDeCoreografia } from './coreografia'
import { ATRIBUTO_DE_PANEL } from './forma'
import { MARCA_COREOGRAFIA_DEL_HOME } from './marcaCoreografia'
import { ANCLA_DEL_PIN, especificacionDe, inerciaDe } from './motion'

/**
 * LAS PRIMITIVAS ANIMADAS — el único módulo del home que importa el sistema.
 *
 * ── Qué lo hace especial, y por qué está solo ─────────────────────────────
 *
 * Todo lo que importa de `_lib/motion/` y de `motion/_componentes/` está acá y
 * en ningún otro archivo del home. Es lo que hace que la compuerta sea
 * estructural y no cosmética: este módulo entra al grafo por un `import()`
 * perezoso —`Instalador.tsx`, con el mecanismo de S1— y abajo de 1025 ese
 * `import()` nunca se ejecuta, así que el navegador no pide su chunk.
 *
 * `MARCA_COREOGRAFIA_DEL_HOME` viaja adentro para que `s7-compuerta` pueda
 * afirmarlo sobre la SALIDA DEL BUILD y no sobre una promesa: la marca tiene
 * que existir en algún chunk —o el buscador está ciego— y no puede aparecer en
 * la carga inicial de `/v3`.
 *
 * ── Qué NO reimplementa ───────────────────────────────────────────────────
 *
 * El sistema. `PATRONES` con sus valores medidos, `useProgresoDePatron` como
 * motor, y las tres piezas de glue de S2 (`Pieza`, `Piezas`, `LineasDeTexto`)
 * se consumen tal cual. Lo único propio es el cableado.
 *
 * ⚠ Las tres piezas de glue viven en `motion/_componentes/`, que es la carpeta
 * privada de la ruta de demostración de S2 y está declarada como deuda con
 * fecha de baja. **Este archivo es el único punto del home que las importa**,
 * así que el día que se muevan a `_lib/motion/` lo que cambia son tres líneas,
 * acá. Los dos lanes lo habían acotado a un archivo cada uno; ahora es uno solo
 * para las ocho secciones.
 *
 * ── Los valores son los MEDIDOS, sin perillas ─────────────────────────────
 *
 * `BloqueDePatron` del demo multiplica duración y escalonado por los factores
 * de la mesa de calibración y puede forzar una curva. Acá no hay perillas: el
 * sitio corre en lo medido. La calibración fina la hace el ojo sobre la mesa,
 * no sobre el sitio.
 */

/**
 * De dónde salen las anclas del bloque, resuelto acá porque es acá donde se
 * puede: el seam quieto sólo maneja la palabra.
 */
function anclasDe(props: BloqueProps): ParDeAnclas {
  if (props.patron === 'pin') return ANCLA_DEL_PIN
  return PATRONES[props.patron].anclas
}

/**
 * QUÉ ELEMENTO SE MIDE. **[B1]**
 *
 * `anclaje: 'seccion'` sube al ancestro que lleva el alto del recorrido. Es lo
 * único que esa propiedad hace: **no toca el ancla**, que sigue siendo la del
 * patrón. El porqué —con el número que lo fuerza y con la forma anterior, que
 * estaba mal y lo empeoraba— está en `AnclajeDelBloque` (`coreografia.tsx`).
 *
 * Si el ancestro no existe devuelve el propio bloque, que es el defecto: una
 * sección que no es un panel del recorrido no tiene por qué romperse, y el
 * invariante de la sección que pide `'seccion'` afirma que ahí SÍ existe.
 */
function elementoMedido(el: HTMLElement, anclaje: BloqueProps['anclaje']): HTMLElement {
  if (anclaje !== 'seccion') return el
  const panel = el.closest(`[${ATRIBUTO_DE_PANEL}]`)
  return panel instanceof HTMLElement ? panel : el
}

/**
 * La inercia del `scrub`, o `null`.
 *
 * El pin no lleva inercia y no es un valor por defecto: es la decisión que el
 * bloque de `Servicios` traía escrita. Un resorte sobre el progreso del pin
 * haría que el nombre del servicio cambie después de que el scroll paró.
 */
function inerciaDelBloque(props: BloqueProps): number | null {
  if (props.patron === 'pin') return null
  // ⚠ `anclaje: 'pin'` NO entra acá, y la asimetría es deliberada: lo que esa
  // propiedad cambia es contra qué recorrido se reparte el patrón, no cómo
  // persigue el cabezal. La inercia es una decisión del PATRÓN —`scrub` en
  // SCROLL.md— y quitársela porque la sección esté pinneada sería anular un
  // valor medido por la puerta de atrás. P7 declara `scrub: true`, así que hoy
  // esto devuelve `null` para Trabajos por la razón correcta.
  return inerciaDe(PATRONES[props.patron])
}

/**
 * El estilo del bloque: SÓLO la perspectiva, y sólo cuando el patrón la
 * declara.
 *
 * Sin alto mínimo —ése es el punto de no usar el bloque del demo, que escribe
 * uno derivado de la geometría del INSTRUMENTO— y sin ninguna otra propiedad.
 * La perspectiva sí va, y va acá: se midió `perspective: 1000px` **en un
 * ancestro** de los 44 planos de la referencia, no en cada plano. Es la
 * diferencia entre doce planos compartiendo un punto de fuga y doce planos con
 * doce puntos de fuga distintos.
 */
function estiloDelBloque(props: BloqueProps): React.CSSProperties | undefined {
  if (props.patron === 'pin') return props.style
  const perspectivaPx = PATRONES[props.patron].perspectivaPx
  if (perspectivaPx === undefined) return props.style
  return { ...props.style, perspective: `${perspectivaPx}px` }
}

function BloqueConMotor(props: BloqueProps): React.JSX.Element {
  // El `ref` que baja al motor apunta al ELEMENTO MEDIDO, que con
  // `anclaje: 'seccion'` no es este `div` sino su `<section>`. No sube: leer una
  // propiedad que contiene un `ref` durante el render dispara
  // `react-hooks/refs`.
  const refDeMedida = useRef<HTMLElement | null>(null)
  const anclaje = props.anclaje

  /**
   * ⚠ **Un `ref` de callback y no un `useEffect`, y es la condición de que esto
   * funcione.** El motor resuelve su rango adentro de un `useEffect` propio, y
   * los efectos de un hook corren ANTES que los del componente que lo llama: un
   * `useEffect` acá poblaría `refDeMedida` después de que el motor ya lo leyó
   * nulo, y el patrón se quedaría sin rango en el primer montaje. Un `ref` de
   * callback corre en el commit, antes de cualquier efecto.
   */
  const montar = useCallback(
    (el: HTMLDivElement | null) => {
      refDeMedida.current = el === null ? null : elementoMedido(el, anclaje)
    },
    [anclaje],
  )

  const progreso = useProgresoDePatron({
    ref: refDeMedida,
    anclas: anclasDe(props),
    inerciaSegundos: inerciaDelBloque(props),
  })

  return (
    // `data-arbol` con la marca del chunk animado, igual que la rama quieta con
    // la suya: un atributo en un `div` que se renderiza de verdad. Es el mismo
    // mecanismo que S2 usa para su chunk, y la razón es la misma — una
    // constante exportada y no usada la puede podar el empaquetador.
    <div
      ref={montar}
      data-arbol={MARCA_COREOGRAFIA_DEL_HOME}
      data-anclaje={anclaje ?? 'propia'}
      className={props.className}
      style={estiloDelBloque(props)}
    >
      {props.children(progreso)}
    </div>
  )
}

function CanalDePiezaAnimado(props: CanalDePiezaProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('CanalDePieza animado sin progreso')
  return (
    <Pieza
      spec={especificacionDe(PATRONES[props.patron], props.cantidad)}
      indice={props.indice}
      progreso={progreso}
      como={props.como}
      className={props.className}
    >
      {props.children}
    </Pieza>
  )
}

function CanalDePiezasAnimado(props: CanalDePiezasProps): React.JSX.Element {
  const spec = especificacionDe(PATRONES[props.patron], props.cantidad)
  return (
    <Piezas
      estado={{ progreso: props.progreso, spec, cronograma: spec.cronograma }}
      cantidad={props.cantidad}
      className={props.className}
      contenedor={props.contenedor}
      como={props.como}
      render={props.render}
    />
  )
}

function CanalDeTitularAnimado(props: CanalDeTitularProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('CanalDeTitular animado sin progreso')
  const patron = PATRONES[props.patron]
  return (
    <Titular nivel={props.nivel} como={props.como} className={props.className}>
      <LineasDeTexto
        texto={props.texto}
        progreso={progreso}
        claves={patron.claves}
        curva={patron.curva}
        duracionDeclarada={patron.duracionDeclarada}
        escalonado={patron.escalonado}
      />
    </Titular>
  )
}

function TextoPorLineasAnimado(props: TextoPorLineasProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('TextoPorLineas animado sin progreso')
  const patron = PATRONES[props.patron]
  const Etiqueta = props.como
  return (
    <div data-texto-por-lineas="partido">
      {/* El encabezado real. Es lo ÚNICO que entra al árbol de accesibilidad. */}
      <Etiqueta id={props.id} className="sr-only">
        {props.texto}
      </Etiqueta>
      <div aria-hidden="true">
        <LineasDeTexto
          texto={props.texto}
          progreso={progreso}
          claves={patron.claves}
          curva={patron.curva}
          duracionDeclarada={patron.duracionDeclarada}
          escalonado={patron.escalonado}
          className={props.className}
        />
      </div>
    </div>
  )
}

/**
 * El juego completo. Es lo que el instalador mete en el contexto, y lo que un
 * instrumento puede pasarle al proveedor para renderizar la rama animada sin
 * navegador ni compuerta.
 */
export const PRIMITIVAS_ANIMADAS: PrimitivasDeCoreografia = {
  Bloque: BloqueConMotor,
  CanalDePieza: CanalDePiezaAnimado,
  CanalDePiezas: CanalDePiezasAnimado,
  CanalDeTitular: CanalDeTitularAnimado,
  TextoPorLineas: TextoPorLineasAnimado,
}
