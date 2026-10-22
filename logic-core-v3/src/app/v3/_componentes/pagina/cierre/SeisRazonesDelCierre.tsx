'use client'

import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'

import { PARTES_DEL_CIERRE } from '../../../_lib/escena/ruta/atributoDelCierre'
import { PANTALLAS_DE_POR_QUE_DEVELOP, altoDeSecuenciaPinneada } from '../../../_lib/secciones'
import { useAcompananteDelTitulo } from '../../../_lib/titulos3d/acompanantes'
import { CanalDeUnaPieza, ConInercia } from '../../../_secciones/_contrato/canales'
import { Bloque, CoreografiaEnTodoAncho } from '../../../_secciones/_contrato/coreografia'
import { CtaTransformado, CtaTransformadoEnLaLista } from '../../../_secciones/por-que-develop/CtaTransformado'
import { FRASE, NOMBRE_DE_SECCION, VALORES } from '../../../_secciones/por-que-develop/contenido'
import {
  ESTILO_DEL_ESCENARIO,
  SUBIDA_DE_LA_FRASE_SVH,
  SUBIDA_DE_LA_LEVANTADA_SVH,
  VENTANA_DE_LA_FRASE,
  VENTANA_DE_LA_LEVANTADA,
  VENTANA_DE_LA_SUBIDA_DE_LA_FRASE,
  VENTANA_DE_LA_TRANSFORMACION,
  type Ventana,
} from '../../../_secciones/por-que-develop/geometria'
import { AnchoDeLaFrase, CLASE_DE_LA_COLUMNA, FraseDelFinal, TAMANO_DEL_CTA, ValorEnElEscenario } from '../../../_secciones/por-que-develop/PorQueDevelop'
import { PiezaDeValor } from '../../../_secciones/por-que-develop/Valores'
import { MedirLaLista, useCtaListo } from '../../ctaDelFinal/CtaDelFinal'
import { Envoltorio } from '../../layout/Envoltorio'
import { MaterialDeLosTitulos } from '../../titulos3d/materialDeLosTitulos'
import { Titular } from '../../tipografia/Titular'

import { LlegaEnSuVentana } from './LlegaDelCierre'

/**
 * [B13] SEIS RAZONES EN EL CIERRE DE UNA PÁGINA — las mismas seis de develOP, con la misma entrada que en el home, y el título que se
 * transforma en el CTA (la transformación de B3, sin el aro de las reseñas: el origen del cartel es la frase, `origenDeLaFrase`).
 *
 * · **Desde 1024 y con movimiento: el escenario del home.** Un bloque de `PANTALLAS_DE_POR_QUE_DEVELOP` pantallas con su escenario clavado:
 *   la frase llega (A), los valores entran de a pares (B), se levantan y la frase se da vuelta en el CTA (C). Las ventanas, la geometría y
 *   las piezas son las del home (`geometria.ts` y lo exportado de `PorQueDevelop.tsx`); la cámara hace las mismas poses porque la pista del
 *   cierre es la del final del home en estas pantallas (`_lib/escena/ruta/cierreDeLaPagina.ts`). Lo único propio: sin las reseñas (el pin
 *   del bloque, sin traducir) y, de noche, la frase en volumen en papel (`MaterialDeLosTitulos`).
 * · **Abajo de 1024 o con menos movimiento: la lista** (el modo plano del home): la frase, los valores y el CTA en la lista, que la escena
 *   desliza (`CtaTransformadoEnLaLista`). Sin la mezcla del home: de noche el texto va en los claros (el cierre es la sección invertida).
 *
 * El home no se parametrizó (su escenario monta las reseñas con su propio pin y ~25 suites lo leen como texto): esta pieza compone las
 * suyas. El bloque es la primera parte del cierre (`data-parte`): la escena lo mide.
 */
