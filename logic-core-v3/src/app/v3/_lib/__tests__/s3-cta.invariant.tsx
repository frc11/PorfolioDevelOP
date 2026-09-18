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
 * ⚠️ **Modo pulido sacó la geometría** (rotate/translate/clip-path del
 * rollover, el crecimiento en px de la ventana, y el hueco del subrayado):
 * era composición. Queda la paridad de accesibilidad, que los tiempos se
 * compongan desde tokens, que el CTA sea siempre tinta y en qué regla CSS
 * vive cada transición.
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
  palabrasDelRotulo,
  ROLLOVER_MEDIDO,
  rotuloAccesible,
  ROTULO_DE_MUESTRA,
} from '../cta'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { leer } from './s3-archivos'
import { customPropsDe, declaracionesDe, reglas, resolver, tokensDelTema } from './s3-css'

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
titulo('3 · Los tiempos se COMPONEN desde las cuatro duraciones del sistema')

afirmarIgual(
  resolverDelCta('--cta-intercambio'),
  ROLLOVER_MEDIDO.duraciones.intercambioMs,
  'el intercambio resuelve a los 1300ms medidos',
)
afirmarIgual(
  resolverDelCta('--cta-subrayado-duracion'),
  ROLLOVER_MEDIDO.subrayado.duracionMs,
  'cada capa del subrayado, a los 700ms (BOTON-1 §2.3)',
)
afirmarIgual(
  resolverDelCta('--cta-subrayado-desfase'),
  ROLLOVER_MEDIDO.subrayado.desfaseMs,
  'y el desfase entre las dos capas, a los 100ms',
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El intercambio se anima al ENTRAR y se repone en UN CUADRO al salir')

/**
 * La diferencia entera entre «el rótulo vuelve» y «el rótulo se queda» es
 * DÓNDE se declara la duración. Con la transición en la regla base, la vuelta
 * se anima igual que la ida —98 cuadros medidos en `/v3`—. Con la transición
 * en la regla de ESTADO, al soltar la duración vuelve a su valor inicial
 * (`0s`), el navegador cancela la transición en curso y repone el reposo en un
 * cuadro: es lo que hace la referencia, y BOTON-1 §1.2 lo midió en una sola
 * muestra, a +4,4 ms del `mouseleave`.
 *
 * Esto NO se puede afirmar leyendo un valor: hay que saber en qué REGLA está
 * escrito. Por eso acá se parsea la hoja y se separan las declaraciones que
 * aplican en reposo de las que aplican sólo en estado.
 */
const bloquesDeLaHoja = reglas(hoja)

/**
 * ⚠ El corte por coma NO sirve para separar un selector: el de estado lleva
 * `:is(a, b)` y partirlo por todas las comas rompería el grupo en dos partes
 * que no son selectores. Se parte por comas de NIVEL CERO.
 */
function partirEnNivelCero(selector: string): string[] {
  const partes: string[] = []
  let profundidad = 0
  let actual = ''
  for (const c of selector) {
    if (c === '(') profundidad += 1
    if (c === ')') profundidad -= 1
    if (c === ',' && profundidad === 0) {
      partes.push(actual.trim())
      actual = ''
      continue
    }
    actual += c
  }
  if (actual.trim().length > 0) partes.push(actual.trim())
  return partes
}

/** Las declaraciones que la hoja le da a un selector, en reposo o en estado. */
function declaracionesPara(
  coincide: (parte: string) => boolean,
  enEstado: boolean,
): Map<string, string> {
  const salida = new Map<string, string>()
  for (const r of bloquesDeLaHoja) {
    if (!partirEnNivelCero(r.selector).some(coincide)) continue
    if (r.selector.includes(':not(:disabled)') !== enEstado) continue
    for (const d of declaracionesDe(r.cuerpo)) salida.set(d.prop, d.valor)
  }
  return salida
}

const laCopiaA = (p: string): boolean => p.includes('[data-parte="copia-a"]')
const copiasEnReposo = declaracionesPara(laCopiaA, false)
const copiasEnEstado = declaracionesPara(laCopiaA, true)

for (const prop of ['transition-property', 'transition-duration', 'transition-timing-function']) {
  afirmarIgual(copiasEnReposo.get(prop), undefined, `las copias NO declaran ${prop} en reposo`)
  afirmar(copiasEnEstado.get(prop) !== undefined, `  y SÍ la declaran en la regla de estado`)
}
afirmarIgual(
  copiasEnEstado.get('transition-duration'),
  'var(--cta-intercambio)',
  'la duración del intercambio vive en el estado, que es lo que hace instantánea la vuelta',
)

// La ventana es la excepción MEDIDA: su vuelta sí se anima (15 muestras en la
// referencia contra 1 de las copias), así que su transición se queda en la base.
const laVentana = (p: string): boolean => p.endsWith('[data-parte="ventana"]')
afirmar(
  declaracionesPara(laVentana, false).get('transition-duration') !== undefined,
  'la ventana, en cambio, conserva su transición en la base: su vuelta SÍ se anima',
)

controlPositivo(
  'el separador de reglas no confunde una declaración de estado con una de reposo',
  '[data-v3] [data-pieza="cta"]:not(:disabled):is(:hover) [data-parte="copia-a"] { transition-duration: 9s; }',
  (css) => !reglas(css)[0].selector.includes(':not(:disabled)'),
)

cerrar('s3-cta.invariant')
