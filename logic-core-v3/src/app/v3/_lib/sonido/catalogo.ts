import type { Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · LOS SONIDOS, UNO POR UNO — qué es cada uno, cuánto suena (la base: el sitio arranca bajo y la
 * página de prueba, `/v3?sonidos=1`, deja moverlo de oído) y cada cuánto puede repetirse. Los archivos: un sprite
 * generado (`sprite.ts`, `scripts-3d-sonido/t2-sonidos.ts`); las fuentes y la licencia, `docs/rediseno/SONIDO.md`.
 *
 *   · `separacionMs`: lo mínimo entre dos del mismo (un hover que barre la barra no ametralla).
 *   · `exclusivo`: mientras suena no se vuelve a largar (el encendido, el amanecer, el túnel).
 *   · Los dos ambientes son bucles y no los larga nadie: los lleva el motor con la noche que se ve.
 */
export interface DelSonido {
  readonly que: string
  readonly volumen: number
  readonly separacionMs: number
  readonly exclusivo: boolean
  readonly ambiente: boolean
}

export const SONIDOS: Readonly<Record<Sonido, DelSonido>> = {
  tic: { que: 'El hover de la barra: un tic muy suave', volumen: 0.14, separacionMs: 45, exclusivo: false, ambiente: false },
  clic: { que: 'Los botones y el CTA: un clic', volumen: 0.22, separacionMs: 60, exclusivo: false, ambiente: false },
  abre: { que: 'Abrir el menú o una demo (el Genie)', volumen: 0.2, separacionMs: 120, exclusivo: false, ambiente: false },
  cierra: { que: 'Cerrar el menú o una demo (el Genie)', volumen: 0.2, separacionMs: 120, exclusivo: false, ambiente: false },
  pulso: { que: 'El pulso del logo: un golpe grave casi imperceptible', volumen: 0.32, separacionMs: 900, exclusivo: false, ambiente: false },
  encendido: { que: 'El haz que se enciende: el zumbido sigue a los intentos que fallan y al golpe', volumen: 0.22, separacionMs: 0, exclusivo: true, ambiente: false },
  amanecer: { que: 'El amanecer: un crescendo suave', volumen: 0.2, separacionMs: 0, exclusivo: true, ambiente: false },
  tunel: { que: 'Entrar al túnel de Trabajos: un soplido', volumen: 0.2, separacionMs: 1500, exclusivo: true, ambiente: false },
  foto: { que: 'El hover de las fotos del equipo: un roce mínimo', volumen: 0.12, separacionMs: 120, exclusivo: false, ambiente: false },
  dia: { que: 'El ambiente de día (bucle, muy bajo)', volumen: 0.05, separacionMs: 0, exclusivo: false, ambiente: true },
  noche: { que: 'El ambiente de noche (bucle, muy bajo)', volumen: 0.06, separacionMs: 0, exclusivo: false, ambiente: true },
}

/** El volumen general (todo pasa por acá: el sitio suena bajo). */
export const VOLUMEN_GENERAL = 0.7

/** Lo que tarda el ambiente en seguir a la noche (un fundido entre el de día y el de noche), y en irse. */
export const FUNDIDO_DEL_AMBIENTE_MS = 1200
