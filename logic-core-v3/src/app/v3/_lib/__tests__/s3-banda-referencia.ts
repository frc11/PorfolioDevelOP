/**
 * LO QUE LA REFERENCIA HACE ARRIBA DE 1440 — leído de `LAYOUT.md`, no citado.
 *
 * ── Por qué este archivo existe ───────────────────────────────────────────
 *
 * La instrucción de V3-C parte de una premisa: *«el sitio de referencia no
 * tiene ese techo: su tipografía sigue creciendo»*. Es la premisa que justifica
 * extender la banda, así que es la primera que hay que verificar — y este repo
 * la tiene MEDIDA. `docs/rediseno/s0/LAYOUT.md` §2.3 publica los seis niveles
 * fluidos de `www.nk.studio` a 390, 768, 1024, 1025, 1440 y 1920, sacados de 24
 * volcados del navegador.
 *
 * **Leerla es la diferencia entre repetir una premisa y comprobarla.** Por eso
 * la tabla se PARSEA del documento, con sus columnas ubicadas por el
 * encabezado, y no se transcribe: una transcripción envejece en silencio y una
 * premisa transcrita no se puede refutar.
 *
 * ── El censo de familias, y por qué NO se hace sobre la fuente ────────────
 *
 * La segunda mitad contesta la otra pregunta que la decisión abre: **¿cuántos
 * elementos del documento llevan la clase FIJA de un nivel y cuántos la
 * FLUIDA?** Mientras el techo del `clamp()` coincidía con el token fijo, las
 * dos daban lo mismo de 1440 para arriba y la pregunta no tenía consecuencia.
 * Si la banda se extiende, la tiene: en la misma pantalla conviven dos tamaños
 * del mismo nivel.
 *
 * ⚠ **Un escáner de fuente contesta MAL esta pregunta, y se comprobó.** Ni
 * `Titular.tsx` ni `Textos.tsx` escriben la clase: la eligen en tiempo de
 * render desde `NIVELES_TIPOGRAFICOS` según su prop `fluido`, así que un grep
 * por `text-fluido-titulo-s` sobre `_secciones/` da CERO mientras el documento
 * lo emite en las cinco cifras de Números. El censo se hace entonces sobre el
 * MARCADO DEL SERVIDOR, con el mismo clasificador que usa el frente de mobile
 * (`s10-mobile.tokenDeCaja`), que mira la lista de clases del elemento.
 */

import { NIVELES_TIPOGRAFICOS, type Nivel } from '../tipografia'
import { leer } from './s3-archivos'
import { marcadoDelHome } from './s10-banco'
import { tokenDeCaja } from './s10-mobile'
import { atributo, nodosDe } from './s10-recorrido'

/** El documento de S0 con la tipografía de la referencia medida. */
export const LAYOUT_DE_S0 = 'docs/rediseno/s0/LAYOUT.md'

export interface FilaDeLaReferencia {
  readonly token: string
  /** Los anchos de la tabla, en el orden del encabezado, con su valor en px. */
  readonly porAncho: ReadonlyMap<number, number>
}

/**
 * LA TABLA B DE `LAYOUT.md` §2.3, con las columnas ubicadas por el encabezado.
 *
 * Sólo las filas de los seis `--text-fluido-*`: las de valores fijos de la
 * referencia no tienen contraparte en este sistema. Los decimales del documento
 * llevan coma —está escrito en español— y se convierten acá.
 */
export function tablaDeLaReferencia(): FilaDeLaReferencia[] {
  const lineas = leer(LAYOUT_DE_S0).split(/\r?\n/)
  const encabezado = lineas.findIndex((l) => /^\|\s*nivel\s*\|/.test(l) && l.includes('1920'))
  if (encabezado < 0) throw new Error(`no encontré el encabezado de la Tabla B en ${LAYOUT_DE_S0}`)
  const anchos = celdas(lineas[encabezado]).map((c) => Number.parseInt(c, 10))
  const filas: FilaDeLaReferencia[] = []
  for (const linea of lineas.slice(encabezado + 1)) {
    if (!linea.startsWith('|')) break
    const partes = celdas(linea)
    const token = /^`(--text-fluido-[a-z-]+)`$/.exec(partes[0])
    if (token === null) continue
    const porAncho = new Map<number, number>()
    partes.forEach((celda, i) => {
      const ancho = anchos[i]
      const valor = Number.parseFloat(celda.replace(',', '.'))
      if (Number.isFinite(ancho) && Number.isFinite(valor)) porAncho.set(ancho, valor)
    })
    filas.push({ token: token[1], porAncho })
  }
  return filas
}

function celdas(linea: string): string[] {
  return linea
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())
}

/**
 * ¿La referencia deja de crecer entre dos anchos? Devuelve los niveles que SÍ
 * siguen creciendo. Vacío significa «la referencia tiene el mismo techo».
 *
 * Se contesta con una lista y no con un booleano a propósito: un booleano
 * escondería cuál nivel es la excepción el día que haya una.
 */
export function nivelesQueSiguenCreciendo(
  filas: readonly FilaDeLaReferencia[],
  desde: number,
  hasta: number,
): string[] {
  return filas
    .filter((f) => {
      const a = f.porAncho.get(desde)
      const b = f.porAncho.get(hasta)
      return a !== undefined && b !== undefined && b > a
    })
    .map((f) => f.token)
}

// ── El censo de familias, sobre el documento ────────────────────────────────

export interface CensoDeNivel {
  readonly nivel: Nivel
  /** Elementos del documento con la clase FIJA del nivel. */
  readonly fija: number
  /** Elementos con la clase FLUIDA. */
  readonly fluida: number
  /** Las secciones donde aparece cada familia, para poder mirar la pantalla. */
  readonly seccionesFija: readonly string[]
  readonly seccionesFluida: readonly string[]
}

/**
 * Cuántos elementos del HOME COMPUESTO llevan cada familia, por nivel.
 *
 * Un nivel con las DOS columnas distintas de cero es un nivel cuyas dos
 * familias conviven en el documento: arriba del ancla se ven en dos tamaños
 * distintos, y el número de la divergencia dice en cuántos píxeles.
 */
export function censoDeFamilias(niveles: readonly Nivel[], rama = 'animada'): CensoDeNivel[] {
  const html = marcadoDelHome(rama === 'animada' ? 'animada' : 'quieta')
  const conNivel = nodosDe(html)
    .map((n) => ({
      nivel: atributo(n, 'data-nivel'),
      clases: atributo(n, 'class') ?? '',
      seccion: n.seccion ?? '(sin sección)',
    }))
    .filter((n): n is { nivel: Nivel; clases: string; seccion: string } =>
      n.nivel !== null && n.nivel in NIVELES_TIPOGRAFICOS,
    )
  return niveles.map((nivel) => {
    const propios = conNivel.filter((n) => n.nivel === nivel)
    const fluidos = propios.filter((n) => tokenDeCaja(nivel, n.clases).includes('--text-fluido-'))
    const fijos = propios.filter((n) => !tokenDeCaja(nivel, n.clases).includes('--text-fluido-'))
    return {
      nivel,
      fija: fijos.length,
      fluida: fluidos.length,
      seccionesFija: [...new Set(fijos.map((n) => n.seccion))].sort(),
      seccionesFluida: [...new Set(fluidos.map((n) => n.seccion))].sort(),
    }
  })
}
