/**
 * INVARIANTE — el foco visible existe en TODOS los componentes del sprint, y
 * hace lo mismo que el hover.
 *
 * Corre con `npm run test:s3-foco`.
 *
 * ── Por qué ésta es la comprobación más barata del proyecto ───────────────
 *
 * La referencia tiene **88 reglas de hover contra 5 de foco** en toda su hoja,
 * y de esas 5 ninguna aplica a ninguno de los cinco objetivos medidos. Con Tab
 * el único cambio computado en todo el sitio es `outline-offset` de 0 a 1px,
 * con `outline-style: none` — o sea, nada que se vea. Un usuario de teclado no
 * recibe ninguna señal de dónde está.
 *
 * ── Las cuatro afirmaciones ───────────────────────────────────────────────
 *
 *   1. **Paridad hover/foco.** Toda regla del sprint que nombra `:hover`
 *      nombra también `:focus-visible`. No es una convención de estilo: es la
 *      diferencia entre que el CTA gire con el puntero y no con el teclado.
 *   2. **Cero apagados del anillo.** Ni `outline: none`, ni `outline-width: 0`,
 *      ni `outline-none`, en ninguno de los 34 archivos.
 *   3. **La regla del anillo existe** y consume los tres tokens del sistema.
 *   4. **Pieza por pieza**: cada componente interactivo expone al menos un
 *      elemento focalizable, y ninguno de esos elementos está adentro de una
 *      caja recortada —un anillo con desplazamiento positivo sobre un elemento
 *      con `overflow: hidden` desaparece sin dejar rastro.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DEL_SPRINT, ARCHIVOS_DE_COMPONENTE, ARCHIVOS_DE_ESTILO, leer } from './s3-archivos'
import { partesDeSelector, reglas, sinComentarios } from './s3-css'
import { apagadosDeFoco, quitarComentarios } from './s3-escaneo'
import { PIEZAS } from './s3-piezas'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Paridad hover / foco, regla por regla')

/**
 * Una regla con `:hover` que no nombra `:focus-visible` en NINGUNA de sus
 * alternativas de selector.
 *
 * Se mira el selector entero y no cada parte por separado a propósito: la
 * forma que usa este sprint es `:is(:hover, :focus-visible, …)`, o sea una
 * sola alternativa que nombra las dos. Exigir un gemelo por parte daría un
 * falso negativo sobre código correcto.
 */
function hoverSinFoco(css: string): string[] {
  return reglas(css)
    .map((r) => r.selector)
    .filter((s) => s.includes(':hover'))
    .filter((s) => !s.includes(':focus-visible'))
}

const sinGemelo = ARCHIVOS_DE_ESTILO.flatMap((a) => hoverSinFoco(leer(a)))
afirmarIgual(sinGemelo, [], 'ninguna regla de hover se quedó sin su gemela de foco')

const conHover = ARCHIVOS_DE_ESTILO.flatMap((a) =>
  reglas(leer(a)).map((r) => r.selector).filter((s) => s.includes(':hover')),
)
afirmar(
  conHover.length > 0,
  `hay ${conHover.length} reglas de hover que la paridad tuvo que revisar`,
  'sin esto la afirmación de arriba sería verde por vacío',
)

controlPositivo(
  'el detector ve un hover sin foco',
  '[data-v3] [data-pieza="x"]:hover { opacity: 1; }',
  (css) => hoverSinFoco(css).length === 0,
)
controlPositivo(
  'y lo ve aunque la regla vecina sí tenga foco',
  '[data-v3] .a:focus-visible { opacity: 1; } [data-v3] .b:hover { opacity: 1; }',
  (css) => hoverSinFoco(css).length === 0,
)

