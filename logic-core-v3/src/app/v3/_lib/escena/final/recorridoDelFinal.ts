import * as THREE from 'three'

import { CURVAS, type NombreDeCurva } from '../../motion/curvas'
import { entornoDeLaEscena } from '../entorno'
import { FLOOR_Y, ORBIT_TARGET_Y } from '../probeScene'
import { CAIDA_AL_HUECO, aperturaDelHueco, arranqueDeLaCaida, caidaIntegrada, poseDeLaCaida, sombraDeLaCaida, type VarianteDeLaCaida } from './caidaAlHueco'

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
 * [NOCTURNO FINAL] A1 · UN gesto hacia arriba la rebobina entera, sola; A2 · al salir o en un viaje se deshace con tope.
 *
 * [PULIDO 11] D · 1 y 2 son UNA CAÍDA DE VERDAD (`caidaAlHueco.ts`): el logo baja parado hasta el piso y cae hacia atrás como una
 * ficha de dominó (o, con `?caida=angulo`, gira 90° en arco desde donde está), con la física de un cuerpo rígido, entra al ras
 * en su hueco (que se abre con la caída) y rebota apenas hasta asentarse. El contacto es el golpe, a los `CAIDA_AL_HUECO.golpeS`
 * del reloj. Se fueron el acostarse en su lugar, la caída derecha y la presión (con su temblor y sus sacudones).
 */
export const FINAL_DEL_PIE = {
  /**
   * [EL ENCASTRE] 2B · los tiempos van en segundos del reloj (`fin × RELOJ_DEL_FINAL.duracionS`). [PULIDO 11] D · la cámara sube
   * en paralelo con la caída: `conElLogo` de su camino hasta `hastaS` (el logo todavía de pie: se lo ve caer) y el resto hasta
   * `terminaTrasElGolpeS` después del golpe (mientras rebota y se asienta).
   */
  subida: { conElLogo: 0.8, hastaS: 2.6, terminaTrasElGolpeS: 0.4 },
  /** [PULIDO 11] D · el blanco de la cámara baja al piso (s del reloj): con el logo que baja y cae. */
  blanco: { desdeS: 0.4, hastaS: 2.8 },
  /**
   * El mar alrededor del logo se calma antes de que caiga (s del reloj). [PULIDO 11] D · desde que arranca: con la calma el piso
   * deja de esquivar al logo (su techo se apaga), así que tiene que pasar con el logo lejos (al arrancar está a 1,9 u del piso) y
   * terminar antes de que la lenta, que baja parada, se acerque al mar (a los 0,7 s su pie está a 0,7 u).
   */
  calma: { desdeS: 0, hastaS: 0.7 },
  /**
   * [EL ENCASTRE] 2E · EL PODER: al quedar al ras (el golpe) se libera: un destello (sube a `destello` en `subeS`) que se
   * asienta en el poder entero en `asientaS`. El golpe (su pulso) cae ahí. [PULIDO 11] D · el `golpecito` (u, de la cámara),
   * cuando vuelve a tocar después del primer rebote.
   */
  poder: { destello: 1.45, subeS: 0.12, asientaS: 0.9, golpecito: 0.03 },
  /** La cámara: la altura final (grados de elevación) y cuánto más lejos que en la pose E. */
  camara: { elevacion: 89.2, lejos: 1.06 },
  /**
   * Quieto en el pie: a los cuántos segundos sin scroll arranca, el giro (°/s), el tope del alejamiento (u) y su tiempo (s).
   * [NOCTURNO FINAL] A1/A2 · la VUELTA (al rebobinar, al salir, en un viaje) va con tope: el giro a lo sumo a `giroS`
   * (°/s) y frenando con `giroFreno` (°/s²), el alejamiento igual (u/s, u/s²). Llega a cero en un tiempo finito, sin el
   * coletazo de antes (media vuelta salía a 400°/s) ni su cola de segundos (la cámara seguía mirando al centro del logo).
   */
  quieto: { desdeS: 1.4, giroGradosS: 4.5, alejaHasta: 17, alejaS: 38, vuelta: { giroS: 90, giroFreno: 140, alejaS: 9, alejaFreno: 14 } },
  /** Cuánto adelante del blanco quedan las piezas del pie al final (u): las olas del piso no las tocan. */
  aireDelPie: 7,
  /** El golpe en la cámara: cuánto la sacude (u) y en cuánto se apaga (s). */
  sacudon: { amplitud: 0.07, s: 0.38 },
} as const

