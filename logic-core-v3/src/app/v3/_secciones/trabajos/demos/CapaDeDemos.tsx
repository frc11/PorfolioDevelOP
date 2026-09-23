'use client'

import { useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { CONTENIDO } from '../contenido'
import { arranqueDeDemos } from '../geometria'

import { cn } from '@/lib/utils'

import { Biblioteca } from './Biblioteca'
import { Carrusel } from './Carrusel'
import type { Demo } from './catalogo'
import { LLEGADA, enElTramo, escalaDeDemos, poseDelLibro, tramoDelLibro } from './entrada'
import { TextoDeDemos } from './TextoDeDemos'
import { VentanaDeDemo } from './VentanaDeDemo'


/**
 * LA CAPA DE DEMOS — la sección que se ve a través del vacío. **[DEMOS]**
 *
 * Detrás de la pila del túnel y encima del lienzo: es la escena la que se ve
 * alrededor de las piezas. Está en su lugar desde el principio —sin escala— y lo
 * que la muestra es el agujero del vacío. Sus cosas LLEGAN tarde y escalonadas,
 * atadas a la fracción del vacío (`entrada.ts`): el título, el párrafo y los
 * libros de a uno, y el último se asienta cuando el vacío llena el cuadro. Desde
 * ahí queda FIJA con el pin, y al despinearse se va con la sección.
 *
 * ⚠️ **VA DESPUÉS DEL TÚNEL EN EL MARCADO Y SE PINTA DETRÁS.** El orden del
 * marcado es el orden de lectura, y `s10-acceso` exige el mismo en las dos ramas:
 * abajo de 1025 las demos vienen después del CTA. Lo que la pone detrás es su
 * `z-index` negativo (`--z-elevado` dado vuelta), no su lugar en el documento: el
 * túnel no se toca.
 *
 * ⚠️ **UN FOCO ADENTRO LA TRAE AL CUADRO.** Con Tab desde el CTA se llega a la
 * primera pieza, que con la capa en escala cero no se vería: se lleva la página al
 * arranque de demos, como hace el navegador con cualquier foco fuera de vista.
 */
export function CapaDeDemos({
  mostrado,
  className,
}: {
  readonly mostrado: MotionValue<number>
  readonly className?: string
}): React.JSX.Element {
  const capa = useRef<HTMLDivElement | null>(null)
  const [inicial] = useState(() => escalaDeDemos(mostrado.get()))
  const escala = useRef(inicial)
  const libros = useRef<HTMLElement[]>([])
  const parrafo = useRef<HTMLDivElement | null>(null)
  const progresoDelTitulo = useMotionValue(enElTramo(inicial, LLEGADA.titulo))
  const progresoDelParrafo = useMotionValue(enElTramo(inicial, LLEGADA.parrafo))
  const [abierta, setAbierta] = useState<{ readonly demo: Demo; readonly pieza: HTMLAnchorElement } | null>(null)
  const [alejada, setAlejada] = useState(false)
  /**
   * ⚠️ **MÓVIL-TRABAJOS · ABAJO DE 1024 LA ENTRADA ES LA VIEJA: la capa entera, rígida,
   * crece con el vacío** —una escala y nada más, para ahorrar—. Quién está de qué lado
   * lo dice el CSS (`--demos-entrada`), no una consulta de ancho en JS.
   */
  const rigida = useRef(false)

  /** Escribe la llegada entera para una fracción del vacío. Pura: subiendo se deshace. */
  const llegar = useCallback(
    (u: number): void => {
      if (rigida.current) {
        capa.current?.style.setProperty('--demos-escala', u.toFixed(5))
        progresoDelTitulo.set(1)
        progresoDelParrafo.set(1)
        parrafo.current?.style.setProperty('opacity', '1')
        return
      }
      progresoDelTitulo.set(enElTramo(u, LLEGADA.titulo))
      const delParrafo = enElTramo(u, LLEGADA.parrafo)
      progresoDelParrafo.set(delParrafo)
      parrafo.current?.style.setProperty('opacity', delParrafo.toFixed(3))
      libros.current.forEach((libro, i) => {
        const pose = poseDelLibro(enElTramo(u, tramoDelLibro(i, libros.current.length)))
        libro.style.setProperty('transform', pose.transform)
        libro.style.setProperty('opacity', pose.opacidad.toFixed(3))
      })
    },
    [progresoDelTitulo, progresoDelParrafo],
  )

  useLayoutEffect(() => {
    libros.current = [...(capa.current?.querySelectorAll<HTMLElement>('[data-pieza="libro"]') ?? [])]
    const leerLaEntrada = (): void => {
      const el = capa.current
      rigida.current = el !== null && getComputedStyle(el).getPropertyValue('--demos-entrada').trim() === 'rigida'
      llegar(escala.current)
    }
    leerLaEntrada()
    window.addEventListener('resize', leerLaEntrada)
    return () => window.removeEventListener('resize', leerLaEntrada)
  }, [llegar])

  /** El carrusel arranca cuando el vacío llenó la pantalla. */
  const carruselEnMarcha = useCallback((): boolean => escala.current >= 1, [])

  useMotionValueEvent(mostrado, 'change', (p) => {
    escala.current = escalaDeDemos(p)
    llegar(escala.current)
  })

  useEffect(() => {
    const el = capa.current
    const panel = el?.closest<HTMLElement>('[data-panel]') ?? null
    if (el === null || panel === null) return
    const alEntrarElFoco = (e: FocusEvent): void => {
      // Sólo el teclado: un clic en una pieza a medio crecer abre la demo ahí mismo.
      if (escala.current >= 1 || !(e.target instanceof HTMLElement) || !e.target.matches(':focus-visible')) return
      // El progreso de la sección arranca con su borde de arriba en el pie del cuadro.
      const cero = panel.getBoundingClientRect().top + window.scrollY - window.innerHeight
      window.scrollTo({ top: cero + arranqueDeDemos(CONTENIDO.proyectos.length) * panel.offsetHeight })
    }
    el.addEventListener('focusin', alEntrarElFoco)
    return () => el.removeEventListener('focusin', alEntrarElFoco)
  }, [])

  const alAbrir = useCallback((demo: Demo, pieza: HTMLAnchorElement): void => {
    setAbierta({ demo, pieza })
    setAlejada(true)
  }, [])
  const alEmpezarACerrar = useCallback((): void => setAlejada(false), [])
  const alCerrar = useCallback((): void => setAbierta(null), [])

  return (
    <div
      ref={capa}
      data-capa="demos"
      /* ⚠️ Sin `will-change` (ni acá ni en las caras): promovida, obligaba a componer
         el túnel que se pinta encima, y el recorte del vacío dejaba de cortar el
         fondo de la ventana del CTA (medido: el agujero se veía claro). */
      className={cn(className, 'max-escritorio:[--demos-entrada:rigida] max-escritorio:[transform:scale(var(--demos-escala,0))]')}
    >
      <Envoltorio className="h-full" claseDeContenido="grid h-full grid-cols-2 items-center gap-8 max-escritorio:grid-cols-1 max-escritorio:content-center">
        {/* La columna del logo: la escena lo pone ahí, y acá no se tapa. Abajo de 1024 no hay columna. */}
        <div aria-hidden="true" className="max-escritorio:hidden" />
        <div className="flex flex-col gap-8 max-movil:gap-5">
          <TextoDeDemos progresoDelTitulo={progresoDelTitulo} progresoDelParrafo={progresoDelParrafo} refDelParrafo={parrafo} />
          <div className="max-escritorio:hidden">
            <Biblioteca alAbrir={alAbrir} alejada={alejada} />
          </div>
          <Carrusel enMarcha={carruselEnMarcha} />
        </div>
      </Envoltorio>
      {abierta === null ? null : (
        <VentanaDeDemo
          key={abierta.demo.slug}
          demo={abierta.demo}
          pieza={abierta.pieza}
          alEmpezarACerrar={alEmpezarACerrar}
          alCerrar={alCerrar}
        />
      )}
    </div>
  )
}
