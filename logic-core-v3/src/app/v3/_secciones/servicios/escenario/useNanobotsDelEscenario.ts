'use client'

import type { MotionValue } from 'motion/react'
import { useEffect, useRef, type RefObject } from 'react'

import { conElDefectoDeLosGatillos } from '../../../_componentes/gatillos/defectos'
import { hayBanco } from '../../../_lib/escena/entorno'
import type { Caja } from '../../../_lib/nanobots/capa'
import { montarElEnjambre } from '../../../_lib/nanobots/montaje'
import { extensionDeLaOrbita, proporcionDeLaCaja, unidadDelLugar } from '../../../_lib/nanobots/simbolos'
import type { ColorDelAro } from './banderas'
import type { CambioDeCapa } from './useCoreografiaDelEscenario'
import { avanceDelPanel, gDelAvance, inicioDelPanel, posicionDelEnjambre } from './tiempos'

/**
 * [B4] LOS NANOBOTS DEL ESCENARIO — el motor llega perezoso (three no entra al paquete de la página: `enjambreDeServicios` y
 * `capa` se importan recién al montar) y corre con el lazo de C4 (`montarElEnjambre`: pausa fuera de pantalla y con la pestaña oculta,
 * el desarme bajo el mouse). La posición que lee es la del escenario (`posicionDelEnjambre`): no tiene reloj propio.
 *
 * Mide en el layout (sin transformadas) el lugar de cada estado (`[data-lugar-de-los-nanobots]`) y, al arrancar cada transición entre
 * la entrada y web, las cajas del título (`[data-caja-del-titulo]`, sus renglones) para calcular el cambio de capa (`capa.ts`): en
 * qué `g` y desde cuándo puede entrar el panel. Lo escribe en `cambio`, que lee la coreografía.
 *
 * Con banco (`hayBanco()`), `window.__capaDeLosNanobots`: el cambio calculado y, cuadro a cuadro durante esa transición, la capa del
 * lienzo y cuántos píxeles con nanobots hay sobre el título y sobre el panel (leídos de la GPU en el mismo cuadro). El banco
 * (`scripts-carga/servicios-capa.ts`) exige 0 y 0 en los cuadros del cambio.
 */

export interface RegistroDeLaCapa {
  readonly t: number
  readonly p: number
  readonly capa: string | null
  readonly titulo: number
  readonly panel: number
}

/** Un elemento, en px del escenario, por el layout: las transformadas (el panel afuera, la entrada) no cuentan. */
function enElEscenario(el: HTMLElement, escenario: HTMLElement): Caja {
  let x = 0
  let y = 0
  let nodo: HTMLElement | null = el
  while (nodo !== null && nodo !== escenario) {
    x += nodo.offsetLeft
    y += nodo.offsetTop
    nodo = nodo.offsetParent instanceof HTMLElement ? nodo.offsetParent : null
  }
  return { izquierda: x, arriba: y, derecha: x + el.offsetWidth, abajo: y + el.offsetHeight }
}

/** Las cajas de los renglones del título, en px del escenario (el título ya llegó: su transformada es cero). */
function cajasDelTitulo(escenario: HTMLElement): Caja[] {
  const base = escenario.getBoundingClientRect()
  return [...escenario.querySelectorAll<HTMLElement>('[data-caja-del-titulo]')].flatMap((el) =>
    [...el.getClientRects()].map((r) => ({ izquierda: r.left - base.left, arriba: r.top - base.top, derecha: r.right - base.left, abajo: r.bottom - base.top })),
  )
}

