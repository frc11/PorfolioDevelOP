/**
 * TRABAJOS ABAJO DE 1024 — lo que cambia del marco, y nada de la tabla. **[MÓVIL-TRABAJOS]**
 *
 * El túnel corre con la misma tabla en todo ancho (`tunel.ts`, `geometria.ts`): sus
 * píxeles ya son pantallas —se cuentan contra el alto de 900 de la referencia y se
 * pasan a fracción de la sección—. Lo que cambia abajo de 1024 es el MARCO: la caja
 * del cartel, la de la ventana del CTA y su cromo. Todo va por CSS con las variantes
 * `max-escritorio:` (tablet) y `max-movil:` (teléfono), así que escritorio no lee
 * una sola de estas líneas.
 */

import { useCallback, useEffect, useRef, type CSSProperties } from 'react'

import { ANCHO_DEL_CTA, RELACION_DEL_CTA } from './tunel'

/**
 * LA VENTANA DEL CTA EN CADA APARATO. En escritorio es un portátil (16:10, 0,62 del
 * ancho). En tablet es un iPad en retrato (3:4) y en el teléfono un iPhone (9:17):
 * ocupa una fracción del ancho y, si el alto no alcanza, se apoya en el alto. Los
 * altos van en `svh`, el mismo alto con el que se clava la sección.
 */
export const VENTANA_POR_APARATO = {
  tablet: { ancho: 0.8, alto: 0.78, relacion: { ancho: 3, alto: 4 } },
  movil: { ancho: 0.86, alto: 0.76, relacion: { ancho: 9, alto: 17 } },
} as const

const pc = (f: number): string => `${(f * 100).toFixed(2)}%`
const svh = (f: number): string => `${(f * 100).toFixed(2)}svh`
const relacion = (r: { readonly ancho: number; readonly alto: number }): string => `${String(r.ancho)} / ${String(r.alto)}`

/** Las propiedades que leen las clases de la caja de la ventana (`VentanaDelCta`). */
export const ESTILO_DE_LA_CAJA_DE_LA_VENTANA = {
  '--ventana-ancho': pc(ANCHO_DEL_CTA),
  '--ventana-relacion': relacion(RELACION_DEL_CTA),
  '--ventana-ancho-tablet': pc(VENTANA_POR_APARATO.tablet.ancho),
  '--ventana-alto-tablet': svh(VENTANA_POR_APARATO.tablet.alto),
  '--ventana-relacion-tablet': relacion(VENTANA_POR_APARATO.tablet.relacion),
  '--ventana-proporcion-tablet': (VENTANA_POR_APARATO.tablet.relacion.ancho / VENTANA_POR_APARATO.tablet.relacion.alto).toFixed(5),
  '--ventana-ancho-movil': pc(VENTANA_POR_APARATO.movil.ancho),
  '--ventana-alto-movil': svh(VENTANA_POR_APARATO.movil.alto),
  '--ventana-relacion-movil': relacion(VENTANA_POR_APARATO.movil.relacion),
  '--ventana-proporcion-movil': (VENTANA_POR_APARATO.movil.relacion.ancho / VENTANA_POR_APARATO.movil.relacion.alto).toFixed(5),
  /** La barra de direcciones del iPad no va de lado a lado: queda centrada. */
  '--ventana-barra-tablet': pc(0.62),
} as CSSProperties

/**
 * LA CAJA DEL CARTEL abajo de 1024: de margen a margen (eso lo dicen las clases) y
 * más alta que la de escritorio, porque el titular y su bajada ocupan más renglones.
 */
export const ESTILO_DEL_CARTEL_ANGOSTO = {
  '--cartel-arriba-angosto': pc(0.18),
  '--cartel-alto-angosto': pc(0.64),
} as CSSProperties

/**
 * «PORTFOLIO» ES UN TITULAR EN TODO ANCHO. En tablet crece un 30 % sobre el nivel de
 * escritorio y en el teléfono se queda en el nivel; en los dos, nunca más ancho que
 * la calle entre márgenes. Medido en el navegador de 320 a 1023: la tinta de la palabra
 * mide 3,886 veces su cuerpo; dividir la calle por 4,6 le deja un 16 % de aire.
 */
