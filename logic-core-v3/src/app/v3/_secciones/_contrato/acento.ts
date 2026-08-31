/**
 * EL ACENTO CONTEXTUAL — entra por `data-servicio`, se consume por ALIAS.
 *
 * ── El mecanismo, y por qué no se escribe el color ────────────────────────
 *
 * `theme-develop.css` declara tres reglas fuera de `@theme`:
 *
 *     [data-servicio="web"]              { --color-acento: … }
 *     [data-servicio="ia-automatizacion"]{ --color-acento: … }
 *     [data-servicio="software"]         { --color-acento: … }
 *
 * Poner el atributo en un ancestro **retiñe** todo lo que consuma
 * `--color-acento`, sin una sola clase condicional. Ése es el mecanismo central
 * de la paleta, y depende de `@theme static`: con `@theme inline` el valor queda
 * incrustado en la utilidad y el override NO llega. Está medido dos veces —S0 y
 * S1— y por eso este archivo no escribe ni un color.
 *
 * **La regla operativa, en una línea: se consume `--color-acento` (el alias) y
 * nunca `--color-acento-<servicio>` ni su valor concreto.** Escribir el valor
 * concreto funciona en la pantalla y rompe el mecanismo: ese elemento deja de
 * retiñirse con el contexto y nadie se entera hasta que alguien cambia de
 * servicio y ve un color que no corresponde.
 *
 * ── Un acento por contexto, nunca los tres ────────────────────────────────
 *
 * Es regla cerrada de la paleta. Se cumple con una propiedad estructural, que
 * es lo único que un instrumento puede verificar:
 *
 *   · **con coreografía** — existe EXACTAMENTE UN `[data-servicio]` en la
 *     sección, y su valor lo decide el tramo activo de la secuencia;
 *   · **sin coreografía** (abajo de 1025 o con movimiento reducido) — hay uno
 *     por servicio, HERMANOS y nunca anidados, y cada bloque ocupa al menos una
 *     pantalla, así que nunca hay dos en el mismo cuadro.
 *
 * La segunda mitad es una lectura declarada: "una pantalla por bloque" es
 * verificable en el marcado; "nunca dos en el mismo cuadro" es lo que eso
 * implica en una ventana. Queda dicho como implicación, no como medición.
 *
 * ── Sobre fondo oscuro el acento no puede ser TEXTO ───────────────────────
 *
 * `[medido]` en `theme-develop.css`: sobre `#0E0E0E` los tres acentos dan
 * 2,71 · 2,99 · 2,46. No sólo fallan AA como texto (4,5:1) — tampoco llegan a
 * 3:1, el mínimo de un componente de interfaz. Ahí el acento va como RELLENO o
 * como SUBRAYADO, y nunca como único indicador de un límite.
 */

/** Los tres servicios. El `id` ES el valor del atributo `data-servicio`. */
export type IdDeServicio = 'web' | 'ia-automatizacion' | 'software'

export const IDS_DE_SERVICIO: readonly IdDeServicio[] = ['web', 'ia-automatizacion', 'software']

/** El atributo por el que entra el acento. Una sola fuente para el nombre. */
export const ATRIBUTO_DE_SERVICIO = 'data-servicio'

/**
 * El token que TODO consume. No hay ningún otro nombre de acento en este lane.
 *
 * Los tres tokens por servicio existen en el tema y se derivan de los ids
 * (`--color-acento-<id>`), pero **este lane no los nombra**: nombrarlos es el
 * primer paso para usarlos.
 */
export const ALIAS_DE_ACENTO = '--color-acento'

/**
 * Las utilidades de Tailwind que resuelven el alias. Están escritas enteras y
 * literales porque Tailwind escanea el código fuente: una clase armada como
 * `${prefijo}-acento` no la ve nadie y su regla no se emite nunca.
 */
export const CLASES_DE_ACENTO = {
  /** RELLENO. Es la forma que funciona en los dos temas. */
  relleno: 'bg-acento',
  /** TEXTO. Sólo sobre superficie clara. Prohibido en la sección invertida. */
  texto: 'text-acento',
  /** BORDE. Decorativo: no puede ser el único indicador de un límite. */
  borde: 'border-acento',
} as const

/**
 * Sobre la sección invertida sólo estas formas son legítimas. La lista es la
 * regla del tema, escrita como dato para que el instrumento la recorra.
 */
export const FORMAS_PERMITIDAS_SOBRE_OSCURO: readonly string[] = [
  CLASES_DE_ACENTO.relleno,
]

/**
 * La superficie sobre la que el acento entra como relleno: encima va el papel,
 * que da 6,65 · 6,02 · 7,31 contra los tres — los tres pasan AA. El token de la
 * tinta invertida ES el papel, así que la clase es la del sistema y no un color.
 */
export const CLASE_TINTA_SOBRE_ACENTO = 'text-fondo'

export interface Servicio {
  readonly id: IdDeServicio
  /** El nombre visible. Es contenido, y es el nombre real del servicio. */
  readonly nombre: string
}

/**
 * Los tres, en el orden en que los nombra la instrucción.
 *
 * Los nombres NO son relleno: son los tres frentes que develOP ya vende, y
 * están escritos igual que en `theme-develop.css`. No llevan marcador porque no
 * son un dato inventado.
 */
export const SERVICIOS: readonly Servicio[] = [
  { id: 'web', nombre: 'Desarrollo web' },
  { id: 'ia-automatizacion', nombre: 'IA y automatización' },
  { id: 'software', nombre: 'Software a medida' },
]

export function servicioDe(id: IdDeServicio): Servicio {
  const encontrado = SERVICIOS.find((s) => s.id === id)
  if (encontrado === undefined) throw new Error(`secciones-b: servicio desconocido "${id}"`)
  return encontrado
}
