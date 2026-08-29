/**
 * LAS SEIS CURVAS DE GSAP — funciones exactas, no aproximaciones.
 *
 * ── Por qué acá y no en `theme-develop.css` ────────────────────────────────
 *
 * Porque son OTRO VOCABULARIO. La referencia mantiene dos sistemas de easing
 * separados y medidos: `cubic-bezier` propios en CSS —que en el repo son
 * `--ease-principal` y `--ease-salida`— y las curvas de la familia `power` en
 * los 278 tweens de JS. **Ninguna de las dos coincide con ninguna de las
 * otras.** SCROLL.md §9.4 y el bloque "CURVAS DE CSS [medido, transferido] —
 * vocabulario 1 de 2" de `theme-develop.css` lo dicen por separado: es
 * decisión, no accidente.
 *
 * Un `--ease-power1-out` en el CSS sería un token muerto que parece vivo: nada
 * de este sistema lee custom properties —`motion/react` recibe una función de
 * JavaScript— y el que lo viera en el tema creería que puede usarlo en una
 * `transition`. Por eso viven acá, tipadas, y el CSS no se toca.
 *
 * ── La nomenclatura de GSAP, que es una trampa de lectura ──────────────────
 *
 * `powerN` es de grado **N + 1**, no de grado N:
 *
 *     power1 → cuadrática (²)     power2 → cúbica (³)
 *     power3 → cuártica (⁴)       power4 → quíntica (⁵)
 *
 * SCROLL.md lo dice dos veces y de dos formas: "En la nomenclatura de GSAP
 * `power1` es la cuadrática" (§9.4) y, de P4, "`power4.out`: una quíntica de
 * salida, la curva más frenada de todo el sitio" (§9.7).
 *
 * ⚠ La instrucción del sprint escribe `power4.out` como `1 − (1−t)⁴`. Eso es
 * una **cuártica**, que en la nomenclatura de GSAP es `power3.out`, no
 * `power4.out`. Gana SCROLL.md —es la regla declarada del propio sprint— y acá
 * `salida-fuerte` es `1 − (1−t)⁵`. La diferencia no es cosmética: en t=0,5 la
 * cuártica va 0,9375 y la quíntica 0,96875, y el frenado final es el rasgo por
 * el que ese patrón se eligió. Queda reportado.
 *
 * ── Las fórmulas son las de la implementación, no una lectura ──────────────
 *
 * GSAP construye la familia entera con tres expresiones y un exponente:
 *
 *     in    →  t^n
 *     out   →  1 − (1−t)^n
 *     inOut →  t < 0,5 ? (2t)^n / 2 : 1 − (2(1−t))^n / 2
 *
 * Acá están escritas así, con el exponente como dato. Escribir seis funciones
 * sueltas invitaría a que una se desviara de la familia sin que se note.
 */

/** Los seis nombres del vocabulario. No hay un séptimo. */
export type NombreDeCurva =
  | 'principal'
  | 'entrada'
  | 'simetrica'
  | 'salida-fuerte'
  | 'lineal'
  | 'simetrica-suave'

/**
 * Una curva es una función de progreso a progreso. Es exactamente lo que
 * `motion/react` acepta en `transition.ease` y en `useTransform(..., { ease })`,
 * así que no hay que traducirla a nada.
 *
 * Dominio: `[0, 1]`. Quien la llama ya viene con el progreso acotado —el motor
 * de progreso acota antes de curvar— y la función no vuelve a acotar para que
 * un error de acotado se vea en vez de esconderse.
 */
export type Curva = (t: number) => number

/**
 * El grado de cada familia `powerN` de GSAP. Es la tabla que evita el error de
 * leer el número del nombre como si fuera el exponente.
 */
export const GRADO_DE_POTENCIA = {
  power1: 2,
  power2: 3,
  power3: 4,
  power4: 5,
} as const

export type FamiliaDePotencia = keyof typeof GRADO_DE_POTENCIA

const entradaDePotencia =
  (grado: number): Curva =>
  (t) =>
    Math.pow(t, grado)

const salidaDePotencia =
  (grado: number): Curva =>
  (t) =>
    1 - Math.pow(1 - t, grado)

const simetricaDePotencia =
  (grado: number): Curva =>
  (t) =>
    t < 0.5 ? Math.pow(t * 2, grado) / 2 : 1 - Math.pow((1 - t) * 2, grado) / 2

/** La identidad. En GSAP se llama `none`, y `linear` es el MISMO objeto. */
const lineal: Curva = (t) => t

