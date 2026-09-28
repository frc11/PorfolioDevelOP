import { motionValue } from 'motion/react'

/**
 * [ESCENA 8] T3 · CUÁNTO DÍA HAY PARA EL TEXTO DEL FINAL — de 0 a 1, lo escribe el amanecer (`Amanecer.tsx`)
 * y lo lee el escenario de «Por qué develOP» (sólo escritorio): la frase, los valores y el CTA son tinta de
 * día y esperan a que su fondo esté iluminado. La frase va sobre las paredes; los valores y el CTA, más abajo,
 * sobre el piso, que el frente alcanza después. Fuera del amanecer valen 1. Valores de `motion` y no de
 * React: cambian por cuadro y no re-renderizan nada. Este módulo no importa three: la sección lo puede leer
 * sin arrastrar la escena.
 */
export const DIA_DEL_TEXTO = { frase: motionValue(1), abajo: motionValue(1) }
