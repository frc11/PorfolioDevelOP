import { Micro } from '../../_componentes/tipografia/Textos'
import { HREF_DEL_MAIL, LINEA_LEGAL, MAIL, REDES, WHATSAPP } from './contacto'
import { IconoDeMarca } from './IconosDeMarca'

/**
 * LAS PIEZAS DE CONTACTO DEL PIE. **[FINAL 3]** Todo en `currentColor` y sin color propio:
 * desde 1024 hereda la tinta del pie y abajo, la del papel que usa la mezcla.
 */

/** El mail subrayado y el botón de WhatsApp. */
export function ContactoDelPie(): React.JSX.Element {
  return (
    <div className="flex flex-col items-start gap-[var(--spacing-4)]">
      <a href={HREF_DEL_MAIL} className="text-cuerpo font-semi underline decoration-1 underline-offset-4">
        {MAIL}
      </a>
      <a
        href={WHATSAPP.href}
        target="_blank"
        rel="noopener noreferrer"
        data-pieza="whatsapp"
        className="inline-flex items-center gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-current px-[var(--spacing-5)] py-[var(--spacing-2)] text-cuerpo font-semi"
      >
        <IconoDeMarca marca="whatsapp" className="size-[var(--spacing-5)] shrink-0" />
        {WHATSAPP.rotulo}
      </a>
    </div>
  )
}

/** Las redes: sólo íconos, del mismo trazo y tamaño; el nombre va en el enlace. En móvil, repartidas a lo ancho. */
export function RedesDelPie(): React.JSX.Element {
  return (
    <ul className="flex justify-between tablet:justify-start tablet:gap-[var(--spacing-6)]">
      {REDES.map((r) => (
        <li key={r.red}>
          <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.rotulo} className="inline-flex p-[var(--spacing-1)]">
            <IconoDeMarca marca={r.red} className="size-[var(--spacing-6)]" />
          </a>
        </li>
      ))}
    </ul>
  )
}

/** La línea legal, chica. Sin enlaces: todavía no hay páginas de privacidad ni de términos. */
export function LineaLegal(): React.JSX.Element {
  return <Micro como="p">{LINEA_LEGAL}</Micro>
}
