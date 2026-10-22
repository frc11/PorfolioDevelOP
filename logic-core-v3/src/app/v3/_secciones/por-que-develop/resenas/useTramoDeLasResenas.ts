'use client'

import { animate, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useLayoutEffect, useSyncExternalStore, type RefObject } from 'react'

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../../_lib/navegacion'
import { FRASE_DE_VOLUMEN } from '../../../_lib/escena/ctaDelFinal/enVivo'
import { RESENAS_EN_VIVO } from '../../../_lib/escena/resenas/enVivo'
import { anotarTramo } from '../../../_lib/escena/tramoEstirado'
import { GIROS_DE_LOS_TITULOS } from '../../../_lib/escena/titulos3d/giro'
import { estiloDeLaIda, idaDelValor } from './disolucion'
import { GATILLO, TITULOS_DE_LAS_RESENAS, angulosDelGiro, arrastreDeLaBandera, avanceDeLasResenas, estadoDelAvance, objetivoDelGatillo, tramoDeLasResenas, varianteDeLaBandera, type VarianteDeLasResenas } from './tramo'

const sinCambios = (): (() => void) => () => undefined
const deLaUrl = (): string => {
  const q = new URLSearchParams(window.location.search)
  return `${varianteDeLaBandera(q.get('resenas'))}|${String(arrastreDeLaBandera(q.get('resenas-arrastre')))}`
}

/** Las banderas de las reseñas, leídas después de hidratar (el servidor pinta la de por defecto). */
export function useBanderasDeLasResenas(): { readonly variante: VarianteDeLasResenas; readonly arrastre: boolean } {
  const [variante, arrastre] = useSyncExternalStore(sinCambios, deLaUrl, () => 'scroll|false').split('|')
  return { variante: varianteDeLaBandera(variante), arrastre: arrastre === 'true' }
}

/** Lo último que se le escribió a cada valor (para escribir sólo si cambió). */
const IDAS = new WeakMap<HTMLElement, string>()

/** Escribe la ida en un valor sólo si cambió; sin ida, lo deja como estaba (sin nada escrito). */
function ponerLaIda(el: HTMLElement, u: number): void {
  const e = estiloDeLaIda(u)
  const firma = e === null ? '' : `${e.opacity}|${e.filter}|${e.translate}`
  if ((IDAS.get(el) ?? '') === firma) return
  IDAS.set(el, firma)
  el.style.opacity = e?.opacity ?? ''
  el.style.filter = e?.filter ?? ''
  el.style.translate = e?.translate ?? ''
  el.style.scale = e?.scale ?? ''
}

/**
 * [NOCTURNO B2] EL TRAMO DE LAS RESEÑAS, del lado del DOM — con el pin del bloque (el que incluye el tramo): el avance, el estado (con la
 * bandera, el gatillo por tiempo), y lo que se escribe en cada cambio: la entrada del aro (para la escena), el giro de las cuatro mitades de
 * título (`GIROS_DE_LOS_TITULOS`), la ida de los seis valores y el cruce del DOM (sin WebGL, los textos). Anota el tramo para la escena
 * (REGLA DE ALTURAS) y lo vuelve a anotar al cambiar el tamaño. Devuelve el giro (para el cruce del título del DOM).
 */
export function useTramoDeLasResenas(pin: MotionValue<number>, raiz: RefObject<HTMLElement | null>, variante: VarianteDeLasResenas): MotionValue<number> {
  const avance = useTransform(pin, avanceDeLasResenas)
  const disparo = useMotionValue(0)
  const giro = useMotionValue(0)

  // Las mitades de las reseñas arrancan de espaldas ANTES de que se anoten (los efectos de los hijos corren después de éste).
  useLayoutEffect(() => {
    for (const id of TITULOS_DE_LAS_RESENAS) GIROS_DE_LOS_TITULOS.set(id, -Math.PI)
    RESENAS_EN_VIVO.activo = true
    return () => {
      for (const id of [...TITULOS_DE_LAS_RESENAS, ...FRASE_DE_VOLUMEN]) GIROS_DE_LOS_TITULOS.delete(id)
      RESENAS_EN_VIVO.activo = false
      RESENAS_EN_VIVO.entrada = 0
      RESENAS_EN_VIVO.senalada = -1
    }
  }, [])

  useEffect(() => {
    const escenario = raiz.current?.closest<HTMLElement>('[data-pieza="escenario-del-final"]') ?? null
    if (escenario === null) return undefined
    const valores = [...escenario.querySelectorAll<HTMLElement>('[data-pieza="valor-en-volumen"]')]
    const frase = escenario.querySelector<HTMLElement>('[data-pieza="frase-del-final"]')
    let objetivo: 0 | 1 = 0
    let control: ReturnType<typeof animate> | null = null
    const aplicar = (): void => {
      const r = avance.get()
      if (variante === 'gatillo') {
        const siguiente = objetivoDelGatillo(r, objetivo)
        if (siguiente !== objetivo) {
          objetivo = siguiente
          control?.stop()
          control = animate(disparo, objetivo, { duration: GATILLO.duracionS * Math.abs(objetivo - disparo.get()), ease: 'linear' })
        }
      }
      const e = estadoDelAvance(r, variante === 'gatillo' ? disparo.get() : null)
      RESENAS_EN_VIVO.entrada = e.entrada
      const a = angulosDelGiro(e.giro)
      for (const id of FRASE_DE_VOLUMEN) GIROS_DE_LOS_TITULOS.set(id, a.frase)
      for (const id of TITULOS_DE_LAS_RESENAS) GIROS_DE_LOS_TITULOS.set(id, a.resenas)
      giro.set(e.giro)
      // Sin WebGL (o mientras el título no se armó) se lee el DOM: la frase se apaga en la primera mitad del giro.
      if (frase !== null) frase.style.opacity = e.giro <= 0 ? '' : Math.max(0, 1 - e.giro * 2).toFixed(3)
      valores.forEach((el, k) => ponerLaIda(el, idaDelValor(e.disolucion, k)))
    }
    aplicar()
    const quitar = [avance.on('change', aplicar), disparo.on('change', aplicar)]
    return () => {
      quitar.forEach((q) => q())
      control?.stop()
      if (frase !== null) frase.style.opacity = ''
      valores.forEach((el) => ponerLaIda(el, 0))
      for (const id of FRASE_DE_VOLUMEN) GIROS_DE_LOS_TITULOS.delete(id)
    }
  }, [avance, disparo, giro, raiz, variante])

  // REGLA DE ALTURAS: la escena no ve el tramo (lo ve como `LARGO_SIN_ESTIRAR_PX` de la regla).
  useEffect(() => {
    const el = raiz.current
    const panel = el?.closest('[data-panel]') ?? null
    const bloque = el?.closest('[data-pieza="escenario-del-final"]')?.parentElement ?? null
    if (panel === null || bloque === null) return undefined
    let soltar: (() => void) | null = null
    const anotar = (): void => {
      soltar?.()
      const escala = window.innerHeight / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
      const corrido = escala > 0 ? (bloque.getBoundingClientRect().top - panel.getBoundingClientRect().top) / escala : 0
      soltar = anotarTramo(tramoDeLasResenas(panel, corrido))
    }
    anotar()
    window.addEventListener('resize', anotar)
    return () => {
      window.removeEventListener('resize', anotar)
      soltar?.()
    }
  }, [raiz])

  return giro
}
