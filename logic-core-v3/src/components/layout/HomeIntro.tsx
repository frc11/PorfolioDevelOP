'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { usePreloader } from '@/context/PreloaderContext'
import { LogoMark } from '@/components/ui/LogoMark'
import {
  MOTION_DURATION,
  MOTION_EASE,
  REVEAL_DISTANCE_PX,
} from '@/components/design-system/motion'

/**
 * Preloader del home (S3-hero, Bloque 1). Reemplaza en el home a la maquinaria
 * `Preloader.tsx` + `EarlyScrollLock` + lock del Hero (~9,8s de scroll
 * bloqueado, B0b §B2). Principios invertidos respecto del viejo:
 *
 *  - NUNCA bloquea el scroll: es una capa `pointer-events-none` encima del
 *    contenido — no toca `overflow`, no llama `lenis.stop()`, no gatea el
 *    render del hero. El contenido viene del server y existe detrás desde el
 *    primer paint (la capa es `aria-hidden`: para un lector de pantalla la
 *    página está disponible al instante).
 *  - Corre SOLO en la primera visita de la sesión (sessionStorage) y solo en
 *    hard-load directo a `/` — un client-nav al home nunca lo dispara (esa
 *    transición ya la cubre el Shutter).
 *  - `prefers-reduced-motion`: sin secuencia — el contenido aparece directo.
 *  - Sin 3D: el logo acá es el SVG 2D de marca. El 3D es del hero y carga en
 *    paralelo, detrás.
 *  - **Es un momento CERRADO** (S3b): entra, se lee, sube y desaparece. No le
 *    entrega el logo al hero, no mide nada del hero, no comparte estado con él.
 *    El hero tiene su propia animación de scroll, que se construye aparte. Las
 *    dos piezas son independientes a propósito — el intro tiene que poder
 *    existir sin el hero y el hero sin el intro.
 *
 * Quién decide si corre: el script pre-paint de `HomeIntroBoot` (abajo), que
 * marca `data-home-intro` en el <html> ANTES del primer paint. El overlay va
 * SIEMPRE en el HTML del server (el server no conoce sessionStorage) y una
 * regla de `globals.css` lo esconde cuando la marca no está — cero flash en
 * visitas repetidas, cero mismatch de hidratación (el primer render de client
 * es idéntico al SSR; el estado cambia recién en un efecto).
 *
 * Contrato con el contexto frozen (`PreloaderContext`, solo consumo): la fase
 * salta a `'done'` al MONTAR, no al terminar la secuencia. `useChromeRevealed`
 * (dock + widget) y el lock del Hero legacy dependen de esa fase; saltarla al
 * toque significa que nada queda retenido por el intro nuevo — es el mismo
 * salto directo a `'done'` que el contexto ya hace bajo automation y que el
 * orquestador viejo hacía en client-nav (camino probado). El chrome que
 * aparece durante la secuencia queda tapado por el overlay hasta la levantada.
 */

/** Clave de sesión: '1' = el intro ya corrió en esta pestaña (sobrevive F5). */
const INTRO_SESSION_KEY = 'home:intro'
/** Marca pre-paint en <html>; globals.css esconde el overlay si no está. */
export const HOME_INTRO_ATTR = 'data-home-intro'
/**
 * Evento de fin del intro — mismo patrón que `chrome:revealed` de marketing:
 * `useChromeRevealed` lo escucha para revelar dock + widget recién cuando el
 * overlay se levantó (si el chrome montara antes, apilaría ENCIMA del overlay
 * — verificado: el teaser del chatbot flotaba sobre el intro). La verdad viva
 * es el atributo del <html>; el evento solo avisa el cambio.
 */
