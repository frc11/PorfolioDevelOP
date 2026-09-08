/**
 * B7 · FRENTE B — EL LECTOR DEL BARRIDO DEL PIN, Y EL CLASIFICADOR DE LOS CEROS.
 *
 * ── Por qué no alcanza con `LECTURA_DE_PEGADO` de `lectores-layout.ts` ─────
 *
 * Aquél alinea por ÍNDICE contra el censo (`for (i…) if (lectura[i].pegado)`) y
 * devuelve dos campos. Este barrido necesita tres cosas más, y ninguna se puede
 * agregar sin tocar un archivo del padre:
 *
 *   1. **La huella en cada parada.** El barrido dura 154 paradas; si el conjunto
 *      de `sticky` cambiara a mitad de camino, alinear por índice publicaría las
 *      cifras de un elemento debajo del nombre de otro. Acá la huella viaja en
 *      cada lectura y se COMPRUEBA contra el censo parada por parada
 *      (`huellasDistintas`): la alineación queda demostrada, no supuesta.
 *   2. **El desplazamiento respecto del padre.** `pegado` es un PREDICADO sobre
 *      una foto; `r.top − rPadre.top` es CUÁNTO se corrió el elemento de su
 *      lugar en el flujo. La amplitud de ese número sobre el barrido entero mide
 *      el pin sin pasar por el predicado, y es lo que separa a un `sticky` que
 *      recorre de un elemento que sólo pasó por ahí.
 *   3. **Los controles que NO son `sticky`.** Un censo que sólo mira `sticky`
 *      no puede contener a su propio control negativo.
 *
 * ⚠️ **El predicado `pegado` es LITERALMENTE el del padre**, copiado carácter por
 * carácter —incluidas las tres condiciones y el margen de 1 px— para que las
 * paradas de este barrido y las de `f0-reproduccion.json` sean la misma cifra y
 * no dos parecidas. Lo único que se le agrega es el contexto (huella,
 * desplazamiento); no se le toca un umbral. Y **no** se le agrega un
 * `position === 'sticky'` de guardia: si un elemento quieto llegara a satisfacer
 * el predicado en una parada, eso ES el hallazgo —el predicado sobre UNA foto no
 * discrimina— y taparlo con una guardia lo volvería incomprobable.
 *
 * ── LA LECCIÓN QUE ESTE ARCHIVO EXISTE PARA HACER IMPOSIBLE DE PERDER ──────
 *
 * Un `sticky` son **dos** elementos: el hijo que se pega y el padre que le da
 * recorrido. `recorridoDisponible = alto del padre − alto propio`. Cuando el
 * hijo llena a su padre ese número es CERO **por construcción**, y ahí el
 * elemento no se pega ni un píxel sin que nada esté roto. Mirar sólo la posición
 * del hijo devuelve el mismo cero en los dos casos: el que está roto y el que
 * nunca tuvo recorrido. Por eso `clasificar` no acepta publicar un cero sin
 * decir de cuál de los dos se trata.
 */

import { HUELLA } from './huella'

export interface FichaDeCandidato {
  readonly huella: string
  /** `position` computada. Lo único que separa un candidato `sticky` de un control. */
  readonly posicion: string
  readonly top: string
  readonly altoPropio: number
  readonly altoDelPadre: number
  readonly huellaDelPadre: string
  /** `alto del padre − alto propio`: el recorrido que el `sticky` PUEDE hacer. */
  readonly recorridoDisponible: number
  readonly ancestroQueRecorta: string | null
}

