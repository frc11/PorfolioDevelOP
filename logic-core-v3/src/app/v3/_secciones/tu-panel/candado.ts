/**
 * [B6] EL CANDADO DE LA RUEDA DE UN MÓDULO — que el scroll y el mouse no se peleen (GUSTO).
 *
 * Con la rueda encima de un módulo, scrollea la PÁGINA (no el módulo) y aparece el cartel sobre el módulo, con su fondo
 * atenuado. El clic habilita el scroll de adentro; salir del módulo lo vuelve a bloquear. En el teléfono, lo mismo con el
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
  /** El puntero salió, se tocó afuera, o el módulo salió del cuadro. */
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
    case 'salida':
      return estado.libre || estado.cartel !== null ? CANDADO_INICIAL : estado
    case 'olvido':
      return estado.cartel === null ? estado : { libre: estado.libre, cartel: null }
  }
}
