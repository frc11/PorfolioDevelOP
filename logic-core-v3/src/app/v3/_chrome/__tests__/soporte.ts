import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { atributo, nodosDe } from '../../_lib/__tests__/s10-recorrido'
import { afirmar, controlPositivo } from '../../_lib/__tests__/afirmar'
import { marcadoDelDocumento } from '../../_lib/__tests__/s10-banco'

/**
 * LA PLOMERÍA DE `s8-chrome` — los detectores, afuera del archivo que los usa.
 *
 * ⚠ **No es prolijidad: es la condición del control positivo.** Un detector se
 * prueba corriendo LA MISMA función contra una entrada deliberadamente
 * equivocada, y para eso la función tiene que vivir afuera del archivo que la
 * usa — un detector que se prueba a sí mismo con otra copia del código no prueba
 * nada. Es el patrón de `s7-soporte.ts` y de `s8-padron.ts`.
 *
 * ⚠ Y la segunda razón, que es §7.25: **este archivo guarda las entradas rotas a
 * propósito** —un `overflow: hidden`, un `overflow-hidden` de Tailwind, un
 * envoltorio que rompe el `sticky`— y por eso ningún escáner del sprint lo puede
 * mirar sin ponerse rojo contra su propio arnés. No lleva el sufijo
 * `.invariant`: un `.invariant` sin script en `package.json` es un instrumento
 * que no corre nunca, y hay una comprobación que lo caza.
 */

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

export function leer(relativo: string): string {
  return readFileSync(path.join(RAIZ, relativo), 'utf8')
}

export function existe(relativo: string): boolean {
  try {
    statSync(path.join(RAIZ, relativo))
    return true
  } catch {
    return false
  }
}

/**
 * El código sin comentarios ni contenido de cadenas.
 *
 * ⚠ Hace falta y no es cosmético (§7.25): el layout RAÍZ **explica en un
 * comentario** que el gate del preloader «reemplazó al `overflow:hidden` de
 * EarlyScrollLock», y este archivo documenta el `overflow` que busca. Un
 * detector que mirara el archivo entero encontraría la explicación y pondría en
 * rojo justamente el trabajo de haberla escrito.
 */
export function sinComentariosNiCadenas(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
}

/** Igual, pero conservando las cadenas: un `className` ES una cadena. */
export function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
    .replace(/\/\/[^\n]*/g, ' ')
}

