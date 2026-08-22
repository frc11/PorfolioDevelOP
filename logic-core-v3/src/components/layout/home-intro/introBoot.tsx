'use client'

import { useRef } from 'react'
import { useServerInsertedHTML } from 'next/navigation'

import {
  HOME_INTRO_ATTR,
  HOME_INTRO_FINISHED_EVENT,
  INTRO_SESSION_KEY,
  isSceneHeld,
  setIntroStage,
} from './introHandoff'

/**
 * EL GATE PRE-PAINT — quién decide si el intro corre, y cuándo.
 *
 * Se hereda tal cual de S3 porque resuelve dos cosas a la vez que ningún otro
 * mecanismo resuelve juntas: la primera visita arranca en oscuro **sin flash
 * del hero**, y la visita repetida no ve **ni un frame** de overlay.
 *
 * El overlay viaja SIEMPRE en el HTML del server (el server no conoce
 * `sessionStorage`). Este script corre bloqueante en el `<head>`, decide, y si
 * corresponde marca `data-home-intro` en el `<html>`. Una regla de
 * `globals.css` esconde el overlay cuando la marca NO está. El primer render
 * de cliente es idéntico al del server y el estado cambia recién en un efecto:
 * cero mismatch de hidratación.
 *
 * **`useServerInsertedHTML` y no `next/script beforeInteractive`**: en App
 * Router el segundo difiere la ejecución al bootstrap, o sea después del primer
 * paint, que es justo lo que hay que ganarle. El docblock del viejo
 * `EarlyScrollLock.tsx` guarda la evidencia. La diferencia de fondo con aquel
 * script: **aquel bloqueaba el scroll; este solo marca un atributo.**
 *
 * Los cuatro gates:
 *   · `location.pathname === '/'` — hard-load directo al home. Un client-nav al
 *     home nunca lo dispara: esa transición ya la cubre el Shutter.
 *   · `navigator.webdriver !== true` — **el intro no corre bajo automatización.**
 *     No es un descuido: es lo que impide que una corrida headless quede
 *     esperando la secuencia entera. Corolario: este componente NO se puede
 *     verificar por automatización. Solo a ojo, en un navegador real.
 *   · sin `prefers-reduced-motion` — sin secuencia, se entra directo al home
 *     (`DIRECCION-ESCENA.md` §1.2).
 *   · sesión sin intro previo — `sessionStorage`, sobrevive al F5.
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

/** `true` si el script pre-paint decidió que el intro corre. */
export function introWasArmed(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.hasAttribute(HOME_INTRO_ATTR)
}

/**
 * Cierra el intro: lo marca como visto, saca la marca del `<html>`, suelta la
 * escena y avisa. Idempotente — se lo llama tanto al terminar la secuencia como
 * al desmontar a mitad de camino (si el visitante navega a otra ruta, el intro
 * cuenta como visto y no se repite al volver dentro de la misma sesión).
 */
export function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, '1')
  } catch {
    // sessionStorage puede fallar (modo privado): el intro podría repetirse en
    // el próximo hard-load. Aceptable — nunca bloquea nada.
  }
  document.documentElement.removeAttribute(HOME_INTRO_ATTR)
  // Solo si la escena estaba retenida: cuando el intro NO corrió, el estado se
  // queda en `idle` — que significa "no hay intro", no "el intro terminó".
  if (isSceneHeld()) setIntroStage('clear')
  window.dispatchEvent(new Event(HOME_INTRO_FINISHED_EVENT))
}
