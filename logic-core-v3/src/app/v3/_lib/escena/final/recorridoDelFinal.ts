import * as THREE from 'three'

import { FLOOR_Y, ORBIT_TARGET_Y } from '../probeScene'

/**
 * [CIERRE] 3 · EL FINAL DEL PIE (la idea de Franco) — al llegar al pie, una secuencia de cámara y logo, toda en función del
 * scroll y reversible. La escena ya terminó su recorrido en la pose E (el alejamiento): después del pie hay una COLA de
 * scroll (`[data-pieza="cola-del-final"]`, sólo desde 1024 y con movimiento; el pie queda pegado arriba mientras se la
 * recorre) y su avance es `fin`, de 0 a 1. Ninguna sección cambió de alto: la escena se queda en su último nudo (la cuenta
 * de las secciones se acota en 1) y nada de lo de antes se mueve.
 *
 *   1. SE ACUESTA (`fin` 0 → `ACUESTA_HASTA`): el logo gira sobre su base hacia atrás hasta quedar acostado sobre el piso y,
 *      en paralelo, la cámara sube ~90° hasta mirarlo desde arriba (`camaraDelFinal`).
 *   2. EL ENCASTRE (`ENCASTRE`): se hunde apenas en el piso con un rebote, y en el fondo del rebote, el GOLPE: una explosión
 *      de partículas de tinta (`explosion.ts`) y una onda fuerte en el piso vivo (`enElPiso.ts`).
 *   3. EL PISO VIBRA CON LUZ: después del golpe, donde pasa el mouse el piso vivo se oscurece y vibra (más que hoy).
 *   4. QUIETO EN EL PIE: si el visitante se queda, la cámara gira despacio alrededor y se aleja, sin fin, hasta un tope.
 *   5. VOLVER: subiendo, todo va en reversa (es función del scroll) y lo que el reloj sumó vuelve rápido a cero.
 *
 * Los objetos del pie (los títulos, los enlaces, el formulario, las redes) van con la cámara: se colocan con la cámara sin
 * el mouse, que también hace el final (`pie3d/armadas.ts`), así quedan de frente, legibles e interactivos.
 */
export const FINAL_DEL_PIE = {
  /** Hasta dónde se acuesta el logo (y sube la cámara), en `fin`. */
  acuestaHasta: 0.66,
  /** El encastre: el hundimiento con rebote, en `fin`; el golpe cae en `golpe`. */
  encastre: { desde: 0.62, hasta: 0.86, golpe: 0.7 },
  /** Cuánto se hunde al final (fracción del espesor) y el rebote: e^(−a·u)·cos(b·u). */
  hundimiento: { encajado: 0.3, a: 5, b: 10 },
  /** La cámara: la altura final (grados de elevación) y cuánto más lejos que en la pose E. */
  camara: { elevacion: 89.2, lejos: 1.06 },
  /** Quieto en el pie: a los cuántos segundos sin scroll arranca, el giro (°/s), el tope del alejamiento (u) y su tiempo (s). */
  quieto: { desdeS: 1.4, giroGradosS: 4.5, alejaHasta: 17, alejaS: 38, vuelveS: 0.45 },
  /** Cuánto adelante del blanco quedan las piezas del pie al final (u): las olas del piso no las tocan. */
  aireDelPie: 7,
  /** El golpe en la cámara: cuánto la sacude (u) y en cuánto se apaga (s). */
  sacudon: { amplitud: 0.07, s: 0.38 },
  /** El seguimiento de la cola: lo que tarda `fin` en alcanzar al scroll (s). */
  sigueS: 0.12,
} as const

/** Lo que el final tiene en vivo: lo escribe `FinalDelPie` en cada cuadro y lo leen las piezas del pie y el piso. */
export const EN_VIVO = {
  fin: 0,
  /** Cuánto subió la cámara (0 a 1): `acostado(fin)`. */
  camara: 0,
  /** Lo que el reloj sumó estando quieto: el giro (grados) y el alejamiento (u). */
  giro: 0,
  aleja: 0,
  /** El blanco de la cámara de este cuadro (el centro del logo acostado, sin el rebote). */
  blanco: new THREE.Vector3(0, ORBIT_TARGET_Y, 0),
  /**
   * Desde qué scroll (px del documento) el pie queda pegado arriba: el arranque de la cola menos un cuadro. Sin cola,
   * infinito. Mientras se recorre la cola el pie no se mueve en la pantalla: sus piezas se colocan con este scroll.
   */
  pegadoDesde: Number.POSITIVE_INFINITY,
}

