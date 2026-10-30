'use client'

import { ModoDelPieForzado } from '../../_lib/pie3d/registro'
import { ContactoDelPie, LineaLegal, RedesDelPie } from '../../_secciones/cierre/PiezasDeContacto'
import { Envoltorio } from '../layout/Envoltorio'
import { Caption, Cuerpo } from '../tipografia/Textos'
import { Titular } from '../tipografia/Titular'

/**
 * [L7d · 1] LA PÁGINA LEGAL — Privacidad y Términos: sin escena ni 3D. Una intro corta y plana (el título y una línea), el texto legal con un
 * índice lateral que se queda a la vista desde 1024 (abajo, un índice que se despliega) y el pie plano con sus enlaces (sin Seis razones, CTA
 * ni FAQ). Todo en papel opaco, con los tokens del sitio. El texto lo pone cada página (`privacidad/contenido.ts`, `terminos/contenido.ts`).
 *
 * ⚠️ LOS TEXTOS LEGALES SON GENÉRICOS Y TIENEN QUE REVISARLOS UN ABOGADO O UNA ABOGADA ANTES DEL LANZAMIENTO: describen lo que el sitio hace hoy y
 * no reemplazan asesoramiento legal.
 */
export interface SeccionLegal {
  readonly id: string
  readonly titulo: string
  readonly parrafos: readonly string[]
  readonly lista?: readonly string[]
}

export interface TextoLegal {
  readonly titulo: string
  readonly bajada: string
  readonly actualizacion: string
  readonly secciones: readonly SeccionLegal[]
}

export function PaginaLegal({ texto }: { readonly texto: TextoLegal }): React.JSX.Element {
  const indice = (
    <ol className="flex flex-col gap-[var(--spacing-2)] text-cuerpo">
      {texto.secciones.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="underline-offset-4 hover:underline focus-visible:underline">
            {i + 1}. {s.titulo}
          </a>
        </li>
      ))}
    </ol>
  )
  return (
    <main data-pagina-legal="" className="relative z-10 bg-fondo text-tinta">
      <header className="pt-[var(--spacing-20)] pb-[var(--spacing-8)]">
        <Envoltorio claseDeContenido="flex flex-col gap-[var(--spacing-3)] pt-[var(--spacing-12)]">
          <Titular nivel="titulo-xl" como="h1">
            {texto.titulo}
          </Titular>
          <Cuerpo className="max-w-[60ch]">{texto.bajada}</Cuerpo>
          <Caption como="p" interletrado="micro" className="font-codigo uppercase text-tinta-media">
            Última actualización: {texto.actualizacion}
          </Caption>
        </Envoltorio>
      </header>
      <Envoltorio claseDeContenido="grid grid-cols-1 gap-[var(--spacing-8)] pb-[var(--spacing-20)] escritorio:grid-cols-[16rem_minmax(0,1fr)] escritorio:gap-[var(--spacing-12)]">
        <aside aria-label="Índice" className="escritorio:sticky escritorio:top-[var(--spacing-20)] escritorio:self-start">
          <details className="rounded-[var(--radius-fuerte)] border border-borde p-[var(--spacing-4)] escritorio:hidden">
            <summary className="cursor-pointer text-cuerpo font-semi">Índice</summary>
            <nav aria-label="Índice del texto" className="pt-[var(--spacing-3)]">
              {indice}
            </nav>
          </details>
          <nav aria-label="Índice del texto" className="max-escritorio:hidden">
            <Caption como="p" interletrado="micro" className="pb-[var(--spacing-3)] font-codigo uppercase text-tinta-media">
              Índice
            </Caption>
            {indice}
          </nav>
        </aside>
        <div className="flex max-w-[68ch] flex-col gap-[var(--spacing-8)]">
          {texto.secciones.map((s, i) => (
            <section key={s.id} id={s.id} className="flex scroll-mt-[var(--spacing-20)] flex-col gap-[var(--spacing-3)]">
              <Titular nivel="titulo-s" como="h2">
                {i + 1}. {s.titulo}
              </Titular>
              {s.parrafos.map((p) => (
                <Cuerpo key={p} className="leading-relaxed">
                  {p}
                </Cuerpo>
              ))}
              {s.lista === undefined ? null : (
                <ul className="flex list-disc flex-col gap-[var(--spacing-1)] pl-[var(--spacing-6)]">
                  {s.lista.map((item) => (
                    <li key={item} className="text-cuerpo leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </Envoltorio>
      <ModoDelPieForzado.Provider value="plano">
        <footer className="border-t border-borde py-[var(--spacing-12)]">
          <Envoltorio claseDeContenido="flex flex-col gap-[var(--spacing-8)]">
            <ContactoDelPie />
            <div className="flex flex-col gap-[var(--spacing-4)] escritorio:flex-row escritorio:items-center escritorio:justify-between">
              <RedesDelPie />
              <LineaLegal alineado="fin" />
            </div>
          </Envoltorio>
        </footer>
      </ModoDelPieForzado.Provider>
    </main>
  )
}
