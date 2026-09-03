'use client'

import { useSyncExternalStore } from 'react'

/**
 * EL CONTRATO DEL INTRO CON EL RESTO DEL MUNDO — S8.
 *
 * Tres cosas viven acá y ninguna es visual: la marca pre-paint del `<html>`, el
 * evento de fin, y el estado de la entrega a la escena 3D. Es lo único que el
 * intro le muestra a alguien que no es el intro.
 *
 * ── 🔴 EL VUELO DEL LOGO: LO QUE ESTE BLOQUE DECÍA, Y LO QUE PASA HOY ──────
 *
 * Hasta V3-A acá decía, literal: *«el preloader sigue sin volar el logo, que
 * además es lo que la fuente de verdad decidió (§1.3). El preloader es un
 * momento cerrado, no le entrega el logo a nadie, se desvanece y la escena
 * aparece detrás con su propia coreografía»*. **Eso estaba vencido y era la
 * premisa equivocada del defecto que V3-A arregló** — regla 11: se corrige con
 * su medición al lado, no se borra.
 *
 * S8 escribió esa frase porque el destino no existía: la pose inicial era
 * distinta en cada uno de los cuatro recorridos candidatos. **S9 eligió uno**, y
 * desde entonces `introFlight.ts` planifica y ejecuta el vuelo: `samplePlace`
 * alimenta `logoX`, `logoY`, `logoCenterX`, `logoCenterY` y `logoReveal`, y el
 * logo viaja del centro de la pantalla al lugar de la escena. En 1440×810 sale
 * de (720 · 405) y aterriza en **(939,7 · 417,5)** con una tinta de 445×310 px
 * —V3-E movió `frameX` del hero de 0,68 a 0,5 y con él el destino—:
 * el **mismo píxel y el mismo tamaño** donde la escena dibuja el suyo, medido en
 * `introLanding.invariant.ts` sobre tres ventanas con un error de 0,0000 px.
 *
 * Las cifras de los otros cuatro recorridos, que este bloque publicaba, siguen
 * valiendo como referencia: calibrado a mano 523×364 px / centro X 1086;
 * íntima 669×466 / 890; arquitectónica 292×203 / 897; dramática 588×409 / 795.
 *
 * ⚠️ **Y la consecuencia que la premisa vencida dejó armada, declarada:** como
 * *«el preloader no le entrega el logo a nadie»*, la escena dibuja el suyo desde
 * el cuadro cero. Durante el acomodamiento —los últimos 2,4 s— hay **dos logos
 * negros idénticos en pantalla**, uno quieto en su lugar y otro viajando hacia
 * él. El humano lo describió como *«que se coloque en la posición del logo
 * principal que estamos viendo»*, o sea que cuenta con verlo; que el aterrizaje
 * sea exacto es lo que hace que el relevo no se note. Esconder el de la escena
 * mientras el otro vuela sería `_lib/escena/`, y no es de este frente.
 *
 * ── Cómo lo consume la escena (el sprint que la monte) ─────────────────────
 *
 *   1. En su `useFrame`, `getIntroStage()` — lectura directa, cero re-render,
 *      cero `setState` por frame. `isSceneHeld(stage)` es el booleano.
 *   2. Mientras está retenida: **quieta en la pose 0 y con la vira apagada**,
 *      para que el blanco esté inmóvil justo cuando se vuelve visible.
 *   3. En `'clear'`: suelta — vira encendida y coreografía atada al scroll.
 *   4. `introEnteredClean()` decide CÓMO suelta: `true` = puede jugar su
 *      entrada desde la pose inicial; `false` = el visitante scrolleó durante
 *      el intro, así que se ata al scroll donde esté y no fuerza nada. Es la
 *      regla acordada: si el destino no está donde corresponde, no hay vuelo.
 *
 * Un componente de DOM que necesite re-renderizar usa `useIntroStage()`.
 *
 * ── Por qué un módulo y no un contexto ─────────────────────────────────────
 *
 * El intro se monta en `page.tsx` y la escena va a colgar de otro lado del
 * árbol. Un provider nuevo obligaría a envolver a los dos, y los contextos que
 * ya existen (`PreloaderContext`) están frozen. Un observable de módulo no
 * necesita ancestro común, lo lee un `useFrame` sin pasar por React, y cuando
 * el intro no corre se queda en `'idle'` — que es exactamente "hacé lo tuyo".
 */

