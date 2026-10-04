'use client'

import { motionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useSyncExternalStore, type RefObject } from 'react'

import { entornoDeLaEscena, type TitulosDeVolumen } from '../escena/entorno'
import type { LlegadaDelTitulo } from '../escena/titulos3d/llegada'
import type { AsientoDeLaLlegada } from './repeticiones'

/** [RETOQUE 3D] Con qué fuente se extruye (la que el DOM pinta: `scripts-retoque/fuentes-3d.py`). */
export type FuenteDelTitulo = 'chivo-400' | 'archivo-700' | 'chivo-300-italica' | 'chivo-700' | 'chivo-300'

/**
 * [RETOQUE PANEL] T4 · UNA RAYA DEL TÍTULO (el subrayado, el tachado, un trazo del ≠): una barra extruida en el plano del
 * título que crece con su `avance` (0 a 1), como la del DOM. `medir` la ubica una vez, al armarse (recibe el lugar del
 * título): px CSS desde la esquina de arriba a la izquierda de su caja, sin transformaciones (de la punta 1 a la 2, y su grosor). Nace en la punta 1
 * y crece hacia la 2 (`punta`), o en el medio hacia las dos (`medio`).
 */
export interface SegmentoDelTrazo {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly grosor: number
}
export interface TrazoDelTitulo {
  readonly medir: (lugar: HTMLElement) => SegmentoDelTrazo | null
  readonly nace: 'punta' | 'medio'
  readonly avance: MotionValue<number>
}

/**
 * [ESCENA 10] T3 · LOS TÍTULOS DE VOLUMEN, del lado del DOM — sin three: la sección anota acá su título (el lugar que
 * le guarda en el DOM, el texto, el nudo de la cámara con que se lee, cuánto llegó y cuánto se fue) y la escena
 * (`escena/titulos3d/`) lo arma extruido y lo pone en el mundo. El DOM lo sigue teniendo entero para los lectores de
 * pantalla y los buscadores (`_componentes/titulos3d/TituloDeVolumen.tsx`).
 *
 * [3D Y SONIDO] T1 · en el producto (el negro; `titulos=blanco` o `titulos=no` con banco o en la URL). La bandera se lee
 * DESPUÉS de hidratar: el servidor no la conoce, así que el primer render es el del texto de siempre. Y el DOM esconde su
 * texto recién cuando la escena avisa que el título está armado y compilado (`listo`): sin WebGL, o mientras el módulo
 * llega, el título se sigue leyendo en el DOM.
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
  /**
   * [RETOQUE 3D] B1 · sin salida propia: la llegada, una vez empezada, termina; llegado, se queda, y se va con su sección
   * (sigue el corrimiento de su escenario). `salida` deja de animar: en 1 lo esconde (otra cosa lo tapa).
   */
  readonly queda: boolean
  /**
   * [RETOQUE 3D] B5 · cuánto está corrida la pieza del DOM por una transformación de más arriba que no es su lectura
   * (fracción del cuadro, positivo hacia abajo): la levantada de la frase de Por qué develOP. El título va corrido igual.
   */
  corrida: number
  /**
   * [RETOQUE 3D] La fuente; el gesto de la llegada (`letras`, `azar`, `levanta`: `llegada.ts`); dónde se coloca
   * (`lectura`: quieto en el mundo, donde la cámara de su lectura lo ve en su lugar; `pantalla`: en cada cuadro donde la
   * cámara de ahora lo ve en su lugar del DOM, para lo que va con la página y no tiene escenario); si el que se queda se
   * rearma al salir del cuadro (el hero no: llega una vez por carga); y cuánto tarda la llegada como mínimo (s).
   */
  readonly fuente: FuenteDelTitulo
  readonly gesto: LlegadaDelTitulo
  readonly colocacion: 'lectura' | 'pantalla'
  readonly rearma: boolean
  readonly minimoS: number | null
  /** [NOCTURNO] A5 · cuánto tarda la salida como mínimo (s): la frase de Por qué develOP se iba volando. */
  readonly salidaMinimaS: number | null
  /** [PASADA FINAL] A3 · dónde asienta la llegada con mínimo al frenar a mitad (`repeticiones.ts`). */
  readonly asiento: AsientoDeLaLlegada
  /** [RETOQUE PANEL] T4 · sus rayas (hasta cuatro): el título puede no tener letras (el ≠ de Quiénes somos). */
  readonly trazos: readonly TrazoDelTitulo[]
}

