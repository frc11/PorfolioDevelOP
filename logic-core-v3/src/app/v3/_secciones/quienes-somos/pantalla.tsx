'use client'

import { cn } from '@/lib/utils'

import { Grilla } from '../../_componentes/layout/Grilla'

import { GEOMETRIA } from './geometria'

/**
 * LAS DOS PRIMITIVAS DE COMPOSICIÓN DE «QUIÉNES SOMOS».
 *
 * Salieron de `QuienesSomos.tsx` cuando ese archivo pasó las 300 líneas de
 * código por segunda vez —el mismo corte que ya había producido `marco.tsx`— y
 * el corte es por TEMA: acá está CÓMO se acomoda una pantalla de la sección, y
 * en los otros dos archivos QUÉ dice cada una. Ninguna de las dos sabe qué
 * contenido la usa, y por eso las tres pantallas pueden compartirlas.
 *
 * ⚠️ No se exportan hacia afuera de la sección: son de acá. Quien entra a la
 * sección lo hace por `QuienesSomos.tsx`, que sigue siendo la única puerta.
 */
/** El contenedor de una pantalla de texto. `escritorio:py-0` y no un relleno fijo: arriba de 1025 el borde lo pone el reparto. */
export function Pantalla(props: {
  readonly nombre: string
  readonly children: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      data-pantalla={props.nombre}
      className="flex min-h-svh w-full flex-col justify-center py-12 escritorio:py-0"
    >
      {props.children}
    </div>
  )
}


/**
 * LA CALLE DERECHA — del 50 % del viewport al margen derecho. Todo el bloque
 * El Equipo —el rótulo, las dos personas y la foto del equipo— vive adentro:
 * la mitad izquierda es del logo, siempre.
 *
 * `data-pantalla` es hijo directo de `Envoltorio`, cuyo padding es SIMÉTRICO
 * (32px por lado, `Envoltorio.tsx`) y cuya caja de contenido se centra con
 * `mx-auto`: el punto medio de esa caja coincide EXACTO con el 50 % del
 * viewport, a cualquier ancho, sin importar cuánto mida el padding. Por eso
 * la calle se arma con `w-1/2` sobre esa caja simétrica y no con una cuenta
 * en `vw`: `w-1/2` de una caja centrada en el viewport ES el 50vw real, sin
 * un solo número hardcodeado. `justify-end` empuja la calle contra el borde
 * derecho de esa misma caja, que es el margen que ya usa el resto del sitio.
 *
 * Sólo de escritorio para arriba: abajo no hay escena que esquivar y el
 * bloque sigue a ancho completo, como estaba.
 */
export function CalleDerecha({
  children,
  className,
}: {
  readonly children: React.ReactNode
  readonly className?: string
}): React.JSX.Element {
  return (
    <div className={cn('w-full escritorio:flex escritorio:justify-end', className)}>
      <div className="w-full escritorio:w-1/2">{children}</div>
    </div>
  )
}
