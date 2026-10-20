import { PresetDeLaPagina } from '../../_lib/escena/ruta/PresetDeLaPagina'
import type { PresetDeLaEscena } from '../../_lib/escena/ruta/preset'
import { Envoltorio } from '../layout/Envoltorio'
import { Cuerpo } from '../tipografia/Textos'
import { Titular } from '../tipografia/Titular'

/**
 * [B12a.2] LA INTRO DE UNA PÁGINA — el bloque de 1,5 pantallas sobre la escena (transparente: se ve la sala), con el `h1` y la bajada,
 * que además declara el preset de la página (plan `docs/rediseno/SPRINT-B12a.md` §3.2). La lectura del scroll mide el avance de la
 * cámara sobre este bloque (`ATRIBUTO_DE_LA_INTRO_DE_PAGINA`, el selector de `preset.tramos.intro`). El título 3D, con el `h1`
 * escondido sólo a la vista mientras está puesto, llega en B12a.3.
 *
 * El alto va escrito en la clase (Tailwind lee el fuente): son las `PANTALLAS_DE_LA_INTRO` de `pistaDeLaIntro.ts`, y s78 lo afirma.
 */
export const ATRIBUTO_DE_LA_INTRO_DE_PAGINA = 'data-intro-de-pagina'

export interface PropsDeLaIntro {
  /** El nombre de la página: el `h1` del DOM (y desde B12a.3, el título 3D: el MISMO texto). */
  readonly titulo: string
  /** Los párrafos de la bajada, sin heading. */
  readonly bajada: React.ReactNode
  readonly preset: PresetDeLaEscena
}

export function IntroDeLaPagina({ titulo, bajada, preset }: PropsDeLaIntro): React.JSX.Element {
  return (
    <section
      {...{ [ATRIBUTO_DE_LA_INTRO_DE_PAGINA]: '' }}
      aria-label={titulo}
      // De noche, sobre la escena, los claros (los tokens de la sección invertida).
      data-seccion={preset.noche === 'noche' ? 'invertida' : undefined}
      className="relative h-[150svh] text-tinta"
    >
      <PresetDeLaPagina preset={preset} />
      <Envoltorio className="sticky top-0" claseDeContenido="flex flex-col gap-[var(--spacing-4)] pt-[var(--spacing-12)]">
        <Titular nivel="titulo-xl" como="h1">
          {titulo}
        </Titular>
        <div className="flex max-w-[42ch] flex-col gap-[var(--spacing-3)]">{bajada}</div>
      </Envoltorio>
    </section>
  )
}

/** Un párrafo de la bajada, con el cuerpo del sitio. */
export function ParrafoDeLaBajada({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <Cuerpo>{children}</Cuerpo>
}
