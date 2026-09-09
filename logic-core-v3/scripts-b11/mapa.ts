/**
 * EL MAPA DE COBERTURA — dónde estuvo el obstáculo A LO LARGO DEL TRAMO, en las
 * coordenadas del TEXTO.
 *
 * ── El problema que resuelve ───────────────────────────────────────────────
 *
 * El logo vive en un canvas `fixed` y se mueve con la coreografía; el texto
 * vive en el documento y se mueve con el scroll. Preguntar «¿el logo tapa este
 * párrafo?» en UNA pose contesta por un instante. La instrucción pide otra
 * cosa: *el texto tiene que ser legible en todo el recorrido de su sección*.
 * Así que un píxel del documento está TAPADO si, en ALGÚN scroll en el que ese
 * píxel está en cuadro, el obstáculo cae encima suyo.
 *
 * Eso es una unión sobre el scroll, y se calcula así: por cada parada `s` del
 * barrido, la máscara del obstáculo (coordenadas del viewport) se vuelca al
 * documento desplazada `s − topDeLaSección` filas. Lo que queda es un mapa de
 * la SECCIÓN entera —tan alto como ella, no como la ventana— donde cada píxel
 * dice cuántas paradas lo vieron y en cuántas estuvo tapado.
 *
 * Para una sección pinneada el texto NO se mueve con el scroll: el mapa se
 * acumula en coordenadas del viewport (desplazamiento cero), sobre el pin.
 *
 * ── ⚠️ El barrido es discreto y el logo se mueve entre paradas ────────────
 *
 * Con un paso de 1/16 de pantalla, entre dos paradas el logo recorre lo que
 * recorra. Para no publicar una «zona libre» que en realidad se cruzó entre dos
 * fotos, cada máscara se vuelca TRES veces —en su parada y a medio paso hacia
 * cada lado— y el mapa queda conservador: sobreestima la cobertura a lo sumo en
 * medio paso vertical, y nunca la subestima por el muestreo.
 *
 * ── La escala ──────────────────────────────────────────────────────────────
 *
 * Se acumula a 1/4 de resolución (un píxel del mapa son 4×4 del cuadro): un
 * glifo de 15 px sigue teniendo 4 filas de mapa, y un documento de 18 pantallas
 * a 2560 entra en memoria. La reducción es un OR: un píxel del mapa está tapado
 * si CUALQUIERA de sus 16 lo está.
 *
 * Nada de acá abre el navegador. Es aritmética sobre máscaras.
 */

import { codificarPngRgba } from '../scripts-b4/png'

export const ESCALA = 4

export interface MascaraReducida {
  readonly ancho: number
  readonly alto: number
  /** 1 = obstáculo. */
  readonly datos: Uint8Array
}

/** Reduce una máscara de un byte por píxel a `ESCALA` con un OR por bloque. */
export function reducir(dentro: Uint8Array, ancho: number, alto: number, escala = ESCALA): MascaraReducida {
  const a = Math.ceil(ancho / escala)
  const h = Math.ceil(alto / escala)
  const datos = new Uint8Array(a * h)
  for (let y = 0; y < alto; y += 1) {
    const fila = y * ancho
    const filaRed = Math.floor(y / escala) * a
    for (let x = 0; x < ancho; x += 1) {
      if (dentro[fila + x] === 1) datos[filaRed + Math.floor(x / escala)] = 1
    }
  }
  return { ancho: a, alto: h, datos }
}

export interface MapaDeCobertura {
  readonly ancho: number
  readonly alto: number
  readonly escala: number
  /** En cuántas paradas el píxel estuvo TAPADO. */
  readonly tapado: Uint16Array
  /** En cuántas paradas el píxel estuvo EN CUADRO (tapado o no). */
  readonly visto: Uint16Array
  paradas: number
}

export function crearMapa(anchoPx: number, altoPx: number, escala = ESCALA): MapaDeCobertura {
  const ancho = Math.ceil(anchoPx / escala)
  const alto = Math.ceil(altoPx / escala)
  return { ancho, alto, escala, tapado: new Uint16Array(ancho * alto), visto: new Uint16Array(ancho * alto), paradas: 0 }
}

