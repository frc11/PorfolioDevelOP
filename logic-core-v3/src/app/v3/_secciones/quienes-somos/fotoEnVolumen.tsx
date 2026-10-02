'use client'

import { motionValue, useMotionValueEvent } from 'motion/react'
import { useRef, type CSSProperties } from 'react'

import type { Progreso } from '../_contrato/coreografia'

/**
 * [RETOQUE 3D] 3D · LAS FOTOS DEL EQUIPO EN VOLUMEN — con CSS 3D: la foto es la del DOM (su hover, la máscara desde el
 * punto, no cambia) adentro de un MARCO con espesor: cuatro cantos que van hacia atrás. Llega desde atrás de la sala con
 * el progreso de su bloque (de lejos, girada y apagada, a su lugar) y ahí queda fija; con el scroll para arriba hace lo
 * mismo al revés (es el progreso: sin reloj propio). La perspectiva mira desde el centro de la página, así el canto de
 * adentro se ve también quieta. Sin progreso (abajo de 1025 o con movimiento reducido), plana: la foto sola.
 */
export type LadoDeLaFoto = 'izquierda' | 'derecha'

export const FOTO_EN_VOLUMEN = {
  /** El espesor del marco y la perspectiva (px). */
  espesor: 28,
  perspectiva: 1100,
  /** Desde dónde llega (px hacia atrás), cuánto gira al llegar (grados) y en qué parte del progreso deja de estar apagada. */
  profundidad: 1600,
  giro: 26,
  inclinacion: 9,
  aparece: 0.25,
} as const

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const salida = (t: number): number => 1 - (1 - t) ** 3

/** La pose de la foto a `p` de su llegada: en 1, en su lugar (sin transformada). Pura: el invariante la recorre. */
export function poseDeLaFoto(p: number, lado: LadoDeLaFoto): { readonly transform: string; readonly opacidad: number } {
  const u = salida(acotar01(p))
  if (u >= 1) return { transform: 'none', opacidad: 1 }
  const f = FOTO_EN_VOLUMEN
  const hacia = lado === 'derecha' ? -1 : 1
  const z = -f.profundidad * (1 - u)
  return {
    transform: `translate3d(0, 0, ${z.toFixed(1)}px) rotateY(${(hacia * f.giro * (1 - u)).toFixed(2)}deg) rotateX(${(f.inclinacion * (1 - u)).toFixed(2)}deg)`,
    opacidad: acotar01(p / f.aparece),
  }
}

const CERO = motionValue(0)

/** El canto: tinta, más clara hacia adelante (la luz del cuarto le pega de frente). */
const CANTO: CSSProperties = { position: 'absolute', background: 'linear-gradient(var(--canto-hacia, to bottom), color-mix(in srgb, var(--color-tinta) 78%, var(--color-fondo)), var(--color-tinta))', pointerEvents: 'none' }
const E = `${String(FOTO_EN_VOLUMEN.espesor)}px`
const CANTOS: readonly CSSProperties[] = [
  { ...CANTO, top: 0, left: 0, right: 0, height: E, transformOrigin: 'top', transform: 'rotateX(-90deg)' },
  { ...CANTO, bottom: 0, left: 0, right: 0, height: E, transformOrigin: 'bottom', transform: 'rotateX(90deg)', ['--canto-hacia' as string]: 'to top' },
  { ...CANTO, top: 0, bottom: 0, left: 0, width: E, transformOrigin: 'left', transform: 'rotateY(90deg)', ['--canto-hacia' as string]: 'to right' },
  { ...CANTO, top: 0, bottom: 0, right: 0, width: E, transformOrigin: 'right', transform: 'rotateY(-90deg)', ['--canto-hacia' as string]: 'to left' },
]

export function FotoEnVolumen({ progreso, lado, children }: { readonly progreso: Progreso; readonly lado: LadoDeLaFoto; readonly children: React.ReactNode }): React.JSX.Element {
  const pieza = useRef<HTMLDivElement | null>(null)
  useMotionValueEvent(progreso ?? CERO, 'change', (p) => {
    const el = pieza.current
    if (el === null) return
    const pose = poseDeLaFoto(p, lado)
    el.style.transform = pose.transform
    el.style.opacity = pose.opacidad.toFixed(3)
  })
  if (progreso === null) return <>{children}</>
  const inicial = poseDeLaFoto(progreso.get(), lado)
  return (
    // La perspectiva mira desde el centro de la página: la foto de la derecha deja ver su canto izquierdo.
    <div data-pieza="foto-en-volumen" style={{ perspective: `${String(FOTO_EN_VOLUMEN.perspectiva)}px`, perspectiveOrigin: lado === 'derecha' ? '-40% 50%' : '140% 50%' }}>
      <div ref={pieza} style={{ position: 'relative', transformStyle: 'preserve-3d', transform: inicial.transform, opacity: inicial.opacidad }}>
        {children}
        {CANTOS.map((estilo, k) => (
          <span key={k} aria-hidden="true" data-parte="canto" style={estilo} />
        ))}
      </div>
    </div>
  )
}
