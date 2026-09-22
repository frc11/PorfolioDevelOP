'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { SERVICIOS } from '../_contrato/acento'
import {
  CLASE_DE_LA_CAJA_DEL_RODILLO,
  CLASE_DE_LA_RANURA,
  CLASE_DE_LA_RANURA_DE_ENTRADA,
} from './geometria'
import { RotuloDeLaIntro, RotuloDeServicio } from './RotuloDeServicio'

/**
 * EL RODILLO — cuatro estados, y se DISPARA al cruzar una frontera.
 *
 *     0   00 · Nuestros servicios    lo que viene, con la misma anatomía
 *     1   01 · Desarrollo web
 *     2   02 · Software a medida
 *     3   03 · Integraciones de IA y Automatizaciones
 *
 * Cada estado es un bloque que viaja ENTERO —rótulo, número, nombre y
 * subrayado—: ninguna de las cuatro piezas se posiciona sola.
 *
 * ── ⚠️ LAS RANURAS DEJARON DE SER IGUALES, Y ES EL PUNTO DEL SPRINT ──────
 *
 * Eran cuatro ranuras del mismo alto y el traslado era `-estado · 25 %`: un
 * porcentaje de la propia caja, sin medir nada. Tenía una consecuencia que en
 * pantalla se veía y en la cuenta no: con los bloques apoyados ABAJO de una
 * ranura fija, **el hueco que queda ARRIBA de cada bloque es lo que sobra**, y
 * lo que sobra depende de cuántos renglones tenga su título. Entre el subrayado
 * azul y el rótulo de «Software a medida» quedaban ~48 px; entre el violeta y
 * el de «Integraciones» —que ocupa dos renglones y llenaba su ranura— quedaba 0.
 *
 * Ahora cada ranura mide **su bloque más un hueco constante**, y el traslado
 * apoya el FONDO de la ranura vigente contra el fondo de la caja. Con eso salen
 * las dos cosas a la vez, que antes se peleaban:
 *
 *   · el subrayado cae siempre en la misma `y` —es el fondo de su ranura—, que
 *     es lo que el sprint anterior consiguió y no se toca;
 *   · y el hueco entre un subrayado y el rótulo siguiente es el MISMO en los
 *     cuatro pasos, porque es ese hueco y nada más.
 *
 * ── ⚠️ Y eso obliga a medir, con una salvedad que lo hace seguro ──────────
 *
 * Un alto que depende del contenido no se puede escribir en porcentajes, así
 * que los fondos se acumulan de los `offsetHeight` de las ranuras. Medir
 * después del primer render es justo lo que produce el parpadeo de un cuadro
 * —la medida vale cero, la transformada vale cero, la pieza se pinta en reposo
 * y recién al cuadro siguiente salta—, y acá **no puede pasar**: la ranura del
 * estado 0 es `h-full`, o sea que mide exactamente la caja, así que su fondo
 * coincide con el fondo de la caja y el traslado correcto para el estado 0 es
 * **cero**. El primer cuadro es el que sale sin medir.
 *
 * Y se acumulan alturas en vez de leer `offsetTop`, por la misma razón que en
 * la tira: la tira del rodillo lleva un `transform`, así que ELLA es el
 * `offsetParent` de sus hijos y restarle su propio `offsetTop` descuenta de más.
 *
 * ── ⚠️ Y SE MIDE CON EL RECT, NO CON `offsetHeight`: son 0,14 px que se ven ──
 *
 * `offsetHeight` devuelve un ENTERO. Una ranura de 141,14 px se lee 141, y el
 * error se acumula fondo a fondo, así que el traslado deja la ranura vigente
 * unas décimas más abajo de donde va. Con el bloque apoyado abajo, esas décimas
 * salen por arriba: **el subrayado del estado ANTERIOR asomaba 0,11 px en
 * `web` y 0,25 px en `software`** —una línea negra sobre «DIGITALIZÁ TU
 * NEGOCIO»— y con ese error había 88 cuadros del traspaso con dos subrayados
 * adentro de la caja.
 *
 * `getBoundingClientRect().height` es fraccionario. La advertencia del repo
 * —que el rect lo contamina la transformada— vale para la POSICIÓN y para la
 * escala; acá el único ancestro transformado es la propia tira y su
 * transformada es una TRASLACIÓN, que no cambia un alto.
 *
 * ── ⚠️ Y AUN ASÍ EL ENCUADRE NO PUEDE ESCONDER AL VECINO: SE APAGA ────────
 *
 * Medir bien dejó el margen en **0,05 px**, y eso no es un arreglo: es la
 * diferencia entre dos medidas que casi coinciden. Y **no se puede agrandar**,
 * porque es un teorema del encuadre, no un valor mal elegido. Con los bloques
 * apoyados abajo y el hueco `H` constante entre estados, la caja tiene que medir
 * al menos el bloque más alto y menos que la ranura más corta, así que el margen
 * vale siempre
 *
 *     H − (bloque más alto − bloque más corto) = 48 − 47,95 = 0,05
 *
 * y la resta de la derecha es UN renglón de `titulo-l`, o sea casi el hueco
 * entero. Mover el hueco no se puede —es el que el dueño fijó— y bajar la caja
 * tampoco: medido en el navegador, arriba del glifo del rótulo más alto hay
 * **2 px** de caja vacía y nada más, así que recortar los 2 px que harían falta
 * come tinta. El techo geométrico es 2,05 px con cero tolerancia.
 *
 * Así que el vecino **deja de pintarse**. Cada ranura lleva la opacidad atada a
 * la posición y sólo están en 1 las DOS que participan del relevo —la que sale y
 * la que entra—; las otras dos valen 0. En una meseta eso es una sola. El margen
 * deja de ser una distancia entre dos medidas y pasa a ser una propiedad: no hay
 * tinta del vecino que se pueda asomar porque no hay tinta del vecino.
 *
 * ⚠️ No hay parpadeo al encender ni al apagar: una ranura cambia de opacidad
 * justo cuando entra o sale del conjunto `{piso, techo}` de la posición, y en
 * los dos bordes de ese conjunto la ranura está ENTERA fuera de la ventana.
 */