export const HOME_INTRO_FINISHED_EVENT = 'home-intro:finished'

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  LOS TRES NÚMEROS DEL INTRO — es acá y solo acá donde se edita su ritmo. ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Tocar cualquiera de los tres reacomoda TODO lo de adentro proporcionalmente
 * (entradas, desfases y levantada se derivan como fracciones de su fase — ver
 * `buildTimeline`). No hay que recalcular un solo delay a mano: bajar
 * `darkS` a 1.6 comprime las tres entradas y su hold en la misma proporción.
 *
 * ⚠ RECOMENDACIÓN: mantener el TOTAL en 4s o menos.
 * El overlay es opaco y tapa el hero: mientras corre, el visitante no ve ni
 * una palabra del producto. Y corre exactamente en la visita que importa —
 * la PRIMERA de la sesión, que es la de tráfico frío (alguien que toca el
 * link en WhatsApp y nunca vio el sitio). Esa visita es también la que
 * alimenta el dato de campo de Core Web Vitals: el LCP cae adentro de la
 * ventana del intro (el wordmark del overlay es el candidato grande y opaco;
 * no está medido a cuál elemento lo atribuye Chrome exactamente, pero en
 * cualquiera de los dos casos el hero real está tapado hasta el final). Cada
 * segundo acá es un segundo de pantalla sin producto para el visitante que
 * menos paciencia tiene.
 *
 * El default de abajo suma 6.0s — por encima de esa recomendación, a
 * propósito: es el valor pedido para calibrar a ojo. Bajarlo es cambiar UN
 * número.
 */
export const HOME_INTRO_PHASES = {
  /**
   * FASE OSCURA — pantalla negra. Entran, escalonados, el logo, "develOP" y
   * el slogan; después quedan quietos el resto de la fase para poder leerse.
   */
  darkS: 1.6,
  /**
   * TRANSICIÓN DE COLOR — el fondo invierte de negro a blanco y el logo y el
   * texto invierten con él. Nada entra ni sale acá: solo cambia el color.
   */
  invertS: 0.8,
  /**
   * FASE CLARA — el lockup ya invertido se sostiene, y sobre el final el
   * conjunto se levanta revelando el hero. La levantada termina justo al
   * cerrar la fase (es lo último que pasa).
   */
  lightS: 1.6,
} as const

export type HomeIntroPhases = typeof HOME_INTRO_PHASES

/**
 * Fases de REFERENCIA: el punto de calibración de las fracciones de abajo, no
 * un valor editable. Existe para que la relación "en su default, el intro usa
 * exactamente la física de S2" sea código y no un comentario que se pudre
 * cuando alguien toca un token. Editar el ritmo se hace en
 * `HOME_INTRO_PHASES`; esto se queda quieto.
 */
const REFERENCE_PHASES = { darkS: 2.5, lightS: 2.5 } as const

/**
 * Coreografía interna, en FRACCIONES de su fase — nunca en segundos. Es lo
 * que hace que las tres perillas de arriba se puedan mover solas: con
 * `darkS` en 1.6, la entrada dura 1.6 × 0.24 = 0.384s sin tocar nada más.
 *
 * Las dos duraciones se derivan de los tokens de S2 sobre las fases de
 * referencia, así que en el default caen EXACTO sobre ellos:
 *   · entrada  → `MOTION_DURATION.elemento` (0.6s, la física de `Reveal`)
 *   · levantada → `MOTION_DURATION.pagina` (1.2s, la escala que S2 documentó
 *     como "momento autoral de una sola vez", reservada justamente a esto)
 * La curva NO se escala nunca: es `MOTION_EASE.arrive` en los tres momentos,
 * token puro. Lo que las fases mueven es el TEMPO, no la física.
 */
const ENTRANCE_START_FRAC = { logo: 0, wordmark: 0.18, slogan: 0.36 } as const
const ENTRANCE_DURATION_FRAC = MOTION_DURATION.elemento / REFERENCE_PHASES.darkS
const LIFT_DURATION_FRAC = MOTION_DURATION.pagina / REFERENCE_PHASES.lightS

