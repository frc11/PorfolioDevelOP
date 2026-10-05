'use client'

import { useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { CONTENIDO } from '../contenido'
import { PX_DEL_FIN_DE_LA_LLEGADA, PX_DE_LA_SECCION, arranqueDeDemos } from '../geometria'

import { cn } from '@/lib/utils'

import { Biblioteca } from './Biblioteca'
import { Carrusel } from './Carrusel'
import type { Demo } from './catalogo'
import { LLEGADA, aparicionPedida, enElTramo, llegadaDeLaAparicion, perseguirLaAparicion, poseDelLibro, tramoDelLibro } from './entrada'
import { llevarALaLlegada } from './llevarALaLlegada'
import { TextoDeDemos } from './TextoDeDemos'
import { VentanaDeDemo } from './VentanaDeDemo'

/** [EL ENCASTRE] 1B · lo que pide el scroll, lo que se muestra y el cuadro que los acerca (0: quieto). */
interface Persecucion {
  pedida: number
  mostrada: number
  cuadro: number
  antes: number
}

/** Persigue a lo pedido cuadro a cuadro con la velocidad tope (`entrada.ts`) hasta alcanzarlo; después, nada corre. */
function perseguir(p: Persecucion, llegar: (a: number) => void): void {
  if (p.cuadro !== 0 || p.mostrada === p.pedida) return
  p.antes = performance.now()
  const paso = (ahora: number): void => {
    const dt = Math.min(0.1, Math.max(0, (ahora - p.antes) / 1000))
    p.antes = ahora
    p.mostrada = perseguirLaAparicion(p.mostrada, p.pedida, dt)
    llegar(p.mostrada)
    p.cuadro = p.mostrada === p.pedida ? 0 : requestAnimationFrame(paso)
  }
  p.cuadro = requestAnimationFrame(paso)
}

/** Lo alcanza de una vez (al cargar, al cambiar de ancho, al desmontarse). */
function alcanzar(p: Persecucion): void {
  if (p.cuadro !== 0) cancelAnimationFrame(p.cuadro)
  p.cuadro = 0
  p.mostrada = p.pedida
}

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
 * [CIERRE] 1B · desde 1024 lo que llega sigue el reloj de la llegada (`llegadaDeDemos`,
 * el doble de scroll: el último libro se asienta ya con el vacío lleno); abajo, la capa
 * rígida sigue escalando con el vacío.
 *
 * [EL ENCASTRE] 1B · lo que se muestra PERSIGUE a lo que pide el scroll con una
 * velocidad tope (`APARICION` en `entrada.ts`, como el amanecer), en los dos anchos y en
 * las dos direcciones: con un scroll rápido la aparición se ve entera y a su ritmo.
 * Abajo de 1024 la capa rígida crece ahora en 1,4 vacíos (antes, en uno) con el mismo tope.
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
  // [EL ENCASTRE] 1B · al cargar, lo mostrado es lo pedido (nadie vio el camino); después lo persigue.
  const [inicial] = useState(() => aparicionPedida(mostrado.get(), false))
  const aparicion = useRef<Persecucion>({ pedida: inicial, mostrada: inicial, cuadro: 0, antes: 0 })
  const libros = useRef<HTMLElement[]>([])
  const parrafo = useRef<HTMLDivElement | null>(null)
  const progresoDelTitulo = useMotionValue(enElTramo(llegadaDeLaAparicion(inicial), LLEGADA.titulo))
  const progresoDelParrafo = useMotionValue(enElTramo(llegadaDeLaAparicion(inicial), LLEGADA.parrafo))
  const [abierta, setAbierta] = useState<{ readonly demo: Demo; readonly pieza: HTMLAnchorElement } | null>(null)
  const [alejada, setAlejada] = useState(false)
  /**
   * ⚠️ **MÓVIL-TRABAJOS · ABAJO DE 1024 LA ENTRADA ES LA VIEJA: la capa entera, rígida,
   * crece con el vacío** —una escala y nada más, para ahorrar—. Quién está de qué lado
   * lo dice el CSS (`--demos-entrada`), no una consulta de ancho en JS. [EL ENCASTRE] 1B:
   * en 1,4 vacíos y con la velocidad tope.
   */
  const rigida = useRef(false)

  /** Escribe la llegada entera para una aparición mostrada (`a`: abajo de 1024, la escala de la capa). Subiendo se deshace. */
  const llegar = useCallback(
    (a: number): void => {
      if (rigida.current) {
        capa.current?.style.setProperty('--demos-escala', a.toFixed(5))
        progresoDelTitulo.set(1)
        progresoDelParrafo.set(1)
        parrafo.current?.style.setProperty('opacity', '1')
        return
      }
      const l = llegadaDeLaAparicion(a)
      progresoDelTitulo.set(enElTramo(l, LLEGADA.titulo))
      const delParrafo = enElTramo(l, LLEGADA.parrafo)
      progresoDelParrafo.set(delParrafo)
      parrafo.current?.style.setProperty('opacity', delParrafo.toFixed(3))
      libros.current.forEach((libro, i) => {
        const pose = poseDelLibro(enElTramo(l, tramoDelLibro(i, libros.current.length)))
        libro.style.setProperty('transform', pose.transform)
        libro.style.setProperty('opacity', pose.opacidad.toFixed(3))
      })
    },
    [progresoDelTitulo, progresoDelParrafo],
  )

  useLayoutEffect(() => {
    libros.current = [...(capa.current?.querySelectorAll<HTMLElement>('[data-pieza="libro"]') ?? [])]
    const p = aparicion.current
    // Al cambiar de ancho (o de lado de 1024) la aparición pedida es otra: se alcanza de una vez.
    const leerLaEntrada = (): void => {
      const el = capa.current
      rigida.current = el !== null && getComputedStyle(el).getPropertyValue('--demos-entrada').trim() === 'rigida'
      p.pedida = aparicionPedida(mostrado.get(), rigida.current)
      alcanzar(p)
      llegar(p.mostrada)
    }
    leerLaEntrada()
    window.addEventListener('resize', leerLaEntrada)
    return () => {
      window.removeEventListener('resize', leerLaEntrada)
      alcanzar(p)
    }
  }, [llegar, mostrado])

  /** El carrusel arranca cuando todo llegó (la aparición mostrada entera). */
  const carruselEnMarcha = useCallback((): boolean => aparicion.current.mostrada >= 1, [])

  // [EL ENCASTRE] 1B · el scroll pide; lo mostrado lo persigue con la velocidad tope.
  useMotionValueEvent(mostrado, 'change', (valor) => {
    const p = aparicion.current
    p.pedida = aparicionPedida(valor, rigida.current)
    perseguir(p, llegar)
  })

  useEffect(() => {
    const el = capa.current
    const panel = el?.closest<HTMLElement>('[data-panel]') ?? null
    if (el === null || panel === null) return
    // [CIERRE] 1B · adonde la llegada termina, pasado el arranque de demos ([EL ENCASTRE] 1B: también abajo de 1024).
    const llegaEntera = (): number => aparicion.current.mostrada
    const demos = arranqueDeDemos(CONTENIDO.proyectos.length)
    let cancelar = (): void => undefined
    const alEntrarElFoco = (e: FocusEvent): void => {
      // Sólo el teclado: un clic en una pieza a medio crecer abre la demo ahí mismo.
      if (llegaEntera() >= 1 || !(e.target instanceof HTMLElement) || !e.target.matches(':focus-visible')) return
      const arranque = Math.max(demos, PX_DEL_FIN_DE_LA_LLEGADA / PX_DE_LA_SECCION)
      // El progreso de la sección arranca con su borde de arriba en el pie del cuadro.
      const cero = panel.getBoundingClientRect().top + window.scrollY - window.innerHeight
      cancelar()
      // [INTERFAZ 1] Cierre: y si lo mostrado se asienta antes de que la capa llegue, la página sigue (`llevarALaLlegada`).
      cancelar = llevarALaLlegada({ destino: cero + arranque * panel.offsetHeight, alto: panel.offsetHeight, arranque, mostrado: () => mostrado.get(), llego: () => llegaEntera() >= 0.999 })
    }
    el.addEventListener('focusin', alEntrarElFoco)
    return () => {
      cancelar()
      el.removeEventListener('focusin', alEntrarElFoco)
    }
  }, [mostrado])

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
