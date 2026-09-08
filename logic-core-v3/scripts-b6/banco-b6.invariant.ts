/**
 * INVARIANTE DEL BANCO DE B6-A — los instrumentos, no el sitio.
 *
 *     npx tsx scripts-b6/banco-b6.invariant.ts
 *
 * No abre el navegador. Afirma sobre lo que `glifo-alfa.ts` calcula a partir
 * de imágenes fabricadas, porque la regla del bloque es «ninguna comprobación
 * verde por vacío ni por arnés», y un instrumento nuevo que compone la tinta
 * con opacidad puede devolver un número plausible y equivocado sin que nadie
 * lo note — todas las cifras de la PARADA 1 pasan por él.
 *
 * Lo que se controla, y contra qué:
 *
 *   1. Con opacidad 1, `contrasteBajoElGlifoConOpacidad` da **número por
 *      número** lo mismo que `contrasteBajoElGlifo` de B5 sobre las mismas
 *      capturas. Es el control de que la generalización no cambió la cifra que
 *      B5 publicó.
 *   2. Con opacidad 0,6 sobre el velo compuesto en blanco reproduce el 2,80:1
 *      que `superficies.invariant` §3b calcula desde los tokens: dos
 *      instrumentos, una cifra.
 *   3. La varianza de un fondo plano es cero y la de un degradé no; y
 *      «varianza que pasa» de un panel opaco sobre un degradé es cero. Es el
 *      control positivo de la medición central del bloque.
 *   4. La fracción sobre la silueta es lo que dice ser.
 *
 * ⚠️ No está en `npm run verificar` a propósito, como `scripts-b4/banco.invariant.ts`:
 * el banco se corre a mano y su salida va al reporte.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../src/app/v3/_lib/__tests__/afirmar'
import { codificarPngRgba } from '../scripts-b4/png'
import { contrasteBajoElGlifo } from '../scripts-b5/glifo'
import { leerImagen } from '../scripts-b5/silueta'

import { TEMP } from './b6-comun'
import {
  UMBRAL_DE_GLIFO,
  contrasteBajoElGlifoConOpacidad,
  estadisticaDeLuminancia,
  fraccionSobreLaSilueta,
  mascaraDeGlifo,
  unionDeMascaras,
  type Imagen,
} from './glifo-alfa'

const ANCHO = 40
const ALTO = 20

/** Una imagen RGBA plana de un color, con un rectángulo de otro color. */
function fabricar(fondo: readonly number[], rect?: { x0: number; y0: number; x1: number; y1: number; color: readonly number[] }): Uint8Array {
  const datos = new Uint8Array(ANCHO * ALTO * 4)
  for (let y = 0; y < ALTO; y += 1) {
    for (let x = 0; x < ANCHO; x += 1) {
      const dentro = rect !== undefined && x >= rect.x0 && x < rect.x1 && y >= rect.y0 && y < rect.y1
      const c = dentro && rect !== undefined ? rect.color : fondo
      const k = (y * ANCHO + x) * 4
      datos[k] = c[0]
      datos[k + 1] = c[1]
      datos[k + 2] = c[2]
      datos[k + 3] = 255
    }
  }
  return datos
}

function degrade(): Uint8Array {
  const datos = new Uint8Array(ANCHO * ALTO * 4)
  for (let y = 0; y < ALTO; y += 1) {
    for (let x = 0; x < ANCHO; x += 1) {
      const v = Math.round((255 * x) / (ANCHO - 1))
      const k = (y * ANCHO + x) * 4
      datos[k] = v
      datos[k + 1] = v
      datos[k + 2] = v
      datos[k + 3] = 255
    }
  }
  return datos
}

const comoImagen = (datos: Uint8Array): Imagen => ({ datos, ancho: ANCHO, alto: ALTO })

mkdirSync(TEMP, { recursive: true })
const escribir = (nombre: string, datos: Uint8Array): string => {
  const ruta = `${TEMP}/banco-${nombre}.png`
  writeFileSync(ruta, codificarPngRgba(ANCHO, ALTO, datos))
  return ruta
}

const TINTA = [247, 247, 245] as const
const VELO_SOBRE_BLANCO = [110, 110, 110] as const // #6E6E6E: lo que superficies.invariant §3b compone
const GLIFO = { x0: 10, y0: 5, x1: 20, y1: 15, color: TINTA }
const CAJA = [{ x: 8, y: 3, ancho: 16, alto: 14 }]

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Con opacidad 1, la función nueva ES la de B5 — número por número')

const rutaT = escribir('T', fabricar(VELO_SOBRE_BLANCO, GLIFO))
const rutaA = escribir('A', fabricar(VELO_SOBRE_BLANCO))
const T = leerImagen(rutaT)
const A = leerImagen(rutaA)

