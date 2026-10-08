'use client'

import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useCallback, useRef } from 'react'

import { DestinoDelCta, useCtaListo, useProgresoDelCta } from '../../_componentes/ctaDelFinal/CtaDelFinal'
import { Titular } from '../../_componentes/tipografia/Titular'
import { FRASE_DE_VOLUMEN, type RenglonDelCta } from '../../_lib/escena/ctaDelFinal/enVivo'
import { llegadaDelTexto } from '../../_lib/escena/ctaDelFinal/variantes'
import { TITULOS_DE_VOLUMEN } from '../../_lib/titulos3d/registro'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { CTA, FRASE } from './contenido'
import { ESTILO_DE_LA_LISTA } from './geometria'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL CON SU TRANSFORMACIÓN (`?cta=capas|relevo|giro|cruce|tipo`), en las dos ramas de «Por qué
 * develOP»: en el escenario y en la lista. Sin bandera no se monta (`PorQueDevelop.tsx` pone el CTA de hoy). La escena dibuja
 * las letras (`_lib/escena/ctaDelFinal/`); acá, sus lugares, el progreso y el texto que acompaña al CTA.
 */

/** [PULIDO 2] 5 · de dónde sale la transformación en el escenario: los renglones de la frase de volumen (su lugar y su subida). */
function origenDeLaFrase(): readonly RenglonDelCta[] {
  return FRASE_DE_VOLUMEN.flatMap((id) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    return t === undefined ? [] : [{ el: t.lugar, subida: t.subida }]
  })
}

/** [PULIDO 2] 5 · el CTA en volumen, en la fuente del registro 1 del hero, al tamaño del botón grande (con el mismo tope). */
const TAMANO_DEL_CTA_EN_VOLUMEN = 'escritorio:text-[length:min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/3.3))]'

/**
 * [PULIDO 2] 5 · EL CTA CON SU TRANSFORMACIÓN (`?cta=`), en el escenario: el mismo lugar que el de hoy; la escena dibuja el
 * CTA desde «Seis razones» y el texto que lo acompaña llega al final. El foco del teclado lleva al final, como el de hoy.
 */
export function CtaTransformado({ progreso, claseDelTexto, alEnfocar }: { readonly progreso: MotionValue<number>; readonly claseDelTexto: string; readonly alEnfocar: (cta: HTMLElement, llegada: number) => void }): React.JSX.Element {
  useProgresoDelCta(progreso, 'escenario', origenDeLaFrase)
  const texto = useTransform(progreso, llegadaDelTexto)
  return (
    <div
      data-pieza="cta-del-final"
      className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center px-[var(--pad-lateral-compacto)] text-center"
      onFocus={(e) => alEnfocar(e.currentTarget, progreso.get())}
    >
      <CanalDeUnaPieza progreso={texto} patron="P5">
        <Titular nivel="titulo-xl" como="p" className={claseDelTexto}>
          {CTA.frase}
        </Titular>
      </CanalDeUnaPieza>
      <CanalDeUnaPieza progreso={texto} patron="P5">
        <Titular nivel="titulo-xl" como="p" peso="fuerte" className={claseDelTexto}>
          {CTA.destacado}
        </Titular>
      </CanalDeUnaPieza>
      <div className="mt-[var(--spacing-6)]">
        <DestinoDelCta rotulo={CTA.rotulo} destino={CTA.destino} progreso={progreso} className={TAMANO_DEL_CTA_EN_VOLUMEN} />
      </div>
    </div>
  )
}

/**
 * [PULIDO 2] 5 · EL CTA CON SU TRANSFORMACIÓN, EN LA LISTA: arriba la copia de «Seis razones» que la escena transforma (para
 * el lector no existe: la frase está arriba de la lista; en `capas`, no está: el CTA sale de los valores), en su mismo lugar
 * el texto que acompaña al CTA (llega al final) y abajo el CTA en volumen. El bloque mide dos pantallas y su contenido queda
 * clavado mientras corre la transformación (la pantalla de más es su recorrido: `MedirLaLista`), centrado y con el logo ya
 * abajo; por eso su texto va en tinta y sin la mezcla: la mezcla se corta adentro de lo clavado (el texto blanco no se
 * vería) y acá no pasa sobre el logo. Con movimiento reducido no hay recorrido: una pantalla, el estado final; en escritorio
 * la sección sigue midiendo su escenario entero (la lista queda arriba, con la cámara todavía en la frase y el logo en el
 * centro), así que el CTA va en su última pantalla, donde la cámara ya está en la del CTA: con el logo abajo, no lo pisa.
 */
const CON_MOVIMIENTO_REDUCIDO = 'min-h-[var(--alto-del-cta-en-lista)] escritorio:absolute escritorio:inset-x-0 escritorio:bottom-0'

export function CtaTransformadoEnLaLista({ caja, progreso, entrada, conFrase }: { readonly caja: React.RefObject<HTMLDivElement | null>; readonly progreso: MotionValue<number>; readonly entrada: MotionValue<number>; readonly conFrase: boolean }): React.JSX.Element {
  const renglones = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)] as const
  const [primero, segundo] = renglones
  const origen = useCallback((): readonly RenglonDelCta[] => [primero.current, segundo.current].flatMap((el) => (el === null ? [] : [{ el, subida: 0 }])), [primero, segundo])
  useProgresoDelCta(progreso, 'lista', origen)
  const listo = useCtaListo()
  const texto = useTransform(progreso, llegadaDelTexto)
  const copia = useTransform(() => entrada.get() * (1 - texto.get()))
  const quieto = useReducedMotion() === true
  return (
    <div ref={caja} data-pieza="cta-del-final" style={ESTILO_DE_LA_LISTA} className={quieto ? CON_MOVIMIENTO_REDUCIDO : 'min-h-[calc(var(--alto-del-cta-en-lista)*2)]'}>
      <div className="sticky top-0 flex min-h-[var(--alto-del-cta-en-lista)] flex-col items-center justify-center gap-[var(--spacing-8)] text-center">
        <div className="relative">
          {conFrase && (
            <motion.p aria-hidden="true" style={{ opacity: listo ? 0 : copia }} className="pointer-events-none absolute inset-x-0 top-0">
              <Titular nivel="titulo-xl" como="span" className="block">
                <span ref={primero} className="block">{FRASE.izquierda}</span>
              </Titular>
              <Titular nivel="titulo-xl" como="span" className="block">
                <span ref={segundo} className="block">{FRASE.derecha}</span>
              </Titular>
            </motion.p>
          )}
          <motion.div style={{ opacity: texto }}>
            <Titular nivel="titulo-xl" como="p">
              {CTA.frase}
            </Titular>
            <Titular nivel="titulo-xl" como="p" peso="fuerte">
              {CTA.destacado}
            </Titular>
          </motion.div>
        </div>
        <DestinoDelCta rotulo={CTA.rotulo} destino={CTA.destino} progreso={progreso} />
      </div>
    </div>
  )
}