export interface ParadaDeCandidato {
  readonly huella: string
  readonly top: number
  /** `r.top − rPadre.top`: cuánto se corrió de su lugar en el flujo. */
  readonly desplazamiento: number
  readonly pegado: boolean
  /**
   * ⚠️ **EL ALTO SE LEE EN CADA PARADA, Y NO UNA VEZ CON EL SCROLL EN CERO.**
   *
   * Es el reparo de un defecto de este mismo instrumento, y vale como método. El
   * censo (`censoDeCandidatos`) fotografía el par (hijo, padre) UNA vez, a
   * `scrollY = 0`. Para un `sticky` cuyo contenido no cambia eso alcanza; **para
   * éste no**, porque la secuencia monta un servicio distinto por tramo y los
   * tres no miden lo mismo. A 1025×768 el hijo pegado pasa de **774,55 px a
   * 798,55 px** a mitad del pin, así que el desborde sobre la pantalla —y con él
   * la pérdida de recorrido— es **30,55 px y no 6,55**: casi cinco veces.
   *
   * La regla que sale: **una altura que puede cambiar durante el recorrido se
   * mide durante el recorrido.** Un censo estático de un elemento dinámico es
   * una cifra que se ve bien y describe un instante que no es el que interesa.
   */
  readonly alto: number
  readonly altoDelPadre: number
}

/**
 * La construcción del conjunto de candidatos, IDÉNTICA en el censo y en cada
 * parada. Está en una sola cadena porque si las dos listas se armaran por
 * separado podrían diferir, y el barrido entero quedaría desalineado.
 *
 * Los controles que ya aparecen en el censo de `sticky` se descartan por
 * IDENTIDAD de nodo (`includes`), no por huella: dos elementos pueden compartir
 * huella y ninguno de los dos merece contarse dos veces.
 */
function candidatos(selectoresDeControl: readonly string[]): string {
  return `
  const stickies = [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).position === 'sticky')
  const extra = ${JSON.stringify(selectoresDeControl)}
    .map((s) => document.querySelector(s))
    .filter((el) => el !== null && !stickies.includes(el))
  const candidatos = [...stickies, ...extra]
  const dos = (n) => Math.round(n * 100) / 100`
}

/** El censo: el par (hijo, padre) de cada candidato, una sola vez, con el scroll en cero. */
export function censoDeCandidatos(selectoresDeControl: readonly string[]): string {
  return `(() => {
  const huella = ${HUELLA}
  const recorta = (el) => {
    let n = el.parentElement
    while (n !== null && n !== document.documentElement) {
      const cs = getComputedStyle(n)
      if (['auto', 'hidden', 'scroll', 'clip'].includes(cs.overflowY) || ['auto', 'hidden', 'scroll', 'clip'].includes(cs.overflowX)) return huella(n)
      n = n.parentElement
    }
    return null
  }${candidatos(selectoresDeControl)}
  return candidatos.map((el) => {
    const padre = el.parentElement
    const altoPropio = el.getBoundingClientRect().height
    const altoDelPadre = padre === null ? 0 : padre.getBoundingClientRect().height
    return {
      huella: huella(el),
      posicion: getComputedStyle(el).position,
      top: getComputedStyle(el).top,
      altoPropio: dos(altoPropio),
      altoDelPadre: dos(altoDelPadre),
      huellaDelPadre: padre === null ? '(sin padre)' : huella(padre),
      recorridoDisponible: dos(altoDelPadre - altoPropio),
      ancestroQueRecorta: recorta(el),
    }
  })
})()`
}

/** Una parada del barrido. El predicado `pegado` es el del padre, sin tocar. */
export function lecturaDeCandidatos(selectoresDeControl: readonly string[]): string {
  return `(() => {
  const huella = ${HUELLA}${candidatos(selectoresDeControl)}
  return candidatos.map((el) => {
    const cs = getComputedStyle(el)
    const declarado = cs.top === 'auto' ? 0 : parseFloat(cs.top)
    const r = el.getBoundingClientRect()
    const padre = el.parentElement
    const rp = padre === null ? r : padre.getBoundingClientRect()
    return {
      huella: huella(el),
      top: dos(r.top),
      desplazamiento: dos(r.top - rp.top),
      pegado: Math.abs(r.top - declarado) < 1 && rp.top < declarado - 1 && rp.bottom > r.top + 1,
      alto: dos(r.height),
      altoDelPadre: dos(rp.height),
    }
  })
})()`
}