/**
 * Las seis, por nombre del sistema.
 *
 * Los nombres son de develOP y no de GSAP a propósito: el sistema no depende de
 * GSAP y no debería hablar su idioma en los llamados. La correspondencia está
 * en `NOMBRE_EN_GSAP`, que es lo que hace auditable la reconstrucción.
 */
export const CURVAS: Readonly<Record<NombreDeCurva, Curva>> = {
  /** `power1.out` — el 84,5 % de los tweens de la referencia. 1 − (1−t)². */
  principal: salidaDePotencia(GRADO_DE_POTENCIA.power1),
  /** `power1.in` — 8,6 %. t². Sale de las salidas de la secuencia 3D (P7). */
  entrada: entradaDePotencia(GRADO_DE_POTENCIA.power1),
  /** `power1.inOut` — 4,0 %. El encendido palabra por palabra (P3). */
  simetrica: simetricaDePotencia(GRADO_DE_POTENCIA.power1),
  /** `power4.out` — 1,4 %. QUÍNTICA: 1 − (1−t)⁵. La más frenada (P4). */
  'salida-fuerte': salidaDePotencia(GRADO_DE_POTENCIA.power4),
  /** `none` — 1,1 %. La aparición a velocidad constante (P5). */
  lineal,
  /** `power2.inOut` — 0,4 %. Un solo uso en toda la referencia (P9). */
  'simetrica-suave': simetricaDePotencia(GRADO_DE_POTENCIA.power2),
}

/**
 * El nombre de GSAP de cada curva. No es decoración: es la columna con la que
 * un lector cruza este archivo contra la tabla de SCROLL.md §9.4 sin tener que
 * confiar en que los nombres de acá signifiquen lo mismo.
 */
export const NOMBRE_EN_GSAP: Readonly<Record<NombreDeCurva, string>> = {
  principal: 'power1.out',
  entrada: 'power1.in',
  simetrica: 'power1.inOut',
  'salida-fuerte': 'power4.out',
  lineal: 'none',
  'simetrica-suave': 'power2.inOut',
}

/**
 * Cuántos tweens autorales usa cada curva en la referencia, sobre 278.
 * SCROLL.md §9.4. Está acá porque es lo que justifica que la lista tenga
 * exactamente estos seis nombres y no otros.
 */
export const TWEENS_EN_LA_REFERENCIA: Readonly<Record<NombreDeCurva, number>> = {
  principal: 235,
  entrada: 24,
  simetrica: 11,
  'salida-fuerte': 4,
  lineal: 3,
  'simetrica-suave': 1,
}

/** Los seis nombres, en orden de uso descendente. Para las perillas del demo. */
export const NOMBRES_DE_CURVA: readonly NombreDeCurva[] = [
  'principal',
  'entrada',
  'simetrica',
  'salida-fuerte',
  'lineal',
  'simetrica-suave',
]

/**
 * `sine.inOut`, que NO es del vocabulario y por eso no está en `CURVAS`.
 *
 * Existe por una sola razón: SCROLL.md §9.2 publica un número medido —"el par
 * de curvas distintas más parecido del catálogo es `power1.inOut` contra
 * `sine.inOut`, a 0,028"— y ese número es un control externo de que nuestra
 * `simetrica` es la curva que dice ser. Si la implementáramos mal, la distancia
 * contra `sine.inOut` no daría 0,028.
 *
 * Es la única curva de este archivo que no puede usar un patrón, y el
 * invariante lo afirma.
 */
export const SINE_IN_OUT_PARA_CONTROL: Curva = (t) => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * El criterio de coincidencia que declaró la medición: error máximo absoluto
 * por punto ≤ 0,001 sobre 21 puntos (t de 0 a 1 en pasos de 0,05).
 * SCROLL.md §9.2. Se usa el mismo y no otro.
 */
export const TOLERANCIA_DE_CURVA = 0.001

/** Los 21 puntos del criterio: 0, 0,05, … 1. */
export const PUNTOS_DE_MUESTREO: readonly number[] = Array.from(
  { length: 21 },
  (_, i) => i / 20,
)

/** Error máximo absoluto entre dos curvas sobre los 21 puntos del criterio. */
export function errorMaximo(a: Curva, b: Curva): number {
  let peor = 0
  for (const t of PUNTOS_DE_MUESTREO) {
    const d = Math.abs(a(t) - b(t))
    if (d > peor) peor = d
  }
  return peor
}
