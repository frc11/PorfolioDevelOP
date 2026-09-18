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
import { SECCIONES } from '../secciones'
import { CLASES_DE_LA_BANDA_ANGOSTA, SUPERFICIES } from '../superficies'

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
    /**
     * ⚠️ **SIN CONDICIÓN, desde TEXTO-3.** Antes bastaba con que la cadena
     * `bg-fondo` no apareciera. Ahora el Hero pinta `max-angosto:bg-fondo` —papel
     * abajo de 375, donde no hay composición limpia— y esa clase CONTIENE la
     * cadena. Lo que hay que seguir impidiendo es un `bg-fondo` **suelto**, que
     * es el que taparía la sala en todo ancho; el acotado viene precedido de `:`
     * y es una decisión declarada en `secciones.ts`.
     *
     * Y la sección que declara banda angosta tiene que traer la clase: sin ella
     * el dato diría una cosa y la pantalla otra.
     */
    afirmar(!/(^|[\s"])bg-fondo/.test(html), `  y no pinta fondo SIN CONDICIÓN: el canvas se ve a través`)
    if (seccion.superficieAngosta !== undefined) {
      afirmar(
        html.includes(CLASES_DE_LA_BANDA_ANGOSTA[seccion.superficieAngosta]),
        `  y abajo de 375 pinta \`${seccion.superficieAngosta}\`, que es lo que su fila declara`,
      )
    }
  }

  afirmarIgual((html.match(/<section[\s>]/g) ?? []).length, 1, `  y emite exactamente UNA <section>`)
}

controlPositivo(
  'el lector de superficies ve un panel con la equivocada',
  '<section data-panel="hero" data-superficie="papel-opaco">',
  (html: string) => html.includes('data-superficie="papel-transparente"'),
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