// Y en el código no hay variantes `hover:` de Tailwind: toda la coreografía de
// estado vive en las hojas, que es donde la paridad se puede verificar.
const hoverEnElCodigo = ARCHIVOS_DE_COMPONENTE.map((a) => ({
  archivo: a,
  hallados: [...quitarComentarios(leer(a)).matchAll(/\bhover:[a-z[]/g)].map((m) => m[0]),
})).filter((r) => r.hallados.length > 0)
afirmarIgual(hoverEnElCodigo, [], 'ningún componente esconde un `hover:` fuera de las hojas')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Nadie apaga el anillo')

const apagados = ARCHIVOS_DEL_SPRINT.map((archivo) => ({
  archivo,
  hallados: apagadosDeFoco(
    archivo.endsWith('.css') ? sinComentarios(leer(archivo)) : quitarComentarios(leer(archivo)),
  ),
})).filter((r) => r.hallados.length > 0)
afirmarIgual(apagados, [], `ninguno de los ${ARCHIVOS_DEL_SPRINT.length} archivos apaga el anillo`)

controlPositivo(
  'el detector ve las tres formas de apagarlo',
  '.a { outline: none } .b { outline-width: 0 } .c { outline-style: none }',
  (css) => apagadosDeFoco(css).length === 0,
)
controlPositivo(
  'y también la utilidad de Tailwind',
  'const c = "outline-none"',
  (codigo) => apagadosDeFoco(codigo).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La regla del anillo existe y consume los tres tokens')

const tema = sinComentarios(leer('src/app/theme-develop.css'))
const reglasDeFoco = reglas(tema).filter((r) => r.selector.includes(':focus-visible'))
afirmar(reglasDeFoco.length > 0, `el sistema declara ${reglasDeFoco.length} regla(s) de :focus-visible`)

const cuerpoDelAnillo = reglasDeFoco.map((r) => r.cuerpo).join(' ')
for (const token of ['--foco-grosor', '--color-foco', '--foco-desplazamiento']) {
  afirmar(cuerpoDelAnillo.includes(`var(${token})`), `el anillo consume ${token}`)
}
afirmar(
  reglasDeFoco.every((r) => partesDeSelector(r.selector).every((p) => p.includes('[data-v3]'))),
  'y está acotada al árbol de /v3 — el portal es casi negro y --color-foco es la tinta',
)

// El anillo forzado de la galería usa los MISMOS tokens: si el sistema cambia
// el grosor, la demostración se mueve con él en vez de mentir.
const forzado = leer('src/app/v3/_estilos/foco.css')
for (const token of ['--foco-grosor', '--color-foco', '--foco-desplazamiento']) {
  afirmar(forzado.includes(`var(${token})`), `  el anillo forzado también consume ${token}`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Pieza por pieza')

/**
 * Los elementos que entran en el orden de tabulación.
 *
 * Tres exclusiones que una expresión regular ingenua se come, y las tres
 * cambian el resultado:
 *   · un `<a>` **sin `href`** no es focalizable;
 *   · un control **`disabled`** tampoco — y ésa es la razón de que el CTA
 *     deshabilitado esté declarado como no interactivo en el padrón;
 *   · `tabindex="-1"` es enfocable por código pero **no** por Tab.
 */
const ETIQUETA_DE_CONTROL = /<(a|button|input|select|textarea|summary)\b([^>]*)>/gi
const CON_TABINDEX = /<([a-z][a-z0-9-]*)\b([^>]*\btabindex="(?!-1)[^"]*"[^>]*)>/gi

function focalizablesDe(html: string): string[] {
  const encontrados: string[] = []
  for (const m of html.matchAll(ETIQUETA_DE_CONTROL)) {
    const etiqueta = m[1].toLowerCase()
    const atributos = m[2]
    if (/\sdisabled(?:[=\s>]|$)/i.test(atributos)) continue
    if (etiqueta === 'a' && !/\shref=/.test(atributos)) continue
    encontrados.push(`<${etiqueta}`)
  }
  for (const m of html.matchAll(CON_TABINDEX)) {
    const etiqueta = m[1].toLowerCase()
    if (['a', 'button', 'input', 'select', 'textarea', 'summary'].includes(etiqueta)) continue
    encontrados.push(`<${etiqueta} tabindex`)
  }
  return encontrados
}

/** Un focalizable adentro de la ventana recortada del rollover sería un
 *  anillo invisible. La ventana es un `<span>` y no puede ser focalizable. */
function focalizableRecortado(html: string): boolean {
  const ventana = /<span[^>]*data-parte="ventana"[^>]*>([\s\S]*?)<\/span>/.exec(html)
  if (ventana === null) return false
  return focalizablesDe(ventana[1]).length > 0
}

let interactivas = 0
for (const pieza of PIEZAS) {
  const html = pieza.nodo === null ? '' : renderToStaticMarkup(<>{pieza.nodo}</>)
  const focalizables = focalizablesDe(html)
  if (pieza.interactiva) {
    interactivas += 1
    afirmar(
      focalizables.length > 0,
      `${pieza.id} — expone ${focalizables.length} elemento(s) focalizable(s)`,
      focalizables.join(' · '),
    )
  } else {
    afirmarIgual(focalizables, [], `${pieza.id} — no interactiva, y no captura el foco`)
  }
  afirmar(!focalizableRecortado(html), `${pieza.id} — ningún focalizable adentro de la caja recortada`)
}

afirmar(interactivas >= 9, `${interactivas} piezas interactivas revisadas`, 'no es verde por vacío')

controlPositivo(
  'el buscador de focalizables ve uno que no está',
  '<div><span>sin foco</span></div>',
  (html) => focalizablesDe(html).length > 0,
)
controlPositivo(
  'y no cuenta un tabindex="-1" como focalizable',
  '<div tabindex="-1">no entra en el orden de tabulación</div>',
  (html) => focalizablesDe(html).length > 0,
)
controlPositivo(
  'ni un control deshabilitado',
  '<button disabled="">Ver el trabajo</button>',
  (html) => focalizablesDe(html).length > 0,
)
controlPositivo(
  'ni un ancla sin href',
  '<a data-pieza="x">no es un enlace</a>',
  (html) => focalizablesDe(html).length > 0,
)
// Y el contrapeso de los tres: el detector SÍ tiene que ver lo que sí entra.
afirmar(
  focalizablesDe('<button>x</button><a href="#y">y</a><div tabindex="0">z</div>').length === 3,
  'el detector cuenta los tres casos que sí entran en el orden de tabulación',
)
controlPositivo(
  'el detector de recorte vería un botón adentro de la ventana',
  '<span data-parte="ventana"><button>x</button></span>',
  (html) => !focalizableRecortado(html),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El padrón de piezas cubre los doce archivos de componente')

const archivosCubiertos = new Set(PIEZAS.map((p) => p.archivo))
const sinPieza = ARCHIVOS_DE_COMPONENTE.filter((a) => !archivosCubiertos.has(a))
afirmarIgual(sinPieza, [], 'ningún componente quedó sin una pieza en el padrón')
afirmarIgual(archivosCubiertos.size, ARCHIVOS_DE_COMPONENTE.length, 'y el padrón no cubre archivos que no existen')

cerrar('s3-foco.invariant')
