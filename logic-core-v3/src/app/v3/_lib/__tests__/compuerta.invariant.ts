/**
 * INVARIANTE — la compuerta de 1025: umbral, SSR e hidratación.
 *
 * Corre con `npm run test:s1-compuerta`.
 *
 * Éste NO es el invariante del bundle: acá se afirma lo que se puede afirmar
 * sin build —el umbral, que el render de servidor sale VACÍO, y que el
 * escenario está fuera del flujo—. Que el chunk no viaje en la carga inicial
 * se afirma en `bundle.invariant.ts`, sobre la salida del build, que es el
 * único lugar donde esa pregunta se puede contestar.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CLASES_FUERA_DE_FLUJO, CONSULTA_ESCENARIO, ESCENARIO_MIN_ANCHO_PX, snapshotServidor } from '../compuerta'
import { EscenarioCompuerta } from '../../_componentes/EscenarioCompuerta'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

titulo('1 · El umbral: 1025px exactos, por ancho')

afirmarIgual(ESCENARIO_MIN_ANCHO_PX, 1025, 'el umbral es 1025, medido y no interpolado')
afirmarIgual(CONSULTA_ESCENARIO, '(min-width: 1025px)', 'la consulta es de ANCHO')
afirmar(!/hover|pointer|coarse/.test(CONSULTA_ESCENARIO), 'no es por táctil: ni `hover`, ni `pointer`, ni `coarse`')

controlPositivo(
  'el chequeo de "por ancho" ve una consulta táctil',
  '(pointer: coarse)',
  (consulta) => !/hover|pointer|coarse/.test(consulta),
)

titulo('2 · SSR: el servidor no renderiza escenario, y por eso no hay mismatch')

afirmarIgual(snapshotServidor(), false, 'el snapshot de servidor es `false`')

/**
 * El render de servidor de la compuerta tiene que salir VACÍO.
 *
 * Es la mitad de la respuesta a la hidratación y la única que se puede medir
 * sin navegador: si el servidor emitiera algo, el cliente tendría que
 * coincidir con ese algo en el primer render.
 * La otra mitad —que el PRIMER render de cliente también sale vacío— la
 * garantiza `useSyncExternalStore`, que usa `getServerSnapshot` durante la
 * hidratación. Eso no se puede afirmar sin un navegador; lo que sí se afirma
 * acá es que el hook use ese snapshot y no lea `window` durante el render.
 */
// `createElement` y no una llamada directa: llamar al componente como función
// corre sus hooks fuera de un render y React lo rechaza. Lo que hay que medir
// es lo que produce el RENDER, no lo que devuelve la función.
const marcado = renderToStaticMarkup(createElement(EscenarioCompuerta))
afirmarIgual(marcado, '', 'el render de servidor de la compuerta sale vacío')

controlPositivo(
  'el chequeo de "sale vacío" ve un render que NO está vacío',
  '<div data-escenario="…"></div>',
  (html) => html === '',
)

titulo('3 · El hook no lee `window` durante el render')

const hook = leer('src/app/v3/_lib/useAnchoMinimo.ts')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
  .join('\n')

afirmar(hook.includes('useSyncExternalStore'), 'usa `useSyncExternalStore`, no `useState` + efecto')
afirmar(hook.includes('snapshotServidor'), 'le pasa el snapshot de servidor')
afirmar(!/useState|useEffect/.test(hook), 'no hay `useState` ni `useEffect`: cero render en cascada')
afirmar(!/window\.innerWidth/.test(hook), 'no lee `window.innerWidth` — eso sí daría mismatch')

const compuerta = leer('src/app/v3/_componentes/EscenarioCompuerta.tsx')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
  .join('\n')

afirmar(compuerta.includes("{ ssr: false }"), 'el import perezoso va con `ssr: false`')
afirmar(/dynamic\(\(\) => import\('\.\/EscenarioDePrueba'\)/.test(compuerta), 'y es `next/dynamic`, no un import estático')
afirmar(compuerta.includes('return null'), 'abajo del umbral devuelve `null`, no un placeholder con caja')

controlPositivo(
  'el chequeo de import perezoso ve un import estático',
  "import EscenarioDePrueba from './EscenarioDePrueba'",
  (fuente) => /dynamic\(\(\) => import\('\.\/EscenarioDePrueba'\)/.test(fuente),
)

titulo('4 · Sin salto de layout: el escenario no ocupa lugar en el flujo')

const clases = CLASES_FUERA_DE_FLUJO.split(' ')
afirmar(clases.includes('fixed'), '`fixed` — no participa del flujo del documento')
afirmar(clases.includes('inset-0'), '`inset-0` — se ancla al viewport, no a un hermano')
afirmar(clases.includes('pointer-events-none'), '`pointer-events-none` — es ornamento y no se come un click')
afirmar(clases.includes('z-0'), '`z-0` — abajo de los paneles, que van en `z-10`')
afirmar(
  !clases.some((c) => /^(h-|w-|min-h-|min-w-|m[trblxy]?-|p[trblxy]?-)/.test(c)),
  'no declara alto, ancho, margen ni padding: nada que pueda empujar una caja',
)

const escenario = leer('src/app/v3/_componentes/EscenarioDePrueba.tsx')
afirmar(escenario.includes('CLASES_FUERA_DE_FLUJO'), 'el escenario consume esa constante y no clases sueltas')
afirmar(!/from 'three'|@react-three|useFrame|Canvas/.test(escenario), 'el marcador de posición no importa la escena 3D')
afirmar(!/animate|transition-|motion\/react|framer/.test(escenario), 'y no lleva ninguna animación')

controlPositivo(
  'el chequeo de "fuera de flujo" ve una clase que sí ocupa lugar',
  'relative h-svh inset-0',
  (lista) => {
    const c = lista.split(' ')
    return c.includes('fixed') && !c.some((x) => /^(h-|w-|min-h-)/.test(x))
  },
)

titulo('5 · El pinneado es CSS, no JS')

const pinneado = leer('src/app/v3/_componentes/PanelPinneado.tsx')
afirmar(pinneado.includes('sticky top-0'), 'usa `position: sticky` de CSS')
afirmar(!/use client|useEffect|useState|scroll|ScrollTrigger|gsap|lenis/i.test(pinneado.replace(/\/\*[\s\S]*?\*\//g, '')), 'sin `use client`, sin hooks, sin librería de scroll: cero JS')

const smooth = leer('src/components/layout/SmoothScroll.tsx')
afirmar(smooth.includes("pathname.startsWith('/v3')"), '/v3 queda fuera de Lenis: el pinneado se juzga con scroll nativo')

cerrar('compuerta.invariant')
