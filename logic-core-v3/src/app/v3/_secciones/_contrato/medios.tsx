import { cn } from '@/lib/utils'

import { Imagen } from '../../_componentes/medios/Imagen'
import { Caption, Micro } from '../../_componentes/tipografia/Textos'

import type { Marcador } from './marcadores'

/**
 * EL MARCO DE UN MEDIO — el hueco de una imagen o un video que todavía no existe.
 *
 * ── El problema, que no tiene una salida obvia ────────────────────────────
 *
 * Dos cosas que se pelean entre sí:
 *
 *   · **usar el componente de imagen que ya existe, con `sizes` real** — para
 *     que el día que llegue el archivo no haya que construir nada; y
 *   · **que el contenido inventado parezca inventado** — o sea, nada de una
 *     foto de banco ni de un archivo de relleno que se lea como definitivo.
 *
 * Las dos salidas fáciles fallan. Poner una imagen cualquiera publica una foto
 * que nadie eligió. No poner nada deja el `sizes` sin escribir, y entonces el
 * día del archivo alguien tiene que acordarse de la mitad de la etiqueta que la
 * referencia se olvidó —descriptores de ancho— que es el defecto medido en sus
 * 134 imágenes. Y `next/image` con un `src` que no existe **compila perfecto** y
 * en el navegador da una imagen rota: un artefacto falso que pasa el build.
 *
 * ── La salida: el marco declara TODO menos el archivo ─────────────────────
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
 * ═══ LA UNIFICACIÓN DE LOS DOS CONTRATOS, Y QUÉ SE ELIGIÓ DE CADA UNO ═════
 *
 * Los dos lanes escribieron este componente sin verse: `MarcoDeMedio` (lane A) y
 * `HuecoDeMedio` (lane B). No eran dos versiones de lo mismo por casualidad —
 * eran el mismo componente con dos mitades distintas resueltas:
 *
 * | pieza | lane A | lane B | qué queda, y por qué |
 * |---|---|---|---|
 * | la rama con archivo | `<Imagen>` real | no existe | **la de A.** Sin ella el `sizes` es una promesa: nada obliga a que compile el día del archivo |
 * | la relación de aspecto | `ancho`/`alto` | cadena `'16 / 9'` | **la de A.** Los dos números son además lo que hay que PEDIR —"1600 × 800"— y la cadena no lo dice |
 * | el `sizes` | obligatorio | obligatorio, y tira si es vacío | **la de B.** Un `sizes` vacío pasa el tipo y no pasa la comprobación en tiempo de ejecución |
 * | qué se ve | sólo el marcador | marcador + descripción + póster | **la de B**, con la descripción OPCIONAL: es el pedido escrito al lado del hueco, y los tres huecos del lane A no la traen |
 * | el registro tipográfico del marcador | `Micro` (10px) | `Caption` (12px, medio) | **la de B.** Un rótulo de 10px adentro de una caja del tamaño de una foto se lee como ruido |
 * | video | no existe | `clase` + `poster` | **la de B.** Un video sin póster arranca negro |
 *
 * ⚠ **Consecuencia declarada:** los tres huecos del lane A —la foto del equipo,
 * las tres capturas de Trabajos— pasan su marcador de 10 a 12 px. Es el único
 * cambio visible que produce la unificación de este archivo, y es la
 * consecuencia de elegir uno de los dos registros en vez de conservar los dos.
 *
 * ── La relación de aspecto va acá y no en el contenido ────────────────────
 *
 * Porque es GEOMETRÍA, no contenido: la decide quien construye la sección y no
 * cambia cuando llegue el dato real. Mezclarla con el contenido obligaría a
 * exceptuar sus números del escáner de contenido inventado, y una excepción es
 * por donde vuelve a entrar la primera cifra inventada.
 *
 * Va como `aspect-ratio` en estilo y no como clase por la misma razón que
 * `Panel` escribe su `minHeight` inline: el valor viene de una PROP y una clase
 * armada como `aspect-[${a}/${b}]` no la ve el escáner de Tailwind — la regla
 * no se emitiría nunca y la caja quedaría sin alto, en silencio.
 */
