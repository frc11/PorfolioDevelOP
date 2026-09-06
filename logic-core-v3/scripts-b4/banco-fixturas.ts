/**
 * LAS FIXTURAS DEL BANCO — las imágenes construidas contra las que se prueban
 * los instrumentos.
 *
 * Viven aparte del invariante por la razón de siempre en este repo: el archivo
 * cruzaba las 300 líneas. Y por una segunda, que acá importa más: **una fixtura
 * es una afirmación sobre la definición de la métrica, no un dato de prueba.**
 * `degrade()` existe porque la definición de aire muerto de B1 dice, textual,
 * que «un degradé suave **no** tiene contenido: es fondo». Si mañana alguien
 * cambia el detector a una varianza, esa fixtura se pone roja — que es
 * exactamente lo que tiene que pasar.
 */

/** Una imagen RGBA plana, del tamaño pedido, del color pedido. */
export function liso(ancho: number, alto: number, gris: number): Uint8Array {
  const d = new Uint8Array(ancho * alto * 4)
  for (let i = 0; i < ancho * alto; i += 1) {
    d[i * 4] = gris
    d[i * 4 + 1] = gris
    d[i * 4 + 2] = gris
    d[i * 4 + 3] = 255
  }
  return d
}

/**
 * Un degradé HORIZONTAL de negro a blanco, suave: cada columna sube un poco
 * sobre la anterior.
 *
 * ⚠️ **Con `ancho` grande el salto por columna es chico y el degradé es aire;
 * con `ancho` chico el salto es grande y deja de serlo.** El umbral de la
 * definición es 0,02 de luminancia relativa entre vecinos, y la luminancia no es
 * lineal en el byte: cerca del negro, un salto de 1/255 mueve muy poco, y cerca
 * del blanco mueve mucho más. Por eso la fixtura del control usa un ancho
 * generoso — con 1024 columnas el salto más grande queda bien abajo del umbral—
 * y el invariante lo afirma en vez de suponerlo.
 */
export function degrade(ancho: number, alto: number): Uint8Array {
  const d = new Uint8Array(ancho * alto * 4)
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      const v = Math.round((255 * x) / (ancho - 1))
      const k = (y * ancho + x) * 4
      d[k] = v
      d[k + 1] = v
      d[k + 2] = v
      d[k + 3] = 255
    }
  }
  return d
}

/** Rayas verticales de 1 px: bordes horizontales en todas las filas. Es «todo contenido». */
export function rayasVerticales(ancho: number, alto: number): Uint8Array {
  const d = new Uint8Array(ancho * alto * 4)
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      const v = x % 2 === 0 ? 0 : 255
      const k = (y * ancho + x) * 4
      d[k] = v
      d[k + 1] = v
      d[k + 2] = v
      d[k + 3] = 255
    }
  }
  return d
}

/**
 * Una banda horizontal de contenido en el medio de un fondo liso. Sirve para
 * probar la banda vacía continua: con `alto` 100 y una banda de 1 px en `y` 50,
 * la corrida más larga de filas sin contenido son 50 —las de arriba— y no 99.
 */
export function bandaEnElMedio(ancho: number, alto: number, y: number): Uint8Array {
  const d = liso(ancho, alto, 200)
  for (let x = 0; x < ancho; x += 1) {
    const k = (y * ancho + x) * 4
    const v = x % 2 === 0 ? 0 : 255
    d[k] = v
    d[k + 1] = v
    d[k + 2] = v
  }
  return d
}

/** Ruido determinista. Ejercita los cinco filtros del PNG de verdad: un liso los deja a todos en cero. */
export function ruido(ancho: number, alto: number): Uint8Array {
  const d = new Uint8Array(ancho * alto * 4)
  let s = 0x2f6e2b1
  for (let i = 0; i < ancho * alto; i += 1) {
    s = (s * 1664525 + 1013904223) >>> 0
    d[i * 4] = s & 0xff
    d[i * 4 + 1] = (s >>> 8) & 0xff
    d[i * 4 + 2] = (s >>> 16) & 0xff
    d[i * 4 + 3] = 255
  }
  return d
}

/** Una lectura del censo armada a mano, para probar el agrupamiento sin navegador. */
export function lecturaSintetica(
  aterrizajes: readonly (readonly [number, number])[],
  paso: number,
  ventana: number,
): {
  aterrizajes: readonly (readonly [number, number])[]
  montajes: readonly { y: number; alta: number; baja: number }[]
  ventana: number
  paso: number
  desde: number
  hasta: number
  estiloPorParada: readonly number[]
  visibilityState: string
  innerWidth: number
} {
  return {
    aterrizajes,
    montajes: [],
    ventana,
    paso,
    desde: 0,
    hasta: 0,
    estiloPorParada: [],
    visibilityState: 'visible',
    innerWidth: 1920,
  }
}
