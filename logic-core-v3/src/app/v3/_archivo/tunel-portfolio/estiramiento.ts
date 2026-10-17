import { TRAMO_ESTIRADO } from '../../_lib/escena/tramoEstirado'

import { BANDA_DEL_EFECTO } from './geometria'
import { PX_DEL_ARRANQUE_DEL_TUNEL, pantallasExtra, ritmoDe, type RitmoDelAncho } from './ritmo'
import { PX_DEL_TUNEL } from './tunel'

/**
 * [CIERRE] 1C · EL TÚNEL DE ESCRITORIO, LA MISMA ANIMACIÓN Y MÁS LARGA — la tabla medida de heatbureau con sus rampas, sus
 * resortes y su regulador, idéntica, recorrida `k` veces más despacio: el reloj de MÓVIL 2 (`ritmo.ts`) también desde 1024.
 * Las curvas son las mismas en el progreso de la tabla; sólo cambia cuánto scroll ocupan. Antes del túnel el píxel es el
 * mismo (el cartel, la huida, Portfolio) y después va corrido lo que el túnel se estiró: la espera, la salida por el vacío
 * y los demos duran lo mismo.
 *
 *   · `k` es el del producto (`ESTIRAMIENTO_DEL_TUNEL.escritorio`: 1,8 desde [EL ENCASTRE] 1A, que borró la prueba
 *     `tunelk`). Abajo de 1024 manda el del CSS (tablet 1,5, teléfono 2), como siempre.
 *   · El panel crece lo que el túnel se estiró (k − 1 túneles, contados contra 900) y la escena lo DESCUENTA
 *     (`_lib/escena/tramoEstirado.ts`): la tabla de secciones declara el alto sin estirar y, afuera del túnel, el progreso
 *     de la escena es el de siempre (REGLA DE ALTURAS: Portfolio, la frase, la noche y el amanecer no se mueven).
 *   · Con `k = 1` no se estira nada y no se anota nada: el túnel de antes, cuadro a cuadro (s49).
 */

/**
 * Desde 1024 el panel crece lo que el túnel se estiró (su alto de la tabla, el solape incluido, más k − 1 túneles) y se
 * anota a la escena. Abajo lo hace el CSS de la sección (MÓVIL 2) y no se toca. Devuelve cómo dejarlo como estaba.
 */
export function estirarElPanel(panel: Element, ritmo: RitmoDelAncho): () => void {
  if (!(panel instanceof HTMLElement) || ritmo.banda !== BANDA_DEL_EFECTO || !(ritmo.estiramiento > 1)) return () => undefined
  const antes = panel.style.minHeight
  panel.style.minHeight = `calc(var(--alto-minimo-del-panel) + ${(pantallasExtra(ritmo.estiramiento) * 100).toFixed(4)}svh)`
  const tramo = { panel, k: ritmo.estiramiento, arranque: PX_DEL_ARRANQUE_DEL_TUNEL, largo: PX_DEL_TUNEL }
  TRAMO_ESTIRADO.valor = tramo
  return () => {
    panel.style.minHeight = antes
    if (TRAMO_ESTIRADO.valor === tramo) TRAMO_ESTIRADO.valor = null
  }
}

/** El ritmo del túnel que sigue al ancho (lo relee en cada `resize`) con el panel estirado desde 1024. */
export function seguirElRitmo(caja: Element, panel: Element): { readonly actual: () => RitmoDelAncho; readonly soltar: () => void } {
  let ritmo = ritmoDe(caja)
  let soltarElPanel = estirarElPanel(panel, ritmo)
  const leer = (): void => {
    soltarElPanel()
    ritmo = ritmoDe(caja)
    soltarElPanel = estirarElPanel(panel, ritmo)
  }
  window.addEventListener('resize', leer)
  return {
    actual: () => ritmo,
    soltar: () => {
      window.removeEventListener('resize', leer)
      soltarElPanel()
    },
  }
}
