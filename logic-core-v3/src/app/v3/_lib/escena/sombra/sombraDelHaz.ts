/**
 * [ESCENA 5] 5c · LA SOMBRA SEGÚN EL HAZ — pura: cómo cambia la mancha de contacto con la luz que la
 * pisa. De noche, bajo el haz de E1, la luz es cenital y dura: la mancha se cierra y se oscurece (una
 * segunda mancha de borde duro, `dura`). De día la luz es el cielo amplio del estudio: la mancha se
 * abre y se aclara. Sin E1 no cambia nada. Se suma a la sombra con física (`entorno/sombra.ts`), no
 * la reemplaza.
 */
export const SOMBRA_DEL_HAZ = {
  /** De día: cuánto se agranda y cuánto se aclara la mancha blanda. */
  dia: { escala: 1.2, opacidad: 0.8 },
  /** De noche: cuánto se apaga la blanda, y la dura (su tamaño contra la blanda y su densidad). */
  noche: { blanda: 0.35, escalaDura: 0.82, opacidadDura: 1.75 },
  /** El sprite de la mancha dura: núcleo ancho y caída abrupta. */
  sprite: { nucleo: 0.62, caida: 6 },
} as const

export interface ManchasDelHaz {
  readonly escalaBlanda: number
  readonly opacidadBlanda: number
  readonly escalaDura: number
  readonly opacidadDura: number
}

/** `noche` 0 de día, 1 de noche (el `uNoche` de la escena); `haz` si E1 está prendida. */
export function manchasDelHaz(noche: number, haz: boolean): ManchasDelHaz {
  if (!haz) return { escalaBlanda: 1, opacidadBlanda: 1, escalaDura: 1, opacidadDura: 0 }
  const n = Math.min(1, Math.max(0, noche))
  const s = SOMBRA_DEL_HAZ
  return {
    escalaBlanda: s.dia.escala + (1 - s.dia.escala) * n,
    opacidadBlanda: s.dia.opacidad + (s.noche.blanda - s.dia.opacidad) * n,
    escalaDura: s.noche.escalaDura,
    opacidadDura: s.noche.opacidadDura * n,
  }
}
