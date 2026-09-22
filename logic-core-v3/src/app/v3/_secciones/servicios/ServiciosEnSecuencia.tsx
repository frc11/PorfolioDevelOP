'use client'

import type { MotionValue } from 'motion/react'
import { useRef } from 'react'

import { Grilla } from '../../_componentes/layout/Grilla'
import { Titular } from '../../_componentes/tipografia/Titular'
import { ContenidoDeSeccion } from '../_contrato/Seccion'
import { ID_DEL_TITULAR } from './CabeceraDeServicios'
import { TITULAR } from './contenido'
import {
  CLASE_DEL_HUECO_DE_LA_TORTA,
  CLASE_DEL_STICKY,
  CLASE_DE_LA_COLUMNA_FIJA,
  CLASE_DE_LA_COLUMNA_QUE_AVANZA,
  NIVEL_DEL_TITULAR_DE_SECCION,
} from './geometria'
import { CtaQueRota } from './CtaQueRota'
import { GraficoDeTorta } from './GraficoDeTorta'
import { RodilloDeEstados } from './RodilloDeEstados'
import { useEstadoDisparado } from './disparo'
import { TiraDeServicios, fronterasDeEstado, useMedidaDeLaTira } from './TiraDeServicios'

/**
 * EL PANEL PINNEADO — dos movimientos, una medición, y UN progreso.
 *
 * ── ⚠️ QUÉ SE FUE DE ACÁ, Y POR QUÉ ERA EL MECANISMO Y NO UN VALOR ────────
 *
 * Este archivo montaba TRES CAPAS por servicio, pintaba una y apagaba dos con
 * `sr-only`, y partía el progreso del pin en tercios con `tramoDeSecuencia` para
 * pasarle a la capa vigente su progreso LOCAL. Cada frontera de paso hacía dos
 * cosas a la vez: reiniciaba ese local de 1 a 0 y cambiaba cuál capa estaba en
 * flujo. Ahí nacía todo salto que tres intentos persiguieron como si fuera una
 * curva mal calibrada.
 *
 * Con esto se fueron también el `useState` y el `useMotionValueEvent` que
 * sincronizaban el índice: **la sección ya no re-renderiza durante el pin**.
 * Todo lo que se mueve es un `useTransform` sobre el mismo `MotionValue`. Nada
 * se monta, nada se desmonta, nada conmuta. No es que los saltos estén
 * calibrados: es que no existe el mecanismo que los producía.
 *
 * ── Las dos cosas que se mueven, y por qué no comparten nada ──────────────
 *
 *   DERECHA · CONTINUA   `TiraDeServicios` — una tira con los tres bloques,
 *                        trasladada LINEALMENTE por el progreso del pin.
 *   IZQUIERDA · DISCRETA `RodilloDeEstados` — cuatro estados, posado en uno.
 *
 * **El acoplamiento va en una sola dirección.** La tira mide dónde está cada
 * bloque y de ahí sale el estado del rodillo; el rodillo no le dice nada a la
 * tira. Por eso las fronteras no están escritas en ningún lado: son el tope
 * medido de cada bloque contra la línea de referencia de la ventana.
 *
 * ── Por qué la medición vive ACÁ y no adentro de la tira ──────────────────
 *
 * Porque sus dos consumidores están en columnas distintas de la grilla, y una
 * medición leída dos veces se desvía sola. Este componente tiene los `ref`,
 * corre el `ResizeObserver` una vez y reparte: el `y` a la tira, el estado al
 * rodillo. Es el mismo criterio por el que `s6-render` consume los detectores
 * de Servicios en vez de escribir los suyos.
 *
 * ── El `h2` va `sr-only`, y no es un rodeo ────────────────────────────────
 *
 * «Nuestros servicios» dejó de ser un cartel fijo arriba del panel: ahora es el
 * estado 0 del rodillo, en el mismo lugar donde después aparecen los servicios.
 * Pero el rodillo entero es `aria-hidden` —es la copia visual— así que el
 * encabezado REAL de la sección tiene que estar en otro lado: acá, `sr-only`,
 * con el `id` al que apunta el `aria-labelledby` de la `<section>`. Un
 * `aria-labelledby` que apunta a un `id` que no existe deja a la región SIN
 * nombre, que es peor que no ponerlo. Es el precedente de
 * `quienes-somos/QuienesSomos.tsx:57-59`, y deja el árbol de encabezados de las
 * dos ramas idéntico: un `h2` y tres `h3`, en el mismo orden.
 */

export interface ServiciosEnSecuenciaProps {
  /** El progreso del PIN, 0 → 1 sobre `alto − viewport`. Crudo, sin tramos. */
  readonly progreso: MotionValue<number>
}

export function PanelDeSecuencia({ progreso }: ServiciosEnSecuenciaProps): React.JSX.Element {
  const ventana = useRef<HTMLDivElement>(null)
  const tira = useRef<HTMLDivElement>(null)

  const medida = useMedidaDeLaTira(ventana, tira)
  // Sólo las fronteras: el rodillo lee el progreso y arma su propia máquina.
  // Nada de su estado sube hasta acá, así que un disparo no re-renderiza la tira.
  const fronteras = fronterasDeEstado(medida)
  // UN disparo para los tres que rotan: el rodillo, la torta y el CTA.
  const posicion = useEstadoDisparado(progreso, fronteras)

  return (
    <div className={CLASE_DEL_STICKY}>
      <Titular nivel={NIVEL_DEL_TITULAR_DE_SECCION} como="h2" id={ID_DEL_TITULAR} className="sr-only">
        {TITULAR}
      </Titular>
      {/* La contención lateral del sitio. Sin esto el panel sangra a los dos
          bordes de la pantalla: el pin ya no pasa por `ContenidoDeServicio`,
          que era quien la ponía cuando la unidad de montaje era «un servicio». */}
      <ContenidoDeSeccion
        className="min-h-0 flex-1"
        claseDeContenido="flex h-full min-h-0 w-full flex-col"
      >
        <Grilla columnas={3} className="min-h-0 flex-1">
          <div className={CLASE_DE_LA_COLUMNA_FIJA}>
            <RodilloDeEstados posicion={posicion} />
            {/* La torta va centrada en el hueco, no colgada del flujo: así no
                se mueve cuando el bloque del título cambia de alto. */}
            <div className={CLASE_DEL_HUECO_DE_LA_TORTA}>
              <GraficoDeTorta progreso={progreso} medida={medida} posicion={posicion} />
            </div>
            {/* `mt-auto` y no un hueco: el CTA se apoya en el borde de abajo del
                panel y se queda ahí todo el pin, sin empujar a la torta ni
                depender de cuánto mida el bloque del título en cada estado. */}
            <CtaQueRota posicion={posicion} />
          </div>
          <div className={CLASE_DE_LA_COLUMNA_QUE_AVANZA}>
            <TiraDeServicios
              progreso={progreso}
              medida={medida}
              refDeLaVentana={ventana}
              refDeLaTira={tira}
            />
          </div>
        </Grilla>
      </ContenidoDeSeccion>
    </div>
  )
}

export function ServiciosEnSecuencia({ progreso }: ServiciosEnSecuenciaProps): React.JSX.Element {
  return <PanelDeSecuencia progreso={progreso} />
}
