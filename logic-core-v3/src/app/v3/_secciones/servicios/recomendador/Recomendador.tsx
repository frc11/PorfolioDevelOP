'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { Gatillo } from '../../_contrato/Gatillo'
import { EncabezadoDelRecomendador } from './EncabezadoDelRecomendador'
import { EtapaDelRecomendador } from './EtapaDelRecomendador'
import { INICIO_DEL_RECOMENDADOR, avanzar, respuestasCompletas, type AccionDelRecomendador } from './flujo'
import { TEXTOS_DEL_RECOMENDADOR } from './logica'
import { fundidoQueSube, llevarALaVista } from './movimiento'
import { Procesando } from './Procesando'
import { ResultadoDelRecomendador } from './ResultadoDelRecomendador'

/**
 * [B4 · C2-51] EL RECOMENDADOR — después de los tres servicios, con scroll normal: el último tramo de Servicios ya no es gatillo
 * (`salidaDeAbajoLibre` de la máquina, `EscenarioDeServicios`). Adentro de la sección de Servicios: la zona donde el chat se
 * desvanece (C2-21, `ZONAS_SIN_CHAT`) lo incluye.
 *
 *   1. El encabezado, arriba a la izquierda (`EncabezadoDelRecomendador`).
 *   2. El cuerpo, que se levanta al cruzar la línea de disparo (`Gatillo`) y cambia EN EL MISMO LUGAR con un fundido
 *      (`AnimatePresence` en `wait`): las tres etapas (`EtapaDelRecomendador`), el procesando (`Procesando`) y el resultado con el
 *      contacto precargado (`ResultadoDelRecomendador`). El flujo es puro (`flujo.ts`) y la cuenta también (`logica.ts`).
 *
 * Abajo de 1024 (teléfono y tablet) el mismo flujo en una columna. Cuando el cambio deja el cuerpo fuera de la vista (el teléfono, al
 * llegar el resultado, al empezar de nuevo), se lo trae (`llevarALaVista`). El alto cambia con lo que muestra: la REGLA DE ALTURAS la
 * sigue `tramoDeServicios.ts` (mide la sección con un `ResizeObserver`).
 */

/** El título, como lo leen las pruebas de la sección. */
export const TITULO_DEL_RECOMENDADOR = TEXTOS_DEL_RECOMENDADOR.titulo

const ID_DEL_TITULO_DEL_RESULTADO = 'titulo-del-resultado-del-recomendador'
// (El foco del resultado lo toma el resultado al montarse: `AnimatePresence` lo monta después del fundido del procesando.)

export function Recomendador(): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const [estado, despacharSinMarcar] = useReducer(avanzar, INICIO_DEL_RECOMENDADOR)
  // Ya hubo un gesto: lo que se monte de ahora en más toma el foco (la carga de la página, no).
  const [tocado, setTocado] = useState(false)
  const cuerpo = useRef<HTMLDivElement>(null)
  const despachar = useCallback((a: AccionDelRecomendador) => {
    setTocado(true)
    despacharSinMarcar(a)
  }, [])
  const terminarElProcesando = useCallback(() => despacharSinMarcar({ tipo: 'procesado' }), [])
  const respuestas = respuestasCompletas(estado.respuestas)

  // Cada cambio de etapa o de fase (no el primer toque): si el tope del cuerpo quedó arriba, fuera de la vista, se lo trae.
  const antes = useRef(`${estado.fase}|${String(estado.etapa)}`)
  useEffect(() => {
    const ahora = `${estado.fase}|${String(estado.etapa)}`
    if (ahora === antes.current) return
    antes.current = ahora
    llevarALaVista(cuerpo.current, reducido)
  }, [estado.etapa, estado.fase, reducido])

  return (
    <div data-pieza="recomendador" data-fase={estado.fase} className="mx-auto flex w-full max-w-[var(--container-tope)] flex-col gap-[var(--spacing-12)] px-[var(--pad-lateral-compacto)] pt-[var(--spacing-20)] pb-[var(--spacing-24)] escritorio:gap-[var(--spacing-16)]">
      <EncabezadoDelRecomendador />
      <Gatillo desde="abajo">
        <div ref={cuerpo} data-parte="cuerpo-del-recomendador" className="rounded-[var(--radius-fuerte)] border border-borde bg-superficie-1 p-[var(--spacing-5)] escritorio:p-[var(--spacing-10)]">
          <AnimatePresence mode="wait" initial={false}>
            {/* Sin las props de Motion hasta el primer gesto: el árbol servido no escribe una transformada (s10). */}
            <motion.div key={estado.fase} {...(tocado ? fundidoQueSube(reducido) : {})}>
              {estado.fase === 'preguntas' && <EtapaDelRecomendador estado={estado} despachar={despachar} reducido={reducido} enfocarAlMontar={tocado} />}
              {estado.fase === 'procesando' && <Procesando reducido={reducido} alTerminar={terminarElProcesando} />}
              {estado.fase === 'resultado' && respuestas !== null && (
                <ResultadoDelRecomendador respuestas={respuestas} elegida={estado.elegida} despachar={despachar} reducido={reducido} idDelTitulo={ID_DEL_TITULO_DEL_RESULTADO} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Gatillo>
    </div>
  )
}