const deB5 = contrasteBajoElGlifo(rutaT, rutaA, CAJA, TINTA, false)
const deB6 = contrasteBajoElGlifoConOpacidad(T, A, CAJA, TINTA, 1, false)
afirmarIgual(deB6.pixelesDeGlifo, 100, 'la máscara ve los 100 píxeles del glifo fabricado (10×10)')
afirmarIgual(deB6.pixelesDeGlifo, deB5.pixelesDeGlifo, '  y son los mismos que ve la máscara de B5')
afirmarIgual(deB6.papel, deB5.papel, '  con el mismo papel (la mediana de la caja)')
afirmarIgual(
  [deB6.peorContraste, deB6.p1Contraste, deB6.medianaContraste, deB6.bajoAA, deB6.umbralAA],
  [deB5.peorContraste, deB5.p1Contraste, deB5.medianaContraste, deB5.bajoAA, deB5.umbralAA],
  'peor, p1, mediana, bajoAA y umbral: iguales a los de B5',
)
afirmar(deB6.peorContraste === 4.75 || deB6.peorContraste === 4.76, `tinta plena sobre el velo en blanco: ${deB6.peorContraste}:1 — la cifra de superficies.invariant §3b (4,7536)`)
controlPositivo('la máscara no ve glifo donde no hay', comoImagen(fabricar(VELO_SOBRE_BLANCO)), (plano) => mascaraDeGlifo(plano, CAJA).indices.length > 0)
afirmarIgual(UMBRAL_DE_GLIFO, 24, 'el umbral de glifo es el de B1 y B5')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Con opacidad 0,6 la tinta se compone sobre CADA fondo — y da el 2,80 de los tokens')

const casi = contrasteBajoElGlifoConOpacidad(T, A, CAJA, TINTA, 0.6, false)
afirmarIgual(casi.peorContraste, 2.8, `tinta a 0,6 sobre #6E6E6E: ${casi.peorContraste}:1 — lo que superficies.invariant §3b calcula desde los tokens (2,8004)`)
afirmarIgual(casi.bajoAA, 100, '  y los 100 píxeles quedan bajo AA')
afirmar(casi.peorContraste < deB6.peorContraste, '  la opacidad sólo puede bajar el contraste, nunca subirlo')

// Sobre un fondo que cambia píxel a píxel, la composición es por píxel: el peor
// y la mediana se separan, cosa que con un color fijo no pasa.
const rutaAd = escribir('A-degrade', degrade())
const Ad = leerImagen(rutaAd)
const sobreDegrade = contrasteBajoElGlifoConOpacidad(T, Ad, CAJA, TINTA, 0.6, false)
afirmar(sobreDegrade.peorContraste < sobreDegrade.medianaContraste, 'sobre un degradé, el peor píxel y la mediana difieren', `${sobreDegrade.peorContraste} contra ${sobreDegrade.medianaContraste}`)
controlPositivo('con opacidad 0 la "tinta" es el fondo y el contraste es 1:1 en todos lados', 0, (o) => contrasteBajoElGlifoConOpacidad(T, Ad, CAJA, TINTA, o, false).medianaContraste > 1.01)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La varianza: plano = cero, degradé > 0, y un panel opaco no deja pasar nada')

const region = { x0: 0, y0: 0, x1: ANCHO, y1: ALTO }
const plano = estadisticaDeLuminancia(comoImagen(fabricar([14, 14, 14])), region)
const conDegrade = estadisticaDeLuminancia(comoImagen(degrade()), region)
// ⚠️ Con tolerancia y no con igualdad: la media de n valores iguales sale con un
// error de redondeo de ~1e-17 y el cuadrado deja 5e-34 — ruido numérico del
// doble paso, nueve órdenes debajo de cualquier varianza real de la sala (~1e-3).
const RUIDO_NUMERICO = 1e-12
afirmar(plano.varianza < RUIDO_NUMERICO, 'un fondo plano tiene varianza cero (bajo el ruido numérico)', plano.varianza.toExponential(2))
afirmar(conDegrade.varianza > 0.05, 'un degradé de negro a blanco tiene varianza', conDegrade.varianza.toFixed(4))
afirmar(conDegrade.p01 < 0.05 && conDegrade.p99 > 0.9, '  y sus percentiles 1 y 99 tocan los dos extremos')
const pasaOpaco = plano.varianza / conDegrade.varianza
afirmar(pasaOpaco < RUIDO_NUMERICO, '[control] detrás de un panel OPACO pasa el 0 % de la varianza', pasaOpaco.toExponential(2))
const excluir = unionDeMascaras(ANCHO * ALTO, [mascaraDeGlifo(T, CAJA)])
const sinGlifos = estadisticaDeLuminancia(comoImagen(degrade()), region, excluir)
afirmarIgual(sinGlifos.pixeles, ANCHO * ALTO - 100, 'excluir la máscara saca exactamente los 100 píxeles de glifo de la cuenta')
controlPositivo('la estadística no devuelve varianza para una región vacía', { x0: 5, y0: 5, x1: 5, y1: 5 }, (r) => !Number.isNaN(estadisticaDeLuminancia(comoImagen(degrade()), r).varianza))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La fracción sobre la silueta')

const silueta = new Uint8Array(ANCHO * ALTO)
for (let y = 0; y < ALTO; y += 1) for (let x = 0; x < 15; x += 1) silueta[y * ANCHO + x] = 1 // la mitad izquierda del glifo (x 10–14)
const mascara = mascaraDeGlifo(T, CAJA)
afirmarIgual(fraccionSobreLaSilueta(mascara, silueta), 0.5, 'la mitad de los glifos cae sobre la silueta → 0,5')
afirmarIgual(fraccionSobreLaSilueta(mascara, new Uint8Array(ANCHO * ALTO)), 0, 'sin silueta → 0')
afirmar(Number.isNaN(fraccionSobreLaSilueta({ indices: new Int32Array(0), papel: [0, 0, 0] }, silueta)), 'sin glifos → NaN, no cero: no hay texto que caiga')

cerrar('banco-b6')
