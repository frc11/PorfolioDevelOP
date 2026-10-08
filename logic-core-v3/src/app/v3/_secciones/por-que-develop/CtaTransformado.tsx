'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useCallback, useRef } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { DestinoDelCta, RenglonDeLaFraseDelCta, estiloEnElViaje, useCtaListo, useProgresoDelCta, useValorDeLaEscena, useViajando } from '../../_componentes/ctaDelFinal/CtaDelFinal'
import { Titular } from '../../_componentes/tipografia/Titular'
import { FRASE_DE_VOLUMEN, type RenglonDelCta } from '../../_lib/escena/ctaDelFinal/enVivo'
import { llegadaDelTexto } from '../../_lib/escena/ctaDelFinal/transformacion'
import { TITULOS_DE_VOLUMEN } from '../../_lib/titulos3d/registro'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { CTA, FRASE, VALORES } from './contenido'
import { ESTILO_DE_LA_LISTA } from './geometria'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL CON SU TRANSFORMACIÓN, en las dos ramas de «Por qué develOP»: en el escenario y en la lista.
 * La escena dibuja (`_lib/escena/ctaDelFinal/`); acá, los lugares y el progreso. [PULIDO 4] C1 · el cruce de `2411371a`
 * («Seis razones» → «HABLANOS») y la frase del CTA, que la escena arma desde los seis valores (la metamorfosis). En un viaje
 * del menú no se muestra.
 */

/** [PULIDO 2] 5 · de dónde sale el cruce en el escenario: los renglones de la frase de volumen (su lugar y su subida). */
function origenDeLaFrase(): readonly RenglonDelCta[] {
  return FRASE_DE_VOLUMEN.flatMap((id) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    return t === undefined ? [] : [{ el: t.lugar, subida: t.subida }]
  })
}

/**
 * [PULIDO 3B] B1 · la frase del CTA en sus renglones: las dos mitades de la frase (en el teléfono, cada una en su renglón; desde
 * escritorio, en uno) y el destacado. Sin la escena, se leen. [PULIDO 4] C1 · con su copy (en la Chivo del DOM): la escena la
 * arma en Archivo, centrada en cada renglón.
 */
function FraseDelCta({ claseDelTexto }: { readonly claseDelTexto?: string }): React.JSX.Element {
  return (
    <>
      <Titular nivel="titulo-xl" como="p" className={claseDelTexto}>
        <RenglonDeLaFraseDelCta indice={0} className="escritorio:inline">{CTA.fraseEnDos[0]}</RenglonDeLaFraseDelCta>{' '}
        <RenglonDeLaFraseDelCta indice={1} className="escritorio:inline">{CTA.fraseEnDos[1]}</RenglonDeLaFraseDelCta>
      </Titular>
      <Titular nivel="titulo-xl" como="p" peso="fuerte" className={claseDelTexto}>
        <RenglonDeLaFraseDelCta indice={2}>{CTA.destacado}</RenglonDeLaFraseDelCta>
      </Titular>
    </>
  )
}

/** [PULIDO 2] 5 · el CTA en volumen, en la fuente del registro 1 del hero, al tamaño del botón grande (con el mismo tope). */
const TAMANO_DEL_CTA_EN_VOLUMEN = 'escritorio:text-[length:min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/3.3))]'

/**
 * [PULIDO 2] 5 · EL CTA CON SU TRANSFORMACIÓN, en el escenario: centrado; la escena dibuja la frase (desde los valores) y el CTA
 * (desde «Seis razones»); sin la escena, llegan al final. El foco del teclado lleva al final.
 */
