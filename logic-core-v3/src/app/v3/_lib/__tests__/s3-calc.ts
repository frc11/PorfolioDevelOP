/**
 * LA CALCULADORA DE `calc()` — resolver es afirmar.
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * Este sprint COMPONE valores en vez de escribirlos: el intercambio del CTA es
 * `calc(var(--duracion-muy-lenta) + 2 * var(--duracion-rapida))` y el halo del
 * cursor es `calc(var(--spacing-8) + var(--spacing-1))`. Afirmar que esas
 * expresiones dan 1300ms y 36px **exige resolverlas**: comparar una cadena
 * contra otra cadena no comprueba nada, porque el error que hay que cazar es
 * aritmético.
 *
 * Y hay una razón más fuerte. Si alguien cambia `--duracion-rapida` en el
 * sistema, la cadena del componente sigue idéntica y el número deja de ser el
 * medido. Sólo una resolución contra los tokens reales lo nota — y hay un
 * control positivo que lo demuestra, moviendo un token y viendo cambiar la
 * cuenta.
 *
 * ── Alcance declarado ─────────────────────────────────────────────────────
 *
 * No es un motor de CSS. Entiende `var()` con respaldo y `calc()` con
 * `+ − * /` y paréntesis, en px, rem, ms, s, grados y sin unidad. Cualquier
 * otra cosa devuelve `null` en vez de un número inventado — y el instrumento
 * que reciba `null` falla, que es lo correcto.
 */

export type Unidad = 'px' | 'ms' | 'deg' | ''

export interface Cantidad {
  readonly n: number
  readonly unidad: Unidad
}

/**
 * Sustituye `var()` hasta el fondo. Devuelve `null` si un token no existe:
 * un `var()` que no resuelve tiene que fallar, no valer cero.
 */
export function expandirVar(expresion: string, tokens: Map<string, string>): string | null {
  let actual = expresion
  for (let vuelta = 0; vuelta < 12; vuelta += 1) {
    const abre = actual.indexOf('var(')
    if (abre < 0) return actual
    const cierra = cierreDeParentesis(actual, abre + 3)
    if (cierra < 0) return null
    const adentro = actual.slice(abre + 4, cierra)
    const coma = adentro.indexOf(',')
    const nombre = (coma < 0 ? adentro : adentro.slice(0, coma)).trim()
    const respaldo = coma < 0 ? null : adentro.slice(coma + 1).trim()
    const valor = tokens.get(nombre) ?? respaldo
    if (valor === null || valor === undefined) return null
    actual = actual.slice(0, abre) + `(${valor})` + actual.slice(cierra + 1)
  }
  return null
}

function cierreDeParentesis(texto: string, apertura: number): number {
  let prof = 0
  for (let i = apertura; i < texto.length; i += 1) {
    if (texto[i] === '(') prof += 1
    else if (texto[i] === ')') {
      prof -= 1
      if (prof === 0) return i
    }
  }
  return -1
}

/**
 * Resuelve una expresión a una cantidad. `null` si no se puede — nunca un
 * número aproximado.
 */
export function resolver(expresion: string, tokens: Map<string, string>): Cantidad | null {
  const expandida = expandirVar(expresion, tokens)
  if (expandida === null) return null
  const limpia = expandida.replace(/calc\(/g, '(').trim()
  try {
    const lector = new Lector(limpia)
    const valor = lector.suma()
    return lector.terminado() ? valor : null
  } catch {
    return null
  }
}

const FACTOR: Readonly<Record<string, { factor: number; unidad: Unidad }>> = {
  px: { factor: 1, unidad: 'px' },
  rem: { factor: 16, unidad: 'px' },
  ms: { factor: 1, unidad: 'ms' },
  s: { factor: 1000, unidad: 'ms' },
  deg: { factor: 1, unidad: 'deg' },
}

/** Descenso recursivo sobre `+ − * /` con paréntesis. Sin estado global. */
class Lector {
  private i = 0
  constructor(private readonly texto: string) {}

  terminado(): boolean {
    this.espacios()
    return this.i >= this.texto.length
  }

  suma(): Cantidad {
    let izquierda = this.producto()
    for (;;) {
      this.espacios()
      const op = this.texto[this.i]
      if (op !== '+' && op !== '-') return izquierda
      this.i += 1
      const derecha = this.producto()
      izquierda = combinarSuma(izquierda, derecha, op)
    }
  }

  private producto(): Cantidad {
    let izquierda = this.atomo()
    for (;;) {
      this.espacios()
      const op = this.texto[this.i]
      if (op !== '*' && op !== '/') return izquierda
      this.i += 1
      const derecha = this.atomo()
      izquierda = combinarProducto(izquierda, derecha, op)
    }
  }

  private atomo(): Cantidad {
    this.espacios()
    if (this.texto[this.i] === '(') {
      this.i += 1
      const dentro = this.suma()
      this.espacios()
      if (this.texto[this.i] !== ')') throw new Error('falta )')
      this.i += 1
      return dentro
    }
    if (this.texto[this.i] === '-') {
      this.i += 1
      const dentro = this.atomo()
      return { n: -dentro.n, unidad: dentro.unidad }
    }
    const resto = this.texto.slice(this.i)
    const m = /^([0-9]*\.?[0-9]+)([a-zA-Z%]*)/.exec(resto)
    if (m === null) throw new Error(`no es un número: ${resto.slice(0, 12)}`)
    this.i += m[0].length
    const unidad = m[2]
    if (unidad === '') return { n: Number(m[1]), unidad: '' }
    const conocida = FACTOR[unidad]
    if (conocida === undefined) throw new Error(`unidad desconocida: ${unidad}`)
    return { n: Number(m[1]) * conocida.factor, unidad: conocida.unidad }
  }

  private espacios(): void {
    while (this.i < this.texto.length && /\s/.test(this.texto[this.i])) this.i += 1
  }
}

function combinarSuma(a: Cantidad, b: Cantidad, op: string): Cantidad {
  if (a.unidad !== b.unidad && a.unidad !== '' && b.unidad !== '') {
    throw new Error(`no se suman ${a.unidad} y ${b.unidad}`)
  }
  return { n: op === '+' ? a.n + b.n : a.n - b.n, unidad: a.unidad === '' ? b.unidad : a.unidad }
}

function combinarProducto(a: Cantidad, b: Cantidad, op: string): Cantidad {
  if (op === '/') {
    if (b.unidad !== '') throw new Error('sólo se divide por un número')
    return { n: a.n / b.n, unidad: a.unidad }
  }
  if (a.unidad !== '' && b.unidad !== '') throw new Error('sólo se multiplica por un número')
  return { n: a.n * b.n, unidad: a.unidad === '' ? b.unidad : a.unidad }
}
