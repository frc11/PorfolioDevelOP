import type { TargetAndTransition, Transition } from 'motion/react'

/**
 * [PULIDO 11] B1 · EL VOLTEO DE LOS DOS FORMULARIOS (el del pie y el panel de Contacto) — la única transformación entre el
 * formulario, la carga y la tarjeta del resultado (el hundido se borró). Lo nuevo guarda la CAJA de lo que estaba (el mismo alto:
 * la tarjeta ocupa la placa entera), así que las dos comparten el eje y nada se teletransporta en el cambio. Dos estrategias,
 * con `?volteo=`:
 *
 *   · `centrado` (la de siempre): las dos giran sobre el eje horizontal del medio, en un solo movimiento de 180° (la que estaba
 *     hasta quedar de canto; la nueva, desde el canto).
 *   · `columpio`: la bisagra en el BORDE DE ARRIBA, compartido. La que estaba gira 90° hacia ADENTRO de la pantalla (se cae
 *     hacia arriba y atrás, acelerando como un cuerpo que cae); de canto se cambia, y la nueva vuelve esos 90° desde el otro
 *     lado, SALIENDO de la pantalla, y se asienta con un resorte amortiguado (un rebote chico, como un columpio que frena).
 *
 * Con movimiento reducido, un fundido. Las curvas son las mismas en el DOM (Motion) y en la placa 3D del pie
 * (`escena/pie3d/transformacionDelPie.ts`).
 */
export type VarianteDelVolteo = 'centrado' | 'columpio'

/** La variante pedida (sin pedir, o con otro valor: `centrado`). */
export function varianteDelVolteo(valor: string | null | undefined): VarianteDelVolteo {
  return valor === 'columpio' ? 'columpio' : 'centrado'
}

/** La de la consulta de la página. */
export function varianteDeLaPagina(): VarianteDelVolteo {
  return typeof window === 'undefined' ? 'centrado' : varianteDelVolteo(new URLSearchParams(window.location.search).get('volteo'))
}

/**
 * Los tiempos (s). `centrado`: el giro entero. `columpio`: la caída (de 0 a 90°) y el asiento (de 90° a 0 con el resorte:
 * `zeta`, la amortiguación —0,62: un rebote de ~7°—, y `omega`, la frecuencia natural, rad/s). `fundido`: con movimiento reducido.
 */
export const VOLTEO = {
  centrado: { s: 0.9 },
  columpio: { cae: 0.42, asienta: 0.95, zeta: 0.62, omega: 11 },
  fundido: { s: 0.4 },
} as const

/** La duración entera de un volteo. */
export function duracionDelVolteo(variante: VarianteDelVolteo, reducido: boolean): number {
  if (reducido) return VOLTEO.fundido.s
  return variante === 'centrado' ? VOLTEO.centrado.s : VOLTEO.columpio.cae + VOLTEO.columpio.asienta
}

/** La caída del columpio (0 a 1 de su tiempo → 0 a 1 de sus 90°): arranca quieta y acelera (cúbica de entrada). */
export const caidaDelColumpio = (u: number): number => {
  const x = Math.min(1, Math.max(0, u))
  return x * x * x
}

/**
 * El asiento del columpio a los `t` s: cuánto le falta de sus 90° (1 al empezar, 0 asentado; negativo, pasado: el rebote). La
 * respuesta de un resorte subamortiguado que sale del reposo: e^(−ζωt)·(cos(ω_d·t) + ζω/ω_d·sin(ω_d·t)).
 */
export function asientoDelColumpio(t: number): number {
  const { zeta, omega } = VOLTEO.columpio
  if (t <= 0) return 1
  const wd = omega * Math.sqrt(1 - zeta * zeta)
  return Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t))
}

const CURVA: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const CAE: [number, number, number, number] = [0.55, 0, 1, 0.45]

/** Lo que Motion necesita para que un estado entre y salga (con `AnimatePresence` en `mode="wait"`). */
export interface TransicionDelVolteo {
  readonly initial: TargetAndTransition | false
  readonly animate: TargetAndTransition
  readonly exit: TargetAndTransition
  readonly transition: Transition
  readonly style: { readonly transformOrigin: string }
}

/** Las muestras del asiento, para Motion (cuadros de 1/30 s): los grados de cada una. */
const MUESTRAS = Math.round(VOLTEO.columpio.asienta * 30)
const ASIENTO_EN_GRADOS: number[] = Array.from({ length: MUESTRAS + 1 }, (_, k) => (k === MUESTRAS ? 0 : 90 * asientoDelColumpio((k / MUESTRAS) * VOLTEO.columpio.asienta)))

/**
 * El cambio de un estado al otro en el DOM. `quieto`: el pie en 3D (lo gira la escena): ninguna transformada.
 */
export function transicionDelVolteo(variante: VarianteDelVolteo, reducido: boolean, quieto = false): TransicionDelVolteo {
  if (quieto) return { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 }, style: { transformOrigin: '50% 50%' } }
  if (reducido) return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: VOLTEO.fundido.s / 2, ease: CURVA }, style: { transformOrigin: '50% 50%' } }
  if (variante === 'centrado') {
    const mitad = VOLTEO.centrado.s / 2
    return { initial: { rotateX: -90 }, animate: { rotateX: 0 }, exit: { rotateX: 90, transition: { duration: mitad, ease: [0.55, 0, 0.75, 0.45] } }, transition: { duration: mitad, ease: CURVA }, style: { transformOrigin: '50% 50%' } }
  }
  // El columpio: la bisagra arriba. Sale hacia adentro (−90°: el borde de abajo se va atrás) y la nueva entra desde afuera (+90°).
  return {
    initial: { rotateX: 90 },
    animate: { rotateX: ASIENTO_EN_GRADOS },
    exit: { rotateX: -90, transition: { duration: VOLTEO.columpio.cae, ease: CAE } },
    transition: { duration: VOLTEO.columpio.asienta, ease: 'linear' },
    style: { transformOrigin: '50% 0%' },
  }
}

/** El evento que la placa 3D del pie despacha en el formulario cuando termina de voltear (lo nuevo ya se ve). */
export const VOLTEO_TERMINADO = 'develop:volteo-terminado'
