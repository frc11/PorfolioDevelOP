import * as THREE from 'three'

import { FLOOR_Y, ORBIT_TARGET_Y } from '../probeScene'
import { HUECO } from './hueco'

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
 *
 * [EL ENCASTRE] 2A · `fin` YA NO ES EL SCROLL DE LA COLA: tiene su RELOJ (`pasoDelReloj`). Apenas se llega al pie (el pie
 * se pega arriba) la secuencia arranca sola y corre a su ritmo (`RELOJ_DEL_FINAL.duracionS`); scrollear hacia abajo la
 * adelanta (la cola entera, la secuencia entera); un gesto hacia arriba (o salir del pie) la revierte (`vueltaS`), y un
 * viaje del menú la deshace enseguida. La cola sigue (el pie pegado y el scroll que adelanta), con el mismo alto.
 *
 * [RETOQUE DEL ENCASTRE] 1D · la cola se fue: la página termina en el pie, la secuencia arranca cuando el pie llegó
 * entero, no se adelanta con el scroll y un gesto hacia arriba la rebobina (`RELOJ_DEL_FINAL`).
 */
export const FINAL_DEL_PIE = {
  /**
   * [EL ENCASTRE] 2B · los tiempos van en segundos del reloj (`fin × RELOJ_DEL_FINAL.duracionS`). Se acuesta EN SU LUGAR:
   * gira sobre su propio centro (no se corre) hasta `acostarseS`; la cámara sube en paralelo: [2D] el `conElLogo` de su
   * camino mientras se acuesta (desde el cenit el logo acostado tapaba su hueco) y el resto mientras se encastra.
   */
  acostarseS: 2.2,
  subida: { conElLogo: 0.8 },
  /** Y cae derecho al piso, con gravedad (u/s²), desde `desdeS`; el blanco de la cámara baja al piso en `blancoS`. */
  caida: { desdeS: 2.2, gravedad: 26, blancoS: 0.9 },
  /**
   * [EL ENCASTRE] 2D · cae justo en el hueco (la cara de abajo al ras del borde) y se hunde A PRESIÓN hasta quedar al ras
   * (un espesor) a los `hastaS`: en tramos que ceden de a poco (`tramos`, fracciones del espesor, cada uno más chico);
   * en cada tramo resiste temblando (`resiste` del tramo, apenas cede: `cedeAlResistir`) y después cede de golpe.
   */
  presion: { hastaS: 4.7, tramos: [0.34, 0.27, 0.22, 0.17], resiste: 0.55, cedeAlResistir: 0.06, temblor: 0.006, sacudon: 0.022 },
  /** El mar alrededor del logo se calma antes de que caiga (s del reloj). */
  calma: { desdeS: 1.4, hastaS: 2.4 },
  /**
   * [EL ENCASTRE] 2E · EL PODER: al quedar al ras (`presion.hastaS`) se libera: un destello (sube a `destello` en
   * `subeS`) que se asienta en el poder entero en `asientaS`. El golpe (su pulso) cae ahí; al tocar el piso, sólo un
   * golpecito (`golpecito`, u, de la cámara).
   */
  poder: { destello: 1.45, subeS: 0.12, asientaS: 0.9, golpecito: 0.03 },
  /** La cámara: la altura final (grados de elevación) y cuánto más lejos que en la pose E. */
  camara: { elevacion: 89.2, lejos: 1.06 },
  /** Quieto en el pie: a los cuántos segundos sin scroll arranca, el giro (°/s), el tope del alejamiento (u) y su tiempo (s). */
  quieto: { desdeS: 1.4, giroGradosS: 4.5, alejaHasta: 17, alejaS: 38, vuelveS: 0.45 },
  /** Cuánto adelante del blanco quedan las piezas del pie al final (u): las olas del piso no las tocan. */
  aireDelPie: 7,
  /** El golpe en la cámara: cuánto la sacude (u) y en cuánto se apaga (s). */
  sacudon: { amplitud: 0.07, s: 0.38 },
} as const

