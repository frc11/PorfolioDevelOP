/**
 * LO QUE HAY QUE LEER PARA PODER DECIDIR — el marcado del home y los dos
 * documentos de S0.
 *
 * Tercer archivo del frente por la regla de las 300 líneas, y el corte es por
 * dependencia, igual que el que separa `s3-banda.ts` de
 * `s3-banda-consecuencias.ts`: `s16-compensacion.ts` sólo hace aritmética sobre
 * la hoja, mientras esto necesita que el home RENDERICE y que los documentos de
 * S0 estén en el disco. Mezclarlos habría hecho que una tabla de factores
 * dependiera de que ocho secciones compongan.
 *
 * Las dos preguntas que contesta, y ninguna es de opinión:
 *
 *   · **¿Dónde manda cada métrica?** Se cuenta la mayúscula que cada nivel
 *     lleva de verdad en el home compuesto. La premisa dice que los niveles de
 *     display van en Title Case; acá se mide si es cierto.
 *   · **¿De qué familia salieron los 14 valores?** Se PARSEA de los documentos
 *     de S0, con los saltos normalizados. Una cita envejece en silencio.
 */

import { NIVELES, NIVELES_TIPOGRAFICOS, type Nivel } from '../tipografia'
import { leer } from './s3-archivos'
import { marcadoDelHome } from './s10-banco'
import { atributo, nodosDe, textoDe } from './s10-recorrido'


// ── Dónde manda cada métrica, medido sobre el documento ─────────────────────

export interface CargaDeMayusculas {
  readonly nivel: Nivel
  readonly elementos: number
  readonly letras: number
  readonly mayusculas: number
  /** Elementos cuyo texto lleva al menos UNA mayúscula. */
  readonly conMayuscula: number
  /** Fracción de letras en mayúscula, en por ciento. */
  readonly porciento: number
}

export interface Conteo {
  readonly letras: number
  readonly mayusculas: number
}

/** Las letras de un texto y cuántas son mayúsculas, con `uppercase` aplicada.
 *  Exportada para que el control positivo corra ESTA función y no una copia. */
export function contarMayusculas(crudo: string, clases: string): Conteo {
  const texto = clases.split(/\s+/).includes('uppercase') ? crudo.toUpperCase() : crudo
  const letras = [...texto].filter((c) => /\p{L}/u.test(c))
  return {
    letras: letras.length,
    mayusculas: letras.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase()).length,
  }
}

/**
 * CUÁNTA MAYÚSCULA LLEVA CADA NIVEL EN EL HOME COMPUESTO.
 *
 * Es el discriminador de «dónde manda la cap height», y se mide sobre el
 * MARCADO DEL SERVIDOR por la misma razón que `s3-banda-referencia.ts` declara
 * para el censo de familias: los componentes no escriben el texto en el fuente,
 * lo eligen en tiempo de render.
 *
 * ⚠ La clase `uppercase` se aplica antes de contar. Sin eso, `micro` —que la
 * lleva— se contaría como texto en minúscula y el nivel donde la mayúscula
 * manda de verdad quedaría invisible.
 */
export function cargaDeMayusculas(rama: 'quieta' | 'animada' = 'animada'): CargaDeMayusculas[] {
  const html = marcadoDelHome(rama)
  const acumulado = new Map<Nivel, { e: number; l: number; m: number; c: number }>()
  for (const nodo of nodosDe(html)) {
    const nivel = atributo(nodo, 'data-nivel')
    if (nivel === null || !(nivel in NIVELES_TIPOGRAFICOS)) continue
    const { letras, mayusculas } = contarMayusculas(
      textoDe(html, nodo),
      atributo(nodo, 'class') ?? '',
    )
    const previo = acumulado.get(nivel as Nivel) ?? { e: 0, l: 0, m: 0, c: 0 }
    acumulado.set(nivel as Nivel, {
      e: previo.e + 1,
      l: previo.l + letras,
      m: previo.m + mayusculas,
      c: previo.c + (mayusculas > 0 ? 1 : 0),
    })
  }
  return NIVELES.filter((n) => acumulado.has(n)).map((nivel) => {
    const v = acumulado.get(nivel)!
    return {
      nivel,
      elementos: v.e,
      letras: v.l,
      mayusculas: v.m,
      conMayuscula: v.c,
      porciento: v.l === 0 ? 0 : (v.m / v.l) * 100,
    }
  })
}