export interface MarcoDeMedioProps {
  /** Qué va a entrar acá. Cambia el rótulo, no la caja. */
  readonly clase?: 'imagen' | 'video'
  /** Qué se está pidiendo. Del conjunto cerrado, para que entre en el pedido. */
  readonly marcador: Marcador
  /** El archivo, cuando exista. `null` mientras el pedido esté abierto. */
  readonly fuente: string | null
  /** Obligatorio. `''` sólo si la imagen es decorativa — eso es una decisión. */
  readonly alt: string
  /** Ancho intrínseco pedido. Con `alto`, da la relación de aspecto. */
  readonly ancho: number
  readonly alto: number
  /** Obligatorio. Armalo con los ayudantes de `_lib/imagen.ts`. */
  readonly sizes: string
  /**
   * Qué tiene que mostrar, escrito para que alguien lo lea. Opcional: donde el
   * hueco vive adentro de una `<figure>` que ya tiene su pie, repetirlo sería
   * decir dos veces lo mismo.
   */
  readonly descripcion?: string
  /** El marcador del póster. Sólo para video: un video sin póster arranca negro. */
  readonly poster?: Marcador
  readonly className?: string
}

export function MarcoDeMedio({
  clase = 'imagen',
  marcador,
  fuente,
  alt,
  ancho,
  alto,
  sizes,
  descripcion,
  poster,
  className,
}: MarcoDeMedioProps): React.JSX.Element {
  if (sizes.trim().length === 0) {
    throw new Error(
      'MarcoDeMedio: `sizes` es obligatorio y no puede ser vacío. Es el dato que hace que ' +
        '`next/image` emita descriptores de ancho el día que entre el archivo.',
    )
  }

  if (fuente !== null) {
    return (
      <Imagen src={fuente} alt={alt} ancho={ancho} alto={alto} sizes={sizes} className={className} />
    )
  }

  /**
   * Sin descripción visible, el hueco no tiene nombre accesible: `role="img"`
   * con su `aria-label` se lo da, y un lector de pantalla puede decir qué falta.
   * Con descripción, el nombre lo da el texto que se ve, y `role="img"` sería
   * contraproducente — vuelve presentacionales a sus descendientes y escondería
   * justamente el pedido.
   */
  const anunciaConEtiqueta = descripcion === undefined

  return (
    <figure
      data-medio="marcador"
      data-marcador={marcador}
      data-clase={clase}
      data-sizes={sizes}
      data-relacion={`${ancho} / ${alto}`}
      role={anunciaConEtiqueta ? 'img' : undefined}
      aria-label={anunciaConEtiqueta ? `${marcador} — ${alt}` : undefined}
      style={{ aspectRatio: `${ancho} / ${alto}` }}
      className={cn(
        'border-borde-fuerte flex w-full flex-col items-center justify-center gap-[var(--spacing-2)] border border-dashed p-[var(--spacing-4)]',
        className,
      )}
    >
      <Caption como="p" peso="medio" className="text-center uppercase" aria-hidden={anunciaConEtiqueta}>
        {marcador}
      </Caption>
      {/* EL COLOR VA EN EL ENVOLTORIO Y NO EN EL COMPONENTE DE TEXTO — o iba.
          Era el rodeo que los dos lanes dejaron mientras `cn()` se comía la
          clase de tamaño; SITIO-S7 arregla la raíz en `src/lib/utils.ts` y el
          rodeo se saca, que es de lo que se trata arreglar una raíz. */}
      {descripcion !== undefined && (
        <figcaption className="max-w-tope">
          <Micro como="p" className="text-tinta-media text-center uppercase">
            {descripcion}
          </Micro>
        </figcaption>
      )}
      {poster !== undefined && (
        <Micro como="p" className="text-tinta-tenue text-center uppercase">
          {poster}
        </Micro>
      )}
    </figure>
  )
}
