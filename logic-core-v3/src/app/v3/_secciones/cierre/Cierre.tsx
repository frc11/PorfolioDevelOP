'use client'

import { useMotionValue, useTransform, type MotionValue } from 'motion/react'

import { Pie } from '../../_componentes/chrome/Pie'
import { Isotipo, Logotipo } from '../../_componentes/marca/Marca'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { POSES_DEL_FINAL, huecoDelLogo } from '../../_lib/escena/finalDelRecorrido'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { Seccion } from '../_contrato/Seccion'
import { ColumnasDelPie, PedidoDelPie } from './ColumnasDelPie'
import { LineaDeCierre } from './LineaDeCierre'
import { PEDIDOS_DE_CONTACTO, TITULAR_DE_CIERRE } from './contenido'

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
      claseDeContenido="relative grid content-between gap-[var(--spacing-12)] escritorio:block"
    >
      {/* El logo del pie apilado. Desde 1024 lo pone la escena, en el centro. */}
      <Isotipo className="h-[var(--spacing-12)] w-auto self-start escritorio:hidden" />
      {/* La caja posicionada va AFUERA de la llegada: P5 escribe su propia transformada. */}
      <div className="escritorio:absolute escritorio:top-1/2 escritorio:left-0 escritorio:w-[calc(50%-var(--hueco-del-pie))] escritorio:-translate-y-1/2">
        <Llega progreso={progreso} ventana={LLEGADAS_DEL_PIE.izquierda} className="flex flex-col gap-[var(--spacing-6)]">
          <Logotipo className="text-tinta" />
          <div id={idDelTitularDeSeccion(seccion.id)}>
            <Titular nivel="titulo-xl" como="h2" peso="normal" className="text-balance">
              {TITULAR_DE_CIERRE}
            </Titular>
          </div>
          <PedidoDelPie pedido={PEDIDOS_DE_CONTACTO[0]} />
        </Llega>
      </div>
      <div className="escritorio:absolute escritorio:top-1/2 escritorio:right-0 escritorio:w-[calc(50%-var(--hueco-del-pie))] escritorio:-translate-y-1/2">
        <LlegaConProgreso progreso={progreso} ventana={LLEGADAS_DEL_PIE.derecha}>
          {(p) => <ColumnasDelPie progreso={p} />}
        </LlegaConProgreso>
      </div>
      <div className="escritorio:absolute escritorio:inset-x-0 escritorio:bottom-0">
        <Llega progreso={progreso} ventana={LLEGADAS_DEL_PIE.abajo} className="flex flex-col gap-[var(--spacing-6)] escritorio:flex-row escritorio:items-end escritorio:justify-between">
          <PedidoDelPie pedido={PEDIDOS_DE_CONTACTO[1]} />
          <LineaDeCierre />
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
  children,
}: {
  readonly progreso: Progreso
  readonly ventana: readonly [number, number]
  readonly className?: string
  readonly children: React.ReactNode
}): React.JSX.Element {
  const tramo = useTramo(progreso, ventana)
  return (
    <CanalDeUnaPieza progreso={tramo} patron="P5" className={className}>
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
