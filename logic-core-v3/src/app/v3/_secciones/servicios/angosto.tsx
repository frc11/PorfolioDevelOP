'use client'

import { useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

import { ATRIBUTO_DE_SERVICIO } from '../_contrato/acento'
import { Bloque, CoreografiaEnTodoAncho, useCoreografiaActiva, type Progreso } from '../_contrato/coreografia'
import { useEstadoDisparado } from './disparo'
import { GraficoDeTorta } from './GraficoDeTorta'
import { RodilloDeEstados } from './RodilloDeEstados'
import { SIN_MEDIR, fronterasDeEstado, type MedidaDeLaTira } from './TiraDeServicios'

/**
 * SERVICIOS ABAJO DE 1024 — el título fijo arriba y los servicios en scroll normal.
 * **[MÓVIL 2]**
 *
 * La misma máquina que el panel de escritorio, medida sobre otra caja. En escritorio
 * la TIRA se traslada adentro de una ventana fija y el rodillo cambia cuando el tope
 * de cada bloque cruza una línea de esa ventana. Acá no se traslada nada: la página
 * scrollea y la «ventana» es lo que queda del cuadro debajo de la cabeza fija. Con eso
 * se arma una `MedidaDeLaTira` —recorrido, alto y topes— y un progreso que vale 0
 * cuando la cabeza se clava y 1 cuando suelta, así que las fronteras, el llenado de la
 * torta y su giro salen de las MISMAS funciones.
 *
 * ⚠️ **EL PROGRESO LO DA UN `Bloque` DE PIN SOBRE UNA REGLA, no sobre la caja.** El pin
 * mide `top top → bottom bottom`: sobre la caja terminaría cuando su pie toca el pie del
 * cuadro, antes de que el último servicio llegue a la línea —medido a 390: frontera 1,01,
 * el 03 no se encendía nunca—. La cabeza vive hasta que el pie de la caja la alcanza, o
 * sea un cuadro menos la cabeza más tarde, y la regla mide exactamente eso de más.
 *
 * La cabeza es decoración para el lector de pantalla (`aria-hidden`): el titular de la
 * sección y el nombre completo de cada servicio siguen en el marcado, en `sr-only`. Sin
 * coreografía —el papel, o quien pidió menos movimiento— no hay cabeza ni regla, y la
 * lista queda con su encabezado y el rótulo de cada servicio a la vista.
 */

/** La línea del cambio: un 30 % de la ventana debajo de la cabeza. En escritorio es 0,72. */
export const LINEA_ANGOSTA = 0.3

/** Mide la lista contra el cuadro: la `MedidaDeLaTira` de abajo de 1024, y el alto de la cabeza para la regla. */
function useMedidaAngosta(caja: RefObject<HTMLDivElement | null>, cabeza: RefObject<HTMLDivElement | null>, activa: boolean): MedidaDeLaTira {
  const [medida, setMedida] = useState<MedidaDeLaTira>(SIN_MEDIR)
  // En `useLayoutEffect`: la regla tiene que tener su alto antes de que el pin la mida.
  useLayoutEffect(() => {
    const lista = caja.current
    const fija = cabeza.current
    if (!activa || lista === null || fija === null) return
    const medir = (): void => {
      lista.style.setProperty('--alto-de-la-cabeza', `${String(fija.offsetHeight)}px`)
      if (fija.offsetParent === null) return
      const bloques = [...lista.querySelectorAll<HTMLElement>(`:scope > [${ATRIBUTO_DE_SERVICIO}]`)]
      const primero = bloques[0]
      const ultimo = bloques[bloques.length - 1]
      if (primero === undefined || ultimo === undefined) return
      const largo = ultimo.offsetTop + ultimo.offsetHeight - primero.offsetTop
      setMedida({ recorrido: Math.max(1, largo), alto: window.innerHeight - fija.offsetHeight, topes: bloques.map((b) => b.offsetTop - primero.offsetTop) })
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(lista)
    observador.observe(fija)
    return () => observador.disconnect()
  }, [caja, cabeza, activa])
  return medida
}

/** Pasa el progreso del pin de la regla al de la caja, que la cabeza lee. */
function Enlazar({ de, a }: { readonly de: MotionValue<number>; readonly a: MotionValue<number> }): null {
  useMotionValueEvent(de, 'change', (v) => a.set(v))
  useEffect(() => a.set(de.get()), [de, a])
  return null
}

/**
 * LA CABEZA FIJA y los servicios que pasan por debajo. `children` son el encabezado y
 * los bloques (`[data-servicio]`), hermanos de la cabeza adentro de la misma caja: por
 * eso el `sticky` suelta cuando termina el último. Pide la coreografía en todo ancho,
 * como Trabajos.
 */
export function ServiciosAngostos({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <CoreografiaEnTodoAncho>
      <CajaAngosta>{children}</CajaAngosta>
    </CoreografiaEnTodoAncho>
  )
}

function CajaAngosta({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const activa = useCoreografiaActiva()
  const caja = useRef<HTMLDivElement>(null)
  const cabeza = useRef<HTMLDivElement>(null)
  const progreso = useMotionValue(0)
  const medida = useMedidaAngosta(caja, cabeza, activa)
  const posicion = useEstadoDisparado(progreso, fronterasDeEstado(medida, LINEA_ANGOSTA))

  return (
    <div ref={caja} data-pieza="servicios-angostos" className="relative flex w-full flex-col">
      {activa ? (
        <>
          {/* La regla: la caja más un cuadro menos la cabeza. Vacía y sin eventos. */}
          <Bloque patron="pin" className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%+100svh-var(--alto-de-la-cabeza))] escritorio:hidden">
            {(regla: Progreso) => (regla === null ? null : <Enlazar de={regla} a={progreso} />)}
          </Bloque>
          <div
            ref={cabeza}
            aria-hidden="true"
            data-pieza="cabeza-de-servicios"
            /* El nombre baja un nivel (`titulo-m`): la caja del rodillo se deriva del mismo token y lo
               sigue. `data-cabeza` le dice al encabezado y a los rótulos que la cabeza los muestra. */
            data-cabeza=""
            className="bg-fondo sticky top-0 z-10 flex items-center [--text-fluido-titulo-l:var(--text-fluido-titulo-m)] gap-[var(--spacing-4)] px-[var(--pad-lateral-compacto)] py-[var(--spacing-4)] escritorio:hidden"
          >
            <div className="min-w-0 flex-1">
              <RodilloDeEstados posicion={posicion} />
            </div>
            <div className="w-[calc(var(--spacing-20)*1.25)] shrink-0">
              <GraficoDeTorta progreso={progreso} medida={medida} posicion={posicion} />
            </div>
          </div>
        </>
      ) : null}
      {children}
    </div>
  )
}