/**
 * [EL ENCASTRE] 2A · EL RELOJ DEL FINAL. [RETOQUE DEL ENCASTRE] 1D · CINEMÁTICA AUTOMÁTICA CON REBOBINADO: sin la cola, la
 * página termina en el pie. Al fondo, la secuencia arranca sola recién cuando el pie terminó de aparecer entero (todas sus
 * piezas en su lugar) y corre a UNA velocidad (`duracionS`): el scroll hacia abajo no la adelanta. Un gesto hacia arriba
 * mientras no está en su inicio no mueve la página (lo retiene `gestosDelScroll.ts`): la REBOBINA (`rebobinaS` de punta
 * a punta) mientras siga; si suelta (`sueltaS` sin gesto), retoma sola hacia adelante desde donde quedó. Rebobinada del
 * todo, espera parada: el gesto que la llevó a cero sigue retenido hasta que se suelta y el SIGUIENTE mueve la página
 * (un gesto hacia abajo, en cambio, la vuelve a correr). Salir del fondo sin un gesto (la barra) la revierte (`vueltaS`)
 * y un viaje del menú la deshace enseguida (`vueltaDelViajeS`). La velocidad se persigue con una inercia corta
 * (`inerciaS`): ningún cambio de sentido es de golpe.
 */
export const RELOJ_DEL_FINAL = { duracionS: 6.4, rebobinaS: 2.2, vueltaS: 1.5, vueltaDelViajeS: 0.35, sueltaS: 0.25, inerciaS: 0.12 } as const

/** `espera`: no corre (no está al fondo, el pie llega o hay un viaje): vuelve a cero. `corre`: adelante, o rebobinando. `rebobinada`: quieta en cero. */
export type FaseDelFinal = 'espera' | 'corre' | 'rebobinada'

/** Lo que el reloj recuerda de un cuadro al otro. */
export interface RelojDelFinal {
  fin: number
  /** Cuánto `fin` por segundo (la que persigue a la de su fase, con la inercia). */
  velocidad: number
  fase: FaseDelFinal
}

export function relojQuieto(): RelojDelFinal {
  return { fin: 0, velocidad: 0, fase: 'espera' }
}

/** Lo que el reloj necesita saber en cada cuadro. */
export interface EntradaDelReloj {
  /** La página está al fondo (no queda scroll hacia abajo). */
  readonly alFondo: boolean
  /** Todas las piezas del pie llegaron a su lugar. */
  readonly pieEntero: boolean
  /** Hay un gesto hacia arriba sin soltar (el último, hace menos de `sueltaS`). */
  readonly rebobina: boolean
  /** Hubo un gesto hacia abajo desde el cuadro anterior. */
  readonly haciaAbajo: boolean
  /** Hay un viaje del menú en curso. */
  readonly enViaje: boolean
}

/** Un cuadro del reloj (escribe en `r`). */
export function pasoDelReloj(r: RelojDelFinal, e: EntradaDelReloj, dt: number): void {
  const R = RELOJ_DEL_FINAL
  let objetivo = -1 / R.vueltaS
  if (e.enViaje || !e.alFondo) {
    r.fase = 'espera'
    if (e.enViaje) objetivo = -1 / R.vueltaDelViajeS
  } else {
    if (r.fase === 'espera' && e.pieEntero) r.fase = 'corre'
    else if (r.fase === 'rebobinada' && e.haciaAbajo && !e.rebobina) r.fase = 'corre'
    if (r.fase === 'corre') objetivo = e.rebobina ? -1 / R.rebobinaS : 1 / R.duracionS
    else if (r.fase === 'rebobinada') objetivo = 0
  }
  const paso = Math.max(0, dt)
  r.velocidad += (objetivo - r.velocidad) * (1 - Math.exp(-paso / R.inerciaS))
  const fin = r.fin + r.velocidad * paso
  r.fin = Math.min(1, Math.max(0, fin))
  // Contra un tope, quieta (al dar vuelta no arranca con la velocidad que traía contra el tope).
  if (r.fin !== fin) r.velocidad = 0
  if (r.fase === 'corre' && e.rebobina && r.fin === 0) r.fase = 'rebobinada'
}

/**
 * ¿Se retiene este gesto (no mueve la página)? Sólo al fondo y hacia arriba, mientras la cinemática no está en su inicio
 * (corre, o `fin` > 0) y, rebobinada del todo, mientras siga el gesto que la llevó a cero (`desdeElUltimoArribaS`: cuánto
 * hace del último gesto hacia arriba, sin contar éste).
 */
