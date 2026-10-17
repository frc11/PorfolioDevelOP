'use client'

import { motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'

import { useRepeticionDeLaLlegada } from '../../../_componentes/llegadaDelTitulo'
import { TituloDeVolumen } from '../../../_componentes/titulos3d/TituloDeVolumen'
import { Titular, idDelTitularDeSeccion } from '../../../_componentes/tipografia/Titular'
import { useAcompananteDelTitulo } from '../../../_lib/titulos3d/acompanantes'
import { LECTURA } from '../../../_lib/titulos3d/registro'
import { LENTOS } from '../../../_lib/titulos3d/repeticiones'
import { CanalDeTexto, CanalDeUnaPieza, ConInercia, VENTANA_QUE_RECORTA } from '../../_contrato/canales'
import { Bloque } from '../../_contrato/coreografia'
import type { PropsDeSeccion } from '../../_contrato/forma'

import { CONTENIDO } from '../contenido'

import { CLASE_DEL_CUERPO, CLASE_DEL_TITULAR, MEDIDA_DEL_CUERPO_CH, opacidadDeLaLlegada, recorteDeLaLlegada } from './tipografia'

/**
 * [B1] EL ENCABEZADO DEL PORTFOLIO — «Portfolio» y su bajada, arriba del lado del texto (plan §5.1).
 *
 * Es el cartel de antes SIN la huida (el túnel se fue al archivo): el titular llega con P2 adentro de la ventana que recorta (el
 * gesto de «El equipo», copiado de `equipo.tsx`) y la bajada con el canal del texto, en el plano del título de volumen
 * (`useAcompananteDelTitulo`). Los nombres son los del cartel a propósito: los invariantes que fijan cómo se arma el título los
 * leen acá. Se queda mientras el panel está adentro y se va con él: en la cola el título de volumen sale (`salidaDelTitulo` = 1)
 * y el DOM se desvanece con el escenario.
 */
export function EncabezadoDelPortfolio({ seccion, afuera, className }: PropsDeSeccion & { readonly afuera: boolean; readonly className?: string }): React.JSX.Element {
  // [NOCTURNO] A1 · la bajada va en el plano del título de volumen (la cámara la corre con él).
  const bajada = useAcompananteDelTitulo<HTMLDivElement>('portfolio')
  /** [B1] El título de volumen sale con el panel, en la cola; subiendo vuelve armado. */
  const salidaDelTitulo = useMotionValue(afuera ? 1 : 0)
  useEffect(() => salidaDelTitulo.set(afuera ? 1 : 0), [afuera, salidaDelTitulo])
  // [PULIDO 10] J7 · la llegada de un viaje: el titular entero o invisible (`opacidadDeLaLlegada`, `recorteDeLaLlegada`).
  const repeticion = useRepeticionDeLaLlegada(seccion.id)
  const opacidadDelTitular = useTransform(repeticion, opacidadDeLaLlegada)
  const recorteDelTitular = useTransform(repeticion, recorteDeLaLlegada)
  return (
    <div data-pieza="encabezado-del-portfolio" className={className}>
      <div id={idDelTitularDeSeccion(seccion.id)}>
        <Bloque patron="P2" rango="ventana-de-la-mascara" className="block w-full">
          {(progresoDeLaMascara) => (
            <motion.span className={VENTANA_QUE_RECORTA} style={{ overflow: recorteDelTitular }}>
              <CanalDeUnaPieza progreso={progresoDeLaMascara} patron="P2" como="span" className="block" llegadaDe={seccion.id}>
                <motion.span className="block" style={{ opacity: opacidadDelTitular }}>
                  <Titular nivel="display-xl" como="h2" className={CLASE_DEL_TITULAR}>
                    <ConInercia>
                      <TituloDeVolumen id="portfolio" texto={CONTENIDO.titular} lectura={LECTURA.portfolio} llegada={progresoDeLaMascara} salida={salidaDelTitulo} llegadaDe={seccion.id} minimoS={LENTOS.llegadaDePortfolioS} queda />
                    </ConInercia>
                  </Titular>
                </motion.span>
              </CanalDeUnaPieza>
            </motion.span>
          )}
        </Bloque>
      </div>
      <div ref={bajada} style={{ maxWidth: `${MEDIDA_DEL_CUERPO_CH}ch` }} className="mt-6">
        <Bloque patron="P2" rango="ventana-visible" className="block w-full">
          {(progresoDelCuerpo) => (
            <CanalDeTexto progreso={progresoDelCuerpo} tipo="parrafo" texto={CONTENIDO.bajada}>
              {(contenido) => <p className={CLASE_DEL_CUERPO}>{contenido}</p>}
            </CanalDeTexto>
          )}
        </Bloque>
      </div>
    </div>
  )
}
