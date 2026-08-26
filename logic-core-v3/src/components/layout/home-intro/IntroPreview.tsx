'use client'

import { useCallback, useLayoutEffect, useState } from 'react'

import { HOME_INTRO_ATTR } from './introHandoff'
import { IntroDevController } from './IntroDevController'
import { IntroOverlay } from './IntroOverlay'
import { useIntroEngine } from './useIntroEngine'

/**
 * EL PRELOADER SOBRE LA ESCENA REAL — herramienta de desarrollo. **Ni un byte
 * en producción.**
 *
 * ── Para qué ───────────────────────────────────────────────────────────────
 *
 * El preloader termina entregándole el logo a la escena 3D, pero la escena
 * todavía no está montada en el home: probándolo ahí, el aterrizaje cae sobre
 * un hero que no es el fondo definitivo y no hay forma de juzgarlo. `/probe-escena`
 * **sí** tiene la escena real. Esto corre la secuencia encima de ella, con su
 * controlador, para poder calibrar contra el fondo que de verdad va a aparecer.
 *
 * ── Cómo se invoca ─────────────────────────────────────────────────────────
 *
 *     /probe-escena?intro
 *
 * Sin el parámetro **este componente devuelve `null` en el primer render** y no
 * instancia nada: ni motor, ni canvas, ni suscripciones. El probe se comporta
 * exactamente igual que antes.
 *
 * ── Qué habría que sacar el día que se limpie ──────────────────────────────
 *
 * Este archivo y las cuatro líneas de `ProbeEscena.tsx` que lo montan detrás del
 * ternario de `NODE_ENV`. Nada más: la escena y la coreografía no se tocaron, y
 * el preloader no sabe que existe el probe.
 *
 * ── Lo que NO hace, a diferencia de `HomeIntro` ────────────────────────────
 *
 * No consulta el gate pre-paint, no consume `PreloaderContext` y no avisa por el
 * contrato de la escena (`introHandoff.ts`): acá no hay escena que retener, hay
 * una que ya está. Lo único que comparte con el home es el motor, que es
 * justamente lo que tiene que ser idéntico.
 *
 * Y sobre todo: **no toca `sessionStorage`.** Importa más de lo que parece. El
 * intro del home se marca como visto al terminar, para no repetirse en la
 * sesión; si el preview corriera `HomeIntro` entero, calibrar acá te dejaría el
 * home sin intro en esa misma pestaña y habría que ir a limpiar la marca a mano.
 * Montando el motor y no el componente del home, el problema no existe: acá no
 * hay nada que marcar.
 */

const FLAG = 'intro'

function hasIntroFlag(): boolean {
  return new URLSearchParams(window.location.search).has(FLAG)
}

export function IntroPreview() {
  // Se lee UNA vez, al montar. El probe no cambia de query en vivo.
  const [armed] = useState(hasIntroFlag)
  if (!armed) return null
  return <IntroPreviewRunner />
}

function IntroPreviewRunner() {
  const [running, setRunning] = useState(true)

  const handleComplete = useCallback(() => setRunning(false), [])
  const handleReplay = useCallback(() => setRunning(true), [])

  const engine = useIntroEngine({
    running,
    onComplete: handleComplete,
    onReplay: handleReplay,
  })

  /**
   * `globals.css` esconde `[data-home-intro-overlay]` mientras el `<html>` no
   * lleve la marca. Acá no hay script pre-paint que la ponga (su primer gate es
   * `pathname === '/'`), así que la pone este efecto — de layout y no pasivo,
   * para que la capa exista antes del primer paint.
   *
   * Se saca al desmontar: si alguien navega fuera del probe, la marca no queda
   * colgada en el documento.
   */
  useLayoutEffect(() => {
    const root = document.documentElement
    root.setAttribute(HOME_INTRO_ATTR, '')
    return () => root.removeAttribute(HOME_INTRO_ATTR)
  }, [])

  return (
    <>
      {running && (
        <IntroOverlay
          channels={engine.channels}
          progress={engine.progress}
          timelineRef={engine.timelineRef}
          viewport={engine.viewport}
          ink={engine.ink}
          text={engine.text}
          onMeshReady={engine.handleMeshReady}
        />
      )}
      {engine.devApi ? <IntroDevController api={engine.devApi} /> : null}
    </>
  )
}
