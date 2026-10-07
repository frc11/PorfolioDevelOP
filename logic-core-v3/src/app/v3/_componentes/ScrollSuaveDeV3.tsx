'use client'

import Lenis from 'lenis'
import { useEffect, useRef } from 'react'

import { OPCIONES_DE_LENIS } from '@/components/layout/SmoothScroll'

import { TOPE_DEL_CUADRO_DEL_VIAJE_MS, viajeEnCurso } from '../_lib/escena/viaje'
import { MARCA_SCROLL_SUAVE } from '../_lib/marcaScrollSuave'
import { ATRIBUTO_SCROLL_SUAVE } from '../_lib/scrollSuave'
import { VELOCIDAD_DEL_SCROLL, velocidadDelCuadro } from '../_lib/velocidadDelScroll'
import { ponerElModoDeNk } from './lenisDeNk'
import { useDeslizamientoDelCta } from './useDeslizamientoDelCta'

/**
 * EL MOTOR DE SCROLL DE /v3 — el módulo perezoso que la compuerta monta.
 *
 * ⚠ **NO DECIDE NADA.** Las dos compuertas —1025 y `prefers-reduced-motion`—
 * viven en `CompuertaDelScrollSuave.tsx`, que es quien lo pide con `import()`.
 * Si este archivo tuviera una condición, habría dos definiciones de la misma
 * decisión y una se quedaría vieja.
 *
 * ── Lo que hace, entero ───────────────────────────────────────────────────
 *
 * Construye una instancia con `OPCIONES_DE_LENIS` —**la configuración del sitio
 * vivo, importada, no copiada**— y le da un `requestAnimationFrame`. [ESCENA 10]
 * T1: y le pone el modo de nk (`lenisDeNk.ts`: `lerp` 0,1, sin duración), que
 * cambia las opciones de la instancia y no su construcción.
 *
 * ── ⚠️ Lo que NO hace, y cada cosa tiene su razón ─────────────────────────
 *
 *   · **No toca `history.scrollRestoration`.** Ya lo pone `SmoothScroll` en
 *     `'manual'`, en un efecto sin condiciones que corre en toda ruta. Ponerlo
 *     otra vez sería escribir dos veces el mismo valor.
 *   · **No fuerza el scroll a 0.** Eso lo hace `SmoothScroll` sólo en `/`, y en
 *     /v3 el preloader ya tiene su propio contrato con la posición: el intro
 *     *«nunca bloquea el scroll, ni un frame»* y la escena queda retenida en la
 *     pose 0 mientras la capa tapa. Forzar la posición desde acá le pisaría el
 *     dato a `introEnteredClean()`, que es lo que decide si la escena se ata al
 *     scroll donde el visitante esté.
 *   · **No publica la instancia por contexto.** `triggerTransition` no se usa
 *     acá, y el único otro consumidor de `useLenis()` es el home viejo. Un
 *     contexto sin consumidores es una superficie de más.
 *
 *     ⚠️ **DESLIZAR-1 le dio el primer consumidor y el contexto SIGUE sin
 *     existir**, que es el punto: el consumidor es un vecino del mismo archivo.
 *     `useDeslizamientoDelCta` recibe la instancia por `ref` y la lee **en el
 *     click**, nunca en el montaje, así que no hace falta ni estado ni provider
 *     ni un render de más. Un contexto sólo se justificaría con un consumidor
 *     que colgara de otra rama del árbol, y no es el caso.
 *   · **No llama `stop()` ni `start()` nunca.** Es lo que mantiene al `<html>`
 *     sin la clase `lenis-stopped` y por lo tanto sin el `overflow: clip` que
 *     `lenis.css` cuelga de ella — la única vía por la que esta librería podría
 *     apagar un `position: sticky`. Se afirma sobre este fuente y se verifica
 *     sobre el `<html>` vivo.
 *
 * ── El atributo del `<html>` ──────────────────────────────────────────────
 *
 * Es la única forma de que un instrumento del navegador distinga «Lenis corre»
 * de «Lenis corre **por /v3**»: la clase `lenis` que agrega la propia librería
 * la escribe también `SmoothScroll` en toda ruta vieja. Se pone al construir y
 * se saca en el cleanup, así que también dice cuándo dejó de correr.
 */
export default function ScrollSuaveDeV3(): null {
  /**
   * La instancia, para el único vecino que la consume (DESLIZAR-1).
   *
   * Va en una `ref` y no en estado porque nadie la necesita en un render: el
   * deslizamiento la lee en el click, que es siempre mucho después del montaje.
   * Con estado habría un render de más por cada montaje del módulo, y este
   * componente existe justamente para no renderizar nada.
   */
  const instancia = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({ ...OPCIONES_DE_LENIS })
    // [ESCENA 10] T1 · el modo de nk (era la prueba `lenis=nk` de ESCENA 9): las opciones de la instancia, no su construcción.
    ponerElModoDeNk(lenis)
    instancia.current = lenis
    document.documentElement.setAttribute(ATRIBUTO_SCROLL_SUAVE, MARCA_SCROLL_SUAVE)

    // [INTERFAZ 1] T1 · la velocidad del scroll, una vez por cuadro y en px/s, para el texto con inercia.
    let [yAnterior, tAnterior] = [lenis.animatedScroll, 0]
    // [NOCTURNO FINAL] A2 · el reloj que ve Lenis: en un viaje del menú, un cuadro largo avanza a lo sumo
    // `TOPE_DEL_CUADRO_DEL_VIAJE_MS` (un tirón no hace saltar la página); fuera de un viaje, el de siempre.
    let [reloj, tReal] = [-1, 0]
    let pedido = requestAnimationFrame(function cuadro(tiempo: number) {
      reloj = reloj < 0 ? tiempo : reloj + (viajeEnCurso() === null ? tiempo - tReal : Math.min(tiempo - tReal, TOPE_DEL_CUADRO_DEL_VIAJE_MS))
      tReal = tiempo
      lenis.raf(reloj)
      const y = lenis.animatedScroll
      VELOCIDAD_DEL_SCROLL.pxPorSegundo = tAnterior === 0 ? 0 : velocidadDelCuadro(yAnterior, y, tiempo - tAnterior)
      yAnterior = y
      tAnterior = tiempo
      pedido = requestAnimationFrame(cuadro)
    })

    return () => {
      // El orden importa y es el que `SmoothScroll` ya documenta: primero se
      // cancela el pedido de cuadro y después se destruye. Al revés queda un
      // `rAF` vivo pidiendo cuadros sobre una instancia muerta.
      cancelAnimationFrame(pedido)
      VELOCIDAD_DEL_SCROLL.pxPorSegundo = 0
      lenis.destroy()
      instancia.current = null
      document.documentElement.removeAttribute(ATRIBUTO_SCROLL_SUAVE)
    }
  }, [])

  /**
   * ⚠ Va DESPUÉS del efecto de arriba y no es indistinto: los efectos de un
   * componente corren en orden de declaración, así que cuando el escucha del
   * deslizamiento se instala, `instancia.current` ya tiene la instancia.
   * (No es de lo que depende —el click llega mucho más tarde— pero que el orden
   * sea el correcto evita tener que razonarlo cada vez que alguien lo lea.)
   */
  useDeslizamientoDelCta(instancia)

  return null
}