/**
 * Los cuatro estados. El 0 es el titular de la sección; los otros, servicios.
 *
 * ⚠️ **Estados y ranuras son EL MISMO número, y no es una coincidencia.** Hubo
 * un intento de agregar un estado «sin ranura detrás» para devolver la última
 * porción de la torta a su tamaño, y rompió la sección: al llegar ahí no había
 * ranura que encender y el bloque del título entero desaparecía. `s6-traspaso`
 * §18 afirma la igualdad —fronteras más una contra ranuras— justamente para que
 * ese atajo no se pueda volver a tomar.
 */
export const CANTIDAD_DE_ESTADOS = SERVICIOS.length + 1

/**
 * Si la ranura `indice` se pinta con la secuencia en `posicion`.
 *
 * Son las dos que participan del relevo —la que sale y la que entra— y en una
 * meseta esas dos son la misma, así que queda una. Las otras van en opacidad 0,
 * que es lo que impide que el subrayado del estado anterior se asome por el
 * borde de arriba de la ventana.
 *
 * ⚠️ **Y por eso la posición NUNCA puede salirse de `[0, CANTIDAD_DE_ESTADOS −
 * 1]`**: con un estado de más, `piso` y `techo` caen los dos fuera del rango de
 * ranuras y **no se enciende ninguna**. No tira error, no deja rastro en una
 * meseta anterior: simplemente desaparece el bloque del título. Va como función
 * con nombre —y no como un `style` adentro del render— para que eso se pueda
 * afirmar sobre todo el recorrido en vez de mirarlo.
 */
export function ranuraVisible(indice: number, posicion: number): boolean {
  return indice >= Math.floor(posicion) && indice <= Math.ceil(posicion)
}

interface MedidaDelRodillo {
  /** El alto de la caja: lo que se ve por la máscara. */
  readonly alto: number
  /** El fondo acumulado de cada ranura, en orden. */
  readonly fondos: readonly number[]
}

const SIN_MEDIR: MedidaDelRodillo = { alto: 0, fondos: [] }

