import { fijarLaEntradaDelMoire } from './moire/entrada'

/**
 * [PULIDO 11] F · EL GIROSCOPIO (el porqué, los riesgos y cómo probarlo: `docs/rediseno/GIROSCOPIO.md`) — en el teléfono, inclinar el
 * aparato hace lo que en escritorio hace el mouse: la cámara se corre alrededor del logo. No es un camino aparte: la inclinación ENTRA por
 * el mismo caño que el puntero (`OrbitRig`, con su suavizado y su magnitud), así hereda sus topes (el puntero va de −1 a 1: la cámara nunca
 * sube tanto como para que entre el techo del domo) y su apagado con movimiento reducido (sin física, la cámara no sigue ni al mouse).
 *
 * [C2-81] Del prototipo (`?giroscopio=si`, el toque del parlante prendía los dos) al producto: lo prende su propio botón (`movimiento.ts`,
 * `_chrome/movimiento/`) o la frase del preloader, y además maneja el moiré (`fijarLaEntradaDelMoire`, la entrada que dejó la 31m, con el
 * mismo rango que el mouse). Las lecturas pasan por un filtro suave (`filtrarLaInclinacion`) antes del amortiguador del mouse: el sensor
 * tiembla. Con movimiento reducido ya no se niega: está apagado por defecto y se puede prender a mano (`movimiento.ts`).
 *
 *   · El permiso: en iOS 13+ `DeviceOrientationEvent.requestPermission()` sólo se puede pedir desde un gesto (el toque del botón o de la
 *     frase). En Android no hay permiso: se escucha y listo. Sin HTTPS ninguno manda el evento. Si se niega o no hay sensor (ninguna
 *     lectura con datos en `sinSensorMs`), queda apagado, nada cambia y no se vuelve a pedir.
 *   · El cero: la primera lectura (como esté agarrado el teléfono al activarlo) es la posición de reposo; al volver a la pestaña
 *     se recalibra (con la pestaña oculta se deja de escuchar: batería).
 *   · Los ejes según cómo esté la pantalla: parado, el giro a los costados (gamma) es x y el cabeceo (beta) es y; apaisado, al revés.
 */
export const GIROSCOPIO = {
  /** Cuántos grados de inclinación desde el cero llevan el puntero equivalente a 1 (el borde de la pantalla para el mouse). */
  gradosDelBorde: { costado: 18, cabeceo: 14 },
  /** [C2-81] La constante de tiempo del filtro de cada lectura (ms): calma el temblor del sensor sin sentirse atrasado. */
  filtroMs: 90,
  /** [C2-81] Sin ninguna lectura con datos en este tiempo desde que se prendió, no hay sensor: se apaga solo. */
  sinSensorMs: 1500,
} as const

export type EstadoDelGiroscopio = 'apagado' | 'pidiendo' | 'prendido' | 'negado' | 'sin-sensor'

/** Lo que el rig lee en cada cuadro: el puntero equivalente (−1 a 1) y si manda. */
export const INCLINACION_DEL_TELEFONO = { x: 0, y: 0, activa: false, estado: 'apagado' as EstadoDelGiroscopio }

/** [C2-81] Los defectos para los controles de los bancos (`window.__defectosDelMovimiento`, nunca la URL). */
export type DefectoDelMovimiento = 'sin-camara' | 'sin-moire' | 'sin-permiso' | 'prendido-por-defecto' | 'sin-movimiento'

