import Image from 'next/image'

import { cn } from '@/lib/utils'

import { ERROR_SIZES_AUSENTE } from '../../_lib/imagen'

/**
 * LA IMAGEN DEL SITIO — descriptores de ANCHO, y `sizes` obligatorio.
 *
 * ── El defecto que corrige, medido ────────────────────────────────────────
 *
 * El `srcset` de la referencia usa **descriptores de densidad** (`1x`, `2x`)
 * con `sizes` en `null`. Con densidad el navegador elige por
 * `devicePixelRatio` y **no mira el ancho de la caja**: de 768 a 1920 descarga
 * exactamente lo mismo, en las **134 imágenes** del sitio. Un teléfono baja la
 * imagen pensada para un escritorio.
 *
 * Es uno de los tres lugares donde se les gana, y la corrección es la misma
 * etiqueta con la otra mitad puesta: descriptores `w` más un `sizes` real.
 *
 * ── Cómo se hace imposible olvidarse ──────────────────────────────────────
 *
 * `next/image` emite `w` **sólo si recibe `sizes`**; sin él vuelve a `1x, 2x`,
 * que es exactamente el defecto. Así que:
 *
 *   1. `sizes` es obligatorio en el tipo — sin él no compila;
 *   2. se valida en construcción, porque `sizes=""` sí compila;
 *   3. `s3-imagen.invariant.ts` rechaza cualquier `<Imagen` sin `sizes` en el
 *      árbol de /v3, con control positivo sobre un uso roto a propósito.
 *
 * Las tres capas atrapan cosas distintas: el tipo atrapa el olvido, la
 * validación atrapa el string vacío, y el instrumento atrapa a alguien que
 * agregue otro componente de imagen que no pase por acá.
 *
 * ── `alt` también es obligatorio ──────────────────────────────────────────
 *
 * Y puede ser `''`, que es lo correcto para una imagen decorativa: `alt=""` la
 * saca del árbol de accesibilidad. Lo que no se puede es no decidir.
 */

export interface ImagenProps {
  readonly src: string
  /** Obligatorio. `''` para decorativa — eso es una decisión, no un olvido. */
  readonly alt: string
  readonly ancho: number
  readonly alto: number
  /** Obligatorio. Armalo con los helpers de `_lib/imagen.ts`. */
  readonly sizes: string
  readonly prioridad?: boolean
  readonly className?: string
}

export function Imagen({ src, alt, ancho, alto, sizes, prioridad = false, className }: ImagenProps) {
  if (sizes.trim().length === 0) throw new Error(ERROR_SIZES_AUSENTE)

  return (
    <Image
      src={src}
      alt={alt}
      width={ancho}
      height={alto}
      sizes={sizes}
      priority={prioridad}
      data-pieza="imagen"
      className={cn('h-auto w-full', className)}
    />
  )
}
