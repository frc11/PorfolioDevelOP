'use client'

import type { MotionValue } from 'motion/react'
import { createContext, useContext, type ReactNode } from 'react'

import type { IdDePatron } from '../../_lib/motion/patrones'

import type {
  CanalDePiezaProps,
  CanalDePiezasProps,
  CanalDeTitularProps,
  TextoPorLineasProps,
} from './canales'
import { MARCA_HOME_QUIETO } from './marcaHomeQuieto'

/**
 * EL SEAM DE LA COREOGRAFÍA — el árbol quieto vive acá, y el animado se enchufa.
 *
 * ═══ EL PROBLEMA QUE RESUELVE, QUE ES EL HALLAZGO GRANDE DE LOS DOS LANES ═══
 *
 * Los dos lanes de secciones reportaron lo mismo por separado: **la coreografía
 * viajaba en la carga inicial en TODOS los anchos.** Abajo de 1025 el
 * comportamiento estaba gateado —no se montaba el motor, no se partía el texto,
 * no se escribía una transformada— pero el código bajaba igual, porque una
 * sección era UN árbol que importaba el sistema de motion de forma estática y
 * decidía en tiempo de ejecución.
 *
 * Eso contradice una decisión cerrada del proyecto, la que S1 escribió para el
 * escenario: *"el bundle no se importa abajo del umbral. No es una clase de CSS
 * que esconde."*
 *
 * ── Por qué no se arregla sección por sección ─────────────────────────────
 *
 * Porque hacerlo ocho veces son ocho implementaciones que divergen, y el modo
 * de falla de eso es el peor posible: que la persona de mobile lea un contenido
 * distinto del de escritorio. Los dos lanes lo dijeron con esas palabras y
 * tenían razón.
 *
 * ── La forma que toma acá: UNA compuerta arriba, DOS juegos de primitivas ──
 *
 * Este módulo declara las primitivas con las que las ocho secciones se
 * escriben —el `Bloque` acá, los canales en `canales.tsx`— y las implementa
 * **quietas**: DOM plano, sin un solo import de valor del sistema de motion.
 * Ése es el árbol que se sirve y el que baja siempre.
 *
 * El árbol animado no es otro árbol de contenido: es el MISMO, con las
 * primitivas reemplazadas. Las implementaciones animadas viven en
 * `coreografia-animada.tsx`, que importa el sistema entero, y llegan por
 * contexto desde un módulo que se pide con `import()` perezoso —el mecanismo de
 * S1— sólo arriba del umbral.
 *
 * **La consecuencia que importa: el contenido está escrito UNA vez.** No hay
 * dos árboles que puedan decir cosas distintas, porque hay uno solo; lo único
 * que cambia es quién envuelve cada pieza. Igual se comprueba —`s7-arboles`
 * compara el texto renderizado de las dos ramas y exige que sea el mismo— por
 * la misma razón por la que se comprueba todo acá: que algo sea verdad por
 * construcción no es lo mismo que que esté verificado.
 *
 * ── Lo único que este archivo NO puede tener ──────────────────────────────
 *
 * Un import de valor de `_lib/motion/` o de `motion/_componentes/`. Si lo
 * tuviera, el sistema de motion volvería a la carga inicial y toda esta
 * arquitectura sería decorativa. Los tipos sí se importan: `import type` se
 * borra al compilar y no deja una línea en el bundle. `s7-compuerta` lo afirma
 * sobre la salida del build, con marca y control positivo, y `s7-contrato` lo
 * afirma además sobre el fuente, que es donde se puede decir CUÁL import sobra.
 */

/**
 * El progreso de un bloque, o `null` cuando no hay coreografía.
 *
 * Es el tipo que cruza el seam, y `MotionValue` entra como TIPO: la librería ya
 * viaja en la carga inicial de toda ruta —el layout raíz importa el chrome
 * viejo, que la usa— pero eso no es motivo para importarla de valor acá. Lo que
 * este archivo no importa, no puede arrastrar.
 */
export type Progreso = MotionValue<number> | null

/** La forma de las primitivas animadas. La cumple `coreografia-animada.tsx`. */
export interface PrimitivasDeCoreografia {
  readonly Bloque: (props: BloqueProps) => React.JSX.Element
  readonly CanalDePieza: (props: CanalDePiezaProps) => React.JSX.Element
  readonly CanalDePiezas: (props: CanalDePiezasProps) => React.JSX.Element
  readonly CanalDeTitular: (props: CanalDeTitularProps) => React.JSX.Element
  readonly TextoPorLineas: (props: TextoPorLineasProps) => React.JSX.Element
}

