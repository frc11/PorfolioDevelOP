import type { PrimitivasDeCoreografia } from './coreografia'

/**
 * [T0 · 2026-10-22] 11 · 3 · LA VÍA `montaje` DEL VELO HACIA EL HOME — el home se monta UNA vez.
 *
 * El home se sirve quieto (`CompuertaDelHome`: el árbol sin una transformada) y las primitivas animadas entran cuando llega su trozo
 * (`InstaladorDeCoreografia`, con `dynamic`): en ese momento cada `Bloque` cambia de componente y React rehace el contenido de las ocho
 * secciones. En la carga del documento eso pasa detrás del preloader. Llegando por la navegación cliente, con el velo puesto, el home se
 * montaba quieto, después pedía el trozo y se rehacía entero, todo antes de destapar (el tapado entero hacia el home: 551–590 ms en el
 * build, 2240 en el dev). Con el trozo ya en la mano (pedido en reposo desde la página, o al pasar el puntero por un enlace al home:
 * `calentarElDestino`), la compuerta arranca con las primitivas animadas en su primer render: una sola vez, sin el árbol quieto.
 *
 * Sólo en la navegación cliente: en la hidratación el primer render tiene que ser el del servidor (el quieto), y eso no cambia.
 */
let cargadas: PrimitivasDeCoreografia | null = null
let pedido: Promise<PrimitivasDeCoreografia | null> | null = null

/** Pide el trozo de la coreografía animada (una vez; nunca falla) y lo deja a mano para el próximo montaje del home. */
export function precargarLaCoreografia(): Promise<PrimitivasDeCoreografia | null> {
  pedido ??= import('./coreografia-animada')
    .then((m) => {
      cargadas = m.PRIMITIVAS_ANIMADAS
      return cargadas
    })
    .catch(() => null)
  return pedido
}

/** Las primitivas animadas, si ya llegaron (por la precarga o por el instalador de la compuerta); si no, `null`. */
export const coreografiaPrecargada = (): PrimitivasDeCoreografia | null => cargadas

/** El instalador de la compuerta las anota al instalarlas: la próxima vuelta al home ya las tiene. */
export function anotarLaCoreografia(p: PrimitivasDeCoreografia): void {
  cargadas = p
}
