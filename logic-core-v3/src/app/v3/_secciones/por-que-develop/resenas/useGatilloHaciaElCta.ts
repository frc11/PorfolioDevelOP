'use client'

import type { MotionValue } from 'motion/react'
import { useEffect, type RefObject } from 'react'

import { volar, vueloAjeno, vueloDelGatilloPisado, type VueloDelGatillo } from '../../../_componentes/gatillos/vuelo'
import { hayBanco } from '../../../_lib/escena/entorno'
import { viajeEnCurso } from '../../../_lib/escena/viaje'
import { retenerLosGestos } from '../../../_lib/gestosDelScroll'
import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'
import { GATILLO_HACIA_EL_CTA, LUGARES_DEL_GATILLO, cruceDelGatillo, debeAbortar, gestoAsentado, guardadoDeVuelta, guardadoSuelto, seFueDelAsiento } from './haciaElCta'
import { PIN_CON_LAS_RESENAS } from './tramo'

/** Por dónde va la secuencia: quieta, asentándose o asentada en las reseñas, volando o esperando al guardado. */
type Etapa = 'quieta' | 'al-asiento' | 'asentada' | 'al-guardado' | 'esperando-el-guardado' | 'al-cta' | 'de-vuelta' | 'esperando-la-vuelta'

/** Con banco, `__defectoDelGatilloHaciaElCta = 'apagado'` lo apaga (el control: el paso de antes, que sigue al scroll). */
type VentanaDelBanco = Window & { __gatilloHaciaElCtaDelBanco?: () => { readonly etapa: Etapa; readonly pantalla: number }; __defectoDelGatilloHaciaElCta?: string }

/**
 * [L8b · 3] EL GATILLO ENTERO DE LAS RESEÑAS AL CTA, del lado del DOM (la parte pura y sus lugares, `haciaElCta.ts`): mira el pin del bloque
 * y, cuando el scroll cruza un borde del tramo, lleva la página sola de un lado al otro (`volar`, con Lenis), esperando al guardado donde
 * corresponde (`disparoDeLaBajada`, la animación por tiempo del guardado). Mientras dura retiene todos los gestos, y al terminar retiene el
 * resto del gesto que la disparó (la inercia) hasta que empieza otro. No arranca con un viaje del navbar ni con el vuelo de otra sección.
 * [L9b · 3] Llegar bajando a las reseñas armadas las ASIENTA (un vuelo corto al asiento y el resto del gesto retenido); asentada, UN gesto
 * hacia abajo es la ida entera y uno hacia arriba suelta la página. La vuelta desde el CTA termina asentada.
 */
