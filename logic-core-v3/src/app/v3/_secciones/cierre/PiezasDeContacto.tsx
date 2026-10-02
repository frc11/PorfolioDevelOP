import { DosCopias } from '../../_componentes/rollover/DosCopias'
import { Micro } from '../../_componentes/tipografia/Textos'
import { BloqueSolido } from '../../_componentes/volumen/BloqueSolido'
import { HREF_DEL_MAIL, LINEA_LEGAL, MAIL, REDES } from './contacto'
import { IconoDeMarca } from './IconosDeMarca'

/**
 * LAS PIEZAS DE CONTACTO DEL PIE. **[FINAL 3]** Todo en `currentColor` y sin color propio:
 * desde 1024 hereda la tinta del pie y abajo, la del papel que usa la mezcla.
 * [CIERRE RETOQUE 3D] D5: cada enlace es un bloque sólido que flota (`BloqueSolido`, desde 1025).
 */

/** El mail subrayado. [RETOQUE 3D] 3I: sin el botón de WhatsApp hasta que esté configurado (no se muestra lo que no anda). */
export function ContactoDelPie(): React.JSX.Element {
  return (
    <div className="flex flex-col items-start gap-[var(--spacing-4)]">
      <BloqueSolido>
        <a href={HREF_DEL_MAIL} className="block text-cuerpo font-semi underline decoration-1 underline-offset-4 escritorio:px-[var(--spacing-4)] escritorio:py-[var(--spacing-2)]">
          <DosCopias>{MAIL}</DosCopias>
        </a>
      </BloqueSolido>
    </div>
  )
}

/** Las redes: sólo íconos, del mismo trazo y tamaño; el nombre va en el enlace. En móvil, repartidas a lo ancho. */
export function RedesDelPie(): React.JSX.Element {
  return (
    <ul className="flex justify-between tablet:justify-start tablet:gap-[var(--spacing-6)]">
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

/** La línea legal, chica. Sin enlaces: todavía no hay páginas de privacidad ni de términos. */
export function LineaLegal(): React.JSX.Element {
  return <Micro como="p">{LINEA_LEGAL}</Micro>
}