export function SeisRazonesDelCierre({ deNoche }: { readonly deNoche: boolean }): React.JSX.Element {
  return (
    <div data-parte={PARTES_DEL_CIERRE.seisRazones}>
      {/* El alto va en línea (sale del dato, como en el home); abajo de 1024 no hay pin y el bloque mide su contenido. */}
      <Bloque patron="pin" style={{ minHeight: altoDeSecuenciaPinneada(PANTALLAS_DE_POR_QUE_DEVELOP) }} className="relative max-escritorio:min-h-0!">
        {(pin) => (pin === null ? <SeisRazonesEnLista /> : <EscenarioDelCierre pin={pin} deNoche={deNoche} />)}
      </Bloque>
    </div>
  )
}

/** El tramo de una ventana del pin, de 0 a 1 (la cuenta del escenario del home). */
function useTramoDelPin(pin: MotionValue<number>, v: Ventana): MotionValue<number> {
  return useTransform(pin, [v.desde, v.hasta], [0, 1])
}

/** El id con que llegan las piezas del cierre (la llegada repetida de un viaje del menú no lo nombra: no se repite). */
const LLEGADA = 'cierre-de-la-pagina'

/** Con el foco del teclado antes de que el CTA llegue, la página va al final del escenario (como en el home). */
function llevarAlCtaDelCierre(cta: HTMLElement, llegada: number): void {
  if (llegada > 0.5) return
  const bloque = cta.closest(`[data-parte="${PARTES_DEL_CIERRE.seisRazones}"]`)
  if (!(bloque instanceof HTMLElement)) return
  window.scrollTo({ top: Math.round(bloque.getBoundingClientRect().bottom + window.scrollY - window.innerHeight), behavior: 'instant' })
}

function EscenarioDelCierre({ pin, deNoche }: { readonly pin: MotionValue<number>; readonly deNoche: boolean }): React.JSX.Element {
  const frase = useTramoDelPin(pin, VENTANA_DE_LA_FRASE)
  const subeLaFrase = useTransform(useTramoDelPin(pin, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE), (u) => `${(-u * SUBIDA_DE_LA_FRASE_SVH).toFixed(3)}svh`)
  // Como en el home: con la escena lista los valores no se levantan (la metamorfosis los toma en su lugar); sin WebGL, se van.
  const levantada = useTramoDelPin(pin, VENTANA_DE_LA_LEVANTADA)
  const listo = useCtaListo()
  const conLevantada = useMotionValue(listo ? 0 : 1)
  useEffect(() => conLevantada.set(listo ? 0 : 1), [listo, conLevantada])
  const y = useTransform(() => `${(-levantada.get() * conLevantada.get() * SUBIDA_DE_LA_LEVANTADA_SVH).toFixed(3)}svh`)
  const opacity = useTransform(() => 1 - levantada.get() * conLevantada.get())
  const izquierda = useAcompananteDelTitulo<HTMLDivElement>('frase-izquierda')
  const derecha = useAcompananteDelTitulo<HTMLDivElement>('frase-derecha')
  const transformacion = useTramoDelPin(pin, VENTANA_DE_LA_TRANSFORMACION)
  return (
    <MaterialDeLosTitulos.Provider value={deNoche ? 'blanco' : undefined}>
      <div data-pieza="escenario-del-final" className="sticky top-0 h-svh w-full overflow-hidden" style={ESTILO_DEL_ESCENARIO}>
        <h2 className="sr-only">{NOMBRE_DE_SECCION}</h2>
        <motion.div className="absolute inset-0" style={{ y, opacity }}>
          <motion.p data-pieza="frase-del-final" className="absolute inset-0" style={{ y: subeLaFrase }}>
            <span className="absolute top-1/2 right-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
              <CanalDeUnaPieza progreso={frase} patron="P5" como="span" className="block" llegadaDe={LLEGADA}>
                <ConInercia><FraseDelFinal texto={FRASE.izquierda} volumen={{ id: 'frase-izquierda', llegada: frase, salida: null, corrida: null }} /></ConInercia>
              </CanalDeUnaPieza>
            </span>{' '}
            <span className="absolute top-1/2 left-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
              <CanalDeUnaPieza progreso={frase} patron="P5" como="span" className="block" llegadaDe={LLEGADA}>
                <ConInercia><FraseDelFinal texto={FRASE.derecha} volumen={{ id: 'frase-derecha', llegada: frase, salida: null, corrida: null }} /></ConInercia>
              </CanalDeUnaPieza>
            </span>
          </motion.p>
          <div ref={izquierda} className="absolute top-[var(--arriba-de-los-valores)] bottom-[var(--abajo-de-los-valores)] right-[calc(50%+var(--hueco-de-los-valores))] flex w-min flex-col">
            <ColumnaDeValores texto={FRASE.izquierda} desde={0} pin={pin} transformacion={transformacion} />
          </div>
          <div ref={derecha} className="absolute top-[var(--arriba-de-los-valores)] bottom-[var(--abajo-de-los-valores)] left-[calc(50%+var(--hueco-de-los-valores))] flex w-min flex-col">
            <ColumnaDeValores texto={FRASE.derecha} desde={3} pin={pin} transformacion={transformacion} />
          </div>
        </motion.div>
        <CtaTransformado progreso={transformacion} claseDelTexto={TAMANO_DEL_CTA} alEnfocar={llevarAlCtaDelCierre} />
      </div>
    </MaterialDeLosTitulos.Provider>
  )
}

