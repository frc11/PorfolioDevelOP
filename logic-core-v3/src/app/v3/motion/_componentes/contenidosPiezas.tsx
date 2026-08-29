'use client'

import type { EstadoDelBloque } from './BloqueDePatron'
import { CLASE_ETIQUETA, CLASE_TITULO } from './contenidosTexto'
import { Pieza } from './Pieza'
import { Piezas } from './Piezas'
import {
  BLOQUE_QUE_CRECE,
  ITEMS_DE_LISTA,
  PIEZAS_DEL_VUELO,
  PIEZAS_DE_LA_GRILLA,
  PLANOS,
} from './relleno'

/**
 * EL CONTENIDO DE LOS CINCO PATRONES DE PIEZAS — P4, P5, P7, P8 y P9.
 *
 * P7 es el que importa más allá de esta ruta: es el mecanismo con el que van a
 * entrar los proyectos en la sección de Trabajos.
 */

const CLASE_PIEZA = 'bg-superficie-2 border-borde rounded-sutil aspect-square border'

/**
 * P4 — la lista que entra desde abajo, muy frenada.
 *
 * Once ítems, la cantidad medida. La lista es un `ul` de verdad: el patrón anima
 * `li` en la referencia y cambiar la semántica por conveniencia de animación es
 * exactamente lo que produce los hallazgos de accesibilidad que no queremos.
 */
export function ContenidoP4({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <p className={CLASE_ETIQUETA}>once ítems · quíntica de salida</p>
      <ul className="border-borde flex flex-col border-t">
        {ITEMS_DE_LISTA.map((item, i) => (
          <li key={item} className="border-borde border-b py-3">
            {estado.progreso === null ? (
              <span className={CLASE_TITULO}>{item}</span>
            ) : (
              <Pieza spec={estado.spec} indice={i} progreso={estado.progreso}>
                <span className={CLASE_TITULO}>{item}</span>
              </Pieza>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * P5 — la aparición con crecimiento, a velocidad constante.
 *
 * El bloque es alto a propósito: su ancla (`top top+=20%` → `bottom bottom-=40%`)
 * mide `alto − 0,4·viewport`, o sea que un bloque bajo da un recorrido negativo.
 * El alto sale de `altoDelBloqueSvh`, no de un número elegido.
 */
export function ContenidoP5({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  const tarjeta = (
    <div className="bg-superficie-1 border-borde flex h-full flex-col justify-end gap-3 border p-8">
      <p className={CLASE_ETIQUETA}>ease: none · el único patrón lineal</p>
      <p className={CLASE_TITULO}>{BLOQUE_QUE_CRECE}</p>
    </div>
  )

  // `absolute inset-0` y no `h-full`: el bloque declara un ALTO MÍNIMO, no un
  // alto, así que un porcentaje no tiene contra qué resolverse. El posicionado
  // absoluto sí — el bloque es `relative`.
  if (estado.progreso === null) return <div className="absolute inset-0">{tarjeta}</div>

  return (
    <Pieza spec={estado.spec} indice={0} progreso={estado.progreso} className="absolute inset-0">
      {tarjeta}
    </Pieza>
  )
}

/**
 * P7 — los planos en profundidad. La secuencia 3D, sobre DOM.
 *
 * Doce planos apilados en el mismo lugar, cada uno con su retraso de 0,4 s. Cada
 * uno llega desde `translateZ: −3000` y sigue de largo hacia `+1000`, y en el
 * camino conmuta `pointerEvents`: lo que está lejos no es clickeable, que es lo
 * que la referencia resolvió con `autoAlpha` + `pointerEvents` y no con
 * `opacity` sola.
 *
 * La perspectiva vive en el bloque —`perspective: 1000px`, medido— y no en cada
 * plano: con la perspectiva por elemento cada uno tendría su propio punto de
 * fuga y la pila dejaría de leerse como una escena.
 */
export function ContenidoP7({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  return (
    <>
      <p className={`${CLASE_ETIQUETA} absolute top-0 left-0`}>
        doce planos · translateZ −3000 → +1000 · dos curvas
      </p>
      <Piezas
        estado={estado}
        cantidad={PLANOS.length}
        contenedor="absolute inset-0"
        className="absolute inset-0 flex items-center justify-center"
        render={(i) => (
          <span
            className={`${CLASE_TITULO} bg-superficie-1 border-borde border px-8 py-6`}
          >
            {PLANOS[i]}
          </span>
        )}
      />
    </>
  )
}

/**
 * P8 — el vuelo de 32 piezas. La más elaborada de la referencia.
 *
 * Es el único patrón que combina traslación en profundidad, escala y rotación en
 * los tres ejes a la vez, y por eso es el que hace visible el orden de
 * composición de la transformada. Con `scrub: 2` —el más alto del sitio— arrastra
 * dos segundos detrás del scroll.
 */
export function ContenidoP8({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  return (
    <>
      <p className={`${CLASE_ETIQUETA} absolute top-0 left-0`}>
        32 piezas · 60° X, 80° Y, 45° Z · scrub 2
      </p>
      <Piezas
        estado={estado}
        cantidad={PIEZAS_DEL_VUELO}
        contenedor="grid grid-cols-8 gap-2 pt-12"
        className={CLASE_PIEZA}
        render={() => null}
      />
    </>
  )
}

/**
 * P9 — la grilla que crece. 18 piezas, sin desplazamiento ni rotación.
 * El único uso de `power2.inOut` de todo el corpus.
 */
export function ContenidoP9({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  return (
    <>
      <p className={`${CLASE_ETIQUETA} absolute top-0 left-0`}>
        18 piezas · escala 0,4 → 1 · power2.inOut
      </p>
      <Piezas
        estado={estado}
        cantidad={PIEZAS_DE_LA_GRILLA}
        contenedor="grid grid-cols-6 gap-2 pt-12"
        className={CLASE_PIEZA}
        render={() => null}
      />
    </>
  )
}