const Contexto = createContext<PrimitivasDeCoreografia | null>(null)

/**
 * Instala las primitivas animadas para todo el subárbol.
 *
 * Con `null` —el defecto, y lo que hay en el servidor y abajo de 1025— cada
 * primitiva usa su implementación quieta. **No hay un tercer estado**: o están
 * las animadas o está el DOM plano.
 */
export function ProveedorDeCoreografia({
  primitivas,
  children,
}: {
  readonly primitivas: PrimitivasDeCoreografia | null
  readonly children: ReactNode
}): React.JSX.Element {
  return <Contexto value={primitivas}>{children}</Contexto>
}

/**
 * Las primitivas vigentes.
 *
 * Las secciones NO llaman a este hook: lo llaman las primitivas —`Bloque` acá y
 * los canales en `canales.tsx`—, que es lo que permite que una sección no sepa
 * si anima. Se exporta para los canales y para nadie más.
 */
export function usePrimitivas(): PrimitivasDeCoreografia | null {
  return useContext(Contexto)
}

/** Si la coreografía está instalada. Lo usa el instrumento, no una sección. */
export function useCoreografiaActiva(): boolean {
  return usePrimitivas() !== null
}

// ═══════════════════════════════════════════════════════════════════════════
// EL BLOQUE MEDIDO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * QUÉ MIDE UN BLOQUE. Un patrón, o el pin.
 *
 *   `'P1'`…`'P9'`  el rango de scroll que el patrón declara (SCROLL.md §3), con
 *                  su inercia de `scrub` y su perspectiva si la tiene.
 *   `'pin'`        `top top` → `bottom bottom`, la geometría del `sticky`: una
 *                  sección de 300svh con un hijo de 100svh queda clavada 200svh,
 *                  y el progreso vale 0 cuando el pin empieza y 1 cuando
 *                  termina. Es lo que necesita una secuencia pinneada para
 *                  repartirse en tramos iguales. **Sin inercia, y es una
 *                  decisión declarada:** los canales discretos de una secuencia
 *                  —el nombre, el medio, el acento— no pueden llegar tarde; con
 *                  un resorte el nombre cambiaría DESPUÉS de que el scroll paró.
 *
 * Entra como PALABRA y no como objeto de anclas **a propósito**: un objeto
 * obligaría a la sección a importar `_lib/motion/anclas`, y con eso el sistema
 * entero volvería a la carga inicial. La palabra la resuelve la implementación
 * animada, que es la única que puede.
 */
export type FuenteDelBloque = IdDePatron | 'pin'

/**
 * QUÉ CAJA MIDE EL BLOQUE. **[B1 · medido]**
 *
 *   `'propia'`   la caja del bloque. Es el defecto y es lo correcto para una
 *                sección que scrollea: el gesto empieza y termina con el
 *                elemento que lo lleva.
 *   `'seccion'`  la caja de la `<section>` del recorrido —el ancestro más
 *                cercano con `ATRIBUTO_DE_PANEL`—, o sea la que lleva el alto
 *                declarado de la tabla. **Las anclas siguen siendo las del
 *                patrón**: lo único que cambia es contra qué caja se resuelven.
 *
 * ── Por qué existe, con los dos números que la fuerzan ────────────────────
 *
 * **Un bloque adentro de un hijo `sticky` no se mueve, así que su patrón se
 * consume antes de que la sección llegue a cuadro.** Medido en Trabajos a
 * 1920×1080, con la página recién cargada y `visibilityState: 'visible'`: los
 * tres planos de P7 pasan de opacidad 0 a 1 y vuelven a 0 entre `scrollY` 3595
 * y 4270, y la sección empieza en 4320. **Terminan de desaparecer 50 px ANTES
 * de que la sección toque el tope del viewport**, y durante sus tres pantallas
 * —4320 a 7560— las tres tarjetas están en opacidad 0: 85,65 % de aire muerto
 * sobre el píxel y una banda vacía continua de 849 px.
 *
 * La cuenta: el ancla de P7 es `top bottom` → `bottom bottom`, o sea `rango =
 * alto del elemento medido` = 826 px para el bloque, resuelto contra su
 * posición NATURAL (el motor mide `caja.top + window.scrollY` una vez por
 * época). Un elemento de 826 px adentro de una sección de 3240 consume su
 * patrón en el 25 % del recorrido. Con la `<section>` como caja medida el mismo
 * ancla da `rango = 3240`, del `scrollY` 3240 al 6480: el gesto arranca cuando
 * la sección entra y cierra cuando el pin suelta.
 *
 * ⚠️ **LA PRIMERA FORMA DE ESTA PROPIEDAD ESTABA MAL, Y SE DECLARA.** Nació
 * como `'patron' | 'pin'`, donde `'pin'` cambiaba el ANCLA a `ANCLA_DEL_PIN` y
 * seguía midiendo la caja del bloque. **Medido: eso lo empeoraba.** Con un
 * bloque de 826 px, `alto − viewport` da −254 y `rangoDeScroll` lo acota a
 * `RANGO_MINIMO_PX = 1`: los tres planos saltaban de `translateZ −3000` a
 * `+1000` entre `scrollY` 4540 y 4550 y quedaban en opacidad 0 **en todo el
 * documento**. La pregunta no era cuál ancla, era **qué caja**: el ancla del
 * patrón sobre la caja correcta ya dice lo que hay que decir.
 *
 * ⚠ **No alcanza con `patron: 'pin'`.** Esa palabra cambia las anclas Y pierde
 * los fotogramas del patrón: `estiloDelBloque` deja de emitir la perspectiva de
 * 1000 px que P7 declara, y sin perspectiva un `translateZ` no se ve.
 *
 * Servicios no la necesita: su secuencia pide `patron: 'pin'` sobre un bloque
 * que YA mide la sección entera, y no consume fotogramas de profundidad.
 */