/**
 * Vuelca una máscara del viewport al mapa, con el borde de arriba del viewport
 * `desplazamientoPx` píxeles por debajo del borde de arriba del mapa (positivo
 * = el viewport está más abajo). `medioPasoPx` es la mitad del paso del
 * barrido: la máscara se vuelca también a ±medioPaso (ver el docblock).
 */
export function acumular(mapa: MapaDeCobertura, mascara: MascaraReducida, desplazamientoPx: number, medioPasoPx: number): void {
  if (mascara.ancho !== mapa.ancho) throw new Error(`la máscara mide ${mascara.ancho} columnas y el mapa ${mapa.ancho}`)
  const desplazamientos = medioPasoPx > 0 ? [-medioPasoPx, 0, medioPasoPx] : [0]
  const vistoAhora = new Uint8Array(mapa.ancho * mapa.alto)
  const tapadoAhora = new Uint8Array(mapa.ancho * mapa.alto)
  for (const d of desplazamientos) {
    const filas = Math.round((desplazamientoPx + d) / mapa.escala)
    for (let yv = 0; yv < mascara.alto; yv += 1) {
      const yd = yv + filas
      if (yd < 0 || yd >= mapa.alto) continue
      const filaV = yv * mascara.ancho
      const filaD = yd * mapa.ancho
      for (let x = 0; x < mapa.ancho; x += 1) {
        vistoAhora[filaD + x] = 1
        if (mascara.datos[filaV + x] === 1) tapadoAhora[filaD + x] = 1
      }
    }
  }
  for (let i = 0; i < vistoAhora.length; i += 1) {
    if (vistoAhora[i] === 1) mapa.visto[i] += 1
    if (tapadoAhora[i] === 1) mapa.tapado[i] += 1
  }
  mapa.paradas += 1
}

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface Cobertura {
  /** Fracción de los píxeles de la caja tapados ALGUNA vez mientras estaban en cuadro. */
  readonly algunaVez: number
  /** Fracción media del tiempo en cuadro que cada píxel pasó tapado. */
  readonly delTiempo: number
  /** Píxeles del mapa que la caja abarca y que alguna parada vio. */
  readonly pixeles: number
}

/** La cobertura de una caja en píxeles del cuadro (coordenadas del mapa: doc o viewport). */
export function coberturaDeCaja(mapa: MapaDeCobertura, caja: Caja): Cobertura {
  const x0 = Math.max(0, Math.floor(caja.x / mapa.escala))
  const y0 = Math.max(0, Math.floor(caja.y / mapa.escala))
  const x1 = Math.min(mapa.ancho, Math.ceil((caja.x + caja.ancho) / mapa.escala))
  const y1 = Math.min(mapa.alto, Math.ceil((caja.y + caja.alto) / mapa.escala))
  let vistos = 0
  let algunaVez = 0
  let tiempo = 0
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = y * mapa.ancho + x
      if (mapa.visto[i] === 0) continue
      vistos += 1
      if (mapa.tapado[i] > 0) algunaVez += 1
      tiempo += mapa.tapado[i] / mapa.visto[i]
    }
  }
  return vistos === 0
    ? { algunaVez: Number.NaN, delTiempo: Number.NaN, pixeles: 0 }
    : { algunaVez: algunaVez / vistos, delTiempo: tiempo / vistos, pixeles: vistos }
}

/**
 * La retícula del reporte: `filas` bandas de alto igual por `columnas` bandas
 * de ancho igual sobre una caja (el viewport, o la caja de contenido), cada
 * celda con su cobertura. Es la tabla que dice DÓNDE puede vivir el texto.
 */
