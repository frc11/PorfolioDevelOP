import { Micro } from '../../_componentes/tipografia/Textos'
import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  MUESTRA_MAYUSCULAS,
  MUESTRA_MINUSCULAS,
  MUESTRA_TITULAR,
  METRICAS_DE_CHIVO,
  METRICAS_DE_INSTRUMENT_SANS,
  NIVELES,
  NIVELES_TIPOGRAFICOS,
} from '../../_lib/tipografia'

/**
 * LOS OCHO NIVELES, CON TEXTO REAL — el bloque que se mira.
 *
 * Es la mitad visible de la §6 del sprint. No afirma nada: muestra. La
 * verificación óptica la cierra una persona, y este bloque existe para que
 * tenga qué mirar.
 *
 * ── Por qué el mismo texto en los ocho ────────────────────────────────────
 *
 * Para que la comparación sea entre TAMAÑOS y no entre palabras. Con textos
 * distintos por nivel, la diferencia de ancho y de forma de las letras se
 * mezcla con la diferencia de cuerpo y no se puede aislar ninguna.
 *
 * ── Y en Title Case ───────────────────────────────────────────────────────
 *
 * Porque es donde la cap height manda. En Title Case la mayúscula domina el
 * tamaño óptico percibido, y la de Chivo es 4,72% más chica que la de la
 * familia sobre la que se calculó la escala. En minúsculas no se notaría: ahí
 * manda la x-height, y esa coincide casi exacto (511 contra 510).
 */
export function Escala() {
  return (
    <section className="flex flex-col gap-[var(--spacing-6)]">
      {NIVELES.map((nivel) => {
        const definicion = NIVELES_TIPOGRAFICOS[nivel]
        const esTitular = nivel.startsWith('titulo-')
        return (
          <article key={nivel} className="flex flex-col gap-[var(--spacing-1)]">
            <Micro como="p" className="font-codigo uppercase opacity-casi">
              {`${nivel} · ${definicion.token} · ${definicion.valorFijo} · ${
                definicion.claseFluida === null ? 'invariante' : 'fluido 375→1440'
              }`}
            </Micro>
            <p
              data-muestra={nivel}
              // Las clases salen de las tablas de `_lib/tipografia.ts`, donde
              // están escritas enteras. Armarlas acá con una plantilla sería el
              // error que ese archivo advierte: Tailwind no las vería y la
              // regla no se emitiría nunca.
              className={[
                esTitular ? 'font-titulo' : 'font-cuerpo',
                definicion.claseFluida ?? definicion.claseFija,
                CLASE_INTERLINEADO[definicion.interlineado],
                CLASE_INTERLETRADO[definicion.interletrado],
              ].join(' ')}
            >
              {MUESTRA_TITULAR}
            </p>
          </article>
        )
      })}

      <article className="flex flex-col gap-[var(--spacing-2)]">
        <Micro como="p" className="font-codigo uppercase opacity-casi">
          {`cap height · Chivo ${METRICAS_DE_CHIVO.capHeight} contra ${METRICAS_DE_INSTRUMENT_SANS.capHeight} · x-height ${METRICAS_DE_CHIVO.xHeight} contra ${METRICAS_DE_INSTRUMENT_SANS.xHeight}`}
        </Micro>
        <p className="font-titulo text-fluido-titulo-xl leading-titulo tracking-titulo">
          {MUESTRA_MAYUSCULAS}
        </p>
        <p className="font-titulo text-fluido-titulo-xl leading-titulo tracking-titulo">
          {MUESTRA_MINUSCULAS}
        </p>
        <p className="font-titulo text-fluido-titulo-l leading-titulo tracking-titulo">
          {MUESTRA_MAYUSCULAS}
        </p>
        <p className="font-titulo text-fluido-titulo-l leading-titulo tracking-titulo">
          {MUESTRA_MINUSCULAS}
        </p>
      </article>
    </section>
  )
}
