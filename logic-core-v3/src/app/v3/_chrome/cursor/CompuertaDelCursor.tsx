'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_CURSOR, deberiaMontarseElCursor } from '../../_lib/cursor'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

const CursorDeLaSala = dynamic(() => import('./CursorDeLaSala'), { ssr: false })

/**
 * [INTERFAZ 1] T2 · LA COMPUERTA DEL CURSOR DE LA SALA — la de S3 (`chrome/CursorCompuerta.tsx`: desde el umbral de la
 * composición, 1024, y sin movimiento reducido) más el PUNTERO FINO: `(hover: hover) and (pointer: fine)`. Una laptop
 * con pantalla táctil y mouse lo monta (el puntero principal es fino); una tablet grande, no. El componente se descarga
 * sólo si monta (`dynamic`, sin servidor): ni su código ni su hoja están en la carga inicial de /v3.
 */
export const CONSULTA_PUNTERO_FINO = '(hover: hover) and (pointer: fine)'

export function CompuertaDelCursor(): React.JSX.Element | null {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_CURSOR)
  const punteroFino = useAnchoMinimo(CONSULTA_PUNTERO_FINO)
  const prefiereMenosMovimiento = usePrefiereMenosMovimiento()
  if (!punteroFino || !deberiaMontarseElCursor(arribaDelUmbral, prefiereMenosMovimiento)) return null
  return <CursorDeLaSala />
}
