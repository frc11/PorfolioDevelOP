import { cn } from '@/lib/utils'

import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  CLASE_PESO,
  NIVELES_TIPOGRAFICOS,
  type Interletrado,
  type Peso,
} from '../../_lib/tipografia'

/**
 * LOS CUATRO NIVELES DE TITULAR — 20 · 32 · 44 · 56 px.
 *
 * ── El nivel y la etiqueta son cosas distintas ────────────────────────────
 *
 * `nivel` es el tamaño; `como` es el elemento HTML. Se separan a propósito: la
 * jerarquía visual y la jerarquía del documento no tienen por qué coincidir, y
 * cuando se las fuerza a coincidir se termina eligiendo un `h3` porque el `h2`
 * era muy grande. Eso rompe el árbol de encabezados para quien navega por
 * encabezados, que es exactamente para quien existe el árbol.
 *
 * ── Fijo o fluido ─────────────────────────────────────────────────────────
 *
 * Los cuatro niveles tienen contraparte fluida en `clamp()`, con banda de
 * 375 a 1440px. Ninguno de los dos extremos es un breakpoint: el techo salió
 * de la convergencia de seis ajustes independientes en 1440,00 ± 0,01 y el
 * piso de un barrido donde 375 es 207 veces más nítido que el vecino. El
 * `clamp()` deja de interpolar ahí adentro, no en una media query.
 *
 * El defecto es **fluido**: 53,9% de las cadenas medidas lo son, y es el
 * régimen de los niveles de display.
 *
 * ── Por qué los defaults de interlineado e interletrado no son estéticos ──
 *
 * Salen de la columna "tokens que consume" del inventario de los 27
 * componentes compartidos. `titulo-xl` con `tracking.titulo` es lo que mide el
 * título de cierre del pie; `titulo-s` con `tracking.texto` es lo que mide el
 * link de contacto. Se pueden pisar por prop —`/v3/tipografia` los recorre
 * todos— pero el default es la medición.
 */

export type NivelDeTitular = 'titulo-s' | 'titulo-m' | 'titulo-l' | 'titulo-xl'
type EtiquetaDeTitular = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'

export interface TitularProps {
  readonly children: React.ReactNode
  readonly nivel: NivelDeTitular
  /** El elemento del documento. Sin default: elegirlo es una decisión. */
  readonly como: EtiquetaDeTitular
  /** `false` fija el tamaño en el valor de arriba de 1440px. */
  readonly fluido?: boolean
  readonly interletrado?: Interletrado
  readonly peso?: Peso
  readonly className?: string
  readonly id?: string
}

export function Titular({
  children,
  nivel,
  como: Etiqueta,
  fluido = true,
  interletrado,
  peso = 'normal',
  className,
  id,
}: TitularProps) {
  const definicion = NIVELES_TIPOGRAFICOS[nivel]
  // `claseFluida` es `null` sólo en `cuerpo` y `base`, que no son titulares;
  // el `??` es la red por si alguien agrega un nivel sin contraparte fluida.
  const claseDeTamano = fluido ? (definicion.claseFluida ?? definicion.claseFija) : definicion.claseFija

  return (
    <Etiqueta
      id={id}
      data-pieza="titular"
      data-nivel={nivel}
      data-fluido={fluido ? 'si' : 'no'}
      className={cn(
        'font-titulo',
        claseDeTamano,
        CLASE_INTERLINEADO[definicion.interlineado],
        CLASE_INTERLETRADO[interletrado ?? definicion.interletrado],
        CLASE_PESO[peso],
        className,
      )}
    >
      {children}
    </Etiqueta>
  )
}
