'use client'

import { useEffect, useRef, type RefObject } from 'react'

import { tomarLosGestos, type DecisionDelPrimero, type GestoDeScroll } from '../../_lib/gestosDelScroll'
import { COLA_DEL_GESTO_MS, FAQ_EN_VIVO, avisarAlFaq, decidirElGestoDelFaq, entrar, entrarSinGesto, faseEn, salir, soltarElFaq } from '../../_lib/pie3d/faqDelPie'
import { SALIDA_EN_VIVO } from '../../_lib/pie3d/salidas'

/**
 * [B10] EL GATILLO DEL FAQ — cómo se entra y cómo se sale, con gatillo (una animación entera que se dispara y vuelve), sin sumarle alto a
 * la página: el FAQ nace del pie en la misma pantalla.
 *
 *   · **Seguir scrolleando después del pie** (un gesto NUEVO hacia abajo con el pie entero al fondo) entra: el pie se hunde y sube el FAQ.
 *     El pie entero: el de volumen, acostado al final del encastre (`SALIDA_EN_VIVO.acostado`); el plano, la página al fondo (en el layout).
 *   · **Subir** (un gesto nuevo hacia arriba) sale: el FAQ se hunde y vuelve el pie. Ese gesto y su cola no le llegan al final del pie
 *     (`gestosDelScroll.ts`, el dueño primero): no rebobina el encastre.
 *   · **El teclado:** el foco que entra al FAQ (Tab desde el pie) lo trae; el que vuelve al pie (Mayús+Tab), lo saca. Con el foco adentro
 *     las teclas son del FAQ (las flechas recorren las preguntas).
 *   · **La página que se va** (la barra, un viaje del menú): lejos del fondo, sale.
 */
interface OpcionesDelGatillo {
  /** La raíz del FAQ (lo que es suyo) y el selector del contenedor del pie (el foco ahí lo saca). */
  readonly raiz: RefObject<HTMLElement | null>
  readonly pie: string
  /** El pie es el de volumen (WebGL, armado): entra con el pie acostado al final del encastre. */
  readonly volumen: boolean
  /** Sin el escenario (la lista, el teléfono): no hay gatillo. */
  readonly activo: boolean
}

/** El fondo de la página medido en el LAYOUT (como el final del pie: un DOM transformado agranda el desborde, no el layout). */
export function fondoDelLayout(): number {
  return Math.max(0, document.documentElement.offsetHeight - window.innerHeight)
}

/** Lejos del fondo (la parte de una pantalla): más de un cuarto de pantalla arriba del final, el FAQ se va. */
export const LEJOS_DEL_FONDO = 0.25

/**
 * El dueño primero de los gestos (`gestosDelScroll.ts`) con el reloj del FAQ: decide (`decidirElGestoDelFaq`), entra o sale, y retiene lo
 * que toma y su cola (`COLA_DEL_GESTO_MS`). Aparte del hook para que una prueba lo enchufe a los gestos sin React.
 */
export function primeroDelFaq(puedeEntrar: () => boolean, focoAdentro: () => boolean): (g: GestoDeScroll) => DecisionDelPrimero {
  return (g) => {
    const ahora = performance.now()
    const enLaGuarda = ahora < FAQ_EN_VIVO.guardaHasta
    const d = decidirElGestoDelFaq(faseEn(FAQ_EN_VIVO, ahora), { sentido: g.sentido, nuevo: g.nuevo, origen: g.origen, puedeEntrar: puedeEntrar(), focoAdentro: focoAdentro() }, enLaGuarda)
    if (d === 'sigue' || d === 'suelta') return d
    // La cola de un gesto que lo movió se retiene un rato más (la inercia de un trackpad): no le llega al final del pie.
    FAQ_EN_VIVO.guardaHasta = ahora + COLA_DEL_GESTO_MS
    if ((d === 'entra' && entrar(FAQ_EN_VIVO, ahora)) || (d === 'sale' && salir(FAQ_EN_VIVO, ahora))) avisarAlFaq()
    return 'toma'
  }
}

/** El pie entero, donde el FAQ puede entrar: el de volumen, acostado al final del encastre (y presente); el plano, la página al fondo. */
export function puedeEntrarElFaq(volumen: boolean): boolean {
  return volumen ? SALIDA_EN_VIVO.acostado && SALIDA_EN_VIVO.fase === 'presente' : window.scrollY >= fondoDelLayout() - 2
}

/**
 * [C2-71] El botón del FAQ (`BotonDelFaq`): tocarlo es el gesto que trae el FAQ, con la misma condición que un gesto nuevo hacia abajo
 * (`entra` en `decidirElGestoDelFaq`: desde fuera y con el pie entero). Devuelve si entró.
 */
export function pedirElFaqSinGesto(volumen: boolean): boolean {
  return entrarSinGesto(puedeEntrarElFaq(volumen), performance.now())
}

export function useGatilloDelFaq({ raiz, pie, volumen, activo }: OpcionesDelGatillo): void {
  // El pie de volumen se arma después de montar: se lee al decidir (cambiarlo no suelta un FAQ que está adentro).
  const deVolumen = useRef(volumen)
  useEffect(() => {
    deVolumen.current = volumen
  }, [volumen])
  useEffect(() => {
    if (!activo) return undefined
    const puedeEntrar = (): boolean => puedeEntrarElFaq(deVolumen.current)
    const focoAdentro = (): boolean => raiz.current?.contains(document.activeElement) === true

    const soltarLosGestos = tomarLosGestos(primeroDelFaq(puedeEntrar, focoAdentro))

    const alEnfocar = (e: FocusEvent): void => {
      const t = e.target
      if (!(t instanceof Node)) return
      const ahora = performance.now()
      const adentro = raiz.current?.contains(t) === true
      const enElPie = !adentro && document.querySelector(pie)?.contains(t) === true
      if ((adentro && entrar(FAQ_EN_VIVO, ahora)) || (enElPie && salir(FAQ_EN_VIVO, ahora))) avisarAlFaq()
    }
    let cuadro = 0
    const mirar = (): void => {
      cuadro = 0
      const lejos = window.scrollY < fondoDelLayout() - window.innerHeight * LEJOS_DEL_FONDO
      if (lejos && salir(FAQ_EN_VIVO, performance.now())) avisarAlFaq()
    }
    const alMoverse = (): void => {
      if (cuadro === 0) cuadro = requestAnimationFrame(mirar)
    }
    document.addEventListener('focusin', alEnfocar)
    window.addEventListener('scroll', alMoverse, { passive: true })
    return () => {
      soltarLosGestos()
      document.removeEventListener('focusin', alEnfocar)
      window.removeEventListener('scroll', alMoverse)
      cancelAnimationFrame(cuadro)
      // Sin el gatillo (otro ancho, menos movimiento, otra página): el pie de vuelta, quieto.
      soltarElFaq()
    }
  }, [raiz, pie, activo])
}