export const TITULOS_DE_VOLUMEN = new Map<string, TituloDeVolumen>()

/**
 * Cuándo se lee cada título, medido a 1440 con `scripts-escena10/t3-lectura.ts` (la ventana donde llegó entero y
 * todavía no se fue, en el progreso de la coreografía). Portfolio: de 0,4426 a 0,5009, con la cámara orbitando unos 30°
 * de Quiénes somos a Números; se coloca con la del medio. La frase: de 0,8811 a 0,926; se coloca con la de los valores
 * (el nudo `valores`, 0,9189 desde RETOQUE PANEL T3), que es cuando la frase ya subió.
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
  readonly queda?: boolean
  readonly corrida?: MotionValue<number> | null
  readonly fuente?: FuenteDelTitulo
  readonly gesto?: LlegadaDelTitulo
  readonly colocacion?: 'lectura' | 'pantalla'
  readonly rearma?: boolean
  readonly minimoS?: number | null
  readonly salidaMinimaS?: number | null
  readonly asiento?: AsientoDeLaLlegada
  readonly trazos?: readonly TrazoDelTitulo[]
  /** Sólo con la prueba prendida. */
  readonly activo: boolean
}

const SIN_TRAZOS: readonly TrazoDelTitulo[] = []

export function useTituloDeVolumen({ id, texto, lugar, lectura, subida = 0, llegada: pedida, salida, queda = false, corrida = null, fuente = 'chivo-400', gesto = 'letras', colocacion = 'lectura', rearma = true, minimoS = null, salidaMinimaS = null, asiento = 'cercano', trazos = SIN_TRAZOS, activo }: Anotacion): void {
  const llegada = pedida ?? LLEGADO
  useEffect(() => {
    const el = lugar.current
    if (!activo || el === null) return undefined
    TITULOS_DE_VOLUMEN.set(id, { id, texto, lugar: el, lectura, subida, llegada: llegada.get(), salida: salida?.get() ?? 0, queda, corrida: corrida?.get() ?? 0, fuente, gesto, colocacion, rearma, minimoS, salidaMinimaS, asiento, trazos })
    avisar()
    return () => {
      TITULOS_DE_VOLUMEN.delete(id)
      avisar()
    }
  }, [id, texto, lugar, lectura, subida, llegada, salida, queda, corrida, fuente, gesto, colocacion, rearma, minimoS, salidaMinimaS, asiento, trazos, activo])
  useMotionValueEvent(llegada, 'change', (p) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    if (t !== undefined) t.llegada = p
  })
  useMotionValueEvent(salida ?? NADA, 'change', (p) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    if (t !== undefined) t.salida = p
  })
  useMotionValueEvent(corrida ?? NADA, 'change', (c) => {
    const t = TITULOS_DE_VOLUMEN.get(id)
    if (t !== undefined) t.corrida = c
  })
}

const sinCambios = (): (() => void) => () => undefined

/** El material de esta carga: `no` en el servidor y en el primer render; el del producto (o el pedido), después. */
export function useTitulosDeVolumen(): TitulosDeVolumen | 'no' {
  return useSyncExternalStore(sinCambios, () => entornoDeLaEscena().titulos, () => 'no')
}

/** [3D Y SONIDO] T1 · los títulos que la escena ya armó y compiló: recién ahí el DOM esconde el suyo. */
const listos = new Set<string>()
const oyentesDeLosListos = new Set<() => void>()

/** Lo escribe la escena: listo al armarse y compilarse; no, al soltarlo. */
export function marcarListo(id: string, listo: boolean): void {
  if (listos.has(id) === listo) return
  if (listo) listos.add(id)
  else listos.delete(id)
  for (const f of oyentesDeLosListos) f()
}

function suscribirALosListos(f: () => void): () => void {
  oyentesDeLosListos.add(f)
  return () => {
    oyentesDeLosListos.delete(f)
  }
}

/** ¿El título `id` se ve en la escena? `false` en el servidor y en el primer render. */
export function useTituloListo(id: string): boolean {
  return useSyncExternalStore(suscribirALosListos, () => listos.has(id), () => false)
}
