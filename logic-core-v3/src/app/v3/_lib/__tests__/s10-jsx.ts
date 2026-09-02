/**
 * LEER JSX COMO TEXTO — las primitivas, y nada más.
 *
 * Es la misma costura que el banco ya usa entre `s10-recorrido.ts` y
 * `s10-lectura.ts`: **un archivo sabe leer, el otro sabe qué preguntar.** Acá
 * está el que lee. No sabe qué es un layout, ni qué es un documento, ni qué es
 * un landmark: sabe encontrar dónde termina una etiqueta, dónde termina una
 * expresión entre llaves, y cómo se ve en HTML una apertura escrita en JSX.
 *
 * ⚠ **No es un compilador de JSX y no pretende serlo.** Alcanza para la forma
 * de un layout de Next —etiquetas, componentes, `{children}`— y sus límites se
 * declaran donde se usan, en `s10-esqueleto.ts`.
 */

interface Etiqueta {
  /** Tal cual se escribió: `main`, `Navegacion`. */
  readonly nombre: string
  /** El texto crudo de los atributos, sin la barra del autocierre. */
  readonly atributos: string
  readonly autocerrada: boolean
  /** Índice del `>` que la cierra. */
  readonly fin: number
}

/**
 * El índice del `>` que cierra la etiqueta que empieza en `inicio`.
 *
 * ⚠ **No alcanza con buscar el primer `>`, y el layout de /v3 lo demuestra:**
 * su `className` es un literal de plantilla con `${…}` adentro, o sea llaves
 * anidadas dentro de comillas invertidas. Se recorre con estado de comilla y de
 * llave; un `>` sólo cierra si no está adentro de ninguna de las dos.
 */
export function finDeEtiqueta(texto: string, inicio: number): number {
  let llaves = 0
  let comilla: string | null = null
  for (let i = inicio + 1; i < texto.length; i += 1) {
    const c = texto[i]
    if (comilla !== null) {
      if (c === comilla) comilla = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      comilla = c
      continue
    }
    if (c === '{') {
      llaves += 1
      continue
    }
    if (c === '}') {
      llaves -= 1
      continue
    }
    if (c === '>' && llaves === 0) return i
  }
  return -1
}

/** El índice de la `}` que cierra la llave abierta en `inicio`. `-1` si no cierra. */
export function finDeLlaves(texto: string, inicio: number): number {
  let llaves = 0
  let comilla: string | null = null
  for (let i = inicio; i < texto.length; i += 1) {
    const c = texto[i]
    if (comilla !== null) {
      if (c === comilla) comilla = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      comilla = c
      continue
    }
    if (c === '{') llaves += 1
    else if (c === '}') {
      llaves -= 1
      if (llaves === 0) return i
    }
  }
  return -1
}

/** Lee la etiqueta que empieza en `inicio`. `null` si ahí no empieza ninguna. */
export function leerEtiqueta(texto: string, inicio: number): Etiqueta | null {
  const fin = finDeEtiqueta(texto, inicio)
  if (fin < 0) return null
  const crudo = texto.slice(inicio, fin + 1)
  const m = /^<([A-Za-z][A-Za-z0-9._-]*)/.exec(crudo)
  if (m === null) return null
  const cuerpo = crudo.slice(1 + m[1].length, crudo.length - 1)
  const autocerrada = cuerpo.trimEnd().endsWith('/')
  return {
    nombre: m[1],
    atributos: autocerrada ? cuerpo.trimEnd().slice(0, -1) : cuerpo,
    autocerrada,
    fin,
  }
}

function sinInterpolaciones(cuerpo: string): string {
  return cuerpo
    .replace(/\$\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * La apertura de una etiqueta literal, pasada de JSX a HTML.
 *
 * ⚠ **La simplificación declarada, heredada de SITIO-S10:** el `className` de
 * la raíz del layout es un literal de plantilla con las dos variables de
 * `next/font`, y esos nombres los genera el build. Se conservan las clases
 * literales y se descartan las interpolaciones, porque ninguna clase de fuente
 * cambia una caja ni un landmark.
 *
 * Está una sola vez a propósito: dos normalizaciones distintas producirían dos
 * documentos distintos del mismo layout, y ninguna de las dos sería la
 * equivocada de forma visible.
 */
export function normalizarApertura(nombre: string, atributos: string): string {
  const normalizados = atributos
    // `className={`a ${x} b`}` → `class="a b"`; `className="a b"` → `class="a b"`.
    .replace(/className=\{`([^`]*)`\}/g, (_, cuerpo: string) => `class="${sinInterpolaciones(cuerpo)}"`)
    .replace(/className=/g, 'class=')
    .replace(/\s+/g, ' ')
    .trim()
  return normalizados === '' ? `<${nombre}>` : `<${nombre} ${normalizados}>`
}

/** La primera apertura de `etiqueta` en un JSX, pasada a HTML. `''` si no hay. */
export function aperturaDeJsx(fuente: string, etiqueta: string): string {
  const m = new RegExp(`<${etiqueta}\\b([^>]*?)>`, 's').exec(fuente)
  if (m === null) return ''
  return normalizarApertura(etiqueta, m[1])
}
