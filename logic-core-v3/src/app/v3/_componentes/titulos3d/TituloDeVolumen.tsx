'use client'

import { motionValue, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { useTituloDeVolumen, useTituloListo, useTitulosDeVolumen, type TituloDeVolumen as Titulo } from '../../_lib/titulos3d/registro'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { useLlegadaDelTitulo } from '../llegadaDelTitulo'

/** Para la rama quieta (sin progreso): el gancho de la llegada repetida no es condicional. */
const LLEGADO = motionValue(1)

/**
 * [ESCENA 10] T3 · EL TÍTULO DE VOLUMEN, en el DOM. [3D Y SONIDO] T1: en el producto. El mismo texto guarda el lugar (el
 * renglón no se corre) y es de donde la escena lee la caja, el cuerpo y la x de cada letra. Cuando la escena avisa que su
 * título está armado (`listo`), desde 1024 el texto se vuelve invisible (sin anunciar) y queda entero para los lectores de
 * pantalla en un `sr-only`; lo que se ve es el título extruido de la escena (`escena/titulos3d/`). Antes de eso (o sin
 * WebGL), y abajo de 1024 siempre (las secciones no tienen escenario), el texto de siempre: el corte de ancho es de CSS
 * (`escritorio:`), no una rama de JS.
 *
 * `llegadaDe`: la sección cuyo viaje del menú repite la llegada del título al terminar (el retoque 3 del navbar); el
 * título de la escena hace su llegada de letras con ese mismo progreso.
 */
export function TituloDeVolumen({
  id,
  texto,
  lectura,
  subida,
  llegada,
  salida,
  llegadaDe,
  queda = false,
  corrida = null,
}: {
  readonly id: string
  readonly texto: string
  readonly lectura: Titulo['lectura']
  readonly subida?: number
  /** Cuánto llegó la pieza (`null`: quieta, llegada). */
  readonly llegada: MotionValue<number> | null
  readonly salida: MotionValue<number> | null
  readonly llegadaDe: string
  /** [RETOQUE 3D] B1 · sin salida propia (`registro.ts`): `salida` en 1 sólo lo esconde. */
  readonly queda?: boolean
  /** [RETOQUE 3D] B5 · lo que la pieza está corrida por una transformación de más arriba (fracción del cuadro, `registro.ts`). */
  readonly corrida?: MotionValue<number> | null
}): React.JSX.Element {
  const material = useTitulosDeVolumen()
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const listo = useTituloListo(id)
  const lugar = useRef<HTMLSpanElement | null>(null)
  const repetible = useLlegadaDelTitulo(llegadaDe, llegada ?? LLEGADO)
  useTituloDeVolumen({ id, texto, lugar, lectura, subida, llegada: llegada === null ? null : repetible, salida, queda, corrida, activo: material !== 'no' && escritorio })
  return (
    <>
      {listo && <span className="sr-only hidden escritorio:block">{texto}</span>}
      <span ref={lugar} className={listo ? 'block escritorio:invisible' : 'block'}>
        {texto}
      </span>
    </>
  )
}
