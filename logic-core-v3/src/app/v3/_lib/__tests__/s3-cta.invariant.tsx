/**
 * INVARIANTE — el rollover aplica los valores medidos, y la segunda copia no
 * ensucia el árbol de accesibilidad.
 *
 * Corre con `npm run test:s3-cta`.
 *
 * ── El defecto que se corrige, y cómo se prueba que se corrigió ───────────
 *
 * El rollover necesita dos copias del rótulo en el DOM. En la referencia las
 * dos son visibles para el árbol de accesibilidad y el rótulo se anuncia
 * duplicado y **sin espacio**: un CTA de 20 caracteres reporta 40 y 5 palabras
 * en vez de 3, porque la última palabra de la primera copia y la primera de la
 * segunda quedan pegadas.
 *
 * Acá la segunda copia va `aria-hidden`. Y la afirmación de que eso alcanza
 * **no vale sola**: pasaría en verde también si `rotuloAccesible()` estuviera
 * ciega. Por eso el control positivo corre la MISMA función sobre el MISMO
 * marcado con los `aria-hidden` borrados, y tiene que ver el rótulo duplicado
 * con sus 5 palabras. Ahí la corrección queda demostrada en los dos sentidos.
 *
 * ⚠ NOTA DE ARNÉS: `tsx` compila el JSX con el runtime clásico —emite
 * `React.createElement` y no importa nada—, así que los componentes, que no
 * importan React, lo buscan en el ámbito global. Por eso la asignación de
 * abajo. Es del arnés y no del código de la aplicación: `next build` usa el
 * runtime automático y no la necesita.
 */

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Cta, CtaEnlace } from '../../_componentes/chrome/Cta'
import {
  CRECIMIENTO_VENTANA_PX,
  palabrasDelRotulo,
  ROLLOVER_MEDIDO,
  rotuloAccesible,
  ROTULO_DE_MUESTRA,
} from '../cta'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { leer } from './s3-archivos'
import { customPropsDe, resolver, tokensDelTema } from './s3-css'

;(globalThis as unknown as { React: typeof React }).React = React

const tokens = tokensDelTema()
const hoja = leer('src/app/v3/_estilos/cta.css')
const propiedades = customPropsDe(hoja)

