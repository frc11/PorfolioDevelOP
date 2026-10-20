import { PresetDeLaPagina } from '../../_lib/escena/ruta/PresetDeLaPagina'
import { ATRIBUTO_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import type { PresetDeLaEscena } from '../../_lib/escena/ruta/preset'
import { Envoltorio } from '../layout/Envoltorio'
import { TituloDePagina } from '../titulos3d/TituloDePagina'
import { Cuerpo } from '../tipografia/Textos'

import { ATRIBUTO_DE_LA_INTRO_DE_PAGINA } from './atributoDeLaIntro'

/**
 * [B12a.2] LA INTRO DE UNA PÁGINA — el bloque de 1,5 pantallas sobre la escena (transparente: se ve la sala), con el `h1` y la bajada,
 * que además declara el preset de la página (plan `docs/rediseno/SPRINT-B12a.md` §3.2). La lectura del scroll mide el avance de la
 * cámara sobre este bloque (`ATRIBUTO_DE_LA_INTRO_DE_PAGINA`, el selector de `preset.tramos.intro`). [B12a.4] El título es
 * `TituloDePagina`: el `h1` con el título entero y, desde 1024 con la escena, sus dos partes en volumen (el `h1` apagado sólo a la vista).
 *
 * El alto va escrito en la clase (Tailwind lee el fuente): son las `PANTALLAS_DE_LA_INTRO` de `pistaDeLaIntro.ts`, y s78 lo afirma.
 */
export { ATRIBUTO_DE_LA_INTRO_DE_PAGINA, SELECTOR_DE_LA_INTRO } from './atributoDeLaIntro'

export interface PropsDeLaIntro {
  /** El nombre de la página: el `h1` del DOM y el título 3D, el MISMO texto. */
  readonly titulo: string
  /** [B12a.4] Las dos partes del título, una por variante de Archivo (D3): unidas con un espacio dan `titulo`. Sin ellas, la primera palabra y el resto. */
  readonly partes?: readonly [string, string]
  /** Los párrafos de la bajada, sin heading. */
  readonly bajada: React.ReactNode
  readonly preset: PresetDeLaEscena
}

export function IntroDeLaPagina({ titulo, partes, bajada, preset }: PropsDeLaIntro): React.JSX.Element {
  return (
    <section
      // [B12a.3] El atributo lleva el id de la página y, con acento, el bloque es del servicio (`[data-servicio]` pone su claro).
      {...{ [ATRIBUTO_DE_LA_INTRO_DE_PAGINA]: preset.id }}
      {...(preset.acento === null ? {} : { [ATRIBUTO_DE_SERVICIO]: preset.acento })}
      aria-label={titulo}
      // De noche, sobre la escena, los claros (los tokens de la sección invertida).
      data-seccion={preset.noche === 'noche' ? 'invertida' : undefined}
      className="relative h-[150svh] text-tinta"
    >
      <PresetDeLaPagina preset={preset} />
      <Envoltorio className="sticky top-0" claseDeContenido="flex flex-col gap-[var(--spacing-4)] pt-[var(--spacing-12)]">
        <TituloDePagina id={preset.id} titulo={titulo} partes={partes} />
        <div className="flex max-w-[42ch] flex-col gap-[var(--spacing-3)]">{bajada}</div>
      </Envoltorio>
    </section>
  )
}

/** Un párrafo de la bajada, con el cuerpo del sitio. */
export function ParrafoDeLaBajada({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <Cuerpo>{children}</Cuerpo>
}