/** El scroll con el que se colocan las piezas del pie: el de la página hasta que el pie se pega; después, ése. */
export function scrollDelPie(scroll: number): number {
  return Math.min(scroll, EN_VIVO.pegadoDesde)
}

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const suave = (x: number): number => {
  const u = acotar01(x)
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** Cuánto se acostó el logo (y subió la cámara), de 0 a 1. */
export function acostado(fin: number): number {
  return suave(fin / FINAL_DEL_PIE.acuestaHasta)
}

/** Cuánto se hundió (fracción del espesor): 0 hasta el encastre; un rebote que se asienta en `encajado`. */
export function hundido(fin: number): number {
  const e = FINAL_DEL_PIE.encastre
  const u = acotar01((fin - e.desde) / (e.hasta - e.desde))
  if (u <= 0) return 0
  const h = FINAL_DEL_PIE.hundimiento
  return h.encajado * (1 - Math.exp(-h.a * u) * Math.cos(h.b * u))
}

/** El tamaño del logo (u): su alto de tinta y su espesor. Lo publica `ProbeLogo` en las estadísticas. */
export interface TamanoDelLogo {
  readonly alto: number
  readonly espesor: number
}

/**
 * La pose del logo en el final: gira sobre su base hacia atrás (`rotacionX`, de 0 a −90°) mientras la base baja al piso, y
 * se hunde. Devuelve el centro (`centro`, en el mundo) y el giro; con `fin` 0, el logo de siempre (centro en el origen).
 */
export function poseDelLogo(fin: number, t: TamanoDelLogo, destino: { centro: THREE.Vector3; rotacionX: number }, conRebote = true): void {
  const k = acostado(fin)
  const tita = (-Math.PI / 2) * k
  const base = -t.alto / 2 + (FLOOR_Y + t.espesor / 2 + t.alto / 2) * k
  destino.centro.set(0, base + (t.alto / 2) * Math.cos(tita), (t.alto / 2) * Math.sin(tita))
  if (conRebote) destino.centro.y -= hundido(fin) * t.espesor
  destino.rotacionX = tita
}

const BLANCO = new THREE.Vector3()
const ARRIBA = new THREE.Vector3()

/**
 * LA CÁMARA DEL FINAL: toma la cámara como la dejó el recorrido (en la pose E, mirando al origen) y la lleva por encima del
 * logo hasta mirarlo desde arriba, alrededor del blanco que baja con él; con `giro` y `aleja`, la vuelta y el alejamiento
 * del que se quedó. La «arriba» de la cámara es la de la órbita que pasa por encima (la derivada de la dirección respecto
 * de la elevación): sin vuelco en ningún punto, ni en el cenit. Con `k` 0 y sin giro ni alejamiento no la toca.
 */
export function camaraDelFinal(c: THREE.Camera, k: number, blanco: THREE.Vector3, giro: number, aleja: number, sacudon: THREE.Vector3 | null): void {
  if (k <= 0 && giro === 0 && aleja === 0) return
  const dx = c.position.x
  const dz = c.position.z
  const dy = c.position.y - ORBIT_TARGET_Y
  const az0 = Math.atan2(dx, dz)
  const r0 = Math.hypot(dx, dy, dz)
  const e0 = Math.atan2(dy, Math.hypot(dx, dz))
  const e = e0 + (THREE.MathUtils.degToRad(FINAL_DEL_PIE.camara.elevacion) - e0) * k
  const r = r0 * (1 + (FINAL_DEL_PIE.camara.lejos - 1) * k) + aleja
  const az = az0 + THREE.MathUtils.degToRad(giro)
  BLANCO.set(0, ORBIT_TARGET_Y, 0).lerp(blanco, k)
  c.position.set(BLANCO.x + r * Math.cos(e) * Math.sin(az), BLANCO.y + r * Math.sin(e), BLANCO.z + r * Math.cos(e) * Math.cos(az))
  if (sacudon !== null) c.position.add(sacudon)
  ARRIBA.set(-Math.sin(e) * Math.sin(az), Math.cos(e), -Math.sin(e) * Math.cos(az))
  c.up.copy(ARRIBA)
  c.lookAt(BLANCO)
  c.up.set(0, 1, 0)
  c.updateMatrixWorld()
}

/** El avance de la cola en el cuadro: 0 con su tope en el pie del cuadro (o sin cola), 1 al final del documento. */
export function avanceDeLaCola(tope: number, alto: number, ventana: number): number {
  if (!(alto > 0)) return 0
  return acotar01((ventana - tope) / alto)
}

/**
 * QUIETO EN EL PIE: el reloj del que se quedó. Con el final entero y sin scroll hace `quieto.desdeS`, la cámara gira sin
 * fin y se aleja hacia su tope (1 − e^(−t/τ): siempre un poco más, nunca más que el tope); si no, todo vuelve a cero rápido
 * (el giro por el camino corto). Devuelve el nuevo tiempo quieto.
 */
export function relojDelQuieto(quietoS: number, finEntero: boolean, sinScrollS: number, dt: number, estado: { giro: number; aleja: number }): number {
  const q = FINAL_DEL_PIE.quieto
  if (finEntero && sinScrollS >= q.desdeS) {
    const t = quietoS + dt
    estado.giro += q.giroGradosS * dt
    estado.aleja = q.alejaHasta * (1 - Math.exp(-t / q.alejaS))
    return t
  }
  const k = Math.exp(-dt / q.vuelveS)
  const giro = ((((estado.giro + 180) % 360) + 360) % 360) - 180
  estado.giro = Math.abs(giro * k) < 1e-3 ? 0 : giro * k
  estado.aleja = estado.aleja * k < 1e-3 ? 0 : estado.aleja * k
  return 0
}

/** Las piezas del pie, en el final: cuánto adelante del blanco quedan como mucho (sin final, infinito: la regla de siempre). */
export function profundidadDelFinal(camara: THREE.Camera): number {
  if (EN_VIVO.camara <= 0) return Number.POSITIVE_INFINITY
  BLANCO.set(0, ORBIT_TARGET_Y, 0).lerp(EN_VIVO.blanco, EN_VIVO.camara)
  return camara.position.distanceTo(BLANCO) - FINAL_DEL_PIE.aireDelPie * EN_VIVO.camara
}
