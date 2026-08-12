'use client'

import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

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

// Red de seguridad del reveal. MISMO mecanismo y MISMO umbral que la red del
// scroll de `MarketingIntro` (`MARKETING_SCROLL_SAFETY_MS`) → un solo patrón en
// el repo, por la misma razón: `setTimeout` no depende del `requestAnimationFrame`
// ni de la cadena de carga, que es exactamente donde esta capa se cuelga.
//
// La cadena que lleva a `onReady` tiene seis eslabones — chunk, medición del
// contenedor por `ResizeObserver`, configuración de r3f, SVG, HDRI de 1.6 MB, y
// dos `requestAnimationFrame`. Cualquiera que no llegue deja la capa en
// `opacity: 0` para siempre. Ningún estado visual puede depender de un solo
// evento que puede no llegar.
//
// Revelar de más no cuesta nada: el canvas es transparente y el artefacto trae
// su propio fade-in de material (`HeroArtifact`, opacidad 0 → 1 en el
// `useFrame`), así que una capa revelada antes de tiempo se ve igual que una sin
// revelar — vacía. El costo de revelar de menos, en cambio, es que no aparezca
// nunca. Se arma cuando el canvas se monta, no al montar el componente: hasta
// ahí no hay nada que esperar.
const REVEAL_SAFETY_MS = 6000

/**
 * Contención de fallos del canvas.
 *
 * Sin esto, la promesa de "mejora progresiva" es falsa: `<Canvas>` re-lanza
 * hacia afuera cualquier error de su árbol (r3f atrapa con su propio
 * ErrorBoundary y lo re-tira desde `CanvasImpl`), así que un HDRI que no baja
 * —un bloqueador, un proxy corporativo, un corte— escala hasta el `error.tsx`
 * de la ruta y se lleva puesto el home entero: hero, contenido y scroll. Está
 * medido, no es hipótesis.
 *
 * Al fallar renderiza `null`: la capa queda vacía y la base tipográfica del
 * hero —que es el hero terminado— sigue intacta. No hay UI de error porque no
 * hay nada que comunicar: el artefacto es decorativo y la caja es
 * `aria-hidden`.
 */
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Visible en desarrollo y en el log del navegador, sin romper nada. El
    // artefacto es decorativo: no se reporta al usuario ni se reintenta.
    console.warn('HeroArtifactLayer: el canvas del hero falló y quedó contenido.', error)
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}

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
 * - **El reveal no depende de un solo evento.** `onReady` es el camino normal;
 *   `REVEAL_SAFETY_MS` es la red. Y `CanvasErrorBoundary` garantiza que un fallo
 *   del canvas se quede acá adentro en vez de tumbar el home.
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

  // Red de seguridad (ver REVEAL_SAFETY_MS). Idempotente y sin pelea con el
  // camino normal: si `onReady` llega primero, `isRevealed` pasa a true y el
  // cleanup cancela el timer; si dispara primero, deja el mismo estado final que
  // habría dejado `onReady`.
  useEffect(() => {
    if (!shouldMount || isRevealed) return

    const safety = window.setTimeout(() => setIsRevealed(true), REVEAL_SAFETY_MS)

    return () => window.clearTimeout(safety)
  }, [shouldMount, isRevealed])

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
          <CanvasErrorBoundary>
            <HeroCanvas frameloop={isInView ? 'always' : 'demand'} onReady={handleReady} />
          </CanvasErrorBoundary>
        </motion.div>
      ) : null}
    </div>
  )
}