export const CLASE_DEL_TITULAR_DEL_CARTEL =
  'max-escritorio:text-[min(calc(var(--text-fluido-display-xl)*1.3),calc((100vw-2*var(--pad-lateral-compacto))/4.6))] max-movil:text-[min(var(--text-fluido-display-xl),calc((100vw-2*var(--pad-lateral-compacto))/4.6))]'

/** La bajada de la lista quieta abajo de 1024: el cuerpo del cartel animado, que es `titulo-s`. */
export const CLASE_DE_LA_BAJADA_ANGOSTA = 'max-escritorio:text-[length:var(--text-titulo-s)]'

/**
 * EL TEXTO DE LAS DEMOS abajo de 1024: en tablet crece el cuerpo. [EL ENCASTRE] 1B: el
 * título usa las clases del titular del cartel (el mismo tamaño que «Portfolio»).
 */
export const CLASE_DEL_CUERPO_DE_DEMOS = 'max-escritorio:text-[length:var(--text-titulo-s)] max-movil:text-[length:var(--text-cuerpo)]'

/** La frase del CTA en el iPhone: un cartel de tres o cuatro renglones, no uno por palabra. */
export const CLASE_DE_LA_FRASE_ANGOSTA = 'max-movil:text-[calc(var(--text-fluido-titulo-xl)*1.3)]'

/**
 * [PULIDO 11] A3 · LA HUIDA DEL CARTEL ABAJO DE 1024. El cartel huye hacia la cámara (`translateZ` bajo la `perspective` de
 * su escenario): se agranda desde el centro del cuadro. En escritorio la caja es angosta y se apaga antes de llegar a los
 * bordes; abajo de 1024 va de margen a margen y a ~1,2× ya se cortaba por los costados («ortfolio», «ada uno de estos…»)
 * con la opacidad todavía en ~0,7. Ahí se desvanece al ritmo de su agrandamiento: 0 justo cuando su borde tocaría el del
 * cuadro. La pose (la tabla del túnel) no cambia.
 */
export interface AngostoDelCartel {
  /** Del borde del cuadro al del cartel (px), la mitad del cuadro (px) y el foco de su escenario (la `perspective`, px). */
  readonly margen: number
  readonly mitad: number
  readonly foco: number
}

export function opacidadDeLaHuidaAngosta(opacidad: number, z: number, angosto: AngostoDelCartel | null): number {
  if (angosto === null || angosto.margen <= 0) return opacidad
  const escala = angosto.foco / Math.max(1, angosto.foco - z)
  const tope = angosto.mitad / Math.max(1, angosto.mitad - angosto.margen)
  return Math.min(opacidad, Math.max(0, 1 - (escala - 1) / (tope - 1)))
}

/** El cartel de margen a margen: su margen, la mitad del cuadro y el foco de su escenario (la `perspective` de un ancestro); si no, `null`. */
function medirElAngosto(el: HTMLElement): AngostoDelCartel | null {
  const margen = el.offsetLeft
  if (Math.abs(margen + el.offsetWidth + margen - window.innerWidth) > 2) return null
  for (let a = el.parentElement; a !== null; a = a.parentElement) {
    const foco = parseFloat(getComputedStyle(a).perspective)
    if (foco > 0) return { margen, mitad: window.innerWidth / 2, foco }
  }
  return null
}

/** Las medidas del angosto, tomadas la primera vez que se piden y de nuevo después de cada cambio de tamaño. */
export function useAngostoDelCartel(): (el: HTMLElement) => AngostoDelCartel | null {
  const medidas = useRef<AngostoDelCartel | null | undefined>(undefined)
  useEffect(() => {
    const olvidar = (): void => {
      medidas.current = undefined
    }
    window.addEventListener('resize', olvidar)
    return () => window.removeEventListener('resize', olvidar)
  }, [])
  return useCallback((el: HTMLElement) => {
    if (medidas.current === undefined) medidas.current = medirElAngosto(el)
    return medidas.current
  }, [])
}