export function useNanobotsDelEscenario(o: {
  readonly escenario: RefObject<HTMLElement | null>
  readonly lienzo: RefObject<HTMLCanvasElement | null>
  readonly posicion: MotionValue<number>
  readonly reducido: boolean
  readonly puntos: number
  readonly cambio: { current: CambioDeCapa }
  /** [L3] `?aro-color=`. */
  readonly colorDelAro: ColorDelAro
}): void {
  const { escenario, lienzo, posicion, reducido, puntos, cambio, colorDelAro } = o
  const quieto = useRef(reducido)
  useEffect(() => {
    quieto.current = reducido
  }, [reducido])

  useEffect(() => {
    const c = lienzo.current
    const esc = escenario.current
    if (c === null || esc === null) return undefined
    let vivo = true
    let soltar: (() => void) | null = null
    void Promise.all([import('../../../_lib/nanobots/enjambreDeServicios'), import('../../../_lib/nanobots/capa')])
      .then(([motor, capa]) => {
        if (!vivo) return
        const enjambre = motor.crearEnjambreDeServicios(c, puntos, colorDelAro)
        const lugares = (): Caja[] =>
          [0, 1, 2, 3].map((k) => {
            const el = esc.querySelector<HTMLElement>(`[data-lugar-de-los-nanobots="${String(k)}"]`)
            return el === null ? { izquierda: 0, arriba: 0, derecha: 0, abajo: 0 } : enElEscenario(el, esc)
          })
        const ubicar = (): ReturnType<typeof capa.cambioDeCapa> => {
          const ex = enjambre.extensiones
          // [C2-50] La órbita (0) llena su caja con la elipse; su cota para el truco de profundidad es la de su ancho.
          // [L3] La elipse llena su caja: su proporción (alto / ancho) es la de la caja (horizontal en escritorio, vertical en el teléfono).
          const ls = lugares().map((b, k) => {
            const [ancho, alto] = [b.derecha - b.izquierda, b.abajo - b.arriba]
            return { x: (b.izquierda + b.derecha) / 2, y: (b.arriba + b.abajo) / 2, unidad: unidadDelLugar(k, ancho, alto, ex[k] ?? 1), extension: k === 0 ? extensionDeLaOrbita(proporcionDeLaCaja(ancho, alto)) : (ex[k] ?? 1), proporcion: k === 0 ? proporcionDeLaCaja(ancho, alto) : undefined }
          })
          enjambre.ubicar(ls)
          const [desde, hacia] = [ls[0], ls[1]]
          if (desde === undefined || hacia === undefined) return null
          const calculado = capa.cambioDeCapa(desde, hacia, cajasDelTitulo(esc))
          const g = calculado === null ? 0.5 : gDelAvance(calculado.avance)
          cambio.current = { g, inicioDelPanel: calculado === null ? cambio.current.inicioDelPanel : inicioDelPanel(g, calculado.bordeDelPanel, esc.clientWidth) }
          // El defecto del banco: el cambio apenas arranca el traspaso (la nube todavía detrás del título).
          if (conElDefectoDeLosGatillos('capa-a-destiempo')) cambio.current = { ...cambio.current, g: 0.02 }
          return calculado
        }
        let calculado = ubicar()
        const observador = new ResizeObserver(() => {
          calculado = ubicar()
        })
        observador.observe(esc)
        let antes = posicion.get()
        const banco = hayBanco()
        const registros: RegistroDeLaCapa[] = []
        const cajaDelPanel = (p: number): Caja => ({ izquierda: 0, arriba: 0, derecha: esc.clientWidth * avanceDelPanel(Math.min(1, Math.max(0, p)), cambio.current.inicioDelPanel), abajo: esc.clientHeight })
        const dejarDeEscuchar = posicion.on('change', (p) => {
          // Al arrancar una transición entre la entrada y web (en cualquier sentido), el cambio se recalcula con el título quieto.
          if ((antes === 0 || antes === 1) && p > 0 && p < 1) calculado = ubicar()
          antes = p
          if (banco) enjambre.diagnostico.cajas = p > 0 && p < 1 ? [...cajasDelTitulo(esc), cajaDelPanel(p)] : null
        })
        const ventana = window as Window & { __capaDeLosNanobots?: unknown; __escenarioDeServicios?: unknown }
        if (banco) {
          enjambre.diagnostico.registrar = (pixeles) => {
            const p = posicion.get()
            if (!(p > 0 && p < 1) || registros.length > 2000) return
            registros.push({ t: performance.now(), p, capa: c.getAttribute('data-capa'), titulo: pixeles.slice(0, -1).reduce((s, n) => s + n, 0), panel: pixeles[pixeles.length - 1] ?? 0 })
          }
          ventana.__capaDeLosNanobots = { cambio: () => ({ ...cambio.current, calculado }), registros, vaciar: () => registros.splice(0) }
          // [L3] El banco del gesto rápido (`l3-servicios.ts`): la posición, la del enjambre y el centroide de sus píxeles, cuadro a cuadro.
          enjambre.diagnostico.medirElCentroide = true
          ventana.__escenarioDeServicios = { posicion: () => posicion.get(), posicionDelEnjambre: () => posicionDelEnjambre(posicion.get()), centroide: () => enjambre.diagnostico.centroide }
        }
        const desmontar = montarElEnjambre(c, enjambre, { get: () => posicionDelEnjambre(posicion.get()) }, quieto, { listo: () => undefined, perdido: () => undefined })
        soltar = () => {
          observador.disconnect()
          dejarDeEscuchar()
          desmontar()
          if (banco) {
            delete ventana.__capaDeLosNanobots
            delete ventana.__escenarioDeServicios
          }
        }
      })
      // Sin WebGL (o sin el módulo): la sección sigue, sin nanobots.
      .catch(() => undefined)
    return () => {
      vivo = false
      soltar?.()
    }
  }, [escenario, lienzo, posicion, puntos, cambio, colorDelAro])
}
