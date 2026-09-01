/**
 * EL MODELO DE LA PASTILLA DE NAVEGACIÓN — su fila intrínseca, el tope que la
 * hoja le pone, y lo que termina midiendo en pantalla.
 *
 * Sale de `s10-mobile.ts` en SITIO-S11, cuando ese archivo cruzó las 300 líneas
 * al enseñarle el tope al modelo. El corte es por TEMA: la pastilla es lo único
 * de ese banco que no mide el árbol del documento — no comparte una función con
 * el contador de pantallas ni con el de tinta.
 *
 * ⚠ **Este archivo queda fuera del escaneo de tokens**, igual que el banco del
 * que sale: sus números son píxeles de un modelo, no valores de diseño.
 */

import { ALTO_PASTILLA_PX, DESCUENTO_NACIMIENTO_PX, DESCUENTO_UMBRAL_PX, ENLACES_DE_MUESTRA, umbralPx } from '../navegacion'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import { ALTOS } from './s10-banco'
import { leer } from './s5-archivos'
import { anchoDeTexto } from './s10-avance'
import { tokenPx } from './s10-css'
import { CHIVO, tracking } from './s10-mobile'

export interface EnlaceMedido {
  readonly rotulo: string
  readonly px: number
}

export interface Pastilla {
  /** La fila INTRÍNSECA: lo que la pastilla querría medir sin tope. */
  readonly total: number
  /**
   * El TOPE que la hoja le pone al ancho, en píxeles a este viewport.
   *
   * `max-inline-size: calc(100% - var(--pad-lateral-compacto) * 2)`, y el `100%`
   * es el ancho del contenedor de bloque —el `<main>` de `v3/layout.tsx`, que no
   * lleva relleno—, así que a este modelo le alcanza el ancho del viewport.
   */
  readonly tope: number
  /** Lo que la pastilla mide DE VERDAD: la fila, acotada por el tope. */
  readonly pintado: number
  /** Cuánto se sale por CADA lado. Cero es que entra. */
  readonly desbordePorLado: number
  readonly enlaces: EnlaceMedido[]
  readonly alto: number
  readonly nacimiento: (alto: number) => number
}

/**
 * EL ANCHO DE LA PASTILLA, sumado pieza por pieza de `_estilos/navegacion.css`:
 * relleno lateral de la pastilla, los cinco enlaces con su propio relleno, su
 * marcador de `--spacing-1` y su canaleta, y las cuatro separaciones de la
 * lista. **Es un PISO**: los rótulos van en `font-semi` y el lector de avances
 * mide la instancia por defecto, que es más angosta.
 *
 * ── ⚠️ EL MODELO APRENDIÓ EL TOPE EN SITIO-S11, Y ANTES NO LO TENÍA ────────
 *
 * Hasta S10 esto devolvía UN número —la fila intrínseca— y con eso alcanzaba,
 * porque la hoja no declaraba ningún tope: la pastilla medía 600 px en los cinco
 * anchos y a 375 se salía 112 px por lado (§7.38, defecto 3). S11 le puso un
 * tope **relativo** (`max-inline-size`), y un modelo que sólo sabe sumar la fila
 * seguiría publicando 600 y seguiría diciendo que se sale: mediría una hoja que
 * ya no existe.
 *
 * Así que el modelo devuelve las TRES cifras y no una, porque las tres son
 * distintas y las tres se usan: `total` sigue siendo la fila intrínseca —es lo
 * que decide si la fila **se recorre de costado**, que es el mecanismo—, `tope`
 * es lo que la hoja permite, y `pintado` es el mínimo de los dos, que es lo que
 * ocupa en pantalla. `total` NO se borró: borrarlo habría escondido que la fila
 * sigue midiendo lo mismo y que lo que cambió es la caja, no el contenido.
 *
 * ⚠️ **Sigue siendo un modelo y no una medición.** El `100%` del `calc()` se
 * resuelve contra el contenedor de bloque de la pastilla; acá se supone que ese
 * contenedor mide el viewport, que es lo que hoy vale —el `<main>` de
 * `v3/layout.tsx` no lleva relleno lateral—. El día que la pastilla cuelgue de
 * un contenedor con relleno, este supuesto deja de valer y hay que volver acá.
 */
