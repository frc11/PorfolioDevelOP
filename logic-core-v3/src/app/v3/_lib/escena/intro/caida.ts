import * as THREE from 'three'

import { LLEGADA_DEL_TITULAR_S } from '../../titulos3d/titular'

/**
 * [NOCTURNO FINAL] B1 · LA CAÍDA DEL LOGO AL CARGAR — el logo baja desde arriba y llega a su lugar justo cuando termina de
 * armarse el titular del hero («TU NEGOCIO VENDIENDO LAS 24 HS»), y al llegar hace la SÚPER ONDA en el piso (el golpe:
 * `final/enElPiso.ts`), la misma que sale cuando el logo termina de encastrarse en el final. Sólo si la página carga arriba
 * (el hero a la vista) y con movimiento: con movimiento reducido, ni caída ni onda (no se monta).
 *
 * [PULIDO 1] P6 · «COMO UN ÁNGEL». Antes esperaba arriba el 40 % y después caía con gravedad (aparecía tarde y caía cada vez
 * más rápido para llegar a tiempo). Ahora baja a velocidad CONSTANTE desde que arranca la primera letra del titular hasta
 * que termina la última: sigue lo que la escena muestra del titular en volumen (`TITULAR_EN_VIVO`), así que los dos tramos
 * son el mismo; sin titular en volumen (abajo de 1024, `titulos=no`, o si no se arma en `esperaMaximaS` con la carga abierta), con
 * su propio reloj desde que se abre la carga y la misma duración (`LLEGADA_DEL_TITULAR_S`, importada). Arranca justo arriba
 * del cuadro (`desdeElBorde`: aparece apenas empieza). Con `?angel=asentado`, se asienta en sus últimos `asentadoS`.
 */
export const CAIDA_DEL_LOGO = {
  /** Lo que dura (s): lo que tarda el titular en armarse (la misma constante). */
  duracionS: LLEGADA_DEL_TITULAR_S,
  /** Desde qué altura espera, fuera del cuadro, hasta que arranca (u sobre su lugar). */
  alto: 14,
  /** Cuánto más arriba del borde de arriba del cuadro arranca (en el alto del cuadro, normalizado): apenas afuera. */
  desdeElBorde: 0.02,
  /** La página cargó «arriba» si su scroll es menos que esta fracción de la ventana: si no, el logo ya está en su lugar. */
  arriba: 0.5,
  /** [PULIDO 1] P6 · la prueba `angel=asentado`: en estos últimos segundos frena hasta posarse (y llega igual a tiempo). */
  asentadoS: 0.12,
  /** [PULIDO 1] P6 · con la carga abierta, cuánto espera (s) a un titular anotado que no se arma: después, su propio reloj. */
  esperaMaximaS: 2.5,
} as const

/**
 * [PULIDO 1] P6 · la altura del logo sobre su lugar (u) a la fracción `u` (0 a 1) de su bajada, desde `alto`: a velocidad
 * constante. Con `asentado`, la misma velocidad un poco mayor hasta los últimos `asentadoS` y ahí frena parejo hasta cero
 * (la altura y la velocidad, continuas; llega en el mismo instante).
 */
export function alturaDeLaCaida(u: number, alto: number = CAIDA_DEL_LOGO.alto, asentado = false): number {
  if (u <= 0) return alto
  if (u >= 1) return 0
  if (!asentado) return alto * (1 - u)
  const t = Math.min(0.5, CAIDA_DEL_LOGO.asentadoS / CAIDA_DEL_LOGO.duracionS)
  if (u <= 1 - t) return alto * (1 - u / (1 - t / 2))
  const r = 1 - u
  return (alto * r * r) / (t * (2 - t))
}

/** Lo que la bajada sabe en cada cuadro para decidir a qué reloj va. */
export interface FuenteDeLaBajada {
  /** Hay un titular de volumen anotado (desde 1024, con los títulos prendidos). */
  readonly conTitular: boolean
  /** Lo que la escena muestra del titular (del cuadro anterior: el logo va antes que los títulos en el cuadro). */
  readonly titular: { readonly llegada: number; readonly armado: boolean; readonly enCamino: boolean }
  readonly cargaLista: boolean
  /** Ya esperó al titular anotado `esperaMaximaS` con la carga abierta (no se armó: falló la fuente o el módulo). */
  readonly vencido: boolean
}

/**
 * [PULIDO 1] P6 · un cuadro de la bajada (escribe en `b`). Con el titular armado y su llegada en camino, ES su llegada: la del
 * cuadro anterior y lo que suma en éste con la carga abierta (el mismo `dt` y el mismo tope: `persigue`), así el logo y la
 * última letra llegan en el mismo cuadro. Con un titular anotado que todavía no se armó, espera arriba (a lo sumo
 * `esperaMaximaS` con la carga abierta: si no se arma, el logo no puede quedar arriba para siempre). Sin titular, o si el titular se pausa (quien carga bajó antes de que termine: el titular queda fuera
 * de la vista y no avanza), su propio reloj desde donde iba, a la misma velocidad: un logo colgado en el aire se vería desde
 * la sección siguiente. Una vez con su reloj, sigue con él.
 */
export function pasoDeLaBajada(b: { u: number; propio: boolean }, f: FuenteDeLaBajada, dt: number): void {
  if (!b.propio && f.titular.armado && f.titular.enCamino) {
    b.u = f.cargaLista ? Math.min(1, f.titular.llegada + dt / CAIDA_DEL_LOGO.duracionS) : f.titular.llegada
    return
  }
  if (!b.propio && f.conTitular && !f.titular.armado && !f.vencido) return
  if (!f.cargaLista) return
  b.propio = true
  b.u = Math.min(1, b.u + dt / CAIDA_DEL_LOGO.duracionS)
}

/** [PULIDO 1] P6 · la altura (u sobre su lugar) desde la que el borde de abajo del logo queda apenas arriba del cuadro. */
export function altoDesdeElBorde(camara: THREE.Camera, logo: THREE.Object3D): number {
  logo.updateMatrixWorld(true)
  const caja = new THREE.Box3().setFromObject(logo) // una vez
  const abajo = caja.min.y - logo.position.y
  const punto = new THREE.Vector3() // una vez
  const centroX = (caja.min.x + caja.max.x) / 2
  const centroZ = (caja.min.z + caja.max.z) / 2
  const arriba = 1 + 2 * CAIDA_DEL_LOGO.desdeElBorde
  let bajo = 0
  let alto = 40
  for (let i = 0; i < 30; i += 1) {
    const h = (bajo + alto) / 2
    if (punto.set(centroX, h + abajo, centroZ).project(camara).y >= arriba) alto = h
    else bajo = h
  }
  return alto
}
