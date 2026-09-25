'use client'

import type Lenis from 'lenis'
import { useEffect, type RefObject } from 'react'

import { getIntroStage } from '@/components/layout/home-intro/introHandoff'

import { planDelViaje } from '../_lib/escena/planDelViaje'
import { empezarElViaje, terminarElViaje } from '../_lib/escena/viaje'

import {
  ATRIBUTO_DEL_VELO,
  CURVA_DEL_VIAJE,
  DURACION_DEL_DESLIZAMIENTO_S,
  DURACION_DEL_VIAJE_MS,
  PRELUDIO_MS,
  RETARDO_ANTES_DE_DESAPARECER_MS,
  SELECTOR_DE_LOS_VIAJES,
  SELECTOR_DEL_MAIN,
  TOTAL_DEL_DESLIZAMIENTO_MS,
  deberiaDeslizar,
  type ModoDelViaje,
} from './deslizamiento'
import { destinoDelViaje } from './destinosDelViaje'
import { viajarSinLenis } from './viajeSinLenis'

/**
 * EL MARGEN DEL RELOJ DE SEGURIDAD, en milisegundos.
 *
 * No es una duración de animación: es cuánto se le perdona al reloj antes de
 * declarar que el viaje no reportó su final. Medio segundo cubre el jitter de
 * `setTimeout` sin que una pestaña tapada se quede con la página en blanco más de
 * lo necesario.
 *
 * ⚠️ **Y lo que NO es este número es el total.** El reloj tiene que cubrir
 * `preludio + recorrido + margen`, y el preludio nació en este bloque: si alguien
 * agranda la pausa y el reloj no crece con ella, **el reloj aborta un viaje
 * válido** —levanta el velo a mitad de camino y devuelve el foco al CTA mientras
 * el scroll sigue viajando—. Por eso el total se arma abajo de constantes
 * importadas y no se escribe a mano, y por eso `s18-deslizamiento.invariant` §4
 * afirma que la suma da lo que tiene que dar.
 */
const MARGEN_DEL_RELOJ_MS = 500

/** El total del reloj: el del deslizamiento más el margen. Derivado. */
const RELOJ_DE_SEGURIDAD_MS = TOTAL_DEL_DESLIZAMIENTO_MS + MARGEN_DEL_RELOJ_MS

