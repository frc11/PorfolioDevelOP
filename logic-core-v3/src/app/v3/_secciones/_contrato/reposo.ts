import { seguirElScroll } from '../../_lib/scrollEnMovimiento'
import { ASIENTO } from '../../_lib/titulos3d/repeticiones'
import { aLaVistaEn } from './disparo'

/**
 * [P-H25] LA GUARDA EN REPOSO DEL GATILLO — con el scroll quieto, avisa si la caja asoma en el cuadro, para que lo que quedó a la vista
 * sin cruzar la línea se dispare y nada quede en pantalla con opacidad 0.
 *
 * Escucha con el escucha compartido del home (`_lib/scrollEnMovimiento.ts`, que arranca como después de un movimiento: el primer reposo
 * llega aunque la página no se mueva) y espera el quieto del asiento (`ASIENTO.quietoMs`). Quien la usa la arranca con el primer aviso
 * de su observador, para que el primer reposo encuentre el estado de carga. Lo que se mide es la caja observada, que nunca se mueve.
 * Devuelve cómo soltarla.
 */
export function vigilarElReposo(caja: Element, alReposar: (aLaVista: boolean) => void): () => void {
  return seguirElScroll(
    ASIENTO.quietoMs,
    () => undefined,
    () => alReposar(aLaVistaEn(caja.getBoundingClientRect(), window.innerHeight)),
  )
}
