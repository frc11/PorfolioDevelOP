'use client'

import { useEffect, useState } from 'react'

import { useCursivaDelTitulo, type CursivaDelTitulo } from './banderas'

/**
 * [C2-50 · L3] LA CURSIVA DEL TÍTULO DE CADA SERVICIO (`?titulo-cursiva=`) — el segundo renglón («web», «a medida», «inteligencia
 * artificial»). Las de Google (`next/font/google`) llegan PEREZOSAS: cada una vive en su módulo (`fuentes/`) y se importa en el cliente
 * sólo si la bandera la pide, así la página baja UNA. Sin `preload`: el archivo baja cuando el título se pinta, no en la carga. (Los
 * invariantes que renderizan la sección en Node no tocan `next/font/google`: no existe fuera de Next.) El primer renglón es la display
 * del Panel, que ya carga el sitio; el cuerpo, la letra de los cuerpos (`font-cuerpo`).
 */

type Modulo = Promise<{ readonly CLASE: string }>

const DE_LA_CURSIVA: Readonly<Record<CursivaDelTitulo, () => Modulo>> = {
  '1': () => import('./fuentes/cursivaInstrument'),
  '2': () => import('./fuentes/cursivaFraunces'),
  '3': () => import('./fuentes/cursivaPlayfair'),
}

/** El primer renglón: la display condensada del Panel, en mayúsculas (la que era `?titulo-servicio=1`). */
export const CLASE_DEL_RENGLON_DERECHO = 'font-display font-fuerte uppercase tracking-display'

export interface FuentesDelServicio {
  readonly cursiva: CursivaDelTitulo
  /** La clase de `next/font` que llegó ('' mientras tanto: la serif del sistema, en cursiva). */
  readonly claseDeLaCursiva: string
}

export function useFuentesDelServicio(): FuentesDelServicio {
  const cursiva = useCursivaDelTitulo()
  const [claseDeLaCursiva, setClaseDeLaCursiva] = useState('')
  useEffect(() => {
    let vivo = true
    void DE_LA_CURSIVA[cursiva]()
      .then((m) => vivo && setClaseDeLaCursiva(m.CLASE))
      .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [cursiva])
  return { cursiva, claseDeLaCursiva }
}
