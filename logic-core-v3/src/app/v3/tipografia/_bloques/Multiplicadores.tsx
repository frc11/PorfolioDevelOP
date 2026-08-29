import { Micro } from '../../_componentes/tipografia/Textos'
import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  INTERLETRADOS,
  INTERLINEADOS,
  MUESTRA_CUERPO,
  MUESTRA_TITULAR,
} from '../../_lib/tipografia'

/**
 * LOS TRES INTERLINEADOS Y LOS CUATRO INTERLETRADOS.
 *
 * ── Por qué están acá y no repartidos en los componentes ──────────────────
 *
 * Porque `--tracking-display` no lo consume ningún componente medido: el
 * inventario de los 27 componentes compartidos usa `tracking.titulo`,
 * `tracking.texto` y `tracking.micro`, y el cuarto queda sin dueño. Un token
 * que no se usa en ningún lado es un token que nadie va a poder juzgar.
 *
 * Este bloque los ejercita a los siete —tres de interlineado, cuatro de
 * interletrado— sobre el mismo texto, que es la única forma de ver la
 * diferencia entre `-0,03em` y `-0,02em`. Que uno sirva o no, lo decide
 * Valentino mirando; la instrucción es que los siete se puedan mirar.
 *
 * `--tracking-micro` es el único positivo del sistema (+0,025em) y por eso va
 * en mayúsculas: es el caso para el que existe.
 */
export function Multiplicadores() {
  return (
    <section className="flex flex-col gap-[var(--spacing-8)]">
      <div className="flex flex-col gap-[var(--spacing-4)]">
        <Micro como="p" className="font-codigo uppercase opacity-casi">
          interlineado · los tres multiplicadores, sobre el mismo párrafo
        </Micro>
        {INTERLINEADOS.map((interlineado) => (
          <article key={interlineado} className="flex flex-col gap-[var(--spacing-1)]">
            <Micro como="p" className="font-codigo uppercase opacity-casi">
              {`--leading-${interlineado}`}
            </Micro>
            <p
              data-muestra-interlineado={interlineado}
              className={`font-cuerpo text-cuerpo tracking-texto ${CLASE_INTERLINEADO[interlineado]}`}
            >
              {MUESTRA_CUERPO}
            </p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-[var(--spacing-4)]">
        <Micro como="p" className="font-codigo uppercase opacity-casi">
          interletrado · los cuatro, sobre el mismo titular
        </Micro>
        {INTERLETRADOS.map((interletrado) => (
          <article key={interletrado} className="flex flex-col gap-[var(--spacing-1)]">
            <Micro como="p" className="font-codigo uppercase opacity-casi">
              {`--tracking-${interletrado}`}
            </Micro>
            <p
              data-muestra-interletrado={interletrado}
              className={`font-titulo text-fluido-titulo-m leading-titulo ${
                CLASE_INTERLETRADO[interletrado]
              } ${interletrado === 'micro' ? 'uppercase' : ''}`}
            >
              {MUESTRA_TITULAR}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
