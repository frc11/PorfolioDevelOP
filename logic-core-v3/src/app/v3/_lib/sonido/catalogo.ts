import type { Ambiente, Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · LOS SONIDOS, UNO POR UNO — qué es cada uno, cuánto suena y cada cuánto puede repetirse. Los archivos
 * los genera `scripts-retoque/sonidos.ts` (`sprite.ts`); las fuentes y la licencia, `docs/rediseno/SONIDO.md`.
 *
 * [RETOQUE 3D] Al producto, con el parlante apagado por defecto. Los volúmenes son los finales de Valentino (el tic de la
 * barra 0,1; el roce de las fotos 0,1; abrir y cerrar 0,1; el pulso 1; el encendido 0,2). Se fueron el túnel, el amanecer
 * y los dos ambientes de día y de noche. Nuevos, con candidatos para elegir de oído en `/v3?sonidos=1`: el clic de la barra
 * (cuatro), el clic de los CTA (cuatro) y UN ambiente para toda la página (tres), en su propio archivo.
 *
 *   · `separacionMs`: lo mínimo entre dos del mismo (un hover que barre la barra no ametralla).
 *   · `exclusivo`: mientras suena no se vuelve a largar (el encendido).
 */
export interface DelSonido {
  readonly que: string
  readonly volumen: number
  readonly separacionMs: number
  readonly exclusivo: boolean
}

export const SONIDOS: Readonly<Record<Sonido, DelSonido>> = {
  tic: { que: 'El hover de la barra y de los CTA: un tic muy suave', volumen: 0.1, separacionMs: 45, exclusivo: false },
  clic: { que: 'Los demás enlaces y botones: un clic', volumen: 0.22, separacionMs: 60, exclusivo: false },
  abre: { que: 'Abrir el menú o una demo (el Genie)', volumen: 0.1, separacionMs: 120, exclusivo: false },
  cierra: { que: 'Cerrar el menú o una demo (el Genie)', volumen: 0.1, separacionMs: 120, exclusivo: false },
  pulso: { que: 'El pulso del logo: un golpe grave casi imperceptible', volumen: 1, separacionMs: 900, exclusivo: false },
  encendido: { que: 'El haz que se enciende: el zumbido sigue a los intentos que fallan y al golpe', volumen: 0.2, separacionMs: 0, exclusivo: true },
  foto: { que: 'El hover de las fotos del equipo: un roce mínimo', volumen: 0.1, separacionMs: 120, exclusivo: false },
  'barra-a': { que: 'Clic de la barra · a · tecla de madera', volumen: 0.15, separacionMs: 60, exclusivo: false },
  'barra-b': { que: 'Clic de la barra · b · burbuja que sube', volumen: 0.15, separacionMs: 60, exclusivo: false },
  'barra-c': { que: 'Clic de la barra · c · cristal (una campanita)', volumen: 0.15, separacionMs: 60, exclusivo: false },
  'barra-d': { que: 'Clic de la barra · d · pestillo (dos golpes)', volumen: 0.15, separacionMs: 60, exclusivo: false },
  'cta-a': { que: 'Clic de los CTA · a · confirmación (dos notas que suben)', volumen: 0.18, separacionMs: 60, exclusivo: false },
  'cta-b': { que: 'Clic de los CTA · b · golpe de fieltro', volumen: 0.18, separacionMs: 60, exclusivo: false },
  'cta-c': { que: 'Clic de los CTA · c · destello (tres campanitas)', volumen: 0.18, separacionMs: 60, exclusivo: false },
  'cta-d': { que: 'Clic de los CTA · d · tecla grave', volumen: 0.18, separacionMs: 60, exclusivo: false },
}

/** Los grupos con candidatos y sus candidatos; el elegido de fábrica es el `a`. */
export const CANDIDATOS = {
  barra: ['barra-a', 'barra-b', 'barra-c', 'barra-d'],
  cta: ['cta-a', 'cta-b', 'cta-c', 'cta-d'],
} as const satisfies Readonly<Record<string, readonly Sonido[]>>

export type GrupoConCandidatos = keyof typeof CANDIDATOS
export type Candidato = 'a' | 'b' | 'c' | 'd'

/** Lo que pide el sitio: un sonido del sprite o el clic de un grupo (que suena con el candidato elegido). */
export type Pedido = Exclude<Sonido, `barra-${Candidato}` | `cta-${Candidato}`> | 'clic-de-la-barra' | 'clic-del-cta'

/** Los tres ambientes (bucles de 24 s, uno por archivo): qué es cada uno. */
export const AMBIENTES: Readonly<Record<Ambiente, string>> = {
  a: 'Cristales — un arpegio de campanitas sobre un colchón cálido (80 BPM)',
  b: 'Datos — una secuencia de pellizcos en semicorcheas con un pulso grave (120 BPM)',
  c: 'Niebla — colchones largos y una melodía de vidrio espaciada (60 BPM)',
}

/** El volumen del ambiente (muy bajo: es el fondo) y el general (todo pasa por acá: el sitio suena bajo). */
export const VOLUMEN_DEL_AMBIENTE = 0.2
export const VOLUMEN_GENERAL = 0.7

/** Lo que tarda el ambiente en entrar y en irse (un fundido), y en pasar de un candidato a otro. */
export const FUNDIDO_DEL_AMBIENTE_MS = 1200
