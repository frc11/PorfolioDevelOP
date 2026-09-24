'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useState, type RefObject } from 'react'

import { ATRIBUTO_DE_SERVICIO, SERVICIOS, type Servicio } from '../_contrato/acento'
import { CtaDelServicio } from './CtaDelServicio'
import { BloqueDeServicio } from './BloqueDeServicio'
import {
  ALTO_DEL_VACIO_DE_ENTRADA,
  CLASE_DE_BLOQUE_DE_LA_TIRA,
  CLASE_DE_LA_TIRA,
  CLASE_DE_LA_VENTANA,
  FRACCION_DEL_DESVANECIDO,
  LINEA_DE_FIN_DE_PINTURA,
  LINEA_DE_REFERENCIA,
  OPACIDAD_ATENUADA,
  UMBRAL_DE_ACTIVACION,
} from './geometria'
import { RotuloAnunciado } from './RotuloDeServicio'

/**
 * LA TIRA — los tres servicios apilados, y una sola traslación continua.
 *
 * No hay capas, no hay intercambio, no hay `sr-only` que apague nada, no hay
 * nada que se monte ni se desmonte. Hay UNA tira con los tres bloques uno
 * encima del otro y un `y` que es función LINEAL del progreso del pin. Por
 * construcción, ningún contenido de esta columna puede cambiar de posición
 * entre dos cuadros consecutivos sin haber viajado: no existe el mecanismo que
 * lo haría.
 *
 * ── De acá salen las DOS derivaciones, y las dos son geometría ────────────
 *
 * La tira es la que sabe dónde está cada bloque, así que es la que decide:
 *
 *   · **el estado del rodillo** — el bloque `i` toma el rodillo cuando su tope
 *     cruza la línea de referencia de la ventana. El acoplamiento va en UNA
 *     dirección: la posición decide el estado, nunca al revés.
 *   · **la pintura de cada párrafo** — empieza cuando el bloque entra por abajo
 *     y termina cuando su tope llega a `LINEA_DE_FIN_DE_PINTURA`, que está más
 *     abajo que la banda del difuminado. Así el párrafo SIEMPRE termina de
 *     escribirse antes de empezar a desvanecerse, a cualquier alto de pin.
 *
 * Que el estado 0 dure menos que los otros tres no es una constante: sale de
 * que el vacío de entrada es más corto que un bloque.
 *
 * ── Se mide con `offsetTop`/`offsetHeight`, nunca con el rect ─────────────
 *
 * La transformada no los toca; `getBoundingClientRect` sí, y ésa es una lección
 * ya pagada en este repo. Y el primer cuadro no depende de la medida: en `p = 0`
 * el `y` vale 0 y lo que se ve es el vacío de entrada, que tiene su alto en
 * `svh` y no necesita que nadie lo mida.
 */

export interface MedidaDeLaTira {
  /** Cuánto desborda la tira de su ventana. Cero si todavía no se midió. */
  readonly recorrido: number
  /** El alto de la ventana. De acá salen la banda y las dos líneas. */
  readonly alto: number
  /** El tope de cada bloque DENTRO de la tira, en el orden de la secuencia. */
  readonly topes: readonly number[]
}

export const SIN_MEDIR: MedidaDeLaTira = { recorrido: 0, alto: 0, topes: [] }

