'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useId } from 'react'

import { ATRIBUTO_DE_SERVICIO, SERVICIOS, type Servicio } from '../_contrato/acento'
import { CLASE_DE_LA_TORTA } from './geometria'
import { rangoDePintura, type MedidaDeLaTira } from './TiraDeServicios'

/**
 * EL GRÁFICO DE TORTA — EXPERIMENTAL, y por eso todos sus números están a mano.
 *
 * Tres porciones iguales. Arranca chica y gris; la porción del servicio vigente
 * se agranda, sube y se va llenando con el MISMO avance que su párrafo; las ya
 * llenas quedan llenas; al cambiar de servicio la porción vuelve a su tamaño y
 * su lugar, y **recién ahí** la torta rota.
 *
 * ── ⚠️ NO TIENE ESPESOR, Y ES UNA DECISIÓN ────────────────────────────────
 *
 * Tenía: cada porción se dibujaba dos veces, la de abajo corrida `ESPESOR` px,
 * para leerse como un disco con canto. En pantalla **se leía como un segundo
 * gráfico gris detrás**, y el canto de las porciones sin llenar quedaba gris
 * siempre, porque la máscara del relleno cubre el disco y no el canto. Se fue
 * entero: una torta, plana, un solo disco. Si el espesor vuelve, no puede volver
 * como un disco corrido.
 *
 * ── ⚠️ EL RELLENO ES RADIAL, del centro al borde ──────────────────────────
 *
 * La primera versión lo hizo con `strokeDashoffset` —el truco del anillo de
 * progreso— y eso llena la porción ANGULARMENTE: el color barre de un lado al
 * otro como una aguja. No es lo pedido.
 *
 * Radial se resuelve con una MÁSCARA: la porción de color está entera desde el
 * principio y lo que crece es un círculo que la revela, del centro hacia
 * afuera. Y el círculo no cambia de radio —eso sería animar geometría, que es
 * un atributo y no una propiedad de estilo— sino de **escala**, que es una
 * transformada de las de siempre. Ése sí crece desde el centro sin declarar
 * nada: motion escala un SVG desde el centro de su propia caja de contenido, y
 * la caja de un círculo centrado en `0 0` tiene su centro en `0 0`. Que eso
 * valga acá y NO valga para el giro es justamente la trampa de abajo.
 *
 * La FORMA de la porción sí sigue saliendo del trazo grueso: un círculo de
 * radio `RADIO / 2` trazado con `strokeWidth = RADIO` va del centro al borde, y
 * con `strokeDasharray` se recorta el arco de un tercio. Eso dibuja el sector
 * completo de una vez; lo que lo llena es la máscara.
 *
 * ── La coreografía, y por qué la rotación va en el medio ──────────────────
 *
 * El orden pedido es: la porción vigente se achica y vuelve a su lugar, DESPUÉS
 * la torta rota, y recién entonces la siguiente se agranda y sube. Las tres
 * cosas cuelgan de la misma posición disparada, repartidas en tramos que no se
 * superponen: la salida ocupa el primer tramo, el giro el del medio, la entrada
 * el último. Por eso hay un momento —el del giro— en el que las tres porciones
 * están chicas y en su lugar, que es lo que hace que el giro se lea.
 *
 * ── ⚠️ POR QUÉ LA TORTA GIRABA **Y ADEMÁS SE TRASLADABA** ─────────────────
 *
 * Acá había escrito que «el origen de transformación de un SVG es `0 0`, y el
 * centro de la torta está ahí». **Es falso para una transformada de motion.**
 * Motion le pone a todo elemento SVG `transform-box: fill-box` y le calcula el
 * origen desde la CAJA DE CONTENIDO del propio elemento: medido en el traspaso,
 * el origen valía `109,523px 100,255px`, y el centro del disco orbitaba **38,34
 * px en x y 28,52 px en y** en vez de quedarse quieto.
 *
 * ⚠️ **Y la caja de un `<g>` se la fijan sus hijos YA TRANSFORMADOS.** Acá están
 * las tres porciones, que en el traspaso se despegan, crecen y vuelven: medido
 * con el ancla puesta, la caja del `<g>` valía 259,85 (no 241,68) y arrancaba en
 * −138,07 (no en −120,84), corrida justo los 8,145 que la porción vigente sube.
 * O sea que el origen del giro **se corría mientras el giro corría**, y anclar el
 * `<g>` por dentro no alcanza: cualquier hijo que se agrande más que el ancla
 * vuelve a ganar. Por eso **el giro se fue del SVG**: lo lleva el `<div>` que lo
 * envuelve, cuya caja es la del elemento y no la de su contenido, así que el
 * 50 %/50 % cae en su centro pase lo que pase adentro. El `viewBox` es cuadrado y
 * está centrado en `0 0`, y el disco entra entero con `MARGEN` de aire, así que
 * el centro de ese `<div>` **es** el centro del disco y rotar la caja se ve igual
 * que rotar el dibujo.
 *
 * El ancla se quedó **adentro de cada porción**, donde sí hace falta y sí
 * alcanza: sin ella el `scale` de `CRECIMIENTO` agranda desde el centro de la
 * caja de la porción —que no es el centro de la torta— y el vértice se despega
 * del medio. Con ella, medido: origen `120,84px 120,84px` sobre una caja que
 * empieza en −120,84, o sea `0 0` exacto.
 *
 * ── Los colores salen del contexto, no de acá ─────────────────────────────
 *
 * Cada porción lleva su `[data-servicio]`, así que `--color-acento` se retiñe
 * solo: este archivo no nombra un color de servicio ni su valor.
 */

