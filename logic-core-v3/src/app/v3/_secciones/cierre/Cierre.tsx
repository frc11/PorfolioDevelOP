'use client'

import { useMotionValue, useTransform, type MotionValue } from 'motion/react'

import { cn } from '@/lib/utils'

import { Pie } from '../../_componentes/chrome/Pie'
import { Logotipo } from '../../_componentes/marca/Marca'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { POSES_DEL_FINAL, huecoDelLogo } from '../../_lib/escena/finalDelRecorrido'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { Seccion } from '../_contrato/Seccion'
import { ColumnasDelPie } from './ColumnasDelPie'
import { TITULAR_DE_CIERRE } from './contenido'
import { ContactoDelPie, LineaLegal, RedesDelPie } from './PiezasDeContacto'

/**
 * 08 · CIERRE — el pie, armado alrededor del logo. **[FINAL]**
 *
 * Es el tiempo E del final: la cámara se aleja de golpe (D) en el primer cuarto de la
 * pantalla en que el pie sube, y el pie se arma alrededor del logo, que queda solo en el
 * centro —como el de nk—:
 *
 *   izquierda  develOP, la línea de identidad y la dirección de contacto (pedida)
 *   derecha    las columnas de hoy: el recorrido y el contacto
 *   abajo      las redes (pedidas), la línea de develOP y los legales (pedidos)
 *
 * El contenido es el que el pie ya tenía, reacomodado; lo que no existe queda como pedido
 * con su marcador y nada se inventa. Todo llega con P5, escalonado, DESPUÉS del
 * alejamiento: el progreso es el de la sección entrando al cuadro (P2 sobre la sección, de
 * `top bottom` a `bottom bottom`, o sea la última pantalla del sitio), y termina justo en
 * el último píxel de scroll. Abajo de 1024 el pie se apila, con el logo.
 */
export function Cierre({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    // El hueco del logo en E, para las dos columnas del pie: sale de la pose, como en «Por qué develOP».
    <Seccion seccion={seccion} className="grid min-h-svh" style={{ ['--hueco-del-pie' as string]: `${huecoDelLogo(POSES_DEL_FINAL.pie.distance).toFixed(1)}svh` }}>
      <CoreografiaEnTodoAncho>
        <Bloque patron="P2" anclaje="seccion" className="grid">
          {(progreso: Progreso) => <PieDelFinal seccion={seccion} progreso={progreso} />}
        </Bloque>
      </CoreografiaEnTodoAncho>
    </Seccion>
  )
}

/** Las ventanas de la llegada sobre la última pantalla: el alejamiento ocupa el primer cuarto. */
export const LLEGADAS_DEL_PIE = {
  izquierda: [0.3, 0.6],
  derecha: [0.4, 0.75],
  abajo: [0.55, 0.9],
} as const

function PieDelFinal({ seccion, progreso }: PropsDeSeccion & { readonly progreso: Progreso }): React.JSX.Element {
  return (
    <Pie
      className="grid"
      claseDeEnvoltorio="grid"
      // Sin alto ni padding propios: el del `<footer>` sale de pie.css y la grilla estira la caja, así la sección mide 100svh.
      // [FINAL 3] Móvil: una columna. Tablet: frase y contacto | navegación, y abajo a todo el ancho. Sin logo chico: el 3D está detrás.
      claseDeContenido="relative grid content-between gap-[var(--spacing-12)] tablet:grid-cols-2 tablet:gap-x-[var(--spacing-12)] escritorio:block"
    >
      {/* La caja posicionada va AFUERA de la llegada: P5 escribe su propia transformada. */}
      <div className="escritorio:absolute escritorio:top-1/2 escritorio:left-0 escritorio:w-[calc(50%-var(--hueco-del-pie))] escritorio:-translate-y-1/2">
        <Llega progreso={progreso} ventana={LLEGADAS_DEL_PIE.izquierda} className="flex flex-col gap-[var(--spacing-6)]">
          <Logotipo className="max-escritorio:hidden" />
          <div id={idDelTitularDeSeccion(seccion.id)}>
            <Titular nivel="titulo-xl" como="h2" peso="normal" className="text-balance">
              {TITULAR_DE_CIERRE}
            </Titular>
          </div>
          <ContactoDelPie />
        </Llega>
      </div>
      <div className="escritorio:absolute escritorio:top-1/2 escritorio:right-0 escritorio:w-[calc(50%-var(--hueco-del-pie))] escritorio:-translate-y-1/2">
        <LlegaConProgreso progreso={progreso} ventana={LLEGADAS_DEL_PIE.derecha}>
          {(p) => <ColumnasDelPie progreso={p} />}
        </LlegaConProgreso>
      </div>
      <div className="tablet:col-span-2 escritorio:absolute escritorio:inset-x-0 escritorio:bottom-0">
        <Llega progreso={progreso} ventana={LLEGADAS_DEL_PIE.abajo} className="flex flex-col gap-[var(--spacing-6)] escritorio:flex-row escritorio:items-center escritorio:justify-between">
          <RedesDelPie />
          <LineaLegal />
        </Llega>
      </div>
    </Pie>
  )
}

/** El tramo de una ventana del progreso de la sección, o `null` sin coreografía. */
function useTramo(progreso: Progreso, ventana: readonly [number, number]): MotionValue<number> | null {
  const cero = useMotionValue(0)
  const tramo = useTransform(progreso ?? cero, [ventana[0], ventana[1]], [0, 1])
  return progreso === null ? null : tramo
}

function Llega({
  progreso,
  ventana,
  className,
  mezcla = true,
  children,
}: {
  readonly progreso: Progreso
  readonly ventana: readonly [number, number]
  readonly className?: string
  /** Abajo de 1024 la pieza mezcla contra la escena; la fila de abajo no, porque lleva el acento de la marca. */
  readonly mezcla?: boolean
  readonly children: React.ReactNode
}): React.JSX.Element {
  const tramo = useTramo(progreso, ventana)
  return (
    // [FINAL 2] Abajo de 1024 el pie mezcla como el resto del tramo: la mezcla va en el canal, que es el que se transforma.
    <CanalDeUnaPieza progreso={tramo} patron="P5" className={cn(mezcla && MEZCLA_SOBRE_LA_ESCENA, className)}>
      {children}
    </CanalDeUnaPieza>
  )
}

function LlegaConProgreso({
  progreso,
  ventana,
  children,
}: {
  readonly progreso: Progreso
  readonly ventana: readonly [number, number]
  readonly children: (p: Progreso) => React.ReactNode
}): React.JSX.Element {
  return <>{children(useTramo(progreso, ventana))}</>
}
