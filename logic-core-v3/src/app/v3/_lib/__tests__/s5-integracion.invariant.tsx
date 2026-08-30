/**
 * INVARIANTE TRANSVERSAL — la integración: las cuatro montadas, en orden, con
 * su superficie, y la ruta declarada como deuda con fecha de baja.
 *
 * Corre con `npm run test:s5-integracion`.
 *
 * ── Qué comprueba que ninguna sección podía comprobar ─────────────────────
 *
 * El ORDEN y el RECORRIDO. Una sección sabe cuál es ella; ninguna sabe que las
 * cuatro están en el orden del recorrido ni que sus superficies dibujan los
 * tres momentos de escena. Eso sólo se ve desde arriba, y por eso está acá.
 *
 * ── Y una que es del sprint, no del código ────────────────────────────────
 *
 * La ruta de demostración es **deuda con fecha de baja**, y eso tiene dos
 * consecuencias verificables: lleva `noindex` —una ruta interna con texto de
 * relleno indexada es una página publicada que no dice nada— y está en el
 * padrón de rutas de demo de S4, que es lo que hace que el presupuesto de peso
 * heredado escale sola con ella y que la predicción del mapa la incluya.
 */

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProveedorDeCoreografia } from '../../secciones-a/_contrato/coreografia'
import { REGISTRO } from '../../secciones-a/_contrato/registro'
import { IDS_DE_SECCION_A } from '../../secciones-a/_contrato/forma'
import { SECCIONES } from '../secciones'
import { SUPERFICIES } from '../superficies'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RUTAS_DE_DEMO } from './s4-rutas-de-demo'
import { leer } from './s5-archivos'

function marcar(indice: number): string {
  const { Componente, seccion } = REGISTRO[indice]
  return renderToStaticMarkup(
    <MotionConfig reducedMotion="never">
      <ProveedorDeCoreografia modo="nunca">
        <Componente seccion={seccion} />
      </ProveedorDeCoreografia>
    </MotionConfig>,
  )
}

const RUTA = 'src/app/v3/secciones-a/page.tsx'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El orden es el del recorrido, y hay una sola fuente')

afirmarIgual(
  REGISTRO.map((m) => m.id),
  [...IDS_DE_SECCION_A],
  'el registro está en el orden declarado del lane',
)
afirmarIgual(
  SECCIONES.slice(0, 4).map((s) => s.id),
  [...IDS_DE_SECCION_A],
  '  y ése es el orden de las primeras cuatro de `secciones.ts`',
)
afirmarIgual(
  REGISTRO.map((m) => m.seccion.id),
  REGISTRO.map((m) => m.id),
  '  y cada módulo trae la entrada de tabla que le corresponde',
)

controlPositivo(
  'el comparador de orden ve una permutación',
  ['quienes-somos', 'hero', 'numeros', 'trabajos'],
  (orden: string[]) => JSON.stringify(orden) === JSON.stringify([...IDS_DE_SECCION_A]),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Cada sección pinta la superficie que le tocó')

const ESPERADAS: readonly [string, string][] = [
  ['hero', 'papel-transparente'],
  ['quienes-somos', 'papel-opaco'],
  ['numeros', 'papel-opaco'],
  ['trabajos', 'oscuro-opaco'],
]

for (let i = 0; i < REGISTRO.length; i++) {
  const { id, seccion } = REGISTRO[i]
  const html = marcar(i)
  const esperada = ESPERADAS.find((e) => e[0] === id)?.[1]
  afirmarIgual(seccion.superficie, esperada, `\`${id}\` — la tabla le asigna \`${esperada}\``)
  afirmar(html.includes(`data-superficie="${esperada}"`), `  y el marcado la escribe`)
  afirmar(html.includes(`data-panel="${id}"`), `  con su \`data-panel\``)
  afirmar(html.includes(`data-seccion-a="${id}"`), `  y la marca del lane`)

  const definicion = SUPERFICIES[seccion.superficie]
  if (definicion.invertida) {
    afirmar(html.includes('data-seccion="invertida"'), `  y da vuelta el tema con \`data-seccion="invertida"\``)
  } else {
    afirmar(!html.includes('data-seccion="invertida"'), `  y NO da vuelta el tema`)
  }
  if (definicion.dejaVerElCanvas) {
    afirmar(!html.includes('bg-fondo'), `  y no pinta fondo: el canvas se ve a través`)
  }

  const secciones = (html.match(/<section[\s>]/g) ?? []).length
  afirmarIgual(secciones, 1, `  y emite exactamente UNA <section>`)
}

controlPositivo(
  'el lector de superficies ve un panel con la equivocada',
  '<section data-panel="hero" data-superficie="papel-opaco">',
  (html: string) => html.includes('data-superficie="papel-transparente"'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La sección pinneada se clava, y es la única del lane')

const pinneadas = REGISTRO.filter((m) => m.seccion.pinneada !== undefined)
afirmarIgual(pinneadas.map((m) => m.id), ['trabajos'], 'una sola secuencia pinneada en el lane')

for (let i = 0; i < REGISTRO.length; i++) {
  const html = marcar(i)
  const modo = REGISTRO[i].seccion.pinneada
  const tienePin = html.includes(`data-pinneado="${modo}"`)
  afirmarIgual(
    tienePin,
    modo !== undefined,
    `\`${REGISTRO[i].id}\` — el sticky está exactamente donde la tabla dice`,
  )
}

controlPositivo(
  'el detector de pinneo vería un sticky donde no corresponde',
  '<div data-pinneado="siempre">',
  (html: string) => !html.includes('data-pinneado="siempre"'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La ruta de demostración: noindex, fecha de baja y las cuatro montadas')

const fuenteDeLaRuta = leer(RUTA)

afirmar(/robots\s*:\s*\{[^}]*index\s*:\s*false/.test(fuenteDeLaRuta), 'la ruta declara `index: false`')
afirmar(/follow\s*:\s*false/.test(fuenteDeLaRuta), '  y `follow: false`')
afirmar(/nocache\s*:\s*true/.test(fuenteDeLaRuta), '  y `nocache: true`')
afirmar(/FECHA DE BAJA/i.test(fuenteDeLaRuta), '  y declara su FECHA DE BAJA en el docblock')
afirmar(/\b20\d\d-\d\d-\d\d\b/.test(fuenteDeLaRuta), '  con una fecha concreta, no "algún día"')

/** La ruta recorre el registro; no enumera las cuatro a mano. Es lo que hace
 *  que agregar o mover una sección sea editar el registro y nada más. */
afirmar(/REGISTRO/.test(fuenteDeLaRuta), 'la ruta monta las cuatro recorriendo el REGISTRO')

const enPadron = RUTAS_DE_DEMO.filter((r) => r.ruta === '/v3/secciones-a')
afirmarIgual(enPadron.length, 1, 'la ruta está declarada en el padrón de rutas de demo de S4')
afirmar(
  enPadron[0]?.motivo.length > 0,
  '  con su motivo escrito',
  enPadron[0]?.motivo,
)
afirmar(
  RUTAS_DE_DEMO.length === 6,
  `el padrón tiene ${RUTAS_DE_DEMO.length} rutas de demo: el presupuesto de peso heredado escala con ellas`,
  RUTAS_DE_DEMO.map((r) => r.ruta).join(' · '),
)

controlPositivo(
  'el lector de `noindex` ve una ruta sin él',
  "export const metadata = { title: 'x' }",
  (fuente: string) => /robots\s*:\s*\{[^}]*index\s*:\s*false/.test(fuente),
)

cerrar('s5-integracion.invariant')
