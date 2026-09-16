/**
 * LA MÁSCARA DEL LOGO, PEDIDA AL INSTRUMENTO ANALÍTICO — y por qué NO sale de la
 * captura.
 *
 * ── ⚠️ EL DEFECTO QUE OBLIGÓ A ESCRIBIR ESTE ARCHIVO ──────────────────────
 *
 * `mascaras.ts` separa la masa negra del logo por LUMINANCIA, y eso funciona
 * mientras la sala esté clara. **No lo está en todo el recorrido**: el arco de
 * luz baja a noche en Trabajos (`s20-arco`), así que a mitad del scroll el cuadro
 * ENTERO cae debajo del umbral. El primer barrido publicó por eso
 * **«trabajos 100 %» y «servicios 100 %»**: cien por ciento de la tinta sobre
 * «masa negra» que no era el logo sino la noche. Y en Trabajos hay una segunda
 * vuelta de tuerca: es la sección INVERTIDA —su tinta es el papel— así que ahí
 * el texto claro sobre sala oscura es exactamente lo que se quiere, y un
 * instrumento que lo reporta como el peor caso está midiendo al revés.
 *
 * La salida es la división de trabajo que este repo ya tiene escrita: **la
 * escena se mide analíticamente y el texto se mide en el navegador**. El
 * muestreador marcha rayos contra la silueta real del logo, así que sabe
 * distinguir «acá hay logo» de «acá está oscuro» — que es justamente lo que una
 * foto no puede.
 *
 * ── LA CORRESPONDENCIA ES EXACTA, no un remuestreo ────────────────────────
 *
 * Se muestrea con `columnas = ancho` y `filas = alto` y `factor = 1`, o sea una
 * celda por píxel de CSS. Con `deviceScaleFactor` 1 esa celda y el píxel del PNG
 * son el mismo, así que no hay ninguna interpolación de la que haya que
 * desconfiar. El eje vertical se da vuelta porque el cuadro tiene +1 arriba y la
 * imagen tiene la fila 0 arriba.
 */

import { muestrearLogo } from '@/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL } from '@/app/v3/_lib/escena/__tests__/s10-logo-lectura'

export interface MascaraDelLogo {
  readonly ancho: number
  readonly alto: number
  /** 1 donde hay tinta del logo por delante de lo opaco, 0 donde no. */
  readonly bits: Uint8Array
  /** Cuántos píxeles del viewport son logo. */
  readonly celdas: number
  /** La banda vertical que ocupa: primera y última fila con tinta, o `null`. */
  readonly banda: { readonly desde: number; readonly hasta: number } | null
  /** El centro horizontal de la tinta, en píxeles. `NaN` si no hay. */
  readonly centroXPx: number
}

export function mascaraDelLogo(progreso: number, ancho: number, alto: number): MascaraDelLogo {
  const m = muestrearLogo(progreso, ancho / alto, ESCENA_REAL, ancho, alto, 1)
  const bits = new Uint8Array(ancho * alto)
  let desde = Infinity
  let hasta = -Infinity
  let sumaX = 0
  for (let i = 0; i < m.celdasDeLogo; i += 1) {
    // cx = ((ix + 0.5) / ancho) * 2 − 1  →  ix = ((cx + 1) / 2) * ancho − 0.5
    const ix = Math.round(((m.x[i] + 1) / 2) * ancho - 0.5)
    const iy = Math.round(((m.y[i] + 1) / 2) * alto - 0.5)
    if (ix < 0 || iy < 0 || ix >= ancho || iy >= alto) continue
    const fila = alto - 1 - iy
    bits[fila * ancho + ix] = 1
    if (fila < desde) desde = fila
    if (fila > hasta) hasta = fila
    sumaX += ix
  }
  return {
    ancho,
    alto,
    bits,
    celdas: m.celdasDeLogo,
    banda: Number.isFinite(desde) ? { desde, hasta } : null,
    centroXPx: m.celdasDeLogo === 0 ? Number.NaN : sumaX / m.celdasDeLogo,
  }
}
