'use client'

import { motion, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { Imagen } from '../_componentes/medios/Imagen'

import type { Nota } from './_notas/tipos'
import { CLASE_DE_LA_CAPA, useParallaxDeLaFoto } from './_movimiento/parallax'

/** La medida de las fotos de tapa (`public/v3/blog/<slug>.webp`): 4:3. Una foto real de otra proporción entra igual (se recorta al marco). */
export const MEDIDA_DE_LA_FOTO = { ancho: 1600, alto: 1200 } as const

/**
 * [M2] LA FOTO DE UNA NOTA EN SU MARCO — el marco del Panel viejo (`af4e53ca^:…/tu-panel/Tarjeta.tsx`: esquinas redondeadas y una sombra suave y
 * física de dos capas, el contacto y la ambiental, con la tinta al 25 %; sin halo ni degradé) y, adentro, la foto con su parallax de scroll
 * (`_movimiento/parallax.ts`). La proporción la pone quien la usa (`className`, un `aspect-*` o un alto). `corrimientoX` (opcional, el
 * carrusel): un corrimiento horizontal de la foto, en % de su capa, para la profundidad del cambio de tarjeta. La foto es decorativa (`alt=""`):
 * el nombre lo da el título de la nota, al lado.
 */
export const CLASE_DEL_MARCO =
  'relative overflow-hidden rounded-[calc(var(--radius-fuerte)*1.6)] bg-tinta/10 shadow-[0_var(--spacing-1)_var(--spacing-2)_var(--tw-shadow-color),0_var(--spacing-6)_var(--spacing-12)_calc(var(--spacing-5)*-1)_var(--tw-shadow-color)] shadow-tinta/25'

export function FotoDeNota({ nota, sizes, prioridad = false, corrimientoX, className }: {
  readonly nota: Nota
  readonly sizes: string
  readonly prioridad?: boolean
  readonly corrimientoX?: MotionValue<string>
  readonly className?: string
}): React.JSX.Element {
  const marco = useRef<HTMLSpanElement>(null)
  const capa = useRef<HTMLSpanElement>(null)
  useParallaxDeLaFoto(marco, capa)
  return (
    <span ref={marco} data-pieza="foto-de-nota" className={cn('block', CLASE_DEL_MARCO, className)}>
      <span ref={capa} data-parte="capa-de-la-foto" className={cn('block', CLASE_DE_LA_CAPA)}>
        <motion.span className="block size-full" style={corrimientoX === undefined ? undefined : { x: corrimientoX }}>
          <Imagen src={nota.foto} alt="" ancho={MEDIDA_DE_LA_FOTO.ancho} alto={MEDIDA_DE_LA_FOTO.alto} sizes={sizes} prioridad={prioridad} className="h-full w-full object-cover" />
        </motion.span>
      </span>
    </span>
  )
}
