/**
 * [ESCENA 5] 5c · LA SOMBRA SEGÚN EL HAZ — pura: cómo cambia la mancha de contacto con la luz que la
 * pisa. De noche, bajo el haz de E1, la luz es cenital y dura: la mancha se cierra y se oscurece (una
 * segunda mancha de borde duro, `dura`). De día la luz es el cielo amplio del estudio: la mancha se
 * abre y se aclara. Sin E1 no cambia nada. Se suma a la sombra con física (`entorno/sombra.ts`), no
 * la reemplaza.
 *
 * [ESCENA 10] T1 · de noche la ÚNICA sombra es la del haz, que es la única luz: la blanda se apaga del todo (era el
 * 35 %). Y cada una sigue a lo suyo: la blanda es del día (sigue a la noche en el logo, `nocheDelLogo`), la dura es del
 * haz (sigue a la noche por lo prendido del haz, `k`, con su encendido). Con el haz apagado un instante en su encendido
 * no queda ninguna: sin luz no hay sombra.
 *
 * [Cierre de INTERFAZ 2] · de día tampoco hay mancha blanda: dos sombras no tenían sentido (la mancha elíptica debajo del
 * logo y la sombra real con forma de «cp», corrida, `sombra/delLogo.ts`). De día queda sólo la real; de noche, sólo la
 * del haz. La blanda vale cero siempre (con E1): el paso entre las dos sombras es el de siempre, sin saltos.
 */
export const SOMBRA_DEL_HAZ = {
  /** De día: cuánto se agranda la mancha blanda y cuánto queda de ella (nada: de día la sombra es la del logo). */
  dia: { escala: 1.2, opacidad: 0 },
  /** De noche: cuánto queda de la blanda (nada), y la dura (su tamaño contra la blanda y su densidad). */
  noche: { blanda: 0, escalaDura: 0.82, opacidadDura: 1.75 },
  /** El sprite de la mancha dura: núcleo ancho y caída abrupta. */
  sprite: { nucleo: 0.62, caida: 6 },
} as const

export interface ManchasDelHaz {
  readonly escalaBlanda: number
  readonly opacidadBlanda: number
  readonly escalaDura: number
  readonly opacidadDura: number
}

/** `noche` 0 de día, 1 de noche (la noche en el logo); `k`, lo prendido del haz (1 sin el encendido); `haz` si E1 está prendida. */
export function manchasDelHaz(noche: number, k: number, haz: boolean): ManchasDelHaz {
  if (!haz) return { escalaBlanda: 1, opacidadBlanda: 1, escalaDura: 1, opacidadDura: 0 }
  const n = Math.min(1, Math.max(0, noche))
  const s = SOMBRA_DEL_HAZ
  return {
    escalaBlanda: s.dia.escala + (1 - s.dia.escala) * n,
    opacidadBlanda: s.dia.opacidad + (s.noche.blanda - s.dia.opacidad) * n,
    escalaDura: s.noche.escalaDura,
    opacidadDura: s.noche.opacidadDura * Math.min(1, n * Math.max(0, k)),
  }
}
