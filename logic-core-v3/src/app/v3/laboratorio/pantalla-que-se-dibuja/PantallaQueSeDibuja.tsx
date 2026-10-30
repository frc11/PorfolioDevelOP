'use client'

import { useEffect, useRef } from 'react'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { TEXTO_DEL_MEDIO, TITULO_DEL_SERVICIO } from '../../_secciones/servicios/escenario/datos'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { avanceDeEntrada } from '../_lab/useAlCruzar'

/** Hasta dónde del avance se dibuja el alambre; el resto, se abre la pantalla real adentro. */
const FIN_DEL_DIBUJO = 0.72

/** La pantalla real que se destapa: la del primer trabajo del Portfolio (un póster que ya existe). */
const PANTALLA = PROYECTOS[0]

/**
 * [L7e · W1] LA PANTALLA QUE SE DIBUJA — a la par del texto de Desarrollo web («Pensamos cada pantalla para que se entienda sola»), el
 * alambre de una página (la ventana, la barra, el titular, el botón, la imagen, tres bloques) se dibuja trazo por trazo con el scroll,
 * en el celeste oscuro de web y con el trazo fino del globo de Servicios; cuando termina, la pantalla de un trabajo real se abre adentro
 * desde el centro (el `clip-path` de la segunda toma). Trazos con `strokeDashoffset` y la longitud real de cada uno, sin `non-scaling-stroke` (con él, el guion se mide en píxeles y la longitud en unidades: queda cortado) (la lección de
 * `pathLength` del repo). En escritorio el dibujo queda clavado mientras pasa el texto; abajo de 1024 se dibuja mientras cruza la
 * pantalla. Con movimiento reducido, dibujado y abierto.
 */
export function PantallaQueSeDibuja(): React.JSX.Element {
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const reducido = usePrefiereMenosMovimiento()
  const recorrido = useRef<HTMLDivElement>(null)
  const dibujo = useRef<SVGSVGElement>(null)
  const real = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const caja = recorrido.current
    const svg = dibujo.current
    const foto = real.current
    if (caja === null || svg === null || foto === null) return undefined
    const trazos = [...svg.querySelectorAll<SVGGeometryElement>('[data-trazo-del-alambre]')]
    const largos = trazos.map((t) => t.getTotalLength())
    trazos.forEach((t, i) => {
      t.style.strokeDasharray = `${largos[i].toFixed(2)}`
    })
    const pintar = (v: number): void => {
      const dibujado = Math.min(1, v / FIN_DEL_DIBUJO)
      trazos.forEach((t, i) => {
        // Cada trazo tiene su tramo del dibujo, uno después del otro (el orden de lectura de una pantalla).
        const local = Math.min(1, Math.max(0, dibujado * trazos.length - i))
        t.style.strokeDashoffset = `${(largos[i] * (1 - local)).toFixed(2)}`
      })
      const abierto = Math.min(1, Math.max(0, (v - FIN_DEL_DIBUJO) / (1 - FIN_DEL_DIBUJO)))
      foto.style.clipPath = `inset(${((1 - abierto) * 50).toFixed(2)}%)`
    }
    if (reducido) {
      pintar(1)
      return undefined
    }
    let pedido = 0
    const medir = (): void => {
      pedido = 0
      if (escritorio) {
        const r = caja.getBoundingClientRect()
        const total = r.height - window.innerHeight
        pintar(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1)
      } else {
        pintar(avanceDeEntrada(svg.getBoundingClientRect().top, window.innerHeight, 0.1))
      }
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(medir)
    }
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    medir()
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [escritorio, reducido])

  const titulo = TITULO_DEL_SERVICIO.web
  return (
    <div data-servicio="web">
      <header className="mx-auto max-w-6xl px-6 pt-36 pb-12 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-acento uppercase">Desarrollo web · cómo pensamos</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">{titulo.derecho}</span>
          <span className="block font-liviano tracking-titulo italic uppercase">{titulo.cursiva}</span>
        </h1>
      </header>
      <div ref={recorrido} className="mx-auto grid max-w-6xl gap-12 px-6 pb-[30svh] escritorio:h-[260svh] escritorio:grid-cols-[1fr_1.25fr] escritorio:gap-16">
        <div className="space-y-[30svh] escritorio:pt-[20svh] max-escritorio:order-2 max-escritorio:space-y-6">
          {TEXTO_DEL_MEDIO.web.map((p) => (
            <p key={p.slice(0, 24)} className="text-base leading-texto escritorio:text-titulo-s escritorio:leading-titulo">
              {p}
            </p>
          ))}
        </div>
        <div className="escritorio:sticky escritorio:top-[18svh] escritorio:self-start">
          <div className="relative w-full">
            <svg ref={dibujo} viewBox="0 0 400 300" className="block w-full text-acento" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" aria-hidden="true">
              <rect data-trazo-del-alambre="" x="10" y="10" width="380" height="280" rx="10" />
              <line data-trazo-del-alambre="" x1="10" y1="36" x2="390" y2="36" />
              <circle data-trazo-del-alambre="" cx="25" cy="23" r="4" />
              <circle data-trazo-del-alambre="" cx="39" cy="23" r="4" />
              <line data-trazo-del-alambre="" x1="30" y1="56" x2="90" y2="56" />
              <line data-trazo-del-alambre="" x1="250" y1="56" x2="370" y2="56" />
              <line data-trazo-del-alambre="" x1="30" y1="100" x2="220" y2="100" />
              <line data-trazo-del-alambre="" x1="30" y1="118" x2="180" y2="118" />
              <rect data-trazo-del-alambre="" x="30" y="136" width="80" height="22" rx="11" />
              <rect data-trazo-del-alambre="" x="246" y="80" width="124" height="82" rx="6" />
              <rect data-trazo-del-alambre="" x="30" y="188" width="104" height="82" rx="6" />
              <rect data-trazo-del-alambre="" x="148" y="188" width="104" height="82" rx="6" />
              <rect data-trazo-del-alambre="" x="266" y="188" width="104" height="82" rx="6" />
            </svg>
            {/* La pantalla real, en el hueco de la ventana (debajo de su barra), cerrada al centro hasta que el alambre termina. */}
            <div ref={real} className="absolute overflow-hidden rounded-b-[2.5%]" style={{ left: '2.5%', top: '12%', width: '95%', height: '84.7%', clipPath: 'inset(50%)', willChange: 'clip-path' }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- prototipo: el póster ya optimizado del Portfolio */}
              <img src={PANTALLA.medios.poster.escritorio} alt={`La página de ${PANTALLA.nombre}`} className="block size-full object-cover object-top" />
            </div>
          </div>
          <p className="mt-4 font-codigo text-caption text-tinta-media">Adentro: {PANTALLA.nombre}, un trabajo real.</p>
        </div>
      </div>
    </div>
  )
}
