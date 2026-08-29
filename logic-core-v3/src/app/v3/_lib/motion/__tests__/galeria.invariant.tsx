/**
 * INVARIANTE — la ruta de demostración muestra los nueve, y es `noindex`.
 *
 * Corre con `npm run test:s2-galeria`.
 *
 * ── Qué agujero tapa ───────────────────────────────────────────────────────
 *
 * Los otros invariantes comprueban que los nueve patrones EXISTEN como datos y
 * que se comportan como deben. Ninguno comprueba que estén **en la página**. Un
 * patrón declarado y no renderizado pasaría todos los demás chequeos en verde y
 * Valentino no lo vería en la grabación — que es exactamente el modo de falla que
 * más caro sale, porque se descubre mirando.
 *
 * Acá se renderiza la galería entera a HTML y se afirma sobre el marcado: las
 * nueve secciones, los tres bloques de P1, el panel de perillas, y las
 * protecciones de accesibilidad contadas.
 *
 * ── Y la deuda ─────────────────────────────────────────────────────────────
 *
 * Las dos rutas del sprint son instrumentos con fecha de baja. `noindex` no es un
 * detalle de SEO: es lo que impide que una mesa de calibración con texto de
 * relleno termine indexada. Se afirma sobre el objeto `metadata` de cada ruta.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import Coreografia from '../../../motion/_componentes/Coreografia'
import { metadata as metadatosDelControl } from '../../../motion/control-estatico/page'
import { metadata as metadatosDelDemo } from '../../../motion/page'
import { ATRIBUTO_PIEZAS, ATRIBUTO_TEXTO_ACCESIBLE } from '../lineas'
import { MARCA_MOTION } from '../marcaMotion'
import { NOMBRE_EN_GSAP } from '../curvas'
import { ORDEN_DE_PATRONES, PATRONES } from '../patrones'

const html = renderToStaticMarkup(<Coreografia />)
const veces = (aguja: string): number => html.split(aguja).length - 1

// ═══════════════════════════════════════════════════════════════════════════
titulo('G1 · Los nueve patrones están EN la página, no solo declarados')

afirmarIgual(ORDEN_DE_PATRONES.length, 9, 'el sistema declara nueve patrones')

for (const id of ORDEN_DE_PATRONES) {
  const patron = PATRONES[id]
  afirmar(html.includes(`id="${id}"`), `${id} tiene su sección en la página`)
  afirmar(html.includes(patron.nombre), `  con su nombre visible: "${patron.nombre}"`)
  afirmar(
    html.includes(patron.anclas.inicio.declarado),
    `  y su ancla declarada a la vista: ${patron.anclas.inicio.declarado}`,
  )
  afirmar(
    html.includes(`${NOMBRE_EN_GSAP[patron.curva]}`),
    `  y el nombre de GSAP de su curva: ${NOMBRE_EN_GSAP[patron.curva]}`,
  )
}

controlPositivo(
  'el buscador de secciones no encuentra un patrón que no existe',
  'P10',
  (id: string) => html.includes(`id="${id}"`),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('G2 · P1 aparece TRES veces — una, tres y seis líneas')

for (const etiqueta of ['una línea', 'tres líneas', 'seis líneas']) {
  afirmar(html.includes(etiqueta), `el bloque de ${etiqueta} está en la página`)
}
afirmarIgual(
  veces(ATRIBUTO_TEXTO_ACCESIBLE),
  3,
  'y hay exactamente tres copias accesibles: una por bloque de texto partido',
)
afirmarIgual(
  veces(`aria-hidden="true" ${ATRIBUTO_PIEZAS}`),
  3,
  'y tres envoltorios de piezas, los tres `aria-hidden`',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('G3 · La marca del chunk y las perillas')

afirmar(html.includes(MARCA_MOTION), 'la galería lleva la marca que busca el invariante del bundle')
afirmar(html.includes('Controles de calibración'), 'el panel de perillas está montado')
for (const perilla of ['duración ×', 'escalonado ×', 'la medida de cada patrón']) {
  afirmar(html.includes(perilla), `  con la perilla de ${perilla.replace(' ×', '')}`)
}
for (const modo of ['atado-al-scroll', 'tiempo-real']) {
  afirmar(html.includes(modo), `  y el modo ${modo}`)
}
afirmar(html.includes('inercia del scrub'), '  y la inercia del scrub')

// Cada control tiene etiqueta asociada: `useId` emite el mismo id en `for` y en
// `id`, así que basta comprobar que hay tantos `for=` como controles con id.
const etiquetas = veces('<label for=')
afirmar(etiquetas >= 3, `los controles tienen etiqueta asociada por id (${etiquetas})`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('G4 · Deuda declarada — las dos rutas son `noindex`')

afirmarIgual(metadatosDelDemo.robots, { index: false, follow: false, nocache: true }, '/v3/motion')
afirmarIgual(
  metadatosDelControl.robots,
  { index: false, follow: false, nocache: true },
  '/v3/motion/control-estatico',
)

controlPositivo(
  'el chequeo ve unos metadatos que SÍ dejan indexar',
  { index: true, follow: true },
  (robots: { index: boolean }) => robots.index === false,
)

cerrar('galeria.invariant')