export function retieneElGesto(r: RelojDelFinal, alFondo: boolean, sentido: -1 | 1, desdeElUltimoArribaS: number): boolean {
  if (!alFondo || sentido > 0) return false
  return r.fase === 'corre' || r.fin > 0 || (r.fase === 'rebobinada' && desdeElUltimoArribaS < RELOJ_DEL_FINAL.sueltaS)
}

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
   * Desde qué scroll (px del documento) el pie queda quieto: [RETOQUE DEL ENCASTRE] 1D · sin cola, el fondo de la página
   * (antes, el arranque de la cola). Sin final, infinito. Las piezas del pie se colocan con este scroll como tope.
   */
  pegadoDesde: Number.POSITIVE_INFINITY,
  /**
   * [RETOQUE DEL ENCASTRE] 1D · si el pie terminó de aparecer entero (todas sus piezas en su lugar): lo escribe el pie de
   * volumen en cada cuadro; sin pie de volumen, `true` (el final no espera nada).
   */
  pieEntero: true,
  /**
   * [RETOQUE DEL ENCASTRE] 1G · cuánto giró la cámara sin el mouse por el final (en el mundo: de su orientación de ahora a
   * la de antes del final; sin final, ninguno). Con eso el pie ve la luz como antes de la cinemática (`pie3d/material.ts`).
   */
  giroDelPie: new THREE.Quaternion(),
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

/** [EL ENCASTRE] 2B · el reloj de la secuencia en segundos: `fin` por lo que dura. */
export function segundosDelFinal(fin: number): number {
  return fin * RELOJ_DEL_FINAL.duracionS
}

/** Cuánto se acostó el logo, de 0 a 1 (gira sobre su propio centro). */
export function acostado(fin: number): number {
  return suave(segundosDelFinal(fin) / FINAL_DEL_PIE.acostarseS)
}

/** Cuánto subió la cámara, de 0 a 1: en paralelo con el logo que se acuesta. */
export function subida(fin: number): number {
  const s = segundosDelFinal(fin)
  const { conElLogo } = FINAL_DEL_PIE.subida
  const desde = FINAL_DEL_PIE.caida.desdeS
  return conElLogo * suave(s / FINAL_DEL_PIE.acostarseS) + (1 - conElLogo) * suave((s - desde) / (FINAL_DEL_PIE.presion.hastaS - desde))
}

/** El tamaño del logo (u): su alto de tinta y su espesor. Lo publica `ProbeLogo` en las estadísticas. */
export interface TamanoDelLogo {
  readonly alto: number
  readonly espesor: number
}

/** La altura del centro del logo acostado sobre el piso (u) y cuándo llega ahí (s del reloj). */
function caidaDe(t: TamanoDelLogo): { readonly enElPiso: number; readonly aterrizaS: number } {
  const enElPiso = FLOOR_Y + t.espesor / 2
  return { enElPiso, aterrizaS: FINAL_DEL_PIE.caida.desdeS + Math.sqrt((2 * (ORBIT_TARGET_Y - enElPiso)) / FINAL_DEL_PIE.caida.gravedad) }
}

/** Cuándo toca el piso (s del reloj): ahí cae el golpe. */
export function aterrizaje(t: TamanoDelLogo): number {
  return caidaDe(t).aterrizaS
}

/** [EL ENCASTRE] 2D · en qué tramo de la presión está y cuánto lleva de él (0 a 1); `null` fuera de la presión. */
function tramoDeLaPresion(fin: number, t: TamanoDelLogo): { readonly i: number; readonly u: number; readonly antes: number } | null {
  const p = FINAL_DEL_PIE.presion
  const s = segundosDelFinal(fin)
  const t0 = caidaDe(t).aterrizaS
  if (s <= t0 || s >= p.hastaS) return null
  const x = ((s - t0) / (p.hastaS - t0)) * p.tramos.length
  const i = Math.min(p.tramos.length - 1, Math.floor(x))
  return { i, u: x - i, antes: p.tramos.slice(0, i).reduce((a, b) => a + b, 0) }
}

/**
 * Cuánto se hundió en el hueco (fracción del espesor, de 0 con la cara de abajo al ras del borde a 1 al ras del piso): a
 * presión, tramo a tramo. En cada uno resiste (apenas cede) y después cede de golpe (frena al final: 1 − (1 − v)³).
 */
export function hundido(fin: number, t: TamanoDelLogo): number {
  const p = FINAL_DEL_PIE.presion
  const s = segundosDelFinal(fin)
  if (s >= p.hastaS) return 1
  const tramo = tramoDeLaPresion(fin, t)
  if (tramo === null) return 0
  const v = (tramo.u - p.resiste) / (1 - p.resiste)
  const dentro = tramo.u < p.resiste ? p.cedeAlResistir * (tramo.u / p.resiste) : p.cedeAlResistir + (1 - p.cedeAlResistir) * (1 - (1 - v) ** 3)
  return tramo.antes + p.tramos[tramo.i] * dentro
}

