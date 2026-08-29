'use client'

import { duracionAplicada, proporcionDeUnHijo } from '../../_lib/motion/cronograma'
import { NOMBRE_EN_GSAP } from '../../_lib/motion/curvas'
import { SEPARACION_SVH } from '../../_lib/motion/escenografia'
import { palabrasDe } from '../../_lib/motion/lineas'
import type { IdDePatron, Patron } from '../../_lib/motion/patrones'
import type { Ajustes } from './ajustes'
import { BloqueDePatron, type EstadoDelBloque } from './BloqueDePatron'
import { ContenidoP4, ContenidoP5, ContenidoP7, ContenidoP8, ContenidoP9 } from './contenidosPiezas'
import {
  CLASE_CUERPO,
  CLASE_ETIQUETA,
  ContenidoP1,
  ContenidoP2,
  ContenidoP3,
  ContenidoP6,
} from './contenidosTexto'
import {
  ITEMS_DE_LISTA,
  PARRAFO_QUE_ENCIENDE,
  PIEZAS_DEL_VUELO,
  PIEZAS_DE_LA_GRILLA,
  PLANOS,
} from './relleno'

/**
 * UNA SECCIÓN POR PATRÓN — el nombre, los números medidos, y el patrón corriendo.
 *
 * La ficha de arriba no es decoración: es lo que permite mirar el gesto y a la
 * vez ver de qué números sale. En particular hace visible la trampa de la
 * duración —2 s declarados que se vuelven 8,2 s aplicados— sin tener que abrir
 * `SCROLL.md`.
 */

const CONTENIDOS: Readonly<
  Record<IdDePatron, (props: { estado: EstadoDelBloque }) => React.JSX.Element>
> = {
  P1: ContenidoP1,
  P2: ContenidoP2,
  P3: ContenidoP3,
  P4: ContenidoP4,
  P5: ContenidoP5,
  P6: ContenidoP6,
  P7: ContenidoP7,
  P8: ContenidoP8,
  P9: ContenidoP9,
}

/**
 * Cuántas piezas anima cada bloque del demo.
 *
 * ⚠ P1 es el único cuya cantidad real no se conoce antes de medir: son las
 * líneas que decida el navegador. Va la del bloque más largo (seis, el extremo
 * medido). El escalonado de cada bloque usa su cantidad real —`LineasDeTexto` la
 * construye—, así que este número solo interviene en el modo `tiempo-real`, para
 * calcular el total en segundos. Si el navegador parte en más de seis, ese modo
 * corre proporcionalmente más rápido; el modo atado al scroll no se entera.
 */
const CANTIDADES: Readonly<Record<IdDePatron, number>> = {
  P1: 6,
  P2: 1,
  P3: palabrasDe(PARRAFO_QUE_ENCIENDE).length,
  P4: ITEMS_DE_LISTA.length,
  P5: 1,
  P6: 1,
  P7: PLANOS.length,
  P8: PIEZAS_DEL_VUELO,
  P9: PIEZAS_DE_LA_GRILLA,
}

const numero = (n: number): string => (Math.round(n * 100) / 100).toLocaleString('es-AR')

function Dato({ nombre, valor }: { nombre: string; valor: string }): React.JSX.Element {
  return (
    <div className="flex flex-col">
      <dt className={`${CLASE_ETIQUETA} text-tinta-tenue`}>{nombre}</dt>
      <dd className="font-codigo text-caption text-tinta">{valor}</dd>
    </div>
  )
}

function Ficha({
  patron,
  ajustes,
  cantidad,
}: {
  patron: Patron
  ajustes: Ajustes
  cantidad: number
}): React.JSX.Element {
  const cronograma = {
    duracionDeclarada: patron.duracionDeclarada * ajustes.factorDeDuracion,
    escalonado: patron.escalonado * ajustes.factorDeEscalonado,
    cantidad,
  }
  const total = duracionAplicada(cronograma)
  const curva = ajustes.curvaForzada ?? patron.curva

  return (
    <header className="border-borde mb-12 flex flex-col gap-4 border-t pt-4">
      <div className="flex items-baseline gap-4">
        <span className="font-codigo text-titulo-s text-tinta-media">{patron.id}</span>
        <h2 className="font-titulo text-titulo-m leading-titulo tracking-titulo">
          {patron.nombre}
        </h2>
      </div>
      <p className={`${CLASE_CUERPO} text-tinta-media max-w-tope`}>{patron.efecto}</p>
      <dl className="grid grid-cols-4 gap-4">
        <Dato nombre="instancias" valor={`${patron.instancias} de 244`} />
        <Dato nombre="curva" valor={`${curva} · ${NOMBRE_EN_GSAP[curva]}`} />
        <Dato nombre="duración declarada" valor={`${numero(cronograma.duracionDeclarada)} s`} />
        <Dato nombre="duración aplicada" valor={`${numero(total)} s`} />
        <Dato nombre="escalonado" valor={`${numero(cronograma.escalonado)} s`} />
        <Dato nombre="piezas" valor={String(cantidad)} />
        <Dato
          nombre="una pieza ocupa"
          valor={`${numero(proporcionDeUnHijo(cronograma) * 100)} % del recorrido`}
        />
        <Dato nombre="scrub" valor={patron.scrub === true ? 'sin inercia' : `${patron.scrub} s`} />
        <Dato nombre="ancla · inicio" valor={patron.anclas.inicio.declarado} />
        <Dato nombre="ancla · fin" valor={patron.anclas.fin.declarado} />
        <Dato nombre="elementos" valor={patron.elementos} />
        <Dato nombre="piezas medidas" valor={patron.piezas.nota} />
      </dl>
      {patron.discrepancia !== undefined && (
        <p className="font-codigo text-caption text-tinta-media border-borde border-l pl-3">
          {patron.discrepancia}
        </p>
      )}
    </header>
  )
}

export function SeccionDePatron({
  patron,
  ajustes,
}: {
  patron: Patron
  ajustes: Ajustes
}): React.JSX.Element {
  const Contenido = CONTENIDOS[patron.id]
  const cantidad = CANTIDADES[patron.id]

  return (
    <section
      id={patron.id}
      className="px-[var(--pad-lateral-compacto)]"
      style={{ paddingBlock: `${SEPARACION_SVH}svh` }}
    >
      <div className="max-w-tope mx-auto">
        <Ficha patron={patron} ajustes={ajustes} cantidad={cantidad} />
        <BloqueDePatron
          patron={patron}
          ajustes={ajustes}
          cantidadDePiezas={cantidad}
          className="relative"
        >
          {(estado) => <Contenido estado={estado} />}
        </BloqueDePatron>
      </div>
    </section>
  )
}