export function anchoDeLaPastilla(ancho: number, topeDeLaHoja = true): Pastilla {
  const tam = tokenPx('--text-cuerpo', ancho)
  const enlaces = ENLACES_DE_MUESTRA.map((e) => ({
    rotulo: e.rotulo,
    px:
      2 * tokenPx('--spacing-2', ancho) +
      2 * tokenPx('--spacing-1', ancho) +
      anchoDeTexto(CHIVO, e.rotulo, tam, tracking('texto')),
  }))
  const total =
    2 * tokenPx('--spacing-4', ancho) +
    enlaces.reduce((a, e) => a + e.px, 0) +
    (enlaces.length - 1) * tokenPx('--spacing-2', ancho)
  // `topeDeLaHoja = false` es la entrada del control positivo: sin tope, el
  // detector TIENE que volver a ver el desborde que S10 midió.
  const tope = topeDeLaHoja
    ? ancho - 2 * tokenPx('--pad-lateral-compacto', ancho)
    : Number.POSITIVE_INFINITY
  const pintado = Math.min(total, tope)
  return {
    total,
    tope,
    pintado,
    desbordePorLado: Math.max(0, (pintado - ancho) / 2),
    enlaces,
    alto: ALTO_PASTILLA_PX,
    nacimiento: (alto: number): number => alto - DESCUENTO_NACIMIENTO_PX,
  }
}

/**
 * §8 DEL INVARIANTE — dónde nace la pastilla, dónde queda en reposo, y si entra.
 *
 * Vive con su modelo y no con las otras nueve secciones: la comprobación y la
 * aritmética que la sostiene son la misma pieza, y separarlas era lo que hacía
 * cruzar las 300 líneas al invariante sin ganar nada.
 */