/** Clave de sesión: '1' = el intro ya corrió en esta pestaña (sobrevive F5). */
export const INTRO_SESSION_KEY = 'home:intro'

/**
 * Marca pre-paint en el `<html>`. `globals.css` esconde el overlay cuando NO
 * está, así que la visita repetida no ve ni un frame. La pone el script de
 * `HomeIntroBoot` antes del primer paint y la saca `markIntroPlayed`.
 */
export const HOME_INTRO_ATTR = 'data-home-intro'

/**
 * Evento de fin del intro — mismo patrón que `chrome:revealed` de marketing:
 * `useChromeRevealed` lo escucha para revelar dock + widget recién cuando la
 * capa se fue (si el chrome montara antes, apilaría ENCIMA del overlay — ya
 * verificado con el teaser del chat en S3). La verdad viva es el atributo del
 * `<html>`; el evento solo avisa el cambio.
 */
export const HOME_INTRO_FINISHED_EVENT = 'home-intro:finished'

/**
 * Dónde está el intro, desde el punto de vista de la escena.
 *
 * - `idle`      — no corre (visita repetida, movimiento reducido, automation, u
 *                 otra ruta). La escena hace lo suyo sin enterarse de nada.
 * - `covering`  — la capa es opaca y tapa todo. La escena está retenida.
 * - `revealing` — la capa se está desvaneciendo: la escena YA se ve. Sigue
 *                 retenida, y acá es donde más importa que lo esté.
 * - `clear`     — la capa se fue. La escena suelta.
 */
export type IntroStage = 'idle' | 'covering' | 'revealing' | 'clear'

/**
 * Cuánto scroll se tolera para considerar que el visitante NO se movió durante
 * el intro, como fracción de la altura de la ventana. 2% de una pantalla son
 * ~0,0025 de progreso del recorrido: por debajo de eso la pose inicial es la
 * misma a ojo.
 *
 * ⚠ Con la pestaña oculta `innerHeight` da 0 (lección ya documentada en
 * `CLAUDE.md`), y entonces el umbral colapsa a `scrollY <= 0`. Es el lado
 * seguro: en la duda, "no está limpio".
 */
const CLEAN_ENTRY_SCROLL_FRACTION = 0.02

let stage: IntroStage = 'idle'
let enteredClean = true
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

/** La lectura barata: es la que va adentro de un `useFrame`. */
export function getIntroStage(): IntroStage {
  return stage
}

/** `true` mientras la escena tiene que quedarse quieta en su pose inicial. */
export function isSceneHeld(current: IntroStage = stage): boolean {
  return current === 'covering' || current === 'revealing'
}

/**
 * `true` si el visitante NO scrolleó durante el intro, o sea que la pose
 * inicial de la coreografía es la que corresponde cuando la capa se va.
 *
 * Se muestrea UNA vez, en el instante exacto en que la capa empieza a
 * desvanecerse (ver `markIntroEntry`), que es cuando la pregunta importa. Cero
 * listeners de scroll: el scroll está libre a propósito y no se lo instrumenta.
 */
export function introEnteredClean(): boolean {
  return enteredClean
}

/** Solo lo llama el propio intro. */
export function setIntroStage(next: IntroStage): void {
  if (stage === next) return
  stage = next
  emit()
}

/**
 * Muestrea si la entrada es limpia. Lo llama el intro cuando arranca el
 * fundido, no antes: durante la secuencia el visitante todavía puede scrollear.
 */
export function markIntroEntry(): void {
  if (typeof window === 'undefined') return
  enteredClean = window.scrollY <= window.innerHeight * CLEAN_ENTRY_SCROLL_FRACTION
}

export function subscribeIntroStage(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** El mismo estado para un consumidor de DOM que sí necesita re-renderizar. */
export function useIntroStage(): IntroStage {
  return useSyncExternalStore(subscribeIntroStage, getIntroStage, getServerSnapshot)
}

/** En el server no hay intro corriendo: la escena renderiza su estado normal. */
function getServerSnapshot(): IntroStage {
  return 'idle'
}
