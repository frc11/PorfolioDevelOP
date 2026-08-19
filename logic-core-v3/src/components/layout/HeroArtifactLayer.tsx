'use client'

import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { MOTION_DURATION, MOTION_EASE } from '@/components/design-system/motion'

// three / @react-three/fiber / drei quedan fuera del documento inicial del
// home: el chunk se pide recién cuando ESTA capa decide montarlo, que es
// después del primer paint.
const HeroCanvas = dynamic(() => import('@/components/layout/HeroCanvas'), { ssr: false })

// S3b: se ELIMINÓ el gate `(min-width: 1024px)`. El artefacto va también en
// mobile, porque la animación de scroll que viene va a ser la misma en los dos
// breakpoints.
//
// Lo que ese gate protegía, para que quede escrito: la primera auditoría
// registró este canvas WebGL crasheando en emulación mobile. La contención de
// ese riesgo es `CanvasErrorBoundary` (abajo), que atrapa cualquier error del
// árbol de r3f y deja el 2D como único contenido — pero NO atrapa una pérdida
// de contexto WebGL ni una pestaña que el sistema mata por memoria. Ver el
// reporte del sprint para el costo en peso y el detalle del riesgo.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Fallback para navegadores sin requestIdleCallback (Safari < 18). No hace
// falta que sea preciso: lo único que importa es no competir con el primer
// paint del hero.
const IDLE_FALLBACK_MS = 300
// Tope del idle: en una pestaña ocupada, `requestIdleCallback` puede no
// dispararse nunca. Con `timeout` el navegador lo fuerza.
const IDLE_TIMEOUT_MS = 2000

// S3: era el literal `[0.25, 0.46, 0.45, 0.94]`. Es exactamente
// `MOTION_EASE.arrive`, el token de S2 — se consume del sistema en vez de
// repetir el valor. Ídem la duración del fade (`MOTION_DURATION.elemento`).

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
 * - **Desktop Y mobile** (S3b). El chunk se pide en los dos; lo único que sigue
 *   impidiendo pedirlo es `prefers-reduced-motion` — y ahí el `import()` vive
 *   dentro del gate, así que no se descarga nada.
 * - **Respeta `prefers-reduced-motion`**: con eso activo no se monta, y el logo
 *   2D del slot queda como contenido definitivo.
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
interface HeroArtifactLayerProps {
  /**
   * Se dispara cuando el artefacto está REALMENTE en pantalla (SVG cargado y
   * extruido) — nunca por la red de seguridad. `HeroLogoSlot` lo usa para
   * desvanecer el logo 2D recién cuando hay un 3D que lo reemplace. Ver la
   * nota en `handleReady`.
   */
  onArtifactReady?: () => void
}

export function HeroArtifactLayer({ onArtifactReady }: HeroArtifactLayerProps = {}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [shouldMount, setShouldMount] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isInView, setIsInView] = useState(true)

  useEffect(() => {
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
  //
  // S3: `onArtifactReady` sale de ACÁ y no de `isRevealed`, y la diferencia es
  // deliberada. `isRevealed` también lo levanta la red de seguridad de 6s, que
  // revela la capa aunque el canvas esté VACÍO — para la opacidad propia eso es
  // inocuo (una capa vacía se ve igual que una sin revelar). Pero el slot usa
  // esta señal para desvanecer el logo 2D, y hacerlo por la red de seguridad
  // dejaría el hero SIN logo: el 2D desaparecido y el 3D que nunca llegó. Esta
  // señal significa "el artefacto existe de verdad", nada más.
  const handleReady = useCallback(() => {
    setIsRevealed(true)
    onArtifactReady?.()
  }, [onArtifactReady])

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
    // S3: era la caja del artefacto (`relative aspect-square w-full`). Ahora es
    // una CAPA superpuesta dentro de `HeroLogoSlot`, que es quien aporta la caja
    // cuadrada y el logo 2D de abajo. S3b le sacó el `hidden lg:block`: el
    // artefacto va en los dos breakpoints.
    <div ref={boxRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {shouldMount ? (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isRevealed ? 1 : 0 }}
          transition={{ duration: MOTION_DURATION.elemento, ease: MOTION_EASE.arrive }}
        >
          <CanvasErrorBoundary>
            <HeroCanvas frameloop={isInView ? 'always' : 'demand'} onReady={handleReady} />
          </CanvasErrorBoundary>
        </motion.div>
      ) : null}
    </div>
  )
}
