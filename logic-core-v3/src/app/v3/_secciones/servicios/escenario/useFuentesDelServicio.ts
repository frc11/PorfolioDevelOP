'use client'

import { useEffect, useState, type CSSProperties } from 'react'

import { useFuenteDelServicio, useTituloDelServicio, type FuenteDelServicio, type TituloDelServicio } from './banderas'

/**
 * [C2-50] LAS LETRAS DE CADA SERVICIO — el título (`?titulo-servicio=`) y el texto del medio (`?fuente-servicio=`). Las de Google
 * (`next/font/google`) llegan PEREZOSAS: cada una vive en su módulo (`fuentes/`) y se importa en el cliente sólo si la bandera la
 * pide, así la página no carga las siete. Por defecto baja UNA (Instrument Serif en cursiva, el texto); el título por defecto es la
 * display del Panel, que ya carga el sitio. Sin `preload`: el archivo baja cuando el texto se pinta, no en la carga de la página.
 * (Además, los invariantes que renderizan la sección en Node no tocan `next/font/google`: no existe fuera de Next.)
 */

type Modulo = Promise<{ readonly CLASE: string }>

const DEL_TEXTO: Readonly<Record<FuenteDelServicio, () => Modulo>> = {
  '1': () => import('./fuentes/textoInstrument'),
  '2': () => import('./fuentes/textoFraunces'),
  '3': () => import('./fuentes/textoCormorant'),
  '4': () => import('./fuentes/textoPlayfair'),
}

/** Las del título que ya carga el sitio (sin archivo nuevo): la display del Panel en mayúsculas, y Chivo extra negrita. */
export const CLASE_DEL_TITULO: Readonly<Record<TituloDelServicio, string>> = {
  '1': 'font-display font-fuerte uppercase tracking-display leading-cartel',
  '2': 'leading-cartel',
  '3': 'font-titulo tracking-tight leading-cartel',
}

/** El peso de la grotesca: 900, más que el `fuerte` del sistema (700); Chivo es variable y lo tiene. */
export const ESTILO_DEL_TITULO: Readonly<Record<TituloDelServicio, CSSProperties>> = { '1': {}, '2': {}, '3': { fontWeight: 900 } }

export interface FuentesDelServicio {
  readonly titulo: TituloDelServicio
  readonly fuente: FuenteDelServicio
  /** Las clases de `next/font` que llegaron ('' mientras tanto: la letra del sistema). */
  readonly claseDelTitulo: string
  readonly claseDelTexto: string
}

export function useFuentesDelServicio(): FuentesDelServicio {
  const titulo = useTituloDelServicio()
  const fuente = useFuenteDelServicio()
  const [claseDelTexto, setClaseDelTexto] = useState('')
  const [claseDelTitulo, setClaseDelTitulo] = useState('')
  useEffect(() => {
    let vivo = true
    void DEL_TEXTO[fuente]()
      .then((m) => vivo && setClaseDelTexto(m.CLASE))
      .catch(() => undefined)
    if (titulo === '2')
      void import('./fuentes/tituloSerif')
        .then((m) => vivo && setClaseDelTitulo(m.CLASE))
        .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [fuente, titulo])
  return { titulo, fuente, claseDelTitulo, claseDelTexto }
}
