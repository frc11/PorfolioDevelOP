'use client'

import { motionValue, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import type { VarianteDePortfolio } from '../../_lib/escena/entorno'
import { useTituloDeVolumen, useTituloListo, useTitulosDeVolumen } from '../../_lib/titulos3d/registro'
import { LLEGADAS_DE_PORTFOLIO } from '../../_lib/titulos3d/variantesDePortfolio'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { useLlegadaDelTitulo } from '../llegadaDelTitulo'

/** Para la rama quieta (sin progreso): el gancho de la llegada repetida no es condicional. */
const LLEGADO = motionValue(1)

/**
 * [PASADA FINAL] 0 · EL TÍTULO DE PORTFOLIO CON UNA LLEGADA DE ANTES (`?pruebas=portfolio=…`; el porqué y las cifras, en
 * `_lib/titulos3d/variantesDePortfolio.ts`). El mismo DOM que `TituloDeVolumen` (el texto guarda el lugar; armado el 3D,
 * desde 1024 queda invisible y entero para el lector), anotado con la forma, la colocación y los tiempos de la variante,
 * y con la huida del cartel como salida (como entonces). Sin la bandera no se monta: el producto usa `TituloDeVolumen`.
 */
export function PortfolioDePrueba({ variante, texto, llegada, huida, llegadaDe }: { readonly variante: VarianteDePortfolio; readonly texto: string; readonly llegada: MotionValue<number> | null; readonly huida: MotionValue<number>; readonly llegadaDe: string }): React.JSX.Element {
  const v = LLEGADAS_DE_PORTFOLIO[variante]
  const material = useTitulosDeVolumen()
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const listo = useTituloListo('portfolio')
  const lugar = useRef<HTMLSpanElement | null>(null)
  const repetible = useLlegadaDelTitulo(llegadaDe, llegada ?? LLEGADO)
  useTituloDeVolumen({ id: 'portfolio', texto, lugar, lectura: v.lectura, llegada: llegada === null ? null : repetible, salida: huida, forma: v.forma, colocacion: v.colocacion, minimoS: v.minimoS, salidaMinimaS: v.salidaMinimaS, activo: material !== 'no' && escritorio })
  return (
    <>
      {listo && <span className="sr-only hidden escritorio:block">{texto}</span>}
      <span ref={lugar} data-variante-de-portfolio={variante} className={listo ? 'block escritorio:invisible' : 'block'}>
        {texto}
      </span>
    </>
  )
}