export function defectoDelMovimiento(): DefectoDelMovimiento | null {
  if (typeof window === 'undefined') return null
  return (window as Window & { __defectosDelMovimiento?: DefectoDelMovimiento }).__defectosDelMovimiento ?? null
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

/** [C2-81] El filtro suave: un paso de primer orden hacia la lectura nueva, según lo que pasó desde la anterior (`dtMs`). Puro. */
export function filtrarLaInclinacion(previo: { readonly x: number; readonly y: number }, lectura: { readonly x: number; readonly y: number }, dtMs: number, tauMs: number = GIROSCOPIO.filtroMs): { readonly x: number; readonly y: number } {
  const k = 1 - Math.exp(-Math.max(0, dtMs) / Math.max(1, tauMs))
  return { x: previo.x + (lectura.x - previo.x) * k, y: previo.y + (lectura.y - previo.y) * k }
}

interface ConPermiso {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/** ¿Hay que pedir permiso (iOS 13+)? */
export function pidePermiso(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as unknown as ConPermiso).requestPermission === 'function'
}

const oyentes = new Set<() => void>()
const cambiar = (estado: EstadoDelGiroscopio): void => {
  if (INCLINACION_DEL_TELEFONO.estado === estado) return
  INCLINACION_DEL_TELEFONO.estado = estado
  for (const f of oyentes) f()
}

/** [C2-81] El estado (para `useSyncExternalStore`: el botón y la frase del preloader). */
export const estadoDelGiroscopio = (): EstadoDelGiroscopio => INCLINACION_DEL_TELEFONO.estado

export function suscribirAlGiroscopio(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

let cero: { beta: number; gamma: number } | null = null
let filtrado: { readonly x: number; readonly y: number } | null = null
let ultimaLectura = 0
let conLectura = false
let vigia: number | undefined
const anguloDeLaPantalla = (): number => (typeof screen !== 'undefined' && screen.orientation !== undefined ? screen.orientation.angle : 0)
const alLeer = (e: DeviceOrientationEvent): void => {
  if (e.beta === null || e.gamma === null) return
  conLectura = true
  cero ??= { beta: e.beta, gamma: e.gamma }
  const p = punteroDeLaInclinacion(e.beta, e.gamma, cero, anguloDeLaPantalla())
  filtrado = filtrado === null ? p : filtrarLaInclinacion(filtrado, p, e.timeStamp - ultimaLectura)
  ultimaLectura = e.timeStamp
  const defecto = defectoDelMovimiento()
  INCLINACION_DEL_TELEFONO.x = filtrado.x
  INCLINACION_DEL_TELEFONO.y = filtrado.y
  INCLINACION_DEL_TELEFONO.activa = defecto !== 'sin-camara'
  // La entrada del moiré (C2-31m): la misma inclinación, en el rango del mouse.
  if (defecto !== 'sin-moire') fijarLaEntradaDelMoire(INCLINACION_DEL_TELEFONO)
}
const escuchar = (): void => {
  cero = null
  filtrado = null
  window.addEventListener('deviceorientation', alLeer)
}
const callar = (): void => {
  window.removeEventListener('deviceorientation', alLeer)
  INCLINACION_DEL_TELEFONO.activa = false
  INCLINACION_DEL_TELEFONO.x = 0
  INCLINACION_DEL_TELEFONO.y = 0
  fijarLaEntradaDelMoire(null)
}
const alCambiarLaVisibilidad = (): void => {
  if (INCLINACION_DEL_TELEFONO.estado !== 'prendido') return
  if (document.visibilityState === 'visible') escuchar()
  else callar()
}
const soltar = (): void => {
  callar()
  window.clearTimeout(vigia)
  document.removeEventListener('visibilitychange', alCambiarLaVisibilidad)
}

/**
 * Prende el giroscopio: se llama DESDE el gesto (iOS lo exige para el permiso). Sin sensor o negado, queda apagado y no se vuelve a
 * pedir. [C2-81] Con movimiento reducido también se puede (a mano).
 */
export function prenderElGiroscopio(): void {
  if (INCLINACION_DEL_TELEFONO.estado !== 'apagado' || typeof window === 'undefined') return
  if (!('DeviceOrientationEvent' in window)) {
    cambiar('sin-sensor')
    return
  }
  const prender = (): void => {
    cambiar('prendido')
    conLectura = false
    escuchar()
    document.addEventListener('visibilitychange', alCambiarLaVisibilidad)
    window.clearTimeout(vigia)
    vigia = window.setTimeout(() => {
      if (conLectura || INCLINACION_DEL_TELEFONO.estado !== 'prendido' || document.visibilityState !== 'visible') return
      soltar()
      cambiar('sin-sensor')
    }, GIROSCOPIO.sinSensorMs)
  }
  if (!pidePermiso()) {
    prender()
    return
  }
  cambiar('pidiendo')
  const negado = (): void => (defectoDelMovimiento() === 'sin-permiso' ? prender() : cambiar('negado'))
  ;(DeviceOrientationEvent as unknown as Required<ConPermiso>).requestPermission().then((r) => (r === 'granted' ? prender() : negado()), negado)
}

/** Lo apaga (el botón del movimiento). */
export function apagarElGiroscopio(): void {
  if (INCLINACION_DEL_TELEFONO.estado !== 'prendido') return
  soltar()
  cambiar('apagado')
}
