'use client'

import { palabrasDe } from '../../_lib/motion/lineas'
import type { EstadoDelBloque } from './BloqueDePatron'
import { LineasDeTexto } from './LineasDeTexto'
import { Pieza } from './Pieza'
import { Piezas } from './Piezas'
import {
  BLOQUE_ENTERO,
  PARRAFO_QUE_ENCIENDE,
  SEIS_LINEAS,
  TEXTO_QUE_CRUZA,
  TRES_LINEAS,
  UNA_LINEA,
} from './relleno'

/**
 * EL CONTENIDO DE LOS CUATRO PATRONES DE TIPOGRAFÍA — P1, P2, P3 y P6.
 *
 * Cada uno recibe el estado del bloque —el progreso, o `null` si el movimiento
 * está reducido— y renderiza lo que le toca. Con `null` el texto se renderiza
 * entero, sin partir y sin transformadas: es la política, no una degradación.
 */

const CLASE_TITULO = 'font-titulo text-titulo-m leading-titulo tracking-titulo'
const CLASE_CUERPO = 'font-cuerpo text-cuerpo leading-texto tracking-texto'
const CLASE_ETIQUETA = 'font-codigo text-micro leading-micro tracking-micro uppercase text-tinta-media'

/**
 * P1 — el revelado línea por línea, en los tres tamaños medidos.
 *
 * Uno, tres y seis líneas: el rango que la medición encontró en la referencia.
 * Es el único patrón que se muestra tres veces, porque lo que hay que juzgar no
 * es el gesto sino cómo escala el escalonado con la cantidad de líneas.
 */
export function ContenidoP1({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  const bloques: readonly { etiqueta: string; texto: string }[] = [
    { etiqueta: 'una línea', texto: UNA_LINEA },
    { etiqueta: 'tres líneas', texto: TRES_LINEAS },
    { etiqueta: 'seis líneas', texto: SEIS_LINEAS },
  ]

  return (
    <div className="flex flex-col gap-12">
      {bloques.map(({ etiqueta, texto }) => (
        <div key={etiqueta} className="flex flex-col gap-2">
          <p className={CLASE_ETIQUETA}>{etiqueta}</p>
          {estado.progreso === null ? (
            <p className={CLASE_TITULO}>{texto}</p>
          ) : (
            <LineasDeTexto
              texto={texto}
              progreso={estado.progreso}
              claves={estado.spec.claves}
              curva={estado.spec.curva}
              duracionDeclarada={estado.spec.cronograma.duracionDeclarada}
              escalonado={estado.spec.cronograma.escalonado}
              className={CLASE_TITULO}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * P2 — el bloque entero. Una sola pieza, y por eso el escalonado queda inerte:
 * con una pieza, `duraciónAplicada` y `duraciónDeclarada` coinciden. Es el único
 * patrón donde eso pasa.
 */
export function ContenidoP2({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  const tarjeta = (
    <div className="bg-superficie-1 border-borde flex flex-col gap-3 border p-8">
      <p className={CLASE_ETIQUETA}>un solo target por instancia</p>
      <p className={CLASE_TITULO}>{BLOQUE_ENTERO}</p>
    </div>
  )

  if (estado.progreso === null) return <div className="overflow-hidden">{tarjeta}</div>

  return (
    <div className="overflow-hidden">
      <Pieza spec={estado.spec} indice={0} progreso={estado.progreso}>
        {tarjeta}
      </Pieza>
    </div>
  )
}

/**
 * P3 — el párrafo que se enciende, palabra por palabra.
 *
 * Las piezas son palabras y no líneas: la medición encontró entre 17 y 33
 * targets por instancia, que es el orden de las palabras de un párrafo, no el de
 * sus líneas. Y no hay recorte: nada se mueve de lugar, solo cambia el brillo,
 * así que un `overflow: hidden` no tendría qué recortar.
 */
export function ContenidoP3({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  const palabras = palabrasDe(PARRAFO_QUE_ENCIENDE)

  return (
    <div className="flex flex-col gap-2">
      <p className={CLASE_ETIQUETA}>{palabras.length} palabras</p>
      <Piezas
        estado={estado}
        cantidad={palabras.length}
        como="span"
        contenedor={CLASE_TITULO}
        className="inline-block"
        render={(i) => <>{palabras[i]}&nbsp;</>}
      />
    </div>
  )
}

/**
 * P6 — el texto que cruza. El único desplazamiento horizontal del corpus.
 *
 * Va de `x: 140` a `x: −140`: no llega y se queda, sigue de largo. Por eso el
 * contenedor recorta en horizontal — si no, el texto se sale de la columna.
 */
export function ContenidoP6({ estado }: { estado: EstadoDelBloque }): React.JSX.Element {
  const contenido = <p className={CLASE_TITULO}>{TEXTO_QUE_CRUZA}</p>

  return (
    <div className="flex flex-col gap-2">
      <p className={CLASE_ETIQUETA}>140 → −140, doscientos ochenta píxeles</p>
      <div className="overflow-hidden">
        {estado.progreso === null ? (
          contenido
        ) : (
          <Pieza spec={estado.spec} indice={0} progreso={estado.progreso}>
            {contenido}
          </Pieza>
        )}
      </div>
    </div>
  )
}

export { CLASE_CUERPO, CLASE_ETIQUETA, CLASE_TITULO }