/** Los `className` escritos en un fuente, como lista de clases. */
export function clasesEscritas(fuente: string): string[] {
  const limpio = sinComentarios(fuente)
  const cadenas = [
    ...[...limpio.matchAll(/className=\{?["'`]([^"'`]*)["'`]/g)].map((m) => m[1]),
    ...[...limpio.matchAll(/class="([^"]*)"/g)].map((m) => m[1]),
  ]
  return [...new Set(cadenas.flatMap((c) => c.split(/\s+/)).filter((c) => c.length > 0))]
}

/**
 * EL DETECTOR QUE IMPORTA — `overflow` recortado en una hoja de estilos.
 *
 * `position: sticky` **se apaga en silencio** si cualquier ancestro tiene
 * `overflow` distinto de `visible`: sin un error, sin un aviso, y con un marcado
 * que se ve correcto. Por eso la cadena de ancestros de la pastilla se afirma, y
 * se afirma sobre el código.
 *
 * `overscroll-behavior` NO cuenta y hay que excluirlo a mano: el layout raíz lo
 * declara en `html, body` y no tiene nada que ver — no crea contexto de
 * desplazamiento. Un detector que lo contara daría un falso rojo permanente.
 */
export function overflowsRecortados(css: string): string[] {
  return [...css.matchAll(/(?<![-\w])(overflow(?:-[xy]|-block|-inline)?)\s*:\s*([^;}]+)/g)]
    .map((m) => `${m[1]}: ${m[2].trim()}`)
    .filter((d) => !/:\s*visible\b/.test(d))
}

/**
 * Las reglas de un CSS, aplanadas: selector y cuerpo.
 *
 * El anidado de `@layer` y `@media` sale gratis — el bloque de afuera no casa
 * porque su cuerpo tiene llaves, así que el motor avanza y encuentra el de
 * adentro. Es lo que hace falta acá: las reglas de `html, body` de `globals.css`
 * viven dentro de un `@layer base`.
 */
export function reglasPlanas(css: string): { selector: string; cuerpo: string }[] {
  return [...sinComentariosCss(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim().replace(/\s+/g, ' '),
    cuerpo: m[2],
  }))
}

export function sinComentariosCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ')
}

/**
 * Los `overflow` recortados que caen sobre un ANCESTRO de la pastilla.
 *
 * Se filtra por selector y no se escanea la hoja entera: `globals.css` tiene
 * `overflow: hidden` en piezas del sitio viejo que no son ancestros de nada de
 * /v3, y contarlas daría un rojo permanente que no significa nada.
 */
export function overflowsSobreAncestros(css: string, ancestros: readonly string[]): string[] {
  return reglasPlanas(css)
    .filter((r) => r.selector.split(',').some((s) => ancestros.includes(s.trim())))
    .flatMap((r) => overflowsRecortados(r.cuerpo).map((d) => `${r.selector} { ${d} }`))
}

/** Las utilidades de Tailwind de `overflow` escritas en un `className`. */
export function clasesDeOverflow(fuente: string): string[] {
  return clasesEscritas(fuente).filter((c) =>
    /^(?:[a-z0-9:-]+:)?overflow-(?:x-|y-)?(?:hidden|auto|scroll|clip)$/.test(c),
  )
}

/**
 * Un escalón de espaciado, en px, LEÍDO del tema.
 *
 * No se transcribe ni se deduce de la unidad base: si `--spacing-20` cambiara de
 * valor, la cuenta del aire del pie del Hero se mueve con él o se pone roja. La
 * raíz de 16 la declara el propio tema, en el comentario que traduce cada rem.
 */
export function pxDeEspaciado(escalon: string, tema: string): number {
  const m = new RegExp(`--spacing-${escalon}:\\s*([\\d.]+)rem`).exec(tema)
  if (m === null) throw new Error(`--spacing-${escalon} no está declarado en el tema`)
  return Number.parseFloat(m[1]) * 16
}

/** El primer elemento que abre un marcado: su etiqueta y sus atributos. */
export function primerElemento(html: string): string {
  return /<([a-z][a-z0-9]*)\b[^>]*>/i.exec(html)?.[0] ?? ''
}

/** Los `href` de un marcado renderizado. */
export function hrefsDe(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
}

/** Los que NO caen en la lista de anclas que existen. Un `href` a la nada. */
export function aLaNada(hrefs: readonly string[], anclas: readonly string[]): string[] {
  return hrefs.filter((h) => !h.startsWith('#') || !anclas.includes(h))
}

/** Las clases del elemento cuyo texto visible es `texto`. Para leer un peso. */
export function clasesDelElementoCon(html: string, texto: string): string[] {
  const re = new RegExp(`<[a-z][a-z0-9]*\\b[^>]*\\sclass="([^"]*)"[^>]*>${texto}<`, 'i')
  return (re.exec(html)?.[1] ?? '').split(/\s+/).filter((c) => c.length > 0)
}

/**
 * Los especificadores de import de un fuente, estáticos y perezosos.
 *
 * Se borran los comentarios y **no las cadenas**: el especificador ES una
 * cadena. Es la corrección que `s8-padron.ts` documenta.
 */
export function importsDe(fuente: string): string[] {
  const limpio = sinComentarios(fuente)
  return [
    ...[...limpio.matchAll(/^\s*import\s[\s\S]*?from\s+'([^']+)'/gm)].map((m) => m[1]),
    ...[...limpio.matchAll(/import\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]),
  ]
}

/**
 * LA PROFUNDIDAD DE UNA PIEZA en un marcado renderizado. `null` si no está.
 *
 * ⚠ **Es lo que reemplazó a «el primer elemento es la pastilla» en SITIO-S11**,
 * y la diferencia importa: lo que sostiene el `sticky` no es que la pastilla sea
 * la PRIMERA —el enlace de salto se emite antes que ella, y no le mueve nada
 * porque está fuera del flujo— sino que **nada la ENVUELVA**. Un `<div>` de alto
 * automático entre el `<main>` y el envoltorio le deja el rango de pegado en
 * cero, y eso es exactamente lo que mide una profundidad de 0 contra una de 1.
 *
 * El recorrido no se reescribe acá: se reusa `nodosDe`, el lector con pila de
 * SITIO-S10, que ya cuenta anidamiento y ya tiene sus propios controles.
 */
export function profundidadDeLaPieza(html: string, pieza: string): number | null {
  const nodo = nodosDe(html).find((n) => atributo(n, 'data-pieza') === pieza)
  return nodo === undefined ? null : nodo.profundidad
}

/**
 * El valor de una propiedad en la regla de un selector EXACTO. `null` si no
 * está declarada — que es distinto de estar declarada en otro valor.
 *
 * Sirve para afirmar sobre la HOJA lo que el marcado no puede decir: que el
 * enlace de salto está fuera del flujo. Un `position: static` ahí le correría el
 * nacimiento a la pastilla sin cambiar una línea de marcado.
 */
export function declaracionCss(css: string, selector: string, propiedad: string): string | null {
  const regla = reglasPlanas(css).find((r) => r.selector === selector)
  if (regla === undefined) return null
  const m = new RegExp(`(?<![-\\w])${propiedad}\\s*:\\s*([^;}]+)`).exec(regla.cuerpo)
  return m === null ? null : m[1].trim()
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LAS ENTRADAS ROTAS — a propósito, para los controles positivos.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Una hoja con el `overflow` que apagaría la pastilla. */
export const CSS_CON_OVERFLOW = 'main { position: relative; overflow: hidden; }'

/** Y la misma trampa escrita como utilidad de Tailwind. */
export const TSX_CON_OVERFLOW = '<main className="relative z-10 overflow-x-hidden">{children}</main>'

/**
 * El envoltorio que rompe el `sticky` SIN un solo error: un `<div>` de alto
 * automático entre el `<main>` y la pastilla mide lo que mide su contenido
 * —cero— y el rango de pegado queda en cero.
 */
export const MARCADO_CON_ENVOLTORIO = '<div data-chrome=""><div data-pieza="navegacion"></div></div>'

/** Un `href` a una sección que no existe. */
export const HREFS_A_LA_NADA: readonly string[] = ['#no-existe', 'https://develop.example/contacto']

/** El marcado de la pieza del pie SIN el peso restaurado. */
export const MARCADO_SIN_PESO = '<span class="font-cuerpo text-caption font-normal font-codigo uppercase">[ENLACE]</span>'

/**
 * La hoja que dejaría al enlace de salto DENTRO del flujo. Es la trampa que
 * ningún marcado puede mostrar: con esto el enlace mide alto, empuja al
 * envoltorio `sticky` que se emite después y le corre el nacimiento a la
 * pastilla —los `100svh − 72px` que §2 verifica contra el Hero real—.
 */
export const CSS_DEL_SALTO_EN_FLUJO = '[data-v3] [data-pieza="salto"] { position: static; block-size: 1px; }'

/**
 * EL CHROME AFUERA DEL `<main>` — el cierre del defecto 15, afirmado sobre el
 * documento compuesto.
 *
 * Sale de `s8-chrome.invariant.ts` porque lo cruzó las 300 líneas del repo. El
 * corte es por tema: es la única parte de §1 que mira el DOCUMENTO entero en vez
 * del marcado del chrome aislado, y esa diferencia es justamente la que hace
 * falta —el chrome renderizado solo no puede saber quién lo envuelve—.
 */
export function afirmarElChromeAfueraDelMain(): void {
  /**
   * ⚠ **SITIO-S12 MOVIÓ EL CONTENEDOR DE BLOQUE, Y LA AFIRMACIÓN SE HIZO MÁS FINA
   * EN VEZ DE AFLOJARSE (regla 15).** Hasta S11 el texto decía «su contenedor de
   * bloque es el `<main>`», y eso era una consecuencia de dónde estaba montado el
   * chrome, no una propiedad de lo que este archivo emite. Con el chrome afuera
   * del `<main>` —el arreglo del defecto 15— el contenedor pasó a ser
   * `[data-v3]`, cuyo alto en flujo es el del `<main>`: **el rango de pegado no
   * cambia**, porque el `<main>` es su único hijo en el flujo. Eso último no se
   * puede suponer: se afirma sobre el documento compuesto, y es la mitad que la
   * frase vieja daba por sentada.
   */
  const DOC_DEL_CHROME = marcadoDelDocumento('quieta')
  const HERMANOS = nodosDe(DOC_DEL_CHROME).filter((n) => n.profundidad === 1)
  afirmar(
    HERMANOS.filter((n) => n.etiqueta === 'main').length === 1,
    '  y el `<main>` es hermano suyo, no su ancestro: el contenedor de bloque de la pastilla es `[data-v3]`',
    HERMANOS.map((n) => atributo(n, 'data-pieza') ?? n.etiqueta).join(' · '),
  )
  afirmar(
    nodosDe(DOC_DEL_CHROME).filter((n) => n.etiqueta === 'nav' && n.ancestros.includes('main')).length === 0,
    '  y el `<nav>` ya no está anidado en el `<main>` — la otra mitad del defecto 15',
  )
  afirmar(
    DOC_DEL_CHROME.includes('<header data-pieza="navegacion"'),
    '  y el envoltorio `sticky` ES el `<header>`: el `banner` se gana sin una caja nueva',
  )
  controlPositivo(
    'el detector de anidamiento no está ciego',
    '<main><nav aria-label="x"></nav></main>',
    (h: string) => nodosDe(h).filter((n) => n.etiqueta === 'nav' && n.ancestros.includes('main')).length === 0,
  )
}