export function reticula(mapa: MapaDeCobertura, caja: Caja, columnas: number, filas: number): Cobertura[][] {
  const salida: Cobertura[][] = []
  for (let f = 0; f < filas; f += 1) {
    const filaDeCeldas: Cobertura[] = []
    for (let c = 0; c < columnas; c += 1) {
      filaDeCeldas.push(
        coberturaDeCaja(mapa, {
          x: caja.x + (caja.ancho * c) / columnas,
          y: caja.y + (caja.alto * f) / filas,
          ancho: caja.ancho / columnas,
          alto: caja.alto / filas,
        }),
      )
    }
    salida.push(filaDeCeldas)
  }
  return salida
}

/** Por columna del mapa: fracción de las filas vistas que estuvieron tapadas alguna vez. */
export function ocupacionPorColumna(mapa: MapaDeCobertura, desdePx = 0, hastaPx = Number.POSITIVE_INFINITY): Float64Array {
  const salida = new Float64Array(mapa.ancho)
  const y0 = Math.max(0, Math.floor(desdePx / mapa.escala))
  const y1 = Math.min(mapa.alto, Math.ceil(hastaPx / mapa.escala))
  for (let x = 0; x < mapa.ancho; x += 1) {
    let vistos = 0
    let tapados = 0
    for (let y = y0; y < y1; y += 1) {
      const i = y * mapa.ancho + x
      if (mapa.visto[i] === 0) continue
      vistos += 1
      if (mapa.tapado[i] > 0) tapados += 1
    }
    salida[x] = vistos === 0 ? Number.NaN : tapados / vistos
  }
  return salida
}

/**
 * El mapa como PNG: gris = cuántas veces tapado sobre cuántas visto (negro =
 * nunca, blanco = siempre); lo nunca visto va en rojo apagado; las cajas que se
 * pasan (los bloques de texto) se dibujan como marco verde. Es la evidencia.
 */
export function renderizar(mapa: MapaDeCobertura, cajas: readonly Caja[] = []): Buffer {
  const datos = new Uint8Array(mapa.ancho * mapa.alto * 4)
  for (let i = 0; i < mapa.ancho * mapa.alto; i += 1) {
    const k = i * 4
    if (mapa.visto[i] === 0) {
      datos[k] = 70
      datos[k + 1] = 20
      datos[k + 2] = 20
    } else {
      const v = Math.round((255 * mapa.tapado[i]) / mapa.visto[i])
      const alguna = mapa.tapado[i] > 0 ? 40 : 0
      datos[k] = Math.max(v, alguna)
      datos[k + 1] = Math.max(v, alguna)
      // Acotado a 255: sin la cota, un píxel tapado siempre desbordaba el canal y salía amarillo.
      datos[k + 2] = Math.min(255, Math.max(v, alguna) + (mapa.tapado[i] > 0 ? 30 : 0))
    }
    datos[k + 3] = 255
  }
  const pinta = (x: number, y: number): void => {
    if (x < 0 || y < 0 || x >= mapa.ancho || y >= mapa.alto) return
    const k = (y * mapa.ancho + x) * 4
    datos[k] = 40
    datos[k + 1] = 220
    datos[k + 2] = 90
  }
  for (const c of cajas) {
    const x0 = Math.floor(c.x / mapa.escala)
    const y0 = Math.floor(c.y / mapa.escala)
    const x1 = Math.ceil((c.x + c.ancho) / mapa.escala) - 1
    const y1 = Math.ceil((c.y + c.alto) / mapa.escala) - 1
    for (let x = x0; x <= x1; x += 1) {
      pinta(x, y0)
      pinta(x, y1)
    }
    for (let y = y0; y <= y1; y += 1) {
      pinta(x0, y)
      pinta(x1, y)
    }
  }
  return codificarPngRgba(mapa.ancho, mapa.alto, datos)
}

/** Formatea una fracción como porcentaje de tres caracteres, o «—» si no hay dato. */
export function pct(v: number): string {
  return Number.isNaN(v) ? '  —' : `${Math.round(v * 100).toString().padStart(3)}`
}

/**
 * El mapa a disco, EXACTO: los dos contadores tal cual. El PNG es para mirar;
 * esto es para que `e-cruce.ts` cruce las cajas de los bloques contra los
 * mismos números que produjeron el PNG, sin re-leer un gris con pérdida.
 */
