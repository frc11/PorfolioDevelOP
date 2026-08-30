import { cn } from '@/lib/utils'

import { Imagen } from '../../_componentes/medios/Imagen'
import { Micro } from '../../_componentes/tipografia/Textos'

import type { Marcador } from './marcadores'

/**
 * EL MARCO DE UN MEDIO — el hueco de una foto que todavía no existe.
 *
 * ── El problema, que no tiene una salida obvia ─────────────────────────────
 *
 * El sprint pide dos cosas que se pelean entre sí:
 *
 *   · **usar el componente de imagen que ya existe, con `sizes` real** — para
 *     que el día que llegue la foto no haya que construir nada; y
 *   · **que el contenido inventado parezca inventado** — o sea, nada de una
 *     foto de banco de imágenes ni de un archivo de relleno que se lea como
 *     definitivo.
 *
 * Las dos salidas fáciles fallan. Poner una imagen cualquiera publica una foto
 * que nadie eligió. No poner nada deja el `sizes` sin escribir, y entonces el
 * día de la foto alguien tiene que acordarse de la mitad de la etiqueta que la
 * referencia se olvidó —descriptores de ancho— que es exactamente el defecto
 * medido en sus 134 imágenes.
 *
 * ── La salida: el marco declara TODO menos el archivo ──────────────────────
 *
 * `fuente: null` es el estado de hoy y pinta el marcador a la vista, con la
 * caja en su relación de aspecto real. `fuente: '<archivo>'` renderiza
 * `<Imagen>` con el MISMO `sizes` que ya estaba escrito. Poner la foto es
 * cambiar un `null` por una ruta: ni una decisión técnica más.
 *
 * Las dos ramas están en el código, así que el escáner que rechaza un `<Imagen`
 * sin `sizes` ve el uso real, y el tipo obliga a que el `sizes` exista aunque
 * hoy no se use. **La regla se cumple antes de que haya una imagen.**
 *
 * ── La relación de aspecto va acá y no en el contenido ─────────────────────
 *
 * Porque es GEOMETRÍA, no contenido: la decide quien construye la sección y no
 * cambia cuando llegue el dato real. Mezclarla con el contenido obligaría a
 * exceptuar sus números del escáner de §0.4, y una excepción es por donde
 * vuelve a entrar la primera cifra inventada.
 *
 * Va como `aspect-ratio` en estilo y no como clase por la misma razón que
 * `Panel` escribe su `minHeight` inline: el valor viene de una PROP y una clase
 * armada como `aspect-[${a}/${b}]` no la ve el escáner de Tailwind — la regla
 * no se emitiría nunca y la caja quedaría sin alto, en silencio.
 */
export interface MarcoDeMedioProps {
  /** Qué se está pidiendo. Del conjunto cerrado, para que entre en el pedido. */
  readonly marcador: Marcador
  /** El archivo, cuando exista. `null` mientras el pedido esté abierto. */
  readonly fuente: string | null
  /** Obligatorio. `''` sólo si la imagen es decorativa — eso es una decisión. */
  readonly alt: string
  /** Ancho intrínseco declarado. Con `alto`, da la relación de aspecto. */
  readonly ancho: number
  readonly alto: number
  /** Obligatorio. Armalo con los ayudantes de `_lib/imagen.ts`. */
  readonly sizes: string
  readonly className?: string
}

export function MarcoDeMedio({
  marcador,
  fuente,
  alt,
  ancho,
  alto,
  sizes,
  className,
}: MarcoDeMedioProps): React.JSX.Element {
  if (fuente !== null) {
    return (
      <Imagen
        src={fuente}
        alt={alt}
        ancho={ancho}
        alto={alto}
        sizes={sizes}
        className={className}
      />
    )
  }

  return (
    <div
      data-medio="marcador"
      data-marcador={marcador}
      // `role="img"` con su nombre: el hueco ocupa el lugar de una imagen y un
      // lector de pantalla tiene que poder decir qué falta. Sin rol sería un
      // `div` con texto suelto en medio de la composición.
      role="img"
      aria-label={`${marcador} — ${alt}`}
      style={{ aspectRatio: `${ancho} / ${alto}` }}
      className={cn(
        'border-borde-fuerte flex w-full items-center justify-center border border-dashed',
        className,
      )}
    >
      <Micro como="p" aria-hidden="true" className="font-codigo uppercase">
        {marcador}
      </Micro>
    </div>
  )
}