export function afirmarLaPastilla(px0: (n: number) => string): void {
  titulo('8 · La pastilla de navegación: dónde nace, dónde queda, y si entra')

  const pastilla = anchoDeLaPastilla(375)
  afirmarIgual(DESCUENTO_UMBRAL_PX, 96, 'el umbral es `100svh − 96px`, derivado de los cuatro tokens de `_lib/navegacion.ts`')
  for (const alto of ALTOS) {
    afirmar(umbralPx(alto) > 0, `@alto ${alto}: nace en ${px0(pastilla.nacimiento(alto))} y queda en reposo tras ${umbralPx(alto)} px de scroll (${((umbralPx(alto) / alto) * 100).toFixed(0)}% de la primera pantalla)`)
  }
  console.log(`  el alto de la pastilla es ${pastilla.alto} px y no depende del ancho (\`--text-cuerpo\` es invariante). ⚠️ el umbral se acorta con el viewport: ${ALTOS.map((h) => `${h}→${umbralPx(h)}`).join(' · ')}. A 667 el viaje dura ${umbralPx(667)} px, ${umbralPx(900) - umbralPx(667)} menos que a 900: el gesto se lee más rápido y no se rompe, porque la aritmética es relativa a \`100svh\` y no tiene un solo número copiado.`)
  /**
   * ⚠️ **CENSO MOVIDO EN SITIO-S11 — el defecto 4 está cerrado, y las dos
   * afirmaciones que lo describían cambian de sujeto.**
   *
   * S10 afirmaba «la pastilla NO declara ningún tope de ancho» y «no tiene una
   * sola media query»: la primera describía el defecto y la segunda su forma. El
   * arreglo declara un tope y NO declara una media query, así que la primera se da
   * vuelta y la segunda **se queda y pasa a ser portante** — es la que garantiza
   * que el arreglo entró como una RELACIÓN y no como un breakpoint.
   *
   * La segunda se reescribe además para no depender de una palabra: buscaba
   * `escritorio` en el archivo entero, así que se habría puesto roja el día que
   * alguien la escribiera en un comentario. Ahora se mira la hoja **sin
   * comentarios** y se pregunta por las dos formas reales de meter un
   * breakpoint —una consulta (`@media`/`@container`) o el consumo de un token
   * `--breakpoint-*`—, con su control positivo.
   */
  const CSS_DE_LA_PASTILLA = leer('src/app/v3/_estilos/navegacion.css')
  const hojaSinComentarios = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')
  const hayBreakpoint = (css: string): boolean => /@media|@container|--breakpoint-/.test(hojaSinComentarios(css))
  afirmar(/max-inline-size/.test(hojaSinComentarios(CSS_DE_LA_PASTILLA)), 'la pastilla declara un TOPE de ancho, y por eso deja de salirse: `max-inline-size` acota la fila al ancho útil')
  afirmar(!hayBreakpoint(CSS_DE_LA_PASTILLA), '  y sigue sin UN SOLO breakpoint: el tope es una RELACIÓN (`calc(100% − relleno)`), no un ancho de pantalla')
  controlPositivo('el detector de breakpoints ve una consulta de ancho', '@media (min-width: 1025px) { a { color: red } }', (css: string) => !hayBreakpoint(css))
  controlPositivo('  y también el consumo de un token de breakpoint', 'a { width: var(--breakpoint-escritorio) }', (css: string) => !hayBreakpoint(css))
  controlPositivo('  y no se lo cree por un comentario: la palabra suelta no es un breakpoint', '/* nada de @media ni --breakpoint-escritorio acá */ a { color: red }', hayBreakpoint)
  for (const a of [375, 390]) {
    const p = anchoDeLaPastilla(a)
    afirmarIgual(px0(p.desbordePorLado), '0', `@${a}: la pastilla ENTRA — pinta ${px0(p.pintado)} px contra un tope de ${px0(p.tope)} y un viewport de ${a}`)
  }
  console.log(
    `  ✅ DEFECTO 4 — ARREGLADO en SITIO-S11 · \`_estilos/navegacion.css\` — la fila mide ${px0(pastilla.total)} px [modelado con los avances del ` +
      `\`.woff2\` que /v3 sirve; es un PISO, porque los rótulos van en \`font-semi\` y el lector mide la instancia por defecto] y NO se achicó: lo que ` +
      `cambió es su caja. Con \`inline-size: max-content\` + \`max-inline-size: calc(100% − --pad-lateral-compacto × 2)\` la fila se acota al ancho ` +
      `útil y se recorre de costado (\`overflow-x: auto\`), así que los cinco enlaces siguen estando, las cinco paradas de tabulación siguen siendo ` +
      `cinco y ninguna palabra se abrevia. Antes se salía ${px0((pastilla.total - 375) / 2)} px por CADA lado a 375 y ${px0((pastilla.total - 390) / 2)} a 390.`,
  )
  console.log(`    enlace por enlace: ${pastilla.enlaces.map((e) => `${e.rotulo} ${px0(e.px)}`).join(' · ')}`)
  console.log(
    `    fila / tope / pintado por ancho: ${[375, 390, 768, 1024, 1025].map((a) => { const p = anchoDeLaPastilla(a); return `${a} → ${px0(p.total)} / ${px0(p.tope)} / ${px0(p.pintado)}` }).join(' · ')}`,
  )
  afirmar(pastilla.total < 768, `  y la fila intrínseca entra sola desde ~${px0(pastilla.total)} px: el tope no está tapando un defecto que sigue ahí`)
  controlPositivo('el medidor de ancho reacciona al rótulo: no es un número escrito al lado', 375, (a: number) =>
    anchoDeLaPastilla(a).enlaces[0].px === anchoDeLaPastilla(a).enlaces[1].px)
  controlPositivo('y SIN el tope de la hoja el desborde de S10 vuelve entero: el arreglo es el que entra, no el modelo', 375, (a: number) =>
    anchoDeLaPastilla(a, false).desbordePorLado === 0)
}