/** Resuelve una propiedad de la hoja del CTA contra los tokens del sistema. */
function resolverDelCta(nombre: string): number | null {
  const expresion = propiedades.get(nombre)
  if (expresion === undefined) return null
  return resolver(expresion, tokens)?.n ?? null
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El rótulo accesible es el rótulo, una sola vez')

const marcado = renderToStaticMarkup(<Cta rotulo={ROTULO_DE_MUESTRA} />)
const marcadoDelEnlace = renderToStaticMarkup(<CtaEnlace href="#x" rotulo={ROTULO_DE_MUESTRA} />)

afirmarIgual(rotuloAccesible(marcado), ROTULO_DE_MUESTRA, 'el botón anuncia el rótulo exacto')
afirmarIgual(palabrasDelRotulo(marcado), 3, '  con sus 3 palabras')
afirmarIgual(rotuloAccesible(marcado).length, 14, `  y sus 14 caracteres`)
afirmarIgual(rotuloAccesible(marcadoDelEnlace), ROTULO_DE_MUESTRA, 'la variante enlace, lo mismo')

afirmar(
  /data-parte="copia-b"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-parte="copia-b"/.test(marcado),
  'el `aria-hidden` está en la copia B, que es la copia visual',
)
afirmar(marcado.split(ROTULO_DE_MUESTRA).length - 1 === 2, 'y las dos copias siguen en el DOM: el rollover las necesita')

// ── EL CONTROL POSITIVO ────────────────────────────────────────────────────
// La misma función, el mismo marcado, sin la corrección. Tiene que ver el
// defecto de ellos: 28 caracteres y 5 palabras en vez de 14 y 3.
const marcadoSinCorreccion = marcado.replace(/\s*aria-hidden="true"/g, '')
const rotuloRoto = rotuloAccesible(marcadoSinCorreccion)

afirmarIgual(palabrasDelRotulo(marcadoSinCorreccion), 5, '[control positivo] sin aria-hidden son 5 palabras')
afirmarIgual(rotuloRoto.length, 28, '[control positivo] y 28 caracteres — el doble, pegado')
afirmar(
  rotuloRoto.includes('trabajoVer'),
  '[control positivo] con las dos palabras fusionadas, que es la forma exacta del defecto medido',
  rotuloRoto,
)

controlPositivo(
  'la cuenta de palabras no ignora un subárbol que NO está oculto',
  '<span><span>Ver el trabajo</span><span>Ver el trabajo</span></span>',
  (html) => palabrasDelRotulo(html) === 3,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La geometría medida está aplicada, valor por valor')

const geometria: readonly [string, string][] = [
  ['--cta-giro-salida', `${ROLLOVER_MEDIDO.salida.giroGrados}deg`],
  ['--cta-salida-x', `${ROLLOVER_MEDIDO.salida.x}px`],
  ['--cta-salida-y', `${ROLLOVER_MEDIDO.salida.y}px`],
  ['--cta-giro-entrada', `${ROLLOVER_MEDIDO.entrada.giroGrados}deg`],
  ['--cta-entrada-x', `${ROLLOVER_MEDIDO.entrada.x}px`],
  ['--cta-entrada-y', `${ROLLOVER_MEDIDO.entrada.y}px`],
  ['--cta-recorte-inicial', ROLLOVER_MEDIDO.entrada.recorteInicial],
  ['--cta-recorte-final', ROLLOVER_MEDIDO.entrada.recorteFinal],
]

for (const [nombre, esperado] of geometria) {
  afirmarIgual(propiedades.get(nombre), esperado, `${nombre} = lo medido`)
}

afirmar(
  hoja.includes('rotate(var(--cta-giro-salida)) translate(var(--cta-salida-x), var(--cta-salida-y))'),
  'la copia A sale rotando y trasladándose, con los dos por token',
)
afirmar(
  hoja.includes('clip-path: var(--cta-recorte-final)'),
  'y la copia B entra barriendo el clip-path',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los tiempos se COMPONEN desde las cuatro duraciones del sistema')

afirmarIgual(
  resolverDelCta('--cta-intercambio'),
  ROLLOVER_MEDIDO.duraciones.intercambioMs,
  'el intercambio resuelve a los 1300ms medidos',
)
afirmarIgual(
  resolverDelCta('--cta-subrayado-duracion'),
  ROLLOVER_MEDIDO.subrayado.duracionMs,
  'el subrayado, a los 600ms',
)
afirmarIgual(
  resolverDelCta('--cta-subrayado-retardo'),
  ROLLOVER_MEDIDO.subrayado.retardoMs,
  'y su retardo, a los 400ms',
)
afirmarIgual(
  resolver('var(--duracion-rapida)', tokens)?.n,
  ROLLOVER_MEDIDO.duraciones.ventanaMs,
  'la ventana usa --duracion-rapida, que son los 300ms medidos',
)

// Que la composición dependa de verdad de los tokens: si el sistema mueve una
// duración, la cuenta se mueve. Sin esto, `calc()` sería decoración.
controlPositivo(
  'la resolución del intercambio depende del token, no de la cadena',
  '--duracion-rapida',
  (token) => {
    const guardado = tokens.get(token)
    tokens.set(token, '100ms')
    const recalculado = resolverDelCta('--cta-intercambio')
    if (guardado !== undefined) tokens.set(token, guardado)
    return recalculado === ROLLOVER_MEDIDO.duraciones.intercambioMs
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La ventana crece exactamente lo medido')

const reposo = resolverDelCta('--cta-ventana-reposo')
const hover = resolverDelCta('--cta-ventana-hover')
afirmarIgual(reposo, 24, 'el reposo es nuestra caja de línea: 15px × 1,6')
afirmarIgual(hover, 28, 'y el hover le suma la unidad base')
afirmarIgual(
  hover !== null && reposo !== null ? hover - reposo : null,
  CRECIMIENTO_VENTANA_PX,
  'el crecimiento es el medido: 28,5 − 24,5 = 4,0px exactos',
)
afirmarIgual(resolver('var(--spacing-1)', tokens)?.n, CRECIMIENTO_VENTANA_PX, '  que es --spacing-1')
afirmarIgual(
  resolverDelCta('--cta-subrayado-alto'),
  ROLLOVER_MEDIDO.subrayado.altoPx,
  'el subrayado mide los 3px medidos, como tres filetes',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El CTA es siempre tinta, nunca acento')

afirmar(hoja.includes('color: var(--color-tinta)'), 'el rótulo es la tinta del sistema')
afirmar(
  hoja.includes('background-color: var(--color-tinta)'),
  'y el subrayado también',
)
afirmarIgual(
  [...hoja.matchAll(/--color-acento/g)].map((m) => m[0]),
  [],
  'la hoja del CTA no menciona el acento ni una vez',
)

controlPositivo(
  'el buscador de acento vería uno si estuviera',
  '[data-v3] [data-pieza="cta"] { color: var(--color-acento); }',
  (css) => [...css.matchAll(/--color-acento/g)].length === 0,
)

cerrar('s3-cta.invariant')
