'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { CARGA, Carga } from '../../../_componentes/carga/Carga'
import { TEXTOS_DEL_RECOMENDADOR } from './logica'
import { fundidoQueSube } from './movimiento'

/**
 * [C2-51] EL «PROCESANDO» — el loader de develOP (`Carga`, el de `EstadoDeEnvio`: el logo girando, quieto con movimiento reducido) y
 * debajo las tres líneas de 05-TEXTOS, que se reemplazan con un fundido (la que se va se desvanece, la que llega se levanta), una cada
 * `CARGA.textoMs` (el paso de las líneas de la carga): tres líneas, `PROCESANDO_MS` en total (≈ 2,5 s). Al terminar, `alTerminar`.
 */
export const PROCESANDO_MS = TEXTOS_DEL_RECOMENDADOR.procesando.length * CARGA.textoMs

/** Las líneas se van y llegan en la mitad del fundido del envío: cada una se lee entera dentro de su paso. */
const FACTOR_DEL_FUNDIDO_DE_LAS_LINEAS = 0.5

export function Procesando({ reducido, alTerminar }: { readonly reducido: boolean; readonly alTerminar: () => void }): React.JSX.Element {
  const [linea, setLinea] = useState(0)
  const terminar = useRef(alTerminar)
  useEffect(() => {
    terminar.current = alTerminar
  })
  useEffect(() => {
    const ultima = TEXTOS_DEL_RECOMENDADOR.procesando.length - 1
    const reloj = window.setInterval(() => setLinea((i) => Math.min(ultima, i + 1)), CARGA.textoMs)
    const fin = window.setTimeout(() => terminar.current(), PROCESANDO_MS)
    return () => {
      window.clearInterval(reloj)
      window.clearTimeout(fin)
    }
  }, [])
  const texto = TEXTOS_DEL_RECOMENDADOR.procesando[linea] ?? ''
  return (
    <div data-pieza="procesando-del-recomendador" data-linea={linea} className="flex min-h-[calc(var(--spacing-20)*5)] flex-col items-center justify-center gap-[var(--spacing-6)] text-center">
      <Carga tamano="grande" etiqueta={TEXTOS_DEL_RECOMENDADOR.procesando[0]} />
      <p role="status" className="font-cuerpo text-fluido-titulo-s leading-texto min-h-16 max-w-[calc(var(--spacing-20)*6)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={texto} data-parte="linea-del-procesando" className="block" {...fundidoQueSube(reducido, 0, FACTOR_DEL_FUNDIDO_DE_LAS_LINEAS)}>
            {texto}
          </motion.span>
        </AnimatePresence>
      </p>
    </div>
  )
}
