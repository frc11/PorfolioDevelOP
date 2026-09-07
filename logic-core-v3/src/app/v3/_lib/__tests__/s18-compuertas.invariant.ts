import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s4-corrida'
import { quitarComentarios } from './s3-escaneo'
import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import { CURSOR_MIN_ANCHO_PX, SEGUIMIENTO, SEGUIMIENTO_DE_LA_REFERENCIA, deberiaMontarseElCursor } from '../cursor'
import { SCROLL_SUAVE_MIN_ANCHO_PX, deberiaCorrerElScrollSuave } from '../scrollSuave'
import { CURSOR_PROPIO_EN_EL_HOME } from '../../_chrome/contrato'

/**
 * B5 (suite s18) · LAS TRES COMPUERTAS — el umbral, la preferencia y el retardo del cursor.
 *
 * ── Qué custodia ──────────────────────────────────────────────────────────
 *
 * B5 agrega TRES fuentes de movimiento —el scroll suave, el paralaje de mouse y
 * el cursor propio— y las tres tienen que cruzar el mismo umbral y honrar la
 * misma preferencia. Que se lean parecido no alcanza: acá se recorre la tabla de
 * verdad ENTERA de las dos que son funciones puras, y se afirma que las tres
 * cuelgan del MISMO número.
 *
 * ⚠️ **Lo que este archivo NO puede afirmar, y por eso no lo intenta.**
 * `prefers-reduced-motion` es una entrada del ENTORNO. Comprobar acá que «con la
 * preferencia puesta no se monta» es comprobar una función pura con el argumento
 * que uno mismo le pasó — verde por arnés, con la forma exacta que B4-B nombró.
 * Lo que sigue afirma la LÓGICA; que el navegador la alimente con el valor real
 * lo mide `scripts-b5/c-reducido.ts` con `Emulation.setEmulatedMedia`, y ahí la
 * preferencia la pone el entorno y nadie la fuerza en el árbol.
 */

const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Un solo umbral para las tres, importado y no reescrito')

