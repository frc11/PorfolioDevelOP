'use client'

import { useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Micro } from '../../_componentes/tipografia/Textos'
import { usePrueba } from '../../_lib/pruebasDeLaInterfaz'
import { vaInvertido } from '../menu/tono'
import { useTonoDebajo } from '../menu/useTonoDebajo'
import { LogoQueSeDibuja } from './LogoQueSeDibuja'
import { RelojDelDia } from './RelojDelDia'
import { SECCIONES_DEL_RECORRIDO, avanceDelRecorrido, medirElRecorrido, seccionEn } from './recorrido'

/**
 * [INTERFAZ 2] T4 · EL INDICADOR DE RECORRIDO (con `?pruebas=recorrido=logo` o `=reloj`). Nada de la línea de progreso:
 *   · `logo` — el logo chico que se dibuja a medida que bajás: primero el infinito y, al final, el palo de la «p»;
 *   · `reloj` — un disco con el ciclo de la escena (el día, la noche de Trabajos, el amanecer, el día) y una aguja.
 *
 * Las dos son navegación: cada sección es un punto (un enlace) en el trazo o en el borde del disco, y tocar el trazo o el
 * disco lleva a la sección de ese tramo. Viajan con el MISMO gesto que la barra (`SELECTOR_DE_LOS_VIAJES`). Para el
 * lector y el teclado es una lista de enlaces con nombre, con la sección actual marcada (`aria-current`); el dibujo no
 * se anuncia.
 *
 * Cada sección se lleva un tramo igual (`avanceDelRecorrido`). Va en una pastilla como el botón del menú, con su tono
 * dado vuelta respecto de lo que hay debajo (`useTonoDebajo`): oscura sobre el papel y clara sobre la noche.
 * Sólo desde 1024 (el umbral del sitio, `max-escritorio:hidden`); en el teléfono no va (la propuesta, en
 * `t4-recorrido/mirar.txt`). Abajo a la derecha: abajo a la izquierda está, en desarrollo, el botón de Next.
 */
export function IndicadorDelRecorrido(): React.JSX.Element | null {
  const variante = usePrueba('recorrido')
  if (variante === 'no') return null
  return <Recorrido variante={variante} />
}

/** Antes de medir: un tramo igual por sección, en el avance de la página también. */
const REPARTO_PAREJO: readonly number[] = SECCIONES_DEL_RECORRIDO.map((_, i) => i / SECCIONES_DEL_RECORRIDO.length)

export interface PropsDeLaVariante {
  /** El avance del recorrido (0 → 1, un tramo igual por sección), directo: sin un render por cuadro. */
  readonly recorrido: MotionValue<number>
  readonly inicios: readonly number[]
  /** Los enlaces de las secciones, ya armados: la variante sólo dice dónde va cada uno (en % de su caja). */
  readonly pasos: (lugares: readonly (readonly [number, number])[]) => ReactNode
  /** Lleva a la sección `i` por su enlace (pasa por el viaje). */
  readonly ir: (i: number) => void
}

function Recorrido({ variante }: { readonly variante: 'logo' | 'reloj' }): React.JSX.Element {
  const caja = useRef<HTMLElement>(null)
  const invertido = vaInvertido(useTonoDebajo(caja, true))
  const { scrollYProgress } = useScroll()
  const [inicios, setInicios] = useState<readonly number[]>(REPARTO_PAREJO)
  // El transformador lee los inicios de un ref: el de `useTransform` puede quedar con los del primer render.
  const iniciosVivos = useRef<readonly number[]>(REPARTO_PAREJO)
  const recorrido = useTransform(scrollYProgress, (p) => avanceDelRecorrido(p, iniciosVivos.current))
  const [actual, setActual] = useState(0)
  const [nombrado, setNombrado] = useState<number | null>(null)

  // Lo que mide el DOM: al montar y cuando el documento cambia de alto (una sección que se arma, un cambio de ancho).
  useEffect(() => {
    let cuadro = 0
    const medir = (): void => {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => {
        const medidos = medirElRecorrido(document, window.scrollY, window.innerHeight)
        iniciosVivos.current = medidos
        recorrido.set(avanceDelRecorrido(scrollYProgress.get(), medidos))
        setInicios(medidos)
      })
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(document.documentElement)
    return () => {
      observador.disconnect()
      cancelAnimationFrame(cuadro)
    }
  }, [recorrido, scrollYProgress])

  // React sólo cuando cambia la sección: el dibujo lo mueve el avance directo (un MotionValue), no un estado.
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = seccionEn(p, inicios)
    if (i !== actual) setActual(i)
  })

  const ir = (i: number): void => {
    caja.current?.querySelector<HTMLAnchorElement>(`a[href="#${SECCIONES_DEL_RECORRIDO[i].id}"]`)?.click()
  }

  const pasos = (lugares: readonly (readonly [number, number])[]): ReactNode => (
    <ol className="contents">
      {SECCIONES_DEL_RECORRIDO.map((s, i) => (
        <li key={s.id} className="contents">
          <a
            href={`#${s.id}`}
            data-parte="paso-del-recorrido"
            aria-label={`Ir a ${s.rotulo}`}
            aria-current={i === actual ? 'location' : undefined}
            onPointerEnter={() => setNombrado(i)}
            onPointerLeave={() => setNombrado(null)}
            onFocus={() => setNombrado(i)}
            onBlur={() => setNombrado(null)}
            className="group absolute grid size-[var(--spacing-6)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{ left: `${(lugares[i]?.[0] ?? 0).toFixed(2)}%`, top: `${(lugares[i]?.[1] ?? 0).toFixed(2)}%` }}
          >
            <span
              aria-hidden="true"
              className={`border-fondo block rounded-full border transition-transform duration-[var(--duracion-media)] ease-out group-hover:scale-150 group-focus-visible:scale-150 ${i === actual ? 'bg-acento size-[var(--spacing-3)]' : 'bg-tinta size-[var(--spacing-2)]'}`}
            />
          </a>
        </li>
      ))}
    </ol>
  )

  const props: PropsDeLaVariante = { recorrido, inicios, pasos, ir }
  return (
    <nav
      ref={caja}
      aria-label="Recorrido de la página"
      data-pieza="recorrido"
      data-variante={variante}
      data-seccion={invertido ? 'invertida' : undefined}
      className="bg-fondo text-tinta border-borde fixed right-[var(--spacing-6)] bottom-[var(--spacing-6)] z-[var(--z-cabecera)] flex items-center gap-[var(--spacing-4)] rounded-[var(--radius-fuerte)] border py-[var(--spacing-3)] pr-[var(--spacing-4)] pl-[var(--spacing-5)] shadow-[var(--shadow-flotante)] transition-colors duration-[var(--duracion-media)] max-escritorio:hidden"
    >
      {/* El nombre de la sección: la que se ve, o la del punto bajo el puntero o el foco. */}
      <Micro como="span" peso="medio" className="min-w-[var(--spacing-20)] text-right uppercase" aria-hidden="true">
        {SECCIONES_DEL_RECORRIDO[nombrado ?? actual]?.rotulo}
      </Micro>
      {variante === 'logo' ? <LogoQueSeDibuja {...props} /> : <RelojDelDia {...props} />}
    </nav>
  )
}