/**
 * [EL ENCASTRE] 2A · EL RELOJ DEL FINAL. [RETOQUE DEL ENCASTRE] 1D · CINEMÁTICA AUTOMÁTICA: sin la cola, la página termina
 * en el pie. Al fondo, la secuencia arranca sola recién cuando el pie terminó de aparecer entero (todas sus piezas en su
 * lugar) y corre a UNA velocidad (`duracionS`): el scroll hacia abajo no la adelanta.
 *
 * [NOCTURNO FINAL] A1 · EL REBOBINADO DE UN GESTO (antes rebobinaba sólo mientras siguiera el gesto: había que scrollear
 * mucho para sacar el logo y al soltar se volvía a encastrar). UN gesto hacia arriba mientras corre o ya terminó (uno: la
 * rueda hasta un silencio, un dedo, una tecla; `gestosDelScroll.ts`) dispara el rebobinado ENTERO, que corre solo a la
 * velocidad de la cinemática (`duracionS`, no acelerado; [PULIDO 1] P2 · ahora en `REBOBINADO`) hasta el logo parado; ese gesto se retiene (no mueve la página):
 * lo que sigue de él, durante `topeDelGestoS`, y su cola entera (la inercia de un trackpad, que se va apagando: cada
 * evento a lo sumo `colaDelGesto` del más fuerte); el que sigue girando la rueda después, sube. Rebobinada, espera PARADA: sin gestos durante `vuelveAEmpezarS` vuelve a correr
 * sola; un gesto hacia abajo la corre ya; un gesto NUEVO hacia arriba (rebobinando o parada) sube la página normal. Un
 * gesto hacia abajo justo después de uno hacia arriba (`cambioDeSentidoS`: el temblor de un dedo al levantarse) no cuenta.
 *
 * [NOCTURNO FINAL] A2 · LA SALIDA: fuera del fondo (la página subió) o en un viaje del menú se deshace sola, con tope
 * (`salida`, `velocidadDeSalida`): `fin` a lo sumo de punta a punta en `finS` y la cámara (su subida) a lo sumo en
 * `camaraS`. Antes un viaje la deshacía en 0,35 s: la cámara bajaba del cenit 10 u por cuadro (un salto). La velocidad se
 * persigue con una inercia corta (`inerciaS`): ningún cambio de sentido es de golpe. [PULIDO 1] P5 · eso queda para salir
 * del fondo; en un viaje del menú el final vuelve en paralelo con el recorrido (`VIAJE_DEL_FINAL`).
 */
// [PULIDO 11] D · `duracionS`: el golpe y lo que viene después de él (el destello, la expansión: 1,7 s, como antes del 4,7 al 6,4).
export const RELOJ_DEL_FINAL = { duracionS: CAIDA_AL_HUECO.golpeS + 1.7, vuelveAEmpezarS: 2.5, topeDelGestoS: 0.8, colaDelGesto: 0.5, cambioDeSentidoS: 0.3, salida: { finS: 1.2, camaraS: 1.2, mira: 0.12 }, inerciaS: 0.12 } as const

/**
 * [PULIDO 1] P2 · EL REBOBINADO, MÁS RÁPIDO. El mecanismo de A1 (un gesto, solo, hasta el logo parado; el reinicio a los
 * `vuelveAEmpezarS`) no cambia: cambia la velocidad. Antes volvía a la de la cinemática (6,4 s desde el final entero); ahora
 * dura lo que avanzó por `topeS` (desde el final entero, `topeS`; desde la mitad, la mitad) con la curva `simetrica` del
 * vocabulario (arranca y llega quieto). El giro y el alejamiento del quieto vuelven con el mismo reloj y la misma curva
 * (`quietoRebobinado`): desde cualquier punto, todo vuelve en a lo sumo `topeS`.
 */
export const REBOBINADO = { topeS: 1.6, curva: 'simetrica', minimoS: 1 } as const satisfies { readonly topeS: number; readonly curva: NombreDeCurva; readonly minimoS: number }

/**
 * [PULIDO 1] P2 · cuánto dura el rebobinado desde `desde` (lo avanzado, 0 a 1). Con `minimo` (la prueba
 * `rebobinado=minimo`: «entre 1 y 2 s desde cualquier punto»), nunca menos que eso.
 */
export function duracionDelRebobinado(desde: number, minimo = 0): number {
  const d = Math.min(1, Math.max(0, desde))
  return d <= 0 ? 0 : Math.max(minimo, REBOBINADO.topeS * d)
}

/** [PULIDO 1] P2 · el mínimo de la prueba, leído una vez. */
let minimoDelRebobinado: number | null = null
const minimoPedido = (): number => (minimoDelRebobinado ??= entornoDeLaEscena().pruebas.rebobinado === 'minimo' ? REBOBINADO.minimoS : 0)

/** [PULIDO 1] P2 · cuánto queda de lo que había al empezar el rebobinado (de 1 a 0) a los `s` de `dura` segundos. */
export function quedaDelRebobinado(s: number, dura: number): number {
  if (dura <= 0) return 0
  return 1 - CURVAS[REBOBINADO.curva](Math.min(1, Math.max(0, s / dura)))
}

