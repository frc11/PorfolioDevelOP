import type { Metadata } from 'next'

import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { IntroDeLaPagina, ParrafoDeLaBajada, SELECTOR_DE_LA_INTRO } from '../_componentes/pagina/IntroDeLaPagina'
import { CARA_DEL_DOM, COMBINACIONES_DEL_TITULO, NOMBRES_DE_LAS_COMBINACIONES, TITULOS_CON_LETRAS, partesDelTitulo, type PresetDelTitulo } from '../_componentes/titulos3d/presets'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { PISTA_DE_LA_INTRO } from '../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../_lib/escena/ruta/preset'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. [B12a.8] LA COMPARACIÓN DE LAS FAMILIAS DEL TÍTULO — Valentino no veía diferencia entre las tres de
 * `?titulo=` de B12a.4 (dos pesos de la Archivo ancha, casi iguales al tamaño del título). Arriba, la intro con el título en volumen en la
 * familia de `?titulo=1…4` y el nombre de `?nombre=1…6` (los de las páginas de servicio; el 6, «Prueba de la intro», el «6» que le gustó);
 * abajo, las cuatro familias lado a lado en el DOM (la misma instancia que el 3D), con los nombres de verdad, cada una en una línea como
 * el título (T1). Se borra cuando Valentino elija: la elegida queda en `TITULO_DE_PAGINA` y la bandera se va.
 */
export const metadata: Metadata = {
  title: 'v3 · las familias del título — instrumento interno',
  description: 'Las familias del título de las páginas, lado a lado. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

const PRESET: PresetDeLaEscena = { id: 'base', tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: 'web', variante: null }

/** Los nombres que se comparan: los de las páginas de servicio y el «6». */
const NOMBRES = [TITULOS_CON_LETRAS[0], TITULOS_CON_LETRAS[1], TITULOS_CON_LETRAS[2], TITULOS_CON_LETRAS[5]] as const

/** Un título en el DOM, en una línea, con las dos caras de una combinación (como el `h1` de la intro). */
function TituloEnLaCombinacion({ texto, preset }: { readonly texto: string; readonly preset: PresetDelTitulo }): React.JSX.Element {
  const [primera, segunda] = partesDelTitulo(texto)
  const cara = (i: 0 | 1): React.CSSProperties => ({ fontFamily: CARA_DEL_DOM[preset.fuentes[i]].familia, fontWeight: CARA_DEL_DOM[preset.fuentes[i]].peso })
  return (
    <Titular nivel="titulo-l" como="p" className="whitespace-nowrap" style={cara(0)}>
      <span style={cara(0)}>{primera}</span> <span style={cara(1)}>{segunda}</span>
    </Titular>
  )
}

export default function TitulosDePagina(): React.JSX.Element {
  return (
    <main className="relative z-10">
      <IntroDeLaPagina
        titulo={TITULOS_CON_LETRAS[0]}
        preset={PRESET}
        bajada={<ParrafoDeLaBajada>Arriba, en volumen: la familia de ?titulo= (1 a 4) con el nombre de ?nombre= (1 a 6). Abajo, las cuatro lado a lado.</ParrafoDeLaBajada>}
      />
      <section className="bg-tinta text-fondo relative">
        <Envoltorio claseDeContenido="flex flex-col gap-[var(--spacing-12)] py-[var(--spacing-20)]">
          <Cuerpo className="max-w-[60ch]">Las cuatro familias con los nombres de las páginas. Cada una es la misma instancia de Archivo que el título en volumen y ninguna es de las del home. Para verla en volumen, el número.</Cuerpo>
          <div className="grid grid-cols-1 gap-[var(--spacing-12)] medio:grid-cols-2">
            {COMBINACIONES_DEL_TITULO.map((preset, i) => (
              <article key={NOMBRES_DE_LAS_COMBINACIONES[i]} data-combinacion={String(i + 1)} className="flex min-w-0 flex-col gap-[var(--spacing-4)] overflow-hidden border-t border-current pt-[var(--spacing-6)]">
                <EtiquetaDeSeccion sangria={false}>
                  <a href={`?titulo=${String(i + 1)}`} className="underline underline-offset-4">
                    {`${String(i + 1)} · ${NOMBRES_DE_LAS_COMBINACIONES[i] ?? ''}`}
                  </a>
                </EtiquetaDeSeccion>
                {NOMBRES.map((n) => (
                  <TituloEnLaCombinacion key={n} texto={n} preset={preset} />
                ))}
              </article>
            ))}
          </div>
        </Envoltorio>
      </section>
    </main>
  )
}
