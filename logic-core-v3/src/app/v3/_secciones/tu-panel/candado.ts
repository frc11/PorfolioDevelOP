/**
 * [B6] EL CANDADO DE LA RUEDA DE UN MÓDULO — que el scroll y el mouse no se peleen (GUSTO).
 *
 * Con la rueda encima de un módulo, scrollea la PÁGINA (no el módulo) y aparece el cartel sobre el módulo, con su fondo
 * atenuado. El clic habilita el scroll de adentro (y entonces la rueda es del módulo: la página no se mueve, ni en el borde del
 * contenido); salir del módulo lo vuelve a bloquear. En el teléfono, lo mismo con el
 * dedo: arrastrar sobre el módulo mueve la página y muestra el cartel; un toque lo habilita; tocar afuera (o que el módulo
 * salga del cuadro) lo bloquea.
 *
 * La máquina es pura (la barren las pruebas); `Tarjeta.tsx` la conecta a los eventos y `_panel-vivo/rueda.ts` la cumple:
 * bloqueado, el contenido del panel no se mueve (`overflow` oculto) y nunca lleva `data-lenis-prevent`, así que la rueda la
 * toma Lenis (o el navegador) y mueve la página.
 */

/** Qué cartel se ve: el del ratón («Hacé clic…») o el del dedo («Tocá…»). */
export type ModoDelCartel = 'raton' | 'tactil'

export interface EstadoDelCandado {
  /** El scroll de adentro está habilitado. */
  readonly libre: boolean
  /** El cartel a la vista, o ninguno. */
  readonly cartel: ModoDelCartel | null
}

export type EventoDelCandado =
  /** La rueda sobre el módulo. */
  | { readonly tipo: 'rueda' }
  /** El dedo arrastrando sobre el módulo. */
  | { readonly tipo: 'arrastre' }
  /** Un clic o un toque adentro. */
  | { readonly tipo: 'clic' }
  /** El puntero salió, se tocó afuera, o el módulo salió del cuadro (bloquea lo habilitado; el cartel se va solo). */
  | { readonly tipo: 'salida' }
  /** Pasó el tiempo del cartel sin otra rueda. */
  | { readonly tipo: 'olvido' }

export const CANDADO_INICIAL: EstadoDelCandado = { libre: false, cartel: null }

/** Cuánto se queda el cartel después de la última rueda (ms). */
export const CARTEL_MS = 1400

export function siguienteCandado(estado: EstadoDelCandado, evento: EventoDelCandado): EstadoDelCandado {
  switch (evento.tipo) {
    // Sin cambio, el MISMO estado: una rueda (o un arrastre) llega muchas veces por gesto y no vuelve a dibujar nada.
    case 'rueda':
      return estado.libre || estado.cartel === 'raton' ? estado : { libre: false, cartel: 'raton' }
    case 'arrastre':
      return estado.libre || estado.cartel === 'tactil' ? estado : { libre: false, cartel: 'tactil' }
    case 'clic':
      return estado.libre && estado.cartel === null ? estado : { libre: true, cartel: null }
    // Salir bloquea lo habilitado. Bloqueado, el cartel no se corta: la página que se mueve saca el módulo de abajo del ratón
    // (y eso es un `pointerleave`), así que se va solo, con su tiempo y su fundido.
    case 'salida':
      return estado.libre ? CANDADO_INICIAL : estado
    case 'olvido':
      return estado.cartel === null ? estado : { libre: estado.libre, cartel: null }
  }
}

/** Lo que el contenido del panel deja ver de su scroll. */
export interface RecorridoDelContenido {
  readonly scrollTop: number
  readonly clientHeight: number
  readonly scrollHeight: number
}

/**
 * [B6] Con el candado ABIERTO, ¿la rueda la absorbe el contenido? Sólo si nace adentro de él y él se puede mover hacia donde va.
 * Si no (en su borde, sin recorrido, o sobre el resto de la maqueta), el módulo la frena: la página no se mueve hasta salir.
 */
export function laRuedaEsDeAdentro(contenido: RecorridoDelContenido | null, deltaY: number, adentro: boolean): boolean {
  if (contenido === null || !adentro) return false
  if (deltaY > 0) return contenido.scrollTop + contenido.clientHeight < contenido.scrollHeight - 1
  if (deltaY < 0) return contenido.scrollTop > 0
  return false
}
