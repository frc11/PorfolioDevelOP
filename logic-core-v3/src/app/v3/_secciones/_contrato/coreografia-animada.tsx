'use client'

import { useRef } from 'react'

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
 * La inercia del `scrub`, o `null`.
 *
 * El pin no lleva inercia y no es un valor por defecto: es la decisión que el
 * bloque de `Servicios` traía escrita. Un resorte sobre el progreso del pin
 * haría que el nombre del servicio cambie después de que el scroll paró.
 */
function inerciaDelBloque(props: BloqueProps): number | null {
  if (props.patron === 'pin') return null
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
  // El `ref` se crea acá y baja al motor. No sube: leer una propiedad que
  // contiene un `ref` durante el render dispara `react-hooks/refs`, y el `div`
  // de abajo es el único lugar donde se usa.
  const ref = useRef<HTMLDivElement | null>(null)
  const progreso = useProgresoDePatron({
    ref,
    anclas: anclasDe(props),
    inerciaSegundos: inerciaDelBloque(props),
  })

  return (
    // `data-arbol` con la marca del chunk animado, igual que la rama quieta con
    // la suya: un atributo en un `div` que se renderiza de verdad. Es el mismo
    // mecanismo que S2 usa para su chunk, y la razón es la misma — una
    // constante exportada y no usada la puede podar el empaquetador.
    <div
      ref={ref}
      data-arbol={MARCA_COREOGRAFIA_DEL_HOME}
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
