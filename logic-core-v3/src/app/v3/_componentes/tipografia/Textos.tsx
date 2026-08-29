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
 * LOS CUATRO NIVELES DE TEXTO — micro · caption · cuerpo · base.
 *
 * ── Dos de los ocho no son fluidos, y no es un olvido ─────────────────────
 *
 * `cuerpo` (15px) y `base` (16px) se midieron **invariantes** entre 768 y
 * 1920: no escalan. El 21,8% del texto del sitio medido no escala en absoluto
 * y otro 10,1% conmuta en el breakpoint sin interpolar. Emitir `clamp()` para
 * los ocho sería tan falso como no emitir ninguno, así que estos dos no tienen
 * variante fluida y el tipo lo dice: pedir `fluido` en ellos no hace nada.
 *
 * `micro` y `caption` sí la tienen: 8→10px y 11→12px.
 */

/**
 * Los encabezados están en la lista a propósito: la etiqueta de sección de la
 * referencia aparece 29 veces y muchas de esas veces ES el encabezado de su
 * bloque. Obligarla a ser un `<p>` para respetar la escala visual rompe el
 * árbol de encabezados, que es de quien navega por encabezados.
 */
type EtiquetaDeTexto =
  | 'p'
  | 'span'
  | 'div'
  | 'li'
  | 'dd'
  | 'dt'
  | 'figcaption'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'

interface TextoBaseProps {
  readonly children: React.ReactNode
  readonly como?: EtiquetaDeTexto
  readonly interletrado?: Interletrado
  readonly peso?: Peso
  readonly className?: string
}

/** Párrafo de lectura — `--text-cuerpo`, 15px, invariante. */
export function Cuerpo({ children, como = 'p', interletrado, peso = 'normal', className }: TextoBaseProps) {
  return (
    <Texto nivel="cuerpo" como={como} interletrado={interletrado} peso={peso} className={className}>
      {children}
    </Texto>
  )
}

/** Metadato — `--text-caption`, 12px, con contraparte fluida desde 11px. */
export function Caption({
  children,
  como = 'p',
  interletrado,
  peso = 'normal',
  fluido = true,
  className,
}: TextoBaseProps & { readonly fluido?: boolean }) {
  return (
    <Texto
      nivel="caption"
      como={como}
      fluido={fluido}
      interletrado={interletrado}
      peso={peso}
      className={className}
    >
      {children}
    </Texto>
  )
}

/** Etiqueta mínima — `--text-micro`, 10px, con contraparte fluida desde 8px. */
export function Micro({
  children,
  como = 'p',
  interletrado,
  peso = 'normal',
  fluido = true,
  className,
}: TextoBaseProps & { readonly fluido?: boolean }) {
  return (
    <Texto
      nivel="micro"
      como={como}
      fluido={fluido}
      interletrado={interletrado}
      peso={peso}
      className={className}
    >
      {children}
    </Texto>
  )
}

/** Texto de interfaz heredado — `--text-base`, 1rem, invariante. */
export function TextoBase({ children, como = 'p', interletrado, peso = 'normal', className }: TextoBaseProps) {
  return (
    <Texto nivel="base" como={como} interletrado={interletrado} peso={peso} className={className}>
      {children}
    </Texto>
  )
}

/**
 * LA ETIQUETA DE SECCIÓN — 29 apariciones en la referencia, la más repetida
 * de las piezas de texto.
 *
 * Medida entera: `text.micro`, `leading.micro`, peso **medio**, y una sangría
 * izquierda de 31px. Los 31px no son del sistema —no hay token de 31— y acá
 * valen `--spacing-8`, que son 32: la unidad base del sistema es 4px y 32 es
 * el escalón que le corresponde. Es un píxel de diferencia contra una medición
 * que ya venía de un `padding-left` computado, y queda declarado.
 *
 * En mayúsculas, que es lo que hace legible un cuerpo de 10px con
 * `--tracking-micro`, el único interletrado positivo del sistema.
 */
export function EtiquetaDeSeccion({
  children,
  como = 'p',
  sangria = true,
  fluido = true,
  className,
}: TextoBaseProps & { readonly sangria?: boolean; readonly fluido?: boolean }) {
  return (
    <Texto
      nivel="micro"
      como={como}
      fluido={fluido}
      peso="medio"
      pieza="etiqueta-de-seccion"
      className={cn('uppercase', sangria && 'pl-[var(--spacing-8)]', className)}
    >
      {children}
    </Texto>
  )
}

/** El cuerpo común de los cinco. No se exporta: la API son los cinco de arriba. */
function Texto({
  children,
  nivel,
  como: Etiqueta = 'p',
  fluido = false,
  interletrado,
  peso = 'normal',
  pieza = 'texto',
  className,
}: TextoBaseProps & {
  readonly nivel: 'micro' | 'caption' | 'cuerpo' | 'base'
  readonly fluido?: boolean
  readonly pieza?: string
}) {
  const definicion = NIVELES_TIPOGRAFICOS[nivel]
  const claseDeTamano = fluido ? (definicion.claseFluida ?? definicion.claseFija) : definicion.claseFija

  return (
    <Etiqueta
      data-pieza={pieza}
      data-nivel={nivel}
      className={cn(
        'font-cuerpo',
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
