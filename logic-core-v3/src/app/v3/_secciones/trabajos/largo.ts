import { TRAMO_ESTIRADO } from '../../_lib/escena/tramoEstirado'

import { pxDelTunelEn } from './geometria'
import { PX_DEL_ARRANQUE_DEL_TUNEL, progresoDeLaTabla, ritmoDe, ritmoDelValor, type RitmoDelAncho } from './ritmo'
import { ANCHO_DEL_LIMITE, CAPAS_DEL_TUNEL, FRACCION_DEL_ROTULO, ORIGEN_DEL_TUNEL, PX_DEL_TUNEL, poseDelTunel } from './tunel'

/**
 * [AJUSTES FINALES] B1 · `?pruebas=tunel=largo` — LA PROFUNDIDAD LINEAL QUE SE ALCANZA A LEER. Medido con
 * `tunel=constante`: cada proyecto se lee (de su rótulo entero, 0,3937 del cuadro, a llenarlo) ~0,1–0,2 s, porque a
 * velocidad constante en profundidad lo lejano tarda y lo cercano explota: naciendo al 2 %, la banda legible es el 3 % del
 * recorrido de cada proyecto, y estirar la sección hasta 1,5 s pedía ~18 veces el túnel. Así que esta variante cambia
 * TRES cosas, y las tres son del pedido:
 *
 *   · LINEAL, pero naciendo más cerca: cada proyecto nace en su arranque de la TABLA (el de la referencia: uno dentro del
 *     otro, como siempre), crece en recta de escala hasta `semilla` de su tamaño final en `rampaPx` (el nacimiento, para
 *     no aparecer de golpe) y de ahí avanza a velocidad constante en profundidad (1 / ancho recta en el scroll) hasta su
 *     tope de la tabla, con su tamaño final. Desde el fin del túnel la pose es la de la tabla.
 *   · TOPE DE VELOCIDAD: lo mostrado va sin resortes, a lo sumo a la velocidad máxima del efecto (como `tunel=tope`).
 *   · MÁS ALTO DE SECCIÓN: el túnel se estira `ESTIRAMIENTO_LARGO` (el reloj de MÓVIL 2, `ritmo.ts`, ahora también en
 *     escritorio) y el panel de Trabajos crece lo mismo; la escena lo descuenta (`escena/tramoEstirado.ts`), así nada de
 *     lo que viene después se corre. El factor SALE de la cuenta: el proyecto que menos se lee, legible `legibleS` con un
 *     scroll normal (`scrollNormalPxS`, el del banco de B1).
 */
export const TUNEL_LARGO = { semilla: 0.2, rampaPx: 60, legibleS: 1.5, scrollNormalPxS: 400 } as const

/** Lo que mide cada proyecto al final de la tabla (su cadena, en anchos de cuadro). */
const FINAL = poseDelTunel(PX_DEL_TUNEL).anchos

/** Lo que mide el proyecto `indice` en pantalla (anchos de cuadro) en el píxel `y` de la regla, con la ley larga. */
export function anchoLargo(indice: number, y: number): number {
  const capa = CAPAS_DEL_TUNEL.proyectos[indice]
  if (capa === undefined) throw new Error(`proyecto inválido: ${String(indice)}`)
  const final = FINAL[indice]
  const nace = TUNEL_LARGO.semilla * final
  const finDeLaRampa = capa.arranca + TUNEL_LARGO.rampaPx
  if (y <= capa.arranca) return 0
  if (y < finDeLaRampa) return (nace * (y - capa.arranca)) / TUNEL_LARGO.rampaPx
  if (y >= capa.topa) return final
  const u = (y - finDeLaRampa) / (capa.topa - finDeLaRampa)
  return 1 / (1 / nace + (1 / final - 1 / nace) * u)
}

