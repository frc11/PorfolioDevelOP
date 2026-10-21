import { PresetDeLaPagina } from '../../_lib/escena/ruta/PresetDeLaPagina'
import { PANTALLAS_DE_LA_INTRO, TRAMO_DEL_TITULO } from '../../_lib/escena/ruta/pistaDeLaIntro'
import { ATRIBUTO_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import type { PresetDeLaEscena } from '../../_lib/escena/ruta/preset'
import { Envoltorio } from '../layout/Envoltorio'
import { TituloDePagina } from '../titulos3d/TituloDePagina'
import { Cuerpo } from '../tipografia/Textos'

import { ATRIBUTO_DE_LA_INTRO_DE_PAGINA, TRAMOS_DE_LA_INTRO } from './atributoDeLaIntro'
import { BajadaDeLaIntro } from './BajadaDeLaIntro'
import { FilaDeQueSeTrata, MarcoDeLaIntro } from './ComposicionDeLaIntro'

/**
 * [B12a.2] LA INTRO DE UNA PÁGINA — el bloque sobre la escena (transparente: se ve la sala), con el `h1` y la bajada, que además declara el
 * preset de la página (plan `docs/rediseno/SPRINT-B12a.md` §3.2). La lectura del scroll mide el avance de la cámara sobre este bloque
 * (`ATRIBUTO_DE_LA_INTRO_DE_PAGINA`, el selector de `preset.tramos.intro`). [B12a.4] El título es `TituloDePagina`: el `h1` con el título
 * entero y, desde 1024 con la escena, sus dos partes en volumen (el `h1` apagado sólo a la vista).
 *
 * [B12a.8] Dos tramos en `PANTALLAS_DE_LA_INTRO` pantallas (2,5), en orden: el del título (`TRAMO_DEL_TITULO`: el `h1` y la bajada fijos
 * arriba; el título cae antes de que el tramo se suelte) y el de «de qué se trata» (`deQueSeTrata`, un bloque corto de la página, todavía
 * sobre la escena). El papel de la página entra en la última pantalla. Los altos salen de las dos constantes (una variable de CSS cada
 * una): calibrar la intro es cambiar el número.
 */
export { ATRIBUTO_DE_LA_INTRO_DE_PAGINA, SELECTOR_DE_LA_INTRO, TRAMOS_DE_LA_INTRO } from './atributoDeLaIntro'

export interface PropsDeLaIntro {
  /** El nombre de la página: el `h1` del DOM y el título 3D, el MISMO texto. */
  readonly titulo: string
  /** [B12a.4] Las dos partes del título, una por variante de Archivo (D3): unidas con un espacio dan `titulo`. Sin ellas, la primera palabra y el resto. */
  readonly partes?: readonly [string, string]
  /** Los párrafos de la bajada, sin heading. */
  readonly bajada: React.ReactNode
  /** [B12a.8] «De qué se trata»: un bloque corto de texto de la página, sobre la escena, entre el título y el papel. */
  readonly deQueSeTrata?: React.ReactNode
  readonly preset: PresetDeLaEscena
}

/** Los altos de la intro, en variables de CSS: las clases los leen (Tailwind lee el fuente; el número vive en `pistaDeLaIntro.ts`). */
const ALTOS = { '--pantallas-de-la-intro': String(PANTALLAS_DE_LA_INTRO), '--tramo-del-titulo': String(TRAMO_DEL_TITULO) } as React.CSSProperties

export function IntroDeLaPagina({ titulo, partes, bajada, deQueSeTrata, preset }: PropsDeLaIntro): React.JSX.Element {
  return (
    <section
      // [B12a.3] El atributo lleva el id de la página y, con acento, el bloque es del servicio (`[data-servicio]` pone su claro).
      {...{ [ATRIBUTO_DE_LA_INTRO_DE_PAGINA]: preset.id }}
      {...(preset.acento === null ? {} : { [ATRIBUTO_DE_SERVICIO]: preset.acento })}
      aria-label={titulo}
      // De noche, sobre la escena, los claros (los tokens de la sección invertida).
      data-seccion={preset.noche === 'noche' ? 'invertida' : undefined}
      style={ALTOS}
      className="relative h-[calc(var(--pantallas-de-la-intro)*100svh)] text-tinta"
    >
      <PresetDeLaPagina preset={preset} />
      <div data-parte={TRAMOS_DE_LA_INTRO.titulo} className="h-[calc(var(--tramo-del-titulo)*100svh)]">
        {/* [B12a.8] El marco: una pantalla fija arriba con la columna (el título y la bajada) y el hueco del logo, según la composición. */}
        <Envoltorio className="sticky top-0">
          <MarcoDeLaIntro>
            <TituloDePagina id={preset.id} titulo={titulo} partes={partes} deNoche={preset.noche === 'noche'} />
            <BajadaDeLaIntro id={preset.id}>{bajada}</BajadaDeLaIntro>
          </MarcoDeLaIntro>
        </Envoltorio>
      </div>
      <div data-parte={TRAMOS_DE_LA_INTRO.deQueSeTrata} className="flex h-[calc((var(--pantallas-de-la-intro)-var(--tramo-del-titulo))*100svh)] items-center">
        {deQueSeTrata === undefined ? null : (
          <Envoltorio className="w-full">
            <FilaDeQueSeTrata>{deQueSeTrata}</FilaDeQueSeTrata>
          </Envoltorio>
        )}
      </div>
    </section>
  )
}

/** Un párrafo de la bajada, con el cuerpo del sitio. */
export function ParrafoDeLaBajada({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <Cuerpo>{children}</Cuerpo>
}