export function useGatilloHaciaElCta(pin: MotionValue<number>, raiz: RefObject<HTMLElement | null>, disparoDeLaBajada: MotionValue<number>): void {
  useEffect(() => {
    const bloque = raiz.current?.closest('[data-pieza="escenario-del-final"]')?.parentElement ?? null
    if (bloque === null || (hayBanco() && (window as VentanaDelBanco).__defectoDelGatilloHaciaElCta === 'apagado')) return undefined
    let etapa: Etapa = 'quieta'
    let antes: number | null = null
    const enVuelo: { current: VueloDelGatillo | null } = { current: null }
    let soltarLosGestos: (() => void) | null = null
    let cola = false
    let vence = 0
    let vivo = true
    let dejarDeEsperar: (() => void) | null = null
    const pantalla = (): number => pin.get() * PIN_CON_LAS_RESENAS
    // El scroll de una pantalla del pin: el bloque se clava de su tope a su pie (`top top` → `bottom bottom`).
    const scrollDe = (s: number): number => {
      const tope = bloque.getBoundingClientRect().top + window.scrollY
      return tope + (s / PIN_CON_LAS_RESENAS) * (bloque.offsetHeight - window.innerHeight)
    }
    const soltar = (): void => {
      soltarLosGestos?.()
      soltarLosGestos = null
    }
    const retener = (): void => {
      soltarLosGestos ??= retenerLosGestos((g) => {
        // [L9b] Asentada: la cola se retiene; un gesto nuevo hacia abajo es la ida, hacia arriba suelta la página.
        if (etapa === 'asentada') {
          const que = gestoAsentado(g.sentido, g.nuevo, cola)
          if (que === 'retener') return true
          cola = false
          if (que === 'ida') {
            ida()
            return true
          }
          etapa = 'quieta'
          soltar()
          return false
        }
        if (etapa !== 'quieta') return true
        // La cola del gesto que disparó (la inercia del trackpad, la rueda que sigue): hasta que empieza otro.
        if (cola && !g.nuevo) return true
        cola = false
        soltar()
        return false
      })
    }
    const terminar = (destino: 'quieta' | 'asentada' = 'quieta'): void => {
      window.clearTimeout(vence)
      dejarDeEsperar?.()
      dejarDeEsperar = null
      etapa = destino
      antes = pantalla()
      cola = true
    }
    // [revisión] Otro se llevó la página (un viaje del navbar, un ancla, la barra): la secuencia se suelta donde está, sin volver.
    const abortar = (): void => {
      const vuelo = enVuelo.current
      enVuelo.current = null
      vuelo?.cancelar()
      terminar()
      cola = false
      soltar()
    }
    const esperar = (listo: (t: number) => boolean, luego: () => void): void => {
      const seguir = (): void => {
        dejarDeEsperar?.()
        dejarDeEsperar = null
        window.clearTimeout(vence)
        if (vivo && etapa !== 'quieta') luego()
      }
      const mirar = (): void => {
        if (listo(disparoDeLaBajada.get())) seguir()
      }
      dejarDeEsperar = disparoDeLaBajada.on('change', mirar)
      vence = window.setTimeout(seguir, GATILLO_HACIA_EL_CTA.esperaMaximaMs)
      mirar()
    }
    const ida = (): void => {
      etapa = 'al-guardado'
      retener()
      volar(enVuelo, scrollDe(LUGARES_DEL_GATILLO.guardado), GATILLO_HACIA_EL_CTA.vueloAlGuardadoMs, () => {
        if (!vivo || etapa !== 'al-guardado') return
        etapa = 'esperando-el-guardado'
        esperar(guardadoSuelto, () => {
          etapa = 'al-cta'
          volar(enVuelo, scrollDe(LUGARES_DEL_GATILLO.cta), GATILLO_HACIA_EL_CTA.vueloAlCtaMs, () => vivo && etapa === 'al-cta' && terminar())
        })
      })
    }
    // [L9b] La vuelta termina asentada en las reseñas (antes: en el fin de la lectura, libre).
    const vuelta = (): void => {
      etapa = 'de-vuelta'
      retener()
      volar(enVuelo, scrollDe(LUGARES_DEL_GATILLO.asiento), GATILLO_HACIA_EL_CTA.vueloDeVueltaMs, () => {
        if (!vivo || etapa !== 'de-vuelta') return
        etapa = 'esperando-la-vuelta'
        esperar(guardadoDeVuelta, () => terminar('asentada'))
      })
    }
    const asentarse = (): void => {
      etapa = 'al-asiento'
      retener()
      volar(enVuelo, scrollDe(LUGARES_DEL_GATILLO.asiento), GATILLO_HACIA_EL_CTA.vueloAlAsientoMs, () => vivo && etapa === 'al-asiento' && terminar('asentada'))
    }
    const alMoverse = (): void => {
      const ahora = pantalla()
      const previa = antes
      antes = ahora
      if (etapa === 'asentada') {
        if (seFueDelAsiento(ahora) || viajeEnCurso() !== null) abortar()
        return
      }
      if (etapa !== 'quieta') {
        const pisado = enVuelo.current !== null && vueloDelGatilloPisado(enVuelo.current, LENIS_DEL_SITIO.instancia)
        if (debeAbortar(ahora, viajeEnCurso() !== null, pisado)) abortar()
        return
      }
      if (previa === null) return
      const cruce = cruceDelGatillo(previa, ahora)
      if (cruce === null || viajeEnCurso() !== null || vueloAjeno(LENIS_DEL_SITIO.instancia, null)) return
      if (cruce === 'asiento') asentarse()
      else if (cruce === 'ida') ida()
      else vuelta()
    }
    antes = pantalla()
    const quitar = pin.on('change', alMoverse)
    if (hayBanco()) (window as VentanaDelBanco).__gatilloHaciaElCtaDelBanco = () => ({ etapa, pantalla: pantalla() })
    return () => {
      vivo = false
      quitar()
      abortar()
      delete (window as VentanaDelBanco).__gatilloHaciaElCtaDelBanco
    }
  }, [pin, raiz, disparoDeLaBajada])
}
