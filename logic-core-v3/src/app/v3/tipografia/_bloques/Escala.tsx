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
 * ── Y en las DOS formas: Title Case y minúscula ───────────────────────────
 *
 * ⚠️ **HASTA B7 ESTE BLOQUE MOSTRABA LOS OCHO NIVELES SÓLO EN TITLE CASE, y
 * eso dejaba la mitad del juicio sin nada que mirar (`D9`).** La razón por la
 * que Title Case tiene que estar sigue entera y no se toca: ahí la mayúscula
 * domina el tamaño óptico percibido, y la cap height de Chivo es 4,72% más
 * chica que la de la familia sobre la que se calculó la escala.
 *
 * Lo que cambia es que **eso es una de las dos mitades, no las dos**. En
 * minúscula manda la x-height, y la x-height de Chivo NO es 4,72% más chica:
 * es 511 contra 510, un factor de 0,998. O sea que los dos renglones de cada
 * nivel no dicen lo mismo con distinta forma — dicen **dos cosas distintas**, y
 * la comparación de la escala entera sólo se puede hacer si las dos están.
 * Que el 511 contra 510 se vea en vez de leerse es justamente lo que este
 * bloque tiene que permitir; hasta B7 se podía comprobar en dos niveles de
 * ocho, porque el bloque del alfabeto de abajo sólo baja a `titulo-xl` y
 * `titulo-l`.
 *
 * ⚠️ **El empate en sí NO se decide acá: está cerrado por decisión del dueño en
 * V3-E y el tema queda exactamente como está.** Este bloque no propone un
 * tamaño ni corrige uno: pone las dos mitades donde se puedan mirar.
 *
 * ── Y el renglón en minúscula es el MISMO texto, en minúscula ─────────────
 *
 * Se deriva de `MUESTRA_TITULAR` con `toLowerCase()` y no se escribe una
 * segunda constante, por la misma razón por la que los ocho niveles comparten
 * texto: con dos frases distintas, la diferencia de forma se mezclaría con la
 * diferencia de palabras y no se podría aislar ninguna de las dos. Acá lo único
 * que cambia entre los dos renglones de un nivel es la caja de la letra.
 *
 * ⚠️ **`data-muestra` queda SÓLO en el renglón en Title Case**, y el otro lleva
 * `data-muestra-minusculas`. `scripts-b4/b-tipografia.ts` lee `[data-muestra]`
 * y espera un elemento por nivel: ponerle el mismo atributo a los dos le
 * duplicaría la tabla en silencio. Un atributo propio deja los dos contables y
 * no le mueve el suyo a nadie.
 */
export function Escala() {
  return (
    <section className="flex flex-col gap-[var(--spacing-6)]">
      {NIVELES.map((nivel) => {
        const definicion = NIVELES_TIPOGRAFICOS[nivel]
        const esTitular = nivel.startsWith('titulo-')
        // Las clases salen de las tablas de `_lib/tipografia.ts`, donde están
        // escritas enteras. Armarlas acá con una plantilla sería el error que
        // ese archivo advierte: Tailwind no las vería y la regla no se
        // emitiría nunca. Los DOS renglones del nivel comparten esta cadena:
        // si difirieran en una clase, la comparación entre las dos formas
        // tendría dos causas y no se podría atribuir a la caja de la letra.
        const clases = [
          esTitular ? 'font-titulo' : 'font-cuerpo',
          definicion.claseFluida ?? definicion.claseFija,
          CLASE_INTERLINEADO[definicion.interlineado],
          CLASE_INTERLETRADO[definicion.interletrado],
        ].join(' ')
        return (
          <article key={nivel} className="flex flex-col gap-[var(--spacing-1)]">
            <Micro como="p" className="font-codigo uppercase opacity-casi">
              {`${nivel} · ${definicion.token} · ${definicion.valorFijo} · ${
                definicion.claseFluida === null ? 'invariante' : 'fluido 375→1440'
              }`}
            </Micro>
            <p data-muestra={nivel} className={clases}>
              {MUESTRA_TITULAR}
            </p>
            {/* La otra mitad del empate: la x-height, que es la que manda
                cuando no hay mayúsculas. Mismo texto, misma cadena de clases,
                misma caja — lo único que cambia es la forma de la letra. */}
            <p data-muestra-minusculas={nivel} className={clases}>
              {MUESTRA_TITULAR.toLowerCase()}
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
