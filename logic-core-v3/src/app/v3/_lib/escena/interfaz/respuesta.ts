import { entornoDeLaEscena, hayBanco } from '../entorno'
import { NIVEL_DE_LA_NOCHE } from '../lightArc'
import { viajeEnCurso } from '../viaje'
import { anticipacionInicial, avanzarLaAnticipacion, nivelAnticipado } from './anticipacion'
import { ANTICIPACION_PEDIDA, MENU_DE_LA_INTERFAZ } from './pedidos'

/**
 * [INTERFAZ 2] LA SALA RESPONDE A LA INTERFAZ — lo que el rig suma a su luz y a su cámara por lo que pasa en el DOM.
 *
 * El rig llama a `nivelConLaInterfaz` una vez por cuadro, DESPUÉS de calcular el nivel del arco con la noche disparada
 * (`nivelConLaNocheDisparada`): `NIVEL_NATURAL` (la luz de salida de un viaje) queda limpio y todo lo que cuelga del
 * nivel —las luces, la bruma, el brillo de las motas, la emisión del logo— lo sigue en el mismo cuadro. Y suma
 * `giroDeLaInterfaz` a la cámara, junto al desplazamiento del mouse. Sin las banderas devuelve el MISMO número y cero.
 *
 * T1 · **el menú del teléfono abierto** (`responde=si`): la sala baja su luz un poco (`menu.oscurece`, una fracción)
 * con la constante de tiempo del menú. Es la luz de la sala y no un velo: el logo y el piso se apagan como se apagan de
 * verdad. Nunca baja de la noche (de noche casi no cambia nada: ahí lo que se ve es el brillo de la noche, no el nivel).
 *
 * T2 · **la vista previa del destino** (`anticipa=si`): `anticipacion.ts`.
 */
export const RESPUESTA = {
  menu: {
    /** Cuánto baja la luz con el menú abierto (fracción del nivel). */
    oscurece: 0.22,
    /** La constante de tiempo al abrir y al cerrar (s): llega al 95 % en los 380 ms del menú. */
    tauS: 0.127,
  },
} as const

/** El estado que se arrastra de un cuadro al otro (objetos de módulo: cero reservas). */
export const RESPUESTA_EN_VIVO = { menu: 0, anticipacion: anticipacionInicial() }

export interface BanderasDeLaRespuesta {
  readonly responde: boolean
  readonly anticipa: boolean
}

const banderas = (): BanderasDeLaRespuesta => {
  const p = entornoDeLaEscena().pruebas
  return p.responde === 'si' || p.anticipa === 'si' ? (p.responde === 'si' ? (p.anticipa === 'si' ? AMBAS : SOLO_RESPONDE) : SOLO_ANTICIPA) : NINGUNA
}
const NINGUNA: BanderasDeLaRespuesta = { responde: false, anticipa: false }
const SOLO_RESPONDE: BanderasDeLaRespuesta = { responde: true, anticipa: false }
const SOLO_ANTICIPA: BanderasDeLaRespuesta = { responde: false, anticipa: true }
const AMBAS: BanderasDeLaRespuesta = { responde: true, anticipa: true }

/** El nivel del arco con la respuesta a la interfaz encima. `dt` en segundos (acotado por quien llama). */
export function nivelConLaInterfaz(nivel: number, dt: number, b: BanderasDeLaRespuesta = banderas()): number {
  let n = nivel
  const r = RESPUESTA_EN_VIVO
  if (b.anticipa) {
    const viaje = viajeEnCurso()
    avanzarLaAnticipacion(r.anticipacion, ANTICIPACION_PEDIDA.plan, viaje === null ? null : viaje.destino, typeof window === 'undefined' ? 0 : window.scrollY, performance.now(), dt)
    n = nivelAnticipado(n, r.anticipacion)
  }
  if (b.responde) {
    const objetivo = MENU_DE_LA_INTERFAZ.abierto ? 1 : 0
    r.menu += (objetivo - r.menu) * (1 - Math.exp(-Math.max(0, dt) / RESPUESTA.menu.tauS))
    if (r.menu < 1e-4 && objetivo === 0) r.menu = 0
    const oscuro = n * (1 - RESPUESTA.menu.oscurece * r.menu)
    n = oscuro < NIVEL_DE_LA_NOCHE ? Math.min(n, NIVEL_DE_LA_NOCHE) : oscuro
  }
  return n
}

// El banco lee lo que la interfaz le suma a la sala (sólo con banco: `__entornoDeLaEscena`).
if (hayBanco()) (window as Window & { __respuestaDelBanco?: () => unknown }).__respuestaDelBanco = () => ({ menu: RESPUESTA_EN_VIVO.menu, ...RESPUESTA_EN_VIVO.anticipacion })

/** Los grados que la interfaz suma a la cámara en este cuadro (la vista previa del destino). Cero sin la bandera. */
export function giroDeLaInterfaz(b: BanderasDeLaRespuesta = banderas()): number {
  return b.anticipa ? RESPUESTA_EN_VIVO.anticipacion.giro : 0
}
