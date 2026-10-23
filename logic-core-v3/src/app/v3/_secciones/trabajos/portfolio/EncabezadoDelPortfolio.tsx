'use client'

import { animate, motion, useMotionValue, useTransform } from 'motion/react'
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
 * [B1.2b] LA PRESENCIA DEL ENCABEZADO — por TIEMPO, no por scroll: va a 1 con el panel adentro (o sea ya pegado: el gatillo espera
 * al pin) y a 0 cuando el panel se va. Con eso el título no viaja con la sección: aparece en su lugar. La curva es la del revelado
 * de las secciones (`CLAUDE.md`); el título 3D la persigue con su mínimo (`LENTOS.llegadaDePortfolioS`).
 */
export const PRESENCIA_DEL_ENCABEZADO = { s: 0.6, curva: [0.25, 0.46, 0.45, 0.94] } as const

/**
 * [B1] EL ENCABEZADO DEL PORTFOLIO — «Portfolio» y su bajada, centrados en la mitad de arriba de la columna (plan §5.1; [B1.2b]
 * §12, puntos 1 y 3).
 *
 * [B1.2b] Entran y se van con la PRESENCIA (arriba), no con el scroll: el título 3D llega en su lugar con su llegada de siempre y se
 * va CAYENDO (`saleCayendo`: la caída de los otros títulos del sitio, la de `levanta` al revés: se acuesta y su línea lo tapa); la
 * bajada sube y se va por sus líneas (el canal del texto, al revés). Reversible: subiendo, vuelven. Abajo de 1024 (sin títulos 3D)
 * el titular del DOM hace lo mismo con su ventana. Los bloques P2 quedan (el contrato de la coreografía: la rama quieta los
 * deja enteros), pero el progreso de los canales es la presencia. El título se coloca con la pose del Portfolio
 * (`LECTURA.portfolio`): con el panel adentro queda en su lugar del DOM y de frente. La bajada va en su plano
 * (`useAcompananteDelTitulo`). Los nombres son los del cartel a propósito: los invariantes que fijan cómo se arma el título los
 * leen acá.
 */
export function EncabezadoDelPortfolio({ seccion, adentro, reducido, seFunde = false, className }: PropsDeSeccion & { readonly adentro: boolean; readonly reducido: boolean; readonly seFunde?: boolean; readonly className?: string }): React.JSX.Element {
  // [NOCTURNO] A1 · la bajada va en el plano del título de volumen (la cámara la corre con él).
  const bajada = useAcompananteDelTitulo<HTMLDivElement>('portfolio')
  const presencia = useMotionValue(adentro ? 1 : 0)
  useEffect(() => {
    if (reducido) {
      presencia.set(adentro ? 1 : 0)
      return undefined
    }
    const a = animate(presencia, adentro ? 1 : 0, { duration: PRESENCIA_DEL_ENCABEZADO.s, ease: [...PRESENCIA_DEL_ENCABEZADO.curva] })
    return () => a.stop()
  }, [adentro, reducido, presencia])
  // [PULIDO 10] J7 · la llegada de un viaje: el titular entero o invisible (`opacidadDeLaLlegada`, `recorteDeLaLlegada`).
  const repeticion = useRepeticionDeLaLlegada(seccion.id)
  const opacidadDelTitular = useTransform(repeticion, opacidadDeLaLlegada)
  const recorteDelTitular = useTransform(repeticion, recorteDeLaLlegada)
  // [C2-40] En el flujo (sin títulos 3D) el titular se levanta desde abajo de su ventana, de acostado a parado: el efecto de los títulos.
  const subida = useTransform(presencia, [0, 1], ['110%', '0%'])
  const giro = useTransform(presencia, [0, 1], [70, 0])
  const estiloDelTitular = seFunde ? { opacity: opacidadDelTitular, y: subida, rotateX: giro, transformPerspective: 600, transformOrigin: '50% 100%' } : { opacity: opacidadDelTitular }
  const encabezado = (
    <div data-pieza="encabezado-del-portfolio" className={className}>
      <div id={idDelTitularDeSeccion(seccion.id)}>
        <Bloque patron="P2" rango="ventana-de-la-mascara" className="block w-full">
          {(progresoDeLaMascara) => (
            <motion.span className={VENTANA_QUE_RECORTA} style={{ overflow: recorteDelTitular }}>
              <CanalDeUnaPieza progreso={progresoDeLaMascara === null ? null : presencia} patron="P2" como="span" className="block" llegadaDe={seccion.id}>
                <motion.span className="block" style={estiloDelTitular}>
                  <Titular nivel="display-xl" como="h2" className={CLASE_DEL_TITULAR}>
                    <ConInercia>
                      <TituloDeVolumen id="portfolio" texto={CONTENIDO.titular} lectura={LECTURA.portfolio} llegada={progresoDeLaMascara === null ? null : presencia} salida={null} llegadaDe={seccion.id} minimoS={LENTOS.llegadaDePortfolioS} saleCayendo queda />
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
            <CanalDeTexto progreso={progresoDelCuerpo === null ? null : presencia} tipo="parrafo" texto={CONTENIDO.bajada}>
              {(contenido) => <p className={CLASE_DEL_CUERPO}>{contenido}</p>}
            </CanalDeTexto>
          )}
        </Bloque>
      </div>
    </div>
  )
  // [B1.2e] En el flujo del carrusel (debajo de 1024), con un fundido atado a la presencia: P2 sólo desplaza (medio alto propio) y no oculta,
  // así que en 0 asomaría el 40 % del título (la lección de F5). En escritorio, el marcado de siempre.
  return seFunde ? <motion.div data-parte="fundido-del-encabezado" style={{ opacity: presencia }}>{encabezado}</motion.div> : encabezado
}
