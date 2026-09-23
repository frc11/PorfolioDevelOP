'use client'

import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { CONTENIDO } from '../contenido'
import { arranqueDeDemos } from '../geometria'

import { Biblioteca } from './Biblioteca'
import type { Demo } from './catalogo'
import { escalaDeDemos, transformDeDemos } from './entrada'
import { TextoDeDemos } from './TextoDeDemos'
import { VentanaDeDemo } from './VentanaDeDemo'


/**
 * LA CAPA DE DEMOS — la sección que se ve a través del vacío. **[DEMOS]**
 *
 * Detrás de la pila del túnel y encima del lienzo: es la escena la que se ve
 * alrededor de las piezas. Crece con la escala del vacío (`entrada.ts`) y llega a
 * 1 cuando el vacío llena el cuadro; desde ahí queda FIJA con el pin mientras la
 * escena sigue, y al despinearse se va con la sección hacia Servicios. Subiendo,
 * la misma función la achica dentro del vacío.
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
  const [abierta, setAbierta] = useState<{ readonly demo: Demo; readonly pieza: HTMLAnchorElement } | null>(null)
  const [alejada, setAlejada] = useState(false)

  useMotionValueEvent(mostrado, 'change', (p) => {
    escala.current = escalaDeDemos(p)
    capa.current?.style.setProperty('transform', transformDeDemos(escala.current))
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
      className={className}
      style={{ transform: transformDeDemos(inicial) }}
    >
      <Envoltorio className="h-full" claseDeContenido="grid h-full grid-cols-2 items-center gap-8">
        {/* La columna del logo: la escena lo pone ahí, y acá no se tapa. */}
        <div aria-hidden="true" />
        <div className="flex flex-col gap-8">
          <TextoDeDemos />
          <Biblioteca alAbrir={alAbrir} alejada={alejada} />
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
