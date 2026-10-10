/**
 * [ESCENA 5] 5b · EL POLVO QUE SE POSA — pura: la quietud y el despertar.
 *
 * Después de `empiezaS` sin scroll ni cursor, el polvo baja despacio y a los `asentadoS` está en el
 * piso del escenario; cada mota con su propio retraso (`desparejoS`), para que no bajen en bloque. El
 * scroll o el cursor lo levantan, y el despertar se propaga desde donde empezó el movimiento a
 * `velocidad` unidades por segundo: el cursor, desde el punto del piso que tiene debajo; el scroll,
 * desde la cámara. Con movimiento reducido no se posa.
 *
 * [ESCENA 6] Cómo baja y cómo sube cada mota ya no es una cuenta de su altura: es la física de
 * `simulacion.ts` (arrastre, turbulencia, el remolino del despertar, el logo). Acá quedan los tiempos y
 * la máquina de la quietud, que la física lee.
 *
 * El estado vive en tres instantes (en el reloj de la escena) y un punto: desde cuándo está quieto
 * (`quieto`, infinito mientras hay movimiento), cuándo despertó (`desperto`), desde cuándo estaba
 * quieto antes de despertar (`antes`) y de dónde salió el despertar (`origen`). Con eso el shader
 * sabe, mota por mota, cuánto se había posado cuando le llegó el frente y cuánto le queda subir.
 */
export const POSARSE = {
  // [ESCENA 7] T4: los tiempos a la mitad. Empezaba a los 8 s y quedaba todo en el piso a los ~20 (medido);
  // ahora empieza a los 4 y el objetivo de la caída (9,5 s más el desparejo) lo deja en el piso a los ~10.
  empiezaS: 4,
  asentadoS: 9.5,
  desparejoS: 1.5,
  velocidad: 16,
  subidaS: 1.8,
  /** Cuánto tiene que pasar sin movimiento para que cuente como quieto. */
  quietudS: 0.25,
  /** Sobre el piso, lo que queda arriba de la mota posada (0 a esto, al azar). */
  alturaPosada: 0.12,
} as const

export interface EstadoDelPolvo {
  readonly quieto: number
  readonly desperto: number
  readonly antes: number
  readonly origen: readonly [number, number, number]
  readonly ultimoMovimiento: number
  /** [RETOQUE 3D] B3 · si el despertar salió del cursor (con remolino) o del scroll (sólo el frente). */
  readonly delCursor: boolean
}

export const NUNCA = 1e9

export function polvoInicial(t: number): EstadoDelPolvo {
  return { quieto: t, desperto: -NUNCA, antes: -NUNCA, origen: [0, 0, 0], ultimoMovimiento: t, delCursor: false }
}

/**
 * Un paso: `movimiento` trae el origen si en este cuadro hubo scroll o cursor, o `null`. Con
 * `reducido`, nunca queda quieto.
 */
export function avanzarElPolvo(e: EstadoDelPolvo, t: number, movimiento: readonly [number, number, number] | null, reducido: boolean, delCursor = false): EstadoDelPolvo {
  const copia: EstadoDelPolvoVivo = { ...e, origen: [e.origen[0], e.origen[1], e.origen[2]] }
  avanzarElPolvoEn(copia, t, movimiento, reducido, delCursor)
  return copia
}

/** [CALIDAD 1] B2 · el estado que la escena reusa en cada cuadro: el mismo, escribible. */
export interface EstadoDelPolvoVivo {
  quieto: number
  desperto: number
  antes: number
  origen: [number, number, number]
  ultimoMovimiento: number
  delCursor: boolean
}

/**
 * [CALIDAD 1] B2 · la misma cuenta que `avanzarElPolvo`, escribiendo en `e`: la escena la corre en cada cuadro sin
 * reservar nada (el origen del despertar se copia, no se guarda la referencia).
 */
export function avanzarElPolvoEn(e: EstadoDelPolvoVivo, t: number, movimiento: readonly [number, number, number] | null, reducido: boolean, delCursor = false): void {
  if (reducido) {
    e.quieto = NUNCA
    e.ultimoMovimiento = t
    return
  }
  if (movimiento !== null) {
    // Despierta sólo si estaba quieto: mientras sigue el movimiento, el frente ya salió.
    if (e.quieto < NUNCA) {
      e.antes = e.quieto
      e.quieto = NUNCA
      e.desperto = t
      e.origen[0] = movimiento[0]
      e.origen[1] = movimiento[1]
      e.origen[2] = movimiento[2]
      e.delCursor = delCursor
    }
    e.ultimoMovimiento = t
    return
  }
  if (e.quieto >= NUNCA && t - e.ultimoMovimiento > POSARSE.quietudS) e.quieto = e.ultimoMovimiento
}

/**
 * [PULIDO 9] H1 · EL FRENTE QUE LEVANTA LO POSADO: el del último despertar que encontró el polvo posado (la quietud duró
 * más que `empiezaS`), con su origen y si fue del cursor. Lo lee la simulación hasta el próximo despertar así.
 *
 * La causa del polvo que no se levantaba: la escena le pasaba a la simulación ese despertar sólo en el cuadro en que era el
 * último, y si no un despertar de nunca (−1e9). Con la rueda, la muesca siguiente llega después de `quietudS` y antes de
 * `empiezaS`: es un despertar nuevo, sin polvo posado, y apagaba el frente de la primera. Lo que ese frente todavía no había
 * alcanzado quedaba en el piso hasta otra quietud larga (medido en Portfolio de noche, con 15 s de rueda: 11.810 de 14.000).
 */
export interface FrenteDelPolvo {
  desperto: number
  origen: [number, number, number]
  delCursor: boolean
}

export function frenteInicial(): FrenteDelPolvo {
  return { desperto: -NUNCA, origen: [0, 0, 0], delCursor: false }
}

/** Toma el despertar de `e` como el frente (escribe en `f`: copia el origen, no guarda la referencia). */
export function tomarElFrente(f: FrenteDelPolvo, e: EstadoDelPolvo | EstadoDelPolvoVivo): void {
  f.desperto = e.desperto
  f.origen[0] = e.origen[0]
  f.origen[1] = e.origen[1]
  f.origen[2] = e.origen[2]
  f.delCursor = e.delCursor
}

/**
 * [PULIDO 10] J10 · LA HISTÉRESIS: una vez despertado lo posado, termina de subir (`subidaS`, medido en H1: con la rueda, las
 * 14.000 en el aire a los 8,5–9 s) y pasa `enElAireS` en el aire antes de volver a evaluar si se posa. Sin esto, con un solo
 * toque de scroll subía y a los 4 s de quietud volvía a bajar antes de terminar de subir. La quietud que lee la simulación no
 * empieza antes de `desperto + subidaS + enElAireS − empiezaS` (la caída arranca `empiezaS` después de ella).
 */
export const HISTERESIS = { subidaS: 9.5, enElAireS: 6 } as const

export function quietoConHisteresis(quieto: number, frente: FrenteDelPolvo): number {
  if (quieto >= NUNCA) return quieto
  return Math.max(quieto, frente.desperto + HISTERESIS.subidaS + HISTERESIS.enElAireS - POSARSE.empiezaS)
}
