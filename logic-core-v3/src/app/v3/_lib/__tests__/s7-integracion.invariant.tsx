/**
 * INVARIANTE — LA INTEGRACIÓN: las OCHO montadas, en orden, con su superficie,
 * su pinneo y una sola fuente para todo.
 *
 * Corre con `npm run test:s7-integracion`.
 *
 * ── Qué comprueba que ningún instrumento anterior podía ───────────────────
 *
 * Los dos lanes tenían su propio invariante transversal y cada uno veía cuatro
 * secciones. **El recorrido de escena —aparece, desaparece y vuelve— sólo
 * existe sobre las ocho**: con cuatro no se puede afirmar que la escena vuelve,
 * porque el tramo donde vuelve estaba en el otro lane.
 *
 * ── Y una cosa que es del sprint, no del código ───────────────────────────
 *
 * Que las dos rutas de demostración se borraron y salieron del padrón. Es lo
 * que hace medible el efecto sobre el peso heredado, y la cardinalidad **se
 * deriva**: el error que este proyecto ya corrigió dos veces era afirmar un
 * número escrito a mano.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'

import { REGISTRO } from '../../_secciones/_contrato/registro'
import { ATRIBUTO_DE_SECCION, IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import { SECCIONES, SECCIONES_QUE_DEJAN_VER_LA_ESCENA } from '../secciones'
import { SUPERFICIES } from '../superficies'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RUTAS_BORRADAS, RUTAS_DE_DEMO } from './s4-rutas-de-demo'
import { RAIZ, leer } from './s5-archivos'

const RUTA_DEL_HOME = 'src/app/v3/page.tsx'

function marcarSeccion(i: number): string {
  const { Componente, seccion } = REGISTRO[i]
  return marcar(<Componente seccion={seccion} />, { anima: false })
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El registro son LAS OCHO, en el orden de la tabla, y una sola vez')

afirmarIgual(
  REGISTRO.map((m) => m.id),
  [...IDS_DE_SECCION],
  'el registro recorre la tabla del sitio: mismo orden, mismas secciones',
)
afirmarIgual(REGISTRO.length, SECCIONES.length, '  y no le falta ni le sobra ninguna')
afirmarIgual(
  REGISTRO.map((m) => m.seccion.id),
  REGISTRO.map((m) => m.id),
  '  y cada entrada trae la fila de tabla que le corresponde',
)
afirmarIgual(
  new Set(REGISTRO.map((m) => m.Componente)).size,
  REGISTRO.length,
  '  y ocho componentes distintos: ninguna sección se monta dos veces',
)

controlPositivo(
  'el comparador de orden ve una permutación',
  [...IDS_DE_SECCION].reverse(),
  (orden: string[]) => JSON.stringify(orden) === JSON.stringify([...IDS_DE_SECCION]),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Cada sección pinta la superficie que la tabla le asigna')

for (let i = 0; i < REGISTRO.length; i++) {
  const { id, seccion } = REGISTRO[i]
  const html = marcarSeccion(i)
  afirmar(
    html.includes(`data-superficie="${seccion.superficie}"`),
    `\`${id}\` — el marcado escribe \`${seccion.superficie}\``,
  )
  afirmar(html.includes(`data-panel="${id}"`), `  con su \`data-panel\``)
  afirmar(html.includes(`${ATRIBUTO_DE_SECCION}="${id}"`), `  y la marca de sección`)

  const definicion = SUPERFICIES[seccion.superficie]
  if (definicion.invertida) {
    afirmar(html.includes('data-seccion="invertida"'), `  y da vuelta el tema`)
  } else {
    afirmar(!html.includes('data-seccion="invertida"'), `  y NO da vuelta el tema`)
  }
  if (definicion.dejaVerElCanvas) {
    afirmar(!html.includes('bg-fondo'), `  y no pinta fondo: el canvas se ve a través`)
  }

  afirmarIgual((html.match(/<section[\s>]/g) ?? []).length, 1, `  y emite exactamente UNA <section>`)
}

controlPositivo(
  'el lector de superficies ve un panel con la equivocada',
  '<section data-panel="hero" data-superficie="papel-opaco">',
  (html: string) => html.includes('data-superficie="papel-transparente"'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL RECORRIDO DE ESCENA — aparece, desaparece y vuelve')

/**
 * Es lo que ninguno de los dos lanes podía afirmar. Tres momentos de escena, no
 * ocho: si los ocho paneles dejaran ver el canvas, el canvas dejaría de ser un
 * acontecimiento y pasaría a ser el fondo.
 */
const transparentes = SECCIONES.filter((s) => SUPERFICIES[s.superficie].dejaVerElCanvas).map(
  (s) => s.id,
)
afirmarIgual(
  transparentes,
  [...SECCIONES_QUE_DEJAN_VER_LA_ESCENA],
  'las secciones que dejan ver el canvas son las que la tabla deriva',
)
afirmar(
  transparentes.length > 0 && transparentes.length < SECCIONES.length,
  `${transparentes.length} de ${SECCIONES.length} secciones dejan ver la escena: aparece y desaparece`,
  transparentes.join(' · '),
)

/** El recorrido tiene que VOLVER: hay una opaca entre dos transparentes. */
const indices = transparentes.map((id) => SECCIONES.findIndex((s) => s.id === id))
afirmar(
  indices.length >= 2 && indices[indices.length - 1] - indices[0] > indices.length - 1,
  'y VUELVE: entre la primera y la última transparente hay al menos una opaca',
  `posiciones ${indices.join(', ')} sobre ${SECCIONES.length}`,
)