/**
 * EL DESLIZAMIENTO, EN UN EFECTO — el escucha delegado, el velo y las salidas.
 *
 * ⚠ **NO DECIDE NADA que se pueda decidir sin un DOM.** La duración, los
 * selectores, el atributo del velo y la compuerta del intro viven en
 * `deslizamiento.ts` como datos y como función pura. Acá está sólo lo que
 * necesita un documento vivo.
 *
 * ── ⚠️ QUIÉN LO LLAMA, Y POR QUÉ AHORA SON DOS ───────────────────────────
 *
 * Nació colgado de la compuerta de Lenis, y la razón escrita era ésta:
 *
 *   · abajo de 1025 no hay instancia, no hay canvas y no hay escena que mirar
 *     durante el viaje: el pedido no existe ahí;
 *   · con `prefers-reduced-motion` un scroll interpolado ES movimiento que nadie
 *     pidió.
 *
 * 🔴 **La primera envejeció en sus dos tercios del medio.** El dueño dio vuelta
 * la compuerta del escenario —`EscenarioCompuerta`: «se monta siempre, no hay
 * `return null`»— así que abajo de 1025 HAY canvas y HAY escena, y la cámara
 * sigue al scroll igual que arriba (verificado: renderer dibujando en 375, 768,
 * 1024 y 1440). Lo único que no había era **quién mueve el scroll despacio**, y
 * eso costaba un teletransporte medido: `EN VUELO 0` cuadros abajo del umbral
 * contra 128 arriba.
 *
 * Así que ahora el hook tiene DOS llamadores y UNA sola secuencia:
 *
 *   · **arriba de 1025** lo llama `ScrollSuaveDeV3`, con la instancia de Lenis;
 *   · **abajo** lo llama `DeslizamientoSinScrollSuave`, con una `ref` vacía, y
 *     el viaje lo mueve `viajeSinLenis.ts`.
 *
 * La pregunta «¿hay Lenis?» se contesta leyendo `instancia.current` EN EL CLICK
 * —nunca en el montaje—, así que no hace falta un booleano nuevo ni una segunda
 * tabla de verdad. La segunda razón sigue intacta y sigue siendo un no rotundo:
 * las DOS compuertas consultan `prefers-reduced-motion` y con la preferencia
 * puesta el click vuelve a ser el ancla nativa.
 *
 * Y de paso resuelve el acceso a la instancia sin publicarla: `ScrollSuaveDeV3`
 * documenta que **no la expone por contexto** porque nadie la consumía. Ahora la
 * consume un vecino del mismo archivo, que la recibe por `ref` y la lee en el
 * click —nunca en el montaje—, así que el contexto sigue sin existir.
 *
 * ── ⚠️ POR QUÉ EL ESCUCHA VA DELEGADO ────────────────────────────────────
 *
 * Porque `hero.invariant.tsx` §11 afirma `veces(FUENTE, 'onClick') === 0` sobre
 * el FUENTE de `Hero.tsx`: la cadena `onClick` no puede aparecer ahí. No es una
 * traba burocrática — es la regla *«ningún div haciendo de botón»* aplicada a
 * una sección que se renderiza en el servidor. El CTA tiene que seguir siendo un
 * `<a href="#trabajos">` sin una línea de JS propia, y quien escucha es el
 * documento.
 *
 * ⚠ El `target` del click **nunca es el `<a>`**: `Cta.tsx` mete dos copias del
 * rótulo y un subrayado adentro (`data-parte="copia-a|copia-b|subrayado"`), así
 * que el click aterriza en un `<span>`. Va `closest()`, no `matches()`.
 *
 * ── LAS CINCO SALIDAS, Y POR QUÉ SON CINCO ───────────────────────────────
 *
 * El velo **no se apaga solo**. `lenis.scrollTo` arma la animación con
 * `animate.fromTo`, que sobrescribe `this.onUpdate` entero (`lenis.mjs:101-118`),
 * y el `onComplete` del deslizamiento vive adentro de ESE cierre: cuando una
 * rueda entra por `onVirtualScroll` y termina en
 * `scrollTo(targetScroll + delta, { programmatic: false })` (`lenis.mjs:630`), la
 * animación se reemplaza y **el `onComplete` anterior no dispara nunca**. Un velo
 * colgado de `onComplete` se quedaría prendido para siempre, con el `<main>`
 * inerte.
 *
 * Por eso hay UNA función idempotente y cinco lugares que la llaman:
 *
 *   1. `onComplete` — llegó. El foco va al destino.
 *   2. `virtual-scroll` con delta — la rueda canceló. El foco vuelve al CTA.
 *   3. `popstate` — apretaron atrás (o adelante) a mitad de vuelo.
 *   4. el reloj de seguridad — ver abajo, no es cinturón de más. Cubre
 *      `preludio + recorrido + margen`, no sólo el recorrido.
 *   5. la limpieza del efecto — desmontar no puede dejar un `<main>` inerte.
 *
 * ⚠ **El reloj arregla un defecto que este repo ya documentó.** Con la pestaña
 * oculta el navegador saltea los rendering steps: no corre `requestAnimationFrame`,
 * y sin `raf` la animación de Lenis **no avanza**, así que `onComplete` no llega.
 * Volver a la pestaña encontraría la página en blanco y sin foco. `setTimeout`
 * sigue corriendo —estrangulado, no detenido—, así que es la única de las cinco
 * salidas que funciona con la pestaña tapada. Se cuenta como cancelación: el
 * velo se va, el foco vuelve, y si el scroll termina después, `terminar` ya no
 * hace nada.
 *
 * ── ⚠️ NADIE LLAMA `stop()`, Y ACÁ TAMPOCO ───────────────────────────────
 *
 * `lenis.css` cuelga `overflow: clip` de la clase `lenis-stopped`, y esa clase la
 * escribe Lenis **sólo** al llamar `stop()`. Un `overflow` distinto de `visible`
 * en el `<html>` apaga en silencio los tres `sticky` de /v3 —la pastilla,
 * Trabajos y Servicios—. La cancelación de acá NO detiene nada: `lock: false`
 * deja que la rueda entre por el camino normal de Lenis y la animación se
 * reemplace sola. Este archivo entra al barrido de `.stop(` de
 * `s18-compuertas.invariant.ts` §3b junto a los otros tres del motor.
 */
