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
 * ⚠️ **Y el margen que queda es de 0,05 px, por construcción.** La caja tiene
 * que medir al menos el bloque más alto (141,09) y menos que la ranura más
 * corta (48 + 93,14 = 141,14), y esa ventana mide lo que sobra de restarle al
 * hueco la diferencia entre un título de dos renglones y uno de uno: 48 −
 * 47,96 = 0,05. El hueco de 48 px es, casi exactamente, UN renglón de
 * `titulo-l`. Funciona, y es frágil: si el hueco baja de un renglón, no hay
 * encuadre que esconda el subrayado anterior.
 */

/** Los cuatro estados. El 0 es el titular de la sección; los otros, servicios. */
export const CANTIDAD_DE_ESTADOS = SERVICIOS.length + 1

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
  const acotado = Math.min(CANTIDAD_DE_ESTADOS - 1, Math.max(0, v))
  const i = Math.floor(acotado)
  const j = Math.min(CANTIDAD_DE_ESTADOS - 1, i + 1)
  const f = acotado - i
  const desde = medida.alto - medida.fondos[i]
  const hasta = medida.alto - medida.fondos[j]
  return desde + (hasta - desde) * f
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
        <div data-estado="intro" className={CLASE_DE_LA_RANURA_DE_ENTRADA}>
          <RotuloDeLaIntro />
        </div>
        {SERVICIOS.map((servicio) => (
          <div
            key={servicio.id}
            data-servicio={servicio.id}
            data-estado="servicio"
            className={CLASE_DE_LA_RANURA}
          >
            <RotuloDeServicio servicio={servicio} decorativo />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
