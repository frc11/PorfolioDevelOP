/**
 * [B1] LOS DETECTORES DEL INVARIANTE DE TRABAJOS — puros, sobre el marcado o el CSS, para que cada control positivo corra la
 * MISMA función contra una entrada fabricada. Dos vienen del invariante de antes (`enlacesFueraDelContenido`, `coloresDelTema`; su
 * copia sigue en el archivo del túnel) y los otros son del selector.
 */

/** Los `href` de las anclas que no salen de una lista declarada. */
export function enlacesFueraDelContenido(html: string, declarados: readonly string[]): string[] {
  return [...html.matchAll(/<a [^>]*href="([^"]*)"/g)]
    .map((m) => m[1])
    .filter((href) => !declarados.includes(href))
}

export interface ColoresDelTema {
  readonly fondo: string
  readonly tinta: string
  readonly acentos: readonly string[]
  /** [B1.2c] P-H2 · los tres acentos claros (`--color-acento-<servicio>-claro`), aparte. */
  readonly acentosClaros: readonly string[]
}

/** El fondo y la tinta de la sala invertida y los acentos, leídos del tema. */
export function coloresDelTema(css: string): ColoresDelTema {
  const bloque = /(\[data-seccion="invertida"\][\s\S]*?\n\})/.exec(css)
  if (bloque === null) throw new Error('no se pudo leer el bloque invertido del CSS')
  const hex = (fuente: string, patron: RegExp): string => {
    const m = patron.exec(fuente)
    if (m === null) throw new Error(`no se pudo leer del CSS: ${patron.source}`)
    return m[1]
  }
  return {
    fondo: hex(bloque[1], /--color-fondo:\s*(#[0-9A-Fa-f]{6})/),
    tinta: hex(bloque[1], /--color-tinta:\s*(#[0-9A-Fa-f]{6})/),
    acentos: [...css.matchAll(/--color-acento-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].filter((m) => !m[1].endsWith('-claro')).map((m) => m[2]),
    acentosClaros: [...css.matchAll(/--color-acento-([a-z-]+)-claro:\s*(#[0-9A-Fa-f]{6})/g)].map((m) => m[2]),
  }
}

/** Los nombres que NO están adentro de un `h3` (la cabecera de su tira). */
export function nombresQueNoSonEncabezado(html: string, nombres: readonly string[]): string[] {
  const encabezados = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
  return nombres.filter((n) => !encabezados.includes(n))
}

/** Los atributos `class` con un `hover:` y sin su gemela `focus-visible:` (el énfasis de puntero sin el del teclado). */
export function hoversSinFoco(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]).filter((c) => c.includes('hover:') && !c.includes('focus-visible:'))
}

/** Los `onClick` que no van en un `<button`: un `div` haciendo de botón. */
export function clicsFueraDeUnBoton(fuente: string): string[] {
  return [...fuente.matchAll(/<([a-zA-Z.]+)\b[^<>]*?\bonClick=/g)].map((m) => m[1]).filter((etiqueta) => etiqueta !== 'button')
}

/** Los `id` que un `aria-controls` o un `aria-labelledby` nombran y el marcado no tiene. */
export function referenciasColgadas(html: string): string[] {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  return [...html.matchAll(/\saria-(?:controls|labelledby)="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((id) => !ids.has(id))
}