controlPositivo(
  'el detector de "vuelve" ve un recorrido donde las transparentes son contiguas',
  [0, 1],
  (is: number[]) => is.length >= 2 && is[is.length - 1] - is[0] > is.length - 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las secuencias pinneadas se clavan, y son las que la tabla declara')

const pinneadas = REGISTRO.filter((m) => m.seccion.pinneada !== undefined)
afirmarIgual(
  pinneadas.map((m) => m.id),
  ['trabajos', 'servicios'],
  'DOS secuencias pinneadas — y Servicios entra por la corrección de la tabla de este sprint',
)

for (let i = 0; i < REGISTRO.length; i++) {
  const html = marcarSeccion(i)
  const modo = REGISTRO[i].seccion.pinneada
  afirmarIgual(
    html.includes(`data-pinneado="${modo}"`),
    modo !== undefined,
    `\`${REGISTRO[i].id}\` — el sticky está exactamente donde la tabla dice`,
  )
}

/** El hijo pegado mide UNA pantalla. De ahí sale la cuenta de ritmo. */
for (const m of pinneadas) {
  const html = marcarSeccion(REGISTRO.indexOf(m))
  const clase = m.seccion.pinneada === 'siempre' ? 'h-svh' : 'escritorio:h-svh'
  afirmar(html.includes(clase), `\`${m.id}\` — su hijo pegado mide una pantalla (\`${clase}\`)`)
}

controlPositivo(
  'el detector de pinneo vería un sticky donde no corresponde',
  '<div data-pinneado="siempre">',
  (html: string) => !html.includes('data-pinneado="siempre"'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La ruta del home: recorre el registro y no lista secciones a mano')

const fuenteDelHome = leer(RUTA_DEL_HOME)

afirmar(/robots\s*:\s*\{[^}]*index\s*:\s*false/.test(fuenteDelHome), '`/v3` declara `index: false`')
afirmar(/follow\s*:\s*false/.test(fuenteDelHome), '  y `follow: false`')
afirmar(/nocache\s*:\s*true/.test(fuenteDelHome), '  y `nocache: true`')

/**
 * La ruta monta el árbol de contenido y la compuerta, y nada más. Que no nombre
 * una sección es la propiedad: mover el recorrido tiene que ser editar la tabla.
 */
const nombradas = [...IDS_DE_SECCION].filter((id) =>
  new RegExp(`['"\`]${id}['"\`]`).test(fuenteDelHome),
)
afirmarIgual(nombradas, [], 'la ruta no nombra una sola sección: recorre el registro')
afirmar(/CompuertaDelHome/.test(fuenteDelHome), 'y la envuelve en la compuerta, una sola vez')
afirmarIgual(
  (fuenteDelHome.match(/<CompuertaDelHome/g) ?? []).length,
  1,
  '  exactamente una: la compuerta se resuelve arriba, no ocho veces',
)

controlPositivo(
  'el lector de `noindex` ve una ruta sin él',
  "export const metadata = { title: 'x' }",
  (fuente: string) => /robots\s*:\s*\{[^}]*index\s*:\s*false/.test(fuente),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Las dos rutas de demostración se borraron, y el padrón lo dice')

for (const borrada of RUTAS_BORRADAS) {
  const carpeta = borrada.ruta.replace('/v3/', 'src/app/v3/')
  afirmar(!existsSync(path.join(RAIZ, `${carpeta}/page.tsx`)), `\`${borrada.ruta}\` ya no existe en disco`)
  afirmar(
    !RUTAS_DE_DEMO.some((r) => r.ruta === borrada.ruta),
    `  y salió del padrón de rutas de demo`,
  )
}

/**
 * ⚠ LA CARDINALIDAD SE DERIVA. Decía `RUTAS_DE_DEMO.length === 6` escrito a
 * mano, y se rompió en cuanto un sprint agregó la séptima: es el MISMO error de
 * diseño que este proyecto ya corrigió dos veces. Lo que se afirma no es
 * "cuántas hay" sino la relación entre las listas, que es lo que de verdad
 * tiene que valer.
 */
afirmarIgual(
  RUTAS_DE_DEMO.length + RUTAS_BORRADAS.length,
  7,
  'el padrón tenía 7 rutas y quedan las que no se borraron: la cuenta cierra sin escribirla',
)
console.log(`  rutas de demo que quedan: ${RUTAS_DE_DEMO.map((r) => r.ruta).join(' · ')}`)

/** Y que las que quedan existen de verdad: un padrón que nombra rutas muertas
 *  infla el presupuesto de peso heredado sin que nadie lo note. */
for (const r of RUTAS_DE_DEMO) {
  const carpeta = r.ruta.replace('/v3/', 'src/app/v3/')
  afirmar(
    existsSync(path.join(RAIZ, `${carpeta}/page.tsx`)),
    `\`${r.ruta}\` sigue existiendo — el padrón no nombra rutas muertas`,
  )
}

controlPositivo(
  'el detector de rutas en disco ve una que no existe',
  'src/app/v3/esta-ruta-no-existe',
  (carpeta: string) => existsSync(path.join(RAIZ, `${carpeta}/page.tsx`)),
)

cerrar('s7-integracion.invariant')
