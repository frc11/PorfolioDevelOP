'use client'

import dynamic from 'next/dynamic'
import type { MotionValue } from 'motion/react'

/**
 * LA CAPA 3D DEL PRELOADER — el envoltorio que la difiere y la deja opcional.
 *
 * ── Por qué está partida en dos archivos ───────────────────────────────────
 *
 * `IntroLogoCanvas.tsx` arrastra `three` + `@react-three/fiber` + el SVGLoader:
 * ~154 KiB comprimidos. Meter eso en el bundle inicial sería cargarlo justo en
 * la visita en la que el preloader corre — la primera, la de tráfico frío. Acá
 * se pide con `import()` y el chunk se comparte con el que ya carga el hero.
 *
 * ── El preloader NO espera al 3D. Nunca. ───────────────────────────────────
 *
 * No hay `await`, no hay gate de readiness, no hay timeout. La capa se monta al
 * arrancar el intro y tiene los ~2,8 s de trazo + relleno + espera para estar
 * lista. En el primer frame del relevo se pregunta UNA vez si llegó:
 *
 *  - **Llegó** → el SVG se desvanece mientras el mesh aparece, los dos con el
 *    MISMO color en cada instante, en el punto de la transformación donde el
 *    contraste con el fondo es mínimo. La sustitución no se ve.
 *  - **No llegó** → el mesh nunca aparece y **el SVG hace la transformación
 *    entera**, pasando de blanco a negro igual que el mesh habría hecho. El
 *    acomodamiento ocurre igual. Lo único que se pierde es el volumen: el logo
 *    aterriza plano y sin sombra.
 *
 * La respuesta se **latchea** en ese frame: si el chunk termina de bajar a
 * mitad de cruce, no aparece de golpe.
 */

export type IntroLogoCanvasProps = {
  /** Centro de la tinta en píxeles del viewport. */
  centerX: MotionValue<number>
  centerY: MotionValue<number>
  /** Alto de la tinta en píxeles. **Constante**: el logo no cambia de tamaño. */
  inkHeightPx: MotionValue<number>
  /** 0 = plano y sin luz · 1 = la pose y la iluminación de la escena. */
  reveal: MotionValue<number>
  /** 0 → 1 durante el relevo. En 0 el mesh no se dibuja. */
  opacity: MotionValue<number>
  /** El `#RRGGBB` con el que se pinta el SVG. El mesh lo convierte en emisiva. */
  ink: MotionValue<string>
  /** Se dispara una vez, cuando el objeto ya existe en la escena. */
  onReady: () => void
}

const IntroLogoCanvas = dynamic(() => import('./IntroLogoCanvas'), { ssr: false })

export function IntroLogo3D(props: IntroLogoCanvasProps) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <IntroLogoCanvas {...props} />
    </div>
  )
}