function buildTimeline(phases: HomeIntroPhases) {
  const enterDurationS = phases.darkS * ENTRANCE_DURATION_FRAC
  const liftDurationS = phases.lightS * LIFT_DURATION_FRAC
  const totalS = phases.darkS + phases.invertS + phases.lightS

  return {
    logoDelayS: phases.darkS * ENTRANCE_START_FRAC.logo,
    wordmarkDelayS: phases.darkS * ENTRANCE_START_FRAC.wordmark,
    sloganDelayS: phases.darkS * ENTRANCE_START_FRAC.slogan,
    enterDurationS,
    // La inversión arranca cuando termina la fase oscura, por definición.
    invertDelayS: phases.darkS,
    invertDurationS: phases.invertS,
    // La levantada CIERRA la fase clara: arranca tan tarde como haga falta
    // para terminar exactamente en `totalS`.
    liftDelayS: totalS - liftDurationS,
    liftDurationS,
    totalS,
  } as const
}

export const HOME_INTRO_TIMELINE = buildTimeline(HOME_INTRO_PHASES)

/**
 * Espejo 1:1 de tokens de color de `globals.css` (mismo patrón que S2 fijó
 * para motion: Framer consume el módulo TS, CSS consume `var()` — Framer no
 * puede interpolar un `var()`). Si el token cambia allá, cambia acá.
 */
const INTRO_COLORS = {
  bgDark: '#0E0E0E', // --color-ds-void
  bgLight: '#F7F7F5', // --color-ds-light-bg
  inkOnDark: '#F7F7F5', // --color-ds-dark-ink
  inkOnLight: '#111111', // --color-ds-ink
} as const

/**
 * Script pre-paint (bloqueante, en el <head>): decide si el intro corre ANTES
 * del primer paint, para que la primera visita arranque en negro sin flash del
 * hero y las repetidas no vean ni un frame de overlay. Mismo mecanismo que el
 * viejo `EarlyScrollLock` (useServerInsertedHTML → se splicea antes de
 * `</head>` y el parser lo ejecuta bloqueante; NO migrar a `next/script
 * beforeInteractive`, que en App Router difiere la ejecución al bootstrap —
 * el docblock de EarlyScrollLock.tsx documenta la evidencia). La diferencia
 * de fondo: aquel script BLOQUEABA el scroll; este solo marca un atributo.
 *
 * Gates del script: hard-load en `/` + sin automation (visual-qa nunca debe
 * ver el overlay) + sin `prefers-reduced-motion` + sesión sin intro previo.
 */
const HOME_INTRO_BOOT_JS =
  `try{if(location.pathname==='/'` +
  `&&navigator.webdriver!==true` +
  `&&!matchMedia('(prefers-reduced-motion: reduce)').matches` +
  `&&sessionStorage.getItem('${INTRO_SESSION_KEY}')!=='1'){` +
  `document.documentElement.setAttribute('${HOME_INTRO_ATTR}','')}}catch(e){}`

export function HomeIntroBoot() {
  // One-shot: el callback corre en cada flush del stream SSR; sin el guard se
  // re-inyectaría el script en chunks tardíos. En cliente el hook es no-op.
  const insertedRef = useRef(false)
  useServerInsertedHTML(() => {
    if (insertedRef.current) return null
    insertedRef.current = true
    return <script dangerouslySetInnerHTML={{ __html: HOME_INTRO_BOOT_JS }} />
  })
  return null
}

function markIntroPlayed() {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, '1')
  } catch {
    // sessionStorage puede fallar (private mode): el intro podría repetirse
    // en el próximo hard-load. Aceptable — nunca bloquea nada.
  }
  document.documentElement.removeAttribute(HOME_INTRO_ATTR)
  window.dispatchEvent(new Event(HOME_INTRO_FINISHED_EVENT))
}

type IntroState = 'boot' | 'running' | 'finished'