/**
 * [PULIDO 1] P2 · el quieto mientras rebobina: lo que tenía al empezar por lo que queda (el mismo reloj y la misma curva
 * que el logo). Antes volvía por su cuenta con tope (`quieto.vuelta`, 90°/s): media vuelta tardaba más de 2 s.
 */
export function quietoRebobinado(alEmpezar: { readonly giro: number; readonly aleja: number }, queda: number, estado: { giro: number; aleja: number; giroV: number; alejaV: number }): void {
  estado.giro = queda > 0 ? alEmpezar.giro * queda : 0
  estado.aleja = queda > 0 ? alEmpezar.aleja * queda : 0
  estado.giroV = 0
  estado.alejaV = 0
}

/**
 * [PULIDO 1] P5 · EN UN VIAJE DEL MENÚ, EN PARALELO: el viaje dura lo mismo que cualquiera y el final vuelve adentro de él
 * mientras el scroll ya viaja (la cámara pasa de la del final a la del recorrido).
 *
 * [PULIDO 2] 2 · ES EL REBOBINADO DE P2, COMPRIMIDO EN EL PRIMER `dentroS` DEL VIAJE: la misma curva y el mismo reparto (todo
 * es función de `fin`: la cámara, el logo, el hueco y el piso, como en P2), con la duración de P2 (proporcional a lo
 * avanzado) escalada para que desde el final entero termine en `dentroS` (P2: 1,6 s). Corre con el RELOJ DEL VIAJE
 * (`segundosDelViaje`, el mismo que mueve el scroll): la cámara del recorrido no se adelanta a la vuelta. Se fueron el reparto
 * del tiempo por lo que se veía cambiar (pesos de cámara, logo y piso), el techo en una fracción del viaje y `vuelta=corta`.
 */
export const VIAJE_DEL_FINAL = { dentroS: 1 } as const

/** [PULIDO 2] 2 · cuánto tarda el final en volver en un viaje desde `desde`: el rebobinado de P2, comprimido a `dentroS`. */
export function duracionDeLaVuelta(desde: number): number {
  return (duracionDelRebobinado(desde) * VIAJE_DEL_FINAL.dentroS) / REBOBINADO.topeS
}

/**
 * `espera`: no corre (no está al fondo o el pie llega): se deshace con tope. `corre`: adelante. `rebobina`: hacia atrás,
 * sola ([PULIDO 1] P2 · en `duracionDelRebobinado`, con su curva). `parada`: rebobinada, quieta en cero hasta que vuelve a
 * empezar. `viaje`: [PULIDO 1] P5 · hay un viaje del menú: vuelve a cero en `vueltaEnElViaje`, en paralelo.
 */
export type FaseDelFinal = 'espera' | 'corre' | 'rebobina' | 'parada' | 'viaje'

/** Lo que el reloj recuerda de un cuadro al otro. */
export interface RelojDelFinal {
  fin: number
  /** Cuánto `fin` por segundo (la que persigue a la de su fase, con la inercia). */
  velocidad: number
  fase: FaseDelFinal
  /** [NOCTURNO FINAL] A1 · cuánto lleva parada (s). */
  paradaS: number
  /** [PULIDO 1] P2 · el rebobinado en curso: desde dónde (`fin` al empezar), cuánto lleva (s) y cuánto dura (s). P5 · y la vuelta de un viaje. */
  readonly rebobinado: { desde: number; s: number; dura: number; inicio: number }
}

export function relojQuieto(): RelojDelFinal {
  return { fin: 0, velocidad: 0, fase: 'espera', paradaS: 0, rebobinado: { desde: 0, s: 0, dura: 0, inicio: 0 } }
}

/** Lo que el reloj necesita saber en cada cuadro. */
export interface EntradaDelReloj {
  /** La página está al fondo (no queda scroll hacia abajo). */
  readonly alFondo: boolean
  /** Todas las piezas del pie llegaron a su lugar. */
  readonly pieEntero: boolean
  /** [NOCTURNO FINAL] A1 · un gesto hacia arriba pidió rebobinar (desde el cuadro anterior). */
  readonly rebobinar: boolean
  /** Hubo un gesto hacia abajo desde el cuadro anterior. */
  readonly haciaAbajo: boolean
  /** [NOCTURNO FINAL] A1 · cuánto hace del último gesto, de cualquier sentido (s). */
  readonly sinGestoS: number
  /** [PULIDO 1] P5 · cuánto dura el viaje del menú en curso, del click al frenazo (s); sin viaje, 0. */
  readonly viajeS: number
  /** [PULIDO 2] 2 · cuánto lleva ese viaje en el reloj del viaje (s); sin él (un banco de pruebas), el reloj del cuadro. */
  readonly enElViajeS?: number
}

