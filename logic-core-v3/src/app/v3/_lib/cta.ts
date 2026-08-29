/**
 * EL CTA DE ROLLOVER — los valores medidos y la cuenta del rótulo accesible.
 *
 * Sin React a propósito: `s3-cta.invariant.ts` importa esta tabla y afirma,
 * uno por uno, que el CSS del componente aplica exactamente estos números. Un
 * valor que sólo vive adentro de una hoja de estilos no se puede contrastar
 * contra la medición.
 *
 * ── Qué se transfiere y qué no ─────────────────────────────────────────────
 *
 * Se transfieren LOS VALORES; la implementación es nuestra. Ni un selector, ni
 * un nombre de clase, ni un bloque de CSS de la referencia entra al repo. Los
 * ángulos, las traslaciones y el `clip-path` son mediciones —`COMPONENTS.md`
 * §3.2 y §3.3— y las reproducimos porque son la forma del movimiento.
 *
 * Dos números que la referencia tiene y NO se transfieren, con su razón:
 *
 *   · El subrayado de **120 px** de ancho es el ancho de SU rótulo, no una
 *     medida del sistema. Acá el subrayado mide el 100% de la ventana de
 *     recorte, o sea el ancho de NUESTRO rótulo. Copiarlo daría una raya que
 *     no termina donde termina la palabra.
 *   · La **imagen revelada** de 150×33,44 px es contenido. Este sprint no
 *     tiene contenido.
 *
 * ── El defecto que no heredamos ────────────────────────────────────────────
 *
 * Su árbol de accesibilidad devuelve el rótulo DUPLICADO y sin espacio: un CTA
 * de 20 caracteres reporta 40 y 5 palabras en vez de 3, porque la última
 * palabra de la primera copia y la primera de la segunda quedan pegadas. La
 * segunda copia va `aria-hidden`, y `rotuloAccesible()` es la cuenta que lo
 * comprueba — con su control positivo, que corre la MISMA cuenta sobre el
 * marcado sin `aria-hidden` y tiene que ver los 5.
 */

/**
 * La geometría del intercambio. Todo `[medido]` en `COMPONENTS.md` §3.3,
 * confirmado idéntico en tres páginas y en dos corridas de navegador
 * independientes (`matrix(0.994522, 0.104528, …)` es exactamente sen 6°).
 *
 * Las unidades van en el nombre del campo, no en el valor, para que el
 * instrumento pueda comparar números y no cadenas.
 */
export const ROLLOVER_MEDIDO = {
  /** Copia A — la que se va. */
  salida: { giroGrados: 6, x: 20, y: -33.75, opacidadFinal: 0 },
  /** Copia B — la que entra. Su reposo es el estado "fuera de cuadro". */
  entrada: {
    giroGrados: 10,
    x: -30,
    y: 24.75,
    opacidadInicial: 0,
    recorteInicial: 'inset(80% 0 0)',
    recorteFinal: 'inset(0)',
  },
  /** La ventana de recorte: `overflow: hidden` que crece. */
  ventana: { altoReposoPx: 24.5, altoHoverPx: 28.5 },
  /** El subrayado que aparece en paralelo. */
  subrayado: { altoPx: 3, duracionMs: 600, retardoMs: 400 },
  /** Duraciones del intercambio y del alto de la ventana. */
  duraciones: { intercambioMs: 1300, ventanaMs: 300 },
} as const

/**
 * El crecimiento de la ventana es el invariante que SÍ transfiere entero:
 * 28,5 − 24,5 = **4,0 px exactos**, que es `--spacing-1`, la unidad base del
 * sistema. Los dos extremos, en cambio, dependen de la familia —salen de
 * `font-size × line-height`— y acá los produce nuestra tipografía:
 * `--text-cuerpo` (15px) × `--leading-texto` (1,6) = 24px.
 * El instrumento afirma la resta, no los extremos.
 */
export const CRECIMIENTO_VENTANA_PX =
  ROLLOVER_MEDIDO.ventana.altoHoverPx - ROLLOVER_MEDIDO.ventana.altoReposoPx

/** Las dos variantes medidas: `inline-block` (17 ejemplares) y `block` (9). */
export const VARIANTES_CTA = ['linea', 'bloque'] as const
export type VarianteCta = (typeof VARIANTES_CTA)[number]

/** El rótulo de demostración. Tres palabras, como el caso que ellos rompen. */
export const ROTULO_DE_MUESTRA = 'Ver el trabajo'

/**
 * La cuenta del rótulo accesible sobre marcado plano.
 *
 * No es un motor de accesibilidad: es la regla que aplica al caso —el texto de
 * un subárbol `aria-hidden="true"` no entra en el nombre accesible— y nada
 * más. Se le da el HTML del componente ya renderizado y devuelve qué leería un
 * lector de pantalla.
 *
 * ⚠ Concatena SIN espacio, que es exactamente el defecto que hay que poder
 * ver: si las dos copias entraran, "…trabajo" y "Ver…" quedarían pegadas y el
 * conteo de palabras daría 5 en vez de 3. Poner un espacio acá escondería el
 * bug que este instrumento existe para encontrar.
 */
export function rotuloAccesible(html: string): string {
  const sinOcultos = quitarSubarbolesOcultos(html)
  return sinOcultos
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/** Cuenta de palabras del rótulo accesible, con la separación real. */
export function palabrasDelRotulo(html: string): number {
  const texto = rotuloAccesible(html)
  return texto.length === 0 ? 0 : texto.split(/\s+/).length
}

/**
 * Borra los elementos con `aria-hidden="true"` y su contenido.
 *
 * Recorre las etiquetas contando profundidad en vez de usar una expresión
 * regular con `[\s\S]*?`: el subárbol oculto tiene hijos y una regla perezosa
 * cortaría en el primer `</span>`, que es el del hijo. El error sería silencioso
 * y daría un rótulo correcto por accidente.
 */
function quitarSubarbolesOcultos(html: string): string {
  const etiqueta = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g
  let salida = ''
  let profundidadOculta = 0
  let etiquetaOculta = ''
  let ultimo = 0
  let m: RegExpExecArray | null

  while ((m = etiqueta.exec(html)) !== null) {
    const [entera, cierre, nombre, atributos, autocierre] = m
    if (profundidadOculta === 0) salida += html.slice(ultimo, m.index)
    ultimo = m.index + entera.length

    const esCierre = cierre === '/'
    const esVacia = autocierre === '/'

    if (profundidadOculta > 0) {
      if (nombre === etiquetaOculta && !esVacia) profundidadOculta += esCierre ? -1 : 1
      continue
    }
    if (!esCierre && !esVacia && /aria-hidden\s*=\s*["']true["']/.test(atributos)) {
      profundidadOculta = 1
      etiquetaOculta = nombre
      continue
    }
    if (!esCierre && esVacia && /aria-hidden\s*=\s*["']true["']/.test(atributos)) continue
    salida += entera
  }
  if (profundidadOculta === 0) salida += html.slice(ultimo)
  return salida
}
