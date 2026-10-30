'use client'

import { useCallback, useRef } from 'react'

import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { useAvanceDelRecorrido } from '../useAvanceDelRecorrido'
import { COLUMNAS_DE_LO_DE_SIEMPRE, RENGLONES, avanceDelRenglon } from './datos'

/**
 * [M3] LO DE SIEMPRE, TACHADO — el prototipo 4 cambiado como pidió Valentino: «que se tache primero en movimiento y al mismo tiempo
 * aparezca lo otro». Cada renglón tiene UN avance (cruza la pantalla de abajo hacia el medio): con ese mismo valor la raya cruza lo de
 * siempre y lo despinta, y lo que lo reemplaza se descubre a su lado de izquierda a derecha. Se lee como hoy contra la solución.
 *
 * La raya es la del titular de Quiénes somos: el `data-trazo="tachado"` de `_estilos/trazo.css` (su grosor, su tono, el despinte por
 * `--trazo-despinte`). Acá el avance lo escribe el renglón, así que se mueve en todos los anchos (la coreografía del home sólo anda desde
 * 1025). Al subir, se destacha. Con movimiento reducido (y sin JS) sale como la rama quieta del trazo: tachado y con lo nuevo a la vista.
 */
export function RenglonesTachados(): React.JSX.Element {
  const reducido = useMovimientoReducido()
  return (
    <div className="flex flex-col">
      <div aria-hidden="true" className="hidden gap-8 border-b border-borde pb-3 tablet:grid tablet:grid-cols-2">
        <p className="font-codigo text-micro tracking-wide text-tinta-media uppercase">{COLUMNAS_DE_LO_DE_SIEMPRE.hoy}</p>
        <p className="font-codigo text-micro tracking-wide text-acento uppercase">{COLUMNAS_DE_LO_DE_SIEMPRE.despues}</p>
      </div>
      <ul role="list">
        {RENGLONES.map((r) => (
          <Renglon key={r.antes} antes={r.antes} despues={r.despues} conMovimiento={!reducido} />
        ))}
      </ul>
    </div>
  )
}

function Renglon({ antes, despues, conMovimiento }: { readonly antes: string; readonly despues: string; readonly conMovimiento: boolean }): React.JSX.Element {
  const renglon = useRef<HTMLLIElement>(null)
  const tramo = useRef<HTMLSpanElement>(null)
  const raya = useRef<HTMLSpanElement>(null)
  const nuevo = useRef<HTMLSpanElement>(null)
  const alAvanzar = useCallback((avance: number) => {
    const a = avanceDelRenglon(avance)
    tramo.current?.style.setProperty('--trazo-despinte', a.toFixed(3))
    if (raya.current !== null) raya.current.style.transform = `scaleX(${a.toFixed(4)})`
    if (nuevo.current !== null) nuevo.current.style.clipPath = `inset(-10% ${((1 - a) * 100).toFixed(2)}% -10% 0)`
  }, [])
  useAvanceDelRecorrido(renglon, alAvanzar, { modo: 'cruce', desde: 0.85, hasta: 0.45 }, conMovimiento)
  return (
    <li ref={renglon} className="grid grid-cols-1 gap-2 border-b border-borde py-6 tablet:grid-cols-2 tablet:items-baseline tablet:gap-8 escritorio:py-9">
      <p className="text-titulo-s leading-titulo tablet:text-titulo-m">
        <span className="sr-only">{COLUMNAS_DE_LO_DE_SIEMPRE.hoy}: </span>
        <span ref={tramo} data-trazo="tachado">
          {antes}
          <span ref={raya} data-parte="linea" />
        </span>
      </p>
      <p className="text-titulo-s leading-titulo tablet:text-titulo-m">
        <span className="sr-only">{COLUMNAS_DE_LO_DE_SIEMPRE.despues}: </span>
        <span ref={nuevo} className="inline-block font-display font-fuerte tracking-display text-acento uppercase" style={conMovimiento ? { willChange: 'clip-path' } : undefined}>
          {despues}
        </span>
      </p>
    </li>
  )
}