/** [NOCTURNO FINAL] A2 · la pendiente de la subida de la cámara (cuánto se mueve por unidad de `fin`). */
function pendienteDeLaSubida(fin: number): number {
  const h = 1e-3
  const a = Math.max(0, fin - h)
  const b = Math.min(1, fin + h)
  return Math.abs(subida(b) - subida(a)) / (b - a)
}

/**
 * [NOCTURNO FINAL] A2 · lo más rápido que `fin` vuelve a cero al salir o en un viaje (por segundo): de punta a punta en
 * `salida.finS` como mucho, y más despacio donde la cámara se mueve más (su subida, `subida`, de punta a punta en
 * `salida.camaraS` como mucho). Mira la pendiente un poco hacia adelante (`salida.mira`, en `fin`): con la inercia del
 * reloj, frenar recién al entrar donde la cámara baja dejaba pasar el doble. Cerca de cero la cámara casi no se mueve:
 * llega en un tiempo finito.
 */
export function velocidadDeSalida(fin: number): number {
  const { finS, camaraS, mira } = RELOJ_DEL_FINAL.salida
  let pendiente = 0
  for (let i = 0; i <= 6; i += 1) pendiente = Math.max(pendiente, pendienteDeLaSubida(Math.max(0, fin - (mira * i) / 6)))
  return Math.min(1 / finS, 1 / (camaraS * Math.max(1e-6, pendiente)))
}

/** Un cuadro del reloj (escribe en `r`). */
export function pasoDelReloj(r: RelojDelFinal, e: EntradaDelReloj, dt: number): void {
  const R = RELOJ_DEL_FINAL
  const paso = Math.max(0, dt)
  let objetivo: number
  // [PULIDO 1] P5 · en un viaje: vuelve a cero desde donde esté (corriendo, rebobinando o saliendo: sin saltos). Al terminar
  // el viaje, a esperar (de ahí sale como siempre: al fondo con el pie entero, corre). [PULIDO 2] 2 · con el rebobinado de
  // P2 comprimido (`duracionDeLaVuelta`) y en el reloj del viaje.
  if (e.viajeS > 0) {
    const b = r.rebobinado
    if (r.fase !== 'viaje') {
      r.fase = 'viaje'
      b.desde = r.fin
      b.s = 0
      b.inicio = e.enElViajeS ?? 0
      b.dura = duracionDeLaVuelta(r.fin)
    }
    b.s = e.enElViajeS === undefined ? b.s + paso : Math.max(0, e.enElViajeS - b.inicio)
    const fin = b.desde * quedaDelRebobinado(b.s, b.dura)
    r.velocidad = paso > 0 ? (fin - r.fin) / paso : 0
    r.fin = fin
    return
  }
  if (r.fase === 'viaje') r.fase = 'espera'
  if (!e.alFondo) {
    r.fase = 'espera'
    objetivo = -velocidadDeSalida(r.fin)
  } else {
    if (r.fase === 'espera' && e.pieEntero) r.fase = 'corre'
    else if (r.fase === 'corre' && e.rebobinar && r.fin > 0) {
      r.fase = 'rebobina'
      r.rebobinado.desde = r.fin
      r.rebobinado.s = 0
      r.rebobinado.dura = duracionDelRebobinado(r.fin, minimoPedido())
    } else if (r.fase === 'rebobina' && e.haciaAbajo) r.fase = 'corre'
    else if (r.fase === 'parada') {
      r.paradaS += paso
      if (e.haciaAbajo || (r.paradaS >= R.vuelveAEmpezarS && e.sinGestoS >= R.vuelveAEmpezarS)) r.fase = 'corre'
    }
    // [PULIDO 1] P2 · rebobinando, `fin` es función del tiempo del rebobinado (su curva), no de una velocidad perseguida; la
    // velocidad queda anotada para que un gesto hacia abajo a mitad la retome sin salto.
    if (r.fase === 'rebobina') {
      const b = r.rebobinado
      b.s += paso
      const fin = b.desde * quedaDelRebobinado(b.s, b.dura)
      r.velocidad = paso > 0 ? (fin - r.fin) / paso : 0
      r.fin = fin
      if (r.fin <= 0) {
        r.fin = 0
        r.velocidad = 0
        r.fase = 'parada'
        r.paradaS = 0
      }
      return
    }
    if (r.fase === 'corre') objetivo = 1 / R.duracionS
    else if (r.fase === 'parada') objetivo = 0
    else objetivo = -velocidadDeSalida(r.fin)
  }
  r.velocidad += (objetivo - r.velocidad) * (1 - Math.exp(-paso / R.inerciaS))
  const fin = r.fin + r.velocidad * paso
  r.fin = Math.min(1, Math.max(0, fin))
  // Contra un tope, quieta (al dar vuelta no arranca con la velocidad que traía contra el tope).
  if (r.fin !== fin) r.velocidad = 0
}

