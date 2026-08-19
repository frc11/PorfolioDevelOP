'use client'

import { motion, useReducedMotion, useTransform, type UseScrollOptions } from 'motion/react'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'
import { LogoMark } from '@/components/ui/LogoMark'
import { HeroArtifactLayer } from './HeroArtifactLayer'
import {
  MOTION_DURATION,
  MOTION_EASE,
  useScrollProgress,
} from '@/components/design-system/motion'

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  COREOGRAFÍA DEL LOGO CON EL SCROLL — versión mínima (S3, Bloque 3).     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Al scrollear fuera del hero, el logo se aleja y se desvanece. **Mínima a
 * propósito**: acá solo está montado el MECANISMO. La coreografía fina
 * —velocidad, curva, rotación, el momento exacto de salida y el retorno en la
 * sección 7— se diseña en un sprint aparte, con las referencias delante. Estos
 * son los números para ajustarla, todos en un solo lugar.
 */
export const HERO_LOGO_SCROLL = {
  /**
   * Ventana de medición. `['start start', 'end start']` = el progreso arranca
   * en 0 mientras el hero está arriba de todo (sin scroll), empieza a correr
   * cuando el borde superior del logo toca el techo del viewport y llega a 1
   * cuando su borde inferior lo cruza. O sea: quieto hasta que el visitante
   * efectivamente se va del hero.
   */
  offset: ['start start', 'end start'] as UseScrollOptions['offset'],
  /** Tramo del progreso en el que ocurre todo (el resto ya está en su valor final). */
  fadeStart: 0,
  fadeEnd: 0.7,
  /** Opacidad al final del recorrido. */
  exitOpacity: 0,
  /** Escala al final: <1 = se aleja. Solo desktop (ver abajo). */
  exitScale: 0.86,
} as const

const DESKTOP_QUERY = '(min-width: 1024px)'

/**
 * Lee un media query como store externo. `useSyncExternalStore` y no
 * `useState` + efecto: matchMedia ES un store externo, así que este es el hook
 * que React tiene para el caso — sin setState en un efecto (que dispara un
 * render en cascada) y sin desincronizarse si el viewport cambia después.
 *
 * El snapshot de servidor es `false`: en SSR asumimos el caso conservador
 * (mobile, sin movimiento en profundidad), que es el que no mueve nada.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onStoreChange)
      return () => mql.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/**
 * El logo del hero, en dos capas superpuestas sobre la misma caja cuadrada.
 *
 * 1. **SVG 2D** (`LogoMark`) — server-rendered, en TODOS los viewports, sin una
 *    línea de JS de por medio. Su rol es **estado de carga y red de seguridad**:
 *    se ve desde el primer paint mientras el 3D baja (la cadena completa puede
 *    tardar hasta 6 s — chunk de three/r3f/drei + HDRI de 1,6 MiB) y queda como
 *    ÚNICO contenido si el 3D falla, si el dispositivo no lo soporta o si el
 *    visitante pidió movimiento reducido. Sin él, esta caja quedaba vacía todo
 *    ese tiempo, o para siempre.
 * 2. **Artefacto 3D** (`HeroArtifactLayer`) — se monta diferido y reemplaza al
 *    2D cuando está listo.
 *
 * El reemplazo es un **cambio simple**: el 2D se desvanece y el 3D aparece. No
 * hay crossfade calibrado ni coincidencia de posición — **el 2D no tiene que
 * calzar con nada** (S3b). Es un estado de carga que da paso al contenido real,
 * no una capa que deba fundirse con precisión sobre otra.
 *
 * Este slot NO participa de ninguna entrega desde el preloader. El preloader es
 * un momento cerrado que sube y desaparece; el logo del hero es otra cosa, con
 * su propia animación de scroll (que se construye en el sprint de coreografía).
 * No comparten estado, ni medición, ni coreografía.
 *
 * `aria-hidden`: es ornamento. El nombre de la marca ya está en texto en la
 * navegación, y repetirlo acá solo agrega ruido a un lector de pantalla.
 */
export function HeroLogoSlot({ className }: { className?: string }) {
  const [artifactReady, setArtifactReady] = useState(false)
  const handleArtifactReady = useCallback(() => setArtifactReady(true), [])

  // DOS nodos, no uno: este es el que se MIDE y nunca recibe transform; el de
  // adentro es el que se mueve. Medir y mover el mismo nodo retroalimenta el
  // cálculo — `getBoundingClientRect()` devuelve coordenadas incorrectas con un
  // transform activo (lección de `CLAUDE.md`, abril 2026). Misma disciplina que
  // `Parallax`.
  const measureRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(measureRef, { offset: HERO_LOGO_SCROLL.offset })
  const prefersReducedMotion = useReducedMotion()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  const fadeRange = [HERO_LOGO_SCROLL.fadeStart, HERO_LOGO_SCROLL.fadeEnd]
  const opacity = useTransform(progress, fadeRange, [1, HERO_LOGO_SCROLL.exitOpacity])
  // El logo NO se acerca ni se aleja en mobile (pedido del sprint), ni bajo
  // movimiento reducido: ahí solo queda el desvanecido, que es un cambio de
  // opacidad y el sistema lo permite. `useScrollProgress` no resuelve
  // reduced-motion por diseño — es una medición; el consumidor que la convierte
  // en movimiento visible es el responsable, y ese consumidor es este.
  //
  // ⚠ S3b: la decisión de "sin 3D en mobile" se revirtió y la animación de
  // scroll va a ser LA MISMA en ambos breakpoints. Este carve-out de desktop
  // queda superado, pero NO se toca acá: S3b desacopla y habilita la carga, y
  // dice explícitamente que la coreografía se construye en su propio sprint.
  // Es ese sprint el que decide si el logo se aleja también en mobile — con las
  // referencias delante, no de refilón. Hasta entonces, el comportamiento queda
  // como lo dejó S3.
  const movesInDepth = isDesktop && !prefersReducedMotion
  const scale = useTransform(progress, fadeRange, [1, movesInDepth ? HERO_LOGO_SCROLL.exitScale : 1])

  return (
    <div ref={measureRef} aria-hidden="true" className={className}>
      <motion.div
        style={{ opacity, scale }}
        className="relative aspect-square w-full will-change-transform"
      >
        {/*
          El fade del 2D es una transición CSS y no Framer, a propósito: con
          `initial={{opacity:0}}` de Framer el SSR emite `opacity:0` en el HTML
          y la marca nace invisible hasta que hidrata — exactamente el modo de
          fallar que el hero viejo documentó para su titular. Acá nace OPACA y
          solo se desvanece más tarde, si y cuando hay un 3D que la reemplace.

          Duración y curva de los tokens de S2. Es un desvanecido simple para
          que el reemplazo no sea un corte seco — no un crossfade calibrado.
        */}
        <div
          className="absolute inset-0 text-ds-fg"
          style={{
            opacity: artifactReady ? 0 : 1,
            transitionProperty: 'opacity',
            transitionDuration: `${MOTION_DURATION.elemento}s`,
            transitionTimingFunction: `cubic-bezier(${MOTION_EASE.arrive.join(', ')})`,
          }}
        >
          <LogoMark className="h-full w-full" />
        </div>

        <HeroArtifactLayer onArtifactReady={handleArtifactReady} />
      </motion.div>
    </div>
  )
}
