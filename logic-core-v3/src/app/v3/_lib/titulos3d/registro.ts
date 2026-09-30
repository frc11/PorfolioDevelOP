'use client'

import { motionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useSyncExternalStore, type RefObject } from 'react'

import { entornoDeLaEscena, type TitulosDeVolumen } from '../escena/entorno'

/**
 * [ESCENA 10] T3 · LOS TÍTULOS DE VOLUMEN, del lado del DOM — sin three: la sección anota acá su título (el lugar que
 * le guarda en el DOM, el texto, el nudo de la cámara con que se lee, cuánto llegó y cuánto se fue) y la escena
 * (`escena/titulos3d/`) lo arma extruido y lo pone en el mundo. El DOM lo sigue teniendo entero para los lectores de
 * pantalla y los buscadores (`_componentes/titulos3d/TituloDeVolumen.tsx`).
 *
 * Una prueba (bandera `titulos=negro|blanco`; decide Valentino). La bandera se lee DESPUÉS de hidratar: el servidor no
 * la conoce (sale de la URL o del banco), así que el primer render es el del producto y React vuelve a pintar con la
 * prueba, sin un desajuste de hidratación.
 */
export interface TituloDeVolumen {
  readonly id: string
  readonly texto: string
  /** El lugar del título en el DOM (invisible, con el texto): su caja de lectura, su cuerpo y la x de cada letra. */
  readonly lugar: HTMLElement
  /**
   * Cuándo se lee: un nudo de la coreografía por su nombre o un progreso (`LECTURA`), con cuya cámara se coloca; y lo
   * que la pieza sube en su lectura (fracción del cuadro).
   */
  readonly lectura: string | number
  readonly subida: number
  /** Cuánto llegó (0 a 1: el progreso que movía la pieza) y cuánto se fue (0 a 1). Se escriben al cambiar. */
  llegada: number
  salida: number
}

export const TITULOS_DE_VOLUMEN = new Map<string, TituloDeVolumen>()

/**
 * Cuándo se lee cada título, medido a 1440 con `scripts-escena10/t3-lectura.ts` (la ventana donde llegó entero y
 * todavía no se fue, en el progreso de la coreografía). Portfolio: de 0,4426 a 0,5009, con la cámara orbitando unos 30°
 * de Quiénes somos a Números; se coloca con la del medio. La frase: de 0,8811 a 0,926; se coloca con la de los valores
 * (el nudo `valores`, 0,9078), que es cuando la frase ya subió.
 */
export const LECTURA = { portfolio: 0.4718, frase: 'valores' } as const

/** Quién se entera cuando un título entra o sale del registro (la escena, para armarlo o soltarlo). */
const oyentes = new Set<() => void>()
let version = 0
function avisar(): void {
  version += 1
  for (const f of oyentes) f()
}
export function suscribirALosTitulos(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
export const versionDeLosTitulos = (): number => version

/** Progresos quietos, para cuando no hay uno (la pieza quieta: llegada; sin salida): los ganchos no son condicionales. */
const NADA = motionValue(0)
const LLEGADO = motionValue(1)

interface Anotacion {
  readonly id: string
  readonly texto: string
  readonly lugar: RefObject<HTMLElement | null>
  readonly lectura: TituloDeVolumen['lectura']
  readonly subida?: number
  readonly llegada: MotionValue<number> | null
  readonly salida: MotionValue<number> | null
  /** Sólo con la prueba prendida. */
  readonly activo: boolean
}

export function useTituloDeVolumen({ id, texto, lugar, lectura, subida = 0, llegada: pedida, salida, activo }: Anotacion): void {
  const llegada = pedida ?? LLEGADO
  useEffect(() => {
    const el = lugar.current
    if (!activo || el === null) return undefined
    TITULOS_DE_VOLUMEN.set(id, { id, texto, lugar: el, lectura, subida, llegada: llegada.get(), salida: salida?.get() ?? 0 })
    avisar()
    return () => {
      TITULOS_DE_VOLUMEN.delete(id)
      avisar()
    }
  }, [id, texto, lugar, lectura, subida, llegada, salida, activo])
  useMotionValueEvent(llegada, 'change', (p) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    if (t !== undefined) t.llegada = p
  })
  useMotionValueEvent(salida ?? NADA, 'change', (p) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    if (t !== undefined) t.salida = p
  })
}

const sinCambios = (): (() => void) => () => undefined

/** La prueba de esta carga: `no` en el servidor y en el primer render; la pedida, después. */
export function useTitulosDeVolumen(): TitulosDeVolumen | 'no' {
  return useSyncExternalStore(sinCambios, () => entornoDeLaEscena().pruebas.titulos, () => 'no')
}