/** [NOCTURNO FINAL] A1 · lo que un gesto hace con el final: si lo retiene (no mueve la página) y si pide rebobinar. */
export interface DecisionDelGesto {
  readonly retiene: boolean
  readonly rebobina: boolean
}
const NADA: DecisionDelGesto = { retiene: false, rebobina: false }
const REBOBINA: DecisionDelGesto = { retiene: true, rebobina: true }
const SIGUE: DecisionDelGesto = { retiene: true, rebobina: false }

/**
 * [NOCTURNO FINAL] A1 · sólo al fondo y hacia arriba. Un gesto que EMPIEZA (`nuevo`) mientras corre (o ya terminó) pide el
 * rebobinado y se retiene; los eventos que lo siguen (`retenido`: el gesto en curso se retuvo; `duraS`: cuánto lleva) se
 * retienen hasta `topeDelGestoS`, y después sólo su cola (`enLaCola`: la inercia que se apaga). Un gesto nuevo
 * rebobinando o parada no se retiene: la página sube normal.
 */
export function decidirElGesto(r: RelojDelFinal, alFondo: boolean, sentido: -1 | 1, nuevo: boolean, retenido: boolean, duraS: number, enLaCola: boolean): DecisionDelGesto {
  if (!alFondo || sentido > 0) return NADA
  if (nuevo) return r.fase === 'corre' && r.fin > 0 ? REBOBINA : NADA
  return retenido && (duraS < RELOJ_DEL_FINAL.topeDelGestoS || enLaCola) ? SIGUE : NADA
}

