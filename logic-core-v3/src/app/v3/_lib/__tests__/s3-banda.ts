/**
 * LA BANDA FLUIDA — dónde empieza a interpolar la escala, dónde deja de
 * hacerlo, y cuánto ocupa el titular del Hero en cada uno de esos anchos.
 *
 * Vive aparte de `s3-tipografia.invariant.ts` por la regla de las 300 líneas
 * del repo, y el corte es por tema: ese archivo afirma que los ocho niveles
 * EXISTEN y se consumen; éste afirma **por dónde pasa cada nivel a lo largo del
 * ancho** — que es otra pregunta y necesita otro modelo.
 *
 * ── ⚠ ESTO ES UN MODELO, NO UNA MEDICIÓN ──────────────────────────────────
 *
 * No hay navegador. Se RESUELVEN las expresiones declaradas en
 * `theme-develop.css` contra un ancho de viewport supuesto, con el mismo
 * resolvedor que usan los cuatro frentes de SITIO-S10 (`s10-css.ts`) y sus
 * supuestos declarados. Escribir un segundo resolvedor acá habría sido el
 * defecto que ese archivo existe para no tener.
 *
 * ── Las tres anclas de un nivel fluido, y por qué son TRES ────────────────
 *
 * Un `clamp(piso, recta, techo)` tiene tres puntos verificables y el sistema
 * les da tres significados distintos:
 *
 *   · **`--fluido-piso` (375)** — el ancho donde la recta toca el PISO. Sale de
 *     medición: es el barrido de `LAYOUT.md` §2.2 donde los seis niveles dan
 *     entero a la vez, 207 veces más nítido que el candidato siguiente.
 *   · **`--fluido-techo` (1440)** — el ancho donde la recta vale **el token
 *     FIJO del nivel**. También sale de medición: seis niveles independientes
 *     convergen ahí. **Es el ancla, y no se mueve.**
 *   · **`--container-tope` (1920)** — el ancho donde la recta DEJA DE
 *     INTERPOLAR. Antes de V3-C coincidía con el ancla; ahora no, y por eso son
 *     dos preguntas separadas en vez de una sola comparación de literales.
 *
 * ⚠ **El techo no se compara contra el token fijo: se compara contra la recta
 * evaluada en el tope.** Es una comprobación más fuerte en las dos direcciones
 * —caza un techo bajado Y uno subido— y es la que sobrevive a que la banda deje
 * de terminar donde está el ancla.
 */

import { NIVELES, NIVELES_TIPOGRAFICOS, type Nivel } from '../tipografia'
import { partirPorComas, resolverLongitud, tokenPx, valorDeToken } from './s10-css'
import type { NivelResuelto } from './s10-mobile'

/** El ancho donde la recta toca el piso de cada `clamp()`. Del tema. */
export const PISO_DE_LA_BANDA = tokenPx('--fluido-piso', 0)
/** El ancho donde la recta vale el token fijo del nivel. Del tema. */
export const ANCLA_DE_LA_BANDA = tokenPx('--fluido-techo', 0)
/**
 * El ancho donde la recta deja de interpolar.
 *
 * **No es un número nuevo y no se declara un token para tenerlo**: es
 * `--container-tope`, el único tope global que `LAYOUT.md` §3.2 midió, el que
 * `Envoltorio.tsx` ya aplica al contenido. Arriba de ese ancho la caja de texto
 * NO crece —`anchoDeContenido` se queda clavado—, así que una tipografía que
 * siguiera creciendo lo haría contra una medida congelada.
 */
export const TOPE_DE_LA_BANDA = tokenPx('--container-tope', 0)

/**
 * Un ancho más grande que el tope, para ver que arriba de él NADA se mueve.
 *
 * Lo pide la instrucción de V3-C. No entra en ninguna cuenta: su única función
 * es que el instrumento pueda AFIRMAR que la columna del tope y la suya son la
 * misma, que es la mitad de la respuesta a «¿y en un monitor ultra ancho?».
 */
export const MAS_ANCHO_QUE_EL_TOPE = 2560

export interface AnchoDeLaBanda {
  readonly px: number
  readonly porQue: string
}

export const ANCHOS_DE_LA_BANDA: readonly AnchoDeLaBanda[] = [
  { px: PISO_DE_LA_BANDA, porQue: 'el PISO (`--fluido-piso`): los seis fluidos tocan su mínimo' },
  { px: ANCLA_DE_LA_BANDA, porQue: 'el ANCLA MEDIDA (`--fluido-techo`): cada fluido vale su token FIJO' },
  { px: TOPE_DE_LA_BANDA, porQue: 'el TOPE del contenido (`--container-tope`): la caja deja de crecer' },
  { px: MAS_ANCHO_QUE_EL_TOPE, porQue: 'más ancho que el tope: acá NADA puede haberse movido' },
]

export interface TerminosDeClamp {
  readonly piso: number
  readonly techo: number
  /** La recta SIN clampear. Es lo que interpola adentro de la banda. */
  readonly recta: (ancho: number) => number
}

/**
 * Los tres términos de un `clamp()` ESCRITO — no de un nivel.
 *
 * Toma la expresión y no el nombre del token a propósito: es lo que le permite
 * al control positivo correr las MISMAS comparaciones sobre un `clamp()`
 * equivocado sin tener que pisar la hoja del sistema.
 *
 * **Tira** si la expresión no es un `clamp()` de tres términos. Un `null` ahí se
 * leería como «este nivel no es fluido», que es otra cosa.
 */
