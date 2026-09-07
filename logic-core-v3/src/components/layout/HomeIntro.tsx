'use client'

import { useReducedMotion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

import { usePreloader } from '@/context/PreloaderContext'

import { IntroOverlay } from './home-intro/IntroOverlay'
import { HOME_INTRO_ATTR, markIntroEntry, setIntroStage } from './home-intro/introHandoff'
import { introWasArmed, markIntroPlayed } from './home-intro/introBoot'
import { useIntroEngine } from './home-intro/useIntroEngine'

/**
 * EL PRELOADER DEL HOME — S8d: trazo, transformación de color y acomodamiento.
 *
 * ── La secuencia ───────────────────────────────────────────────────────────
 *
 *   1. Pantalla oscura. El logo se dibuja con un trazo, en blanco.
 *   2. Aparecen "develOP" arriba y el slogan abajo — solo opacidad.
 *   3. El trazo se completa y se rellena.
 *   4. **Espera.** Todo quieto, relleno, legible.
 *   5. **La transformación de color**, con duración: el fondo pasa de oscuro a
 *      claro y la tinta de blanca a negra. **Adentro de esa ventana el logo
 *      pasa de SVG a mesh**, en el punto de contraste mínimo.
 *   6. **Se va la letra.**
 *   7. **Y recién cuando terminó de irse, se va el fondo.**
 *   8. **El logo se acomoda**: se desplaza y gira a la vez, con un solo número,
 *      y en ese mismo gesto entra en la luz de la escena y proyecta sombra.
 *
 * **El logo no cambia de tamaño en ningún momento.** Desde el primer frame mide
 * lo que va a medir en la escena — el tamaño sale del primer keyframe de la
 * coreografía y el lockup se deriva de él, no al revés. No existe un canal de
 * escala en toda la secuencia.
 *
 * ── Un solo objeto, no una entrega entre dos ───────────────────────────────
 *
 * El logo del preloader **es** el logo 3D de la escena. Se lee como un dibujo
 * porque hasta el gesto final no tiene una sola luz encima (`introShading.ts`);
 * el trazo y el relleno son SVG porque `strokeDashoffset` no existe sobre un
 * mesh, y el relevo se esconde adentro de la transformación de color, donde las
 * dos capas llevan exactamente el mismo `#RRGGBB`.
 *
 * ── Dónde vive cada cosa ───────────────────────────────────────────────────
 *
 * El ritmo en `introTimeline.ts`, cómo se lee en `introSampling.ts`, el
 * acomodamiento en `introFlight.ts`, el color y la luz en `introShading.ts`, el
 * cableado a los valores animados en `useIntroChannels.ts` y el motor en
 * `useIntroEngine.ts`. Acá queda el ciclo de vida **del home** y nada más.
 *
 * ── Las condiciones no negociables ─────────────────────────────────────────
 *
 *  - **Nunca bloquea el scroll, ni un frame.** Capa `pointer-events-none`: no
 *    toca `overflow`, no llama `lenis.stop()`, no gatea el render. El contenido
 *    del hero viene del server y existe detrás desde el primer paint, visible
 *    para buscadores. La capa es `aria-hidden`.
 *  - **No espera a que cargue nada.** El 3D se pide al arrancar; si no llegó al
 *    relevo, el SVG hace la transformación entera. Cero `await`, cero gate.
 *  - **Solo la primera visita de la sesión**, con el gate pre-paint.
 *  - **`prefers-reduced-motion`: sin secuencia.**
 *  - **No corre bajo automatización** (`navigator.webdriver`): solo se verifica
 *    a ojo, en un navegador real.
 *  - **Cero `setState` por frame.**
 *  - `PreloaderContext` se consume, nunca se edita: la fase salta a `'done'` al
 *    MONTAR, así el intro no retiene chrome, ni scroll, ni contenido.
 */

export { HomeIntroBoot } from './home-intro/introBoot'
export { HOME_INTRO_ATTR, HOME_INTRO_FINISHED_EVENT } from './home-intro/introHandoff'
export { HOME_INTRO_PHASES, HOME_INTRO_TIMELINE } from './home-intro/introTimeline'
export type { HomeIntroPhases } from './home-intro/introTimeline'

/**
 * El controlador NO viaja a producción: el ternario se pliega en el build
 * (`process.env.NODE_ENV` es una constante literal ahí) y con la única
 * referencia al `import()` en la rama muerta, el chunk se descarta entero.
 */
const IntroDevController =
  process.env.NODE_ENV === 'production'
    ? null
    : dynamic(() => import('./home-intro/IntroDevController').then((m) => m.IntroDevController), {
        ssr: false,
      })

type IntroState = 'boot' | 'running' | 'finished'

export function HomeIntro() {
  const { isDone, setPhase } = usePreloader()
  const prefersReducedMotion = useReducedMotion()
  const [state, setState] = useState<IntroState>('boot')
  const decidedRef = useRef(false)
  const entryMarkedRef = useRef(false)

  const handleComplete = useCallback(() => {
    markIntroPlayed()
    setState('finished')
  }, [])

  const handleReplay = useCallback(() => {
    // `globals.css` esconde el overlay cuando el `<html>` no lleva la marca, y
    // `markIntroPlayed` la sacó al terminar. Reponerla es lo que permite
    // repetir la secuencia SIN tocar `sessionStorage`.
    document.documentElement.setAttribute(HOME_INTRO_ATTR, '')
    entryMarkedRef.current = false
    setIntroStage('covering')
    setState('running')
  }, [])

  const engine = useIntroEngine({
    running: state === 'running',
    onComplete: handleComplete,
    onReplay: handleReplay,
  })
  const { progress, timelineRef } = engine

  // ── Decisión: ¿corre? ─────────────────────────────────────────────────────
  useEffect(() => {
    if (decidedRef.current) return
    decidedRef.current = true

    // La fase del contexto frozen salta a 'done' SIEMPRE y al toque.
    if (!isDone) setPhase('done')

    // Doble guard de reduced-motion por si el media query cambió entre el paint
    // y la hidratación (el script pre-paint ya lo chequeó una vez).
    if (introWasArmed() && !prefersReducedMotion) {
      setIntroStage('covering')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('running')
      return
    }
    markIntroPlayed()
    setState('finished')
  }, [isDone, setPhase, prefersReducedMotion])

  // ── El aviso a la escena, derivado del mismo progreso ─────────────────────
  // Dos comparaciones por frame, cero `setState` (el store del contrato no pasa
  // por React). La escena queda retenida hasta que el fondo empieza a irse.
  //
  // ⚠️ **SÓLO MIENTRAS LA SECUENCIA CORRE, Y ESA GUARDA ES EL ARREGLO DE UN
  // DEFECTO QUE ESTUVO VIVO DESDE QUE EXISTE EL AVISO** (B5, hallazgo «la
  // escena congelada en la visita repetida»).
  //
  // Sin la guarda, esta suscripción publicaba etapa **también cuando el intro
  // NO corría**. El disparador es `nudge(progress)` de `useIntroEngine`: vive
  // en un efecto con dependencias `[plan, timeline, progress]` que corre en
  // cada render, no sólo con la secuencia andando, y mueve el valor lo
  // suficiente para emitir un `'change'`. Ese `'change'` entraba acá con
  // `value ≈ 0`, o sea `revealing = false`, y publicaba **`'covering'`**.
  //
  // La consecuencia estaba tres módulos más allá y era total: `escenaRetenida`
  // devuelve `true` para `'covering'` **siempre**, así que `EscenaDelHome`
  // escribía `progress = 0` en cada cuadro de scroll y `physicsEnabled` quedaba
  // en `false`. La cámara no se movía con el scroll, y no había inercia, ni
  // offset de mouse, ni vira. **La escena entera, congelada** — en toda visita
  // repetida de la sesión, con `prefers-reduced-motion`, y bajo automatización.
  //
  // Que nadie lo viera en catorce sprints tiene una causa y conviene que quede
  // escrita: el gate pre-paint no arma el intro cuando `navigator.webdriver` es
  // `true`, así que **toda medición automatizada de este repo cayó siempre en
  // la rama del intro salteado** — la rama rota— sin tener con qué compararla.
  //
  // Lo que la guarda restaura es el contrato que `markIntroPlayed` ya tenía
  // ESCRITO: *«cuando el intro NO corrió, el estado se queda en `idle` — que
  // significa "no hay intro", no "el intro terminó"»*. Con la secuencia
  // andando no cambia nada: la etapa inicial `'covering'` la publica el efecto
  // de decisión de arriba, no ésta, y el `'clear'` del final lo publica
  // `markIntroPlayed()` **antes** de que `state` pase a `'finished'`, o sea con
  // la suscripción todavía viva.
  const secuenciaCorriendo = state === 'running'
  useEffect(() => {
    if (!secuenciaCorriendo) return
    return progress.on('change', (value) => {
      const revealing = value * timelineRef.current.totalS >= timelineRef.current.veilOutStartS
      setIntroStage(revealing ? 'revealing' : 'covering')
      if (!revealing) {
        entryMarkedRef.current = false
        return
      }
      if (entryMarkedRef.current) return
      entryMarkedRef.current = true
      // Se muestrea acá y no antes: el scroll está libre y el visitante puede
      // haberse movido hasta este instante.
      markIntroEntry()
    })
  }, [secuenciaCorriendo, progress, timelineRef])

  // Si el visitante navega a otra ruta a mitad de secuencia, el intro cuenta
  // como visto: no se repite al volver dentro de la misma sesión.
  useEffect(() => {
    return () => {
      if (introWasArmed()) markIntroPlayed()
    }
  }, [])

  return (
    <>
      {state !== 'finished' && (
        <IntroOverlay
          channels={engine.channels}
          progress={engine.progress}
          timelineRef={engine.timelineRef}
          viewport={engine.viewport}
          ink={engine.ink}
          text={engine.text}
          onMeshPainted={engine.handleMeshPainted}
        />
      )}
      {IntroDevController && engine.devApi ? (
        <IntroDevController api={engine.devApi} />
      ) : null}
    </>
  )
}
