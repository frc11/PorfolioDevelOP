'use client'

import { animate, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useLayoutEffect, useSyncExternalStore, type RefObject } from 'react'

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../../_lib/navegacion'
import { CTA_EN_VIVO, FRASE_DE_VOLUMEN, ctaListo } from '../../../_lib/escena/ctaDelFinal/enVivo'
import { avisarLaVueltaDelCta } from '../../../_lib/escena/resenas/enganches'
import { RESENAS_EN_VIVO } from '../../../_lib/escena/resenas/enVivo'
import { anotarTramo } from '../../../_lib/escena/tramoEstirado'
import { GIROS_DE_LOS_TITULOS } from '../../../_lib/escena/titulos3d/giro'
import { VENTANA_DE_LA_TRANSFORMACION } from '../geometria'
import { estiloDeLaIda, idaDelValor } from './disolucion'
import { HACIA_EL_CTA, aperturaDelHueco, bajadaDeLasResenas, cruceDeLaVuelta, objetivoDeLaBajada, progresoDelGatillo } from './haciaElCta'
import { GATILLO, TITULOS_DE_LAS_RESENAS, angulosDelGiro, avanceDeLasResenas, estadoDelAvance, objetivoDelGatillo, pinSinLasResenas, tramoDeLasResenas, varianteDeLaBandera, type VarianteDeLasResenas } from './tramo'

const sinCambios = (): (() => void) => () => undefined
const deLaUrl = (): string => {
  const q = new URLSearchParams(window.location.search)
  return varianteDeLaBandera(q.get('resenas'))
}

/** Las banderas de las reseñas, leídas después de hidratar (el servidor pinta la de por defecto). */
export function useBanderasDeLasResenas(): { readonly variante: VarianteDeLasResenas } {
  const variante = useSyncExternalStore(sinCambios, deLaUrl, () => 'gatillo')
  return { variante: varianteDeLaBandera(variante) }
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
 * [B3] Y después del tramo, con el progreso de la transformación al CTA: la bajada de las placas y el anillo del piso (`haciaElCta.ts`), el
 * título de las reseñas que el CTA toma desde que arranca, y el enganche de B9 en el momento en que el título se vuelve el CTA.
 */
export function useTramoDeLasResenas(pin: MotionValue<number>, raiz: RefObject<HTMLElement | null>, variante: VarianteDeLasResenas): MotionValue<number> {
  const avance = useTransform(pin, avanceDeLasResenas)
  const disparo = useMotionValue(0)
  const disparoDeLaBajada = useMotionValue(0)
  const giro = useMotionValue(0)

  // Las mitades de las reseñas arrancan de espaldas ANTES de que se anoten (los efectos de los hijos corren después de éste).
  useLayoutEffect(() => {
    for (const id of TITULOS_DE_LAS_RESENAS) GIROS_DE_LOS_TITULOS.set(id, -Math.PI)
    RESENAS_EN_VIVO.activo = true
    CTA_EN_VIVO.sinLosValores = true
    return () => {
      CTA_EN_VIVO.sinLosValores = false
      RESENAS_EN_VIVO.bajada = 0
      RESENAS_EN_VIVO.hueco = 0
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
    let objetivoDeLaBajadaActual: 0 | 1 = 0
    let controlDeLaBajada: ReturnType<typeof animate> | null = null
    // El progreso del cuadro anterior (al montarse, ninguno: cargar ya pasado el momento no es un cruce).
    let antes: number | null = null
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
      // [B3] La transformación al CTA (su progreso, con el pin de siempre): la bajada por el anillo, a la par del giro del cartel.
      const V = VENTANA_DE_LA_TRANSFORMACION
      const p = Math.min(1, Math.max(0, (pinSinLasResenas(pin.get()) - V.desde) / (V.hasta - V.desde)))
      if (variante === 'gatillo') {
        const siguiente = objetivoDeLaBajada(p, objetivoDeLaBajadaActual)
        if (siguiente !== objetivoDeLaBajadaActual) {
          objetivoDeLaBajadaActual = siguiente
          controlDeLaBajada?.stop()
          controlDeLaBajada = animate(disparoDeLaBajada, siguiente, { duration: HACIA_EL_CTA.gatillo.duracionS * Math.abs(siguiente - disparoDeLaBajada.get()), ease: 'linear' })
        }
      }
      const pb = variante === 'gatillo' ? progresoDelGatillo(disparoDeLaBajada.get()) : p
      RESENAS_EN_VIVO.bajada = bajadaDeLasResenas(pb)
      RESENAS_EN_VIVO.hueco = aperturaDelHueco(pb)
      const cruce = antes === null ? null : cruceDeLaVuelta(antes, p)
      antes = p
      if (cruce !== null) avisarLaVueltaDelCta(cruce)
      // Desde que la transformación arranca, el título de las reseñas lo dibuja el CTA (lo junta en su cartel y lo da vuelta).
      const tomado = p > 0 && ctaListo()
      const a = angulosDelGiro(e.giro)
      for (const id of FRASE_DE_VOLUMEN) GIROS_DE_LOS_TITULOS.set(id, a.frase)
      for (const id of TITULOS_DE_LAS_RESENAS) GIROS_DE_LOS_TITULOS.set(id, tomado ? -Math.PI : a.resenas)
      // Sin WebGL, el título de las reseñas del DOM se va al empezar la transformación (el CTA del DOM llega al final).
      giro.set(e.giro * (1 - Math.min(1, p * 3)))
      // Sin WebGL (o mientras el título no se armó) se lee el DOM: la frase se apaga en la primera mitad del giro.
      if (frase !== null) frase.style.opacity = e.giro <= 0 ? '' : Math.max(0, 1 - e.giro * 2).toFixed(3)
      valores.forEach((el, k) => ponerLaIda(el, idaDelValor(e.disolucion, k)))
    }
    aplicar()
    const quitar = [avance.on('change', aplicar), disparo.on('change', aplicar), pin.on('change', aplicar), disparoDeLaBajada.on('change', aplicar)]
    return () => {
      quitar.forEach((q) => q())
      control?.stop()
      controlDeLaBajada?.stop()
      if (frase !== null) frase.style.opacity = ''
      valores.forEach((el) => ponerLaIda(el, 0))
      for (const id of FRASE_DE_VOLUMEN) GIROS_DE_LOS_TITULOS.delete(id)
    }
  }, [avance, disparo, disparoDeLaBajada, giro, pin, raiz, variante])

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