export function terminosDeExpresion(declarado: string): TerminosDeClamp {
  const cuerpo = /^clamp\(([\s\S]*)\)$/.exec(declarado.trim())
  if (cuerpo === null) throw new Error(`no es un clamp(): ${declarado}`)
  const partes = partirPorComas(cuerpo[1])
  if (partes.length !== 3) throw new Error(`el clamp() no tiene tres términos: ${declarado}`)
  return {
    piso: resolverLongitud(partes[0], 0),
    techo: resolverLongitud(partes[2], 0),
    recta: (ancho: number) => resolverLongitud(partes[1], ancho),
  }
}

/** La expresión declarada del `--text-fluido-<nivel>`, tal cual está en la hoja. */
export function declaradoDe(nivel: string): string {
  return valorDeToken(`--text-fluido-${nivel}`)
}

/** Los términos del nivel, o `null` si el nivel se midió invariante. */
export function terminosDe(nivel: Nivel): TerminosDeClamp | null {
  if (NIVELES_TIPOGRAFICOS[nivel].claseFluida === null) return null
  return terminosDeExpresion(declaradoDe(nivel))
}

/** Los seis niveles con contraparte fluida, en el orden de la tabla. */
export const FLUIDOS: readonly Nivel[] = NIVELES.filter(
  (n) => NIVELES_TIPOGRAFICOS[n].claseFluida !== null,
)

/**
 * Los OCHO niveles resueltos a un ancho: el `--text-fluido-*` donde existe y el
 * `--text-*` donde el nivel se midió invariante.
 *
 * Se re-exporta `s10-mobile.escalaA` en vez de escribir otra: dos escalas
 * resueltas por dos modelos distintos no se pueden comparar, y
 * `s10-mobile-escala` ya publica la suya a 375 con ese modelo.
 */
export { escalaA, type NivelResuelto } from './s10-mobile'

/**
 * UN NIVEL COMO RECTA — `px = a · ancho + b`, con el techo SACADO.
 *
 * Los ocho son rectas: los seis fluidos por su término preferido y los dos
 * invariantes con pendiente cero. Tenerlos en la misma forma es lo que permite
 * contestar la pregunta que ninguna tabla de cuatro columnas contesta: **¿en
 * qué ancho se alcanzarían dos niveles?** Cuatro anchos muestrean; una recta
 * responde para todos.
 */
export interface Recta {
  /** Píxeles de tamaño por píxel de viewport. */
  readonly a: number
  /** El tamaño en un viewport de cero. */
  readonly b: number
}

export function rectaDe(nivel: Nivel): Recta {
  const terminos = terminosDe(nivel)
  const en = (ancho: number): number =>
    terminos === null ? tokenPx(NIVELES_TIPOGRAFICOS[nivel].token, ancho) : terminos.recta(ancho)
  // Dos muestras alcanzan y sobran: las expresiones del tema son lineales en
  // `vw` por construcción, y el propio método que el tema publica las deriva
  // como rectas. Si alguna dejara de serlo, `anchoDeCruce` daría un número que
  // el instrumento contrastaría contra la tabla y no cerraría.
  const b = en(0)
  return { a: en(1000) - b === 0 ? 0 : (en(1000) - b) / 1000, b }
}

/**
 * El ancho donde dos rectas se alcanzan, o `null` si nunca lo hacen ARRIBA DEL
 * PISO de la banda.
 *
 * `null` cubre los tres casos que no son un riesgo: paralelas (misma
 * pendiente), divergentes hacia arriba, y las que se cruzarían en un viewport
 * más angosto que el piso —donde el `clamp()` ya resolvió por el mínimo y
 * ninguna de las dos sigue su recta—.
 */
export function anchoDeCruce(inferior: Recta, superior: Recta): number | null {
  const denominador = superior.a - inferior.a
  if (denominador === 0) return null
  const ancho = (inferior.b - superior.b) / denominador
  return ancho > PISO_DE_LA_BANDA ? ancho : null
}

/** La separación entre dos niveles consecutivos de la tabla, a un ancho. */
export interface Separacion {
  readonly de: Nivel
  readonly a: Nivel
  readonly px: number
}

export function separacionesEn(escala: readonly NivelResuelto[]): Separacion[] {
  const salida: Separacion[] = []
  for (let i = 1; i < escala.length; i += 1) {
    salida.push({ de: escala[i - 1].nivel, a: escala[i].nivel, px: escala[i].px - escala[i - 1].px })
  }
  return salida
}

/**
 * LA DIVERGENCIA ENTRE LAS DOS FAMILIAS de un mismo nivel, a un ancho.
 *
 * Positiva significa que el FLUIDO es más grande que el FIJO. Abajo del ancla
 * es siempre negativa —el fluido viene subiendo hacia su token— y hasta V3-C
 * era exactamente cero de 1440 para arriba. Que pueda ser positiva es la
 * consecuencia declarada de extender la banda, y por eso se mide en vez de
 * afirmarse de palabra.
 */
export function divergenciaEn(nivel: Nivel, ancho: number): number {
  return tokenPx(`--text-fluido-${nivel}`, ancho) - tokenPx(NIVELES_TIPOGRAFICOS[nivel].token, ancho)
}
