'use client'

import { animate, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useLayoutEffect, useSyncExternalStore, type RefObject } from 'react'

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../../_lib/navegacion'
import { CTA_EN_VIVO, FRASE_DE_VOLUMEN, ctaListo } from '../../../_lib/escena/ctaDelFinal/enVivo'
import { hayBanco } from '../../../_lib/escena/entorno'
import { CAMARA_DEL_GUARDADO } from '../../../_lib/escena/resenas/camaraDelGuardado'
import { avisarLaVueltaDelCta } from '../../../_lib/escena/resenas/enganches'
import { RESENAS_EN_VIVO } from '../../../_lib/escena/resenas/enVivo'
import { anotarTramo } from '../../../_lib/escena/tramoEstirado'
import { CORRIMIENTOS_DE_LOS_TITULOS, GIROS_DE_LOS_TITULOS } from '../../../_lib/escena/titulos3d/giro'
import { TITULOS_DE_VOLUMEN } from '../../../_lib/titulos3d/registro'
import { VENTANA_DE_LA_TRANSFORMACION } from '../geometria'
import { estiloDeLaIda, idaDelValor } from './disolucion'
import { HACIA_EL_CTA, aperturaDelHueco, bajadaDeLasResenas, cruceDeLaVuelta, objetivoDeLaBajada, pesoDeLaCamara, progresoDelGatillo } from './haciaElCta'
import { ESPACIO_ENTRE_LAS_MITADES_EM, GATILLO, TITULOS_DE_LAS_RESENAS, angulosDelGiro, avanceDeLasResenas, controlDeLaBandera, corrimientoConElGiro, corrimientosAlCentro, estadoDelAvance, objetivoDelGatillo, pinSinLasResenas, tramoDeLasResenas, varianteDeLaBandera, type VarianteDeLasResenas } from './tramo'

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

/**
 * [C2-70e] Cuánto se corre cada lado (px) para juntar las mitades al centro: las cajas del DOM de las mitades de las reseñas (los lugares de
 * sus títulos de volumen, sin transformar) y el centro de su capa. `null` si todavía no se pueden medir.
 */
function medirLasMitades(capa: HTMLElement | null): { readonly izquierda: number; readonly derecha: number } | null {
  const i = TITULOS_DE_VOLUMEN.get(TITULOS_DE_LAS_RESENAS[0])?.lugar ?? null
  const d = TITULOS_DE_VOLUMEN.get(TITULOS_DE_LAS_RESENAS[1])?.lugar ?? null
  if (capa === null || i === null || d === null) return null
  const [ri, rd, rc] = [i.getBoundingClientRect(), d.getBoundingClientRect(), capa.getBoundingClientRect()]
  if (ri.width <= 0 || rd.width <= 0) return null
  return corrimientosAlCentro({ desde: ri.left, hasta: ri.right }, { desde: rd.left, hasta: rd.right }, rc.left + rc.width / 2, parseFloat(getComputedStyle(i).fontSize) * ESPACIO_ENTRE_LAS_MITADES_EM)
}