/** Tres valores, del ancho de su mitad de la frase (como en el home). */
function ColumnaDeValores({ texto, desde, pin, transformacion }: { readonly texto: string; readonly desde: number; readonly pin: MotionValue<number>; readonly transformacion: MotionValue<number> }): React.JSX.Element {
  return (
    <>
      <AnchoDeLaFrase texto={texto} />
      <div className="@container min-h-0 flex-1">
        <ul className={CLASE_DE_LA_COLUMNA}>
          {VALORES.slice(desde, desde + 3).map((valor, i) => (
            <ValorEnElEscenario key={valor.clave} valor={valor} pin={pin} indice={desde + i} transformacion={transformacion} />
          ))}
        </ul>
      </div>
    </>
  )
}

/** La lista (el modo plano): cada pieza llega con P5 sobre su ventana visible; el CTA en su bloque clavado, como en el home. */
function SeisRazonesEnLista(): React.JSX.Element {
  const cajaDelCta = useRef<HTMLDivElement>(null)
  const transformacion = useMotionValue(0)
  const entrada = useMotionValue(0)
  return (
    <Envoltorio className="py-[var(--spacing-20)]" claseDeContenido="flex flex-col gap-[var(--spacing-12)]">
      <h2 className="sr-only">{NOMBRE_DE_SECCION}</h2>
      <CoreografiaEnTodoAncho>
        <LlegaEnSuVentana>
          <p data-pieza="frase-del-final">
            <Titular nivel="titulo-xl" como="span" className="block">
              {FRASE.izquierda}
            </Titular>{' '}
            <Titular nivel="titulo-xl" como="span" className="block">
              {FRASE.derecha}
            </Titular>
          </p>
        </LlegaEnSuVentana>
        <ul className="grid grid-cols-1 gap-[var(--spacing-8)] movil:grid-cols-2">
          {VALORES.map((valor) => (
            <li key={valor.clave}>
              <LlegaEnSuVentana>
                <PiezaDeValor valor={valor} />
              </LlegaEnSuVentana>
            </li>
          ))}
        </ul>
        <MedirLaLista caja={cajaDelCta} progreso={transformacion} entrada={entrada} />
        <CtaTransformadoEnLaLista caja={cajaDelCta} progreso={transformacion} />
      </CoreografiaEnTodoAncho>
    </Envoltorio>
  )
}
