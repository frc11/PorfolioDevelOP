/**
 * INVARIANTE — el cursor no se monta abajo de 1025 ni con
 * `prefers-reduced-motion`, y nunca oculta el cursor nativo.
 *
 * Corre con `npm run test:s3-cursor`.
 *
 * ── Por qué la compuerta se afirma sobre una función y no sobre el JSX ────
 *
 * Una decisión que sólo existe adentro de un `if` de un componente exige
 * montar React con un DOM para comprobarla, y ese arnés es más frágil que la
 * conjunción de dos booleanos que estaría comprobando. `deberiaMontarseElCursor`
 * está separada justamente para que la tabla de verdad se recorra ENTERA —las
 * cuatro combinaciones, no las dos cómodas— y para que el componente sea
 * verificable por una lectura del texto: que la llame.
 *
 * ── La afirmación que más importa ─────────────────────────────────────────
 *
 * **`cursor: none` no existe en ningún archivo del sprint.** Es el problema de
 * accesibilidad clásico del cursor custom: quien esconde el nativo y dibuja el
 * suyo deja sin puntero a quien tenga el propio apagado por cualquier razón.
 * Está medido que la referencia tampoco lo hace —0 de 4.270 elementos— y acá
 * queda afirmado, con control positivo, sobre los 34 archivos.
 */

import { snapshotDeServidor } from '../usePrefiereMenosMovimiento'
import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import {
  CAPAS_MEDIDAS,
  CONSULTA_CURSOR,
  CONSULTA_MENOS_MOVIMIENTO,
  CURSOR_MIN_ANCHO_PX,
  deberiaMontarseElCursor,
  SEGUIMIENTO,
} from '../cursor'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DEL_SPRINT, leer } from './s3-archivos'
import { customPropsDe, declaracionesDe, reglas, resolver, sinComentarios, tokensDelTema } from './s3-css'
import { ocultamientosDelCursorNativo, quitarComentarios } from './s3-escaneo'

const tokens = tokensDelTema()
const hoja = leer('src/app/v3/_estilos/cursor.css')
const compuerta = leer('src/app/v3/_componentes/chrome/CursorCompuerta.tsx')
const propiedades = customPropsDe(hoja)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La tabla de verdad de las dos compuertas, entera')

afirmarIgual(deberiaMontarseElCursor(true, false), true, 'arriba del umbral y sin preferencia: SE MONTA')
afirmarIgual(deberiaMontarseElCursor(false, false), false, 'abajo del umbral: NO se monta')
afirmarIgual(deberiaMontarseElCursor(true, true), false, 'con prefers-reduced-motion: NO se monta')
afirmarIgual(deberiaMontarseElCursor(false, true), false, 'con las dos en contra: tampoco')

