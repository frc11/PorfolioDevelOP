/**
 * LOS CUATRO PATRONES DE TIPOGRAFÍA — P1, P2, P3 y P6.
 *
 * Son 233 de las 244 instancias del corpus: el 95 %. La coreografía de la
 * referencia es, casi enteramente, texto entrando.
 *
 * Los tipos y el registro están en `patrones.ts`; acá están los datos.
 */

import { ANCLAS } from './anclas'
import type { Patron } from './patrones'

/**
 * P1 — EL REVELADO LÍNEA POR LÍNEA. 142 instancias, el 58 % del corpus.
 *
 * "Si Valentino reproduce un solo efecto de este sitio, es este." El texto está
 * partido en líneas y cada una arranca desplazada hacia abajo exactamente una
 * altura de sí misma (`yPercent: 120`, no 100: hay un 20 % de margen para que la
 * línea entre del todo tapada) y sube hasta su lugar.
 *
 * El `scale` de 1 a 1 se conserva en `claves` porque es lo que se midió, pero no
 * anima nada: la traducción lo ve en su neutro y no emite `scale()`. SCROLL.md
 * hueco 18 registra que la lectura de "está para forzar una capa de composición"
 * es una inferencia, no una medición. La capa la fuerza acá
 * `will-change: transform`, que es la regla del repo y no una copia de una
 * inferencia.
 */
export const P1: Patron = {
  id: 'P1',
  nombre: 'línea por línea',
  instancias: 142,
  anclas: ANCLAS.P1,
  scrub: 1,
  curva: 'principal',
  duracionDeclarada: 1,
  escalonado: 0.2,
  claves: [
    { clave: 'yPercent', desde: 120, hasta: 0 },
    { clave: 'scale', desde: 1, hasta: 1 },
  ],
  piezas: { min: 1, max: 6, nota: 'entre 1 y 6 líneas por bloque' },
  elementos: 'span (67), p (50), h3 (14), h2 (6), a (4), strong (1) — es tipografía, siempre',
  efecto: 'cada línea sube desde una altura de sí misma, con 0,2 s entre línea y línea',
}

/**
 * P2 — EL MISMO GESTO, PARA BLOQUES ENTEROS. 77 instancias.
 *
 * Idéntico en espíritu a P1 pero sobre un `div` completo: media altura propia,
 * medio segundo, misma curva. **Un solo target por instancia**, con lo cual el
 * escalonado declarado queda inerte —`cantidad − 1 = 0`— y la duración aplicada
 * coincide con la declarada. Es el único patrón donde las dos coinciden.
 */
export const P2: Patron = {
  id: 'P2',
  nombre: 'bloque entero',
  instancias: 77,
  anclas: ANCLAS.P2,
  scrub: true,
  curva: 'principal',
  duracionDeclarada: 0.5,
  escalonado: 0.1,
  claves: [{ clave: 'yPercent', desde: 60, hasta: 0 }],
  piezas: { min: 1, max: 1, nota: 'un solo target por instancia: el escalonado queda inerte' },
  elementos: 'div — en services son 60 de las 77: es cómo entra cada fila de esa página',
  efecto: 'el bloque sube desde media altura propia',
}

/**
 * P3 — EL PÁRRAFO QUE SE ENCIENDE. 11 instancias.
 *
 * El único patrón que nunca mueve nada de lugar: solo brillo. El texto ya está
 * visible en opacidad 0,3 y va pasando a 1 pieza por pieza. Entre 17 y 33
 * targets: es PALABRA por palabra, no línea por línea. La curva es simétrica, así
 * que el encendido no tiene golpe.
 */
export const P3: Patron = {
  id: 'P3',
  nombre: 'palabra por palabra',
  instancias: 11,
  anclas: ANCLAS.P3,
  scrub: 1,
  curva: 'simetrica',
  duracionDeclarada: 0.5,
  escalonado: 0.2,
  claves: [{ clave: 'opacity', desde: 0.3, hasta: 1 }],
  piezas: { min: 17, max: 33, nota: 'palabras, no líneas' },
  elementos: 'p (8 de 11)',
  efecto: 'el texto se enciende palabra por palabra desde gris, sin moverse',
}

/**
 * P6 — EL TEXTO QUE CRUZA. 3 instancias.
 *
 * El único desplazamiento horizontal del corpus. Un `h2` o un `p` viaja de
 * `x: 140` a `x: −140` —280 px de recorrido— mientras se scrollea verticalmente.
 *
 * ⚠ La instrucción dice `x` 280 → 0. SCROLL.md mide 140 → −140: el mismo
 * recorrido de 280 px, pero centrado en el lugar natural del elemento en vez de
 * terminar en él. La diferencia se ve: con 280 → 0 el texto llega y se queda; con
 * 140 → −140 sigue de largo, que es el gesto de "cruzar".
 */
export const P6: Patron = {
  id: 'P6',
  nombre: 'cruce horizontal',
  instancias: 3,
  anclas: ANCLAS.P6,
  scrub: true,
  curva: 'principal',
  duracionDeclarada: 2,
  escalonado: 0,
  claves: [{ clave: 'x', desde: 140, hasta: -140 }],
  piezas: { min: 1, max: 1, nota: 'un h2 o un p' },
  elementos: 'h2, p',
  efecto: 'el texto cruza 280 px en horizontal mientras se scrollea en vertical',
  discrepancia:
    'la instrucción dice x 280 → 0; SCROLL.md §9.7 mide 140 → −140 (mismo recorrido, centrado) y agrega duración 2 s',
}