export function useMedidaDeLaTira(
  ventana: RefObject<HTMLDivElement | null>,
  tira: RefObject<HTMLDivElement | null>,
): MedidaDeLaTira {
  const [medida, setMedida] = useState<MedidaDeLaTira>(SIN_MEDIR)

  useEffect(() => {
    const caja = ventana.current
    const dentro = tira.current
    if (caja === null || dentro === null) return

    const medir = (): void => {
      const alto = caja.clientHeight
      // ⚠️ **NO se usa `offsetTop`, y la primera versión sí: descontaba 80 px.**
      // `offsetTop` es relativo al `offsetParent`, y la tira lleva un `transform`
      // —el `y` que la mueve—, así que ELLA es el `offsetParent` de sus hijos.
      // Restarle su propio `offsetTop` descontaba dos veces el `pt` del panel:
      // los topes daban 415 · 1315 · 2215 en vez de 495 · 1395 · 2295. Acumular
      // los altos no depende de quién esté posicionado y da lo mismo con y sin
      // transformada, que es la propiedad que acá hace falta.
      const topes: number[] = []
      let acumulado = 0
      for (const hijo of Array.from(dentro.children)) {
        if (hijo instanceof HTMLElement) {
          if (hijo.hasAttribute(ATRIBUTO_DE_SERVICIO)) topes.push(acumulado)
          acumulado += hijo.offsetHeight
        }
      }
      setMedida({ recorrido: Math.max(0, dentro.offsetHeight - alto), alto, topes })
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(caja)
    observador.observe(dentro)
    return () => observador.disconnect()
  }, [ventana, tira])

  return medida
}

function acotar01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/** El progreso del pin en el que el tope del bloque `i` cruza una línea. */
function progresoEnLaLinea(medida: MedidaDeLaTira, indice: number, fraccion: number): number {
  const tope = medida.topes[indice]
  if (medida.recorrido <= 0 || tope === undefined) return 1
  return acotar01((tope - medida.alto * fraccion) / medida.recorrido)
}

/**
 * LAS FRONTERAS, derivadas del tope medido de cada bloque.
 *
 * ⚠️ **Devuelve PUNTOS, no rampas, y ése es el cambio del sprint.** Antes
 * salían de acá los dos arreglos de `useTransform` que hacían que el rodillo
 * se BARRIERA con el scroll: el ancho del traspaso era una fracción del pin y
 * la rotación sólo avanzaba mientras el dedo avanzaba. Ahora la frontera es un
 * punto y lo único que hace al cruzarse es DISPARAR una animación por tiempo,
 * que corre sola aunque la persona frene.
 *
 * Dónde están las fronteras no cambió — sigue siendo el tope de cada bloque
 * contra la línea de referencia de la ventana. Cambió qué pasa al cruzarlas.
 */
export function fronterasDeEstado(medida: MedidaDeLaTira, linea: number = LINEA_DE_REFERENCIA): number[] {
  return SERVICIOS.map((_, i) => progresoEnLaLinea(medida, i, linea))
}

/**
 * ⚠️ **HAY UNA FRONTERA POR SERVICIO Y NI UNA MÁS, Y ESO ES UNA REGLA.**
 *
 * Hubo un intento de devolver la última porción de la torta a su tamaño
 * agregando acá una frontera de más, «sin rótulo detrás»: el rodillo llegaba a
 * un estado para el que no existe ranura. Costó tres clamps —el traslado, las
 * vueltas del giro y el servicio del botón— y **aun así rompió la sección**: con
 * las ranuras apagándose salvo las que participan del relevo, en ese estado no
 * quedaba ninguna encendida y el bloque del título entero desaparecía.
 *
 * La lección es de forma, no de calibración: **un estado de la secuencia es una
 * ranura del rodillo, y al revés.** Lo que no tiene rótulo no es un estado. La
 * vuelta de la torta cuelga ahora del punto de pintura directamente
 * (`cierreDeLaPintura`), que es donde el pedido la había puesto siempre.
 *
 * `s6-traspaso` §18 lo afirma por los dos lados: que las fronteras más una sean
 * exactamente las ranuras, y que en todo el recorrido haya siempre una ranura
 * encendida.
 */

/**
 * Dónde termina de pintarse la ÚLTIMA porción. Es el punto en el que la torta
 * empieza a volver a su tamaño: el mismo rango que gobierna su párrafo, así que
 * los dos no se pueden separar.
 */
export function cierreDeLaPintura(medida: MedidaDeLaTira): number {
  return rangoDePintura(medida, SERVICIOS.length - 1)[1]
}

/** Dónde empieza y dónde termina de pintarse el párrafo del bloque `i`. */
export function rangoDePintura(medida: MedidaDeLaTira, indice: number): [number, number] {
  // Empieza cuando el tope del bloque entra por el borde de ABAJO (fracción 1).
  const inicio = progresoEnLaLinea(medida, indice, 1)
  const fin = progresoEnLaLinea(medida, indice, LINEA_DE_FIN_DE_PINTURA)
  return fin > inicio ? [inicio, fin] : [inicio, inicio + 1e-4]
}

/** El degradado del borde de arriba. Armado: entero sería un literal con unidad. */
function mascaraDe(alto: number): string {
  if (alto <= 0) return 'none'
  const banda = alto * FRACCION_DEL_DESVANECIDO
  return `linear-gradient(${180}deg, transparent ${0}px, black ${banda}px)`
}

function BloqueEnLaTira({
  servicio,
  indice,
  progreso,
  medida,
}: {
  readonly servicio: Servicio
  readonly indice: number
  readonly progreso: MotionValue<number>
  readonly medida: MedidaDeLaTira
}): React.JSX.Element {
  const [inicio, fin] = rangoDePintura(medida, indice)
  const pintura = useTransform(progreso, [inicio, fin], [0, 1])

  return (
    <div data-servicio={servicio.id} className={CLASE_DE_BLOQUE_DE_LA_TIRA}>
      <RotuloAnunciado servicio={servicio} />
      <BloqueDeServicio servicio={servicio} pintura={pintura} disposicion="panel" />
      {/* MÓVIL 2: el CTA de cada servicio es de abajo de 1024 (acá va oculto); en el
          marcado está en las dos ramas, así las dos anuncian lo mismo. */}
      <CtaDelServicio servicio={servicio} />
    </div>
  )
}

export interface TiraDeServiciosProps {
  readonly progreso: MotionValue<number>
  readonly medida: MedidaDeLaTira
  readonly refDeLaVentana: RefObject<HTMLDivElement | null>
  readonly refDeLaTira: RefObject<HTMLDivElement | null>
}

export function TiraDeServicios({
  progreso,
  medida,
  refDeLaVentana,
  refDeLaTira,
}: TiraDeServiciosProps): React.JSX.Element {
  const y = useTransform(progreso, [0, 1], [0, -medida.recorrido])
  /**
   * ⚠️ **LA ENTRADA NO PUEDE ESTAR VACÍA, y no hace falta una segunda señal.**
   *
   * El progreso del pin está ACOTADO a [0,1], así que vale 0 durante toda la
   * aproximación y recién se mueve cuando el tope de la sección toca el tope de
   * la página. O sea que **el propio 0 es «todavía no llegué»**: alcanza con
   * leerlo para atenuar, sin `IntersectionObserver` ni un segundo `Bloque` —los
   * dos prohibidos por `s6-servicios` §7, que afirma un solo motor de progreso.
   *
   * Mientras la sección se acerca se ve el bloque 01 atenuado abajo del vacío;
   * al arrancar el pin gana contraste pleno, el rodillo dispara al 01 y la
   * pintura del primer párrafo empieza — las tres cosas en el mismo instante,
   * porque las tres cuelgan del mismo número.
   */
  const contraste = useTransform(progreso, [0, UMBRAL_DE_ACTIVACION], [OPACIDAD_ATENUADA, 1])

  return (
    <div
      ref={refDeLaVentana}
      data-columna="tira"
      className={CLASE_DE_LA_VENTANA}
      style={{ maskImage: mascaraDe(medida.alto) }}
    >
      <motion.div ref={refDeLaTira} className={CLASE_DE_LA_TIRA} style={{ y, opacity: contraste }}>
        {/* El vacío de entrada: lo que se ve mientras el rodillo dice
            «Nuestros servicios», y lo que hace que al llegar al 01 el párrafo
            esté ENTRANDO. Su alto va en `svh` para que se resuelva en el primer
            cuadro, sin esperar a una medición. */}
        <div
          aria-hidden="true"
          data-tira="vacio"
          className="w-full shrink-0"
          style={{ height: `${ALTO_DEL_VACIO_DE_ENTRADA * 100}svh` }}
        />
        {SERVICIOS.map((servicio, i) => (
          <BloqueEnLaTira
            key={servicio.id}
            servicio={servicio}
            indice={i}
            progreso={progreso}
            medida={medida}
          />
        ))}
      </motion.div>
    </div>
  )
}
