'use client'

import type { MotionValue } from 'motion/react'
import { useRef } from 'react'

import type { TitulosDePrueba } from '../../_lib/escena/entorno'
import { useTituloEnLaEscena } from '../../_lib/titulos3d/enLaEscena'

import { LetrasQueLlegan } from './LetrasQueLlegan'

/**
 * [ESCENA 9] T5 · el texto de un título con la prueba de los títulos en 3D (`_lib/titulos3d/llegada.ts`): sin prueba,
 * el texto tal cual (el mismo DOM de siempre); con `dom`, las letras que llegan; con `webgl`, el texto en su lugar y
 * transparente (lo leen los lectores de pantalla y los buscadores) y la escena lo dibuja encima.
 */
interface Props {
  readonly prueba: TitulosDePrueba | 'no'
  /** Con qué nombre lo anota para la escena (uno por título). */
  readonly id: string
  readonly texto: string
  /** El progreso que movía la pieza. */
  readonly progreso: MotionValue<number> | null
}

export function TituloDePrueba({ prueba, id, texto, progreso }: Props): React.JSX.Element {
  if (prueba === 'dom') return <LetrasQueLlegan texto={texto} progreso={progreso} />
  if (prueba === 'webgl') return <TituloParaLaEscena id={id} texto={texto} progreso={progreso} />
  return <>{texto}</>
}

function TituloParaLaEscena({ id, texto, progreso }: Omit<Props, 'prueba'>): React.JSX.Element {
  const lugar = useRef<HTMLSpanElement | null>(null)
  useTituloEnLaEscena(id, texto, lugar, progreso)
  return (
    <span ref={lugar} style={{ color: 'transparent' }}>
      {texto}
    </span>
  )
}
