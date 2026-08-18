"use client"

import { motion } from 'motion/react'
import { MOTION_DURATION, MOTION_EASE } from '@/components/design-system/motion'
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
 * ── Disparo temporal vs. espacial (S2-motion, Bloque 4a) ──────────────────
 * EVALUADO y se decide mantenerlo temporal — no ligado a `scrollYProgress` —
 * por tres razones:
 *
 * 1. El disparo (`SectionShell`, banda `-45%`) ya es ANTICIPADO: se activa
 *    cuando el CENTRO del viewport entra a la sección siguiente, típicamente
 *    muy lejos todavía del fundido de borde físico (`--spacing-ds-section-fade`,
 *    2-4.5rem). Para secciones de altura normal (muchas veces la del
 *    viewport), el tween de 0.8s tiene de sobra para terminar antes de que
 *    el fundido — que SÍ es 100% espacial, es un `background-image` estático,
 *    sin JS — se vuelva visible. El caso temporal solo se nota con scroll
 *    excepcionalmente rápido o secciones más cortas que el viewport.
 * 2. Ligarlo de verdad al gesto (que el color avance exactamente con la
 *    velocidad de scroll mientras se cruza el borde, al estilo Collins)
 *    exige conocer, en todo momento, la posición real del borde entre DOS
 *    secciones — lo que rompe el principio explícito de `SectionShell` de no
 *    tener "neighbor-awareness" (documentado en ese archivo), o exige medir
 *    dinámicamente la altura de las 8 secciones (`ResizeObserver` +estado
 *    compartido) para derivar sus límites como fracción del scroll total.
 *    Cualquiera de las dos es una pieza de arquitectura nueva — no una
 *    calibración — y las alturas de las 8 secciones todavía no son reales
 *    (S1 dejó 3 en placeholder).
 * 3. `useScrollProgress` (Bloque 3) sigue siendo la base correcta para
 *    ESTO el día que se construya: mide una ventana LOCAL, no una posición
 *    global de borde entre vecinos. Forzarlo ahora, sobre secciones sin
 *    contenido final, sería resolver un problema que todavía no se puede
 *    verificar visualmente — exactamente el tipo de decisión que este
 *    documento pide diferir a evidencia humana en pantalla.
 *
 * Lo que SÍ cambia: la duración y la curva dejan de ser literales propios
 * (`0.8`, `'easeInOut'`) y pasan a `MOTION_DURATION.seccion`/`MOTION_EASE.arrive`
 * — antes de este sprint, esta transición corría con una curva DISTINTA a la
 * de los reveals de entrada; ahora es la misma física. Si en un sprint futuro
 * las 8 secciones tienen alturas reales y la verificación humana confirma que
 * se siente desconectada del gesto, ligarla a `scrollYProgress` es el camino
 * — con el costo de arquitectura de arriba ya anotado.
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
      transition={{ duration: reduced ? 0 : MOTION_DURATION.seccion, ease: MOTION_EASE.arrive }}
    >
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.main>
  )
}
