'use client'

import { motion } from 'motion/react'

import type { IntroInkSize, IntroLockupText } from './introFlight'
import { IntroLockup } from './IntroLockup'
import { IntroLogo3D } from './IntroLogo3D'
import type { IntroChannels } from './useIntroChannels'

/**
 * LA CAPA — cómo se apilan el fondo, el lockup y el mesh.
 *
 * Tres planos, y el orden importa:
 *
 *  1. **El fondo.** Cambia de color durante la transformación y se disuelve al
 *     final, después de que la letra terminó de irse. El logo no se va con él:
 *     sigue ahí, y recién entonces se acomoda.
 *  2. **El lockup.** Acá se fija la tinta una sola vez, y el logo y las letras
 *     la heredan por `currentColor` — por eso cambian de color exactamente
 *     juntos, con un solo valor.
 *  3. **El mesh**, arriba de todo. Aparece durante la transformación mientras el
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
  /** Tamaño de la tinta. Constante durante toda la secuencia. */
  ink: IntroInkSize
  text: IntroLockupText
  onMeshReady: () => void
}

export function IntroOverlay({ channels, ink, text, onMeshReady }: IntroOverlayProps) {
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
        onReady={onMeshReady}
      />
    </div>
  )
}
