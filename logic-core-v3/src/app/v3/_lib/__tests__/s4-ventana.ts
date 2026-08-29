/**
 * LA VENTANA DE VALIDEZ DE UN CHECK DE FRONTERA.
 *
 * ── La clase de defecto, no el caso ───────────────────────────────────────
 *
 * Cinco afirmaciones de `s3-frontera.invariant.ts` fallaron al correr los tres
 * sprints juntos:
 *
 *     git status ve 0 de los 35 archivos del sprint
 *     y ve 0 rutas tocadas en total
 *     el único token nuevo es la corrección declarada — obtenido []
 *     0 scripts nuevos
 *     0 instrumentos incluidos en la cuenta
 *
 * Las cinco comparan **el árbol de trabajo contra `HEAD`**. Durante el sprint,
 * con todo sin commitear, eran verdaderas. Commiteado y mergeado, `HEAD` ya
 * contiene los cambios y **el diff es vacío por construcción**.
 *
 * No están rotas: **tienen fecha de vencimiento y nadie la declaró.** Y es una
 * clase, no un caso: todo check que compare contra el estado de `git` mide el
 * momento del sprint, no una propiedad del código. Con siete lanes por venir,
 * cada uno va a dejar los suyos.
 *
 * ── Qué hace este módulo ──────────────────────────────────────────────────
 *
 * Decide, con un testigo declarado, si un check de frontera está DENTRO de su
 * ventana. El testigo es la lista de rutas cuyo diff el check necesita: si
 * ninguna aparece en `git status`, sus cambios ya están en `HEAD` y el check no
 * tiene base contra la cual medir.
 *
 * ⚠ Fuera de ventana el check **no falla y no pasa**: usa `noCorre()` de
 * `afirmar.ts`, que imprime que no corrió y por qué. Un verde indistinguible
 * entre "verifiqué" y "no había nada que verificar" es exactamente el modo de
 * falla que este proyecto viene cazando desde S10.
 *
 * ── Por qué la lista de tocados se inyecta ────────────────────────────────
 *
 * `evaluarVentana` no llama a `git`: recibe la lista. Así el control positivo
 * puede alimentarla con una lista sintética y comprobar que el detector
 * distingue los dos estados. Un detector de ventana que siempre dice "fuera"
 * apagaría el check para siempre sin que nadie lo note.
 */

export interface Ventana {
  readonly dentro: boolean
  readonly razon: string
  /** Los testigos que sí aparecieron en el árbol de trabajo. */
  readonly vistos: readonly string[]
}

/**
 * @param testigos rutas —en el idioma de `git`— cuyo diff contra `HEAD` es la
 *   base del check.
 * @param tocados lo que `git status --porcelain` reporta como tocado.
 */
export function evaluarVentana(
  testigos: readonly string[],
  tocados: readonly string[],
): Ventana {
  const vistos = testigos.filter((t) =>
    tocados.some((r) => r === t || (r.endsWith('/') && t.startsWith(r))),
  )
  if (vistos.length > 0) {
    return {
      dentro: true,
      vistos,
      razon: `${vistos.length} de ${testigos.length} testigos siguen sin commitear: el diff contra HEAD todavía es la base del sprint`,
    }
  }
  return {
    dentro: false,
    vistos,
    razon:
      `ninguno de los ${testigos.length} testigos aparece en \`git status\`: sus cambios ya están en HEAD, ` +
      'así que el diff contra HEAD es vacío por construcción y este check no tiene base contra la cual medir',
  }
}

/** El encabezado que un check de frontera imprime antes de cualquier otra cosa. */
export function encabezadoDeFrontera(nombre: string, ventana: Ventana): string {
  const estado = ventana.dentro ? 'DENTRO DE VENTANA' : 'FUERA DE VENTANA'
  return [
    `${nombre} — CHECK DE FRONTERA (propiedad del MOMENTO, no del código)`,
    `  estado : ${estado}`,
    `  motivo : ${ventana.razon}`,
    ventana.dentro
      ? `  base   : árbol de trabajo contra HEAD`
      : `  base   : árbol de trabajo contra HEAD — vacía. Este check corre ANTES del commit.`,
  ].join('\n')
}
