import type { SlugDelProyecto } from '../../../_secciones/trabajos/proyectos'
import { ROTULO_DEL_MENU } from './textos'

export interface TrabajoDelMenu {
  readonly slug: SlugDelProyecto
  readonly nombre: string
  readonly rubro: string | null
}

/**
 * [M3] EL MENÚ DE LOS TRABAJOS — «un especie de menu sticky a la izquierda que te permita cambiar de ejemplo». Vive en el escenario
 * clavado, así que está a mano en cualquier punto de la secuencia: a la izquierda desde 1024 (una lista, con el cuadrado del acento en
 * el elegido) y arriba del marco por debajo (una fila). Botones con `aria-pressed`; elegir nunca mueve el scroll ni el foco.
 */
export function MenuDeTrabajos({
  trabajos,
  elegido,
  alElegir,
}: {
  readonly trabajos: readonly TrabajoDelMenu[]
  readonly elegido: SlugDelProyecto
  readonly alElegir: (slug: SlugDelProyecto) => void
}): React.JSX.Element {
  return (
    <div role="group" aria-label={ROTULO_DEL_MENU} className="flex flex-col gap-3">
      <p aria-hidden="true" className="font-codigo text-micro tracking-wide text-tinta-media uppercase">
        {ROTULO_DEL_MENU}
      </p>
      <ul role="list" className="flex gap-2 escritorio:flex-col escritorio:gap-1">
        {trabajos.map((t) => {
          const activo = t.slug === elegido
          return (
            <li key={t.slug} className="min-w-0">
              <button
                type="button"
                aria-pressed={activo}
                onClick={() => alElegir(t.slug)}
                className={`group flex cursor-pointer items-center gap-3 rounded-sutil border px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento escritorio:border-transparent escritorio:px-0 ${activo ? 'border-tinta text-tinta' : 'border-borde text-tinta-media hover:text-tinta'}`}
              >
                <span aria-hidden="true" className={`hidden size-2.5 shrink-0 bg-acento escritorio:block ${activo ? 'opacity-100' : 'opacity-0'}`} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-cuerpo leading-texto escritorio:text-titulo-s escritorio:leading-titulo">{t.nombre}</span>
                  {t.rubro === null ? null : <span className="hidden font-codigo text-micro tracking-wide uppercase escritorio:block">{t.rubro}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
