'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useCallback } from 'react'

import { cn } from '@/lib/utils'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { DestinoDelCta, FUENTE_DE_LA_FRASE_DEL_CTA, RenglonDeLaFraseDelCta, useProgresoDelCta } from '../../_componentes/ctaDelFinal/CtaDelFinal'
import { Titular } from '../../_componentes/tipografia/Titular'
import { CTA_EN_VIVO, FRASE_DE_VOLUMEN, type RenglonDelCta } from '../../_lib/escena/ctaDelFinal/enVivo'
import { llegadaDelTexto } from '../../_lib/escena/ctaDelFinal/transformacion'
import { TITULOS_DE_VOLUMEN } from '../../_lib/titulos3d/registro'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { CTA, FRASE } from './contenido'
import { ESTILO_DE_LA_LISTA } from './geometria'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL CON SU TRANSFORMACIÓN, en las dos ramas de «Por qué develOP»: en el escenario y en la lista.
 * [PULIDO 3B] B1 · la del producto (sin bandera; el CTA de antes se fue). La escena dibuja las letras
 * (`_lib/escena/ctaDelFinal/`); acá, sus lugares (el origen, la frase y el botón) y el progreso.
 */

/** [PULIDO 2] 5 · de dónde sale la transformación en el escenario: los renglones de la frase de volumen (su lugar y su subida). */
function origenDeLaFrase(): readonly RenglonDelCta[] {
  return FRASE_DE_VOLUMEN.flatMap((id) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    return t === undefined ? [] : [{ el: t.lugar, subida: t.subida }]
  })
}

/** [PULIDO 2] 5 · el CTA en volumen, en la fuente del registro 1 del hero, al tamaño del botón grande (con el mismo tope). */
/**
 * [PULIDO 3B] B1 · la frase del CTA en sus renglones: las dos mitades de la frase (en el teléfono, cada una en su renglón; desde
 * escritorio, en uno: la escena arma cada una donde está) y el destacado. Sin la escena, se leen.
 */
function FraseDelCta({ claseDelTexto }: { readonly claseDelTexto?: string }): React.JSX.Element {
  return (
    <>
      <Titular nivel="titulo-xl" como="p" className={cn(claseDelTexto, FUENTE_DE_LA_FRASE_DEL_CTA)}>
        <RenglonDeLaFraseDelCta indice={0} className="escritorio:inline">{CTA.fraseEnDos[0]}</RenglonDeLaFraseDelCta>{' '}
        <RenglonDeLaFraseDelCta indice={1} className="escritorio:inline">{CTA.fraseEnDos[1]}</RenglonDeLaFraseDelCta>
      </Titular>
      <Titular nivel="titulo-xl" como="p" peso="fuerte" className={cn(claseDelTexto, FUENTE_DE_LA_FRASE_DEL_CTA)}>
        <RenglonDeLaFraseDelCta indice={2}>{CTA.destacado}</RenglonDeLaFraseDelCta>
      </Titular>
    </>
  )
}

const TAMANO_DEL_CTA_EN_VOLUMEN = 'escritorio:text-[length:min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/3.3))]'

/**
 * [PULIDO 2] 5 · EL CTA CON SU TRANSFORMACIÓN, en el escenario: centrado; la escena dibuja la frase y el CTA desde «Seis
 * razones» (sin la escena, llegan al final). El foco del teclado lleva al final.
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
        <FraseDelCta claseDelTexto={claseDelTexto} />
      </CanalDeUnaPieza>
      <div className="mt-[var(--spacing-6)]">
        <DestinoDelCta rotulo={CTA.rotulo} destino={CTA.destino} progreso={progreso} className={TAMANO_DEL_CTA_EN_VOLUMEN} />
      </div>
    </div>
  )
}

/**
 * [PULIDO 2] 5 · EL CTA CON SU TRANSFORMACIÓN, EN LA LISTA: la frase del CTA (que la escena arma desde «Seis razones», en el
 * lugar de la frase: [PULIDO 3B] B1 · sin copia de «Seis razones» en el DOM, la escena la pone centrada sobre cada renglón) y
 * abajo el CTA en volumen. El bloque mide tres pantallas ([PULIDO 3B] B1 · antes dos: el recorrido, más lento) y su contenido
 * queda clavado mientras corre la transformación (`MedirLaLista`), centrado y con el logo ya abajo; por eso su texto va en
 * tinta y sin la mezcla: la mezcla se corta adentro de lo clavado y acá no pasa sobre el logo. Con movimiento reducido no hay
 * recorrido: una pantalla, el estado final; en escritorio la sección sigue midiendo su escenario entero, así que el CTA va
 * en la mitad de la pose C (`ARRIBA_DEL_CTA_QUIETO_SVH`), donde la cámara ya está en la del CTA: con el logo abajo, no lo pisa.
 */
const CON_MOVIMIENTO_REDUCIDO = 'min-h-[var(--alto-del-cta-en-lista)] escritorio:absolute escritorio:inset-x-0 escritorio:top-[var(--arriba-del-cta-quieto)]'

export function CtaTransformadoEnLaLista({ caja, progreso }: { readonly caja: React.RefObject<HTMLDivElement | null>; readonly progreso: MotionValue<number> }): React.JSX.Element {
  // El origen de la lista: «Seis razones para elegirnos» sin copia en el DOM, centrado sobre cada renglón de la frase del CTA.
  const origen = useCallback((): readonly RenglonDelCta[] => CTA_EN_VIVO.frase.slice(0, 2).flatMap((el, k) => (el === null ? [] : [{ el, subida: 0, texto: k === 0 ? FRASE.izquierda : FRASE.derecha }])), [])
  useProgresoDelCta(progreso, 'lista', origen)
  const texto = useTransform(progreso, llegadaDelTexto)
  // Con el servidor (sin preferencia) y después la del navegador: sin el desfase de la hidratación (el bloque se arma en el servidor).
  const quieto = usePrefiereMenosMovimiento()
  return (
    <div ref={caja} data-pieza="cta-del-final" style={ESTILO_DE_LA_LISTA} className={quieto ? CON_MOVIMIENTO_REDUCIDO : 'min-h-[calc(var(--alto-del-cta-en-lista)*3)]'}>
      <div className="sticky top-0 flex min-h-[var(--alto-del-cta-en-lista)] flex-col items-center justify-center gap-[var(--spacing-8)] text-center">
        <motion.div style={{ opacity: texto }}>
          <FraseDelCta />
        </motion.div>
        <DestinoDelCta rotulo={CTA.rotulo} destino={CTA.destino} progreso={progreso} />
      </div>
    </div>
  )
}
