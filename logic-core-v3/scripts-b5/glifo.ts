import { decodificarPng } from '../scripts-b4/png'
import { AA_TEXTO_GRANDE, AA_TEXTO_NORMAL, contraste, luminancia } from '../scripts-b4/color'

import { readFileSync } from 'node:fs'

/**
 * EL CONTRASTE BAJO EL GLIFO — el método de `B1-DELTAS.md` §4-bis, ejecutable.
 *
 * ── Por qué se reescribe acá ──────────────────────────────────────────────
 *
 * Porque no existía en el repo. B1 lo corrió con `contraste-glifo2.js` **en el
 * scratchpad de aquella corrida**, y el scratchpad no se commitea: la cifra que
 * el proyecto cita —10,45:1 bajo el glifo contra 3,04:1 sobre la caja del
 * renglón— quedó publicada sin el instrumento que la produce. B5 la necesita
 * otra vez, y esta vez con un eje nuevo (la posición del puntero), así que se
 * escribe donde se pueda volver a correr.
 *
 * ── El problema que resuelve ──────────────────────────────────────────────
 *
 * La caja de un renglón es casi todo fondo. Sobre un fondo plano da igual;
 * **sobre la escena 3D no**, porque la sala tiene partículas oscuras sueltas por
 * toda la pantalla y un punto de 3 px que cae entre dos letras hunde el «peor
 * píxel» a 1,0:1 sin volver ilegible nada.
 *
 * ── ⚠️ B5 CAMBIÓ DE DÓNDE SALE LA MÁSCARA, Y ES UNA CORRECCIÓN MEDIDA ─────
 *
 * B1 sacaba la máscara de glifo **diferenciando píxeles**: tres capturas —fondo,
 * fondo otra vez, y con texto— y un píxel era glifo si `|C − A| > 24` con
 * `|B − A| ≤ 10`, donde la segunda condición descartaba lo que se había movido
 * entre los dos cuadros de fondo.
 *
 * **Con la escena de B3 en adelante esa máscara ya no cierra.** Medido sobre el
 * titular del hero, que B1 publicó en **10,45:1 con CERO píxeles bajo AA**: el
 * mismo método da hoy **1,01:1 con 296 píxeles bajo AA**, y los culpables no son
 * glifos — son **bordes de la sombra de la celosía moviéndose despacio**. En el
 * píxel (611, 309): `A = rgb(88,88,85)`, `B = rgb(88,88,85)` —idénticos, así que
 * el filtro de movimiento los deja pasar— y `C = rgb(234,234,231)`. Un borde que
 * se mueve **entre** el cuadro de fondo y el de texto entra como si fuera tinta,
 * y arrastra consigo un fondo casi negro que no está debajo de ninguna letra.
 * Sandwichear el cuadro de texto entre los dos de fondo lo baja de 296 a 104,
 * pero no lo cierra: la escena se mueve siempre.
 *
 * **La salida no es un filtro más fino: es una máscara que no dependa de la
 * escena.** Tres capturas, con otro reparto:
 *
 *   **T** — el texto sobre el papel, con **la ESCENA en `visibility: hidden`**.
 *           De acá sale la máscara, y es exacta: el fondo es plano, así que todo
 *           lo que difiere del papel es tinta y nada más.
 *   **A** — el fondo, con el TEXTO en `visibility: hidden`. De acá sale la
 *           luminancia contra la que se mide.
 *   **C** — lo que el visitante ve. No entra en el contraste; es la captura con
 *           la que se mide el paralaje, para que las dos cifras del bloque
 *           salgan del mismo estado.
 *
 * Y con la máscara exacta **el filtro de movimiento sobra y se saca**: existía
 * para tapar el error de la máscara vieja. Sin él, el peor píxel vuelve a ser lo
 * que dice ser — el fondo real debajo de una letra real, en ese instante.
 *
 * ⚠️ Se sigue acotando a la caja del texto medida en el DOM, con el borde
 * derecho REAL: más allá de ahí no hay glifos.
 *
 * ⚠️ **Y la caja es UNA POR ELEMENTO, no la unión.** El cuerpo del diferencial
 * son cuatro párrafos separados por aire y por una tarjeta; con la unión, la
 * mediana del papel cae entre dos superficies distintas y **el 48 % de la caja
 * pasa por glifo** — medido: 46.864 píxeles «de glifo» para cuatro párrafos de
 * 15 px, con mediana de contraste 1,00:1. Por elemento, cada papel es el suyo.
 */