function useMedidaDelRodillo(
  caja: React.RefObject<HTMLDivElement | null>,
  tira: React.RefObject<HTMLDivElement | null>,
): MedidaDelRodillo {
  const [medida, setMedida] = useState<MedidaDelRodillo>(SIN_MEDIR)

  useEffect(() => {
    const marco = caja.current
    const dentro = tira.current
    if (marco === null || dentro === null) return

    const medir = (): void => {
      const fondos: number[] = []
      let acumulado = 0
      for (const ranura of Array.from(dentro.children)) {
        if (ranura instanceof HTMLElement) {
          acumulado += ranura.getBoundingClientRect().height
          fondos.push(acumulado)
        }
      }
      setMedida({ alto: marco.getBoundingClientRect().height, fondos })
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(marco)
    observador.observe(dentro)
    return () => observador.disconnect()
  }, [caja, tira])

  return medida
}

/**
 * Dónde tiene que estar la tira para que la ranura `v` apoye su fondo contra el
 * fondo de la caja. Entre dos estados interpola, que es lo que el disparo anima.
 */
function trasladoDe(v: number, medida: MedidaDelRodillo): number {
  if (medida.fondos.length < CANTIDAD_DE_ESTADOS) return 0
  // ⚠️ El acotado es un guardia de borde contra el error de punto flotante, NO
  // un permiso para mandar estados que no tienen ranura: eso se probó y apagaba
  // el bloque del título entero, porque `ranuraVisible` no enciende ninguna.
  const acotado = Math.min(CANTIDAD_DE_ESTADOS - 1, Math.max(0, v))
  const i = Math.floor(acotado)
  const j = Math.min(CANTIDAD_DE_ESTADOS - 1, i + 1)
  const f = acotado - i
  const desde = medida.alto - medida.fondos[i]
  const hasta = medida.alto - medida.fondos[j]
  return desde + (hasta - desde) * f
}

/**
 * Una ranura, con su opacidad atada a la posición.
 *
 * Va como componente propio y no como un `style` adentro del `map` porque cada
 * una necesita su `useTransform`, y los hooks no se llaman en un bucle.
 */
function Ranura({
  posicion,
  indice,
  className,
  children,
  ...atributos
}: {
  readonly posicion: MotionValue<number>
  readonly indice: number
  readonly className: string
  readonly children: React.ReactNode
} & Record<string, unknown>): React.JSX.Element {
  const opacity = useTransform(posicion, (v) => (ranuraVisible(indice, v) ? 1 : 0))
  return (
    <motion.div {...atributos} className={className} style={{ opacity }}>
      {children}
    </motion.div>
  )
}

export interface RodilloDeEstadosProps {
  /**
   * La posición DISPARADA, de `useEstadoDisparado`. El rodillo ya no arma su
   * propia máquina: la torta y el CTA rotan con la MISMA, y tres relojes se
   * desincronizan en cuanto alguien toque una duración.
   */
  readonly posicion: MotionValue<number>
}

export function RodilloDeEstados({ posicion }: RodilloDeEstadosProps): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const tira = useRef<HTMLDivElement>(null)
  const medida = useMedidaDelRodillo(caja, tira)
  const y = useTransform(posicion, (v) => trasladoDe(v, medida))

  return (
    <div
      ref={caja}
      aria-hidden="true"
      data-rodillo="estados"
      className={CLASE_DE_LA_CAJA_DEL_RODILLO}
    >
      <motion.div ref={tira} className="flex w-full flex-col will-change-transform" style={{ y }}>
        {/* ⚠️ La ranura de entrada mide la CAJA entera, y de eso depende que el
            primer cuadro salga bien sin haber medido: su fondo ya coincide con
            el fondo de la caja, así que el traslado del estado 0 es cero. */}
        <Ranura posicion={posicion} indice={0} data-estado="intro" className={CLASE_DE_LA_RANURA_DE_ENTRADA}>
          <RotuloDeLaIntro />
        </Ranura>
        {SERVICIOS.map((servicio, i) => (
          <Ranura
            key={servicio.id}
            posicion={posicion}
            indice={i + 1}
            data-servicio={servicio.id}
            data-estado="servicio"
            className={CLASE_DE_LA_RANURA}
          >
            <RotuloDeServicio servicio={servicio} decorativo />
          </Ranura>
        ))}
      </motion.div>
    </div>
  )
}
