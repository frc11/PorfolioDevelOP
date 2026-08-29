import { cn } from '@/lib/utils'

/**
 * EL ENVOLTORIO — el sistema invierte lo que uno esperaría, y está medido.
 *
 * ── El error que este componente existe para no cometer ───────────────────
 *
 * El patrón habitual es contenedor fijo (1200 o 1280px) con padding lateral
 * fluido en `%` o `vw`. **La medición dice lo contrario, en las dos mitades:**
 *
 *   · **No hay contenedor fijo en px.** `max-width: 100%` domina con **66,2%**
 *     en los cuatro anchos medidos y en las seis páginas. Los paneles son A
 *     SANGRE. El único tope global es 1920px, y es del CONTENIDO.
 *   · **El padding lateral es FIJO: 32px por lado.** Los mismos tres márgenes
 *     absolutos (64, 112, 128px) con los mismos conteos a 768 y a 1024: no
 *     escala con el viewport. Es exactamente lo contrario de la tipografía,
 *     que sí interpola.
 *
 * Construirlo al revés produce algo que se PARECE y no se siente igual: los
 * bordes respirarían con el viewport y el texto no, cuando el sistema medido
 * hace justo lo opuesto.
 *
 * ⚠ Un valor declarado que NO se usa: `1280px` y `95%` aparecen declarados en
 * la referencia y **cero veces** en los 36 volcados. No gobiernan nada, y por
 * eso no están acá.
 *
 * ── Desde 1025 no hay padding lateral constante ───────────────────────────
 *
 * Está medido: arriba del breakpoint la contención pasa a grilla con columna
 * lateral y el margen resultante varía por página. Lo que se declara es la
 * AUSENCIA de una constante, no otro valor. Acá el envoltorio conserva sus
 * 32px arriba de 1025 y deja que la grilla y el tope de 1920px hagan el resto
 * — que es la lectura conservadora, y la única que la medición sostiene.
 */

type EtiquetaDeEnvoltorio = 'div' | 'section' | 'header' | 'footer' | 'nav' | 'main'

export interface EnvoltorioProps {
  readonly children: React.ReactNode
  /** El elemento que se emite. Por defecto `div`. */
  readonly como?: EtiquetaDeEnvoltorio
  /** Clases para la caja A SANGRE (la de afuera, la que pinta). */
  readonly className?: string
  /** Clases para la caja de contenido (la topada en 1920px). */
  readonly claseDeContenido?: string
}

export function Envoltorio({
  children,
  como: Etiqueta = 'div',
  className,
  claseDeContenido,
}: EnvoltorioProps) {
  return (
    <Etiqueta
      data-pieza="envoltorio"
      // `w-full max-w-full`: a sangre. El padding lateral es el token FIJO.
      className={cn('w-full max-w-full px-[var(--pad-lateral-compacto)]', className)}
    >
      <div
        data-parte="contenido"
        // El tope de 1920px es del CONTENIDO, no del panel. `max-w-tope` sale
        // de `--container-tope`, que es el único tope global medido.
        className={cn('mx-auto w-full max-w-tope', claseDeContenido)}
      >
        {children}
      </div>
    </Etiqueta>
  )
}
