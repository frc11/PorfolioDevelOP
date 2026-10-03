'use client'

import { useId, useRef } from 'react'

import { cn } from '@/lib/utils'

import { useModoDelPie, usePiezaDelPie, usePieListo } from '../../_lib/pie3d/registro'

/**
 * [RETOQUE DEL PIE] P2 · UN TEXTO SUELTO DEL PIE (el logotipo, el titular, los rótulos de columna, la línea legal): en
 * `volumen` (desde 1025) se anota y la escena lo dibuja extruido en el negro satinado, con el filo b (`escena/pie3d/`);
 * con el 3D listo, el DOM lo apaga con una opacidad (sigue en el árbol accesible: es el nombre del encabezado). En los
 * otros modos, el texto de siempre.
 */
export function TextoDelPie({ children, className }: { readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  const modo = useModoDelPie()
  const raiz = useRef<HTMLDivElement | null>(null)
  const id = useId()
  const listo = usePieListo()
  usePiezaDelPie(raiz, { id, forma: 'texto', activo: modo === 'volumen' })
  return (
    <div ref={raiz} data-pieza="texto-del-pie" className={cn(modo === 'volumen' && listo && 'escritorio:opacity-0', className)}>
      {children}
    </div>
  )
}
