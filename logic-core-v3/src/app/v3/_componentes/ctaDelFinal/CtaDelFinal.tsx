'use client'

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import { CTA_EN_VIVO, avisarDelLugar, ctaListo, suscribirAlCta, type RenglonDelCta } from '../../_lib/escena/ctaDelFinal/enVivo'
import { ctaTocable, entradaEnLaLista, llegadaDelTexto, progresoEnLaLista } from '../../_lib/escena/ctaDelFinal/transformacion'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL CON SU TRANSFORMACIÓN, DEL LADO DEL DOM ([PULIDO 3B] B1: la del producto, sin bandera). El
 * DOM le dice a la escena dónde está cada cosa y cuánto avanzó la transformación (función del scroll); la escena dibuja las
 * letras (`_lib/escena/ctaDelFinal/`). El texto del DOM sigue entero para los lectores de pantalla y los buscadores, y se
 * esconde recién cuando la escena avisa que armó sus letras: sin WebGL se sigue leyendo (el CTA llega como el resto del texto).
 */

/** ¿La escena ya dibuja las letras del CTA? `false` en el servidor y en el primer render. */
export function useCtaListo(): boolean {
  return useSyncExternalStore(suscribirAlCta, ctaListo, () => false)
}

/** Escribe para la escena el progreso (en cada cambio), dónde se mide y de dónde sale la transformación. */
export function useProgresoDelCta(progreso: MotionValue<number>, donde: 'escenario' | 'lista', origen: () => readonly RenglonDelCta[]): void {
  useMotionValueEvent(progreso, 'change', (p) => {
    CTA_EN_VIVO.progreso = p
  })
  useEffect(() => {
    CTA_EN_VIVO.progreso = progreso.get()
    CTA_EN_VIVO.donde = donde
    CTA_EN_VIVO.origen = origen
    avisarDelLugar()
    return () => {
      CTA_EN_VIVO.progreso = 0
      CTA_EN_VIVO.origen = () => []
      avisarDelLugar()
    }
  }, [progreso, donde, origen])
}

/**
 * En la lista (abajo de 1024 y con menos movimiento), el progreso es el recorrido de la caja del CTA (dos pantallas, con su
 * contenido clavado): 0 con su borde de arriba en el de la pantalla, 1 con su borde de abajo en el de la pantalla. Con
 * movimiento reducido, 1: el estado final directo.
 */
export function MedirLaLista({ caja, progreso, entrada }: { readonly caja: RefObject<HTMLElement | null>; readonly progreso: MotionValue<number>; readonly entrada: MotionValue<number> }): null {
  const quieto = useReducedMotion() === true
  const { scrollYProgress } = useScroll({ target: caja, offset: ['start start', 'end end'] })
  const poner = (r: number): void => {
    progreso.set(quieto ? 1 : progresoEnLaLista(r))
    entrada.set(quieto ? 1 : entradaEnLaLista(r))
    CTA_EN_VIVO.entrada = entrada.get()
  }
  useMotionValueEvent(scrollYProgress, 'change', poner)
  useEffect(() => {
    poner(scrollYProgress.get())
    return () => {
      CTA_EN_VIVO.entrada = 1
    }
  })
  return null
}

/** Las clases del CTA en volumen: la fuente del registro 1 del hero (Archivo, en mayúsculas), al tamaño del botón grande. */
const FUENTE_DEL_CTA = 'font-display font-fuerte uppercase tracking-display leading-titulo text-fluido-display-xl'

/**
 * [PULIDO 3B] B1 · la frase del CTA en la fuente del registro 1 del hero (Archivo, en mayúsculas: la fuente del sitio es la de
 * ese registro, sin minúsculas): la escena la arma en 3D con las mismas letras, en su lugar.
 */
export const FUENTE_DE_LA_FRASE_DEL_CTA = 'font-[family-name:var(--font-v3-archivo)] uppercase'

/**
 * [PULIDO 3B] B1 · un renglón de la frase del CTA: le dice a la escena dónde está (ahí arma la frase) y se esconde cuando la
 * escena ya dibuja sus letras (sin WebGL, se lee).
 */
export function RenglonDeLaFraseDelCta({ indice, children, className }: { readonly indice: number; readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  const listo = useCtaListo()
  const renglon = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = renglon.current
    CTA_EN_VIVO.frase[indice] = el
    avisarDelLugar()
    return () => {
      if (CTA_EN_VIVO.frase[indice] === el) CTA_EN_VIVO.frase[indice] = null
      avisarDelLugar()
    }
  }, [indice])
  return (
    <span ref={renglon} className={cn('block', className, listo && 'opacity-0')}>
      {children}
    </span>
  )
}

/**
 * EL CTA EN SU LUGAR: el texto en la fuente del registro 1 del hero, que la escena reemplaza con sus letras (y hasta entonces
 * llega con el resto del texto). Es un enlace que abre el panel de Contacto (con la transición de siempre, `data-abre-contacto`)
 * y se puede tocar recién cuando la transformación terminó. El hover (sólo con el mouse) levanta el CTA en la escena.
 */
export function DestinoDelCta({ rotulo, destino, progreso, className }: { readonly rotulo: string; readonly destino: string; readonly progreso: MotionValue<number>; readonly className?: string }): React.JSX.Element {
  const listo = useCtaListo()
  const texto = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = texto.current
    CTA_EN_VIVO.destino = el
    avisarDelLugar()
    return () => {
      if (CTA_EN_VIVO.destino === el) CTA_EN_VIVO.destino = null
      CTA_EN_VIVO.hover = false
      avisarDelLugar()
    }
  }, [])
  const pointerEvents = useTransform(progreso, (p) => (ctaTocable(p) ? 'auto' : 'none'))
  const llegada = useTransform(progreso, llegadaDelTexto)
  return (
    <motion.a
      href={destino}
      data-pieza="cta-en-volumen"
      data-abre-contacto="panel"
      aria-label={rotulo}
      style={{ pointerEvents }}
      className="inline-block no-underline"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') CTA_EN_VIVO.hover = true
      }}
      onPointerLeave={() => {
        CTA_EN_VIVO.hover = false
      }}
    >
      <motion.span ref={texto} aria-hidden="true" style={{ opacity: listo ? 0 : llegada }} className={cn('block', FUENTE_DEL_CTA, className)}>
        {rotulo.toUpperCase()}
      </motion.span>
    </motion.a>
  )
}
