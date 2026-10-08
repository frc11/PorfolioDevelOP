'use client'

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import { CTA_EN_VIVO, avisarDelLugar, ctaListo, suscribirAlCta, varianteDelCta, type RenglonDelCta } from '../../_lib/escena/ctaDelFinal/enVivo'
import { ctaTocable, entradaEnLaLista, llegadaDelTexto, plegadoDelValor, progresoEnLaLista } from '../../_lib/escena/ctaDelFinal/variantes'
import type { VarianteDelCta } from '../../_lib/escena/entorno'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL CON SU TRANSFORMACIÓN, DEL LADO DEL DOM (`?cta=capas|relevo|giro|cruce|tipo`; sin bandera
 * nada de esto se monta: el CTA de hoy, igual). El DOM le dice a la escena dónde está cada cosa y cuánto avanzó la
 * transformación (función del scroll); la escena dibuja las letras (`_lib/escena/ctaDelFinal/`). El texto del DOM sigue
 * entero para los lectores de pantalla y los buscadores, y se esconde recién cuando la escena avisa que armó sus letras: sin
 * WebGL se sigue leyendo (el CTA llega como el resto del texto).
 */
const sinCambios = (): (() => void) => () => undefined

/** La variante de esta carga, después de hidratar (el servidor no la conoce: el primer render es el CTA de hoy). */
export function useVarianteDelCta(): VarianteDelCta | null {
  return useSyncExternalStore(sinCambios, varianteDelCta, () => null)
}

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

/**
 * `capas`: el valor `k` se pliega sobre su eje horizontal hasta quedar de canto (y la escena sigue desde ahí con su capa del
 * CTA); al volver el scroll, se despliega. La escena lee su caja en cada cuadro.
 */
export function PliegueDelValor({ indice, progreso, children }: { readonly indice: number; readonly progreso: MotionValue<number>; readonly children: React.ReactNode }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = caja.current
    if (el !== null) CTA_EN_VIVO.valores[indice] = el
    return () => {
      if (CTA_EN_VIVO.valores[indice] === el) CTA_EN_VIVO.valores[indice] = null
    }
  }, [indice])
  const rotateX = useTransform(progreso, (p) => 90 * plegadoDelValor(indice, p))
  return (
    <motion.div ref={caja} style={{ rotateX, transformPerspective: 900 }}>
      {children}
    </motion.div>
  )
}
