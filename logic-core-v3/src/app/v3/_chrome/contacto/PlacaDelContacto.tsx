'use client'

import { motion, type MotionValue } from 'motion/react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { ESPESOR_DE_LA_PLACA_PX, PERSPECTIVA_DE_LA_PLACA, TRANSICIONES, useParalaje, viajeDesdeElFondo } from './placa'

/**
 * [CIERRE] 2B · LA PLACA DEL CONTACTO — el bloque de CSS 3D alrededor de la hoja (el frente): el escenario con la
 * perspectiva y el punto de vista del puntero, el viaje (llega desde un punto del fondo y al irse se acuesta sobre su
 * base) y el bloque que gira con el puntero, con sus cinco caras detrás del frente. Apagada (el teléfono, con movimiento
 * reducido) es transparente: `display: contents`, y la hoja se desliza como siempre. El porqué y los números, en `placa.ts`.
 *
 * El escenario no recibe el puntero (un clic al lado de la placa cae en el velo, que cierra); el bloque sí. La opacidad
 * va en el escenario y no en el viaje: un `opacity` menor que 1 sobre un elemento `preserve-3d` lo aplana.
 *
 * [EL ENCASTRE] 1D · el paralaje recién cuando el viaje terminó (`llego`, al completarse su animación: cada apertura monta
 * la placa de nuevo) y el bloque se corre al revés del mouse.
 */
const VIAJE = viajeDesdeElFondo()
const E = ESPESOR_DE_LA_PLACA_PX
/** Las caras de detrás del frente: los cuatro costados (corridos lo que redondea el frente) y la de atrás. */
const CARAS = [
  { cara: 'izquierda', className: 'inset-y-[var(--radius-medio)] left-0 bg-[color-mix(in_srgb,var(--color-tinta)_86%,var(--color-fondo))]', style: { width: E, transformOrigin: 'left center', transform: 'rotateY(90deg)' } },
  { cara: 'derecha', className: 'inset-y-[var(--radius-medio)] right-0 bg-[color-mix(in_srgb,var(--color-tinta)_86%,var(--color-fondo))]', style: { width: E, transformOrigin: 'right center', transform: 'rotateY(-90deg)' } },
  { cara: 'arriba', className: 'inset-x-[var(--radius-medio)] top-0 bg-[color-mix(in_srgb,var(--color-tinta)_78%,var(--color-fondo))]', style: { height: E, transformOrigin: 'center top', transform: 'rotateX(-90deg)' } },
  { cara: 'abajo', className: 'inset-x-[var(--radius-medio)] bottom-0 bg-tinta', style: { height: E, transformOrigin: 'center bottom', transform: 'rotateX(90deg)' } },
  { cara: 'atras', className: 'inset-0 rounded-[var(--radius-medio)] bg-tinta', style: { transform: `translateZ(-${String(E)}px)` } },
] as const

// [PULIDO 10] J5 · `rechazo`: cuánto se hunde el bloque entero (px, en profundidad) cuando el envío falla (lo anima el formulario).
export function PlacaDelContacto({ activa, rechazo, children }: { readonly activa: boolean; readonly rechazo?: MotionValue<number>; readonly children: React.ReactNode }): React.JSX.Element {
  const [llego, setLlego] = useState(false)
  const paralaje = useParalaje(activa, llego)
  if (!activa) return <>{children}</>
  return (
    <motion.div
      data-parte="escenario-de-la-placa"
      className="pointer-events-none absolute inset-0 grid place-items-center p-[var(--pad-lateral-compacto)]"
      style={{ perspective: PERSPECTIVA_DE_LA_PLACA, perspectiveOrigin: paralaje.origen }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { ...TRANSICIONES.acostarse, duration: TRANSICIONES.acostarse.duration * 0.35, delay: TRANSICIONES.acostarse.duration * 0.65 } }}
    >
      <motion.div
        data-parte="viaje-de-la-placa"
        className="w-full max-w-[calc(var(--spacing-20)*11+2*var(--pad-lateral-compacto))]"
        style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
        initial={{ z: VIAJE[0], rotateX: 0 }}
        animate={{ z: [...VIAJE], rotateX: 0 }}
        exit={{ rotateX: 90, z: 0, transition: TRANSICIONES.acostarse }}
        transition={TRANSICIONES.viaje}
        onAnimationComplete={() => setLlego(true)}
      >
        <motion.div data-parte="bloque-de-la-placa" className="pointer-events-auto relative" style={{ transformStyle: 'preserve-3d', x: paralaje.x, y: paralaje.y, z: rechazo, rotateX: paralaje.rotateX, rotateY: paralaje.rotateY }}>
          {children}
          {CARAS.map((c) => (
            <div key={c.cara} data-cara={c.cara} aria-hidden="true" className={cn('absolute', c.className)} style={c.style} />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
