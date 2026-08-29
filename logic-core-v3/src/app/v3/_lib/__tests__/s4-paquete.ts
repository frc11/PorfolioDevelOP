/**
 * LA COMPUERTA SOBRE `package.json`.
 *
 * ── El agujero que tapa ───────────────────────────────────────────────────
 *
 * El merge de `rediseno/motion` dejó marcadores de conflicto **adentro de
 * `package.json`**. `tsc --noEmit` dio exit 0 dos veces sobre ese árbol roto:
 * no lee `package.json`. Recién `npm run` lo destapó, y para entonces el árbol
 * ya se había dado por bueno dos veces.
 *
 * Con siete lanes por venir, cada uno agrega scripts y cada merge va a tocar
 * ese archivo. Un gate de calidad que no lo mira no está mirando el archivo que
 * más se toca.
 *
 * ── Las tres cosas que revisa, y por qué la tercera es la peor ────────────
 *
 *   1. **Marcadores de conflicto.** Se buscan aparte de la validez del JSON
 *      aunque también la rompan: "Unexpected token <" no le dice a nadie que
 *      hay un merge sin resolver.
 *   2. **JSON válido.**
 *   3. **Claves duplicadas.** `JSON.parse` NO se queja: se queda con la última
 *      y descarta la anterior en silencio. **Una clave duplicada es peor que un
 *      error de sintaxis**: no rompe nada, no falla el build, y pisa un script
 *      entero sin dejar rastro. Por eso hay un recorredor propio en vez de
 *      confiar en el parser.
 */

export type ClaseDeProblema = 'marcador-de-conflicto' | 'json-invalido' | 'clave-duplicada'

export interface ProblemaDePaquete {
  readonly clase: ClaseDeProblema
  readonly detalle: string
}

/** Las tres marcas de un conflicto de merge sin resolver, a principio de línea. */
const RE_MARCADOR = /^(<{7}|={7}|>{7})(\s|$)/

export function marcadoresDeConflicto(texto: string): string[] {
  const encontrados: string[] = []
  const lineas = texto.split('\n')
  for (let n = 0; n < lineas.length; n += 1) {
    if (RE_MARCADOR.test(lineas[n])) encontrados.push(`línea ${n + 1}: ${lineas[n].trim().slice(0, 40)}`)
  }
  return encontrados
}

/**
 * Las claves repetidas dentro de un mismo objeto, con su ruta.
 *
 * Recorre el JSON a mano porque `JSON.parse` ya se comió el duplicado antes de
 * devolver nada. Si el texto está malformado corta y devuelve lo que alcanzó a
 * ver: la validez la reporta el chequeo 2, éste no la duplica.
 */
export function clavesDuplicadas(texto: string): string[] {
  const duplicadas: string[] = []
  const n = texto.length
  let i = 0

  function saltarBlancos(): void {
    while (i < n && /\s/.test(texto[i])) i += 1
  }

  function leerCadena(): string | null {
    if (texto[i] !== '"') return null
    i += 1
    let salida = ''
    while (i < n) {
      const c = texto[i]
      if (c === '\\') {
        salida += texto[i + 1] ?? ''
        i += 2
        continue
      }
      if (c === '"') {
        i += 1
        return salida
      }
      salida += c
      i += 1
    }
    return null
  }

  function objeto(ruta: string): boolean {
    i += 1
    const vistas = new Set<string>()
    saltarBlancos()
    if (texto[i] === '}') {
      i += 1
      return true
    }
    for (;;) {
      saltarBlancos()
      const clave = leerCadena()
      if (clave === null) return false
      const rutaHija = ruta === '' ? clave : `${ruta}.${clave}`
      if (vistas.has(clave)) duplicadas.push(rutaHija)
      vistas.add(clave)
      saltarBlancos()
      if (texto[i] !== ':') return false
      i += 1
      if (!valor(rutaHija)) return false
      saltarBlancos()
      if (texto[i] === ',') {
        i += 1
        continue
      }
      if (texto[i] === '}') {
        i += 1
        return true
      }
      return false
    }
  }

  function arreglo(ruta: string): boolean {
    i += 1
    saltarBlancos()
    if (texto[i] === ']') {
      i += 1
      return true
    }
    for (;;) {
      if (!valor(`${ruta}[]`)) return false
      saltarBlancos()
      if (texto[i] === ',') {
        i += 1
        continue
      }
      if (texto[i] === ']') {
        i += 1
        return true
      }
      return false
    }
  }

  function valor(ruta: string): boolean {
    saltarBlancos()
    const c = texto[i]
    if (c === '{') return objeto(ruta)
    if (c === '[') return arreglo(ruta)
    if (c === '"') return leerCadena() !== null
    const inicio = i
    while (i < n && !/[\s,}\]]/.test(texto[i])) i += 1
    return i > inicio
  }

  valor('')
  return duplicadas
}

export function revisarPaquete(texto: string): ProblemaDePaquete[] {
  const problemas: ProblemaDePaquete[] = []

  const marcadores = marcadoresDeConflicto(texto)
  for (const m of marcadores) {
    problemas.push({ clase: 'marcador-de-conflicto', detalle: `marcador de conflicto de merge sin resolver — ${m}` })
  }

  try {
    JSON.parse(texto)
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error)
    problemas.push({ clase: 'json-invalido', detalle: `no es JSON válido — ${detalle}` })
  }

  for (const ruta of clavesDuplicadas(texto)) {
    problemas.push({
      clase: 'clave-duplicada',
      detalle: `clave duplicada \`${ruta}\` — JSON.parse se queda con la última y pisa la anterior en silencio`,
    })
  }

  return problemas
}