export function useDeslizamientoDelCta(instancia: RefObject<Lenis | null>, modo: ModoDelViaje = 'viaje'): void {
  useEffect(() => {
    const zona = document.querySelector<HTMLElement>(SELECTOR_DEL_MAIN)
    if (zona === null) return

    /** El `<a>` que disparó el vuelo, para poder devolverle el foco. */
    let origen: HTMLElement | null = null
    /** El `<section>` al que se viaja, para darle el foco al llegar. */
    let destino: HTMLElement | null = null
    let enVuelo = false
    let soltarLaRueda: (() => void) | null = null
    /** El cancelador del viaje sin Lenis. Con Lenis se queda en `null`. */
    let cancelarElViaje: (() => void) | null = null
    /** El reloj que prende el velo, cuando el retardo del click terminó. */
    let relojDelVelo: number | undefined
    /** El reloj que ARRANCA el viaje cuando el preludio terminó. */
    let relojDeArranque: number | undefined
    /** Y el de seguridad, que lo aborta si nadie reportó el final. */
    let reloj: number | undefined
    /** [VIAJES] El que suelta la escena cuando el velo terminó de volver. */
    let relojDeLaEscena: number | undefined

    /**
     * APAGA EL VELO. Idempotente, y la llaman las cinco salidas.
     *
     * `llego` decide a dónde va el foco y es el único parámetro: al destino si
     * el viaje terminó, de vuelta al CTA si se canceló. `preventScroll` en los
     * dos casos, porque enfocar mueve el scroll y eso pelearía con el viaje que
     * justo acaba de terminar —o con el que el visitante retomó con la rueda.
     */
    const terminar = (llego: boolean): void => {
      if (!enVuelo) return
      enVuelo = false
      if (relojDelVelo !== undefined) {
        window.clearTimeout(relojDelVelo)
        relojDelVelo = undefined
      }
      if (relojDeArranque !== undefined) {
        // 🔴 Si la cancelación llegó durante el preludio, el viaje NO tiene que
        // arrancar después. Es la única línea que impide que una rueda en los
        // primeros 600 ms apague el velo y el scroll salga igual de viaje.
        window.clearTimeout(relojDeArranque)
        relojDeArranque = undefined
      }
      if (reloj !== undefined) {
        window.clearTimeout(reloj)
        reloj = undefined
      }
      if (soltarLaRueda !== null) {
        soltarLaRueda()
        soltarLaRueda = null
      }
      // Con Lenis no hay nada que cancelar acá: su animación se reemplaza sola
      // cuando la rueda entra, que es lo que documentan «las cinco salidas».
      if (cancelarElViaje !== null) {
        cancelarElViaje()
        cancelarElViaje = null
      }
      zona.removeAttribute(ATRIBUTO_DEL_VELO)
      // El orden importa: mientras el `<main>` sea inerte, `focus()` adentro no
      // hace nada. Primero se devuelve la interactividad, después el foco.
      zona.inert = false
      // [VIAJES] La escena sigue en viaje hasta que el velo termina de volver: en un destino opaco,
      // la sala de abajo no se ve mientras el `<main>` todavía es transparente.
      relojDeLaEscena = window.setTimeout(terminarElViaje, duracionDelFundido(zona))

      const foco = llego ? destino : origen
      if (foco !== null) {
        /**
         * ⚠ El destino es un `<section>` y **no es focalizable**: `Panel` le pone
         * `tabindex="-1"` sólo a la sección de entrada. Un ancla a un elemento no
         * focalizable mueve el punto de partida del foco secuencial en Chromium y
         * en Gecko, pero WebKit no lo hace, y ahí el Tab siguiente vuelve al CTA:
         * el enlace parece andar y no anda. Con `-1` el destino recibe foco de
         * verdad en los tres, y **no cambia las paradas del documento**:
         * `s10-lectura.paradasDeTabulacion` descarta el `-1` explícitamente, y un
         * foco programático sobre un contenedor no dispara `:focus-visible`.
         *
         * Se escribe acá y no en el marcado a propósito: así no viaja en el HTML
         * del servidor y ningún censo del banco de S10 cambia de número.
         */
        if (!foco.hasAttribute('tabindex')) foco.setAttribute('tabindex', '-1')
        foco.focus({ preventScroll: true })
      }
      origen = null
      destino = null
    }

    const alClick = (evento: MouseEvent): void => {
      // Sólo el click primario y sin modificadores: ctrl/cmd/shift abren en otra
      // pestaña o ventana, y eso es del navegador, no nuestro.
      if (evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
      if (evento.defaultPrevented) return

      const blanco = evento.target
      if (!(blanco instanceof Element)) return
      // [VIAJES] El CTA del hero, los ítems de la barra y los del menú móvil: el mismo gesto.
      const enlace = blanco.closest<HTMLAnchorElement>(SELECTOR_DE_LOS_VIAJES)
      if (enlace === null) return

      // 🔴 La compuerta del intro. Antes de que la capa se vaya, el botón no
      // desliza: el ancla nativa hace lo suyo y `markIntroEntry` muestrea lo que
      // tenga que muestrear.
      if (!deberiaDeslizar(getIntroStage())) return

      const ancla = enlace.getAttribute('href')
      if (ancla === null || !ancla.startsWith('#')) return
      const seccion = document.getElementById(ancla.slice(1))
      if (seccion === null) return

      // ⚠️ **SIN INSTANCIA YA NO SE SALE.** Acá había un `return`, y era la
      // línea que hacía que abajo de 1025 el CTA se teletransportara: sin Lenis
      // no había quién moviera el scroll despacio. Desde este sprint hay dos
      // motores y UNA sola secuencia — ver el bloque de abajo.
      const lenis = instancia.current

      // Un click a mitad de vuelo: el `<main>` ya es inerte, así que no debería
      // llegar. Si llegara por otro camino, se ignora en vez de encimar dos
      // animaciones.
      if (enVuelo) return

      evento.preventDefault()

      /**
       * ⚠ **EL HISTORIAL SE REPONE A MANO, Y SI NO, ATRÁS SE VA DEL DOCUMENTO.**
       * Un click en un ancla del mismo documento empuja una entrada de sesión con
       * el fragmento. `preventDefault()` se la come, y sin reponerla el botón de
       * atrás lleva a la página anterior en vez de deshacer el salto.
       *
       * Va `pushState` y no `location.hash`: asignar el hash SÍ empuja historial
       * pero además scrollea al instante, que es justo lo que este sprint viene a
       * reemplazar. `pushState` no dispara `hashchange` y no mueve el scroll.
       *
       * ⚠ Lo que esto reproduce es el comportamiento de HOY, no el del navegador
       * en abstracto: `SmoothScroll` pone `history.scrollRestoration = 'manual'`
       * en un efecto sin condiciones, en toda ruta, así que atrás ya no devolvía
       * la posición ANTES de este sprint. Cambia la URL y no el scroll — igual
       * que antes.
       */
      window.history.pushState(null, '', ancla)

      origen = enlace
      destino = seccion
      enVuelo = true
      // [VIAJES] El destino es un nudo de la coreografía (`destinosDelViaje.ts`), medido en el click; y
      // la escena se entera de adónde va y con qué luz sale y llega (`planDelViaje.ts`).
      const destinoEnPx = destinoDelViaje(seccion)
      window.clearTimeout(relojDeLaEscena)
      empezarElViaje(planDelViaje(seccion.id, destinoEnPx))

      // El velo espera `RETARDO_ANTES_DE_DESAPARECER_MS`; con 0 va en el mismo cuadro.
      const encenderElVelo = (): void => {
        relojDelVelo = undefined
        zona.setAttribute(ATRIBUTO_DEL_VELO, '')
      /**
       * 🔴 `opacity: 0` NO ALCANZA. Un `<main>` transparente sigue estando en el
       * orden de tabulación: quien tabula durante el viaje enfoca enlaces que no
       * puede ver, y `preventDefault()` no mueve el foco por su cuenta.
       *
       * Consecuencia declarada, porque `inert` no la esconde: mientras el atributo
       * está puesto, el subárbol sale también del ÁRBOL DE ACCESIBILIDAD. Son dos
       * segundos, sobre una acción que el visitante pidió, con el contenido
       * invisible y el foco manejado en las dos salidas. Y no lo sufre quien más
       * lo sentiría: con `prefers-reduced-motion` este archivo no se monta.
       */
        zona.inert = true
      }
      if (RETARDO_ANTES_DE_DESAPARECER_MS === 0) encenderElVelo()
      else relojDelVelo = window.setTimeout(encenderElVelo, RETARDO_ANTES_DE_DESAPARECER_MS)

      // El vigía de la cancelación. `virtual-scroll` se emite en la PRIMERA línea
      // de `onVirtualScroll` (`lenis.mjs:579`), antes de todas las guardas, así
      // que ve la rueda que después va a reemplazar la animación. Se filtra el
      // delta cero, que es el `touchstart` sin gesto —el mismo `isClickOrTap` que
      // la librería descarta dos líneas más abajo.
      /**
       * ⚠️ **EL VIGÍA TIENE DOS FORMAS PORQUE HAY DOS MOTORES, y las dos dicen
       * lo mismo: «el visitante retomó el control».**
       *
       * Con Lenis se escucha `virtual-scroll`, que se emite en la PRIMERA línea
       * de `onVirtualScroll` (`lenis.mjs:579`), antes de todas las guardas, así
       * que ve la rueda que después va a reemplazar la animación. Se filtra el
       * delta cero, que es el `touchstart` sin gesto.
       *
       * Sin Lenis no hay ese evento, así que se escuchan los gestos crudos:
       * `wheel`, `touchstart` y `keydown`. ⚠️ **No se puede escuchar `scroll`**:
       * el viaje sin Lenis mueve el scroll con `window.scrollTo`, o sea que
       * dispararía su propia cancelación en el primer cuadro. `wheel` y
       * `touchstart` los produce una persona, nunca el animador.
       */
      if (lenis !== null) {
        soltarLaRueda = lenis.on('virtual-scroll', ({ deltaX, deltaY }) => {
          if (deltaX === 0 && deltaY === 0) return
          terminar(false)
        })
      } else {
        const alGesto = (): void => terminar(false)
        window.addEventListener('wheel', alGesto, { passive: true })
        window.addEventListener('touchstart', alGesto, { passive: true })
        window.addEventListener('keydown', alGesto)
        soltarLaRueda = () => {
          window.removeEventListener('wheel', alGesto)
          window.removeEventListener('touchstart', alGesto)
          window.removeEventListener('keydown', alGesto)
          if (cancelarElViaje !== null) {
            cancelarElViaje()
            cancelarElViaje = null
          }
        }
      }

      reloj = window.setTimeout(() => terminar(false), RELOJ_DE_SEGURIDAD_MS)

      /**
       * 🔴 LA PAUSA. El viaje NO arranca en el mismo cuadro que el velo: espera
       * el preludio —el fundido del velo más el silencio— y recién después
       * scrollea. Es lo que hace que se lea *«desaparece todo, y LUEGO baja»*.
       *
       * ⚠ Durante el preludio el viaje ya está EN VUELO a todos los efectos: el
       * velo está puesto, el `<main>` es inerte, el vigía de la rueda está
       * escuchando y el reloj de seguridad corre. Una rueda ahí cancela un viaje
       * que todavía no se movió un píxel, y `terminar` limpia este reloj para
       * que el `scrollTo` de abajo no se ejecute nunca.
       */
      // [VIAJES] Con movimiento reducido la espera es el fundido del velo, que declara la hoja.
      const salto = modo === 'salto'
      const espera = salto ? duracionDelFundido(zona) : PRELUDIO_MS
      relojDeArranque = window.setTimeout(() => {
        relojDeArranque = undefined
        if (salto) {
          window.scrollTo({ top: destinoEnPx, behavior: 'instant' })
          terminar(true)
          return
        }
        /**
         * 🔴 **LOS DOS MOTORES, Y LA SECUENCIA ES UNA SOLA.** Lo que cambia entre
         * las dos ramas es QUIÉN mueve el scroll; el retardo, el fundido, la
         * pausa, la duración, la curva, el destino y las cinco salidas son los
         * mismos objetos en las dos. Por eso las constantes se leen de
         * `deslizamiento.ts` en los dos lados y no hay un segundo juego de
         * tiempos que pueda desincronizarse.
         */
        if (lenis === null) {
          cancelarElViaje = viajarSinLenis(
            destinoEnPx,
            DURACION_DEL_VIAJE_MS,
            CURVA_DEL_VIAJE,
            () => terminar(true),
          )
          return
        }
        lenis.scrollTo(destinoEnPx, {
          duration: DURACION_DEL_DESLIZAMIENTO_S,
          /**
           * 🔴 La curva PROPIA del viaje — `power1.inOut` del vocabulario de
           * develOP, importada. La rueda sigue con la del sitio, que es la que
           * `OPCIONES_DE_LENIS` declara y este sprint no toca. El costo de tener
           * dos está declarado en `deslizamiento.ts` y numerado en
           * `DIRECCION-ESCENA.md` §7.74.
           */
          easing: CURVA_DEL_VIAJE,
          // ⚠ Va explícito aunque sea el default: ES la decisión que hace al viaje
          // cancelable. Con `lock: true` la rueda entraría a `onVirtualScroll` y
          // saldría por la guarda de `isLocked` con un `preventDefault()`, y el
          // visitante quedaría encerrado los cuatro segundos.
          lock: false,
          onComplete: () => terminar(true),
        })
      }, espera)
    }

    const alHistorial = (): void => terminar(false)

    document.addEventListener('click', alClick)
    window.addEventListener('popstate', alHistorial)

    return () => {
      document.removeEventListener('click', alClick)
      window.removeEventListener('popstate', alHistorial)
      // Desmontar a mitad de vuelo no puede dejar el `<main>` apagado ni inerte.
      terminar(false)
      window.clearTimeout(relojDeLaEscena)
      terminarElViaje()
    }
  }, [instancia, modo])
}

/** [VIAJES] Cuánto tarda el velo en irse, leído de la hoja: una sola definición del fundido. */
function duracionDelFundido(zona: HTMLElement): number {
  const segundos = Number.parseFloat(getComputedStyle(zona).transitionDuration)
  return Number.isFinite(segundos) ? segundos * 1000 : 0
}
