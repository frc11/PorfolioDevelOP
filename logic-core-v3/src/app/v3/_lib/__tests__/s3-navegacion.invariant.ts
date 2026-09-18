/**
 * INVARIANTE — el umbral de la pastilla sale de NUESTRA composición, y nada de
 * este sprint depende del scroll.
 *
 * Corre con `npm run test:s3-navegacion`.
 *
 * ── Las dos cosas que afirma, y por qué van juntas ────────────────────────
 *
 * La referencia mide `top: 816` → `top: 24` con umbral en **792px**. Esos tres
 * números son de SU héroe a 1440×900: copiarlos ataría nuestra navegación a la
 * geometría de una captura ajena. Acá el umbral se DERIVA de tres tokens y una
 * regla de simetría declarada, y el invariante recorre la cuenta entera —en la
 * hoja y en el módulo de datos, que tienen que decir lo mismo.
 *
 * Y va junto con la segunda afirmación porque son la misma decisión: el
 * mecanismo es `sticky` con un `top` negativo, o sea **geometría**. Si hubiera
 * un listener de scroll, el umbral sería un número en JavaScript y este sprint
 * dependería del de motion, que corre en paralelo en otro worktree.
 */

import {
  ALTO_PASTILLA_PX,
  DESCUENTO_NACIMIENTO_PX,
  UMBRAL_DE_LA_REFERENCIA,
  umbralPx,
} from '../navegacion'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DEL_SPRINT, leer } from './s3-archivos'
import { customPropsDe, resolver, sinComentarios, tokensDelTema } from './s3-css'
import { quitarComentarios } from './s3-escaneo'

const tokens = tokensDelTema()
const hoja = leer('src/app/v3/_estilos/navegacion.css')
const propiedades = customPropsDe(hoja)

/**
 * Resuelve una propiedad de la hoja evaluando `100svh` a un alto de viewport
 * dado. No es una aproximación: `svh` ES el alto del viewport, y fijarlo es lo
 * que permite comparar nuestro número contra el suyo, que se midió a 900.
 */
function resolverAAlto(nombre: string, altoDeViewport: number): number | null {
  const expresion = propiedades.get(nombre)
  if (expresion === undefined) return null
  const expandida = expresion.replace(/100svh/g, `${altoDeViewport}px`)
  return resolver(expandida, new Map([...tokens, ...propiedades].map(([k, v]) => [k, v.replace(/100svh/g, `${altoDeViewport}px`)])))?.n ?? null
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La hoja dice exactamente lo mismo que el módulo de datos')

const alto = 900
afirmarIgual(resolverAAlto('--nav-alto', alto), ALTO_PASTILLA_PX, 'la hoja compone el mismo alto de pastilla')
afirmarIgual(
  resolverAAlto('--nav-nacimiento', alto),
  alto - DESCUENTO_NACIMIENTO_PX,
  'y el mismo nacimiento',
)
afirmarIgual(
  resolverAAlto('--nav-umbral', alto),
  umbralPx(alto),
  'y el mismo umbral: 804px a 900 de viewport',
)

controlPositivo(
  'la resolución depende de los tokens, no de la cadena',
  '--spacing-6',
  (token) => {
    const guardado = tokens.get(token)
    tokens.set(token, '40px')
    const recalculado = resolverAAlto('--nav-umbral', alto)
    if (guardado !== undefined) tokens.set(token, guardado)
    return recalculado === umbralPx(alto)
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los números de la referencia NO están en el código')

const cuerpoDelSprint = ARCHIVOS_DEL_SPRINT.filter((a) => !a.includes('_lib/navegacion.ts'))
  .map((a) => (a.endsWith('.css') ? sinComentarios(leer(a)) : quitarComentarios(leer(a))))
  .join('\n')

for (const numero of [UMBRAL_DE_LA_REFERENCIA.nacimientoPx, UMBRAL_DE_LA_REFERENCIA.umbralPx]) {
  afirmar(
    !new RegExp(`\\b${numero}\\b`).test(cuerpoDelSprint),
    `el ${numero} de su héroe no aparece en el código del sprint`,
  )
}
afirmar(
  quitarComentarios(leer('src/app/v3/_lib/navegacion.ts')).includes('UMBRAL_DE_LA_REFERENCIA'),
  'los suyos viven en un solo lugar, rotulados como suyos, para poder comparar',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · NADA de este sprint depende del scroll')

const SENALES_DE_SCROLL: readonly [string, RegExp][] = [
  ['listener de scroll', /addEventListener\(\s*['"]scroll['"]/],
  ['useScroll', /\buseScroll\b/],
  ['useTransform', /\buseTransform\b/],
  ['ScrollTrigger', /\bScrollTrigger\b/],
  ['gsap', /\bgsap\b/],
  ['lenis', /\blenis\b/i],
  ['scroll-timeline', /\b(?:scroll|view|animation)-timeline\b/],
  ['scrollY', /\bscrollY\b/],
  ['IntersectionObserver', /\bIntersectionObserver\b/],
]

for (const [nombre, patron] of SENALES_DE_SCROLL) {
  const donde = ARCHIVOS_DEL_SPRINT.filter((a) =>
    patron.test(a.endsWith('.css') ? sinComentarios(leer(a)) : quitarComentarios(leer(a))),
  )
  afirmarIgual(donde, [], `ningún archivo usa ${nombre}`)
}

controlPositivo(
  'el buscador de señales de scroll ve una',
  "window.addEventListener('scroll', alScrollear)",
  (codigo) => !SENALES_DE_SCROLL.some(([, patron]) => patron.test(codigo)),
)

cerrar('s3-navegacion.invariant')
