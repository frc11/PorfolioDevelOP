'use client'

import { motion, type MotionValue } from 'motion/react'
import type { RefObject } from 'react'

import type { IntroInkSize, IntroLockupText } from './introFlight'
import { IntroLockup } from './IntroLockup'
import { IntroLogo3D } from './IntroLogo3D'
import { IntroParticleCanvas } from './IntroParticleCanvas'
import type { IntroTimeline } from './introTimeline'
import type { IntroChannels } from './useIntroChannels'
import type { ViewportSize } from './useViewportSize'

/**
 * LA CAPA — cómo se apilan el fondo, las partículas, el lockup y el mesh.
 *
 * Cuatro planos, y el orden importa:
 *
 *  1. **El fondo.** Cambia de color durante la transformación y se disuelve al
 *     final, después de que la letra terminó de irse. El logo no se va con él:
 *     sigue ahí, y recién entonces se acomoda.
 *  2. **Las partículas** (S13). Van acá y no arriba del todo por una razón que
 *     se mide: así **la marca las tapa en todo instante y sin discontinuidad**
 *     —primero el SVG relleno, después el mesh—, igual que en la escena. Y
 *     quedan por ENCIMA del fondo, que es contra lo que se recortan: son de
 *     tinta, no de luz.
 *  3. **El lockup.** Acá se fija la tinta una sola vez, y el logo y las letras
 *     la heredan por `currentColor` — por eso cambian de color exactamente
 *     juntos, con un solo valor.
 *  4. **El mesh**, arriba de todo. Aparece durante la transformación mientras el
 *     SVG se desvanece, y con el mismo color que él.
 *
 * `pointer-events-none` en la raíz y también en el canvas (r3f le pone `auto` a
 * su propio div y hay que pisarlo): la capa nunca intercepta nada.
 *
 * Las clases de color son la red del PRIMER PAINT — el `style` las pisa apenas
 * hidrata, pero hasta ahí garantizan la pantalla oscura sin depender de que
 * `motion` serialice sus MotionValues en el HTML del server.
 */

type IntroOverlayProps = {
  channels: IntroChannels
  /** El único progreso: lo consumen las partículas, que dibujan por su cuenta. */
  progress: MotionValue<number>
  timelineRef: RefObject<IntroTimeline>
  viewport: ViewportSize
  /** Tamaño de la tinta. Constante durante toda la secuencia. */
  ink: IntroInkSize
  text: IntroLockupText
  /** Lo llama el canvas del logo cuando empieza y cuando deja de pintar. */
  onMeshPainted: (painted: boolean) => void
}

export function IntroOverlay({
  channels,
  progress,
  timelineRef,
  viewport,
  ink,
  text,
  onMeshPainted,
}: IntroOverlayProps) {
  return (
    <div
      data-home-intro-overlay=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
    >
      <motion.div
        className="absolute inset-0 bg-ds-void will-change-[opacity]"
        style={{ backgroundColor: channels.background, opacity: channels.veilOpacity }}
      />
      <IntroParticleCanvas progress={progress} timelineRef={timelineRef} viewport={viewport} />
      <motion.div className="absolute inset-0 text-ds-dark-ink" style={{ color: channels.ink }}>
        <IntroLockup
          ink={ink}
          text={text}
          wordmarkOpacity={channels.wordmarkOpacity}
          sloganOpacity={channels.sloganOpacity}
          strokeDraw={channels.strokeDraw}
          fill={channels.fill}
          svgOpacity={channels.svgOpacity}
          logoX={channels.logoX}
          logoY={channels.logoY}
        />
      </motion.div>
      <IntroLogo3D
        centerX={channels.logoCenterX}
        centerY={channels.logoCenterY}
        inkHeightPx={channels.logoInkHeight}
        reveal={channels.logoReveal}
        opacity={channels.meshOpacity}
        ink={channels.ink}
        onPainted={onMeshPainted}
      />
    </div>
  )
}
