/**
 * EL PIPELINE DE IMAGEN — descriptores de ANCHO y `sizes` de verdad.
 *
 * ── El defecto medido, y por qué es de los tres lugares donde se les gana ──
 *
 * El `srcset` de la referencia usa **descriptores de densidad** (`1x`, `2x`)
 * con `sizes` en `null`. Con densidad, el navegador elige por `devicePixelRatio`
 * y **no mira el ancho de la caja**: de 768 a 1920 descarga exactamente lo
 * mismo, en las 134 imágenes del sitio. Un teléfono a 390 css-px baja la
 * imagen pensada para 1920.
 *
 * Con descriptores de ANCHO (`w`) más un `sizes` real, el navegador conoce el
 * ancho de la caja antes de tener layout y elige el candidato más chico que
 * alcanza. Es la misma etiqueta, con la otra mitad puesta.
 *
 * ── La regla que este módulo hace imposible de romper ─────────────────────
 *
 * `sizes` es **obligatorio** en el tipo del componente: sin él no compila.
 * Eso solo no alcanza —`sizes=""` compila— así que además:
 *   · el componente valida en construcción y tira si viene vacío;
 *   · `s3-imagen.invariant.ts` rechaza cualquier uso de `<Imagen` sin `sizes`
 *     en el árbol de /v3, con control positivo sobre un uso deliberadamente
 *     roto.
 *
 * ── Por qué las condiciones de `sizes` se ARMAN y no se escriben ──────────
 *
 * Un `sizes` escrito a mano trae `(min-width: 1025px)` literal, que es el
 * breakpoint del sistema copiado a mano en un string. Acá se compone desde
 * `ESCENARIO_MIN_ANCHO_PX`, que ya está atado por invariante a
 * `--breakpoint-escritorio`. El número aparece una sola vez en el repo.
 */

import { ESCENARIO_MIN_ANCHO_PX } from './compuerta'

/** El breakpoint tablet del sistema, en número, desde el mismo lugar que el
 *  resto. `--breakpoint-tablet` vale 768px y el instrumento lo relee del CSS. */
export const ANCHO_TABLET_PX = 768

/**
 * ⚠ LA ESCALERA DE ANCHOS NO SE DECLARA ACÁ, Y ES A PROPÓSITO.
 *
 * Los candidatos del `srcset` los emite el optimizador de Next desde
 * `images.deviceSizes`, que este repo **no** sobreescribe: rige la escalera
 * por defecto del framework —640, 750, 828, 1080, 1200, 1920, 2048, 3840—
 * cuyo salto máximo entre candidatos es 1,88× (1200 → 1920).
 *
 * Declarar acá una escalera propia sería una constante que nadie consume: el
 * `srcset` no la miraría, y quien la leyera creería que sí. Si en algún
 * momento hace falta otra, el lugar es `next.config.ts` y afecta al sitio
 * entero, que es una decisión más grande que este sprint.
 *
 * `s3-imagen.invariant.ts` afirma que ese override no existe, para que la
 * escalera que dice este comentario sea la que corre.
 */
export const CLAVE_DE_OVERRIDE_DE_ESCALERA = 'deviceSizes'

/**
 * Arma un `sizes` de dos tramos desde el breakpoint de escritorio.
 *
 * `porcentajeEscritorio` es cuánto del viewport ocupa la imagen arriba de
 * 1025; `porcentajeCompacto` cuánto ocupa abajo. Son porcentajes de viewport
 * porque el sistema medido no tiene contenedor fijo: `max-width: 100%` domina
 * con 66,2% en los cuatro anchos, así que la caja de una imagen es una
 * fracción del viewport y no una constante en px.
 */
export function sizesPorViewport(porcentajeEscritorio: number, porcentajeCompacto = 100): string {
  validarPorcentaje(porcentajeEscritorio)
  validarPorcentaje(porcentajeCompacto)
  return `(min-width: ${ESCENARIO_MIN_ANCHO_PX}px) ${porcentajeEscritorio}vw, ${porcentajeCompacto}vw`
}

/**
 * Arma un `sizes` de tres tramos, con el corte secundario de 768.
 *
 * Los dos cortes del sistema son 1025 —el estructural, 87,8% de las reglas— y
 * 768 —el secundario, 268 reglas—. No hay un tercero que valga la pena: las
 * once condiciones que aparecen con exactamente una regla por volcado son de
 * hojas de terceros y no se emiten.
 */
export function sizesPorTresTramos(
  porcentajeEscritorio: number,
  porcentajeMedio: number,
  porcentajeCompacto = 100,
): string {
  validarPorcentaje(porcentajeEscritorio)
  validarPorcentaje(porcentajeMedio)
  validarPorcentaje(porcentajeCompacto)
  return [
    `(min-width: ${ESCENARIO_MIN_ANCHO_PX}px) ${porcentajeEscritorio}vw`,
    `(min-width: ${ANCHO_TABLET_PX}px) ${porcentajeMedio}vw`,
    `${porcentajeCompacto}vw`,
  ].join(', ')
}

/**
 * `sizes` para una imagen que ocupa `columnas` de una grilla de `total`.
 *
 * Es el caso real: la contención del sistema es grilla, no contenedor. Se
 * redondea a un entero porque un `sizes` con seis decimales no le sirve de
 * nada al navegador —elige el candidato de la escalera igual— y ensucia el
 * HTML de todas las imágenes de la página.
 */
export function sizesPorColumnas(columnas: number, total: number, compacto = 100): string {
  if (!Number.isInteger(columnas) || columnas < 1) throw new Error('columnas: entero ≥ 1')
  if (!Number.isInteger(total) || total < columnas) throw new Error('total: entero ≥ columnas')
  return sizesPorViewport(Math.round((columnas / total) * 100), compacto)
}

function validarPorcentaje(valor: number): void {
  if (!Number.isFinite(valor) || valor <= 0 || valor > 100) {
    throw new Error(`porcentaje de viewport fuera de rango: ${valor}`)
  }
}

/** El mensaje de la validación en construcción. Está acá para que el
 *  instrumento afirme el mensaje exacto y no una parte de él. */
export const ERROR_SIZES_AUSENTE =
  'Imagen: `sizes` es obligatorio y no puede ser vacío. Sin él el navegador emite ' +
  'descriptores de densidad y descarga la misma imagen en todos los anchos — que es ' +
  'exactamente el defecto medido en la referencia.'