// ── La procedencia de los catorce valores, leída de los documentos ──────────

export const REPORTE_DE_S0 = 'docs/rediseno/s0/REPORTE-S0.md'
export const LAYOUT_DE_S0 = 'docs/rediseno/s0/LAYOUT.md'

/**
 * ⚠ **NORMALIZA `\r\n` → `\n` ANTES DE BUSCAR.** El árbol corre con
 * `core.autocrlf` en true y los dos documentos están en CRLF: un patrón que
 * cruza un salto de línea con `\s+` funciona igual, pero uno escrito con `\n`
 * literal compara contra cero bytes. Ya hubo dos rojos por esto en este sprint.
 */
export function normalizarSaltos(texto: string): string {
  return texto.replace(/\r\n/g, '\n')
}

/**
 * Los enteros de tres dígitos que aparecen en las líneas que nombran `que`.
 *
 * ⚠ El patrón excluye lo que viene detrás de una coma o un punto decimal. Sin
 * eso, el factor `0,998` de la propia x-height entraba como si fuera una
 * métrica de 998 unidades — un tercer valor donde sólo hay dos familias.
 */
export function cifrasJuntoA(fuentes: readonly string[], que: RegExp): number[] {
  const vistas = new Set<number>()
  for (const fuente of fuentes) {
    for (const linea of normalizarSaltos(fuente).split('\n')) {
      if (!que.test(linea)) continue
      for (const m of linea.matchAll(/(?<![\d.,])(\d{3})(?!\d)/g)) {
        const n = Number.parseInt(m[1], 10)
        if (n >= 400 && n <= 999) vistas.add(n)
      }
    }
  }
  return [...vistas].sort((a, b) => a - b)
}

export interface CuentaDeFranco {
  readonly origen: number
  readonly portadora: number
  readonly factor: number
}

/**
 * LA CUENTA QUE REPRODUCE `REPORTE-S0.md` §(b): `504/510 = 0,9882`.
 *
 * Es la prueba documental de que la familia de la que salieron los 14 valores
 * **no es Instrument Sans**: su x-height es 504 y la de Instrument Sans 510.
 * Instrument Sans es la PORTADORA —recibió los px sin reescalarlos— y no el
 * origen. Se parsea en vez de citarse: una cita envejece en silencio.
 */
export function cuentaDeFranco(fuente = leer(REPORTE_DE_S0)): CuentaDeFranco | null {
  const m = /Reproducir su cuenta\*\*:\s*(\d{3})\s*\/\s*(\d{3})\s*=\s*\*\*(\d+),(\d+)\*\*/.exec(
    normalizarSaltos(fuente),
  )
  if (m === null) return null
  return {
    origen: Number.parseInt(m[1], 10),
    portadora: Number.parseInt(m[2], 10),
    factor: Number.parseFloat(`${m[3]}.${m[4]}`),
  }
}

export interface CriterioDeAceptacion {
  readonly errorMedido: number
  readonly criterio: number
}

/**
 * EL ERROR Y EL CRITERIO CON LOS QUE SE ACEPTARON LOS 14 VALORES, leídos de
 * `LAYOUT.md` §2.3. La frase cruza un salto de línea, así que el patrón usa
 * `\s+` sobre el texto ya normalizado.
 */
export function criterioDeAceptacion(fuente = leer(LAYOUT_DE_S0)): CriterioDeAceptacion | null {
  const m = /es \*\*(\d+),(\d+)px\*\*:\s+el criterio de aceptación del sprint\s+\((\d+)px\)/.exec(
    normalizarSaltos(fuente),
  )
  if (m === null) return null
  return {
    errorMedido: Number.parseFloat(`${m[1]}.${m[2]}`),
    criterio: Number.parseInt(m[3], 10),
  }
}