/** Mientras resiste, el logo tiembla en su lugar (u, en el piso): el temblor de la presión. Fuera de eso, nada. */
export function temblorDelLogo(fin: number, t: TamanoDelLogo, destino: THREE.Vector3): THREE.Vector3 {
  const tramo = tramoDeLaPresion(fin, t)
  const p = FINAL_DEL_PIE.presion
  if (tramo === null || tramo.u >= p.resiste) return destino.set(0, 0, 0)
  const s = segundosDelFinal(fin)
  const a = p.temblor * Math.sin((Math.PI * tramo.u) / p.resiste)
  return destino.set(a * Math.sin(s * 211), 0, a * Math.sin(s * 173 + 1))
}

/** El sacudón chico de la cámara cada vez que cede (u): uno por tramo, que se apaga en una décima. */
export function sacudonDeLaPresion(fin: number, t: TamanoDelLogo, destino: THREE.Vector3): THREE.Vector3 {
  const tramo = tramoDeLaPresion(fin, t)
  const p = FINAL_DEL_PIE.presion
  if (tramo === null || tramo.u < p.resiste) return destino.set(0, 0, 0)
  // Los segundos desde que empezó a ceder en este tramo.
  const desde = (tramo.u - p.resiste) * ((p.hastaS - caidaDe(t).aterrizaS) / p.tramos.length)
  const a = p.sacudon * Math.exp(-desde / 0.1)
  const s = segundosDelFinal(fin)
  return destino.set(Math.sin(s * 97) * a, Math.sin(s * 83 + 2) * a, Math.sin(s * 71 + 1) * a)
}

/** [EL ENCASTRE] 2D · cuánto se abrió el hueco (0 a 1): desde el medio de los trazos hasta el borde exacto. */
export function apertura(fin: number): number {
  return suave((segundosDelFinal(fin) - HUECO.abre.desdeS) / (HUECO.abre.hastaS - HUECO.abre.desdeS))
}

/** Cuánto se calmó el mar alrededor del logo (0 a 1). */
export function calma(fin: number): number {
  const c = FINAL_DEL_PIE.calma
  return suave((segundosDelFinal(fin) - c.desdeS) / (c.hastaS - c.desdeS))
}

/**
 * La pose del logo en el final: gira EN SU LUGAR, sobre su propio centro, hacia atrás (`rotacionX`, de 0 a −90°: la cabeza
 * va al fondo), y después cae derecho al piso con gravedad y se hunde. Devuelve el centro (`centro`, en el mundo: siempre
 * sobre el eje, x = z = 0) y el giro; con `fin` 0, el logo de siempre (centro en el origen).
 */
export function poseDelLogo(fin: number, t: TamanoDelLogo, destino: { centro: THREE.Vector3; rotacionX: number }, conRebote = true): void {
  const s = segundosDelFinal(fin)
  const { enElPiso } = caidaDe(t)
  const c = Math.max(0, s - FINAL_DEL_PIE.caida.desdeS)
  const y = Math.max(enElPiso, ORBIT_TARGET_Y - 0.5 * FINAL_DEL_PIE.caida.gravedad * c * c)
  destino.centro.set(0, y - (conRebote ? hundido(fin, t) * t.espesor : 0), 0)
  destino.rotacionX = (-Math.PI / 2) * acostado(fin)
}

/** El blanco de la cámara: el centro del logo mientras se acuesta; con la caída baja al piso, un poco después que él. */
export function blancoDelFinal(fin: number, destino: THREE.Vector3): THREE.Vector3 {
  const b = suave((segundosDelFinal(fin) - FINAL_DEL_PIE.caida.desdeS) / FINAL_DEL_PIE.caida.blancoS)
  return destino.set(0, ORBIT_TARGET_Y + (FLOOR_Y - ORBIT_TARGET_Y) * b, 0)
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

/** [EL ENCASTRE] 2E · el poder liberado (0 hasta quedar al ras; un destello y después 1). Función de `fin`: se deshace al revertir. */
export function poder(fin: number): number {
  const p = FINAL_DEL_PIE.poder
  const s = segundosDelFinal(fin) - FINAL_DEL_PIE.presion.hastaS
  if (s <= 0) return 0
  if (s < p.subeS) return p.destello * suave(s / p.subeS)
  return 1 + (p.destello - 1) * (1 - suave((s - p.subeS) / p.asientaS))
}
