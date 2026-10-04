'use client'

import { motionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useSyncExternalStore, type RefObject } from 'react'

import { entornoDeLaEscena, type TitulosDeVolumen } from '../escena/entorno'
import type { Lectura } from '../escena/titulos3d/colocacion'
import type { FormaDeLaLlegada, LlegadaDelTitulo } from '../escena/titulos3d/llegada'
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
  /** [PASADA FINAL] D2 · el tachado: con su avance despinta las letras de su título, como el DOM (`trazo.css`). */
  readonly despinta?: boolean
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
  readonly lectura: Lectura
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
  /** [PASADA FINAL] 0 · la forma de su llegada (`llegada.ts`): `null`, la de siempre; las pruebas de Portfolio traen la suya. */
  readonly forma: FormaDeLaLlegada | null
}

export const TITULOS_DE_VOLUMEN = new Map<string, TituloDeVolumen>()

/**
 * [PASADA FINAL] A2 · DÓNDE TERMINA DE LLEGAR PORTFOLIO (progreso de la coreografía) y con qué cámara se coloca su título.
 * En ESCENA 10 (la llegada aprobada) la ventana de la máscara terminaba en 0,4426 y el título se colocaba con la cámara
 * de 0,4718: la cámara seguía orbitando hacia Números (8° de azimut y 1,8 de altura entre las dos) y las letras, que
 * vienen por el eje del título (16 em atrás), se veían venir desde el fondo de la sala. La tabla de secciones de RETOQUE
 * PANEL T3 corrió el mapeo scroll → progreso (es proporcional a los altos declarados) y la MISMA llegada terminó cayendo
 * en 0,4713, al final de la órbita, donde la cámara ya casi no se mueve: con la colocación en 0,4718 las letras venían de
 * frente, cortas; y correr la colocación por progreso no alcanza (la órbita termina en 0,5). Lo que se restituye es la
 * RELACIÓN DE CÁMARA: la pose de donde termina la llegada hoy más lo que la cámara cambiaba entre 0,4426 y 0,4718
 * (`LecturaRelativa`, `colocacion.ts`). `termina` es medida (scroll 4993 a 1440×900, `scripts-pasada/a2-ventana.ts`): si
 * el mapeo vuelve a moverse, se vuelve a medir y se escribe acá; s47 ata la relación.
 */
export const LLEGADA_DE_PORTFOLIO = { termina: 0.4713, comoEnEscena10: [0.4426, 0.4718] } as const

/**
 * Cuándo se lee cada título, medido a 1440 con `scripts-escena10/t3-lectura.ts` (la ventana donde llegó entero y
 * todavía no se fue, en el progreso de la coreografía). Portfolio: la cámara orbita unos 30° de Quiénes somos a Números;
 * se coloca con la relación de arriba. La frase: se coloca con la de los valores (el nudo `valores`, 0,9233 desde
 * PASADA FINAL A3), que es cuando la frase ya subió.
 */
export const LECTURA: { readonly portfolio: Lectura; readonly frase: Lectura } = { portfolio: { en: LLEGADA_DE_PORTFOLIO.termina, comoEntre: LLEGADA_DE_PORTFOLIO.comoEnEscena10 }, frase: 'valores' }

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
  readonly forma?: FormaDeLaLlegada | null
  /** Sólo con la prueba prendida. */
  readonly activo: boolean
}

const SIN_TRAZOS: readonly TrazoDelTitulo[] = []

export function useTituloDeVolumen({ id, texto, lugar, lectura, subida = 0, llegada: pedida, salida, queda = false, corrida = null, fuente = 'chivo-400', gesto = 'letras', colocacion = 'lectura', rearma = true, minimoS = null, salidaMinimaS = null, asiento = 'cercano', trazos = SIN_TRAZOS, forma = null, activo }: Anotacion): void {
  const llegada = pedida ?? LLEGADO
  useEffect(() => {
    const el = lugar.current
    if (!activo || el === null) return undefined
    TITULOS_DE_VOLUMEN.set(id, { id, texto, lugar: el, forma, lectura, subida, llegada: llegada.get(), salida: salida?.get() ?? 0, queda, corrida: corrida?.get() ?? 0, fuente, gesto, colocacion, rearma, minimoS, salidaMinimaS, asiento, trazos })
    avisar()
    return () => {
      TITULOS_DE_VOLUMEN.delete(id)
      avisar()
    }
  }, [id, texto, lugar, forma, lectura, subida, llegada, salida, queda, corrida, fuente, gesto, colocacion, rearma, minimoS, salidaMinimaS, asiento, trazos, activo])
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