/** Un elemento del lockup entrando con la física `elemento` (la de Reveal). */
function IntroEntrance({
  delayS,
  running,
  children,
}: {
  delayS: number
  running: boolean
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: REVEAL_DISTANCE_PX }}
      animate={running ? { opacity: 1, y: 0 } : undefined}
      transition={{
        delay: delayS,
        duration: HOME_INTRO_TIMELINE.enterDurationS,
        ease: MOTION_EASE.arrive,
      }}
    >
      {children}
    </motion.div>
  )
}

export function HomeIntro() {
  const { isDone, setPhase } = usePreloader()
  const prefersReducedMotion = useReducedMotion()
  const [state, setState] = useState<IntroState>('boot')
  const decidedRef = useRef(false)

  useEffect(() => {
    if (decidedRef.current) return
    decidedRef.current = true

    // La fase del contexto frozen salta a 'done' SIEMPRE y al toque: el intro
    // nuevo no retiene chrome, ni scroll, ni contenido (ver docblock).
    if (!isDone) setPhase('done')

    // Corre solo si el script pre-paint lo decidió. Doble guard de
    // reduced-motion por si el media query cambió entre el paint y la
    // hidratación (el script ya lo chequeó una vez).
    const shouldRun =
      document.documentElement.hasAttribute(HOME_INTRO_ATTR) && !prefersReducedMotion

    // setState-en-efecto deliberado (patrón ya aceptado en SmoothScroll.tsx):
    // la decisión lee el DOM pre-paint (atributo del <html>) y no puede
    // tomarse en render sin romper la paridad SSR/cliente del primer render.
    // Corre UNA vez (decidedRef) — no hay cascada.
    if (shouldRun) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('running')
    } else {
      markIntroPlayed()
      setState('finished')
    }
  }, [isDone, setPhase, prefersReducedMotion])

  // Si el usuario navega a otra ruta a mitad de secuencia, el intro cuenta
  // como visto: no se repite al volver dentro de la misma sesión.
  useEffect(() => {
    return () => {
      if (document.documentElement.hasAttribute(HOME_INTRO_ATTR)) markIntroPlayed()
    }
  }, [])


  if (state === 'finished') return null

  const running = state === 'running'
  const t = HOME_INTRO_TIMELINE

  const invertTransition = {
    delay: t.invertDelayS,
    duration: t.invertDurationS,
    ease: MOTION_EASE.arrive,
  }

  // UNA sola capa: fondo, tinta y levantada sobre el mismo nodo, y el lockup
  // entero adentro. El preloader es un momento CERRADO — entra, se lee, sube y
  // desaparece. No le entrega nada al hero ni comparte estado con él (S3b).
  return (
    <motion.div
      data-home-intro-overlay=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 px-6 text-center will-change-transform"
      initial={{
        y: '0%',
        backgroundColor: INTRO_COLORS.bgDark,
        color: INTRO_COLORS.inkOnDark,
      }}
      animate={
        running
          ? {
              y: '-100%',
              backgroundColor: INTRO_COLORS.bgLight,
              color: INTRO_COLORS.inkOnLight,
            }
          : undefined
      }
      transition={{
        backgroundColor: invertTransition,
        color: invertTransition,
        y: {
          delay: t.liftDelayS,
          duration: t.liftDurationS,
          ease: MOTION_EASE.arrive,
        },
      }}
      // La levantada es lo último que termina, así que este nodo declara el fin.
      onAnimationComplete={() => {
        markIntroPlayed()
        setState('finished')
      }}
    >
      <IntroEntrance delayS={t.logoDelayS} running={running}>
        <LogoMark className="h-16 w-16 md:h-20 md:w-20" />
      </IntroEntrance>
      <IntroEntrance delayS={t.wordmarkDelayS} running={running}>
        <p className="font-ds-sans text-ds-display-lg">develOP</p>
      </IntroEntrance>
      <IntroEntrance delayS={t.sloganDelayS} running={running}>
        <p className="text-ds-lead">Ingeniería para negocios reales</p>
      </IntroEntrance>
    </motion.div>
  )
}
