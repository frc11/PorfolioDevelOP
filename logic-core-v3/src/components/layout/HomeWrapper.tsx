"use client"

import { motion } from 'motion/react'
import { useTheme } from '@/hooks/useThemeObserver'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/**
 * Fondo ambiente del home. Es el ÚNICO mecanismo de inversión de tema que
 * queda vivo (S1-cimiento, Bloque 2) — antes había dos: este wrapper (con hex
 * propios `#fafafa`/`#000000`, ajenos a los tokens) y el `data-ds-theme` local
 * que escribe `SectionShell` en cada `<section>`. Se conserva ESTE porque es
 * el que puede animar de forma continua en el tiempo (Framer Motion tween de
 * `backgroundColor`); `data-ds-theme` es un atributo estático por sección, no
 * dispara ninguna animación por sí solo — necesita un renderer, y este
 * componente es ese renderer.
 *
 * `SectionShell` es ahora el ÚNICO disparador: llama `useThemeSectionOptional`
 * cuando la sección cruza la banda central del viewport, que actualiza el
 * mismo `ThemeProvider` que este componente lee acá abajo. No hay un segundo
 * `setTheme` corriendo en paralelo — salvo la excepción ya reportada de
 * `About.tsx`/`WhyDevelOP.tsx`, que todavía llaman `useThemeSection` por su
 * cuenta mientras siguen montados "tal cual" (Bloque 3).
 *
 * Valores: papel `#F7F7F5` / tinta `#111111` (claro) — sección oscura
 * `#0E0E0E` / texto sobre oscuro `#F7F7F5` (oscuro), tabla del documento. Son
 * los mismos hex que `globals.css` define como `--color-ds-light-bg`/
 * `--color-ds-light-ink`/`--color-ds-void`/`--color-ds-dark-ink` — hardcodeados
 * acá (no por `var()`) porque el motor de interpolación de color de Framer
 * Motion necesita un formato de color que pueda parsear para tweenear
 * (hex/rgb), no una referencia a custom property.
 *
 * Es lo que hace VISIBLE la "transición cromática suave" de `SectionShell`:
 * cada sección funde su propio fondo a transparente en los bordes
 * (`--spacing-ds-section-fade`), y lo que se revela ahí es este fondo,
 * tweeneando entre los dos colores mientras el scroll cruza el punto medio.
 * Honra `prefers-reduced-motion`: con movimiento reducido el cambio de color
 * es instantáneo (duración 0), no se cancela — sigue pasando, solo sin tween.
 *
 * ⚠ PUNTO ABIERTO (no bloqueante, a verificar visualmente): el disparo es
 * `useInView` + tween de duración FIJA — temporal, no espacial. El efecto de
 * referencia (Collins) liga el cambio al progreso del scroll: si scrolleás
 * más rápido, cambia más rápido. Acá no: tarda 0.8s siempre, sin importar la
 * velocidad del scroll. El fade de bordes puede alcanzar para que se sienta
 * bien igual, o puede sentirse desconectado del gesto — verificación visual
 * humana pendiente; si hace falta, la alternativa es ligarlo a
 * `scrollYProgress` en un sprint aparte.
 */
export function HomeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const reduced = useReducedMotion()
  const bgColor = theme === 'light' ? '#F7F7F5' : '#0E0E0E'
  const textColor = theme === 'light' ? '#111111' : '#F7F7F5'

  return (
    <motion.main
      className="w-full relative font-sans"
      animate={{ backgroundColor: bgColor, color: textColor }}
      // `prefers-reduced-motion`: el cambio de color pasa a instantáneo (0s),
      // no se cancela. El usuario que pidió menos movimiento igual necesita
      // ver el cambio de tema — solo no lo quiere animado.
      transition={{ duration: reduced ? 0 : 0.8, ease: 'easeInOut' }}
    >
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.main>
  )
}
