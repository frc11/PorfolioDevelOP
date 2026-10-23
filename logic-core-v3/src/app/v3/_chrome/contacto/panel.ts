import type { MotionProps } from 'motion/react'

import { ESCALA_AL_NACER, MS_DE_LA_SALIDA_DE_LA_PLACA, TRANSICIONES, escalaDelViaje } from './placa'

/**
 * [C2 · 22] EL CONTACTO EN EL TELÉFONO Y LA TABLET — el panel que viene del fondo. Abajo de 1024 (o con el menú del teléfono) el contacto ya
 * no sube desde abajo a pantalla completa: llega desde la profundidad como el de escritorio (el mismo fondo que se desenfoca primero y la
 * misma curva de tamaño), pero sin 3D: el MISMO formulario en una hoja centrada, que crece de un punto del fondo con un fundido (escala y
 * opacidad, sin giro ni costados) y al irse vuelve al fondo y se desvanece. Con movimiento reducido, sólo un fundido.
 *
 *   · Tamaño: `ancho` y `alto` son fracciones de la pantalla visible (~70 %). El alto es un mínimo: si el contenido pide más (el teléfono
 *     angosto), la hoja crece hasta `altoMaximo` y recién ahí se scrollea por adentro. Las clases van escritas enteras en `CLASES_DEL_PANEL`
 *     (Tailwind no ve las que se arman con texto); `s25` las ata a estas fracciones.
 *   · 1024 es ESCRITORIO (`COMPOSICION_MIN_ANCHO_PX`, decisión del dueño: «a 1024 la página se compone y se monta como escritorio»): ahí
 *     sigue la placa 3D. El panel es de 1023 para abajo, y siempre con el menú del teléfono.
 */
export const PANEL = { ancho: 0.7, alto: 0.7, altoMaximo: 0.9 } as const

/** La hoja del panel: el ancho y el alto mínimo en fracciones de la pantalla; con un piso de ancho para el teléfono más angosto. Centrada por su escenario. */
export const CLASES_DEL_PANEL = 'pointer-events-auto relative flex w-[70%] min-w-[min(100%,17rem)] min-h-[70svh] max-h-[90svh] flex-col rounded-[var(--radius-medio)] shadow-[var(--shadow-flotante)]'

/** El escenario del panel: ocupa el cuadro entero, no recibe el puntero (un clic al lado cae en el velo, que cierra) y centra a la hoja. */
export const CLASES_DEL_ESCENARIO_DEL_PANEL = 'pointer-events-none absolute inset-0 grid place-items-center'

/** El fundido con movimiento reducido (s): corto y sin escala. */
export const FUNDIDO_REDUCIDO_DEL_PANEL_S = 0.2
/** El fundido de entrada con movimiento (s): arranca con el viaje y termina antes que él. */
const FUNDIDO_DE_ENTRADA_S = 0.35

/**
 * La curva del viaje del panel: la misma del tamaño aparente de la placa de escritorio (`escalaDelViaje`) vista como el avance de una
 * escala que va de `ESCALA_AL_NACER` a 1 (Motion interpola la escala en recta entre los dos extremos): el tamaño crece igual que el de la
 * placa en cada instante del viaje.
 */
export function curvaDelPanel(t: number): number {
  return (escalaDelViaje(t) - ESCALA_AL_NACER) / (1 - ESCALA_AL_NACER)
}

type Animacion = Pick<MotionProps, 'initial' | 'animate' | 'exit'>

/**
 * Lo que la hoja anima, para Motion: entra con el viaje de la placa (su retardo —el fondo cambia primero— y su duración) y sale con su
 * salida (vuelve al fondo y se desvanece al final, y el fondo se va después: `fondoAlCerrar`). Reducido: un fundido, sin escala.
 */
export function animacionDelPanel(reducido: boolean): Animacion {
  if (reducido) {
    return { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: FUNDIDO_REDUCIDO_DEL_PANEL_S } }, exit: { opacity: 0, transition: { duration: FUNDIDO_REDUCIDO_DEL_PANEL_S } } }
  }
  const salida = MS_DE_LA_SALIDA_DE_LA_PLACA / 1000
  return {
    initial: { opacity: 0, scale: ESCALA_AL_NACER },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { scale: { duration: TRANSICIONES.viaje.duration, delay: TRANSICIONES.viaje.delay, ease: curvaDelPanel }, opacity: { duration: FUNDIDO_DE_ENTRADA_S, delay: TRANSICIONES.viaje.delay, ease: 'linear' } },
    },
    exit: {
      opacity: 0,
      scale: ESCALA_AL_NACER,
      transition: { scale: { duration: salida, ease: TRANSICIONES.acostarse.ease }, opacity: { duration: salida * 0.35, delay: salida * 0.65, ease: 'linear' } },
    },
  }
}

/**
 * ¿La hoja es el panel? Con el menú del teléfono, siempre; con la barra, abajo de escritorio. (La placa 3D es de escritorio con la barra.)
 */
export function esElPanel(modo: 'barra' | 'menu', escritorio: boolean): boolean {
  return modo === 'menu' || !escritorio
}
