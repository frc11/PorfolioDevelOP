import { DosCopias } from '../../_componentes/rollover/DosCopias'
import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { Micro } from '../../_componentes/tipografia/Textos'
import { BloqueSolido } from '../../_componentes/volumen/BloqueSolido'
import { TextoDelPie } from '../../_componentes/volumen/TextoDelPie'
import { HREF_DEL_MAIL, LINEA_LEGAL, MAIL, PAGINAS_DEL_PIE, PAGINAS_LEGALES, REDES, WHATSAPP } from './contacto'
import { IconoDeMarca } from './IconosDeMarca'

/**
 * LAS PIEZAS DE CONTACTO DEL PIE. **[FINAL 3]** Todo en `currentColor` y sin color propio:
 * desde 1024 hereda la tinta del pie y abajo, la del papel que usa la mezcla.
 * [CIERRE RETOQUE 3D] D5: cada enlace es un bloque sólido que flota (`BloqueSolido`, desde 1025).
 * [RONDA 2] F5: las piezas, separadas del titular y entre sí (los cantos y la sombra piden aire).
 * [RETOQUE DEL PIE] P2: desde 1025, en WebGL: los enlaces, placas (`BloqueSolido`); la línea legal, texto extruido.
 */

/** El mail subrayado y el botón de WhatsApp. [RONDA 2] F1: WhatsApp vuelve al pie, donde estaba (sólo queda fuera del formulario de contacto). */
export function ContactoDelPie(): React.JSX.Element {
  return (
    // [NOCTURNO FINAL] C4 · en el teléfono, el mail y WhatsApp en una fila (si no entran, en dos); desde la tablet, apilados.
    <div className="flex flex-wrap items-center gap-x-[var(--spacing-2)] gap-y-[var(--spacing-2)] tablet:flex-col tablet:flex-nowrap tablet:items-start tablet:gap-[var(--spacing-4)] escritorio:mt-[var(--spacing-6)] escritorio:gap-[var(--spacing-5)]">
      <BloqueSolido>
        <a href={HREF_DEL_MAIL} className="block text-cuerpo font-semi underline decoration-1 underline-offset-4 escritorio:px-[var(--spacing-4)] escritorio:py-[var(--spacing-2)]">
          <DosCopias>{MAIL}</DosCopias>
        </a>
      </BloqueSolido>
      <BloqueSolido>
        <a
          href={WHATSAPP.href}
          target="_blank"
          rel="noopener noreferrer"
          data-pieza="whatsapp"
          className="inline-flex items-center gap-[var(--spacing-1)] tablet:gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-borde-fuerte escritorio:border-transparent px-[var(--spacing-1)] tablet:px-[var(--spacing-5)] py-[var(--spacing-2)] text-cuerpo font-semi"
        >
          <IconoDeMarca marca="whatsapp" className="size-[var(--spacing-5)] shrink-0" />
          {/* [NOCTURNO FINAL] C4 · en el teléfono, el rótulo corto; desde la tablet, el entero (el oculto no se anuncia ni se mide). */}
          <span className="max-tablet:hidden">
            <DosCopias>{WHATSAPP.rotulo}</DosCopias>
          </span>
          <span className="tablet:hidden">
            <DosCopias>{WHATSAPP.corto}</DosCopias>
          </span>
        </a>
      </BloqueSolido>
    </div>
  )
}

/**
 * Las redes: sólo íconos, del mismo trazo y tamaño; el nombre va en el enlace. [NOCTURNO FINAL] C4 · en el teléfono, juntas a
 * la izquierda (repartidas a lo ancho, la última quedaba debajo de la esquina del recorrido).
 */
export function RedesDelPie(): React.JSX.Element {
  return (
    <ul className="flex gap-[var(--spacing-5)] tablet:gap-[var(--spacing-6)] escritorio:gap-[var(--spacing-8)]">
      {REDES.map((r) => (
        <li key={r.red}>
          <BloqueSolido>
            <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.rotulo} className="inline-flex p-[var(--spacing-1)] escritorio:p-[var(--spacing-2)] transition-transform duration-[var(--duracion-rapida)] hover:-translate-y-0.5 focus-visible:-translate-y-0.5 motion-reduce:transition-none">
              <IconoDeMarca marca={r.red} className="size-[var(--spacing-6)]" />
            </a>
          </BloqueSolido>
        </li>
      ))}
    </ul>
  )
}

const CLASE_DEL_ENLACE = 'text-caption font-semi underline-offset-4 hover:underline focus-visible:underline'

/**
 * [L7d · 3] LA LÍNEA LEGAL Y LAS PÁGINAS — lo de abajo del pie, en el home y en cada página: el grupo «Páginas» (Nosotros, Portfolio, Blog y las tres de
 * servicio) y, debajo, la línea legal con Privacidad y Términos. Los enlaces son `EnlaceDeRuta` (el velo) y van en el DOM plano, sin 3D (como el resto
 * de los enlaces de abajo). `alineado="fin"`: a la derecha desde 1024 (la fila de abajo del pie plano). Sin `alineado` (el pie 3D del home, desde 1025) queda la línea de siempre: Privacidad y Términos van en el recorrido (`RecorridoDelPie`, [L7g]).
 */
/** El renglón legal (3D desde 1025): el único `TextoDelPie` de la línea, en las dos formas de `LineaLegal`. */
function RenglonLegal(): React.JSX.Element {
  return (
    <TextoDelPie>
      <Micro como="p">{LINEA_LEGAL}</Micro>
    </TextoDelPie>
  )
}

export function LineaLegal({ alineado }: { readonly alineado?: 'fin' }): React.JSX.Element {
  if (alineado === undefined) return <RenglonLegal />
  return (
    <div data-pieza="paginas-y-legal-del-pie" className="flex flex-col gap-[var(--spacing-2)] escritorio:items-end">
      {/* [L7-INT] Un grupo y no un `nav`: el pie del home va adentro del `main` (s10-acceso: ningún `navigation` anidado ahí). */}
      <div role="group" aria-label="Páginas" className="flex flex-wrap items-center gap-x-[var(--spacing-4)] gap-y-[var(--spacing-1)] escritorio:justify-end">
        <Micro como="span">Páginas</Micro>
        {PAGINAS_DEL_PIE.map((p) => (
          <EnlaceDeRuta key={p.destino} href={p.destino} className={CLASE_DEL_ENLACE}>
            {p.rotulo}
          </EnlaceDeRuta>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-[var(--spacing-4)] gap-y-[var(--spacing-1)]">
        <RenglonLegal />
        {PAGINAS_LEGALES.map((p) => (
          <EnlaceDeRuta key={p.destino} href={p.destino} className={CLASE_DEL_ENLACE}>
            {p.rotulo}
          </EnlaceDeRuta>
        ))}
      </div>
    </div>
  )
}