/** El radio de la torta, en unidades del `viewBox`. */
const RADIO = 82

/** Cuánto se despega del centro la porción vigente, en unidades del `viewBox`. */
const SEPARACION = 13

/** Cuánto CRECE la porción vigente. 0,12 es un 12 % más grande. */
const CRECIMIENTO = 0.12

/** Hacia dónde mira la porción vigente. −90° es arriba. */
const ANGULO_ACTIVO = -90

/** Aire alrededor, para que la porción crecida y despegada no se recorte. */
const MARGEN = 16

/** Cuánta tinta conserva una porción sin llenar. */
const GRIS_DE_LA_PORCION = 13

/** El ancho de la línea de papel que separa una porción de la otra. */
const HILO = 2

/** En qué parte del traspaso la porción que sale termina de achicarse. */
const SALIDA_DE_LA_PORCION = 0.4

/** Cuánto del final del traspaso ocupa la entrada de la porción nueva. */
const ENTRADA_DE_LA_PORCION = 0.3

/** Desde dónde gira la torta, dentro del traspaso. Después de la salida. */
const GIRO_DESDE = 0.42

/** Hasta dónde gira. Antes de que empiece la entrada de la porción nueva. */
const GIRO_HASTA = 0.7

const TINTA = 'var(--color-tinta)'
const ACENTO = 'var(--color-acento)'
const PAPEL = 'var(--color-fondo)'

/** Un porcentaje, armado: escrito entero sería un literal con unidad. */
function porciento(valor: number): string {
  return `${valor}%`
}

function conTinta(cuanta: number): string {
  return `color-mix(in oklab, ${TINTA} ${porciento(cuanta)}, transparent)`
}

/** Los grados de cada porción. Se DERIVAN: tres servicios, tres porciones. */
const GRADOS_POR_PORCION = 360 / SERVICIOS.length

/** El radio del círculo trazado, y su circunferencia. El trazo hace el disco. */
const RADIO_DEL_TRAZO = RADIO / 2
const CIRCUNFERENCIA = 2 * Math.PI * RADIO_DEL_TRAZO
const RESTO_DEL_CIRCULO = CIRCUNFERENCIA - CIRCUNFERENCIA / SERVICIOS.length

/**
 * ⚠️ **LA CAJA ES CUADRADA Y ESTÁ CENTRADA EN `0 0`, Y DE ESO DEPENDE EL GIRO.**
 * Tenía un `ESPESOR` de más en el alto —el canto asomaba por abajo— y eso la
 * volvía asimétrica: su centro caía en `(0, ESPESOR / 2)` y no en el centro del
 * disco. Ver el arreglo del giro, abajo.
 */
const MITAD = RADIO * (1 + CRECIMIENTO) + SEPARACION + MARGEN
const CAJA = [-MITAD, -MITAD, MITAD * 2, MITAD * 2].join(' ')

/** Dónde arranca la porción `i`, en grados, con la activa mirando hacia arriba. */
function arranqueDe(indice: number): number {
  return ANGULO_ACTIVO - GRADOS_POR_PORCION / 2 + indice * GRADOS_POR_PORCION
}

function acotar01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/**
 * Cuánto está «en primer plano» la porción `i`: 1 cuando es la vigente y está
 * posada, 0 mientras la torta gira.
 *
 * ⚠️ Los dos lados NO son simétricos, y en eso está el orden pedido. La porción
 * que SALE termina de achicarse en el primer tramo del traspaso, antes de que
 * el giro empiece; la que ENTRA recién empieza a crecer en el último, cuando el
 * giro ya terminó. En el medio las tres están chicas y en su lugar.
 */
export function prominenciaDe(posicion: number, indice: number): number {
  const d = posicion - 1 - indice
  if (d >= 0) return acotar01(1 - d / SALIDA_DE_LA_PORCION)
  return acotar01(1 + d / ENTRADA_DE_LA_PORCION)
}