afirmarIgual(ESCENARIO_MIN_ANCHO_PX, 1025, 'el umbral del escenario son 1025 px')
afirmarIgual(CURSOR_MIN_ANCHO_PX, ESCENARIO_MIN_ANCHO_PX, '  el cursor cuelga del mismo, importado')
afirmarIgual(SCROLL_SUAVE_MIN_ANCHO_PX, ESCENARIO_MIN_ANCHO_PX, '  y el scroll suave también')
for (const [modulo, archivo] of [
  ['cursor', 'src/app/v3/_lib/cursor.ts'],
  ['scrollSuave', 'src/app/v3/_lib/scrollSuave.ts'],
] as const) {
  afirmar(
    quitarComentarios(leer(archivo)).includes('ESCENARIO_MIN_ANCHO_PX'),
    `  \`${modulo}.ts\` lo IMPORTA: si alguien mueve el umbral, se mueve también acá`,
  )
  afirmar(
    !/\b1025\b/.test(quitarComentarios(leer(archivo))),
    `  y no lo reescribe como literal`,
  )
}
controlPositivo(
  'el detector de literal no está ciego',
  'export const UMBRAL = 1025',
  (f: string) => !/\b1025\b/.test(f),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las dos tablas de verdad, enteras')

for (const [ancho, menos, esperado] of [
  [true, false, true],
  [false, false, false],
  [true, true, false],
  [false, true, false],
] as const) {
  afirmarIgual(
    deberiaCorrerElScrollSuave(ancho, menos),
    esperado,
    `scroll suave: arriba del umbral=${ancho}, menos movimiento=${menos} → ${esperado}`,
  )
  afirmarIgual(
    deberiaMontarseElCursor(ancho, menos),
    esperado,
    `  cursor: la MISMA respuesta para la misma entrada`,
  )
}
afirmar(
  [true, false].every((a) => [true, false].every((m) => deberiaCorrerElScrollSuave(a, m) === deberiaMontarseElCursor(a, m))),
  'las dos compuertas son la misma función sobre las cuatro combinaciones: las tres piezas cruzan el umbral juntas',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las tres compuertas son de MONTAJE, no de CSS')

const PEREZOSOS: readonly [string, string, string][] = [
  ['escenario', 'src/app/v3/_componentes/EscenarioCompuerta.tsx', '../_lib/escena/EscenaDelHome'],
  ['cursor', 'src/app/v3/_componentes/chrome/CursorCompuerta.tsx', './CursorPropio'],
  ['scroll suave', 'src/app/v3/_componentes/CompuertaDelScrollSuave.tsx', './ScrollSuaveDeV3'],
]
for (const [nombre, archivo, modulo] of PEREZOSOS) {
  const fuente = quitarComentarios(leer(archivo))
  afirmar(
    new RegExp(`dynamic\\(\\s*\\(\\)\\s*=>\\s*import\\('${modulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'\\)\\s*,\\s*\\{\\s*ssr:\\s*false\\s*\\}\\s*\\)`).test(fuente),
    `la compuerta de ${nombre} pide su módulo con \`dynamic(…, { ssr: false })\``,
  )
  afirmar(
    !fuente.includes(`from '${modulo}'`),
    `  y NO lo importa de forma estática: con \`null\` el chunk no se pide`,
  )
  afirmar(/return null/.test(fuente), `  y devuelve \`null\` abajo del umbral`)
}
controlPositivo(
  'el detector de import estático no está ciego',
  "import CursorPropio from './CursorPropio'",
  (f: string) => !f.includes("from './CursorPropio'"),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3b · Lo único que podría apagar el `sticky`, y por qué no puede pasar')

/**
 * ⚠️ **LA AFIRMACIÓN QUE `s8-chrome` §3 TENÍA, CAMBIADA DE PROPIEDAD.**
 *
 * `lenis/dist/lenis.css` trae `.lenis:not(.lenis-autoToggle).lenis-stopped {
 * overflow: clip }` sobre el `<html>`, y un `overflow` distinto de `visible` ahí
 * apaga en silencio el `sticky` de la pastilla y el de las dos secciones
 * pinneadas — sin un error en consola y sin que la geometría de la caja cambie.
 *
 * Hasta B5 eso se garantizaba porque **`/v3` no tenía instancia**: `SmoothScroll`
 * se salía antes. Desde B5 la tiene, así que esa garantía se venció. **La que la
 * reemplaza es más fuerte, porque es la que de verdad la sostenía**: la regla
 * necesita la clase `lenis-stopped`, y esa clase la escribe Lenis **únicamente
 * al llamar `stop()`**. Antes eso se cumplía por accidente; ahora se afirma
 * sobre los tres archivos del motor de /v3, que son los únicos que podrían
 * llamarlo.
 *
 * Y se verifica ADEMÁS sobre el `<html>` vivo, en los cuatro casos de
 * `scripts-b5/c-reducido.ts`: `lenis-stopped` ausente y `overflow: visible`.
 */
const ARBOL_DEL_MOTOR = [
  'src/app/v3/_componentes/CompuertaDelScrollSuave.tsx',
  'src/app/v3/_componentes/ScrollSuaveDeV3.tsx',
  'src/app/v3/_lib/scrollSuave.ts',
]
afirmar(
  ARBOL_DEL_MOTOR.every((a) => leer(a).length > 0),
  'el motor de /v3 vive en tres archivos propios, con la decisión afuera del componente',
)
const FUENTE_DEL_MOTOR = ARBOL_DEL_MOTOR.map((a) => quitarComentarios(leer(a))).join('\n')
afirmar(
  !/\.stop\s*\(/.test(FUENTE_DEL_MOTOR),
  'y NINGUNO llama `stop()`: sin esa llamada el `<html>` no recibe `lenis-stopped`, y sin la clase no hay `overflow: clip`',
)
controlPositivo('el detector de `stop()` no está ciego', 'useEffect(() => { lenis.stop() }, [])', (f: string) =>
  !/\.stop\s*\(/.test(f),
)
afirmar(
  quitarComentarios(leer('src/components/layout/SmoothScroll.tsx')).includes("pathname.startsWith('/v3')"),
  'y el `SmoothScroll` del layout RAÍZ sigue sin construir en /v3: el sitio vivo no cambió de camino',
)
afirmar(
  /export const OPCIONES_DE_LENIS/.test(leer('src/components/layout/SmoothScroll.tsx')) &&
    /new Lenis\(\{\s*\.\.\.OPCIONES_DE_LENIS\s*\}\)/.test(leer('src/components/layout/SmoothScroll.tsx')) &&
    /new Lenis\(\{\s*\.\.\.OPCIONES_DE_LENIS\s*\}\)/.test(leer('src/app/v3/_componentes/ScrollSuaveDeV3.tsx')),
  '  y las DOS instancias construyen con la MISMA configuración exportada: una sola calibración, no dos copias',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El cursor: prendido, y calibrado contra la referencia')

afirmar(CURSOR_PROPIO_EN_EL_HOME === true, 'el cursor propio del home está PRENDIDO (decisión de B5)')

/**
 * ⚠️ La calibración se afirma contra los coeficientes MEDIDOS de la referencia,
 * que viven en `cursor.ts` con su procedencia. Sin esto, los dos números nuevos
 * serían dos números: con esto, son una medición que se puede volver a juzgar.
 */
afirmarIgual(SEGUIMIENTO.nucleo, SEGUIMIENTO_DE_LA_REFERENCIA.nucleo, 'el núcleo va al coeficiente medido de la referencia')
afirmarIgual(SEGUIMIENTO.halo, SEGUIMIENTO_DE_LA_REFERENCIA.halo, '  y el halo también')
afirmar(
  SEGUIMIENTO.halo < SEGUIMIENTO.nucleo,
  'y se conserva la RELACIÓN que S0 sí había medido: el halo va por detrás del núcleo',
  `razón halo/núcleo ${(SEGUIMIENTO.halo / SEGUIMIENTO.nucleo).toFixed(3)}`,
)

/** El coeficiente por cuadro y el tiempo al 63 % son la misma cosa dicha dos veces. */
const CUADRO_MS = 1000 / 60
for (const capa of ['nucleo', 'halo'] as const) {
  const tau = -CUADRO_MS / Math.log(1 - SEGUIMIENTO[capa])
  afirmar(
    Math.abs(tau - SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms[capa]) < 12,
    `  el coeficiente del ${capa} reconstruye su t63 medido: ${tau.toFixed(1)} ms contra ${SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms[capa]} ms`,
  )
}
controlPositivo(
  'la reconstrucción de τ no está ciega: con el coeficiente viejo NO da el t63 de la referencia',
  0.22,
  (k: number) => Math.abs(-CUADRO_MS / Math.log(1 - k) - SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms.nucleo) < 12,
)

/** Y la regla que no se toca desde S3: el cursor nativo NUNCA se oculta. */
const ARBOL_DEL_CURSOR = [
  'src/app/v3/_lib/cursor.ts',
  'src/app/v3/_componentes/chrome/CursorCompuerta.tsx',
  'src/app/v3/_componentes/chrome/CursorPropio.tsx',
  'src/app/v3/_estilos/cursor.css',
]
for (const archivo of ARBOL_DEL_CURSOR) {
  afirmar(
    !/cursor:\s*none|cursor-none/.test(quitarComentarios(leer(archivo))),
    `\`${path.basename(archivo)}\` no esconde el cursor nativo`,
  )
}
controlPositivo('el detector de `cursor: none` no está ciego', 'body { cursor: none; }', (f: string) =>
  !/cursor:\s*none|cursor-none/.test(f),
)

cerrar('s18-compuertas.invariant')