export interface CajaDeTexto {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface LecturaDeGlifo {
  /** Píxeles clasificados como glifo dentro de la caja. */
  readonly pixelesDeGlifo: number
  /** El color del papel que la máscara midió. Publicado para poder desconfiar de él. */
  readonly papel: readonly [number, number, number]
  /** El peor contraste bajo el glifo. Es la cifra que decide. */
  readonly peorContraste: number
  /** El percentil 1: cuánto de ese peor es un píxel solo. */
  readonly p1Contraste: number
  readonly medianaContraste: number
  /** Cuántos píxeles de glifo caen por debajo del piso de AA que se pidió. */
  readonly bajoAA: number
  readonly umbralAA: number
}

const UMBRAL_DE_GLIFO = 24

function leerRgba(ruta: string): { datos: Uint8Array; ancho: number; alto: number } {
  const img = decodificarPng(readFileSync(ruta))
  return { datos: img.datos, ancho: img.ancho, alto: img.alto }
}

/**
 * `tintaRgb` es el color del texto leído del DOM, no un token: lo que se compara
 * contra el fondo es lo que el navegador pinta.
 */
export function contrasteBajoElGlifo(
  rutaMascara: string,
  rutaFondo: string,
  cajas: readonly CajaDeTexto[],
  tintaRgb: readonly [number, number, number],
  textoGrande: boolean,
): LecturaDeGlifo {
  const T = leerRgba(rutaMascara)
  const A = leerRgba(rutaFondo)
  if (T.ancho !== A.ancho || T.alto !== A.alto) {
    throw new Error('la mascara y el fondo no tienen el mismo tamano')
  }
  const lumTinta = luminancia(tintaRgb[0], tintaRgb[1], tintaRgb[2])
  const mediana = (v: number[]): number => {
    v.sort((a, b) => a - b)
    return v[Math.floor(v.length / 2)]
  }
  const razones: number[] = []
  const papeles: [number, number, number][] = []

  for (const caja of cajas) {
    const x0 = Math.max(0, Math.floor(caja.x))
    const y0 = Math.max(0, Math.floor(caja.y))
    const x1 = Math.min(T.ancho, Math.ceil(caja.x + caja.ancho))
    const y1 = Math.min(T.alto, Math.ceil(caja.y + caja.alto))
    if (x1 <= x0 || y1 <= y0) continue

    // El papel: la MEDIANA de la mascara dentro de ESTA caja. Una caja de texto
    // es casi todo fondo plano, asi que la mediana ES el papel; no se lee de un
    // token, porque lo que importa es lo que el navegador pinto.
    const muestras: number[][] = [[], [], []]
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const k = (y * T.ancho + x) * 4
        muestras[0].push(T.datos[k])
        muestras[1].push(T.datos[k + 1])
        muestras[2].push(T.datos[k + 2])
      }
    }
    const papel: [number, number, number] = [mediana(muestras[0]), mediana(muestras[1]), mediana(muestras[2])]
    papeles.push(papel)

    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const k = (y * T.ancho + x) * 4
        const dT = Math.max(
          Math.abs(T.datos[k] - papel[0]),
          Math.abs(T.datos[k + 1] - papel[1]),
          Math.abs(T.datos[k + 2] - papel[2]),
        )
        if (dT <= UMBRAL_DE_GLIFO) continue
        razones.push(contraste(lumTinta, luminancia(A.datos[k], A.datos[k + 1], A.datos[k + 2])))
      }
    }
  }
  const papel = papeles[0] ?? ([0, 0, 0] as [number, number, number])
  razones.sort((a, b) => a - b)
  const umbral = textoGrande ? AA_TEXTO_GRANDE : AA_TEXTO_NORMAL
  const en = (q: number): number =>
    razones.length === 0 ? Number.NaN : razones[Math.min(razones.length - 1, Math.floor(q * razones.length))]
  return {
    pixelesDeGlifo: razones.length,
    papel,
    peorContraste: razones.length === 0 ? Number.NaN : Math.round(razones[0] * 100) / 100,
    p1Contraste: Math.round(en(0.01) * 100) / 100,
    medianaContraste: Math.round(en(0.5) * 100) / 100,
    bajoAA: razones.filter((r) => r < umbral).length,
    umbralAA: umbral,
  }
}

/**
 * EL CORRIMIENTO HORIZONTAL entre dos capturas, por correlación de perfiles de
 * columna sobre una banda de filas.
 *
 * Es la misma forma con la que se midió el paralaje de la referencia, y por eso
 * se escribe una vez acá: dos instrumentos que midan «cuánto se corrió» con
 * criterios distintos producen dos números que no se pueden comparar.
 *
 * ⚠️ Devuelve además `saturado`: si el mínimo cae en el borde del rango de
 * búsqueda, el corrimiento real es **al menos** ese, y decir el número pelado
 * sería decir menos de lo que se sabe.
 */
export function corrimientoHorizontal(
  rutaA: string,
  rutaB: string,
  banda: { readonly desde: number; readonly hasta: number },
  rango = 160,
): { px: number; saturado: boolean; ssdMin: number; ssdEnCero: number } {
  const A = leerRgba(rutaA)
  const B = leerRgba(rutaB)
  const perfil = (img: { datos: Uint8Array; ancho: number }): Float64Array => {
    const p = new Float64Array(img.ancho)
    for (let x = 0; x < img.ancho; x += 1) {
      let s = 0
      for (let y = banda.desde; y < banda.hasta; y += 1) {
        const k = (y * img.ancho + x) * 4
        s += luminancia(img.datos[k], img.datos[k + 1], img.datos[k + 2])
      }
      p[x] = s / (banda.hasta - banda.desde)
    }
    return p
  }
  const pa = perfil(A)
  const pb = perfil(B)
  let mejor = 0
  let best = Infinity
  let enCero = 0
  for (let d = -rango; d <= rango; d += 1) {
    let ssd = 0
    let n = 0
    for (let x = rango; x < pa.length - rango; x += 1) {
      const v = pa[x] - pb[x + d]
      ssd += v * v
      n += 1
    }
    ssd /= n
    if (d === 0) enCero = ssd
    if (ssd < best) {
      best = ssd
      mejor = d
    }
  }
  return {
    px: mejor,
    saturado: Math.abs(mejor) === rango,
    ssdMin: Math.round(best * 100) / 100,
    ssdEnCero: Math.round(enCero * 100) / 100,
  }
}