/** El giro: quieto en cada estado, y cruza al siguiente en el medio del traspaso. */
export function giroDe(posicion: number): number {
  const base = Math.floor(posicion)
  const frac = posicion - base
  const rampa = acotar01((frac - GIRO_DESDE) / (GIRO_HASTA - GIRO_DESDE))
  return -Math.max(0, base + rampa - 1) * GRADOS_POR_PORCION
}

function Porcion({
  servicio,
  indice,
  progreso,
  medida,
  posicion,
  idDeLaMascara,
}: {
  readonly servicio: Servicio
  readonly indice: number
  readonly progreso: MotionValue<number>
  readonly medida: MedidaDeLaTira
  readonly posicion: MotionValue<number>
  readonly idDeLaMascara: string
}): React.JSX.Element {
  // ⚠️ El MISMO rango que usa el párrafo de este servicio, de la MISMA función.
  // Si la torta derivara su propio avance, los dos se separarían el día que
  // alguien mueva una línea y nadie se enteraría hasta verlo en pantalla.
  const [inicio, fin] = rangoDePintura(medida, indice)
  const llenado = useTransform(progreso, [inicio, fin], [0, 1])

  const bisectriz = ((arranqueDe(indice) + GRADOS_POR_PORCION / 2) * Math.PI) / 180
  const x = useTransform(posicion, (v) => SEPARACION * prominenciaDe(v, indice) * Math.cos(bisectriz))
  const y = useTransform(posicion, (v) => SEPARACION * prominenciaDe(v, indice) * Math.sin(bisectriz))
  const scale = useTransform(posicion, (v) => 1 + CRECIMIENTO * prominenciaDe(v, indice))

  const trazo = {
    r: RADIO_DEL_TRAZO,
    fill: 'none',
    strokeWidth: RADIO,
    strokeDasharray: CIRCUNFERENCIA,
    strokeDashoffset: RESTO_DEL_CIRCULO,
  }

  return (
    <motion.g {...{ [ATRIBUTO_DE_SERVICIO]: servicio.id }} style={{ x, y, scale }}>
      {/* ⚠️ EL ANCLA. Sin ella el `scale` de CRECIMIENTO agranda la porción desde
          el centro de su propia caja de contenido —que no es el centro de la
          torta— y el vértice se despega del medio. Ver el docblock de arriba. */}
      <circle r={MITAD} fill="none" />
      <mask
        id={idDeLaMascara}
        maskUnits="userSpaceOnUse"
        x={-MITAD}
        y={-MITAD}
        width={MITAD * 2}
        height={MITAD * 2}
      >
        {/* Lo que crece no es el radio —eso sería geometría— sino la escala. */}
        <motion.circle r={RADIO} fill="white" style={{ scale: llenado }} />
      </mask>
      <g transform={`rotate(${arranqueDe(indice)})`}>
        <circle {...trazo} stroke={conTinta(GRIS_DE_LA_PORCION)} />
        <g mask={`url(#${idDeLaMascara})`}>
          <circle {...trazo} stroke={ACENTO} />
        </g>
        {/* Los dos lados rectos, en papel: es lo que separa una porción de la
            otra cuando están juntas. No es un color, es el fondo. */}
        <line x1={0} y1={0} x2={RADIO} y2={0} stroke={PAPEL} strokeWidth={HILO} />
        <line
          x1={0}
          y1={0}
          x2={RADIO}
          y2={0}
          stroke={PAPEL}
          strokeWidth={HILO}
          transform={`rotate(${GRADOS_POR_PORCION})`}
        />
      </g>
    </motion.g>
  )
}

export interface GraficoDeTortaProps {
  readonly progreso: MotionValue<number>
  readonly medida: MedidaDeLaTira
  /** La posición DISPARADA del rodillo. La torta rota con ella, sin reloj propio. */
  readonly posicion: MotionValue<number>
}

export function GraficoDeTorta({
  progreso,
  medida,
  posicion,
}: GraficoDeTortaProps): React.JSX.Element {
  const base = useId()
  const rotate = useTransform(posicion, giroDe)

  return (
    <motion.div data-pieza="giro-de-la-torta" style={{ rotate }} className={CLASE_DE_LA_TORTA}>
      <svg aria-hidden="true" data-pieza="torta" viewBox={CAJA} className="block h-auto w-full">
        {SERVICIOS.map((servicio, i) => (
          <Porcion
            key={servicio.id}
            servicio={servicio}
            indice={i}
            progreso={progreso}
            medida={medida}
            posicion={posicion}
            idDeLaMascara={`${base}-${servicio.id}`}
          />
        ))}
      </svg>
    </motion.div>
  )
}
