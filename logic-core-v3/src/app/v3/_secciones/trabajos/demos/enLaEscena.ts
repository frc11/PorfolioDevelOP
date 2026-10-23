import { preconectarLasDemos } from './precarga'

/**
 * [C2-41e] DEMOS A LA VISTA — lo que la capa le avisa a la red cuando la llegada de Demos arranca (lo pedido por el scroll pasa de
 * 0): las cinco demos se preconectan (`preconectarLasDemos`, una vez), desde 1024 (con el escenario pegado del Portfolio, donde la demo
 * se abre en la ventana; abajo de 1024 se abre en otra pestaña).
 *
 * (La franja clara de abajo de la primera pantalla de Demos era la rampa del revelado de la salida: `_lib/escena/revelado.ts`.)
 */
export function anunciarDemos(pedida: number, escritorio: boolean): void {
  if (pedida > 0 && escritorio) preconectarLasDemos()
}
