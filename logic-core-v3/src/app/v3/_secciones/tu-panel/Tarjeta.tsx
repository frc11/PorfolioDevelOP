'use client'

import { Hand, MousePointerClick } from 'lucide-react'
import { useEffect, useReducer, useRef } from 'react'

import { Imagen } from '../../_componentes/medios/Imagen'
import { sizesPorViewport } from '../../_lib/imagen'
import { DemoEnSuLugar } from '../../_panel-vivo/DemoDelPanel'
import { CONTENIDO_DEL_PANEL } from '../../_panel-vivo/desplazar'
import { RuedaDelModulo } from '../../_panel-vivo/rueda'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { CANDADO_INICIAL, CARTEL_MS, laRuedaEsDeAdentro, siguienteCandado } from './candado'
import { CAPTURA, CARTEL, type Tarjeta as DatosDeTarjeta } from './contenido'
import { CLASE_DE_ENCUADRE, MODULO, PANTALLA_DEL_MODULO } from './geometria'

/**
 * UN MÓDULO DE TU PANEL — [B6] la maqueta del panel (`_panel-vivo/`, con sus datos de ejemplo y el sello «Ejemplo»), un
 * poco más chica que las demos de antes, en su marco que flota (esquinas redondeadas y una sombra suave y física, `contain`
 * para que lo que pasa adentro no le cueste a la página). Llega con P2 y la ventana de la demo (termina de subir cuando su
 * pie cruza la mitad del cuadro, [AJUSTES FINALES] A7). Abajo de 1024, a la proporción de la pantalla angosta (4:5).
 *
 * EL CANDADO (`candado.ts`): con la rueda encima, la página scrollea y el cartel aparece sobre el módulo con su fondo
 * atenuado; el clic (o el toque) habilita el scroll de adentro; salir del módulo, tocar afuera o que el módulo salga del
 * cuadro lo vuelve a bloquear. El cartel, mientras se ve, toma el clic: habilita sin apretar lo que haya debajo.
 */
export function Tarjeta({ tarjeta }: { readonly tarjeta: DatosDeTarjeta }): React.JSX.Element {
  const [candado, cambiar] = useReducer(siguienteCandado, CANDADO_INICIAL)
  const marco = useRef<HTMLDivElement>(null)
  const reloj = useRef(0)

  const avisar = (tipo: 'rueda' | 'arrastre'): void => {
    if (candado.libre) return
    cambiar({ tipo })
    window.clearTimeout(reloj.current)
    reloj.current = window.setTimeout(() => cambiar({ tipo: 'olvido' }), CARTEL_MS)
  }
  useEffect(() => () => window.clearTimeout(reloj.current), [])

  // Habilitado: tocar afuera, o que el módulo salga del cuadro, lo vuelve a bloquear (el ratón sale con `pointerleave`).
  // [B6] Y la rueda es del módulo: el marco lleva `data-lenis-prevent` (Lenis no la toma) y, donde el contenido no la puede
  // absorber (en su borde, sin recorrido, o fuera de él), se frena: la página no se mueve mientras el candado está abierto.
  useEffect(() => {
    const el = marco.current
    if (!candado.libre || el === null) return undefined
    const afuera = (e: PointerEvent): void => {
      if (e.target instanceof Node && !el.contains(e.target)) cambiar({ tipo: 'salida' })
    }
    const vista = new IntersectionObserver(([e]) => {
      if (e !== undefined && !e.isIntersecting) cambiar({ tipo: 'salida' })
    })
    const rueda = (e: WheelEvent): void => {
      const contenido = el.querySelector<HTMLElement>(CONTENIDO_DEL_PANEL)
      const adentro = contenido !== null && e.target instanceof Node && contenido.contains(e.target)
      if (!laRuedaEsDeAdentro(contenido, e.deltaY, adentro)) e.preventDefault()
    }
    document.addEventListener('pointerdown', afuera, true)
    el.addEventListener('wheel', rueda, { passive: false })
    vista.observe(el)
    return () => {
      document.removeEventListener('pointerdown', afuera, true)
      el.removeEventListener('wheel', rueda)
      vista.disconnect()
    }
  }, [candado.libre])

  const respaldo = <Imagen src={tarjeta.imagen} alt={tarjeta.alt} ancho={CAPTURA.ancho} alto={CAPTURA.alto} sizes={sizesPorViewport(MODULO.anchoAngosto, 100)} className={`h-full object-cover ${CLASE_DE_ENCUADRE[tarjeta.encuadre]}`} />
  const visible = candado.cartel !== null
  const Icono = candado.cartel === 'tactil' ? Hand : MousePointerClick

  return (
    <Bloque patron="P2" rango="ventana-de-la-demo" className="w-full">
      {(progreso) => (
        <CanalDeUnaPieza progreso={progreso} patron="P2">
          <div
            data-parte="marco"
            ref={marco}
            data-candado={candado.libre ? 'libre' : 'puesto'}
            data-lenis-prevent={candado.libre ? '' : undefined}
            onWheel={() => avisar('rueda')}
            onTouchMove={() => avisar('arrastre')}
            onClick={() => cambiar({ tipo: 'clic' })}
            onPointerLeave={(e) => {
              if (e.pointerType !== 'touch') cambiar({ tipo: 'salida' })
            }}
            className="relative aspect-[var(--proporcion)] max-escritorio:aspect-4/5 w-full overflow-hidden rounded-[calc(var(--radius-fuerte)*1.6)] shadow-[0_var(--spacing-1)_var(--spacing-2)_var(--tw-shadow-color),0_var(--spacing-6)_var(--spacing-12)_calc(var(--spacing-5)*-1)_var(--tw-shadow-color)] shadow-tinta/25 contain-layout contain-paint"
          >
            {/* Abierto, el dedo en el borde del contenido tampoco arrastra la página (`overscroll-behavior`). */}
            <div data-parte="maqueta" className={candado.libre ? 'absolute inset-0 [&_[data-parte=contenido-del-panel]]:overscroll-contain' : 'absolute inset-0'}>
              <RuedaDelModulo value={candado.libre}>
                <DemoEnSuLugar demo={tarjeta.demo} pantalla={PANTALLA_DEL_MODULO} respaldo={respaldo} />
              </RuedaDelModulo>
            </div>
            <div
              aria-hidden="true"
              data-parte="cartel"
              data-visible={visible ? '' : undefined}
              className={`absolute inset-0 z-20 flex items-center justify-center bg-tinta/60 transition-opacity duration-[var(--duracion-rapida)] ease-[var(--ease-salida)] motion-reduce:transition-none ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <span className="bg-fondo text-tinta text-caption leading-texto font-medio flex items-center gap-[var(--spacing-2)] rounded-full px-[var(--spacing-5)] py-[var(--spacing-3)]">
                <Icono className="size-[var(--spacing-4)]" strokeWidth={1.5} aria-hidden="true" />
                {candado.cartel === 'tactil' ? CARTEL.tactil : CARTEL.raton}
              </span>
            </div>
          </div>
        </CanalDeUnaPieza>
      )}
    </Bloque>
  )
}
