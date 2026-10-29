'use client'

import { motion } from 'motion/react'
import { useRef } from 'react'

import { Envoltorio } from '../../../_componentes/layout/Envoltorio'

import { PRESENCIA_DEL_ENCABEZADO } from '../portfolio/EncabezadoDelPortfolio'
import { DESPEJE_DE_LA_BARRA } from '../portfolio/LaTuya'
import { usePresencia } from '../portfolio/levantarse'
import { useDisparoPorLinea } from '../portfolio/useDisparoPorLinea'

import { CarruselDeDemos } from './CarruselDeDemos'
import { TextoDeDemos } from './TextoDeDemos'

const ESTILO_DE_LA_PANTALLA: React.CSSProperties = { paddingTop: DESPEJE_DE_LA_BARRA }

/**
 * [C2-41t] DEMOS EN EL TELÉFONO Y LA TABLET (abajo de 1024) — UNA SECCIÓN MÁS, no una capa que crece detrás del logo.
 *
 * Va en lo que sigue al flujo del Portfolio (`despues-del-flujo`, en `Trabajos.tsx`): entra con el scroll pegada al pie de «la tuya», como
 * cualquier sección, y se va igual. [L2] Una pantalla y nada más: antes quedaba pegada la cola entera (3,3 pantallas de scroll quieto
 * antes de Servicios). Antes de C2-41t vivía en el escenario pegado de la caja, detrás del flujo: abajo de 768 la capa entera crecía
 * desde escala 0 con el vacío (salía chiquita de atrás del logo) y en tablet llegaba con el gesto de los libros. Con el carrusel esa capa no
 * se monta (`CapaDeDemos` queda para el escritorio). La escena descuenta el alto nuevo (`medioDelCarrusel.ts`, REGLA DE ALTURAS).
 *
 * El título se levanta desde abajo de su ventana al cruzar la línea, con el mismo efecto que «Portfolio» en el flujo (`levantarse.tsx`: el
 * disparo por línea y la presencia de los títulos); el párrafo llega con su P2 y el bloque con el fundido de la presencia (P2 sólo desplaza).
 * En el teléfono no se desactiva; con movimiento reducido está puesto. El muestrario es el carrusel común en su modo `asoma`
 * (`CarruselDeDemos`): llena el alto que queda en la pantalla.
 */
export function DemosDelFlujo({ reducido }: { readonly reducido: boolean }): React.JSX.Element {
  const titulo = useRef<HTMLDivElement | null>(null)
  const adentro = useDisparoPorLinea(titulo)
  const presencia = usePresencia(adentro, reducido, PRESENCIA_DEL_ENCABEZADO)
  return (
    <div data-pantalla="demos" data-adentro={adentro ? 'si' : 'no'} className="flex h-svh flex-col pb-6" style={ESTILO_DE_LA_PANTALLA}>
      <Envoltorio className="flex min-h-0 flex-1 flex-col" claseDeContenido="flex min-h-0 flex-1 flex-col gap-6">
        <motion.div ref={titulo} data-parte="titulo" style={{ opacity: presencia }}>
          <TextoDeDemos progresoDelTitulo={presencia} progresoDelParrafo={presencia} levantarse={presencia} />
        </motion.div>
        <CarruselDeDemos className="min-h-0 flex-1" />
      </Envoltorio>
    </div>
  )
}
