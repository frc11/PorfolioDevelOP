import { entornoDeLaEscena } from '../entorno'
import { NIVEL_DE_LA_NOCHE } from '../lightArc'
import { MENU_DE_LA_INTERFAZ } from './pedidos'

/**
 * [INTERFAZ 2] LA SALA RESPONDE A LA INTERFAZ — lo que el rig suma a su luz por lo que pasa en el DOM.
 *
 * El rig llama a `nivelConLaInterfaz` una vez por cuadro, DESPUÉS de calcular el nivel del arco con la noche disparada
 * (`nivelConLaNocheDisparada`): `NIVEL_NATURAL` (la luz de salida de un viaje) queda limpio y todo lo que cuelga del
 * nivel —las luces, la bruma, el brillo de las motas, la emisión del logo— lo sigue en el mismo cuadro. Sin la bandera
 * devuelve el MISMO número: la sala del producto no se entera.
 *
 * T1 · **el menú del teléfono abierto**: la sala baja su luz un poco (`menu.oscurece`, una fracción) con la constante
 * de tiempo del menú. Es la luz de la sala y no un velo: el logo y el piso se apagan como se apagan de verdad. Nunca
 * baja de la noche (de noche casi no cambia nada: ahí lo que se ve es el brillo de la noche, no el nivel).
 */
export const RESPUESTA = {
  menu: {
    /** Cuánto baja la luz con el menú abierto (fracción del nivel). */
    oscurece: 0.22,
    /** La constante de tiempo al abrir y al cerrar (s): llega al 95 % en los 380 ms del menú. */
    tauS: 0.127,
  },
} as const

/** El estado que se arrastra de un cuadro al otro (un objeto de módulo: cero reservas). */
export const RESPUESTA_EN_VIVO = { menu: 0 }

const conLaBandera = (): boolean => entornoDeLaEscena().pruebas.responde === 'si'

/** El nivel del arco con la respuesta a la interfaz encima. `dt` en segundos (acotado por quien llama). */
export function nivelConLaInterfaz(nivel: number, dt: number, conBandera: boolean = conLaBandera()): number {
  if (!conBandera) return nivel
  const r = RESPUESTA_EN_VIVO
  const objetivo = MENU_DE_LA_INTERFAZ.abierto ? 1 : 0
  r.menu += (objetivo - r.menu) * (1 - Math.exp(-Math.max(0, dt) / RESPUESTA.menu.tauS))
  if (r.menu < 1e-4 && objetivo === 0) r.menu = 0
  const oscuro = nivel * (1 - RESPUESTA.menu.oscurece * r.menu)
  return oscuro < NIVEL_DE_LA_NOCHE ? Math.min(nivel, NIVEL_DE_LA_NOCHE) : oscuro
}