// Sin esto, una compuerta que devolviera siempre `false` pasaría las tres
// afirmaciones negativas de arriba y parecería correcta.
controlPositivo(
  'la compuerta no es un `false` constante: hay un caso que SÍ monta',
  [true, false] as const,
  ([ancho, preferencia]) => !deberiaMontarseElCursor(ancho, preferencia),
)
controlPositivo(
  'y no es un `true` constante: el ancho por sí solo puede negarla',
  [false, false] as const,
  ([ancho, preferencia]) => deberiaMontarseElCursor(ancho, preferencia),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El componente usa esa función, y el chunk es perezoso')

afirmar(
  quitarComentarios(compuerta).includes('deberiaMontarseElCursor('),
  'CursorCompuerta llama a la compuerta pura — no reimplementa el `if`',
)
afirmar(
  /dynamic\(\s*\(\)\s*=>\s*import\('\.\/CursorPropio'\)\s*,\s*\{\s*ssr:\s*false\s*\}\s*\)/.test(
    quitarComentarios(compuerta).replace(/\s+/g, ' '),
  ),
  'y lo trae con `next/dynamic` y `ssr: false`: abajo del umbral el chunk no se pide',
)
afirmar(
  !quitarComentarios(compuerta).includes("from './CursorPropio'"),
  '  sin ningún import estático que anule la compuerta',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las dos consultas dicen lo que tienen que decir')

afirmarIgual(CURSOR_MIN_ANCHO_PX, 1025, 'el umbral del cursor son 1025px')
afirmarIgual(
  CURSOR_MIN_ANCHO_PX,
  ESCENARIO_MIN_ANCHO_PX,
  '  el mismo que la compuerta del escenario: una sola definición en el repo',
)
afirmarIgual(
  resolver('var(--breakpoint-escritorio)', tokens)?.n,
  CURSOR_MIN_ANCHO_PX,
  '  y el mismo que --breakpoint-escritorio en el sistema',
)
afirmarIgual(CONSULTA_CURSOR, '(min-width: 1025px)', 'la consulta de ancho está bien armada')
afirmarIgual(
  CONSULTA_MENOS_MOVIMIENTO,
  '(prefers-reduced-motion: reduce)',
  'y la de preferencia es la estándar',
)
afirmarIgual(
  snapshotDeServidor(),
  true,
  'el snapshot de servidor de la preferencia es `true` — ante la duda, no se mueve',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL CURSOR NATIVO NUNCA SE OCULTA')

const ocultamientos = ARCHIVOS_DEL_SPRINT.map((archivo) => ({
  archivo,
  hallados: ocultamientosDelCursorNativo(
    archivo.endsWith('.css') ? sinComentarios(leer(archivo)) : quitarComentarios(leer(archivo)),
  ),
})).filter((r) => r.hallados.length > 0)

afirmarIgual(ocultamientos, [], `ningún archivo de los ${ARCHIVOS_DEL_SPRINT.length} oculta el cursor nativo`)

controlPositivo(
  'el detector ve un `cursor: none`',
  '[data-v3] body { cursor: none; }',
  (css) => ocultamientosDelCursorNativo(css).length === 0,
)
controlPositivo(
  'y también la utilidad de Tailwind equivalente',
  'const c = "cursor-none"',
  (codigo) => ocultamientosDelCursorNativo(codigo).length === 0,
)

// Y ni las capas ni la raíz se pueden comer un click: si lo hicieran,
// `elementFromPoint` se vería a sí misma y el cursor nunca sabría qué hay
// debajo — además de tapar la página entera.
function apagaPunteroPara(parte: string): boolean {
  return reglas(hoja).some(
    (r) =>
      r.selector.includes(parte) &&
      declaracionesDe(r.cuerpo).some((d) => d.prop === 'pointer-events' && d.valor === 'none'),
  )
}

afirmar(apagaPunteroPara('[data-parte="nucleo"]'), 'el núcleo lleva pointer-events: none')
afirmar(apagaPunteroPara('[data-parte="halo"]'), 'el halo también')
afirmar(apagaPunteroPara('[data-pieza="cursor"]'), 'y la raíz, que ocupa el viewport entero')

controlPositivo(
  'el buscador ve una parte que NO lo apaga',
  '[data-parte="que-no-existe"]',
  (parte) => apagaPunteroPara(parte),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Las medidas de las capas se COMPONEN desde tokens')

const resolverDelCursor = (nombre: string): number | null => {
  const expresion = propiedades.get(nombre)
  return expresion === undefined ? null : (resolver(expresion, tokens)?.n ?? null)
}

afirmarIgual(resolverDelCursor('--cursor-nucleo-lado'), CAPAS_MEDIDAS.nucleo.ladoPx, 'el núcleo mide 4px')
afirmarIgual(resolverDelCursor('--cursor-halo-lado'), CAPAS_MEDIDAS.halo.ladoPx, 'el halo mide 36px')
afirmarIgual(
  resolverDelCursor('--cursor-halo-desenfoque'),
  CAPAS_MEDIDAS.halo.desenfoquePx,
  'y su desenfoque, 4px',
)
afirmarIgual(
  resolver('var(--duracion-media)', tokens)?.n,
  CAPAS_MEDIDAS.transicionMs,
  'las transiciones son --duracion-media, que son los 400ms medidos',
)
afirmar(hoja.includes('var(--ease-salida)'), 'con --ease-salida, que es la curva medida')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El color acompaña a la sección, sin un token nuevo')

afirmar(hoja.includes('background-color: var(--color-tinta)'), 'el núcleo pinta la tinta')
afirmar(hoja.includes('background-color: var(--color-borde)'), 'y el halo, el borde')

const tema = sinComentarios(leer('src/app/theme-develop.css'))
const bloqueInvertido = /\[data-seccion="invertida"\]\s*\{([\s\S]*?)\n\}/.exec(tema)
afirmar(bloqueInvertido !== null, 'el bloque de la sección invertida existe en el sistema')
const redefinidos = bloqueInvertido === null ? [] : declaracionesDe(bloqueInvertido[1]).map((d) => d.prop)
afirmar(
  redefinidos.includes('--color-tinta') && redefinidos.includes('--color-borde'),
  '  y redefine los DOS tokens que usan las capas: por eso el cursor se da vuelta solo',
  redefinidos.join(' · '),
)

// El seguimiento tiene dos coeficientes distintos, y el halo va por detrás.
afirmar(
  SEGUIMIENTO.halo < SEGUIMIENTO.nucleo,
  'el halo interpola más lento que el núcleo: la relación medida',
  `núcleo ${SEGUIMIENTO.nucleo} · halo ${SEGUIMIENTO.halo}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La red de CSS por si alguien monta el cursor sin la compuerta')

const conMenosMovimiento = reglas(hoja).filter((r) =>
  r.contexto.includes('prefers-reduced-motion'),
)
afirmar(conMenosMovimiento.length > 0, 'hay una regla bajo prefers-reduced-motion')
afirmar(
  conMenosMovimiento.some((r) =>
    declaracionesDe(r.cuerpo).some((d) => d.prop === 'display' && d.valor === 'none'),
  ),
  '  y apaga el cursor entero',
)

cerrar('s3-cursor.invariant')