/** [C2-70e] Lo último de cada cuadro, para el banco (`window.__resenasDelBanco`, sólo con un banco mirando). */
const DEL_BANCO = { giro: 0, disolucion: 0, entrada: 0, corrimientos: [0, 0], bajada: 0, disparoDeLaBajada: 0, transformacion: 0, pesoDeLaCamara: 0 }
type VentanaDelBanco = Window & { __resenasDelBanco?: () => typeof DEL_BANCO }

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
      CAMARA_DEL_GUARDADO.peso = 0
      CAMARA_DEL_GUARDADO.bajada = 0
      for (const id of [...TITULOS_DE_LAS_RESENAS, ...FRASE_DE_VOLUMEN]) {
        GIROS_DE_LOS_TITULOS.delete(id)
        CORRIMIENTOS_DE_LOS_TITULOS.delete(id)
      }
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
    // [C2-70e] La bandera de prueba de los bancos (sin ella, nada) y lo que se corre cada lado al juntarse (se mide al empezar el giro).
    const prueba = controlDeLaBandera(new URLSearchParams(window.location.search).get('resenas-control'))
    const capa = raiz.current?.querySelector<HTMLElement>('[data-pieza="titulo-de-las-resenas"]') ?? null
    let lados: { readonly izquierda: number; readonly derecha: number } | null = null
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
      // [C2-70e] Con el gatillo, la cámara acompaña el guardado (se queda en B mirando al hueco) y suelta cuando ya no queda ninguna placa.
      CAMARA_DEL_GUARDADO.peso = variante === 'gatillo' && prueba !== 'sin-camara' ? pesoDeLaCamara(disparoDeLaBajada.get(), p) : 0
      CAMARA_DEL_GUARDADO.bajada = RESENAS_EN_VIVO.bajada
      const cruce = antes === null ? null : cruceDeLaVuelta(antes, p)
      antes = p
      if (cruce !== null) avisarLaVueltaDelCta(cruce)
      // Desde que la transformación arranca, el título de las reseñas lo dibuja el CTA (lo junta en su cartel y lo da vuelta).
      const tomado = p > 0 && ctaListo()
      const a = angulosDelGiro(e.giro)
      for (const id of FRASE_DE_VOLUMEN) GIROS_DE_LOS_TITULOS.set(id, a.frase)
      for (const id of TITULOS_DE_LAS_RESENAS) GIROS_DE_LOS_TITULOS.set(id, tomado ? -Math.PI : a.resenas)
      // [C2-70e] Las mitades se juntan en el medio mientras se dan vuelta (la misma curva que el ángulo); la frase, su otra cara, con ellas.
      if (e.giro <= 0) lados = null
      else if (lados === null) lados = medirLasMitades(capa)
      const entero = lados === null || prueba === 'sin-juntar' ? { izquierda: 0, derecha: 0 } : lados
      const [izquierda, derecha] = [corrimientoConElGiro(entero.izquierda, e.giro), corrimientoConElGiro(entero.derecha, e.giro)]
      CORRIMIENTOS_DE_LOS_TITULOS.set(TITULOS_DE_LAS_RESENAS[0], izquierda).set(FRASE_DE_VOLUMEN[0], izquierda)
      CORRIMIENTOS_DE_LOS_TITULOS.set(TITULOS_DE_LAS_RESENAS[1], derecha).set(FRASE_DE_VOLUMEN[1], derecha)
      Object.assign(DEL_BANCO, { giro: e.giro, disolucion: e.disolucion, entrada: e.entrada, corrimientos: [izquierda, derecha], bajada: RESENAS_EN_VIVO.bajada, disparoDeLaBajada: disparoDeLaBajada.get(), transformacion: p, pesoDeLaCamara: CAMARA_DEL_GUARDADO.peso })
      // Sin WebGL, el título de las reseñas del DOM se va al empezar la transformación (el CTA del DOM llega al final).
      giro.set(e.giro * (1 - Math.min(1, p * 3)))
      // Sin WebGL (o mientras el título no se armó) se lee el DOM: la frase se apaga en la primera mitad del giro.
      if (frase !== null) frase.style.opacity = e.giro <= 0 ? '' : Math.max(0, 1 - e.giro * 2).toFixed(3)
      valores.forEach((el, k) => ponerLaIda(el, idaDelValor(e.disolucion, k)))
    }
    aplicar()
    const quitar = [avance.on('change', aplicar), disparo.on('change', aplicar), pin.on('change', aplicar), disparoDeLaBajada.on('change', aplicar)]
    // [C2-70e] Con otro tamaño las mitades miden otra cosa: se vuelven a medir.
    const alCambiarElTamano = (): void => {
      lados = null
      aplicar()
    }
    window.addEventListener('resize', alCambiarElTamano)
    if (hayBanco()) (window as VentanaDelBanco).__resenasDelBanco = () => ({ ...DEL_BANCO })
    return () => {
      quitar.forEach((q) => q())
      window.removeEventListener('resize', alCambiarElTamano)
      delete (window as VentanaDelBanco).__resenasDelBanco
      control?.stop()
      controlDeLaBajada?.stop()
      if (frase !== null) frase.style.opacity = ''
      valores.forEach((el) => ponerLaIda(el, 0))
      CAMARA_DEL_GUARDADO.peso = 0
      for (const id of FRASE_DE_VOLUMEN) GIROS_DE_LOS_TITULOS.delete(id)
      for (const id of [...TITULOS_DE_LAS_RESENAS, ...FRASE_DE_VOLUMEN]) CORRIMIENTOS_DE_LOS_TITULOS.delete(id)
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
