'use client'

import { useEffect, useRef } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { TEXTO_DEL_MEDIO, TITULO_DEL_SERVICIO } from '../../_secciones/servicios/escenario/datos'

/** Las tres columnas del tablero. */
const COLUMNAS = ['Para hacer', 'En curso', 'Listo'] as const

/**
 * Los papeles sueltos: qué dicen, en qué columna terminan y dónde están tirados al principio (en % de la mesa, con su giro). El desorden
 * es FIJO (no al azar): se ve igual cada vez. Sin nombres ni cifras: son ejemplos de lo que anda suelto en un negocio.
 */
const PAPELES = [
  { texto: 'Pedido por WhatsApp', columna: 0, x: 6, y: 8, giro: -9 },
  { texto: 'Turno del sábado', columna: 1, x: 58, y: 4, giro: 7 },
  { texto: 'Presupuesto para mandar', columna: 0, x: 30, y: 30, giro: 4 },
  { texto: 'Stock por reponer', columna: 0, x: 70, y: 40, giro: -12 },
  { texto: 'Seña recibida', columna: 2, x: 12, y: 58, giro: 11 },
  { texto: 'Cliente nuevo', columna: 1, x: 44, y: 66, giro: -5 },
  { texto: 'Consulta sin contestar', columna: 1, x: 64, y: 72, giro: 8 },
  { texto: 'Factura enviada', columna: 2, x: 2, y: 34, giro: -3 },
  { texto: 'Pedido entregado', columna: 2, x: 36, y: 2, giro: -14 },
] as const

/** El lugar de cada papel en el tablero: su columna y su renglón dentro de ella (en % de la mesa). */
const LUGARES = PAPELES.map((p, i) => {
  const renglon = PAPELES.slice(0, i).filter((q) => q.columna === p.columna).length
  return { x: 2.5 + p.columna * 33, y: 16 + renglon * 26 }
})

const suave = (t: number): number => t * t * (3 - 2 * t)

/**
 * [L7e · S2] EL SISTEMA QUE SE ORDENA — la segunda parte de «lo de siempre, tachado» para Software: los papeles sueltos de un negocio
 * («si hoy tu negocio funciona con planillas, cuadernos y mensajes sueltos…») están tirados sobre la mesa, torcidos, y con el scroll
 * cada uno VIAJA a su columna de un tablero y se endereza, de a uno. Sale de la llegada en curva de las fotos del equipo (cada foto
 * viaja a su marco): acá cada papel viaja a su lugar. El escenario queda clavado mientras se ordena; al subir, se desordena. Con
 * movimiento reducido, ya ordenado.
 */
export function ElSistemaQueSeOrdena(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const recorrido = useRef<HTMLDivElement>(null)
  const mesa = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const caja = recorrido.current
    const m = mesa.current
    if (caja === null || m === null) return undefined
    const papeles = [...m.querySelectorAll<HTMLElement>('[data-papel]')]
    const ubicar = (t: number): void => {
      papeles.forEach((el, i) => {
        // Cada papel tiene su tramo, escalonado: el primero arranca enseguida, el último termina al final.
        const local = suave(Math.min(1, Math.max(0, (t - i * 0.07) / 0.4)))
        const p = PAPELES[i]
        const l = LUGARES[i]
        el.style.left = `${(p.x + (l.x - p.x) * local).toFixed(2)}%`
        el.style.top = `${(p.y + (l.y - p.y) * local).toFixed(2)}%`
        el.style.rotate = `${(p.giro * (1 - local)).toFixed(2)}deg`
      })
      m.style.setProperty('--tablero', suave(Math.min(1, t / 0.25)).toFixed(3))
    }
    if (reducido) {
      ubicar(1)
      return undefined
    }
    let pedido = 0
    const medir = (): void => {
      pedido = 0
      const r = caja.getBoundingClientRect()
      const total = r.height - window.innerHeight
      ubicar(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1)
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
  }, [reducido])

  const titulo = TITULO_DEL_SERVICIO.software
  return (
    <div data-servicio="software">
      <header className="mx-auto max-w-5xl px-6 pt-36 pb-6 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-acento uppercase">Software a medida · el orden</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">{titulo.derecho}</span>
          <span className="block font-liviano tracking-titulo italic uppercase">{titulo.cursiva}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-texto">{TEXTO_DEL_MEDIO.software[0]}</p>
      </header>
      <div ref={recorrido} className="h-[280svh]">
        <div className="sticky top-0 flex h-svh items-center justify-center px-4">
          <div ref={mesa} className="relative aspect-[4/5] w-full max-w-5xl tablet:aspect-[16/10]" style={{ '--tablero': '0' } as React.CSSProperties}>
            {/* El tablero: tres columnas que aparecen debajo de los papeles. */}
            <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 gap-[1%] opacity-[var(--tablero)]">
              {COLUMNAS.map((c) => (
                <div key={c} className="rounded-medio border border-acento/40 bg-superficie-1">
                  <p className="px-3 pt-3 font-codigo text-caption tracking-wide text-acento uppercase">{c}</p>
                </div>
              ))}
            </div>
            <ul aria-label="Lo que anda suelto en un negocio">
              {PAPELES.map((p) => (
                <li
                  key={p.texto}
                  data-papel=""
                  className="absolute w-[31%] rounded-sutil border border-borde-fuerte bg-fondo p-2 text-caption leading-snug shadow-md tablet:p-3 tablet:text-cuerpo"
                  style={{ left: `${String(p.x)}%`, top: `${String(p.y)}%`, rotate: `${String(p.giro)}deg` }}
                >
                  {p.texto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto max-w-2xl px-6 pb-48 text-base leading-texto">{TEXTO_DEL_MEDIO.software[2]}</p>
    </div>
  )
}