/** En qué píxel del túnel (desde su origen) el proyecto llega a medir `ancho` con la ley larga (la inversa, cerrada). */
export function pxParaQueMidaLargo(indice: number, ancho: number): number {
  const capa = CAPAS_DEL_TUNEL.proyectos[indice]
  if (capa === undefined) throw new Error(`proyecto inválido: ${String(indice)}`)
  const final = FINAL[indice]
  const nace = TUNEL_LARGO.semilla * final
  if (ancho > final) return PX_DEL_TUNEL
  if (!(ancho > 0)) return capa.arranca - ORIGEN_DEL_TUNEL
  if (ancho <= nace) return capa.arranca + (TUNEL_LARGO.rampaPx * ancho) / nace - ORIGEN_DEL_TUNEL
  const finDeLaRampa = capa.arranca + TUNEL_LARGO.rampaPx
  const u = (1 / ancho - 1 / nace) / (1 / final - 1 / nace)
  return finDeLaRampa + u * (capa.topa - finDeLaRampa) - ORIGEN_DEL_TUNEL
}

/** Cuántos px de la regla se lee el proyecto: de su rótulo entero (`FRACCION_DEL_ROTULO`) a llenar el cuadro. */
export function pxLegibleLargo(indice: number): number {
  return pxParaQueMidaLargo(indice, ANCHO_DEL_LIMITE) - pxParaQueMidaLargo(indice, FRACCION_DEL_ROTULO)
}

/** El estiramiento: el que deja al proyecto menos legible `legibleS` con `scrollNormalPxS` (redondeado hacia arriba). */
export const ESTIRAMIENTO_LARGO =
  Math.ceil((100 * TUNEL_LARGO.legibleS * TUNEL_LARGO.scrollNormalPxS) / Math.min(...CAPAS_DEL_TUNEL.proyectos.map((_, i) => pxLegibleLargo(i)))) / 100

/** El alto que el panel suma con el túnel estirado (svh): lo que el túnel se alargó, contado contra 900 como todo. */
export const SVH_DEL_ALARGUE = ((ESTIRAMIENTO_LARGO - 1) * PX_DEL_TUNEL) / 9

/**
 * El ritmo del túnel con la prueba: abajo de 1024 el CSS ya estira (tablet, teléfono) y manda lo que diga; en escritorio
 * no hay variable y el túnel usa `ESTIRAMIENTO_LARGO`, con la banda del túnel estirado.
 */
export function ritmoLargo(el: Element): RitmoDelAncho {
  const css = ritmoDe(el)
  return css.estiramiento > 1 ? css : ritmoDelValor(String(ESTIRAMIENTO_LARGO))
}

/** ¿La primera foto ya tapa el cuadro? Con la ley larga y el reloj estirado (el título de volumen sólo existe en escritorio). */
export function primeraFotoTapaLarga(progreso: number): boolean {
  return anchoLargo(0, pxDelTunelEn(progresoDeLaTabla(progreso, ESTIRAMIENTO_LARGO)) + ORIGEN_DEL_TUNEL) >= 1.02
}

/**
 * Alarga el panel de Trabajos en escritorio (su `min-height` en línea suma `SVH_DEL_ALARGUE`) y anota el tramo estirado
 * para la escena; abajo de 1024 lo deja como estaba (ahí estira el CSS de la sección). La sección no mide el ancho
 * (`s7-contrato`): lee lo que el CSS ya decidió —sin estiramiento en su variable, es escritorio—, y lo relee al cambiar el
 * tamaño de la ventana.
 */
export function alargarElPanel(): void {
  const panel = document.querySelector<HTMLElement>('[data-panel="trabajos"]')
  if (panel === null) return
  const antes = panel.style.minHeight
  const seccion = panel.querySelector('[data-pinneado]') ?? panel
  const aplicar = (): void => {
    if (ritmoDe(seccion).estiramiento === 1) {
      panel.style.minHeight = `calc(var(--alto-minimo-del-panel) + ${SVH_DEL_ALARGUE.toFixed(4)}svh)`
      TRAMO_ESTIRADO.valor = { panel, k: ESTIRAMIENTO_LARGO, arranque: PX_DEL_ARRANQUE_DEL_TUNEL, largo: PX_DEL_TUNEL }
    } else {
      panel.style.minHeight = antes
      TRAMO_ESTIRADO.valor = null
    }
  }
  aplicar()
  window.addEventListener('resize', aplicar)
}