/** Lo que el final tiene en vivo: lo escribe `FinalDelPie` en cada cuadro y lo leen las piezas del pie y el piso. */
export const EN_VIVO = {
  fin: 0,
  /** Cuánto subió la cámara (0 a 1): `acostado(fin)`. */
  camara: 0,
  /** Lo que el reloj sumó estando quieto: el giro (grados) y el alejamiento (u); [NOCTURNO FINAL] A1 · y sus velocidades al volver. */
  giro: 0,
  aleja: 0,
  giroV: 0,
  alejaV: 0,
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

/** El tamaño del logo (u): su alto de tinta y su espesor. Lo publica `ProbeLogo` en las estadísticas. */
export interface TamanoDelLogo {
  readonly alto: number
  readonly espesor: number
  /** [PULIDO 1] P22 · el ancho (el encuadre del final abajo de 1024). */
  readonly ancho?: number
}

/**
 * Cuánto subió la cámara, de 0 a 1: en paralelo con la caída. [PULIDO 11] D · `conElLogo` hasta `subida.hastaS` y el resto hasta
 * un momento después del golpe.
 */
export function subida(fin: number): number {
  const s = segundosDelFinal(fin)
  const { conElLogo, hastaS, terminaTrasElGolpeS } = FINAL_DEL_PIE.subida
  const termina = CAIDA_AL_HUECO.golpeS + terminaTrasElGolpeS
  return conElLogo * suave(s / hastaS) + (1 - conElLogo) * suave((s - hastaS) / (termina - hastaS))
}

/** [PULIDO 11] D · el golpe (s del reloj): el contacto de la caída. Siempre el mismo (la caída arranca lo que dura antes). */
export function golpeDelFinal(): number {
  return CAIDA_AL_HUECO.golpeS
}

const TOQUES = { caida: null as ReturnType<typeof caidaIntegrada> | null, toques: [] as readonly number[] }
/** [PULIDO 11] D · los toques de la caída después del golpe (s del reloj): cada vez que vuelve a apoyarse después de un rebote. */
export function toquesDespuesDelGolpe(t: TamanoDelLogo, v: VarianteDeLaCaida): readonly number[] {
  const caida = caidaIntegrada(v, t)
  if (TOQUES.caida === caida) return TOQUES.toques
  const desde = arranqueDeLaCaida(v, t)
  TOQUES.caida = caida
  TOQUES.toques = caida.toques.slice(1).map((u) => desde + u)
  return TOQUES.toques
}

/** [EL ENCASTRE] 2D · cuánto se abrió el hueco (0 a 1). [PULIDO 11] D · con el ángulo de la caída, y entero justo antes del contacto. */
export function apertura(fin: number, t: TamanoDelLogo, v: VarianteDeLaCaida): number {
  return aperturaDelHueco(v, t, segundosDelFinal(fin))
}

/** Cuánto se calmó el mar alrededor del logo (0 a 1). */
export function calma(fin: number): number {
  const c = FINAL_DEL_PIE.calma
  return suave((segundosDelFinal(fin) - c.desdeS) / (c.hastaS - c.desdeS))
}

/**
 * La pose del logo en el final: [PULIDO 11] D · la de la caída (`caidaAlHueco.ts`): el centro (en el mundo, x = 0) y el giro
 * (`rotacionX`, de 0 a −90°: la cabeza va al fondo). Con `fin` 0, el logo de siempre (centro en el origen, sin giro).
 */
export function poseDelLogo(fin: number, t: TamanoDelLogo, v: VarianteDeLaCaida, destino: { centro: THREE.Vector3; rotacionX: number }): void {
  poseDeLaCaida(v, t, segundosDelFinal(fin), destino)
}

/** [PULIDO 2] 6 · la sombra del logo en el final: se va en el último tramo antes de apoyarse (u) y vuelve con un fundido (s). */
export const SOMBRA_EN_LA_CAIDA = { tramo: 1.5, entraS: 0.3 } as const

/**
 * [PULIDO 2] 6 · cuánta sombra pide la pose (0 apoyado o en el hueco, 1 en el aire); la que se ve la lleva `sombraConFundido`.
 * [PULIDO 11] D · la de la caída: entera en el aire y parado en el piso (la sombra sigue al logo: parado, la tiene al pie), se va
 * mientras cae al hueco. Sin final, entera (sin cuentas: corre en cada cuadro de todo el sitio).
 */
export function sombraDeLaPose(fin: number, t: TamanoDelLogo, v: VarianteDeLaCaida): number {
  return fin <= 0 ? 1 : sombraDeLaCaida(v, t, segundosDelFinal(fin))
}

/** [PULIDO 2] 6 · la sombra que se muestra: baja con la pose; sube hacia ella con un fundido (nunca de un cuadro al otro). */
export function sombraConFundido(anterior: number, objetivo: number, dt: number): number {
  if (!(objetivo > anterior)) return objetivo
  return objetivo + (anterior - objetivo) * Math.exp(-Math.max(0, dt) / SOMBRA_EN_LA_CAIDA.entraS)
}

/** El blanco de la cámara: el centro de la escena; [PULIDO 11] D · baja al piso con el logo que baja y cae. */
export function blancoDelFinal(fin: number, destino: THREE.Vector3): THREE.Vector3 {
  const { desdeS, hastaS } = FINAL_DEL_PIE.blanco
  const b = suave((segundosDelFinal(fin) - desdeS) / (hastaS - desdeS))
  return destino.set(0, ORBIT_TARGET_Y + (FLOOR_Y - ORBIT_TARGET_Y) * b, 0)
}

const BLANCO = new THREE.Vector3()
const ARRIBA = new THREE.Vector3()
const MIRA = new THREE.Matrix4()
const DE_FRENTE = new THREE.Quaternion()
const ENCUADRE = new THREE.Quaternion()
const PARTE_DEL_ENCUADRE = new THREE.Quaternion()
const CENTRO_DE_LA_ORBITA = new THREE.Vector3(0, ORBIT_TARGET_Y, 0)
const DERECHA_DE_LA_CAMARA = new THREE.Vector3()
const ARRIBA_DE_LA_CAMARA = new THREE.Vector3()

/** [PULIDO 2] 1 · dónde va el logo en la pantalla (coordenadas normalizadas, −1 a 1): el encuadre detrás del pie. */
export interface CorrimientoDelFinal {
  readonly x: number
  readonly y: number
}
const ARRIBA_DE_SIEMPRE = new THREE.Vector3(0, 1, 0)

/**
 * LA CÁMARA DEL FINAL: toma la cámara como la dejó el recorrido (en la pose E, mirando al origen) y la lleva por encima del
 * logo hasta mirarlo desde arriba, alrededor del blanco que baja con él; con `giro` y `aleja`, la vuelta y el alejamiento
 * del que se quedó. La «arriba» de la cámara es la de la órbita que pasa por encima (la derivada de la dirección respecto
 * de la elevación): sin vuelco en ningún punto, ni en el cenit. Con `k` 0 y sin giro ni alejamiento no la toca.
 *
 * [NOCTURNO FINAL] A2 · con el ENCUADRE del recorrido: la cámara del rig no mira al centro de la órbita, corre la mirada
 * para dejar el logo a un costado (`cameraFraming.ts`). El final miraba al centro y lo tiraba: mientras el giro del quieto
 * volvía (segundos después de un viaje del menú), la cámara quedaba centrada en el logo y, al apagarse, saltaba 8° al
 * encuadre de verdad. Ahora ese corrimiento (en la cámara) se conserva y se va con la subida: con `k` 0 la cámara del
 * final es la del rig girada; arriba, centrada en el logo. Continua con el rig en los dos extremos.
 */
export function camaraDelFinal(c: THREE.Camera, k: number, blanco: THREE.Vector3, giro: number, aleja: number, sacudon: THREE.Vector3 | null, distancia: number | null = null, corrimiento: CorrimientoDelFinal | null = null): void {
  if (k <= 0 && giro === 0 && aleja === 0) return
  MIRA.lookAt(c.position, CENTRO_DE_LA_ORBITA, ARRIBA_DE_SIEMPRE)
  DE_FRENTE.setFromRotationMatrix(MIRA)
  ENCUADRE.copy(DE_FRENTE).invert().multiply(c.quaternion)
  const dx = c.position.x
  const dz = c.position.z
  const dy = c.position.y - ORBIT_TARGET_Y
  const az0 = Math.atan2(dx, dz)
  const r0 = Math.hypot(dx, dy, dz)
  const e0 = Math.atan2(dy, Math.hypot(dx, dz))
  const e = e0 + (THREE.MathUtils.degToRad(FINAL_DEL_PIE.camara.elevacion) - e0) * k
  // [PULIDO 1] P22 · arriba, a `distancia` si la hay (el encuadre del teléfono); si no, un poco más lejos que en la pose E.
  const r = r0 + ((distancia ?? r0 * FINAL_DEL_PIE.camara.lejos) - r0) * k + aleja
  const az = az0 + THREE.MathUtils.degToRad(giro)
  BLANCO.set(0, ORBIT_TARGET_Y, 0).lerp(blanco, k)
  c.position.set(BLANCO.x + r * Math.cos(e) * Math.sin(az), BLANCO.y + r * Math.sin(e), BLANCO.z + r * Math.cos(e) * Math.cos(az))
  if (sacudon !== null) c.position.add(sacudon)
  ARRIBA.set(-Math.sin(e) * Math.sin(az), Math.cos(e), -Math.sin(e) * Math.cos(az))
  c.up.copy(ARRIBA)
  c.lookAt(BLANCO)
  c.quaternion.multiply(PARTE_DEL_ENCUADRE.identity().slerp(ENCUADRE, 1 - k))
  // [PULIDO 2] 1 · el logo fuera del centro (abajo de 1024, en el hueco entre los elementos del pie): la cámara se corre en
  // su propio plano, sin girar, lo que pide el punto a la distancia del logo (así queda ahí también al alejarse el quieto).
  if (corrimiento !== null && c instanceof THREE.PerspectiveCamera) {
    const medioAlto = c.position.distanceTo(BLANCO) * Math.tan(THREE.MathUtils.degToRad(c.fov) / 2)
    DERECHA_DE_LA_CAMARA.set(1, 0, 0).applyQuaternion(c.quaternion)
    ARRIBA_DE_LA_CAMARA.set(0, 1, 0).applyQuaternion(c.quaternion)
    c.position.addScaledVector(DERECHA_DE_LA_CAMARA, -corrimiento.x * medioAlto * c.aspect * k).addScaledVector(ARRIBA_DE_LA_CAMARA, -corrimiento.y * medioAlto * k)
  }
  c.up.set(0, 1, 0)
  c.updateMatrixWorld()
}

/**
 * [PULIDO 1] P22 · EL ENCUADRE DEL FINAL ABAJO DE 1024: desde arriba, la distancia a la que el logo acostado (y su hueco, que
 * es su misma huella) ocupa `ocupa` de la dimensión del cuadro que lo limita: el ancho en un teléfono vertical, el alto en uno
 * apaisado. En escritorio la cámara se aleja apenas (`camara.lejos`) porque alrededor están las piezas del pie; abajo de 1024
 * no hay piezas en el escenario y, con esa distancia, en un teléfono apaisado el logo quedaba en el 13 % del ancho.
 */
export const ENCUADRE_ANGOSTO = { ocupa: 0.5 } as const

/** [PULIDO 1] P22 · esa distancia (u), con el campo vertical de la cámara (grados), su aspecto y la huella del logo (u). */
export function distanciaDelFinalAngosto(fovGrados: number, aspecto: number, ancho: number, fondo: number): number {
  const visible = 2 * Math.tan(THREE.MathUtils.degToRad(fovGrados) / 2) * ENCUADRE_ANGOSTO.ocupa
  return Math.max(ancho / (visible * aspecto), fondo / visible)
}

/** [PULIDO 2] 1 · la distancia (u) a la que la huella del logo (`ancho`, u) ocupa `fraccion` del ancho del cuadro. */
export function distanciaParaElAncho(fovGrados: number, aspecto: number, ancho: number, fraccion: number): number {
  return ancho / (2 * Math.tan(THREE.MathUtils.degToRad(fovGrados) / 2) * aspecto * Math.max(0.05, fraccion))
}

/** [NOCTURNO FINAL] A1/A2 · lo que deja `haciaCero` (sin reservas por cuadro). */
const HACIA_CERO = { x: 0, v: 0 }

/**
 * [NOCTURNO FINAL] A1/A2 · un paso hacia cero con tope: la velocidad persigue (con la inercia del reloj) la más alta que
 * todavía frena a tiempo (`√(2·freno·|x|)`) sin pasar `maxima`. Llega en un tiempo finito y sin pasarse.
 */
export function haciaCero(x: number, v: number, maxima: number, freno: number, dt: number): { readonly x: number; readonly v: number } {
  const objetivo = -Math.sign(x) * Math.min(maxima, Math.sqrt(2 * freno * Math.abs(x)))
  const nv = v + (objetivo - v) * (1 - Math.exp(-Math.max(0, dt) / RELOJ_DEL_FINAL.inerciaS))
  const nx = x + nv * dt
  const llego = x === 0 || Math.sign(nx) !== Math.sign(x) || Math.abs(nx) < 1e-4
  HACIA_CERO.x = llego ? 0 : nx
  HACIA_CERO.v = llego ? 0 : nv
  return HACIA_CERO
}

/**
 * QUIETO EN EL PIE: el reloj del que se quedó. Con el final entero y sin scroll hace `quieto.desdeS`, la cámara gira sin
 * fin y se aleja hacia su tope (1 − e^(−t/τ): siempre un poco más, nunca más que el tope); si no, todo vuelve a cero (el
 * giro por el camino corto) con tope ([NOCTURNO FINAL] A1/A2 · `quieto.vuelta`). Devuelve el nuevo tiempo quieto.
 */
export function relojDelQuieto(quietoS: number, finEntero: boolean, sinScrollS: number, dt: number, estado: { giro: number; aleja: number; giroV: number; alejaV: number }): number {
  const q = FINAL_DEL_PIE.quieto
  if (finEntero && sinScrollS >= q.desdeS) {
    const t = quietoS + dt
    estado.giro += q.giroGradosS * dt
    estado.aleja = q.alejaHasta * (1 - Math.exp(-t / q.alejaS))
    estado.giroV = q.giroGradosS
    estado.alejaV = (q.alejaHasta / q.alejaS) * Math.exp(-t / q.alejaS)
    return t
  }
  const giro = haciaCero(((((estado.giro + 180) % 360) + 360) % 360) - 180, estado.giroV, q.vuelta.giroS, q.vuelta.giroFreno, dt)
  estado.giro = giro.x
  estado.giroV = giro.v
  const aleja = haciaCero(estado.aleja, estado.alejaV, q.vuelta.alejaS, q.vuelta.alejaFreno, dt)
  estado.aleja = aleja.x
  estado.alejaV = aleja.v
  return 0
}

/** Las piezas del pie, en el final: cuánto adelante del blanco quedan como mucho (sin final, infinito: la regla de siempre). */
export function profundidadDelFinal(camara: THREE.Camera): number {
  if (EN_VIVO.camara <= 0) return Number.POSITIVE_INFINITY
  BLANCO.set(0, ORBIT_TARGET_Y, 0).lerp(EN_VIVO.blanco, EN_VIVO.camara)
  return camara.position.distanceTo(BLANCO) - FINAL_DEL_PIE.aireDelPie * EN_VIVO.camara
}

/**
 * [NOCTURNO FINAL] B2 · el atardecer del final; [PULIDO 1] P1 · un oscurecimiento parejo y neutro de la sala. [PULIDO 3] A1 ·
 * LA EXPANSIÓN DE LA ENERGÍA: en el golpe del logo la energía sale del hueco y cubre la escena en `duraS` (y la sala se
 * oscurece con ella). Es función de `fin`: al rebobinar se retira hacia el hueco con la curva del rebobinado (P2), sin cortes.
 */
export const EXPANSION_DE_LA_LUZ = { duraS: 1.5 } as const

/** [PULIDO 3] A1 · cuánto se expandió la energía (0 a 1) desde el golpe. */
export function expansionDeLaLuz(fin: number): number {
  return Math.min(1, Math.max(0, (segundosDelFinal(fin) - golpeDelFinal()) / EXPANSION_DE_LA_LUZ.duraS))
}

/** [EL ENCASTRE] 2E · el poder liberado (0 hasta quedar al ras; un destello y después 1). Función de `fin`: se deshace al revertir. */
export function poder(fin: number): number {
  const p = FINAL_DEL_PIE.poder
  const s = segundosDelFinal(fin) - golpeDelFinal()
  if (s <= 0) return 0
  if (s < p.subeS) return p.destello * suave(s / p.subeS)
  return 1 + (p.destello - 1) * (1 - suave((s - p.subeS) / p.asientaS))
}
