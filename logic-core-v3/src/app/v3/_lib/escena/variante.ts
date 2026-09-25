/**
 * LA VARIANTE DE LA ESCENA — SPRINT ESCENA, diagnóstico. **[ESCENA]**
 *
 * Una bandera y cuatro recetas. El producto corre en ACTUAL: la bandera vale `'actual'` y nada
 * de lo que sigue cambia un píxel con ella así. El banco de comparación
 * (`scripts-escena/`) la pisa ANTES de cargar la página (`window.__varianteDeLaEscena`), así que
 * la variante se lee una vez, al montar, y no hay un selector en la interfaz.
 *
 *   · V1 LIMPIEZA — sin marcas en el piso; la cúpula deja de proyectar su celosía; el logo no
 *     proyecta la sombra del sol (que gira con el arco) y queda sólo su oclusión de contacto,
 *     suave y quieta (`ContactOcclusion`).
 *   · V2 LIMPIEZA + PROFUNDIDAD — V1, más bruma hacia el horizonte y un reflejo muy leve del logo.
 *   · V3 = V2 + RENDIMIENTO — menos motas abajo de 1024. El mapa de sombras más chico no aplica:
 *     desde V1 no hay mapa (la única sombra proyectada era la del logo); y el DPR abajo de 1024 ya
 *     estaba acotado a 1 (`ajustes.ts`, calidad compacta).
 */

export type VarianteDeLaEscena = 'actual' | 'v1' | 'v2' | 'v3' | 'base'

/** La bandera. El producto corre en ACTUAL. */
export const BANDERA_DE_LA_ESCENA: VarianteDeLaEscena = 'actual'

declare global {
  interface Window {
    __varianteDeLaEscena?: VarianteDeLaEscena
  }
}

export interface RecetaDeLaEscena {
  /** Las cruces, ejes, cotas y cintas del piso (`floorMarks.ts`). */
  readonly marcasDelPiso: boolean
  /** La celosía de la cúpula proyectada sobre el piso y el logo (`celosiaShader.ts`). */
  readonly celosia: boolean
  /** La sombra del logo por el sol del arco (el mapa de sombras). */
  readonly sombraDelLogo: boolean
  /** La niebla: `null` es la de siempre (`probeAtmosphere.ts`). */
  readonly bruma: { readonly cerca: number; readonly lejos: number } | null
  /** El reflejo muy leve del logo en el piso. */
  readonly reflejo: boolean
  /** Motas de polvo abajo de 1024: `null` es la cantidad de siempre. */
  readonly motasCompactas: number | null
}

const ACTUAL: RecetaDeLaEscena = { marcasDelPiso: true, celosia: true, sombraDelLogo: true, bruma: null, reflejo: false, motasCompactas: null }
const V1: RecetaDeLaEscena = { ...ACTUAL, marcasDelPiso: false, celosia: false, sombraDelLogo: false }
const V2: RecetaDeLaEscena = { ...V1, bruma: { cerca: 42, lejos: 110 }, reflejo: true }
const V3: RecetaDeLaEscena = { ...V2, motasCompactas: 1200 }

export const RECETAS: Readonly<Record<VarianteDeLaEscena, RecetaDeLaEscena>> = { actual: ACTUAL, v1: V1, v2: V2, v3: V3, base: { ...V2, reflejo: false } }

export function varianteDeLaEscena(): VarianteDeLaEscena {
  if (typeof window === 'undefined') return BANDERA_DE_LA_ESCENA
  const pedida = window.__varianteDeLaEscena
  return pedida !== undefined && pedida in RECETAS ? pedida : BANDERA_DE_LA_ESCENA
}

export function recetaDeLaEscena(): RecetaDeLaEscena {
  return RECETAS[varianteDeLaEscena()]
}