export function serializarMapa(mapa: MapaDeCobertura): Buffer {
  const cabecera = Buffer.alloc(20)
  cabecera.write('B11M', 0, 'ascii')
  cabecera.writeUInt32LE(mapa.ancho, 4)
  cabecera.writeUInt32LE(mapa.alto, 8)
  cabecera.writeUInt32LE(mapa.escala, 12)
  cabecera.writeUInt32LE(mapa.paradas, 16)
  return Buffer.concat([cabecera, Buffer.from(mapa.tapado.buffer, mapa.tapado.byteOffset, mapa.tapado.byteLength), Buffer.from(mapa.visto.buffer, mapa.visto.byteOffset, mapa.visto.byteLength)])
}

export function deserializarMapa(b: Buffer): MapaDeCobertura {
  if (b.toString('ascii', 0, 4) !== 'B11M') throw new Error('no es un mapa de B11')
  const ancho = b.readUInt32LE(4)
  const alto = b.readUInt32LE(8)
  const escala = b.readUInt32LE(12)
  const paradas = b.readUInt32LE(16)
  const n = ancho * alto
  const tapado = new Uint16Array(n)
  const visto = new Uint16Array(n)
  for (let i = 0; i < n; i += 1) {
    tapado[i] = b.readUInt16LE(20 + i * 2)
    visto[i] = b.readUInt16LE(20 + n * 2 + i * 2)
  }
  return { ancho, alto, escala, tapado, visto, paradas }
}

/**
 * PARTE UNA MÁSCARA POR TAMAÑO DE COMPONENTE — lo estructural contra las motas.
 *
 * Una máscara de «píxeles bajo AA» mezcla dos obstáculos de naturaleza
 * distinta: el logo, su sombra y el atardecer —grandes, deterministas, atados
 * al scroll: el texto SE PUEDE mover fuera de ellos— y las partículas —chicas,
 * flotantes, en cualquier lado: ninguna posición del texto las esquiva—. Una
 * componente conexa (4 vecinos) de área ≤ `areaMaxima` es una mota; el resto es
 * estructura. El umbral es el de `particulas.ts` (400 px), para que la cuenta
 * sea la misma con la que se censaron las de la referencia.
 */
export interface MascaraPartida {
  readonly grandes: Uint8Array
  readonly chicas: Uint8Array
  readonly cantidadDeChicas: number
  readonly areaDeChicas: number
}

export function partirPorTamano(mascara: Uint8Array, ancho: number, alto: number, areaMaxima: number): MascaraPartida {
  const total = ancho * alto
  const grandes = new Uint8Array(total)
  const chicas = new Uint8Array(total)
  const visto = new Uint8Array(total)
  const pila = new Int32Array(total)
  const acumulado = new Int32Array(total)
  let cantidadDeChicas = 0
  let areaDeChicas = 0
  for (let inicio = 0; inicio < total; inicio += 1) {
    if (mascara[inicio] === 0 || visto[inicio] === 1) continue
    let tope = 0
    let n = 0
    pila[tope] = inicio
    tope += 1
    visto[inicio] = 1
    while (tope > 0) {
      tope -= 1
      const k = pila[tope]
      acumulado[n] = k
      n += 1
      const x = k % ancho
      const vecinos = [x > 0 ? k - 1 : -1, x < ancho - 1 ? k + 1 : -1, k >= ancho ? k - ancho : -1, k < total - ancho ? k + ancho : -1]
      for (const v of vecinos) {
        if (v >= 0 && mascara[v] === 1 && visto[v] === 0) {
          visto[v] = 1
          pila[tope] = v
          tope += 1
        }
      }
    }
    const destino = n <= areaMaxima ? chicas : grandes
    for (let i = 0; i < n; i += 1) destino[acumulado[i]] = 1
    if (n <= areaMaxima) {
      cantidadDeChicas += 1
      areaDeChicas += n
    }
  }
  return { grandes, chicas, cantidadDeChicas, areaDeChicas }
}
