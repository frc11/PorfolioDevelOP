import { Caption, Micro } from '../../_componentes/tipografia/Textos'

/**
 * LA FICHA — el marco de la galería de estados.
 *
 * ── Por qué hay estados forzados ──────────────────────────────────────────
 *
 * Una galería de componentes tiene que mostrar el hover y el foco en una
 * captura, sin un puntero y sin un Tab. Por eso las piezas aceptan
 * `data-forzado="hover"` y `data-forzado="foco"`, y las reglas de estado de
 * `_estilos/*.css` los nombran junto a `:hover` y `:focus-visible`.
 *
 * **Lo forzado no reemplaza a lo real.** Cada ficha muestra primero la pieza
 * VIVA —que responde al puntero y al teclado de verdad— y al lado las copias
 * congeladas. Si el forzado y el real se separaran, se vería en la misma
 * ficha.
 *
 * ⚠ `data-forzado` es deuda de estas dos rutas de demostración. Se va con
 * ellas.
 */

export function Ficha({
  titulo,
  nota,
  children,
}: {
  readonly titulo: string
  readonly nota?: string
  readonly children: React.ReactNode
}) {
  return (
    <article className="border-borde flex flex-col gap-[var(--spacing-3)] border p-[var(--spacing-4)]">
      <Micro como="h3" className="font-codigo uppercase opacity-casi">
        {titulo}
      </Micro>
      <div className="flex flex-col gap-[var(--spacing-4)]">{children}</div>
      {nota !== undefined && <Caption className="opacity-casi">{nota}</Caption>}
    </article>
  )
}

/**
 * Una fila rotulada dentro de una ficha. El rótulo dice qué estado es, porque
 * en una captura estática "hover" y "foco" se parecen bastante.
 */
export function Estado({
  rotulo,
  children,
}: {
  readonly rotulo: string
  readonly children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-[var(--spacing-1)]">
      <Micro como="p" className="font-codigo uppercase opacity-casi">
        {rotulo}
      </Micro>
      <div className="flex flex-wrap items-center gap-[var(--spacing-4)]">{children}</div>
    </div>
  )
}