export function CtaTransformado({ progreso, claseDelTexto, alEnfocar }: { readonly progreso: MotionValue<number>; readonly claseDelTexto: string; readonly alEnfocar: (cta: HTMLElement, llegada: number) => void }): React.JSX.Element {
  useProgresoDelCta(progreso, 'escenario', origenDeLaFrase)
  const texto = useTransform(progreso, llegadaDelTexto)
  const enViaje = useViajando()
  return (
    <div
      data-pieza="cta-del-final"
      className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center px-[var(--pad-lateral-compacto)] text-center"
      style={estiloEnElViaje(enViaje)}
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

/** [PULIDO 4] C1 · la copia del título de un valor en el bloque clavado de la lista: la escena la transforma en la frase. */
function CopiaDelValor({ indice, titulo }: { readonly indice: number; readonly titulo: string }): React.JSX.Element {
  const ref = useValorDeLaEscena<HTMLSpanElement>(indice, null)
  return (
    <li>
      <Titular nivel="titulo-s" como="span" className="block">
        <span ref={ref} className="inline-block">{titulo}</span>
      </Titular>
    </li>
  )
}

/**
 * [PULIDO 2] 5 · EL CTA CON SU TRANSFORMACIÓN, EN LA LISTA: arriba, la copia de «Seis razones» que hace el cruce (para el lector
 * no existe: la frase está arriba de la lista); en el lugar de la frase, la copia de los títulos de los seis valores que la
 * escena transforma en ella ([PULIDO 4] C1); abajo, el CTA en volumen. El bloque mide tres pantallas y su contenido queda
 * clavado mientras corre la transformación (`MedirLaLista`), centrado y con el logo ya abajo; por eso su texto va en tinta y
 * sin la mezcla: la mezcla se corta adentro de lo clavado y acá no pasa sobre el logo. Las copias van afuera del flujo: el
 * CTA que queda (la frase y el botón) es el que se centra. Con movimiento reducido no hay recorrido: una pantalla, el estado
 * final; en escritorio la sección sigue midiendo su escenario entero, así que el CTA va en la mitad de la pose C
 * (`ARRIBA_DEL_CTA_QUIETO_SVH`), donde la cámara ya está en la del CTA: con el logo abajo, no lo pisa.
 */
const CON_MOVIMIENTO_REDUCIDO = 'min-h-[var(--alto-del-cta-en-lista)] escritorio:absolute escritorio:inset-x-0 escritorio:top-[var(--arriba-del-cta-quieto)]'

export function CtaTransformadoEnLaLista({ caja, progreso, entrada }: { readonly caja: React.RefObject<HTMLDivElement | null>; readonly progreso: MotionValue<number>; readonly entrada: MotionValue<number> }): React.JSX.Element {
  const primero = useRef<HTMLSpanElement>(null)
  const segundo = useRef<HTMLSpanElement>(null)
  const origen = useCallback((): readonly RenglonDelCta[] => [primero.current, segundo.current].flatMap((el) => (el === null ? [] : [{ el, subida: 0 }])), [])
  useProgresoDelCta(progreso, 'lista', origen)
  const listo = useCtaListo()
  const texto = useTransform(progreso, llegadaDelTexto)
  const copia = useTransform(() => entrada.get() * (1 - texto.get()))
  const enViaje = useViajando()
  // Con el servidor (sin preferencia) y después la del navegador: sin el desfase de la hidratación (el bloque se arma en el servidor).
  const quieto = usePrefiereMenosMovimiento()
  return (
    <div ref={caja} data-pieza="cta-del-final" style={ESTILO_DE_LA_LISTA} className={quieto ? CON_MOVIMIENTO_REDUCIDO : 'min-h-[calc(var(--alto-del-cta-en-lista)*3)]'}>
      <div className="sticky top-0 flex min-h-[var(--alto-del-cta-en-lista)] flex-col items-center justify-center gap-[var(--spacing-8)] text-center" style={estiloEnElViaje(enViaje)}>
        <div className="relative">
          <motion.p aria-hidden="true" style={{ opacity: listo ? 0 : copia }} className="pointer-events-none absolute inset-x-0 bottom-full mb-[var(--spacing-8)]">
            <Titular nivel="titulo-xl" como="span" className="block">
              <span ref={primero} className="block">{FRASE.izquierda}</span>
            </Titular>
            <Titular nivel="titulo-xl" como="span" className="block">
              <span ref={segundo} className="block">{FRASE.derecha}</span>
            </Titular>
          </motion.p>
          <motion.ul aria-hidden="true" style={{ opacity: listo ? 0 : copia }} className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-[var(--spacing-1)]">
            {VALORES.map((v, k) => (
              <CopiaDelValor key={v.clave} indice={k} titulo={v.titulo} />
            ))}
          </motion.ul>
          <motion.div style={{ opacity: texto }}>
            <FraseDelCta />
          </motion.div>
        </div>
        <DestinoDelCta rotulo={CTA.rotulo} destino={CTA.destino} progreso={progreso} />
      </div>
    </div>
  )
}
