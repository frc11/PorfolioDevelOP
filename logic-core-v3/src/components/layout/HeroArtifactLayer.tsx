'use client'

import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

// three / @react-three/fiber / drei quedan fuera del documento inicial del
// home: el chunk se pide recién cuando ESTA capa decide montarlo, que es
// después del primer paint y solo en desktop.
const HeroCanvas = dynamic(() => import('@/components/layout/HeroCanvas'), { ssr: false })

// `lg`, el mismo breakpoint en el que el hero pasa a dos columnas. Debajo de eso
// no hay columna donde poner el artefacto, y mobile es la superficie principal
// del negocio: la primera auditoría registró este canvas WebGL crasheando en
// emulación mobile.
const DESKTOP_QUERY = '(min-width: 1024px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Fallback para navegadores sin requestIdleCallback (Safari < 18). No hace
// falta que sea preciso: lo único que importa es no competir con el primer
// paint del hero.
const IDLE_FALLBACK_MS = 300
// Tope del idle: en una pestaña ocupada, `requestIdleCallback` puede no
// dispararse nunca. Con `timeout` el navegador lo fuerza.
const IDLE_TIMEOUT_MS = 2000

const REVEAL_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

/**
 * Capa 2 del hero: el artefacto 3D como MEJORA PROGRESIVA.
 *
 * Reglas que este componente hace cumplir, todas no negociables:
 *
 * - **Cero bloqueo de scroll.** No toca `overflow`, no toca Lenis, no espera a
 *   nadie. Si el canvas nunca carga, el hero ya está completo y usable.
 * - **Carga diferida.** El chunk se pide en el primer hueco de idle DESPUÉS de
 *   que el contenido está pintado, no durante la hidratación.
 * - **Solo desktop.** En mobile no se monta y —lo importante— ni siquiera se
 *   pide el chunk, porque el `import()` vive dentro del gate.
 * - **Respeta `prefers-reduced-motion`**: con eso activo no se monta.
 * - **No renderiza fuera de pantalla**: `frameloop='demand'` cuando la caja sale
 *   del viewport.
 *
 * El gate se evalúa UNA vez, al montar. No se re-evalúa al redimensionar: el
 * artefacto es una mejora de entrada, y montar/desmontar un contexto WebGL
 * mientras alguien arrastra el borde de la ventana cuesta más de lo que aporta.
 */
export function HeroArtifactLayer() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [shouldMount, setShouldMount] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isInView, setIsInView] = useState(true)

  useEffect(() => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) return
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    const mount = () => setShouldMount(true)

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(mount, { timeout: IDLE_TIMEOUT_MS })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = window.setTimeout(mount, IDLE_FALLBACK_MS)
    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const node = boxRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      rootMargin: '120px',
    })
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  // El canvas avisa cuando el SVG está cargado y extruido. Recién ahí se hace
  // el fade: sin esto se vería aparecer una caja vacía y después el objeto.
  const handleReady = useCallback(() => setIsRevealed(true), [])

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className="pointer-events-none relative hidden aspect-square w-full lg:block"
    >
      {shouldMount ? (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isRevealed ? 1 : 0 }}
          transition={{ duration: 0.6, ease: REVEAL_EASE }}
        >
          <HeroCanvas frameloop={isInView ? 'always' : 'demand'} onReady={handleReady} />
        </motion.div>
      ) : null}
    </div>
  )
}
