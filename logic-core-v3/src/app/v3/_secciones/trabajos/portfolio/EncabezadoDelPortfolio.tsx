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

import { conElDefecto } from './medida'
import { duracionDeLaSalida } from './orden'

import { CLASE_DEL_CUERPO, CLASE_DEL_TITULAR, MEDIDA_DEL_CUERPO_CH, opacidadDeLaLlegada, recorteDeLaLlegada } from './tipografia'

/**
 * [B1.2b] LA PRESENCIA DEL ENCABEZADO — por TIEMPO, no por scroll: va a 1 con el panel adentro (o sea ya pegado: el gatillo espera
 * al pin) y a 0 cuando el panel se va. Con eso el título no viaja con la sección: aparece en su lugar. La curva es la del revelado
 * de las secciones (`CLAUDE.md`); el título 3D la persigue con su mínimo (`LENTOS.llegadaDePortfolioS`).
 */
export const PRESENCIA_DEL_ENCABEZADO = { s: 0.6, curva: [0.25, 0.46, 0.45, 0.94] } as const

/**
 * [B1.2d B] T3 · En las historias (debajo de 1024) el título viene desde abajo: sube pasando por delante del logo y termina arriba, con
 * el logo debajo (como la columna de PC). Lo que recorre, en `svh` del cuadro, con la misma presencia (por tiempo).
 */
export const SUBIDA_DEL_ENCABEZADO_SVH = 55

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
export function EncabezadoDelPortfolio({ seccion, adentro, reducido, subeDesdeAbajo = false, className }: PropsDeSeccion & { readonly adentro: boolean; readonly reducido: boolean; readonly subeDesdeAbajo?: boolean; readonly className?: string }): React.JSX.Element {
  // [NOCTURNO] A1 · la bajada va en el plano del título de volumen (la cámara la corre con él).
  const bajada = useAcompananteDelTitulo<HTMLDivElement>('portfolio')
  const presencia = useMotionValue(adentro ? 1 : 0)
  useEffect(() => {
    if (reducido) {
      presencia.set(adentro ? 1 : 0)
      return undefined
    }
    // [F5] En las historias el título cae a la par de TODA la salida (el panel y la caída, `duracionDeLaSalida`): se va mientras llega Demos.
    const duracion = subeDesdeAbajo && !adentro && !conElDefecto('historias-de-antes') ? duracionDeLaSalida(PRESENCIA_DEL_ENCABEZADO.s) : PRESENCIA_DEL_ENCABEZADO.s
    const a = animate(presencia, adentro ? 1 : 0, { duration: duracion, ease: [...PRESENCIA_DEL_ENCABEZADO.curva] })
    return () => a.stop()
  }, [adentro, reducido, presencia, subeDesdeAbajo])
  // [PULIDO 10] J7 · la llegada de un viaje: el titular entero o invisible (`opacidadDeLaLlegada`, `recorteDeLaLlegada`).
  const repeticion = useRepeticionDeLaLlegada(seccion.id)
  const opacidadDelTitular = useTransform(repeticion, opacidadDeLaLlegada)
  const recorteDelTitular = useTransform(repeticion, recorteDeLaLlegada)
  const subida = useTransform(presencia, (p) => `${((1 - p) * SUBIDA_DEL_ENCABEZADO_SVH).toFixed(3)}svh`)
  const encabezado = (
    <div data-pieza="encabezado-del-portfolio" className={className}>
      <div id={idDelTitularDeSeccion(seccion.id)}>
        <Bloque patron="P2" rango="ventana-de-la-mascara" className="block w-full">
          {(progresoDeLaMascara) => (
            <motion.span className={VENTANA_QUE_RECORTA} style={{ overflow: recorteDelTitular }}>
              <CanalDeUnaPieza progreso={progresoDeLaMascara === null ? null : presencia} patron="P2" como="span" className="block" llegadaDe={seccion.id}>
                <motion.span className="block" style={{ opacity: opacidadDelTitular }}>
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
  // [B1.2d B] T3 · sólo en las historias: en escritorio el marcado es el de siempre. [F5] Y con un fundido atado a la presencia: P2 sólo
  // desplaza (medio alto propio) y no oculta, así que en 0 quedaba el 40 % del título huérfano sobre Demos (como el párrafo de Demos).
  return subeDesdeAbajo ? <motion.div data-parte="subida-del-encabezado" style={conElDefecto('historias-de-antes') ? { y: subida } : { y: subida, opacity: presencia }}>{encabezado}</motion.div> : encabezado
}