export interface BarridoDeCandidato {
  readonly ficha: FichaDeCandidato
  readonly paradas: number
  readonly paradasPegado: number
  /** El primer y el último `scrollY` del barrido grueso donde estuvo pegado. */
  readonly desdeY: number | null
  readonly hastaY: number | null
  /** Los mismos dos bordes, afinados por bisección hasta 2 px. `null` si no se afinaron. */
  readonly entraEnY: number | null
  readonly saleEnY: number | null
  readonly desplazamientoMin: number
  readonly desplazamientoMax: number
  /** `max − min`: cuánto se movió DE VERDAD respecto de su lugar en el flujo. */
  readonly amplitud: number
  /**
   * El alto del elemento **medido en las paradas en las que estuvo pegado**, y
   * el `scrollY` donde cambió. `null` si nunca se pegó. Es la cifra que el censo
   * estático no puede dar: ver `ParadaDeCandidato.alto`.
   */
  readonly altoPegadoMin: number | null
  readonly altoPegadoMax: number | null
  readonly altoCambiaEnY: number | null
  /** Paradas en las que la huella leída no fue la del censo. Cero = alineado. */
  readonly huellasDistintas: number
}

/**
 * Las cuatro salidas posibles. **Tres de ellas son un cero**, y ésa es toda la
 * razón por la que el tipo existe: `paradasPegado: 0` sin una de estas etiquetas
 * al lado es exactamente el número que se publicó como defecto.
 */
export type ClaseDePin = 'pegado' | 'inerte-sin-recorrido' | 'roto-con-recorrido' | 'no-sticky'

export interface Veredicto {
  readonly clase: ClaseDePin
  readonly porQue: string
}

/** El subpíxel del layout: dos alturas que difieren en menos de esto son la misma. */
export const TOLERANCIA_PX = 1

export function clasificar(b: BarridoDeCandidato): Veredicto {
  const f = b.ficha
  if (f.posicion !== 'sticky') {
    return {
      clase: 'no-sticky',
      porQue: `position: ${f.posicion} — no hay pin que medir. Se movió ${b.amplitud} px respecto de su padre en ${b.paradas} paradas.`,
    }
  }
  if (f.recorridoDisponible < TOLERANCIA_PX) {
    return {
      clase: 'inerte-sin-recorrido',
      porQue: `llena a su padre (${f.altoPropio} de ${f.altoDelPadre} px): recorrido disponible ${f.recorridoDisponible} px. NO está roto — nunca tuvo recorrido, y no lo va a tener en ningún perfil.`,
    }
  }
  if (b.paradasPegado === 0 && b.amplitud < TOLERANCIA_PX) {
    const culpa =
      f.ancestroQueRecorta === null
        ? 'y no hay ningún ancestro que recorte: la causa está en otro lado.'
        : `y hay un ancestro que recorta el scroll: ${f.ancestroQueRecorta}`
    return {
      clase: 'roto-con-recorrido',
      porQue: `tenía ${f.recorridoDisponible} px de recorrido y no se movió un píxel de su lugar en el flujo en ${b.paradas} paradas, ${culpa}`,
    }
  }
  const rango = b.entraEnY !== null && b.saleEnY !== null ? `${b.entraEnY} → ${b.saleEnY} (${b.saleEnY - b.entraEnY} px afinados)` : `${b.desdeY} → ${b.hastaY} (${(b.hastaY ?? 0) - (b.desdeY ?? 0)} px al paso del barrido)`
  return {
    clase: 'pegado',
    porQue: `${b.paradasPegado} de ${b.paradas} paradas pegado, de scrollY ${rango}, moviéndose ${b.amplitud} px de los ${f.recorridoDisponible} disponibles.`,
  }
}