export type AnclajeDelBloque = 'propia' | 'seccion'

export interface BloqueProps {
  /** Qué mide. Por NOMBRE: ningún objeto del sistema cruza el seam. */
  readonly patron: FuenteDelBloque
  /**
   * Qué caja se mide. Por defecto, la propia. `'seccion'` sólo tiene sentido
   * adentro de una sección `pinneada` de `secciones.ts` —en una que scrollea las
   * dos cajas se mueven juntas y la distinción no compra nada—, y el invariante
   * de la sección que lo usa lo afirma contra la tabla.
   */
  readonly anclaje?: AnclajeDelBloque
  readonly className?: string
  readonly style?: React.CSSProperties
  /** Recibe el progreso, o `null` cuando no hay coreografía. */
  readonly children: (progreso: Progreso) => ReactNode
}

/**
 * EL BLOQUE — el elemento que se mide, y de dónde cuelga el motor.
 *
 * ── La regla estructural, heredada de los dos lanes ───────────────────────
 *
 * **El elemento que se mide nunca se transforma.** El `ref` del motor va en un
 * `div` pelado y todo lo que se mueve es descendiente suyo.
 * `getBoundingClientRect()` devuelve coordenadas contaminadas cuando hay
 * transformadas activas —lección ya pagada en este repo— y medir el mismo
 * elemento que uno anima es la forma más corta de caer en eso.
 *
 * ── Por qué la rama quieta NO escribe `perspective` ───────────────────────
 *
 * Porque no hay nada que poner en perspectiva: `perspective` sólo tiene efecto
 * sobre descendientes con transformada 3D, y en la rama quieta no hay ninguna.
 * Los dos únicos patrones que la declaran son P7 y P8 (1000 px), y el único que
 * alguna sección consume es P7, en Trabajos.
 *
 * ⚠ La propiedad tiene un efecto secundario real —crea bloque contenedor para
 * descendientes posicionados— así que no alcanza con decir "es inerte". La rama
 * quieta de Trabajos no tiene ni un descendiente `absolute`, y eso lo afirma
 * `s7-arboles` sobre el marcado renderizado, no este comentario.
 */
export function Bloque(props: BloqueProps): React.JSX.Element {
  const primitivas = usePrimitivas()
  if (primitivas !== null) return <primitivas.Bloque {...props} />
  return (
    // `data-arbol` lleva la marca del chunk, y es el mismo mecanismo con el que
    // S2 marca el suyo: un atributo en un `div` que el módulo renderiza de
    // verdad. Una constante exportada y no usada la puede podar el empaquetador,
    // y entonces el instrumento se queda sin nada que buscar. De paso el DOM
    // dice qué rama se está mirando, que es lo primero que uno quiere saber.
    <div data-arbol={MARCA_HOME_QUIETO} className={props.className} style={props.style}>
      {props.children(null)}
    </div>
  )
}
