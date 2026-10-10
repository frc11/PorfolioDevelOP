/**
 * [PULIDO 11] F · EL GIROSCOPIO (prototipo, sólo con `?giroscopio=si`; el porqué, los riesgos y cómo probarlo:
 * `docs/rediseno/GIROSCOPIO.md`) — en el teléfono, inclinar el aparato hace lo que en escritorio hace el mouse: la cámara se
 * corre alrededor del logo. No es un camino aparte: la inclinación ENTRA por el mismo caño que el puntero (`OrbitRig`, con su
 * suavizado y su magnitud), así hereda sus topes (el puntero va de −1 a 1: la cámara nunca sube tanto como para que entre el
 * techo del domo) y su apagado con movimiento reducido.
 *
 *   · El permiso: en iOS 13+ `DeviceOrientationEvent.requestPermission()` sólo se puede pedir desde un gesto (el toque del
 *     parlante: «Activar experiencia» prende el sonido Y el movimiento). En Android no hay permiso: se escucha y listo. Sin
 *     HTTPS ninguno manda el evento. Si se niega o no hay sensor, nada cambia y no se vuelve a pedir.
 *   · El cero: la primera lectura (como esté agarrado el teléfono al activarlo) es la posición de reposo; al volver a la pestaña
 *     se recalibra (con la pestaña oculta se deja de escuchar: batería).
 *   · Los ejes según cómo esté la pantalla: parado, el giro a los costados (gamma) es x y el cabeceo (beta) es y; apaisado, al revés.
 */
export const GIROSCOPIO = {
  /** Cuántos grados de inclinación desde el cero llevan el puntero equivalente a 1 (el borde de la pantalla para el mouse). */
  gradosDelBorde: { costado: 18, cabeceo: 14 },
} as const

export type EstadoDelGiroscopio = 'apagado' | 'pidiendo' | 'prendido' | 'negado' | 'sin-sensor'

/** Lo que el rig lee en cada cuadro: el puntero equivalente (−1 a 1) y si manda. */
export const INCLINACION_DEL_TELEFONO = { x: 0, y: 0, activa: false, estado: 'apagado' as EstadoDelGiroscopio }

/** ¿Pidió el prototipo la URL? */
export function giroscopioPedido(consulta: string): boolean {
  return new URLSearchParams(consulta).get('giroscopio') === 'si'
}

const acotar = (x: number): number => Math.min(1, Math.max(-1, x))

/**
 * El puntero equivalente desde una lectura (`beta`, `gamma`, grados), el cero y el ángulo de la pantalla (0 parado, ±90
 * apaisado): −1 a 1 en cada eje, con el borde a `gradosDelBorde`. Inclinar la parte de arriba hacia atrás mira desde más arriba.
 */
export function punteroDeLaInclinacion(beta: number, gamma: number, cero: { readonly beta: number; readonly gamma: number }, pantalla: number): { readonly x: number; readonly y: number } {
  const { costado, cabeceo } = GIROSCOPIO.gradosDelBorde
  const db = beta - cero.beta
  const dg = gamma - cero.gamma
  if (Math.abs(pantalla) === 90) {
    const s = pantalla === 90 ? 1 : -1
    return { x: acotar((s * db) / costado), y: acotar((-s * dg) / cabeceo) }
  }
  return { x: acotar(dg / costado), y: acotar(-db / cabeceo) }
}

interface ConPermiso {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

let cero: { beta: number; gamma: number } | null = null
const anguloDeLaPantalla = (): number => (typeof screen !== 'undefined' && screen.orientation !== undefined ? screen.orientation.angle : 0)
const alLeer = (e: DeviceOrientationEvent): void => {
  if (e.beta === null || e.gamma === null) return
  cero ??= { beta: e.beta, gamma: e.gamma }
  const p = punteroDeLaInclinacion(e.beta, e.gamma, cero, anguloDeLaPantalla())
  INCLINACION_DEL_TELEFONO.x = p.x
  INCLINACION_DEL_TELEFONO.y = p.y
  INCLINACION_DEL_TELEFONO.activa = true
}
const escuchar = (): void => {
  cero = null
  window.addEventListener('deviceorientation', alLeer)
}
const callar = (): void => {
  window.removeEventListener('deviceorientation', alLeer)
  INCLINACION_DEL_TELEFONO.activa = false
  INCLINACION_DEL_TELEFONO.x = 0
  INCLINACION_DEL_TELEFONO.y = 0
}
const alCambiarLaVisibilidad = (): void => {
  if (INCLINACION_DEL_TELEFONO.estado !== 'prendido') return
  if (document.visibilityState === 'visible') escuchar()
  else callar()
}

/**
 * Prende el giroscopio: se llama DESDE el gesto (iOS lo exige para el permiso). Con movimiento reducido, sin sensor o negado,
 * no hace nada más (y no se vuelve a pedir).
 */
export function prenderElGiroscopio(): void {
  const I = INCLINACION_DEL_TELEFONO
  if (I.estado !== 'apagado' || typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('DeviceOrientationEvent' in window)) {
    I.estado = 'sin-sensor'
    return
  }
  const conPermiso = DeviceOrientationEvent as unknown as ConPermiso
  const prender = (): void => {
    I.estado = 'prendido'
    escuchar()
    document.addEventListener('visibilitychange', alCambiarLaVisibilidad)
  }
  if (typeof conPermiso.requestPermission !== 'function') {
    prender()
    return
  }
  I.estado = 'pidiendo'
  conPermiso.requestPermission().then(
    (r) => {
      if (r === 'granted') prender()
      else I.estado = 'negado'
    },
    () => {
      I.estado = 'negado'
    },
  )
}

/** Lo apaga (el parlante apagado otra vez). */
export function apagarElGiroscopio(): void {
  if (INCLINACION_DEL_TELEFONO.estado !== 'prendido') return
  callar()
  document.removeEventListener('visibilitychange', alCambiarLaVisibilidad)
  INCLINACION_DEL_TELEFONO.estado = 'apagado'
}
