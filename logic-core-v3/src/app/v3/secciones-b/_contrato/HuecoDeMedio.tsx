import { cn } from '@/lib/utils'

import { Caption, Micro } from '../../_componentes/tipografia/Textos'
import type { Marcador } from './contenido'

/**
 * EL HUECO DE UN MEDIO — la caja reservada, con su marcador y su `sizes` real.
 *
 * ── Por qué un hueco y no el componente de imagen ─────────────────────────
 *
 * **No hay archivo.** Ni la captura del panel, ni el video de los servicios, ni
 * el póster de ese video existen todavía: son el pedido a Franco.
 *
 * `<Imagen>` exige un `src`, y `next/image` con un `src` que no existe compila
 * perfecto y en el navegador da una imagen rota. Eso es peor que un hueco: es un
 * artefacto falso que además pasa el build. La instrucción ya lo dice para el
 * video —"no metas un `<video>` sin fuente"— y la misma disciplina vale para la
 * imagen.
 *
 * Entonces el hueco reserva **lo que se puede reservar de verdad**:
 *
 *   · la RELACIÓN DE ASPECTO, así que la caja ocupa el mismo lugar el día que
 *     entre el archivo y no hay salto de layout;
 *   · el `sizes` REAL, compuesto por los ayudantes de `_lib/imagen.ts` y no
 *     escrito a mano — es el dato que hace que `next/image` emita descriptores
 *     de ancho en vez de densidad, que es el defecto medido de la referencia en
 *     sus 134 imágenes;
 *   · el MARCADOR y la descripción de qué va acá, visibles, que es el pedido.
 *
 * **El reemplazo es una línea**: `<Imagen src alt ancho alto sizes={SIZES} />`
 * con el mismo `sizes` que este hueco ya declara.
 *
 * ── El `aspect-ratio` va en estilo y no en una clase ──────────────────────
 *
 * Porque el valor viene del DATO. Una clase armada como `aspect-[${r}]` no la ve
 * el escáner de Tailwind y su regla no se emitiría nunca: quedaría el atributo
 * en el HTML, sin error en consola, y la caja sin relación. Es la misma
 * excepción que `Panel` ya declara para su `min-height`.
 *
 * ── ⚠️ POR QUÉ NINGÚN COMPONENTE DE TEXTO RECIBE UNA CLASE DE COLOR ───────
 *
 * **Medido, no supuesto.** `cn()` es `twMerge` sobre `clsx`, y `tailwind-merge`
 * no conoce los nombres del sistema v3: mete `text-<tamaño>` y `text-<color>` en
 * el mismo grupo y **descarta uno de los dos en silencio**. Con las clases
 * reales de este archivo:
 *
 *     cn('font-cuerpo','text-fluido-micro',…,'text-tinta-media …')
 *       → "font-cuerpo leading-micro tracking-micro … text-tinta-media …"
 *                     ↑ `text-fluido-micro` DESAPARECIÓ
 *
 * Lo mismo pasa entre `font-<familia>` y `font-<peso>`: `font-codigo` en el
 * `className` se comía `font-cuerpo` **y** `font-medio`. Sin error de build, sin
 * error de tipos, sin nada en consola.
 *
 * Por eso acá el COLOR va en un envoltorio —los componentes de texto no
 * declaran color, así que lo heredan— y no se pide familia monoespaciada. El
 * arreglo de fondo es de una línea y está fuera de este lane: agregar los
 * `--text-*` de v3 al grupo `font-size` de `src/lib/utils.ts`, que ya tiene esa
 * lista para el sistema B1 y advierte por escrito de este mismo defecto.
 * Queda reportado.
 */

export interface HuecoDeMedioProps {
  /** Qué va a entrar acá. Cambia el rótulo, no la caja. */
  readonly clase: 'imagen' | 'video'
  /** El marcador del vocabulario. Es lo que se lee en pantalla. */
  readonly marcador: Marcador
  /** La relación de aspecto, como la escribe CSS: `'16 / 9'`, `'4 / 3'`. */
  readonly relacion: string
  /**
   * El `sizes` que va a usar el `<Imagen>` el día que haya archivo. Armalo con
   * `sizesPorViewport`, `sizesPorTresTramos` o `sizesPorColumnas`.
   */
  readonly sizes: string
  /** Qué tiene que mostrar. Es el pedido, escrito para que alguien lo lea. */
  readonly descripcion: string
  /** El marcador del póster. Sólo para video: un video sin póster arranca negro. */
  readonly poster?: Marcador
  readonly className?: string
}

export function HuecoDeMedio({
  clase,
  marcador,
  relacion,
  sizes,
  descripcion,
  poster,
  className,
}: HuecoDeMedioProps): React.JSX.Element {
  if (sizes.trim().length === 0) {
    throw new Error(
      'HuecoDeMedio: `sizes` es obligatorio y no puede ser vacío. Es el dato que hace que ' +
        '`next/image` emita descriptores de ancho el día que entre el archivo.',
    )
  }

  return (
    <figure
      data-hueco={clase}
      data-marcador={marcador}
      data-sizes={sizes}
      data-relacion={relacion}
      className={cn(
        'border-borde-fuerte flex w-full flex-col items-center justify-center gap-[var(--spacing-2)] border border-dashed p-[var(--spacing-4)]',
        className,
      )}
      style={{ aspectRatio: relacion }}
    >
      <Caption como="p" peso="medio" className="text-center uppercase">
        {marcador}
      </Caption>
      {/* EL COLOR VA EN EL ENVOLTORIO, NO EN EL COMPONENTE DE TEXTO. Ver el
          bloque de arriba: pasarle `text-tinta-media` por `className` a `Micro`
          le borra el tamaño. Los componentes de texto no declaran color, así que
          acá lo heredan y las dos cosas sobreviven. */}
      <figcaption className="max-w-tope text-tinta-media">
        <Micro como="p" className="text-center uppercase">
          {descripcion}
        </Micro>
      </figcaption>
      {poster !== undefined && (
        <div className="text-tinta-tenue">
          <Micro como="p" className="text-center uppercase">
            {poster}
          </Micro>
        </div>
      )}
    </figure>
  )
}
